import { useEffect, useRef } from 'react';
import { useWebSocket } from '../WebSocketProvider';

// 특정 메시지 타입에 대한 핸들러 등록
export const useWebSocketMessage = (messageType, handler, dependencies = []) => {
  const { addMessageHandler, removeMessageHandler } = useWebSocket();
  const handlerRef = useRef(handler);
  const handlerIdRef = useRef(`${messageType}_${Date.now()}_${Math.random()}`);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler, ...dependencies]);

  useEffect(() => {
    const handlerId = handlerIdRef.current;
    const messageHandler = (message) => {
      if (message.type === messageType) {
        handlerRef.current(message);
      }
    };
    addMessageHandler(handlerId, messageHandler);
    return () => removeMessageHandler(handlerId);
  }, [messageType, addMessageHandler, removeMessageHandler]);
};

// 모든 메시지에 대한 핸들러 등록
export const useWebSocketMessageAll = (handler, dependencies = []) => {
  const { addMessageHandler, removeMessageHandler } = useWebSocket();
  const handlerRef = useRef(handler);
  const handlerIdRef = useRef(`all_${Date.now()}_${Math.random()}`);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler, ...dependencies]);

  useEffect(() => {
    const handlerId = handlerIdRef.current;
    const messageHandler = (message) => handlerRef.current(message);
    addMessageHandler(handlerId, messageHandler);
    return () => removeMessageHandler(handlerId);
  }, [addMessageHandler, removeMessageHandler]);
};

/**
 * 페이지 이동 관련 메시지 처리
 * @param {Function} navigate - useNavigate 훅
 * @param {Object} options
 * @param {string} [options.infoPath] - info 메시지 수신 시 이동할 경로
 * @param {string} [options.nextPagePath] - next_page 메시지 수신 시 이동할 경로
 */
export const useWebSocketNavigation = (
  navigate,
  { infoPath, nextPagePath } = {}
) => {
  useWebSocketMessage(
    "info",
    () => {
      console.log('📨 info 수신 → 페이지 이동');
      if (infoPath) navigate(infoPath);
    },
    [navigate, infoPath]
  );

  useWebSocketMessage(
    "next_page",
    () => {
      console.log('📨 next_page 수신 → 페이지 이동');
      if (nextPagePath) navigate(nextPagePath);
    },
    [navigate, nextPagePath]
  );
};


// 방장 전용 메시지 전송
export const useHostActions = () => {
  const { sendMessage } = useWebSocket();
  const myRoleId = localStorage.getItem('myrole_id');
  const hostId = localStorage.getItem('host_id');
  const isHost = myRoleId === hostId;

  const sendNextPage = () => {
    if (!isHost) {
      alert('⚠️ 방장만 진행할 수 있습니다.');
      return false;
    }
    return sendMessage({ type: "next_page" });
  };

  return { isHost, sendNextPage, sendMessage: isHost ? sendMessage : null };
};

