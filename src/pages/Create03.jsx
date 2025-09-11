// // 이미지 처리 - 로컬 우선, 모두 있으면 GET 스킵
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

// // 절대 URL 보정
// const resolveImageUrl = (raw) => {
//   if (!raw || raw === '-' || String(raw).trim() === '') return null;
//   const u = String(raw).trim();
//   if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
//   const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
//   if (!base) return u;
//   return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
// };

// // 이미지 업로드
// async function uploadRepresentativeImage(file) {
//   const form = new FormData();
//   form.append('file', file);
//   const res = await axiosInstance.post('/custom-games/upload-image', form, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
//   const url = res?.data?.url || res?.data?.image_url;
//   if (!url) throw new Error('업로드 응답에 url이 없습니다.');
//   return url;
// }

// // 서버 응답에서 키를 다층으로 탐색
// const pickStringFrom = (game, key) => {
//   const layers = [game, game?.data, game?.images, game?.data?.images, game?.dilemma, game?.data?.dilemma];
//   for (const l of layers) {
//     const v = l?.[key];
//     if (typeof v === 'string' && v.trim()) return v;
//   }
//   return null;
// };
// const pickArrayFrom = (game, key) => {
//   const layers = [game, game?.data, game?.dilemma, game?.data?.dilemma];
//   for (const l of layers) {
//     const v = l?.[key];
//     if (Array.isArray(v) && v.length) return v;
//   }
//   return null;
// };

// export default function Create03() {
//   const navigate = useNavigate();
//   const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");

//   // 상황 입력들
//   const [inputs, setInputs] = useState([
//     { id: 1, label: "화면 1 *", value: "", placeholder: "예: Homemate 사용자 최적화 시스템 업그레이드 공지", canDelete: false },
//     { id: 2, label: "화면 2 ", value: "", placeholder: "예: 업데이트를 하면 고객님의 감정, 건강 상태, 생활 습관 등을 자동으로 수집하여...", canDelete: true },
//     { id: 3, label: "화면 3 ", value: "", placeholder: " ", canDelete: true }
//   ]);

//   // 대표 이미지(URL + 폴백)
//   const [imageUrl, setImageUrl] = useState(() => resolveImageUrl(localStorage.getItem('dilemma_image_3')));
//   const [useFallback, setUseFallback] = useState(() => !resolveImageUrl(localStorage.getItem('dilemma_image_3')));

//   // 질문/선택지
//   const [dilemmaQuestion, setDilemmaQuestion] = useState(localStorage.getItem('question') || "");
//   const [option1, setOption1] = useState(localStorage.getItem('agree_label') || "");
//   const [option2, setOption2] = useState(localStorage.getItem('disagree_label') || "");
//   const didInit = useRef(false);

//   // 유틸
//   const toSituationArray = (list) =>
//     [...list].sort((a,b)=>a.id-b.id).map(it => (it.value ?? '').trim());
//   const persistSituation = (list) => {
//     const arr = toSituationArray(list);
//     localStorage.setItem('dilemma_situation', JSON.stringify(arr));
//   };
//   const persistAll = ({ situationInputs, question, agree, disagree }) => {
//     if (Array.isArray(situationInputs)) persistSituation(situationInputs);
//     if (typeof question === 'string') localStorage.setItem('question', question);
//     if (typeof agree === 'string') localStorage.setItem('agree_label', agree);
//     if (typeof disagree === 'string') localStorage.setItem('disagree_label', disagree);
//   };
//   const persistQuestion = (v) => {
//     localStorage.setItem('question', v ?? '');
//   };
//   const persistAgreeLabel = (v) => {
//     localStorage.setItem('agree_label', v ?? '');
//   };
//   const persistDisagreeLabel = (v) => {
//     localStorage.setItem('disagree_label', v ?? '');
//   };
//   const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
//   const isValidSituation = (arr) => Array.isArray(arr) && arr.length > 0 && arr.every(s => isNonEmptyString(s));

//   useEffect(() => {
//     if (didInit.current) return;
//     didInit.current = true;

//     // 1) 로컬 값 전부 있으면 GET 스킵
//     let localSituation = null;
//     try {
//       // 오타 호환 'dilmma_situation'도 체크(있으면 사용)
//       const raw = localStorage.getItem('dilemma_situation') || localStorage.getItem('dilmma_situation');
//       localSituation = raw ? JSON.parse(raw) : null;
//     } catch {}

//     const localImage = resolveImageUrl(localStorage.getItem('dilemma_image_3'));
//     const localQuestion = localStorage.getItem('question') || '';
//     const localAgree    = localStorage.getItem('agree_label') || '';
//     const localDisagree = localStorage.getItem('disagree_label') || '';

//     const hasAllLocal =
//       !!localImage &&
//       isValidSituation(localSituation) &&
//       isNonEmptyString(localQuestion) &&
//       isNonEmptyString(localAgree) &&
//       isNonEmptyString(localDisagree);

//     if (hasAllLocal) {
//       // 이미지 상태
//       setImageUrl(localImage);
//       setUseFallback(false);

//       // 입력 상태
//       const built = localSituation.map((text, idx) => ({
//         id: idx + 1,
//         label: `화면 ${idx + 1}${idx === 0 ? ' *' : ''}`,
//         value: text,
//         placeholder: idx === 0 ? "예: Homemate 사용자 최적화 시스템 업그레이드 공지" : " ",
//         canDelete: idx !== 0,
//       }));
//       setInputs(built);
//       setDilemmaQuestion(localQuestion);
//       setOption1(localAgree);
//       setOption2(localDisagree);
//       persistAll({ situationInputs: built, question: localQuestion, agree: localAgree, disagree: localDisagree });
//       return; // ✅ GET 스킵
//     }

//     // 2) 일부만 있거나 없으면 GET 시도(비는 값만 채움)
//     (async () => {
//       try {
//         const code = localStorage.getItem('code');
//         if (!code) {
//           // code 없으면 GET 불가 → 로컬/폴백만 마무리
//           setImageUrl(localImage); setUseFallback(!localImage);

//           if (isValidSituation(localSituation)) {
//             setInputs(localSituation.map((text, idx) => ({
//               id: idx + 1,
//               label: `화면 ${idx + 1}${idx === 0 ? ' *' : ''}`,
//               value: text,
//               placeholder: idx === 0 ? "예: Homemate 사용자 최적화 시스템 업그레이드 공지" : " ",
//               canDelete: idx !== 0,
//             })));
//           }
//           if (isNonEmptyString(localQuestion)) setDilemmaQuestion(localQuestion);
//           if (isNonEmptyString(localAgree)) setOption1(localAgree);
//           if (isNonEmptyString(localDisagree)) setOption2(localDisagree);
//           return;
//         }

//         const res = await axiosInstance.get(`/custom-games/${code}`, {
//           headers: { 'Content-Type': 'application/json' },
//         });
//         const game = res?.data || {};
//         const serverDilemma = game?.dilemma || game?.data?.dilemma || {};

//         // 이미지: 대표이미지 대신 전용 키 우선(dilemma_image_3)
//         const rawImg =
//           pickStringFrom(game, 'dilemma_image_3') ||
//           null; // 필요 시 다른 백워드 키 추가 가능

//         // 텍스트들
//         const serverSituation = pickArrayFrom(serverDilemma, 'situation');
//         const serverQuestion  = serverDilemma?.question;
//         const serverAgree     = serverDilemma?.options?.agree_label;
//         const serverDisagree  = serverDilemma?.options?.disagree_label;

//         // 각 항목은 "없을 때만" 채움 + 로컬 저장 승격
//         // 이미지
//         const finalImg = localImage || resolveImageUrl(rawImg);
//         setImageUrl(finalImg); setUseFallback(!finalImg);
//         if (!localImage && rawImg) localStorage.setItem('dilemma_image_3', rawImg);

//         // 상황 배열
//         const finalSituation = isValidSituation(localSituation)
//           ? localSituation
//           : (isValidSituation(serverSituation) ? serverSituation : null);
//         if (finalSituation) {
//           const built = finalSituation.map((text, idx) => ({
//             id: idx + 1,
//             label: `화면 ${idx + 1}${idx === 0 ? ' *' : ''}`,
//             value: text ?? '',
//             placeholder: idx === 0 ? "예: Homemate 사용자 최적화 시스템 업그레이드 공지" : " ",
//             canDelete: idx !== 0,
//           }));
//           setInputs(built);
//           localStorage.setItem('dilemma_situation', JSON.stringify(finalSituation));
//         }

//         // 질문/선택지
//         const finalQuestion  = isNonEmptyString(localQuestion)  ? localQuestion  : (serverQuestion  || '');
//         const finalAgree     = isNonEmptyString(localAgree)     ? localAgree     : (serverAgree     || '');
//         const finalDisagree  = isNonEmptyString(localDisagree)  ? localDisagree  : (serverDisagree  || '');
//         setDilemmaQuestion(finalQuestion);
//         setOption1(finalAgree);
//         setOption2(finalDisagree);
//         if (!isNonEmptyString(localQuestion) && isNonEmptyString(finalQuestion))  localStorage.setItem('question', finalQuestion);
//         if (!isNonEmptyString(localAgree)    && isNonEmptyString(finalAgree))     localStorage.setItem('agree_label', finalAgree);
//         if (!isNonEmptyString(localDisagree) && isNonEmptyString(finalDisagree))  localStorage.setItem('disagree_label', finalDisagree);

//       } catch (e) {
//         console.error('GET 실패:', e);
//         // 실패 시 로컬/폴백 유지
//         setImageUrl(localImage); setUseFallback(!localImage);
//         if (isValidSituation(localSituation)) {
//           const built = localSituation.map((text, idx) => ({
//             id: idx + 1,
//             label: `화면 ${idx + 1}${idx === 0 ? ' *' : ''}`,
//             value: text,
//             placeholder: idx === 0 ? "예: Homemate 사용자 최적화 시스템 업그레이드 공지" : " ",
//             canDelete: idx !== 0,
//           }));
//           setInputs(built);
//         }
//         if (isNonEmptyString(localQuestion)) setDilemmaQuestion(localQuestion);
//         if (isNonEmptyString(localAgree)) setOption1(localAgree);
//         if (isNonEmptyString(localDisagree)) setOption2(localDisagree);
//       }
//     })();
//   }, []);

//   // 입력 즉시 로컬 저장
//   const handleAddInput = () => {
//     setInputs(prev => {
//       if (prev.length >= 5) return prev;
//       const nextId = prev.reduce((m, it) => Math.max(m, it.id), 0) + 1;
//       const next = [...prev, { id: nextId, label: `화면 ${prev.length + 1} `, value: "", placeholder: " ", canDelete: true }];
//       persistSituation(next);
//       return next;
//     });
//   };
//   const handleDeleteInput = (idToDelete) => {
//     setInputs(prev => {
//       const filtered = prev.filter(input => input.id !== idToDelete);
//       const next = filtered.map((input, index) => ({
//         ...input, id: index + 1, label: `화면 ${index + 1} `, canDelete: index !== 0
//       }));
//       persistSituation(next);
//       return next;
//     });
//   };
//   const handleInputChange = (id, newValue) => {
//     setInputs(prev => {
//       const next = prev.map(input => input.id === id ? { ...input, value: newValue } : input);
//       persistSituation(next);
//       return next;
//     });
//   };

//   // 대표 이미지 변경 (POST → 로컬 → 상태)
//   const handleImageChange = () => {
//     const input = document.createElement('input');
//     input.type = 'file';
//     input.accept = 'image/*';
//     input.onchange = async (e) => {
//       const file = e.target.files?.[0];
//       if (!file) return;
//       try {
//         setUseFallback(false);
//         const rawUrl = await uploadRepresentativeImage(file);
//         localStorage.setItem('dilemma_image_3', rawUrl);
//         const resolved = resolveImageUrl(rawUrl);
//         setImageUrl(resolved);
//         setUseFallback(!resolved);
//       } catch (err) {
//         console.error(err);
//         alert('대표 이미지 업로드에 실패했습니다.');
//         setUseFallback(true);
//       }
//     };
//     input.click();
//   };

//   // 서버 PUT
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
//       const situationRaw = toSituationArray(inputs);
//       const safe = s => (s && s.length > 0 ? s : '-');

//       const situation = situationRaw.map(safe);
//       const question = safe((dilemmaQuestion ?? '').trim());
//       const agree_label = safe((option1 ?? '').trim());
//       const disagree_label = safe((option2 ?? '').trim());

//       await putDilemma({ situation, question, options: { agree_label, disagree_label } });

//       // 로컬 보강 저장
//       localStorage.setItem('dilmma_situation', JSON.stringify(situation)); // (오타 호환)
//       localStorage.setItem('dilemma_situation', JSON.stringify(situation));
//       localStorage.setItem('question', question);
//       localStorage.setItem('agree_label', agree_label);
//       localStorage.setItem('disagree_label', disagree_label);

//       navigate('/create04');
//     } catch (e) {
//       console.error(e);
//       alert('딜레마 저장 중 오류가 발생했습니다.');
//     }
//   };

//   return (
//     <CreatorLayout
//       headerbar={2}
//       headerLeftType="home"
//       headerNextDisabled={true}
//       onHeaderNextClick={() => {}}
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
//         {/* B: 대표 이미지 */}
//         <div style={{ flex: '0 0 360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
//           <div style={{
//             width: '100%', height: '180px', border: '2px solid #ddd', borderRadius: '8px',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             backgroundColor: '#f8f9fa', overflow: 'hidden'
//           }}>
//             <img
//               src={!useFallback && imageUrl ? imageUrl : create02Image}
//               alt="딜레마 대표 이미지"
//               style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
//               onError={() => setUseFallback(true)}
//               onLoad={() => setUseFallback(false)}
//             />
//           </div>
//           <div style={{ textAlign: 'center' }}>
//             <span
//               onClick={handleImageChange}
//               style={{ color: '#333', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}
//             >
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
//           onChange={(e) => { const v = e.target.value ?? ''; setDilemmaQuestion(v); persistQuestion(v); }}
//           placeholder="예: Homemate 사용자 최적화 시스템 업그레이드 공지"
//         />
//         <CreateInput
//           width={900}
//           label="선택지1"
//           value={option1}
//           onChange={(e) => { const v = e.target.value ?? ''; setOption1(v); persistAgreeLabel(v); }}
//           placeholder="예: 동의"
//         />
//         <CreateInput
//           width={900}
//           label="선택지2"
//           value={option2}
//           onChange={(e) => { const v = e.target.value ?? ''; setOption2(v); persistDisagreeLabel(v); }}
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
// 이미지 처리 - 로컬 우선, 모두 있으면 GET 스킵
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

// 절대 URL 보정
const resolveImageUrl = (raw) => {
  if (!raw || raw === '-' || String(raw).trim() === '') return null;
  const u = String(raw).trim();
  if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
  const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
  if (!base) return u;
  return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
};

// 이미지 업로드
async function uploadRepresentativeImage(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await axiosInstance.post('/custom-games/upload-image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const url = res?.data?.url || res?.data?.image_url;
  if (!url) throw new Error('업로드 응답에 url이 없습니다.');
  return url;
}

// 서버 응답에서 키를 다층으로 탐색
const pickStringFrom = (game, key) => {
  const layers = [game, game?.data, game?.images, game?.data?.images, game?.dilemma, game?.data?.dilemma];
  for (const l of layers) {
    const v = l?.[key];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return null;
};
const pickArrayFrom = (game, key) => {
  const layers = [game, game?.data, game?.dilemma, game?.data?.dilemma];
  for (const l of layers) {
    const v = l?.[key];
    if (Array.isArray(v) && v.length) return v;
  }
  return null;
};
// ✅ 대표 이미지 맵 GET → localStorage 저장

async function fetchRepresentativeImages(code) {
  if (!code) throw new Error('게임 코드가 없습니다. (code)');
  const res = await axiosInstance.get(`/custom-games/${code}/representative-images`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const images = res?.data?.images || {};

  // 4개 키를 모두 저장
  const keys = ['dilemma_image_1', 'dilemma_image_3', 'dilemma_image_4_1', 'dilemma_image_4_2'];
  keys.forEach((k) => {
    if (images[k] !== undefined) {
      localStorage.setItem(k, images[k] ?? '');
    }
  });

  return images;
}

// ✅ 대표 이미지 맵 PUT (부분 업데이트 가능)
async function putRepresentativeImages(code, imagesMap) {
  if (!code) throw new Error('게임 코드가 없습니다. (code)');
  const payload = { images: imagesMap };
  await axiosInstance.put(
    `/custom-games/${code}/representative-images`,
    payload,
    { headers: { 'Content-Type': 'application/json' } }
  );
}

export default function Create03() {
  const navigate = useNavigate();
  const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");

  // 상황 입력들
  const [inputs, setInputs] = useState([
    { id: 1, label: "화면 1 *", value: "", placeholder: "예: Homemate 사용자 최적화 시스템 업그레이드 공지", canDelete: false },
    { id: 2, label: "화면 2 ", value: "", placeholder: "예: 업데이트를 하면 고객님의 감정, 건강 상태, 생활 습관 등을 자동으로 수집하여...", canDelete: true },
    { id: 3, label: "화면 3 ", value: "", placeholder: " ", canDelete: true }
  ]);

  // 대표 이미지(URL + 폴백)
  const [imageUrl, setImageUrl] = useState(() => resolveImageUrl(localStorage.getItem('dilemma_image_3')));
  const [useFallback, setUseFallback] = useState(() => !resolveImageUrl(localStorage.getItem('dilemma_image_3')));

  // 질문/선택지
  const [dilemmaQuestion, setDilemmaQuestion] = useState(localStorage.getItem('question') || "");
  const [option1, setOption1] = useState(localStorage.getItem('agree_label') || "");
  const [option2, setOption2] = useState(localStorage.getItem('disagree_label') || "");
  const didInit = useRef(false);
  const code = localStorage.getItem('code');

  // 유틸
  const toSituationArray = (list) =>
    [...list].sort((a,b)=>a.id-b.id).map(it => (it.value ?? '').trim());
  const persistSituation = (list) => {
    const arr = toSituationArray(list);
    localStorage.setItem('dilemma_situation', JSON.stringify(arr));
  };
  const persistAll = ({ situationInputs, question, agree, disagree }) => {
    if (Array.isArray(situationInputs)) persistSituation(situationInputs);
    if (typeof question === 'string') localStorage.setItem('question', question);
    if (typeof agree === 'string') localStorage.setItem('agree_label', agree);
    if (typeof disagree === 'string') localStorage.setItem('disagree_label', disagree);
  };
  const persistQuestion = (v) => {
    localStorage.setItem('question', v ?? '');
  };
  const persistAgreeLabel = (v) => {
    localStorage.setItem('agree_label', v ?? '');
  };
  const persistDisagreeLabel = (v) => {
    localStorage.setItem('disagree_label', v ?? '');
  };
  const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
  const isValidSituation = (arr) => Array.isArray(arr) && arr.length > 0 && arr.every(s => isNonEmptyString(s));

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    // 1) 로컬 값 전부 있으면 GET 스킵
    let localSituation = null;
    try {
      // 오타 호환 'dilmma_situation'도 체크(있으면 사용)
      const raw = localStorage.getItem('dilemma_situation') || localStorage.getItem('dilmma_situation');
      localSituation = raw ? JSON.parse(raw) : null;
    } catch {}

    // ✅ 대표 이미지: 로컬 우선, 없으면 GET
      const localImage = resolveImageUrl(localStorage.getItem('dilemma_image_3'));
      if (localImage) {
        setImageUrl(localImage);
        setUseFallback(false);
      } else if (code) {
        (async () => {
          try {
            const images = await fetchRepresentativeImages(code);
            const img3 = images?.dilemma_image_3 ?? localStorage.getItem('dilemma_image_3') ?? '';
            const resolved = resolveImageUrl(img3);
            setImageUrl(resolved);
            setUseFallback(!resolved);
          } catch (err) {
            console.error('대표 이미지 로드 실패:', err);
            setImageUrl(null);
            setUseFallback(true);
          }
        })();
      }
    const localQuestion = localStorage.getItem('question') || '';
    const localAgree    = localStorage.getItem('agree_label') || '';
    const localDisagree = localStorage.getItem('disagree_label') || '';

    const hasAllLocal =
      !!localImage &&
      isValidSituation(localSituation) &&
      isNonEmptyString(localQuestion) &&
      isNonEmptyString(localAgree) &&
      isNonEmptyString(localDisagree);

    if (hasAllLocal) {
      // 이미지 상태
      setImageUrl(localImage);
      setUseFallback(false);

      // 입력 상태
      const built = localSituation.map((text, idx) => ({
        id: idx + 1,
        label: `화면 ${idx + 1}${idx === 0 ? ' *' : ''}`,
        value: text,
        placeholder: idx === 0 ? "예: Homemate 사용자 최적화 시스템 업그레이드 공지" : " ",
        canDelete: idx !== 0,
      }));
      setInputs(built);
      setDilemmaQuestion(localQuestion);
      setOption1(localAgree);
      setOption2(localDisagree);
      persistAll({ situationInputs: built, question: localQuestion, agree: localAgree, disagree: localDisagree });
      return; 
    }

    (async () => {
      try {
        if (!code) {
          // code 없으면 GET 불가 → 로컬/폴백만 마무리
          setImageUrl(localImage); setUseFallback(!localImage);

          if (isValidSituation(localSituation)) {
            setInputs(localSituation.map((text, idx) => ({
              id: idx + 1,
              label: `화면 ${idx + 1}${idx === 0 ? ' *' : ''}`,
              value: text,
              placeholder: idx === 0 ? "예: Homemate 사용자 최적화 시스템 업그레이드 공지" : " ",
              canDelete: idx !== 0,
            })));
          }
          if (isNonEmptyString(localQuestion)) setDilemmaQuestion(localQuestion);
          if (isNonEmptyString(localAgree)) setOption1(localAgree);
          if (isNonEmptyString(localDisagree)) setOption2(localDisagree);
          return;
        }

        const res = await axiosInstance.get(`/custom-games/${code}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        const game = res?.data || {};
        const serverDilemma = game?.dilemma || game?.data?.dilemma || {};

        // 이미지: 대표이미지 대신 전용 키 우선(dilemma_image_3)
        const rawImg =
          pickStringFrom(game, 'dilemma_image_3') ||
          null; // 필요 시 다른 백워드 키 추가 가능

        // 텍스트들
        const serverSituation = pickArrayFrom(serverDilemma, 'situation');
        const serverQuestion  = serverDilemma?.question;
        const serverAgree     = serverDilemma?.options?.agree_label;
        const serverDisagree  = serverDilemma?.options?.disagree_label;

        // 각 항목은 "없을 때만" 채움 + 로컬 저장 승격
        // 이미지
        const finalImg = localImage || resolveImageUrl(rawImg);
        setImageUrl(finalImg); setUseFallback(!finalImg);
        if (!localImage && rawImg) localStorage.setItem('dilemma_image_3', rawImg);

        // 상황 배열
        const finalSituation = isValidSituation(localSituation)
          ? localSituation
          : (isValidSituation(serverSituation) ? serverSituation : null);
        if (finalSituation) {
          const built = finalSituation.map((text, idx) => ({
            id: idx + 1,
            label: `화면 ${idx + 1}${idx === 0 ? ' *' : ''}`,
            value: text ?? '',
            placeholder: idx === 0 ? "예: Homemate 사용자 최적화 시스템 업그레이드 공지" : " ",
            canDelete: idx !== 0,
          }));
          setInputs(built);
          localStorage.setItem('dilemma_situation', JSON.stringify(finalSituation));
        }

        // 질문/선택지
        const finalQuestion  = isNonEmptyString(localQuestion)  ? localQuestion  : (serverQuestion  || '');
        const finalAgree     = isNonEmptyString(localAgree)     ? localAgree     : (serverAgree     || '');
        const finalDisagree  = isNonEmptyString(localDisagree)  ? localDisagree  : (serverDisagree  || '');
        setDilemmaQuestion(finalQuestion);
        setOption1(finalAgree);
        setOption2(finalDisagree);
        if (!isNonEmptyString(localQuestion) && isNonEmptyString(finalQuestion))  localStorage.setItem('question', finalQuestion);
        if (!isNonEmptyString(localAgree)    && isNonEmptyString(finalAgree))     localStorage.setItem('agree_label', finalAgree);
        if (!isNonEmptyString(localDisagree) && isNonEmptyString(finalDisagree))  localStorage.setItem('disagree_label', finalDisagree);

      } catch (e) {
        console.error('GET 실패:', e);
        // 실패 시 로컬/폴백 유지
        setImageUrl(localImage); setUseFallback(!localImage);
        if (isValidSituation(localSituation)) {
          const built = localSituation.map((text, idx) => ({
            id: idx + 1,
            label: `화면 ${idx + 1}${idx === 0 ? ' *' : ''}`,
            value: text,
            placeholder: idx === 0 ? "예: Homemate 사용자 최적화 시스템 업그레이드 공지" : " ",
            canDelete: idx !== 0,
          }));
          setInputs(built);
        }
        if (isNonEmptyString(localQuestion)) setDilemmaQuestion(localQuestion);
        if (isNonEmptyString(localAgree)) setOption1(localAgree);
        if (isNonEmptyString(localDisagree)) setOption2(localDisagree);
      }
    })();
  }, []);

  // 입력 즉시 로컬 저장
  const handleAddInput = () => {
    setInputs(prev => {
      if (prev.length >= 5) return prev;
      const nextId = prev.reduce((m, it) => Math.max(m, it.id), 0) + 1;
      const next = [...prev, { id: nextId, label: `화면 ${prev.length + 1} `, value: "", placeholder: " ", canDelete: true }];
      persistSituation(next);
      return next;
    });
  };
  const handleDeleteInput = (idToDelete) => {
    setInputs(prev => {
      const filtered = prev.filter(input => input.id !== idToDelete);
      const next = filtered.map((input, index) => ({
        ...input, id: index + 1, label: `화면 ${index + 1} `, canDelete: index !== 0
      }));
      persistSituation(next);
      return next;
    });
  };
  const handleInputChange = (id, newValue) => {
    setInputs(prev => {
      const next = prev.map(input => input.id === id ? { ...input, value: newValue } : input);
      persistSituation(next);
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

    const code = localStorage.getItem('code');
    if (!code) {
      alert('게임 코드가 없습니다.');
      return;
    }

    try {
      setUseFallback(false);

      // 1) 업로드로 서버에 이미지 파일 전송 → URL 획득
      const url = await uploadRepresentativeImage(file); // 예: "/static/images/cg_xxx1.png" 또는 절대 URL

      // 2) 대표 이미지 맵 PUT: 이 화면에서는 dilemma_image_1만 갱신
      await putRepresentativeImages(code, { dilemma_image_3: url });

      // 3) 로컬/화면 반영
      localStorage.setItem('dilemma_image_3', url);
      const resolved = resolveImageUrl(url);
      setImageUrl(resolved);
      setUseFallback(!resolved);
    } catch (err) {
      console.error(err);
      alert('이미지 업로드/저장에 실패했습니다.');
      setUseFallback(true);
    }
  };
  input.click();
};


  // 서버 PUT
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

      await putDilemma({ situation, question, options: { agree_label, disagree_label } });

      // 로컬 보강 저장
      localStorage.setItem('dilmma_situation', JSON.stringify(situation)); // (오타 호환)
      localStorage.setItem('dilemma_situation', JSON.stringify(situation));
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
      onHeaderNextClick={() => {}}
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
        {/* B: 대표 이미지 */}
        <div style={{ flex: '0 0 360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            width: '100%', height: '180px', border: '2px solid #ddd', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#f8f9fa', overflow: 'hidden'
          }}>
            <img
              src={!useFallback && imageUrl ? imageUrl : create02Image}
              alt="딜레마 대표 이미지"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
              onError={() => setUseFallback(true)}
              onLoad={() => setUseFallback(false)}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <span
              onClick={handleImageChange}
              style={{ color: '#333', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}
            >
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
              onChange={(e) => handleInputChange(input.id, e.target.value)}
              placeholder={input.placeholder}
              onDelete={input.canDelete ? () => handleDeleteInput(input.id) : undefined}
            />
          ))}
          {inputs.length < 5 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <button
                onClick={handleAddInput}
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
          onChange={(e) => { const v = e.target.value ?? ''; setDilemmaQuestion(v); persistQuestion(v); }}
          placeholder="예: Homemate 사용자 최적화 시스템 업그레이드 공지"
        />
        <CreateInput
          width={900}
          label="선택지1"
          value={option1}
          onChange={(e) => { const v = e.target.value ?? ''; setOption1(v); persistAgreeLabel(v); }}
          placeholder="예: 동의"
        />
        <CreateInput
          width={900}
          label="선택지2"
          value={option2}
          onChange={(e) => { const v = e.target.value ?? ''; setOption2(v); persistDisagreeLabel(v); }}
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