// WebSocketProvider.jsx - 완성된 버전

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
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
  const isManuallyDisconnected = useRef(false);
  const reconnectTimer = useRef(null);
  
  // 중복 방지 플래그들
  const isJoining = useRef(false);
  const hasJoinedSession = useRef(false);
  const isInitializing = useRef(false);

  const addMessageHandler = (handlerId, handler) => {
    messageHandlers.current.set(handlerId, handler);
  };

  const removeMessageHandler = (handlerId) => {
    messageHandlers.current.delete(handlerId);
  };

  const sendMessage = (message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      console.log('📤 WebSocket 메시지 전송:', message);
      return true;
    } else {
      console.warn('⚠️ WebSocket 연결되지 않음. 메시지 전송 실패:', message);
      return false;
    }
  };

  // 방장 여부에 따른 세션 초기화
  const initializeVoiceSession = async (isHost = false) => {
    try {
      const roomCode = localStorage.getItem('room_code');
      const nickname = localStorage.getItem('nickname');
      
      if (!roomCode) {
        console.error('❌ room_code가 없습니다.');
        return null;
      }

      console.log('🎤 음성 세션 초기화 시작:', { isHost, roomCode, nickname });

      // 기존 세션 ID 확인
      let existingSessionId = localStorage.getItem('session_id');
      
      if (existingSessionId) {
        console.log('📦 기존 음성 세션 사용:', existingSessionId);
        
        // 기존 세션 ID 유효성 확인
        try {
          const verifyResponse = await axiosInstance.get(`/voice/sessions/${existingSessionId}`);
          if (verifyResponse.data && verifyResponse.data.session_id) {
            console.log('✅ 기존 세션 ID 유효성 확인됨:', existingSessionId);
            setSessionId(existingSessionId);
            return existingSessionId;
          }
        } catch (verifyError) {
          console.warn('⚠️ 기존 세션 ID 무효, 새로 생성:', verifyError.response?.data);
          localStorage.removeItem('session_id');
          existingSessionId = null;
        }
      }

      if (isHost) {
        // 방장인 경우: 세션 생성
        console.log('👑 방장이 세션 생성 시작...');
        
        // 먼저 기존 세션이 있는지 확인
        try {
          const existingSessionResponse = await axiosInstance.get(`/voice/sessions/room/${roomCode}`);
          if (existingSessionResponse.data.session_id) {
            const existingSessionId = existingSessionResponse.data.session_id;
            console.log('⚠️ 방장: 이미 세션이 존재함, 기존 세션 사용:', existingSessionId);
            setSessionId(existingSessionId);
            localStorage.setItem('session_id', existingSessionId);
            hasJoinedSession.current = true;
            return existingSessionId;
          }
        } catch (existingError) {
          console.log('👑 방장: 기존 세션 없음, 새로 생성');
        }
        
        console.log('👑 방장이 새 세션 생성 중...');
        
        // 세션 생성 API 호출
        const response = await axiosInstance.post('/voice/sessions', {
          room_code: roomCode,
          nickname: nickname,
        });
        
        console.log('📡 API 응답:', response.data);
        
        if (!response.data || !response.data.session_id) {
          throw new Error(`API 응답에 session_id가 없음: ${JSON.stringify(response.data)}`);
        }
        
        const newSessionId = response.data.session_id;
        
        if (typeof newSessionId !== 'string' || newSessionId.length === 0) {
          throw new Error(`유효하지 않은 session_id 형식: ${newSessionId}`);
        }
        
        setSessionId(newSessionId);
        localStorage.setItem('session_id', newSessionId);
        hasJoinedSession.current = true; // 방장은 자동 참가됨
        
        console.log('✅ 방장 음성 세션 생성 완료:', newSessionId);
        
        // 생성된 세션 검증
        try {
          const verifyResponse = await axiosInstance.get(`/voice/sessions/${newSessionId}`);
          console.log('✅ 생성된 세션 검증 성공:', verifyResponse.data);
        } catch (verifyError) {
          console.error('❌ 생성된 세션 검증 실패:', verifyError);
          throw new Error('세션 생성 후 검증 실패');
        }
        
        return newSessionId;
      } else {
        // 일반 유저인 경우: 기존 세션 ID 조회
        console.log('👥 일반 유저가 기존 세션 조회 중...');
        
        // 재시도 로직 (방장이 세션을 생성할 시간을 기다림)
        let retryCount = 0;
        const maxRetries = 10;
        const retryDelay = 2000; // 2초
        
        while (retryCount < maxRetries) {
          try {
            console.log(`🔄 세션 조회 시도 ${retryCount + 1}/${maxRetries}`);
            
            const sessionsResponse = await axiosInstance.get(`/voice/sessions/room/${roomCode}`);
            console.log('📡 세션 조회 응답:', sessionsResponse.data);
            
            const existingSessionId = sessionsResponse.data.session_id;
            
            if (existingSessionId && typeof existingSessionId === 'string' && existingSessionId.length > 0) {
              console.log('✅ 기존 세션 ID 조회 성공:', existingSessionId);
              
              // 조회한 세션 ID 검증
              const verifyResponse = await axiosInstance.get(`/voice/sessions/${existingSessionId}`);
              console.log('✅ 조회한 세션 검증 성공:', verifyResponse.data);
              
              setSessionId(existingSessionId);
              localStorage.setItem('session_id', existingSessionId);
              console.log('✅ 일반 유저 세션 ID 설정 완료:', existingSessionId);
              return existingSessionId;
            } else {
              console.warn(`⚠️ 유효하지 않은 세션 ID: ${existingSessionId}`);
              throw new Error('유효하지 않은 세션 ID');
            }
            
          } catch (error) {
            retryCount++;
            
            if (error.response?.status === 404) {
              console.log(`📅 세션이 아직 생성되지 않음 (시도 ${retryCount}/${maxRetries}). ${retryDelay/1000}초 후 재시도...`);
            } else {
              console.warn(`⚠️ 세션 조회 실패 (시도 ${retryCount}/${maxRetries}):`, error.response?.data);
            }
            
            if (retryCount >= maxRetries) {
              throw new Error(`세션 조회 최대 재시도 횟수 초과 (${maxRetries}회)`);
            }
            
            // 재시도 대기
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }
      
    } catch (error) {
      console.error('❌ 음성 세션 초기화 실패:', error);
      console.error('❌ 에러 상세:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // 실패 시 localStorage 정리
      localStorage.removeItem('session_id');
      setSessionId(null);
      
      throw error;
    }
  };

  // 세션 참가 로직 (방장은 호출하지 않음)
  const joinVoiceSession = async (sessionId) => {
    if (isJoining.current) {
      console.log('⏳ 이미 참가 시도 중...');
      return hasJoinedSession.current;
    }

    if (hasJoinedSession.current) {
      console.log('✅ 이미 참가 완료됨');
      return true;
    }

    isJoining.current = true;

    try {
      const nickname = localStorage.getItem('nickname');
      
      if (!sessionId || !nickname) {
        throw new Error(`세션 참가 필수 정보 누락: sessionId=${sessionId}, nickname=${nickname}`);
      }
      
      console.log('🚪 음성 세션 join 시도:', { sessionId, nickname });
      
      const joinResponse = await axiosInstance.post(`/voice/sessions/${sessionId}/join`, {
        session_id: sessionId,
        nickname: nickname
      });
      
      console.log('📡 세션 참가 API 응답:', joinResponse.data);
      
      console.log('✅ 음성 세션 참가 완료');
      hasJoinedSession.current = true;
      return true;
      
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message;
      
      if (errorMsg === '이미 참가 중인 음성 세션입니다.') {
        console.warn('⚠️ 이미 참가 중인 세션입니다');
        hasJoinedSession.current = true;
        return true;
      }
      
      console.error('❌ 음성 세션 참가 실패:', {
        message: errorMsg,
        response: error.response?.data,
        status: error.response?.status
      });
      return false;
    } finally {
      isJoining.current = false;
    }
  };

  // 재연결 스케줄링
  const scheduleReconnect = (currentSessionId) => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }
    
    reconnectTimer.current = setTimeout(() => {
      console.log(`🔄 WebSocket 재연결 시도 (${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
      reconnectAttempts.current++;
      reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);
      connect(currentSessionId, true);
    }, reconnectDelay.current);
  };

  // WebSocket 연결
  const connect = async (currentSessionId, isReconnect = false) => {
    const accessToken = localStorage.getItem('access_token');
    
    if (!accessToken || !currentSessionId) {
      console.error('❌ 필수 정보 누락:', { accessToken: !!accessToken, currentSessionId });
      return;
    }

    // 이미 연결된 경우 중복 연결 방지
    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log('⚠️ WebSocket 이미 연결됨');
      return;
    }
    
    // 연결 중인 경우 대기
    if (ws.current?.readyState === WebSocket.CONNECTING) {
      console.log('⏳ WebSocket 연결 중...');
      return;
    }

    try {
      console.log('🔌 WebSocket 연결 시도:', currentSessionId);
      const wsUrl = `wss://dilemmai.org/ws/voice/${currentSessionId}?token=${accessToken}`;
      console.log('🔗 WebSocket URL:', wsUrl.replace(accessToken, 'TOKEN_HIDDEN'));
      
      const socket = new WebSocket(wsUrl);
      ws.current = socket;

      const connectStartTime = Date.now();
      
      const connectionTimeout = setTimeout(() => {
        if (socket.readyState === WebSocket.CONNECTING) {
          console.error('⏰ WebSocket 연결 타임아웃 (10초)');
          socket.close();
        }
      }, 10000);

      socket.onopen = () => {
        clearTimeout(connectionTimeout);
        const connectDuration = Date.now() - connectStartTime;
        console.log(`✅ WebSocket 연결 성공 (${connectDuration}ms)`);
        
        setIsConnected(true);
        reconnectAttempts.current = 0;
        reconnectDelay.current = 1000;
        
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
          reconnectTimer.current = null;
        }

        // // 연결 후 ping 메시지 전송
        // setTimeout(() => {
        //   if (socket.readyState === WebSocket.OPEN) {
        //     try {
        //       socket.send(JSON.stringify({
        //         type: "ping",
        //         timestamp: Date.now(),
        //         client_info: {
        //           user_id: localStorage.getItem('user_id'),
        //           session_id: currentSessionId,
        //           nickname: localStorage.getItem('nickname')
        //         }
        //       }));
        //       console.log('📤 ping 메시지 전송 성공');
        //     } catch (sendError) {
        //       console.error('❌ ping 메시지 전송 실패:', sendError);
        //     }
        //   }
        // }, 1000);
        const initPayload = {
          type: "init",
          data: {
            user_id: Number(localStorage.getItem('user_id')),
            guest_id: null,
            nickname: localStorage.getItem('nickname')
          }
        };
        sendMessage(initPayload);
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.log('📨 WebSocket 메시지 수신:', msg);

          if (msg.type === 'pong') {
            console.log('🏓 pong 응답 수신 - 백엔드와 정상 통신 확인됨');
            return;
          }

          messageHandlers.current.forEach((handler, handlerId) => {
            try {
              handler(msg);
            } catch (error) {
              console.error(`❌ 메시지 핸들러 에러 (${handlerId}):`, error);
            }
          });
        } catch (parseError) {
          console.error('❌ WebSocket 메시지 파싱 실패:', parseError, event.data);
        }
      };

      socket.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error('❌ WebSocket 에러:', error);
        setIsConnected(false);
      };

      socket.onclose = (event) => {
        clearTimeout(connectionTimeout);
        const connectDuration = Date.now() - connectStartTime;
        
        console.log(`🔌 WebSocket 연결 종료 (${connectDuration}ms):`, {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        
        // 종료 코드별 의미
        const closeCodeMeaning = {
          1000: '정상 종료',
          1001: '엔드포인트 종료',
          1002: '프로토콜 에러',
          1003: '지원하지 않는 데이터 타입',
          1006: '비정상 종료 (네트워크 문제)',
          1007: '데이터 형식 오류',
          1008: '정책 위반 (인증 실패 등)',
          1009: '메시지 크기 초과',
          1011: '서버 에러'
        };
        
        console.log(`🔌 종료 코드: ${event.code} - ${closeCodeMeaning[event.code] || '알 수 없는 코드'}`);
        
        setIsConnected(false);
        
        // ws.current 정리
        if (ws.current === socket) {
          ws.current = null;
        }
        
        // 재연결 로직
        if (event.code !== 1000 && 
            event.code !== 1001 && 
            !isManuallyDisconnected.current &&
            reconnectAttempts.current < maxReconnectAttempts) {
          
          console.log('🔄 자동 재연결 스케줄링');
          scheduleReconnect(currentSessionId);
        }
      };

    } catch (error) {
      console.error('❌ WebSocket 연결 실패:', error);
      setIsConnected(false);
    }
  };

  const disconnect = () => {
    isManuallyDisconnected.current = true;
    hasJoinedSession.current = false;
    
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
    console.log('🔌 WebSocket 수동으로 연결 해제');
  };
   
  // 음성 세션 초기화 함수
  const initializeVoiceWebSocket = async (isHost = false) => {
    if (isInitializing.current) {
      console.log('⏳ 이미 WebSocket 초기화 중...');
      return;
    }
    
    if (isConnected && sessionId) {
      console.log('✅ WebSocket 이미 초기화됨');
      return;
    }
    
    isInitializing.current = true;
    
    try {
      console.log('🚀 음성 WebSocket 초기화 시작:', { isHost });
      
      // 1. 세션 생성/조회
      const sid = await initializeVoiceSession(isHost);
      if (!sid) throw new Error('세션 생성/조회 실패');
      
      const joined = await joinVoiceSession(sid);
      // // 2. 세션 참가 (방장이 아닌 경우만)
      // if (!isHost) {
      //   const joined = await joinVoiceSession(sid);
      //   if (!joined) throw new Error('세션 참가 실패');
      // } else {
      //   console.log('👑 방장은 세션 참가 스킵');
      // }
      
      // 3. WebSocket 연결
      await connect(sid);
      
      console.log('✅ 음성 WebSocket 초기화 완료');
    } catch (error) {
      console.error('❌ 음성 WebSocket 초기화 실패:', error);
      
      // 실패 시 상태 정리
      localStorage.removeItem('session_id');
      setSessionId(null);
      hasJoinedSession.current = false;
      
      throw error;
    } finally {
      isInitializing.current = false;
    }
  };

  // 페이지 이벤트 처리
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (ws.current) {
        ws.current.close(1000, 'Page unload');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected && sessionId) {
        console.log('👁️ 페이지 활성화, WebSocket 재연결 시도');
        isManuallyDisconnected.current = false;
        connect(sessionId, true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected, sessionId]);

  // 디버깅용 전역 함수
  useEffect(() => {
    window.debugWebSocket = {
      getState: () => {
        const state = {
          isConnected,
          sessionId,
          hasJoinedSession: hasJoinedSession.current,
          isInitializing: isInitializing.current,
          wsCurrentExists: !!ws.current,
          wsCurrentReadyState: ws.current?.readyState,
          wsCurrentReadyStateText: ws.current ? 
            ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][ws.current.readyState] : 'NULL'
        };
        console.log('🔍 WebSocket 상태:', state);
        return state;
      },
      
      checkConnection: () => {
        if (!ws.current) {
          console.log('❌ WebSocket 객체가 없음');
          return;
        }
        
        const info = {
          readyState: ws.current.readyState,
          readyStateText: ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][ws.current.readyState],
          url: ws.current.url,
          protocol: ws.current.protocol,
          bufferedAmount: ws.current.bufferedAmount
        };
        console.log('🔍 현재 WebSocket 상태:', info);
        return info;
      },
      
      sendPing: () => {
        if (ws.current?.readyState === WebSocket.OPEN) {
          const pingMsg = {
            type: "ping",
            timestamp: Date.now()
          };
          ws.current.send(JSON.stringify(pingMsg));
          console.log('📤 수동 ping 전송:', pingMsg);
        } else {
          console.log('❌ WebSocket이 열려있지 않음');
        }
      },
      
      testBackendApi: async () => {
        const sessionId = localStorage.getItem('session_id');
        if (!sessionId) {
          console.log('❌ 세션 ID가 없음');
          return;
        }
        
        try {
          console.log('🔍 백엔드 API 테스트 시작...');
          
          // 1. 세션 조회
          const sessionResponse = await axiosInstance.get(`/voice/sessions/${sessionId}`);
          console.log('✅ 세션 조회 성공:', sessionResponse.data);
          
          // 2. 사용자 정보 조회  
          const userResponse = await axiosInstance.get('/users/me');
          console.log('✅ 사용자 정보 조회 성공:', userResponse.data);
          
          console.log('✅ 백엔드 API 테스트 완료');
          
        } catch (error) {
          console.error('❌ 백엔드 API 테스트 실패:', error.response?.data);
        }
      },
      
      forceReconnect: () => {
        const sessionId = localStorage.getItem('session_id');
        if (!sessionId) {
          console.error('❌ session_id가 없어서 재연결 불가');
          return;
        }
        
        console.log('🔄 강제 재연결 시도...');
        
        // 기존 연결 정리
        if (ws.current) {
          ws.current.close();
          ws.current = null;
        }
        
        // 재연결
        connect(sessionId, true);
      },
      
      clearSession: () => {
        localStorage.removeItem('session_id');
        setSessionId(null);
        hasJoinedSession.current = false;
        console.log('세션 정보 삭제됨');
      }
    };

    return () => {
      delete window.debugWebSocket;
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
    reconnect: () => connect(sessionId, true),
    initializeVoiceWebSocket,
    initializeVoiceSession,
    joinVoiceSession
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;