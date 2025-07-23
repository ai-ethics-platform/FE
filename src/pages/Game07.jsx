import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import ContentBox2 from '../components/ContentBox2';
import Continue from '../components/Continue';
import Continue3 from '../components/Continue3';
import ResultPopup from '../components/Results';
import { resolveParagraphs } from '../utils/resolveParagraphs';
import { paragraphsData } from '../components/paragraphs';

//  WebRTC integration
import axiosInstance from '../api/axiosInstance';
import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider';
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';


export default function Game07() {
  const navigate = useNavigate();
const { isConnected, sessionId, sendMessage } = useWebSocket();
   const { voiceSessionStatus, isInitialized: webrtcInitialized } = useWebRTC();
   const { isHost } = useHostActions();
    const [connectionStatus, setConnectionStatus] = useState({
     websocket: false,
     webrtc: false,
     ready: false
   });

  useEffect(() => {
     const newStatus = {
       websocket: isConnected,
       webrtc: webrtcInitialized,
       ready: isConnected && webrtcInitialized
     };
     setConnectionStatus(newStatus);
   
     console.log('🔧 [Game02] 연결 상태 업데이트:', newStatus);
   }, [isConnected, webrtcInitialized]);


  const subtopic = localStorage.getItem('subtopic');
  const category = localStorage.getItem('category');
  const roomCode = localStorage.getItem('room_code');
  const mode      = 'ending2';
  const [mateName, setMateName] = useState('HomeMate');
  const [paragraphs, setParagraphs]   = useState([]); 
  const [completedTopics, setCompletedTopics] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [showPopup, setShowPopup] = useState(false);

  // Load completed topics
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    setCompletedTopics(saved);
    setCurrentRound(saved.length + 1);
  }, []);

  useEffect(() => {
    const storedName = localStorage.getItem('mateName');
    if (storedName) {
      setMateName(storedName);

       const rawParagraphs = paragraphsData[category]?.[subtopic]?.[mode] || [];
       setParagraphs(resolveParagraphs(rawParagraphs, storedName));


    } else {
      (async () => {
        try {
          const res = await axiosInstance.get('/rooms/ai-name', { params: { room_code: roomCode } });
          const aiName = res.data.ai_name || 'HomeMate';
          setMateName(aiName);
          localStorage.setItem('mateName', aiName);

        const rawParagraphs = paragraphsData[category]?.[subtopic]?.[mode] || [];
         setParagraphs(resolveParagraphs(rawParagraphs, aiName));

        } catch (err) {
          console.error('AI 이름 로딩 실패:', err);
          const fallback = 'HomeMate';
          setMateName(fallback);
          const [resolved] = resolveParagraphs(raw, fallback);
          setParagraph(resolved);
        }
      })();
    }
  }, [roomCode]);

  
  const saveCompletedTopic = () => {
    const current = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    if (!current.includes(subtopic)) {
      const updated = [...current, subtopic];
      localStorage.setItem('completedTopics', JSON.stringify(updated));
      setCompletedTopics(updated);
      localStorage.setItem('currentRound', updated.length.toString());
    }
  };

  const handleNextRound = () => {
    saveCompletedTopic();
    localStorage.removeItem('category');
    localStorage.removeItem('subtopic');
    localStorage.removeItem('mode');
    // if (!isHost) {
    //   alert('⚠️ 방장만 다음 라운드로 진행할 수 있습니다.');
    //   return;
    // }
    navigate('/gamemap');
  };

  const handleViewResult = () => {
    saveCompletedTopic();
    // if (!isHost) {
    //   alert('⚠️ 방장만 결과 보기로 진행할 수 있습니다.');
    //   return;
    // }
    // sendNextPage();
    if (completedTopics.length >= 5) navigate('/game08');
    else setShowPopup(true);
  };

  const isResultAvailable = completedTopics.length >= 3;

  return (
    <>
      <Layout round={currentRound} subtopic={subtopic}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
          <ContentBox2 text={paragraphs[0]?.main || ''} width={936} height={407} />
          {isResultAvailable ? (
            <div style={{ display: 'flex', gap: 24 }}>
              <Continue
                label="라운드 선택으로"
                onClick={handleNextRound}
                style={{ width: 264, height: 72 }}
              />
              <Continue3
                label="결과 보기"
                onClick={handleViewResult}
              />
            </div>
          ) : (
            <Continue
              label="라운드 선택으로"
              onClick={handleNextRound}
              style={{ width: 264, height: 72 }}
            />
          )}
        </div>
      </Layout>

      {showPopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <ResultPopup onClose={() => setShowPopup(false)} onViewResult={handleViewResult} />
        </div>
      )}
    </>
  );
}