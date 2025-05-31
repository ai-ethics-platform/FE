import React, { useState } from 'react';
import { Colors, FontStyles } from './styleConstants';

export default function InputBoxLarge({
  placeholder = '플레이스 홀더 텍스트를 입력해 주세요.',
  errorMessage = '',
  leftIcon = null,
  rightIconVisible = null, // eye on
  rightIconHidden = null,  // eye off
  isPassword = false,
}) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isTyping = isFocused && value.length > 0;
  const isCompleted = !isFocused && value.length > 0;
  const isError = errorMessage !== '';

  const getBorderStyle = () => {
    if (isError) return `1px solid ${Colors.systemRed}`;
    if (isFocused) return `1px solid ${Colors.brandPrimary}`;
    if (isHovered) return `1px solid ${Colors.grey05}`;
    if (isCompleted) return 'none';
    return 'none';
  };

  const togglePassword = () => setShowPassword(prev => !prev);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'Pretendard, sans-serif' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '552px',
          height: '72px',
          padding: '0 16px',
          borderRadius: 8,
          backgroundColor: Colors.componentBackground, // rgba(255,255,255,0.1)
          border: getBorderStyle(),
          transition: 'border 0.2s ease',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 왼쪽 아이콘 */}
        {leftIcon && <img src={leftIcon} alt="left icon" style={{ width: 20, height: 20 }} />}

        {/* 입력 필드 */}
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : 'text'}
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

        {/* 오른쪽 eye 토글 아이콘 */}
        {isPassword && (
          <img
            src={showPassword ? rightIconVisible : rightIconHidden}
            alt="toggle password visibility"
            onClick={togglePassword}
            style={{ width: 20, height: 20, cursor: 'pointer' }}
          />
        )}
      </div>

      {/* 에러 메시지 */}
      {isError && (
        <span style={{ ...FontStyles.caption, color: Colors.systemRed, marginLeft: 4 }}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}
