import React from 'react';
import closeIcon from '../assets/close.svg';
import SecondaryButton from './SecondaryButton';
import { FontStyles, Colors } from './styleConstants';
import { useNavigate } from 'react-router-dom';

//  다국어 지원 임포트
import { translations } from '../utils/language/index';

export default function ResultPopup({ onClose }) {
  const navigate = useNavigate();

  //  언어 설정 및 언어팩 로드
  const lang = localStorage.getItem('app_lang') || 'ko';
  const t = translations?.[lang]?.ResultPopup || {};
  const t_map = translations?.[lang]?.GameMap || {};
  const t_ko_map = translations?.['ko']?.GameMap || {}; // 기준 데이터인 한국어 맵

  const completedTopics = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
  const category = localStorage.getItem('category') ?? '';

  //  영문 텍스트/키를 한국어 원문으로 변환하는 안정화 함수 (이중 매칭)
  const getStableText = (text) => {
    if (lang === 'ko') return text;
    const key = Object.keys(t_map).find(k => t_map[k] === text);
    if (key && t_ko_map[key]) return t_ko_map[key];
    return text;
  };

  // 카테고리 판별 로직 (확장형 구조 지향) 
  const isAWS = category === '자율 무기 시스템' || category === t_map.categoryAWS || category === t_ko_map.categoryAWS;

  const allRequired = isAWS
    ? [t_map.awsOption1_1, t_map.awsOption2_1, t_map.awsOption3_1]
    : [t_map.andOption1_1, t_map.andOption2_1, t_map.andOption3_1];

  // 옵션 리스트 구성 (라벨은 번역, 밸류는 한국어 원문 유지) 
  const optionalTopics = isAWS
    ? [
        { label: t_map.awsOption1_2 || 'AWS의 권한', value: t_ko_map.awsOption1_2 || 'AWS의 권한' },
        { label: t_map.awsOption2_2 || 'AI의 권리와 책임', value: t_ko_map.awsOption2_2 || 'AI의 권리와 책임' },
      ]
    : [
        { label: t_map.andOption1_2 || '안드로이드의 감정 표현', value: t_ko_map.andOption1_2 || '안드로이드의 감정 표현' },
        { label: t_map.andOption2_2 || '설명 가능한 AI', value: t_ko_map.andOption2_2 || '설명 가능한 AI' },
      ];

  const unplayedOptions = optionalTopics.filter(
    (opt) => !completedTopics.includes(opt.value)
  );

  const getTitleForSubtopic = (cat, subtopic) => {
    // 내부 비교 시 항상 한국어 원문(Stable)으로 비교 
    const stableSubtopic = getStableText(subtopic);
    
    const titleByCategory = {
      안드로이드: {
        'AI의 개인 정보 수집': '가정',
        '안드로이드의 감정 표현': '가정',
        '아이들을 위한 서비스': '국가 인공지능 위원회',
        '설명 가능한 AI': '국가 인공지능 위원회',
        '지구, 인간, AI': '국제 인류 발전 위원회',
      },
      '자율 무기 시스템': {
        'AI 알고리즘 공개': '주거, 군사 지역',
        'AWS의 권한': '주거, 군사 지역',
        '사람이 죽지 않는 전쟁': '국가 인공지능 위원회',
        'AI의 권리와 책임': '국가 인공지능 위원회',
        'AWS 규제': '국제 인류 발전 위원회',
      },
    };

    // [중요] 카테고리 명칭도 유연하게 대응
    const catKey = (cat === '자율 무기 시스템' || cat === t_map.categoryAWS || cat === t_ko_map.categoryAWS) 
      ? '자율 무기 시스템' 
      : '안드로이드';

    return titleByCategory?.[catKey]?.[stableSubtopic] ?? '';
  };

  const handleGoToSubtopic = (stableValue) => {
    // 로컬 스토리지에는 항상 한국어 원본을 저장하여 로직 일관성 유지 
    localStorage.setItem('subtopic', stableValue);
    const title = getTitleForSubtopic(category, stableValue);
    if (title) localStorage.setItem('title', title);
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
        {t.titleMain || '아직 플레이하지 않은 라운드가 있습니다.'}
        <br />
        {t.titleSub || '이대로 결과를 볼까요?'}
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
          {t.viewResult || '결과 보기'}
        </SecondaryButton>
      </div>
    </div>
  );
}