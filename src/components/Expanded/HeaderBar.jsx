import React, { useState } from 'react';
import { Colors, FontStyles } from '../styleConstants';

import headerBg from '../../assets/header.svg';
import homeIcon from '../../assets/gotohome.svg';
import backIcon from '../../assets/goback.svg';
import nextIcon from '../../assets/gonext.svg';
import nextHoverIcon from '../../assets/gonexthover.svg';
import nextDisabledIcon from '../../assets/gonextdisable.svg';

export default function HeaderBar({
  leftType = 'home',        // 'home' | 'back'
  nextDisabled = false,     // 오른쪽 버튼 비활성
  onLeftClick = () => {},
  onNextClick = () => {},
  height = 56,
  style = {},
}) {
  const [rightHover, setRightHover] = useState(false);
  const h = typeof height === 'number' ? `${height}px` : height;

  const leftImg = leftType === 'home' ? homeIcon : backIcon;
  const rightImg = nextDisabled
    ? nextDisabledIcon
    : rightHover
      ? nextHoverIcon
      : nextIcon;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: h,
        overflow: 'hidden',
        ...style,
      }}
      role="banner"
    >
      {/* 배경 SVG */}
      <img
        src={headerBg}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />

      {/* 컨텐츠 레이어 */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          paddingInline: 12,
          boxSizing: 'border-box',
          gap: 12,
        }}
      >
        {/* 왼쪽 버튼 (home/back) */}
        <button
          type="button"
          onClick={onLeftClick}
          aria-label={leftType === 'home' ? '홈으로' : '뒤로'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 32,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <img src={leftImg} alt="" draggable={false} style={{ width: 60, height: 60 }} />
        </button>

        {/* 오른쪽 next 버튼 */}
        <button
          type="button"
          onClick={nextDisabled ? undefined : onNextClick}
          aria-label="다음"
          disabled={nextDisabled}
          onMouseEnter={() => !nextDisabled && setRightHover(true)}
          onMouseLeave={() => setRightHover(false)}
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 102,            // 클릭 범위 여유
            height: '100%',
            border: 'none',
            background: 'transparent',
            cursor: nextDisabled ? 'not-allowed' : 'pointer',
            padding: 0,
          }}
        >
          <img src={rightImg} alt="" draggable={false} style={{ width: 200, height: 60 }} />
        </button>
      </div>
    </div>
  );
}
