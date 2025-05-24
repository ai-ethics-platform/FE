import React, { useState } from 'react';

export default function PrimaryButton({ disabled = false, children, style: externalStyle = {} , onClick}) {
  const [isHover, setIsHover] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const baseStyle = {
    
    padding: '16px 24px',
    fontSize: '18px',
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: '0.5px',
    lineHeight: '1.6',
    transition: 'all 0.2s ease',
    border: 'none',
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'Pretendard, sans-serif',
  };

  let stateStyle = {
    backgroundImage: 'linear-gradient(to bottom, #6E7C7D, #192D3A)',
    color: '#FFFFFF',
  };

  if (disabled) {
    stateStyle = {
      backgroundColor: '#CCCCCC',
      color: '#999999',
    };
  } else if (isActive) {
    stateStyle = {
      backgroundImage: 'linear-gradient(to bottom, #586667, #1A2B36)',
      color: '#FFFFFF',
      border: '2px solid #0E2A39',
    };
  } else if (isHover) {
    stateStyle = {
      backgroundImage: 'linear-gradient(to bottom, #586667, #1A2B36)',
      color: '#FFFFFF',
    };
  }

  return (
    <button
      style={{ ...baseStyle, ...stateStyle, ...externalStyle }}  // 외부 스타일 반영
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => {
        setIsHover(false);
        setIsActive(false);
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
    >
      {children}
    </button>
  );
}
