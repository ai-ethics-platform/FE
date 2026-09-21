// src/components/NextOrange.jsx
import React from 'react';
import next2 from '../assets/nextorange.svg';
import next2disable from '../assets/next2disabled.svg';

export default function Next2({ onClick, disabled = false, visuallyDisabled = false }) {
    const imageSrc = visuallyDisabled ? next2disable : next2;

  return (
    <button type="button" aria-label="다음 화면" disabled={disabled || visuallyDisabled} onClick={onClick}
      style={{ display: 'block', width: 80, height: 80, padding: 0, border: 0, background: 'transparent', cursor: disabled || visuallyDisabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1 }}>
      <img src={imageSrc} alt="" style={{ display: 'block', width: '100%', height: '100%' }} />
    </button>
  );
}
