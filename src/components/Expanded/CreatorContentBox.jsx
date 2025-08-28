import React from 'react';
import  useTypingEffect  from '../../hooks/useTypingEffect';
import contentBoxFrame from '../../assets/creatorcontentbox.svg';
import { Colors, FontStyles } from '../styleConstants';
export default function CreatorContentBox({ text, topicText,typingSpeed = 70 }) {
  const typedText = useTypingEffect(text,typingSpeed);
 // const topicText = useTypingEffect(text,topicText='', typingSpeed);

  return (
    <div style={{
      position: 'relative',
      width: 836,
      height: 402,
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column', 
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
       {topicText && (
        <div
          style={{
            ...FontStyles.headlineNormal,
            color: Colors.grey07,
            marginBottom: 16, // 아래 내용과 간격
            textAlign: 'center',
            zIndex: 1,
          }}
        >
          {topicText}
        </div>
      )}

      <div style={{
        position: 'relative',
        lineHeight: '28px',
        color:Colors.grey06,
        ...FontStyles.title,
        //display: 'flex',            
        alignItems: 'center',       
        justifyContent: 'center',   
        textAlign: 'center',
        wordBreak: 'keep-all',
        whiteSpace: 'normal',
        maxWidth: 600,
        padding: '20px 30px',
        zIndex: 1,
      }}>
        {typedText}
      </div>
    </div>
  );
}
