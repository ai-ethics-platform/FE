import React, { useState } from 'react';

export default function GrayButton({ disabled = false, children, style: externalStyle = {} }) {
  const [isHover, setIsHover] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const baseStyle = {
    borderRadius: '8px',
    padding: '16px 24px',
    fontSize: '18px',
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: '0.5px',
    lineHeight: '1.6',
    transition: 'all 0.2s ease',
    outline: 'none',
    fontFamily: 'Pretendard, sans-serif',
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: '#E3E8EF', // default
    color: '#334155',
    border: '1px solid #475569',
  };

  if (disabled) {
    baseStyle.backgroundColor = '#F1F5F9';
    baseStyle.color = '#94A3B8';
    baseStyle.border = '1px solid #CBD5E1';
  } else if (isActive) {
    baseStyle.backgroundColor = '#CBD5E1';
    baseStyle.color = '#1E293B';
    baseStyle.border = '2px solid #1E293B';
  } else if (isHover) {
    baseStyle.backgroundColor = '#E0E7EF';
    baseStyle.boxShadow = '0px 4px 12px rgba(0, 0, 0, 0.1)';
    baseStyle.border = '1px solid #334155';
  }

  return (
    <button
      style={{ ...baseStyle, ...externalStyle }} // 병합
      disabled={disabled}
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
