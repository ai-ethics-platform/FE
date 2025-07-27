import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox2';
import UserProfile from '../components/Userprofile';

import { useWebRTC } from '../WebRTCProvider';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import voiceManager from '../utils/voiceManager';
import { useHostActions, useWebSocketNavigation } from '../hooks/useWebSocketMessage';
// Player2 description images for different subtopics
import player2DescImg_title1 from '../assets/2player_des1.svg';
import player2DescImg_title2 from '../assets/2player_des2.svg';
import player2DescImg_title3 from '../assets/2player_des3.svg';
import { resolveParagraphs } from '../utils/resolveParagraphs';



export default function CD2() {
  const navigate = useNavigate();
  // WebSocket navigation with custom nextPagePath
  useWebSocketNavigation(navigate, { 
    infoPath: '/game02',
    nextPagePath: '/game02'
  });

  const subtopic = localStorage.getItem('subtopic') ?? 'AI의 개인 정보 수집';
  const round = Number(localStorage.getItem('currentRound') ?? '1');
  const mateName = localStorage.getItem('mateName') ?? 'HomeMate';

  const { isHost, sendNextPage } = useHostActions();

  // WebRTC audio state
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
  let descImg = player2DescImg_title1;
  let mainText =
    `당신은 자녀 J씨의 노모입니다.\n 가사도우미의 도움을 받다가 최근 A사의 돌봄 로봇 ${mateName}의 도움을 받고 있습니다.`

  if (subtopic === '아이들을 위한 서비스' || subtopic === '설명 가능한 AI') {
    descImg = player2DescImg_title2;
    mainText =
      `당신은 HomeMate를 사용해 온 소비자 대표입니다. \n 당신은 사용자로서 HomeMate 규제 여부와 관련한 목소리를 내고자 참여하였습니다.`;
  } else if (subtopic === '지구, 인간, AI') {
    descImg = player2DescImg_title3;
    mainText =
      `당신은 국제적인 환경단체의 대표로 온 환경운동가입니다.\n AI의 발전이 환경에 도움이 될지, 문제가 될지 고민 중입니다.`;
  }
  const rawParagraphs = [{ main: mainText }];
  const paragraphs = resolveParagraphs(rawParagraphs, mateName);

  const handleContinue = () => {
    navigate('/game02');
    // if (isHost) sendNextPage();
    // else alert('⚠️ 방장만 진행할 수 있습니다.');
  };


  return (
    <>
      <Layout round={round} subtopic={subtopic} me="2P">

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
          marginTop: 22
        }}>
          <img
            src={descImg}
            alt="Player 2 설명 이미지"
            style={{ width: 264, height: 336, objectFit: 'contain', marginBottom: -20 }}
          />
          <div style={{ width: '100%', maxWidth: 900 }}>
            <ContentTextBox
              paragraphs={paragraphs}
              onContinue={handleContinue}
            />
          </div>
        </div>
      </Layout>
    </>
  );
}
