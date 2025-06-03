import React, { useState } from 'react';
import { Colors, FontStyles } from './styleConstants';

export default function SecondaryButton({ onClick, disabled = false, children, style: externalStyle = {} }) {
  const [isHover, setIsHover] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const baseStyle = {
    //borderRadius: '8px',
    padding: '16px 24px',
    ...FontStyles.button,
    textAlign: 'center',
    lineHeight: '1.6',
    letterSpacing: '0.5px',
    transition: 'all 0.2s ease',
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: Colors.grey02, // default
    color: Colors.grey06,
    border: `1px solid ${Colors.grey06}`,
  };

  if (disabled) {
    baseStyle.backgroundColor = Colors.grey02;
    baseStyle.color = Colors.grey04;
    baseStyle.border = `1px solid ${Colors.grey03}`;
  } else if (isActive) {
    baseStyle.backgroundColor = Colors.grey03;
    baseStyle.color = Colors.grey07;
    baseStyle.border = `2px solid ${Colors.grey07}`;
  } else if (isHover) {
    baseStyle.backgroundColor = '#E0E7EF'; // 이 색상은 디자인 시스템에 없어서 임시 유지
    baseStyle.boxShadow = '0px 4px 12px rgba(0, 0, 0, 0.1)';
    baseStyle.border = `1px solid ${Colors.grey06}`;
  }

  return (
    <button
      onClick={onClick}
      style={{ ...baseStyle, ...externalStyle }}
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
