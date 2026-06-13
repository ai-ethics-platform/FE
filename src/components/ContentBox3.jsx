import React from 'react';
import useTypingEffect from '../hooks/useTypingEffect';
import contentBoxFrame from '../assets/contentBox2.svg';
import { Colors, FontStyles } from './styleConstants';

export default function ContentBox2({ text, typingSpeed = 45 }) {
  // 타이핑 중인 텍스트 데이터 로드
  const typedText = useTypingEffect(text, typingSpeed);
  
  // 전체 텍스트 길이 측정 및 투명 텍스트 영역 계산
  const fullText = text || '';
  const typedLen = (typedText || '').length;
  const visibleText = fullText.slice(0, typedLen);
  const hiddenText = fullText.slice(typedLen);

  return (
    <div style={{
      position: 'relative',
      width: 960,
      height: 520,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>    
      <img
        src={contentBoxFrame}
        alt="content frame"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
      <div style={{
        position: 'relative',
        lineHeight: '28px', // 줄바꿈 시 가독성을 위한 간격 확보
        color: Colors.grey06,
        ...FontStyles.headlineSmall,
        alignItems: 'center',       
        justifyContent: 'center',   
        textAlign: 'center',
        // 단어 단위로 깔끔하게 떨어지도록 설정
        wordBreak: 'keep-all',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-line',
        maxWidth: 820, // 텍스트가 박스 테두리에 닿지 않도록 너비 제한 조절
        padding: '40px 40px',
        zIndex: 1,
      }}>
        {/* 현재 출력되는 실제 텍스트 */}
        <span>{visibleText}</span>
        
        {/* 공간 확보용 투명 텍스트 영역 */}
        <span style={{ visibility: 'hidden', userSelect: 'none' }} aria-hidden="true">
          {hiddenText}
        </span>
      </div>
    </div>
  );
}