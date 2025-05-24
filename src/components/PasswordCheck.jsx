import React, { useState } from 'react';

export default function InputBoxLarge({
  placeholder = '플레이스 홀더 텍스트를 입력해 주세요.',
  errorMessage = '',
  leftIcon = null,
  rightIconVisible = null,
  rightIconHidden = null,
  isPassword = false,
  value = '',
   bgColor = '#F8FAFC',
  onChange = () => {},
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isTyping = isFocused && value.length > 0;
  const isCompleted = !isFocused && value.length > 0;
  const isError = errorMessage !== '';

  const getBorderStyle = () => {
    if (isError) return '1px solid #9E2D2F';
    if (isFocused) return '1px solid #354750';
    if (isHovered) return '1px solid #788A93';
    if (isCompleted) return 'none';
    return 'none';
  };

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
        backgroundColor: bgColor,
        border: getBorderStyle(),
        transition: 'border 0.2s ease',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {leftIcon && <img src={leftIcon} alt="left icon" style={{ width: 20, height: 20 }} />}

        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : 'text'}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={onChange}
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

        {isPassword && (
          <img
            src={showPassword ? rightIconVisible : rightIconHidden}
            alt="toggle password visibility"
            onClick={() => setShowPassword((prev) => !prev)}
            style={{ width: 20, height: 20, cursor: 'pointer' }}
          />
        )}
      </div>

      {isError && (
        <span style={{ fontSize: 14, color: '#EF4444', marginLeft: 4 }}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}
