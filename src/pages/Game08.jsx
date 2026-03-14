import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';      
import ContentBox3 from '../components/ContentBox3';
import Continue3 from '../components/Continue3';
import Continue from '../components/Continue';
import voiceManager from '../utils/voiceManager';

import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider';
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';
import { translations } from '../utils/language';

export default function Game08() {
  const navigate = useNavigate();
  
  // ✅ 선언부 및 훅 보존
  const { isConnected, disconnect, finalizeDisconnection } = useWebSocket();
  const { isInitialized: webrtcInitialized } = useWebRTC();
  const { isHost } = useHostActions();

  const [paragraphs, setParagraphs] = useState([]);
  const [openProfile, setOpenProfile] = useState(null); 
  
  const lang = localStorage.getItem('app_lang') || 'ko';
  const t = useMemo(() => translations[lang]?.Game08 || translations['ko'].Game08, [lang]); 
  const subtopic = t.subtopic || '결과: 우리들의 선택'; 

  // ✅ 방장-참여자 페이지 동기화 훅 유지
  useWebSocketNavigation(navigate, { infoPath: `/game09`, nextPagePath: `/game09` });

  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const results   = JSON.parse(localStorage.getItem('subtopicResults') ?? '{}');
    const category  = localStorage.getItem('category') || '안드로이드';
    const isAWS     = category === '자율 무기 시스템';

    const has = (key) => completed.includes(key);
    const getRes = (key) => results[key] || 'agree';

    if (isAWS) {
      // --- AWS 1문단 ---
      let p1;
      const d1 = t.aws.p1;
      if (has('AI 알고리즘 공개') && has('AWS의 권한')) {
        p1 = `${d1.full.intro}${d1.full.opt1[getRes('AI 알고리즘 공개')]}${d1.full.mid}${d1.full.opt2[getRes('AWS의 권한')]}${d1.full.end}`;
      } else if (has('AI 알고리즘 공개')) {
        p1 = `${d1.partial.intro}${d1.partial.opt1[getRes('AI 알고리즘 공개')]}${d1.partial.end}`;
      } else {
        p1 = d1.default;
      }

      // --- AWS 2문단 ---
      let p2;
      const d2 = t.aws.p2;
      if (has('사람이 죽지 않는 전쟁') && has('AI의 권리와 책임')) {
        p2 = `${d2.full.intro}${d2.full.opt1[getRes('사람이 죽지 않는 전쟁')]}${d2.full.mid}${d2.full.opt2[getRes('AI의 권리와 책임')]}${d2.full.end}`;
      } else if (has('사람이 죽지 않는 전쟁')) {
        p2 = `${d2.partial.intro}${d2.partial.opt1[getRes('사람이 죽지 않는 전쟁')]}${d2.partial.end}`;
      } else {
        p2 = d2.default;
      }

      // --- AWS 3문단 ---
      const p3 = has('AWS 규제') 
        ? `${t.aws.p3.played.intro}${t.aws.p3.played.opt[getRes('AWS 규제')]}${t.aws.p3.played.end}`
        : t.aws.p3.default;

      setParagraphs([p1, p2, p3, t.aws.p4]);
    } else {
      // --- 안드로이드 1문단 ---
      let p1;
      const d1 = t.android.p1;
      if (has('AI의 개인 정보 수집') && has('안드로이드의 감정 표현')) {
        p1 = `${d1.full.intro}${d1.full.opt1[getRes('AI의 개인 정보 수집')]}${d1.full.mid}${d1.full.opt2[getRes('안드로이드의 감정 표현')]}${d1.full.end}`;
      } else if (has('AI의 개인 정보 수집')) {
        p1 = `${d1.partial.intro}${d1.partial.opt1[getRes('AI의 개인 정보 수집')]}${d1.partial.end}`;
      } else {
        p1 = d1.default;
      }

      // --- 안드로이드 2문단 ---
      let p2;
      const d2 = t.android.p2;
      if (has('아이들을 위한 서비스') && has('설명 가능한 AI')) {
        p2 = `${d2.full.intro}${d2.full.opt1[getRes('아이들을 위한 서비스')]}${d2.full.mid}${d2.full.opt2[getRes('설명 가능한 AI')]}${d2.full.end}`;
      } else if (has('아이들을 위한 서비스')) {
        p2 = `${d2.partial.intro}${d2.partial.opt1[getRes('아이들을 위한 서비스')]}${d2.partial.end}`;
      } else {
        p2 = d2.default;
      }

      // --- 안드로이드 3문단 ---
      const p3 = has('지구, 인간, AI')
        ? `${t.android.p3.played.intro}${t.android.p3.played.opt[getRes('지구, 인간, AI')]}${t.android.p3.played.end}`
        : t.android.p3.default;

      setParagraphs([p1, p2, p3, t.android.p4]);
    }
  }, [lang, t]);

  const handleExit = async () => {
    try {
      await voiceManager.terminateVoiceSession();
      await finalizeDisconnection?.('게임을 나갔습니다.');
    } catch (e) {
      window.location.href = '/';
    }
  };

  const handleBackClick = () => {
    const mode = localStorage.getItem('mode');
    navigate(mode === 'agree' ? '/game06' : '/game07'); 
  };

  return (
    <Layout subtopic={subtopic} onProfileClick={setOpenProfile} onBackClick={handleBackClick} >
      <div style={{ position: 'absolute', top: '60%', left: '50%', transform: 'translate(-50%,-50%)', width: '80vw', maxWidth: 936, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px' }}>
        <ContentBox3 text={paragraphs.join('\n\n')} width={936} height={407} />
        
        <div style={{ marginTop: 20, display: "flex", gap: 30, justifyContent: "center" }}>
          <Continue 
            label={t.buttons?.future || "다른 미래 보러가기"} 
            width={264} height={72} 
            onClick={() => navigate('/game09')} 
          />
          <Continue3 
            label={t.buttons?.exit || "나가기"} 
            width={264} height={72} 
            onClick={handleExit} 
          />
        </div>
      </div>
    </Layout>
  );
}