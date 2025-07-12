import React, { useState } from 'react';
import back from '../assets/back.svg';
import { Colors, FontStyles } from './styleConstants';

export default function BackButton({ disabled = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const getBackground = () => {
     if (disabled) return Colors.grey03; 
    if (isActive) return Colors.brandDark; 
    if (isHovered) return '#0D575C'; 
    return Colors.brandPrimary;  };

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
        outline: 'none', 
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
