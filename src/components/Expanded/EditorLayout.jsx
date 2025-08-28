//수정할 것 
// 역할 3개에 대한 이름 GET 해오기 
// 게임 이름에 대한 이름 GET 해오기
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Colors } from '../styleConstants';
import HeaderBar1 from './HeaderBar';
import HeaderBar2 from './HeaderBar2';
import MakeFrame from './MakeFrameGreen';
import UserProfile from '../UserProfile';
import bg2Default from '../../assets/images/bg2.png';
import NextGreen from "../NextOrange";
import BackOrange from "./BackOrange";
import DilemmaOutPopup from '../DilemmaOutPopup'; 

const HEADER_H = 56;

export default function CreatorLayout({
  headerbar = 2,
  headerLeftType = 'home',
  headerNextDisabled = false,
  onHeaderLeftClick,                 
  onHeaderNextClick = () => {},
  frame = true,
  frameProps = {},
  children,
  style = {},
  bg2Src = bg2Default,
  bg2Inset = 32,
  bg2Radius = 0,
  frameBorder = 12,
  bg2InsetTop = 20,
  bg2InsetBottom = 40,
  bg2InsetLeft = 150,
  bg2InsetRight = 150,
  frameShadow = '0 22px 40px rgba(0,0,0,0.16)',
  bg2ObjectFit = 'cover',
  nextPath,
  backPath,
  showNext = false,
  showBack = false,
}) {
  const navigate = useNavigate();

  const Header = headerbar === 1 ? HeaderBar1 : HeaderBar2;
  const mergedFrameProps = { maxLength: 30, ...frameProps };

  const [openProfile, setOpenProfile] = useState(null);
  const [showOutPopup, setShowOutPopup] = useState(false); // ✅ 팝업 상태

  const topInset = bg2InsetTop ?? bg2Inset;
  const rightInset = bg2InsetRight ?? bg2Inset;
  const bottomInset = bg2InsetBottom ?? bg2Inset;
  const leftInset = bg2InsetLeft ?? bg2Inset;

  const handleNext = () => {
    if (nextPath) navigate(nextPath);
    else onHeaderNextClick?.();
  };
  const handleBack = () => {
    if (backPath) navigate(backPath);
    else (onHeaderLeftClick || (() => setShowOutPopup(true)))(); // ⬅️ back 버튼에도 동일 로직 원하면 유지
  };

  //  헤더 좌측 기본 동작: 팝업 열기
  const handleHeaderLeft = onHeaderLeftClick || (() => setShowOutPopup(true));

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
        onLeftClick={handleHeaderLeft}         
        onNextClick={onHeaderNextClick}
        height={HEADER_H}
      />

      <div
        style={{
          position: 'absolute',
          top: HEADER_H,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
        }}
      >
        {/* 좌측 프로필 */}
        <div
          style={{
            position: 'absolute',
            top: '37.5%',
            left: leftInset + 10,
            transform: 'translateY(-50%) scale(0.7)',
            transformOrigin: 'left center',
            width: 220,
            padding: '20px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            alignItems: 'flex-start',
            zIndex: 10,
          }}
        >
          <UserProfile isLeader player="1P" create description="요양보호사" />
          <UserProfile player="2P" create description="노모" />
          <UserProfile player="3P" create description="자녀" />
        </div>

        {/* 흰색 테두리 프레임 */}
        <div
          style={{
            position: 'absolute',
            top: topInset,
            right: rightInset,
            bottom: bottomInset,
            left: leftInset,
            backgroundColor: '#fff',
            boxShadow: frameShadow,
            borderRadius: bg2Radius,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: frameBorder,
              borderRadius: Math.max(0, bg2Radius - frameBorder),
              overflow: 'hidden',
            }}
          >
            <img
              src={bg2Src}
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: bg2ObjectFit,
                zIndex: 0,
                pointerEvents: 'none',
              }}
            />

            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '26px 20px',
              }}
            >
              {frame && (
                <div style={{ width: '100%', maxWidth: 440, marginBottom: 26 }}>
                  <MakeFrame {...mergedFrameProps} />
                </div>
              )}

              <div style={{ width: '100%', maxWidth: 1060, flex: 1 }}>
                {children}
              </div>
            </div>
          </div>
        </div>

        {/* 하단 내비 버튼 */}
        {showNext && (
          <div style={{ position: 'absolute', bottom: 30, right: 30, zIndex: 5 }}>
            <NextGreen onClick={handleNext} />
          </div>
        )}
        {showBack && (
          <div style={{ position: 'absolute', bottom: 30, left: 30, zIndex: 5 }}>
            <BackOrange onClick={handleBack} />
          </div>
        )}
      </div>

      {/* 나가기 확인 팝업 오버레이 */}
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
                navigate('/selectroom');   
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
