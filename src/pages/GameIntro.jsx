import React from 'react';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import ContentBox2 from '../components/ContentBox2';
import Continue from '../components/Continue';
import { useNavigate } from 'react-router-dom';

export default function GameIntro() {
  const navigate = useNavigate();
  const fullText =
    `          지금은 20XX년,\n국내 최대 로봇 개발사 A가 다기능 돌봄 로봇 HomeMate를 개발했습니다.\n\n` +
    `    이 로봇의 기능은 아래와 같습니다.\n` +
    `     • 가족의 감정, 건강 상태, 생활 습관 등을 입력하면 맞춤형 알림, 식단 제안 등의 서비스를 제공\n` +
    `     • 기타 업데이트 시 정교화된 서비스 추가 가능`;

  return (
    <Background bgIndex={2}>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        <div style={{ position: 'absolute', top: 60, left: 0 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              alignItems: 'flex-start',
              width: 'fit-content',
              margin: 0,
              padding: 0,
            }}
          >
            <UserProfile player="1P" characterDesc="" isLeader />
            <UserProfile player="2P" characterDesc="" isSpeaking />
            <UserProfile player="3P" characterDesc="" />
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80vw',
            maxWidth: 936,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '0 16px',
          }}
        >
          <ContentBox2 text={fullText} />
          <div style={{ marginTop: 20 }}>
            <Continue
              width={264}
              height={72}
              step={1}
              onClick={() => {
                navigate('/selecthomemate');
              }}
            />
          </div>
        </div>
      </div>
    </Background>
  );
}
