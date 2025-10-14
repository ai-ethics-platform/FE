# AI Ethics Platform — Frontend (FE)

## 프로젝트 개요 (Project Overview)

세 명의 사용자가 같은 방에 입장하여
호스트의 진행에 따라 AI 윤리적 문제를 논의하는
인터랙티브 실시간 웹 서비스 

⸻

### 핵심 기술 (Core Technologies)
	•	 WebSocket — 3명의 유저가 하나의 세션(Room)에 동시 접속
    → 실시간 상태 동기화 및 이벤트 전달
	•	 WebRTC — 3명 간 P2P 오디오 스트리밍
    → 실시간 음성 송수신 및 마이크 상태 관리
	•	 VoiceManager — 녹음/업로드/마이크 제어 통합 관리
	•	 React Context API — WebSocket·WebRTC 상태 공유 및 전역 관리

⸻

### 주요 흐름 

1️⃣ 호스트의 방 생성 및 유저 입장
→ 방 코드를 통해 세 명의 참가자 연결

2️⃣ 대기실 
→ 마이크 테스트 및 준비 완료 상태 표시

3️⃣ 게임 시작 및 토론 진행
	•	 메이트 이미지 선택 및 이름 제출
	•	 개인 동의/비동의 선택
	•	 개인 확신도 선택
	•	 합의 동의/비동의 및 합의 결과에 대한 개인 확신도 선택

4️⃣ 게임 종료 시
→ 미디어 스트림 정리 및 녹음 파일 서버 업로드

5️⃣ 통계 페이지
→ 다른 팀의 선택과 결과를 비교·시각화

⸻
## 실행 방법
1️⃣ 설치
```  npm install ```

2️⃣ 개발 서버 실행
``` npm run dev ```

3️⃣ 배포 빌드
``` npm run build ```
⸻

### 🗂️ 디렉토리 구조
```
src/
├── api/
│   └── axiosInstance.js          # API 통신 모듈 (JWT 토큰 관리 포함)
│
├── components/                   # 공통 UI 컴포넌트
│   └── Expanded/                 # 교사용 편집 툴 컴포넌트
│
├── pages/                        # 게임 단계별 화면 구성 (Game01~Game09 등)
│
├── utils/
│   ├── resolveParagraph.js       # 게임 텍스트 내 matename 동적 치환
│   ├── storage.js                # localStorage 관련 헬퍼
│   └── voiceManager.js           # 음성 세션, 녹음, 업로드 로직
│
├── WebSocketProvider.jsx         # WebSocket 연결 및 세션 관리
└── WebRTCProvider.jsx            # WebRTC P2P 오디오 스트림 관리
```

⸻

### 시스템 동작 흐름 (System Flow)

[방 입장] → [세션 생성/참여] → [WebSocket 연결]
    ↓
[WebRTC 초기화] → [시그널링 교환] → [음성 연결]
    ↓
[Host 진행 → 라운드 전환 → 실시간 동기화]
    ↓
[게임 종료 또는 연결 해제] → [정리 및 업로드]


⸻

### 기술 요약 

| 분류 | 기술 |
|------|-------|
| **Frontend** | React 18, Vite |
| **Realtime Communication** | WebSocket, WebRTC |
| **API** | Axios (JWT 기반 인증) |
| **State Management** | React Context API, useRef, useState |
| **Audio Processing** | MediaRecorder, getUserMedia |
| **Deployment** | Vercel / Custom Server |


⸻
#### 페이지별 주요 역할

| 구분 | 설명 |
|------|------|
| **GameIntro** | WebSocket, WebRTC 초기화 (세션 시작 시점) |
| **SelectHomemate / Matename / Game05_1** | 방장이 넘김 권한을 가진 페이지 |
| **Game01 ~ Game08** | 개인 선택 및 합의 과정 처리 |
| **Create / Editor** | 교사용 편집툴 페이지 |
| **ChatPage** | 교사용 편집툴 내 챗봇 개발 페이지 |
| **Game09** | 통계 페이지 (다른 팀의 선택 비교) |

⸻
#### 디버깅 명령어 (Debug Utilities)

```
명령어	설명
window.debugWebSocket.getState()	WebSocket 상태 확인
window.debugWebRTC.debugConnections()	PeerConnection 상태 출력
window.stopAllOutgoingAudioGlobal()	송신 중인 모든 오디오 트랙 중단
window.terminateWebRTCSession()	세션 종료 및 녹음 업로드 실행
```
⸻

