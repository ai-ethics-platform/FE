import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import ContentBox2 from '../components/ContentBox2';
import Continue from '../components/Continue';
import Continue3 from '../components/Continue3';
import ResultPopup from '../components/Results';
import { resolveParagraphs } from '../utils/resolveParagraphs';

// [수정] 구형 데이터 import 삭제 -> 다국어 패키지 import
// import { paragraphsData } from '../components/paragraphs'; 
import { translations } from '../utils/language';

import axiosInstance from '../api/axiosInstance';
import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider';
import { useHostActions } from '../hooks/useWebSocketMessage';
import voiceManager from '../utils/voiceManager';
import { clearAllLocalStorageKeys } from '../utils/storage';

export default function Game07() {
  const navigate = useNavigate();

  const { isConnected, reconnectAttempts, maxReconnectAttempts, disconnect, finalizeDisconnection } = useWebSocket();
  const { isInitialized: webrtcInitialized } = useWebRTC();
  const { isHost } = useHostActions();

  // 1. 기초 환경 설정
  const lang = localStorage.getItem('app_lang') || 'ko';
  
  const isCustomMode   = !!localStorage.getItem('code');
  const creatorTitle   = localStorage.getItem('creatorTitle') || '';
  const baseSubtopic   = localStorage.getItem('subtopic') || '';
  const headerSubtopic = isCustomMode ? (creatorTitle || baseSubtopic) : baseSubtopic;

  const rawCategory = localStorage.getItem('category') || '안드로이드';
  const rawSubtopic = baseSubtopic;
  const roomCode    = localStorage.getItem('room_code');
  const mateName    = localStorage.getItem('mateName') || 'HomeMate';
  
  // Game07은 비동의(ending2) 고정
  const ENDING_MODE = 'ending2'; 

  // 2. [구조 대응] 데이터 봉투 해제
  const currentLangData = translations[lang] || translations['ko'];
  
  // UiElements (버튼용)
  const ui = useMemo(() => {
    const root = currentLangData?.UiElements || {};
    return root.UiElements || root;
  }, [currentLangData]);

  // Paragraphs (지문용)
  const langParagraphs = useMemo(() => {
    const root = currentLangData?.Paragraphs || {};
    return root.Paragraphs || root;
  }, [currentLangData]);

  // 3. [키 매칭] Stable Key 도출
  const stableKeys = useMemo(() => {
    const category = rawCategory.includes('자율 무기 시스템') || rawCategory.toLowerCase().includes('weapon') 
      ? '자율 무기 시스템' 
      : '안드로이드';
    return { category, subtopic: rawSubtopic };
  }, [rawCategory, rawSubtopic]);

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

  // 4. [지문 출력] 다국어 데이터 연동
  useEffect(() => {
    if (isCustomMode) {
      const raw = localStorage.getItem('disagreeEnding');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setDisplayText(Array.isArray(parsed) ? parsed.join('\n\n') : String(parsed));
        } catch { setDisplayText(String(raw)); }
        return;
      }
    }

    // 표준 지문 로드: [카테고리][주제][ending2]
    const categoryData = langParagraphs[stableKeys.category];
    const subtopicData = categoryData ? categoryData[stableKeys.subtopic] : null;
    const rawParagraphs = subtopicData ? subtopicData[ENDING_MODE] : [];

    if (rawParagraphs && rawParagraphs.length > 0) {
      const resolved = resolveParagraphs(rawParagraphs, mateName);
      setDisplayText(resolved.map(p => p?.main).filter(Boolean).join('\n\n'));
    } else {
      setDisplayText(lang === 'ko' ? '지문을 불러올 수 없습니다.' : 'Ending text not found.');
    }
  }, [stableKeys, isCustomMode, langParagraphs, mateName, lang]);


  // [복구 완료] 기존 개발자 주석 및 미구현 코드 유지
  // useEffect(() => {
  //    if (!isConnected && reconnectAttempts >= maxReconnectAttempts) {
  //      console.warn('🚫 WebSocket 재연결 실패 → 게임 초기화');
  //      alert('⚠️ 연결을 복구하지 못했습니다. 게임이 초기화됩니다.');
  //      clearAllLocalStorageKeys();
  //      navigate('/');
  //    }
  // }, [isConnected, reconnectAttempts, maxReconnectAttempts]);
    

  // 수정 끝나면 돌아와야함 
  // useEffect(() => {
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


  // 기존 흐름 유지용 핸들러
  const handleNextRound = () => {
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

  const handleBackClick = () => {
    const idx = window.history.state?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate('/game05_1');
  };

  // 5. [버튼 라벨] UiElements 강제 주입
  const uiLabels = {
    exit: ui.exit || (lang === 'ko' ? "나가기" : "Exit"),
    view_result: ui.view_result || (lang === 'ko' ? "결과 보기" : "View Results"),
    go_to_map: ui.go_to_map || (lang === 'ko' ? "라운드 선택으로" : "Back to Map")
  };

  // ===== Game08의 “나가기” 종료 루틴 이식 =====
  function clearGameSession() {
    [
      'myrole_id','host_id','user_id','role1_user_id','role2_user_id','role3_user_id',
      'room_code','category','subtopic','mode','access_token','refresh_token',
      'mateName','nickname','title','session_id','selectedCharacterIndex',
      'currentRound','completedTopics','subtopicResults',
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
      // ... (상세 로그 유지)
    }
  };

  const handleExit = async () => {
    try {
      await debugMediaState('종료 전');
      await forceBrowserCleanupWithoutDummy();
      
      const result = await voiceManager?.terminateVoiceSession?.();
      
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
        onBackClick={handleBackClick}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
          <ContentBox2 text={displayText || ''} width={936} height={407} />

          {/* 커스텀 모드: 나가기 / 기본: 기존 버튼 */}
          {isCustomMode ? (
            <Continue3 label={uiLabels.exit} onClick={handleExit} />
          ) : (
            showResultButton ? (
              <Continue3 label={uiLabels.view_result} onClick={handleViewResult} />
            ) : (
              <Continue
                label={uiLabels.go_to_map}
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