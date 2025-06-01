import React from 'react';
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

  const handleClick = (topic) => {
    navigate('/waitingroom', { state: { topic } }); // 선택한 topic 상태로 전달
  };

  return (
    <div style={{
      width: 1200,
      height: 744,
      position: 'relative',
      backgroundColor: Colors.componentBackgroundFloat,
    }}>
      {/* 닫기 버튼 */}
      <img src={closeIcon} alt="Close" onClick={onClose}
        style={{
          position: 'absolute',
          left: 1120,
          top: 40,
          width: 40,
          height: 40,
          cursor: 'pointer',
          zIndex: 10,
        }} />

      {/* 제목 */}
      <div style={{
        position: 'absolute',
        ...FontStyles.headlineNormal,
        left: 117,
        top: 596,
        color: Colors.brandPrimary,
      }}>CREATE ROOM</div>

      {/* 설명 */}
      <div style={{
        position: 'absolute',
        ...FontStyles.title,
        color: Colors.grey06,
        left: 80,
        top: 640,
      }}>플레이할 게임의 주제를 선택해 주세요.</div>

      {/* 안드로이드 */}
      <img src={androidMap} alt="Android" style={{ position: 'absolute', left: 129, top: 14 }} />
      <img src={gameFrame} alt="Android Frame" style={{ position: 'absolute', left: 250, top: 191 }} />
      <div
        onClick={() => handleClick('안드로이드')}
        style={{
          position: 'absolute',
          left: 331,
          top: 207,
          color: Colors.brandPrimary,
          cursor: 'pointer',
          ...FontStyles.headlineSmall,
        }}
      >안드로이드</div>

      {/* 자율 무기 시스템 */}
      <img src={weaponMap} alt="Weapon System" style={{ position: 'absolute', left: 437.87, top: 155.22 }} />
      <img src={gameFrame} alt="Weapon Frame" style={{ position: 'absolute', left: 580.94, top: 540 }} />
      <div
        onClick={() => handleClick('자율 무기 시스템')}
        style={{
          position: 'absolute',
          left: 636.94,
          top: 556,
          color: Colors.brandPrimary,
          cursor: 'pointer',
          ...FontStyles.headlineSmall,
        }}
      >자율 무기 시스템</div>

      {/* 사용자 설정 (비활성화) */}
      <img src={userMap} alt="User Setting"
        style={{
          position: 'absolute',
          left: 617.72,
          top: 71.2,
          opacity: disabled ? 0.6 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
        }} />
      <img src={gameFrame} alt="User Frame"
        style={{
          position: 'absolute',
          left: 712,
          top: 224,
          opacity: disabled ? 0.6 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
        }} />
      {disabled && (
        <>
          <img src={lockIcon} alt="Lock Left"
            style={{ position: 'absolute', left: 736, top: 236, width: 40, height: 40 }} />
          <img src={lockIcon} alt="Lock Right"
            style={{ position: 'absolute', left: 908, top: 236, width: 40, height: 40 }} />
        </>
      )}
      <div style={{
        position: 'absolute',
        left: 791,
        top: 240,
        color: disabled ? Colors.grey05 : Colors.brandPrimary,
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        ...FontStyles.headlineSmall,
      }}>사용자 설정</div>
    </div>
  );
}
