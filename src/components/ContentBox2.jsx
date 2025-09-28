import React from 'react';
import  useTypingEffect  from '../hooks/useTypingEffect';
import contentBoxFrame from '../assets/contentBox2.svg';
import { Colors, FontStyles } from './styleConstants';
export default function ContentBox2({ text, typingSpeed = 70 }) {
  const typedText = useTypingEffect(text, typingSpeed);
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
        color:Colors.grey06,
        ...FontStyles.headlineSmall,
        //display: 'flex',            
        alignItems: 'center',       
        justifyContent: 'center',   
        textAlign: 'center',
        wordBreak: 'keep-all',
        whiteSpace: 'pre-line',
        maxWidth: 900,
        padding: '40px 60px',
        zIndex: 1,
      }}>
        {typedText}
      </div>
    </div>
  );
}
