import React, { useState, useEffect } from 'react';
import arrowUp from '../assets/arrowUp.svg';
import arrowDown from '../assets/arrowDown.svg';

export default function SelectDrop({ options = [],  bgColor = '#F8FAFC', value = '', onSelect = () => {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selected, setSelected] = useState(value);

  // 외부 value가 바뀌면 내부에도 반영
  useEffect(() => {
    setSelected(value);
  }, [value]);

  const toggleDropdown = () => setIsOpen(prev => !prev);

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    onSelect(option); // 외부로 값 전달!!
  };

  const wrapperStyle = {
    position: 'relative',
    width: '552px',
    fontFamily: 'Pretendard, sans-serif',
    userSelect: 'none',
  };

  const controlStyle = {
    width: '100%',
    height: '72px',
    padding: '0 16px',
    borderRadius: 8,
    backgroundColor: bgColor,
    border: isOpen
      ? '1px solid #0F172A'
      : isHovered
      ? '1px solid #CBD5E1'
      : 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    transition: 'border 0.2s ease',
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '76px',
    left: 0,
    width: '100%',
    backgroundColor: bgColor,
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    zIndex: 9999,
    padding: '8px 0',
  };

  const optionStyle = {
    padding: '20px 16px',
    fontSize: 16,
    color: '#1E293B',
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
        <span style={{ color: selected ? '#1E293B' : '#788388' }}>
          {selected || '선택...'}
        </span>
        <img
          src={isOpen ? arrowUp : arrowDown}
          alt="arrow"
          width={20}
          height={20}
        />
      </div>

      {isOpen && (
        <div style={dropdownStyle}>
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
