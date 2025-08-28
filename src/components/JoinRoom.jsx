import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import closeIcon from '../assets/close.svg';
import PrimaryButton from './PrimaryButton';
import { Colors, FontStyles } from './styleConstants';
import axiosInstance from '../api/axiosInstance';

export default function JoinRoom({ onClose }) {
  const [roomCode, setRoomCode] = useState('');
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();

  // // 닉네임(username) 조회
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const { data: me } = await axiosInstance.get('/users/me');
  //       // API 응답에서 username 필드를 닉네임으로 사용
  //       setNickname(me.username || '');
  //       localStorage.setItem('nickname',me.username);
  //     } catch (err) {
  //       console.error('❌ 유저 정보 로드 실패:', err);
  //     }
  //   })();
  // }, []);
  
// 닉네임(username) 조회
useEffect(() => {
  (async () => {
    try {
      // 1. localStorage 먼저 확인
      const storedNickname = localStorage.getItem('nickname');

      if (storedNickname) {
        // 있으면 그대로 state에 반영
        setNickname(storedNickname);
      } else {
        // 없으면 API 호출
        const { data: me } = await axiosInstance.get('/users/me');
        const nickname = me.username || '';
        setNickname(nickname);
        localStorage.setItem('nickname', nickname);
      }
    } catch (err) {
      console.error('❌ 유저 정보 로드 실패:', err);
    }
  })();
}, []);

  const isValidCode = roomCode.length === 6;

  const handleChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setRoomCode(value.slice(0, 6));
    }
  };

  const handleJoin = async () => {
    if (!isValidCode) return;

    try {
      await axiosInstance.post('/rooms/join/code', {
        room_code: roomCode,
        nickname,
      });

      // 방 코드 저장
      localStorage.setItem('room_code', roomCode);
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
          backgroundColor: Colors.componentBackground,
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
