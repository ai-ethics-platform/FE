import React, { useState } from 'react';
import { Colors, FontStyles } from './styleConstants';

export default function SelectButton({
  label = '버튼 텍스트',
  selected: controlledSelected,
  onClick,
  width = 360,
  height = 72,
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
    if (selected) return Colors.grey07;
    if (isHovered) return Colors.brandLight;
    return Colors.grey04;
  };

  const getBorderWidth = () => {
    if (selected) return '1.2px';
    if (isHovered) return '1.2px';
    return '0.5px';
  };

  const getBackgroundColor = () => {
    if (selected) return '#ECF1F2'; 
    return '#FFFFFF'; 
  };

  const style = {
    backgroundColor: getBackgroundColor(),
    border: `${getBorderWidth()} solid ${getBorderColor()}`,
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
    boxSizing: 'border-box',

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
