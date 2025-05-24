import React, { useState } from 'react';

export default function SelectCardToggle({ label = '버튼 텍스트' }) {
  const [selected, setSelected] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggle = () => setSelected(prev => !prev);

  const getBorderColor = () => {
    if (selected) return '#0F172A';
    if (isHovered) return '#CBD5E1';
    return 'transparent';
  };

  const getBackgroundColor = () => {
    if (selected) return '#E2E8F0';
    return '#F8FAFC';
  };

  const style = {
    borderRadius: 8,
    backgroundColor: getBackgroundColor(),
    border: `1.5px solid ${getBorderColor()}`,
    fontFamily: 'Pretendard, sans-serif',
    fontSize: 16,
    color: '#1E293B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  return (
    <div
      style={style}
      onClick={toggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {label}
    </div>
  );
}
