import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import axiosInstance from './api/axiosInstance';
import { useNavigate } from 'react-router-dom'; 

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
// 파일 상단 or 하단 utils 영역에 추가
const clearAllLocalStorageKeys = () => {
  const keysToRemove = [
    'myrole_id',
    'host_id',
    'user_id',
    'role1_user_id',
    'role2_user_id',
    'role3_user_id',
    'room_code',
    'category',
    'subtopic',
    'mode',
    // 'access_token',
    // 'refresh_token',
    'mateName',
    'nickname',
    'title',
    'completedTopics',
    'session_id',
    'selectedCharacterIndex',
    'currentRound',
  ];

  keysToRemove.forEach((key) => localStorage.removeItem(key));
  console.warn('🧹 localStorage 초기화 완료 (WebSocket 연결 끊김 시)');
};

export const WebSocketProvider = ({ children }) => {
  const navigate = useNavigate(); 
  const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messageHandlers = useRef(new Map());
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = useRef(1000);
  const isManuallyDisconnected = useRef(false);
  const reconnectTimer = useRef(null);
  const pingIntervalRef = useRef(null);

  // 🔧 중복 방지 플래그들 강화
  const isJoining = useRef(false);
  const hasJoinedSession = useRef(false);
  const isInitializing = useRef(false);
  const connectionAttempted = useRef(false);
  const isConnecting = useRef(false);

  // 🔧 디버깅용 Provider ID
  const [providerId] = useState(() => {
    const id = Math.random().toString(36).substr(2, 6);
    console.log(`🔌 WebSocketProvider ID: ${id}`);
    return id;
  });

  const addMessageHandler = (handlerId, handler) => {
    messageHandlers.current.set(handlerId, handler);
    console.log(`📝 [${providerId}] 핸들러 등록: ${handlerId} (총 ${messageHandlers.current.size}개)`);
  };

  const removeMessageHandler = (handlerId) => {
    const removed = messageHandlers.current.delete(handlerId);
    if (removed) {
      console.log(`🗑️ [${providerId}] 핸들러 제거: ${handlerId} (남은 ${messageHandlers.current.size}개)`);
    }
  };
  const sendMessage = (message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      console.log(`📤 [${providerId}] WebSocket 메시지 전송:`, message);
      return true;
    } else {
      console.warn(`⚠️ [${providerId}] WebSocket 연결되지 않음. 메시지 전송 실패:`, message);
      clearAllLocalStorageKeys();
      alert('게임이 초기화되었습니다.');
      navigate('/');
      return false;
    }
  };

  // 방장 여부에 따른 세션 초기화
  const initializeVoiceSession = async (isHost = false) => {
    try {
      const roomCode = localStorage.getItem('room_code');
      const nickname = localStorage.getItem('nickname');
      
      if (!roomCode) {
        console.error(`❌ [${providerId}] room_code가 없습니다.`);
        return null;
      }

      console.log(`🎤 [${providerId}] 음성 세션 초기화 시작:`, { isHost, roomCode, nickname });

      // 기존 세션 ID 확인
      let existingSessionId = localStorage.getItem('session_id');
      
      if (existingSessionId) {
        console.log(`📦 [${providerId}] 기존 음성 세션 사용:`, existingSessionId);
        
        // 기존 세션 ID 유효성 확인
        try {
          const verifyResponse = await axiosInstance.get(`/voice/sessions/${existingSessionId}`);
          if (verifyResponse.data && verifyResponse.data.session_id) {
            console.log(`✅ [${providerId}] 기존 세션 ID 유효성 확인됨:`, existingSessionId);
            setSessionId(existingSessionId);
            return existingSessionId;
          }
        } catch (verifyError) {
          console.warn(`⚠️ [${providerId}] 기존 세션 ID 무효, 새로 생성:`, verifyError.response?.data);
          localStorage.removeItem('session_id');
          existingSessionId = null;
        }
      }

      if (isHost) {
        // 방장인 경우: 세션 생성
        console.log(`👑 [${providerId}] 방장이 세션 생성 시작...`);
        
        // 먼저 기존 세션이 있는지 확인
        try {
          const existingSessionResponse = await axiosInstance.get(`/voice/sessions/room/${roomCode}`);
          if (existingSessionResponse.data.session_id) {
            const existingSessionId = existingSessionResponse.data.session_id;
            console.log(`⚠️ [${providerId}] 방장: 이미 세션이 존재함, 기존 세션 사용:`, existingSessionId);
            setSessionId(existingSessionId);
            localStorage.setItem('session_id', existingSessionId);
            hasJoinedSession.current = true;
            return existingSessionId;
          }
        } catch (existingError) {
          console.log(`👑 [${providerId}] 방장: 기존 세션 없음, 새로 생성`);
        }
        
        console.log(`👑 [${providerId}] 방장이 새 세션 생성 중...`);
        
        // 세션 생성 API 호출
        const response = await axiosInstance.post('/voice/sessions', {
          room_code: roomCode,
          nickname: nickname,
        });
        
        console.log(`📡 [${providerId}] API 응답:`, response.data);
        
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
        
        console.log(`✅ [${providerId}] 방장 음성 세션 생성 완료:`, newSessionId);
        
        // 생성된 세션 검증
        try {
          const verifyResponse = await axiosInstance.get(`/voice/sessions/${newSessionId}`);
          console.log(`✅ [${providerId}] 생성된 세션 검증 성공:`, verifyResponse.data);
        } catch (verifyError) {
          console.error(`❌ [${providerId}] 생성된 세션 검증 실패:`, verifyError);
          throw new Error('세션 생성 후 검증 실패');
        }
        
        return newSessionId;
      } else {
        // 일반 유저인 경우: 기존 세션 ID 조회
        console.log(`👥 [${providerId}] 일반 유저가 기존 세션 조회 중...`);
        
        // 재시도 로직 (방장이 세션을 생성할 시간을 기다림)
        let retryCount = 0;
        const maxRetries = 10;
        const retryDelay = 2000; // 2초
        
        while (retryCount < maxRetries) {
          try {
            console.log(`🔄 [${providerId}] 세션 조회 시도 ${retryCount + 1}/${maxRetries}`);
            
            const sessionsResponse = await axiosInstance.get(`/voice/sessions/room/${roomCode}`);
            console.log(`📡 [${providerId}] 세션 조회 응답:`, sessionsResponse.data);
            
            const existingSessionId = sessionsResponse.data.session_id;
            
            if (existingSessionId && typeof existingSessionId === 'string' && existingSessionId.length > 0) {
              console.log(`✅ [${providerId}] 기존 세션 ID 조회 성공:`, existingSessionId);
              
              // 조회한 세션 ID 검증
              const verifyResponse = await axiosInstance.get(`/voice/sessions/${existingSessionId}`);
              console.log(`✅ [${providerId}] 조회한 세션 검증 성공:`, verifyResponse.data);
              
              setSessionId(existingSessionId);
              localStorage.setItem('session_id', existingSessionId);
              console.log(`✅ [${providerId}] 일반 유저 세션 ID 설정 완료:`, existingSessionId);
              return existingSessionId;
            } else {
              console.warn(`⚠️ [${providerId}] 유효하지 않은 세션 ID:`, existingSessionId);
              throw new Error('유효하지 않은 세션 ID');
            }
            
          } catch (error) {
            retryCount++;
            
            if (error.response?.status === 404) {
              console.log(`📅 [${providerId}] 세션이 아직 생성되지 않음 (시도 ${retryCount}/${maxRetries}). ${retryDelay/1000}초 후 재시도...`);
            } else {
              console.warn(`⚠️ [${providerId}] 세션 조회 실패 (시도 ${retryCount}/${maxRetries}):`, error.response?.data);
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
      console.error(`❌ [${providerId}] 음성 세션 초기화 실패:`, error);
      console.error(`❌ [${providerId}] 에러 상세:`, {
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

  // 🔧 세션 참가 로직 중복 방지 강화
  const joinVoiceSession = async (sessionId) => {
    // 🔧 가드 1: 이미 참가 시도 중이면 대기
    if (isJoining.current) {
      console.log(`⏳ [${providerId}] 이미 참가 시도 중... 대기`);
      // 참가 완료까지 대기 (최대 10초)
      let waitCount = 0;
      while (isJoining.current && waitCount < 50) {
        await new Promise(resolve => setTimeout(resolve, 200));
        waitCount++;
      }
      return hasJoinedSession.current;
    }

    // 🔧 가드 2: 이미 참가 완료됨
    if (hasJoinedSession.current) {
      console.log(`✅ [${providerId}] 이미 참가 완료됨`);
      return true;
    }

    isJoining.current = true;

    try {
      const nickname = localStorage.getItem('nickname');
      
      if (!sessionId || !nickname) {
        throw new Error(`세션 참가 필수 정보 누락: sessionId=${sessionId}, nickname=${nickname}`);
      }
      
      console.log(`🚪 [${providerId}] 음성 세션 join 시도:`, { sessionId, nickname });
      
      const joinResponse = await axiosInstance.post(`/voice/sessions/${sessionId}/join`, {
        session_id: sessionId,
        nickname: nickname
      });
      
      console.log(`📡 [${providerId}] 세션 참가 API 응답:`, joinResponse.data);
      
      console.log(`✅ [${providerId}] 음성 세션 참가 완료`);
      hasJoinedSession.current = true;
      return true;
      
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message;
      
      if (errorMsg === '이미 참가 중인 음성 세션입니다.') {
        console.warn(`⚠️ [${providerId}] 이미 참가 중인 세션입니다`);
        hasJoinedSession.current = true;
        return true;
      }
      
      console.error(`❌ [${providerId}] 음성 세션 참가 실패:`, {
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
     // ① 최대 재시도 횟수 초과 시 중단
  if (reconnectAttempts.current >= maxReconnectAttempts) {
    console.error(`🚫 [${providerId}] 최대 재연결 시도 횟수(${maxReconnectAttempts}) 도달, 더 이상 재연결하지 않습니다.`);
    return;
  }

    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }
    
    reconnectTimer.current = setTimeout(() => {
      console.log(`🔄 [${providerId}] WebSocket 재연결 시도 (${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
      reconnectAttempts.current++;
      reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);
      connect(currentSessionId, true);
    }, reconnectDelay.current);
  };

  // 🔧 WebSocket 연결 중복 방지 강화
  const connect = async (currentSessionId, isReconnect = false) => {
    // 🔧 가드 1: 이미 연결된 경우
    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log(`⚠️ [${providerId}] WebSocket 이미 연결됨`);
      return;
    }
    
    // 🔧 가드 2: 연결 시도 중인 경우
    if (isConnecting.current || ws.current?.readyState === WebSocket.CONNECTING) {
      console.log(`⏳ [${providerId}] WebSocket 연결 시도 중... 대기`);
      return;
    }

    // 🔧 가드 3: 한 번만 시도 (재연결이 아닌 경우)
    if (!isReconnect && connectionAttempted.current) {
      console.log(`⚠️ [${providerId}] WebSocket 연결이 이미 시도됨, 스킵`);
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    
    if (!accessToken || !currentSessionId) {
      console.error(`❌ [${providerId}] 필수 정보 누락:`, { accessToken: !!accessToken, currentSessionId });
      return;
    }

    isConnecting.current = true;
    if (!isReconnect) {
      connectionAttempted.current = true;
    }

    try {
      console.log(`🔌 [${providerId}] WebSocket 연결 시도:`, currentSessionId);
      const wsUrl = `wss://dilemmai.org/ws/voice/${currentSessionId}?token=${accessToken}`;
      console.log(`🔗 [${providerId}] WebSocket URL:`, wsUrl.replace(accessToken, 'TOKEN_HIDDEN'));
      
      const socket = new WebSocket(wsUrl);
      ws.current = socket;

      const connectStartTime = Date.now();
      
      const connectionTimeout = setTimeout(() => {
        if (socket.readyState === WebSocket.CONNECTING) {
          console.error(`⏰ [${providerId}] WebSocket 연결 타임아웃 (10초)`);
          socket.close();
          
          // 🔧 타임아웃 시 플래그 리셋
          isConnecting.current = false;
          if (!isReconnect) {
            connectionAttempted.current = false;
          }
        }
      }, 10000);

      socket.onopen = () => {
        clearTimeout(connectionTimeout);
        isConnecting.current = false;
        
        const connectDuration = Date.now() - connectStartTime;
        console.log(`✅ [${providerId}] WebSocket 연결 성공 (${connectDuration}ms)`);
        
        setIsConnected(true);
        reconnectAttempts.current = 0;
        reconnectDelay.current = 1000;
        
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
          reconnectTimer.current = null;
        }

        // 연결 후 init 메시지 전송
        const initPayload = {
          type: "init",
          data: {
            user_id: Number(localStorage.getItem('user_id')),
            nickname: localStorage.getItem('nickname')
          }
        };
        sendMessage(initPayload);
        pingIntervalRef.current = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'ping' }));
            console.log(`🏓 ping 전송`);
          }
        }, 30000);
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.log(`📨 [${providerId}] WebSocket 메시지 수신:`, msg);

          if (msg.type === 'pong') {
            console.log(`🏓 [${providerId}] pong 응답 수신 - 백엔드와 정상 통신 확인됨`);
            return;
          }

          messageHandlers.current.forEach((handler, handlerId) => {
            try {
              handler(msg);
            } catch (error) {
              console.error(`❌ [${providerId}] 메시지 핸들러 에러 (${handlerId}):`, error);
            }
          });
        } catch (parseError) {
          console.error(`❌ [${providerId}] WebSocket 메시지 파싱 실패:`, parseError, event.data);
        }
      };

      socket.onerror = (error) => {
        clearTimeout(connectionTimeout);
        isConnecting.current = false;
        
        // 🔧 에러 시 플래그 리셋 (재시도 가능하게)
        if (!isReconnect) {
          connectionAttempted.current = false;
        }
        
        console.error(`❌ [${providerId}] WebSocket 에러:`, error);
        setIsConnected(false);
      };

      socket.onclose = (event) => {
        // clearTimeout(connectionTimeout);
        // isConnecting.current = false;
        
        // const connectDuration = Date.now() - connectStartTime;
        
        // console.log(`🔌 [${providerId}] WebSocket 연결 종료 (${connectDuration}ms):`, {
        //   code: event.code,
        //   reason: event.reason,
        //   wasClean: event.wasClean

        socket.onclose = async (event) => {
          if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
          }
          // ✅ 조건: 정상 종료가 아니고, 수동 종료가 아님
          const shouldReconnect =
            event.code !== 1000 &&
            event.code !== 1001 &&
            !isManuallyDisconnected.current &&
            reconnectAttempts.current < maxReconnectAttempts;
        
          if (shouldReconnect) {
            console.log(`🔄 [${providerId}] 자동 재연결 시도`);
            
            try {
              await connect(currentSessionId, true);  // → 여기서 reconnect
              console.log(`✅ [${providerId}] 재연결 성공`);
              return; // 여기서 성공하면 localStorage 삭제 안함
            } catch (reconnectError) {
              console.error(`❌ [${providerId}] 재연결 실패`, reconnectError);
            }
          }
        
          // 🔻 재연결 실패 또는 수동 종료 → 이때만 초기화
          console.warn('🧹 로컬 상태 초기화');
          clearAllLocalStorageKeys();
          alert('게임이 종료되어 메인 화면으로 이동합니다. ');
          navigate('/');
        };
        
        
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
        
        console.log(`🔌 [${providerId}] 종료 코드: ${event.code} - ${closeCodeMeaning[event.code] || '알 수 없는 코드'}`);
        
        setIsConnected(false);
        clearAllLocalStorageKeys();
        alert('게임이 종료되어 메인 화면으로 이동합니다.');
        navigate('/');

        // ws.current 정리
        if (ws.current === socket) {
          ws.current = null;
        }
        
        // 🔧 비정상 종료 시 플래그 리셋
        if (event.code !== 1000 && event.code !== 1001) {
          connectionAttempted.current = false;
          console.log(`🔄 [${providerId}] 비정상 종료로 인한 연결 플래그 리셋`);
        }
        
        // 재연결 로직
        if (event.code !== 1000 && 
            event.code !== 1001 && 
            !isManuallyDisconnected.current &&
            reconnectAttempts.current < maxReconnectAttempts) {
          
          console.log(`🔄 [${providerId}] 자동 재연결 스케줄링`);
          scheduleReconnect(currentSessionId);
        }
      };

    } catch (error) {
      isConnecting.current = false;
      if (!isReconnect) {
        connectionAttempted.current = false;
      }
      
      console.error(`❌ [${providerId}] WebSocket 연결 실패:`, error);
       
      setIsConnected(false);
      clearAllLocalStorageKeys();
      alert('게임이 종료되어 메인 화면으로 이동합니다.');
      navigate('/');

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
    console.log(`🔌 [${providerId}] WebSocket 수동으로 연결 해제`);
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  };
   
  // 🔧 음성 세션 초기화 함수 중복 방지 강화
  const initializeVoiceWebSocket = async (isHost = false) => {
    // 🔧 가드 1: 이미 초기화 중
    if (isInitializing.current) {
      console.log(`⏳ [${providerId}] 이미 WebSocket 초기화 중... 대기`);
      
      // 초기화 완료까지 대기 (최대 30초)
      let waitCount = 0;
      while (isInitializing.current && waitCount < 150) {
        await new Promise(resolve => setTimeout(resolve, 200));
        waitCount++;
      }
      
      if (isConnected && sessionId) {
        console.log(`✅ [${providerId}] 대기 후 초기화 완료 확인됨`);
        return;
      }
    }
    
    // 🔧 가드 2: 이미 초기화됨
    if (isConnected && sessionId) {
      console.log(`✅ [${providerId}] WebSocket 이미 초기화됨`);
      return;
    }
    
    isInitializing.current = true;
    
    try {
      console.log(`🚀 [${providerId}] 음성 WebSocket 초기화 시작:`, { isHost });
      
      // 1. 세션 생성/조회
      const sid = await initializeVoiceSession(isHost);
      if (!sid) throw new Error('세션 생성/조회 실패');
      
      // 2. 세션 참가
      const joined = await joinVoiceSession(sid);
      if (!joined) throw new Error('세션 참가 실패');
      
      // 3. WebSocket 연결
      await connect(sid);
      
      console.log(`✅ [${providerId}] 음성 WebSocket 초기화 완료`);
    } catch (error) {
      console.error(`❌ [${providerId}] 음성 WebSocket 초기화 실패:`, error);
      
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
        console.log(`👁️ [${providerId}] 페이지 활성화, WebSocket 재연결 시도`);
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

  // 🔧 디버깅용 전역 함수 강화
  useEffect(() => {
    window.debugWebSocket = {
      getState: () => {
        const state = {
          providerId,
          isConnected,
          sessionId,
          hasJoinedSession: hasJoinedSession.current,
          isInitializing: isInitializing.current,
          isJoining: isJoining.current,
          isConnecting: isConnecting.current,
          connectionAttempted: connectionAttempted.current,
          wsCurrentExists: !!ws.current,
          wsCurrentReadyState: ws.current?.readyState,
          wsCurrentReadyStateText: ws.current ? 
            ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][ws.current.readyState] : 'NULL',
          handlersCount: messageHandlers.current.size
        };
        console.log(`🔍 [${providerId}] WebSocket 상태:`, state);
        return state;
      },
      
      resetAllFlags: () => {
        console.log(`🔄 [${providerId}] 모든 플래그 리셋`);
        isInitializing.current = false;
        isJoining.current = false;
        isConnecting.current = false;
        connectionAttempted.current = false;
        hasJoinedSession.current = false;
        
        return { success: true, message: '모든 플래그가 리셋되었습니다.' };
      },
      
      forceReconnect: async () => {
        const sessionId = localStorage.getItem('session_id');
        if (!sessionId) {
          console.error(`❌ [${providerId}] session_id가 없어서 재연결 불가`);
          return { success: false, error: 'session_id 없음' };
        }
        
        try {
          console.log(`🔄 [${providerId}] 강제 재연결 시도...`);
          
          // 기존 연결 정리
          if (ws.current) {
            ws.current.close();
            ws.current = null;
          }
          
          // 플래그 리셋
          isConnecting.current = false;
          connectionAttempted.current = false;
          setIsConnected(false);
          
          // 잠시 대기 후 재연결
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 재연결
          await connect(sessionId, true);
          
          return { success: true, message: '재연결이 완료되었습니다.' };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      
      clearSession: () => {
        localStorage.removeItem('session_id');
        setSessionId(null);
        hasJoinedSession.current = false;
        isInitializing.current = false;
        isJoining.current = false;
        console.log(`🧹 [${providerId}] 세션 정보 삭제됨`);
        
        return { success: true, message: '세션 정보가 삭제되었습니다.' };
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
    joinVoiceSession,
    
    // 🔧 디버깅용 함수들 추가
    getConnectionStatus: () => ({
      providerId,
      isConnected,
      sessionId,
      isInitializing: isInitializing.current,
      isJoining: isJoining.current,
      isConnecting: isConnecting.current,
      connectionAttempted: connectionAttempted.current,
      hasJoinedSession: hasJoinedSession.current
    })
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
