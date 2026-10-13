import React from 'react';
import closeIcon from '../assets/close.svg';
import SecondaryButton from './SecondaryButton';
import { Colors, FontStyles } from './styleConstants';
import axiosInstance from '../api/axiosInstance';
import { translations } from '../utils/language/index';

export default function CancelReadyPopup({ onClose, onCancelConfirmed }) {
  // --- 언어 설정 로직 ---
  const lang = localStorage.getItem('app_lang') || 'ko';
  const t = translations?.[lang]?.CancelReadyPopup || {};

  // 방어 코드: 데이터가 로드되지 않았을 경우 기본값 설정
  const displayQuestion = t.question || (lang === 'en' ? "Cancel your ready status?" : "준비 상태를 취소하시겠습니까?");
  const displayBtn = t.cancelBtn || (lang === 'en' ? "Cancel Ready" : "준비 취소");
  const errorMsg = t.errorMsg || (lang === 'en' ? "Failed to cancel ready status" : "준비 취소 실패");

  const handleCancelReady = async () => {
    const room_code = localStorage.getItem('room_code');
    try {
      await axiosInstance.post('/rooms/ready', { room_code }); // ✅ 준비 취소 API 호출
      onCancelConfirmed(); // -> 상태 업데이트
      onClose();           // -> 팝업 닫기
    } catch (err) {
      console.error('❌ 준비 취소 실패:', err);
      alert(errorMsg);
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
        alt="close"
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

      <p style={{ 
        ...FontStyles.headlineSmall, 
        marginBottom: 40,
        textAlign: 'center',
        // 영문일 경우 텍스트가 길어질 수 있어 가독성을 위해 추가
        fontSize: lang === 'en' ? 'clamp(1.2rem, 1.5vw, 1.5rem)' : 'inherit'
      }}>
        {displayQuestion}
      </p>

      <SecondaryButton 
        style={{ 
          width: lang === 'en' ? 200 : 168, // 영문 텍스트 길이를 고려한 너비 조정
          height: 72 
        }}
        onClick={handleCancelReady}
      >
        {displayBtn}
      </SecondaryButton>
    </div>
  );
}