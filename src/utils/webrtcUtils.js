// WebRTC 관련 유틸 함수 모음
// (Fast Refresh 안정성을 위해 Provider 컴포넌트 파일에서 분리)

export function disconnectWebRTCVoice(peerConnectionsMap) {
  if (!peerConnectionsMap) return;
  const iterable = peerConnectionsMap instanceof Map
    ? peerConnectionsMap.values()
    : Object.values(peerConnectionsMap);

  for (const pc of iterable) {
    try {
      pc.getSenders().forEach((s) => {
        if (s.track?.kind === 'audio') s.track.stop();
      });
      pc.close();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }
}





