# AI Ethics Platform — Frontend (FE)

세 명의 사용자가 같은 방(Room)에 입장해, 호스트의 진행에 따라 **AI 윤리 딜레마를 실시간으로 토론**하는 프론트엔드입니다.

## 문서

- **영어 버전 i18n 개발 인수인계**: `docs/english-version-handover.md`
- **TURN 설정(WebRTC 안정화)**: `docs/turn-setup.md`

## 핵심 기술

- **WebSocket**: 3명의 유저가 하나의 세션에 동시 접속 → 실시간 상태 동기화/이벤트 전달
- **WebRTC**: 3인 P2P 오디오 스트리밍 → 실시간 음성 송수신 및 마이크 상태 관리
- **VoiceManager**: 녹음/업로드/마이크 제어 로직 통합
- **React Context**: WebSocket·WebRTC 상태 공유 및 전역 관리

## 요구사항

- **Node.js**: 18 이상 권장(20 LTS 권장)
- **패키지 매니저**: npm

## 실행 방법

### 설치

```bash
cd FE
npm install
```

### 개발 서버

```bash
npm run dev
```

### 빌드 / 프리뷰 / 린트

```bash
npm run build
npm run preview
npm run lint
```

## 서버 주소(중요)

현재 프론트 코드는 API/웹소켓 주소가 **환경변수가 아닌 코드에 하드코딩**되어 있습니다.

- **HTTP API (Axios)**: 기본 도메인 `https://dilemmai-idl.com`
  - `src/api/axiosInstance.js`의 `API_BASE`
  - 또한 일부 페이지는 axios를 직접 호출하며 URL이 하드코딩되어 있습니다:
    - `src/pages/Login.jsx`
    - `src/pages/Signup02.jsx`
- **WebSocket (Voice)**: `wss://dilemmai-idl.com/ws/voice/...`
  - `src/WebSocketProvider.jsx`
  - `src/useVoiceWebsocket.jsx`
- **WebSocket (Signaling / WebRTC)**: `wss://dilemmai-idl.com/ws/signaling?...`
  - `src/WebRTCProvider.jsx`

로컬/스테이징 백엔드를 붙이려면 위 파일들의 도메인을 프로젝트 환경에 맞게 변경해야 합니다.

## TURN 서버(권장)

STUN만으로는 일부 사용자 네트워크(회사망/특정 공유기/NAT)에서 WebRTC P2P 연결이 실패할 수 있습니다.  
TURN 서버를 준비해두면 실패 케이스를 크게 줄일 수 있습니다.

- 설정 방법: `docs/turn-setup.md`

## 주요 사용자 흐름

- **방 생성/입장**: 호스트가 방을 만들고 방 코드로 참가자 3명이 연결
- **대기실**: 마이크 테스트 및 준비 완료 상태 표시
- **게임/토론 진행**:
  - 메이트 이미지 선택 및 이름 제출
  - 개인 동의/비동의 + 확신도
  - 합의 동의/비동의 + 합의 결과에 대한 개인 확신도
- **종료**: 미디어 스트림 정리 및 녹음 파일 업로드
- **통계**: 팀별 선택/결과 비교 및 시각화

## 시스템 동작 흐름

`[방 입장] → [세션 생성/참여] → [WebSocket 연결] → [WebRTC 초기화/시그널링] → [음성 연결] → [라운드 전환/실시간 동기화] → [종료/업로드]`

## 로직 흐름 (상세)

이 프로젝트는 “실시간”이 크게 2갈래로 나뉩니다.

- **게임/상태 동기화 WebSocket**: `src/WebSocketProvider.jsx` (voice ws라고 되어 있지만 실제로는 앱 전반 메시지를 라우팅)
- **WebRTC 시그널링 WebSocket**: `src/WebRTCProvider.jsx` (offer/answer/candidate 교환)
- **오디오 처리(발화 감지/녹음/업로드)**: `src/utils/voiceManager.js` (WebRTC에서 얻은 로컬 스트림을 기반으로 동작)

### 1) (호스트/참가자) Voice 세션 생성/참여 + WebSocket 연결

`WebSocketProvider.initializeVoiceWebSocket(isHost)`가 한 번에 묶어서 처리합니다.

```txt
UI(방 입장/대기실 등)
  └─ WebSocketProvider.initializeVoiceWebSocket(isHost)
      ├─ initializeVoiceSession(isHost)
      │   ├─ (공통) localStorage.session_id가 있으면 GET /voice/sessions/{id}로 검증 후 재사용
      │   ├─ (호스트) GET /voice/sessions/room/{room_code}로 기존 세션 확인 → 없으면 POST /voice/sessions 생성
      │   └─ (참가자) GET /voice/sessions/room/{room_code}를 최대 10회(2초 간격) 재시도하며 세션 생성 대기
      ├─ joinVoiceSession(sessionId)
      │   └─ POST /voice/sessions/{sessionId}/join (이미 참가 중이면 성공 처리)
      └─ connect(sessionId)
          └─ wss://dilemmai-idl.com/ws/voice/{sessionId}?token=access_token 로 연결
              ├─ onopen: type="init" (user_id, nickname) 전송
              ├─ onmessage: type="ping"이면 즉시 "pong" 응답 (연결 유지/헬스체크)
              └─ 나머지 메시지는 등록된 핸들러(Map)로 브로드캐스트
```

#### 메시지 소비 방식(핵심)

`WebSocketProvider`는 “메시지를 해석해서 상태를 바꾸기”보다, **페이지/컴포넌트가 핸들러를 등록해서 필요한 타입만 처리**하는 구조입니다.

- 등록: `addMessageHandler(handlerId, handlerFn)`
- 해제: `removeMessageHandler(handlerId)`

즉, 실제로 `next_page`, `room_update`, `voice_status_update` 같은 타입별 반응은 “각 페이지/컴포넌트의 핸들러”에 있습니다.

### 2) 새로고침/네트워크 끊김 재연결(그레이스)

`WebSocketProvider`는 재연결을 2겹으로 방어합니다.

- **일반 끊김 재연결**: 최대 5회, 지수 backoff(1s → 2s → 4s … 최대 30s)
- **새로고침 그레이스(20초)**: `sessionStorage.reloading` 플래그가 살아있는 동안 `initializeVoiceWebSocket()`을 2초 간격으로 재시도

연결이 끝내 복구되지 않으면 `finalizeDisconnection()`이 실행되며:

- `POST /rooms/out`(1회) 호출 시도
- WebSocket/타이머/핸들러 정리
- localStorage의 방/세션 관련 키 삭제
- 알림 후 메인(`/`)으로 이동

### 3) WebRTC 초기화 + 시그널링 + P2P 오디오 연결

오디오 연결은 `WebRTCProvider.initializeWebRTC()`를 중심으로 움직입니다.

```txt
UI(GameIntro 등)
  └─ WebRTCProvider.initializeWebRTC()
      ├─ 내 user_id 확보 (/users/me 필요 시 호출) → localStorage.user_id 저장
      ├─ saveRoleUserMapping()
      │   ├─ GET /rooms/code/{room_code}로 참가자 목록 조회
      │   └─ role{1..3}_user_id, myrole_id를 localStorage에 저장
      ├─ getUserMedia({audio})로 masterStream 획득(내 마이크)
      ├─ voiceManager.initializeVoiceSession(masterStream)
      │   ├─ localStorage.session_id 확인 + GET /voice/sessions/{id}로 유효성 검증
      │   ├─ /users/me로 participantId, nickname 세팅
      │   ├─ AudioContext+Analyser로 mic level 분석 시작(발화 감지)
      │   └─ MediaRecorder로 연속 녹음 시작
      └─ connectSignalingWebSocket()
          └─ wss://dilemmai-idl.com/ws/signaling?room_code=...&token=...
              ├─ onopen: {type:"join", peer_id:user_id} 전송
              ├─ peers/join 수신 시 상대에게 offer 생성/전송
              ├─ offer 수신 시 answer 생성/전송
              ├─ candidate 상호 교환
              └─ ontrack: 원격 오디오를 <audio> 엘리먼트로 append하여 재생
```

### 4) 발화 상태 전송(말하는 중/마이크 ON)

`voiceManager.sendVoiceStatusToServer()`는 **HTTP가 아니라 WebSocket으로 상태를 푸시**합니다.

- 전송 경로: `window.webSocketInstance.sendMessage(...)` (전역 WebSocket 인스턴스가 존재해야 함)
- 페이로드 예시(요약): `type: "voice_status_update"`, `data: { user_id, is_mic_on, is_speaking, session_id }`

### 5) 종료 시 정리(녹음 업로드 포함)

종료는 최종적으로 `window.terminateWebRTCSession()`(= `WebRTCProvider`가 전역 export)로 수렴합니다.

```txt
terminateWebRTCSession()
  ├─ voiceManager.stopRecording()로 녹음 blob 확보
  ├─ 로컬 스트림 트랙 stop + VoiceManager disconnect
  ├─ 모든 PeerConnection close + 시그널링 WS close
  ├─ DOM에 붙인 원격 <audio> 엘리먼트 제거
  ├─ (녹음이 있으면) POST /upload_audio (multipart, session_id + file)
  └─ POST /voice/sessions/{session_id}/leave
```

### 참고: `useVoiceWebsocket.jsx`

`src/useVoiceWebsocket.jsx`도 별도의 voice ws 연결을 구현하고 있지만, 현재 구조에서는 `WebSocketProvider`/`WebRTCProvider`가 메인 흐름을 담당합니다.  
새 기능을 붙일 때는 가능하면 Provider 기반 흐름을 우선 확인하는 것을 권장합니다.

## 디렉토리 구조 (요약)

```txt
src/
├── api/
│   └── axiosInstance.js          # API 통신 모듈 (토큰/리프레시 포함)
├── assets/                        # 이미지/리소스
├── components/                    # 공통 UI 컴포넌트
│   └── Expanded/                  # 교사용 편집툴 UI 컴포넌트
├── hooks/                         # WebSocket/WebRTC/타이핑 효과 등 커스텀 훅
├── pages/                         # 화면 단위 페이지(게임 단계, 로그인/회원가입 등)
├── utils/
│   ├── resolveParagraphs.js       # 게임 텍스트 내 변수 치환
│   ├── storage.js                 # localStorage 헬퍼
│   ├── templateparsing.js         # 템플릿 파싱 유틸
│   └── voiceManager.js            # 오디오 세션/녹음/업로드 로직
├── WebSocketProvider.jsx          # WebSocket 연결 및 세션 관리(Context)
└── WebRTCProvider.jsx             # WebRTC P2P 오디오 스트림 관리(Context)
```

## 기술 요약

| 분류 | 기술 |
|---|---|
| **Frontend** | React, Vite |
| **Realtime** | WebSocket, WebRTC |
| **API** | Axios (JWT 기반 인증/리프레시) |
| **State** | React Context, Hooks |
| **Audio** | MediaRecorder, getUserMedia |
| **Deploy** | Vercel (프로젝트 설정에 따라) |

## 페이지별 주요 역할(요약)

| 구분 | 설명 |
|---|---|
| **GameIntro** | WebSocket/WebRTC 초기화(세션 시작 시점) |
| **SelectHomeMate / MateName / Game05_1** | 호스트 중심 진행/넘김 권한 관련 페이지 |
| **Game01 ~ Game08** | 개인 선택 및 합의 과정 처리 |
| **Create / Editor** | 교사용 편집툴 페이지 |
| **ChatPage** | 교사용 편집툴 내 챗봇 개발 페이지 |
| **Game09(Results)** | 통계/결과 시각화 |

## 디버깅 유틸리티

| 명령어 | 설명 |
|---|---|
| `window.debugWebSocket.getState()` | WebSocket 상태 확인 |
| `window.debugWebRTC.debugConnections()` | PeerConnection 상태 출력 |
| `window.stopAllOutgoingAudioGlobal()` | 송신 중인 모든 오디오 트랙 중단 |
| `window.terminateWebRTCSession()` | 세션 종료 및 녹음 업로드 실행 |

