import React, { useState } from 'react';
import { Colors, FontStyles } from './styleConstants';

export default function InputBoxLarge({
  placeholder = '플레이스 홀더 텍스트를 입력해 주세요.',
  errorMessage = '',
  leftIcon = null,
  rightIconVisible = null,
  rightIconHidden = null,
  isPassword = false,
  style = {},
  value,
  onChange,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isTyping = isFocused && value?.length > 0;
  const isCompleted = !isFocused && value?.length > 0;
  const isError = errorMessage !== '';

  const getBorderStyle = () => {
    if (isError) return `1px solid ${Colors.systemRed}`;
    if (isFocused) return `1px solid ${Colors.brandPrimary}`;
    if (isHovered) return `1px solid ${Colors.grey05}`;
    if (isCompleted) return 'none';
    return 'none';
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        fontFamily: FontStyles.body.fontFamily,
        width: '100%',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          paddingLeft: 16,
          paddingRight: 16,
          height: '100%',
          backgroundColor: Colors.componentBackground,
          border: getBorderStyle(),
          transition: 'border 0.2s ease',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {leftIcon && (
          <img
            src={leftIcon}
            alt="left icon"
            style={{
              width: style.iconSize ?? 20,
              height: style.iconSize ?? 20,
              flexShrink: 0,
            }}
          />
        )}

        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : 'text'}
          value={value}
          onChange={onChange} 
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isTyping || isCompleted ? '' : placeholder}
          style={{
            flex: 1,
            height: '100%',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            ...FontStyles.body,
            fontSize: style.fontSize ?? FontStyles.body.fontSize,
            color: Colors.grey07,
          }}
        />

        {isPassword && (
          <img
            src={showPassword ? rightIconVisible : rightIconHidden}
            alt="toggle password visibility"
            onClick={togglePassword}
            style={{
              width: style.iconSize ?? 20,
              height: style.iconSize ?? 20,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          />
        )}
      </div>

      {isError && (
        <span
          style={{
            ...FontStyles.caption,
            color: Colors.systemRed,
            marginLeft: 4,
            fontSize: style.errorFontSize ?? FontStyles.caption.fontSize,
          }}
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
}
