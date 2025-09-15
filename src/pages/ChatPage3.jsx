// 챗봇 결과 "한 박스 붙여넣기" + 파싱/이미지/템플릿 생성
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreatorLayout from '../components/Expanded/CreatorLayout';
import CustomInput from '../components/Expanded/CustomInput';
import Continue from '../components/Expanded/CreateContinue';
import { Colors, FontStyles } from '../components/styleConstants';
import axiosInstance from '../api/axiosInstance';
import Continue3 from '../components/Expanded/CreateContinue';

// ---------- 유틸 ----------
const STORAGE_FINAL_TEXT = 'finalText';
const IMG_STYLE =
  '작은 텍스트라도 영어 및 한국어 포함 모든 텍스트금지. 귀여운 2D 벡터 카툰, 둥근 모서리 프레임, 두꺼운 외곽선, 파스텔톤 평면 채색, 약한 그림자, 단순한 배경(공원/교실/도로), 과장된 표정, 말풍선에는 기호만(?, !), 사진/리얼/3D/과도한 질감/텍스트 금지. 가장 중요한 점 : 텍스트 절대 금지';

const readJSON = (key, fallback = []) => {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch {
    return fallback;
  }
};
const trim1 = (s, max = 200) => (s || '').replace(/\s+/g, ' ').slice(0, max);
// ---------- 최종 멘트 파서 ( -- 블록 기준 ) ----------
function parseFinalMentByDashes(input) {
    const ZWS_RE = /[\u200B-\u200D\uFEFF]/g;
    let s = String(input || '')
      .replace(/\r/g, '')
      .replace(/\\n/g, '\n')   // ★ 리터럴 개행을 실제 개행으로
      .replace(/\uFF0D/g, '-') // 전각 하이픈 보정
      .replace(ZWS_RE, '')
      .trim();
  
    const dashRE = /^\s*--\s+/gm;
    const m1 = dashRE.exec(s);
    const m2 = dashRE.exec(s);
  
    const out = {};
    if (!m1) return out;
  
    const agreeChunk = m2 ? s.slice(m1.index, m2.index) : s.slice(m1.index);
    const disagreeChunk = m2 ? s.slice(m2.index) : '';
  
    const toOneLine = (chunk) => {
      if (!chunk) return '';
      const body = chunk.replace(/^\s*--\s+/, '');
      const lines = body.split('\n');
  
      const first = (lines[0] || '').trim();
      const titleMatch = first.match(/최\s*종\s*선\s*택\s*[:：]\s*(.*)$/u);
      const title = titleMatch ? titleMatch[1].trim() : first;
  
      const rest = lines.slice(1).join(' ').trim();
      const clean = (txt) => txt
        .split('\n')
        .map(l => l
          .replace(/^\s*(?:--|-|•|\*|\d+\.)\s*/u, '')
          .replace(/^["“”'‘’]+|["“”'‘’]+$/gu, '')
          .trim()
        )
        .filter(Boolean)
        .join(' ');
  
      return clean([title, rest].filter(Boolean).join(' '));
    };
  
    const agree = toOneLine(agreeChunk);
    if (agree) out.agreeEnding = agree;
  
    const disagree = toOneLine(disagreeChunk);
    if (disagree) out.disagreeEnding = disagree;
  
    return out;
  }
  
  // ---------- 본문 파서 ----------
  function parseDilemmaText(text) {
    const out = {
      opening: [],
      char1: '', char2: '', char3: '',
      charDes1: '', charDes2: '', charDes3: '',
      dilemma_situation: [],
      question: '',
      choice1: '', choice2: '',
      flips_agree_texts: [],
      flips_disagree_texts: [],
      agreeEnding: '',
      disagreeEnding: '',
    };
  
    const T = (text || '')
      .replace(/\r/g, '')
      .replace(/\\n/g, '\n')  // ★ 리터럴 "\n"을 실제 개행으로 변환
      .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212\uFF0D]/g, '-');
  
    const splitSentences = (block) => {
      if (!block) return [];
      const m = block.match(/[^.!?。…\n]+[.!?。…]?/g);
      if (!m) return [];
      return m.map(s => s.trim()).filter(Boolean);
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
  
    const stripQuotes = (s) =>
      (s || '').replace(/^[‘’“”'"`]+|[‘’“”'"`]+$/g, '').trim();
  
    // A. 오프닝
    out.opening = splitSentences(getSection(String.raw`(?:A\.\s*)?🎬\s*오프닝\s*멘트`));
  
    // B. 역할
    {
      const sec = getSection(String.raw`(?:B\.\s*)?🎭\s*역할`);
      if (sec) {
        const lines = sec.split(/\n+/u).map(s => s.trim()).filter(Boolean);
  
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
          const blocks = sec.split(/\n{2,}/u).map(b => b.trim()).filter(Boolean);
          for (const b of blocks) {
            if (roles.length >= 3) break;
            const blines = b.split(/\n+/).map(x => x.trim()).filter(Boolean);
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
  
        if (roles[0]) { out.char1 = roles[0].name; out.charDes1 = roles[0].desc; }
        if (roles[1]) { out.char2 = roles[1].name; out.charDes2 = roles[1].desc; }
        if (roles[2]) { out.char3 = roles[2].name; out.charDes3 = roles[2].desc; }
      }
    }
  
    // C. 상황 + 질문
    {
      const sec = getSection(String.raw`(?:C\.\s*)?🎯\s*상황\s*및\s*딜레마\s*질문`);
      if (sec) {
        const rawLines = sec.replace(/\r/g, '').split('\n');
        const lines = rawLines.map(s => s.trim()).filter(l => l.length > 0);
  
        const colonIdx = lines.findIndex(l => /^질문\s*[:：]\s*/u.test(l));
        if (colonIdx >= 0) {
          const sameLine = lines[colonIdx].replace(/^질문\s*[:：]\s*/u, '').trim();
          let q = sameLine;
          if (!q) {
            const nxt = lines.slice(colonIdx + 1).find(l => l.length > 0);
            if (nxt) q = nxt.trim();
          }
          out.question = q || '';
  
          const toRemove = new Set([colonIdx]);
          if (!sameLine && lines[colonIdx + 1]) toRemove.add(colonIdx + 1);
          const remain = lines.filter((_, i) => !toRemove.has(i)).join('\n');
          out.dilemma_situation = splitSentences(remain);
        } else {
          const qIdx = lines.findIndex(l => /[?？]\s*$/.test(l));
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
  
  

// function persistParsedToLocalStorage(text) {
//   // 원본을 그대로 저장해보자
//   localStorage.setItem('debug_raw_finalText', text);

//   // "-- 선택지1"부터 "-- 선택지2" 전까지를 agreeEnding으로 추출
//   const m = text.match(/--\s*선택지1[\s\S]*?(?=--\s*선택지2)/);
//   if (m) {
//     const agreeRaw = m[0]
//       .replace(/^--\s*선택지1\s*최종선택[:：]?\s*/m, '') // 라벨 제거
//       .trim();
//     localStorage.setItem('agreeEnding', agreeRaw);
//     console.log('[DEBUG] agreeEnding 저장됨:', agreeRaw);
//   } else {
//     localStorage.setItem('agreeEnding', '');
//     console.warn('[DEBUG] agreeEnding 못 찾음');
//   }

//  // -- 선택지2 ~ 끝까지 → disagreeEnding
//  const m2 = text.match(/--\s*선택지2[\s\S]*/);
//  if (m2) {
//    const disagreeRaw = m2[0]
//      .replace(/^--\s*선택지2\s*최종선택[:：]?\s*/m, '') // 라벨 제거
//      .trim();
//    localStorage.setItem('disagreeEnding', disagreeRaw);
//    console.log('[DEBUG] disagreeEnding 저장됨:', disagreeRaw);
//  } else {
//    console.warn('[DEBUG] disagreeEnding 못 찾음');
//  }
//   const p = parseDilemmaText(text);
//   console.log('[PARSE]', { 
//     opening: p.opening, 
//     ds: p.dilemma_situation, 
//     q: p.question 
//   });
//   // 배열은 JSON으로
//   if (Array.isArray(p.opening) && p.opening.length) {
//     localStorage.setItem('opening', JSON.stringify(p.opening));
//   } else {
//     localStorage.removeItem('opening');
//   }

//   localStorage.setItem('char1', p.char1 || '');
//   localStorage.setItem('char2', p.char2 || '');
//   localStorage.setItem('char3', p.char3 || '');
//   localStorage.setItem('charDes1', p.charDes1 || '');
//   localStorage.setItem('charDes2', p.charDes2 || '');
//   localStorage.setItem('charDes3', p.charDes3 || '');

//   localStorage.setItem('dilemma_situation', JSON.stringify(p.dilemma_situation || []));
//   localStorage.setItem('question', p.question || '');
//   localStorage.setItem('choice1', p.choice1 || '');
//   localStorage.setItem('choice2', p.choice2 || '');
//   localStorage.setItem('flips_agree_texts', JSON.stringify(p.flips_agree_texts || []));
//   localStorage.setItem('flips_disagree_texts', JSON.stringify(p.flips_disagree_texts || []));
//   if (p.agreeEnding) {
//     localStorage.setItem('agreeEnding', p.agreeEnding);
//   }
//   if (p.disagreeEnding) {
//     localStorage.setItem('disagreeEnding', p.disagreeEnding);
//   }
// }

function persistParsedToLocalStorage(text) {
    // 원본을 그대로 저장해보자
    localStorage.setItem('debug_raw_finalText', text);
  
    // "-- 선택지1"부터 "-- 선택지2" 전까지를 agreeEnding으로 추출
    const m = text.match(/--\s*선택지1[\s\S]*?(?=--\s*선택지2)/);
    if (m) {
      const agreeRaw = m[0]
        .replace(/^--\s*선택지1\s*최종선택[:：]?\s*/m, '') // 라벨 제거
        .trim();
      localStorage.setItem('agreeEnding', agreeRaw); // 줄바꿈 포함 텍스트 저장
      console.log('[DEBUG] agreeEnding 저장됨:', agreeRaw);
    } else {
      localStorage.setItem('agreeEnding', '');
      console.warn('[DEBUG] agreeEnding 못 찾음');
    }
  
    // "-- 선택지2"부터 끝까지를 disagreeEnding으로 추출
    const m2 = text.match(/--\s*선택지2[\s\S]*/);
    if (m2) {
      const disagreeRaw = m2[0]
        .replace(/^--\s*선택지2\s*최종선택[:：]?\s*/m, '') // 라벨 제거
        .trim();
      localStorage.setItem('disagreeEnding', disagreeRaw); // 줄바꿈 포함 텍스트 저장
      console.log('[DEBUG] disagreeEnding 저장됨:', disagreeRaw);
    } else {
      localStorage.setItem('disagreeEnding', '');
      console.warn('[DEBUG] disagreeEnding 못 찾음');
    }
  
    const p = parseDilemmaText(text);
    console.log('[PARSE]', { 
      opening: p.opening, 
      ds: p.dilemma_situation, 
      q: p.question 
    });
  
    // 배열은 JSON으로 저장
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
    localStorage.setItem('choice1', p.choice1 || '');
    localStorage.setItem('choice2', p.choice2 || '');
    localStorage.setItem('flips_agree_texts', JSON.stringify(p.flips_agree_texts || []));
    localStorage.setItem('flips_disagree_texts', JSON.stringify(p.flips_disagree_texts || []));
    if (p.agreeEnding) {
      localStorage.setItem('agreeEnding', p.agreeEnding); // 로컬 저장에 줄바꿈 포함
    }
    if (p.disagreeEnding) {
      localStorage.setItem('disagreeEnding', p.disagreeEnding); // 로컬 저장에 줄바꿈 포함
    }
  }
  
// 필수 필드가 준비됐는지 판단(이미지 생성 버튼 노출 조건)
function parsedReady() {
  const opening = readJSON('opening', []);
  const ds = readJSON('dilemma_situation', []);
  //const q = localStorage.getItem('question') || '';
  //const r = localStorage.getItem('agreeEnding') || '';

  return opening.length > 0 && ds.length > 0  > 0;
}

// 이미지 모두 준비됐는지(템플릿 생성 버튼 노출 조건)
function imagesReady() {
  return ['dilemma_image_1', 'dilemma_image_3', 'dilemma_image_4_1', 'dilemma_image_4_2']
    .every(k => !!localStorage.getItem(k));
}

// /chat/image 호출
async function requestImage(input, size = '1867 × 955') {
  const body = { step: 'image', input, size };
  const { data } = await axiosInstance.post('/chat/image', body, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data?.image_data_url || data?.url || data?.image || null;
}

  // 버튼 표시 상태 계산
  function computeButtonVisibility() {
    const readyImgs = imagesReady();
    return {
      showImage: parsedReady() && !readyImgs,
      showTemplate: readyImgs,
    };
  }
export default function Create00() {
  const navigate = useNavigate();
  const [finalText, setFinalText] = useState(localStorage.getItem(STORAGE_FINAL_TEXT) || '');
   const [{ showImage: showImageBtn, showTemplate: showTemplateBtn }, setBtnState] =
     useState(() => computeButtonVisibility());
  const [imgLoading, setImgLoading] = useState(false);
    const GPTS_URL =
//'https://chatgpt.com/g/g-68c588a5afa881919352989f07138007-ai-yunri-dilrema-sinario-caesbos';
'https://chatgpt.com/g/g-68c588a5afa881919352989f07138007-ai-yunri-dilrema-sinario-caesbos';  
function openNewTabSafely(url) {
    const w = window.open(url, '_blank', 'noopener,noreferrer');
    if (w) return;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    }

  // 입력 변경 → 로컬 저장 + 파싱 + 버튼 노출 판단
  const handleChange = (v) => {
    setFinalText(v);
    localStorage.setItem(STORAGE_FINAL_TEXT, v);
    persistParsedToLocalStorage(v);
    setBtnState(computeButtonVisibility());
  };

  // 이미지 생성(4장)
  const handleGenerateImages = async () => {
    if (imgLoading) return;
    setImgLoading(true);
    try {
      const openingArr = readJSON('opening', []);
      const openingText = openingArr.join(' ');
      const question = localStorage.getItem('question') || '';
      const ds = readJSON('dilemma_situation', []);
      const fa = readJSON('flips_agree_texts', []);
      const fd = readJSON('flips_disagree_texts', []);

      // 1) 오프닝
      if (openingArr.length) {
        const input = `${IMG_STYLE}. 16:9 이미지. 오프닝 요약: ${openingArr}.`;
        const url = await requestImage(input, '1792x1024');
        if (url) localStorage.setItem('dilemma_image_1', url);
      }
      // 2) 상황/질문
      if (ds.length) {
        const s = trim1(ds.slice(0, 2).join(' '));
        const q = trim1(question || '', 120);
        const input = `${IMG_STYLE}. 16:9.\n상황: ${s}\n질문: ${q}`;
        const url = await requestImage(input, '1792x1024');
        if (url) localStorage.setItem('dilemma_image_3', url);
      }
      // 3) 플립(찬성)
      if (fa.length) {
        const core = trim1(fa.slice(0, 3).join(' '));
        const input = `${IMG_STYLE}. 선택지 1(찬성) 논거를 표현한 만화풍, 16:9.\n핵심 논거: ${core}`;
        const url = await requestImage(input, '1792x1024');
        if (url) localStorage.setItem('dilemma_image_4_1', url);
      }
      // 4) 플립(반대)
      if (fd.length) {
        const core = trim1(fd.slice(0, 3).join(' '));
        const input = `${IMG_STYLE}. 선택지 2(반대) 논거를 표현한 만화풍, 16:9.\n핵심 논거: ${core}`;
        const url = await requestImage(input, '1792x1024');
        if (url) localStorage.setItem('dilemma_image_4_2', url);
      }
    } catch (e) {
      console.error('이미지 생성 오류:', e);
      alert('이미지 생성 중 문제가 발생했습니다.');
    } finally {
      setImgLoading(false);
      // 이미지 준비 완료되면 템플릿 버튼 ON, 이미지 버튼은 계속 노출해도 무방
      setBtnState(computeButtonVisibility());    }
  };

  // 템플릿 생성 → /custom-games POST 후 /create01 이동
  const handleTemplateCreate = async () => {
    try {
      const teacher_name = localStorage.getItem('teacher_name') || '-';
      const teacher_school = localStorage.getItem('teacher_school') || '-';
      const teacher_email = localStorage.getItem('teacher_email') || '---';

      const opening = readJSON('opening', []);
      const char1 = localStorage.getItem('char1') || '-';
      const char2 = localStorage.getItem('char2') || '-';
      const char3 = localStorage.getItem('char3') || '-';
      const charDes1 = localStorage.getItem('charDes1') || '-';
      const charDes2 = localStorage.getItem('charDes2') || '-';
      const charDes3 = localStorage.getItem('charDes3') || '-';
      const dilemma_situation = readJSON('dilemma_situation', ['-']);
      const question = localStorage.getItem('question') || '-';
      const choice1 = localStorage.getItem('choice1') || '-';
      const choice2 = localStorage.getItem('choice2') || '-';
      const flips_agree_texts = readJSON('flips_agree_texts', ['-']);
      const flips_disagree_texts = readJSON('flips_disagree_texts', ['-']);
      const agreeEnding = localStorage.getItem('agreeEnding') || '-';
      const disagreeEnding = localStorage.getItem('disagreeEnding') || '-';

      const representativeImages = {
        dilemma_image_1: localStorage.getItem('dilemma_image_1') || '',
        dilemma_image_3: localStorage.getItem('dilemma_image_3') || '',
        dilemma_image_4_1: localStorage.getItem('dilemma_image_4_1') || '',
        dilemma_image_4_2: localStorage.getItem('dilemma_image_4_2') || '',
      };
      Object.keys(representativeImages).forEach((k) => {
        if (!representativeImages[k]) delete representativeImages[k];
      });

      const data = {
        opening,
        roles: [
          { name: char1, description: charDes1 },
          { name: char2, description: charDes2 },
          { name: char3, description: charDes3 },
        ],
        rolesBackground: '',
        dilemma: {
          situation: dilemma_situation,
          question,
          options: { agree_label: choice1, disagree_label: choice2 },
        },
        flips: {
          agree_texts: flips_agree_texts,
          disagree_texts: flips_disagree_texts,
        },
        finalMessages: { agree: agreeEnding, disagree: disagreeEnding },
        ...(Object.keys(representativeImages).length ? { representativeImages } : {}),
      };

      const payload = {
        teacher_name,
        teacher_school,
        teacher_email,
        title:'제목을 입력하세요',
        representative_image_url: '-',
        data,
      };

      const { data: res } = await axiosInstance.post('/custom-games', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      const code = res?.code ?? null;
      const gameUrl = res?.url ?? null;
      if (code) localStorage.setItem('code', code);
      if (gameUrl) localStorage.setItem('url', gameUrl);
      navigate('/create00');
    } catch (e) {
      console.error('템플릿 생성 실패:', e);
      alert('템플릿 생성 중 문제가 발생했습니다.');
    }
  };
  useEffect(() => {
    // 외부에서 value가 세팅될 수도 있으니, finalText 변경 시 파싱 동기화
    persistParsedToLocalStorage(finalText);
    setBtnState(computeButtonVisibility());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalText]);


  return (
    <CreatorLayout
      headerbar={1}
      headerLeftType="home"
      headerNextDisabled={true}
      onHeaderLeftClick={() => navigate('/selectroom')}
      onHeaderNextClick={() => {}}
      frame={false}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, width: '100%' }}>
        <div style={{ alignSelf: 'stretch', marginTop: 10, }}>
            <h2 style={{ ...FontStyles.headlineSmall, color: Colors.grey07, marginBottom: 8 }}>
            챗봇과 시나리오 사전 구상하기
            </h2>

             <p style={{ ...FontStyles.body, color: Colors.grey05, margin: 0 }}>
            <span style={{ display: 'block', marginBottom: 6 }}>
                챗봇이 만든 최종 결과를 아래 입력 박스에 그대로 붙여넣어 주세요. 
            </span>
            <span style={{ display: 'block', marginBottom: 6 }}>
            '🎬 오프닝 멘트'부터 '🌀 최종 멘트'까지의 범위를 드래그 후 붙여넣어야 버튼이 생성됩니다.
                        </span>
            <span style={{ display: 'inline' }}>
                혹시 챗봇을 실수로 종료하신 경우, 오른쪽 링크를 클릭해 주세요.{' '}
            </span>
            <a
                href={GPTS_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'underline', cursor: 'pointer' }}
                onClick={(e) => {
                e.preventDefault();
                openNewTabSafely(GPTS_URL);
                }}
            >
                챗봇 바로가기
            </a>
            </p>
            </div>

        <div style={{ alignSelf: 'stretch' }}>
          <CustomInput
            width={1060}
            height={240}
            placeholder="여기에 최종 결과를 붙여넣기 해주세요."
            value={finalText}
            onChange={(e) => handleChange(e.target.value ?? '')}
          />
        </div>

        {/* 액션 버튼들 */}
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          {/* {showImageBtn && (
            <Continue
              onClick={handleGenerateImages}
              label={imgLoading ? '이미지 생성 중…' : '이미지 생성하기'}
              disabled={imgLoading}
              style={{ width: 220, height: 64, opacity: imgLoading ? 0.6 : 1 }}
            />
          )} */}

{showImageBtn && (
  <>
    <div style={{ textAlign: "center" }}>
      <Continue
        onClick={handleGenerateImages}
        label={imgLoading ? '이미지 생성 중…' : '이미지 생성하기'}
        disabled={imgLoading}
        style={{ width: 220, height: 64, opacity: imgLoading ? 0.6 : 1 }}
      />
      {imgLoading && (
        <p style={{ ...FontStyles.body, color: Colors.creatorgrey07, marginTop: "8px" }}>
          이미지 생성에는 최대 3분 정도 소요됩니다.
        </p>
      )}
    </div>
  </>
)}



          {showTemplateBtn && (
            <Continue
              onClick={handleTemplateCreate}
              label="편집 페이지로 이동"
              style={{ width: 220, height: 64 }}
            />
          )}
        </div>
      </div>
    </CreatorLayout>
  );
}
