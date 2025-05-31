import React from 'react';
import checkboxIcon from '../assets/checkbox.svg';
import { Colors, FontStyles } from './styleConstants';

export default function SelectCard({
  label = '개인정보 수집 및 연구 활용에 동의합니다.',
  selected = false,
  onClick = () => {},
}) {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '552px',
    height: '72px',
    padding: '0 16px',
    borderRadius: 8,
    backgroundColor: Colors.componentBackground, // #F8FAFC
    border: selected
      ? `1px solid ${Colors.grey07}` // #1E293B
      : `1px solid ${Colors.grey04}`, // #CBD5E1
    ...FontStyles.body,
    color: Colors.grey07,
    cursor: 'pointer',
  };

  const checkboxWrapperStyle = {
    width: 24,
    height: 24,
    minWidth: 24,
    minHeight: 24,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: selected ? Colors.brandPrimary : 'transparent',
    border: selected ? 'none' : `1.5px solid ${Colors.grey05}`,
  };

  const iconStyle = {
    width: 20,
    height: 20,
    objectFit: 'contain',
  };

  return (
    <div style={containerStyle} onClick={onClick}>
      <div style={checkboxWrapperStyle}>
        {selected && (
          <img src={checkboxIcon} alt="check" style={iconStyle} />
        )}
      </div>
      <span>{label}</span>
    </div>
  );
}
