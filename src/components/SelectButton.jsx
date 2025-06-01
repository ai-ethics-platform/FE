import React, { useState } from 'react';
import { Colors, FontStyles } from './styleConstants';

export default function SelectButton({
  label = '버튼 텍스트',
  selected: controlledSelected,
  onClick,
  width = 200,
  height = 56,
}) {
  const [internalSelected, setInternalSelected] = useState(false);
  const isControlled = controlledSelected !== undefined;
  const selected = isControlled ? controlledSelected : internalSelected;
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (isControlled) {
      onClick?.();
    } else {
      setInternalSelected((prev) => !prev);
    }
  };

  const getBorderColor = () => {
    if (selected) return Colors.grey07; // #1E293B
    if (isHovered) return Colors.grey04; // #CBD5E1
    return 'transparent';
  };

  const getBackgroundColor = () => {
    if (selected) return '#E2E8F0'; // 
    return Colors.componentBackground; // 
  };

  const style = {
    backgroundColor: getBackgroundColor(),
    border: `1.5px solid ${getBorderColor()}`,
    ...FontStyles.body,
    color: Colors.grey07,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width,
    height,
    userSelect: 'none',
  };

  return (
    <div
      style={style}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {label}
    </div>
  );
}
