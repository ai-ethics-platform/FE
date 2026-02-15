import { translations } from '../utils/language/index';

const allImages = import.meta.glob('../assets/images/*_dilemma_*.jpg', { eager: true });

const topicPrefixes = {
  '안드로이드': 'Android',
  '자율 무기 시스템': 'Killer',
};

const subtopicToBaseIndex = {
  'AI의 개인 정보 수집': 1,
  '안드로이드의 감정 표현': 4,
  '아이들을 위한 서비스': 7,
  '설명 가능한 AI': 10,
  '지구, 인간, AI': 13,

  'AI 알고리즘 공개': 1,
  'AWS의 권한': 4,
  '사람이 죽지 않는 전쟁': 7,
  'AI의 권리와 책임': 10,
  'AWS 규제': 13,
};

const modeToOffset = {
  neutral: 0,
  agree: 1,
  disagree: 2,
};

export function getDilemmaImages(category, subtopic, mode = 'neutral', selectedCharacterIndex = 0) {
  // 현재 언어팩 로드
  const lang = localStorage.getItem('app_lang') || 'ko';
  const t_map = translations[lang]?.GameMap || {};
  const t_ko_map = translations['ko']?.GameMap || {};

  // 1. 카테고리 정규화 (어떤 언어든 한국어 원문으로 변환)
  let stableCategory = category;
  if (category === 'Android' || category === t_map.categoryAndroid) {
    stableCategory = '안드로이드';
  } else if (category === 'Autonomous Weapon Systems' || category === t_map.categoryAWS) {
    stableCategory = '자율 무기 시스템';
  }

  // 2. 주제(subtopic) 정규화
  let stableSubtopic = subtopic;
  // 현재 입력된 subtopic이 어떤 '키(Key)'인지 찾아서 한국어 원문으로 치환
  const subtopicKey = Object.keys(t_map).find(key => t_map[key] === subtopic);
  if (subtopicKey && t_ko_map[subtopicKey]) {
    stableSubtopic = t_ko_map[subtopicKey];
  }

  // 정규화된 stableCategory와 stableSubtopic을 사용하여 데이터 조회
  const prefix = topicPrefixes[stableCategory] || 'Android';
  const base = subtopicToBaseIndex[stableSubtopic] || 1;
  const offset = modeToOffset[mode] || 0;
  const index = base + offset;

  return Array.from({ length: 4 }).map((_, i) => {
    const baseName = `${prefix}_dilemma_${index}_${i + 1}`;
    const suffix = selectedCharacterIndex > 0 ? `(${selectedCharacterIndex + 1})` : '';
    const filename = `${baseName}${suffix}.jpg`;

    const entry = Object.entries(allImages).find(([key]) => key.includes(filename));
    if (!entry) {
      console.warn(`이미지 누락: ${filename}`);
    }
    return entry?.[1]?.default;
  }).filter(Boolean);
}