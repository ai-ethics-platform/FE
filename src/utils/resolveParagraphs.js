
// export function resolveParagraphs(rawParagraphs, mateName) {
//   const replaceHomeMate = (text) => {
//     if (!text) return '';
//     return text
//       .replace(/Homemate\(([^)]+)\)/g, (_, pattern) => attachJosa(mateName, pattern))
//       .replace(/Homemate/g, mateName);
//   };

//   return rawParagraphs.map((para) => ({
//     ...para,
//     ...(para.main && { main: replaceHomeMate(para.main) }),
//     ...(para.sub && { sub: replaceHomeMate(para.sub) }),
//   }));
// }

export function hasFinalConsonant(kor) {
  const trimmed = String(kor ?? '').trim();
  if (!trimmed) return false;

  const lastChar = trimmed[trimmed.length - 1];
  const code = lastChar.charCodeAt(0);

  // 한글 범위 체크
  if (code >= 0xAC00 && code <= 0xD7A3) {
    const jong = (code - 0xAC00) % 28;
    return jong !== 0;
  }

  // 영어 받침 규칙 (자음으로 끝나는 경우)
  if (/[a-zA-Z]$/.test(trimmed)) {
    const lastLetter = lastChar.toLowerCase();
    // 영어 모음(a, e, i, o, u, y) → 받침 없음 → '를'
    return !/[aeiouy]$/.test(lastLetter);
  }

  return false;
}

export function attachJosa(name, pattern) {
  const trimmed = String(name ?? '').trim();
  if (!trimmed) return '';

  // 현재 언어 설정 확인
  const lang = localStorage.getItem('app_lang') || 'ko';

  // 한국어(ko)를 제외한 모든 언어에서는 조사가 붙지 않도록 무력화
  if (lang !== 'ko') {
    return trimmed;
  }

  const final = hasFinalConsonant(trimmed);

  switch (pattern) {
    case '은/는': return trimmed + (final ? '은' : '는');
    case '이/가': return trimmed + (final ? '이' : '가');
    case '을/를': return trimmed + (final ? '을' : '를');
    case '과/와': return trimmed + (final ? '과' : '와');
    default: return trimmed;
  }
}

export function resolveParagraphs(rawParagraphs, mateName) {
  const category = localStorage.getItem('category') || '';

  const replaceDynamic = (text) => {
    if (!text) return '';

    // 1. 표준 태그 치환 ({{mateName}} 및 조사 태그)
    // - {{mateName}}을 실제 설정된 이름으로 변경
    // - {{eunNeun}} 등의 태그를 이름의 받침에 맞는 조사로 변경
    text = text.replace(/{{mateName}}/g, mateName);
    text = text.replace(/{{eunNeun}}/g, attachJosa(mateName, '은/는').replace(mateName, ''));
    text = text.replace(/{{iGa}}/g, attachJosa(mateName, '이/가').replace(mateName, ''));
    text = text.replace(/{{eulReul}}/g, attachJosa(mateName, '을/를').replace(mateName, ''));
    text = text.replace(/{{gwaWa}}/g, attachJosa(mateName, '과/와').replace(mateName, ''));

    if (category === '안드로이드') {
      // Homemate → mateName
      text = text.replace(/Homemate\(([^)]+)\)/g, (_, pattern) =>
        attachJosa(mateName, pattern)
      );
      text = text.replace(/Homemate/g, mateName);
    }

    if (category === '자율 무기 시스템') {
      text = text.replace(/자율\s*무기\s*시스템\s*\(AWS\)\(([^)]+)\)/g, (_, pattern) =>
        attachJosa(mateName, pattern)
      );
      text = text.replace(/ARIA\(([^)]+)\)/g, (_, pattern) =>
        attachJosa(mateName, pattern)
      );
      text = text.replace(/TALOS\(([^)]+)\)/g, (_, pattern) =>
        attachJosa(mateName, pattern)
      );

      // 기본 치환
      text = text.replace(/자율\s*무기\s*시스템\s*\(AWS\)/g, mateName);
      text = text.replace(/ARIA/g, mateName);
      text = text.replace(/TALOS/g, mateName);
    }
    
    return text;
  };

  return rawParagraphs.map((para) => ({
    ...para,
    ...(para.main && { main: replaceDynamic(para.main) }),
    ...(para.sub && { sub: replaceDynamic(para.sub) }),
  }));
}