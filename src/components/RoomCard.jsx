import React, { useState } from 'react';
import frame from '../assets/cardframe.svg';
import frameHover from '../assets/cardframehover.svg';
import frameActive from '../assets/cardframeactive.svg';
import lockIcon from '../assets/lock.svg';
import { Colors, FontStyles } from './styleConstants';
import { CardSizes } from './stylecardsize';

export default function RoomCard({ icon, title, description, disabled = false, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const getFrameImage = () => {
    if (isActive) return frameActive;
    if (isHovered) return frameHover;
    return frame;
  };

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      style={{
        position: 'relative',
        width: CardSizes.width,
        height: CardSizes.height,
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        cursor: disabled ? 'default' : 'pointer',
      }}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => !disabled && setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
    >
      {/* 카드 프레임 */}
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

      {/* 콘텐츠 */}
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
          paddingTop: CardSizes.playerTop,
          color: Colors.grey07,
          textAlign: 'center',
        }}
      >
        <img
          src={icon}
          alt="카드 아이콘"
          style={{
            width: CardSizes.icon.width,
            height: CardSizes.icon.width,
            marginBottom: 15,
          }}
        />
        <div style={{ ...FontStyles.headlineNormal, color: Colors.brandPrimary, marginBottom: 15 }}>
          {title}
        </div>
        <div
          style={{
            width: '60%',
            height: 1,
            backgroundColor: Colors.grey01,
            marginBottom: 16,
          }}
        />
        <div
          style={{
            ...FontStyles.body,
            color: Colors.grey06,
            width: '80%',
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
}
