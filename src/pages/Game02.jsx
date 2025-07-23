// pages/Game02.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox';
import UserProfile from '../components/Userprofile';
import closeIcon from '../assets/close.svg';

import { getDilemmaImages } from '../components/dilemmaImageLoader';
import { paragraphsData } from '../components/paragraphs';
import { resolveParagraphs } from '../utils/resolveParagraphs';

import profile1Img from '../assets/images/CharacterPopUp1.png';
import profile2Img from '../assets/images/CharacterPopUp2.png';
import profile3Img from '../assets/images/CharacterPopUp3.png';

import axiosInstance from '../api/axiosInstance';
import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider';
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';


const profileImages = { '1P': profile1Img, '2P': profile2Img, '3P': profile3Img };

export default function Game02() {
  const navigate = useNavigate();

  const { isConnected, sessionId, sendMessage } = useWebSocket();
  const { voiceSessionStatus, isInitialized: webrtcInitialized } = useWebRTC();
  const { isHost, sendNextPage } = useHostActions();
  useWebSocketNavigation(navigate, { nextPagePath: '/game03', infoPath: '/game03' });
   const [connectionStatus, setConnectionStatus] = useState({
    websocket: false,
    webrtc: false,
    ready: false
  });


  // 로컬 설정
  const category = localStorage.getItem('category') ?? '안드로이드';
  const subtopic = localStorage.getItem('subtopic') ?? '가정 1';
  const mode = localStorage.getItem('mode') ?? 'neutral';
  const selectedIndex = Number(localStorage.getItem('selectedCharacterIndex')) || 0;  
  const roomCode = localStorage.getItem('room_code');

  const comicImages = getDilemmaImages(category, subtopic, mode, selectedIndex);
  const rawParagraphs = paragraphsData[category]?.[subtopic]?.[mode] || [];

  // AI 이름 & 라운드
  const [mateName, setMateName] = useState('');
  const [paragraphs, setParagraphs] = useState([]);
  const [round, setRound] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openProfile, setOpenProfile] = useState(null);
  
  useEffect(() => {
    const newStatus = {
      websocket: isConnected,
      webrtc: webrtcInitialized,
      ready: isConnected && webrtcInitialized
    };
    setConnectionStatus(newStatus);
  
    console.log('🔧 [Game02] 연결 상태 업데이트:', newStatus);
  }, [isConnected, webrtcInitialized]);
  
  
  // 라운드 설정 및 AI 이름 조회
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const nextRound = completed.length + 1;
    setRound(nextRound);
    localStorage.setItem('currentRound', String(nextRound));

    const stored = localStorage.getItem('mateName');
    if (stored) setMateName(stored);
    else (async () => {
      try {
        const { data } = await axiosInstance.get('/rooms/ai-name', { params: { room_code: roomCode } });
        setMateName(data.ai_name);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [roomCode]);

  // mateName 반영
  useEffect(() => {
    if (mateName) setParagraphs(resolveParagraphs(rawParagraphs, mateName));
  }, [mateName, rawParagraphs]);

  const handleContinue = () => {
    if (!connectionStatus.ready) {
      console.warn('⚠️ [Game02] 연결이 완전하지 않음:', connectionStatus);
      alert('연결 상태를 확인하고 다시 시도해주세요.');
      return;
    }
  
    if (!isHost) {
      alert('⚠️ 방장만 진행할 수 있습니다.');
      return;
    }
  
    const success = sendNextPage();
    if (success) {
      console.log('📤 [Game02] next_page 브로드캐스트 전송 성공');
    } else {
      console.error('❌ [Game02] next_page 브로드캐스트 전송 실패');
      alert('페이지 이동 신호 전송에 실패했습니다.');
    }
  };
  

  return (
    <>
      {/* 프로필 팝업 */}
      {openProfile && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}
          onClick={() => setOpenProfile(null)}
        >
          <div
            style={{ position: 'relative', background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 12px 30px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}
          >
            <img src={profileImages[openProfile]} alt={`Profile ${openProfile}`} style={{ width: 360 }} />
            <img
              src={closeIcon}
              alt="close"
              style={{ position: 'absolute', top: 24, right: 24, width: 40, height: 40, cursor: 'pointer' }}
              onClick={() => setOpenProfile(null)}
            />
          </div>
        </div>
      )}

      <Layout subtopic={subtopic} round={round} onProfileClick={setOpenProfile}>
      <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '12px',
          borderRadius: '6px',
          fontSize: '11px',
          zIndex: 1000,
          fontFamily: 'monospace'
        }}>
          <div>🔍 연결 상태</div>
          <div>WebSocket: {connectionStatus.websocket ? '✅' : '❌'}</div>
          <div>WebRTC: {connectionStatus.webrtc ? '✅' : '❌'}</div>
          <div>전체: {connectionStatus.ready ? '✅ Ready' : '⚠️ Not Ready'}</div>
        </div>

        {/* 본문 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
          <img
            src={comicImages[currentIndex]}
            alt={`comic ${currentIndex + 1}`}
            style={{ width: 760, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <div style={{ width: '100%', maxWidth: 900 }}>
            <ContentTextBox
              paragraphs={paragraphs}
              currentIndex={currentIndex}
              disabled={!isHost}
              setCurrentIndex={setCurrentIndex}
              onContinue={handleContinue}
            />
          </div>
        </div>
      </Layout>
    </>
  );
}
