import React, { useState } from 'react';
import { Colors, FontStyles } from './styleConstants';

export default function SelectCardToggle({ label = '버튼 텍스트' }) {
  const [selected, setSelected] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggle = () => setSelected(prev => !prev);

  const getBorderColor = () => {
    if (selected) return Colors.grey07;      // #1E293B
    if (isHovered) return Colors.grey04;     // #CBD5E1
    return 'transparent';
  };

  const getBackgroundColor = () => {
    if (selected) return '#E2E8F0'; // 지정되지 않은 색상이므로 그대로 유지하거나 별도 상수화 가능
    return Colors.componentBackground; // '#F8FAFC'
  };

  const style = {
    borderRadius: 8,
    backgroundColor: getBackgroundColor(),
    border: `1.5px solid ${getBorderColor()}`,
    ...FontStyles.body,
    color: Colors.grey07,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    padding: '16px 24px',
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
