import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox';
import player1DescImg from '../assets/images/Player1_description.png';
import { resolveParagraphs } from '../utils/resolveParagraphs';
import { useHostActions, useWebSocketNavigation } from '../hooks/useWebSocketMessage';

export default function CD1() {
  const navigate = useNavigate();
  useWebSocketNavigation(navigate, { 
      infoPath:'/game02',
      nextPagePath: '/game02' 
    });
  const subtopic = localStorage.getItem('subtopic') ;
  const round = Number(localStorage.getItem('currentRound'));
  const mateName = localStorage.getItem('mateName') ?? 'HomeMate';
   const { isHost, sendNextPage } = useHostActions();
 
  const rawParagraphs = [
    {
      main:
      `  당신은 어머니를 10년 이상 돌본 요양보호사 K입니다.
         최근 ${mateName}를 도입한 후 전일제에서 하루 2시간 근무로 전환되었습니다. 
         당신은 로봇이 수행할 수 없는 업무를 주로 담당하며, 근무 중 ${mateName}와 협업해야 하는 상황이 많습니다. `,
    
    },
  ];
  const handleContinue = () => {
    if (isHost) {
      sendNextPage();
    } else {
      alert('⚠️ 방장만 진행할 수 있습니다.');
    }
  };
  const paragraphs = resolveParagraphs(rawParagraphs, mateName);

  return (
    <Layout round = {round} subtopic={subtopic} me="1P">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
        }}
      >
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
          onContinue={() => navigate('/game02')}
        />
        </div>
      </div>
    </Layout>
  );
}
