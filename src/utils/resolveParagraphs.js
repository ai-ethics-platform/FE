function hasFinalConsonant(kor) {
  const lastChar = kor[kor.length - 1];
  const code = lastChar.charCodeAt(0);

  // 한글 범위 체크
  if (code >= 0xAC00 && code <= 0xD7A3) {
    const jong = (code - 0xAC00) % 28;
    return jong !== 0;
  }

  // 영어 받침 규칙 (자음으로 끝나는 경우)
  if (/[a-zA-Z]$/.test(kor)) {
    const lastLetter = lastChar.toLowerCase();
    // 영어 모음(a, e, i, o, u, y) → 받침 없음 → '를'
    return !/[aeiouy]$/.test(lastLetter);
  }

  return false;
}

function attachJosa(name, pattern) {
  const final = hasFinalConsonant(name);

  switch (pattern) {
    case '은/는': return name + (final ? '은' : '는');
    case '이/가': return name + (final ? '이' : '가');
    case '을/를': return name + (final ? '을' : '를');
    case '과/와': return name + (final ? '과' : '와');
    default: return name;
  }
}

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

export function resolveParagraphs(rawParagraphs, mateName) {
  const category = localStorage.getItem('category') || '';

  const replaceDynamic = (text) => {
    if (!text) return '';

    if (category === '안드로이드') {
      // Homemate → mateName
      text = text.replace(/Homemate\(([^)]+)\)/g, (_, pattern) =>
        attachJosa(mateName, pattern)
      );
      text = text.replace(/Homemate/g, mateName);
    }

    if (category === '자율 무기 시스템') {
      // 조사 붙은 경우
      text = text.replace(/자율\s*무기\s*시스템\s*\(AWS\)\(([^)]+)\)/g, (_, pattern) =>
        attachJosa(mateName, pattern)
      );
    
      // 기본 치환
      text = text.replace(/자율\s*무기\s*시스템\s*\(AWS\)/g, mateName);
    }
    

    return text;
  };

  return rawParagraphs.map((para) => ({
    ...para,
    ...(para.main && { main: replaceDynamic(para.main) }),
    ...(para.sub && { sub: replaceDynamic(para.sub) }),
  }));
}
