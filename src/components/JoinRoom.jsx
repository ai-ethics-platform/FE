import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';

import closeIcon from '../assets/close.svg';
import PrimaryButton from './PrimaryButton';
import { Colors, FontStyles } from './styleConstants';

export default function JoinRoom({ onClose }) {
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate(); 

  const isValidCode = roomCode.length === 6;

  const handleChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setRoomCode(value.slice(0, 6));
    }
  };
  const handleJoin = async () => {
    if (!isValidCode) return;

    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    if (!accessToken) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!refreshToken) {
      alert('로그인이 필요합니다.');
      return;
    }

    const requestBody = {
      room_code: roomCode,
      nickname: '이윤서',
    };

    console.log('참여 요청 데이터:', requestBody);

    try {
      const response = await axios.post('https://dilemmai.org/rooms/join/code', requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'X-Refresh-Token': `Bearer ${refreshToken}`,

        },
      });

      console.log('방 입장 성공:', response.data);
      navigate('/waitingroom');
    } catch (error) {
      console.error('방 입장 실패:', error.response?.data || error.message);
      alert(`방 입장 오류: ${JSON.stringify(error.response?.data?.detail || '')}`);
    }
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
        방 참여하기 
      </div>
      <input
        type="text"
        placeholder="방 코드 6자리를 입력해 주세요."
        value={roomCode}
        onChange={handleChange}
        style={{
          width: '80%',
          height: 56,
          ...FontStyles.body,
          border: `0.4px solid ${Colors.brandPrimary}`,
          borderRadius: 0,
          textAlign: 'center',
          backgroundColor: Colors.grey01,
          color: Colors.grey06,
          marginBottom: 40,
          outline: 'black',
        }}
      />
      <PrimaryButton
        disabled={!isValidCode}
        onClick={handleJoin} 
        style={{
          width: 168,
          height: 72,
          opacity: isValidCode ? 1 : 0.4,
        }}
      >
        입장하기
      </PrimaryButton>
    </div>
  );
}
