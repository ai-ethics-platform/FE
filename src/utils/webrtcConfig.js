// /src/utils/webrtcConfig.js
export const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
      // 나중에 TURN 서버 정보가 생기면 여기에 추가
    ]
  };
  