import React from 'react';
import closeIcon from '../assets/close.svg';
import SecondaryButton from './SecondaryButton'; // ← SecondaryButton 컴포넌트 import

export default function LogoutPopup({ onClose, onLogout }) {
  return (
    <div
      style={{
        width: 552,
        height: 360,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 32,
        position: 'relative',
        fontFamily: 'Pretendard, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Close Icon */}
      <img
        src={closeIcon}
        alt="close"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          width: 40,
          height: 40,
          cursor: 'pointer',
        }}
      />

      {/* Title */}
      <div
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: '#1F2937',
          marginBottom: 40,
        }}
      >
        게임을 종료하고 로그아웃할까요?
      </div>

      {/* SecondaryButton (168 x 72) */}
      <SecondaryButton
        onClick={onLogout}
        style={{
          width: 168,
          height: 72,
        }}
      >
        로그아웃
      </SecondaryButton>
    </div>
  );
}
