import { useEffect, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';

/**
 * 웹소켓 베이스 주소를 환경변수에서 가져옵니다.
 */
const WS_BASE = import.meta.env.VITE_WS_BASE_URL || 'wss://dilemmai-idl.com';

export default function useVoiceWebSocket(room_code, onParticipantsUpdate) {
  const ws = useRef(null);

  const connectWebSocket = async () => {
    try {
      
      const meRes = await axiosInstance.get('/users/me');
      const nickname = meRes.data.username;

      const { data } = await axiosInstance.post('/voice/sessions', {
        room_code,
        nickname,
      });

      const session_id = data.session_id;
      const accessToken = localStorage.getItem('access_token');

      // 하드코딩된 주소를 환경변수(WS_BASE) 기반으로 변경
      ws.current = new WebSocket(
        `${WS_BASE}/ws/voice/${session_id}?token=${accessToken}`
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

/**
 * 수정 내용:
 * 1. 상단에 WS_BASE 상수를 선언하여 환경변수 VITE_WS_BASE_URL을 참조하도록 함.
 * 2. WebSocket 생성자 내부의 하드코딩된 'wss://dilemmai-idl.com' 주소를 변수 처리함.
 */