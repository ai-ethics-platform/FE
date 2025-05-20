import React from 'react';
import frame from '../assets/cardframe.svg';
import createroom from '../assets/roomcreate.svg';

export default function CreateRoom() {
  return (
    <div style={{ position: 'relative', width: 360, height: 480 }}>
      <img
        src={frame}
        alt="프레임"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: 100,
          fontFamily: 'Pretendard, sans-serif',
          color: '#1F2937',
          textAlign: 'center',
        }}
      >
        <img
          src={createroom}
          alt="방 만들기"
          style={{ width: 168, height: 168, marginBottom: 20 }}
        />
        <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>TEXT</div>
        <div
          style={{
            width: '60%',
            height: 1,
            backgroundColor: '#E5E7EB',
            marginBottom: 16,
          }}
        />
        <input
          type="text"
          placeholder="설명 텍스트를 입력해 주세요."
          style={{
            border: 'none',
            backgroundColor: 'transparent',
            fontSize: 14,
            color: '#6B7280',
            outline: 'none',
            textAlign: 'center',
            width: '80%',
          }}
        />
      </div>
    </div>
  );
}
