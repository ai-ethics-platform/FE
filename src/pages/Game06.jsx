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
  const { disconnect, finalizeDisconnection } = useWebSocket(); 
  const lang = localStorage.getItem('app_lang') || 'ko';
  
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
  const rawSubtopic = localStorage.getItem('subtopic') || ''; // 한글값 유지됨
  const headerSubtopic = isCustomMode ? (localStorage.getItem('creatorTitle') || rawSubtopic) : rawSubtopic;
  const mateName = localStorage.getItem('mateName') || 'HomeMate';

  const [displayText, setDisplayText] = useState(''); 
  const [showPopup, setShowPopup] = useState(false);
  const [completedTopics, setCompletedTopics] = useState([]);

  const ENDING_MODE = 'ending1'; 

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
      const raw = localStorage.getItem('agreeEnding');
      if (raw) setDisplayText(String(raw));
      return;
    }

    const categoryData = langParagraphs[stableCategory];
    const subtopicData = categoryData ? categoryData[rawSubtopic] : null;
    const rawParagraphs = subtopicData ? subtopicData[ENDING_MODE] : []; 
    
    if (rawParagraphs && rawParagraphs.length > 0) {
      const resolved = resolveParagraphs(rawParagraphs, mateName);
      setDisplayText(resolved.map(p => p?.main).filter(Boolean).join('\n\n'));
    } else {
      setDisplayText(lang === 'ko' ? '지문을 찾을 수 없습니다.' : 'Ending text not found.');
    }
  }, [stableCategory, rawSubtopic, isCustomMode, langParagraphs, mateName, lang]);

  const handleNextRound = () => {
    localStorage.removeItem('subtopic');
    localStorage.removeItem('mode');
    navigate('/gamemap');
  };

  const handleViewResult = () => {
    localStorage.setItem('mode', 'agree');
    // 라운드 개수(5개) 미달 시 팝업, 충족 시 바로 이동
    if (completedTopics.length >= 5) {
      navigate('/game08');
    } else { 
      setShowPopup(true); 
    }
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

  const uiLabels = {
    exit: ui.exit || (lang === 'ko' ? "나가기" : "Exit"),
    view_result: ui.view_result || (lang === 'ko' ? "결과 보기" : "View Results"),
    go_to_map: ui.go_to_map || (lang === 'ko' ? "라운드 선택으로" : "Go to Round Selection"),
  };

  return (
    <>
      <Layout round={completedTopics.length} subtopic={headerSubtopic} onBackClick={() => navigate('/game05_1')}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
          <ContentBox2 text={displayText} width={936} height={407} />
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
      {showPopup && <ResultPopup onClose={() => setShowPopup(false)} onViewResult={() => {
        localStorage.setItem('mode', 'agree');
        navigate('/game08');
      }} />}
    </>
  );
}