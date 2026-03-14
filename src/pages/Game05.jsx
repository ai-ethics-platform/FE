// // pages/Game05.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// import Layout from '../components/Layout';
// import ContentTextBox2 from '../components/ContentTextBox2';

// import { getDilemmaImages } from '../components/dilemmaImageLoader';
// import { paragraphsData } from '../components/paragraphs';
// import { resolveParagraphs } from '../utils/resolveParagraphs';

// import axiosInstance from '../api/axiosInstance';
// import { useWebSocket } from '../WebSocketProvider';
// import { useWebRTC } from '../WebRTCProvider';
// import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';
// import { clearAllLocalStorageKeys } from '../utils/storage';

// export default function Game05() {
//   const navigate = useNavigate();

//   const { isConnected, reconnectAttempts, maxReconnectAttempts,finalizeDisconnection } = useWebSocket();
//   const { isInitialized: webrtcInitialized } = useWebRTC();
//   const { isHost, sendNextPage } = useHostActions();
//   useWebSocketNavigation(navigate, { nextPagePath: '/game05_1', infoPath: '/game05_1' });

//   // 연결 상태 (로그만 유지)
//   const [connectionStatus, setConnectionStatus] = useState({
//     websocket: true,
//     webrtc: true,
//     ready: true,
//   });
//   useEffect(() => {
//     const newStatus = {
//       websocket: isConnected,
//       webrtc: webrtcInitialized,
//       ready: isConnected && webrtcInitialized,
//     };
//     setConnectionStatus(newStatus);
//     console.log(' [Game05] 연결 상태 업데이트:', newStatus);
//   }, [isConnected, webrtcInitialized]);

//   const handleContinue = () => {
//     navigate('/game05_1');
//   };

//   // 공통 상태
//   const [paragraphs, setParagraphs] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [round, setRound] = useState(1);

//   // 로컬
//   const mainTopic     = localStorage.getItem('category');
//   const rawSubtopic   = localStorage.getItem('subtopic');
//   const mode          = localStorage.getItem('mode'); // 'agree' | 'disagree'
//   const selectedIndex = Number(localStorage.getItem('selectedCharacterIndex') ?? 0);
//   const roomCode      = localStorage.getItem('room_code');

//   // 커스텀 모드 판별 + 커스텀 제목
//   const isCustomMode  = !!localStorage.getItem('code');
//   const creatorTitle  = localStorage.getItem('creatorTitle') || '';
//   const subtopic      = isCustomMode ? (creatorTitle || rawSubtopic) : rawSubtopic;

//   // 기본(일반 모드) 리소스
//   const comicImages   = getDilemmaImages(mainTopic, rawSubtopic, mode, selectedIndex);
//   const rawParagraphs = paragraphsData[mainTopic]?.[rawSubtopic]?.[mode] || [];

//   // 이미지 URL 보정 (상대경로 → baseURL 붙이기)
//   const resolveImageUrl = (raw) => {
//     if (!raw || String(raw).trim() === '' || raw === '-') return null;
//     const u = String(raw).trim();
//     if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
//     const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
//     if (!base) return u;
//     return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
//   };

//   // 라운드 설정
//   useEffect(() => {
//     const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
//     const calculatedRound = completed.length + 1;
//     setRound(calculatedRound);
//     localStorage.setItem('currentRound', calculatedRound.toString());
//   }, []);



//   // useEffect(() => {
//   //   if (!isConnected && reconnectAttempts >= maxReconnectAttempts) {
//   //     console.warn('🚫 WebSocket 재연결 실패 → 게임 초기화');
//   //     alert('⚠️ 연결을 복구하지 못했습니다. 게임이 초기화됩니다.');
//   //     clearAllLocalStorageKeys();
//   //     navigate('/');
//   //   }
//   // }, [isConnected, reconnectAttempts, maxReconnectAttempts]);
//   useEffect(() => {
//         let cancelled = false;
//         const isReloadingGraceLocal = () => {
//           const flag = sessionStorage.getItem('reloading') === 'true';
//           const expire = parseInt(sessionStorage.getItem('reloading_expire_at') || '0', 10);
//           if (!flag) return false;
//           if (Date.now() > expire) {
//             sessionStorage.removeItem('reloading');
//             sessionStorage.removeItem('reloading_expire_at');
//             return false;
//           }
//           return true;
//         };
      
//         if (!isConnected) {
//           // 1) reloading-grace가 켜져 있으면 finalize 억제
//           if (isReloadingGraceLocal()) {
//             console.log('♻️ reloading grace active — finalize 억제');
//             return;
//           }
      
//           // 2) debounce: 잠깐 기다렸다가 여전히 끊겨있으면 finalize
//           const DEBOUNCE_MS = 1200;
//           const timer = setTimeout(() => {
//             if (cancelled) return;
//             if (!isConnected && !isReloadingGraceLocal()) {
//               console.warn('🔌 WebSocket 연결 끊김 → 초기화 (확정)');
//               finalizeDisconnection('❌ 연결이 끊겨 게임이 초기화됩니다.');
//             } else {
//               console.log('🔁 재연결/리로드 감지 — finalize 스킵');
//             }
//           }, DEBOUNCE_MS);
      
//           return () => {
//             cancelled = true;
//             clearTimeout(timer);
//           };
//         }
//       }, [isConnected, finalizeDisconnection]);
//     // 텍스트/이미지 세팅
//   useEffect(() => {
//     if (isCustomMode) {
//       // 커스텀 텍스트 배열 파싱
//       const keyTexts = mode === 'agree' ? 'flips_agree_texts' : 'flips_disagree_texts';
//       let arr = [];
//       try {
//         const raw = localStorage.getItem(keyTexts);
//         const parsed = raw ? JSON.parse(raw) : [];
//         arr = Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [];
//       } catch (e) {
//         console.warn('[Game05] 커스텀 텍스트 파싱 실패:', e);
//       }
//       // paragraphs로 변환
//       const nextParagraphs = arr.length ? arr.map(t => ({ main: t })) : [{ main: '' }];
//       setParagraphs(nextParagraphs);
//       setCurrentIndex(0);
//     } else {
//       //  일반 모드: mateName 치환
//       const fetchMateName = async () => {
//         try {
//           const { data } = await axiosInstance.get('/rooms/ai-name', { params: { room_code: roomCode } });
//           const aiName = data.ai_name || 'HOMEMATE';
//           setParagraphs(resolveParagraphs(rawParagraphs, aiName));
//         } catch (err) {
//           console.error('[Game05] mateName API 실패:', err);
//           const fallback = 'HOMEMATE';
//           setParagraphs(resolveParagraphs(rawParagraphs, fallback));
//         }
//       };
//       fetchMateName();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isCustomMode, mode, roomCode]);

//   // 커스텀/일반 이미지 선택
//   const customImgKey = mode === 'agree' ? 'dilemma_image_4_1' : 'dilemma_image_4_2';
//   const customImgUrl = resolveImageUrl(localStorage.getItem(customImgKey));
//   const imageSrc = isCustomMode ? (customImgUrl || '') : (comicImages[currentIndex] || '');

//   const handleBackClick = () => {
//     navigate('/game04');
//   };

//   return (
//     <Layout subtopic={subtopic} round={round} onBackClick={handleBackClick}>
//       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
//         {imageSrc && (
//           <img
//             src={imageSrc}
//             alt="comic"
//             style={{ width: 744, height: 360, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
//           />
//         )}
//         <div style={{ width: '100%', maxWidth: 900 }}>
//           <ContentTextBox2
//             paragraphs={paragraphs}
//             currentIndex={currentIndex}
//             setCurrentIndex={setCurrentIndex}
//             onContinue={handleContinue}
//           />
//         </div>
//       </div>
//     </Layout>
//   );
// }

// pages/Game05.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import ContentTextBox2 from '../components/ContentTextBox2';

import { getDilemmaImages } from '../components/dilemmaImageLoader';
// ✅ 언어팩 통합 사용
import { translations } from '../utils/language';
import { resolveParagraphs } from '../utils/resolveParagraphs';

import axiosInstance from '../api/axiosInstance';
import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider';
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';
import { clearAllLocalStorageKeys } from '../utils/storage';
import defaultImg from '../assets/images/default.png';

export default function Game05() {
  const navigate = useNavigate();

  const { isConnected, reconnectAttempts, maxReconnectAttempts, finalizeDisconnection } = useWebSocket();
  const { isInitialized: webrtcInitialized } = useWebRTC();
  const { isHost, sendNextPage } = useHostActions();
  
  // 방장 이동 시 참여자 동기화 훅
  useWebSocketNavigation(navigate, { nextPagePath: '/game05_1', infoPath: '/game05_1' });

  // 연결 상태 (로그 유지)
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

  // 공통 상태
  const [paragraphs, setParagraphs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [mateName, setMateName] = useState('');

  // 로컬 설정
  const lang = localStorage.getItem('app_lang') || 'ko';
  const mainTopic     = localStorage.getItem('category') || '안드로이드';
  const rawSubtopic   = localStorage.getItem('subtopic');
  const mode           = localStorage.getItem('mode'); // 'agree' | 'disagree'
  const selectedIndex = Number(localStorage.getItem('selectedCharacterIndex') ?? 0);
  const roomCode       = localStorage.getItem('room_code');

  // 커스텀 모드 판별 + 커스텀 제목
  const isCustomMode  = !!localStorage.getItem('code');
  const creatorTitle  = localStorage.getItem('creatorTitle') || '';
  const subtopic      = isCustomMode ? (creatorTitle || rawSubtopic) : rawSubtopic;

  // 이미지 리소스 로딩
  const comicImages   = getDilemmaImages(mainTopic, rawSubtopic, mode, selectedIndex);

  // 이미지 URL 보정
  const resolveImageUrl = (raw) => {
    if (!raw || String(raw).trim() === '' || raw === '-') return null;
    const u = String(raw).trim();
    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
    const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
    if (!base) return u;
    return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
  };

  // 라운드 설정 및 AI 이름 조회
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const calculatedRound = completed.length + 1;
    setRound(calculatedRound);
    localStorage.setItem('currentRound', calculatedRound.toString());

    const stored = localStorage.getItem('mateName');
    if (stored) setMateName(stored);
    else {
      (async () => {
        try {
          const { data } = await axiosInstance.get('/rooms/ai-name', { params: { room_code: roomCode } });
          const aiName = data.ai_name || 'HOMEMATE';
          setMateName(aiName);
          localStorage.setItem('mateName', aiName);
        } catch (err) {
          console.error('[Game05] mateName API 실패:', err);
          setMateName('HOMEMATE');
        }
      })();
    }
  }, [roomCode]);

  // 페이지 진입 신호 전송 (Game05_1의 방장이 인원을 파악할 수 있도록 신호 송신)
  useEffect(() => {
    const nickname = localStorage.getItem('nickname');
    if (!roomCode || !round || !nickname) return;

    axiosInstance.post('/rooms/page-arrival', {
      room_code: roomCode,
      page_number: 5, // Game05 단계를 식별하는 번호
      user_identifier: nickname,
    }).catch((e) => console.error('[Game05] page-arrival 실패:', e));
  }, [roomCode, round]);

  // 다국어 지문 로딩 및 치환
  useEffect(() => {
    if (isCustomMode) {
      const keyTexts = mode === 'agree' ? 'flips_agree_texts' : 'flips_disagree_texts';
      let arr = [];
      try {
        const raw = localStorage.getItem(keyTexts);
        const parsed = raw ? JSON.parse(raw) : [];
        arr = Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [];
      } catch (e) {
        console.warn('[Game05] 커스텀 텍스트 파싱 실패:', e);
      }
      setParagraphs(arr.map(t => ({ main: t })));
      setCurrentIndex(0);
    } else if (mateName) {
      const currentLangData = translations[lang] || translations['ko'];
      const t_paragraphs = currentLangData.Paragraphs;
      const t_map = currentLangData.GameMap;

      // Stable Key 추출 전략
      const findStableCategory = () => {
        if (mainTopic === t_map.categoryAWS || mainTopic === '자율 무기 시스템' || mainTopic === 'Autonomous Weapon Systems') return '자율 무기 시스템';
        return '안드로이드';
      };

      const findStableSubtopic = () => {
        const mapKey = Object.keys(t_map).find(k => t_map[k] === rawSubtopic);
        if (mapKey) return translations['ko'].GameMap[mapKey];
        return rawSubtopic;
      };

      const stableCat = findStableCategory();
      const stableSub = findStableSubtopic();

      const rawData = t_paragraphs[stableCat]?.[stableSub]?.[mode] || [];
      setParagraphs(resolveParagraphs(rawData, mateName));
    }
  }, [isCustomMode, mode, mateName, lang, mainTopic, rawSubtopic]);

  const handleContinue = () => {
    // 원본 서비스 로직에 맞춰 이동의 자유를 보장합니다.
    // 방장의 이동은 useWebSocketNavigation을 통해 참여자들에게 동기화됩니다.
    navigate('/game05_1');
  };

  const customImgKey = mode === 'agree' ? 'dilemma_image_4_1' : 'dilemma_image_4_2';
  const rawCustomImg = localStorage.getItem(customImgKey) || '';
  const customImgUrl = resolveImageUrl(rawCustomImg);
  
  const imageSrc = isCustomMode
    ? (customImgUrl || defaultImg)
    : (comicImages[currentIndex] || defaultImg);

  const handleBackClick = () => {
    const idx = window.history.state?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate('/game04');
  };

  return (
    <Layout subtopic={subtopic} round={round} onBackClick={handleBackClick}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        {imageSrc && (
          <img
            src={imageSrc}
            alt="comic"
            style={{ width: 744, height: 360, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            onError={(e) => { e.currentTarget.src = defaultImg; }}
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