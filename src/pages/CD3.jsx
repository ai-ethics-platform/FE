import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox';
import player2DescImg from '../assets/images/Player3_description.png';

export default function CD2() {
  const navigate = useNavigate();
  const subtopic = '가정 1';

  const paragraphs = [
    {
      main:
        '  당신은 자녀 J씨입니다.\n' +
        '  노쇠하신 어머니가 걱정되지만 바쁜 직장생활로 어머니를...',
    },
  ];

  return (
    <Layout subtopic={subtopic} me="2P">
      {/* 중앙에 배치될 콘텐츠 */}
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
            onContinue={() => navigate('/game02')}
          />
        </div>
      </div>
    </Layout>
  );
}
