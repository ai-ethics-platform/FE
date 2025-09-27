import React from 'react';
import closeIcon from '../assets/close.svg';
import SecondaryButton from './SecondaryButton';
import { FontStyles, Colors } from './styleConstants';
import { useNavigate } from 'react-router-dom';

export default function ResultPopup({ onClose }) {
  const navigate = useNavigate();

  // const completedTopics = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');

  // const allRequired = [
  //   'AI의 개인 정보 수집',
  //   '아이들을 위한 서비스',
  //   '지구, 인간, AI',
  // ];

  // const optionalTopics = [
  //   { label: '안드로이드의 감정 표현', value: '안드로이드의 감정 표현' },
  //   { label: '설명 가능한 AI', value: '설명 가능한 AI' },
  // ];

  // const unplayedOptions = optionalTopics.filter(
  //   (opt) => !completedTopics.includes(opt.value)
  // );
  const completedTopics = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
  const category = localStorage.getItem('category') ?? '';

  const allRequired = category === '자율 무기 시스템'
    ? ['AI 알고리즘 공개', '사람이 죽지 않는 전쟁', 'AWS 규제']
    : ['AI의 개인 정보 수집', '아이들을 위한 서비스', '지구, 인간, AI'];

  const optionalTopics =
    category === '자율 무기 시스템'
      ? [
          { label: 'AWS의 권한', value: 'AWS의 권한' },
          { label: 'AI의 권리와 책임', value: 'AI의 권리와 책임' },
        ]
      : [
          { label: '안드로이드의 감정 표현', value: '안드로이드의 감정 표현' },
          { label: '설명 가능한 AI', value: '설명 가능한 AI' },
        ];

  const unplayedOptions = optionalTopics.filter(
    (opt) => !completedTopics.includes(opt.value)
  );

  const handleGoToSubtopic = (subtopic) => {
    localStorage.setItem('subtopic', subtopic);
    localStorage.setItem('mode', 'neutral');
    navigate('/game02');
  };

  return (
    <div
      style={{
        width: 552,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: '40px 32px',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
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
          width: 24,
          height: 24,
          cursor: 'pointer',
        }}
      />

      <div
        style={{
          ...FontStyles.headlineSmall,
          color: Colors.brandPrimary,
          textAlign: 'center',
          lineHeight: '1.5',
          marginBottom: 24,
        }}
      >
        아직 플레이하지 않은 라운드가 있습니다.
        <br />
        이대로 결과를 볼까요?
      </div>

      {unplayedOptions.map((opt) => (
        <SecondaryButton
          key={opt.value}
          style={{
            width: 360,
            height: 72,
            justifyContent: 'center',
            marginBottom: 12,
          }}
          onClick={() => handleGoToSubtopic(opt.value)}
        >
          {opt.label}
        </SecondaryButton>
      ))}

      <div style={{ marginTop: 20 }}>
        <SecondaryButton
          style={{
            width: 168,
            height: 72,
            justifyContent: 'center',
            marginBottom: 12,
          }}
          onClick={() => navigate('/game08')}
        >
          결과 보기
        </SecondaryButton>
      </div>
    </div>
  );
}