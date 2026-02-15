
// ✅ Vite 빌드 시 이미지가 제대로 포함되도록 import.meta.glob 사용
// eager: true로 빌드 타임에 모든 이미지를 번들에 포함
const allImages = import.meta.glob('../assets/images/*_dilemma_*.jpg', { 
  eager: true,
  import: 'default' // ✅ 중요: default export만 가져오기
});

// Safari 디버깅용: 로드된 이미지 확인
console.log('📦 import.meta.glob 로드된 이미지 개수:', Object.keys(allImages).length);
if (Object.keys(allImages).length === 0) {
  console.error('❌ 이미지가 하나도 로드되지 않았습니다!');
  console.error('💡 빌드 환경에서는 이미지가 번들에 포함되지 않았을 수 있습니다.');
} else {
  console.log('✅ 샘플 이미지 키:', Object.keys(allImages).slice(0, 3));
  const firstEntry = Object.entries(allImages)[0];
  console.log('✅ 첫 번째 이미지 구조:', {
    key: firstEntry[0],
    value: firstEntry[1],
    valueType: typeof firstEntry[1],
    isString: typeof firstEntry[1] === 'string',
  });
}

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
  const prefix = topicPrefixes[category] || 'Android';
  const base = subtopicToBaseIndex[subtopic] || 1;
  const offset = modeToOffset[mode] || 0;
  const index = base + offset;

  console.log('🔍 getDilemmaImages 호출:', { category, subtopic, mode, selectedCharacterIndex, prefix, base, offset, index });

  return Array.from({ length: 4 }).map((_, i) => {
    const baseName = `${prefix}_dilemma_${index}_${i + 1}`;
    const suffix = selectedCharacterIndex > 0 ? `(${selectedCharacterIndex + 1})` : '';
    const filename = `${baseName}${suffix}.jpg`;

    const entry = Object.entries(allImages).find(([key]) => key.includes(filename));
    
    if (!entry) {
      console.warn(`❌ 이미지 누락: ${filename}`, {
        prefix,
        index,
        selectedCharacterIndex,
        찾는파일: filename,
      });
      console.log('📦 사용 가능한 이미지 키 샘플:', Object.keys(allImages).filter(k => k.includes(prefix)).slice(0, 5));
      return null;
    }
    
    // ✅ import: 'default' 옵션 사용 시 entry[1]이 직접 URL 문자열
    // 옵션 없이 사용 시 entry[1].default가 URL
    const imageUrl = typeof entry[1] === 'string' ? entry[1] : entry[1]?.default;
    
    if (!imageUrl) {
      console.error(`❌ 이미지 URL 추출 실패: ${filename}`, {
        entryValue: entry[1],
        entryType: typeof entry[1],
      });
      return null;
    }
    
    console.log(`✅ 이미지 로드: ${filename} →`, imageUrl.substring(0, 80));
    
    return imageUrl;
  }).filter(Boolean);
}
