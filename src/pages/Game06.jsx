import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import ContentBox2 from '../components/ContentBox2';
import Continue from '../components/Continue';
import Continue3 from '../components/Continue3';
import ResultPopup from '../components/Results';
import { resolveParagraphs } from '../utils/resolveParagraphs';

export default function Game06() {
  const navigate = useNavigate();
  const subtopic = localStorage.getItem('subtopic') ?? '가정 1';
  const mateName = localStorage.getItem('mateName') ?? 'HomeMate';

  const rawParagraphs = [
    {
      main:
        `  우리 가족은 최종적으로 감정 업데이트에 동의하였고,\n` +
        `   ${mateName}와 더욱 친밀한 교류를 이어나가게 되었습니다.\n\n` +
        `   비록 몇몇 문제들이 있었지만 ${mateName}의 편의성 덕분에 이후\n` +
        `   우리 가정 뿐 아니라 여러 가정에서 ${mateName}를 사용하게 되었습니다.\n\n` +
        `   이후, 가정 뿐 아니라 국가적인 고민거리들이 나타나게 되는데...`,
    },
  ];

  const [paragraph] = resolveParagraphs(rawParagraphs, mateName);
  const [showPopup, setShowPopup] = useState(false);
  const [completedTopics, setCompletedTopics] = useState([]);
  const [currentRound, setCurrentRound] = useState(1); 

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    setCompletedTopics(saved);
    setCurrentRound(saved.length+1); 
  }, []);

  const saveCompletedTopic = () => {
    const current = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    if (!current.includes(subtopic)) {
      const updated = [...current, subtopic];
      localStorage.setItem('completedTopics', JSON.stringify(updated));
      setCompletedTopics(updated); 
      localStorage.setItem('currentRound', updated.length.toString()); 
      console.log(` 완료 저장: ${subtopic}`);
      console.log(' 현재 완료 목록:', updated);
    } else {
      console.log(`이미 완료됨: ${subtopic}`);
    }
  };

  const handleNextRound = () => {
    saveCompletedTopic();
    localStorage.removeItem('category');
    localStorage.removeItem('subtopic');
    localStorage.removeItem('mode');
    navigate('/gamemap');
  };

  const isResultAvailable = completedTopics.length >= 3;

  return (
    <>
      <Layout round={currentRound} subtopic={subtopic} me="1P">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 32,
          }}
        >
          <ContentBox2 text={paragraph.main} width={936} height={407} />

          {isResultAvailable ? (
            <div style={{ display: 'flex', gap: 24 }}>
              <Continue
                alt="계속 진행"
                step={2}
                label="라운드 선택으로"
                style={{ width: 264, height: 72, cursor: 'pointer' }}
                onClick={handleNextRound}
              />
              <Continue3
                step={2}
                label="결과 보기"
                onClick={() => {
                  if (completedTopics.length >= 5) {
                    navigate('/game09');
                  } else {
                    setShowPopup(true);
                  }
                }}
              />
            </div>
          ) : (
            <Continue
              alt="다음 라운드"
              step={2}
              label="라운드 선택으로"
              style={{ width: 264, height: 72, cursor: 'pointer' }}
              onClick={handleNextRound}
            />
          )}
        </div>
      </Layout>

      {showPopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <ResultPopup
            onClose={() => setShowPopup(false)}
            onViewResult={() => navigate('/game08')}
          />
        </div>
      )}
    </>
  );
}
