import React, { useState } from 'react';
import { Colors, FontStyles } from './styleConstants';

export default function TextButton({ disabled = false, children, onClick }) {
  const [isHover, setIsHover] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const getStyle = () => {
    const style = {
      background: 'none',
      border: 'none',
      padding: '8px 16px',
      fontSize: FontStyles.body.fontSize,
      fontFamily: FontStyles.body.fontFamily,
      fontWeight: 500,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      textDecoration: 'none',
      outline: 'none',
      boxShadow: 'none',
      color: Colors.grey07,
    };

    if (disabled) {
      style.color = Colors.grey04;
      style.fontWeight = 400;
    } else if (isActive) {
      style.textDecoration = 'underline';
      style.color = Colors.grey08;
      style.fontWeight = 400;
    } else if (isHover) {
      style.textDecoration = 'underline';
      style.color = Colors.grey07;
      style.fontWeight = 400;
    }

    return style;
  };

  return (
    <button
      style={getStyle()}
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
