import React, { useState } from 'react';
import frame from '../assets/cardframe.svg';
import frameHover from '../assets/cardframehover.svg';
import frameActive from '../assets/cardframeactive.svg';
import lockIcon from '../assets/lock.svg';
import createroom from '../assets/roomcreate.svg';

export default function RoomCard({ disabled = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const containerStyle = {
    position: 'relative',
    width: 360,
    height: 480,
    opacity: disabled ? 0.4 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
    cursor: disabled ? 'default' : 'pointer',
  };

  const getFrameImage = () => {
    if (isActive) return frameActive;
    if (isHovered) return frameHover;
    return frame;
  };

  return (
    <div
      style={containerStyle}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => !disabled && setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
    >
      {/* 상태별 프레임 이미지 */}
      <img
        src={getFrameImage()}
        alt="프레임"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          zIndex: 0,
        }}
      />

      {/* 잠금 아이콘 */}
      {disabled && (
        <img
          src={lockIcon}
          alt="잠금"
          style={{
            position: 'absolute',
            top: 30,
            right: 30,
            width: 40,
            height: 40,
            zIndex: 2,
          }}
        />
      )}

      {/* 콘텐츠 영역 */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: 100,
          fontFamily: 'Pretendard, sans-serif',
          color: '#1F2937',
          textAlign: 'center',
        }}
      >
        <img
          src={createroom}
          alt="방 만들기"
          style={{ width: 168, height: 168, marginBottom: 20 }}
        />
        <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>TEXT</div>
        <div
          style={{
            width: '60%',
            height: 1,
            backgroundColor: '#E5E7EB',
            marginBottom: 16,
          }}
        />
        <input
          type="text"
          disabled={disabled}
          placeholder="설명 텍스트를 입력해 주세요."
          style={{
            border: 'none',
            backgroundColor: 'transparent',
            fontSize: 14,
            color: '#6B7280',
            outline: 'none',
            textAlign: 'center',
            width: '80%',
          }}
        />
      </div>
    </div>
  );
}
