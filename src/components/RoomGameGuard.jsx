import { useEffect, useRef, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { isRoomGameReady, prepareRoomGame } from '../utils/roomGame';
import { captureGameContext } from '../utils/posthog';

export default function RoomGameGuard({ children }) {
  useLocation();
  const roomCode = localStorage.getItem('room_code');
  const cachedRoom = useRef(null);
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const needsPreparation = room?.room_code !== roomCode || !isRoomGameReady(room);

  useEffect(() => {
    if (!roomCode || !needsPreparation) return;
    const controller = new AbortController();
    let active = true;
    setError('');
    const run = async () => {
      let currentRoom;
      try {
        currentRoom = cachedRoom.current?.room_code === roomCode ? cachedRoom.current :
          (await axiosInstance.get(`/rooms/code/${encodeURIComponent(roomCode)}`, { signal: controller.signal, timeout: 20000 })).data;
        cachedRoom.current = currentRoom;
        void captureGameContext('room_game_verified', { phase: 'started', room_game_bound: Boolean(currentRoom.custom_game_code) },
          { roomTopic: currentRoom.topic, expectedCode: currentRoom.custom_game_code });
        await prepareRoomGame(currentRoom, async code =>
          (await axiosInstance.get(`/custom-games/${encodeURIComponent(code)}`, { signal: controller.signal, timeout: 20000 })).data);
        if (!active) return;
        setRoom(currentRoom);
        void captureGameContext('room_game_verified', { phase: 'succeeded', room_game_bound: Boolean(currentRoom.custom_game_code) },
          { roomTopic: currentRoom.topic, expectedCode: currentRoom.custom_game_code });
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.detail || err.message || '방의 게임 데이터를 확인하지 못했습니다.');
        void captureGameContext('room_game_verified', { phase: 'failed', status_code: err.response?.status || 0, error_code: err.code || err.name },
          { roomTopic: currentRoom?.topic, expectedCode: currentRoom?.custom_game_code });
      }
    };
    void run();
    return () => { active = false; controller.abort(); };
  }, [roomCode, needsPreparation, retry]);

  if (!roomCode) return <Navigate to="/selectroom" replace />;
  if (error) return <div role="alert">{typeof error === 'string' ? error : '방의 게임 데이터를 확인하지 못했습니다.'}<button onClick={() => {
    cachedRoom.current = null;
    setRetry(value => value + 1);
  }}>다시 시도</button></div>;
  if (needsPreparation) return <div role="status">방의 게임 데이터를 확인하고 있습니다.</div>;
  return children;
}
