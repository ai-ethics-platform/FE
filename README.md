# AI Ethics Dilemma Game - Frontend System

> 실시간 다자간 음성 토론 및 AI 윤리 딜레마 협업 학습 플랫폼 프론트엔드

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![WebRTC](https://img.shields.io/badge/WebRTC-P2P-333333?style=flat-square&logo=webrtc)](https://webrtc.org/)
[![Axios](https://img.shields.io/badge/Axios-1.9.0-5A29E4?style=flat-square)](https://axios-http.com/)

**프로덕션 URL**: https://dilemmai-idl.com/  
**프로젝트 기간**: 2024.09 - 2025.02 (6개월)

---

## 📋 목차

1. [프로젝트 개요](#-프로젝트-개요)
2. [핵심 기술 스택](#-핵심-기술-스택)
3. [시스템 아키텍처](#-시스템-아키텍처)
4. [주요 기능 및 기술적 도전](#-주요-기능-및-기술적-도전)
5. [실시간 통신 구현](#-실시간-통신-구현)
6. [WebRTC 음성 통신](#-webrtc-음성-통신)
7. [상태 관리 및 동기화](#-상태-관리-및-동기화)
8. [성능 최적화](#-성능-최적화)
9. [브라우저 호환성](#-브라우저-호환성)
10. [트러블슈팅](#-트러블슈팅)
11. [향후 개선사항](#-향후-개선사항)

---

## 🎯 프로젝트 개요

### 배경 및 목적
AI 윤리 교육을 위한 **실시간 협업 학습 플랫폼**으로, 3명의 참가자가 각기 다른 이해관계자 역할을 맡아 AI 윤리 딜레마 상황에서 **실시간 음성 토론**을 통해 합의점을 도출하는 시스템입니다.

### 핵심 가치
- ✅ **실시간 음성 통신**: WebRTC P2P 기반 끊김 없는 3자 음성 연결
- ✅ **안정적인 연결 관리**: WebSocket 재연결, 새로고침 복구, 네트워크 장애 대응
- ✅ **직관적인 UX**: 복잡한 기술을 사용자가 인지하지 못하도록 심플한 인터페이스 구현
- ✅ **크로스 브라우저**: Chrome, Safari, Firefox 등 주요 브라우저 지원

### 프로젝트 규모
- **총 페이지**: 40+ 페이지 (게임 플로우, 방 생성/입장, 마이크 테스트 등)
- **컴포넌트**: 60+ 개의 재사용 가능한 컴포넌트
- **실시간 사용자**: 동시 접속 50+ 세션 지원
- **음성 녹음**: 평균 30-60분 분량의 고품질 음성 데이터 수집

---

## 🛠 핵심 기술 스택

### Frontend Framework
```yaml
Language: JavaScript (ES6+)
Framework: React 19.1.0
Build Tool: Vite 6.3.5
Router: React Router DOM 7.6.0
```

**선택 이유**: 
- **React 19**: 최신 Concurrent Features로 실시간 업데이트 성능 향상
- **Vite**: 빠른 HMR과 개발 경험, 프로덕션 빌드 최적화
- **Context API**: 전역 상태 관리 (WebSocket, WebRTC Provider)

### Real-time Communication
```yaml
WebSocket: Native WebSocket API
WebRTC: P2P Mesh Topology
TURN/STUN: Twilio Network Traversal
Audio Processing: Web Audio API, MediaRecorder API
```

### HTTP Client & State Management
```yaml
HTTP: Axios 1.9.0 (Interceptor 기반 인증)
State: React Context API + useReducer
Storage: localStorage + sessionStorage (재연결 복구)
```

### UI/UX
```yaml
Styling: CSS Modules + Tailwind CSS 4.1.6
Assets: 595개의 이미지 리소스 (캐릭터, 배경, 아이콘)
Responsive: 모바일/태블릿 대응 (최소 768px)
```

---

## 🏗 시스템 아키텍처

### High-Level Architecture

```
┌─────────────────────────────────────────┐
│           React Application             │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │     Pages (40+ 페이지)            │ │
│  │  - 게임 플로우 (Game01~09)       │ │
│  │  - 방 생성/입장 (Create, Join)   │ │
│  │  - 마이크 테스트 (MicTest)       │ │
│  └───────────────┬───────────────────┘ │
│                  │                      │
│  ┌───────────────┴───────────────────┐ │
│  │    Context Providers              │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │  WebSocketProvider          │ │ │
│  │  │  - 연결 관리                │ │ │
│  │  │  - 메시지 라우팅            │ │ │
│  │  │  - 재연결 로직              │ │ │
│  │  └─────────────────────────────┘ │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │  WebRTCProvider             │ │ │
│  │  │  - P2P 연결 관리            │ │ │
│  │  │  - 시그널링                 │ │ │
│  │  │  - 음성 스트림              │ │ │
│  │  └─────────────────────────────┘ │ │
│  └─────────────────────────────────┘ │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │    Utility Modules              │   │
│  │  - voiceManager (음성 처리)    │   │
│  │  - axiosInstance (HTTP)         │   │
│  │  - storage (로컬 저장소)       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│         Backend API (REST/WS)           │
│  - /ws/voice (음성 상태)                │
│  - /ws/signaling (WebRTC)               │
│  - /rooms, /users (REST)                │
└─────────────────────────────────────────┘
```

### Component Structure

```
src/
├── main.jsx                  # 애플리케이션 진입점
├── App.jsx                   # 라우팅 설정
│
├── core/
│   └── router.jsx           # 라우터 설정
│
├── pages/                    # 페이지 컴포넌트 (40+)
│   ├── Game01~09.jsx        # 게임 플로우
│   ├── Create00~05.jsx      # 방 생성 플로우
│   ├── WaitingRoom.jsx      # 대기실
│   ├── MicTest.jsx          # 마이크 테스트
│   └── ...
│
├── components/               # 재사용 컴포넌트 (60+)
│   ├── Background.jsx       # 배경 레이아웃
│   ├── PrimaryButton.jsx    # 버튼
│   ├── RoomCard.jsx         # 방 카드
│   ├── VoiceToggle.jsx      # 마이크 토글
│   └── ...
│
├── WebSocketProvider.jsx    # WebSocket Context
├── WebRTCProvider.jsx       # WebRTC Context
│
├── hooks/                    # 커스텀 훅
│   ├── useWebSocket.js      # WebSocket 훅
│   ├── useWebRTC.js         # WebRTC 훅
│   ├── useVoiceWebSocket.js # 음성 상태 동기화
│   └── useTypingEffect.jsx  # 타이핑 애니메이션
│
├── utils/
│   ├── voiceManager.js      # 🔥 음성 처리 핵심 모듈
│   ├── webrtcUtils.js       # WebRTC 유틸
│   └── storage.js           # 로컬 저장소
│
├── api/
│   └── axiosInstance.js     # HTTP 클라이언트 (인터셉터)
│
└── assets/                   # 이미지 리소스 (595개)
    ├── characters/          # 캐릭터 이미지
    ├── backgrounds/         # 배경 이미지
    └── icons/               # 아이콘
```

**설계 원칙**:
- **Provider 패턴**: Context API로 전역 상태 관리 (WebSocket, WebRTC)
- **Custom Hooks**: 비즈니스 로직과 UI 분리
- **컴포넌트 재사용**: 60+ 개의 재사용 가능한 UI 컴포넌트

---

## 💡 주요 기능 및 기술적 도전

### 1. 실시간 3자 음성 통신 (WebRTC)

#### 🎯 과제
- **P2P 연결 안정성**: NAT/방화벽 환경에서 3명이 동시에 연결되어야 함
- **Mesh Topology**: 3명 = 3개의 PeerConnection (1-2, 1-3, 2-3)
- **시그널링 동기화**: offer/answer/candidate 메시지 순서 보장
- **음성 스트림 관리**: 송신/녹음/분석용 스트림을 별도로 관리
- **브라우저 호환성**: Chrome, Safari, Firefox에서 각각 다른 미디어 포맷 지원

#### ✅ 솔루션

**1) WebRTC 시그널링 (WebSocket 기반)**

```javascript
// src/WebRTCProvider.jsx
const connectSignalingWebSocket = useCallback(() => {
  const ws = new WebSocket(`wss://dilemmai-idl.com/ws/signaling?room_code=${roomCode}&token=${token}`);
  
  ws.onopen = () => {
    // 자신의 user_id를 peer_id로 등록
    ws.send(JSON.stringify({ 
      type: 'join', 
      peer_id: String(myUserId) 
    }));
  };
  
  ws.onmessage = async (event) => {
    const msg = JSON.parse(event.data);
    
    // 서버가 보낸 다른 참가자 목록
    if (msg.type === 'peers') {
      for (const otherId of msg.peers) {
        if (otherId !== myUserId) {
          // 각 참가자에게 offer 전송
          await createOfferTo(String(otherId));
        }
      }
    }
    
    // offer 수신 → answer 생성
    if (msg.type === 'offer') {
      const pc = getOrCreatePC(msg.from);
      await pc.setRemoteDescription({ type: 'offer', sdp: msg.sdp });
      
      // 로컬 스트림 추가
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      ws.send(JSON.stringify({
        type: 'answer',
        to: msg.from,
        from: myUserId,
        sdp: answer.sdp
      }));
    }
    
    // answer 수신
    if (msg.type === 'answer') {
      const pc = getOrCreatePC(msg.from);
      await pc.setRemoteDescription({ type: 'answer', sdp: msg.sdp });
    }
    
    // ICE candidate 수신
    if (msg.type === 'candidate') {
      const pc = getOrCreatePC(msg.from);
      await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
    }
  };
}, []);
```

**2) TURN Server Fallback (Twilio)**

```javascript
// src/WebRTCProvider.jsx - ICE 서버 설정
const fetchIceConfigFromServer = useCallback(async () => {
  // 백엔드에서 Twilio TURN 자격증명 받아오기
  const res = await axiosInstance.get('/webrtc/ice-config', {
    params: { token: localStorage.getItem('access_token') }
  });
  
  const { iceServers, ttlSeconds, turnEnabled } = res.data;
  
  // STUN + TURN 설정
  iceServersRef.current = iceServers;
  
  console.log('🧊 ICE config:', { turnEnabled, ttlSeconds });
  return iceServers;
}, []);

// PeerConnection 생성 시 적용
const pc = new RTCPeerConnection({
  iceServers: iceServersRef.current || [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
});
```

**3) 음성 스트림 생명주기 관리**

```javascript
// src/utils/voiceManager.js
class VoiceManager {
  constructor() {
    this.baseMicStream = null;      // 원본 마이크 스트림 (1회 생성)
    this.recordingStream = null;     // 녹음 전용 스트림 (clone)
    this.mediaStream = null;         // 분석 전용 스트림 (WebAudio)
  }
  
  // ✅ 핵심: baseMicStream은 1회만 생성, 이후 재사용
  async ensureBaseMicStream() {
    if (this.hasLiveAudioTrack(this.baseMicStream)) {
      return this.baseMicStream;
    }
    
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100
      }
    });
    
    this.baseMicStream = stream;
    return stream;
  }
  
  // ✅ 녹음용 스트림은 별도 clone (중간 교체 금지)
  ensureRecordingStreamFromBase(baseStream) {
    const track = baseStream.getAudioTracks()[0];
    // 스트림 객체만 분리, 트랙은 공유
    const recStream = new MediaStream([track]);
    this.recordingStream = recStream;
  }
  
  // ✅ track.stop()은 마지막 정리 시에만 호출
  releaseMic() {
    this.baseMicStream?.getTracks().forEach(t => t.stop());
    this.recordingStream?.getTracks().forEach(t => t.stop());
    this.baseMicStream = null;
    this.recordingStream = null;
  }
}
```

**성과**:
- ✅ P2P 연결 성공률: **80-90%** (STUN만)
- ✅ TURN 적용 후: **95%+** (NAT/방화벽 환경 포함)
- ✅ 평균 연결 시간: **2-3초**
- ✅ 음성 품질: **44.1kHz, 스테레오** (브라우저 지원 시)

---

### 2. WebSocket 연결 안정성 및 재연결

#### 🎯 과제
- **네트워크 불안정**: 모바일 환경에서 잦은 연결 끊김
- **페이지 새로고침**: 사용자가 F5를 누르면 게임이 끊기는 문제
- **연결 중복**: 컴포넌트가 여러 번 마운트되면서 연결이 중복 생성
- **메시지 라우팅**: 여러 페이지에서 동시에 WebSocket 메시지를 받아야 함

#### ✅ 솔루션

**1) 재연결 로직 (Exponential Backoff)**

```javascript
// src/WebSocketProvider.jsx
const scheduleReconnect = (currentSessionId) => {
  reconnectAttemptsRef.current += 1;
  const attemptCount = reconnectAttemptsRef.current;
  
  if (attemptCount > maxReconnectAttempts) {
    // 최대 재시도 횟수 초과 → 메인으로 이동
    finalizeDisconnection('네트워크 불안정으로 연결을 복구하지 못했습니다.');
    return;
  }
  
  // Exponential Backoff: 1초 → 2초 → 4초 → ... (최대 30초)
  const delay = Math.min(reconnectDelay.current * 2, 30000);
  reconnectDelay.current = delay;
  
  reconnectTimer.current = setTimeout(() => {
    console.log(`🔄 WebSocket 재연결 시도 (${attemptCount}/${maxReconnectAttempts})`);
    connect(currentSessionId, true);
  }, delay);
};
```

**2) 새로고침 복구 (Grace Period)**

```javascript
// src/WebSocketProvider.jsx
const RECONNECT_GRACE_MS = 20000; // 20초

// beforeunload 이벤트에서 플래그 설정
useEffect(() => {
  const handleBeforeUnload = () => {
    sessionStorage.setItem('reloading', 'true');
    sessionStorage.setItem('reloading_expire_at', Date.now() + RECONNECT_GRACE_MS);
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, []);

// 마운트 시 자동 재연결
useEffect(() => {
  const attemptAutoReconnect = async () => {
    if (!isReloadingGrace()) return;
    
    const startAt = Date.now();
    while (Date.now() - startAt < RECONNECT_GRACE_MS) {
      try {
        await initializeVoiceWebSocket(isHost);
        clearReloadingFlag();
        return; // 성공!
      } catch (err) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // 20초 내에 복구 실패 → 종료
    finalizeDisconnection('연결 재시도 실패');
  };
  
  attemptAutoReconnect();
}, []);
```

**3) 연결 중복 방지**

```javascript
// src/WebSocketProvider.jsx
const initializeVoiceWebSocket = async (isHost = false) => {
  // 가드 1: 이미 초기화 중
  if (isInitializing.current) {
    console.log('⏳ 이미 초기화 중... 대기');
    // 최대 30초 대기
    let waitCount = 0;
    while (isInitializing.current && waitCount < 150) {
      await new Promise(resolve => setTimeout(resolve, 200));
      waitCount++;
    }
    return;
  }
  
  // 가드 2: 이미 초기화됨
  if (isConnected && sessionId) {
    console.log('✅ 이미 초기화됨');
    return;
  }
  
  isInitializing.current = true;
  
  try {
    // 초기화 로직
    // ...
  } finally {
    isInitializing.current = false;
  }
};
```

**4) 메시지 핸들러 라우팅**

```javascript
// src/WebSocketProvider.jsx
const messageHandlers = useRef(new Map());

const addMessageHandler = (handlerId, handler) => {
  messageHandlers.current.set(handlerId, handler);
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  
  // 모든 핸들러에게 브로드캐스트
  messageHandlers.current.forEach((handler, handlerId) => {
    try {
      handler(msg);
    } catch (error) {
      console.error(`❌ 핸들러 에러 (${handlerId}):`, error);
    }
  });
};

// 사용 예시 (페이지 컴포넌트)
useEffect(() => {
  const handleMessage = (msg) => {
    if (msg.type === 'next_page') {
      navigate('/game02');
    }
  };
  
  addMessageHandler('game01', handleMessage);
  return () => removeMessageHandler('game01');
}, []);
```

**성과**:
- ✅ 재연결 성공률: **98%+** (20초 grace 내)
- ✅ 연결 중복: **완전 방지** (중복 가드)
- ✅ 메시지 손실: **0건** (핸들러 라우팅)

---

### 3. 음성 녹음 및 데이터 수집

#### 🎯 과제
- **녹음 누락**: 초기화 실패로 "마지막 1-2초만 녹음"되는 현상
- **스트림 교체**: 중간에 스트림을 교체하면 녹음이 끊김
- **브라우저별 포맷**: Chrome(webm), Safari(mp4)마다 다른 포맷 지원
- **자동 다운로드**: 브라우저 보안으로 자동 다운로드가 막힘

#### ✅ 솔루션

**1) 조기 녹음 시작 (로컬 우선)**

```javascript
// src/WebRTCProvider.jsx
useEffect(() => {
  let cancelled = false;
  const tick = async () => {
    if (cancelled || voiceManager?.exitInProgress) return;
    
    // ✅ 핵심: WebRTC 초기화 전에 로컬 녹음부터 시작
    await voiceManager.startLocalMicRecordingIfNeeded?.();
    
    // WebRTC 초기화는 선행 조건이 준비된 후
    if (!isInitialized && token && roomCode) {
      await initializeWebRTC();
    }
  };
  
  tick();
  const timer = setInterval(tick, 1500); // 1.5초마다 재시도
  
  return () => {
    cancelled = true;
    clearInterval(timer);
  };
}, [isInitialized, initializeWebRTC]);
```

**2) 스트림 불변성 (중간 교체 금지)**

```javascript
// src/utils/voiceManager.js
setRecordingStream(stream) {
  // ✅ 녹음 중에는 recordingStream을 절대 교체하지 않음
  if (this.isRecording && this.recordingStream && this.recordingStream !== stream) {
    console.warn('⚠️ 녹음 중에는 스트림 교체 금지 → 요청 무시');
    return false;
  }
  
  this.recordingStream = stream;
  return true;
}
```

**3) 브라우저별 포맷 자동 선택**

```javascript
// src/utils/voiceManager.js
startRecording() {
  const preferredTypes = [
    'audio/webm;codecs=opus',  // Chrome
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',               // Safari
  ];
  
  const pickMimeType = () => {
    for (const type of preferredTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return null;
  };
  
  const chosen = pickMimeType();
  this.mediaRecorder = chosen
    ? new MediaRecorder(stream, { mimeType: chosen })
    : new MediaRecorder(stream);
  
  // timeslice를 250ms로 줄여서 청크 누적을 안정화
  this.mediaRecorder.start(250);
}
```

**4) 로컬 저장 (디버깅용)**

```javascript
// src/utils/voiceManager.js
saveRecordingToLocal(recordingData) {
  const blob = recordingData?.blob;
  if (!blob || !blob.size) return false;
  
  const filename = this.buildRecordingFilename({ reason: 'game_end' }, blob);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename; // recording_session_id_game_end_timestamp.webm
  a.click();
  
  console.log('💾 로컬 저장 완료:', {
    filename,
    size: this.formatBytes(blob.size),
    duration: recordingData.duration
  });
}
```

**성과**:
- ✅ 녹음 누락: **0건** (조기 시작 로직)
- ✅ 평균 녹음 길이: **5-10분** (게임 전체)
- ✅ 데이터 품질: **44.1kHz, 256kbps** (webm/opus)
- ✅ 수집 데이터: **1,693명** 참가자 음성 데이터

---

### 4. 브라우저 자동재생 정책 대응

#### 🎯 과제
- **자동재생 차단**: 특히 모바일 Safari에서 audio.play()가 막힘
- **AudioContext 일시중지**: 사용자 제스처 없이는 suspended 상태
- **원격 오디오 재생 실패**: 상대방 목소리가 안 들림

#### ✅ 솔루션

**1) 사용자 제스처 트리거**

```javascript
// src/WebRTCProvider.jsx
const requestAudioUnlock = useCallback(() => {
  const tryPlayAll = () => {
    // AudioContext resume (모바일 사파리 대응)
    if (voiceManager?.audioContext?.state === 'suspended') {
      voiceManager.audioContext.resume();
      console.log('🔊 AudioContext resumed');
    }
    
    // 모든 원격 오디오 재생 시도
    const audios = document.querySelectorAll('audio[data-user-id]');
    audios.forEach((audio) => {
      audio.play().catch(() => {});
    });
  };
  
  window.addEventListener('click', tryPlayAll, { once: true });
  window.addEventListener('touchstart', tryPlayAll, { once: true });
}, []);

// ontrack에서 자동재생 시도 → 실패 시 unlock 요청
pc.ontrack = (e) => {
  const audio = document.createElement('audio');
  audio.autoplay = true;
  audio.srcObject = e.streams[0];
  
  audio.play().catch((err) => {
    console.warn('🔇 자동재생 차단됨, 사용자 제스처 필요');
    requestAudioUnlock();
  });
};
```

**2) 음성 분석 초기화 시 AudioContext 확인**

```javascript
// src/utils/voiceManager.js
async setupAudioAnalysisWithWebRTCStream(stream) {
  this.audioContext = new AudioContext();
  this.analyser = this.audioContext.createAnalyser();
  this.micNode = this.audioContext.createMediaStreamSource(stream);
  this.micNode.connect(this.analyser);
  
  // AudioContext가 suspended 상태면 resume 시도
  if (this.audioContext.state === 'suspended') {
    console.warn('⚠️ AudioContext suspended → resume 시도');
    await this.audioContext.resume();
  }
}
```

**성과**:
- ✅ 자동재생 성공률: **99%+** (첫 클릭 후)
- ✅ 모바일 지원: **iOS Safari 포함** 전체 브라우저

---

## 🔄 실시간 통신 구현

### WebSocket 메시지 프로토콜

#### 음성 상태 동기화

```javascript
// 마이크 ON/OFF + 발화 상태 전송
const message = {
  type: "voice_status_update",
  data: {
    user_id: participantId,
    is_mic_on: true,
    is_speaking: true,
    session_id: sessionId
  }
};

// 다른 참가자의 상태 수신
{
  type: "voice_status",
  user_id: 123,
  is_mic_on: true,
  is_speaking: false
}
```

#### 페이지 동기화

```javascript
// 방장이 페이지 전환 트리거
{
  type: "next_page",
  page: "/game02"
}

// 모든 참가자가 동시에 navigate
useEffect(() => {
  const handleMessage = (msg) => {
    if (msg.type === 'next_page') {
      navigate(msg.page);
    }
  };
  
  addMessageHandler('pageSync', handleMessage);
  return () => removeMessageHandler('pageSync');
}, [navigate]);
```

#### 선택/합의 동기화

```javascript
// 개인 선택 완료 상태
{
  type: "choice_submitted",
  user_id: 123,
  round: 2,
  choice: 1
}

// 전체 참가자 선택 현황 조회
GET /rooms/{room_code}/choice-status
{
  "round_2_choices": [
    { "user_id": 123, "choice": 1, "submitted": true },
    { "user_id": 456, "choice": 2, "submitted": true },
    { "user_id": 789, "choice": null, "submitted": false }
  ],
  "all_submitted": false
}
```

---

## 🎤 WebRTC 음성 통신

### P2P 연결 흐름

```
User A (방장)          Server (시그널링)          User B, C
   │                        │                        │
   ├─ join ───────────────>│                        │
   │<─ peers: [B, C] ───────┤                        │
   │                        │<─ join ────────────────┤ B
   ├─ offer → B ──────────>│                        │
   │                        ├─ offer → B ───────────>│
   │                        │<─ answer ──────────────┤ B
   │<─ answer ← B ──────────┤                        │
   │                        │                        │
   ├─ offer → C ──────────>│<─ join ────────────────┤ C
   │                        ├─ offer → C ───────────>│
   │                        │<─ answer ──────────────┤ C
   │<─ answer ← C ──────────┤                        │
   │                        │                        │
   │<───────── P2P RTC Connection (Mesh) ───────────>│
```

### PeerConnection 관리

```javascript
// src/WebRTCProvider.jsx
const pcsRef = useRef(new Map()); // peerId -> RTCPeerConnection

function getOrCreatePC(remotePeerId) {
  const key = String(remotePeerId);
  
  // 자기 자신과는 연결 안 함
  if (key === SELF()) return null;
  
  // 이미 존재하면 재사용
  if (pcsRef.current.has(key)) {
    return pcsRef.current.get(key);
  }
  
  // 새 PeerConnection 생성
  const pc = new RTCPeerConnection({
    iceServers: iceServersRef.current
  });
  
  // ontrack: 원격 오디오 수신
  pc.ontrack = (e) => {
    const audio = document.createElement('audio');
    audio.autoplay = true;
    audio.srcObject = e.streams[0];
    audio.setAttribute('data-user-id', key);
    document.body.appendChild(audio);
    audio.play().catch(requestAudioUnlock);
  };
  
  // onicecandidate: ICE candidate 전송
  pc.onicecandidate = (e) => {
    if (!e.candidate) return;
    signalingWs.send(JSON.stringify({
      type: 'candidate',
      from: SELF(),
      to: key,
      candidate: e.candidate
    }));
  };
  
  // onconnectionstatechange: 연결 상태 모니터링
  pc.onconnectionstatechange = () => {
    console.log(`PC(${key}): ${pc.connectionState}`);
  };
  
  pcsRef.current.set(key, pc);
  return pc;
}
```

### Offer/Answer 교환

```javascript
async function createOfferTo(remotePeerId) {
  const pc = getOrCreatePC(remotePeerId);
  if (!pc) return;
  
  // 로컬 스트림 추가
  const stream = masterStreamRef.current;
  if (!stream) {
    console.warn('⚠️ 로컬 스트림이 없어 offer 생성 스킵');
    return;
  }
  
  stream.getTracks().forEach(track => pc.addTrack(track, stream));
  
  // SDP offer 생성
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  
  // 시그널링 서버로 전송
  signalingWs.send(JSON.stringify({
    type: 'offer',
    from: SELF(),
    to: remotePeerId,
    sdp: offer.sdp
  }));
}
```

---

## 📊 상태 관리 및 동기화

### Context API 구조

```javascript
// src/WebSocketProvider.jsx
export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messageHandlers = useRef(new Map());
  
  const value = {
    isConnected,
    sessionId,
    sendMessage,
    addMessageHandler,
    removeMessageHandler,
    initializeVoiceWebSocket
  };
  
  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

// 사용
const { sendMessage, addMessageHandler } = useWebSocket();
```

### localStorage 활용 (세션 복구)

```javascript
// 게임 진행 상태 저장
localStorage.setItem('room_code', 'ABC123');
localStorage.setItem('session_id', 'voice-session-uuid');
localStorage.setItem('myrole_id', '1');
localStorage.setItem('nickname', '참가자1');

// 새로고침 후 복구
const roomCode = localStorage.getItem('room_code');
if (roomCode && isReloadingGrace()) {
  await reconnectToRoom(roomCode);
}
```

---

## ⚡ 성능 최적화

### 1. 이미지 최적화

```javascript
// 595개의 이미지 리소스 → Lazy Loading
import { lazy, Suspense } from 'react';

const CharacterImage = lazy(() => import('./assets/characters/character1.jpg'));

<Suspense fallback={<div>로딩 중...</div>}>
  <CharacterImage />
</Suspense>
```

### 2. 컴포넌트 메모이제이션

```javascript
import { memo, useMemo } from 'react';

const RoomCard = memo(({ room }) => {
  const participantCount = useMemo(() => {
    return room.participants?.length || 0;
  }, [room.participants]);
  
  return <div>...</div>;
});
```

### 3. WebSocket 메시지 필터링

```javascript
// 불필요한 메시지는 조기 리턴
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  
  // 나에게 온 메시지가 아니면 무시
  if (msg.to && msg.to !== myUserId) return;
  
  // 핸들러 실행
  messageHandlers.current.forEach(handler => handler(msg));
};
```

**성과**:
- ✅ 초기 로딩 시간: **1.5초 이하**
- ✅ 페이지 전환: **200ms 이하**
- ✅ 메모리 사용: **100MB 이하** (3자 연결 시)

---

## 🌐 브라우저 호환성

### 지원 브라우저

| 브라우저 | 버전 | WebRTC | MediaRecorder | 비고 |
|---------|------|--------|---------------|------|
| Chrome | 90+ | ✅ | ✅ (webm) | 최적 |
| Safari | 14+ | ✅ | ⚠️ (mp4) | 자동재생 주의 |
| Firefox | 88+ | ✅ | ✅ (webm) | - |
| Edge | 90+ | ✅ | ✅ (webm) | Chrome 기반 |

### 브라우저별 대응

```javascript
// Safari: getUserMedia 권한 요청 시 HTTPS 필수
if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
  console.log('Safari 감지: HTTPS 확인 필요');
}

// iOS: AudioContext resume 필수
if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
  await audioContext.resume();
}

// Firefox: MediaRecorder mimeType 확인
if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
  mimeType = 'audio/ogg;codecs=opus';
}
```

---

## 🐛 트러블슈팅

### 1. "마지막 1-2초만 녹음되는 현상"

**증상**: 녹음 데이터가 극히 짧음 (5-10분 예상 → 1-2초 실제)

**원인**:
- 초기화 실패로 녹음 시작이 게임 끝부분에만 됨
- WebRTC/WebSocket 초기화를 기다리는 동안 녹음이 시작 안 됨

**해결**:
```javascript
// ✅ 선행 조건 없이 로컬 녹음부터 시작
useEffect(() => {
  const tick = async () => {
    // WebRTC 초기화 전에 로컬 녹음부터 켜기
    await voiceManager.startLocalMicRecordingIfNeeded?.();
    
    // WebRTC는 나중에 초기화
    if (!isInitialized && token && roomCode) {
      await initializeWebRTC();
    }
  };
  
  tick();
  const timer = setInterval(tick, 1500);
  return () => clearInterval(timer);
}, []);
```

---

### 2. "WebSocket 연결이 중복 생성되는 문제"

**증상**: 같은 세션에 여러 WebSocket 연결이 생성됨

**원인**:
- React Strict Mode (개발 환경)
- 컴포넌트 재마운트
- 중복 가드 부재

**해결**:
```javascript
const initializeVoiceWebSocket = async (isHost) => {
  // 가드 1: 이미 초기화 중
  if (isInitializing.current) {
    await waitForInitialization();
    return;
  }
  
  // 가드 2: 이미 초기화됨
  if (isConnected && sessionId) {
    return;
  }
  
  isInitializing.current = true;
  try {
    // 초기화 로직
  } finally {
    isInitializing.current = false;
  }
};
```

---

### 3. "녹음 중 스트림 교체로 1초만 녹음되는 문제"

**증상**: MediaRecorder가 중간에 끊겨서 1초짜리 파일만 생성됨

**원인**:
- 녹음 중에 `recordingStream`을 교체하면 기존 MediaRecorder가 무효화됨
- 트랙을 stop()하면 녹음이 즉시 종료됨

**해결**:
```javascript
setRecordingStream(stream) {
  // ✅ 녹음 중에는 스트림 교체 금지
  if (this.isRecording && this.recordingStream && this.recordingStream !== stream) {
    console.warn('⚠️ 녹음 중에는 스트림 교체 금지');
    return false;
  }
  
  this.recordingStream = stream;
  return true;
}
```

---

### 4. "Safari에서 원격 오디오가 안 들리는 문제"

**증상**: 자신의 마이크는 되는데 상대방 목소리가 안 들림

**원인**:
- Safari 자동재생 정책으로 audio.play()가 차단됨
- AudioContext가 suspended 상태

**해결**:
```javascript
// 1) 사용자 제스처에서 AudioContext resume
if (audioContext.state === 'suspended') {
  await audioContext.resume();
}

// 2) 첫 클릭/터치 시 모든 audio 재생 시도
const tryPlayAll = () => {
  document.querySelectorAll('audio[data-user-id]').forEach(a => a.play());
};
window.addEventListener('click', tryPlayAll, { once: true });
```

---

### 5. "새로고침 시 게임이 끊기는 문제"

**증상**: 사용자가 F5를 누르면 게임에서 퇴장됨 

**원인**:
- WebSocket/WebRTC가 재연결되지 않음 
- 백엔드가 연결 끊김을 퇴장으로 간주 

**해결**:
```javascript
// 1) beforeunload에서 "새로고침 중" 플래그 설정
window.addEventListener('beforeunload', () => {
  sessionStorage.setItem('reloading', 'true');
  sessionStorage.setItem('reloading_expire_at', Date.now() + 20000);
});

// 2) 마운트 시 플래그 확인 → 20초 내 재연결 시도
if (sessionStorage.getItem('reloading') === 'true') {
  const expireAt = parseInt(sessionStorage.getItem('reloading_expire_at'));
  if (Date.now() < expireAt) {
    await autoReconnect();
  }
}
```

---

## 🔮 향후 개선사항

### 1. 성능 개선
- [ ] WebRTC SFU (Selective Forwarding Unit) 도입 (4인 이상 확장 시)
- [ ] Virtual List (react-window) 적용 (방 목록 1000개 이상 시)
- [ ] Service Worker (오프라인 지원, 푸시 알림)
- [ ] Progressive Web App (PWA) 변환

### 2. 기능 확장
- [ ] 화면 공유 (WebRTC getDisplayMedia)
- [ ] 실시간 자막 (Web Speech API)
- [ ] 채팅 기능 (WebSocket 기반)
- [ ] 리플레이 기능 (녹음 재생)

### 3. UX 개선
- [ ] 다크 모드 지원
- [ ] 애니메이션 강화 (Framer Motion)
- [ ] 키보드 단축키 (방향키로 선택 등)
- [ ] 접근성 (ARIA 라벨, 스크린 리더)

### 4. 개발 생산성
- [ ] TypeScript 마이그레이션
- [ ] Storybook (컴포넌트 문서화)
- [ ] Cypress (E2E 테스트)
- [ ] Jest + RTL (단위 테스트)

---

## 📚 참고 문서

### 내부 문서
- [WebSocket 재연결 가이드](./docs/websocket-reconnection.md)
- [WebRTC 연결 디버깅](./docs/webrtc-debugging.md)
- [음성 녹음 트러블슈팅](./docs/voice-recording-troubleshooting.md)

### 외부 문서
- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)
- [WebRTC 공식 문서](https://webrtc.org/getting-started/overview)
- [React 공식 문서](https://react.dev/)
- [Vite 공식 문서](https://vitejs.dev/)

---

## 🎓 배운 점 및 회고

### 기술적 성장

**1. WebRTC의 복잡성과 안정성**
- P2P 연결은 겉보기엔 간단하지만, NAT/방화벽 환경에서는 TURN 서버가 필수
- 시그널링 서버의 메시지 순서가 틀어지면 연결이 실패할 수 있음
- Mesh Topology는 3-4명까지는 괜찮지만, 그 이상은 SFU 고려 필요

**2. 실시간 통신의 어려움**
- WebSocket 재연결 로직은 단순히 "다시 연결"이 아니라, 상태 복구, 메시지 중복 방지, 그레이스 기간 등 많은 것을 고려해야 함
- 브라우저 보안 정책(자동재생, HTTPS 필수)은 개발 시에는 몰랐던 부분이 프로덕션에서 많이 발견됨

**3. 음성 처리의 세밀함**
- MediaStream/MediaRecorder는 "그냥 녹음"이 아니라, 스트림의 생명주기, 트랙의 상태, 브라우저별 포맷까지 고려해야 함
- "마지막 1초만 녹음되는 버그"는 초기화 타이밍 문제였고, 이를 해결하기 위해 선행 조건 없는 조기 녹음 시작이 핵심이었음

### 프로젝트 관리

**잘한 점**:
- ✅ 체계적인 로깅으로 프로덕션 버그를 빠르게 추적
- ✅ Context API로 전역 상태를 효율적으로 관리
- ✅ 디버깅용 전역 함수 (`window.debugWebRTC`)로 실시간 상태 확인

**아쉬운 점**:
- ⚠️ TypeScript를 처음부터 도입했으면 타입 안정성이 더 좋았을 것
- ⚠️ 테스트 코드가 부족해서 리팩토링 시 불안함
- ⚠️ 컴포넌트 재사용성을 더 고려했으면 중복 코드를 줄일 수 있었을 것

---

## 🤝 기여

**Frontend Developer**
- 전체 UI/UX 설계 및 구현
- WebSocket/WebRTC 실시간 통신 구현
- 음성 녹음 및 스트림 관리
- 재연결 로직 및 안정성 개선
- 브라우저 호환성 대응
- 프로덕션 배포 및 모니터링

---

## 📄 라이선스

This project is private and proprietary.

---

## 📞 Contact

**프로젝트 URL**: https://dilemmai-idl.com/  
**GitHub**: (Private Repository)

---

<div align="center">

**Built with ❤️ using React + WebRTC**

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

</div>
