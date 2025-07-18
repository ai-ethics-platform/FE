import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import ContentBox2 from '../components/ContentBox2';
import Continue from '../components/Continue';
import Continue3 from '../components/Continue3';
import ResultPopup from '../components/Results';
import { resolveParagraphs } from '../utils/resolveParagraphs';

import axiosInstance from '../api/axiosInstance';
import { fetchWithAutoToken } from '../utils/fetchWithAutoToken';
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';

// 🆕 WebRTC imports
import { useWebRTC } from '../WebRTCProvider';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import UserProfile from '../components/Userprofile';

export default function Game06() {
  const navigate = useNavigate();
  // WebSocket navigation
  useWebSocketNavigation(navigate, { nextPagePath: '/gamemap', infoPath: '/gamemap' });
  useWebSocketNavigation(navigate, { nextPagePath: '/game08', infoPath: '/game08' });

  const { isHost } = useHostActions();
  const subtopic = localStorage.getItem('subtopic') ?? '가정 1';
  const roomCode = localStorage.getItem('room_code') ?? '123456';

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
  const [paragraph, setParagraph] = useState({ main: '' });
  const [showPopup, setShowPopup] = useState(false);
  const [completedTopics, setCompletedTopics] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    setCompletedTopics(saved);
    setCurrentRound(saved.length + 1);
  }, []);
  // Load or fetch AI mate name and prepare paragraph
  useEffect(() => {
    const storedName = localStorage.getItem('mateName');
    if (storedName) {
      setMateName(storedName);
      const raw = [{
        main:
          `  우리 가족은 최종적으로 감정 업데이트에 동의하였고,
` +
          `   ${storedName}와 더욱 친밀한 교류를 이어나가게 되었습니다.

` +
          `   비록 몇몇 문제들이 있었지만 ${storedName}의 편의성 덕분에 이후
` +
          `   우리 가정 뿐 아니라 여러 가정에서 ${storedName}를 사용하게 되었습니다.

` +
          `   이후, 가정 뿐 아니라 국가적인 고민거리들이 나타나게 되는데...`,
      }];
      const [resolved] = resolveParagraphs(raw, storedName);
      setParagraph(resolved);
    } else {
      (async () => {
        try {
          await fetchWithAutoToken();
          const res = await axiosInstance.get('/rooms/ai-name', { params: { room_code: roomCode } });
          const aiName = res.data.ai_name || 'HomeMate';
          setMateName(aiName);
          localStorage.setItem('mateName', aiName);
          const raw = [{
            main:
              `  우리 가족은 최종적으로 감정 업데이트에 동의하였고,
` +
              `   ${aiName}와 더욱 친밀한 교류를 이어나가게 되었습니다.

` +
              `   비록 몇몇 문제들이 있었지만 ${aiName}의 편의성 덕분에 이후
` +
              `   우리 가정 뿐 아니라 여러 가정에서 ${aiName}를 사용하게 되었습니다.

` +
              `   이후, 가정 뿐 아니라 국가적인 고민거리들이 나타나게 되는데...`,
          }];
          const [resolved] = resolveParagraphs(raw, aiName);
          setParagraph(resolved);
        } catch (err) {
          console.error('AI 이름 로딩 실패:', err);
          const fallback = 'HomeMate';
          setMateName(fallback);
          
          // 게임 돌아가게 하는 부분 수정 필요 

//           const raw = [{
//             main:
//               `  우리 가족은 최종적으로 감정 업데이트에 동의하였고,
// ` +
//               `   ${fallback}와 더욱 친밀한 교류를 이어나가게 되었습니다.

// ` +
//               `   비록 몇몇 문제들이 있었지만 ${fallback}의 편의성 덕분에 이후
// ` +
//               `   우리 가정 뿐 아니라 여러 가정에서 ${fallback}를 사용하게 되었습니다.

// ` +
//               `   이후, 가정 뿐 아니라 국가적인 고민거리들이 나타나게 되는데...`,
//           }];
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
    if (!isHost) {
      alert('⚠️ 방장만 다음 라운드로 진행할 수 있습니다.');
      return;
    }
    saveCompletedTopic();
    localStorage.removeItem('category');
    localStorage.removeItem('subtopic');
    localStorage.removeItem('mode');
    navigate('/gamemap');
  };

  const handleViewResult = () => {
    if (!isHost) {
      alert('⚠️ 방장만 결과 보기로 진행할 수 있습니다.');
      return;
    }
    if (completedTopics.length >= 5) navigate('/game09');
    else setShowPopup(true);
  };

  return (
    <>
      <Layout round={currentRound} subtopic={subtopic} >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
          <ContentBox2 text={paragraph.main} width={936} height={407} />
          {completedTopics.length >= 3 ? (
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
          <ResultPopup onClose={() => setShowPopup(false)} onViewResult={() => navigate('/game08')} />
        </div>
      )}
    </>
  );
}
