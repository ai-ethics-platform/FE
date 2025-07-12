import React from 'react';
import checkboxIcon from '../assets/checkbox.svg';
import { Colors, FontStyles } from './styleConstants';

export default function SelectCard({
  label = '개인정보 수집 및 연구 활용에 동의합니다.',
  selected = false,
  onClick = () => {},
  style = {},        
}) {
  const {
    width,         
    height,        
    fontSize,      
    padding,      
    gap,           
    iconSize,      
    ...restStyle   
  } = style;

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    width: width || '100%',          // 부모가 넘겨준 width가 없으면 100%
    height: height || '100%',        // 부모가 넘겨준 height가 없으면 컨텐츠 높이에 맞춤
    padding: padding !== undefined ? padding : '0 16px',
    gap: gap !== undefined ? gap : 12,
    backgroundColor: Colors.componentBackground,
    borderRadius: 4,
    border: selected
      ? `1px solid ${Colors.grey07}`
      : `1px solid ${Colors.grey04}`,
    cursor: 'pointer',
    ...restStyle,   
  };

  const checkboxWrapperStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: iconSize !== undefined ? iconSize * 1.2 : 24,   
    height: iconSize !== undefined ? iconSize * 1.2 : 24,
    minWidth: iconSize !== undefined ? iconSize * 1.2 : 24,
    minHeight: iconSize !== undefined ? iconSize * 1.2 : 24,
    borderRadius: 4,
    backgroundColor: selected ? Colors.brandPrimary : 'transparent',
    border: selected ? 'none' : `1.5px solid ${Colors.grey05}`,
    flexShrink: 0,
  };

  const iconStyle = {
    width: iconSize !== undefined ? iconSize : 20,
    height: iconSize !== undefined ? iconSize : 20,
    objectFit: 'contain',
    backgroundColor: Colors.grey01,
  };

  return (
    <div style={containerStyle} onClick={onClick}>
      <div style={checkboxWrapperStyle}>
        {selected && <img src={checkboxIcon} alt="check" style={iconStyle} />}
      </div>

      <span
        style={{
          flex: 1,
          ...FontStyles.body,
          fontSize: fontSize !== undefined ? fontSize : FontStyles.body.fontSize,
          color: Colors.grey07,
        }}
      >
        {label}
      </span>
    </div>
  );
}
