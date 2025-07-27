function hasFinalConsonant(kor) {
  const lastChar = kor[kor.length - 1];
  const code = lastChar.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return false;
  const jong = (code - 0xAC00) % 28;
  return jong !== 0;
}

function attachJosa(name, pattern) {
  const final = hasFinalConsonant(name);
  switch (pattern) {
    case '은/는': return name + (final ? '은' : '는');
    case '이/가': return name + (final ? '이' : '가');
    case '을/를': return name + (final ? '을' : '를');
    case '과/와': return name + (final ? '과' : '와');
    default: return name; // fallback
  }
}

export function resolveParagraphs(rawParagraphs, mateName) {
  const replaceHomeMate = (text) => {
    if (!text) return '';
    return text
      .replace(/Homemate\(([^)]+)\)/g, (_, pattern) => attachJosa(mateName, pattern))  // 조사 패턴 치환
      .replace(/Homemate/g, mateName); // 일반적 텍스트 치환
  };

  return rawParagraphs.map((para) => ({
    ...para,
    ...(para.main && { main: replaceHomeMate(para.main) }),
    ...(para.sub && { sub: replaceHomeMate(para.sub) }),
  }));
}

