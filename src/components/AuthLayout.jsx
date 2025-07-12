import React, { useEffect, useState } from 'react';
import Background from '../components/Background';

export default function AuthLayout({ children }) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const wRatio = window.innerWidth / 1280;
      const hRatio = window.innerHeight / 720;
      const scale = Math.min(wRatio, hRatio, 1);
      setZoom(scale);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Background bgIndex={1}>
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: hidden;
        }
        /* 전체 뷰포트 */
        .auth-viewport {
          position: fixed;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }
        /* 1280×720 캔버스 */
        .auth-root {
          width: 1280px;
          height: 720px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform-origin: top left;
        }
        /* 반응형(너비 ≤1024px일 때) */
        @media (max-width: 1024px) {
          .auth-root {
            width: 100%;
            height: auto;
            transform: none !important;
            top: 0;
            left: 0;
          }
        }
      `}</style>

      <div className="auth-viewport">
        <div
          className="auth-root"
          style={{
            transform: `translate(-50%, -50%) scale(${zoom})`,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </Background>
  );
}
