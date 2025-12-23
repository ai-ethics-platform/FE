import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import closeIcon from '../assets/close.svg';
import PrimaryButton from './PrimaryButton';
import { Colors, FontStyles } from './styleConstants';
import axiosInstance from "../api/axiosInstance";
export default function GuestLogin({ onClose }) {
  const [guestId, setGuestId] = useState('');
  const navigate = useNavigate();
  const isValid = guestId.trim().length > 0; 
  
  const handleJoin = async () => {
    if (!isValid) return;
    try {
      // axiosInstance 기준 (baseURL이 dilemmai-idl.com로 설정되어 있다고 가정)
      const { data } = await axiosInstance.post('/auth/guest', {
        guest_id: guestId.trim(),
      });
      
      const { access_token, refresh_token } = data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('nickname', guestId.trim());
      localStorage.setItem('user_id', guestId.trim());
      localStorage.setItem('guest_id', guestId.trim());
      localStorage.setItem('guest_mode',"true");
      console.log('로그인 성공:', data);
      navigate('/selectroom');
    } catch (err) {
      console.error('게스트 로그인 실패:', err?.response?.data || err);
      alert('게스트 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
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
        게스트 로그인
      </div>
      <input
        type="text"
        placeholder="사용할 아이디를 입력하세요."
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
        시작하기
      </PrimaryButton>
    </div>
  );
}
