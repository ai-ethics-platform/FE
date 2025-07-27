import React from 'react';
import closeIcon from '../assets/close.svg';
import SecondaryButton from './SecondaryButton';
import { Colors, FontStyles } from './styleConstants';
import axiosInstance from '../api/axiosInstance';

export default function CancelReadyPopup({ onClose, onCancelConfirmed }) {
  const handleCancelReady = async () => {
    const room_code = localStorage.getItem('room_code');
    try {
      await axiosInstance.post('/rooms/ready', { room_code }); // ✅ 준비 취소 API 호출
      onCancelConfirmed(); // -> 상태 업데이트
      onClose();           // -> 팝업 닫기
    } catch (err) {
      console.error('❌ 준비 취소 실패:', err);
      alert('준비 취소 실패');
    }
  };

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
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
      }}
    >
      <img
        src={closeIcon}
        alt="닫기"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 40,
          height: 40,
          cursor: 'pointer',
        }}
      />

      <p style={{ ...FontStyles.headlineSmall, marginBottom: 40 }}>
        준비 상태를 취소하시겠습니까?
      </p>

      <SecondaryButton 
        style={{ width: 168, height: 72 }}
        onClick={handleCancelReady}
      >
        준비 취소
      </SecondaryButton>
    </div>
  );
}
