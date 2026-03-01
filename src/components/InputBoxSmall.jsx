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
  style = {}, // ✅ 외부에서 스타일을 넘겨받을 수 있도록 props 추가
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ✅ 포커스(클릭)되면 값 유무와 상관없이 placeholder를 숨겨 커서만 보이도록
  const isTyping = isFocused;
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
              ...FontStyles.body, // 기본 폰트 스타일
              color: value.length > 0 ? '#000000' : Colors.grey05,
              // 값이 없을 때(placeholder 상태)만 외부에서 넘겨준 작은 사이즈 사용,
              // 사용자가 입력한 값이 있을 때는 원래의 사이즈 유지.
              fontSize: (value.length === 0 && !isFocused)
                ? (style.fontSize || 'inherit')
                : '20px',
              ...Object.entries(style).reduce((acc, [k, v]) => {
                if (k !== 'fontSize') acc[k] = v; // fontSize는 위에서 조건부로 처리했으므로 제외
                return acc;
              }, {}),
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