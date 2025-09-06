// import { useEffect, useState, useRef } from 'react';
// import CreatorLayout from '../components/Expanded/CreatorLayout';
// import { useNavigate } from 'react-router-dom';
// import { FontStyles, Colors } from '../components/styleConstants';
// import CreateInput from '../components/Expanded/CreateInput';
// import inputPlusIcon from '../assets/inputplus.svg'; 
// import create02Image from '../assets/images/create02.png';
// import NextGreen from "../components/NextOrange";
// import BackOrange from "../components/Expanded/BackOrange";
// import axiosInstance from '../api/axiosInstance';

// export default function Create03() {
//   const navigate = useNavigate();
//   const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");

//   // C 영역 - 상황(=dilemma.situation) 입력들
//   const [inputs, setInputs] = useState([
//     { id: 1, label: "화면 1 *", value: "", placeholder: "예: Homemate 사용자 최적화 시스템 업그레이드 공지", canDelete: false },
//     { id: 2, label: "화면 2 ", value: "", placeholder: "예: 업데이트를 하면 고객님의 감정, 건강 상태, 생활 습관 등을 자동으로 수집하여...", canDelete: true },
//     { id: 3, label: "화면 3 ", value: "", placeholder: " ", canDelete: true }
//   ]);

//   // B 영역 - 대표 이미지(옵션)
//   const [image, setImage] = useState(null);
//   const [isDefaultImage, setIsDefaultImage] = useState(true);

//   // D 영역 - 딜레마 질문/선택지
//   const [dilemmaQuestion, setDilemmaQuestion] = useState("");
//   const [option1, setOption1] = useState(""); // agree_label
//   const [option2, setOption2] = useState(""); // disagree_label

//   const didInit = useRef(false);
//   useEffect(() => {
//     if (didInit.current) return;
//     didInit.current = true;

//     try {
//       const raw = localStorage.getItem('data');
//       if (!raw){
//         console.log('data 없음');
//         return;

//       } 
//       const data = JSON.parse(raw);

//       const dilemma = data?.dilemma ?? {};
//       const situationArr = Array.isArray(dilemma?.situation) ? dilemma.situation : [];

//       // 상황 입력들을 배열 길이만큼 생성
//       if (situationArr.length > 0) {
//         const built = situationArr.map((text, idx) => ({
//           id: idx + 1,
//           label: `화면 ${idx + 1}${idx === 0 ? ' *' : ''}`,
//           value: text ?? '',
//           placeholder: idx === 0
//             ? "예: Homemate 사용자 최적화 시스템 업그레이드 공지"
//             : " ",
//           canDelete: idx !== 0
//         }));
//         setInputs(built);
//       }

//       setDilemmaQuestion(dilemma?.question ?? '');
//       setOption1(dilemma?.options?.agree_label ?? '');
//       setOption2(dilemma?.options?.disagree_label ?? '');
//     } catch (e) {
//       console.error('Failed to parse localStorage.data', e);
//     }
//   }, []);

//   const handleAddInput = () => {
//     setInputs(prev => {
//       if (prev.length >= 5) return prev;
//       const nextId = prev.reduce((m, it) => Math.max(m, it.id), 0) + 1;
//       return [
//         ...prev,
//         { id: nextId, label: `화면 ${prev.length + 1} `, value: "", placeholder: " ", canDelete: true }
//       ];
//     });
//   };
//   const handleDeleteInput = (idToDelete) => {
//     setInputs(prev => {
//       const filtered = prev.filter(input => input.id !== idToDelete);
//       return filtered.map((input, index) => ({
//         ...input,
//         id: index + 1,
//         label: `화면 ${index + 1} `,
//         canDelete: index !== 0
//       }));
//     });
//   };
//   const handleInputChange = (id, newValue) => {
//     setInputs(prev => prev.map(input => input.id === id ? { ...input, value: newValue } : input));
//   };
//   const handleImageChange = () => {
//     const input = document.createElement('input');
//     input.type = 'file'; input.accept = 'image/*';
//     input.onchange = (e) => {
//       const file = e.target.files?.[0];
//       if (file) { setImage(file); setIsDefaultImage(false); }
//     };
//     input.click();
//   };

//   const putDilemma = async ({ situation, question, options }) => {
//     const code = localStorage.getItem('code');
//     if (!code) throw new Error('게임 코드가 없습니다. (code)');

//     await axiosInstance.put(
//       `/custom-games/${code}/dilemma`,
//       { situation, question, options },
//       { headers: { 'Content-Type': 'application/json' } }
//     );
//   };

//   const handleNext = async () => {
//     try {
//       // 1) 현재 state → payload 구성
//       const situationRaw = [...inputs]
//         .sort((a, b) => a.id - b.id)
//         .map(it => (it.value ?? '').trim());

//       // 서버가 빈 문자열을 싫어할 수 있으니 최소 한 글자 보정(필요 시)
//       const safe = s => (s && s.length > 0 ? s : '-');
//       const situation = situationRaw.map(safe);
//       const question = safe((dilemmaQuestion ?? '').trim());
//       const agree_label = safe((option1 ?? '').trim());
//       const disagree_label = safe((option2 ?? '').trim());

//       const options = { agree_label, disagree_label };

//       // 2) 서버 PUT
//       await putDilemma({ situation, question, options });

//       // 3) 로컬 저장 (요청: dilmma_situation / question / agree_label / disagree_label)
//       localStorage.setItem('dilmma_situation', JSON.stringify(situation)); // 요청하신 키 철자 유지
//       // (안전하게 정석 키도 같이 저장하고 싶으면 아래 주석 해제)
//       // localStorage.setItem('dilemma_situation', JSON.stringify(situation));

//       localStorage.setItem('question', question);
//       localStorage.setItem('agree_label', agree_label);
//       localStorage.setItem('disagree_label', disagree_label);

//       // (선택) data 병합 저장까지 하고 싶다면:
//       // const raw = localStorage.getItem('data');
//       // let data = {};
//       // try { data = raw ? JSON.parse(raw) : {}; } catch { data = {}; }
//       // data.dilemma = { situation, question, options };
//       // localStorage.setItem('data', JSON.stringify(data));

//       // 4) 다음 페이지
//       navigate('/create04');
//     } catch (e) {
//       console.error(e);
//       alert('딜레마 저장 중 오류가 발생했습니다.');
//     }
//   };

//   const handleBack = () => navigate('/create02');

//   return (
//     <CreatorLayout
//       headerbar={2}
//       headerLeftType="home"
//       headerNextDisabled={true}
//       onHeaderNextClick={() => console.log('NEXT')}
//       frameProps={{
//         value: title,
//         onChange: (val) => setTitle(val),
//         onConfirm: (val) => {
//           setTitle(val);
//           localStorage.setItem("creatorTitle", val);
//         },
//       }}
//     >
//       {/* A 영역 - 타이틀 */}
//       <div style={{ marginTop: -50, marginBottom: '30px' }}>
//         <h2 style={{ ...FontStyles.headlineSmall, marginBottom: '16px', color: Colors.grey07 }}>상황</h2>
//         <p style={{ ...FontStyles.title, color: Colors.grey05, lineHeight: 1.5, marginBottom: '32px' }}>
//           딜레마 상황에 대해서 설명해주세요.
//         </p>
//       </div>

//       {/* B + C */}
//       <div style={{ display: 'flex', gap: 100, alignItems: 'flex-start', marginBottom: '10px' }}>
//         {/* B: 이미지 */}
//         <div style={{ flex: '0 0 360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
//           <div style={{ width: '100%', height: '180px', border: '2px solid #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', overflow: 'hidden' }}>
//             <img
//               src={isDefaultImage ? create02Image : URL.createObjectURL(image)}
//               alt="딜레마 이미지"
//               style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
//               onLoad={(e) => { if (!isDefaultImage && image) URL.revokeObjectURL(e.currentTarget.src); }}
//             />
//           </div>
//           <div style={{ textAlign: 'center' }}>
//             <span onClick={handleImageChange} style={{ color: '#333', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
//               이미지 변경
//             </span>
//           </div>
//           <div style={{ textAlign: 'center' }}>
//             <p style={{ color: Colors.systemRed, ...FontStyles.bodyBold, margin: 0, lineHeight: 1.4 }}>(*권장 이미지 비율 2:1)</p>
//           </div>
//         </div>

//         {/* C: 상황 입력들 */}
//         <div style={{ flex: '1', marginTop: -10 }}>
//           {inputs.map((input) => (
//             <CreateInput
//               key={input.id}
//               label={input.label}
//               value={input.value}
//               onChange={(e) => handleInputChange(input.id, e.target.value)}
//               placeholder={input.placeholder}
//               onDelete={input.canDelete ? () => handleDeleteInput(input.id) : undefined}
//             />
//           ))}
//           {inputs.length < 5 && (
//             <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
//               <button
//                 onClick={handleAddInput}
//                 style={{ width: '40px', height: '40px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
//               >
//                 <img src={inputPlusIcon} alt="입력 필드 추가" style={{ width: '40px', height: '40px' }} />
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* D: 딜레마 질문/선택지 */}
//       <div style={{ marginTop: 20, paddingBottom: 40 }}>
//         <h2 style={{ ...FontStyles.headlineSmall, marginBottom: "16px", color: Colors.grey07 }}>딜레마 질문 및 선택지</h2>
//         <p style={{ ...FontStyles.title, color: Colors.grey05, lineHeight: 1.5, marginBottom: "32px" }}>
//           위의 상황에 맞는 딜레마 질문과 선택지를 설정해 주세요. 게임에 참여하는 3명의 플레이어는 모두 딜레마 질문에 대한 답변을 선택합니다.
//         </p>

//         <CreateInput
//           width={900}
//           label="딜레마 질문*"
//           value={dilemmaQuestion}
//           onChange={(e) => setDilemmaQuestion(e.target.value)}
//           placeholder="예: Homemate 사용자 최적화 시스템 업그레이드 공지"
//         />
//         <CreateInput
//           width={900}
//           label="선택지1"
//           value={option1}
//           onChange={(e) => setOption1(e.target.value)}
//           placeholder="예: 동의"
//         />
//         <CreateInput
//           width={900}
//           label="선택지2"
//           value={option2}
//           onChange={(e) => setOption2(e.target.value)}
//           placeholder="예: 비동의"
//         />
//       </div>
//       {/* 하단 버튼 */}
//       <div style={{ position: 'absolute', bottom: '30px', right: '30px' }}>
//         <NextGreen onClick={handleNext} />
//       </div>
//       <div style={{ position: 'absolute', bottom: '30px', left: '30px' }}>
//         <BackOrange onClick={() => navigate('/create02')} />
//       </div>
//     </CreatorLayout>
//   );
// }

import { useEffect, useState, useRef } from 'react';
import CreatorLayout from '../components/Expanded/CreatorLayout';
import { useNavigate } from 'react-router-dom';
import { FontStyles, Colors } from '../components/styleConstants';
import CreateInput from '../components/Expanded/CreateInput';
import inputPlusIcon from '../assets/inputplus.svg'; 
import create02Image from '../assets/images/create02.png';
import NextGreen from "../components/NextOrange";
import BackOrange from "../components/Expanded/BackOrange";
import axiosInstance from '../api/axiosInstance';

export default function Create03() {
  const navigate = useNavigate();
  const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");

  // C 영역 - 상황(=dilemma.situation) 입력들
  const [inputs, setInputs] = useState([
    { id: 1, label: "화면 1 *", value: "", placeholder: "예: Homemate 사용자 최적화 시스템 업그레이드 공지", canDelete: false },
    { id: 2, label: "화면 2 ", value: "", placeholder: "예: 업데이트를 하면 고객님의 감정, 건강 상태, 생활 습관 등을 자동으로 수집하여...", canDelete: true },
    { id: 3, label: "화면 3 ", value: "", placeholder: " ", canDelete: true }
  ]);

  // B 영역 - 대표 이미지(옵션)
  const [image, setImage] = useState(null);
  const [isDefaultImage, setIsDefaultImage] = useState(true);

  // D 영역 - 딜레마 질문/선택지
  const [dilemmaQuestion, setDilemmaQuestion] = useState("");
  const [option1, setOption1] = useState(""); // agree_label
  const [option2, setOption2] = useState(""); // disagree_label
  const didInit = useRef(false);

  // ----- 로컬 저장 유틸 -----
  const toSituationArray = (list) =>
    [...list].sort((a,b)=>a.id-b.id).map(it => (it.value ?? '').trim());

  const persistSituation = (list) => {
    const arr = toSituationArray(list);
    // 요청하신 키 철자 유지
    localStorage.setItem('dilemma_situation', JSON.stringify(arr));
    // 필요하면 보조 키도 함께 저장(선택)
    // localStorage.setItem('dilemma_situation', JSON.stringify(arr));
  };
// 상태값을 로컬에 한 번에 저장
const persistAll = ({ situationInputs, question, agree, disagree }) => {
  if (Array.isArray(situationInputs)) {
    // 기존 유틸 사용해서 배열 → 문자열 배열로 변환 후 저장
    persistSituation(situationInputs);
  }
  localStorage.setItem('question', question ?? '');
  localStorage.setItem('agree_label', agree ?? '');
  localStorage.setItem('disagree_label', disagree ?? '');
};

  const persistQuestion = (q) => localStorage.setItem('question', q ?? '');
  const persistAgreeLabel = (v) => localStorage.setItem('agree_label', v ?? '');
  const persistDisagreeLabel = (v) => localStorage.setItem('disagree_label', v ?? '');
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
  
    try {
      // 개별 키 읽기
      const localSituationRawA = localStorage.getItem('dilmma_situation');
      const localSituationRawB = localStorage.getItem('dilemma_situation');
  
      let situationLocal = null;
      try {
        if (localSituationRawA) situationLocal = JSON.parse(localSituationRawA);
        else if (localSituationRawB) situationLocal = JSON.parse(localSituationRawB);
      } catch (e) { situationLocal = null; }
  
      const questionLocal  = localStorage.getItem('question');
      const agreeLocal     = localStorage.getItem('agree_label');
      const disagreeLocal  = localStorage.getItem('disagree_label');
  
      // 유효성: null/공백 제외
      const isValidStr = (v) => typeof v === 'string' && v.trim().length > 0;
      const isValidSituation = (arr) =>
        Array.isArray(arr) && arr.length > 0 && arr.every((s) => typeof s === 'string' && s.trim().length > 0);
  
      const hasAllLocal =
        isValidSituation(situationLocal) &&
        isValidStr(questionLocal) &&
        isValidStr(agreeLocal) &&
        isValidStr(disagreeLocal);
  
      if (hasAllLocal) {
        // 1) 개별 키 경로: state 세팅 + 즉시 로컬 저장(초기에도)
        const built = situationLocal.map((text, idx) => ({
          id: idx + 1,
          label: `화면 ${idx + 1}${idx === 0 ? ' *' : ''}`,
          value: text,
          placeholder: idx === 0
            ? "예: Homemate 사용자 최적화 시스템 업그레이드 공지"
            : " ",
          canDelete: idx !== 0,
        }));
        const q = questionLocal.trim();
        const a = agreeLocal.trim();
        const d = disagreeLocal.trim();
  
        setInputs(built);
        setDilemmaQuestion(q);
        setOption1(a);
        setOption2(d);
  
        // ✅ 초기 로드 시에도 로컬에 저장(동일 값 재기록 무방)
        persistAll({ situationInputs: built, question: q, agree: a, disagree: d });
        return;
      }
  
      // 2) data 폴백 경로: state 세팅 + 즉시 로컬 저장(초기에도)
      const raw = localStorage.getItem('data');
      if (!raw) {
        console.log('data 없음');
        return;
      }
      const data = JSON.parse(raw);
      const dilemma = (data && data.dilemma) ? data.dilemma : {};
      const situationArr = Array.isArray(dilemma.situation) ? dilemma.situation : [];
  
      let built = [];
      if (situationArr.length > 0) {
        built = situationArr.map((text, idx) => ({
          id: idx + 1,
          label: `화면 ${idx + 1}${idx === 0 ? ' *' : ''}`,
          value: text || '',
          placeholder: idx === 0
            ? "예: Homemate 사용자 최적화 시스템 업그레이드 공지"
            : " ",
          canDelete: idx !== 0,
        }));
        setInputs(built);
      }
  
      const q = (dilemma.question || '').trim();
      const a = ((dilemma.options && dilemma.options.agree_label) || '').trim();
      const d = ((dilemma.options && dilemma.options.disagree_label) || '').trim();
  
      setDilemmaQuestion(q);
      setOption1(a);
      setOption2(d);
  
      // ✅ 폴백으로 세팅한 값도 “초기 로드 시점에 로컬에 저장”
      persistAll({ situationInputs: built, question: q, agree: a, disagree: d });
  
    } catch (e) {
      console.error('Failed to parse localStorage.data', e);
    }
  }, []);
  

  // ----- 입력/추가/삭제 핸들러 (즉시 로컬 저장) -----
  const handleAddInput = () => {
    setInputs(prev => {
      if (prev.length >= 5) return prev;
      const nextId = prev.reduce((m, it) => Math.max(m, it.id), 0) + 1;
      const next = [
        ...prev,
        { id: nextId, label: `화면 ${prev.length + 1} `, value: "", placeholder: " ", canDelete: true }
      ];
      persistSituation(next); //  즉시 저장
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
        canDelete: index !== 0
      }));
      persistSituation(next); //  즉시 저장
      return next;
    });
  };

  const handleInputChange = (id, newValue) => {
    setInputs(prev => {
      const next = prev.map(input => input.id === id ? { ...input, value: newValue } : input);
      persistSituation(next); //  즉시 저장
      return next;
    });
  };

  const handleImageChange = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) { setImage(file); setIsDefaultImage(false); }
    };
    input.click();
  };

  // ----- 질문/선택지 입력 즉시 저장 -----
  const onChangeQuestion = (e) => {
    const v = e.target.value ?? '';
    setDilemmaQuestion(v);
    persistQuestion(v); // 
  };
  const onChangeAgree = (e) => {
    const v = e.target.value ?? '';
    setOption1(v);
    persistAgreeLabel(v); // 
  };
  const onChangeDisagree = (e) => {
    const v = e.target.value ?? '';
    setOption2(v);
    persistDisagreeLabel(v); // 
  };

  // ----- 서버 PUT -----
  const putDilemma = async ({ situation, question, options }) => {
    const code = localStorage.getItem('code');
    if (!code) throw new Error('게임 코드가 없습니다. (code)');

    await axiosInstance.put(
      `/custom-games/${code}/dilemma`,
      { situation, question, options },
      { headers: { 'Content-Type': 'application/json' } }
    );
  };

  const handleNext = async () => {
    try {
      const situationRaw = toSituationArray(inputs);
      const safe = s => (s && s.length > 0 ? s : '-');

      const situation = situationRaw.map(safe);
      const question = safe((dilemmaQuestion ?? '').trim());
      const agree_label = safe((option1 ?? '').trim());
      const disagree_label = safe((option2 ?? '').trim());

      const options = { agree_label, disagree_label };

      // 서버 PUT
      await putDilemma({ situation, question, options });

      //  마지막으로 한 번 더 로컬 보강 저장
      localStorage.setItem('dilmma_situation', JSON.stringify(situation));
      localStorage.setItem('question', question);
      localStorage.setItem('agree_label', agree_label);
      localStorage.setItem('disagree_label', disagree_label);

      navigate('/create04');
    } catch (e) {
      console.error(e);
      alert('딜레마 저장 중 오류가 발생했습니다.');
    }
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
      {/* A 영역 - 타이틀 */}
      <div style={{ marginTop: -50, marginBottom: '30px' }}>
        <h2 style={{ ...FontStyles.headlineSmall, marginBottom: '16px', color: Colors.grey07 }}>상황</h2>
        <p style={{ ...FontStyles.title, color: Colors.grey05, lineHeight: 1.5, marginBottom: '32px' }}>
          딜레마 상황에 대해서 설명해주세요.
        </p>
      </div>

      {/* B + C */}
      <div style={{ display: 'flex', gap: 100, alignItems: 'flex-start', marginBottom: '10px' }}>
        {/* B: 이미지 */}
        <div style={{ flex: '0 0 360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ width: '100%', height: '180px', border: '2px solid #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', overflow: 'hidden' }}>
            <img
              src={isDefaultImage ? create02Image : URL.createObjectURL(image)}
              alt="딜레마 이미지"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
              onLoad={(e) => { if (!isDefaultImage && image) URL.revokeObjectURL(e.currentTarget.src); }}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <span onClick={handleImageChange} style={{ color: '#333', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              이미지 변경
            </span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: Colors.systemRed, ...FontStyles.bodyBold, margin: 0, lineHeight: 1.4 }}>(*권장 이미지 비율 2:1)</p>
          </div>
        </div>

        {/* C: 상황 입력들 */}
        <div style={{ flex: '1', marginTop: -10 }}>
          {inputs.map((input) => (
            <CreateInput
              key={input.id}
              label={input.label}
              value={input.value}
              onChange={(e) => handleInputChange(input.id, e.target.value)}  // ✅ 즉시 저장
              placeholder={input.placeholder}
              onDelete={input.canDelete ? () => handleDeleteInput(input.id) : undefined} // ✅ 즉시 저장
            />
          ))}
          {inputs.length < 5 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <button
                onClick={handleAddInput} // 
                style={{ width: '40px', height: '40px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                <img src={inputPlusIcon} alt="입력 필드 추가" style={{ width: '40px', height: '40px' }} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* D: 딜레마 질문/선택지 */}
      <div style={{ marginTop: 20, paddingBottom: 40 }}>
        <h2 style={{ ...FontStyles.headlineSmall, marginBottom: "16px", color: Colors.grey07 }}>딜레마 질문 및 선택지</h2>
        <p style={{ ...FontStyles.title, color: Colors.grey05, lineHeight: 1.5, marginBottom: "32px" }}>
          위의 상황에 맞는 딜레마 질문과 선택지를 설정해 주세요. 게임에 참여하는 3명의 플레이어는 모두 딜레마 질문에 대한 답변을 선택합니다.
        </p>

        <CreateInput
          width={900}
          label="딜레마 질문*"
          value={dilemmaQuestion}
          onChange={onChangeQuestion} // ✅ 즉시 저장
          placeholder="예: Homemate 사용자 최적화 시스템 업그레이드 공지"
        />

        <CreateInput
          width={900}
          label="선택지1"
          value={option1}
          onChange={onChangeAgree} 
          placeholder="예: 동의"
        />

        <CreateInput
          width={900}
          label="선택지2"
          value={option2}
          onChange={onChangeDisagree} 
          placeholder="예: 비동의"
        />
      </div>

      {/* 하단 버튼 */}
      <div style={{ position: 'absolute', bottom: '30px', right: '30px' }}>
        <NextGreen onClick={handleNext} />
      </div>
      <div style={{ position: 'absolute', bottom: '30px', left: '30px' }}>
        <BackOrange onClick={() => navigate('/create02')} />
      </div>
    </CreatorLayout>
  );
}
