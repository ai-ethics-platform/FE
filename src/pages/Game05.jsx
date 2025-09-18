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
// import { FontStyles,Colors } from '../components/styleConstants';
// import { clearAllLocalStorageKeys } from '../utils/storage';
// const profileImages = { '1P': profile1Img, '2P': profile2Img, '3P': profile3Img };

// export default function Game05() {
//   const navigate = useNavigate();
//   const { isConnected, sessionId, sendMessage } = useWebSocket();
//   const { isInitialized: webrtcInitialized } = useWebRTC();
//   const { isHost, sendNextPage } = useHostActions();
//   useWebSocketNavigation(navigate, { nextPagePath: '/game05_1', infoPath: '/game05_1' });
//  // 연결 상태 관리 (GameIntro에서 이미 초기화된 상태를 유지)
//  const [connectionStatus, setConnectionStatus] = useState({
//   websocket: true,
//   webrtc: true,
//   ready: true
// });
  
//   useEffect(() => {
//     const newStatus = {
//       websocket: isConnected,
//       webrtc: webrtcInitialized,
//       ready: isConnected && webrtcInitialized
//     };
//     setConnectionStatus(newStatus);
//     console.log(' [Game05] 연결 상태 업데이트:', newStatus);
//   }, [isConnected, webrtcInitialized]);
//   //  useEffect(() => {
//   //     if (!isConnected) {
//   //       console.warn('❌ WebSocket 연결 끊김 감지됨');
//   //       alert('⚠️ 연결이 끊겨 게임이 초기화됩니다.');
//   //       clearAllLocalStorageKeys();     
//   //       navigate('/');
//   //     }
//   //   }, [isConnected]);

//   const handleContinue = () => {

//     navigate('/game05_1');

//   };

//   const [mateName, setMateName] = useState('');
//   const [paragraphs, setParagraphs] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [openProfile, setOpenProfile] = useState(null);
//   const [round, setRound] = useState(1);

//   const mainTopic     = localStorage.getItem('category');
//   const subtopic      = localStorage.getItem('subtopic');
//   const mode          = localStorage.getItem('mode');
//   const selectedIndex = Number(localStorage.getItem('selectedCharacterIndex') ?? 0);
//   const comicImages   = getDilemmaImages(mainTopic, subtopic, mode, selectedIndex);
//   const rawParagraphs = paragraphsData[mainTopic]?.[subtopic]?.[mode] || [];
//   const roomCode      = localStorage.getItem('room_code');

//   useEffect(() => {
//     const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
//     const calculatedRound = completed.length + 1;
//     setRound(calculatedRound);
//     localStorage.setItem('currentRound', calculatedRound.toString());
//   }, []);

//   useEffect(() => {
//     const fetchMateName = async () => {
//       try {
//         const response = await axiosInstance.get('/rooms/ai-name', { params: { room_code: roomCode } });
//         const aiName = response.data.ai_name;
//         setMateName(aiName);
//         setParagraphs(resolveParagraphs(rawParagraphs, aiName));
//       } catch (err) {
//         console.error('[Game05] mateName API 실패:', err);
//         const fallback = 'HOMEMATE';
//         setMateName(fallback);
//         setParagraphs(resolveParagraphs(rawParagraphs, fallback));
//       }
//     };
//     fetchMateName();  
//   }, [roomCode]);  

//   const handleBackClick = () => {
//     navigate('/game04'); 
//   };

//   return (
//     <>
//       <Layout subtopic={subtopic} round={round} onProfileClick={setOpenProfile}  onBackClick={handleBackClick} >
  
//         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
//           <img src={comicImages[currentIndex]} alt={`comic ${currentIndex + 1}`} style={{ width: 744, height:360,borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />  
//           <div style={{ width: '100%', maxWidth: 900 }}>
//             <ContentTextBox2 paragraphs={paragraphs} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} onContinue={handleContinue} />
//           </div>
//         </div>
//       </Layout>
//     </>
//   );
// }

// pages/Game05.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import ContentTextBox2 from '../components/ContentTextBox2';

import { getDilemmaImages } from '../components/dilemmaImageLoader';
import { paragraphsData } from '../components/paragraphs';
import { resolveParagraphs } from '../utils/resolveParagraphs';

import axiosInstance from '../api/axiosInstance';
import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider';
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';
import { clearAllLocalStorageKeys } from '../utils/storage';

export default function Game05() {
  const navigate = useNavigate();

  const { isConnected, reconnectAttempts, maxReconnectAttempts } = useWebSocket();
  const { isInitialized: webrtcInitialized } = useWebRTC();
  const { isHost, sendNextPage } = useHostActions();
  useWebSocketNavigation(navigate, { nextPagePath: '/game05_1', infoPath: '/game05_1' });

  // 연결 상태 (로그만 유지)
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
    console.log(' [Game05] 연결 상태 업데이트:', newStatus);
  }, [isConnected, webrtcInitialized]);

  const handleContinue = () => {
    navigate('/game05_1');
  };

  // 공통 상태
  const [paragraphs, setParagraphs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [round, setRound] = useState(1);

  // 로컬
  const mainTopic     = localStorage.getItem('category');
  const rawSubtopic   = localStorage.getItem('subtopic');
  const mode          = localStorage.getItem('mode'); // 'agree' | 'disagree'
  const selectedIndex = Number(localStorage.getItem('selectedCharacterIndex') ?? 0);
  const roomCode      = localStorage.getItem('room_code');

  // 커스텀 모드 판별 + 커스텀 제목
  const isCustomMode  = !!localStorage.getItem('code');
  const creatorTitle  = localStorage.getItem('creatorTitle') || '';
  const subtopic      = isCustomMode ? (creatorTitle || rawSubtopic) : rawSubtopic;

  // 기본(일반 모드) 리소스
  const comicImages   = getDilemmaImages(mainTopic, rawSubtopic, mode, selectedIndex);
  const rawParagraphs = paragraphsData[mainTopic]?.[rawSubtopic]?.[mode] || [];

  // 이미지 URL 보정 (상대경로 → baseURL 붙이기)
  const resolveImageUrl = (raw) => {
    if (!raw || String(raw).trim() === '' || raw === '-') return null;
    const u = String(raw).trim();
    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
    const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
    if (!base) return u;
    return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
  };

  // 라운드 설정
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const calculatedRound = completed.length + 1;
    setRound(calculatedRound);
    localStorage.setItem('currentRound', calculatedRound.toString());
  }, []);



  useEffect(() => {
    if (!isConnected && reconnectAttempts >= maxReconnectAttempts) {
      console.warn('🚫 WebSocket 재연결 실패 → 게임 초기화');
      alert('⚠️ 연결을 복구하지 못했습니다. 게임이 초기화됩니다.');
      clearAllLocalStorageKeys();
      navigate('/');
    }
  }, [isConnected, reconnectAttempts, maxReconnectAttempts]);
    // 텍스트/이미지 세팅
  useEffect(() => {
    if (isCustomMode) {
      // 커스텀 텍스트 배열 파싱
      const keyTexts = mode === 'agree' ? 'flips_agree_texts' : 'flips_disagree_texts';
      let arr = [];
      try {
        const raw = localStorage.getItem(keyTexts);
        const parsed = raw ? JSON.parse(raw) : [];
        arr = Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [];
      } catch (e) {
        console.warn('[Game05] 커스텀 텍스트 파싱 실패:', e);
      }
      // paragraphs로 변환
      const nextParagraphs = arr.length ? arr.map(t => ({ main: t })) : [{ main: '' }];
      setParagraphs(nextParagraphs);
      setCurrentIndex(0);
    } else {
      //  일반 모드: mateName 치환
      const fetchMateName = async () => {
        try {
          const { data } = await axiosInstance.get('/rooms/ai-name', { params: { room_code: roomCode } });
          const aiName = data.ai_name || 'HOMEMATE';
          setParagraphs(resolveParagraphs(rawParagraphs, aiName));
        } catch (err) {
          console.error('[Game05] mateName API 실패:', err);
          const fallback = 'HOMEMATE';
          setParagraphs(resolveParagraphs(rawParagraphs, fallback));
        }
      };
      fetchMateName();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCustomMode, mode, roomCode]);

  // 커스텀/일반 이미지 선택
  const customImgKey = mode === 'agree' ? 'dilemma_image_4_1' : 'dilemma_image_4_2';
  const customImgUrl = resolveImageUrl(localStorage.getItem(customImgKey));
  const imageSrc = isCustomMode ? (customImgUrl || '') : (comicImages[currentIndex] || '');

  const handleBackClick = () => {
    navigate('/game04');
  };

  return (
    <Layout subtopic={subtopic} round={round} onBackClick={handleBackClick}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        {imageSrc && (
          <img
            src={imageSrc}
            alt="comic"
            style={{ width: 744, height: 360, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
        )}
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
