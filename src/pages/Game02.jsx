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
import { fetchWithAutoToken } from '../utils/fetchWithAutoToken';

import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';
import { useWebRTC } from '../WebRTCProvider';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';

const profileImages = { '1P': profile1Img, '2P': profile2Img, '3P': profile3Img };

export default function Game02() {
  const navigate = useNavigate();
  useWebSocketNavigation(navigate, { nextPagePath: '/game03', infoPath: '/game03' });
  const { isHost, sendNextPage } = useHostActions();

  // 로컬 설정
  const category = localStorage.getItem('category') ?? '안드로이드';
  const subtopic = localStorage.getItem('subtopic') ?? '가정 1';
  const mode = localStorage.getItem('mode') ?? 'neutral';
  const selectedIndex = Number(localStorage.getItem('selectedCharacterIndex') || 0);
  const roomCode = localStorage.getItem('room_code');

  const comicImages = getDilemmaImages(category, subtopic, mode, selectedIndex);
  const rawParagraphs = paragraphsData[category]?.[subtopic]?.[mode] || [];

  // AI 이름 & 라운드
  const [mateName, setMateName] = useState('');
  const [paragraphs, setParagraphs] = useState([]);
  const [round, setRound] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openProfile, setOpenProfile] = useState(null);

  // WebRTC 음성 상태
  const { voiceSessionStatus, roleUserMapping, myRoleId: rtcRole } = useWebRTC();
  const { getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);
  const getVoiceState = (role) => {
    if (String(role) === rtcRole) {
      return {
        is_speaking: voiceSessionStatus.isSpeaking,
        is_mic_on: voiceSessionStatus.isConnected,
        nickname: voiceSessionStatus.nickname || ''
      };
    }
    return getVoiceStateForRole(role);
  };

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
        await fetchWithAutoToken();
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

  // Continue
  const handleContinue = () => {
    if (isHost) sendNextPage();
    else alert('⚠️ 방장만 진행할 수 있습니다.');
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
              setCurrentIndex={setCurrentIndex}
              onContinue={handleContinue}
            />
          </div>
        </div>
      </Layout>
    </>
  );
}
