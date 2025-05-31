import React, { useState } from 'react';
import close from '../assets/closewhite.svg';
import {Colors,FontStyles} from './styleConstants';

export default function ArrowButton({ disabled = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const getBackground = () => {
    if (disabled) return Colors.grey03; // '#BAC1C5'
    if (isActive) return Colors.brandGradientEnd; // '#192D3A'
    if (isHovered) return Colors.brandPrimary; // '#354750'
    return `linear-gradient(180deg, ${Colors.brandGradientStart} 0%, ${Colors.brandGradientEnd} 100%)`;
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
        outline: 'none', // <- active 시 테두리 제거
        borderRight: '24px solid transparent',
        borderRadius: 4,
        background: getBackground(),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'Pretendard, sans-serif',
        clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0% 100%)',
        paddingRight: 24,
      }}
    >
      <img src={close} alt="arrow" style={{ width: 31.7, height: 31.7 }} />
    </button>
  );
}
