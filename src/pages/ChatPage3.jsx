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
  '귀여운 2D 벡터 카툰, 둥근 모서리 프레임, 두꺼운 외곽선, 파스텔톤 평면 채색, 약한 그림자, 단순한 배경(공원/교실/도로), 과장된 표정, 말풍선에는 기호만(?, !), 사진/리얼/3D/과도한 질감/복잡한 텍스트 금지';

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
      .replace(/[\u2012\u2013\u2014\u2212]/g, '-'); // 다양한 대시 → '-'
  
    const splitSentences = (block) => {
      if (!block) return [];
      // 마침표/물음표/개행 기준으로 문장성 덩어리 추출
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
  
    // B. 역할 — 이름(따옴표 포함 가능) 한 줄 + 비어있지 않은 문단을 설명으로
    {
      const sec = getSection(String.raw`(?:B\.\s*)?🎭\s*역할`);
      if (sec) {
        // 빈 줄로 블록 구분
        const blocks = sec
          .split(/\n{2,}/u)
          .map(b => b.trim())
          .filter(Boolean);
  
        const roles = [];
        for (const b of blocks) {
          const lines = b.split(/\n+/).map(x => x.trim()).filter(Boolean);
          if (!lines.length) continue;
          // 첫 줄을 이름으로 가정(따옴표/불릿/번호 제거)
          let name = lines[0]
            .replace(/^[•*\-\d.\s]+/, '')
            .trim();
          name = stripQuotes(name);
  
          // 나머지 줄 전부를 설명으로
          const desc = lines.slice(1).join(' ').trim();
  
          // 이름만 있고 설명이 다음 블록에 없는 경우 방어
          if (!name) continue;
          roles.push({ name, desc });
        }
  
        if (roles[0]) { out.char1 = roles[0].name; out.charDes1 = roles[0].desc; }
        if (roles[1]) { out.char2 = roles[1].name; out.charDes2 = roles[1].desc; }
        if (roles[2]) { out.char3 = roles[2].name; out.charDes3 = roles[2].desc; }
      }
    }
  
    {
          const sec = getSection(String.raw`(?:C\.\s*)?🎯\s*상황\s*및\s*딜레마\s*질문`);
          if (sec) {
            const rawLines = sec.replace(/\r/g, '').split('\n');
            const lines = rawLines.map(s => s.trim()).filter(l => l.length > 0);
    
            // 1) "질문:" 라인 우선 탐지
            const colonIdx = lines.findIndex(l => /^질문\s*[:：]\s*/u.test(l));
            if (colonIdx >= 0) {
              // 같은 줄에 질문이 있으면 그대로, 없으면 다음 비어있지 않은 줄을 질문으로
              const sameLine = lines[colonIdx].replace(/^질문\s*[:：]\s*/u, '').trim();
              let q = sameLine;
              if (!q) {
                const nxt = lines.slice(colonIdx + 1).find(l => l.length > 0);
                if (nxt) q = nxt.trim();
              }
              out.question = q || '';
    
              // 상황 본문 = "질문:" 라인과 (질문이 다음 줄이었다면 그 줄도) 제거한 나머지
              const toRemove = new Set([colonIdx]);
              if (!sameLine && lines[colonIdx + 1]) toRemove.add(colonIdx + 1);
              const remain = lines.filter((_, i) => !toRemove.has(i)).join('\n');
              out.dilemma_situation = splitSentences(remain);
            } else {
              // 2) "질문:" 라인이 없다면, 물음표로 끝나는 첫 줄을 질문으로 시도
              const qIdx = lines.findIndex(l => /[?？]\s*$/.test(l));
              if (qIdx >= 0) {
                out.question = lines[qIdx].trim();
                const remain = lines.filter((_, i) => i !== qIdx).join('\n');
                out.dilemma_situation = splitSentences(remain);
              } else {
                // 질문을 못 찾으면 전부 상황으로
                out.dilemma_situation = splitSentences(sec);
                out.question = '';
              }
            }
          }
        }
  
    // D. 선택지1 + 플립자료
    {
      // "✅ 선택지 1: 제목" + "📎 플립자료:"
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
// F. 최종 멘트 — 선택지 1/2 (괄호 옵션) 최종선택 전용, 인덱스 기반 파서
{
    const sec = getSection(String.raw`(?:F\.\s*)?(?:🌀\s*)?최종\s*멘트?`);
    if (sec) {
      const norm = sec.replace(/\r/g, '').trim();
  
      // 공통 클리너
      const clean = (s = '') =>
        s
          // 각 줄의 선행 불릿/번호 제거(- • * 1. 등)
          .replace(/^\s*(?:[-–—•*]\s+|\d+\.\s*)/gm, '')
          // 앞뒤 따옴표 제거
          .replace(/^["“”'‘’]+|["“”'‘’]+$/g, '')
          .trim();
  
      // 1) 선택지 1 캡처: 라벨~(다음 라벨 or 끝) 사이
      const re1 = /선택지\s*1\s*(?:\([^)]+\)\s*)?최종\s*선택?\s*/u;
      const re2 = /선택지\s*2\s*(?:\([^)]+\)\s*)?최종\s*선택?\s*/u;
  
      const i1 = norm.search(re1);
      const i2 = norm.search(re2);
  
      // 선택지 1 본문
      if (i1 >= 0) {
        const start1 = i1 + (norm.slice(i1).match(re1)?.[0].length || 0);
        const end1 = i2 >= 0 ? i2 : norm.length;
        const body1 = norm.slice(start1, end1)
          .replace(/^[ \t]*[：:]\s*/u, '')   // 같은 줄 콜론 제거
          .replace(/^\s*\n+/, '');          // 다음 줄 시작이면 개행 제거
        out.agreeEnding = clean(body1);
      }
  
      // 2) 선택지 2 본문 (여기가 핵심: 인덱스 기반으로 끝까지)
      if (i2 >= 0) {
        const start2 = i2 + (norm.slice(i2).match(re2)?.[0].length || 0);
        const body2 = norm.slice(start2)
          .replace(/^[ \t]*[：:]\s*/u, '')   // 같은 줄 콜론 제거
          .replace(/^\s*\n+/, '');          // 다음 줄 시작이면 개행 제거
        out.disagreeEnding = clean(body2);
      }
  
      // 백업 1: 느슨한 매치(콜론/개행 변형까지 허용)
      if (!out.disagreeEnding) {
        const m2b = norm.match(/선택지\s*2[\s\S]*?[：:]*\s*([\s\S]*)$/u);
        if (m2b) out.disagreeEnding = clean(m2b[1]);
      }
  
      // 백업 2: 브라켓/불릿 없는 경우 단락 분할 (2=agree, 3=disagree)
      if (!out.agreeEnding && !out.disagreeEnding) {
        const paras = norm.split(/\n{2,}/u).map(s => s.trim()).filter(Boolean);
        if (paras[1]) out.agreeEnding = clean(paras[1]);
        if (paras[2]) out.disagreeEnding = clean(paras[2]);
      }
  
      // 필요시 디버깅
      // console.log('[FINAL IDX]', { i1, i2, agree: out.agreeEnding, disagree: out.disagreeEnding });
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

export default function Create00() {
  const navigate = useNavigate();
  const [finalText, setFinalText] = useState(localStorage.getItem(STORAGE_FINAL_TEXT) || '');
  const [showImageBtn, setShowImageBtn] = useState(parsedReady());
  const [showTemplateBtn, setShowTemplateBtn] = useState(imagesReady());
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
    setShowImageBtn(parsedReady());
    // 이미지 버튼만 우선; 템플릿 버튼은 이미지 생성 완료 후 켜짐
    setShowTemplateBtn(imagesReady());
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
      setShowTemplateBtn(imagesReady());
    }
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
        title:'-',
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
    setShowImageBtn(parsedReady());
    setShowTemplateBtn(imagesReady());
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
            챗봇과 사진 구상하기
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
