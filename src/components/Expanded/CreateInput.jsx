import React, { useState } from 'react';
import { Colors, FontStyles } from '../styleConstants';
import createInputIcon from '../../assets/createinput.svg';
import createDeleteIcon from '../../assets/inputdelete.svg'; // 삭제 아이콘 추가

export default function CreateInput({
  label,
  labelWidth = 65,
  rowGap = 16,
  placeholder = '플레이스 홀더 텍스트를 입력해 주세요.',
  errorMessage = '',
  width = 580,
  height = 65,
  value = '',
  onChange = () => {},
  onEnter = () => {},
  onDelete = null, // 삭제 콜백 (null이면 삭제 버튼 안 보임)
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isTyping = isFocused && value.length > 0;
  const isCompleted = !isFocused && value.length > 0;
  const isError = errorMessage !== '';

  const getBorderStyle = () => {
    if (isError) return `1px solid ${Colors.systemRed}`;
    if (isFocused) return `0.5px solid ${Colors.CreatorPrimary}`;
    if (isHovered) return `0.5px solid ${Colors.grey04}`;
    return `0px solid ${Colors.grey04}`;
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
            textAlign: 'left',
            ...FontStyles.title,
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
            gap: 5, // 아이콘과 인풋 간격
            position: 'relative', // 커스텀 placeholder를 위해 추가
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* 왼쪽 점 아이콘 */}
          {/* <img
            src={createInputIcon}
            alt=""
            aria-hidden="true"
            style={{ width: 18, height: 18, display: 'block', pointerEvents: 'none' }}
          /> */}

          <input
            type="text"
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.target.blur(); // 포커스 해제
                onEnter(value); // 엔터 콜백 호출
              }
            }}
            placeholder="" // 기본 placeholder 제거
            style={{
              flex: 1,
              height: '100%',
              textAlign: 'left',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              ...FontStyles.body,
              color: isTyping ? Colors.CreatorPrimary : (isCompleted ? Colors.grey06 : Colors.grey05),
            }}
          />

          {/* 오른쪽 삭제 버튼 */}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              style={{
                position: 'absolute',
                right: -10, // 오른쪽에서 8px 떨어진 위치
                top: '50%',
                transform: 'translateY(-50%)',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <img
                src={createDeleteIcon}
                alt="삭제"
                style={{ width: 40, height: 40 }}
              />
            </button>
          )}

          {/* 커스텀 placeholder */}
          {!isTyping && !isCompleted && (
            <div
              style={{
                position: 'absolute',
                left: '20px', // 아이콘(18px) + 패딩(16px) + 간격(5px) + 약간의 여백
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: Colors.grey03, // placeholder 색상을 grey03으로 설정
                ...FontStyles.body,
              }}
            >
              {placeholder}
            </div>
          )}
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