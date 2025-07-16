import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox';
import player2DescImg from '../assets/images/Player2_description.png';
import { useHostActions, useWebSocketNavigation } from '../hooks/useWebSocketMessage';

export default function CD2() {
  const navigate = useNavigate();
  // WebSocket navigation with custom nextPagePath
  useWebSocketNavigation(navigate, { 
    infoPath:'/game02',
    nextPagePath: '/game02' 
  });

  const subtopic = localStorage.getItem('subtopic') ?? '가정 1';
  const round = Number(localStorage.getItem('currentRound') ?? '1');
  const mateName = localStorage.getItem('mateName') ?? 'HomeMate';

  const { isHost, sendNextPage } = useHostActions();

  const handleContinue = () => {
    if (isHost) {
      sendNextPage();
    } else {
      alert('⚠️ 방장만 진행할 수 있습니다.');
    }
  };

  const paragraphs = [
    {
      main: `  당신은 자녀 J씨의 노모 L입니다.
        가사도우미의 도움을 받다가 최근 A사의 돌봄 로봇 ${mateName}의 도움을 받고 있습니다. `,
    },
  ];

  return (
    <Layout round={round} subtopic={subtopic} me="2P">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
        }}
      >
        <img
          src={player2DescImg}
          alt="Player 2 설명 이미지"
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
