import React, { useState } from 'react';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import ContentTextBox from '../components/ContentTextBox';
import { useNavigate } from 'react-router-dom';
import gameIntro from '../assets/images/gameintro.png';

export default function GameIntro2() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const paragraphs = [
    { main: '  지금은 20XX년 국내 최대 로봇 개발사 A가 다기능 돌봄 로봇 HomeMate를 개발했습니다.' },
    {
      main:
        '  이 로봇의 기능은 아래와 같습니다.\n' +
        `  • 가족의 감정, 건강 상태, 생활 습관 등을 입력하면 맞춤형 알림, 식단 제안 등의 서비스를 제공\n` +
        `  • 기타 업데이트 시 정교화된 서비스 추가 가능`,
    },
  ];

  return (
    <Background bgIndex={3}>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        <div style={{ position: 'absolute', top: 60, left: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <UserProfile player="1P" isLeader />
            <UserProfile player="2P" isSpeaking />
            <UserProfile player="3P" />
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 150,
            left: 432,
            width: 936,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <img
            src={gameIntro}
            alt="Intro Scene"
            style={{
              width: 900,
              height: 467,
              objectFit: 'cover',
              borderRadius: 4,
            }}
          />

          <div style={{ marginTop: 24, width: '100%' }}>
            <ContentTextBox
              paragraphs={paragraphs}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              onContinue={() => navigate('/selecthomemate')}
            />
          </div>
        </div>
      </div>
    </Background>
  );
}
