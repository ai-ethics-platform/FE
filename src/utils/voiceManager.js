// 음성 송수신, websocket, webRTC 연결 모두 마친 상태 + 음성 스트림 1개 , 음성 녹음 종료와 마이크 꺼짐 완료 
import axiosInstance from '../api/axiosInstance';

class VoiceManager {
  constructor() {
    this.isConnected = false;
    this.isSpeaking = false;
    this.sessionId = null;
    this.mediaStream = null;  // 🚨 WebRTC에서 받은 스트림
    this.audioContext = null;
    this.analyser = null;
    this.animationFrame = null;
    this.speakingThreshold = 30;
    this.nickname = null;
    this.participantId = null;
    this.lastSpeakingState = false;
    this.micLevel = 0;
    this.isDebugMode = true;
    
    // 연속 녹음 관련
    this.mediaRecorder = null;
    this.isRecording = false;
    this.recordedChunks = [];
    this.recordingStartTime = null;
    this.recordingMimeType = null;
    this.isTerminating = false;
    this.sessionInitialized = false;
    this.micNode = null;
    
    // 🚨 WebRTC 스트림 사용 여부 플래그
    this.usingWebRTCStream = false;

    // WAV 변환이 정말 필요할 때(서버가 WAV만 받는 경우)를 대비한 타겟
    // ※ 장시간(30~90분) 녹음은 WAV가 매우 커질 수 있으니, 기본 업로드는 webm/opus(압축) 권장
    this.TARGET_WAV_SAMPLE_RATE = 16000;

    // 장시간 녹음 안정성: 1초 단위 청크(Blob)가 수천 개 쌓이면 객체 오버헤드가 커질 수 있어
    // timeslice를 늘려(예: 10초) 청크 개수를 줄입니다.
    this.RECORDING_TIMESLICE_MS = 10000;
    // Opus 비트레이트(브라우저가 무시할 수 있음). 너무 높이면 업로드가 커짐.
    this.AUDIO_BITS_PER_SECOND = 24000;
  }

  // ----------------------------
  // helpers: mime / wav encode
  // ----------------------------
  _pickSupportedMimeType(candidates) {
    try {
      if (typeof MediaRecorder === 'undefined') return null;
      if (typeof MediaRecorder.isTypeSupported !== 'function') return null;
      for (const t of candidates) {
        if (t && MediaRecorder.isTypeSupported(t)) return t;
      }
      return null;
    } catch {
      return null;
    }
  }

  async _readFirstAscii(blob, n = 4) {
    try {
      const ab = await blob.slice(0, n).arrayBuffer();
      const bytes = new Uint8Array(ab);
      let s = '';
      for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
      return s;
    } catch {
      return '';
    }
  }

  async _ensureWavBlob(inputBlob) {
    // 이미 WAV처럼 보이면 그대로 사용
    const head4 = await this._readFirstAscii(inputBlob, 4);
    if ((inputBlob.type || '').includes('wav') && head4 === 'RIFF') {
      return inputBlob;
    }

    // webm/ogg 등 → decode → (downsample/mono) → PCM → WAV 인코딩
    const arrayBuffer = await inputBlob.arrayBuffer();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) throw new Error('AudioContext 미지원 환경');

    const ctx = new AudioCtx();
    try {
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
      const optimized = await this._downsampleToMono(audioBuffer, this.TARGET_WAV_SAMPLE_RATE);
      const wavAb = this._encodeWavFromAudioBuffer(optimized);
      const wavBlob = new Blob([wavAb], { type: 'audio/wav' });

      const wavHead = await this._readFirstAscii(wavBlob, 4);
      if (wavHead !== 'RIFF') {
        throw new Error(`WAV 변환 실패(헤더 불일치): head=${JSON.stringify(wavHead)}`);
      }

      return wavBlob;
    } finally {
      try { await ctx.close(); } catch {}
    }
  }

  async _downsampleToMono(audioBuffer, targetSampleRate = 16000) {
    try {
      if (!audioBuffer) return audioBuffer;
      const srcRate = audioBuffer.sampleRate || targetSampleRate;
      const duration = audioBuffer.duration || (audioBuffer.length / (srcRate || 1));

      // 이미 target rate + mono면 그대로
      if ((audioBuffer.numberOfChannels || 1) === 1 && srcRate === targetSampleRate) {
        return audioBuffer;
      }

      const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      if (!OfflineCtx) return audioBuffer;

      const length = Math.max(1, Math.ceil(duration * targetSampleRate));
      const offline = new OfflineCtx(1, length, targetSampleRate);

      const source = offline.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offline.destination); // mono destination으로 자동 downmix
      source.start(0);

      const rendered = await offline.startRendering();
      return rendered || audioBuffer;
    } catch (e) {
      console.warn('⚠️ downsample/mono 최적화 실패 → 원본 샘플레이트로 진행합니다.', e);
      return audioBuffer;
    }
  }

  _encodeWavFromAudioBuffer(audioBuffer) {
    const numChannels = audioBuffer.numberOfChannels || 1;
    const sampleRate = audioBuffer.sampleRate || 44100;
    const format = 1; // PCM
    const bitsPerSample = 16;

    const samples = audioBuffer.length;
    const blockAlign = numChannels * (bitsPerSample / 8);
    const byteRate = sampleRate * blockAlign;
    const dataSize = samples * blockAlign;

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeString = (offset, str) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    let offset = 0;
    writeString(offset, 'RIFF'); offset += 4;
    view.setUint32(offset, 36 + dataSize, true); offset += 4;
    writeString(offset, 'WAVE'); offset += 4;
    writeString(offset, 'fmt '); offset += 4;
    view.setUint32(offset, 16, true); offset += 4;              // Subchunk1Size
    view.setUint16(offset, format, true); offset += 2;           // AudioFormat
    view.setUint16(offset, numChannels, true); offset += 2;      // NumChannels
    view.setUint32(offset, sampleRate, true); offset += 4;       // SampleRate
    view.setUint32(offset, byteRate, true); offset += 4;         // ByteRate
    view.setUint16(offset, blockAlign, true); offset += 2;       // BlockAlign
    view.setUint16(offset, bitsPerSample, true); offset += 2;    // BitsPerSample
    writeString(offset, 'data'); offset += 4;
    view.setUint32(offset, dataSize, true); offset += 4;

    // interleave + float(-1..1) → int16
    const channels = [];
    for (let ch = 0; ch < numChannels; ch++) channels.push(audioBuffer.getChannelData(ch));

    let dataOffset = 44;
    for (let i = 0; i < samples; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        let s = channels[ch][i];
        s = Math.max(-1, Math.min(1, s));
        view.setInt16(dataOffset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        dataOffset += 2;
      }
    }

    return buffer;
  }

  // async uploadRecordingToServer(recordingData) {
  //   try {
  //     if (!recordingData?.blob || !recordingData.blob.size) {
  //       console.warn('⚠️ 업로드할 녹음 데이터가 없습니다.');
  //       return null;
  //     }
      
  //     const sessId = this.sessionId || localStorage.getItem('session_id');
  //     if (!sessId) {
  //       console.error('❌ uploadRecordingToServer: session_id가 없습니다.');
  //       return null;
  //     }

  //     const ts = new Date().toISOString().replace(/[:.]/g, '-');
  //     const filename = `recording_${sessId}_${ts}.webm`;
  //     const file = new File([recordingData.blob], filename, { type: 'audio/webm' });

  //     const form = new FormData();
  //     form.append('file', file);
  //     const url = `/upload_audio`;

  //     const { data } = await axiosInstance.post(url, form, {
  //       maxBodyLength: Infinity,
  //     });

  //     console.log('✅ 업로드 성공:', data);
  //     return data;
  //   } catch (error) {
  //     console.error('❌ 업로드 실패:', {
  //       status: error.response?.status,
  //       data: error.response?.data,
  //       message: error.message,
  //     });
  //     return null;
  //   }
  // }
  async uploadRecordingToServer(recordingData) {
    try {
      if (!recordingData?.blob || !recordingData.blob.size) {
        console.warn('⚠️ 업로드할 녹음 데이터가 없습니다.');
        return null;
      }
  
      const sessId = this.sessionId || localStorage.getItem('session_id');
      if (!sessId) {
        console.error('❌ uploadRecordingToServer: session_id가 없습니다.');
        return null;
      }
  
      // ✅ 장시간(30~90분) 녹음은 WAV 변환 시 용량이 폭증(413 위험)하므로,
      // 기본은 MediaRecorder 원본(webm/ogg + opus)을 그대로 업로드합니다.
      // (서버가 WAV만 받는다면: 서버에서 변환하거나, 정말 필요할 때만 _ensureWavBlob를 사용)
      const sourceBlob = recordingData.blob;
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const uid = this.participantId || localStorage.getItem('user_id') || 'unknown';

      const mime = sourceBlob.type || 'audio/webm';
      const ext =
        mime.includes('ogg') ? 'ogg' :
        mime.includes('webm') ? 'webm' :
        mime.includes('wav') ? 'wav' :
        'webm';

      const file = new File([sourceBlob], `recording_${uid}_${ts}.${ext}`, { type: mime });
  
      const form = new FormData();
      form.append('session_id', sessId); 
      form.append('file', file);         
  
      // Content-Type 자동 (multipart/form-data; boundary=...)
      const { data } = await axiosInstance.postForm('/upload_audio', form);

  
      console.log('✅ 업로드 성공:', {
        session_id: sessId,
        user_id: uid,
        fileSize: file.size,
        durationMs: recordingData?.duration,
        chunks: recordingData?.chunks,
        sourceType: sourceBlob.type,
        uploadType: file.type,
        server: data
      });
      return data;
    } catch (error) {
      console.error('❌ 업로드 실패:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      return null;
    }
  }
  

  async leaveSession() {
    this.sessionId ||= localStorage.getItem('session_id');
    
    if (!this.sessionId) {
      console.warn('⚠️ leaveSession: sessionId가 없습니다.');
      return false;
    }
    
    try {
      await axiosInstance.post(`/voice/sessions/${this.sessionId}/leave`, {});
      console.log('✅ leaveSession 성공');
      return true;
    } catch (err) {
      console.error('❌ leaveSession 실패:', err);
      return false;
    }
  }

  getLocalStream() {
    return this.mediaStream;
  }
  
  getAudioTracks() {
    return this.mediaStream ? this.mediaStream.getAudioTracks() : [];
  }

  // 🚨 핵심 수정: WebRTC 스트림을 받는 초기화 함수
  async initializeVoiceSession(webRTCMediaStream = null) {
    if (this.sessionInitialized) {
      console.log('⚠️ 음성 세션이 이미 초기화되어 있음');
      return true;
    }
  
    try {
      console.log('🎤 VoiceManager 초기화 시작');
      
      // 1. 세션 정보 확인
      this.sessionId = localStorage.getItem('session_id');
      if (!this.sessionId) {
        console.error('❌ session_id가 없습니다.');
        return false;
      }
      
      if (typeof this.sessionId !== 'string' || this.sessionId.length === 0) {
        console.error('❌ 유효하지 않은 session_id 형식:', this.sessionId);
        return false;
      }
      
      // 2. 백엔드 세션 유효성 확인
      try {
        const sessionVerify = await axiosInstance.get(`/voice/sessions/${this.sessionId}`);
        console.log('✅ VoiceManager: 세션 유효성 확인됨:', sessionVerify.data);
      } catch (verifyError) {
        console.error('❌ VoiceManager: 세션 유효성 확인 실패:', verifyError.response?.data);
        return false;
      }
      
      // 3. 사용자 정보 설정
      // ✅ 게스트의 /users/me가 500일 수 있으므로 localStorage 우선 사용
      const storedUserId = localStorage.getItem('user_id');
      const storedNickname = localStorage.getItem('nickname');
      if (storedUserId) this.participantId = String(storedUserId);
      if (storedNickname) this.nickname = String(storedNickname);

      // fallback: 로컬에 없을 때만 /users/me 시도 (회원/레거시 대응)
      if (!this.participantId || !this.nickname) {
        try {
          const { data: userInfo } = await axiosInstance.get('/users/me');
          if (!this.participantId && userInfo?.id != null) this.participantId = String(userInfo.id);
          if (!this.nickname) this.nickname = userInfo?.username || (this.participantId ? `Player_${this.participantId}` : null);
        } catch (e) {
          // 게스트 케이스에서 흔히 발생: 최소값으로 진행
          if (!this.participantId) this.participantId = storedUserId ? String(storedUserId) : 'unknown';
          if (!this.nickname) this.nickname = storedNickname ? String(storedNickname) : (this.participantId ? `Player_${this.participantId}` : 'Player');
          console.warn('⚠️ VoiceManager: /users/me 조회 실패. localStorage 기반으로 진행합니다.', e?.response?.data || e?.message);
        }
      }
      
      console.log('📋 VoiceManager 세션 정보:', {
        sessionId: this.sessionId,
        nickname: this.nickname,
        participantId: this.participantId,
        hasWebRTCStream: !!webRTCMediaStream
      });
      
      // 🚨 4. 핵심: WebRTC 스트림 사용
      if (webRTCMediaStream) {
        console.log('✅ WebRTC 스트림 사용:', webRTCMediaStream.id);
        this.mediaStream = webRTCMediaStream;
        this.usingWebRTCStream = true;
        this.isConnected = true;
        
        // WebRTC 스트림으로 오디오 분석 설정
        await this.setupAudioAnalysisWithWebRTCStream(webRTCMediaStream);
      } else {
        console.error('❌ WebRTC 스트림이 전달되지 않았습니다');
        return false;
      }
      
      // 5. 초기 마이크 ON 상태 전송
      await this.sendVoiceStatusToServer(false);
      
      // 6. 음성 감지 시작
      this.startSpeechDetection();
      
      // 7. 연속 녹음 시작
      this.startRecording();
      
      this.sessionInitialized = true;
      console.log('✅ VoiceManager 초기화 완료 (WebRTC 스트림 사용)');
      return true;
      
    } catch (error) {
      console.error('❌ VoiceManager 초기화 실패:', error);
      console.error('❌ 에러 상세:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return false;
    }
  }

  // 🚨 WebRTC 스트림으로 오디오 분석 설정
  async setupAudioAnalysisWithWebRTCStream(webRTCStream) {
    try {
      console.log('🔊 WebRTC 스트림으로 오디오 분석 설정 중...');
      
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      
      // 🚨 중요: WebRTC 스트림을 AudioContext에 연결 (분석용)
      this.micNode = this.audioContext.createMediaStreamSource(webRTCStream);
      this.micNode.connect(this.analyser);
      
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      
      console.log('✅ WebRTC 스트림 오디오 분석 설정 완료');
      
    } catch (error) {
      console.error('❌ WebRTC 스트림 오디오 분석 설정 실패:', error);
      throw error;
    }
  }

  // 연속 녹음 시작
  startRecording() {
    if (!this.mediaStream || this.isRecording) return;

    try {
      // 가능한 경우 WAV로 직접 녹음(브라우저 지원 시), 아니면 webm/ogg로 녹음 후 업로드 때 WAV로 변환
      const preferred = this._pickSupportedMimeType([
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        // WAV 직접 녹음은 파일이 커지기 쉬워 마지막 fallback으로 둠
        'audio/wav',
        'audio/wav;codecs=1',
      ]);

      this.recordingMimeType = preferred || null;

      const mrOptions = {};
      if (preferred) mrOptions.mimeType = preferred;
      // 브라우저 지원 시에만 적용됨(무시될 수 있음)
      mrOptions.audioBitsPerSecond = this.AUDIO_BITS_PER_SECOND;

      this.mediaRecorder = new MediaRecorder(this.mediaStream, mrOptions);

      this.recordedChunks = [];
      this.recordingStartTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        console.log('🎵 녹음 종료, 총 청크:', this.recordedChunks.length);
      };

      this.mediaRecorder.start(this.RECORDING_TIMESLICE_MS);
      this.isRecording = true;
      
      console.log('🔴 연속 녹음 시작 (WebRTC 스트림 사용)', {
        mimeType: this.recordingMimeType || this.mediaRecorder?.mimeType || 'unknown',
        startTime: new Date(this.recordingStartTime).toISOString(),
        timesliceMs: this.RECORDING_TIMESLICE_MS,
        audioBitsPerSecond: this.AUDIO_BITS_PER_SECOND
      });
    } catch (error) {
      console.error('❌ 녹음 시작 실패:', error);
    }
  }

  // 서버에 음성 상태 전송
  async sendVoiceStatusToServer(isSpeaking) {
    try {
      if (!this.participantId || this.participantId === 'unknown' || Number.isNaN(parseInt(this.participantId))) {
        console.warn('⚠️ sendVoiceStatusToServer: participantId가 유효하지 않아 전송을 건너뜁니다.', this.participantId);
        return;
      }
      if (this.lastSpeakingState === isSpeaking) return;
      this.lastSpeakingState = isSpeaking;

      const message = {
        type: "voice_status_update",
        data:{
            user_id: parseInt(this.participantId),
            is_mic_on: this.isConnected,
            is_speaking: isSpeaking,
            session_id: this.sessionId
        }
      };

       if (window.webSocketInstance && window.webSocketInstance.sendMessage) {
        const success = window.webSocketInstance.sendMessage(message);
          if (success) {
          console.log('📡 WebSocket으로 음성 상태 전송:', message);
        }
      } else {
        console.warn('⚠️ WebSocket 인스턴스가 없음');
      }
      
    } catch (error) {
      console.error('음성 상태 전송 실패:', error);
      this.lastSpeakingState = !isSpeaking;
    }
  }

  // 음성 감지 시작
  startSpeechDetection() {
    if (!this.analyser) {
      console.error('❌ 분석기가 없습니다');
      return;
    }

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const detectSpeech = () => {
      if (!this.analyser) return;
      
      this.analyser.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      this.micLevel = average;
      
      const currentlySpeaking = average > this.speakingThreshold;
      
      if (currentlySpeaking !== this.isSpeaking) {
        this.isSpeaking = currentlySpeaking;
      }
      
      this.animationFrame = requestAnimationFrame(detectSpeech);
    };
    
    console.log('👂 음성 감지 시작 (WebRTC 스트림) (임계값:', this.speakingThreshold, ')');
    detectSpeech();
  }

  // 임계값 조정
  setSpeakingThreshold(threshold) {
    this.speakingThreshold = threshold;
    console.log('🔧 음성 임계값 변경:', threshold);
  }

  // 디버그 모드 토글
  toggleDebugMode() {
    this.isDebugMode = !this.isDebugMode;
    console.log('🐛 디버그 모드:', this.isDebugMode ? 'ON' : 'OFF');
  }

  // 음성 감지 중지
  stopSpeechDetection() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    console.log('⏹️ 음성 감지 중지');
  }

  // 수정된 stopRecording 메서드
  async stopRecording() {
    console.log('🎵 stopRecording 시작 - 상태 확인:', {
      mediaRecorder: !!this.mediaRecorder,
      mediaRecorderState: this.mediaRecorder?.state,
      isRecording: this.isRecording,
      chunksLength: this.recordedChunks?.length || 0,
      usingWebRTCStream: this.usingWebRTCStream
    });

    if (!this.mediaRecorder) {
      console.warn('⚠️ stopRecording: mediaRecorder가 없음');
      
      if (this.recordedChunks?.length > 0) {
        console.log('📦 기존 청크로 Blob 생성:', this.recordedChunks.length);
        const type = this.recordingMimeType || this.recordedChunks?.[0]?.type || 'audio/webm';
        const blob = new Blob(this.recordedChunks, { type });
        const duration = this.recordingStartTime ? (Date.now() - this.recordingStartTime) : 0;
        const chunks = this.recordedChunks?.length || 0;
        
        this.isRecording = false;
        this.recordedChunks = [];
        this.recordingMimeType = null;
        
        return {
          blob,
          duration,
          chunks,
          startTime: this.recordingStartTime,
          endTime: Date.now()
        };
      }
      
      this.isRecording = false;
      this.recordingMimeType = null;
      return null;
    }

    if (this.mediaRecorder.state === 'inactive') {
      console.log('📝 MediaRecorder가 이미 inactive 상태');
      
      if (this.recordedChunks?.length > 0) {
        const type = this.recordingMimeType || this.recordedChunks?.[0]?.type || 'audio/webm';
        const blob = new Blob(this.recordedChunks, { type });
        const duration = this.recordingStartTime ? (Date.now() - this.recordingStartTime) : 0;
        const chunks = this.recordedChunks?.length || 0;
        
        console.log('📦 inactive 상태에서 Blob 생성:', {
          size: blob.size,
          duration,
          chunks
        });
        
        this.isRecording = false;
        this.recordedChunks = [];
        this.recordingMimeType = null;
        
        return {
          blob,
          duration,
          chunks,
          startTime: this.recordingStartTime,
          endTime: Date.now()
        };
      }
      
      this.isRecording = false;
      this.recordingMimeType = null;
      return null;
    }

    return new Promise((resolve) => {
      let resolved = false;
      
      const finalize = () => {
        if (resolved) return;
        resolved = true;
        
        try {
          const type = this.recordingMimeType || this.recordedChunks?.[0]?.type || 'audio/webm';
          const blob = new Blob(this.recordedChunks || [], { type });
          const duration = this.recordingStartTime ? (Date.now() - this.recordingStartTime) : 0;
          const chunks = this.recordedChunks?.length || 0;
          
          console.log('⏹️ 녹음 완료:', {
            size: blob.size,
            duration,
            chunks
          });
          
          this.isRecording = false;
          this.recordedChunks = [];
          this.mediaRecorder = null;
          this.recordingMimeType = null;
          
          resolve({
            blob,
            duration,
            chunks,
            startTime: this.recordingStartTime,
            endTime: Date.now()
          });
        } catch (error) {
          console.error('❌ finalize 중 오류:', error);
          this.isRecording = false;
          this.recordedChunks = [];
          this.mediaRecorder = null;
          this.recordingMimeType = null;
          resolve(null);
        }
      };

      this.mediaRecorder.onstop = () => {
        console.log('📝 MediaRecorder onstop 이벤트 발생');
        try {
          finalize();
        } catch (e) {
          console.error('❌ onstop 핸들러 오류:', e);
          resolved = true;
          resolve(null);
        }
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder 오류:', event.error);
        if (!resolved) {
          resolved = true;
          this.isRecording = false;
          this.recordedChunks = [];
          this.mediaRecorder = null;
          this.recordingMimeType = null;
          resolve(null);
        }
      };

      try {
        if (typeof this.mediaRecorder.requestData === 'function') {
          console.log('📤 마지막 데이터 요청');
          this.mediaRecorder.requestData();
        }
      } catch (e) {
        console.warn('⚠️ requestData 실패 (무시):', e.message);
      }

      try {
        console.log('🛑 MediaRecorder.stop() 호출');
        this.mediaRecorder.stop();
        this.isRecording = false;
      } catch (e) {
        console.error('❌ MediaRecorder.stop() 오류:', e);
        finalize();
        return;
      }

      setTimeout(() => {
        if (!resolved) {
          console.warn('⏱️ onstop 이벤트 타임아웃 - 강제 완료');
          finalize();
        }
      }, 3000);
    });
  }

  // // 🚨 수정된 disconnectMicrophone - WebRTC 스트림은 건드리지 않음
  // disconnectMicrophone() {
  //   console.log('🔇 마이크 연결 해제 시작 (WebRTC 스트림 보존)');
    
  //   // 1. 음성 감지 중지
  //   this.stopSpeechDetection();
    
  //   // 2. 오디오 노드 연결 해제
  //   try {
  //     if (this.micNode) {
  //       this.micNode.disconnect();
  //       this.micNode = null;
  //       console.log('🔌 오디오 노드 연결 해제 완료');
  //     }
  //   } catch (e) {
  //     console.warn('⚠️ 오디오 노드 해제 실패:', e);
  //   }

  //   // 🚨 3. WebRTC 스트림은 정지하지 않음 (WebRTC에서 관리)
  //   console.log('⚠️ WebRTC 스트림은 WebRTC Provider에서 관리하므로 여기서 정지하지 않음');
    
  //   // 4. AudioContext 정리
  //   if (this.audioContext) {
  //     try {
  //       if (this.audioContext.state !== 'closed') {
  //         this.audioContext.close();
  //         console.log('🔊 AudioContext 종료 완료');
  //       }
  //     } catch (e) {
  //       console.warn('⚠️ AudioContext 종료 실패:', e);
  //     }
  //     this.audioContext = null;
  //   }
    
  //   // 5. 상태 초기화 (스트림 참조는 유지)
  //   this.analyser = null;
  //   this.isConnected = false;
  //   this.isSpeaking = false;
  //   this.lastSpeakingState = false;
  //   this.micLevel = 0;
    
  //   console.log('✅ VoiceManager 정리 완료 (WebRTC 스트림 보존)');
  // }

  // VoiceManager.js - disconnectMicrophone 함수 수정
disconnectMicrophone() {
  console.log('🔇 마이크 연결 해제 시작');
  
  // 1. 음성 감지 중지
  this.stopSpeechDetection();
  
  // 2. 오디오 노드 연결 해제
  try {
    if (this.micNode) {
      this.micNode.disconnect();
      this.micNode = null;
      console.log('🔌 오디오 노드 연결 해제 완료');
    }
  } catch (e) {
    console.warn('⚠️ 오디오 노드 해제 실패:', e);
  }

  // 🚨 3. 핵심 수정: 스트림 참조 완전 제거
  console.log('🔇 스트림 참조 완전 제거');
  this.mediaStream = null; // 🎯 이 줄 추가!
  
  // 4. AudioContext 정리
  if (this.audioContext) {
    try {
      if (this.audioContext.state !== 'closed') {
        this.audioContext.close();
        console.log('🔊 AudioContext 종료 완료');
      }
    } catch (e) {
      console.warn('⚠️ AudioContext 종료 실패:', e);
    }
    this.audioContext = null;
  }
  
  // 5. 상태 초기화
  this.analyser = null;
  this.isConnected = false;
  this.isSpeaking = false;
  this.lastSpeakingState = false;
  this.micLevel = 0;
  
  console.log('✅ VoiceManager 정리 완료 (스트림 참조까지 제거)');
}
// VoiceManager.js - terminateVoiceSession 올바른 순서로 수정

async terminateVoiceSession() {
  if (this.isTerminating) {
    console.warn('⚠️ terminateVoiceSession: 이미 종료 처리 중 (중복 호출 방지)');
    return null;
  }

  this.isTerminating = true;
  console.log('🛑 음성 세션 완전 종료 시작');

  try {
    // 🚨 WebRTC 전역 함수 호출 (한 줄로 끝!)
    if (window.terminateWebRTCSession) {
      console.log('✅ WebRTC 전역 함수 호출 중...');
      const result = await window.terminateWebRTCSession();
      console.log('✅ WebRTC 완전 정리 완료');
      return result;
    }

    console.error('❌ window.terminateWebRTCSession 함수가 없음');

    // 🚨 백업: 기존 방식으로 개별 처리 (※ 업로드는 Provider 쪽에서 하는 구조라 여기선 stop+정리만)
    const recordingData = await this.stopRecording();
    this.disconnectMicrophone();

    if (window.stopAllOutgoingAudioGlobal) {
      window.stopAllOutgoingAudioGlobal();
    }

    return { recordingData, uploadResult: null };
  } catch (error) {
    console.error('❌ 음성 세션 종료 중 오류:', error);
    return null;
  } finally {
    this.isTerminating = false;
  }
}

  // 일시적 정리
  async cleanup() {
    if (this.isSpeaking) {
      await this.sendVoiceStatusToServer(false);
    }
  
    console.log('🧹 음성 세션 일시적 정리 완료 (녹음 유지)');
  }

  // 현재 상태 반환
  getStatus() {
    return {
      isConnected: this.isConnected,
      isSpeaking: this.isSpeaking,
      sessionId: this.sessionId,
      nickname: this.nickname,
      participantId: this.participantId,
      micLevel: this.micLevel,
      speakingThreshold: this.speakingThreshold,
      isRecording: this.isRecording,
      sessionInitialized: this.sessionInitialized,
      usingWebRTCStream: this.usingWebRTCStream  // 🚨 새로 추가
    };
  }
}

// 싱글톤 인스턴스
const voiceManager = new VoiceManager();

// 전역에서 접근 가능하도록 설정
window.voiceManager = voiceManager;

export default voiceManager;