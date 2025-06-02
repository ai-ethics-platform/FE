import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import ContentTextBox from '../components/ContentTextBox';
import GameFrame from '../components/GameFrame';
import player1DescImg from '../assets/images/Player1_description.png';

export default function CD1() {
  const navigate = useNavigate();
  const subtopic = '가정 1';

  const paragraphs = [
    {
      main:
        '  당신은 어머니를 10년 이상 돌본 요양보호사 K입니다.\n' +
        '  최근 ...',
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
        /* viewport: left-align horizontally, center vertically */
        .cd1-viewport{position:fixed;inset:0;display:flex;justify-content:flex-start;align-items:center;overflow:hidden;}
        .cd1-root{width:1280px;height:720px;transform-origin:top left;}
        .cd1-wrapper{display:grid;grid-template-columns:220px 1fr;width:100%;height:100%;}
        .cd1-sidebar{padding:20px 0;display:flex;flex-direction:column;gap:24px;align-items:flex-start;}
        .cd1-stage{display:flex;flex-direction:column;align-items:center;padding:40px 24px 32px;}
        .cd1-gameframe{width:100%;max-width:500px;margin-bottom:32px;}
        .cd1-avatar{width:264px;height:336px;margin-bottom:32px;object-fit:contain;}
        .cd1-textbox{width:100%;max-width:900px;}
        /* mobile */
        @media(max-width:1024px){
          .cd1-viewport{position:static;display:block;overflow:auto;}
          .cd1-root{width:100%;height:auto;transform:none!important;}
          .cd1-wrapper{grid-template-columns:1fr;}
          .cd1-sidebar{flex-direction:row;justify-content:center;padding:12px 0;}
          .cd1-avatar{width:clamp(200px,50vw,264px);height:auto;}
        }
      `}</style>

      <div className="cd1-viewport">
        <div
          className="cd1-root"
          style={{ transform:`scale(${zoom})`, position:'absolute', top:'50%', left:0, transformOrigin:'top left', translate:'0 -50%' }}
        >
          <div className="cd1-wrapper">
            <aside className="cd1-sidebar">
              <UserProfile player="1P" characterDesc="요양보호사" isLeader isMe />
              <UserProfile player="2P" characterDesc="노모 L" />
              <UserProfile player="3P" characterDesc="자녀 J" />
            </aside>
            <section className="cd1-stage">
              <div className="cd1-gameframe"><GameFrame topic={`Round 01 : ${subtopic}`} hideArrows /></div>
              <img className="cd1-avatar" src={player1DescImg} alt="Player 1 설명 이미지" />
              <div className="cd1-textbox"><ContentTextBox paragraphs={paragraphs} onContinue={() => navigate('/game02')} /></div>
            </section>
          </div>
        </div>
      </div>
    </Background>
  );
}