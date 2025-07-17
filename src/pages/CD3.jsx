import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox';
import UserProfile from '../components/Userprofile';
import player3DescImg from '../assets/images/Player3_description.png';
import { useWebRTC } from '../WebRTCProvider';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import player2DescImg from '../assets/images/Player3_description.png';

export default function CD3() {
  const navigate = useNavigate();
  const subtopic = localStorage.getItem('subtopic') ?? '가정 1';
  const round = Number(localStorage.getItem('currentRound') ?? '1');
  const mateName = localStorage.getItem('mateName') ?? 'HomeMate';

  // WebRTC audio state
  const { voiceSessionStatus, roleUserMapping, myUserId } = useWebRTC();
  const { getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);
  const getVoiceState = (roleId) => {
    if (String(roleId) === myUserId) {
      return {
        is_speaking: voiceSessionStatus.isSpeaking,
        is_mic_on: voiceSessionStatus.isConnected,
        nickname: voiceSessionStatus.nickname || ''
      };
    }
    return getVoiceStateForRole(roleId);
  };

  const paragraphs = [
    {
      main: `  당신은 자녀 J씨입니다.\n        노쇠하신 어머니가 걱정되지만, 바쁜 직장생활로 어머니를 돌보아드릴 여유가 거의 없습니다.\n        최근 ${mateName}의 돌봄 서비스를 소개받고, 어머니께 적용할 수 있을지 고민 중입니다.`,
    },
  ];

  return (
    <Layout round={round} subtopic={subtopic} me="3P">
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 32,
        paddingTop: 40
      }}>
        <img
          src={player3DescImg}
          alt="Player 3 설명 이미지"
          style={{ width: 264, height: 336, objectFit: 'contain', marginBottom: 32 }}
        />
        <div style={{ width: '100%', maxWidth: 900 }}>
          <ContentTextBox
            paragraphs={paragraphs}
            onContinue={() => navigate('/game02')}
          />
        </div>
      </div>
    </Layout>
  );
}
