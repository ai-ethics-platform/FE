import React, { useState, useEffect,useRef } from 'react';
import arrowUp from '../assets/arrowUp.svg';
import arrowDown from '../assets/arrowDown.svg';
import { Colors, FontStyles } from './styleConstants';


export default function SelectDrop({
  options = [],
  bgColor = Colors.componentBackground,
  value = '',
  onSelect = () => {},
  style = {},               
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selected, setSelected] = useState(value);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      dropdownRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [isOpen]);
  
  const dropdownRef = useRef(null); 

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    onSelect(option);
  };

  const wrapperStyle = {
    position: 'relative',
    width: style.width ?? '100%',      
    ...FontStyles.body,
    fontSize: style.fontSize ?? FontStyles.body.fontSize,
    userSelect: 'none',
  };

  const controlStyle = {
    width: '100%',
    height: style.height ?? '8vh',     
    minHeight: style.minHeight ?? 48,     
    padding: `0 ${style.paddingX ?? '1.5vw'}`, 
    backgroundColor: bgColor,
    border: isOpen
      ? `1px solid ${Colors.grey07}`
      : isHovered
      ? `1px solid ${Colors.grey04}`
      : 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    transition: 'border 0.2s ease',
    boxSizing: 'border-box',
  };

  const dropdownStyle = {
    position: 'absolute',
    top: `calc(${style.height ?? '6.5vh'} + 0.2vh)`, 
    left: 0,
    width: '100%',
    backgroundColor: bgColor,
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
   
    zIndex: 9999,
    paddingTop: '0.5vh',
    paddingBottom: '0.5vh',
    boxSizing: 'border-box',
  };

  const optionStyle = {
    paddingTop: style.optionPaddingY ?? '1.5vh',
    paddingBottom: style.optionPaddingY ?? '1.5vh',
    paddingLeft: style.optionPaddingX ?? '1.5vw',
    paddingRight: style.optionPaddingX ?? '1.5vw',
    ...FontStyles.body,
    fontSize: style.fontSize ?? FontStyles.body.fontSize,
    color: Colors.grey07,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={wrapperStyle}>
      <div
        style={controlStyle}
        onClick={toggleDropdown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span style={{ color: selected ? Colors.grey07 : Colors.grey05 }}>
          {selected || '선택...'}
        </span>
        <img
          src={isOpen ? arrowUp : arrowDown}
          alt="arrow"
          style={{
            width: style.iconSize ?? 20,
            height: style.iconSize ?? 20,
            flexShrink: 0,
          }}
        />
      </div>
      {isOpen && (
      <div style={dropdownStyle} ref={dropdownRef}>
        {options.map((opt, idx) => (
          <div
            key={idx}
            style={optionStyle}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleSelect(opt)}
          >
            {opt}
          </div>
        ))}
      </div>
    )}
    </div>
  );
}
