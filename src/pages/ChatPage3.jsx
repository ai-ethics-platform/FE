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

// ---------- 파서(붙여넣은 텍스트 → 구조화) ----------
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
      // 다양한 대시/emdash/figure dash → 하이픈
      .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-');
  
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
  
    // B. 역할 — 두 가지 방식 모두 지원
    //  (1) 불릿 한 줄 패턴: -- '이름' : 설명
    //  (2) 블록 패턴: 첫 줄=이름, 나머지 줄=설명
    {
      const sec = getSection(String.raw`(?:B\.\s*)?🎭\s*역할`);
      if (sec) {
        const lines = sec.split(/\n+/u).map(s => s.trim()).filter(Boolean);
  
        // 1) 우선: 한 줄 불릿 패턴을 최대한 뽑는다.
        //    예) -- '교감 선생님' : 학교의 행정과...
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
  
        // 2) 불릿에서 3명 다 못 뽑았으면, 블록 패턴 백업
        let roles = bulletRoles.slice(0, 3);
        if (roles.length < 3) {
          const blocks = sec.split(/\n{2,}/u).map(b => b.trim()).filter(Boolean);
          for (const b of blocks) {
            if (roles.length >= 3) break;
            const blines = b.split(/\n+/).map(x => x.trim()).filter(Boolean);
            if (!blines.length) continue;
  
            // 첫 줄에 "이름 : 설명" 형태가 있을 수도 있으니 우선 분기
            const mInline = blines[0].match(bulletRoleRe);
            if (mInline) {
              const name = stripQuotes(mInline[1]);
              const desc = (mInline[2] + ' ' + blines.slice(1).join(' ')).trim();
              if (name) roles.push({ name, desc });
              continue;
            }
  
            // 일반 블록: 1행=이름(불릿/번호 제거), 2행~ = 설명
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
  
    // C. 상황+질문
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
  
    // D. 선택지1 + 플립자료(📎 플립자료: 라벨이 없어도 본문 전체를 플립으로 처리)
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
  
    // E. 선택지2 + 플립자료
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
// F. 최종 멘트 — 초탄탄 버전(공백/괄호/콜론/제로폭 대응, 인덱스 기반)
{
    const sec = getSection(String.raw`(?:F\.\s*)?(?:🌀\s*)?최종\s*멘트?`);
    if (sec) {
      // 1) 원문 보존본 + 정규화본 둘 다 사용 (정규화본에서 인덱스 찾고, 그걸로 자름)
      const raw  = sec.replace(/\r/g, '').trim();
  
      // 유니코드 잡스러운 공백/제로폭/콜론/하이픈 정리 + 다중공백 축약
      const normalize = (s) =>
        s
          .replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, ' ')  // NBSP 등 → space
          .replace(/[\u200B-\u200D\uFEFF]/g, '')                    // zero-width 제거
          .replace(/[：]/g, ':')                                     // 전각 콜론 → 일반 콜론
          .replace(/[‐-‒–—]/g, '-')                                  // 다양한 대시 통일
          .replace(/[ \t]+/g, ' ')                                   // 다중 스페이스 축약
          .replace(/\n[ \t]+/g, '\n');                               // 개행 뒤 공백 제거
  
      const norm = normalize(raw);
  
      // 2) 라벨 정규식(매우 느슨)
      // - "선택지"와 숫자 사이 공백 허용, 괄호 라벨 옵션, '최종선택/최종 선택' 모두 허용, 콜론 유무/줄바꿈 허용
      const RE1 = /선택지\s*1\s*(?:\([^)]*\)\s*)?최종\s*선택?/u;
      const RE2 = /선택지\s*2\s*(?:\([^)]*\)\s*)?최종\s*선택?/u;
  
      // 3) 위치 찾기
      const i1 = norm.search(RE1);
      const i2 = norm.search(RE2);
  
      // 4) 라벨 문자열(정확히 매칭된 텍스트) 길이 구하기
      const m1 = i1 >= 0 ? norm.slice(i1).match(RE1) : null;
      const m2 = i2 >= 0 ? norm.slice(i2).match(RE2) : null;
      const lab1len = m1 ? m1[0].length : 0;
      const lab2len = m2 ? m2[0].length : 0;
  
      // 5) agree: [선택지1 라벨] 이후 ~ [선택지2 라벨 시작] 전
      if (i1 >= 0) {
        let body1 = norm.slice(i1 + lab1len, i2 >= 0 ? i2 : norm.length);
        // 라벨과 같은 줄의 콜론 또는 다음 줄 콜론을 정리
        body1 = body1.replace(/^[ \t]*:?\s*/u, '').replace(/^\s*\n+/, '');
        out.agreeEnding = body1.trim();
      }
  
      // 6) disagree: [선택지2 라벨] 이후 ~ 끝 (← 여기서 항상 끝까지 자르므로 안전)
      if (i2 >= 0) {
        let body2 = norm.slice(i2 + lab2len);
        body2 = body2.replace(/^[ \t]*:?\s*/u, '').replace(/^\s*\n+/, '');
        out.disagreeEnding = body2.trim();
      }
  
      // 7) 마지막 클린업: 줄별 불릿/숫자 제거 + 양쪽 따옴표 제거
      const clean = (s='') =>
        s
          .replace(/^\s*(?:[-–—•*]\s+|\d+\.\s*)/gm, '')
          .replace(/^["“”'‘’]+|["“”'‘’]+$/g, '')
          .trim();
      if (out.agreeEnding)    out.agreeEnding    = clean(out.agreeEnding);
      if (out.disagreeEnding) out.disagreeEnding = clean(out.disagreeEnding);
  
      // 8) 백업: 선택지2 라벨을 못 찾았을 때(아주 드문 케이스) — "2" 숫자 붙임/콜론 누락 등 느슨 매치
      if (!out.disagreeEnding) {
        // 선택지2 뒤 전부 잡기 (콜론/공백/개행 가리지 않음)
        const m2b = norm.match(/선택지\s*2[\s\S]*?(?:최종\s*선택?)?[:：]?\s*([\s\S]*)$/u);
        if (m2b) out.disagreeEnding = clean(m2b[1] || '');
      }
  
      // 9) 그래도 비면 단락 백업(두 번째 단락=agree, 세 번째 단락=disagree)
      if (!out.agreeEnding && !out.disagreeEnding) {
        const paras = norm.split(/\n{2,}/u).map(s => s.trim()).filter(Boolean);
        if (paras[1]) out.agreeEnding    = clean(paras[1]);
        if (paras[2]) out.disagreeEnding = clean(paras[2]);
      }
    }
  }
  
  
  
    return out;
  }
  

function persistParsedToLocalStorage(text) {
  const p = parseDilemmaText(text);
  console.log('[PARSE]', { 
    opening: p.opening, 
    ds: p.dilemma_situation, 
    q: p.question 
  });
  // 배열은 JSON으로
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
  localStorage.setItem('agreeEnding', p.agreeEnding || '');
  localStorage.setItem('disagreeEnding', p.disagreeEnding || '');
}

// 필수 필드가 준비됐는지 판단(이미지 생성 버튼 노출 조건)
function parsedReady() {
  const opening = readJSON('opening', []);
  const ds = readJSON('dilemma_situation', []);
  const q = localStorage.getItem('question') || '';
  const r = localStorage.getItem('agreeEnding') || '';

  return opening.length > 0 && ds.length > 0 && q.trim().length > 0;
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
'https://chatgpt.com/g/g-68c588a5afa881919352989f07138007-test-kw-ver-17';

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
            챗봇과 시나리오 사전 구상기
            </h2>

             <p style={{ ...FontStyles.body, color: Colors.grey05, margin: 0 }}>
            <span style={{ display: 'block', marginBottom: 6 }}>
                챗봇이 만든 최종 결과를 아래 입력 박스에 그대로 붙여넣어 주세요.
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
          {showImageBtn && (
            <Continue
              onClick={handleGenerateImages}
              label={imgLoading ? '이미지 생성 중…' : '이미지 생성하기'}
              disabled={imgLoading}
              style={{ width: 220, height: 64, opacity: imgLoading ? 0.6 : 1 }}
            />
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
