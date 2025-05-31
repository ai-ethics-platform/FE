import React, { useState } from 'react';
import { Colors, FontStyles } from './styleConstants';

export default function InputBoxSimple({
  placeholder = '플레이스 홀더 텍스트를 입력해 주세요.',
  errorMessage = '',
}) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isTyping = isFocused && value.length > 0;
  const isCompleted = !isFocused && value.length > 0;
  const isError = errorMessage !== '';

  const getBorderStyle = () => {
    if (isError) return `1px solid ${Colors.systemRed}`;
    if (isFocused) return `1px solid ${Colors.brandPrimary}`;
    if (isHovered) return `1px solid ${Colors.grey04}`;
    if (isCompleted) return 'none';
    return 'none';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'Pretendard, sans-serif' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '360px',
          height: '72px',
          padding: '0 16px',
          borderRadius: 8,
          backgroundColor: Colors.componentBackground, // ex. rgba(255,255,255,0.1) or 지정값
          border: getBorderStyle(),
          transition: 'border 0.2s ease',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <input
          type="text"
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setValue(e.target.value)}
          placeholder={isTyping || isCompleted ? '' : placeholder}
          style={{
            flex: 1,
            height: '100%',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            ...FontStyles.body,
            color: Colors.grey07,
          }}
        />
      </div>

      {isError && (
        <span style={{ ...FontStyles.caption, color: Colors.systemRed, marginLeft: 4 }}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}
