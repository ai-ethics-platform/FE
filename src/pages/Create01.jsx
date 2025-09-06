import { useEffect, useState, useRef } from 'react';
import DilemmaOutPopup from '../components/DilemmaOutPopup';
import CreatorLayout from '../components/Expanded/CreatorLayout';
import CreatorContentBox from "../components/Expanded/CreatorContentBox";
import Continue from '../components/Continue';
import { useNavigate } from 'react-router-dom';
import CreateInput from '../components/Expanded/CreateInput';
import inputPlusIcon from '../assets/inputplus.svg'; 
import create02Image from '../assets/images/create02.png';
import { FontStyles, Colors } from '../components/styleConstants';
import NextGreen from "../components/NextOrange";
import axiosInstance from '../api/axiosInstance';
// 파일 상단 
const DEFAULT_DATA = {
  opening: ["문장1.", "문장2.", "문장3."],
  roles:[
    {"name": "1P", "description": "1P 문장"},
    {"name": "2P", "description": "한 문장"},
    {"name": "3P", "description": "한 문장"}
  ],
  rolesBackground: "세 역할 공통 배경 설명",
  dilemma:{
    "situation": ["문장1.", "문장2.", "문장3."],
    "question": "질문 한 문장.",
    "options": { agree_label: "동의", disagree_label: "비동의" }
  },
  flips: {
    agree_texts: ["문장1.", "문장2.", "문장3.","문장4"],
    disagree_texts: ["문장1.", "문장2.", "문장3."],
  },
  finalMessages: { agree: "동의 엔딩.", disagree: "비동의 엔딩." },
};


function readLocalData() {
  try {
    const raw = localStorage.getItem('data');
    const parsed = raw ? JSON.parse(raw) : null;

    // 과거에 'data'에 opening 배열만 저장된 레거시 형태 보정
    // - parsed가 배열이면 완전 레거시
    if (Array.isArray(parsed)) {
      return { ...DEFAULT_DATA, opening: parsed };
    }

    // - 객체인데 opening만 있는 경우도 DEFAULT와 머지
    if (parsed && typeof parsed === 'object') {
      return { ...DEFAULT_DATA, ...parsed, dilemma: { ...DEFAULT_DATA.dilemma, ...(parsed.dilemma || {}) }, flips: { ...DEFAULT_DATA.flips, ...(parsed.flips || {}) }, finalMessages: { ...DEFAULT_DATA.finalMessages, ...(parsed.finalMessages || {}) } };
    }

    // 비정상/null이면 기본값
    return { ...DEFAULT_DATA };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

function writeLocalData(nextData) {
  // DEFAULT_DATA와 깊은 머지(중첩 객체는 필요한 부분만 덮기)
  const merged = {
    ...DEFAULT_DATA,
    ...nextData,
    dilemma: { ...DEFAULT_DATA.dilemma, ...(nextData?.dilemma || {}) },
    flips: { ...DEFAULT_DATA.flips, ...(nextData?.flips || {}) },
    finalMessages: { ...DEFAULT_DATA.finalMessages, ...(nextData?.finalMessages || {}) },
  };
  localStorage.setItem('data', JSON.stringify(merged));
  return merged;
}

export default function Create01() {
  const navigate = useNavigate();

  // 제목은 서버에서 받아온 값으로 교체됨
  const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");
  // A 영역 - 오프닝/제목 멘트 (입력은 안 쓰지만 상태 유지)
  const [openingText, setOpeningText] = useState("");

  // B 영역 - 이미지 상태 (기본 이미지로 시작)
  const [image, setImage] = useState(null);
  const [isDefaultImage, setIsDefaultImage] = useState(true);
  const [imageUrl, setImageUrl] = useState(localStorage.getItem('representative_image_url') || null);
  
  // C 영역 - 입력 필드: ★ 서버의 data.opening 배열 길이대로 생성됨
  const [inputs, setInputs] = useState([
    { id: 1, label: "화면 1 *", value: "", placeholder: "예: Homemate 사용자 최적화 시스템 업그레이드 공지", canDelete: false },
    { id: 2, label: "화면 2 ", value: "", placeholder: "예: 업데이트를 하면 고객님의 감정, 건강 상태, 생활 습관 등을 자동으로 수집하여...", canDelete: true },
    { id: 3, label: "화면 3 ", value: "", placeholder: " ", canDelete: true }
  ]);
  // 파일 상단 import 옆 혹은 컴포넌트 내부 최상단에
async function uploadRepresentativeImage(file) {
  const form = new FormData();
  form.append('file', file); //  서버 요구: 필드명 'file'

  const res = await axiosInstance.post('/custom-games/upload-image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    // onUploadProgress: (e) => { const pct = Math.round((e.loaded*100)/(e.total||1)); console.log(pct); }
  });

  const url = res?.data?.url || res?.data?.image_url;
  if (!url) throw new Error('업로드 응답에 url이 없습니다.');
  return url;
}

  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
  
    // 1) 로컬 우선
    try {
      const localData = readLocalData(); // 스키마 보장된 객체
      const localOpening = Array.isArray(localData.opening) ? localData.opening : [];
  
      if (localOpening.length > 0) {
        const built = localOpening.map((text, idx) => ({
          id: idx + 1,
          label: `화면 ${idx + 1}${idx === 0 ? ' *' : ''}`,
          value: text ?? '',
          placeholder: idx === 0
            ? "예: Homemate 사용자 최적화 시스템 업그레이드 공지"
            : " ",
          canDelete: idx !== 0,
        }));
        setInputs(built);
        
      } else {
        writeLocalData(localData); // 명시적으로 한 번 시드
      }
    } catch (err) {
      console.error('로컬 파싱 실패:', err);
      writeLocalData(DEFAULT_DATA);
    }
  
    const code = localStorage.getItem('code');
      const hasLocalData = !!localStorage.getItem('data');
      const hasLocalTitle = !!localStorage.getItem('creatorTitle');
      if (!code || (hasLocalData && hasLocalTitle)) {
        console.log('GET 스킵: 로컬 data/creatorTitle 이미 존재');
        return;
      }
  
    (async () => {
      try {
        const res = await axiosInstance.get(`/custom-games/${code}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        const game = res?.data || {};
        const {
          teacher_name,
          teacher_school,
          teacher_email,
          title: serverTitle,
          representative_image_url,
          data: serverData,
        } = game;
  
        if (teacher_name !== undefined) localStorage.setItem('teacher_name', teacher_name ?? '');
        if (teacher_school !== undefined) localStorage.setItem('teacher_school', teacher_school ?? '');
        if (teacher_email !== undefined) localStorage.setItem('teacher_email', teacher_email ?? '');
        if (serverTitle !== undefined) localStorage.setItem('creatorTitle', serverTitle ?? '');
        if (representative_image_url !== undefined) localStorage.setItem('representative_image_url', representative_image_url ?? '');
  
        // 서버 데이터도 스키마와 머지 후 저장
        const mergedData = writeLocalData(serverData || {});
        setTitle(serverTitle ?? '');
  
        const openingArr = Array.isArray(mergedData.opening) ? mergedData.opening : [];
        const built = (openingArr.length > 0 ? openingArr : [])
          .map((text, idx) => ({
            id: idx + 1,
            label: `화면 ${idx + 1}${idx === 0 ? ' *' : ''}`,
            value: text ?? '',
            placeholder: idx === 0
              ? "예: Homemate 사용자 최적화 시스템 업그레이드 공지"
              : " ",
            canDelete: idx !== 0,
          }));
  
        if (built.length > 0) {
          setInputs(built);
        } else {
          // opening이 비어있다면 최소 1개는 UI에 유지
          setInputs(prev => {
            saveOpeningToLocal(prev);
            return prev;
          });
        }
      } catch (e) {
        console.error(e);
        console.log('게임 정보를 불러오지 못했습니다.');
        // 서버 실패해도 이미 로컬은 스키마로 안전
      }
    })();
  }, [navigate]);
  

// Opening 배열 PUT
const putOpening = async (inputs) => {
  const code = localStorage.getItem('code');
  if (!code) {
    throw new Error('게임 코드가 없습니다. (code)');
  }

  // 입력값을 순서대로 배열화 (id 순서 유지)
  const openingRaw = [...inputs]
    .sort((a, b) => a.id - b.id)
    .map(it => (it.value ?? '').trim());

  // 서버가 빈 문자열을 허용하지 않는 경우가 많아 최소 1자 보장
  const opening = openingRaw.map(v => (v.length > 0 ? v : '-'));
  await axiosInstance.put(
    `/custom-games/${code}/opening`,
    { opening },
    { headers: { 'Content-Type': 'application/json' } }
  );
};

const saveOpeningToLocal = (nextInputs) => {
  try {
    const base = readLocalData(); // 항상 스키마 보장된 객체
    const opening = [...nextInputs]
      .sort((a, b) => a.id - b.id)
      .map(it => (it.value ?? ''));

    const next = { ...base, opening };
    writeLocalData(next);          // 항상 스키마 보존하면서 저장
    localStorage.setItem('opening', JSON.stringify(opening)); // 디버그용 유지
  } catch (err) {
    console.error('로컬 저장 실패:', err);
  }
};

  // 저장(다음 단계) 클릭 시
  const handleConfirm = async (finalTitle) => {
    const hasEmptyFirst = (inputs[0]?.value ?? '').trim().length === 0;
    if (hasEmptyFirst) {
      alert('화면 1은 반드시 입력해 주세요.');
      return;
    }
    try {
      setTitle(finalTitle);
      localStorage.setItem('creatorTitle', finalTitle);
      await putOpening(inputs);
      navigate('/create02');
    } catch (e) { console.error(e); alert('저장 중 오류'); }
  };

  const handleAddInput = () => {
    setInputs(prev => {
      if (prev.length >= 5) return prev;
      const nextId = prev.reduce((m, it) => Math.max(m, it.id), 0) + 1;
      const next = [
        ...prev,
        { id: nextId, label: `화면 ${prev.length + 1} `, value: "", placeholder: " ", canDelete: true }
      ];
      saveOpeningToLocal(next); // 
      return next;
    });
  };
  
  const handleDeleteInput = (idToDelete) => {
    setInputs(prev => {
      const filtered = prev.filter(input => input.id !== idToDelete);
      const next = filtered.map((input, index) => ({
        ...input,
        id: index + 1,
        label: `화면 ${index + 1} `,
        canDelete: index !== 0,
      }));
      saveOpeningToLocal(next); // 
      return next;
    });
  };
  

  const handleInputChange = (id, newValue) => {
    setInputs(prev => {
      const next = prev.map(input =>
        input.id === id ? { ...input, value: newValue } : input
      );
      saveOpeningToLocal(next); //  변경 즉시 전체 동기화
      return next;
    });
  };
  

  // --- 이미지 변경 ---
  const handleImageChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        setImage(file);
        setIsDefaultImage(false);
    
  
       const url = await uploadRepresentativeImage(file);  // ✅ await 필요
       setImageUrl(url);
       localStorage.setItem('representative_image_url', url);
      } catch (err) {
        console.error(err);
        alert('이미지 업로드에 실패했습니다.');
      }
    };
    
    input.click();
  };

  return (
    <CreatorLayout
      headerbar={2}
      headerLeftType="home"
      headerNextDisabled={true}
      onHeaderNextClick={() => console.log('NEXT')}
      frameProps={{
        value: title,
        onChange: (val) => setTitle(val),
        onConfirm: (val) => {
          setTitle(val);
          localStorage.setItem("creatorTitle", val);
        },
      }}
    >
      {/* A 영역 - 오프닝/제목 멘트 */}
      <div style={{ marginTop: -30, marginBottom: '30px' }}>
        <h2 style={{
          ...FontStyles.headlineSmall,
          marginBottom: '16px',
          color: Colors.grey07
        }}>
          오프닝 멘트
        </h2>

        <p style={{
          ...FontStyles.title,
          color: Colors.grey05,
          lineHeight: 1.5,
          marginBottom: '32px'
        }}>
          딜레마 상황이 발생하는 기술과 관련된 사회적인 배경, 맥락을 간략하게 소개해 주세요.
        </p>
      </div>

      {/* B, C 영역을 같은 행에 배치 */}
      <div style={{
        display: 'flex',
        gap: 100,
        alignItems: 'flex-start',
        marginBottom: '20px'
      }}>
        {/* B 영역 - 이미지 영역 */}
        <div style={{
          flex: '0 0 360px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* 이미지 표시 영역 */}
          <div
            style={{
              width: '100%',
              height: '180px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8f9fa',
              overflow: 'hidden'
            }}
          >
            <img
              src={isDefaultImage ? create02Image : URL.createObjectURL(image)}
              alt="딜레마 이미지"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '6px'
              }}
              onLoad={(e) => {
                if (!isDefaultImage && image) {
                  URL.revokeObjectURL(e.currentTarget.src);
                }
              }}
            />
          </div>

          {/* 이미지 변경 링크 */}
          <div style={{ textAlign: 'center' }}>
            <span
              onClick={handleImageChange}
              style={{
                color: '#333',
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: '3px'
              }}
            >
              이미지 변경
            </span>
          </div>

          {/* 안내문 */}
          <div style={{ textAlign: 'center' }}>
            <p style={{
              color: Colors.systemRed,
              ...FontStyles.bodyBold,
              margin: 0,
              lineHeight: 1.4
            }}>
              (*권장 이미지 비율 2:1)
            </p>
          </div>
        </div>

        {/* C 영역 - 입력 필드들 (opening 배열로 생성된 만큼 렌더링) */}
        <div style={{ flex: '1', marginTop: -10 }}>
          {inputs.map((input) => (
            <CreateInput
              key={input.id}
              label={input.label}
              value={input.value}
              onChange={(e) => handleInputChange(input.id, e.target.value)}
              placeholder={input.placeholder}
              onDelete={input.canDelete ? () => handleDeleteInput(input.id) : undefined}
            />
          ))}

          {/* + 버튼 - 기본은 5개 제한 유지. opening이 5개 이상이면 버튼 숨김 */}
          {inputs.length < 5 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <button
                onClick={handleAddInput}
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                <img src={inputPlusIcon} alt="입력 필드 추가" style={{ width: '40px', height: '40px' }} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '30px', right: '30px' }}>
        <NextGreen onClick={() => handleConfirm(title)} />
      </div>
    </CreatorLayout>
  );
}

