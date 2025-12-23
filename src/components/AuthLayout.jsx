import React, { useEffect, useState } from 'react';
import Background from '../components/Background';

export default function AuthLayout({ children }) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const wRatio = window.innerWidth / 1280;
      const hRatio = window.innerHeight / 800; // 여백 고려
      const scale = Math.min(wRatio, hRatio, 1);
      setZoom(Math.max(scale, 0.6)); // 최소 60% 크기 보장
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
          overflow: auto; /* 스크롤 허용 */
        }
        /* 1280×720 캔버스 */
        .auth-root {
          width: 1280px;
          min-height: 720px;
          height: auto;
          position: relative;
          transform: scale(${zoom});
          transform-origin: center center;
          margin: 40px auto;
        }
        /* 반응형(너비 ≤1024px일 때) */
        @media (max-width: 1024px) {
          .auth-root {
            width: 100%;
            max-width: 1280px;
            transform: scale(${zoom});
            margin: 20px auto;
          }
        }
      `}</style>

      <div className="auth-viewport">
        <div className="auth-root">
          <div
            style={{
              width: '100%',
              height: '100%',
              minHeight: '720px',
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
