import React, { useEffect, useMemo, useState } from 'react';
import { useWebSocket } from '../WebSocketProvider';
import { Colors } from './styleConstants';
/**
 * 전역 WebSocket 연결 상태 UI
 * - "재연결 로직"은 Provider가 담당
 * - 사용자는 "지금 끊김/재연결 중/실패"를 알아야 하므로, 페이지별 구현 대신 여기서 일괄 표시
 */
export default function ConnectionStatusOverlay() {
  const {
    isConnected,
    reconnectAttempts,
    maxReconnectAttempts,
    isReloadingGrace,
    reconnect,
    finalizeDisconnection,
    getConnectionStatus,
  } = useWebSocket();

  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const conn = useMemo(() => {
    try {
      return getConnectionStatus?.() || {};
    } catch {
      return {};
    }
  }, [getConnectionStatus, isConnected, reconnectAttempts]);

  // "게임 중"에만 보여주기 위한 가드:
  // - 세션/방 정보가 있거나
  // - 연결을 실제로 시도했거나(join/attempted) 재연결 카운트가 있으면
  const hasGameContext = Boolean(
    localStorage.getItem('room_code') ||
      localStorage.getItem('session_id') ||
      conn?.connectionAttempted ||
      conn?.hasJoinedSession ||
      reconnectAttempts > 0 ||
      isReloadingGrace?.()
  );

  if (!hasGameContext) return null;

  // 연결 정상 + 재연결 중 아님이면 숨김
  const inGrace = Boolean(isReloadingGrace?.());
  const shouldShow = !isConnected && (reconnectAttempts > 0 || conn?.isConnecting || conn?.isInitializing || conn?.hasJoinedSession || inGrace);
  if (!shouldShow) return null;

  const title = !isOnline ? '네트워크 연결이 끊겼어요' : '연결이 끊겨 재연결 중이에요';
  const detail = `재연결 시도: ${Math.max(reconnectAttempts, 1)}/${maxReconnectAttempts ?? 5}`;
  const disabled = Boolean(conn?.isConnecting || conn?.isInitializing);
  const exceeded = typeof maxReconnectAttempts === 'number' && reconnectAttempts >= maxReconnectAttempts;

  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: 'min(720px, calc(100vw - 24px))',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          background: Colors.componentBackground,
          color: Colors.grey07,
          borderRadius: 12,
          padding: '12px 14px',
          boxShadow: '0 10px 24px rgba(211, 190, 190, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
        role="status"
        aria-live="polite"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>{detail}</div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => reconnect?.()}
            disabled={disabled || exceeded}
            style={{
              border: 0,
              borderRadius: 10,
              padding: '10px 12px',
              background: disabled || exceeded ? 'rgba(255,255,255,0.12)' : Colors.brandPrimary,
              color: disabled || exceeded ? Colors.grey07 : Colors.grey01,
              cursor: disabled || exceeded ? 'not-allowed' : 'pointer',
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            {disabled ? '연결 시도 중…' : exceeded ? '재연결 실패' : '지금 다시 시도'}
          </button>

          <button
            type="button"
            onClick={() => finalizeDisconnection?.('연결이 끊겨 게임을 종료합니다. 메인 화면으로 이동합니다.')}
            style={{
              border: `1px solid ${Colors.grey07}`,
              borderRadius: 10,
              padding: '10px 12px',
              background: 'transparent',
              color: Colors.grey07,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            메인으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}


