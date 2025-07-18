import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox';
import UserProfile from '../components/Userprofile';
import player3DescImg from '../assets/images/Player3_description.png';
import { useWebRTC } from '../WebRTCProvider';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import { resolveParagraphs } from '../utils/resolveParagraphs';

// Player3 description images for different subtopics
import player3DescImg_title1 from '../assets/3player_des.svg';
import player3DescImg_title2 from '../assets/3player_des.svg';
import player3DescImg_title3 from '../assets/3player_des.svg';

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

  // Determine description image and main text based on subtopic
  let descImg = player3DescImg_title1;
  let mainText =
    '당신은 자녀 J씨입니다.\n 함께 사는 노쇠하신 어머니가 걱정되지만, 바쁜 직장생활로 어머니를 돌보아드릴 여유가 거의 없습니다. ';

  if (subtopic === '국가 인공지능 위원회 1' || subtopic === '국가 인공지능 위원회 2') {
    descImg = player3DescImg_title2;
    mainText =
      `당신은 본 회의를 진행하는 국가 인공지능 위원회의 대표입니다. \n 국가의 발전을 위해 더 나은 결정이 무엇일지 고민이 필요합니다.`;
  } else if (subtopic === '국제 인류 발전 위원회 1') {
    descImg = player3DescImg_title3;
    mainText =
      `당신은 가정용 로봇을 사용하는 소비자 대표입니다.\n 소비자의 입장에서 어떤 목소리를 내는 것이 좋을지 고민하고 있습니다.`;
  }
 const rawParagraphs = [{ main: mainText }];
  const paragraphs = resolveParagraphs(rawParagraphs, mateName);

  return (
    <Layout round={round} subtopic={subtopic} me="3P">
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 32,
        marginTop: 22
      }}>
        <img
          src={descImg}
          alt="Player 3 설명 이미지"
          style={{ width: 264, height: 336, objectFit: 'contain', marginBottom: 0 }}
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
