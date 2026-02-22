import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import closeIcon from '../assets/close.svg';
import PrimaryButton from './PrimaryButton';
import { Colors, FontStyles } from './styleConstants';
import axiosInstance from "../api/axiosInstance";
import { translations } from '../utils/language/index';

export default function GuestLogin({ onClose }) {
  // 언어 설정 상태 관리 (로그인 화면과 동일하게 로컬스토리지 참조)
  const [lang] = useState(localStorage.getItem('app_lang') || 'ko');
  const t = translations[lang].GuestLogin;

  const [guestId, setGuestId] = useState('');
  const navigate = useNavigate();
  const isValid = guestId.trim().length > 0; 
  
  const handleJoin = async () => {
    if (!isValid) return;
    try {
      const { data } = await axiosInstance.post('/auth/guest', {
        guest_id: guestId.trim(),
      });
      
      const { access_token, refresh_token, token_type, user_id, is_guest } = data || {};
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      if (token_type) localStorage.setItem('token_type', token_type);
      if (is_guest != null) localStorage.setItem('is_guest', String(is_guest));
      // ✅ 게스트 닉네임은 사용자가 입력한 값을 그대로 사용
      localStorage.setItem('nickname', guestId.trim());
      localStorage.setItem('guest_id', guestId.trim());
      localStorage.setItem('guest_mode',"true");
      
      console.log('로그인 성공:', data);
      navigate('/selectroom');
    } catch (err) {
      console.error('게스트 로그인 실패:', err?.response?.data || err);
      // 언어팩의 실패 메시지 적용
      alert(t.loginFail);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') handleJoin();
  };

  return (
    <div
      style={{
        width: 552,
        height: 444,
        backgroundColor: Colors.componentBackgroundFloat,
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
      <div style={{ ...FontStyles.headlineNormal, color: Colors.brandPrimary, marginBottom: 32 }}>
        {t.title}
      </div>
      <input
        type="text"
        placeholder={t.placeholder}
        value={guestId}
        onChange={(e) => setGuestId(e.target.value)}
        onKeyDown={onKeyDown}
        style={{
          width: '80%',
          height: 56,
          ...FontStyles.body,
          border: `0.4px solid ${Colors.brandPrimary}`,
          borderRadius: 0,
          textAlign: 'center',
          backgroundColor: Colors.componentBackground,
          color: Colors.grey06,
          marginBottom: 40,
          outline: 'black',
        }}
      />
      <PrimaryButton
        disabled={!isValid}
        onClick={handleJoin}
        style={{
          width: 168,
          height: 72,
          opacity: isValid ? 1 : 0.4,
        }}
      >
        {t.startBtn}
      </PrimaryButton>
    </div>
  );
}