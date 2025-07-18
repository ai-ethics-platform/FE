export function resolveParagraphs(rawParagraphs, mateName) {
    const replaceHomeMate = (text) => {
      return text?.replace(/HomeMate/gi, mateName); 
    };
  
    return rawParagraphs.map((para) => ({
      ...para,
      ...(para.main && { main: replaceHomeMate(para.main) }),
      ...(para.sub && { sub: replaceHomeMate(para.sub) }),
    }));
  }
  