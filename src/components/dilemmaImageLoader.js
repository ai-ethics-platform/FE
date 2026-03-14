import { translations } from '../utils/language/index';

// ✅ Vite 빌드 시 모든 이미지를 번들에 포함 (eager: true)
const allImages = import.meta.glob('../assets/images/*_dilemma_*.jpg', { 
  eager: true,
  import: 'default' 
});

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

/**
 * 카테고리, 서브토픽, 모드에 따른 딜레마 이미지 4장을 반환합니다.
 */
export function getDilemmaImages(category, subtopic, mode = 'neutral', selectedCharacterIndex = 0) {
  const lang = localStorage.getItem('app_lang') || 'ko';
  const t_map = translations[lang]?.GameMap || {};
  const t_ko_map = translations['ko']?.GameMap || {};

  const categoryMap = {
    'Android': '안드로이드',
    'Autonomous Weapon Systems': '자율 무기 시스템'
  };
  const stableCategory = categoryMap[category] || category;

  
  let stableSubtopic = subtopic;
  const subtopicKey = Object.keys(t_map).find(key => t_map[key] === subtopic);
  if (subtopicKey && t_ko_map[subtopicKey]) {
    stableSubtopic = t_ko_map[subtopicKey];
  }

  // 데이터 조회용 변수 계산
  const prefix = topicPrefixes[stableCategory] || 'Android';
  const base = subtopicToBaseIndex[stableSubtopic] || 1;
  const offset = modeToOffset[mode] || 0;
  const index = base + offset;

  // 4. 이미지 배열 생성 및 반환
  return Array.from({ length: 4 }).map((_, i) => {
    const baseName = `${prefix}_dilemma_${index}_${i + 1}`;
    const suffix = selectedCharacterIndex > 0 ? `(${selectedCharacterIndex + 1})` : '';
    const filename = `${baseName}${suffix}.jpg`;

    // 이미지 뭉치에서 파일명 포함 여부 확인
    const entry = Object.entries(allImages).find(([path]) => path.includes(filename));
    if (!entry) {
      console.warn(`⚠️ 이미지 누락: ${filename} (Category: ${stableCategory}, Subtopic: ${stableSubtopic})`);
      return null;
    }
    
    // URL 추출 (Vite 설정에 따라 문자열이거나 .default 객체일 수 있음)
    return typeof entry[1] === 'string' ? entry[1] : entry[1]?.default;
  }).filter(Boolean); // null 값(이미지 누락 시) 제거
}