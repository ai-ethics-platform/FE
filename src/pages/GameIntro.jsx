// 커스텀 모드일 때 opening 부분 수정하기
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import gameIntro from '../assets/images/gameintro.png';
import ContentBox4 from '../components/ContentBox4';
import Continue from '../components/Continue';
import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider';
import voiceManager from '../utils/voiceManager';
import { Colors,FontStyles } from '../components/styleConstants';
import { 
  useWebSocketMessage, 
  useWebSocketNavigation, 
  useHostActions 
} from '../hooks/useWebSocketMessage';
import { clearAllLocalStorageKeys } from '../utils/storage';
import axiosInstance from '../api/axiosInstance';
// Localization
import { translations } from '../utils/language/index';


export default function GameIntro() {
  const navigate = useNavigate();
  // Get language setting and translations
  const lang = localStorage.getItem('language') || 'ko';
  // 대문자 GameIntro 키 사용
  const t = translations?.[lang]?.GameIntro || translations['ko']?.GameIntro || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const { isConnected, addMessageHandler, removeMessageHandler, sendMessage, initializeVoiceWebSocket,reconnectAttempts, maxReconnectAttempts  } = useWebSocket();
  
  const { 
    isInitialized: webrtcInitialized, 
    signalingConnected, 
    peerConnections,
    initializeWebRTC,
  } = useWebRTC();

  // 내 음성 세션 상태 (실시간 로컬 상태)
  const [myVoiceSessionStatus, setMyVoiceSessionStatus] = useState({
    isConnected: false,
    isSpeaking: false,
    sessionId: null,
    nickname: null,
    participantId: null,
    micLevel: 0,
    speakingThreshold: 30
  });

  // 상태 관리
  const [voiceInitialized, setVoiceInitialized] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    websocket: false,
    webrtc: false,
    voice: false
  });

  // 호스트 ID와 내 역할 ID
  const [hostId, setHostId] = useState(null);
  const [currentMyRoleId, setCurrentMyRoleId] = useState(null);

  // AI 이름 상태
  const [mateName, setMateName] = useState(localStorage.getItem('mateName') || 'HomeMate');

  // 디버깅을 위한 고유 클라이언트 ID
  const [clientId] = useState(() => {
    const id = Math.random().toString(36).substr(2, 9);
   // console.log(`🔍 [GameIntro] 클라이언트 ID: ${id}`);
    return id;
  });

  // 최신 상태를 참조하기 위한 ref들
  const connectionEstablishedRef = useRef(false);
  const initMessageSentRef = useRef(false);
  const sendMessageRef = useRef(null);
  
  const category = localStorage.getItem('category');
  
  // [수정] 확장형 로직: 모든 언어의 'Autonomous Weapon Systems'를 나열하는 대신,
  // '안드로이드'나 'Android'가 포함되지 않으면 AWS로 간주하는 방식을 사용.
  // (Android는 고유명사라 변형이 적고, AWS는 번역명이 다양할 수 있기 때문)
  const isAndroid = category && (category.includes('안드로이드') || category.toLowerCase().includes('android'));
  const isAWS = !isAndroid;

// Dynamic Text based on Language Pack
const ANDROID_TEXT = t.androidText || '';
const AWS_TEXT = t.awsText || '';
const AWS_TEXT_LEFT = t.awsTextLeft || '';

 const TEACHER_TEXT = 
'👋 안녕하세요! AI 윤리 딜레마 게임에 오신 걸 환영합니다.\n\n' + 
'[ 게임 진행 방법 ]\n'+ 
'여러분은 이제 AI 기술과 관련된 가상 상황에 \n 놓여집니다. 그리고 자신에게 주어진 역할의 인물이 \n 되어 어떤 선택을 할지 결정한 뒤, 친구들과 의견을 \n 나누며 최선의 결론을 합의하게 됩니다.\n\n' 
+'자, 이제 시작해볼까요? '
const isCustomMode = !!localStorage.getItem('code');

 // const fullText = isAWS ? AWS_TEXT : ANDROID_TEXT;
 
 //  교체: 커스텀 모드면 TEACHER_TEXT(또는 언어팩의 커스텀 텍스트), 아니면 기존 로직
 // [수정] 언어팩에 customIntro가 있다면 우선 사용하도록 처리
 const customIntroText = t.customIntro || TEACHER_TEXT;
 const rawFullText = isCustomMode ? customIntroText : (isAWS ? AWS_TEXT : ANDROID_TEXT);

 // 텍스트 내의 {{mateName}}을 실제 이름으로 치환
 const fullText = rawFullText.replaceAll('{{mateName}}', mateName);

  const { isHost, sendNextPage } = useHostActions();
  
  useWebSocketNavigation(navigate, {
    nextPagePath: '/selecthomemate'
  });
  
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  // 로컬스토리지에서 역할 정보 로드
  useEffect(() => {
    const storedHost = localStorage.getItem('host_id');
    const storedMyRole = localStorage.getItem('myrole_id');

    setHostId(storedHost);
    setCurrentMyRoleId(storedMyRole);

    // console.log(`역할 정보 로드:`, {
    //   hostId: storedHost,
    //   myRoleId: storedMyRole,
    // });
  }, [clientId]);

  // 서버에서 AI 이름 동기화
  useEffect(() => {
    if (isCustomMode) return;
    const roomCode = localStorage.getItem('room_code');
    if (!roomCode) return;

    (async () => {
      try {
        const res = await axiosInstance.get('/rooms/ai-name', { params: { room_code: roomCode } });
        if (res.data && res.data.ai_name) {
          setMateName(res.data.ai_name);
          localStorage.setItem('mateName', res.data.ai_name);
        }
      } catch (e) {
        console.error('AI 이름 불러오기 실패', e);
      }
    })();
  }, [isCustomMode]);

  // 내 음성 세션 상태 업데이트 
  useEffect(() => {
    const statusInterval = setInterval(() => {
      const currentStatus = voiceManager.getStatus();
      setMyVoiceSessionStatus(currentStatus);
    }, 100);
    
    return () => clearInterval(statusInterval);
  }, []);

  // init 메시지 전송 함수
  const sendInitMessage = useCallback(() => {
    if (initMessageSentRef.current) {
      console.log(`init 메시지 이미 전송됨`);
      return false;
    }
    
    const userId = localStorage.getItem('user_id');
    const nickname = localStorage.getItem('nickname');
    
    if (!userId || !nickname) {
      console.warn(`사용자 정보가 없어서 init 메시지 전송 불가`);
      return false;
    }
    
    const initMessage = {
      type: "init",
      data: {
        user_id: Number(userId),
        nickname: nickname
      }
    };

    const success = sendMessageRef.current?.(initMessage);
    if (success) {
      initMessageSentRef.current = true;
      console.log(`WebSocket init 메시지 전송 완료:`, initMessage);
      return true;
    } else {
      console.error(`init 메시지 전송 실패`);
      return false;
    }
  }, [clientId]);

  //  1) WebSocket 연결 
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const hostId = localStorage.getItem('host_id');
    const myRoleId = localStorage.getItem('myrole_id');
    
    if (!userId || !hostId || !myRoleId) {
      console.error(`필수 정보 부족:`, { userId, hostId, myRoleId });
      return;
    }

    const isHost = hostId === myRoleId;
    console.log(`WebSocket 연결 시작:`, { userId, myRoleId, hostId, isHost });

    // connection_established 메시지 핸들러 등록
    const handlerId = "connection-established";
    const messageHandler = (message) => {
      if (message.type === 'connection_established') {
        console.log(`connection_established 수신:`, message);
        
        if (!connectionEstablishedRef.current && !initMessageSentRef.current) {
          console.log(`연결완료`);
          connectionEstablishedRef.current = true;
          
          // init 메시지 전송
          const success = sendInitMessage();
          if (success) {
            console.log(` init 메시지 전송 성공`);
          }
        } else {
          console.log(` 연결 확립 재수신 - 이미 처리됨`);
        }
      }
    };
    
    addMessageHandler(handlerId, messageHandler);

    // 재시도 로직 포함한 WebSocket 연결 함수
    const connectWithRetry = async (attempt = 1, maxAttempts = 3) => {
      try {
        await initializeVoiceWebSocket(isHost);
        console.log(` WebSocket 연결 완료 (시도 ${attempt}/${maxAttempts})`);
      } catch (err) {
        console.error(`WebSocket 연결 실패 (시도 ${attempt}/${maxAttempts}):`, err);
        
        if (attempt < maxAttempts) {
          const retryDelay = Math.min(1000 * attempt, 5000);
          console.log(`${retryDelay}ms 후 재시도 (${attempt + 1}/${maxAttempts})`);
          
          setTimeout(() => {
            connectWithRetry(attempt + 1, maxAttempts);
          }, retryDelay);
        } else {
          console.error(`WebSocket 연결 최종 실패 (${maxAttempts}회 시도 완료)`);
        }
      }
    };

    // WebSocket 연결 시작
    connectWithRetry();

    // cleanup에서 핸들러 제거
    return () => {
      removeMessageHandler(handlerId);
    };

  }, [clientId, initializeVoiceWebSocket, addMessageHandler, removeMessageHandler, sendInitMessage]);

  // 🔧 2) WebRTC 초기화 - WebSocket 연결 후
  useEffect(() => {
    if (!webrtcInitialized && isConnected) {
      console.log(` WebRTC 초기화 시작`);
      initializeWebRTC()
        .then(() => {
          console.log(`WebRTC 초기화 완료`);
          setConnectionStatus(prev => ({ ...prev, webrtc: true }));
        })
        .catch(err => {
          console.error(`WebRTC 초기화 실패:`, err);
        });
    }
  }, [webrtcInitialized, isConnected, connectionEstablishedRef.current, initializeWebRTC, clientId]);

  //  3) 음성 세션 초기화 
  const initializeVoice = useCallback(async () => {
    if (voiceInitialized) {
      console.log(`음성이 이미 초기화됨`);
      return;
    }

    const sessionId = localStorage.getItem('session_id');
    if (!connectionEstablishedRef.current || !sessionId || !webrtcInitialized) {
      console.log(`연결 확립, 세션, WebRTC 대기 중 `);
      return;
    }

    try {
      console.log(`음성 세션 초기화 시작`);
          const success = await voiceManager.initializeVoiceSession();
      
      if (success) {
        setVoiceInitialized(true);
        setMicPermissionGranted(true);
        setConnectionStatus(prev => ({ ...prev, voice: true }));
        console.log(`음성 세션 초기화 완료`);
        
        setTimeout(() => {
          voiceManager.startSpeechDetection();
          console.log(`음성 감지 시작 `);
        }, 1000);
        
      } else {
        console.error(`음성 세션 초기화 실패`);
        setMicPermissionGranted(false);
      }
    } catch (err) {
      console.error(`음성 초기화 에러:`, err);
      setMicPermissionGranted(false);
    }
  }, [voiceInitialized, webrtcInitialized, clientId]);

  useEffect(() => {
    if (connectionEstablishedRef.current && webrtcInitialized && !voiceInitialized) {
      console.log(`음성 초기화 조건 충족`);
      const timer = setTimeout(() => {
        initializeVoice();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [connectionEstablishedRef.current, webrtcInitialized, voiceInitialized, initializeVoice, clientId]);

  // 연결 상태 모니터링
  useEffect(() => {
    setConnectionStatus({
      websocket: isConnected,
      webrtc: webrtcInitialized && signalingConnected,
      voice: voiceInitialized && micPermissionGranted
    });
  }, [isConnected, webrtcInitialized, signalingConnected, voiceInitialized, micPermissionGranted]);

  // const handleContinue = useCallback(() => {
  //   console.log(" handleContinue 실행됨");
    
  //   // // 음성 감지 일시중지 (연결은 유지)
  //   // if (voiceInitialized) {
  //   //   try {
  //   //     if (typeof voiceManager.pauseSpeechDetection === 'function') {
  //   //       voiceManager.pauseSpeechDetection();
  //   //       console.log(`음성 감지 일시중지`);
  //   //     } else if (typeof voiceManager.stopSpeechDetection === 'function') {
  //   //       voiceManager.stopSpeechDetection();
  //   //       console.log(`음성 감지 중지`);
  //   //     } else {
  //   //       console.log(`음성 일시중지/중지 함수 없음`);
  //   //     }
  //   //   } catch (err) {
  //   //     console.error( 음성 일시중지 에러:`, err);
  //   //   }
  //   // }
    
  //   //  방장인 경우 next_page 브로드캐스트 전송
  //   if (isHost && connectionEstablishedRef.current) {
  //     console.log(`방장 next_page 브로드캐스트 전송`);
      
  //     const success = sendNextPage();
  //     if (success) {
  //       console.log(`next_page 브로드캐스트 전송 성공`);
  //     } else {
  //       console.error(`next_page 브로드캐스트 전송 실패`);
  //       alert('페이지 이동 신호 전송에 실패했습니다. 다시 시도해주세요.');
  //     }
  //   } else if (!isHost) {
  //     // 방장이 아닌 경우 경고 메시지
  //     console.log(`방장이 아니므로 페이지 이동 불가`);
  //     alert('방장만 페이지를 넘어갈 수 있습니다. ');
  //   } else {
  //     console.log(`WebSocket 연결이 확립되지 않음`);
  //     alert('서버 연결을 확인해주세요.');
  //   }
  // }, [clientId, voiceInitialized, isHost, sendNextPage]);

  const handleContinue = () => {
    if (isCustomMode) {
      navigate('/game01');
    } else {
      navigate('/selecthomemate');
    }
  };

  const debugSpeed = window.location.hostname === 'localhost' ? 0 : 70;

  return (
    <Background bgIndex={2}>

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        <div style={{ position: 'absolute', top: 60, left: 0 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              zIndex: 10,
              alignItems: 'flex-start',
              width: 'fit-content',
              margin: 0,
              padding: 0,
            }}
          >
            <UserProfile
              player="1P"
              isLeader={hostId === '1'}
              isMe={currentMyRoleId === '1'}
              nodescription={true}
                />
            <UserProfile
              player="2P"
              isLeader={hostId === '2'}
              isMe={currentMyRoleId === '2'}
              nodescription={true}
               />
            <UserProfile
              player="3P"
              isLeader={hostId === '3'}
              isMe={currentMyRoleId === '3'}
              nodescription={true}
                />
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80vw',
            maxWidth: 936,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '0 16px',
          }}
        >
        <ContentBox4 
          text={fullText} 
          leftText={isAWS} 
          leftTextContent={isAWS? AWS_TEXT_LEFT : ''} 
          typingSpeed={debugSpeed}
        />
          <div style={{ marginTop: 20 }}>
            <Continue
              width={264}
              height={72}
              onClick={handleContinue}
              label={t.continueBtn || "다음"}
              disabled={!connectionEstablishedRef.current || !webrtcInitialized}
            />
          </div>
        </div>
      </div>
    </Background>
  );
}