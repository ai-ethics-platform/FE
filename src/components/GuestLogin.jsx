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
      
      const { access_token, refresh_token, token_type, user_id, is_guest } = data || {};
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      if (token_type) localStorage.setItem('token_type', token_type);
      if (is_guest != null) localStorage.setItem('is_guest', String(is_guest));
      // ✅ 게스트 닉네임은 사용자가 입력한 값을 그대로 사용
      localStorage.setItem('nickname', guestId.trim());
      localStorage.setItem('guest_id', guestId.trim());
      localStorage.setItem('guest_mode',"true");

      // ✅ 백엔드가 user_id를 내려주면 /users/me 없이도 WaitingRoom/WS/WebRTC가 동작합니다.
      // (현재 guest의 /users/me가 500일 수 있으므로, user_id가 있으면 굳이 호출하지 않습니다.)
      const serverUserId = user_id ?? data?.id ?? null;
      if (serverUserId != null && String(serverUserId).length > 0) {
        localStorage.setItem('user_id', String(serverUserId));
      } else {
        // fallback: legacy 백엔드 대응 (가능하면 백엔드에서 user_id 응답 제공이 정석)
        try {
          const { data: me } = await axiosInstance.get('/users/me');
          if (me?.id != null) {
            localStorage.setItem('user_id', String(me.id));
          }
        } catch (e) {
          console.warn('⚠️ 게스트 로그인: user_id가 없고 /users/me도 실패했습니다. WaitingRoom/WS/WebRTC가 동작하지 않을 수 있습니다.', e?.response?.data || e?.message);
        }
      }

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
