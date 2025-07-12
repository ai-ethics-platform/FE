import React from 'react';
import closeIcon from '../assets/close.svg';
import SecondaryButton from './SecondaryButton';
import { Colors, FontStyles } from './styleConstants';

export default function LogoutPopup({ onClose, onLogout }) {
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
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
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

      <div
        style={{
          ...FontStyles.title,
          color: Colors.brandPrimary,
          marginBottom: 40,
          textAlign: 'center',
        }}
      >
        게임을 종료하고 로그아웃할까요?
      </div>

      <SecondaryButton
        onClick={() => {
          console.log('logout button clicked');
          onLogout();
        }}
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
