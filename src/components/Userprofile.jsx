import React from 'react';
import { Colors, FontStyles } from './styleConstants';

import icon1 from '../assets/1player.svg';
import icon2 from '../assets/2player.svg';
import icon3 from '../assets/3player.svg';

import profile1 from '../assets/1playerprofile.svg';
import profile2 from '../assets/2playerprofile.svg';
import profile3 from '../assets/3playerprofile.svg';

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

export default function UserProfile({ player = '1P', characterDesc = '' }) {
  const isDetailed = characterDesc?.trim() !== '';
  const color = colorMap[player] || Colors.player1P;
  const icon = isDetailed ? profileMap[player] : iconMap[player];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: 200,
        height: 96,
        backgroundColor: Colors.grey01,
        padding: 12,
        borderRadius: 8,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
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
          alt="player"
          style={{
            width: 48,
            height: 48,
            objectFit: 'cover',
            borderRadius: '50%',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isDetailed ? 'center' : 'flex-start',
        }}
      >
        <div style={{ ...FontStyles.bodyBold, color }}>{player}</div>
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
            }}
          >
            {characterDesc}
          </div>
        )}
      </div>
    </div>
  );
}
