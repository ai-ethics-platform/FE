import React, { useState } from 'react';
import nextFrame from '../assets/next.svg';
import { FontStyles, Colors } from './styleConstants';
import { translations } from '../utils/language';

/**
 * Continue: 다음 단계로 진행하는 버튼 컴포넌트
 */
export default function Continue({
  width = 264,
  height = 72,
  onClick,
  disabled = false,        
  label, 
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive,  setIsActive]  = useState(false);

  const lang = localStorage.getItem('app_lang') || 'ko';
  
  // [수정] 이중 객체 구조(UiElements.UiElements) 안전하게 해제
  const rawData = translations[lang]?.UiElements || translations['ko']?.UiElements || {};
  const t = rawData.UiElements || rawData;

  // 우선순위: Props label > 언어팩 UiElements.next > 기본값 "다음"
  const finalLabel = label || t.next || "다음";

  const interactive = !disabled;
  const scale = interactive ? (isActive ? 0.989 : isHovered ? 1.01 : 1) : 1;
  const textColor = interactive ? Colors.grey01 : Colors.grey04;
  const textStyle = {
    ...FontStyles.headlineSmall,
    color: textColor,
    ...(lang !== 'ko' && { 
      fontSize: '22px',  // 글자 크기 축소 (필요시 조절)
      lineHeight: '1.2', // 줄 간격 좁힘
      whiteSpace: 'nowrap' // 줄바꿈 방지 (혹은 필요시 'normal')
    })
  };
  return (
    <div
      onClick={interactive ? onClick : undefined}
      onMouseEnter={interactive ? () => setIsHovered(true) : undefined}
      onMouseLeave={interactive ? () => { setIsHovered(false); setIsActive(false); } : undefined}
      onMouseDown={interactive ? () => setIsActive(true) : undefined}
      onMouseUp={interactive ? () => setIsActive(false) : undefined}
      style={{
        width, height, position: 'relative', cursor: interactive ? 'pointer' : 'default',
        userSelect: 'none', transform: `scale(${scale})`, transition: 'transform 0.15s ease-out',
        opacity: interactive ? 1 : 0.4,            
      }}
    >
      <img src={nextFrame} alt="" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <span style={textStyle}>{finalLabel}</span>
      </div>
    </div>
  );
}