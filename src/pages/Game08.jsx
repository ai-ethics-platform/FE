import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';      
import ContentBox3 from '../components/ContentBox3';
import Continue3 from '../components/Continue3';
import voiceManager from '../utils/voiceManager';

import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider';
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';
import { Colors, FontStyles } from '../components/styleConstants';
import Continue from '../components/Continue';
import { translations } from '../utils/language';

export default function Game08() {
  const navigate = useNavigate();
  const { isConnected, disconnect, finalizeDisconnection } = useWebSocket();
  const { isInitialized: webrtcInitialized } = useWebRTC();
  const { isHost } = useHostActions();

  const [paragraphs, setParagraphs] = useState([]);
  const [openProfile, setOpenProfile] = useState(null);
  
  const lang = localStorage.getItem('app_lang') || 'ko';
  const t = translations[lang]?.Game08 || translations['ko'].Game08; 
  const subtopic = t.subtopic || '결과: 우리들의 선택'; 

  useWebSocketNavigation(navigate, { infoPath: `/game09`, nextPagePath: `/game09` });

  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const results   = JSON.parse(localStorage.getItem('subtopicResults') ?? '{}');
    const category  = localStorage.getItem('category') || '안드로이드';
    const isAWS     = category === '자율 무기 시스템';
  
    if (isAWS) {
      const rExplain  = results['AI 알고리즘 공개'] || 'agree';
      const rPower    = results['AWS의 권한'] || 'agree';
      const rZeroWar  = results['사람이 죽지 않는 전쟁'] || 'agree';
      const rRights   = results['AI의 권리와 책임'] || 'agree';
      const rRegulate = results['AWS 규제'] || 'agree'; 
  
      const p1Data = t.aws.p1;
      const p1 = `${p1Data.intro}${p1Data.opt1[rExplain]}${p1Data.mid}${p1Data.opt2[rPower]}${p1Data.end}`;
      const p2Data = t.aws.p2;
      const p2 = `${p2Data.intro}${p2Data.opt1[rZeroWar]}${p2Data.mid}${p2Data.opt2[rRights]}${p2Data.end}`;
      const p3Data = t.aws.p3;
      const p3 = `${p3Data.intro}${p3Data.opt1[rRegulate]}${p3Data.end}`;
      const p4 = t.aws.p4;
  
      setParagraphs([p1, p2, p3, p4]);
      return;
    }
  
    const ai = results['AI의 개인 정보 수집'];
    const p1Type = (ai === 'disagree') ? 'safe' : 'convenient';
    const p1 = t.android.p1[p1Type];
    const kids = results['아이들을 위한 서비스'];
    const p2Type = (kids === 'agree') ? 'safe' : 'convenient';
    const p2 = t.android.p2[p2Type];
    const earth = results['지구, 인간, AI'];
    const p3Type = (earth === 'agree') ? 'env' : 'fast';
    const p3 = t.android.p3[p3Type];
    const p4 = t.android.p4;
  
    setParagraphs([p1, p2, p3, p4]);
  }, [lang, t]);

  const handleBackClick = () => {
    const mode = localStorage.getItem('mode');
    navigate(mode === 'agree' ? '/game06' : '/game07'); 
  };

  const forceBrowserCleanupWithoutDummy = async () => {
    try {
      if (window.voiceManager) {
        if (window.voiceManager.mediaStream) {
          window.voiceManager.mediaStream.getTracks().forEach(track => track.stop());
        }
        if (window.voiceManager.audioContext && window.voiceManager.audioContext.state !== 'closed') {
          await window.voiceManager.audioContext.close();
        }
      }
    } catch (e) {}
  };

  const handleExit = async () => {
    try {
      await voiceManager.terminateVoiceSession();
      await forceBrowserCleanupWithoutDummy();
      await finalizeDisconnection?.('게임을 나갔습니다.');
    } catch (e) {
      await finalizeDisconnection?.('게임을 나갔습니다.');
    }
  };

  return (
    <Layout subtopic={subtopic} onBackClick={handleBackClick} >
      <div style={{position:'absolute',top:'60%',left:'50%',transform:'translate(-50%,-50%)',width:'80vw',maxWidth:936,display:'flex',flexDirection:'column',alignItems:'center',padding:'0 16px'}}>
        <ContentBox3 text={paragraphs.join('\n\n')} width={936} height={407} />
        <div style={{ marginTop: 20, display: "flex", gap: 30, justifyContent: "center" }} >
          <Continue label={t.buttons?.future || "다른 미래 보러가기"} width={264} height={72} onClick={() => navigate('/game09')} />
          <Continue3 label={t.buttons?.exit || "나가기"} width={264} height={72} onClick={handleExit} />
        </div>
      </div>
    </Layout>
  );
}