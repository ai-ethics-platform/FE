import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox';
import player1DescImg from '../assets/images/Player1_description.png';

export default function CD1() {
  const navigate = useNavigate();
  const subtopic = '가정 1';

  const paragraphs = [
    {
      main:
        '  당신은 어머니를 10년 이상 돌본 요양보호사 K입니다.\n' +
        '  최근 ...',
    },
  ];

  return (
    <Layout subtopic={subtopic} me="1P">
      {/* ─── 중앙에 배치될 콘텐츠 ─── */}
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
