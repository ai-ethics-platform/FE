import React, { useState } from 'react';
import nextFrame from '../assets/next.svg';
import { FontStyles, Colors } from './styleConstants';

export default function Continue({
  width = 264,
  height = 72,
  step = 1,
  onClick,
  disabled = false,  
  label = "다음",        
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive,  setIsActive]  = useState(false);

  const interactive = !disabled;

  const scale =
    interactive
      ? isActive
        ? 0.989
        : isHovered
          ? 1.01
          : 1
      : 1;

  /** 텍스트 색상  */
  const textColor = interactive ? Colors.grey01 : Colors.grey04;

  return (
    <div
      onClick={interactive ? onClick : undefined}

      onMouseEnter={interactive ? () => setIsHovered(true)  : undefined}
      onMouseLeave={interactive ? () => { setIsHovered(false); setIsActive(false); } : undefined}
      onMouseDown={interactive ? () => setIsActive(true)   : undefined}
      onMouseUp  ={interactive ? () => setIsActive(false)  : undefined}

      style={{
        width,
        height,
        position: 'relative',
        cursor: interactive ? 'pointer' : 'default',
        userSelect: 'none',
        transform: `scale(${scale})`,
        transition: 'transform 0.15s ease-out',
        opacity: interactive ? 1 : 0.4,            
      }}
    >
      <img
        src={nextFrame}
        alt="continue frame"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ ...FontStyles.headlineSmall, color: textColor }}>
        {label}
        </span>
        <span style={{ ...FontStyles.title, color: Colors.grey04 }}>
          {step}/3
        </span>
      </div>
    </div>
  );
}
