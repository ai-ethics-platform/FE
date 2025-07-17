// pages/CD1.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox';
import UserProfile from '../components/Userprofile';
import player1DescImg from '../assets/images/Player1_description.png';
import { resolveParagraphs } from '../utils/resolveParagraphs';
import { useHostActions, useWebSocketNavigation } from '../hooks/useWebSocketMessage';
import { useWebRTC } from '../WebRTCProvider';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';

export default function CD1() {
  const navigate = useNavigate();
  useWebSocketNavigation(navigate, { infoPath: '/game02', nextPagePath: '/game02' });
  const subtopic = localStorage.getItem('subtopic');
  const round = Number(localStorage.getItem('currentRound'));
  const mateName = localStorage.getItem('mateName') ?? 'HomeMate';

  const { isHost, sendNextPage } = useHostActions();

  // WebRTC 음성 세션 및 WebSocket 상태
  const { voiceSessionStatus, roleUserMapping, myRoleId } = useWebRTC();
  const { getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);

  const getVoiceState = (role) => {
    if (String(role) === myRoleId) {
      return {
        is_speaking: voiceSessionStatus.isSpeaking,
        is_mic_on: voiceSessionStatus.isConnected,
        nickname: voiceSessionStatus.nickname || ''
      };
    }
    return getVoiceStateForRole(role);
  };

  const rawParagraphs = [
    {
      main: 
        `  당신은 어머니를 10년 이상 돌본 요양보호사 K입니다.\n` +
        `         최근 ${mateName}를 도입한 후 전일제에서 하루 2시간 근무로 전환되었습니다. \n` +
        `         당신은 로봇이 수행할 수 없는 업무를 주로 담당하며, 근무 중 ${mateName}와 협업해야 하는 상황이 많습니다. `
    }
  ];
  const paragraphs = resolveParagraphs(rawParagraphs, mateName);

  const handleContinue = () => {
    if (isHost) {
      sendNextPage();
    } else {
      alert('⚠️ 방장만 진행할 수 있습니다.');
    }
  };

  return (
    <Layout round={round} subtopic={subtopic} me="1P">
      {/* 사이드 프로필 */}
      <div style={{
        position: 'fixed',
        top: '32.5%',
        left: 0,
        transform: 'translateY(-50%)',
        width: 220,
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        alignItems: 'flex-start',
        zIndex: 10
      }}>
        {[1, 2, 3].map(role => {
          const vs = getVoiceState(role);
          return (
            <UserProfile
              key={role}
              player={`${role}P`}
              isLeader={false}
              isMe={String(role) === myRoleId}
              isSpeaking={vs.is_speaking}
              isMicOn={vs.is_mic_on}
              nickname={vs.nickname}
            />
          );
        })}
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 32,
        marginTop: 32
      }}>
        <img
          src={player1DescImg}
          alt="Player 1 설명 이미지"
          style={{
            width: 264,
            height: 336,
            objectFit: 'contain',
            marginBottom: 32,
          }}
        />
        <div style={{ width: '100%', maxWidth: 900 }}>
          <ContentTextBox
            paragraphs={paragraphs}
            onContinue={handleContinue}
          />
        </div>
      </div>
    </Layout>
  );
}
