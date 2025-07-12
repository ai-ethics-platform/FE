import React, { useState } from 'react';
import frameDefault from '../assets/cardframe.svg';
import frameHover from '../assets/cardframehover.svg';
import frameActive from '../assets/cardframeactive.svg';

import player1 from '../assets/1player.svg';
import player2 from '../assets/2player.svg';
import player3 from '../assets/3player.svg';

import emptyPlayer from '../assets/emptyplayer.svg';
import StatusWaitingforReady from '../assets/waitingforready.svg';
import StatusUReady from '../assets/uready.svg';
import StatusContinue from '../assets/continue.svg';
import StatusMeReady from '../assets/meready.svg';
import StatusWaiting from '../assets/waiting.svg';
import StatusCannotReady from '../assets/cannotready.svg';
import crownIcon from '../assets/crown.svg';
import { CardSizes } from './waitingCardSize';

const statusMap = {
  waitingforready: StatusWaitingforReady,
  uready: StatusUReady,
  continue: StatusContinue,
  meready: StatusMeReady,
  waiting: StatusWaiting,
  cannotready: StatusCannotReady,
};

const playerMap = {
  '1P': player1,
  '2P': player2,
  '3P': player3,
};

export default function StatusCard({
  player,
  isOwner = false,
  isMe = false,
  onContinueClick,
  statusIndex: externalStatusIndex,
  onStatusChange,
}) {
  const [isHover, setIsHover] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const statusList = isMe
    ? ['continue', 'meready']
    : ['waitingforready', 'uready'];

  const statusIndex = externalStatusIndex ?? 0;
  const setStatusIndex = onStatusChange ?? (() => {}); 

  const showPlayer = player && playerMap[player];
  const status = showPlayer ? statusList[statusIndex] : 'waiting';

  const cycleStatus = () => {
    setStatusIndex((prev) => (prev + 1) % statusList.length);
  };

  const handleStatusClick = () => {
    if (!showPlayer) return;

    if (isMe && status === 'continue' && typeof onContinueClick === 'function') {
      onContinueClick();
    } else {
      cycleStatus();
    }
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

      {showPlayer ? (
        <img
          src={playerMap[player]}
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
      ) : (
        <img
          src={emptyPlayer}
          alt="empty"
          style={{
            position: 'absolute',
            top: CardSizes.playerTop,
            left: '50%',
            transform: 'translateX(-50%)',
            width: CardSizes.icon.width,
            height: CardSizes.icon.height,
            opacity: 0.7,
            zIndex: 1,
          }}
        />
      )}

      {isOwner && showPlayer && (
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
        src={statusMap[showPlayer ? status : 'waiting']}
        alt={status}
        onClick={(e) => {
          if (!showPlayer) return;
          e.stopPropagation();
          handleStatusClick();
        }}
        style={{
          position: 'absolute',
          bottom: CardSizes.statusBottom,
          left: '50%',
          transform: 'translateX(-50%)',
          width: CardSizes.icon.status.width,
          height: CardSizes.icon.status.height,
          zIndex: 1,
          cursor: showPlayer ? 'pointer' : 'default',
        }}
      />
    </div>
  );
}