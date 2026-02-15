import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import closeIcon from '../assets/close.svg';
import PrimaryButton from './PrimaryButton';
import { Colors, FontStyles } from './styleConstants';
import axiosInstance from '../api/axiosInstance';
import { translations } from '../utils/language/index'; // 언어 파일 임포트

export default function JoinRoom({ onClose }) {
  // --- 시스템 설정된 언어(app_lang)를 로드하는 로직 ---
  const lang = localStorage.getItem('app_lang') || 'ko';
  const t = translations?.[lang]?.JoinRoom || {};

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
      // 번역된 loadFail 메시지 사용
      console.error(t.loadFail || '❌ 유저 정보 로드 실패:', err);
    }
  })();
}, [t.loadFail]);

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
      // [수정] 언어 설정에 따른 콘솔 로그 구분 - 언어팩 변수(t.consoleFail) 활용
      console.error(t.consoleFail || '방 입장 실패:', error.response?.data || error.message);
      
      // [수정] 언어 설정에 따른 alert 문구 보정 (t.errorPrefix 활용)
      alert(`${t.errorPrefix || '방 입장 오류: '}${JSON.stringify(error.response?.data?.detail || '')}`);
    }
  };

  // 데이터 로드 확인용 방어 코드
  if (!t.title) return null;

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
        {t.enter}
      </PrimaryButton>
    </div>
  );
}