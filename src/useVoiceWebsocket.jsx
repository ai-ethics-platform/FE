import { useEffect, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';

export default function useVoiceWebSocket(room_code, onParticipantsUpdate) {
  const ws = useRef(null);

  const connectWebSocket = async () => {
    try {
      // ✅ 게스트의 /users/me가 500일 수 있으므로 localStorage 우선 사용
      const nickname =
        localStorage.getItem('nickname') ||
        (() => {
          const uid = localStorage.getItem('user_id');
          return uid ? `Player_${uid}` : null;
        })();
      const isGuestMode = localStorage.getItem('guest_mode') === 'true';

      let resolvedNickname = nickname;
      if (!resolvedNickname && !isGuestMode) {
        // 게스트가 아닐 때만 /users/me 호출
        try {
          console.log('🔍 useVoiceWebSocket: /users/me 호출 시도...');
          const meRes = await axiosInstance.get('/users/me', { timeout: 5000 });
          resolvedNickname = meRes.data.username;
          console.log('✅ useVoiceWebSocket: /users/me 성공:', resolvedNickname);
        } catch (meErr) {
          const isCorsError = !meErr.response && (meErr.message?.includes('Network Error') || meErr.code === 'ERR_NETWORK');
          if (isCorsError) {
            console.error('❌ useVoiceWebSocket CORS 에러: /users/me', {
              message: meErr.message,
              code: meErr.code,
            });
            console.warn('💡 백엔드 CORS 설정을 확인하세요. 기본값을 사용합니다.');
          } else {
            console.error('❌ useVoiceWebSocket: /users/me 호출 실패:', meErr.response?.status, meErr.response?.data || meErr.message);
          }
          // fallback
          resolvedNickname = 'Player';
        }
      }

      const { data } = await axiosInstance.post('/voice/sessions', {
        room_code,
        nickname: resolvedNickname,
      });

      const session_id = data.session_id;
      const accessToken = localStorage.getItem('access_token');

      ws.current = new WebSocket(
        `wss://dilemmai-idl.com/ws/voice/${session_id}?token=${accessToken}`
      );

      ws.current.onopen = () => {
        console.log(' WebSocket 연결 성공');
      };

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'room_update') {
          onParticipantsUpdate(message.data);
        }
        if (message.type === 'next_page') {

        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket 에러:', error);
      };

      ws.current.onclose = () => {
        console.log(' WebSocket 연결 종료');
      };
    } catch (error) {
      console.error(' WebSocket 연결 실패:', error);
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => ws.current?.close();
  }, [room_code]);

  const sendMessage = (type, data) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type, data }));
    }
  };

  return { sendMessage };
}
