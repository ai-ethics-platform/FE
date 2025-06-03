// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Background from '../components/Background';
// import UserProfile from '../components/Userprofile';
// import ContentTextBox from '../components/ContentTextBox';
// import GameFrame from '../components/GameFrame';
// import closeIcon from '../assets/close.svg';

// // 4-컷 이미지
// import img1 from '../assets/images/Android_dilemma1_1.jpg';
// import img2 from '../assets/images/Android_dilemma1_2.jpg';
// import img3 from '../assets/images/Android_dilemma1_3.jpg';
// import img4 from '../assets/images/Android_dilemma1_4.jpg';
// const images = [img1, img2, img3, img4];

// // 팝업 프로필
// import profile1Img from '../assets/images/CharacterPopUp1.png';
// import profile2Img from '../assets/images/CharacterPopUp2.png';
// import profile3Img from '../assets/images/CharacterPopUp3.png';
// const profileImages = { '1P': profile1Img, '2P': profile2Img, '3P': profile3Img };

// export default function Game02() {
//   const navigate = useNavigate();
//   const subtopic = '가정 1';

//   const paragraphs = [
//     { main: '[  🔔 Homemate 사용자 최적화 시스템 업그레이드 공지 ]' },
//     {
//       main:
//         '  업데이트를 하면 고객님의 감정, 건강 상태, 생활 습관 등을 자동으로 수집하여\n' +
//         '보다 정확한 맞춤형 서비스를 제공할 수 있습니다.',
//     },
//     { main: '  다만, 이를 위해 24시간 정보 수집 기능을 활성화해야 합니다.' },
//     {
//       main:
//         '  수집되는 정보는 다음과 같습니다:\n' +
//         '  - 스마트폰 내 건강 정보, 채팅 기록, 위치 이력 등 사적인 데이터 접근\n' +
//         '  - *동의하지 않을 경우, 현재 수준의 서비스가 유지됩니다.',
//     },
//   ];

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [openProfile, setOpenProfile] = useState(null);
//   const [zoom, setZoom] = useState(1);

//   useEffect(() => {
//     const updateZoom = () => {
//       setZoom(Math.min(window.innerWidth / 1280, window.innerHeight / 720, 1));
//     };
//     updateZoom();
//     window.addEventListener('resize', updateZoom);
//     return () => window.removeEventListener('resize', updateZoom);
//   }, []);

//   const handleContinue = () => navigate('/game03');

//   return (
//     <Background bgIndex={3}>
//       <style>{`
//         html, body, #root {
//           margin: 0;
//           padding: 0;
//           height: 100%;
//           overflow: hidden;
//         }

//         .g02-viewport {
//           width: 100vw;
//           height: 100vh;
//           position: relative;
//         }

//         .g02-sidebar {
//          position: fixed;
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

//         .g02-content {
//           position: absolute;
//           top: 50%;
//           left: 50%;
//           transform: translate(-50%, -50%) scale(${zoom});
//           transform-origin: top center;
//           width: 1060px;
//         }

//         .g02-inner {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 32px;
//         }

//         .g02-gameframe {
//           width: 100%;
//           max-width: 500px;
//         }

//         .g02-comic {
//           width: 760px;
//           height: auto;
//         }

//         .g02-textbox {
//           width: 100%;
//           max-width: 900px;
//         }

//         .g02-modal {
//           position: fixed;
//           inset: 0;
//           background: rgba(0,0,0,0.6);
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           z-index: 2000;
//         }

//         .g02-modal-body {
//           position: relative;
//           background: #fff;
//           padding: 32px;
//           border-radius: 12px;
//           box-shadow: 0 12px 30px rgba(0,0,0,0.25);
//         }

//         .g02-modal-body img.profile {
//           width: 360px;
//           height: auto;
//         }

//         .g02-close {
//           position: absolute;
//           top: 24px;
//           right: 24px;
//           width: 40px;
//           height: 40px;
//           cursor: pointer;
//         }

//         @media (max-width: 1024px) {
//           .g02-sidebar {
//             position: static;
//             flex-direction: row;
//             justify-content: center;
//             width: 100%;
//           }

//           .g02-content {
//             position: static;
//             transform: none !important;
//             width: 100%;
//             padding: 16px;
//           }

//           .g02-comic {
//             width: clamp(240px, 90vw, 760px);
//           }

//           .g02-inner {
//             gap: 24px;
//           }
//         }
//       `}</style>

//       {openProfile && (
//         <div className="g02-modal" onClick={() => setOpenProfile(null)}>
//           <div className="g02-modal-body" onClick={(e) => e.stopPropagation()}>
//             <img className="profile" src={profileImages[openProfile]} alt={openProfile} />
//             <img className="g02-close" src={closeIcon} alt="close" onClick={() => setOpenProfile(null)} />
//           </div>
//         </div>
//       )}

//       <div className="g02-viewport">
//         <aside className="g02-sidebar">
//           <UserProfile player="1P" characterDesc="요양보호사" isLeader style={{cursor:'pointer'}} onClick={() => setOpenProfile('1P')} />
//           <UserProfile player="2P" characterDesc="노모 L" style={{cursor:'pointer'}} onClick={() => setOpenProfile('2P')} />
//           <UserProfile player="3P" characterDesc="자녀J" isMe style={{cursor:'pointer'}} onClick={() => setOpenProfile('3P')} />
//         </aside>

//         <div className="g02-content">
//           <div className="g02-inner">
//             <div className="g02-gameframe">
//               <GameFrame topic={`Round 01 : ${subtopic}`} hideArrows />
//             </div>

//             <img className="g02-comic" src={images[currentIndex]} alt={`comic ${currentIndex + 1}`} />

//             <div className="g02-textbox">
//               <ContentTextBox
//                 paragraphs={paragraphs}
//                 currentIndex={currentIndex}
//                 setCurrentIndex={setCurrentIndex}
//                 onContinue={handleContinue}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </Background>
//   );
// }
// src/pages/Game02.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout         from '../components/Layout';      // ★ 수정된 Layout 불러오기
import ContentTextBox from '../components/ContentTextBox';
import Continue       from '../components/Continue';
import GameFrame      from '../components/GameFrame';

import closeIcon       from '../assets/close.svg';

// 4-컷 이미지
import img1 from '../assets/images/Android_dilemma1_1.jpg';
import img2 from '../assets/images/Android_dilemma1_2.jpg';
import img3 from '../assets/images/Android_dilemma1_3.jpg';
import img4 from '../assets/images/Android_dilemma1_4.jpg';
const comicImages = [img1, img2, img3, img4];

// 팝업 프로필
import profile1Img from '../assets/images/CharacterPopUp1.png';
import profile2Img from '../assets/images/CharacterPopUp2.png';
import profile3Img from '../assets/images/CharacterPopUp3.png';
const profileImages = { '1P': profile1Img, '2P': profile2Img, '3P': profile3Img };

// 질문 텍스트(단락 배열)
const paragraphs = [
  { main: '[  🔔 Homemate 사용자 최적화 시스템 업그레이드 공지 ]' },
  {
    main:
      '  업데이트를 하면 고객님의 감정, 건강 상태, 생활 습관 등을 자동으로 수집하여\n' +
      '보다 정확한 맞춤형 서비스를 제공할 수 있습니다.',
  },
  { main: '  다만, 이를 위해 24시간 정보 수집 기능을 활성화해야 합니다.' },
  {
    main:
      '  수집되는 정보는 다음과 같습니다:\n' +
      '  - 스마트폰 내 건강 정보, 채팅 기록, 위치 이력 등 사적인 데이터 접근\n' +
      '  - *동의하지 않을 경우, 현재 수준의 서비스가 유지됩니다.',
  },
];

export default function Game02() {
  const navigate = useNavigate();
  const subtopic = '가정 1';

  // ─── 상태 관리 ───────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openProfile, setOpenProfile]     = useState(null); 
  // openProfile: '1P' or '2P' or '3P' or null

  // 만화 단계를 넘어가면 Game03으로
  const handleContinue = () => {
    navigate('/game03', {
      state: { agreement: null, confidence: 0 }, // Game03에 넘길 게 있으면 여기에
    });
  };

  return (
    <>
      {/* ───────── 팝업 모달 ───────── */}
      {openProfile && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
          }}
          onClick={() => setOpenProfile(null)}
        >
          <div
            style={{
              position: 'relative',
              background: '#fff',
              padding: 32,
              borderRadius: 12,
              boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              className="profile"
              src={profileImages[openProfile]}
              alt={`Profile ${openProfile}`}
              style={{ width: 360, height: 'auto', display: 'block' }}
            />
            <img
              className="close"
              src={closeIcon}
              alt="close"
              style={{
                position: 'absolute',
                top: 24,
                right: 24,
                width: 40,
                height: 40,
                cursor: 'pointer',
              }}
              onClick={() => setOpenProfile(null)}
            />
          </div>
        </div>
      )}

      {/* ─── Layout 적용 ─── */}
      <Layout
        subtopic={subtopic}
        me="3P"
        onProfileClick={(playerId) => {
          setOpenProfile(playerId);
        }}
      >
        {/* Layout의 중앙 Stage 내부에 넣을 콘텐츠 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 32,
          }}
        >
          {/* ─── 만화(Comic) 이미지 ─── */}
          <img
            src={comicImages[currentIndex]}
            alt={`comic ${currentIndex + 1}`}
            style={{
              width: 760,
              height: 'auto',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          />

          {/* ─── 대화창(ContentTextBox) + Continue ─── */}
          <div style={{ width: '100%', maxWidth: 900 }}>
            <ContentTextBox
              paragraphs={paragraphs}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              onContinue={handleContinue}
            />
          </div>
        </div>
      </Layout>
    </>
  );
}
