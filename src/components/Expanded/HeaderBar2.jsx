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

const findModeAndIndex = (path) => {
  const p = path.replace(/\/+$/, '');
  for (let i = 0; i < EDIT_GROUPS.length; i++) if (EDIT_GROUPS[i].includes(p)) return { mode: 'edit', idx: i };
  for (let i = 0; i < PREVIEW_GROUPS.length; i++) if (PREVIEW_GROUPS[i].includes(p)) return { mode: 'preview', idx: i };
  return null;
};

export default function HeaderBar({
  nextDisabled = false,
  height = 56,
  style = {},
  crumbs = ['오프닝 멘트', '역할', '상황 및 딜레마 질문', '플립 단계', '최종 멘트'],
  activeCrumb,
  onCrumbChange,
  onLeftClick,
  onNextClick = () => {},   // ⬅️ 기본값 포함해 prop 추가
  onBeforeNavigate,         // 단계 이동 전에 현재 단계를 저장(PUT)하는 훅. false 반환 시 이동 취소
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [rightHover, setRightHover] = useState(false);
  const [navBusy, setNavBusy] = useState(false);
  const initialHit = findModeAndIndex(location.pathname);
  const [mode, setMode] = useState(initialHit?.mode ?? 'edit');
  const [internalCrumb, setInternalCrumb] = useState(initialHit?.idx ?? 0);

  const h = typeof height === 'number' ? `${height}px` : height;
  const leftImg = homeIcon;
  const rightImg = nextDisabled ? nextDisabledIcon : rightHover ? nextHoverIcon : nextIcon;

  useEffect(() => {
    const hit = findModeAndIndex(location.pathname);
    if (hit) {
      setMode(hit.mode);
      setInternalCrumb(hit.idx);
    }
  }, [location.pathname]);

  const currentCrumb = typeof activeCrumb === 'number' ? activeCrumb : internalCrumb;
  const routeOf = (m, idx) => (m === 'preview' ? PREVIEW_GROUPS[idx]?.[0] : EDIT_GROUPS[idx]?.[0]);

  // 브레드크럼/모드 토글로 이동할 때도 현재 단계 편집분을 먼저 저장한다.
  // (저장 없이 navigate 하면 편집 내용이 서버에 반영되지 않고 통째로 유실됨)
  const runBeforeNavigate = async () => {
    if (typeof onBeforeNavigate !== 'function') return true;
    try {
      const result = await onBeforeNavigate();
      return result !== false;
    } catch (e) {
      console.error('이동 전 저장 실패:', e);
      return false;
    }
  };

  const selectCrumb = async (idx) => {
    if (navBusy) return;
    const route = routeOf(mode, idx);
    if (!route) return;

    setNavBusy(true);
    const ok = await runBeforeNavigate();
    setNavBusy(false);
    if (!ok) return;

    if (typeof activeCrumb !== 'number') setInternalCrumb(idx);
    onCrumbChange?.(idx);
    navigate(route);
  };

  const handleLeftClick = () => navigate('/selectroom');

  const handleModeChange = async (newMode) => {
    if (navBusy) return;
    const target = routeOf(newMode, currentCrumb);
    if (!target) return;

    setNavBusy(true);
    const ok = await runBeforeNavigate();
    setNavBusy(false);
    if (!ok) return;

    setMode(newMode);
    navigate(target);
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
          onClick={onLeftClick || handleLeftClick}
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
                  disabled={navBusy}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: navBusy ? 'wait' : 'pointer',
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
