import React from 'react';

// 이미지 import
import icon1 from '../assets/1player.svg';
import icon2 from '../assets/2player.svg';
import icon3 from '../assets/3player.svg';

import profile1 from '../assets/1playerprofile.svg';
import profile2 from '../assets/2playerprofile.svg';
import profile3 from '../assets/3playerprofile.svg';

// 플레이어별 색상, 이미지 맵
const colorMap = {
  '1P': '#8A6262',
  '2P': '#6E7463',
  '3P': '#766178',
};

const iconMap = {
  '1P': icon1,
  '2P': icon2,
  '3P': icon3,
};

const profileMap = {
  '1P': profile1,
  '2P': profile2,
  '3P': profile3,
};

export default function UserProfile({ player = '1P', characterDesc = null }) {
  const isDetailed = characterDesc && characterDesc.trim() !== '';
  const textColor = colorMap[player] || '#8A6262';
  const icon = isDetailed ? profileMap[player] : iconMap[player];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: 200,
        height: 96,
        backgroundColor: '#F1F5F9',
        padding: 12,
        borderRadius: 8,
        fontFamily: 'Pretendard, sans-serif',
        color: textColor,
        boxSizing: 'border-box',
      }}
    >
      {/* 이미지 영역 */}
      <img
        src={icon}
        alt="player"
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          flexShrink: 0,
        }}
      />

      {/* 텍스트 영역 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isDetailed ? 'center' : 'flex-start',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 16 }}>{player}</div>
        {isDetailed && (
          <div style={{ fontSize: 14, marginTop: 2 }}>{characterDesc}</div>
        )}
      </div>
    </div>
  );
}
