import React, { useState } from 'react';
import { Colors, FontStyles } from '../styleConstants';

export default function SecondaryButton({ onClick, disabled = false, children, style: externalStyle = {} }) {
  const [isHover, setIsHover] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const baseStyle = {
    padding: '16px 24px',
    ...FontStyles.button,
    textAlign: 'center',
    lineHeight: '1.6',
    letterSpacing: '0.5px',
    transition: 'all 0.2s ease',
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: 'linear-gradient(135deg, #BB4E2D 0%, #993516 100%)',
    color: Colors.creatorgrey01,
    border: `1px solid ${Colors.CreatorPrimary}`,
  };
   //  클릭 시 disabled일 경우 무시
   const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  if (disabled) {
    baseStyle.backgroundColor = Colors.componentBackground;
    baseStyle.color = Colors.creatorgrey04;
    baseStyle.border = `1px solid ${Colors.creatorgrey03}`;
  } else if (isActive) {
    baseStyle.backgroundColor = Colors.CreatorDark;
    baseStyle.color = Colors.creatorgrey01;
    baseStyle.border = `1px solid ${Colors.CreatorPrimary}`;
  } else if (isHover) {
    baseStyle.backgroundColor = Colors.CreatorDark; 
    baseStyle.boxShadow = '0px 1px 3px rgba(0, 0, 0, 0.1)';
    baseStyle.border = `1px solid ${Colors.creatorgrey01}`;
  }

  return (
    <button
      onClick={handleClick}
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
