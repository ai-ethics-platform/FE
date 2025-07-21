import React, { useEffect, useState,useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';

import Layout from '../components/Layout';
import ContentBox2 from '../components/ContentBox2';
import Continue from '../components/Continue';
import Continue3 from '../components/Continue3';
import ResultPopup from '../components/Results';
import { resolveParagraphs } from '../utils/resolveParagraphs';
import { paragraphsData } from '../components/paragraphs';

// 🆕 WebRTC integration
import axiosInstance from '../api/axiosInstance';

import { useWebRTC } from '../WebRTCProvider';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';

export default function Game07() {
  const navigate = useNavigate();

  // Host-driven navigation via WebSocket
  useWebSocketNavigation(navigate, { nextPagePath: '/gamemap', infoPath: '/gamemap' });
  useWebSocketNavigation(navigate, { nextPagePath: '/game08', infoPath: '/game08' });

  const { isHost, sendNextPage } = useHostActions();


  // const subtopic = "국가 인공지능 위원회 2";
  // const category = "안드로이드";
  
  const subtopic = localStorage.getItem('subtopic');
  const category = localStorage.getItem('category');
  const roomCode = localStorage.getItem('room_code');
  const mode      = 'ending2';

  
  // 🆕 WebRTC audio state
  const { voiceSessionStatus, roleUserMapping, myRoleId } = useWebRTC();
  const { getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);
  const getVoiceState = (role) => {
    if (String(role) === myRoleId) {
      return {
        is_speaking: voiceSessionStatus.isSpeaking,
        is_mic_on:    voiceSessionStatus.isConnected,
        nickname:     voiceSessionStatus.nickname || ''
      };
    }
    return getVoiceStateForRole(role);
  };
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
          await fetchWithAutoToken();
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
    if (!isHost) {
      alert('⚠️ 방장만 다음 라운드로 진행할 수 있습니다.');
      return;
    }
    sendNextPage();
  };

  const handleViewResult = () => {
    saveCompletedTopic();
    if (!isHost) {
      alert('⚠️ 방장만 결과 보기로 진행할 수 있습니다.');
      return;
    }
    sendNextPage();
  };

  const isResultAvailable = completedTopics.length >= 3;

  return (
    <>
      <Layout round={currentRound} subtopic={subtopic}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
          <ContentBox2 text={paragraphs[currentRound - 1]?.main || ''} width={936} height={407} />
          {isResultAvailable ? (
            <div style={{ display: 'flex', gap: 24 }}>
              <Continue
                label="라운드 선택으로"
                onClick={handleNextRound}
                disabled={!isHost}
                style={{ width: 264, height: 72 }}
              />
              <Continue3
                label="결과 보기"
                onClick={handleViewResult}
                disabled={!isHost}
              />
            </div>
          ) : (
            <Continue
              label="라운드 선택으로"
              onClick={handleNextRound}
              disabled={!isHost}
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