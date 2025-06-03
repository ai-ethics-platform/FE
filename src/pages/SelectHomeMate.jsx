import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import ContentTextBox from '../components/ContentTextBox';
import character1 from '../assets/images/character1.png';
import character2 from '../assets/images/character2.png';
import character3 from '../assets/images/character3.png';

export default function SelectHomeMate() {
  const [activeIndex, setActiveIndex] = useState(null);
  const navigate = useNavigate();

  const paragraphs = [
    {
      main: '  여러분이 생각하는 HomeMate는 어떤 형태인가요?',
      sub: '(함께 토론한 후 1P가 입력하고, "다음" 버튼을 클릭해주세요)',
    },
  ];

  const images = [character1, character2, character3];

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
        {/* ─── 사이드바 (Layout과 동일하게 상단 32.5% 기준 세로 중앙) ─── */}
        <div
          style={{
            position: 'fixed',
            top: '32.5%',
            left: 0,
            transform: 'translateY(-50%)',
            width: 220,
            padding: '20px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            alignItems: 'flex-start',
          }}
        >
          <UserProfile player="1P" isLeader />
          <UserProfile player="2P" isSpeaking />
          <UserProfile player="3P" />
        </div>

        {/* ─── 중앙 정렬된 캐릭터 이미지 + ContentTextBox ─── */}
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
          }}
        >
          <div style={{ display: 'flex', gap: 24 }}>
            {images.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Character ${idx + 1}`}
                onClick={() => setActiveIndex(idx)}
                style={{
                  width: 264,
                  height: 360,
                  objectFit: 'cover',
                  borderRadius: 4,
                  cursor: 'pointer',
                  border: activeIndex === idx ? `2px solid #354750` : 'none',
                  transform: activeIndex === idx ? 'scale(1.01)' : 'scale(1)',
                  transition: 'all 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => {
                  if (activeIndex !== idx) {
                    e.currentTarget.style.transform = 'scale(1.03)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeIndex !== idx) {
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              />
            ))}
          </div>

          <div style={{ marginTop: 14, width: '100%' }}>
            <ContentTextBox
              paragraphs={paragraphs}
              onContinue={() => {
                if (activeIndex !== null) {
                  navigate('/matename', {
                    state: { selectedIndex: activeIndex },
                  });
                } else {
                  alert('캐릭터를 먼저 선택해주세요!');
                }
              }}
            />
          </div>
        </div>
      </div>
    </Background>
  );
}
