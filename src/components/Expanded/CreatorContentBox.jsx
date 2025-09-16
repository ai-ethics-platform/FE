// import React from 'react';
// import  useTypingEffect  from '../../hooks/useTypingEffect';
// import contentBoxFrame from '../../assets/creatorcontentbox.svg';
// import { Colors, FontStyles } from '../styleConstants';
// export default function CreatorContentBox({ text, topicText,typingSpeed = 70 }) {
//   const typedText = useTypingEffect(text,typingSpeed);
//  // const topicText = useTypingEffect(text,topicText='', typingSpeed);

//   return (
//     <div style={{
//       position: 'relative',
//       width: 836,
//       height: 402,
//       display: 'flex',
//       alignItems: 'center',
//       flexDirection: 'column', 
//       justifyContent: 'center',
//     }}>
//       <img
//         src={contentBoxFrame}
//         alt="content frame"
//         style={{
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           width: '100%',
//           height: '100%',
//           pointerEvents: 'none',
          
//         }}
//       />
//        {topicText && (
//         <div
//           style={{
//             ...FontStyles.headlineNormal,
//             color: Colors.grey07,
//             marginBottom: 16, // 아래 내용과 간격
//             textAlign: 'center',
//             zIndex: 1,
//           }}
//         >
//           {topicText}
//         </div>
//       )}

//       <div style={{
//         position: 'relative',
//         lineHeight: '28px',
//         color:Colors.grey06,
//         ...FontStyles.title,
//         //display: 'flex',            
//         alignItems: 'center',       
//         justifyContent: 'center',   
//         textAlign: 'center',
//         wordBreak: 'keep-all',
//         whiteSpace: 'normal',
//         maxWidth: 600,
//         padding: '20px 30px',
//         zIndex: 1,
//       }}>
//         {typedText}
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from 'react';
import useTypingEffect from '../../hooks/useTypingEffect';
import contentBoxFrame from '../../assets/creatorcontentbox.svg';
import { Colors, FontStyles } from '../styleConstants';

export default function CreatorContentBox({
  text, 
  topicText, 
  typingSpeed = 70, 
  orangeText // 부모로부터 받은 오렌지 텍스트
}) {
  const [showOrangeText, setShowOrangeText] = useState(false); // 오렌지 텍스트 타이핑 시작 여부
  const typedText = useTypingEffect(text, typingSpeed); // 첫 번째 타이핑 효과
  const orangeTypedText = useTypingEffect(orangeText, typingSpeed); // 두 번째 타이핑 효과



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
        color: Colors.grey06,
        ...FontStyles.title,
        alignItems: 'center',       
        justifyContent: 'center',   
        textAlign: 'center',
        wordBreak: 'keep-all',
        whiteSpace: 'normal',
        maxWidth: 600,
        padding: '20px 30px',
        zIndex: 1,
      }}>
        {text}
      </div>

      {/* 오렌지 색 텍스트가 나타나는 부분 */}
      { orangeText && (
        <div style={{
          position: 'relative',
          lineHeight: '28px',
          color: Colors.CreatorPrimary, // 오렌지 색으로 텍스트 적용
          ...FontStyles.title,
          textAlign: 'center',
          zIndex: 1,
        }}>
          {orangeText}
        </div>
      )}
    </div>
  );
}
