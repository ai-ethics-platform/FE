// src/components/NextOrange.jsx
import React from 'react';
import next2 from '../assets/nextorange.svg';
import next2disable from '../assets/next2disabled.svg';

export default function Next2({ onClick, disabled = false, visuallyDisabled = false }) {
    const imageSrc = visuallyDisabled ? next2disable : next2;

  return (
    <img
      src={imageSrc}
      alt="next"
      onClick={visuallyDisabled ? undefined : onClick} // 클릭 막기
      style={{
        width: 80, // 필요에 따라 크기 조정
        height: 80,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'opacity 0.3s ease',
      }}
    />
  );
}
