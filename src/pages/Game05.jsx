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

const profileImages = { '1P': profile1Img, '2P': profile2Img, '3P': profile3Img };

export default function Game05() {
  const navigate = useNavigate();
  // WebSocket navigation: next_page/info → Game05_01
  useWebSocketNavigation(navigate, { nextPagePath: '/game05_1', infoPath: '/game05_1' });
  const { isHost, sendNextPage } = useHostActions();

  const [mateName, setMateName] = useState('');
  const [paragraphs, setParagraphs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openProfile, setOpenProfile] = useState(null);
  const [round, setRound] = useState(1);

  const mainTopic     = localStorage.getItem('category') ?? '안드로이드';
  const subtopic      = localStorage.getItem('subtopic') ?? '가정 1';
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
        await fetchWithAutoToken();
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

  // Handle Continue: host only sends next_page
  const handleContinue = () => {
    if (isHost) {
      sendNextPage();
    } else {
      alert('⚠️ 방장만 진행할 수 있습니다.');
    }
  };

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
            <ContentTextBox paragraphs={paragraphs} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} onContinue={handleContinue} />
          </div>
        </div>
      </Layout>
    </>
  );
}
