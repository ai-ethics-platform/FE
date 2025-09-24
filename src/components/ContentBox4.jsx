import React, { useEffect, useState } from 'react';
import useTypingEffect from '../hooks/useTypingEffect';
import contentBoxFrame from '../assets/contentBox2.svg';
import { Colors, FontStyles } from './styleConstants';

export default function ContentBox4({ text, leftText = false, leftTextContent = '', typingSpeed = 70 }) {
    const typedText = useTypingEffect(text, typingSpeed);
  
    const [startLeftTyping, setStartLeftTyping] = useState(false);
    const leftTypedText = useTypingEffect(startLeftTyping ? leftTextContent : '', typingSpeed);
  
    useEffect(() => {
      if (typedText === text && leftText) {
        setStartLeftTyping(true);
      }
    }, [typedText, text, leftText]);

  return (
    <div
      style={{
        position: 'relative',
        width: 960,
        height: 520,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
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
      <div
        style={{
          position: 'relative',
          lineHeight: '28px',
          color: Colors.grey06,
          ...FontStyles.headlineSmall,
          textAlign: leftText ? 'left' : 'center', // 정렬 변경
          wordBreak: 'keep-all',
          whiteSpace: 'pre-line',
          maxWidth: 1000,
          padding: '40px 60px',
          zIndex: 1,
        }}
      >
        {/* 기본 중앙 정렬 텍스트 */}
        {!leftText && typedText}

        {leftText && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
            {/* 중앙 정렬 텍스트 */}
            <div style={{ textAlign: 'center' }}>{typedText}</div>

            {/* 왼쪽 정렬 텍스트 */}
            {startLeftTyping && (
            <div
                style={{
                textAlign: 'left',
                marginLeft: 40,   
                marginTop: 0,    
                maxWidth: 700,    
                }}
            >
                {leftTypedText}
            </div>
            )}
        </div>
        )}

      </div>
    </div>
  );
}
