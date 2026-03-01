import React from 'react';
import closeIcon from '../assets/close.svg';
import SecondaryButton from './SecondaryButton';
import { Colors, FontStyles } from './styleConstants';
import { translations } from '../utils/language/index'; 

export default function LogoutPopup({ onClose, onLogout }) {
  // --- 시스템 설정된 언어(app_lang) 연동 로직 ---
  const lang = localStorage.getItem('app_lang') || 'ko';
  const t = translations?.[lang]?.LogoutPopup || {};

  // 방어 코드: 데이터가 로드되지 않았을 경우 최소한의 기본값 설정 (기존 로직 보존)
  const displayQuestion = t.question || (lang === 'en' ? "Exit the game and log out?(미번역)" : "게임을 종료하고 로그아웃할까요?");
  const displayLogout = t.logout || (lang === 'en' ? "Logout(미번역)" : "로그아웃");

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
        zIndex: 10000, 
      }}
    >
      <img
        src={closeIcon}
        alt={t.closeAlt || "close"}
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
        {displayQuestion}
      </div>

      <SecondaryButton
        onClick={() => {
          // 기존 개발자 로그 유지
          console.log('logout button clicked');
          onLogout();
        }}
        style={{
          width: 168,
          height: 72,
        }}
      >
        {displayLogout}
      </SecondaryButton>
    </div>
  );
}