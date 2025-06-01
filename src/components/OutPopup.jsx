// components/OutPopup.js
import React from 'react';
import closeIcon from '../assets/close.svg';
import SecondaryButton from './SecondaryButton';
import { useNavigate } from 'react-router-dom';
import { Colors, FontStyles } from './styleConstants';

export default function OutPopup({ onClose }) {
  const navigate = useNavigate();

  const handleLeaveRoom = () => {
    navigate('/selectroom'); // 방 나가기 버튼 클릭 시 이동
  };

  return (
    <div
      style={{
        width: 552,
        height: 360,
        backgroundColor: Colors.grey01,
        borderRadius: 12,
        padding: 32,
        position: 'relative',
        ...FontStyles.body,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* 닫기 버튼 */}
      <img
        src={closeIcon}
        alt="닫기"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 40,
          height: 40,
          cursor: 'pointer',
        }}
      />

      <p style={{ ...FontStyles.headlineSmall, marginBottom: 40 }}>
        이 방을 나갈까요?
      </p>

      <SecondaryButton 
      style={{ width: 168, height: 72}}
      onClick={handleLeaveRoom}> 
      방나가기
      </SecondaryButton> 
    </div>
  );
}
