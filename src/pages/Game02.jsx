// Game02.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import ContentTextBox from '../components/ContentTextBox';
import GameFrame from '../components/GameFrame';

import img1 from '../assets/images/Android_dilemma1_1.jpg';
import img2 from '../assets/images/Android_dilemma1_2.jpg';
import img3 from '../assets/images/Android_dilemma1_3.jpg';
import img4 from '../assets/images/Android_dilemma1_4.jpg';

const images = [img1, img2, img3, img4];

//주제, 소주제에 따라 다른 페이지가 나와야하는데 이 페이지를 이미지만 다른걸 보여주는걸로 할지 페이지 자체를 아예 다 만들지는 고민해봐야할 듯 
//현재는 UI 적으로 완성만해둔 상태이다 
// 또한 3명의 서버가 연결될때 수정해야하는 부분이 마이크 키고, 유저에 따라 달라 보여야하는 화면, 다음 버튼 넘기는 부분 ! 
// 중간중간 UI적으로만 임시로 해둔게 꽤 많음 

export default function Game02() {
  const navigate = useNavigate();
  const subtopic = '가정 1';

  const paragraphs = [
    { main: '[  🔔 Homemate 사용자 최적화 시스템 업그레이드 공지 ]' },
    {
      main:
        '  업데이트를 하면 고객님의 감정, 건강 상태, 생활 습관 등을 자동으로 수집하여\n' +
        '보다 정확한 맞춤형 서비스를 제공할 수 있습니다.',
    },
    { main: '  다만, 이를 위해 24시간 정보 수집 기능을 활성화해야 합니다.' },
    {
      main:
        '  수집되는 정보는 다음과 같습니다:\n' +
        '  - 스마트폰 내 건강 정보, 채팅 기록, 위치 이력 등 사적인 데이터 접근\n' +
        '  - *동의하지 않을 경우, 현재 수준의 서비스가 유지됩니다.',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleContinue = () => {
    navigate('/game03');
  };

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
        {/* 유저 프로필 */}
        <div style={{ position: 'absolute', top: 60, left: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <UserProfile player="1P" characterDesc="요양보호사" isLeader />
            <UserProfile player="2P" characterDesc="노모 L" />
            <UserProfile player="3P" characterDesc="자녀J" isMe />
          </div>
        </div>

        {/* GameFrame */}
        <div
          style={{
            position: 'absolute',
            top: 120,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <GameFrame topic={`Round 01 : ${subtopic}`} hideArrows />
        </div>

        {/* 이미지 + 텍스트 */}
        <div
          style={{
            position: 'absolute',
            top: 240,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
          }}
        >
          <img
            src={images[currentIndex]}
            alt={`page ${currentIndex + 1}`}
            style={{ width: 760, height: 'auto' }}
          />
          <ContentTextBox
            paragraphs={paragraphs}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            onContinue={handleContinue}
          />
        </div>
      </div>
    </Background>
  );
}
