
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

//   const { isConnected, reconnectAttempts, maxReconnectAttempts,finalizeDisconnection } = useWebSocket();
//   const { isInitialized: webrtcInitialized } = useWebRTC();
//   const { isHost, sendNextPage } = useHostActions();
//   useWebSocketNavigation(navigate, { nextPagePath: '/game03', infoPath: '/game03' });

//   // 연결 상태 관리 (GameIntro에서 이미 초기화된 상태를 유지)
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
//     console.log('[game02] 연결 상태 업데이트:', newStatus);
//   }, [isConnected, webrtcInitialized]);
  
//   // useEffect(() => {
//   //   if (!isConnected && reconnectAttempts >= maxReconnectAttempts) {
//   //     console.warn('🚫 WebSocket 재연결 실패 → 게임 초기화');
//   //     alert('⚠️ 연결을 복구하지 못했습니다. 게임이 초기화됩니다.');
//   //     clearAllLocalStorageKeys();
//   //     navigate('/');
//   //   }
//   // }, [isConnected, reconnectAttempts, maxReconnectAttempts]);
//    // 새로고침 시 재연결 로직 
//   useEffect(() => {
//       let cancelled = false;
//       const isReloadingGraceLocal = () => {
//         const flag = sessionStorage.getItem('reloading') === 'true';
//         const expire = parseInt(sessionStorage.getItem('reloading_expire_at') || '0', 10);
//         if (!flag) return false;
//         if (Date.now() > expire) {
//           sessionStorage.removeItem('reloading');
//           sessionStorage.removeItem('reloading_expire_at');
//           return false;
//         }
//         return true;
//       };
    
//       if (!isConnected) {
//         // 1) reloading-grace가 켜져 있으면 finalize 억제
//         if (isReloadingGraceLocal()) {
//           console.log('♻️ reloading grace active — finalize 억제');
//           return;
//         }
    
//         // 2) debounce: 잠깐 기다렸다가 여전히 끊겨있으면 finalize
//         const DEBOUNCE_MS = 1200;
//         const timer = setTimeout(() => {
//           if (cancelled) return;
//           if (!isConnected && !isReloadingGraceLocal()) {
//             console.warn('🔌 WebSocket 연결 끊김 → 초기화 (확정)');
//             finalizeDisconnection('❌ 연결이 끊겨 게임이 초기화됩니다.');
//           } else {
//             console.log('🔁 재연결/리로드 감지 — finalize 스킵');
//           }
//         }, DEBOUNCE_MS);
    
//         return () => {
//           cancelled = true;
//           clearTimeout(timer);
//         };
//       }
//     }, [isConnected, finalizeDisconnection]);
    

//   // 로컬 설정
//   const category = localStorage.getItem('category');
//   const mode = localStorage.getItem('mode') ?? 'neutral';
//   const selectedIndex = Number(localStorage.getItem('selectedCharacterIndex')) || 0;
//   const roomCode = localStorage.getItem('room_code');
//   const myRoleId = localStorage.getItem('myrole_id');

//   //  커스텀 모드 여부
//   const isCustomMode = !!localStorage.getItem('code');
//   const rawSubtopic = localStorage.getItem('subtopic');
//   const creatorTitle = localStorage.getItem('creatorTitle') || '';
//   const subtopic = isCustomMode ? creatorTitle : (rawSubtopic || '');

//   // 기본(비커스텀)용 이미지/문단
//   const comicImages = getDilemmaImages(category, subtopic, mode, selectedIndex);
//   const rawParagraphs = paragraphsData[category]?.[subtopic]?.[mode] || [];

//   // AI 이름 & 라운드
//   const [mateName, setMateName] = useState('');
//   const [paragraphs, setParagraphs] = useState([]);
//   const [round, setRound] = useState(1);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [openProfile, setOpenProfile] = useState(null);

//   //  상대경로 → 절대경로 보정
//   const resolveImageUrl = (raw) => {
//     if (!raw || raw === '-' || String(raw).trim() === '') return null;
//     const u = String(raw).trim();
//     if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
//     const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
//     if (!base) return u;
//     return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
//   };

//   //  커스텀 모드 전용: 텍스트 & 이미지 세팅
//   const [customImage, setCustomImage] = useState(null);
//   useEffect(() => {
//     if (!isCustomMode) return;

//     // 텍스트: dilemma_sitation 배열 → paragraphs [{main}, ...]
//     let arr = [];
//     try {
//       const raw =
//         localStorage.getItem('dilemma_sitation') ||
//         localStorage.getItem('dilemma_situation'); // 오타 대비 폴백
//       const parsed = raw ? JSON.parse(raw) : [];
//       arr = Array.isArray(parsed) ? parsed.filter((x) => x != null) : [];
//     } catch (e) {
//       console.warn('dilemma_sitation 파싱 실패:', e);
//       arr = [];
//     }
//     setParagraphs(arr.map((s) => ({ main: String(s) })));

//     // 이미지: dilemma_image_3 (한 장만 사용)
//     const rawImg = localStorage.getItem('dilemma_image_3') || '';
//     setCustomImage(resolveImageUrl(rawImg));
//   }, [isCustomMode]);

//   // 라운드 설정 및 AI 이름 조회 (비커스텀/공통)
//   useEffect(() => {
//     const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
//     const nextRound = completed.length + 1;
//     setRound(nextRound);
//     localStorage.setItem('currentRound', String(nextRound));

//     // 커스텀 모드는 mateName 불필요하지만, 기존 로직 유지
//     const stored = localStorage.getItem('mateName');
//     if (stored) setMateName(stored);
//     else {
//       (async () => {
//         try {
//           const { data } = await axiosInstance.get('/rooms/ai-name', { params: { room_code: roomCode } });
//           setMateName(data.ai_name);
//         } catch (e) {
//           console.error(e);
//         }
//       })();
//     }
//   }, [roomCode]);

//   useEffect(() => {
//     if (isCustomMode) return;
//     if (mateName) {
//       const resolved = resolveParagraphs(rawParagraphs, mateName);
//       setParagraphs(resolved);
//     }
//   }, [isCustomMode, mateName, rawParagraphs]);
  
//   const handleContinue = () => {
//     navigate('/game03');
//   };
//   const handleBackClick = () => {
//     navigate('/character_all');
//   };

//   //  렌더 이미지 결정 (커스텀: 한 장 고정 / 기본: 페이지별)
//   const imageSrc = isCustomMode ? customImage : comicImages[currentIndex];

//   return (
//     <Layout subtopic={subtopic} round={round} onProfileClick={setOpenProfile} onBackClick={handleBackClick}>
//       {/* 본문 */}
//       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
//         {imageSrc ? (
//           <img
//             src={imageSrc}
//             alt={`comic ${currentIndex + 1}`}
//             style={{ width: 744, height: 360, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
//           />
//         ) : null}
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

// 이미지 오류 시 디폴트 이미지 사용 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import ContentTextBox2 from '../components/ContentTextBox2';
import closeIcon from '../assets/close.svg';

// ✅ 기존 이미지 로더 유지
import { getDilemmaImages } from '../components/dilemmaImageLoader';
// ✅ 기존 paragraphsData 대신 새 언어팩 사용을 위해 translations 임포트
import { translations } from '../utils/language';
import { resolveParagraphs } from '../utils/resolveParagraphs';

import profile1Img from '../assets/images/CharacterPopUp1.png';
import profile2Img from '../assets/images/CharacterPopUp2.png';
import profile3Img from '../assets/images/CharacterPopUp3.png';

import axiosInstance from '../api/axiosInstance';
import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider';
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';
import { clearAllLocalStorageKeys } from '../utils/storage';
import defaultImg from '../assets/images/default.png';  // ✅ 기본 이미지 추가
const profileImages = { '1P': profile1Img, '2P': profile2Img, '3P': profile3Img };

export default function Game02() {
  const navigate = useNavigate();

  const { isConnected, reconnectAttempts, maxReconnectAttempts, finalizeDisconnection } = useWebSocket();
  const { isInitialized: webrtcInitialized } = useWebRTC();
  const { isHost, sendNextPage } = useHostActions();
  useWebSocketNavigation(navigate, { nextPagePath: '/game03', infoPath: '/game03' });

  // 연결 상태 관리 (기본 로직 유지)
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

  // 로컬 설정
  const lang = localStorage.getItem('app_lang') || 'ko';
  const category = localStorage.getItem('category') || '안드로이드';
  const mode = localStorage.getItem('mode') ?? 'neutral';
  const selectedIndex = Number(localStorage.getItem('selectedCharacterIndex')) || 0;
  const roomCode = localStorage.getItem('room_code');
  const myRoleId = localStorage.getItem('myrole_id');

  // 커스텀 모드 여부
  const isCustomMode = !!localStorage.getItem('code');
  const rawSubtopic = localStorage.getItem('subtopic');
  const creatorTitle = localStorage.getItem('creatorTitle') || '';
  const subtopic = isCustomMode ? creatorTitle : (rawSubtopic || '');

  // ✅ 1. 이미지 로딩: 기존 getDilemmaImages 로직 100% 유지 
  const comicImages = getDilemmaImages(category, subtopic, mode, selectedIndex);

  // AI 이름 & 라운드
  const [mateName, setMateName] = useState('');
  const [paragraphs, setParagraphs] = useState([]);
  const [round, setRound] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openProfile, setOpenProfile] = useState(null);

  // 상대경로 → 절대경로 보정
  const resolveImageUrl = (raw) => {
    if (!raw || raw === '-' || String(raw).trim() === '') return null;
    const u = String(raw).trim();
    
    // 이미 절대 URL이면 그대로 반환
    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
    
    // baseURL 가져오기
    const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
    if (!base) {
      console.warn('⚠️ baseURL이 설정되지 않음. 상대경로 그대로 사용:', u);
      return u;
    }
    
    // 절대경로 생성
    const resolved = `${base}${u.startsWith('/') ? '' : '/'}${u}`;
    console.log('🔗 이미지 URL 변환:', { raw, resolved });
    return resolved;
  };

  // 커스텀 모드 전용: 텍스트 & 이미지 세팅 (기존 유지)
  const [customImage, setCustomImage] = useState(null);
  useEffect(() => {
    if (!isCustomMode) return;
    let arr = [];
    try {
      const raw = localStorage.getItem('dilemma_sitation') || localStorage.getItem('dilemma_situation');
      const parsed = raw ? JSON.parse(raw) : [];
      arr = Array.isArray(parsed) ? parsed.filter((x) => x != null) : [];
    } catch (e) {
      console.warn('dilemma_sitation 파싱 실패:', e);
      arr = [];
    }
    setParagraphs(arr.map((s) => ({ main: String(s) })));
    const rawImg = localStorage.getItem('dilemma_image_3') || '';
    const resolved = resolveImageUrl(rawImg);
    setCustomImage(resolved || defaultImg); 
  }, [isCustomMode]);

  // 라운드 설정 및 AI 이름 조회
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const nextRound = completed.length + 1;
    setRound(nextRound);
    localStorage.setItem('currentRound', String(nextRound));

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

  // ✅ 2. [핵심] 다국어 지문 로딩 로직 통합 
  useEffect(() => {
    if (isCustomMode) return;
    if (mateName) {
      const currentLangData = translations[lang] || translations['ko'];
      const t_paragraphs = currentLangData.Paragraphs;
      const t_map = currentLangData.GameMap;

      // 카테고리/주제가 영어일 수 있으므로 한국어 키로 변환하는 'Stable Key' 전략 적용
      const findStableCategory = () => {
        if (category === t_map.categoryAWS || category === '자율 무기 시스템' || category === 'Autonomous Weapon Systems') return '자율 무기 시스템';
        return '안드로이드';
      };

      const findStableSubtopic = (catKey) => {
        // 1. 현재 언어팩의 GameMap에서 현재 subtopic이 어떤 key(예: andOption1_1)인지 찾음
        const mapKey = Object.keys(t_map).find(k => t_map[k] === subtopic);
        // 2. 한국어(ko) 언어팩의 동일한 key에서 실제 데이터용 주제명을 가져옴
        if (mapKey) return translations['ko'].GameMap[mapKey];
        return subtopic; // 못 찾으면 폴백
      };

      const stableCat = findStableCategory();
      const stableSub = findStableSubtopic(stableCat);

      // 데이터 추출
      const rawData = t_paragraphs[stableCat]?.[stableSub]?.[mode] || [];
      const resolved = resolveParagraphs(rawData, mateName);
      setParagraphs(resolved);
    }
  }, [isCustomMode, mateName, lang, category, subtopic, mode]);
  
  const handleContinue = () => {
    navigate('/game03');
  };
  const handleBackClick = () => {
    const idx = window.history.state?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate('/character_all');
  };

  // 렌더 이미지 결정
  const imageSrc = isCustomMode ? customImage : comicImages[currentIndex];
  
  // ✅ 이미지 타입 판별: 서버 URL만 CORS 필요
  const isServerImage = imageSrc && (
    imageSrc.startsWith('http://') || 
    imageSrc.startsWith('https://')
  );
  
  // 디버깅: 이미지 타입 확인
  useEffect(() => {
    if (imageSrc) {
      console.log('🖼️ Game02 이미지 정보:', {
        isCustomMode,
        currentIndex,
        imageSrc: imageSrc.substring(0, 100) + '...',
        isServerImage,
        needsCORS: isServerImage,
      });
    }
  }, [imageSrc, isCustomMode, currentIndex, isServerImage]);

  return (
    <Layout subtopic={subtopic} round={round} onProfileClick={setOpenProfile} onBackClick={handleBackClick}>
      {/* 본문 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        {imageSrc ? (
         <img
         src={imageSrc}
         alt={`comic ${currentIndex + 1}`}
         {...(isServerImage && { crossOrigin: "anonymous" })}
         style={{ width: 744, height: 360, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
         loading="eager"
         decoding="async"
         onError={(e) => {
           const retryCount = parseInt(e.currentTarget.dataset.retryCount || '0');
           
           // ✅ 최대 3번 재시도
           if (retryCount < 3) {
             e.currentTarget.dataset.retryCount = String(retryCount + 1);
             console.log(`🔄 이미지 재시도 ${retryCount + 1}/3:`, imageSrc);
             
             // 캐시 우회 + 재시도
             const cacheBuster = `?retry=${retryCount + 1}&t=${Date.now()}`;
             const newSrc = imageSrc.includes('?') 
               ? `${imageSrc.split('?')[0]}${cacheBuster}`
               : `${imageSrc}${cacheBuster}`;
             
             // 약간의 지연 후 재시도 (네트워크 회복 대기)
             setTimeout(() => {
               if (e.currentTarget) {
                 e.currentTarget.src = newSrc;
               }
             }, 300 * retryCount); // 300ms, 600ms, 900ms
             return;
           }
           
           // ✅ 3번 실패 후 fallback 시도
           if (e.currentTarget.dataset.fallbackAttempted !== 'true') {
             console.warn('⚠️ 3번 재시도 실패, fallback 이미지로 전환:', imageSrc);
             e.currentTarget.dataset.fallbackAttempted = 'true';
             e.currentTarget.dataset.retryCount = '0'; // 카운트 초기화
             e.currentTarget.src = defaultImg;
             return;
           }
           
           // ✅ fallback도 실패 시 숨김
           console.error('❌ fallback 이미지도 로드 실패');
           e.currentTarget.style.display = 'none';
         }}
         onLoad={(e) => {
           console.log('✅ 이미지 로드 성공:', {
             src: imageSrc,
             isServerImage,
             naturalWidth: e.currentTarget.naturalWidth,
             naturalHeight: e.currentTarget.naturalHeight,
           });
         }}
       />
     ) : (
       <img
         src={defaultImg}
         alt="default"
         style={{ width: 744, height: 360, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
         loading="eager"
         decoding="async"
         onError={(e) => {
           console.error('❌ 기본 이미지 로드 실패:', defaultImg, e);
         }}
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