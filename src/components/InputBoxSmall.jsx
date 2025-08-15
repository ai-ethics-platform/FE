import React, { useState } from 'react';
import { Colors, FontStyles } from './styleConstants';

export default function InputBoxSmall({
  label,                    
  labelWidth = 120,          
  rowGap = 16,               
  placeholder = '플레이스 홀더 텍스트를 입력해 주세요.',
  errorMessage = '',
  width = 480,
  height = 56,
  value = '',
  onChange = () => {},
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isTyping = isFocused && value.length > 0;
  const isCompleted = !isFocused && value.length > 0;
  const isError = errorMessage !== '';

  const getBorderStyle = () => {
    if (isError) return `1px solid ${Colors.systemRed}`;
    if (isFocused) return `1px solid ${Colors.brandPrimary}`;
    if (isHovered) return `1px solid ${Colors.grey04}`;
    return `1px solid ${Colors.grey04}`; 
  };

  const toSize = (v) => {
    if (typeof v === 'number') return `${v}px`;
    if (/^\d+$/.test(v)) return `${parseInt(v, 10)}px`;
    return v; 
  };

  const boxWidth = toSize(width);
  const boxHeight = toSize(height);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: rowGap }}>
      {/* 라벨 + 입력박스 한 줄 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {/* 라벨 */}
        <div
          style={{
            width: toSize(labelWidth),
            textAlign: 'right',
            ...FontStyles.body,
            color: Colors.grey06,
            whiteSpace: 'pre-wrap',
          }}
        >
          {label}
        </div>

        {/* 입력박스 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: boxWidth,
            height: boxHeight,
            padding: '0 16px',
            backgroundColor: Colors.componentBackground,
            border: getBorderStyle(),
            transition: 'border 0.2s ease',
            boxSizing: 'border-box',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <input
            type="text"
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isTyping || isCompleted ? '' : placeholder}
            style={{
              flex: 1,
              height: '100%',
              textAlign: 'center', 
              border: 'none',
              outline: 'none',
              background: 'transparent',
              ...FontStyles.body,
              color: Colors.grey05,
            }}
          />
        </div>
      </div>

      {isError && (
        <span style={{ ...FontStyles.caption, color: Colors.systemRed, marginLeft: toSize(labelWidth) }}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}
