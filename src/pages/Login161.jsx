
import React from 'react';
import { Link } from 'react-router-dom';
import Background from '../components/Background';
import Frame1 from '../components/Frame1';

// 중앙 레이아웃 스타일
const containerStyle = {
  position: 'relative',
  width: '100vw',
  height: '50vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  overflow: 'hidden',
};

// 카페24 어스퀘어 Air 폰트를 사용한 태그라인
const taglineStyle = {
  fontFamily: "'Cafe24 Ohsquare Air', 'Cafe24Ohsquareair', sans-serif",
  fontWeight: 600,
  letterSpacing: 0,
  margin: 0,
  textAlign: 'center',
  fontSize: 'clamp(16px, 1.5vw, 32px)',
};

export default function LoginPage() {
  return (
    <Background bgIndex={1}>
      <div style={containerStyle}>
        {/* 태그라인 */}
        <p style={taglineStyle}>AI 윤리 시뮬레이션 게임</p>
        {/* 로고 */}
        <Frame1 />

        {/* 개발 확인용 링크 (배포 전 삭제) */}
        <Link
          to="/componentcheck"
          style={{
            marginTop: 24,
            padding: '6px 12px',
            background: '#455A64',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: 6,
          }}
        >
          COMP CHECK
        </Link>
      </div>
    </Background>
  );
}
