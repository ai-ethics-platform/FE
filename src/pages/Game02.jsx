// Game02.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import ContentTextBox from '../components/ContentTextBox';
import GameFrame from '../components/GameFrame';
import closeIcon from "../assets/close.svg";
// --- 4컷 만화 원본 ---
import img1 from '../assets/images/Android_dilemma1_1.jpg';
import img2 from '../assets/images/Android_dilemma1_2.jpg';
import img3 from '../assets/images/Android_dilemma1_3.jpg';
import img4 from '../assets/images/Android_dilemma1_4.jpg';
const images = [img1, img2, img3, img4];

// --- 팝업용 프로필 사진 ---
import profile1Img from '../assets/images/CharacterPopUp1.png';
import profile2Img from '../assets/images/CharacterPopUp2.png';
import profile3Img from '../assets/images/CharacterPopUp3.png';
const profileImages = { '1P': profile1Img, '2P': profile2Img, '3P': profile3Img };

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
  const [openProfile, setOpenProfile] = useState(null); // null | "1P" | "2P" | "3P"

  const handleContinue = () => navigate('/game03');

  return (
    <Background bgIndex={3}>
      {/* ===== 팝업 레이어 ===== */}
      {openProfile && (
        <div
          onClick={() => setOpenProfile(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
          }}
        >
          {/* 모달 본체 (클릭 전파 차단) */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              background: '#fff',
              padding: 32,
              borderRadius: 12,
              boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
            }}
          >
            <img
              src={profileImages[openProfile]}
              alt={`${openProfile} profile`}
              style={{ width: 360, height: 'auto' }}
            />
            <img
   src={closeIcon}
   alt="close"
   onClick={() => setOpenProfile(null)}   // 모달 닫기
   style={{
     position: 'absolute',
     top: 24,
     right: 24,
     width: 40,
     height: 40,
     cursor: 'pointer',
   }}
 />
          </div>
        </div>
      )}

      {/* ===== 본문 ===== */}
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
            <UserProfile
              player="1P"
              characterDesc="요양보호사"
              isLeader
              style={{ cursor: 'pointer' }}
              onClick={() => setOpenProfile('1P')}
            />
            <UserProfile
              player="2P"
              characterDesc="노모 L"
              style={{ cursor: 'pointer' }}
              onClick={() => setOpenProfile('2P')}
            />
            <UserProfile
              player="3P"
              characterDesc="자녀J"
              isMe
              style={{ cursor: 'pointer' }}
              onClick={() => setOpenProfile('3P')}
            />
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

        {/* 만화 + 텍스트 박스 */}
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
