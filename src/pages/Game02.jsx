// src/pages/Game02.jsx
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

const profileImages = { '1P': profile1Img, '2P': profile2Img, '3P': profile3Img };

export default function Game02() {
  const navigate = useNavigate();
  // localStorage에서 불러오기
  const category = localStorage.getItem('category') ?? '안드로이드';
  const subtopic = localStorage.getItem('subtopic') ?? '가정 1';
  const mode = localStorage.getItem('mode') ?? 'neutral';

  const selectedIndex = Number(localStorage.getItem('selectedCharacterIndex') ?? 0);
  const comicImages = getDilemmaImages(category, subtopic, mode, selectedIndex);

  const rawParagraphs = paragraphsData[category]?.[subtopic]?.[mode] || [];
  const mateName = localStorage.getItem('mateName') || 'HOMEMATE';
  const paragraphs = resolveParagraphs(rawParagraphs, mateName);
  const [round, setRound] = useState(1); // 라운드 상태

  const [currentIndex, setCurrentIndex] = useState(0);
  const [openProfile, setOpenProfile] = useState(null);

  const handleContinue = () => {
    navigate('/game03', {
      state: { agreement: null, confidence: 0 },
    });
  };
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const calculatedRound = completed.length + 1;
    setRound(calculatedRound);
    localStorage.setItem('currentRound', calculatedRound.toString()); // 보조용 저장
  }, []);

  console.log('[Paragraphs 확인]', { category, subtopic, mode });
  console.log('[rawParagraphs]', rawParagraphs);

  return (
    <>
      {openProfile && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
          }}
          onClick={() => setOpenProfile(null)}
        >
          <div
            style={{
              position: 'relative',
              background: '#fff',
              padding: 32,
              borderRadius: 12,
              boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={profileImages[openProfile]}
              alt={`Profile ${openProfile}`}
              style={{ width: 360, height: 'auto' }}
            />
            <img
              src={closeIcon}
              alt="close"
              style={{
                position: 'absolute',
                top: 24,
                right: 24,
                width: 40,
                height: 40,
                cursor: 'pointer',
              }}
              onClick={() => setOpenProfile(null)}
            />
          </div>
        </div>
      )}

      <Layout subtopic={subtopic} me="3P" round={round} onProfileClick={(playerId) => setOpenProfile(playerId)}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
        }}>
          <img
            src={comicImages[currentIndex]}
            alt={`comic ${currentIndex + 1}`}
            style={{
              width: 760,
              height: 'auto',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
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
