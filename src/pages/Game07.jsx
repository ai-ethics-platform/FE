import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';

import Layout from '../components/Layout';
import ContentBox2 from '../components/ContentBox2';
import Continue from '../components/Continue';
import Continue3 from '../components/Continue3';
import ResultPopup from '../components/Results';
import { resolveParagraphs } from '../utils/resolveParagraphs';

// 🆕 WebRTC integration
import { useWebRTC } from '../WebRTCProvider';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import UserProfile from '../components/Userprofile';

export default function Game07() {
  const navigate = useNavigate();
  const { isHost, sendNextPage } = useHostActions();
  const subtopic = localStorage.getItem('subtopic') ?? '가정 1';

  // Host-driven navigation via WebSocket
  useWebSocketNavigation(navigate, { nextPagePath: '/gamemap', infoPath: '/gamemap' });
  useWebSocketNavigation(navigate, { nextPagePath: '/game08', infoPath: '/game08' });

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

  const mateName = localStorage.getItem('mateName');
  const rawParagraphs = [
    {
      main:
        '  우리 가족은 최종적으로 개인정보 제공에 동의하지 않았고, 서비스 관련 약간의 불편함은 있으나 가족의 사생활을 보호하는 것에 만족하였습니다.\n\n' +
        '우리 가족의 생활을 위해 여러분은 어떤 가치를 택하고, 무엇을 포기했나요?',
    },
  ];
  const [paragraph] = resolveParagraphs(rawParagraphs, mateName);

  const [completedTopics, setCompletedTopics] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [showPopup, setShowPopup] = useState(false);

  // Load completed topics
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    setCompletedTopics(saved);
    setCurrentRound(saved.length + 1);
  }, []);

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
          <ContentBox2 text={paragraph.main} width={936} height={407} />
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