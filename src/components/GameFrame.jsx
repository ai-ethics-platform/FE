import React from 'react';
import gameFrame from '../assets/gameframe2.svg';
import arrowLeft from '../assets/arrowLhover.svg';
import arrowRight from '../assets/arrowRhover.svg';
import { FontStyles, Colors } from './styleConstants';

export default function GameFrame({
  topic = '',
  onLeftClick = () => {},
  onRightClick = () => {},
  disableLeft = false,
  disableRight = false,
  hideArrows = false, // 🔹 추가된 prop
  width = 512,
  height = 64,
}) {
  return (
    <div style={{ position: 'relative', width, height }}>
      {/* 프레임 이미지 */}
      <img
        src={gameFrame}
        alt="game frame"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />

      {/* 화살표 (조건부 렌더링) */}
      {!hideArrows && (
        <>
          <img
            src={arrowLeft}
            alt="left"
            onClick={disableLeft ? undefined : onLeftClick}
            style={{
              position: 'absolute',
              left: 98,
              top: 13,
              width: 40,
              height: 40,
              cursor: disableLeft ? 'default' : 'pointer',
              opacity: disableLeft ? 0.3 : 1,
              zIndex: 1,
            }}
          />

          <img
            src={arrowRight}
            alt="right"
            onClick={disableRight ? undefined : onRightClick}
            style={{
              position: 'absolute',
              left: 372,
              top: 13,
              width: 40,
              height: 40,
              cursor: disableRight ? 'default' : 'pointer',
              opacity: disableRight ? 0.3 : 1,
              zIndex: 1,
            }}
          />
        </>
      )}

      {/* 주제 텍스트 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 17,
          transform: 'translateX(-50%)',
          color: Colors.grey01,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          ...FontStyles.headlineSmall,
          zIndex: 2,
        }}
      >
        {topic}
      </div>
    </div>
  );
}
