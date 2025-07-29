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

export function resolveParagraphs(rawParagraphs, mateName) {
  const replaceHomeMate = (text) => {
    if (!text) return '';
    return text
      .replace(/Homemate\(([^)]+)\)/g, (_, pattern) => attachJosa(mateName, pattern))
      .replace(/Homemate/g, mateName);
  };

  return rawParagraphs.map((para) => ({
    ...para,
    ...(para.main && { main: replaceHomeMate(para.main) }),
    ...(para.sub && { sub: replaceHomeMate(para.sub) }),
  }));
}
