import React, { useEffect, useState } from 'react';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import GameFrame from '../components/GameFrame';

export default function Layout({
  subtopic = '가정 1',
  me = '1P',
  onProfileClick,
  children,
  round, 
}) {
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
    <Background bgIndex={2}>
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          height: 100%;
        }

        .layout-viewport {
          position: fixed;
          inset: 0;
          overflow: hidden;
        }

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

        .layout-stage {
          width: 1060px;
          height: 720px;
          position: absolute;
          top: 52%;
          left: 50%;
          transform: translate(-50%, -50%) scale(${zoom});
          transform-origin: top center;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 42px 24px 32px;
        }

        .layout-gameframe {
          width: 100%;
          max-width: 500px;
          margin-bottom: 10px;
        }

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
        <aside className="layout-sidebar">
          <UserProfile
            player="1P"
            characterDesc="요양보호사"
            isLeader
            isMe={me === '1P'}
            {...(onProfileClick ? {
              onClick: () => onProfileClick('1P'),
              style: { cursor: 'pointer' },
            } : {})}
          />
          <UserProfile
            player="2P"
            characterDesc="노모 L"
            isMe={me === '2P'}
            {...(onProfileClick ? {
              onClick: () => onProfileClick('2P'),
              style: { cursor: 'pointer' },
            } : {})}
          />
          <UserProfile
            player="3P"
            characterDesc="자녀 J"
            isMe={me === '3P'}
            {...(onProfileClick ? {
              onClick: () => onProfileClick('3P'),
              style: { cursor: 'pointer' },
            } : {})}
          />
        </aside>

        <section className="layout-stage">
          <div className="layout-gameframe">
            <GameFrame
              topic={
                round != null
                  ? `Round ${round.toString().padStart(2, '0')} : ${subtopic}`
                  :  `${subtopic}`
              }
              hideArrows
            />
          </div>
          {children}
        </section>
      </div>
    </Background>
  );
}
