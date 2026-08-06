//텍스트 길이에 따라 subtopic을 담는 프레임의 유동적 크기 전환을 구현하기 위하여 기존의 이미지 에셋 import방식이 아닌
//SVG 태그를 활용한 커스텀 컴포넌트로 대체
import React, { useState, useRef, useLayoutEffect } from 'react';
import arrowLeft from '../assets/arrowLhover.svg';
import arrowRight from '../assets/arrowRhover.svg';
import { FontStyles, Colors } from './styleConstants';

export default function GameFrame({
  topic = '',
  onLeftClick = () => {},
  onRightClick = () => {},
  disableLeft = false,
  disableRight = false,
  hideArrows = false,
  width = 512, 
  height = 80, 
}) {
  const textRef = useRef(null);
  const [dynamicWidth, setDynamicWidth] = useState(width);

  useLayoutEffect(() => {
    if (textRef.current) {
      const textW = textRef.current.offsetWidth;
      // [조정] 영문 등 긴 텍스트 대응을 위해 패딩 버퍼를 100으로 상향 조정하여 여유 공간 확보
      const paddingBuffer = 100; 
      const newWidth = Math.max(width, Math.ceil(textW + paddingBuffer));
      setDynamicWidth(newWidth);
    }
  }, [topic, width]);

  const W = dynamicWidth;
  // W값에 따라 동적으로 계산되는 경로 (중앙 대칭 유지)
  const outerPath = `M ${W} 48 L ${W - 32} 80 H 0 V 32 L 32 0 H ${W} V 48 Z`;
  const innerPath = `M ${W - 8.5} 44 L ${W - 36.5} 72 H 8.5 V 36 L 36.5 8 H ${W - 8.5} V 44 Z`;

  return (
    <div
      style={{
        position: 'relative',
        // width와 minWidth를 동일하게 주어 부모 컨테이너 내에서 정확한 크기를 점유하게 함
        width: dynamicWidth,
        minWidth: dynamicWidth, 
        height: height,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto', // 스스로 중앙 정렬
      }}
    >
      <svg
        width={dynamicWidth}
        height={height}
        viewBox={`0 0 ${dynamicWidth} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
      >
        <path d={outerPath} fill="#0D575C" />
        <path d={innerPath} stroke="#E6ECEF" strokeWidth="1.5" fill="none" opacity="0.9" />
      </svg>

      {!hideArrows && (
        <>
          <img src={arrowLeft} alt="left" style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', width: 40, zIndex: 1, cursor: disableLeft ? 'default' : 'pointer', opacity: disableLeft ? 0.3 : 1 }} onClick={!disableLeft ? onLeftClick : undefined} />
          <img src={arrowRight} alt="right" style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', width: 40, zIndex: 1, cursor: disableRight ? 'default' : 'pointer', opacity: disableRight ? 0.3 : 1 }} onClick={!disableRight ? onRightClick : undefined} />
        </>
      )}

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          color: Colors.grey01,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          ...FontStyles.headlineSmall,
          padding: '0 40px', // 텍스트와 상자 끝 사이의 안전 거리
        }}
      >
        {topic}
      </div>

      {/* 너비 계산용 숨겨진 div */}
      <div ref={textRef} style={{ position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap', ...FontStyles.headlineSmall }}>
        {topic}
      </div>
    </div>
  );
}