import React, { useState } from 'react';
import back from '../assets/back.svg';

export default function ArrowButton({ disabled = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const getBackground = () => {
    if (disabled) return '#BAC1C5';
    if (isActive) return '#192D3A';
    if (isHovered) return '#354750';
    return 'linear-gradient(180deg, #6E7C7D 0%, #192D3A 100%)';
  };

  return (
    <button
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => !disabled && setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      style={{
        width: 200,
        height: 80,
        border: 'none',
        outline: 'none', //  active 시 테두리 제거
        borderRight: '24px solid transparent',
        borderRadius: 4,
        background: getBackground(),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'Pretendard, sans-serif',
        clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0% 100%)',        paddingRight: 24,
      }}
    >
      <img src={back} alt="arrow" style={{ width: 56, height: 56 }} />
    </button>
  );
}
