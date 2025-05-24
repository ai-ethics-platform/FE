import React, { useState } from 'react';

export default function TextButton({ disabled = false, children, onClick }) {
  const [isHover, setIsHover] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const baseStyle = {
    background: 'none',
    border: 'none',
    padding: '8px 16px',
    fontSize: '16px',
    fontFamily: 'Pretendard, sans-serif',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    outline: 'none',
    boxShadow: 'none',
    color: '#444F55',
    fontWeight: 500,
  };

  if (disabled) {
    baseStyle.color = '#98A3AA';
    baseStyle.fontWeight = 400;
  } else if (isActive) {
    baseStyle.textDecoration = 'underline';
    baseStyle.color = '#252C30';
    baseStyle.fontWeight = 400;
  } else if (isHover) {
    baseStyle.textDecoration = 'underline';
    baseStyle.color = '#444F55';
    baseStyle.fontWeight = 400;
  }

  return (
    <button
      style={baseStyle}
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
