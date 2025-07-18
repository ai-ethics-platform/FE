// contexts/WebSocketContext.js
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { fetchWithAutoToken } from './utils/fetchWithAutoToken';
import axiosInstance from './api/axiosInstance';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messageHandlers = useRef(new Map());
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = useRef(1000);
  const isInitialized = useRef(false);
  
  // 🔧 누락된 변수들 추가
  const isManuallyDisconnected = useRef(false);
  const reconnectTimer = useRef(null);

  // 메시지 핸들러 등록
  const addMessageHandler = (handlerId, handler) => {
    messageHandlers.current.set(handlerId, handler);
  };

  // 메시지 핸들러 제거
  const removeMessageHandler = (handlerId) => {
    messageHandlers.current.delete(handlerId);
  };

  // 메시지 전송
  const sendMessage = (message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      console.log(' WebSocket 메시지 전송:', message);
      return true;
    } else {
      console.warn(' WebSocket 연결되지 않음. 메시지 전송 실패:', message);
      return false;
    }
  };

  // session_id 발급
  const initializeSession = async () => {
    const roomCode = localStorage.getItem('room_code');
    const nickname = localStorage.getItem('nickname') || "이윤서";
    
    if (!roomCode) {
      console.error(' room_code가 없습니다.');
      return;
    }

    try {
      await fetchWithAutoToken();
      const res = await axiosInstance.post('/voice/sessions', {
        room_code: roomCode,
        nickname: nickname,
      });
      
      const newSessionId = res.data.session_id;
      setSessionId(newSessionId);
      localStorage.setItem('session_id', newSessionId);
      console.log(' session_id 발급됨:', newSessionId);
      
      return newSessionId;
    } catch (err) {
      console.error('session_id 발급 실패:', err);
      throw err;
    }
  };

  // 재연결 스케줄링
  const scheduleReconnect = (currentSessionId) => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }
    
    reconnectTimer.current = setTimeout(() => {
      console.log(`WebSocket 재연결 시도 (${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
      reconnectAttempts.current++;
      reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);
      connect(currentSessionId);
    }, reconnectDelay.current);
  };

  // WebSocket 연결
  const connect = async (currentSessionId) => {
    const accessToken = localStorage.getItem('access_token');
    const nickname = localStorage.getItem('nickname') || "이윤서";
    
    // 이미 연결된 경우 중복 연결 방지
    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket 이미 연결됨');
      return;
    }
    
    // 연결 중인 경우 대기
    if (ws.current?.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket 연결 중...');
      return;
    }

    if (!currentSessionId || !accessToken || !nickname) {
      console.warn(' WebSocket 연결 대기 중: 필요한 정보 없음');
      return;
    }

    try {
      console.log('WebSocket 연결 시도:', currentSessionId);
      const socket = new WebSocket(`wss://dilemmai.org/ws/voice/${currentSessionId}?token=${accessToken}`);
      ws.current = socket;

      socket.onopen = () => {
        console.log(' WebSocket 연결 성공');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        reconnectDelay.current = 1000;
        
        // 재연결 타이머 정리
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
          reconnectTimer.current = null;
        }
      };

      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        console.log('🔔 WebSocket 메시지 수신:', msg);
  
        // 모든 등록된 핸들러에게 메시지 전달
        messageHandlers.current.forEach((handler, handlerId) => {
          try {
            handler(msg);
          } catch (error) {
            console.error(` 메시지 핸들러 에러 (${handlerId}):`, error);
          }
        });
      };

      socket.onerror = (error) => {
        console.error(' WebSocket 에러:', error);
        setIsConnected(false);
      };

      socket.onclose = (event) => {
        console.log(' WebSocket 연결 종료:', event.code, event.reason);
        setIsConnected(false);
        
        // 정상적인 종료가 아니고, 수동으로 해제하지 않은 경우만 재연결
        if (event.code !== 1000 && 
            event.code !== 1001 && 
            !isManuallyDisconnected.current &&
            reconnectAttempts.current < maxReconnectAttempts) {
          
          // 토큰 만료 에러 (1006은 일반적인 비정상 종료)
          if (event.code === 1006) {
            console.log(' 토큰 갱신 후 재연결 시도');
            // 토큰 갱신 시도
            fetchWithAutoToken().then(() => {
              scheduleReconnect(currentSessionId);
            }).catch(() => {
              scheduleReconnect(currentSessionId);
            });
          } else {
            scheduleReconnect(currentSessionId);
          }
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.error('최대 재연결 시도 횟수 초과');
        }
      };

    } catch (error) {
      console.error(' WebSocket 연결 실패:', error);
      setIsConnected(false);
    }
  };

  // 연결 해제
  const disconnect = () => {
    isManuallyDisconnected.current = true;
    
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    
    if (ws.current) {
      ws.current.close(1000, 'Manual disconnect');
      ws.current = null;
    }
    setIsConnected(false);
    messageHandlers.current.clear();
    console.log(' WebSocket 수동으로 연결 해제');
  };

  // 초기화 
  useEffect(() => {
    // StrictMode에서 중복 실행 방지 - 더 엄격한 체크
    if (isInitialized.current) {
      console.log('WebSocket 이미 초기화됨, 스킵');
      return;
    }
    
    console.log(' WebSocket 초기화 시작');
    isInitialized.current = true;
    
    const init = async () => {
      try {
        isManuallyDisconnected.current = false;
        
        // 기존 session_id가 있는지 확인
        let currentSessionId = localStorage.getItem('session_id');
        
        if (!currentSessionId) {
          currentSessionId = await initializeSession();
        } else {
          setSessionId(currentSessionId);
          console.log(' 기존 session_id 사용:', currentSessionId);
        }

        if (currentSessionId) {
          // 약간의 지연을 두고 연결 시도
          setTimeout(() => {
            connect(currentSessionId);
          }, 100); // 지연 시간 단축
        }
      } catch (error) {
        console.error(' WebSocket 초기화 실패:', error);
      }
    };

    init();

    // 컴포넌트 언마운트 시 정리
    return () => {
      console.log('WebSocket 정리 시작');
      // StrictMode에서는 cleanup 시 초기화 플래그를 리셋하지 않음
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close(1000, 'Component unmount');
      }
      ws.current = null;
      setIsConnected(false);
      messageHandlers.current.clear();
    };
  }, []); // 빈 의존성 배열로 한 번만 실행

  // 페이지 이동 시에도 연결 유지를 위한 beforeunload 이벤트
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 브라우저 종료 시에만 연결 해제
      if (ws.current) {
        ws.current.close(1000, 'Page unload');
      }
    };

    // 페이지 가시성 변경 시 처리
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected && sessionId) {
        console.log(' 페이지 활성화, WebSocket 재연결 시도');
        isManuallyDisconnected.current = false;
        connect(sessionId);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected, sessionId]);

  const value = {
    isConnected,
    sessionId,
    sendMessage,
    addMessageHandler,
    removeMessageHandler,
    connect,
    disconnect,
    reconnect: () => connect(sessionId),
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;