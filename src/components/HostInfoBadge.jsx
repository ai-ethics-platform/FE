import React, { useMemo, useState } from 'react';
import closeIconDefault from '../assets/close.svg';

/**
 * host_info*.svg 이미지 위에 닫기 버튼을 얹어 "닫기" 가능한 배지 컴포넌트
 * - 기본: 닫기 누르면 해당 페이지에서만(언마운트 전까지) 숨김
 */
export default function HostInfoBadge({
  src,
  alt = 'Host Info',
  width = 300,
  height = 300,
  imgStyle = {},
  style = {},
  closeButtonStyle = {},
  closeIconStyle = {},
  defaultOpen = true,
  onClose,
  /**
   * host_info*.svg처럼 "이미지 내부에 X 아이콘이 이미 그려져 있는" 경우,
   * 버튼을 해당 X 영역에 자동으로 맞춰줍니다.
   * - 현재 프리셋은 `hostInfo`만 지원
   */
  preset,
  /**
   * 이미지 자체에 X가 있는 경우 보통 아이콘을 또 그릴 필요가 없어서 기본 false
   */
  showCloseIcon = false,
  closeIconSrc = closeIconDefault,
  closeAriaLabel = '닫기',
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));

  const computedCloseRect = useMemo(() => {
    if (preset !== 'hostInfo') return null;

    // host_info.svg / host_info2.svg 공통(비슷한) 뷰박스
    const viewBoxW = 478;
    const viewBoxH = 130;

    // X 박스 영역(대략). host_info.svg는 y=11, host_info2.svg는 y=9라 중간값 사용
    const xBox = { x: 433, y: 10, w: 33, h: 33 };

    const w = typeof width === 'number' ? width : Number(String(width).replace('px', ''));
    const h = typeof height === 'number' ? height : Number(String(height).replace('px', ''));
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;

    // preserveAspectRatio="xMidYMid meet" 기준으로 실제 그려지는 영역을 계산
    const scale = Math.min(w / viewBoxW, h / viewBoxH);
    const drawnW = viewBoxW * scale;
    const drawnH = viewBoxH * scale;
    const offsetX = (w - drawnW) / 2;
    const offsetY = (h - drawnH) / 2;

    // 클릭하기 쉽게 hit-area를 약간 확장(겉으로는 이미지의 X를 그대로 사용)
    const pad = 8;
    const left = offsetX + xBox.x * scale - pad;
    const top = offsetY + xBox.y * scale - pad;
    const rectW = xBox.w * scale + pad * 2;
    const rectH = xBox.h * scale + pad * 2;

    return {
      left: Math.max(0, left),
      top: Math.max(0, top),
      width: Math.min(w, rectW),
      height: Math.min(h, rectH),
    };
  }, [preset, width, height]);

  // ⚠️ Hooks 이후에 early return 해야 hooks 순서가 깨지지 않습니다.
  if (!open) return null;

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        ...style,
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          ...imgStyle,
        }}
      />

      <button
        type="button"
        aria-label={closeAriaLabel}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(false);
          onClose?.();
        }}
        style={{
          position: 'absolute',
          ...(computedCloseRect
            ? {
                top: computedCloseRect.top,
                left: computedCloseRect.left,
                width: computedCloseRect.width,
                height: computedCloseRect.height,
              }
            : {
                top: 10,
                right: 10,
                width: 34,
                height: 34,
              }),
          padding: 0,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...closeButtonStyle,
        }}
      >
        {showCloseIcon && (
          <img
            src={closeIconSrc}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              ...closeIconStyle,
            }}
          />
        )}
      </button>
    </div>
  );
}


