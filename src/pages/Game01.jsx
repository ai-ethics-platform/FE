import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox';

import character1 from '../assets/images/Char1.jpg';
import character2 from '../assets/images/Char2.jpg';
import character3 from '../assets/images/Char3.jpg';

export default function Game01() {
  const navigate = useNavigate();
  const images = [character1, character2, character3];

  const mateName = localStorage.getItem('mateName');
  const subtopic = localStorage.getItem('subtopic');

  const [round, setRound] = useState(1);

  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const nextRound = completed.length + 1; 
    setRound(nextRound);
    localStorage.setItem('currentRound', nextRound.toString()); 
  }, []);

  const paragraphs = [
    {
      main:
        `  지금부터 여러분은 ${mateName}를 사용하게 된 사용자입니다.\n` +
        `  다양한 장소에서 ${mateName}를 어떻게 사용하는지 함께 논의하고 결정할 것입니다.`,
    },
  ];

  return (
    <Layout round={round} subtopic={subtopic} me="1P">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 24,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {images.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`Character ${idx + 1}`}
              style={{
                width: 264,
                height: 360,
                objectFit: 'cover',
                borderRadius: 4,
              }}
            />
          ))}
        </div>
        <div style={{ width: '100%', maxWidth: 900 }}>
          <ContentTextBox
            paragraphs={paragraphs}
            onContinue={() => navigate('/character_description1')}
          />
        </div>
      </div>
    </Layout>
  );
}
