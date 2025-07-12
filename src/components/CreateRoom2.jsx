import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import closeIcon from '../assets/close.svg';
import PrimaryButton from './PrimaryButton';
import { Colors, FontStyles } from './styleConstants';

import mainTopicDefault from '../assets/maintopicframedefault.svg';
import mainTopicHover from '../assets/maintopicframehover.svg';
import mainTopicActive from '../assets/maintopicframe.svg';

const topics = ['안드로이드', '자율 무기 시스템'];

export default function CreateRoom({ onClose }) {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [hoveredTopic, setHoveredTopic] = useState(null);
  const navigate = useNavigate();

  const handleClick = () => {
    localStorage.setItem('category', selectedTopic);
    if (selectedTopic) {
      navigate('/waitingroom', { state: { topic: selectedTopic } });
    }
  };

  const getFrameSrc = (topic) => {
    if (selectedTopic === topic) return mainTopicActive;
    if (hoveredTopic === topic) return mainTopicHover;
    return mainTopicDefault;
  };

  return (
    <div
      style={{
        width: 552,
        height: 548,
        justifyContent: 'center',
        backgroundColor: Colors.componentBackgroundFloat,
        borderRadius: 12,
        padding: 32,
        position: 'relative',
        ...FontStyles.body,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <img
        src={closeIcon}
        alt="close"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          width: 40,
          height: 40,
          cursor: 'pointer',
        }}
      />

      <div style={{ ...FontStyles.headlineNormal, color: Colors.brandPrimary, marginBottom: 8 }}>
        방 만들기
      </div>
      <div style={{ color: Colors.grey05, marginBottom: 32 }}>
        이번 게임에서 플레이할 주제를 선택해 주세요.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
        {topics.map((topic) => (
          <div
            key={topic}
            onClick={() => setSelectedTopic(topic)}
            onMouseEnter={() => setHoveredTopic(topic)}
            onMouseLeave={() => setHoveredTopic(null)}
            style={{
              width: 360,
              height: 72,
              position: 'relative',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={getFrameSrc(topic)}
              alt="frame"
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            />
            <div style={{ zIndex: 1, ...FontStyles.body, color: selectedTopic === topic ? Colors.grey01 : Colors.grey06 }}>
              {topic}
            </div>
          </div>
        ))}
      </div>

      <PrimaryButton
        disabled={!selectedTopic}
        onClick={handleClick}
        style={{
          width: 168,
          height: 72,
          opacity: selectedTopic ? 1 : 0.4,
        }}
      >
        입장하기
      </PrimaryButton>
    </div>
  );
}
