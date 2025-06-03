import React from 'react';
import { Colors, FontStyles } from './styleConstants';

import icon1 from '../assets/1player.svg';
import icon2 from '../assets/2player.svg';
import icon3 from '../assets/3player.svg';

import profile1 from '../assets/1playerprofile.svg';
import profile2 from '../assets/2playerprofile.svg';
import profile3 from '../assets/3playerprofile.svg';

import crownIcon from '../assets/crown.svg';
import speakingIcon from '../assets/speaking.svg'; 

const colorMap = {
  '1P': Colors.player1P,
  '2P': Colors.player2P,
  '3P': Colors.player3P,
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

export default function UserProfile({
  player = '1P',
  characterDesc = '',
  isLeader = false,
  isMe = false,
  ...rest              // onClick, className, style 등
}) {
  const isDetailed = characterDesc?.trim() !== '';
  const color = colorMap[player] || Colors.player1P;
  const icon  = isDetailed ? profileMap[player] : iconMap[player];

  // ① rest에서 style만 분리
  const { style: externalStyle, ...divProps } = rest;

  // ② 기본 스타일
  const baseStyle = {
    position: 'relative',
    width: 200,
    height: 96,
    backgroundColor: Colors.componentBackgroundFloat,
    padding: '12px 12px 12px 20px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  };

  return (
    // ③ style은 한 번만!
    <div {...divProps} style={{ ...baseStyle, ...externalStyle }}>
      {isMe && (
        <img
          src={speakingIcon}
          alt="내 차례 표시"
          style={{ position: 'absolute', top: 0, left: 0, width: 8, height: '100%' }}
        />
      )}

      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: !isDetailed ? color : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <img
          src={icon}
          alt={`${player} 아이콘`}
          style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: '50%' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', lineHeight: 1 }}>
          <span style={{ ...FontStyles.bodyBold, color }}>{player}</span>
          {isLeader && (
            <img
              src={crownIcon}
              alt="방장"
              style={{ width: 20, height: 20, marginLeft: 6 }}
            />
          )}
        </div>

        {isDetailed && (
          <div
            style={{
              ...FontStyles.caption,
              color,
              marginTop: 2,
              maxWidth: 120,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.2,
            }}
          >
            {characterDesc}
          </div>
        )}
      </div>
    </div>
  );
}
