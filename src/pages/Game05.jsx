//API 연결 후 다수결 선택에 따른 agree, disagre 속성 로컬 스토리지에 저장 후 그거에 따른 이미지 가져오는 로직 수정 필요 
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
export default function Game05() {
  const navigate = useNavigate();

  const [mateName, setMateName] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openProfile, setOpenProfile] = useState(null);

  // round 동기화
  const [round, setRound] = useState(1);
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const calculatedRound = completed.length + 1;
    setRound(calculatedRound);
    localStorage.setItem('currentRound', calculatedRound.toString());
  }, []);

  const mainTopic = localStorage.getItem('category') ?? '안드로이드';
  const subtopic = localStorage.getItem('subtopic') ?? '가정 1';

  // 다수결 결과를 기반으로 agree/disagree 판단
  const mode = 'agree'; // 실제 적용 시에는 localStorage.getItem('agreement') 등으로 변경
  const selectedIndex = Number(localStorage.getItem('selectedCharacterIndex') ?? 0);

  useEffect(() => {
    const storedName = localStorage.getItem('mateName');
    if (storedName) setMateName(storedName);

    console.log('[Game05] mainTopic:', mainTopic);
    console.log('[Game05] subtopic:', subtopic);
    console.log('[Game05] mode:', mode);
  }, []);

  const comicImages = getDilemmaImages(mainTopic, subtopic, mode, selectedIndex);
  const rawParagraphs = paragraphsData[mainTopic]?.[subtopic]?.[mode] || [];
  const paragraphs = resolveParagraphs(rawParagraphs, mateName);

  const handleContinue = () => {
    navigate('/game05_01', {
      state: { agreement: mode, confidence: 0 },
    });
  };
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
              style={{ width: 360, height: 'auto', display: 'block' }}
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
{/* 누가 방장인지에 대한 로직 필요  */}
      <Layout
        subtopic={subtopic}
        me="3P"
        round= {round}
        onProfileClick={(playerId) => setOpenProfile(playerId)}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 32,
          }}
        >
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
