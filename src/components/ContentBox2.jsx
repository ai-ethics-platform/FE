import React from 'react';
import useTypingEffect from '../hooks/useTypingEffect';
import contentBoxFrame from '../assets/contentBox2.svg';
import { Colors, FontStyles } from './styleConstants';

export default function ContentBox2({ text, typingSpeed = 1 }) {
  // 1. 타이핑 중인 텍스트 가져오기
  const typedText = useTypingEffect(text, typingSpeed);

  // 2. 전체 텍스트와 타이핑된 텍스트의 길이를 비교하여 '보이는 부분'과 '숨겨진 부분' 나누기
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
        lineHeight: '28px',
        color: Colors.grey06,
        ...FontStyles.headlineSmall,
        textAlign: 'center',
        
        // ✅ 기존 개발자 의도 유지 + 보완
        // keep-all을 써서 단어 단위로 예쁘게 끊기게 하되, 
        // 유령 텍스트 로직이 줄바꿈 깜빡임을 막아줍니다.
        wordBreak: 'keep-all', 
        overflowWrap: 'break-word',
        whiteSpace: 'pre-line',
        
        maxWidth: 820, // 사용자님이 조절 중인 수치 유지
        padding: '60px 80px',
        zIndex: 1,
      }}>
        {/* 3. 실제 보이는 텍스트 */}
        <span>{visibleText}</span>
        
        {/* 4. 투명한 상태로 자리를 미리 차지하는 텍스트 (깜빡임 방지 핵심) */}
        <span style={{ visibility: 'hidden', userSelect: 'none' }} aria-hidden="true">
          {hiddenText}
        </span>
      </div>
    </div>
  );
}

