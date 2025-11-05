import React, { useState, useEffect } from 'react';
import { Colors, FontStyles } from '../styleConstants';
import headerBg from '../../assets/header5.svg';
import homeIcon from '../../assets/gotohome.svg';
import nextIcon from '../../assets/completed.svg';
import nextHoverIcon from '../../assets/completedhover.svg';
import nextDisabledIcon from '../../assets/completeddisabled.svg';
import { useNavigate, useLocation } from 'react-router-dom';


export default function HeaderBar({
  nextDisabled = false,
  height = 56,
  style = {},
  onLeftClick,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [rightHover, setRightHover] = useState(false);
  const [mode, setMode] = useState('edit');
  const [internalCrumb, setInternalCrumb] = useState(0);

  const h = typeof height === 'number' ? `${height}px` : height;
  const leftImg = homeIcon;
  const rightImg = nextDisabled ? nextDisabledIcon : rightHover ? nextHoverIcon : nextIcon;


  const currentCrumb = typeof activeCrumb === 'number' ? activeCrumb : internalCrumb;
  const routeOf = (m, idx) => (m === 'preview' ? PREVIEW_GROUPS[idx]?.[0] : EDIT_GROUPS[idx]?.[0]);

  const selectCrumb = (idx) => {
    if (typeof activeCrumb !== 'number') setInternalCrumb(idx);
    onCrumbChange?.(idx);
    const route = routeOf(mode, idx);
    if (route) navigate(route);
  };

  const handleLeftClick = () => {
    if (onLeftClick) {
      onLeftClick();   // ✅ 부모에서 보낸 함수 (팝업 열기)
      return;
    }
    navigate('/selectroom'); // ✅ onLeftClick 없을 때만 이동
  };
    const handleModeChange = (newMode) => {
    setMode(newMode);
    const target = routeOf(newMode, currentCrumb);
    if (target) navigate(target);
  };
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
      {/* 배경 이미지는 제거하고 */}
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
        {/* 왼쪽 홈 버튼 */}
        <button
          type="button"
          onClick={onLeftClick || handleLeftClick}
          aria-label="home"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 32,
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <img src={leftImg} alt="" draggable={false} style={{ width: 60, height: 60 }} />
        </button>
  
        {/* 버튼 옆에 배경 이미지 배치 */}
        <img
          src={headerBg}
          alt="header background"
          style={{
            height: '100%',
            flex: 1, // 남는 공간 채우기
            objectFit: 'cover',
          }}
        />
      </div>
    </div>
  );}