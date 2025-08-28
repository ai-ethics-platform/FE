import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import closeIcon from '../assets/close.svg';
import PrimaryButton from './PrimaryButton';
import { Colors, FontStyles } from './styleConstants';
import RoomTypeToggle from './RoomTypeToggle';

import mainTopicDefault from '../assets/maintopicframedefault.svg';
import mainTopicHover from '../assets/maintopicframehover.svg';
import mainTopicActive from '../assets/maintopicframe.svg';
import axiosInstance from '../api/axiosInstance';

const topics = ['안드로이드','자율 무기 시스템'];

export default function CreateRoom2({ onClose }) {
  const [isPublic, setIsPublic] = useState(false); // 기본은 비공개

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [hoveredTopic, setHoveredTopic] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    if (!selectedTopic) return;
  
    const title = `${selectedTopic}`;
    const description = `AI 윤리 주제 중 '${selectedTopic}'에 대한 토론`;
    const topic = selectedTopic;
  
    try {
      setLoading(true);
  
      //  1단계: 방 생성
      // const response = await axiosInstance.post('/rooms/create/private', {
      //   title,
      //   description,
      //   topic,
      //   allow_random_matching: true

      // });
      const endpoint = isPublic ? '/rooms/create/public' : '/rooms/create/private';
      const response = await axiosInstance.post(endpoint, {
        title,
        description,
        topic,
        allow_random_matching: !!isPublic,
      });
      
      const roomCode = response.data.room.room_code;
      localStorage.setItem('room_code', roomCode);
      localStorage.setItem('category', topic);
      console.log(" 방 생성 성공 room_code:", roomCode);
      
      //  3단계: 대기방으로 이동
      navigate('/waitingroom', { state: { topic } });
  
    } catch (err) {
      console.error(' 방 생성 또는 입장 실패:', err);
      console.error('응답 메시지:', err.response?.data);  // <-- 여기에 오류 메시지 나옴

      alert('방 생성 또는 입장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
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
      <RoomTypeToggle isPublic={isPublic} setIsPublic={setIsPublic} />

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
        disabled={!selectedTopic || loading}
        onClick={handleCreateRoom}
        style={{
          width: 168,
          height: 72,
          opacity: selectedTopic ? 1 : 0.4,
        }}
      >
        {loading ? '로딩 중...' : '입장하기'}
      </PrimaryButton>
    </div>
  );
}
