import React, { useState, useEffect } from 'react';
import { Colors, FontStyles } from '../styleConstants';
import ModeToggle from './ModeToggle';
import headerBg from '../../assets/header2.svg';
import homeIcon from '../../assets/gotohome.svg';
import nextIcon from '../../assets/completed.svg';
import nextHoverIcon from '../../assets/completedhover.svg';
import nextDisabledIcon from '../../assets/completeddisabled.svg';
import arrowIcon from '../../assets/arrow.svg';
import { useNavigate, useLocation } from 'react-router-dom';

const EDIT_GROUPS = [['/create01'], ['/create02'], ['/create03'], ['/create04'], ['/create05']];
const PREVIEW_GROUPS = [
  ['/editor01'],
  ['/editor02_1', '/editor02_2', '/editor02_3','/editor02'],
  ['/editor03', '/editor04', '/editor05', '/editor06'],
  ['/editor07','/editor07_1', '/editor08', '/editor09'],
  ['/editor10','/editor10_1'],
];

export default function HeaderBar({
  nextDisabled = false,
  height = 56,
  style = {},
  crumbs = ['오프닝 멘트', '역할', '상황 및 딜레마 질문', '플립 단계', '최종 멘트'],
  activeCrumb,
  onCrumbChange,
  onLeftClick,
  onNextClick = () => {},   // ⬅️ 기본값 포함해 prop 추가
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [rightHover, setRightHover] = useState(false);
  const [mode, setMode] = useState('edit');
  const [internalCrumb, setInternalCrumb] = useState(0);

  const h = typeof height === 'number' ? `${height}px` : height;
  const leftImg = homeIcon;
  const rightImg = nextDisabled ? nextDisabledIcon : rightHover ? nextHoverIcon : nextIcon;

  const findModeAndIndex = (path) => {
    const p = path.replace(/\/+$/, '');
    for (let i = 0; i < EDIT_GROUPS.length; i++) if (EDIT_GROUPS[i].includes(p)) return { mode: 'edit', idx: i };
    for (let i = 0; i < PREVIEW_GROUPS.length; i++) if (PREVIEW_GROUPS[i].includes(p)) return { mode: 'preview', idx: i };
    return null;
  };

  useEffect(() => {
    const hit = findModeAndIndex(location.pathname);
    if (hit) {
      setMode(hit.mode);
      setInternalCrumb(hit.idx);
    }
  }, [location.pathname]);

  const currentCrumb = typeof activeCrumb === 'number' ? activeCrumb : internalCrumb;
  const routeOf = (m, idx) => (m === 'preview' ? PREVIEW_GROUPS[idx]?.[0] : EDIT_GROUPS[idx]?.[0]);

  const selectCrumb = (idx) => {
    if (typeof activeCrumb !== 'number') setInternalCrumb(idx);
    onCrumbChange?.(idx);
    const route = routeOf(mode, idx);
    if (route) navigate(route);
  };

  const handleLeftClick = () => navigate('/selectroom');
  const handleModeChange = (newMode) => {
    setMode(newMode);
    const target = routeOf(newMode, currentCrumb);
    if (target) navigate(target);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: h, overflow: 'hidden', ...style }} role="banner">
      <img
        src={headerBg}
        alt=""
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', userSelect: 'none' }}
      />

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
          onClick={onLeftClick || defaultLeftClick} 
          aria-label="home"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 32, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
        >
          <img src={leftImg} alt="" draggable={false} style={{ width: 60, height: 60 }} />
        </button>

        {/* 모드 토글 */}
        <div style={{ padding: '0px 20px' }}>
          <ModeToggle value={mode} onChange={handleModeChange} height={38} padding={2} editRoute="" previewRoute="" />
        </div>

        {/* 브레드크럼 */}
        <nav
          aria-label="단계 네비게이션"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            whiteSpace: 'nowrap',
            zIndex: 2,
          }}
        >
          {crumbs.map((label, idx) => {
            const active = idx === currentCrumb;
            return (
              <React.Fragment key={label}>
                <button
                  type="button"
                  onClick={() => selectCrumb(idx)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    ...FontStyles.bodyBold,
                    color: active ? '#BB4E2D' : Colors.grey05,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </button>
                {idx < crumbs.length - 1 && <img src={arrowIcon} alt="" aria-hidden="true" style={{ width: 12, height: 12, opacity: 0.7 }} />}
              </React.Fragment>
            );
          })}
        </nav>

        {/* 오른쪽 next 버튼 */}
        <button
          type="button"
          disabled={nextDisabled}
          onClick={nextDisabled ? undefined : onNextClick} 
          onMouseEnter={() => !nextDisabled && setRightHover(true)}
          onMouseLeave={() => setRightHover(false)}
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 102,
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
