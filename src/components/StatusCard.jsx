import React, { useState } from 'react';
import frameDefault from '../assets/cardframe.svg';
import frameHover from '../assets/cardframehover.svg';
import frameActive from '../assets/cardframeactive.svg';

import player1 from '../assets/1player.svg';
import player2 from '../assets/2player.svg';
import player3 from '../assets/3player.svg';

import statusWaiting from '../assets/waiting.svg';
import statusReady from '../assets/ready.svg';
import statusReadyDisable from '../assets/readydisable.svg';
import statusWaitingForReady from '../assets/waitingforready.svg';
import statusReadyCancel from '../assets/readycancell.svg';
import statusReadyDefault from '../assets/readydefault.svg';

import crownIcon from '../assets/crown.svg';
import { CardSizes } from './stylecardsize';

const statusList = [
  'waiting',
  'ready',
  'readydisable',
  'waitingforready',
  'readycancell',
  'readydefault',
];

const statusMap = {
  waiting: statusWaiting,
  ready: statusReady,
  readydisable: statusReadyDisable,
  waitingforready: statusWaitingForReady,
  readycancell: statusReadyCancel,
  readydefault: statusReadyDefault,
};

const playerMap = {
  '1P': player1,
  '2P': player2,
  '3P': player3,
};

export default function StatusCard({ player = '1P', isOwner = false }) {
  const [statusIndex, setStatusIndex] = useState(0);
  const [isHover, setIsHover] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const status = statusList[statusIndex];

  const cycleStatus = () => {
    setStatusIndex((prev) => (prev + 1) % statusList.length);
  };

  const frameSrc = isActive
    ? frameActive
    : isHover
    ? frameHover
    : frameDefault;

  return (
    <div
      style={{
        position: 'relative',
        width: CardSizes.width,
        height: CardSizes.height,
      }}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => {
        setIsHover(false);
        setIsActive(false);
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <img
        src={frameSrc}
        alt="frame"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />

      <img
        src={playerMap[player] || player1}
        alt="player"
        style={{
          position: 'absolute',
          top: CardSizes.playerTop,
          left: '50%',
          transform: 'translateX(-50%)',
          width: CardSizes.icon.width,
          height: CardSizes.icon.height,
          zIndex: 1,
        }}
      />

      {isOwner && (
        <img
          src={crownIcon}
          alt="owner crown"
          style={{
            position: 'absolute',
            top: CardSizes.crownTop,
            left: '50%',
            transform: 'translateX(-50%)',
            width: CardSizes.icon.crown,
            height: CardSizes.icon.crown,
            zIndex: 2,
          }}
        />
      )}

      <img
        src={statusMap[status]}
        alt={status}
        onClick={(e) => {
          e.stopPropagation();
          cycleStatus();
        }}
        style={{
          position: 'absolute',
          bottom: CardSizes.statusBottom,
          left: '50%',
          transform: 'translateX(-50%)',
          width: CardSizes.icon.status.width,
          height: CardSizes.icon.status.height,
          zIndex: 1,
          cursor: 'pointer',
        }}
      />
    </div>
  );
}
