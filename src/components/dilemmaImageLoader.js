
const allImages = import.meta.glob('../assets/images/*_dilemma_*.jpg', { eager: true });

const topicPrefixes = {
  '안드로이드': 'Android',
  '자율 무기 시스템': 'Killer',
};

const subtopicToBaseIndex = {
  '가정 1': 1,
  '가정 2': 4,
  '국가 인공지능 위원회 1': 7,
  '국가 인공지능 위원회 2': 10,
  '국제 인류 발전 위원회 1': 13,
};

const modeToOffset = {
  neutral: 0,
  agree: 1,
  disagree: 2,
};

export function getDilemmaImages(category, subtopic, mode = 'neutral', selectedCharacterIndex = 0) {
  const prefix = topicPrefixes[category] || 'Android';
  const base = subtopicToBaseIndex[subtopic] || 1;
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
