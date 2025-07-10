import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import closeIcon from '../assets/close.svg';
import PrimaryButton from './PrimaryButton';
import { Colors, FontStyles } from './styleConstants';
import InputBoxSmall from './InputBoxSmall';

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

  const handleJoin = () => {
    if (isValidCode) {
      navigate('/waitingroom'); 
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
      {/* 닫기 아이콘 */}
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

      {/* 타이틀 */}
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
      {/* <InputBoxSmall 
         type="text"
         placeholder="방 코드 6자리를 입력해 주세요."
         value={roomCode}
         onChange={handleChange}
         style={{
          width: 360,
          height: 72,
          ...FontStyles.body,
          border: Colors.brandPrimary,
          backgroundColor: Colors.grey02,
          color: Colors.grey06,
        }}
      /> */}

      {/* 입장 버튼 */}
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
