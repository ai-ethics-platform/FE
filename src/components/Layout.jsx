// src/layout/Layout.jsx
import React, { useEffect, useState } from 'react';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import GameFrame   from '../components/GameFrame';

/**
 * 공통 레이아웃
 * ─ 왼쪽 Sidebar 220px  |  우측 Stage(나머지)
 * ─ 전체 1280×720 고정 캔버스 → 작은 화면에서만 비율 축소(zoom)
 *
 * props
 *  - subtopic   : GameFrame 제목(예: '가정 1')
 *  - me         : '1P' | '2P' | '3P'  ― 내가 누구인지 표시
 *  - children   : 각 페이지 고유 콘텐츠
 */
export default function Layout({ subtopic = '가정 1', me = '1P', children }) {
  /* 창 크기에 맞춰 한 번에 scale 계산 */
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const resize = () => {
      setZoom(Math.min(window.innerWidth / 1280, window.innerHeight / 720, 1));
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <Background bgIndex={3}>
      
      <style>{`
        /* ① viewport: 왼쪽 붙이고, 세로는 화면 가운데 */
        .layout-viewport{
          position:fixed; inset:0;
          display:flex; justify-content:flex-start; align-items:flex-start;
          overflow:hidden;
        }
        /* ② 1280×720 캔버스 */
        .layout-root{
          width:1280px; height:720px;
          position:absolute; top:50%; left:0;
          transform-origin:top left;
        }
        /* ③ 2-열 Grid */
        .layout-wrapper{
          display:grid; grid-template-columns:220px 1fr;
          width:100%; height:100%;
        }
        /* ④ Sidebar */
        .layout-sidebar{
          padding:20px 0;
          display:flex; flex-direction:column;
          gap:24px; align-items:flex-start;
        }
        /* ⑤ Stage */
        .layout-stage{
          display:flex; flex-direction:column; align-items:center;
          padding:40px 24px 32px; overflow:hidden;
        }
        .layout-gameframe{
          width:100%; max-width:500px; margin-bottom:32px;
        }

        /* ───────── 반응형(≤1024px) ───────── */
        @media(max-width:1024px){
          .layout-viewport{ position:static; display:block; overflow:auto; }
          .layout-root{ width:100%; height:auto; position:static;
                        transform:none !important; }
          .layout-wrapper{ grid-template-columns:1fr; }
          .layout-sidebar{
            flex-direction:row; justify-content:center;
            padding:12px 0;
          }
        }
      `}</style>

      {/* ───────── 레이아웃 뼈대 ───────── */}
      <div className="layout-viewport">
        <div
          className="layout-root"
          style={{ transform:`translateY(-50%) scale(${zoom})` }}
        >
          <div className="layout-wrapper">
            
            <aside className="layout-sidebar">
              <UserProfile player="1P" characterDesc="요양보호사" isLeader isMe={me==='1P'} />
              <UserProfile player="2P" characterDesc="노모 L"          isMe={me==='2P'} />
              <UserProfile player="3P" characterDesc="자녀 J"          isMe={me==='3P'} />
            </aside>

           
            <section className="layout-stage">
              <div className="layout-gameframe">
                <GameFrame topic={`Round 01 : ${subtopic}`} hideArrows />
              </div>

              {/* 페이지별 콘텐츠 주입 */}
              {children}
            </section>
          </div>
        </div>
      </div>
    </Background>
  );
}
