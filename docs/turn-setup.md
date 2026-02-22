## TURN 설정(프론트엔드)

이 프로젝트의 WebRTC는 기본적으로 STUN만 사용합니다. STUN만으로도 대부분 동작하지만,
회사망/특정 공유기/NAT 환경에서는 P2P 경로가 막혀 **ICE가 disconnected/failed**가 날 수 있습니다.
이때 TURN(릴레이) 서버가 필요합니다.

### 권장 방식: 백엔드에서 ICE 설정 받기(Twilio TURN)

`WebRTCProvider.jsx`는 WebRTC 초기화 시점에 백엔드의 ICE 설정을 먼저 가져옵니다.

- 엔드포인트: `GET /webrtc/ice-config?token={access_token}`
- 성공 시: 응답의 `iceServers`(STUN + TURN)를 `RTCPeerConnection`에 적용
- 실패 시: 아래 “Vite env 방식” 또는 기본 STUN으로 자동 fallback

로컬/스테이징/프로덕션에서 백엔드 주소가 다르면, 프론트에서 아래를 설정하세요:

```txt
VITE_API_BASE_URL=http://localhost:8000
```

### 프론트에서 필요한 값(Vite env)

Vite에서는 `import.meta.env.VITE_*` 형태로 환경변수를 읽습니다.
아래 3개가 모두 설정되면, 백엔드 ICE 설정을 못 가져오는 경우에도 `WebRTCProvider.jsx`가 TURN을 `iceServers`에 자동으로 추가합니다(보조 수단).

- **VITE_TURN_URLS**: 콤마(,)로 구분된 TURN URL 목록
- **VITE_TURN_USERNAME**: TURN username
- **VITE_TURN_CREDENTIAL**: TURN credential(password)

예시:

```txt
VITE_TURN_URLS=turn:turn.example.com:3478?transport=udp,turn:turn.example.com:3478?transport=tcp,turns:turn.example.com:5349
VITE_TURN_USERNAME=YOUR_TURN_USERNAME
VITE_TURN_CREDENTIAL=YOUR_TURN_CREDENTIAL
```

### 주의

- **절대 TURN credential을 코드에 하드코딩하지 마세요.**
- 배포 환경(Vercel 등)에서는 프로젝트 환경변수로 설정하는 것을 권장합니다.



