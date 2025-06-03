// // src/layout/Layout.jsx
// import React, { useEffect, useState } from 'react';
// import Background   from '../components/Background';
// import UserProfile  from '../components/Userprofile';
// import GameFrame    from '../components/GameFrame';

// export default function Layout({ subtopic = '가정 1', me = '1P', children }) {
//   /* 뷰포트 대비 축소 비율 계산 ─ 1280×720 기준 */
//   const [zoom, setZoom] = useState(1);
//   useEffect(() => {
//     const onResize = () =>
//       setZoom(Math.min(window.innerWidth / 1280, window.innerHeight / 720, 1));
//     onResize();
//     window.addEventListener('resize', onResize);
//     return () => window.removeEventListener('resize', onResize);
//   }, []);

//   return (
//     <Background bgIndex={3}>
//       <style>{`
//         /* 전체 캔버스 ───────────────────── */
//         .layout-viewport{
//           width:100vw;height:100vh;
//           position:relative;overflow:hidden;
//         }

//         /* ① 고정 사이드바(220px) ─ 화면 왼쪽·세로 중앙 */
//         .layout-sidebar{
//           position:fixed;top:50%;left:0;
//           transform:translateY(-83.5%);
//           width:220px;padding:20px 0;
//           display:flex;flex-direction:column;
//           gap:24px;align-items:flex-start;
//         }

//         /* ② Stage(1060×720) ─ 화면 정확히 중앙 */
//         .layout-stage{
//           width:1060px;height:720px;
//           position:absolute;top:50%;left:50%;
//           transform:translate(-50%,-50%) scale(${zoom});
//           transform-origin:top center;
//           display:flex;flex-direction:column;
//           align-items:center;
//           padding:40px 24px 32px; /* GameFrame 여백 */
//         }
//         .layout-gameframe{
//           width:100%;
//           max-width:500px;
//           margin-bottom:32px;
//         }

//         /* ───────── 반응형(≤1024px) ───────── */
//         @media (max-width:1024px){
//           .layout-sidebar{
//             position:static;transform:none;width:100%;
//             flex-direction:row;justify-content:center;
//             padding:12px 0;
//           }
//           .layout-stage{
//             position:static;width:100%;height:auto;
//             transform:none !important; /* 중앙+확대 해제 */
//             padding:24px 16px;
//           }
//         }
//       `}</style>

//       <div className="layout-viewport">
//         {/* ─ 왼쪽 고정 사이드바 ─ */}
//         <aside className="layout-sidebar">
//           <UserProfile player="1P" characterDesc="요양보호사" isLeader isMe={me==='1P'} />
//           <UserProfile player="2P" characterDesc="노모 L"          isMe={me==='2P'} />
//           <UserProfile player="3P" characterDesc="자녀 J"          isMe={me==='3P'} />
//         </aside>

//         {/* ─ 중앙 Stage ─ */}
//         <section className="layout-stage">
//           <div className="layout-gameframe">
//             <GameFrame topic={`Round 01 : ${subtopic}`} hideArrows />
//           </div>
//           {children}   {/* (예: <Card> 컴포넌트들) */}
//         </section>
//       </div>
//     </Background>
//   );
// }
// src/layout/Layout.jsx
// src/layout/Layout.jsx
import React, { useEffect, useState } from 'react';
import Background  from '../components/Background';
import UserProfile from '../components/Userprofile';
import GameFrame   from '../components/GameFrame';

/**
 * 공통 레이아웃
 *
 * props:
 *  - subtopic         : GameFrame 제목 (예: '가정 1')
 *  - me               : '1P' | '2P' | '3P'  ― 내가 누구인지 표시
 *  - onProfileClick   : (player: '1P'|'2P'|'3P') => void 
 *                       선택적으로, 클릭된 프로필의 ID를 알려주는 콜백
 *  - children         : Stage 내부에 들어갈 콘텐츠
 */
export default function Layout({
  subtopic = '가정 1',
  me = '1P',
  onProfileClick,   // ★ 레이아웃 수정: 프로필 클릭 핸들러
  children,
}) {
  /* 1280×720 기준 축소 비율 */
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const onResize = () => {
      setZoom(Math.min(window.innerWidth / 1280, window.innerHeight / 720, 1));
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <Background bgIndex={3}>
      <style>{`
        /* 전역 ─ 스크롤 제거 & 여백 리셋 */
        html, body, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: hidden;
        }

        /* 전체 뷰포트 */
        .layout-viewport {
          position: fixed;
          inset: 0;
          overflow: hidden;
        }

        /* ① 왼쪽 고정 사이드바 */
        .layout-sidebar {
          position: fixed;
          top: 32.5%;
          left: 0;
          transform: translateY(-50%);
          width: 220px;
          padding: 20px 0;
          display: flex;
          flex-direction: column;
          gap: 24px;
          align-items: flex-start;
        }

        /* ② 중앙 Stage */
        .layout-stage {
          width: 1060px;
          height: 720px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(${zoom});
          transform-origin: top center;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 24px 32px; /* GameFrame 아래 여백 */
        }
        .layout-gameframe {
          width: 100%;
          max-width: 500px;
          margin-bottom: 32px;
        }

        /* ───────── 반응형(≤ 1024px) ───────── */
        @media(max-width:1024px) {
          .layout-sidebar {
            position: static;
            transform: none;
            width: 100%;
            flex-direction: row;
            justify-content: center;
            padding: 12px 0;
          }
          .layout-stage {
            position: static;
            width: 100%;
            height: auto;
            transform: none !important;
            padding: 24px 16px;
          }
        }
      `}</style>

      <div className="layout-viewport">
        {/* ─ 왼쪽 사이드바(고정) ─ */}
        <aside className="layout-sidebar">
          <UserProfile
            player="1P"
            characterDesc="요양보호사"
            isLeader
            isMe={me === '1P'}
            {...(onProfileClick
              ? { onClick: () => onProfileClick('1P'), style: { cursor: 'pointer' } }
              : {})}
          />
          <UserProfile
            player="2P"
            characterDesc="노모 L"
            isMe={me === '2P'}
            {...(onProfileClick
              ? { onClick: () => onProfileClick('2P'), style: { cursor: 'pointer' } }
              : {})}
          />
          <UserProfile
            player="3P"
            characterDesc="자녀 J"
            isMe={me === '3P'}
            {...(onProfileClick
              ? { onClick: () => onProfileClick('3P'), style: { cursor: 'pointer' } }
              : {})}
          />
        </aside>

        {/* ─ 중앙 Stage ─ */}
        <section className="layout-stage">
          <div className="layout-gameframe">
            <GameFrame topic={`Round 01 : ${subtopic}`} hideArrows />
          </div>
          {/* 페이지별 콘텐츠(예: 만화 이미지 + 대화창 등) */}
          {children}
        </section>
      </div>
    </Background>
  );
}
