// // pages/Game02.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// import Layout from '../components/Layout';
// import ContentTextBox2 from '../components/ContentTextBox2';
// import closeIcon from '../assets/close.svg';

// import { getDilemmaImages } from '../components/dilemmaImageLoader';
// import { paragraphsData } from '../components/paragraphs';
// import { resolveParagraphs } from '../utils/resolveParagraphs';

// import profile1Img from '../assets/images/CharacterPopUp1.png';
// import profile2Img from '../assets/images/CharacterPopUp2.png';
// import profile3Img from '../assets/images/CharacterPopUp3.png';

// import axiosInstance from '../api/axiosInstance';
// import { useWebSocket } from '../WebSocketProvider';
// import { useWebRTC } from '../WebRTCProvider';
// import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';
// import { clearAllLocalStorageKeys } from '../utils/storage';

// const profileImages = { '1P': profile1Img, '2P': profile2Img, '3P': profile3Img };

// export default function Game02() {
//   const navigate = useNavigate();

//   const { isConnected, sessionId, sendMessage } = useWebSocket();
//   const { voiceSessionStatus, isInitialized: webrtcInitialized } = useWebRTC();
//   const { isHost, sendNextPage } = useHostActions();
//   useWebSocketNavigation(navigate, { nextPagePath: '/game03', infoPath: '/game03' });
//   // 연결 상태 관리 (GameIntro에서 이미 초기화된 상태를 유지)
//   const [connectionStatus, setConnectionStatus] = useState({
//     websocket: true,
//     webrtc: true,
//     ready: true
//   });
//  // 🔧 연결 상태 모니터링
//     useEffect(() => {
//       const newStatus = {
//         websocket: isConnected,
//         webrtc: webrtcInitialized,
//         ready: isConnected && webrtcInitialized
//       };
  
//       setConnectionStatus(newStatus);
  
//       console.log('[game02] 연결 상태 업데이트:', newStatus);
//     }, [isConnected, webrtcInitialized]);
//   //  useEffect(() => {
//   //     if (!isConnected) {
//   //       console.warn('❌ WebSocket 연결 끊김 감지됨');
//   //       alert('⚠️ 연결이 끊겨 게임이 초기화됩니다.');
//   //       clearAllLocalStorageKeys();     
//   //       navigate('/');
//   //     }
//   //   }, [isConnected]);

//   // 로컬 설정
//   const category = localStorage.getItem('category');
//   const subtopic = localStorage.getItem('subtopic');
//   const mode = localStorage.getItem('mode') ?? 'neutral';
//   const selectedIndex = Number(localStorage.getItem('selectedCharacterIndex')) || 0;  
//   const roomCode = localStorage.getItem('room_code');
//   const myRoleId = localStorage.getItem('myrole_id');

//   const comicImages = getDilemmaImages(category, subtopic, mode, selectedIndex);
//   const rawParagraphs = paragraphsData[category]?.[subtopic]?.[mode] || [];

//   // AI 이름 & 라운드
//   const [mateName, setMateName] = useState('');
//   const [paragraphs, setParagraphs] = useState([]);
//   const [round, setRound] = useState(1);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [openProfile, setOpenProfile] = useState(null);
  
//   useEffect(() => {
//     const newStatus = {
//       websocket: isConnected,
//       webrtc: webrtcInitialized,
//       ready: isConnected && webrtcInitialized
//     };
//     setConnectionStatus(newStatus);
  
//     console.log('🔧 [Game02] 연결 상태 업데이트:', newStatus);
//   }, [isConnected, webrtcInitialized]);
  
  
//   // 라운드 설정 및 AI 이름 조회
//   useEffect(() => {
//     const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
//     const nextRound = completed.length + 1;
//     setRound(nextRound);
//     localStorage.setItem('currentRound', String(nextRound));

//     const stored = localStorage.getItem('mateName');
//     if (stored) setMateName(stored);
//     else (async () => {
//       try {
//         const { data } = await axiosInstance.get('/rooms/ai-name', { params: { room_code: roomCode } });
//         setMateName(data.ai_name);
//       } catch (e) {
//         console.error(e);
//       }
//     })();
//   }, [roomCode]);

//   // mateName 반영
//   useEffect(() => {
//     if (mateName) setParagraphs(resolveParagraphs(rawParagraphs, mateName));
//   }, [mateName, rawParagraphs]);

//   // const handleContinue = () => {
//   //   if (!connectionStatus.ready) {
//   //     console.warn(' [Game02] 연결이 완전하지 않음:', connectionStatus);
//   //     alert('연결 상태를 확인하고 다시 시도해주세요.');
//   //     return;
//   //   }
  
//   //   if (!isHost) {
//   //     alert('방장만 진행할 수 있습니다.');
//   //     return;
//   //   }
  
//   //   const success = sendNextPage();
//   //   if (success) {
//   //     console.log(' [Game02] next_page 브로드캐스트 전송 성공');
//   //   } else {
//   //     console.error(' [Game02] next_page 브로드캐스트 전송 실패');
//   //     alert('페이지 이동 신호 전송에 실패했습니다.');
//   //   }
//   // };
//   const handleContinue = () => {
//     navigate(`/game03`);
//   }
//   const handleBackClick = () => {
//     navigate(`/character_all`);  
//   };

//   return (
//     <>
   
//       <Layout subtopic={subtopic} round={round} onProfileClick={setOpenProfile}  onBackClick={handleBackClick}>
//         {/* 본문 */}
//         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
//           <img
//             src={comicImages[currentIndex]}
//             alt={`comic ${currentIndex + 1}`}
//             style={{ width: 744, height:360, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
//           />
//           <div style={{ width: '100%', maxWidth: 900 }}>
//             <ContentTextBox2
//               paragraphs={paragraphs}
//               currentIndex={currentIndex}
//               setCurrentIndex={setCurrentIndex}
//               onContinue={handleContinue}
//             />
//           </div>
//         </div>
//       </Layout>
//     </>
//   );
// }

// pages/Game02.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import ContentTextBox2 from '../components/ContentTextBox2';
import closeIcon from '../assets/close.svg';

import { getDilemmaImages } from '../components/dilemmaImageLoader';
import { paragraphsData } from '../components/paragraphs';
import { resolveParagraphs } from '../utils/resolveParagraphs';

import profile1Img from '../assets/images/CharacterPopUp1.png';
import profile2Img from '../assets/images/CharacterPopUp2.png';
import profile3Img from '../assets/images/CharacterPopUp3.png';

import axiosInstance from '../api/axiosInstance';
import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider';
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';
import { clearAllLocalStorageKeys } from '../utils/storage';

const profileImages = { '1P': profile1Img, '2P': profile2Img, '3P': profile3Img };

export default function Game02() {
  const navigate = useNavigate();

  const { isConnected } = useWebSocket();
  const { isInitialized: webrtcInitialized } = useWebRTC();
  const { isHost, sendNextPage } = useHostActions();
  useWebSocketNavigation(navigate, { nextPagePath: '/game03', infoPath: '/game03' });

  // 연결 상태 관리 (GameIntro에서 이미 초기화된 상태를 유지)
  const [connectionStatus, setConnectionStatus] = useState({
    websocket: true,
    webrtc: true,
    ready: true,
  });

  useEffect(() => {
    const newStatus = {
      websocket: isConnected,
      webrtc: webrtcInitialized,
      ready: isConnected && webrtcInitialized,
    };
    setConnectionStatus(newStatus);
    console.log('[game02] 연결 상태 업데이트:', newStatus);
  }, [isConnected, webrtcInitialized]);
  useEffect(() => {
    if (!isConnected) {
      console.warn('❌ WebSocket 연결 끊김 감지됨');
      alert('⚠️ 연결이 끊겨 게임이 초기화됩니다.');
      clearAllLocalStorageKeys();
      navigate('/');
    }
  }, [isConnected]);
  // 로컬 설정
  const category = localStorage.getItem('category');
  const mode = localStorage.getItem('mode') ?? 'neutral';
  const selectedIndex = Number(localStorage.getItem('selectedCharacterIndex')) || 0;
  const roomCode = localStorage.getItem('room_code');
  const myRoleId = localStorage.getItem('myrole_id');

  //  커스텀 모드 여부
  const isCustomMode = !!localStorage.getItem('code');
  const rawSubtopic = localStorage.getItem('subtopic');
  const creatorTitle = localStorage.getItem('creatorTitle') || '';
  const subtopic = isCustomMode ? creatorTitle : (rawSubtopic || '');

  // 기본(비커스텀)용 이미지/문단
  const comicImages = getDilemmaImages(category, subtopic, mode, selectedIndex);
  const rawParagraphs = paragraphsData[category]?.[subtopic]?.[mode] || [];

  // AI 이름 & 라운드
  const [mateName, setMateName] = useState('');
  const [paragraphs, setParagraphs] = useState([]);
  const [round, setRound] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openProfile, setOpenProfile] = useState(null);

  //  상대경로 → 절대경로 보정
  const resolveImageUrl = (raw) => {
    if (!raw || raw === '-' || String(raw).trim() === '') return null;
    const u = String(raw).trim();
    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
    const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
    if (!base) return u;
    return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
  };

  //  커스텀 모드 전용: 텍스트 & 이미지 세팅
  const [customImage, setCustomImage] = useState(null);
  useEffect(() => {
    if (!isCustomMode) return;

    // 텍스트: dilemma_sitation 배열 → paragraphs [{main}, ...]
    let arr = [];
    try {
      const raw =
        localStorage.getItem('dilemma_sitation') ||
        localStorage.getItem('dilemma_situation'); // 오타 대비 폴백
      const parsed = raw ? JSON.parse(raw) : [];
      arr = Array.isArray(parsed) ? parsed.filter((x) => x != null) : [];
    } catch (e) {
      console.warn('dilemma_sitation 파싱 실패:', e);
      arr = [];
    }
    setParagraphs(arr.map((s) => ({ main: String(s) })));

    // 이미지: dilemma_image_3 (한 장만 사용)
    const rawImg = localStorage.getItem('dilemma_image_3') || '';
    setCustomImage(resolveImageUrl(rawImg));
  }, [isCustomMode]);

  // 라운드 설정 및 AI 이름 조회 (비커스텀/공통)
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const nextRound = completed.length + 1;
    setRound(nextRound);
    localStorage.setItem('currentRound', String(nextRound));

    // 커스텀 모드는 mateName 불필요하지만, 기존 로직 유지
    const stored = localStorage.getItem('mateName');
    if (stored) setMateName(stored);
    else {
      (async () => {
        try {
          const { data } = await axiosInstance.get('/rooms/ai-name', { params: { room_code: roomCode } });
          setMateName(data.ai_name);
        } catch (e) {
          console.error(e);
        }
      })();
    }
  }, [roomCode]);

  // mateName 반영 (✅ 커스텀 모드에서는 실행 안 함)
  useEffect(() => {
    if (isCustomMode) return;
    if (mateName) setParagraphs(resolveParagraphs(rawParagraphs, mateName));
  }, [isCustomMode, mateName, rawParagraphs]);

  const handleContinue = () => {
    navigate('/game03');
  };
  const handleBackClick = () => {
    navigate('/character_all');
  };

  // ✅ 렌더 이미지 결정 (커스텀: 한 장 고정 / 기본: 페이지별)
  const imageSrc = isCustomMode ? customImage : comicImages[currentIndex];

  return (
    <Layout subtopic={subtopic} round={round} onProfileClick={setOpenProfile} onBackClick={handleBackClick}>
      {/* 본문 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={`comic ${currentIndex + 1}`}
            style={{ width: 744, height: 360, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
        ) : null}
        <div style={{ width: '100%', maxWidth: 900 }}>
          <ContentTextBox2
            paragraphs={paragraphs}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            onContinue={handleContinue}
          />
        </div>
      </div>
    </Layout>
  );
}
