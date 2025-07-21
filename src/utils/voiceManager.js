
import axiosInstance from '../api/axiosInstance';

class VoiceManager {
  constructor() {
    this.isConnected = false;
    this.isSpeaking = false;
    this.sessionId = null;
    this.mediaStream = null;
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
  }

  // 세션 나가기
  async leaveSession() {
    this.sessionId ||= localStorage.getItem('session_id');
    
    if (!this.sessionId) {
      console.warn('⚠️ leaveSession: sessionId가 없습니다.');
      return false;
    }
    
    try {
      await axiosInstance.post(`/voice/sessions/${this.sessionId}/leave`, {});
      console.log(' leaveSession 성공');
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

//  음성 세션 초기화 (WebSocketProvider에서 세션이 준비된 후 호출)
async initializeVoiceSession() {
    if (this.sessionInitialized) {
      console.log('⚠️ 음성 세션이 이미 초기화되어 있음');
      return true;
    }
  
    try {
      console.log('🎤 VoiceManager 초기화 시작');
      
      // 1. ✅ 세션 정보 확인 (WebSocketProvider에서 설정됨)
      this.sessionId = localStorage.getItem('session_id');
      if (!this.sessionId) {
        console.error('❌ session_id가 없습니다. WebSocketProvider 초기화를 먼저 해주세요.');
        return false;
      }
      
      // ✅ 세션 ID 형식 검증
      if (typeof this.sessionId !== 'string' || this.sessionId.length === 0) {
        console.error('❌ 유효하지 않은 session_id 형식:', this.sessionId);
        return false;
      }
      
      // ✅ 백엔드에서 세션 유효성 재확인
      try {
        const sessionVerify = await axiosInstance.get(`/voice/sessions/${this.sessionId}`);
        console.log('✅ VoiceManager: 세션 유효성 확인됨:', sessionVerify.data);
      } catch (verifyError) {
        console.error('❌ VoiceManager: 세션 유효성 확인 실패:', verifyError.response?.data);
        return false;
      }
      
      // 2. 사용자 정보 설정
      const { data: userInfo } = await axiosInstance.get('/users/me');
      this.participantId = userInfo.id;
      this.nickname = localStorage.getItem('nickname') || userInfo.username || `Player_${userInfo.id}`;
      
      console.log('📋 VoiceManager 세션 정보:', {
        sessionId: this.sessionId,
        nickname: this.nickname,
        participantId: this.participantId
      });
      
      // 3. 마이크 연결
      await this.connectMicrophone();
      
      // 4. 초기 마이크 ON 상태 전송
      await this.sendVoiceStatusToServer(false);
      
      // 5. 음성 감지 시작
      this.startSpeechDetection();
      
      // 6. 연속 녹음 시작
      this.startRecording();
      
      this.sessionInitialized = true;
      console.log('✅ VoiceManager 초기화 완료');
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

  // 마이크 연결
  async connectMicrophone() {
    try {
      console.log('🎤 마이크 연결 시도...');
      
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });
      
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      
      const microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
      microphone.connect(this.analyser);
      
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      
      this.isConnected = true;
      console.log('✅ 마이크 연결 성공! 임계값:', this.speakingThreshold);
      
    } catch (error) {
      console.error('❌ 마이크 연결 실패:', error);
      if (error.name === 'NotAllowedError') {
        alert('마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
      }
      throw error;
    }
  }

  // 연속 녹음 시작
  startRecording() {
    if (!this.mediaStream || this.isRecording) return;

    try {
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: 'audio/webm;codecs=opus'
      });

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

      this.mediaRecorder.start(1000);
      this.isRecording = true;
      
      console.log('🔴 연속 녹음 시작');
    } catch (error) {
      console.error('❌ 녹음 시작 실패:', error);
    }
  }

  // 연속 녹음 중지 및 저장
  async stopRecording() {
    if (!this.isRecording || !this.mediaRecorder) return null;

    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        const duration = Date.now() - this.recordingStartTime;
        
        console.log('⏹️ 녹음 완료:', {
          size: blob.size,
          duration: duration,
          chunks: this.recordedChunks.length
        });
        
        resolve({
          blob,
          duration,
          startTime: this.recordingStartTime,
          endTime: Date.now()
        });
      };

      this.mediaRecorder.stop();
      this.isRecording = false;
    });
  }

  // 서버에 음성 상태 전송
  async sendVoiceStatusToServer(isSpeaking) {
    try {
      if (this.lastSpeakingState === isSpeaking) return;
      this.lastSpeakingState = isSpeaking;

      const message = {
        type: "voice_status_update",
        participant_id: parseInt(this.participantId),
        guse_id:null,
        is_mic_on: this.isConnected,
        is_speaking: isSpeaking,
        session_id: this.sessionId
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
        
        if (this.isDebugMode) {
          console.log('🗣️ 음성 상태 변화:', {
            speaking: currentlySpeaking,
            level: average.toFixed(1),
            threshold: this.speakingThreshold,
            participantId: this.participantId
          });
        }
        
        this.sendVoiceStatusToServer(currentlySpeaking);
      }
      
      this.animationFrame = requestAnimationFrame(detectSpeech);
    };
    
    console.log('👂 음성 감지 시작 (임계값:', this.speakingThreshold, ')');
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

  // 마이크 연결 해제
  disconnectMicrophone() {
    this.stopSpeechDetection();
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyser = null;
    this.isConnected = false;
    this.isSpeaking = false;
    this.lastSpeakingState = false;
    this.micLevel = 0;
    
    console.log('🔇 마이크 연결 해제');
  }

  // 음성 세션 완전 종료
  async terminateVoiceSession() {
    console.log('🛑 음성 세션 완전 종료 시작');
    
    try {
      // 1. 녹음 중지 및 저장
      const recordingData = await this.stopRecording();
      
      // 2. 마지막 음성 상태 업데이트
      if (this.isSpeaking) {
        await this.sendVoiceStatusToServer(false);
      }
      // 3. 세션 나가기
      await this.leaveSession();
      
      // 4. 마이크 연결 해제
      this.disconnectMicrophone();
      
      // 5. 세션 정보 초기화
      this.sessionId = null;
      this.nickname = null;
      this.participantId = null;
      this.sessionInitialized = false;
      
      console.log('✅ 음성 세션 완전 종료 완료');
      return recordingData;
      
    } catch (error) {
      console.error('❌ 음성 세션 종료 중 오류:', error);
      return null;
    }
  }

  // 일시적 정리 (페이지 이동 시 - 녹음은 유지)
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
      sessionInitialized: this.sessionInitialized
    };
  }
}

// 싱글톤 인스턴스
const voiceManager = new VoiceManager();

// 전역에서 접근 가능하도록 설정
window.voiceManager = voiceManager;

export default voiceManager;