import React from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import ContentTextBox from '../components/ContentTextBox';
import GameFrame from '../components/GameFrame';
import character1 from '../assets/images/Char1.jpg';
import character2 from '../assets/images/Char2.jpg';
import character3 from '../assets/images/Char3.jpg';

export default function Game01() {
  const navigate = useNavigate();

  const images = [character1, character2, character3];
  
  const subtopic = '가정 1'; // 나중에 API 연동시 좀 더 수정해야하는 부분 

  const paragraphs = [
    {
      main:
        '  지금부터 여러분은 HomeMate를 사용하게 된 사용자입니다.\n' +
        '  여러분은 다양한 장소에서 HomeMate를 어떻게 사용하는지에 대해 함께 논의하고 결정할 것입니다.',
    },
  ];

  return (
    <Background bgIndex={3}>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        {/* 이부분은 고정시키기  */}
        <div style={{ position: 'absolute', top: 60, left: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <UserProfile player="1P" isLeader />
            <UserProfile player="2P" isSpeaking />
            <UserProfile player="3P" />
          </div>
        </div>

        {/* GameFrame  */}
        <div style={{ position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)' }}>
          <GameFrame
            topic={`Round 01 : ${subtopic}`}
            hideArrows={true}
          />
        </div>

        <div style={{ marginTop: 250, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
          <div style={{ display: 'flex', gap: 24 }}>
            {images.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Character ${idx + 1}`}
                style={{
                  width: 264,
                  height: 360,
                  objectFit: 'cover',
                  borderRadius: 4,
                }}
              />
            ))}
          </div>

          {/* 설명 , 다음 버튼 */}
          <div style={{ marginTop: 24, width: 936 }}>
            <ContentTextBox
              paragraphs={paragraphs}
              onContinue={() => {
                navigate('/character_description1');
              }}
            />
          </div>
        </div>
      </div>
    </Background>
  );
}
