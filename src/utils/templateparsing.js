// function parseFinalMentByDashes(input) {
//     if (!input) return {};
  
//     const ZWS_RE = /[\u200B-\u200D\uFEFF]/g;
//     const s = String(input || '')
//       .replace(/\r/g, '\n')
//       .replace(/\\n/g, '\n')
//       // ✅ 다양한 dash + 공백 + non-breaking space 대응
//       .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D\u00A0]/g, '-')
//       .replace(ZWS_RE, '')
//       .trim();
  
//     // ✅ 공백, en-dash, em-dash, nbsp 등 모두 허용
//     const pattern =
//       /(?:^|\n)[\s\u00A0]*[-–—]{1,2}[\s\u00A0]*선택지[\s\u00A0]*(\d+)[\s\u00A0]*최종[\s\u00A0]*선택[\s\u00A0]*[:：][\s\u00A0]*(.+?)(?=\n[\s\u00A0]*[-–—]{1,2}[\s\u00A0]*선택지|\s*$)/gmsu;
  
//     const out = {};
//     for (const match of s.matchAll(pattern)) {
//       const num = match[1];
//       const text = (match[2] || '')
//         .replace(/^["“”'‘’]+|["“”'‘’]+$/gu, '')
//         .trim();
//       if (num === '1') out.agreeEnding = text;
//       if (num === '2') out.disagreeEnding = text;
//     }
  
//     return out;
//   }
function parseFinalMentByDashes(input) {
    if (!input) return {};
    const ZWS_RE = /[\u200B-\u200D\uFEFF]/g;
    let s = String(input || '')

      .replace(/\r?\n/g, '\n')                  // ✅ 일관된 개행
      .replace(/\\n/g, '\n')                    // ✅ 이스케이프 줄바꿈 제거
      .replace(/\u00A0/g, ' ')                  // ✅ non-breaking space 제거
      .replace(/\uFF0D/g, '-')                  // ✅ fullwidth dash 정규화
      .replace(/\uFEFF/g, '')                   // ✅ BOM 제거
      .replace(ZWS_RE, '')
      .trim();

   const pattern =
      /[-–—]{1,2}[\s\u00A0]*선택지[\s\u00A0]*(\d+)[\s\u00A0]*최종[\s\u00A0]*선택[\s\u00A0]*[:：][\s\u00A0“”"'‘’]*([\s\S]*?)(?=--\s*선택지|\s*$)/gmsu;

    const out = {};
    for (const match of s.matchAll(pattern)) {
      const num = match[1];
      const text = (match[2] || '')
        .replace(/^["“”'‘’]+|["“”'‘’]+$/gu, '')
        .trim();
      if (num === '1') out.agreeEnding = text;
      if (num === '2') out.disagreeEnding = text;
    }
    return out;
  }
  
  // ---------- 본문 파서 ----------
  export function parseDilemmaText(text) {
    const out = {
      opening: [],
      char1: '',
      char2: '',
      char3: '',
      charDes1: '',
      charDes2: '',
      charDes3: '',
      dilemma_situation: [],
      question: '',
      choice1: '',
      choice2: '',
      flips_agree_texts: [],
      flips_disagree_texts: [],
      agreeEnding: '',
      disagreeEnding: '',
    };
  
    const T = (text || '')
      .replace(/\r/g, '')
      .replace(/\\n/g, '\n')
      .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212\uFF0D]/g, '-');
  
    const splitSentences = (block) => {
      if (!block) return [];
      const m = block.match(/[^.!?。…\n]+[.!?。…]?/g);
      if (!m) return [];
      return m.map((s) => s.trim()).filter(Boolean);
    };
  
    const getSection = (headerRe) => {
      const NEXT = String.raw`(?=\n\s*(?:#{1,6}\s*)?(?:🎬\s*오프닝\s*멘트|🎭\s*역할|🎯\s*상황\s*및\s*딜레마\s*질문|✅?\s*선택지\s*1|✅?\s*선택지\s*2|🌀\s*최종\s*멘트|$))`;
      const re = new RegExp(
        String.raw`(?:^|\n)\s*(?:#{1,6}\s*)?${headerRe}\s*([\s\S]*?)${NEXT}`,
        'u'
      );
      const m = T.match(re);
      return m ? (m[1] || '').trim() : '';
    };
  
    const stripQuotes = (s) => (s || '').replace(/^[‘’“”'"`]+|[‘’“”'"`]+$/g, '').trim();
  
    // A. 오프닝
    out.opening = splitSentences(getSection(String.raw`(?:A\.\s*)?🎬\s*오프닝\s*멘트`));
  
    // B. 역할
    {
      const sec = getSection(String.raw`(?:B\.\s*)?🎭\s*역할`);
      if (sec) {
        const lines = sec.split(/\n+/u).map((s) => s.trim()).filter(Boolean);
  
        const bulletRoleRe = /^-{1,3}\s*['"]?(.+?)['"]?\s*:\s*(.+)$/u;
        const bulletRoles = [];
        for (const ln of lines) {
          const m = ln.match(bulletRoleRe);
          if (m) {
            const name = stripQuotes(m[1]);
            const desc = m[2].trim();
            if (name) bulletRoles.push({ name, desc });
          }
        }
  
        let roles = bulletRoles.slice(0, 3);
        if (roles.length < 3) {
          const blocks = sec.split(/\n{2,}/u).map((b) => b.trim()).filter(Boolean);
          for (const b of blocks) {
            if (roles.length >= 3) break;
            const blines = b.split(/\n+/).map((x) => x.trim()).filter(Boolean);
            if (!blines.length) continue;
  
            const mInline = blines[0].match(bulletRoleRe);
            if (mInline) {
              const name = stripQuotes(mInline[1]);
              const desc = (mInline[2] + ' ' + blines.slice(1).join(' ')).trim();
              if (name) roles.push({ name, desc });
              continue;
            }
  
            let name = blines[0].replace(/^[•*\-\d.\s]+/, '').trim();
            name = stripQuotes(name);
            const desc = blines.slice(1).join(' ').trim();
            if (name) roles.push({ name, desc });
          }
        }
  
        if (roles[0]) {
          out.char1 = roles[0].name;
          out.charDes1 = roles[0].desc;
        }
        if (roles[1]) {
          out.char2 = roles[1].name;
          out.charDes2 = roles[1].desc;
        }
        if (roles[2]) {
          out.char3 = roles[2].name;
          out.charDes3 = roles[2].desc;
        }
      }
    }
  
    // C. 상황 + 질문
    {
      const sec = getSection(String.raw`(?:C\.\s*)?🎯\s*상황\s*및\s*딜레마\s*질문`);
      if (sec) {
        const rawLines = sec.replace(/\r/g, '').split('\n');
        const lines = rawLines.map((s) => s.trim()).filter((l) => l.length > 0);
  
        const colonIdx = lines.findIndex((l) => /^질문\s*[:：]\s*/u.test(l));
        if (colonIdx >= 0) {
          const sameLine = lines[colonIdx].replace(/^질문\s*[:：]\s*/u, '').trim();
          let q = sameLine;
          if (!q) {
            const nxt = lines.slice(colonIdx + 1).find((l) => l.length > 0);
            if (nxt) q = nxt.trim();
          }
          out.question = q || '';
  
          const toRemove = new Set([colonIdx]);
          if (!sameLine && lines[colonIdx + 1]) toRemove.add(colonIdx + 1);
          const remain = lines.filter((_, i) => !toRemove.has(i)).join('\n');
          out.dilemma_situation = splitSentences(remain);
        } else {
          const qIdx = lines.findIndex((l) => /[?？]\s*$/.test(l));
          if (qIdx >= 0) {
            out.question = lines[qIdx].trim();
            const remain = lines.filter((_, i) => i !== qIdx).join('\n');
            out.dilemma_situation = splitSentences(remain);
          } else {
            out.dilemma_situation = splitSentences(sec);
            out.question = '';
          }
        }
      }
    }
  
    // D. 선택지1
    {
      const m = T.match(
        /(?:^|\n)\s*(?:#{1,6}\s*)?✅?\s*선택지\s*1\s*:\s*([^\n]+)\n([\s\S]*?)(?=\n\s*(?:✅?\s*선택지\s*2|🌀\s*최종|$))/u
      );
      if (m) {
        out.choice1 = (m[1] || '').trim();
        const block = m[2] || '';
        const f = block.match(/📎?\s*플립\s*자료\s*:\s*([\s\S]*)/u);
        const texts = (f ? f[1] : block).trim();
        out.flips_agree_texts = splitSentences(texts);
      } else {
        const titleOnly = T.match(/(?:^|\n)\s*(?:#{1,6}\s*)?✅?\s*선택지\s*1\s*:\s*([^\n]+)/u);
        if (titleOnly) out.choice1 = titleOnly[1].trim();
      }
    }
  
    // E. 선택지2
    {
      const m = T.match(
        /(?:^|\n)\s*(?:#{1,6}\s*)?✅?\s*선택지\s*2\s*:\s*([^\n]+)\n([\s\S]*?)(?=\n\s*(?:🌀\s*최종|$))/u
      );
      if (m) {
        out.choice2 = (m[1] || '').trim();
        const block = m[2] || '';
        const f = block.match(/📎?\s*플립\s*자료\s*:\s*([\s\S]*)/u);
        const texts = (f ? f[1] : block).trim();
        out.flips_disagree_texts = splitSentences(texts);
      } else {
        const titleOnly = T.match(/(?:^|\n)\s*(?:#{1,6}\s*)?✅?\s*선택지\s*2\s*:\s*([^\n]+)/u);
        if (titleOnly) out.choice2 = titleOnly[1].trim();
      }
    }
  
    // F. 최종 멘트
    {
      const fin = getSection(String.raw`(?:F\.\s*)?🌀\s*최\s*종\s*멘\s*트?`);
      if (fin) {
        const ed = parseFinalMentByDashes(fin);
        if (ed.agreeEnding) out.agreeEnding = ed.agreeEnding;
        if (ed.disagreeEnding) out.disagreeEnding = ed.disagreeEnding;
      }
    }
  
    return out;
  }
  
export function persistParsedToLocalStorage(text) {
    localStorage.setItem('debug_raw_finalText', text);
  
    const m = text.match(/[-–—]{1,2}[\s\u00A0]*선택지\s*1[\s\S]*?(?=[-–—]{1,2}[\s\u00A0]*선택지\s*2)/u);
    if (m) {
      const agreeRaw = m[0].replace(/^--\s*선택지1\s*최종선택[:：]?\s*/m, '').trim();
      localStorage.setItem('agreeEnding', agreeRaw);
    } else {
      localStorage.setItem('agreeEnding', '');
    }
  
    const m2 = text.match(/[-–—]{1,2}[\s\u00A0]*선택지\s*2[\s\S]*$/u);
        if (m2) {
      const disagreeRaw = m2[0].replace(/^--\s*선택지2\s*최종선택[:：]?\s*/m, '').trim();
      localStorage.setItem('disagreeEnding', disagreeRaw);
    } else {
      localStorage.setItem('disagreeEnding', '');
    }
  
    const p = parseDilemmaText(text);
  
    if (Array.isArray(p.opening) && p.opening.length) {
      localStorage.setItem('opening', JSON.stringify(p.opening));
    } else {
      localStorage.removeItem('opening');
    }
  
    localStorage.setItem('char1', p.char1 || '');
    localStorage.setItem('char2', p.char2 || '');
    localStorage.setItem('char3', p.char3 || '');
    localStorage.setItem('charDes1', p.charDes1 || '');
    localStorage.setItem('charDes2', p.charDes2 || '');
    localStorage.setItem('charDes3', p.charDes3 || '');
  
    localStorage.setItem('dilemma_situation', JSON.stringify(p.dilemma_situation || []));
    localStorage.setItem('question', p.question || '');
    localStorage.setItem('agree_label', p.choice1 || '');
    localStorage.setItem('disagree_label', p.choice2 || '');
    localStorage.setItem('flips_agree_texts', JSON.stringify(p.flips_agree_texts || []));
    localStorage.setItem('flips_disagree_texts', JSON.stringify(p.flips_disagree_texts || []));
    if (p.agreeEnding) localStorage.setItem('agreeEnding', p.agreeEnding);
    if (p.disagreeEnding) localStorage.setItem('disagreeEnding', p.disagreeEnding);
  }