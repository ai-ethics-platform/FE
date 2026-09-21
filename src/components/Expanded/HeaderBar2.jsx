import React, { useState, useEffect, useRef } from 'react';
import { Colors, FontStyles } from '../styleConstants';
import ModeToggle from './ModeToggle';
import headerBg from '../../assets/header2.svg';
import homeIcon from '../../assets/gotohome.svg';
import nextIcon from '../../assets/completed.svg';
import nextHoverIcon from '../../assets/completedhover.svg';
import nextDisabledIcon from '../../assets/completeddisabled.svg';
import arrowIcon from '../../assets/arrow.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import { diagnosticEvent } from '../../utils/creatorDiagnostics';
import './CreatorLayout.css';

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
  const activeStepRef = useRef(null);
  useEffect(() => { activeStepRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }, [currentCrumb]);
  const routeOf = (m, idx) => (m === 'preview' ? PREVIEW_GROUPS[idx]?.[0] : EDIT_GROUPS[idx]?.[0]);

  // 브레드크럼/모드 토글로 이동할 때도 현재 단계 편집분을 먼저 저장한다.
  // (저장 없이 navigate 하면 편집 내용이 서버에 반영되지 않고 통째로 유실됨)
  const runBeforeNavigate = async () => {
    if (typeof onBeforeNavigate !== 'function') return true;
    const startedAt = Date.now();
    diagnosticEvent('action', { action: 'navigation_save', event: 'start' });
    try {
      const result = await onBeforeNavigate();
      diagnosticEvent('action', { action: 'navigation_save', event: 'end',
        blocked: result === false, duration_ms: Date.now() - startedAt });
      return result !== false;
    } catch (e) {
      diagnosticEvent('action', { action: 'navigation_save', event: 'error', blocked: true,
        duration_ms: Date.now() - startedAt });
      console.error('이동 전 저장 실패:', e);
      return false;
    }
  };

  const selectCrumb = async (idx) => {
    diagnosticEvent('action', { action: 'header_step', count: idx, blocked: navBusy });
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
    diagnosticEvent('action', { action: `header_${newMode}`, blocked: navBusy });
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
    <div style={{ position: 'relative', width: '100%', height: `var(--creator-header-height, ${h})`, flexShrink: 0, overflow: 'hidden', ...style }} role="banner">
      <img
        src={headerBg}
        alt=""
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', userSelect: 'none' }}
      />

      <div
        className="creator-header-controls"
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: h,
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* 왼쪽 홈 버튼 */}
        <button
          type="button"
          onClick={onLeftClick || handleLeftClick}
          aria-label="home"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: 44, height: 44, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
        >
          <img src={leftImg} alt="" draggable={false} style={{ width: 44, height: 44 }} />
        </button>

        {/* 모드 토글 */}
        <div className="creator-header-mode" style={{ flexShrink: 0 }}>
          <ModeToggle disabled={navBusy} value={mode} onChange={handleModeChange} height={38} padding={2} editRoute="" previewRoute="" />
        </div>

        {/* 브레드크럼 */}
        <nav
          className="creator-header-nav"
          aria-label="단계 네비게이션"
          style={{
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
                  aria-current={active ? "step" : undefined}
                  ref={active ? activeStepRef : null}
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
          className="creator-header-complete"
          disabled={nextDisabled || navBusy}
          aria-busy={navBusy}
          aria-label="완료하기"
          onClick={nextDisabled ? undefined : onNextClick} 
          onMouseEnter={() => !nextDisabled && setRightHover(true)}
          onMouseLeave={() => setRightHover(false)}
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            height: h,
            border: 'none',
            background: 'transparent',
            cursor: nextDisabled ? 'not-allowed' : 'pointer',
            padding: 0,
          }}
        >
          <img src={rightImg} alt="" draggable={false} style={{ height: 60 }} />
          <span className="creator-header-complete-label" role="status">{navBusy ? "저장 중…" : "완료하기"}</span>
        </button>
      </div>
    </div>
  );
}
