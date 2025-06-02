import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import ContentTextBox from '../components/ContentTextBox';
import GameFrame from '../components/GameFrame';
import character1 from '../assets/images/Char1.jpg';
import character2 from '../assets/images/Char2.jpg';
import character3 from '../assets/images/Char3.jpg';

export default function Game01() {
  const navigate = useNavigate();

  const images = [character1, character2, character3];
  const subtopic = '가정 1';

  const paragraphs = [
    {
      main:
        '  지금부터 여러분은 HomeMate를 사용하게 된 사용자입니다.\n' +
        '  여러분은 다양한 장소에서 HomeMate를 어떻게 사용하는지에 대해 함께 논의하고 결정할 것입니다.',
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
        /* viewport left-align horizontally, center vertically */
        .g01-viewport{position:fixed;inset:0;display:flex;justify-content:flex-start;align-items:center;overflow:hidden;}
        .g01-root{width:1280px;height:720px;transform-origin:top left;}
        .g01-wrapper{display:grid;grid-template-columns:220px 1fr;width:100%;height:100%;}
        .g01-sidebar{padding:20px 0;display:flex;flex-direction:column;gap:24px;align-items:flex-start;}
        .g01-stage{display:flex;flex-direction:column;align-items:center;padding:40px 24px 32px;}
        .g01-gameframe{width:100%;max-width:500px;margin-bottom:32px;}
        .g01-gallery{display:flex;gap:24px;margin-bottom:32px;}
        .g01-gallery img{width:264px;height:360px;object-fit:cover;border-radius:4px;}
        .g01-textbox{width:100%;max-width:900px;}
        /* mobile */
        @media(max-width:1024px){
          .g01-viewport{position:static;display:block;overflow:auto;}
          .g01-root{width:100%;height:auto;transform:none!important;}
          .g01-wrapper{grid-template-columns:1fr;}
          .g01-sidebar{flex-direction:row;justify-content:center;padding:12px 0;}
          .g01-gallery{flex-direction:column;align-items:center;}
          .g01-gallery img{width:clamp(200px,80vw,264px);height:auto;}
        }
      `}</style>

      <div className="g01-viewport">
        <div
          className="g01-root"
          style={{ position:'absolute', top:'50%', left:0, transform:`translateY(-50%) scale(${zoom})` }}
        >
          <div className="g01-wrapper">
           
            <aside className="g01-sidebar">
              <UserProfile player="1P" isLeader />
              <UserProfile player="2P" isSpeaking />
              <UserProfile player="3P" />
            </aside>

            
            <section className="g01-stage">
              <div className="g01-gameframe">
                <GameFrame topic={`Round 01 : ${subtopic}`} hideArrows />
              </div>

              
              <div className="g01-gallery">
                {images.map((src, idx) => (
                  <img key={idx} src={src} alt={`Character ${idx + 1}`} />
                ))}
              </div>

              <div className="g01-textbox">
                <ContentTextBox paragraphs={paragraphs} onContinue={() => navigate('/character_description1')} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </Background>
  );
}
