import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import GameMapFrame from '../components/GameMapFrame';

import homeIcon from '../assets/homeIcon.svg';
import aiIcon from '../assets/aiIcon.svg';
import internationalIcon from '../assets/internationalIcon.svg';

export default function GameMap() {
  const navigate = useNavigate();

  const subtopic = '라운드 선택';
  const round = Number(localStorage.getItem('currentRound') ?? 1);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleSelect = (subtopic) => {
    const category = localStorage.getItem('category') || '안드로이드';
    const mode = 'neutral';

    localStorage.setItem('category', category);
    localStorage.setItem('subtopic', subtopic);
    localStorage.setItem('mode', mode);

    navigate('/game01', {
      state: { category, subtopic, mode },
    });
  };

  const completedTopics = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
  const isCompleted = (name) => completedTopics.includes(name);

  const getUnlockedOptions = () => {
    const unlocked = new Set(['가정 1']); 

    if (isCompleted('가정 1')) {
      unlocked.add('가정 2');
      unlocked.add('국가 인공지능 위원회 1');
    }
    if (isCompleted('국가 인공지능 위원회 1')) {
      unlocked.add('국가 인공지능 위원회 2');
      unlocked.add('국제 인류 발전 위원회 1');
    }

    return unlocked;
  };

  const unlockedOptions = getUnlockedOptions();

  const createOption = (text) => ({
    text,
    disabled: !unlockedOptions.has(text),
    onClick: () => handleSelect(text),
  });

  return (
    <Layout subtopic={subtopic} round={round} me="1P">
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 8,
          marginLeft: 60,
          marginTop: 12,
        }}
      >
        <GameMapFrame
          icon={homeIcon}
          title="가정"
          option1={createOption('가정 1')}
          option2={createOption('가정 2')}
        />

        <GameMapFrame
          icon={aiIcon}
          title="국가 인공지능 위원회"
          option1={createOption('국가 인공지능 위원회 1')}
          option2={createOption('국가 인공지능 위원회 2')}
        />

        <GameMapFrame
          icon={internationalIcon}
          title="국제 인류발전 위원회"
          option1={createOption('국제 인류 발전 위원회 1')}
        />
      </div>
    </Layout>
  );
}
