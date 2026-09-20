//수정할 것 
import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Colors } from '../styleConstants';
import HeaderBar1 from './HeaderBar';
import HeaderBar2 from './HeaderBar2';
import MakeFrame from './MakeFrameGreen';
import UserProfile from '../Userprofile';
import bg2Default from '../../assets/images/bg2.png';
import NextGreen from "../NextOrange";
import BackOrange from "./BackOrange";
import DilemmaOutPopup from '../DilemmaOutPopup'; 
import { diagnosticEvent } from '../../utils/creatorDiagnostics';
import './CreatorLayout.css';

const HEADER_H = 56;

export default function EditorLayout({
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
  const [showOutPopup, setShowOutPopup] = useState(false); 
  const [roleDescs, setRoleDescs] = useState([
    '요양보호사', // 기본값(1P)
    '노모',       // 기본값(2P)
    '자녀',       // 기본값(3P)
  ]);
  const [, setRoleImgVersion] = useState(0);

  //  초기 로드 + 다른 탭/창에서 localStorage 변경까지 반영
  useEffect(() => {
    const loadFromLocal = () => {
      const n1 = localStorage.getItem('char1') || '역할 1';
      const n2 = localStorage.getItem('char2') || '역할 2';
      const n3 = localStorage.getItem('char3') || '역할 3';
      setRoleDescs([n1, n2, n3]);
    };

    loadFromLocal();

    const onStorage = (e) => {
      if (!e.key || !['char1', 'char2', 'char3'].includes(e.key)) return;
      loadFromLocal();
    };
    window.addEventListener('storage', onStorage);

    const onRoleImagesUpdated = () => setRoleImgVersion((v) => v + 1);
    window.addEventListener('role-images-updated', onRoleImagesUpdated);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('role-images-updated', onRoleImagesUpdated);
    };
  }, []);
  const topInset = bg2InsetTop ?? bg2Inset;
  const rightInset = bg2InsetRight ?? bg2Inset;
  const bottomInset = bg2InsetBottom ?? bg2Inset;
  const leftInset = bg2InsetLeft ?? bg2Inset;

  const handleNext = () => {
    diagnosticEvent('action', { action: 'screen_next' });
    if (nextPath) navigate(nextPath);
    else onHeaderNextClick?.();
  };
  const handleBack = () => {
    diagnosticEvent('action', { action: 'screen_back' });
    if (backPath) navigate(backPath);
    else (onHeaderLeftClick || (() => setShowOutPopup(true)))(); // ⬅️ back 버튼에도 동일 로직 원하면 유지
  };

  //  헤더 좌측 기본 동작: 팝업 열기
  const handleHeaderLeft = onHeaderLeftClick || (() => setShowOutPopup(true));

  return (
    <div
      className="creator-layout"
      style={{
        display: 'flex',
        flexDirection: 'column',
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
        className="creator-preview-scroll"
        style={{
          paddingTop: topInset,
          paddingLeft: `clamp(16px, calc((100vw - 1024px) / 2), ${leftInset}px)`,
          paddingRight: `clamp(16px, calc((100vw - 1024px) / 2), ${rightInset}px)`,
          paddingBottom: bottomInset,
        }}
      >
        <div
          className="creator-preview-panel"
          style={{
            border: `${frameBorder}px solid #fff`,
            borderRadius: bg2Radius,
            boxShadow: frameShadow,
          }}
        >
          <img
            src={bg2Src}
            alt=""
            draggable={false}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: bg2ObjectFit, borderRadius: Math.max(0, bg2Radius - frameBorder), pointerEvents: 'none' }}
          />
          <div className="creator-preview-profiles">
            <UserProfile isLeader player="1P" create description={roleDescs[0]} />
            <UserProfile player="2P" create description={roleDescs[1]} />
            <UserProfile player="3P" create description={roleDescs[2]} />
          </div>
          <div className="creator-preview-content">
            {frame && (
              <div style={{ width: '100%', maxWidth: 440, marginBottom: 26 }}>
                <MakeFrame {...mergedFrameProps} />
              </div>
            )}
            <div style={{ width: '100%', maxWidth: 1060 }}>{children}</div>
          </div>
        </div>
      </div>
      {(showNext || showBack) && (
        <div className="creator-preview-footer">
          <div>{showBack && <BackOrange onClick={handleBack} />}</div>
          <div>{showNext && <NextGreen onClick={handleNext} />}</div>
        </div>
      )}

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
