import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import androidMap from '../assets/android.svg';
import weaponMap from '../assets/weaponsystem.svg';
import userMap from '../assets/usersetting.svg';
import gameFrame from '../assets/gameframe1.svg';
import closeIcon from "../assets/close.svg";
import lockIcon from "../assets/lock.svg";

import { Colors, FontStyles } from './styleConstants';

export default function CreateRoom({ onClose, disabled = true }) {
  const navigate = useNavigate();

  const [containerStyle, setContainerStyle] = useState({});
  useEffect(() => {
    function updateSize() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxWidth = vw * 0.8;
      const maxHeight = vh * 0.8;
      const aspectRatio = 1200 / 744;

      let finalWidth, finalHeight;

      const heightFromWidth = maxWidth / aspectRatio;
      if (heightFromWidth <= maxHeight) {
        finalWidth = maxWidth;
        finalHeight = heightFromWidth;
      } else {
        finalHeight = maxHeight;
        finalWidth = maxHeight * aspectRatio;
      }

      setContainerStyle({
        width: finalWidth,
        height: finalHeight,
      });
    }

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleClick = (topic) => {
    navigate('/waitingroom', { state: { topic } }); 
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, 
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        overflow: 'auto',
      }}
    >
      <div
        style={{
          ...containerStyle, 
          position: 'relative',
          backgroundColor: Colors.componentBackgroundFloat,
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <img
          src={closeIcon}
          alt="Close"
          onClick={onClose}
          style={{
            position: 'absolute',
            right: containerStyle.width * (40 / 1200), 
            top: containerStyle.height * (40 / 744),
            width: containerStyle.width * (40 / 1200),
            height: containerStyle.height * (40 / 744),
            cursor: 'pointer',
            zIndex: 10,
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: containerStyle.width * (117 / 1200),
            top: containerStyle.height * (596 / 744),
            color: Colors.brandPrimary,
            fontSize: FontStyles.headlineNormal.fontSize * (containerStyle.width / 1200),
            lineHeight: FontStyles.headlineNormal.lineHeight,
            fontFamily: FontStyles.headlineNormal.fontFamily,
          }}
        >
          CREATE ROOM
        </div>

        <div
          style={{
            position: 'absolute',
            left: containerStyle.width * (80 / 1200),
            top: containerStyle.height * (640 / 744),
            color: Colors.grey06,
            fontSize: FontStyles.title.fontSize * (containerStyle.width / 1200),
            lineHeight: FontStyles.title.lineHeight,
            fontFamily: FontStyles.title.fontFamily,
          }}
        >
          플레이할 게임의 주제를 선택해 주세요.
        </div>

        <img
          src={androidMap}
          alt="Android"
          style={{
            position: 'absolute',
            left: containerStyle.width * (138 / 1200),
            top: containerStyle.height * (15 / 744),
            width: containerStyle.width * (500 / 1200),
            height: 'auto',
          }}
        />

        <img
          src={gameFrame}
          alt="Android Frame"
          style={{
            position: 'absolute',
            left: containerStyle.width * (225 / 1200),
            top: containerStyle.height * (190 / 744),
            width: containerStyle.width * ( 300 / 1200),
            height: 'auto',
          }}
        />

        <div
          onClick={() => handleClick('안드로이드')}
          style={{
            position: 'absolute',
            left: containerStyle.width * (331 / 1200),
            top: containerStyle.height * (207 / 744),
            color: Colors.brandPrimary,
            cursor: 'pointer',
            fontSize: FontStyles.headlineSmall.fontSize * (containerStyle.width / 1200),
            lineHeight: FontStyles.headlineSmall.lineHeight,
            fontFamily: FontStyles.headlineSmall.fontFamily,
          }}
        >
          안드로이드
        </div>

        <img
          src={userMap}
          alt="User Setting"
          style={{
            position: 'absolute',
            left: containerStyle.width * (612 / 1200),
            top: containerStyle.height * (89 / 744),
            width: containerStyle.width * (400 / 1200),
            height: 'auto',
            opacity: disabled ? 0.6 : 1,
            pointerEvents: disabled ? 'none' : 'auto',
          }}
        />

        <img
          src={gameFrame}
          alt="User Frame"
          style={{
            position: 'absolute',
            left: containerStyle.width * (712 / 1200),
            top: containerStyle.height * (224 / 744),
            width: containerStyle.width * (300 / 1200),
            height: 'auto',
            opacity: disabled ? 0.6 : 1,
            pointerEvents: disabled ? 'none' : 'auto',
          }}
        />

        {disabled && (
          <>
            <img
              src={lockIcon}
              alt="Lock Left"
              style={{
                position: 'absolute',
                left: containerStyle.width * (736 / 1200),
                top: containerStyle.height * (236 / 744),
                width: containerStyle.width * (40 / 1200),
                height: containerStyle.height * (40 / 744),
              }}
            />
            <img
              src={lockIcon}
              alt="Lock Right"
              style={{
                position: 'absolute',
                left: containerStyle.width * (908 / 1200),
                top: containerStyle.height * (236 / 744),
                width: containerStyle.width * (40 / 1200),
                height: containerStyle.height * (40 / 744),
              }}
            />
          </>
        )}

        <div
          style={{
            position: 'absolute',
            left: containerStyle.width * (791 / 1200),
            top: containerStyle.height * (240 / 744),
            color: disabled ? Colors.grey05 : Colors.brandPrimary,
            opacity: disabled ? 0.6 : 1,
            pointerEvents: disabled ? 'none' : 'auto',
            fontSize: FontStyles.headlineSmall.fontSize * (containerStyle.width / 1200),
            lineHeight: FontStyles.headlineSmall.lineHeight,
            fontFamily: FontStyles.headlineSmall.fontFamily,
          }}
        >
          사용자 설정
        </div>

        <img
          src={weaponMap}
          alt="Weapon System"
          style={{
            position: 'absolute',
            left: containerStyle.width * (437.87 / 1200),
            top: containerStyle.height * (155.22 / 744),
            width: containerStyle.width * (500 / 1200),
            height: 'auto',
          }}
        />
        <img
          src={gameFrame}
          alt="Weapon Frame"
          style={{
            position: 'absolute',
            left: containerStyle.width * (580.94 / 1200),
            top: containerStyle.height * (540 / 744),
            width: containerStyle.width * (300 / 1200),
            height: 'auto',
          }}
        />
        <div
          onClick={() => handleClick('자율 무기 시스템')}
          style={{
            position: 'absolute',
            left: containerStyle.width * (636.94 / 1200),
            top: containerStyle.height * (556 / 744),
            color: Colors.brandPrimary,
            cursor: 'pointer',
            fontSize: FontStyles.headlineSmall.fontSize * (containerStyle.width / 1200),
            lineHeight: FontStyles.headlineSmall.lineHeight,
            fontFamily: FontStyles.headlineSmall.fontFamily,
          }}
        >
          자율 무기 시스템
        </div>
      </div>
    </div>
  );
}
