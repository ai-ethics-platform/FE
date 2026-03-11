import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import ContentBox2 from '../components/ContentBox2';
import Continue from '../components/Continue';
import Continue3 from '../components/Continue3';
import ResultPopup from '../components/Results';
import { resolveParagraphs } from '../utils/resolveParagraphs';

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

  const lang = localStorage.getItem('app_lang') || 'ko';
  const isCustomMode   = !!localStorage.getItem('code');
  const creatorTitle   = localStorage.getItem('creatorTitle') || '';
  const baseSubtopic   = localStorage.getItem('subtopic') || '';
  const headerSubtopic = isCustomMode ? (creatorTitle || baseSubtopic) : baseSubtopic;

  const rawCategory = localStorage.getItem('category') || '안드로이드';
  const rawSubtopic = baseSubtopic;
  const roomCode    = localStorage.getItem('room_code');
  const mateName    = localStorage.getItem('mateName') || 'HomeMate';
  const ENDING_MODE = 'ending2'; 

  const currentLangData = translations[lang] || translations['ko'];
  const ui = useMemo(() => {
    const root = currentLangData?.UiElements || {};
    return root.UiElements || root;
  }, [currentLangData]);

  const langParagraphs = useMemo(() => {
    const root = currentLangData?.Paragraphs || {};
    return root.Paragraphs || root;
  }, [currentLangData]);

  const [displayText, setDisplayText] = useState(''); 
  const [completedTopics, setCompletedTopics] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [openProfile, setOpenProfile] = useState(null);

  // 결과 보기 버튼 활성화 여부 판별 (5라운드 이상 완료 시)
  const showResultButton = useMemo(() => completedTopics.length >= 5, [completedTopics]);

  const stableCategory = useMemo(() => {
    return rawCategory === '자율 무기 시스템' ? '자율 무기 시스템' : '안드로이드';
  }, [rawCategory]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    setCompletedTopics(saved);
    setCurrentRound(saved.length);
  }, []);

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
    const categoryData = langParagraphs[stableCategory];
    const subtopicData = categoryData ? categoryData[rawSubtopic] : null;
    const rawParagraphs = subtopicData ? subtopicData[ENDING_MODE] : [];

    if (rawParagraphs && rawParagraphs.length > 0) {
      const resolved = resolveParagraphs(rawParagraphs, mateName);
      setDisplayText(resolved.map(p => p?.main).filter(Boolean).join('\n\n'));
    } else {
      setDisplayText(lang === 'ko' ? '지문을 불러올 수 없습니다.' : 'Ending text not found.');
    }
  }, [stableCategory, rawSubtopic, isCustomMode, langParagraphs, mateName, lang]);

  const handleNextRound = () => {
    localStorage.removeItem('subtopic');
    localStorage.removeItem('mode');
    navigate('/gamemap');
  };

  const handleViewResult = () => {
    if (completedTopics.length >= 5) {
      localStorage.setItem('mode', 'disagree');
      navigate('/game08');
    } else {
      setShowPopup(true);
    }
  };

  const uiLabels = {
    exit: ui.exit || (lang === 'ko' ? "나가기" : "Exit"),
    view_result: ui.view_result || (lang === 'ko' ? "결과 보기" : "View Results"),
    go_to_map: ui.go_to_map || (lang === 'ko' ? "라운드 선택으로" : "Go to Round Selection"),
  };

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
    } catch (error) {
      console.error('브라우저 강제 정리 중 오류:', error);
    }
  };

  const handleExit = async () => {
    try {
      const result = await voiceManager?.terminateVoiceSession?.();
      if (window.stopAllOutgoingAudioGlobal) {
        window.stopAllOutgoingAudioGlobal();
      }
      await forceBrowserCleanupWithoutDummy();
      if (disconnect) disconnect();
      setTimeout(async () => {
        clearGameSession();
        window.location.href = '/'; 
      }, 500);
    } catch (e) {
      clearGameSession();
      window.location.href = '/'; 
    }
  };

  return (
    <>
      <Layout round={currentRound} subtopic={headerSubtopic} onBackClick={() => navigate('/game05_1')}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
          <ContentBox2 text={displayText || ''} width={936} height={407} />
          {isCustomMode ? (
            <Continue3 label={uiLabels.exit} onClick={handleExit} />
          ) : (
            showResultButton ? (
              <Continue3 label={uiLabels.view_result} onClick={handleViewResult} />
            ) : (
              <Continue label={uiLabels.go_to_map} onClick={handleNextRound} style={{ width: 264, height: 72 }} />
            )
          )}
        </div>
      </Layout>
      {showPopup && !isCustomMode && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <ResultPopup onClose={() => setShowPopup(false)} onViewResult={() => {
            localStorage.setItem('mode', 'disagree');
            navigate('/game08');
          }} />
        </div>
      )}
    </>
  );
}