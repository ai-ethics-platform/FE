// src/components/Background.jsx
import React from 'react';
import bg1 from '../assets/images/bg1.png';
import bg2 from '../assets/images/bg2.png';
import bg3 from '../assets/images/bg3.png';

const bgMap = { 1: bg1, 2: bg2, 3: bg3 };

const Background = ({ bgIndex = 1, children }) => {
  const bgUrl = bgMap[bgIndex] || bgMap[1];

  return (
    <>
      {/* 고정 배경 레이어: 뷰포트 전 영역 커버 */}
      <div
        style={{
         position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: -1,
        }}
      />
      {/* 콘텐츠 레이어: 배경 위에 위치 */}
      <div style={{ position: 'relative', zIndex: 0, minHeight: '100vh' }}>
        {children}
      </div>
    </>
  );
};

export default Background;
