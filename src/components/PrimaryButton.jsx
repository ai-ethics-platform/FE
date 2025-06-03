import React, { useState } from 'react';
import { Colors, FontStyles } from './styleConstants';

export default function PrimaryButton({
  disabled = false,
  children,
  style: externalStyle = {},
  onClick,
}) {
  const [isHover, setIsHover] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const baseStyle = {
    padding: '16px 24px',
    textAlign: 'center',
    letterSpacing: '0.5px',
    transition: 'all 0.2s ease',
    border: 'none',
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    ...FontStyles.button,
  };

  let stateStyle = {
    backgroundColor:Colors.brandPrimary,
    color: '#FFFFFF',
  };

  if (disabled) {
    stateStyle = {
      backgroundColor: Colors.grey05,
      color: Colors.grey04,
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
      style={{ ...baseStyle, ...stateStyle, ...externalStyle }}
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
