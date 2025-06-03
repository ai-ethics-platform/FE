// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Background from '../components/Background';
// import UserProfile from '../components/Userprofile';
// import ContentTextBox from '../components/ContentTextBox';
// import GameFrame from '../components/GameFrame';
// import character1 from '../assets/images/Char1.jpg';
// import character2 from '../assets/images/Char2.jpg';
// import character3 from '../assets/images/Char3.jpg';

// export default function Game01() {
//   const navigate = useNavigate();
//   const images = [character1, character2, character3];
//   const subtopic = '가정 1';

//   const paragraphs = [
//     {
//       main:
//         '  지금부터 여러분은 HomeMate를 사용하게 된 사용자입니다.\n' +
//         '  여러분은 다양한 장소에서 HomeMate를 어떻게 사용하는지에 대해 함께 논의하고 결정할 것입니다.',
//     },
//   ];

//   const [zoom, setZoom] = useState(1);
//   useEffect(() => {
//     const updateZoom = () => {
//       setZoom(Math.min(window.innerWidth / 1280, window.innerHeight / 720, 1));
//     };
//     updateZoom();
//     window.addEventListener('resize', updateZoom);
//     return () => window.removeEventListener('resize', updateZoom);
//   }, []);

//   return (
//     <Background bgIndex={3}>
//       <style>{`
//         html, body, #root {
//           margin: 0;
//           padding: 0;
//           height: 100%;
//           overflow: hidden;
//         }

//         .g01-viewport {
//           width: 100vw;
//           height: 100vh;
//           position: relative;
//         }

//         .g01-sidebar {
//           position: fixed;
//           top: 31.5%;
//           left: 0;
//           transform: translateY(-50%);
//           width: 220px;
//           padding: 20px 0;
//           display: flex;
//           flex-direction: column;
//           gap: 24px;
//           align-items: flex-start;
//         }

//         .g01-content {
//           position: absolute;
//           top: 50%;
//           left: 50%;
//           transform: translate(-50%, -50%) scale(${zoom});
//           transform-origin: top center;
//           width: 1060px; /* 1280 - 220 (sidebar) */
//         }

//         .g01-inner {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 32px;
//         }

//         .g01-gameframe {
//           width: 100%;
//           max-width: 500px;
//         }

//         .g01-gallery {
//           display: flex;
//           gap: 24px;
//         }

//         .g01-gallery img {
//           width: 264px;
//           height: 360px;
//           object-fit: cover;
//           border-radius: 4px;
//         }

//         .g01-textbox {
//           width: 100%;
//           max-width: 900px;
//         }

//         @media (max-width: 1024px) {
//           .g01-sidebar {
//             position: static;
//             flex-direction: row;
//             justify-content: center;
//             width: 100%;
//             transform: none;
//           }

//           .g01-content {
//             position: static;
//             transform: none !important;
//             width: 100%;
//             padding: 16px;
//           }

//           .g01-gallery {
//             flex-direction: column;
//             align-items: center;
//           }

//           .g01-gallery img {
//             width: clamp(200px, 80vw, 264px);
//             height: auto;
//           }
//         }
//       `}</style>

//       <div className="g01-viewport">
//         {/* 왼쪽 고정 사이드바 */}
//         <aside className="g01-sidebar">
//           <UserProfile player="1P" isLeader />
//           <UserProfile player="2P" isSpeaking />
//           <UserProfile player="3P" />
//         </aside>

//         {/* 브라우저 정중앙 콘텐츠 */}
//         <div className="g01-content">
//           <div className="g01-inner">
//             <div className="g01-gameframe">
//               <GameFrame topic={`Round 01 : ${subtopic}`} hideArrows />
//             </div>

//             <div className="g01-gallery">
//               {images.map((src, idx) => (
//                 <img key={idx} src={src} alt={`Character ${idx + 1}`} />
//               ))}
//             </div>

//             <div className="g01-textbox">
//               <ContentTextBox
//                 paragraphs={paragraphs}
//                 onContinue={() => navigate('/character_description1')}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </Background>
//   );
// }
// src/pages/Game01.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout         from '../components/Layout';   // ★ Layout 사용
import ContentTextBox from '../components/ContentTextBox';

import character1 from '../assets/images/Char1.jpg';
import character2 from '../assets/images/Char2.jpg';
import character3 from '../assets/images/Char3.jpg';

export default function Game01() {
  const navigate   = useNavigate();
  const images     = [character1, character2, character3];
  const subtopic   = '가정 1';

  /* 텍스트 단락 */
  const paragraphs = [
    {
      main:
        '  지금부터 여러분은 HomeMate를 사용하게 된 사용자입니다.\n' +
        '  여러분은 다양한 장소에서 HomeMate를 어떻게 사용하는지에 대해 함께 논의하고 결정할 것입니다.',
    },
  ];

  /* Stage 안에 배치될 콘텐츠 */
  return (
    <Layout subtopic={subtopic} me="1P">
      <div                 /* Stage 내부 컨테이너 */
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
        }}
      >
        {/* ─ 이미지 3장 갤러리 ─ */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {images.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`Character ${idx + 1}`}
              style={{
                width: 264,
                height: 360,
                objectFit: 'cover',
                borderRadius: 4,
              }}
            />
          ))}
        </div>

        {/* ─ 텍스트 + Continue ─ */}
        <div style={{ width: '100%', maxWidth: 900 }}>
          <ContentTextBox
            paragraphs={paragraphs}
            onContinue={() => navigate('/character_description1')}
          />
        </div>
      </div>
    </Layout>
  );
}
