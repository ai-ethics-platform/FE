import React, { useState } from 'react';
import { Colors, FontStyles } from './styleConstants';


export default function PasswordCheck({
  placeholder = '플레이스 홀더 텍스트를 입력해 주세요.',
  errorMessage = '',
  leftIcon = null,
  rightIconVisible = null,
  rightIconHidden = null,
  isPassword = false,
  value = '',
  onChange = () => {},
  style = {},           // 부모가 넘겨줄 수 있는 style 프롭
}) {
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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        fontFamily: FontStyles.body.fontFamily,
        width: '100%',     // 부모가 지정한 가로 폭에 맞춤
        ...style,          // 부모가 넘긴 style 병합 (width, height, fontSize, iconSize 등)
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',           // 부모가 지정한 너비(폭)에 맞춤
          height: '100%',          // 부모가 지정한 높이를 따른다
          padding: '0 16px',
          backgroundColor: Colors.componentBackground,
          border: getBorderStyle(),
          transition: 'border 0.2s ease',
          boxSizing: 'border-box',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 왼쪽 아이콘 */}
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

        {/* 입력 필드 */}
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
            ...FontStyles.body,
            fontSize: style.fontSize ?? FontStyles.body.fontSize,
            color: Colors.grey07,
          }}
        />

        {/* 오른쪽 eye 토글 아이콘 */}
        {isPassword && (
          <img
            src={showPassword ? rightIconVisible : rightIconHidden}
            alt="toggle password visibility"
            onClick={() => setShowPassword((prev) => !prev)}
            style={{
              width: style.iconSize ?? 20,
              height: style.iconSize ?? 20,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          />
        )}
      </div>

      {/* 에러 메시지 */}
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
