// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// import Layout from '../components/Layout';
// import ContentBox2 from '../components/ContentBox2';
// import Continue from '../components/Continue';
// import Continue3 from '../components/Continue3';
// import ResultPopup from '../components/Results';
// import { resolveParagraphs } from '../utils/resolveParagraphs';
// import { paragraphsData } from '../components/paragraphs';

// import axiosInstance from '../api/axiosInstance';
// import { useWebSocket } from '../WebSocketProvider';
// import { useWebRTC } from '../WebRTCProvider';
// import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';
// import { Colors,FontStyles } from '../components/styleConstants';
// import { clearAllLocalStorageKeys } from '../utils/storage';

// export default function Game06() {
//  const navigate = useNavigate();
 
//    const { isConnected, sessionId, sendMessage } = useWebSocket();
//    const { voiceSessionStatus, isInitialized: webrtcInitialized } = useWebRTC();
//    const { isHost } = useHostActions();
//  // 연결 상태 관리 (GameIntro에서 이미 초기화된 상태를 유지)
//  const [connectionStatus, setConnectionStatus] = useState({
//   websocket: true,
//   webrtc: true,
//   ready: true
// });

//   useEffect(() => {
//      const newStatus = {
//        websocket: isConnected,
//        webrtc: webrtcInitialized,
//        ready: isConnected && webrtcInitialized
//      };
//      setConnectionStatus(newStatus);
   
//      console.log(' [Game06] 연결 상태 업데이트:', newStatus);
//    }, [isConnected, webrtcInitialized]);
  
//   //  useEffect(() => {
//   //     if (!isConnected) {
//   //       console.warn('❌ WebSocket 연결 끊김 감지됨');
//   //       alert('⚠️ 연결이 끊겨 게임이 초기화됩니다.');
//   //       clearAllLocalStorageKeys();     
//   //       navigate('/');
//   //     }
//   //   }, [isConnected]);

//   const category = localStorage.getItem('category');
//    const subtopic = localStorage.getItem('subtopic');
//   const roomCode = localStorage.getItem('room_code');
//   const mode      = 'ending1';
  
//   const [mateName, setMateName] = useState('HomeMate');
//   const [paragraphs, setParagraphs]   = useState([]); 
//   const [showPopup, setShowPopup] = useState(false);
//   const [completedTopics, setCompletedTopics] = useState([]);
//   const [currentRound, setCurrentRound] = useState(1);
//   const [openProfile, setOpenProfile] = useState(null);

//   // 결과보기 조건 수정 
// const hasMinimumRounds = completedTopics.length >= 3;
// const hasCompletedInternational = completedTopics.includes('지구, 인간, AI');
// const showResultButton = hasCompletedInternational;

//   useEffect(() => {
//     const saved = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
//     setCompletedTopics(saved);

//     setCurrentRound(saved.length + 1);
//   }, []);

//   useEffect(() => {
//     const storedName = localStorage.getItem('mateName');
//     if (storedName) {
//       setMateName(storedName);

//        const rawParagraphs = paragraphsData[category]?.[subtopic]?.[mode] || [];
//        setParagraphs(resolveParagraphs(rawParagraphs, storedName));

//     } else {
//       (async () => {
//         try {
//           const res = await axiosInstance.get('/rooms/ai-name', { params: { room_code: roomCode } });
//           const aiName = res.data.ai_name || 'HomeMate';
//           setMateName(aiName);
//           localStorage.setItem('mateName', aiName);

//         const rawParagraphs = paragraphsData[category]?.[subtopic]?.[mode] || [];
//          setParagraphs(resolveParagraphs(rawParagraphs, aiName));

//         } catch (err) {
//           console.error('AI 이름 로딩 실패:', err);
//           const fallback = 'HomeMate';
//           setMateName(fallback);
//           const [resolved] = resolveParagraphs(raw, fallback);
//           setParagraph(resolved);
//         }
//       })();
//     }
//   }, [roomCode]);


//   const saveCompletedTopic = () => {
//     const current = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
//     if (!current.includes(subtopic)) {
//       const updated = [...current, subtopic];
//       localStorage.setItem('completedTopics', JSON.stringify(updated));
//       setCompletedTopics(updated);
//       localStorage.setItem('currentRound', updated.length.toString());
//     }
//   };

//   const handleNextRound = () => {
//     // if (!isHost) {
//     //   alert('⚠️ 방장만 다음 라운드로 진행할 수 있습니다.');
//     //   return;
//     // }
//     // saveCompletedTopic();
//     //localStorage.removeItem('category');
//     localStorage.removeItem('subtopic');
//     localStorage.removeItem('mode');
//     navigate('/gamemap');
//   };

//   const handleViewResult = () => {
//     // if (!isHost) {
//     //   alert('방장만 결과 보기로 진행할 수 있습니다.');
//     //   return;
//     // }
//     if (completedTopics.length >= 5){
//       localStorage.setItem('mode','agree');
//       navigate('/game08');
//     } 
//     else setShowPopup(true);
//   };
//   const handleBackClick = () => {
//     navigate('/game05_1'); 
//   };
//   return (
//     <>
//       <Layout round={currentRound} subtopic={subtopic}  onProfileClick={setOpenProfile}  onBackClick={handleBackClick} >
     
//         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
//           <ContentBox2 text={paragraphs[0]?.main || ''} width={936} height={407} />
      
//           {showResultButton ? (
//             <Continue3
//               label="결과 보기"
//               onClick={handleViewResult}
//             />
//           ) : (
//             <Continue
//               label="라운드 선택으로"
//               onClick={handleNextRound}
//               style={{ width: 264, height: 72 }}
//             />
//           )}
//         </div>
//       </Layout>

//       {showPopup && (
//         <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
//           <ResultPopup onClose={() => setShowPopup(false)} onViewResult={() => navigate('/game08')} />
//         </div>
//       )}
//     </>
//   );
// }

// pages/Game06.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import ContentBox2 from '../components/ContentBox2';
import Continue from '../components/Continue';
import Continue3 from '../components/Continue3';
import ResultPopup from '../components/Results';
import { resolveParagraphs } from '../utils/resolveParagraphs';
import voiceManager from '../utils/voiceManager';

import { useWebSocket } from '../WebSocketProvider';
import { useHostActions } from '../hooks/useWebSocketMessage';
import { translations } from '../utils/language';

export default function Game06() {
  const navigate = useNavigate();
  const { disconnect } = useWebSocket();
  const lang = localStorage.getItem('app_lang') || 'ko';
  
  // 1. [구조 대응] 이중 객체 봉투 해제
  const currentLangData = translations[lang] || translations['ko'];
  
  const ui = useMemo(() => {
    const root = currentLangData?.UiElements || {};
    return root.UiElements || root;
  }, [currentLangData]);

  const langParagraphs = useMemo(() => {
    const raw = currentLangData?.Paragraphs || {};
    return raw.Paragraphs || raw;
  }, [currentLangData]);

  const isCustomMode = !!localStorage.getItem('code');
  const rawCategory = localStorage.getItem('category') || '안드로이드';
  const rawSubtopic = localStorage.getItem('subtopic') || '';
  const headerSubtopic = isCustomMode ? (localStorage.getItem('creatorTitle') || rawSubtopic) : rawSubtopic;
  const mateName = localStorage.getItem('mateName') || 'HomeMate';

  const [displayText, setDisplayText] = useState(''); 
  const [showPopup, setShowPopup] = useState(false);
  const [completedTopics, setCompletedTopics] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    setCompletedTopics(saved);
  }, []);

  // 2. [핵심 수정] Stable Key 단순화 (Game05_1과 동일)
  const stableKeys = useMemo(() => {
    // 카테고리만 영문/한글 보정하고, subtopic은 저장된 한국어 제목 그대로 사용
    const category = rawCategory.includes('자율 무기 시스템') || rawCategory.toLowerCase().includes('weapon') 
      ? '자율 무기 시스템' 
      : '안드로이드';
    
    return { category, subtopic: rawSubtopic };
  }, [rawCategory, rawSubtopic]);

  // 3. 지문 출력 로직
  useEffect(() => {
    if (isCustomMode) {
      const raw = localStorage.getItem('agreeEnding');
      if (!raw) return;
      setDisplayText(String(raw));
      return;
    }

    // 데이터 조회: [카테고리][주제][ending1]
    const categoryData = langParagraphs[stableKeys.category];
    const subtopicData = categoryData ? categoryData[stableKeys.subtopic] : null;
    const rawParagraphs = subtopicData ? subtopicData['ending1'] : []; // Game06은 동의(ending1) 고정
    
    if (rawParagraphs && rawParagraphs.length > 0) {
      const resolved = resolveParagraphs(rawParagraphs, mateName);
      setDisplayText(resolved.map(p => p?.main).filter(Boolean).join('\n\n'));
    } else {
      setDisplayText(lang === 'ko' ? '지문을 찾을 수 없습니다.' : 'Ending text not found.');
    }
  }, [stableKeys, isCustomMode, langParagraphs, mateName, lang]);

  const handleNextRound = () => {
    localStorage.removeItem('subtopic');
    localStorage.removeItem('mode');
    navigate('/gamemap');
  };

  const handleViewResult = () => {
    if (completedTopics.length >= 5){
      localStorage.setItem('mode','agree');
      navigate('/game08');
    } else { setShowPopup(true); }
  };

  const handleExit = async () => {
    try {
      await debugMediaState('종료 전');
      
      // 🚨 중요: 업로드(녹음 종료)는 정리보다 먼저 실행해야 함
      const result = await voiceManager?.terminateVoiceSession?.();
      console.log(result ? '음성 세션 종료 성공' : '별도 종료 처리 없음');
      
      await debugMediaState('VoiceManager 종료 후');

      if (window.stopAllOutgoingAudioGlobal) {
        window.stopAllOutgoingAudioGlobal();
      }

      await forceBrowserCleanupWithoutDummy();
      await debugMediaState('강제 정리 후');

      await voiceManager?.terminateVoiceSession?.();
      if (disconnect) disconnect();
      setTimeout(() => { 
        ['myrole_id','host_id','user_id','room_code','category','subtopic','mode'].forEach(k => localStorage.removeItem(k));
        window.location.href = '/'; 
      }, 500);
    } catch (e) { window.location.href = '/'; }
  };

  // 4.  버튼 라벨 강제 적용
  const uiLabels = {
    exit: ui.exit || (lang === 'ko' ? "나가기" : "Exit"),
    view_result: ui.view_result || (lang === 'ko' ? "결과 보기" : "View Results"),
    go_to_map: ui.go_to_map || (lang === 'ko' ? "라운드 선택으로" : "Back to Map")
  };

  return (
    <>
      <Layout round={completedTopics.length} subtopic={headerSubtopic} onBackClick={() => navigate('/game05_1')}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
          <ContentBox2 
            text={displayText} 
            width={936} height={407} 
          />

          <div style={{ display: 'flex', gap: 24 }}>
            {isCustomMode ? (
              <Continue3 label={uiLabels.exit} onClick={handleExit} />
            ) : (
              (completedTopics.includes('지구, 인간, AI') || completedTopics.includes('AWS 규제')) ? (
                <Continue3 label={uiLabels.view_result} onClick={handleViewResult} />
              ) : (
                <Continue label={uiLabels.go_to_map} onClick={handleNextRound} style={{ width: 264, height: 72 }} />
              )
            )}
          </div>
        </div>
      </Layout>

      {showPopup && <ResultPopup onClose={() => setShowPopup(false)} onViewResult={() => navigate('/game08')} />}
    </>
  );
}