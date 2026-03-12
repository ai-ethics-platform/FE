import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import ContentBox2 from '../components/ContentBox2';
import Continue from '../components/Continue';
import Continue3 from '../components/Continue3';
import ResultPopup from '../components/Results';
import { resolveParagraphs } from '../utils/resolveParagraphs';

import { translations } from '../utils/language';
import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider';
import { useHostActions } from '../hooks/useWebSocketMessage';
import voiceManager from '../utils/voiceManager';

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
  const rawSubtopic = baseSubtopic; // 한글값 유지됨
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
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    setCompletedTopics(saved);
  }, []);

  const stableCategory = useMemo(() => {
    return rawCategory === '자율 무기 시스템' ? '자율 무기 시스템' : '안드로이드';
  }, [rawCategory]);

  // ✅ [최적화] subtopic 한글 고정값을 직접 비교하여 마지막 라운드 판별
  const isFinalRound = useMemo(() => {
    const target = rawSubtopic.trim();
    return target === '지구, 인간, AI' || target === 'AWS 규제';
  }, [rawSubtopic]);

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
    localStorage.setItem('mode', 'disagree');
    if (completedTopics.length >= 5) {
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

  const handleExit = async () => {
    try {
      await voiceManager?.terminateVoiceSession?.();
      if (disconnect) disconnect();
      setTimeout(() => { 
        ['myrole_id','host_id','user_id','room_code','category','subtopic','mode'].forEach(k => localStorage.removeItem(k));
        window.location.href = '/'; 
      }, 500);
    } catch (e) { window.location.href = '/'; }
  };

  return (
    <>
      <Layout round={completedTopics.length} subtopic={headerSubtopic} onBackClick={() => navigate('/game05_1')}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
          <ContentBox2 text={displayText || ''} width={936} height={407} />
          <div style={{ display: 'flex', gap: 24 }}>
            {isCustomMode ? (
              <Continue3 label={uiLabels.exit} onClick={handleExit} />
            ) : (
              isFinalRound ? (
                <Continue3 label={uiLabels.view_result} onClick={handleViewResult} />
              ) : (
                <Continue label={uiLabels.go_to_map} onClick={handleNextRound} style={{ width: 264, height: 72 }} />
              )
            )}
          </div>
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