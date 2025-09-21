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
// export default function Game07() {
//   const navigate = useNavigate();
// const { isConnected, sessionId, sendMessage } = useWebSocket();
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
   
//      console.log('🔧 [Game07] 연결 상태 업데이트:', newStatus);
//    }, [isConnected, webrtcInitialized]);
//   //  useEffect(() => {
//   //     if (!isConnected) {
//   //       console.warn('❌ WebSocket 연결 끊김 감지됨');
//   //       alert('⚠️ 연결이 끊겨 게임이 초기화됩니다.');
//   //       clearAllLocalStorageKeys();     
//   //       navigate('/');
//   //     }
//   //   }, [isConnected]);

//   const subtopic = localStorage.getItem('subtopic');
//   const category = localStorage.getItem('category');
//   const roomCode = localStorage.getItem('room_code');
//   const mode      = 'ending2';
//   const [mateName, setMateName] = useState('HomeMate');
//   const [paragraphs, setParagraphs]   = useState([]); 
//   const [completedTopics, setCompletedTopics] = useState([]);
//   const [currentRound, setCurrentRound] = useState(1);
//   const [showPopup, setShowPopup] = useState(false);

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
//     //saveCompletedTopic();
//     localStorage.removeItem('category');
//     localStorage.removeItem('subtopic');
//     localStorage.removeItem('mode');
//     // if (!isHost) {
//     //   alert(' 방장만 다음 라운드로 진행할 수 있습니다.');
//     //   return;
//     // }
//     navigate('/gamemap');
//   };

//   const handleViewResult = () => {
//     //saveCompletedTopic();
//     // if (!isHost) {
//     //   alert(' 방장만 결과 보기로 진행할 수 있습니다.');
//     //   return;
//     // }
//     // sendNextPage();
//     if (completedTopics.length >= 5) 
//       {
//         localStorage.setItem('mode','disagree');
//         navigate('/game08');
//       }
//     else setShowPopup(true);
//   };

//   //const isResultAvailable = completedTopics.length >= 3;
//  // 결과보기 조건 수정 
//  const hasMinimumRounds = completedTopics.length >= 3;
//  const hasCompletedInternational = completedTopics.includes('지구, 인간, AI');
//  const showResultButton = hasCompletedInternational;
//  const [openProfile, setOpenProfile] = useState(null);
//  const handleBackClick = () => {
//   navigate('/game05_1'); 
// };
//   return (
//     <>
//       <Layout round={currentRound} subtopic={subtopic} onProfileClick={setOpenProfile}  onBackClick={handleBackClick} >
     
//         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
//           <ContentBox2 text={paragraphs[0]?.main || ''} width={936} height={407} />
   
//            {showResultButton ? (
//                       <Continue3
//                         label="결과 보기"
//                         onClick={handleViewResult}
//                       />
//                     ) : (
//                       <Continue
//                         label="라운드 선택으로"
//                         onClick={handleNextRound}
//                         style={{ width: 264, height: 72 }}
//                       />
//                     )}
//         </div>
//       </Layout>

//       {showPopup && (
//         <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
//           <ResultPopup onClose={() => setShowPopup(false)} onViewResult={handleViewResult} />
//         </div>
//       )}
//     </>
//   );
// }

// pages/Game07.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import ContentBox2 from '../components/ContentBox2';
import Continue from '../components/Continue';
import Continue3 from '../components/Continue3';
import ResultPopup from '../components/Results';
import { resolveParagraphs } from '../utils/resolveParagraphs';
import { paragraphsData } from '../components/paragraphs';
import axiosInstance from '../api/axiosInstance';
import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider';
import { useHostActions } from '../hooks/useWebSocketMessage';
import voiceManager from '../utils/voiceManager';
import { clearAllLocalStorageKeys } from '../utils/storage';

export default function Game07() {
  const navigate = useNavigate();

  const { isConnected, reconnectAttempts, maxReconnectAttempts,disconnect,finalizeDisconnection } = useWebSocket();
  const { isInitialized: webrtcInitialized } = useWebRTC();
  const { isHost } = useHostActions();

  //  커스텀 모드/제목 치환
  const isCustomMode   = !!localStorage.getItem('code');
  const creatorTitle   = localStorage.getItem('creatorTitle') || '';
  const baseSubtopic   = localStorage.getItem('subtopic') || '';
  const headerSubtopic = isCustomMode ? (creatorTitle || baseSubtopic) : baseSubtopic;

  const category = localStorage.getItem('category');
  const subtopic = baseSubtopic;
  const roomCode = localStorage.getItem('room_code');
  const mode     = 'ending2'; // disagree 엔딩

  const [paragraphs, setParagraphs] = useState([]);
  const [displayText, setDisplayText] = useState(''); 
  const [completedTopics, setCompletedTopics] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [openProfile, setOpenProfile] = useState(null);

  // 결과보기 버튼 노출 조건(기존 로직 유지)
  const hasCompletedInternational = completedTopics.includes('지구, 인간, AI')||completedTopics.includes('AWS 규제');
  const showResultButton = hasCompletedInternational;

  // 라운드/완료 토픽 로드
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    setCompletedTopics(saved);
    setCurrentRound(saved.length);
  }, []);

  // 기본(템플릿) 엔딩 텍스트 준비
  useEffect(() => {
    const storedName = localStorage.getItem('mateName') || 'HomeMate';
    const rawParagraphs = paragraphsData[category]?.[subtopic]?.[mode] || [];
    const resolved = resolveParagraphs(rawParagraphs, storedName);
    setParagraphs(resolved);
    const joined = resolved.map(p => p?.main).filter(Boolean).join('\n\n');
    if (!isCustomMode) setDisplayText(joined || '');
  }, [category, subtopic, mode, isCustomMode]);
  

    // useEffect(() => {
    //   if (!isConnected && reconnectAttempts >= maxReconnectAttempts) {
    //     console.warn('🚫 WebSocket 재연결 실패 → 게임 초기화');
    //     alert('⚠️ 연결을 복구하지 못했습니다. 게임이 초기화됩니다.');
    //     clearAllLocalStorageKeys();
    //     navigate('/');
    //   }
    // }, [isConnected, reconnectAttempts, maxReconnectAttempts]);
    useEffect(() => {
            let cancelled = false;
            const isReloadingGraceLocal = () => {
              const flag = sessionStorage.getItem('reloading') === 'true';
              const expire = parseInt(sessionStorage.getItem('reloading_expire_at') || '0', 10);
              if (!flag) return false;
              if (Date.now() > expire) {
                sessionStorage.removeItem('reloading');
                sessionStorage.removeItem('reloading_expire_at');
                return false;
              }
              return true;
            };
          
            if (!isConnected) {
              // 1) reloading-grace가 켜져 있으면 finalize 억제
              if (isReloadingGraceLocal()) {
                console.log('♻️ reloading grace active — finalize 억제');
                return;
              }
          
              // 2) debounce: 잠깐 기다렸다가 여전히 끊겨있으면 finalize
              const DEBOUNCE_MS = 1200;
              const timer = setTimeout(() => {
                if (cancelled) return;
                if (!isConnected && !isReloadingGraceLocal()) {
                  console.warn('🔌 WebSocket 연결 끊김 → 초기화 (확정)');
                  finalizeDisconnection('❌ 연결이 끊겨 게임이 초기화됩니다.');
                } else {
                  console.log('🔁 재연결/리로드 감지 — finalize 스킵');
                }
              }, DEBOUNCE_MS);
          
              return () => {
                cancelled = true;
                clearTimeout(timer);
              };
            }
          }, [isConnected, finalizeDisconnection]);
      
    

  //  커스텀 모드: disagree_Ending 적용
  useEffect(() => {
    if (!isCustomMode) return;

    const raw = localStorage.getItem('disagreeEnding');
    if (!raw) {
      const fallback = paragraphs.map(p => p?.main).filter(Boolean).join('\n\n');
      setDisplayText(fallback || '');
      return;
    }

    let text = '';
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        text = parsed.map(s => String(s ?? '').trim()).filter(Boolean).join('\n\n');
      } else {
        text = String(parsed ?? '').trim();
      }
    } catch {
      text = String(raw ?? '').trim();
    }

    if (!text) {
      const fallback = paragraphs.map(p => p?.main).filter(Boolean).join('\n\n');
      setDisplayText(fallback || '');
    } else {
      setDisplayText(text);
    }
  }, [isCustomMode, paragraphs]);

  // 기존 흐름 유지용 핸들러
  const handleNextRound = () => {
    //localStorage.removeItem('category');
    localStorage.removeItem('subtopic');
    localStorage.removeItem('mode');
    navigate('/gamemap');
  };

  const handleViewResult = () => {
    if (completedTopics.length >= 5) {
      localStorage.setItem('mode','disagree');
      navigate('/game08');
    } else {
      setShowPopup(true);
    }
  };

  const handleBackClick = () => navigate('/game05_1');

  // ===== Game08의 “나가기” 종료 루틴 이식 (로그인 페이지로 이동) =====
  function clearGameSession() {
    [
      'myrole_id','host_id','user_id','role1_user_id','role2_user_id','role3_user_id',
      'room_code','category','subtopic','mode','access_token','refresh_token',
      'mateName','nickname','title','session_id','selectedCharacterIndex',
      'currentRound','completedTopics','subtopicResults',
      // 커스텀 관련 키들도 정리
      'code','creatorTitle','char1','char2','char3','charDes1','charDes2','charDes3',
      'dilemma_image_3','dilemma_image_4_1','dilemma_image_4_2',
      'dilemma_situation','dilmma_situation','question','agree_label','disagree_label',
      'agreeEnding','disagreeEnding','flips_agree_texts','flips_disagree_texts'
    ].forEach(key => localStorage.removeItem(key));
  }

  const forceBrowserCleanupWithoutDummy = async () => {
    try {
      if (window.voiceManager) {
        if (window.voiceManager.mediaRecorder) {
          try {
            if (window.voiceManager.mediaRecorder.state === 'recording') {
              window.voiceManager.mediaRecorder.stop();
            }
          } catch {}
          window.voiceManager.mediaRecorder = null;
        }
        if (window.voiceManager.mediaStream) {
          window.voiceManager.mediaStream.getTracks().forEach(track => {
            if (track.readyState !== 'ended') track.stop();
          });
          window.voiceManager.mediaStream = null;
        }
        window.voiceManager.isRecording = false;
        window.voiceManager.isConnected = false;
        window.voiceManager.sessionInitialized = false;
        window.voiceManager.recordedChunks = [];
        if (window.voiceManager.audioContext) {
          try {
            if (window.voiceManager.audioContext.state !== 'closed') {
              await window.voiceManager.audioContext.close();
            }
          } catch {}
          window.voiceManager.audioContext = null;
        }
      }

      document.querySelectorAll('*').forEach(el => {
        if (el.srcObject && typeof el.srcObject.getTracks === 'function') {
          el.srcObject.getTracks().forEach(track => {
            if (track.readyState !== 'ended') track.stop();
          });
          el.srcObject = null;
        }
      });

      try {
        const permission = await navigator.permissions.query?.({ name: 'microphone' });
        if (permission) console.log(`🎤 마이크 권한: ${permission.state}`);
      } catch {}
    } catch (error) {
      console.error('브라우저 강제 정리 중 오류:', error);
    }
  };

  const debugMediaState = async (step) => {
    console.log(`📊 [${step}] 미디어 상태 디버깅:`);
    if (window.voiceManager) {
      const status = window.voiceManager.getStatus?.() ?? {};
      console.log('  VoiceManager 상태:', status);
      if (window.voiceManager.mediaStream) {
        const tracks = window.voiceManager.mediaStream.getTracks();
        console.log('  MediaStream:', {
          id: window.voiceManager.mediaStream.id,
          active: window.voiceManager.mediaStream.active,
          trackCount: tracks.length
        });
        tracks.forEach((t, i) => console.log(`    Track ${i+1}:`, {
          kind: t.kind, enabled: t.enabled, readyState: t.readyState, label: t.label
        }));
      }
    }
    const els = document.querySelectorAll('*');
    let cnt = 0;
    els.forEach(el => { if (el.srcObject) cnt++; });
    console.log(`  DOM srcObject 개수: ${cnt}`);
  };

  const handleExit = async () => {
    try {
      await debugMediaState('종료 전');
      await forceBrowserCleanupWithoutDummy();
      await debugMediaState('강제 정리 후');

      const result = await voiceManager?.terminateVoiceSession?.();
      console.log(result ? '음성 세션 종료 성공' : '별도 종료 처리 없음');

      if (window.stopAllOutgoingAudioGlobal) {
        window.stopAllOutgoingAudioGlobal();
      }

      await forceBrowserCleanupWithoutDummy();

      if (disconnect) disconnect();

      setTimeout(async () => {
        await debugMediaState('최종');
        clearGameSession();
        window.location.href = '/'; 
      }, 500);
    } catch (e) {
      console.error('게임 종료 중 오류:', e);
      await forceBrowserCleanupWithoutDummy();
      clearGameSession();
      window.location.href = '/'; 
    }
  };

  return (
    <>
      <Layout
        round={currentRound}
        subtopic={headerSubtopic}   
        onProfileClick={setOpenProfile}
        onBackClick={() => navigate('/game05_1')}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
          <ContentBox2 text={displayText || ''} width={936} height={407} />

          {/* 커스텀 모드: 나가기 / 기본: 기존 버튼 */}
          {isCustomMode ? (
            <Continue3 label="나가기" onClick={handleExit} />
          ) : (
            showResultButton ? (
              <Continue3 label="결과 보기" onClick={handleViewResult} />
            ) : (
              <Continue
                label="라운드 선택으로"
                onClick={handleNextRound}
                style={{ width: 264, height: 72 }}
              />
            )
          )}
        </div>
      </Layout>

      {showPopup && !isCustomMode && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <ResultPopup onClose={() => setShowPopup(false)} onViewResult={handleViewResult} />
        </div>
      )}
    </>
  );
}
