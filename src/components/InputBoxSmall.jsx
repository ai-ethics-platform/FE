import React, { useState } from 'react';

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
    if (isError) return '1px solid #EF4444';
    if (isFocused) return '1px solid #0F172A';
    if (isHovered) return '1px solid #CBD5E1';
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
          backgroundColor: '#F8FAFC',
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
            fontSize: 16,
            fontWeight: 400,
            color: '#1E293B',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {isError && (
        <span style={{ fontSize: 14, color: '#EF4444', marginLeft: 4 }}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}
