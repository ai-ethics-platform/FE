import React, { useState, useEffect } from 'react';
import frameDefault from '../assets/cardframe.svg';
import frameHover from '../assets/cardframehover.svg';
import frameActive from '../assets/cardframeactive.svg';

import player1 from '../assets/1player_withnum.svg';
import player2 from '../assets/2player_withnum.svg';
import player3 from '../assets/3player_withnum.svg';

import emptyPlayer from '../assets/emptyplayer.svg';
// 텍스트가 없는 고정 아이콘은 기존처럼 유지
import StatusWaiting from '../assets/waiting.svg';
import crownIcon from '../assets/crown.svg';
import { CardSizes } from './waitingCardSize';

// 로컬 자산 경로를 언어에 따라 반환하는 헬퍼 함수
const getStatusImage = (fileName, lang) => {
  // waiting.svg처럼 언어 구분이 필요 없는 경우 예외 처리
  if (fileName === 'waiting') return StatusWaiting;
  
  // 영문일 경우 assets/en/파일명_en.svg 경로를 반환 (나중에 파일만 넣으면 작동)
  if (lang === 'en') {
    return new URL(`../assets/en/${fileName}_en.svg`, import.meta.url).href;
  }
  // 기본 한국어 경로 (src/assets/파일명.svg)
  return new URL(`../assets/${fileName}.svg`, import.meta.url).href;
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
  onCancelClick
}) {
  const [isHover, setIsHover] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
  // 현재 언어 설정 확인
  const lang = localStorage.getItem('app_lang') || 'ko';

  const statusList = isMe
    ? ['continue', 'meready']
    : ['waitingforready', 'uready'];

  const [internalStatusIndex, setInternalStatusIndex] = useState(0);
  const statusIndex =
    typeof externalStatusIndex === 'number' ? externalStatusIndex : internalStatusIndex;
  const setStatusIndex = onStatusChange ?? setInternalStatusIndex;

  const showPlayer = roleId && roleImageMap[roleId];
  const status = showPlayer ? statusList[statusIndex] : 'waiting';

  // 상태값(키)에 따라 동적으로 이미지 경로 결정
  // 텍스트가 포함된 이미지들은 getStatusImage 함수를 통해 처리됨
  const currentStatusSrc = getStatusImage(status, lang);

  useEffect(() => {
    // 기존 개발자 로그 유지
    console.log(`[StatusCard] ${player} | isMe: ${isMe} | statusIndex: ${statusIndex} | status: ${status}`);
  }, [player, isMe, statusIndex, status]);

  const cycleStatus = () => {
    setStatusIndex((prev) => (prev + 1) % statusList.length);
  };

  const handleStatusClick = () => {
    if (!showPlayer) return;
    if (isMe) {
      if (status === 'continue') {
        // 1) 준비하기 클릭 → 마이크 팝업
        onContinueClick?.();
      } else if (status === 'meready') {
        // 2) 준비완료 클릭 → 취소 팝업
        onCancelClick?.();
      }
    } else {
      // 비제어 모드(UI 테스트용 등) 토글 허용
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

      {/* 상태 버튼 이미지: currentStatusSrc를 통해 ko/en 자동 분기 */}
      <img
        src={currentStatusSrc}
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