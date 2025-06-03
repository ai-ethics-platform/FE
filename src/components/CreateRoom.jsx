// src/components/CreateRoom.jsx
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

  // 화면 크기에 비례하여 스케일을 계산하는 대신, 
  // “최대 80% 너비” 혹은 “최대 80% 높이”를 기준으로 삼도록 변경
  const [containerStyle, setContainerStyle] = useState({});
  useEffect(() => {
    function updateSize() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // ① 화면 너비 대비 80%
      const maxWidth = vw * 0.8;
      // ② 화면 높이 대비 80%, 원본 높이 744
      const maxHeight = vh * 0.8;
      // 1200×744 비율을 유지하기 위해 비율 계산
      const aspectRatio = 1200 / 744;

      let finalWidth, finalHeight;

      // 우선 “너비 제한(maxWidth)”을 사용해서 비율에 맞는 높이를 계산
      const heightFromWidth = maxWidth / aspectRatio;
      if (heightFromWidth <= maxHeight) {
        // 너비 80%로 잡고 비율에 맞춰서 높이가 maxHeight 이내라면 OK
        finalWidth = maxWidth;
        finalHeight = heightFromWidth;
      } else {
        // 그렇지 않으면 “높이 80%”를 기준으로 잡고, 그에 맞는 너비를 계산
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
    // 뒷배경 오버레이
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
      {/* 비율 유지 컨테이너 */}
      <div
        style={{
          ...containerStyle, 
          position: 'relative',
          backgroundColor: Colors.componentBackgroundFloat,
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {/* 닫기 버튼 */}
        <img
          src={closeIcon}
          alt="Close"
          onClick={onClose}
          style={{
            position: 'absolute',
            right: containerStyle.width * (40 / 1200), // 원본 절대값(40px)을 컨테이너 비율에 맞춰 조정
            top: containerStyle.height * (40 / 744),
            width: containerStyle.width * (40 / 1200),
            height: containerStyle.height * (40 / 744),
            cursor: 'pointer',
            zIndex: 10,
          }}
        />

        {/* CREATE ROOM 텍스트 */}
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

        {/* 설명 텍스트 */}
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

        {/* 안드로이드 맵 이미지 */}
        <img
          src={androidMap}
          alt="Android"
          style={{
            position: 'absolute',
            left: containerStyle.width * (138 / 1200),
            top: containerStyle.height * (15 / 744),
            width: containerStyle.width * (/* 원본 맵 너비 비율 */ 500 / 1200),
            height: 'auto',
          }}
        />

        {/* 안드로이드 프레임 */}
        <img
          src={gameFrame}
          alt="Android Frame"
          style={{
            position: 'absolute',
            left: containerStyle.width * (225 / 1200),
            top: containerStyle.height * (190 / 744),
            width: containerStyle.width * (/* 원본 프레임 너비 비율 */ 300 / 1200),
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

        {/* 사용자 설정 (비활성화) */}
        <img
          src={userMap}
          alt="User Setting"
          style={{
            position: 'absolute',
            left: containerStyle.width * (612 / 1200),
            top: containerStyle.height * (89 / 744),
            width: containerStyle.width * (/* 원본 이미지 너비 비율 */ 400 / 1200),
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

        {/* 자율 무기 시스템 */}
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
