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
import { translations } from '../utils/language/index';

export default function CreateRoom2({ onClose }) {
  const lang = localStorage.getItem('app_lang') || 'ko';
  const t = translations?.[lang]?.CreateRoom || {};

  const [isPublic, setIsPublic] = useState(false); // 기본은 비공개

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [hoveredTopic, setHoveredTopic] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    if (!selectedTopic) return;
  
    const title = `${selectedTopic}`;
    const description = t.apiDesc ? t.apiDesc(selectedTopic) : `AI 윤리 주제 중 '${selectedTopic}'에 대한 토론`;
    const topic = selectedTopic;
  
    try {
      setLoading(true);
      
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
      
      navigate('/waitingroom', { state: { topic } });
  
    } catch (err) {
      console.error(' 방 생성 또는 입장 실패:', err);
      console.error('응답 메시지:', err.response?.data);

      alert(t.errorAlert || '방 생성 또는 입장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getFrameSrc = (topic) => {
    if (selectedTopic === topic) return mainTopicActive;
    if (hoveredTopic === topic) return mainTopicHover;
    return mainTopicDefault;
  };

  if (!t.title) return null;

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
        {t.title}
      </div>
      <div style={{ color: Colors.grey05, marginBottom: 32 }}>
        {t.subtitle}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
        {(t.topics || []).map((topic) => (
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

      {/* [추가] 시나리오 버튼과 방 만들기 버튼 사이의 안내 문구 */}
      <div 
        style={{ 
          color: Colors.grey05, 
          fontSize: '14px', 
          textAlign: 'center', 
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          marginBottom: 32 
        }}
      >
        {t.guidance}
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
        {loading ? t.loading : t.entering}
      </PrimaryButton>
    </div>
  );
}