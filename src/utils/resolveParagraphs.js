export function resolveParagraphs(rawParagraphs, mateName) {
    const replaceHomeMate = (text) => {
      return text?.replace(/HomeMate/gi, mateName); // ✅ 대소문자 무시하고 모두 바꾸기
    };
  
    return rawParagraphs.map((para) => ({
      ...para,
      ...(para.main && { main: replaceHomeMate(para.main) }),
      ...(para.sub && { sub: replaceHomeMate(para.sub) }),
    }));
  }
  