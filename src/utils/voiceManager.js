// // utils/VoiceManager.js
// import axiosInstance from '../api/axiosInstance';

// class VoiceManager {
//   constructor() {
//     this.isConnected = false;
//     this.isSpeaking = false;
//     this.sessionId = null;
//     this.mediaStream = null;
//     this.audioContext = null;
//     this.analyser = null;
//     this.animationFrame = null;
//     this.speakingThreshold = 30; // 임계값 낮춤 (더 민감하게)
//     this.nickname = null;
//     this.participantId = null;
//     this.lastSpeakingState = false;
//     this.micLevel = 0; // 현재 마이크 레벨
//     this.isDebugMode = true; // 디버그 모드
//   }

//   // 음성 세션 초기화
//   async initializeVoiceSession() {
//     try {
//       console.log('🎤 음성 세션 초기화 시작');
      
//       // 1. 마이크 연결
//       await this.connectMicrophone();
      
//       // 2. 세션 ID 및 닉네임 설정
//       const roomCode = localStorage.getItem('room_code');
//       const { data: me } = await axiosInstance.get('/users/me');
      
//       this.sessionId = `voice_session_${roomCode}_${Date.now()}`;
//       this.nickname = `Player_${me.id}`;
//       this.participantId = me.id;
      
//       console.log('✅ 음성 세션 초기화 완료:', {
//         sessionId: this.sessionId,
//         nickname: this.nickname,
//         participantId: this.participantId,
//         isConnected: this.isConnected,
//         speakingThreshold: this.speakingThreshold
//       });
      
//       // 3. 초기 마이크 ON 상태 전송
//       await this.sendVoiceStatusToServer(false);
      
//       // 4. 음성 감지 시작
//       this.startSpeechDetection();
      
//       return true;
//     } catch (error) {
//       console.error('❌ 음성 세션 초기화 실패:', error);
//       return false;
//     }
//   }

//   // 마이크 연결
//   async connectMicrophone() {
//     try {
//       console.log('🎤 마이크 연결 시도...');
      
//       this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true,
//           sampleRate: 44100
//         }
//       });
      
//       this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
//       this.analyser = this.audioContext.createAnalyser();
      
//       const microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
//       microphone.connect(this.analyser);
      
//       // 분석기 설정 (더 민감하게)
//       this.analyser.fftSize = 256;
//       this.analyser.smoothingTimeConstant = 0.8;
      
//       this.isConnected = true;
//       console.log('✅ 마이크 연결 성공! 임계값:', this.speakingThreshold);
      
//     } catch (error) {
//       console.error('❌ 마이크 연결 실패:', error);
//       if (error.name === 'NotAllowedError') {
//         alert('마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
//       }
//       throw error;
//     }
//   }

//   // 서버에 음성 상태 전송
//   async sendVoiceStatusToServer(isSpeaking) {
//     try {
//       // 상태가 변하지 않았으면 전송하지 않음
//       if (this.lastSpeakingState === isSpeaking) return;
      
//       this.lastSpeakingState = isSpeaking;

//       // 실제 서버 API는 아직 없으므로 WebSocket으로 직접 전송
//       const message = {
//         participant_id: parseInt(this.participantId),
//         nickname: this.nickname,
//         is_mic_on: this.isConnected,
//         is_speaking: isSpeaking
//       };

//       // WebSocket이 있다면 직접 전송 (테스트용)
//       if (window.webSocketInstance && window.webSocketInstance.sendMessage) {
//         window.webSocketInstance.sendMessage(message);
//         console.log('📡 WebSocket으로 음성 상태 전송:', message);
//       }

//       // 콘솔에 상태 출력
//       console.log('🎤 음성 상태 변경:', {
//         participantId: this.participantId,
//         nickname: this.nickname,
//         is_mic_on: this.isConnected,
//         is_speaking: isSpeaking,
//         micLevel: this.micLevel.toFixed(1)
//       });
      
//     } catch (error) {
//       console.error('❌ 음성 상태 전송 실패:', error);
//       this.lastSpeakingState = !isSpeaking; // 실패 시 상태 복원
//     }
//   }

//   // 음성 감지 시작
//   startSpeechDetection() {
//     if (!this.analyser) {
//       console.error('❌ 분석기가 없습니다');
//       return;
//     }

//     const bufferLength = this.analyser.frequencyBinCount;
//     const dataArray = new Uint8Array(bufferLength);
    
//     const detectSpeech = () => {
//       if (!this.analyser) return;
      
//       this.analyser.getByteFrequencyData(dataArray);
      
//       // 평균 음성 레벨 계산
//       const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
//       this.micLevel = average;
      
//       const currentlySpeaking = average > this.speakingThreshold;
      
//       // 디버그 모드에서 레벨 출력
//       if (this.isDebugMode && Math.floor(Date.now() / 500) % 2 === 0) {
//         console.log(`🎵 마이크 레벨: ${average.toFixed(1)} (임계값: ${this.speakingThreshold})`);
//       }
      
//       // 음성 상태 변화 감지
//       if (currentlySpeaking !== this.isSpeaking) {
//         this.isSpeaking = currentlySpeaking;
        
//         console.log('🗣️ 음성 상태 변화 감지:', {
//           speaking: currentlySpeaking,
//           level: average.toFixed(1),
//           threshold: this.speakingThreshold,
//           participantId: this.participantId
//         });
        
//         // 서버에 음성 상태 전송
//         this.sendVoiceStatusToServer(currentlySpeaking);
//       }
      
//       this.animationFrame = requestAnimationFrame(detectSpeech);
//     };
    
//     console.log('🎯 음성 감지 시작 (임계값:', this.speakingThreshold, ')');
//     console.log('💡 마이크에 대고 말해보세요!');
//     detectSpeech();
//   }

//   // 임계값 조정
//   setSpeakingThreshold(threshold) {
//     this.speakingThreshold = threshold;
//     console.log('🎚️ 음성 임계값 변경:', threshold);
//   }

//   // 디버그 모드 토글
//   toggleDebugMode() {
//     this.isDebugMode = !this.isDebugMode;
//     console.log('🐛 디버그 모드:', this.isDebugMode ? 'ON' : 'OFF');
//   }

//   // 음성 감지 중지
//   stopSpeechDetection() {
//     if (this.animationFrame) {
//       cancelAnimationFrame(this.animationFrame);
//       this.animationFrame = null;
//     }
//     console.log('🔇 음성 감지 중지');
//   }

//   // 마이크 연결 해제
//   disconnectMicrophone() {
//     this.stopSpeechDetection();
    
//     if (this.mediaStream) {
//       this.mediaStream.getTracks().forEach(track => track.stop());
//       this.mediaStream = null;
//     }
    
//     if (this.audioContext) {
//       this.audioContext.close();
//       this.audioContext = null;
//     }
    
//     this.analyser = null;
//     this.isConnected = false;
//     this.isSpeaking = false;
//     this.lastSpeakingState = false;
//     this.micLevel = 0;
    
//     console.log('🔇 마이크 연결 해제');
//   }

//   // 음성 세션 정리
//   async cleanup() {
//     if (this.isSpeaking) {
//       await this.sendVoiceStatusToServer(false);
//     }
    
//     this.disconnectMicrophone();
    
//     this.sessionId = null;
//     this.nickname = null;
//     this.participantId = null;
    
//     console.log('🧹 음성 세션 정리 완료');
//   }

//   // 현재 상태 반환
//   getStatus() {
//     return {
//       isConnected: this.isConnected,
//       isSpeaking: this.isSpeaking,
//       sessionId: this.sessionId,
//       nickname: this.nickname,
//       participantId: this.participantId,
//       micLevel: this.micLevel,
//       speakingThreshold: this.speakingThreshold
//     };
//   }
// }

// // 싱글톤 인스턴스
// const voiceManager = new VoiceManager();

// // 전역에서 접근 가능하도록 설정 (테스트용)
// window.voiceManager = voiceManager;

// export default voiceManager;// utils/VoiceManager.js - 연속 녹음 기능
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
    this.sessionInitialized = false; // 세션 초기화 여부
  }

  // 음성 세션 초기화 (GameIntro2에서만 호출)
  async initializeVoiceSession() {
    if (this.sessionInitialized) {
      console.log('✅ 음성 세션이 이미 초기화되어 있음');
      return true;
    }

    try {
      console.log('🎤 음성 세션 초기화 시작');
      
      // 1. 마이크 연결
      await this.connectMicrophone();
      
      // 2. 세션 ID 및 닉네임 설정
      const roomCode = localStorage.getItem('room_code');
      const { data: me } = await axiosInstance.get('/users/me');
      
      this.sessionId = `voice_session_${roomCode}_${Date.now()}`;
      this.nickname = `Player_${me.id}`;
      this.participantId = me.id;
      
      console.log('✅ 음성 세션 초기화 완료:', {
        sessionId: this.sessionId,
        nickname: this.nickname,
        participantId: this.participantId,
        isConnected: this.isConnected
      });
      
      // 3. 초기 마이크 ON 상태 전송
      await this.sendVoiceStatusToServer(false);
      
      // 4. 음성 감지 시작
      this.startSpeechDetection();
      
      // 5. 연속 녹음 시작
      this.startRecording();
      
      this.sessionInitialized = true;
      return true;
    } catch (error) {
      console.error('❌ 음성 세션 초기화 실패:', error);
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
        console.log('🎬 녹음 종료, 총 청크:', this.recordedChunks.length);
      };

      this.mediaRecorder.start(1000); // 1초마다 청크 생성
      this.isRecording = true;
      
      console.log('🎬 연속 녹음 시작');
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
        
        console.log('🎬 녹음 완료:', {
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
        participant_id: parseInt(this.participantId),
        nickname: this.nickname,
        is_mic_on: this.isConnected,
        is_speaking: isSpeaking
      };

      if (window.webSocketInstance && window.webSocketInstance.sendMessage) {
        window.webSocketInstance.sendMessage(message);
        console.log('📡 WebSocket으로 음성 상태 전송:', message);
      }

      console.log('🎤 음성 상태 변경:', {
        participantId: this.participantId,
        nickname: this.nickname,
        is_mic_on: this.isConnected,
        is_speaking: isSpeaking,
        micLevel: this.micLevel.toFixed(1)
      });
      
    } catch (error) {
      console.error('❌ 음성 상태 전송 실패:', error);
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
      
      if (this.isDebugMode && Math.floor(Date.now() / 500) % 2 === 0) {
        console.log(`🎵 마이크 레벨: ${average.toFixed(1)} (임계값: ${this.speakingThreshold})`);
      }
      
      if (currentlySpeaking !== this.isSpeaking) {
        this.isSpeaking = currentlySpeaking;
        
        console.log('🗣️ 음성 상태 변화 감지:', {
          speaking: currentlySpeaking,
          level: average.toFixed(1),
          threshold: this.speakingThreshold,
          participantId: this.participantId
        });
        
        this.sendVoiceStatusToServer(currentlySpeaking);
      }
      
      this.animationFrame = requestAnimationFrame(detectSpeech);
    };
    
    console.log('🎯 음성 감지 시작 (임계값:', this.speakingThreshold, ')');
    console.log('💡 마이크에 대고 말해보세요!');
    detectSpeech();
  }

  // 임계값 조정
  setSpeakingThreshold(threshold) {
    this.speakingThreshold = threshold;
    console.log('🎚️ 음성 임계값 변경:', threshold);
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
    console.log('🔇 음성 감지 중지');
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

  // 음성 세션 완전 종료 (마지막 페이지에서 호출)
  async terminateVoiceSession() {
    console.log('🛑 음성 세션 완전 종료 시작');
    
    // 1. 녹음 중지 및 저장
    const recordingData = await this.stopRecording();
    
    // 2. 마지막 음성 상태 업데이트
    if (this.isSpeaking) {
      await this.sendVoiceStatusToServer(false);
    }
    
    // 3. 마이크 연결 해제
    this.disconnectMicrophone();
    
    // 4. 세션 정보 초기화
    this.sessionId = null;
    this.nickname = null;
    this.participantId = null;
    this.sessionInitialized = false;
    
    console.log('🛑 음성 세션 완전 종료 완료');
    
    return recordingData;
  }

  // 일시적 정리 (페이지 이동 시 - 녹음은 유지)
  async cleanup() {
    // 말하는 상태만 false로 업데이트
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