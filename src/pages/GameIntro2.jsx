// // import React, { useState, useEffect } from 'react';
// // import Background from '../components/Background';
// // import UserProfile from '../components/Userprofile';
// // import ContentTextBox from '../components/ContentTextBox';
// // import { useNavigate } from 'react-router-dom';
// // import gameIntro from '../assets/images/gameintro.png';
// // import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
// // import { useWebRTC } from '../WebRTCProvider'; 
// // import { useWebSocketNavigation, useWebSocketMessageAll, useHostActions } from '../hooks/useWebSocketMessage';

// // export default function GameIntro2() {
// //   const navigate = useNavigate();
// //   const [currentIndex, setCurrentIndex] = useState(0);
// //   const [mateName, setMateName] = useState('');
// //   const [myRoleId, setMyRoleId] = useState(null);
// //   const [hostId, setHostId] = useState(null);

// //   // Continue
// //   const handleContinue = () => {
// //     if (isHost) sendNextPage();
// //     else alert('⚠️ 방장만 진행할 수 있습니다.');
// //   };
// //    // WebSocket: 다음 페이지(Game05)로 이동
// //     useWebSocketNavigation(navigate, { nextPagePath: '/selecthomemate', infoPath: '/selecthomemate' });
// //     const { isHost, sendNextPage } = useHostActions();

// //   // 🆕 WebRTC Provider에서 상태와 함수들 가져오기
// //   const {
// //     isInitialized,
// //     signalingConnected,
// //     peerConnections,
// //     roleUserMapping,
// //     myUserId,
// //     voiceSessionStatus,
// //     adjustThreshold
// //   } = useWebRTC();

// //   // 음성 상태 관리 (기존 로직 유지)
// //   const { voiceStates, getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);

// //   // 🔧 컴포넌트 초기화
// //   useEffect(() => {
// //     const storedName = localStorage.getItem('mateName');
// //     const storedMyRole = localStorage.getItem('myrole_id');
// //     const storedHost = localStorage.getItem('host_id');

// //     setMateName(storedName || '');
// //     setMyRoleId(storedMyRole);
// //     setHostId(storedHost);

// //     console.log('GameIntro2 초기화:', {
// //       mateName: storedName,
// //       myRoleId: storedMyRole,
// //       hostId: storedHost,
// //       myUserId: myUserId
// //     });
// //   }, [myUserId]);

// //   const paragraphs = [
// //     {
// //       main: `  지금은 20XX년, 국내 최대 로봇 개발사 A가 다기능 돌봄 로봇 HomeMate를 개발했습니다.`,
// //     },
// //     {
// //       main:
// //         `  이 로봇의 기능은 아래와 같습니다.\n` +
// //         `  • 가족의 감정, 건강 상태, 생활 습관 등을 입력하면 맞춤형 알림, 식단 제안 등의 서비스를 제공\n` +
// //         `  • 기타 업데이트 시 정교화된 서비스 추가 가능`,
// //     },
// //   ];

// //   return (
// //     <Background bgIndex={2}>
// //       {/* 디버그 정보 */}
// //       <div style={{
// //         position: 'fixed',
// //         top: 10,
// //         right: 10,
// //         background: 'rgba(0,0,0,0.8)',
// //         color: 'white',
// //         padding: '10px',
// //         borderRadius: '5px',
// //         fontSize: '12px',
// //         zIndex: 1000,
// //         maxWidth: '300px'
// //       }}>
// //         <div>WebRTC 초기화: {isInitialized ? '✅' : '⏳'}</div>
// //         <div>시그널링: {signalingConnected ? '✅ 연결됨' : '❌ 연결안됨'}</div>
// //         <div>P2P 연결: {peerConnections.size}개</div>
// //         <div>음성 세션: {voiceSessionStatus.isConnected ? '✅' : '❌'}</div>
// //         <div>내 ID: {myUserId}</div>
// //         <div>내 역할: {myRoleId}</div>
// //         <div>호스트: {hostId}</div>
// //         <div>역할: {myRoleId === hostId ? '👑 호스트' : '👤 참가자'}</div>
        
// //         {/*  음성 임계값 조정 (디버그용) */}
// //         <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #444' }}>
// //           <div>음성 임계값: {voiceSessionStatus.speakingThreshold}</div>
// //           <div>
// //             <button onClick={() => adjustThreshold(-5)} style={{ fontSize: '10px', margin: '2px' }}>-5</button>
// //             <button onClick={() => adjustThreshold(5)} style={{ fontSize: '10px', margin: '2px' }}>+5</button>
// //           </div>
// //           <div>마이크 레벨: {voiceSessionStatus.micLevel}</div>
// //           <div>말하는 중: {voiceSessionStatus.isSpeaking ? '🎤' : '🔇'}</div>
// //         </div>
// //       </div>
      
// //       <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>
// //         <div style={{
// //           position: 'fixed',
// //           top: '32.5%',
// //           left: 0,
// //           transform: 'translateY(-50%)',
// //           display: 'flex',
// //           flexDirection: 'column',
// //           gap: 24,
// //           alignItems: 'flex-start',
// //           padding: '20px 0',
// //           width: 220,
// //         }}>
// //           <UserProfile
// //             player="1P"
// //             isLeader={hostId === '1'}
// //             isMe={myRoleId === '1'}
// //             isSpeaking={myRoleId === '1' ? voiceSessionStatus.isSpeaking : getVoiceStateForRole(1).is_speaking}
// //             isMicOn={myRoleId === '1' ? voiceSessionStatus.isConnected : getVoiceStateForRole(1).is_mic_on}
// //             nickname={getVoiceStateForRole(1).nickname}
// //           />
// //           <UserProfile
// //             player="2P"
// //             isLeader={hostId === '2'}
// //             isMe={myRoleId === '2'}
// //             isSpeaking={myRoleId === '2' ? voiceSessionStatus.isSpeaking : getVoiceStateForRole(2).is_speaking}
// //             isMicOn={myRoleId === '2' ? voiceSessionStatus.isConnected : getVoiceStateForRole(2).is_mic_on}
// //             nickname={getVoiceStateForRole(2).nickname}
// //           />
// //           <UserProfile
// //             player="3P"
// //             isLeader={hostId === '3'}
// //             isMe={myRoleId === '3'}
// //             isSpeaking={myRoleId === '3' ? voiceSessionStatus.isSpeaking : getVoiceStateForRole(3).is_speaking}
// //             isMicOn={myRoleId === '3' ? voiceSessionStatus.isConnected : getVoiceStateForRole(3).is_mic_on}
// //             nickname={getVoiceStateForRole(3).nickname}
// //           />
// //         </div>

// //         <div style={{
// //           position: 'absolute',
// //           top: '50%',
// //           left: '50%',
// //           transform: 'translate(-50%, -50%)',
// //           width: '80vw',
// //           maxWidth: 920,
// //           display: 'flex',
// //           flexDirection: 'column',
// //           alignItems: 'center',
// //         }}>
// //           <img
// //             src={gameIntro}
// //             alt="Intro Scene"
// //             style={{
// //               width: '100%',
// //               height: 'auto',
// //               objectFit: 'cover',
// //               borderRadius: 4,
// //             }}
// //           />

// //           <div style={{ marginTop: 24, width: '100%' }}>
// //           <ContentTextBox
// //               paragraphs={paragraphs}
// //               currentIndex={currentIndex}
// //               setCurrentIndex={setCurrentIndex}
// //               onContinue={handleContinue}
// //             />
// //           </div>
// //         </div>
// //       </div>
// //     </Background>
// //   );
// // }

// import React, { useState, useEffect } from 'react';
// import Background from '../components/Background';
// import UserProfile from '../components/Userprofile';
// import ContentTextBox from '../components/ContentTextBox';
// import { useNavigate } from 'react-router-dom';
// import gameIntro from '../assets/images/gameintro.png';
// import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
// import { useWebRTC } from '../WebRTCProvider'; 
// import { 
//   useWebSocketNavigation, 
//   useWebSocketMessageAll, 
//   useHostActions,
//   useWebSocketDebug
// } from '../hooks/useWebSocketMessage';

// export default function GameIntro2() {
//   const navigate = useNavigate();
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [mateName, setMateName] = useState('');
//   const [myRoleId, setMyRoleId] = useState(null);
//   const [hostId, setHostId] = useState(null);

//   // WebSocket 관련 훅들
//   const { isHost, sendNextPage, isConnected } = useHostActions();
//   const { isConnected: wsConnected, sessionId } = useWebSocketDebug();
  
//   useWebSocketNavigation(navigate, { 
//     nextPagePath: '/selecthomemate',  // 참가자들이 next_page 메시지 수신 시 이동할 경로
//     infoPath: '/selecthomemate',      // 방장이 info 메시지 수신 시 이동할 경로
//     enableNextPage: true,             // next_page 메시지 처리 활성화
//     enableInfo: false,                 // info 메시지 처리 활성화
//     hostUseInfo: false                // 방장은 info 메시지로 페이지 이동 (참가자는 next_page)
//   });

//   // Continue 버튼 클릭 핸들러
//   const handleContinue = () => {
//     if (isHost) {
//       console.log('👑 방장: next_page 메시지 전송');
//       // 방장도 서버 응답을 기다려서 페이지 이동
//       sendNextPage();
//     } else {
//       alert('⚠️ 방장만 진행할 수 있습니다.');
//     }
//   };

//   // 🆕 WebRTC Provider에서 상태와 함수들 가져오기
//   const {
//     isInitialized,
//     signalingConnected,
//     peerConnections,
//     roleUserMapping,
//     myUserId,
//     voiceSessionStatus,
//     adjustThreshold
//   } = useWebRTC();

//   // 음성 상태 관리 (기존 로직 유지)
//   const { voiceStates, getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);

//   // 🔧 컴포넌트 초기화
//   useEffect(() => {
//     const storedName = localStorage.getItem('mateName');
//     const storedMyRole = localStorage.getItem('myrole_id');
//     const storedHost = localStorage.getItem('host_id');

//     setMateName(storedName || '');
//     setMyRoleId(storedMyRole);
//     setHostId(storedHost);

//     console.log('GameIntro2 초기화:', {
//       mateName: storedName,
//       myRoleId: storedMyRole,
//       hostId: storedHost,
//       myUserId: myUserId
//     });
//   }, [myUserId]);

//   // 📌 디버깅용: 모든 WebSocket 메시지 로깅
//   const [lastMessage, setLastMessage] = useState(null);
//   useWebSocketMessageAll((message) => {
//     console.log('🔔 GameIntro2에서 수신한 메시지:', message);
//     setLastMessage({
//       ...message,
//       timestamp: new Date().toLocaleTimeString()
//     });
//   });

//   const paragraphs = [
//     {
//       main: `  지금은 20XX년, 국내 최대 로봇 개발사 A가 다기능 돌봄 로봇 HomeMate를 개발했습니다.`,
//     },
//     {
//       main:
//         `  이 로봇의 기능은 아래와 같습니다.\n` +
//         `  • 가족의 감정, 건강 상태, 생활 습관 등을 입력하면 맞춤형 알림, 식단 제안 등의 서비스를 제공\n` +
//         `  • 기타 업데이트 시 정교화된 서비스 추가 가능`,
//     },
//   ];

//   return (
//     <Background bgIndex={2}>
//       {/* 강화된 디버그 정보 */}
//       <div style={{
//         position: 'fixed',
//         top: 10,
//         right: 10,
//         background: 'rgba(0,0,0,0.9)',
//         color: 'white',
//         padding: '15px',
//         borderRadius: '8px',
//         fontSize: '11px',
//         zIndex: 1000,
//         maxWidth: '350px',
//         border: '1px solid #333'
//       }}>
//         <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#00ff00' }}>
//           🔍 WebSocket 디버그 정보
//         </div>
        
//         {/* 기본 정보 */}
//         <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #444' }}>
//           <div>WebSocket 연결: {wsConnected ? '✅ 연결됨' : '❌ 연결안됨'}</div>
//           <div>세션 ID: {sessionId || '❌ 없음'}</div>
//           <div>내 역할 ID: {myRoleId}</div>
//           <div>호스트 ID: {hostId}</div>
//           <div>역할: {myRoleId === hostId ? '👑 호스트' : '👤 참가자'}</div>
//         </div>

//         {/* WebRTC 정보 */}
//         <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #444' }}>
//           <div>WebRTC 초기화: {isInitialized ? '✅' : '⏳'}</div>
//           <div>시그널링: {signalingConnected ? '✅ 연결됨' : '❌ 연결안됨'}</div>
//           <div>P2P 연결: {peerConnections.size}개</div>
//           <div>음성 세션: {voiceSessionStatus.isConnected ? '✅' : '❌'}</div>
//         </div>

//         {/* 음성 임계값 조정 */}
//         <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #444' }}>
//           <div>음성 임계값: {voiceSessionStatus.speakingThreshold}</div>
//           <div>
//             <button 
//               onClick={() => adjustThreshold(-5)} 
//               style={{ fontSize: '10px', margin: '2px', padding: '2px 4px' }}
//             >
//               -5
//             </button>
//             <button 
//               onClick={() => adjustThreshold(5)} 
//               style={{ fontSize: '10px', margin: '2px', padding: '2px 4px' }}
//             >
//               +5
//             </button>
//           </div>
//           <div>마이크 레벨: {voiceSessionStatus.micLevel}</div>
//           <div>말하는 중: {voiceSessionStatus.isSpeaking ? '🎤' : '🔇'}</div>
//         </div>

//         {/* 테스트 버튼 및 최근 메시지 */}
//         <div>
//           <button 
//             onClick={() => {
//               console.log('🧪 테스트: WebSocket 상태 확인');
//               console.log('연결 상태:', wsConnected);
//               console.log('세션 ID:', sessionId);
//               console.log('내 역할:', myRoleId);
//               console.log('호스트:', hostId);
//             }}
//             style={{ 
//               fontSize: '10px', 
//               padding: '4px 8px', 
//               backgroundColor: '#007acc',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer',
//               marginRight: '4px'
//             }}
//           >
//             🧪 연결 상태 확인
//           </button>
          
//           {/* 최근 수신 메시지 표시 */}
//           {lastMessage && (
//             <div style={{ 
//               marginTop: '8px', 
//               padding: '6px', 
//               backgroundColor: '#1a1a1a', 
//               borderRadius: '4px',
//               fontSize: '10px'
//             }}>
//               <div style={{ color: '#00ff00', fontWeight: 'bold' }}>
//                 📨 최근 메시지 ({lastMessage.timestamp})
//               </div>
//               <div>타입: {lastMessage.type}</div>
//               {lastMessage.message && <div>내용: {lastMessage.message}</div>}
//             </div>
//           )}
//         </div>
//       </div>
      
//       <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>
//         <div style={{
//           position: 'fixed',
//           top: '32.5%',
//           left: 0,
//           transform: 'translateY(-50%)',
//           display: 'flex',
//           flexDirection: 'column',
//           gap: 24,
//           alignItems: 'flex-start',
//           padding: '20px 0',
//           width: 220,
//         }}>
//           <UserProfile
//             player="1P"
//             isLeader={hostId === '1'}
//             isMe={myRoleId === '1'}
//             isSpeaking={myRoleId === '1' ? voiceSessionStatus.isSpeaking : getVoiceStateForRole(1).is_speaking}
//             isMicOn={myRoleId === '1' ? voiceSessionStatus.isConnected : getVoiceStateForRole(1).is_mic_on}
//             nickname={getVoiceStateForRole(1).nickname}
//           />
//           <UserProfile
//             player="2P"
//             isLeader={hostId === '2'}
//             isMe={myRoleId === '2'}
//             isSpeaking={myRoleId === '2' ? voiceSessionStatus.isSpeaking : getVoiceStateForRole(2).is_speaking}
//             isMicOn={myRoleId === '2' ? voiceSessionStatus.isConnected : getVoiceStateForRole(2).is_mic_on}
//             nickname={getVoiceStateForRole(2).nickname}
//           />
//           <UserProfile
//             player="3P"
//             isLeader={hostId === '3'}
//             isMe={myRoleId === '3'}
//             isSpeaking={myRoleId === '3' ? voiceSessionStatus.isSpeaking : getVoiceStateForRole(3).is_speaking}
//             isMicOn={myRoleId === '3' ? voiceSessionStatus.isConnected : getVoiceStateForRole(3).is_mic_on}
//             nickname={getVoiceStateForRole(3).nickname}
//           />
//         </div>

//         <div style={{
//           position: 'absolute',
//           top: '50%',
//           left: '50%',
//           transform: 'translate(-50%, -50%)',
//           width: '80vw',
//           maxWidth: 920,
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//         }}>
//           <img
//             src={gameIntro}
//             alt="Intro Scene"
//             style={{
//               width: '100%',
//               height: 'auto',
//               objectFit: 'cover',
//               borderRadius: 4,
//             }}
//           />

//           <div style={{ marginTop: 24, width: '100%' }}>
//             <ContentTextBox
//               paragraphs={paragraphs}
//               currentIndex={currentIndex}
//               setCurrentIndex={setCurrentIndex}
//               onContinue={handleContinue}
//             />
//           </div>
//         </div>
//       </div>
//     </Background>
//   );
// }

import React, { useState, useEffect } from 'react';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import ContentTextBox from '../components/ContentTextBox';
import { useNavigate } from 'react-router-dom';
import gameIntro from '../assets/images/gameintro.png';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import { useWebRTC } from '../WebRTCProvider'; 
import { useWebSocket } from '../WebSocketProvider'; // ✅ 추가
import voiceManager from '../utils/voiceManager'; // ✅ 추가
import { 
  useWebSocketNavigation, 
  useWebSocketMessageAll, 
  useHostActions,
  useWebSocketDebug
} from '../hooks/useWebSocketMessage';

export default function GameIntro2() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mateName, setMateName] = useState('');
  const [myRoleId, setMyRoleId] = useState(null);
  const [hostId, setHostId] = useState(null);
  const [initializationStatus, setInitializationStatus] = useState({
    webSocket: false,
    voiceManager: false,
    webRTC: false
  });

  // WebSocket 관련 훅들
  const { isHost, sendNextPage, isConnected } = useHostActions();
  const { isConnected: wsConnected, sessionId } = useWebSocketDebug();
  const { initializeForGameIntro2 } = useWebSocket(); // ✅ 추가
  
  useWebSocketNavigation(navigate, { 
    nextPagePath: '/selecthomemate',
    infoPath: '/selecthomemate',
    enableNextPage: true,
    enableInfo: false,
    hostUseInfo: false
  });

  // Continue 버튼 클릭 핸들러
  const handleContinue = () => {
    if (isHost) {
      console.log('👑 방장: next_page 메시지 전송');
      sendNextPage();
    } else {
      alert('⚠️ 방장만 진행할 수 있습니다.');
    }
  };

  // WebRTC Provider에서 상태와 함수들 가져오기
  const {
    isInitialized: webRTCInitialized,
    signalingConnected,
    peerConnections,
    roleUserMapping,
    myUserId,
    voiceSessionStatus,
    adjustThreshold,
    initializeWebRTC
  } = useWebRTC();

  // 음성 상태 관리
  const { voiceStates, getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);

  // ✅ GameIntro2에서 모든 시스템 초기화
  useEffect(() => {
    const initializeAllSystems = async () => {
      console.log('🚀 GameIntro2 전체 시스템 초기화 시작');
      
      try {
        // 1. WebSocket 초기화 (음성 세션 생성 + 참가 + WebSocket 연결 + init 메시지)
        console.log('1️⃣ WebSocket 시스템 초기화...');
        const webSocketSuccess = await initializeForGameIntro2();
        setInitializationStatus(prev => ({ ...prev, webSocket: webSocketSuccess }));
        
        if (!webSocketSuccess) {
          throw new Error('WebSocket 초기화 실패');
        }

        // 2. VoiceManager 초기화 (마이크 연결 + 음성 감지)
        console.log('2️⃣ VoiceManager 초기화...');
        const voiceSuccess = await voiceManager.initializeVoiceSession();
        setInitializationStatus(prev => ({ ...prev, voiceManager: voiceSuccess }));
        
        if (!voiceSuccess) {
          throw new Error('VoiceManager 초기화 실패');
        }

        // 3. WebRTC 초기화 (시그널링 + P2P 연결)
        console.log('3️⃣ WebRTC 시스템 초기화...');
        const webRTCSuccess = await initializeWebRTC();
        setInitializationStatus(prev => ({ ...prev, webRTC: webRTCSuccess }));
        
        if (!webRTCSuccess) {
          console.warn('⚠️ WebRTC 초기화 실패 (계속 진행)');
        }

        console.log('✅ GameIntro2 전체 시스템 초기화 완료');
        
      } catch (error) {
        console.error('❌ GameIntro2 시스템 초기화 실패:', error);
      }
    };

    // 컴포넌트 마운트 시 초기화
    initializeAllSystems();
    
    // localStorage에서 기본 정보 로드
    const storedName = localStorage.getItem('mateName');
    const storedMyRole = localStorage.getItem('myrole_id');
    const storedHost = localStorage.getItem('host_id');

    setMateName(storedName || '');
    setMyRoleId(storedMyRole);
    setHostId(storedHost);

    console.log('📋 GameIntro2 기본 정보 로드:', {
      mateName: storedName,
      myRoleId: storedMyRole,
      hostId: storedHost,
      myUserId: myUserId
    });

  }, []); // 빈 의존성 배열로 한 번만 실행

  // 디버깅용: 모든 WebSocket 메시지 로깅
  const [lastMessage, setLastMessage] = useState(null);
  useWebSocketMessageAll((message) => {
    console.log('🔔 GameIntro2에서 수신한 메시지:', message);
    setLastMessage({
      ...message,
      timestamp: new Date().toLocaleTimeString()
    });
  });

  // ✅ 전역 객체에 VoiceManager 등록 (다른 컴포넌트에서 접근 가능)
  useEffect(() => {
    window.voiceManager = voiceManager;
    console.log(' VoiceManager가 전역 객체에 등록됨');
  }, []);

  const paragraphs = [
    {
      main: `  지금은 20XX년, 국내 최대 로봇 개발사 A가 다기능 돌봄 로봇 HomeMate를 개발했습니다.`,
    },
    {
      main:
        `  이 로봇의 기능은 아래와 같습니다.\n` +
        `  • 가족의 감정, 건강 상태, 생활 습관 등을 입력하면 맞춤형 알림, 식단 제안 등의 서비스를 제공\n` +
        `  • 기타 업데이트 시 정교화된 서비스 추가 가능`,
    },
  ];

  return (
    <Background bgIndex={2}>
      {/* 강화된 디버그 정보 */}
      <div style={{
        position: 'fixed',
        top: 10,
        right: 10,
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '11px',
        zIndex: 1000,
        maxWidth: '350px',
        border: '1px solid #333'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#00ff00' }}>
          🔍 GameIntro2 시스템 상태
        </div>
        
        {/* 초기화 상태 */}
        <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #444' }}>
          <div>WebSocket: {initializationStatus.webSocket ? '✅' : '⏳'}</div>
          <div>VoiceManager: {initializationStatus.voiceManager ? '✅' : '⏳'}</div>
          <div>WebRTC: {initializationStatus.webRTC ? '✅' : '⏳'}</div>
        </div>

        {/* 기본 정보 */}
        <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #444' }}>
          <div>WebSocket 연결: {wsConnected ? '✅' : '❌'}</div>
          <div>세션 ID: {sessionId || '❌ 없음'}</div>
          <div>내 역할 ID: {myRoleId}</div>
          <div>호스트 ID: {hostId}</div>
          <div>역할: {myRoleId === hostId ? '👑 호스트' : '👤 참가자'}</div>
        </div>

        {/* WebRTC 정보 */}
        <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #444' }}>
          <div>WebRTC 초기화: {webRTCInitialized ? '✅' : '⏳'}</div>
          <div>시그널링: {signalingConnected ? '✅ 연결됨' : '❌ 연결안됨'}</div>
          <div>P2P 연결: {peerConnections.size}개</div>
          <div>음성 세션: {voiceSessionStatus.isConnected ? '✅' : '❌'}</div>
        </div>

        {/* 음성 상태 및 컨트롤 */}
        <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #444' }}>
          <div>음성 임계값: {voiceSessionStatus.speakingThreshold}</div>
          <div>
            <button 
              onClick={() => adjustThreshold(-5)} 
              style={{ fontSize: '10px', margin: '2px', padding: '2px 4px' }}
            >
              -5
            </button>
            <button 
              onClick={() => adjustThreshold(5)} 
              style={{ fontSize: '10px', margin: '2px', padding: '2px 4px' }}
            >
              +5
            </button>
          </div>
          <div>마이크 레벨: {voiceSessionStatus.micLevel.toFixed(1)}</div>
          <div>말하는 중: {voiceSessionStatus.isSpeaking ? '🎤' : '🔇'}</div>
        </div>

        {/* 테스트 버튼 및 최근 메시지 */}
        <div>
          <button 
            onClick={() => {
              console.log('🧪 테스트: 전체 시스템 상태 확인');
              console.log('WebSocket 연결:', wsConnected);
              console.log('VoiceManager 상태:', voiceManager.getStatus());
              console.log('WebRTC 상태:', { webRTCInitialized, signalingConnected, peerConnections: peerConnections.size });
              console.log('초기화 상태:', initializationStatus);
            }}
            style={{ 
              fontSize: '10px', 
              padding: '4px 8px', 
              backgroundColor: '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '4px'
            }}
          >
            🧪 전체 상태 확인
          </button>
          
          {/* 최근 수신 메시지 표시 */}
          {lastMessage && (
            <div style={{ 
              marginTop: '8px', 
              padding: '6px', 
              backgroundColor: '#1a1a1a', 
              borderRadius: '4px',
              fontSize: '10px'
            }}>
              <div style={{ color: '#00ff00', fontWeight: 'bold' }}>
                📨 최근 메시지 ({lastMessage.timestamp})
              </div>
              <div>타입: {lastMessage.type}</div>
              {lastMessage.message && <div>내용: {lastMessage.message}</div>}
            </div>
          )}
        </div>
      </div>
      
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        <div style={{
          position: 'fixed',
          top: '32.5%',
          left: 0,
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          alignItems: 'flex-start',
          padding: '20px 0',
          width: 220,
        }}>
          <UserProfile
            player="1P"
            isLeader={hostId === '1'}
            isMe={myRoleId === '1'}
            isSpeaking={myRoleId === '1' ? voiceSessionStatus.isSpeaking : getVoiceStateForRole(1).is_speaking}
            isMicOn={myRoleId === '1' ? voiceSessionStatus.isConnected : getVoiceStateForRole(1).is_mic_on}
            nickname={getVoiceStateForRole(1).nickname}
          />
          <UserProfile
            player="2P"
            isLeader={hostId === '2'}
            isMe={myRoleId === '2'}
            isSpeaking={myRoleId === '2' ? voiceSessionStatus.isSpeaking : getVoiceStateForRole(2).is_speaking}
            isMicOn={myRoleId === '2' ? voiceSessionStatus.isConnected : getVoiceStateForRole(2).is_mic_on}
            nickname={getVoiceStateForRole(2).nickname}
          />
          <UserProfile
            player="3P"
            isLeader={hostId === '3'}
            isMe={myRoleId === '3'}
            isSpeaking={myRoleId === '3' ? voiceSessionStatus.isSpeaking : getVoiceStateForRole(3).is_speaking}
            isMicOn={myRoleId === '3' ? voiceSessionStatus.isConnected : getVoiceStateForRole(3).is_mic_on}
            nickname={getVoiceStateForRole(3).nickname}
          />
        </div>

        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80vw',
          maxWidth: 920,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <img
            src={gameIntro}
            alt="Intro Scene"
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'cover',
              borderRadius: 4,
            }}
          />

          <div style={{ marginTop: 24, width: '100%' }}>
            <ContentTextBox
              paragraphs={paragraphs}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              onContinue={handleContinue}
            />
          </div>
        </div>
      </div>
    </Background>
  );
}