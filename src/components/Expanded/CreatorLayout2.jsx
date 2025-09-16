import React, { useState } from 'react';
import { Colors } from '../styleConstants';
import HeaderBar1 from './HeaderBar';
import HeaderBar2 from './HeaderBar2';
import MakeFrame from './MakeFrame';
import DilemmaOutPopup from '../DilemmaOutPopup';
import { useNavigate } from 'react-router-dom';

const HEADER_H = 56;

export default function CreatorLayout({
  headerbar = 1,
  headerLeftType = 'home',
  headerNextDisabled = false,
  onHeaderLeftClick,   // 외부에서 덮어쓸 수 있지만 기본은 팝업
  onHeaderNextClick = () => {},
  frame = true,
  frameProps = {},
  children,
  style = {},
}) {
  const Header = headerbar === 1 ? HeaderBar1 : HeaderBar2;
  const mergedFrameProps = { maxLength: 30, ...frameProps };
  const navigate = useNavigate();

  const [showOutPopup, setShowOutPopup] = useState(false);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: Colors.creatorgrey01,
        overflow: 'hidden',
        ...style,
      }}
    >
      <Header
        leftType={headerLeftType}
        nextDisabled={headerNextDisabled}
        onLeftClick={onHeaderLeftClick || (() => setShowOutPopup(true))} // 기본: 팝업 열기
        onNextClick={onHeaderNextClick}
        height={HEADER_H}
      />

      {/* === 스크롤 컨테이너 === */}
      <div
        style={{
          height: `calc(100% - ${HEADER_H}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',        // ✅ center → stretch
          justifyContent: 'flex-start', // ✅ 항상 위에서부터
          overflowY: 'auto',
          padding: frame ? '26px 0 30px' : 0,
          gap: frame ? 26 : 0,
          minHeight: 0,                 // ✅ flex+overflow 스크롤 보장
        }}
      >
        {frame && (
          <div
            style={{
              width: '100%',
              maxWidth: 500,
              margin: '0 auto',         // ✅ 가운데 정렬 유지
              minWidth: 0,
            }}
          >
            <MakeFrame {...mergedFrameProps} />
          </div>
        )}

        <div
          style={{
            width: '100%',
            maxWidth: 1060,
            margin: '0 auto',           // ✅ 가운데 정렬 유지
            minWidth: 0,                // ✅ 그리드/긴 내용 넘침 방지
          }}
        >
          {children}
        </div>
      </div>

      {/* 팝업 오버레이 */}
      {showOutPopup && (
        <div
          onClick={() => setShowOutPopup(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <DilemmaOutPopup
              onClose={() => setShowOutPopup(false)}
              onLogout={() => {
                setShowOutPopup(false);
                navigate('/selectroom'); //  메인으로 이동
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
