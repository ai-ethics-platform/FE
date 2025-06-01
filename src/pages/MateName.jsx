import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import InputBoxSmall from '../components/InputBoxSmall'; // or InputBoxSimple
import character1 from '../assets/images/character1.png';
import character2 from '../assets/images/character2.png';
import character3 from '../assets/images/character3.png';
import ContentTextBox2 from '../components/ContentTextBox2';

export default function MateName() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedIndex = location.state?.selectedIndex ?? 0;
  const images = [character1, character2, character3];

  const [name, setName] = useState('');

  const paragraphs = [
    {
      main: '  여러분이 사용자라면 HomeMate를 어떻게 부를까요?',
      sub: '(함께 토론한 후 1P가 입력하고 "다음" 버튼을 클릭해 주세요)',
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
        <div style={{ position: 'absolute', top: 60, left: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <UserProfile player="1P" isLeader />
            <UserProfile player="2P" isSpeaking />
            <UserProfile player="3P" />
          </div>
        </div>

        <div
          style={{
            marginTop: 150,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <img
            src={images[selectedIndex]}
            alt="Selected Character"
            style={{
              width: 264,
              height: 360,
              objectFit: 'cover',
              borderRadius: 4,
              border: '2px solid #354750',
              marginBottom: 32,
            }}
          />

          <InputBoxSmall
            placeholder="여러분의 HomeMate 이름을 입력하세요"
            width={520}
            height={64}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div style={{ marginTop: 24, width: 936 }}>
            <ContentTextBox2
              paragraphs={paragraphs}
              onContinue={() => {
                if (!name.trim()) {
                  alert('이름을 입력해주세요!');
                  return;
                }
                navigate('/matename', {
                  state: { selectedIndex, name },
                });
              }}
            />
          </div>
        </div>
      </div>
    </Background>
  );
}
