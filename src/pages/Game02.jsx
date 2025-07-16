// pages/Game02.js
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
import { fetchWithAutoToken } from '../utils/fetchWithAutoToken';

import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';
import voiceManager from '../utils/voiceManager';

const profileImages = { '1P': profile1Img, '2P': profile2Img, '3P': profile3Img };

export default function Game02() {
  const navigate = useNavigate();
  // next_page 수신 시 게임3로 이동, info도 동일하게 처리
  useWebSocketNavigation(navigate, { nextPagePath: '/game03', infoPath: '/game03' });

  const { isHost, sendNextPage } = useHostActions();

  const category = localStorage.getItem('category') ?? '안드로이드';
  const subtopic = localStorage.getItem('subtopic') ?? '가정 1';
  const mode = localStorage.getItem('mode') ?? 'neutral';
  const selectedIndex = Number(localStorage.getItem('selectedCharacterIndex') || 0);
  const roomCode = localStorage.getItem('room_code');

  const comicImages = getDilemmaImages(category, subtopic, mode, selectedIndex);
  const rawParagraphs = paragraphsData[category]?.[subtopic]?.[mode] || [];

  const [mateName, setMateName] = useState('');
  const [paragraphs, setParagraphs] = useState([]);
  const [round, setRound] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openProfile, setOpenProfile] = useState(null);

  // 라운드 & AI 이름
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const nextRound = completed.length + 1;
    setRound(nextRound);
    localStorage.setItem('currentRound', nextRound.toString());

    const stored = localStorage.getItem('mateName');
    if (stored) setMateName(stored);
    else (async () => {
      try {
        await fetchWithAutoToken();
        const { data } = await axiosInstance.get('/rooms/ai-name', { params: { room_code: roomCode } });
        setMateName(data.ai_name);
      } catch (e) { console.error(e); }
    })();
  }, [roomCode]);

  // mateName 반영
  useEffect(() => {
    if (mateName) {
      setParagraphs(resolveParagraphs(rawParagraphs, mateName));
    }
  }, [mateName, rawParagraphs]);

  // Continue 버튼: 호스트면 next_page 전송, 아니면 경고
  const handleContinue = () => {
    if (isHost) {
      sendNextPage();
    } else {
      alert('⚠️ 방장만 진행할 수 있습니다.');
    }
  };
  


  // WebSocket 연결이 열리면 녹음 시작
  useEffect(() => {
    if (!isConnected) return;     // 연결 전엔 아무것도 안 함

    console.log('🟢 WS 연결됨, 이제 녹음 시작 요청');
    if (voiceManager.startRecordingOnServer()) {
      voiceManager.startRecording();
    }
  }, [isConnected]);
  

  return (
    <>
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

      <Layout subtopic={subtopic} me="3P" round={round} onProfileClick={setOpenProfile}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
          <img
            src={comicImages[currentIndex]}
            alt={`comic ${currentIndex + 1}`}
            style={{ width: 760, height: 'auto', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />

          <div style={{ width: '100%', maxWidth: 900 }}>
            <ContentTextBox
              paragraphs={paragraphs}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              onContinue={handleContinue}
            />
          </div>
        </div>
      </Layout>
    </>
  );
}