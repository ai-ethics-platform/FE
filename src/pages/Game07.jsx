import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import ContentBox2 from '../components/ContentBox2';
import Continue from '../components/Continue';
import Continue3 from '../components/Continue3';
import ResultPopup from '../components/Results';
import { resolveParagraphs } from '../utils/resolveParagraphs';

export default function Game07() {
  const navigate = useNavigate();
  const subtopic = localStorage.getItem('subtopic') ?? '가정 1';
  const mateName = localStorage.getItem('mateName') ?? 'HomeMate';

  const rawParagraphs = [
    {
      main:
        '  우리 가족은 최종적으로 개인정보 제공에 동의하지 않았고, 서비스 관련 약간의 불편함은 있으나 가족의 사생활을 보호하는 것에 만족하였습니다. \n\n우리 가족의 생활을 위해 여러분은 어떤 가치를 택하고, 무엇을 포기했나요?'
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
            //  결과 보기 조건 충족: 계속 진행 + 결과 보기
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
                  saveCompletedTopic(); // 결과 보기 전에도 저장
                  setShowPopup(true);
                }}
              />
            </div>
          ) : (
            // ❗아직 3개 미만: 다음 라운드로만 이동
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

      {/* 결과 보기 팝업 */}
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
