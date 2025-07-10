import React from 'react';
import closeIcon from '../assets/close.svg';
import SecondaryButton from './SecondaryButton';
import { FontStyles,Colors } from './styleConstants';

export default function ResultPopup({ onClose, onViewResult }) {
  return (
    <div
      style={{
        width: 552,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: '40px 32px',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* 닫기 버튼 */}
      <img
        src={closeIcon}
        alt="close"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          width: 24,
          height: 24,
          cursor: 'pointer',
        }}
      />

      {/* 안내 문구 */}
      <div
        style={{
         ...FontStyles.headlineSmall,
          color : Colors.brandPrimary,
          textAlign: 'center',
          lineHeight: '1.5',
          marginBottom: 24,
        }}
      >
        아직 플레이하지 않은 라운드가 있습니다.
        <br />
        이대로 결과를 볼까요?
      </div>

      {/* 비활성 인풋박스들 */}
      <SecondaryButton
      style={{
        width: 360,
        height: 72,
        justifyContent: 'center',
        marginBottom: 12,
      }}>
         가정 2</SecondaryButton>
      <SecondaryButton
      style={{
        width: 360,
        height: 72,
        justifyContent: 'center',
        marginBottom: 12,
      }}> 국가 인공지능위원회 1 </SecondaryButton>
      {/* 버튼 */}
      <div style={{ marginTop: 20 }}>
        <SecondaryButton
        style={{
            width: 168,
            height: 72,
            justifyContent: 'center',
            marginBottom: 12,
          }}
           onClick={onViewResult}>결과 보기 </SecondaryButton>
      </div>
    </div>
  );
}
