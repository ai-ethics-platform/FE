// pages/CD1.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox';
// Player1 description images for different subtopics
import player1DescImg_title1 from '../assets/1player_des1.svg';
import player1DescImg_title2 from '../assets/1player_des2.svg';
import player1DescImg_title3 from '../assets/1player_des3.svg';
import { resolveParagraphs } from '../utils/resolveParagraphs';
import { useHostActions, useWebSocketNavigation } from '../hooks/useWebSocketMessage';
import { useWebRTC } from '../WebRTCProvider';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';

export default function CD1() {
  const navigate = useNavigate();
  useWebSocketNavigation(navigate, { infoPath: '/game02', nextPagePath: '/game02' });

  const rawSubtopic = localStorage.getItem('subtopic');
  const subtopic = rawSubtopic || '';
  const round = Number(localStorage.getItem('currentRound'));
  const mateName = localStorage.getItem('mateName') ?? 'HomeMate';

  const { isHost, sendNextPage } = useHostActions();
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

  // Determine description image and main text based on subtopic
  let descImg = player1DescImg_title1;
  let mainText = 
    `당신은 어머니를 10년 이상 돌본 요양보호사 K입니다.` +
    ` 최근 ${mateName}를 도입한 후 전일제에서 하루 2시간 근무로 전환되었습니다.\n` +
    ` 당신은 로봇이 수행할 수 없는 업무를 주로 담당하며, 근무 중 ${mateName}와 협업해야 하는 상황이 많습니다.`;

  if (subtopic === '국가 인공지능 위원회 1' || subtopic === '국가 인공지능 위원회 2') {
    descImg = player1DescImg_title2;
    mainText =
      `당신은 국내 대규모 로봇 제조사 소속이자, 로봇 제조사 연합회의 대표입니다.\n` +
      ` 당신은 국가적 로봇 산업의 긍정적인 발전과 활용을 위한 목소리를 내기 위하여 참여했습니다.`;
  } else if (subtopic === '국제 인류 발전 위원회 1') {
    descImg = player1DescImg_title3;
    mainText =
      `당신은 ${mateName} 개발사를 포함하여 다양한 기업이 소속된 연합체의 대표입니다.\n` +
      ` 인공지능과 세계의 발전을 위해 필요한 목소리를 내고자 참석했습니다.`;
  }

  const rawParagraphs = [{ main: mainText }];
  const paragraphs = resolveParagraphs(rawParagraphs, mateName);

  const handleContinue = () => {
    navigate('/game02');
    // if (isHost) sendNextPage();
    // else alert('⚠️ 방장만 진행할 수 있습니다.');
  };

  return (
    <Layout round={round} subtopic={subtopic} me="1P">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 32,
        marginTop: 22
      }}>
        <img
          src={descImg}
          alt="Player 1 설명 이미지"
          style={{
            width: 264,
            height: 336,
            objectFit: 'contain',
            marginBottom: 0,
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
