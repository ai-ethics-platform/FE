// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Background from '../components/Background';
// import UserProfile from '../components/Userprofile';
// import gameIntro from '../assets/images/gameintro.png';
// import ContentBox2 from '../components/ContentBox2';
// import Continue from '../components/Continue';
// import { useWebSocket } from '../WebSocketProvider';
// import { useWebRTC } from '../WebRTCProvider';
// import voiceManager from '../utils/voiceManager';
// import { Colors,FontStyles } from '../components/styleConstants';
// import { 
//   useWebSocketMessage, 
//   useWebSocketNavigation, 
//   useHostActions 
// } from '../hooks/useWebSocketMessage';


// export default function GameIntro() {
//   const navigate = useNavigate();
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const { isConnected, addMessageHandler, removeMessageHandler, sendMessage, initializeVoiceWebSocket } = useWebSocket();
  
//   const { 
//     isInitialized: webrtcInitialized, 
//     signalingConnected, 
//     peerConnections,
//     initializeWebRTC,
//   } = useWebRTC();

//   // 내 음성 세션 상태 (실시간 로컬 상태)
//   const [myVoiceSessionStatus, setMyVoiceSessionStatus] = useState({
//     isConnected: false,
//     isSpeaking: false,
//     sessionId: null,
//     nickname: null,
//     participantId: null,
//     micLevel: 0,
//     speakingThreshold: 30
//   });

//   // 상태 관리
//   const [voiceInitialized, setVoiceInitialized] = useState(false);
//   const [micPermissionGranted, setMicPermissionGranted] = useState(false);
//   const [connectionStatus, setConnectionStatus] = useState({
//     websocket: false,
//     webrtc: false,
//     voice: false
//   });

//   // 호스트 ID와 내 역할 ID
//   const [hostId, setHostId] = useState(null);
//   const [currentMyRoleId, setCurrentMyRoleId] = useState(null);

//   // 디버깅을 위한 고유 클라이언트 ID
//   const [clientId] = useState(() => {
//     const id = Math.random().toString(36).substr(2, 9);
//     console.log(`🔍 [GameIntro] 클라이언트 ID: ${id}`);
//     return id;
//   });

//   // 최신 상태를 참조하기 위한 ref들
//   const connectionEstablishedRef = useRef(false);
//   const initMessageSentRef = useRef(false);
//   const sendMessageRef = useRef(null);

//   const fullText =
//   `          지금은 20XX년, 국내 최대 로봇 개발사 A가 다기능 돌봄 로봇 HomeMate를 개발했습니다.\n\n` +
//   `    이 로봇의 기능은 아래와 같습니다.\n\n` +
//   `     • 가족의 감정, 건강 상태, 생활 습관 등을 입력하면\n 맞춤형 알림, 식단 제안 등의 서비스를 제공\n\n` +
//   `     • 기타 업데이트 시 정교화된 서비스 추가 가능`;
//   const { isHost, sendNextPage } = useHostActions();
  
//   useWebSocketNavigation(navigate, {
//     nextPagePath: '/selecthomemate'
//   });
//     // useEffect(() => {
//   //   const handlerId = "on-next-page";
//   //   const onMessage = (msg) => {
//   //     if (msg.type === "next_page") {
//   //       console.log(`➡️ [GameIntro-${clientId}] next_page 수신 → 페이지 이동`);
//   //       navigate("/selecthomemate");
//   //     }
//   //   };
  
//   //   addMessageHandler(handlerId, onMessage);
//   //   return () => removeMessageHandler(handlerId);
//   // }, [addMessageHandler, removeMessageHandler, navigate, clientId]);
  
//   useEffect(() => {
//     sendMessageRef.current = sendMessage;
//   }, [sendMessage]);

//   // 로컬스토리지에서 역할 정보 로드
//   useEffect(() => {
//     const storedHost = localStorage.getItem('host_id');
//     const storedMyRole = localStorage.getItem('myrole_id');

//     setHostId(storedHost);
//     setCurrentMyRoleId(storedMyRole);

//     console.log(`역할 정보 로드:`, {
//       hostId: storedHost,
//       myRoleId: storedMyRole,
//     });
//   }, [clientId]);

//   // 내 음성 세션 상태 업데이트 
//   useEffect(() => {
//     const statusInterval = setInterval(() => {
//       const currentStatus = voiceManager.getStatus();
//       setMyVoiceSessionStatus(currentStatus);
//     }, 100);
    
//     return () => clearInterval(statusInterval);
//   }, []);

//   // init 메시지 전송 함수
//   const sendInitMessage = useCallback(() => {
//     if (initMessageSentRef.current) {
//       console.log(`init 메시지 이미 전송됨`);
//       return false;
//     }
    
//     const userId = localStorage.getItem('user_id');
//     const nickname = localStorage.getItem('nickname');
    
//     if (!userId || !nickname) {
//       console.warn(`사용자 정보가 없어서 init 메시지 전송 불가`);
//       return false;
//     }
    
//     const initMessage = {
//       type: "init",
//       data: {
//         user_id: Number(userId),
//         nickname: nickname
//       }
//     };

//     const success = sendMessageRef.current?.(initMessage);
//     if (success) {
//       initMessageSentRef.current = true;
//       console.log(`WebSocket init 메시지 전송 완료:`, initMessage);
//       return true;
//     } else {
//       console.error(`init 메시지 전송 실패`);
//       return false;
//     }
//   }, [clientId]);

//   //  1) WebSocket 연결 
//   useEffect(() => {
//     const userId = localStorage.getItem('user_id');
//     const hostId = localStorage.getItem('host_id');
//     const myRoleId = localStorage.getItem('myrole_id');
    
//     if (!userId || !hostId || !myRoleId) {
//       console.error(`필수 정보 부족:`, { userId, hostId, myRoleId });
//       return;
//     }

//     const isHost = hostId === myRoleId;
//     console.log(`ebSocket 연결 시작:`, { userId, myRoleId, hostId, isHost });

//     // connection_established 메시지 핸들러 등록
//     const handlerId = "connection-established";
//     const messageHandler = (message) => {
//       if (message.type === 'connection_established') {
//         console.log(`connection_established 수신:`, message);
        
//         if (!connectionEstablishedRef.current && !initMessageSentRef.current) {
//           console.log(`연결완료`);
//           connectionEstablishedRef.current = true;
          
//           // init 메시지 전송
//           const success = sendInitMessage();
//           if (success) {
//             console.log(` init 메시지 전송 성공`);
//           }
//         } else {
//           console.log(` 연결 확립 재수신 - 이미 처리됨`);
//         }
//       }
//     };
    
//     addMessageHandler(handlerId, messageHandler);

//     // 재시도 로직 포함한 WebSocket 연결 함수
//     const connectWithRetry = async (attempt = 1, maxAttempts = 3) => {
//       try {
//         await initializeVoiceWebSocket(isHost);
//         console.log(` WebSocket 연결 완료 (시도 ${attempt}/${maxAttempts})`);
//       } catch (err) {
//         console.error(`WebSocket 연결 실패 (시도 ${attempt}/${maxAttempts}):`, err);
        
//         if (attempt < maxAttempts) {
//           const retryDelay = Math.min(1000 * attempt, 5000);
//           console.log(`${retryDelay}ms 후 재시도 (${attempt + 1}/${maxAttempts})`);
          
//           setTimeout(() => {
//             connectWithRetry(attempt + 1, maxAttempts);
//           }, retryDelay);
//         } else {
//           console.error(`WebSocket 연결 최종 실패 (${maxAttempts}회 시도 완료)`);
//         }
//       }
//     };

//     // WebSocket 연결 시작
//     connectWithRetry();

//     // cleanup에서 핸들러 제거
//     return () => {
//       removeMessageHandler(handlerId);
//     };

//   }, [clientId, initializeVoiceWebSocket, addMessageHandler, removeMessageHandler, sendInitMessage]);

//   // 🔧 2) WebRTC 초기화 - WebSocket 연결 후
//   useEffect(() => {
//     if (!webrtcInitialized && isConnected && connectionEstablishedRef.current) {
//       console.log(` WebRTC 초기화 시작`);
//       initializeWebRTC()
//         .then(() => {
//           console.log(`WebRTC 초기화 완료`);
//           setConnectionStatus(prev => ({ ...prev, webrtc: true }));
//         })
//         .catch(err => {
//           console.error(`WebRTC 초기화 실패:`, err);
//         });
//     }
//   }, [webrtcInitialized, isConnected, connectionEstablishedRef.current, initializeWebRTC, clientId]);

//   //  3) 음성 세션 초기화 
//   const initializeVoice = useCallback(async () => {
//     if (voiceInitialized) {
//       console.log(`음성이 이미 초기화됨`);
//       return;
//     }

//     const sessionId = localStorage.getItem('session_id');
//     if (!connectionEstablishedRef.current || !sessionId || !webrtcInitialized) {
//       console.log(`연결 확립, 세션, WebRTC 대기 중 `);
//       return;
//     }

//     try {
//       console.log(`음성 세션 초기화 시작`);
//          const success = await voiceManager.initializeVoiceSession();
      
//       if (success) {
//         setVoiceInitialized(true);
//         setMicPermissionGranted(true);
//         setConnectionStatus(prev => ({ ...prev, voice: true }));
//         console.log(`음성 세션 초기화 완료`);
        
//         setTimeout(() => {
//           voiceManager.startSpeechDetection();
//           console.log(`음성 감지 시작 `);
//         }, 1000);
        
//       } else {
//         console.error(`음성 세션 초기화 실패`);
//         setMicPermissionGranted(false);
//       }
//     } catch (err) {
//       console.error(`음성 초기화 에러:`, err);
//       setMicPermissionGranted(false);
//     }
//   }, [voiceInitialized, webrtcInitialized, clientId]);

//   useEffect(() => {
//     if (connectionEstablishedRef.current && webrtcInitialized && !voiceInitialized) {
//       console.log(`음성 초기화 조건 충족`);
//       const timer = setTimeout(() => {
//         initializeVoice();
//       }, 1000);
      
//       return () => clearTimeout(timer);
//     }
//   }, [connectionEstablishedRef.current, webrtcInitialized, voiceInitialized, initializeVoice, clientId]);

//   // 연결 상태 모니터링
//   useEffect(() => {
//     setConnectionStatus({
//       websocket: isConnected,
//       webrtc: webrtcInitialized && signalingConnected,
//       voice: voiceInitialized && micPermissionGranted
//     });
//   }, [isConnected, webrtcInitialized, signalingConnected, voiceInitialized, micPermissionGranted]);

//   const handleContinue = useCallback(() => {
//     console.log(" handleContinue 실행됨");
    
//     // // 음성 감지 일시중지 (연결은 유지)
//     // if (voiceInitialized) {
//     //   try {
//     //     if (typeof voiceManager.pauseSpeechDetection === 'function') {
//     //       voiceManager.pauseSpeechDetection();
//     //       console.log(`음성 감지 일시중지`);
//     //     } else if (typeof voiceManager.stopSpeechDetection === 'function') {
//     //       voiceManager.stopSpeechDetection();
//     //       console.log(`음성 감지 중지`);
//     //     } else {
//     //       console.log(`음성 일시중지/중지 함수 없음`);
//     //     }
//     //   } catch (err) {
//     //     console.error( 음성 일시중지 에러:`, err);
//     //   }
//     // }
    
//     //  방장인 경우 next_page 브로드캐스트 전송
//     if (isHost && connectionEstablishedRef.current) {
//       console.log(`방장 next_page 브로드캐스트 전송`);
      
//       const success = sendNextPage();
//       if (success) {
//         console.log(`next_page 브로드캐스트 전송 성공`);
//       } else {
//         console.error(`next_page 브로드캐스트 전송 실패`);
//         alert('페이지 이동 신호 전송에 실패했습니다. 다시 시도해주세요.');
//       }
//     } else if (!isHost) {
//       // 방장이 아닌 경우 경고 메시지
//       console.log(`방장이 아니므로 페이지 이동 불가`);
//       alert('방장만 페이지를 넘어갈 수 있습니다. ');
//     } else {
//       console.log(`WebSocket 연결이 확립되지 않음`);
//       alert('서버 연결을 확인해주세요.');
//     }
//   }, [clientId, voiceInitialized, isHost, sendNextPage]);

//   return (
//     <Background bgIndex={2}>
//       {/* 연결 상태 디버깅 정보 */}
//       <div style={{
//         position: 'absolute',
//         top: '10px',
//         right: '10px',
//         background: 'rgba(0,0,0,0.8)',
//         color: 'white',
//         padding: '12px',
//         borderRadius: '6px',
//         fontSize: '11px',
//         zIndex: 1000,
//         maxWidth: '350px',
//         fontFamily: 'monospace'
//       }}>
//         <div style={{color: '#00ff00'}}>🔍 [GameIntro] Client: {clientId}</div>
//         <div style={{color: connectionStatus.websocket ? '#00ff00' : '#ff0000'}}>
//           WebSocket: {connectionStatus.websocket ? '✅' : '❌'} {isConnected ? '(Connected)' : '(Disconnected)'}
//         </div>
//         <div style={{color: connectionStatus.webrtc ? '#00ff00' : '#ff0000'}}>
//           WebRTC: {connectionStatus.webrtc ? '✅' : '❌'} {webrtcInitialized ? '(Init)' : '(Waiting)'}
//         </div>
//         <div style={{color: connectionStatus.voice ? '#00ff00' : '#ff0000'}}>
//           Voice: {connectionStatus.voice ? '✅' : '❌'} {voiceInitialized ? '(Ready)' : '(Waiting)'}
//         </div>
//         <div style={{color: '#00ffff'}}>
//           P2P 연결: {peerConnections.size}/2 ({Array.from(peerConnections.keys()).join(', ')})
//         </div>
//         <div style={{color: signalingConnected ? '#00ff00' : '#ff0000'}}>
//           시그널링: {signalingConnected ? '✅ Connected' : '❌ Disconnected'}
//         </div>
//         <div style={{color: '#ffff00'}}>
//           내 역할: {currentMyRoleId || localStorage.getItem('myrole_id') || 'NULL'}
//         </div>
//         <div style={{color: '#ff00ff'}}>
//           호스트 역할: {hostId || localStorage.getItem('host_id') || 'NULL'}
//         </div>
//         <div style={{color: micPermissionGranted ? '#00ff00' : '#ff0000'}}>
//           마이크 권한: {micPermissionGranted ? 'GRANTED' : 'DENIED'}
//         </div>
//         <div style={{color: '#ffdddd'}}>
//           🔧 voice_status_update 전송 제거됨
//         </div>
//         {/* 🎤 내 음성 상태 (로컬 전용) */}
//          <div style={{color: myVoiceSessionStatus.isSpeaking ? '#00ff00' : '#888888'}}>
//           내 음성: {myVoiceSessionStatus.isSpeaking ? '🗣️ 말하는 중' : '🤐 조용함'}
//         </div>
//       </div>

//       <div
//         style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           width: '100vw',
//           height: '100vh',
//           overflow: 'hidden',
//           zIndex: 0,
//         }}
//       >
//         <div style={{ position: 'absolute', top: 60, left: 0 }}>
//           <div
//             style={{
//               display: 'flex',
//               flexDirection: 'column',
//               gap: 24,
//               alignItems: 'flex-start',
//               width: 'fit-content',
//               margin: 0,
//               padding: 0,
//             }}
//           >
//             <UserProfile
//               player="1P"
//               isLeader={hostId === '1'}
//               isMe={currentMyRoleId === '1'}
//               nodescription={true}
//                 />
//             <UserProfile
//               player="2P"
//               isLeader={hostId === '2'}
//               isMe={currentMyRoleId === '2'}
//               nodescription={true}
//                />
//             <UserProfile
//               player="3P"
//               isLeader={hostId === '3'}
//               isMe={currentMyRoleId === '3'}
//               nodescription={true}
//                 />
//           </div>
//         </div>
//         <div
//           style={{
//             position: 'absolute',
//             top: '50%',
//             left: '50%',
//             transform: 'translate(-50%, -50%)',
//             width: '80vw',
//             maxWidth: 936,
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             padding: '0 16px',
//           }}
//         >
//           <ContentBox2 text={fullText} />
//           <div style={{ marginTop: 20 }}>
//             <Continue
//               width={264}
//               height={72}
//               step={1}
//               onClick={handleContinue}
//             />
//           </div>
//         </div>
//       </div>
//     </Background>
//   );
// } 

// 아예 페이지 이전으로 바꿔야함 통으로! 
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import gameIntro from '../assets/images/gameintro.png';
import ContentBox2 from '../components/ContentBox2';
import Continue from '../components/Continue';
import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider';
import voiceManager from '../utils/voiceManager';
import { Colors,FontStyles } from '../components/styleConstants';
import VoiceToggle from '../components/VoiceToggle';
import { 
  useWebSocketMessage, 
  useWebSocketNavigation, 
  useHostActions 
} from '../hooks/useWebSocketMessage';

export default function GameIntro() {
  const navigate = useNavigate();

  // ✅ clientId 먼저 선언
  const clientId = useRef(Math.random().toString(36).substring(2)).current;

  // ✅ 상태 선언
  const [hostId, setHostId] = useState(null);
  const [currentMyRoleId, setCurrentMyRoleId] = useState(null);

  const [voiceInitialized, setVoiceInitialized] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => localStorage.getItem('voice_enabled') !== 'false');
  const [connectionStatus, setConnectionStatus] = useState({ websocket: false, webrtc: false, voice: false });

  // ref 선언
  const connectionEstablishedRef = useRef(false);
  const initMessageSentRef = useRef(false);
  const sendMessageRef = useRef(null);

  //  웹소켓, WebRTC 관련 훅
  const { isConnected, addMessageHandler, removeMessageHandler, sendMessage, initializeVoiceWebSocket } = useWebSocket();
  const { isInitialized: webrtcInitialized, signalingConnected, initializeWebRTC } = useWebRTC();
  const { isHost } = useHostActions();

  //  메시지 핸들링
  useWebSocketNavigation(navigate, { nextPagePath: '/selecthomemate' });

  //  sendMessage 참조 저장
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  //  역할 정보 로드
  useEffect(() => {
    const storedHost = localStorage.getItem('host_id');
    const storedMyRole = localStorage.getItem('myrole_id');
    setHostId(storedHost);
    setCurrentMyRoleId(storedMyRole);

    console.log(`역할 정보 로드:`, {
      hostId: storedHost,
      myRoleId: storedMyRole,
      clientId,
    });
  }, [clientId]);

  //  init 메시지 전송
  const sendInitMessage = useCallback(() => {
    if (initMessageSentRef.current) return;

    const userId = localStorage.getItem('user_id');
    const nickname = localStorage.getItem('nickname');
    if (!userId || !nickname) return;

    const initMessage = {
      type: 'init',
      data: { user_id: Number(userId), nickname }
    };

    const success = sendMessageRef.current?.(initMessage);
    if (success) initMessageSentRef.current = true;
  }, []);

  //  connection_established → init 메시지 전송
  useEffect(() => {
    const handlerId = 'connection-established';
    const messageHandler = (message) => {
      if (message.type === 'connection_established') {
        if (!connectionEstablishedRef.current && !initMessageSentRef.current) {
          connectionEstablishedRef.current = true;
          sendInitMessage();
        }
      }
    };

    addMessageHandler(handlerId, messageHandler);
    initializeVoiceWebSocket(isHost);
    return () => removeMessageHandler(handlerId);
  }, [addMessageHandler, removeMessageHandler, initializeVoiceWebSocket, isHost, sendInitMessage]);

  //  WebRTC 초기화
  useEffect(() => {
    if (!webrtcInitialized && isConnected && connectionEstablishedRef.current) {
      initializeWebRTC().then(() => {
        setConnectionStatus(prev => ({ ...prev, webrtc: true }));
      });
    }
  }, [isConnected, webrtcInitialized, initializeWebRTC]);

  //  voiceManager 초기화
  const initializeVoice = useCallback(async () => {
    if (!isVoiceEnabled || voiceInitialized) return;

    const sessionId = localStorage.getItem('session_id');
    if (!connectionEstablishedRef.current || !sessionId || !webrtcInitialized) return;

    const success = await voiceManager.initializeVoiceSession();
    if (success) {
      setVoiceInitialized(true);
      setMicPermissionGranted(true);
      setConnectionStatus(prev => ({ ...prev, voice: true }));
      setTimeout(() => voiceManager.startSpeechDetection(), 1000);
    } else {
      setMicPermissionGranted(false);
    }
  }, [voiceInitialized, webrtcInitialized, isVoiceEnabled]);

  //  voice 초기화 조건 검사
  useEffect(() => {
    if (connectionEstablishedRef.current && webrtcInitialized && !voiceInitialized && isVoiceEnabled) {
      const timer = setTimeout(() => initializeVoice(), 1000);
      return () => clearTimeout(timer);
    }
  }, [webrtcInitialized, voiceInitialized, isVoiceEnabled, initializeVoice]);

  //  상태 전체 업데이트
  useEffect(() => {
    setConnectionStatus({
      websocket: isConnected,
      webrtc: webrtcInitialized && signalingConnected,
      voice: voiceInitialized && micPermissionGranted
    });
  }, [isConnected, webrtcInitialized, signalingConnected, voiceInitialized, micPermissionGranted]);
const handleContinue = () => {
  navigate('/selecthomemate');
}
  //  화면에 출력될 텍스트 (예시)
  const fullText =
    `          지금은 20XX년, 국내 최대 로봇 개발사 A가 다기능 돌봄 로봇 HomeMate를 개발했습니다.\n\n` +
    `    이 로봇의 기능은 아래와 같습니다.\n\n` +
    `     • 가족의 감정, 건강 상태, 생활 습관 등을 입력하면\n 맞춤형 알림, 식단 제안 등의 서비스를 제공\n\n` +
    `     • 기타 업데이트 시 정교화된 서비스 추가 가능`;
  return (
    <Background bgIndex={2}>
       <div
          style={{
            position: 'absolute',
            top: 5,
            left: 20,
            zIndex: 9999,
            //background: 'black',
            padding: 10,
          }}>
            <VoiceToggle
          onChange={(enabled) => {
            console.log('🧪 VoiceToggle 클릭됨, 상태:', enabled);
            if (!enabled) {
              voiceManager.disableVoiceFeatures();
            }
          }}
        />

        </div>
    

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
          <ContentBox2 text={fullText} />
          <div style={{ marginTop: 20 }}>
            <Continue
              width={264}
              height={72}
              step={1}
              onClick={handleContinue}
            />
          </div>
        </div>
      </div>
    </Background>
  );
} 
