// src/components/InputBoxLarge.jsx
import React, { useState } from 'react';
import { Colors, FontStyles } from './styleConstants';

/**
 * InputBoxLarge
 *
 *  - 기존: 내부에서 width: 552px, height: 72px를 고정하고 있었음
 *  - 수정: width, height, fontSize 등 스타일을 부모로부터 props.style로 받도록 변경
 *
 * props:
 *  - placeholder: 입력창 플레이스홀더 텍스트
 *  - errorMessage: 에러 메시지 (빈 문자열이면 에러 없음)
 *  - leftIcon: 왼쪽 아이콘(src 문자열) or null
 *  - rightIconVisible: 비밀번호 보이기 아이콘(src) or null
 *  - rightIconHidden: 비밀번호 가리기 아이콘(src) or null
 *  - isPassword: boolean, 비밀번호 토글 여부
 *  - style: { width?, height?, fontSize?, borderRadius?, ... } 형태의 객체
 */
export default function InputBoxLarge({
  placeholder = '플레이스 홀더 텍스트를 입력해 주세요.',
  errorMessage = '',
  leftIcon = null,
  rightIconVisible = null,
  rightIconHidden = null,
  isPassword = false,
  style = {},            // 새로 추가: 부모가 넘겨줄 수 있는 style 프롭
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

  const togglePassword = () => setShowPassword((prev) => !prev);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        fontFamily: FontStyles.body.fontFamily,
        width: '100%',      // 기본적으로 가로 100%
        ...style,           // 부모가 넘긴 style을 병합
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '94%',       // 무조건 부모 컨테이너 width에 맞추도록
          height: '100%',      // 부모가 지정한 height를 따름
          padding: '0 16px',
          backgroundColor: Colors.componentBackground,
          border: getBorderStyle(),
          transition: 'border 0.2s ease',
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
          onChange={(e) => setValue(e.target.value)}
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
