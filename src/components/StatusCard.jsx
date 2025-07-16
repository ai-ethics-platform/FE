import React, { useState, useEffect } from 'react';
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

const roleImageMap = {
  1: player1,
  2: player2,
  3: player3,
};

export default function StatusCard({
  player,
  isOwner = false,
  isMe = false,
  roleId,
  onContinueClick,
  statusIndex: externalStatusIndex,
  onStatusChange,
}) {
  const [isHover, setIsHover] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const statusList = isMe
    ? ['continue', 'meready']
    : ['waitingforready', 'uready'];

  const [internalStatusIndex, setInternalStatusIndex] = useState(0);
  const statusIndex =
    typeof externalStatusIndex === 'number' ? externalStatusIndex : internalStatusIndex;
  const setStatusIndex = onStatusChange ?? setInternalStatusIndex;

  const showPlayer = roleId && roleImageMap[roleId];
  const status = showPlayer ? statusList[statusIndex] : 'waiting';

  useEffect(() => {
    console.log(`[StatusCard] ${player} | isMe: ${isMe} | statusIndex: ${statusIndex} | status: ${status}`);
  }, [player, isMe, statusIndex, status]);

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
      <img src={frameSrc} alt="frame" style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0 }} />

      {showPlayer ? (
        <img
          src={roleImageMap[roleId]}
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
        src={statusMap[status]}
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
