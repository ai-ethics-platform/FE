import React from 'react';
import roomCard from '../assets/roomcode.svg';

const RoomCodeDisplay = ({ roomCode }) => {
  return (
    <div
      style={{
        width: '264px',
        height: '80px',
        backgroundImage: `url(${roomCard})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        position: 'relative',
      }}
    >
      {/* roomCode 텍스트는 CODE 텍스트 아래 중앙에 고정 */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px', // CODE 텍스트 아래에 배치
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '24px',
          fontWeight: '700',
          color: '#0D575C',
        }}
      >
        {roomCode}
      </div>
    </div>
  );
};

export default RoomCodeDisplay;
