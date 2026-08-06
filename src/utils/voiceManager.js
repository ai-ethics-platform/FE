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
    this.sessionInitialized = false;
    this.micNode = null;
    this.recordingStatsTimer = null;
    this.totalRecordedBytes = 0;
    this.selectedRecorderMimeType = null;
    this.recordingStream = null; // ✅ 녹음 전용 스트림(송신 스트림과 분리)
    this.baseMicStream = null;   // ✅ getUserMedia는 1번만 (WebRTC 송수신용 “원본”)
    this.localMicRecordingEnabled = true; // ✅ WebRTC와 무관하게 로컬 녹음만 먼저 켤지 (디버그 목적)
    this.exitInProgress = false; // ✅ 게임 나가기/종료 진행 중에는 자동 녹음 시작 금지
    
    // 🚨 WebRTC 스트림 사용 여부 플래그
    this.usingWebRTCStream = false;
  }

  // Blob을 특정 파일명으로 즉시 다운로드
  saveBlobAs(blob, filename) {
    try {
      if (!blob || !blob.size) {
        console.warn('⚠️ saveBlobAs: 빈 blob이라 저장 스킵', { size: blob?.size });
        return false;
      }
      const safeName = filename || `download_${Date.now()}.bin`;
      // 실제 다운로드는 하지 않고, 저장 시도 로그만 남김, 추후 로컬 다운로드 기능 구현 시 주석 해제
      /*
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = safeName;
      a.rel = 'noopener';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => {
        try { URL.revokeObjectURL(url); } catch {}
      }, 10_000);
      */
      return true;
    } catch (e) {
      console.error('❌ saveBlobAs 실패:', e);
      return false;
    }
  }

  // ----------------------------
  // 로컬 저장(다운로드) 유틸
  // - 서버 업로드가 실패해도 "녹음이 실제로 되었는지" 확인하기 위한 디버그용
  // ----------------------------
  formatBytes(bytes) {
    try {
      const b = Number(bytes) || 0;
      if (b < 1024) return `${b} B`;
      const kb = b / 1024;
      if (kb < 1024) return `${kb.toFixed(1)} KB`;
      const mb = kb / 1024;
      if (mb < 1024) return `${mb.toFixed(2)} MB`;
      const gb = mb / 1024;
      return `${gb.toFixed(2)} GB`;
    } catch {
      return `${bytes} B`;
    }
  }

  getRecordingFileExtFromMime(mime) {
    const m = String(mime || '').toLowerCase();
    if (m.includes('wav')) return 'wav';
    if (m.includes('webm')) return 'webm';
    if (m.includes('ogg')) return 'ogg';
    if (m.includes('mp4') || m.includes('m4a') || m.includes('x-m4a')) return 'm4a';
    if (m.includes('mpeg') || m.includes('mp3')) return 'mp3';
    return 'bin';
  }

  // ✅ 녹음용 스트림을 별도로 설정 (WebRTC 송신 스트림과 분리)
  setRecordingStream(stream) {
    try {
      // ✅ 중요: 녹음이 이미 진행 중이면 recordingStream을 “교체”하지 않음
      // - 녹음 중인 stream/track을 stop하면 MediaRecorder가 1초짜리로 끊기거나 파일이 깨질 수 있음
      if (this.isRecording && this.recordingStream && this.recordingStream !== stream) {
        console.warn('⚠️ setRecordingStream: 녹음 중에는 recordingStream 교체 금지 → 요청 무시', {
          currentId: this.recordingStream?.id,
          requestedId: stream?.id,
        });
        return false;
      }

      // ✅ 원칙: track.stop()은 releaseMic()에서만 한다.
      // - recordingStream은 보통 base track을 "공유"하는 wrapper(new MediaStream([track]))라서
      //   여기서 stop하면 WebRTC/녹음이 같이 죽을 수 있음

      this.recordingStream = stream || null;
      if (this.recordingStream) {
        const tracks = this.recordingStream.getAudioTracks?.() || [];
        console.log('🎛️ recordingStream 설정됨:', {
          id: this.recordingStream.id,
          audioTracks: tracks.map((t) => ({
            label: t.label,
            enabled: t.enabled,
            muted: t.muted,
            readyState: t.readyState,
          })),
        });
      }
      return true;
    } catch (e) {
      console.warn('⚠️ setRecordingStream 실패(무시):', e?.message || e);
      this.recordingStream = null;
      return false;
    }
  }

  hasLiveAudioTrack(stream) {
    try {
      const s = stream;
      if (!s) return false;
      const tracks = s.getAudioTracks?.() || [];
      if (tracks.length === 0) return false;
      return tracks.some((t) => t && t.readyState === 'live');
    } catch {
      return false;
    }
  }

  async ensureBaseMicStream() {
    try {
      if (this.hasLiveAudioTrack(this.baseMicStream)) return this.baseMicStream;
      console.log('🎤 [mic] baseMicStream 생성(getUserMedia)...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });
      this.baseMicStream = stream;
      return this.baseMicStream;
    } catch (e) {
      console.warn('⚠️ ensureBaseMicStream 실패:', e?.name, e?.message || e);
      throw e;
    }
  }

  // baseMicStream(원본)에서 clone을 만들어 recordingStream(녹음용)을 고정 생성
  ensureRecordingStreamFromBase(baseStream = null) {
    try {
      const base = baseStream || this.baseMicStream;
      if (!this.hasLiveAudioTrack(base)) return false;

      // 이미 live recordingStream이 있으면 그대로 사용 (교체 금지)
      if (this.hasLiveAudioTrack(this.recordingStream)) return true;

      // ✅ 권장: track.clone() 대신 "스트림 객체만 분리"
      // - 오디오 트랙(원본)은 공유하고, MediaRecorder에는 별도의 MediaStream 인스턴스를 제공
      const track = (base.getAudioTracks?.() || [])[0];
      if (!track) return false;
      const recStream = new MediaStream([track]);
      return this.setRecordingStream(recStream);
    } catch (e) {
      console.warn('⚠️ ensureRecordingStreamFromBase 실패(무시):', e?.message || e);
      return false;
    }
  }

  // ✅ 원칙: 마이크 track.stop()은 여기서만
  releaseMic() {
    console.log('🧯 releaseMic 시작: 모든 스트림 완전 해제');
    
    // 1. baseMicStream 정리
    if (this.baseMicStream) {
      console.log('  🔇 baseMicStream 정리 중...');
      try {
        this.baseMicStream.getTracks?.().forEach((t) => {
          console.log(`    - track ${t.kind} ${t.label}: ${t.readyState} → stop`);
          try { t.stop(); } catch (e) { console.warn('track.stop 실패:', e); }
        });
      } catch (e) {
        console.warn('  ⚠️ baseMicStream 정리 실패:', e);
      }
    }
    
    // 2. recordingStream 정리 (clone된 트랙도 명시적으로 stop)
    if (this.recordingStream && this.recordingStream !== this.baseMicStream) {
      console.log('  🔇 recordingStream 정리 중...');
      try {
        this.recordingStream.getTracks?.().forEach((t) => {
          console.log(`    - track ${t.kind} ${t.label}: ${t.readyState} → stop`);
          try { t.stop(); } catch (e) { console.warn('track.stop 실패:', e); }
        });
      } catch (e) {
        console.warn('  ⚠️ recordingStream 정리 실패:', e);
      }
    }
    
    // 3. mediaStream 정리 (분석용 스트림)
    if (this.mediaStream && this.mediaStream !== this.baseMicStream && this.mediaStream !== this.recordingStream) {
      console.log('  🔇 mediaStream 정리 중...');
      try {
        this.mediaStream.getTracks?.().forEach((t) => {
          console.log(`    - track ${t.kind} ${t.label}: ${t.readyState} → stop`);
          try { t.stop(); } catch (e) { console.warn('track.stop 실패:', e); }
        });
      } catch (e) {
        console.warn('  ⚠️ mediaStream 정리 실패:', e);
      }
    }
    
    // 4. 참조 제거
    this.baseMicStream = null;
    this.recordingStream = null;
    this.mediaStream = null;
    this.usingWebRTCStream = false;
    
    console.log('✅ releaseMic 완료: 모든 스트림 참조 제거됨');
  }

  // ✅ WebRTC 세션/room_code/token 없이도 "로컬 녹음"만 먼저 켜기 위한 함수
  // - /mictest부터 녹음을 시작하고 싶을 때 사용
  async startLocalMicRecordingIfNeeded() {
    try {
      if (!this.localMicRecordingEnabled) return false;
      if (this.exitInProgress) return false;
      if (this.isRecording) return true;

      // 1) baseMicStream 확보(1회)
      const base = await this.ensureBaseMicStream();
      // 2) recordingStream은 base에서 clone으로 1회 생성 (중간 교체 금지)
      this.ensureRecordingStreamFromBase(base);
      this.startRecording();
      return true;
    } catch (e) {
      console.warn('⚠️ startLocalMicRecordingIfNeeded 실패:', e?.name, e?.message || e);
      return false;
    }
  }

  // 녹음이 끊겼을 때 자동으로 다시 켤 수 있는 워치독(디버그/안정화용)
  async ensureRecordingActive() {
    try {
      if (this.exitInProgress) return false;
      const streamForRecording = this.recordingStream || this.mediaStream;
      if (!this.hasLiveAudioTrack(streamForRecording)) return false;
      const state = this.mediaRecorder?.state;
      if (this.isRecording && state === 'recording') return true;
      this.startRecording();
      return true;
    } catch {
      return false;
    }
  }

  buildRecordingFilename({ prefix = 'recording', reason = 'end' } = {}, blob = null) {
    const sessId = this.sessionId || localStorage.getItem('session_id') || 'no_session';
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const mime = blob?.type || 'audio/webm';
    const ext = this.getRecordingFileExtFromMime(mime);
    // 파일명에 한글/특수문자 포함 시 OS/브라우저별 문제를 피하려고 ASCII 위주로 구성
    return `${prefix}_${sessId}_${reason}_${ts}.${ext}`;
  }

  /**
   * 녹음 Blob을 사용자의 로컬로 저장(다운로드)합니다.
   * - 브라우저 보안상 "사용자 제스처" 없이 다운로드가 막힐 수 있어요.
   *   (하지만 게임 종료 버튼 클릭/이동 같은 흐름에서는 대부분 허용)
   */
  saveRecordingToLocal(recordingData, { prefix = 'recording', reason = 'game_end' } = {}) {
    try {
      const blob = recordingData?.blob;
      if (!blob || !blob.size) {
        console.warn('⚠️ saveRecordingToLocal: 저장할 blob이 없습니다.', {
          hasBlob: !!blob,
          size: blob?.size,
        });
        return false;
      }

      const filename = this.buildRecordingFilename({ prefix, reason }, blob);
      console.log('💾 로컬 저장(다운로드) 시도:', {
        filename,
        mimeType: blob.type,
        size: blob.size,
        sizeHuman: this.formatBytes(blob.size),
        durationMs: recordingData?.duration ?? null,
      });
      // 실제 다운로드는 하지 않고, 저장 시도 로그만 남김, 추후 로컬 다운로드 기능 구현 시 주석 해제 
      //return this.saveBlobAs(blob, filename);
      return true;
    } catch (e) {
      console.error('❌ saveRecordingToLocal 실패:', e);
      return false;
    }
  }

  // 업로드 후 반환된 file_path(예: recordings/xxx.wav)를 받아서 WAV를 로컬로 내려받기
  async downloadServerRecordingFile(filePath, { reason = 'server_wav' } = {}) {
    try {
      if (!filePath) return false;
      const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '') || '';
      const isAbs = /^https?:\/\//i.test(String(filePath));
      const normalizedPath = isAbs
        ? String(filePath)
        : `${base}${String(filePath).startsWith('/') ? '' : '/'}${String(filePath)}`;

      const filenameFromPath = (() => {
        try {
          const raw = String(filePath);
          const last = raw.split('?')[0].split('#')[0].split('/').filter(Boolean).pop();
          return last || null;
        } catch {
          return null;
        }
      })();

      const sessId = this.sessionId || localStorage.getItem('session_id') || 'no_session';
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = filenameFromPath || `recording_${sessId}_${reason}_${ts}.wav`;

      console.log('⬇️ 서버 변환 파일 다운로드 시도:', { filePath, normalizedPath, filename });
      const res = await axiosInstance.get(normalizedPath, { responseType: 'blob' });
      const blob = res?.data;
      if (!blob || !blob.size) {
        console.warn('⚠️ 서버 파일 다운로드 결과가 비어있음', { filePath, normalizedPath });
        return false;
      }
      console.log('✅ 서버 파일 다운로드 완료:', { size: blob.size, sizeHuman: this.formatBytes(blob.size) });
      //서버에서 받은 파일의 자동 로컬 다운로드 방지를 위해 아래 주석 처리, 필요 시 주석 해제
      //return this.saveBlobAs(blob, filename);
      return true;
    } catch (e) {
      console.warn('⚠️ downloadServerRecordingFile 실패(무시):', e?.response?.status, e?.response?.data || e?.message || e);
      return false;
    }
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
  
      // 실제 blob 타입/확장자에 맞추기 (webm/ogg인 경우 그대로)
      const blob = recordingData.blob;
      const mime = blob.type || 'audio/webm';
      const ext  = mime.includes('wav') ? 'wav'
                 : mime.includes('webm') ? 'webm'
                 : mime.includes('ogg') ? 'ogg'
                 : 'bin';

      console.log('📦 업로드 대상 녹음 데이터:', {
        mimeType: mime,
        size: blob.size,
        sizeHuman: this.formatBytes(blob.size),
        durationMs: recordingData?.duration ?? null,
        chunks: this.recordedChunks?.length ?? null,
      });
  
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const file = new File([blob], `recording_${sessId}_${ts}.${ext}`, { type: mime });
  
      const form = new FormData();
      form.append('session_id', sessId); 
      form.append('file', file);         
  
      // const { data } = await axiosInstance.post('/upload_audio', form, {
      //   headers: { 'Content-Type': undefined },
      //   maxBodyLength: Infinity,
      // });
      
      const {data} = await axiosInstance.postForm('/upload_audio', form); // Content-Type 자동

  
      console.log(' 업로드 성공:', data);
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
      // 새 세션 시작 시 종료 플래그 해제 (이후 자동 녹음 시작 허용)
      this.exitInProgress = false;
      
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
      let userInfo = null;
      try {
        console.log('🔍 VoiceManager: /users/me 호출 시도...');
        const response = await axiosInstance.get('/users/me', { timeout: 5000 });
        userInfo = response.data;
        this.participantId = userInfo.id;
        this.nickname = localStorage.getItem('nickname') || userInfo.username || `Player_${userInfo.id}`;
        console.log('✅ VoiceManager: /users/me 성공:', userInfo.id);
      } catch (userErr) {
        const isCorsError = !userErr.response && (userErr.message?.includes('Network Error') || userErr.code === 'ERR_NETWORK');
        if (isCorsError) {
          console.error('❌ VoiceManager CORS 에러: /users/me', {
            message: userErr.message,
            code: userErr.code,
          });
          console.warn('💡 백엔드 CORS 설정을 확인하세요. localStorage 값을 사용합니다.');
        } else {
          console.error('❌ VoiceManager: /users/me 호출 실패:', userErr.response?.status, userErr.response?.data || userErr.message);
        }
        
        // localStorage에서 fallback
        this.participantId = localStorage.getItem('user_id');
        this.nickname = localStorage.getItem('nickname') || `Player_${this.participantId}`;
        
        if (!this.participantId) {
          throw new Error('user_id를 확인할 수 없습니다.');
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

      // 일부 브라우저는 사용자 제스처가 없으면 AudioContext가 suspended 상태로 남음
      // (녹음 자체에는 영향이 없지만, 입력 레벨 디버깅/말하기 감지에 영향)
      try {
        if (this.audioContext.state === 'suspended') {
          console.warn('⚠️ AudioContext suspended → resume 시도');
          await this.audioContext.resume();
          console.log('✅ AudioContext resumed:', this.audioContext.state);
        }
      } catch (e) {
        console.warn('⚠️ AudioContext resume 실패(무시):', e?.message || e);
      }
      
      console.log('✅ WebRTC 스트림 오디오 분석 설정 완료');
      
    } catch (error) {
      console.error('❌ WebRTC 스트림 오디오 분석 설정 실패:', error);
      throw error;
    }
  }

  // 입력 레벨(RMS) 계산 (0~1 근처)
  getInputRms() {
    try {
      if (!this.analyser) return null;
      // analyser.fftSize 만큼 time-domain buffer를 확보
      const size = this.analyser.fftSize || 256;
      const buf = new Uint8Array(size);
      this.analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128; // -1..1
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buf.length);
      return Number.isFinite(rms) ? rms : null;
    } catch {
      return null;
    }
  }

  // 연속 녹음 시작
  startRecording() {
    // ✅ 원칙: 녹음은 무조건 recordingStream 또는 baseMicStream만 사용 (mediaStream fallback 제거)
    const streamForRecording = this.recordingStream || this.baseMicStream;
    if (!streamForRecording || this.isRecording) return;

    try {
      // 0) 오디오 트랙 상태 확인/복구
      const audioTracks = streamForRecording.getAudioTracks?.() || [];
      if (audioTracks.length === 0) {
        console.error('❌ startRecording: mediaStream에 audio track이 없습니다.', {
          streamId: streamForRecording?.id,
          tracks: streamForRecording?.getTracks?.()?.map(t => ({ kind: t.kind, readyState: t.readyState, enabled: t.enabled, muted: t.muted })),
        });
      } else {
        const t0 = audioTracks[0];
        if (t0.enabled === false) {
          console.warn('⚠️ audio track enabled=false → true로 복구 시도');
          t0.enabled = true;
        }
        console.log('🎚️ audio track 상태:', {
          label: t0.label,
          enabled: t0.enabled,
          muted: t0.muted,
          readyState: t0.readyState,
          settings: typeof t0.getSettings === 'function' ? t0.getSettings() : undefined,
        });
      }

      // 브라우저별 MediaRecorder 지원 mimeType이 달라서, 지원 가능한 타입을 자동 선택
      const preferredTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        // Safari 계열은 mp4 계열만 되는 경우가 있음(환경에 따라 다름)
        'audio/mp4',
      ];
      const pickMimeType = () => {
        try {
          if (typeof MediaRecorder === 'undefined') return null;
          if (typeof MediaRecorder.isTypeSupported !== 'function') return null;
          for (const t of preferredTypes) {
            if (MediaRecorder.isTypeSupported(t)) return t;
          }
          return null;
        } catch {
          return null;
        }
      };

      const chosen = pickMimeType();
      this.selectedRecorderMimeType = chosen || null;

      this.mediaRecorder = chosen
        ? new MediaRecorder(streamForRecording, { mimeType: chosen })
        : new MediaRecorder(streamForRecording);

      this.recordedChunks = [];
      this.recordingStartTime = Date.now();
      this.totalRecordedBytes = 0;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
          this.totalRecordedBytes += event.data.size;
        }
      };

      // ✅ onstop은 stopRecording()에서만 설정 (중복 세팅 방지)

      // timeslice가 너무 크면 stop 타이밍/레이스에 따라 청크가 거의 안 쌓여 "1초만 녹음"처럼 보일 수 있음
      // → 250ms로 줄여서 누적을 더 안정적으로 만들기
      this.mediaRecorder.start(250);
      this.isRecording = true;
      
      console.log('🔴 연속 녹음 시작 (WebRTC 스트림 사용)', {
        chosenMimeType: this.selectedRecorderMimeType,
        actualMimeType: this.mediaRecorder?.mimeType,
      });

      // 디버그: 녹음이 "진짜로" 진행 중인지 (청크/바이트 누적) 주기적으로 로그
      if (this.recordingStatsTimer) {
        clearInterval(this.recordingStatsTimer);
        this.recordingStatsTimer = null;
      }
      if (this.isDebugMode) {
        this.recordingStatsTimer = setInterval(() => {
          try {
            const elapsedMs = this.recordingStartTime ? (Date.now() - this.recordingStartTime) : 0;
            const rms = this.getInputRms();
            const t0 = (streamForRecording?.getAudioTracks?.() || [])[0];
            console.log('🎙️ [rec stats]', {
              state: this.mediaRecorder?.state,
              chunks: this.recordedChunks?.length || 0,
              totalBytes: this.totalRecordedBytes,
              totalBytesHuman: this.formatBytes(this.totalRecordedBytes),
              elapsedMs,
              elapsedSec: Math.round(elapsedMs / 1000),
              micLevel: this.micLevel,
              inputRms: rms,
              trackEnabled: t0?.enabled,
              trackMuted: t0?.muted,
              trackReadyState: t0?.readyState,
            });
          } catch {}
        }, 5000);
      }
    } catch (error) {
      console.error('❌ 녹음 시작 실패:', error);
    }
  }

  // 서버에 음성 상태 전송
  async sendVoiceStatusToServer(isSpeaking) {
    try {
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
      usingWebRTCStream: this.usingWebRTCStream,
      totalRecordedBytes: this.totalRecordedBytes,
      selectedRecorderMimeType: this.selectedRecorderMimeType,
    });

    // stats 타이머 정리
    if (this.recordingStatsTimer) {
      clearInterval(this.recordingStatsTimer);
      this.recordingStatsTimer = null;
    }

    if (!this.mediaRecorder) {
      console.warn('⚠️ stopRecording: mediaRecorder가 없음');
      
      if (this.recordedChunks?.length > 0) {
        console.log('📦 기존 청크로 Blob 생성:', this.recordedChunks.length);
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        const duration = this.recordingStartTime ? (Date.now() - this.recordingStartTime) : 0;
        
        this.isRecording = false;
        this.recordedChunks = [];
        
        return {
          blob,
          duration,
          startTime: this.recordingStartTime,
          endTime: Date.now()
        };
      }
      
      this.isRecording = false;
      return null;
    }

    if (this.mediaRecorder.state === 'inactive') {
      console.log('📝 MediaRecorder가 이미 inactive 상태');
      
      if (this.recordedChunks?.length > 0) {
        const mime = this.selectedRecorderMimeType || this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.recordedChunks, { type: mime });
        const duration = this.recordingStartTime ? (Date.now() - this.recordingStartTime) : 0;
        
        console.log('📦 inactive 상태에서 Blob 생성:', {
          size: blob.size,
          duration,
          chunks: this.recordedChunks.length
        });
        
        this.isRecording = false;
        this.recordedChunks = [];
        
        return {
          blob,
          duration,
          startTime: this.recordingStartTime,
          endTime: Date.now()
        };
      }
      
      this.isRecording = false;
      return null;
    }

    return new Promise((resolve) => {
      let resolved = false;
      
      const finalize = () => {
        if (resolved) return;
        resolved = true;
        
        try {
          const mime = this.selectedRecorderMimeType || this.mediaRecorder?.mimeType || 'audio/webm';
          const blob = new Blob(this.recordedChunks || [], { type: mime });
          const duration = this.recordingStartTime ? (Date.now() - this.recordingStartTime) : 0;
          
          console.log('⏹️ 녹음 완료:', {
            size: blob.size,
            duration,
            chunks: this.recordedChunks?.length || 0,
            mimeType: blob.type,
          });
          
          this.isRecording = false;
          this.recordedChunks = [];
          this.mediaRecorder = null;
          this.totalRecordedBytes = 0;
          this.selectedRecorderMimeType = null;
          
          resolve({
            blob,
            duration,
            startTime: this.recordingStartTime,
            endTime: Date.now()
          });
        } catch (error) {
          console.error('❌ finalize 중 오류:', error);
          this.isRecording = false;
          this.recordedChunks = [];
          this.mediaRecorder = null;
          this.totalRecordedBytes = 0;
          this.selectedRecorderMimeType = null;
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
          resolve(null);
        }
      };

      try {
        if (typeof this.mediaRecorder.requestData === 'function') {
          console.log('📤 마지막 데이터 요청');
          this.mediaRecorder.requestData();
          // ✅ 원칙 (2): requestData 후 짧은 지연으로 마지막 청크 flush 보장
          // Promise 콜백 내부라서 await 대신 동기 setTimeout 사용
          setTimeout(() => {
            try {
              console.log('🛑 MediaRecorder.stop() 호출 (flush 후)');
              if (this.mediaRecorder?.state === 'recording') {
                this.mediaRecorder.stop();
                this.isRecording = false;
              }
            } catch (e) {
              console.warn('⚠️ MediaRecorder.stop() 실패:', e.message);
              if (!resolved) {
                resolved = true;
                resolve(null);
              }
            }
          }, 150);
          return; // 타임아웃 안에서 stop이 처리되므로 아래 즉시 stop은 스킵
        }
      } catch (e) {
        console.warn('⚠️ requestData 실패 (무시):', e.message);
      }

      try {
        console.log('🛑 MediaRecorder.stop() 호출 (requestData 없음)');
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

  // 🚨 3. 핵심 수정: 분석용 스트림 참조만 정리
  // ✅ 원칙: track.stop()은 releaseMic()에서만 한다.
  // recordingStream은 녹음 워치독/auto-init과 레이스 방지를 위해 건들지 않음
  console.log('🔇 분석용 스트림 참조 정리(트랙 stop은 안함)');
  this.mediaStream = null;
  // this.recordingStream = null; // ❌ 제거 - releaseMic()에서만 정리
  
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
  console.log('🛑 음성 세션 완전 종료 시작');
  // 종료 시작: 자동 재시작 금지 (Game08에서 room_code 삭제/라우트 전환 레이스 대비)
  this.exitInProgress = true;
  
  try {
    // 🚨 WebRTC 전역 함수 호출 (한 줄로 끝!)
    if (window.terminateWebRTCSession) {
      console.log('✅ WebRTC 전역 함수 호출 중...');
      const result = await window.terminateWebRTCSession();
      console.log('✅ WebRTC 완전 정리 완료');
      return result;
    } else {
      console.error('❌ window.terminateWebRTCSession 함수가 없음');
      
      // 🚨 백업: 기존 방식으로 개별 처리
      const recordingData = await this.stopRecording();
      this.disconnectMicrophone();
      
      if (window.stopAllOutgoingAudioGlobal) {
        window.stopAllOutgoingAudioGlobal();
      }
      
      return { recordingData, uploadResult: null };
    }
    
  } catch (error) {
    console.error('❌ 음성 세션 종료 중 오류:', error);
    return null;
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