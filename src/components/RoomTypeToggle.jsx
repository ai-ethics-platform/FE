// RoomTypeToggle.jsx
import React from 'react';
import privateActive from '../assets/privateactive.svg';
import privateInactive from '../assets/privatenotactive.svg';
import publicActive from '../assets/publicactive.svg';
import publicInactive from '../assets/publicnotactive.svg';

export default function RoomTypeToggle({ isPublic, setIsPublic }) {
  return (
    <div
      style={{
        display: 'flex',
        width: 264,
        height: 50,
        border: '1.5px solid #0D575C',
        overflow: 'hidden',
        marginBottom: 32,
        gap: 0,
    
      }}
    >
      <div
        onClick={() => setIsPublic(false)}
        style={{ cursor: 'pointer', width: '50%', height: '100%', lineHeight: 0 }}
      >
        <img
          src={isPublic ? privateInactive : privateActive}
          alt="비공개 방"
          style={{ width: '100%', height: '100%', display: 'block'  }}
        />
      </div>
      <div
        onClick={() => setIsPublic(true)}
        style={{ cursor: 'pointer', width: '50%', height: '100%', lineHeight: 0 }}
      >
        <img
          src={isPublic ? publicActive : publicInactive}
          alt="공개 방"
          style={{ width: '100%', height: '100%', display: 'block'  }}
        />
      </div>
    </div>
  );
}
