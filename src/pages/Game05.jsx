import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox';
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

export default function Game05() {
  const navigate = useNavigate();
  const { isConnected, sessionId, sendMessage } = useWebSocket();
  const { isInitialized: webrtcInitialized } = useWebRTC();
  const { isHost, sendNextPage } = useHostActions();
  useWebSocketNavigation(navigate, { nextPagePath: '/game05_1', infoPath: '/game05_1' });
  
  const [connectionStatus, setConnectionStatus] = useState({
    websocket: false,
    webrtc: false,
    ready: false
  });
  
  useEffect(() => {
    const newStatus = {
      websocket: isConnected,
      webrtc: webrtcInitialized,
      ready: isConnected && webrtcInitialized
    };
    setConnectionStatus(newStatus);
    console.log('🔧 [Game05] 연결 상태 업데이트:', newStatus);
  }, [isConnected, webrtcInitialized]);
  

  const handleContinue = () => {
    if (!connectionStatus.ready) {
      console.warn('⚠️ [Game05] 연결이 완전하지 않음:', connectionStatus);
      alert('연결 상태를 확인하고 다시 시도해주세요.');
      return;
    }
  
    if (!isHost) {
      alert('⚠️ 방장만 진행할 수 있습니다.');
      return;
    }
  
    const success = sendNextPage();
    if (success) {
      console.log('📤 [Game05] next_page 브로드캐스트 전송 성공');
    } else {
      console.error('❌ [Game05] next_page 브로드캐스트 전송 실패');
      alert('페이지 이동 신호 전송에 실패했습니다.');
    }
  };

  const [mateName, setMateName] = useState('');
  const [paragraphs, setParagraphs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openProfile, setOpenProfile] = useState(null);
  const [round, setRound] = useState(1);

  const mainTopic     = localStorage.getItem('category');
  const subtopic      = localStorage.getItem('subtopic');
  const mode          = localStorage.getItem('mode');
  const selectedIndex = Number(localStorage.getItem('selectedCharacterIndex') ?? 0);
  const comicImages   = getDilemmaImages(mainTopic, subtopic, mode, selectedIndex);
  const rawParagraphs = paragraphsData[mainTopic]?.[subtopic]?.[mode] || [];
  const roomCode      = localStorage.getItem('room_code');

  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const calculatedRound = completed.length + 1;
    setRound(calculatedRound);
    localStorage.setItem('currentRound', calculatedRound.toString());
  }, []);

  useEffect(() => {
    const fetchMateName = async () => {
      try {
        const response = await axiosInstance.get('/rooms/ai-name', { params: { room_code: roomCode } });
        const aiName = response.data.ai_name;
        setMateName(aiName);
        setParagraphs(resolveParagraphs(rawParagraphs, aiName));
      } catch (err) {
        console.error('[Game05] mateName API 실패:', err);
        const fallback = 'HOMEMATE';
        setMateName(fallback);
        setParagraphs(resolveParagraphs(rawParagraphs, fallback));
      }
    };
    fetchMateName();
  }, [mainTopic, subtopic, mode, roomCode, rawParagraphs]);

 

  return (
    <>
      {openProfile && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}
          onClick={() => setOpenProfile(null)}
        >
          <div style={{ position: 'relative', background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 12px 30px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <img src={profileImages[openProfile]} alt={`Profile ${openProfile}`} style={{ width: 360, height: 'auto', display: 'block' }} />
            <img src={closeIcon} alt="close" style={{ position: 'absolute', top: 24, right: 24, width: 40, height: 40, cursor: 'pointer' }} onClick={() => setOpenProfile(null)} />
          </div>
        </div>
      )}

      <Layout subtopic={subtopic} round={round} onProfileClick={setOpenProfile}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
          <img src={comicImages[currentIndex]} alt={`comic ${currentIndex + 1}`} style={{ width: 760, height: 'auto', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          <div style={{ width: '100%', maxWidth: 900 }}>
            <ContentTextBox disabled={!isHost} paragraphs={paragraphs} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} onContinue={handleContinue} />
          </div>
        </div>
      </Layout>
    </>
  );
}
