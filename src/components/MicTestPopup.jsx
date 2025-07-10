import React from 'react';
import closeIcon from '../assets/close.svg';
import PrimaryButton from './PrimaryButton';
import { Colors, FontStyles } from './styleConstants';

export default function MicTestPopup({ onConfirm, userImage }) {
return (
    <div
    style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 552,
        height: 540,
        backgroundColor: Colors.componentBackgroundFloat,
        borderRadius: 8,
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    }}
    >
    <img
        src={closeIcon}
        alt="close"
        onClick={onConfirm}
        style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 40,
            height: 40,
            cursor: 'pointer',
        }} />

    <div style={{ marginBottom: 32, ...FontStyles.headlineNormal, color:Colors.brandPrimary }}>
        마이크를 테스트해 주세요
    </div>

      <img
        src={userImage}
        alt="user"
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          objectFit: 'cover',
          marginBottom: 32,
        }}
      />

      <div
        style={{
          width: 240,
          height: 24,
          backgroundColor: Colors.grey04,
          borderRadius: 4,
          overflow: 'hidden',
          marginBottom: 40,
        }}
      >
        <div
          style={{
            width: '30%',
            height: '100%',
            backgroundColor: Colors.brandDark,
            transition: 'width 0.2s',
          }}
        />
      </div>

      <PrimaryButton style={{ width: 168, height: 72 }} onClick={onConfirm}>
        준비하기
      </PrimaryButton>
    </div>
  );
}
