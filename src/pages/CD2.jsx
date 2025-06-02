import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import ContentTextBox from '../components/ContentTextBox';
import GameFrame from '../components/GameFrame';
import player2DescImg from '../assets/images/Player2_description.png';

export default function CD2() {
  const navigate = useNavigate();
  const subtopic = '가정 1';

  const paragraphs = [
    {
      main:
        '  당신은 자녀 J씨의 노모 L입니다.\n' +
        '  가사도우미의 도움을 받다가 최근....',
    },
  ];


  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const updateZoom = () => {
      setZoom(Math.min(window.innerWidth / 1280, window.innerHeight / 720, 1));
    };
    updateZoom();
    window.addEventListener('resize', updateZoom);
    return () => window.removeEventListener('resize', updateZoom);
  }, []);

  return (
    <Background bgIndex={3}>
      <style>{`
        html,body,#root{height:100%;margin:0;}
        /* viewport: flush-left horizontally, center vertically */
        .cd2-viewport{position:fixed;inset:0;display:flex;justify-content:flex-start;align-items:center;overflow:hidden;}
        .cd2-root{width:1280px;height:720px;transform-origin:top left;}
        .cd2-wrapper{display:grid;grid-template-columns:220px 1fr;width:100%;height:100%;}
        .cd2-sidebar{padding:20px 0;display:flex;flex-direction:column;gap:24px;align-items:flex-start;}
        .cd2-stage{display:flex;flex-direction:column;align-items:center;padding:40px 24px 32px;}
        .cd2-gameframe{width:100%;max-width:500px;margin-bottom:32px;}
        .cd2-avatar{width:264px;height:336px;margin-bottom:32px;object-fit:contain;}
        .cd2-textbox{width:100%;max-width:900px;}
        /* mobile */
        @media(max-width:1024px){
          .cd2-viewport{position:static;display:block;overflow:auto;}
          .cd2-root{width:100%;height:auto;transform:none!important;}
          .cd2-wrapper{grid-template-columns:1fr;}
          .cd2-sidebar{flex-direction:row;justify-content:center;padding:12px 0;}
          .cd2-avatar{width:clamp(200px,50vw,264px);height:auto;}
        }
      `}</style>

      <div className="cd2-viewport">
        <div
          className="cd2-root"
          style={{ position:'absolute', top:'50%', left:0, transform:`translateY(-50%) scale(${zoom})` }}
        >
          <div className="cd2-wrapper">
            {/* Sidebar */}
            <aside className="cd2-sidebar">
              <UserProfile player="1P" characterDesc="요양보호사" isLeader />
              <UserProfile player="2P" characterDesc="노모 L" isMe />
              <UserProfile player="3P" characterDesc="자녀 J" />
            </aside>

            {/* Main Stage */}
            <section className="cd2-stage">
              <div className="cd2-gameframe">
                <GameFrame topic={`Round 01 : ${subtopic}`} hideArrows />
              </div>

              <img className="cd2-avatar" src={player2DescImg} alt="Player 2 설명 이미지" />

              <div className="cd2-textbox">
                <ContentTextBox paragraphs={paragraphs} onContinue={() => navigate('/game02')} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </Background>
  );
}