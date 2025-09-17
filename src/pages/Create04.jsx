// import { useEffect, useState } from 'react';
// import DilemmaOutPopup from '../components/DilemmaOutPopup';
// import CreatorLayout from '../components/Expanded/CreatorLayout';
// import CreatorContentBox from "../components/Expanded/CreatorContentBox";
// import Continue from '../components/Continue';
// import { useNavigate } from 'react-router-dom';
// import CreateInput from '../components/Expanded/CreateInput';
// import inputPlusIcon from '../assets/inputplus.svg'; 
// import create02Image from '../assets/images/default.png';
// import { FontStyles, Colors } from '../components/styleConstants';
// import NextGreen from "../components/NextOrange";
// import BackOrange from "../components/Expanded/BackOrange";
// import axiosInstance from '../api/axiosInstance';

// // === 이미지 2차 축소 유틸 ===
// const IMG_COMPRESS_PRESET_1 = { maxEdge: 2000, quality: 0.85, targetBytes: 1.8 * 1024 * 1024 }; // ~1.8MB
// const IMG_COMPRESS_PRESET_2 = { maxEdge: 1280, quality: 0.75, targetBytes: 0.9 * 1024 * 1024 };  // ~0.9MB

// function loadImageFromFile(file) {
//   return new Promise((resolve, reject) => {
//     const url = URL.createObjectURL(file);
//     const img = new Image();
//     img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
//     img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
//     img.src = url;
//   });
// }

// function calcSizeKeepRatio(w, h, maxEdge) {
//   const longEdge = Math.max(w, h);
//   if (longEdge <= maxEdge) return { width: w, height: h };
//   const scale = maxEdge / longEdge;
//   return { width: Math.round(w * scale), height: Math.round(h * scale) };
// }

// async function resizeAndCompressToBlob(file, { maxEdge, quality }) {
//   const img = await loadImageFromFile(file);
//   const { width, height } = calcSizeKeepRatio(img.width, img.height, maxEdge);
//   const canvas = document.createElement('canvas');
//   const ctx = canvas.getContext('2d', { alpha: false });
//   canvas.width = width; canvas.height = height;
//   ctx.drawImage(img, 0, 0, width, height);
//   return new Promise((resolve) => {
//     canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
//   });
// }

// function blobToFile(blob, fileName = 'image.jpg') {
//   return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
// }

// async function twoStepCompress(file, { preset1 = IMG_COMPRESS_PRESET_1, preset2 = IMG_COMPRESS_PRESET_2 } = {}) {
//   let working = file;
//   if (working.size > preset1.targetBytes) {
//     const blob1 = await resizeAndCompressToBlob(working, preset1);
//     if (blob1 && blob1.size < working.size) {
//       working = blobToFile(blob1, working.name.replace(/\.\w+$/, '') + '_c1.jpg');
//     }
//   }
//   if (working.size > preset2.targetBytes) {
//     const blob2 = await resizeAndCompressToBlob(working, preset2);
//     if (blob2 && blob2.size < working.size) {
//       working = blobToFile(blob2, working.name.replace(/\.\w+$/, '') + '_c2.jpg');
//     }
//   }
//   return working;
// }


// // ── 서버가 주는 상대경로(/static/...) → 절대경로로 보정
// const resolveImageUrl = (raw) => {
//   if (!raw || raw === '-' || String(raw).trim() === '') return null;
//   const u = String(raw).trim();
//   if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
//   const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
//   if (!base) return u;
//   return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
// };
// // slot: 'dilemma_image_4_1' | 'dilemma_image_4_2' | ... 
// async function putRepresentativeImageFile(code, slot, file) {
//   if (!code || !slot) throw new Error('code와 slot은 필수입니다.');
//     // 0) 업로드 전 2차 축소
//  const preCompressed = await twoStepCompress(file);
//  const form = new FormData();
//  form.append('file', preCompressed);
//  try {
//    const res = await axiosInstance.put(
//      `/custom-games/${code}/dilemma-images/${slot}`,
//      form,
//      { headers: { 'Content-Type': 'multipart/form-data' } }
//    );
//    const url = res?.data?.url || res?.data?.image_url;
//    if (url) localStorage.setItem(slot, url);
//    return url || null;
//  } catch (err) {
//    // 413(용량 초과) 시 더 강하게 줄여 1회 재시도
//    if (err?.response?.status === 413) {
//      const stronger = await twoStepCompress(preCompressed, {
//        preset1: { maxEdge: 1280, quality: 0.75, targetBytes: 0.9 * 1024 * 1024 },
//        preset2: { maxEdge: 960,  quality: 0.70, targetBytes: 0.6 * 1024 * 1024 },
//      });
//      const form2 = new FormData();
//      form2.append('file', stronger);
//      const retry = await axiosInstance.put(
//        `/custom-games/${code}/dilemma-images/${slot}`,
//        form2,
//        { headers: { 'Content-Type': 'multipart/form-data' } }
//      );
//      const url2 = retry?.data?.url || retry?.data?.image_url;
//      if (url2) localStorage.setItem(slot, url2);
//      return url2 || null;
//    }
//    throw err;
//  }
// }

// // ✅ 대표 이미지 맵 GET → localStorage 저장
// async function fetchRepresentativeImages(code) {
//   if (!code) throw new Error('게임 코드가 없습니다. (code)');
//    const res = await axiosInstance.get(`/custom-games/${code}/dilemma-images`, {
//     headers: { 'Content-Type': 'application/json' },
//   });
//   const images = res?.data?.images || {};

//   // 서버가 주는 4개 키 저장
//   ['dilemma_image_1', 'dilemma_image_3', 'dilemma_image_4_1', 'dilemma_image_4_2'].forEach((k) => {
//     if (images[k] !== undefined) localStorage.setItem(k, images[k] ?? '');
//   });

//   return images;
// }

// // ── 서버 응답에서 원하는 키를 다양한 레이어에서 탐색
// const pickFromLayers = (game, key) => {
//   const layers = [game, game?.data, game?.images, game?.data?.images];
//   for (const layer of layers) {
//     const v = layer?.[key];
//     if (typeof v === 'string' && v.trim().length > 0) return v;
//   }
//   return null;
// };

// // ── array 유틸
// const isNonEmptyStringArray = (arr) =>
//   Array.isArray(arr) && arr.length > 0 && arr.every(s => typeof s === 'string' && s.trim().length > 0);

// // ── 로컬에서 여러 후보 키 중 첫 유효 배열 읽기(오타/단수 포함 지원)
// const readLocalFlipArray = (keys) => {
//   for (const k of keys) {
//     try {
//       const raw = localStorage.getItem(k);
//       if (!raw) continue;
//       const parsed = JSON.parse(raw);
//       if (isNonEmptyStringArray(parsed)) return parsed;
//     } catch {}
//   }
//   return null;
// };

// export default function Create04() {
//   const navigate = useNavigate();
//   const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");

//   // ── 이미지 URL(동의/비동의) + 폴백 플래그
//   const [agreeUrl, setAgreeUrl] = useState(() => resolveImageUrl(localStorage.getItem('dilemma_image_4_1')));
//   const [disagreeUrl, setDisagreeUrl] = useState(() => resolveImageUrl(localStorage.getItem('dilemma_image_4_2')));
//   const [agreeFallback, setAgreeFallback] = useState(() => !resolveImageUrl(localStorage.getItem('dilemma_image_4_1')));
//   const [disagreeFallback, setDisagreeFallback] = useState(() => !resolveImageUrl(localStorage.getItem('dilemma_image_4_2')));

//   // 입력 빌더
//   const buildInputsFromArray = (arr, firstPlaceholder) =>
//     (Array.isArray(arr) ? arr : []).map((text, idx) => ({
//       id: idx + 1,
//       label: `화면 ${idx + 1}${idx === 0 ? ' *' : ''}`,
//       value: text ?? '',
//       placeholder: idx === 0 ? firstPlaceholder : ' ',
//       canDelete: idx !== 0,
//     }));

//   // ── 이미지 선택 핸들러(동의/비동의 슬롯별)
//   const handleImageChange = async (slot /* 1=agree, 2=disagree */) => {
//     const input = document.createElement("input");
//     input.type = "file";
//     input.accept = "image/*";
//     input.onchange = async (e) => {
//       const file = e.target.files?.[0];
//       if (!file) return;
//       try {
//         const code = localStorage.getItem('code');
//      if (!code) { alert('게임 코드가 없습니다.'); return; }
//      const key = slot === 1 ? 'dilemma_image_4_1' : 'dilemma_image_4_2';
//      const rawUrl = await putRepresentativeImageFile(code, key, file);

//      // 3) 로컬 및 화면 동기화
//      localStorage.setItem(key, rawUrl);
//      const resolved = resolveImageUrl(rawUrl);
//      if (slot === 1) { setAgreeUrl(resolved); setAgreeFallback(!resolved); }
//      else { setDisagreeUrl(resolved); setDisagreeFallback(!resolved); }
//       } catch (err) {
//         console.error(err);
//         alert('이미지 업로드에 실패했습니다.');
//         if (slot === 1) setAgreeFallback(true);
//         else setDisagreeFallback(true);
//       }
//     };
//     input.click();
//   };

//   // C 영역 - 입력 필드들
//   const [agreeInputs, setAgreeInputs] = useState([
//     { id: 1, label: "화면 1 *", value: "", placeholder: "예: Homemate 사용자 최적화 시스템 업그레이드 공지", canDelete: false },
//     { id: 2, label: "화면 2 ", value: "", placeholder: "예: 업데이트를 하면 고객님의 감정, 건강 상태, 생활 습관 등을 자동으로 수집하여...", canDelete: true },
//     { id: 3, label: "화면 3 ", value: "", placeholder: " ", canDelete: true },
//   ]);
//   const [disagreeInputs, setDisagreeInputs] = useState([
//     { id: 1, label: "화면 1 *", value: "", placeholder: "예: 비동의 시 발생할 수 있는 문제를 설명해주세요.", canDelete: false },
//     { id: 2, label: "화면 2 ", value: "", placeholder: " ", canDelete: true },
//     { id: 3, label: "화면 3 ", value: "", placeholder: " ", canDelete: true },
//   ]);

//   // ── 마운트 시 1회:
//   //     1) 로컬에 모든 것(agree/disagree 텍스트 + 두 이미지)이 있으면 GET 스킵
//   //     2) 없으면 GET 시도 후 비는 값만 채워 로컬에 저장
//   useEffect(() => {
//     // 0) 대표 이미지 로컬→화면, 없으면 GET
//         const code = localStorage.getItem('code');

//         const localAgreeImg = resolveImageUrl(localStorage.getItem('dilemma_image_4_1'));
//         const localDisagreeImg = resolveImageUrl(localStorage.getItem('dilemma_image_4_2'));

//         if (localAgreeImg) { setAgreeUrl(localAgreeImg); setAgreeFallback(false); }
//         if (localDisagreeImg) { setDisagreeUrl(localDisagreeImg); setDisagreeFallback(false); }

//         if ((!localAgreeImg || !localDisagreeImg) && code) {
//           (async () => {
//             try {
//               const images = await fetchRepresentativeImages(code);
//               const a = images?.dilemma_image_4_1 ?? localStorage.getItem('dilemma_image_4_1') ?? '';
//               const d = images?.dilemma_image_4_2 ?? localStorage.getItem('dilemma_image_4_2') ?? '';
//               const aResolved = resolveImageUrl(a);
//               const dResolved = resolveImageUrl(d);
//               setAgreeUrl(aResolved); setAgreeFallback(!aResolved);
//               setDisagreeUrl(dResolved); setDisagreeFallback(!dResolved);
//             } catch (err) {
//               console.error('대표 이미지 로드 실패:', err);
//               if (!localAgreeImg) { setAgreeUrl(null); setAgreeFallback(true); }
//               if (!localDisagreeImg) { setDisagreeUrl(null); setDisagreeFallback(true); }
//             }
//           })();
//         }

//     (async () => {
//       // 1) 로컬 검사 (키 오타/단수도 허용)
//       const localAgreeTexts =
//         readLocalFlipArray(['flips_agree_texts', 'filp_agree_text', 'flip_agree_text']);
//       const localDisagreeTexts =
//         readLocalFlipArray(['flips_disagree_texts', 'flip_disagree_text']);

//       const localAgreeImg = resolveImageUrl(localStorage.getItem('dilemma_image_4_1'));
//       const localDisagreeImg = resolveImageUrl(localStorage.getItem('dilemma_image_4_2'));

//       const hasAllLocal =
//         isNonEmptyStringArray(localAgreeTexts || []) &&
//         isNonEmptyStringArray(localDisagreeTexts || []) &&
//         !!localAgreeImg &&
//         !!localDisagreeImg;

//       // 로컬 값이 있으면 상태 세팅하고 GET 스킵
//       if (hasAllLocal) {
//         // 텍스트 입력 상태 세팅(로컬 → state)
//         setAgreeInputs(buildInputsFromArray(localAgreeTexts, '예: Homemate 사용자 최적화 시스템 업그레이드 공지'));
//         setDisagreeInputs(buildInputsFromArray(localDisagreeTexts, '예: 비동의 시 발생할 수 있는 문제를 설명해주세요.'));

//         // 이미지 상태 세팅(로컬 → state)
//         setAgreeUrl(localAgreeImg); setAgreeFallback(!localAgreeImg);
//         setDisagreeUrl(localDisagreeImg); setDisagreeFallback(!localDisagreeImg);
//         return; // ✅ GET 건너뛰기
//       }

//       // 2) 일부만 있거나 아예 없으면: 필요 시 GET
//       const code = localStorage.getItem('code');
//       if (!code) {
//         // code 없으면 GET 자체 불가 → 로컬/폴백만 세팅
//         if (localAgreeTexts) {
//           setAgreeInputs(buildInputsFromArray(localAgreeTexts, '예: Homemate 사용자 최적화 시스템 업그레이드 공지'));
//           localStorage.setItem('flips_agree_texts', JSON.stringify(localAgreeTexts)); // 정규화 저장
//         }
//         if (localDisagreeTexts) {
//           setDisagreeInputs(buildInputsFromArray(localDisagreeTexts, '예: 비동의 시 발생할 수 있는 문제를 설명해주세요.'));
//           localStorage.setItem('flips_disagree_texts', JSON.stringify(localDisagreeTexts)); // 정규화 저장
//         }
//         setAgreeUrl(localAgreeImg); setAgreeFallback(!localAgreeImg);
//         setDisagreeUrl(localDisagreeImg); setDisagreeFallback(!localDisagreeImg);
//         return;
//       }

//       try {
//         const res = await axiosInstance.get(`/custom-games/${code}`, {
//           headers: { 'Content-Type': 'application/json' },
//         });
//         const game = res?.data || {};

//         // 서버 이미지 후보
//         const rawAgreeImg = pickFromLayers(game, 'dilemma_image_4_1');
//         const rawDisagreeImg = pickFromLayers(game, 'dilemma_image_4_2');

//         // 서버 텍스트 후보 (여러 경로 대응)
//         const serverAgreeArr =
//           game?.flips?.agree_texts
//           || game?.data?.flips?.agree_texts
//           || game?.flips?.agree
//           || game?.data?.flips?.agree
//           || null;

//         const serverDisagreeArr =
//           game?.flips?.disagree_texts
//           || game?.data?.flips?.disagree_texts
//           || game?.flips?.disagree
//           || game?.data?.flips?.disagree
//           || null;

//         // 각 항목별 "없을 때만" 채움
//         // 이미지
//         const agreeImgFinal = localAgreeImg || resolveImageUrl(rawAgreeImg);
//         const disagreeImgFinal = localDisagreeImg || resolveImageUrl(rawDisagreeImg);

//         if (!localAgreeImg && rawAgreeImg) localStorage.setItem('dilemma_image_4_1', rawAgreeImg);
//         if (!localDisagreeImg && rawDisagreeImg) localStorage.setItem('dilemma_image_4_2', rawDisagreeImg);

//         setAgreeUrl(agreeImgFinal); setAgreeFallback(!agreeImgFinal);
//         setDisagreeUrl(disagreeImgFinal); setDisagreeFallback(!disagreeImgFinal);

//         // 텍스트
//         const agreeTextsFinal = localAgreeTexts || (isNonEmptyStringArray(serverAgreeArr) ? serverAgreeArr : null);
//         const disagreeTextsFinal = localDisagreeTexts || (isNonEmptyStringArray(serverDisagreeArr) ? serverDisagreeArr : null);

//         if (agreeTextsFinal) {
//           setAgreeInputs(buildInputsFromArray(agreeTextsFinal, '예: Homemate 사용자 최적화 시스템 업그레이드 공지'));
//           localStorage.setItem('flips_agree_texts', JSON.stringify(agreeTextsFinal)); // 정규화 저장
//         }
//         if (disagreeTextsFinal) {
//           setDisagreeInputs(buildInputsFromArray(disagreeTextsFinal, '예: 비동의 시 발생할 수 있는 문제를 설명해주세요.'));
//           localStorage.setItem('flips_disagree_texts', JSON.stringify(disagreeTextsFinal)); // 정규화 저장
//         }
//       } catch (e) {
//         console.error('GET 실패:', e);
//         // GET 실패 시 현재 로컬/폴백으로 마무리
//         if (localAgreeTexts) {
//           setAgreeInputs(buildInputsFromArray(localAgreeTexts, '예: Homemate 사용자 최적화 시스템 업그레이드 공지'));
//           localStorage.setItem('flips_agree_texts', JSON.stringify(localAgreeTexts));
//         }
//         if (localDisagreeTexts) {
//           setDisagreeInputs(buildInputsFromArray(localDisagreeTexts, '예: 비동의 시 발생할 수 있는 문제를 설명해주세요.'));
//           localStorage.setItem('flips_disagree_texts', JSON.stringify(localDisagreeTexts));
//         }
//         setAgreeUrl(localAgreeImg); setAgreeFallback(!localAgreeImg);
//         setDisagreeUrl(localDisagreeImg); setDisagreeFallback(!localDisagreeImg);
//       }
//     })();
//   }, []);

//   // ==== 이하 기존 텍스트/플립 로직은 그대로 ====

//   // 동의 / 비동의 입력 onChange 및 저장
//   const handleAgreeInputChange = (id, newValue) => {
//     setAgreeInputs(prev => {
//       const next = prev.map(input => input.id === id ? { ...input, value: newValue } : input);
//       const agree_texts = [...next].sort((a,b)=>a.id-b.id).map(it => (it.value ?? '').trim());
//       localStorage.setItem('flips_agree_texts', JSON.stringify(agree_texts));
//       return next;
//     });
//   };
//   const handleDisagreeInputChange = (id, newValue) => {
//     setDisagreeInputs(prev => {
//       const next = prev.map(input => input.id === id ? { ...input, value: newValue } : input);
//       const disagree_texts = [...next].sort((a,b)=>a.id-b.id).map(it => (it.value ?? '').trim());
//       localStorage.setItem('flips_disagree_texts', JSON.stringify(disagree_texts));
//       return next;
//     });
//   };

//   const persistAgree = (list) => {
//     const agree_texts = [...list].sort((a,b)=>a.id-b.id).map(it => (it.value ?? '').trim());
//     localStorage.setItem('flips_agree_texts', JSON.stringify(agree_texts));
//   };
//   const persistDisagree = (list) => {
//     const disagree_texts = [...list].sort((a,b)=>a.id-b.id).map(it => (it.value ?? '').trim());
//     localStorage.setItem('flips_disagree_texts', JSON.stringify(disagree_texts));
//   };

//   const handleAddAgreeInput = () => {
//     setAgreeInputs(prev => {
//       if (prev.length >= 5) return prev;
//       const nextId = prev.reduce((m, it) => Math.max(m, it.id), 0) + 1;
//       const next = [...prev, { id: nextId, label: `화면 ${prev.length + 1}`, value: "", placeholder: " ", canDelete: true }];
//       persistAgree(next);
//       return next;
//     });
//   };
//   const handleAddDisagreeInput = () => {
//     setDisagreeInputs(prev => {
//       if (prev.length >= 5) return prev;
//       const nextId = prev.reduce((m, it) => Math.max(m, it.id), 0) + 1;
//       const next = [...prev, { id: nextId, label: `화면 ${prev.length + 1}`, value: "", placeholder: " ", canDelete: true }];
//       persistDisagree(next);
//       return next;
//     });
//   };

//   const handleDeleteAgreeInput = (idToDelete) => {
//     setAgreeInputs(prev => {
//       const next = prev
//         .filter(input => input.id !== idToDelete)
//         .map((input, index) => ({ ...input, id: index + 1, label: `화면 ${index + 1}`, canDelete: index !== 0 }));
//       persistAgree(next);
//       return next;
//     });
//   };
//   const handleDeleteDisagreeInput = (idToDelete) => {
//     setDisagreeInputs(prev => {
//       const next = prev
//         .filter(input => input.id !== idToDelete)
//         .map((input, index) => ({ ...input, id: index + 1, label: `화면 ${index + 1}`, canDelete: index !== 0 }));
//       persistDisagree(next);
//       return next;
//     });
//   };

//   const putFlips = async ({ agree_texts, disagree_texts }) => {
//     const code = localStorage.getItem('code');
//     if (!code) throw new Error('게임 코드가 없습니다. (code)');
//     await axiosInstance.put(
//       `/custom-games/${code}/flips`,
//       { agree_texts, disagree_texts },
//       { headers: { 'Content-Type': 'application/json' } }
//     );
//   };

//   const handleNext = async () => {
//     try {
//       const safe = s => {
//         const t = (s ?? '').trim();
//         return t.length > 0 ? t : '-';
//       };

//       const agree_texts = [...agreeInputs]
//         .sort((a, b) => a.id - b.id)
//         .map(it => safe(it.value));

//       const disagree_texts = [...disagreeInputs]
//         .sort((a, b) => a.id - b.id)
//         .map(it => safe(it.value));

//       await putFlips({ agree_texts, disagree_texts });

//       localStorage.setItem('flips_agree_texts', JSON.stringify(agree_texts));
//       localStorage.setItem('flips_disagree_texts', JSON.stringify(disagree_texts));

//       navigate('/create05');
//     } catch (e) {
//       console.error(e);
//       alert('플립 저장 중 오류가 발생했습니다.');
//     }
//   };

//   const handleBack = () => navigate('/create03');

//   return (
//     <CreatorLayout
//       headerbar={2}
//       headerLeftType="home"
//       headerNextDisabled={true}
//       onHeaderNextClick={() => console.log('NEXT')}
//       frameProps={{
//         value: title,
//         onChange: (val) => setTitle(val),
//         onConfirm: (val) => { setTitle(val); localStorage.setItem("creatorTitle", val); },
//       }}
//     >
//       {/* A */}
//       <div style={{ marginTop: -30, marginBottom: '30px' }}>
//         <h2 style={{ ...FontStyles.headlineSmall, marginBottom: '16px', color: Colors.grey07 }}>플립 단계</h2>
//         <p style={{ ...FontStyles.title, color: Colors.grey05, lineHeight: 1.5, marginBottom: '32px' }}>
//           딜레마 상황과 그에 맞는 질문을 설정해주세요. 게임에 참여하는 3명의 플레이 단계에서는 플레이어의 다수결 선택 결과에 따라 다른 내용이 보여집니다. 
//         </p>
//       </div>

//       {/* 동의 */}
//       <div style={{ marginTop: 0, marginBottom: '30px' }}>
//         <h2 style={{ ...FontStyles.headlineSmall, marginBottom: '0px', color: Colors.grey07 }}>[선택지1] 동의</h2>
//         <p style={{ ...FontStyles.title, color: Colors.grey05, marginBottom: '0px' }}>
//           '동의'을(를) 선택했을 때 일어날 수 있는 예상치 못한 상황에 대해 설명해주세요.
//         </p>
//       </div>
//       <div style={{ display: 'flex', gap: 100, alignItems: 'flex-start', marginBottom: '20px' }}>
//         {/* B: 이미지(동의) */}
//         <div style={{ flex: '0 0 360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
//           <div style={{ width: '100%', height: '180px', border: '2px solid #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', overflow: 'hidden' }}>
//             <img
//               src={!agreeFallback && agreeUrl ? agreeUrl : create02Image}
//               alt="동의 이미지"
//               style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
//               onError={() => setAgreeFallback(true)}
//               onLoad={() => setAgreeFallback(false)}
//             />
//           </div>
//           <div style={{ textAlign: 'center' }}>
//             <span
//               onClick={() => handleImageChange(1)}
//               style={{ color: '#333', fontSize: 14, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
//             >
//               이미지 변경
//             </span>
//           </div>
//           <div style={{ textAlign: 'center' }}>
//             <p style={{ color: Colors.systemRed, ...FontStyles.bodyBold, margin: 0, lineHeight: 1.4 }}>(*권장 이미지 비율 2:1)</p>
//           </div>
//         </div>

//         {/* C: 동의 입력 */}
//         <div style={{ flex: '1', marginTop: -10 }}>
//           {agreeInputs.map((input) => (
//             <CreateInput
//               key={input.id}
//               label={input.label}
//               value={input.value}
//               onChange={(e) => handleAgreeInputChange(input.id, e.target.value)}
//               placeholder={input.placeholder}
//               onDelete={input.canDelete ? () => handleDeleteAgreeInput(input.id) : undefined}
//             />
//           ))}
//           {agreeInputs.length < 5 && (
//             <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
//               <button
//                 onClick={handleAddAgreeInput}
//                 style={{ width: '40px', height: '40px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
//               >
//                 <img src={inputPlusIcon} alt="입력 필드 추가" style={{ width: '40px', height: '40px' }} />
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* 비동의 */}
//       <div style={{ marginTop: 50, marginBottom: '30px' }}>
//         <h2 style={{ ...FontStyles.headlineSmall, marginBottom: '0px', color: Colors.grey07 }}>[선택지2] 비동의</h2>
//         <p style={{ ...FontStyles.title, color: Colors.grey05, marginBottom: '0px' }}>
//           '비동의'을(를) 선택했을 때 일어날 수 있는 예상치 못한 상황에 대해 설명해주세요.
//         </p>
//       </div>
//       <div style={{ display: 'flex', gap: 100, alignItems: 'flex-start', paddingBottom: 40 }}>
//         {/* B: 이미지(비동의) */}
//         <div style={{ flex: '0 0 360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
//           <div style={{ width: '100%', height: '180px', border: '2px solid #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', overflow: 'hidden' }}>
//             <img
//               src={!disagreeFallback && disagreeUrl ? disagreeUrl : create02Image}
//               alt="비동의 이미지"
//               style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
//               onError={() => setDisagreeFallback(true)}
//               onLoad={() => setDisagreeFallback(false)}
//             />
//           </div>
//           <div style={{ textAlign: 'center' }}>
//             <span
//               onClick={() => handleImageChange(2)}
//               style={{ color: '#333', fontSize: 14, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
//             >
//               이미지 변경
//             </span>
//           </div>
//           <div style={{ textAlign: 'center' }}>
//             <p style={{ color: Colors.systemRed, ...FontStyles.bodyBold, margin: 0, lineHeight: 1.4 }}>(*권장 이미지 비율 2:1)</p>
//           </div>
//         </div>

//         {/* C: 비동의 입력 */}
//         <div style={{ flex: '1', marginTop: -10 }}>
//           {disagreeInputs.map((input) => (
//             <CreateInput
//               key={input.id}
//               label={input.label}
//               value={input.value}
//               onChange={(e) => handleDisagreeInputChange(input.id, e.target.value)}
//               placeholder={input.placeholder}
//               onDelete={input.canDelete ? () => handleDeleteDisagreeInput(input.id) : undefined}
//             />
//           ))}
//           {disagreeInputs.length < 5 && (
//             <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
//               <button
//                 onClick={handleAddDisagreeInput}
//                 style={{ width: '40px', height: '40px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
//               >
//                 <img src={inputPlusIcon} alt="입력 필드 추가" style={{ width: '40px', height: '40px' }} />
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* 하단 버튼 */}
//       <div style={{ position: 'absolute', bottom: '30px', right: '30px' }}>
//         <NextGreen onClick={handleNext} />
//       </div>
//       <div style={{ position: 'absolute', bottom: '30px', left: '30px' }}>
//         <BackOrange onClick={() => navigate('/create03')} />
//       </div>
//     </CreatorLayout>
//   );
// }

import { useEffect, useState } from 'react';
import DilemmaOutPopup from '../components/DilemmaOutPopup';
import CreatorLayout from '../components/Expanded/CreatorLayout';
import CreatorContentBox from "../components/Expanded/CreatorContentBox";
import Continue from '../components/Continue';
import { useNavigate } from 'react-router-dom';
import CreateInput from '../components/Expanded/CreateInput';
import inputPlusIcon from '../assets/inputplus.svg'; 
import create02Image from '../assets/images/default.png';
import { FontStyles, Colors } from '../components/styleConstants';
import NextGreen from "../components/NextOrange";
import BackOrange from "../components/Expanded/BackOrange";
import axiosInstance from '../api/axiosInstance';

// === 이미지 2차 축소 유틸 ===
const IMG_COMPRESS_PRESET_1 = { maxEdge: 2000, quality: 0.85, targetBytes: 1.8 * 1024 * 1024 }; // ~1.8MB
const IMG_COMPRESS_PRESET_2 = { maxEdge: 1280, quality: 0.75, targetBytes: 0.9 * 1024 * 1024 };  // ~0.9MB

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

function calcSizeKeepRatio(w, h, maxEdge) {
  const longEdge = Math.max(w, h);
  if (longEdge <= maxEdge) return { width: w, height: h };
  const scale = maxEdge / longEdge;
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

async function resizeAndCompressToBlob(file, { maxEdge, quality }) {
  const img = await loadImageFromFile(file);
  const { width, height } = calcSizeKeepRatio(img.width, img.height, maxEdge);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  canvas.width = width; canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
  });
}

function blobToFile(blob, fileName = 'image.jpg') {
  return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
}

async function twoStepCompress(file, { preset1 = IMG_COMPRESS_PRESET_1, preset2 = IMG_COMPRESS_PRESET_2 } = {}) {
  let working = file;
  if (working.size > preset1.targetBytes) {
    const blob1 = await resizeAndCompressToBlob(working, preset1);
    if (blob1 && blob1.size < working.size) {
      working = blobToFile(blob1, working.name.replace(/\.\w+$/, '') + '_c1.jpg');
    }
  }
  if (working.size > preset2.targetBytes) {
    const blob2 = await resizeAndCompressToBlob(working, preset2);
    if (blob2 && blob2.size < working.size) {
      working = blobToFile(blob2, working.name.replace(/\.\w+$/, '') + '_c2.jpg');
    }
  }
  return working;
}

// ── 서버가 주는 상대경로(/static/...) → 절대경로로 보정
const resolveImageUrl = (raw) => {
  if (!raw || raw === '-' || String(raw).trim() === '') return null;
  const u = String(raw).trim();
  if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
  const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
  if (!base) return u;
  return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
};

// slot: 'dilemma_image_4_1' | 'dilemma_image_4_2' | ...
async function putRepresentativeImageFile(code, slot, file) {
  if (!code || !slot) throw new Error('code와 slot은 필수입니다.');
  // 0) 업로드 전 2차 축소
  const preCompressed = await twoStepCompress(file);
  const form = new FormData();
  form.append('file', preCompressed);
  try {
    const res = await axiosInstance.put(
      `/custom-games/${code}/dilemma-images/${slot}`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    const url = res?.data?.url || res?.data?.image_url;
    if (url) localStorage.setItem(slot, url);
    return url || null;
  } catch (err) {
    // 413(용량 초과) 시 더 강하게 줄여 1회 재시도
    if (err?.response?.status === 413) {
      const stronger = await twoStepCompress(preCompressed, {
        preset1: { maxEdge: 1280, quality: 0.75, targetBytes: 0.9 * 1024 * 1024 },
        preset2: { maxEdge: 960,  quality: 0.70, targetBytes: 0.6 * 1024 * 1024 },
      });
      const form2 = new FormData();
      form2.append('file', stronger);
      const retry = await axiosInstance.put(
        `/custom-games/${code}/dilemma-images/${slot}`,
        form2,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const url2 = retry?.data?.url || retry?.data?.image_url;
      if (url2) localStorage.setItem(slot, url2);
      return url2 || null;
    }
    throw err;
  }
}

// ✅ 대표 이미지 맵 GET → localStorage 저장
async function fetchRepresentativeImages(code) {
  if (!code) throw new Error('게임 코드가 없습니다. (code)');
  const res = await axiosInstance.get(`/custom-games/${code}/dilemma-images`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const images = res?.data?.images || {};

  // 서버가 주는 4개 키 저장
  ['dilemma_image_1', 'dilemma_image_3', 'dilemma_image_4_1', 'dilemma_image_4_2'].forEach((k) => {
    if (images[k] !== undefined) localStorage.setItem(k, images[k] ?? '');
  });

  return images;
}

// ── 서버 응답에서 원하는 키를 다양한 레이어에서 탐색
const pickFromLayers = (game, key) => {
  const layers = [game, game?.data, game?.images, game?.data?.images];
  for (const layer of layers) {
    const v = layer?.[key];
    if (typeof v === 'string' && v.trim().length > 0) return v;
  }
  return null;
};

// ── array 유틸
const isNonEmptyStringArray = (arr) =>
  Array.isArray(arr) && arr.length > 0 && arr.every(s => typeof s === 'string' && s.trim().length > 0);

// ── 로컬에서 여러 후보 키 중 첫 유효 배열 읽기(오타/단수 포함 지원)
const readLocalFlipArray = (keys) => {
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (isNonEmptyStringArray(parsed)) return parsed;
    } catch {}
  }
  return null;
};

/* ===== 기본 이미지 자동 업로드 (동의/비동의) ===== */
const DEFAULT_UPLOAD_FLAG_4_1 = 'dilemma_image_4_1';
const DEFAULT_UPLOAD_FLAG_4_2 = 'dilemma_image_4_2';

async function uploadDefaultFlipImage(slot /* 1 or 2 */, onApplied) {
  const code = localStorage.getItem('code');
  if (!code) return null;

  const key = slot === 1 ? 'dilemma_image_4_1' : 'dilemma_image_4_2';
  const flag = slot === 1 ? DEFAULT_UPLOAD_FLAG_4_1 : DEFAULT_UPLOAD_FLAG_4_2;
  if (localStorage.getItem(flag) === '1') return null; // 중복 업로드 방지

  try {
    // 번들된 기본 이미지를 Blob으로 가져오기
    const resp = await fetch(create02Image);
    let file = new File([await resp.blob()], 'default.png', { type: 'image/png' });

    // 2단계 축소(내부적으로 JPEG로 전환될 수 있음)
    file = await twoStepCompress(file).catch(() => file);

    // 업로드
    const url = await putRepresentativeImageFile(code, key, file);
    if (url) {
      localStorage.setItem(key, url);
      localStorage.setItem(flag, '1');
      if (typeof onApplied === 'function') onApplied(resolveImageUrl(url));
    }
    return url;
  } catch (e) {
    console.error(`기본 이미지 업로드 실패(${key}):`, e);
    return null;
  }
}

export default function Create04() {
  const navigate = useNavigate();
  const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");

  // ── 이미지 URL(동의/비동의) + 폴백 플래그
  const [agreeUrl, setAgreeUrl] = useState(() => resolveImageUrl(localStorage.getItem('dilemma_image_4_1')));
  const [disagreeUrl, setDisagreeUrl] = useState(() => resolveImageUrl(localStorage.getItem('dilemma_image_4_2')));
  const [agreeFallback, setAgreeFallback] = useState(() => !resolveImageUrl(localStorage.getItem('dilemma_image_4_1')));
  const [disagreeFallback, setDisagreeFallback] = useState(() => !resolveImageUrl(localStorage.getItem('dilemma_image_4_2')));

  // 입력 빌더
  const buildInputsFromArray = (arr, firstPlaceholder) =>
    (Array.isArray(arr) ? arr : []).map((text, idx) => ({
      id: idx + 1,
      label: `화면 ${idx + 1}${idx === 0 ? ' *' : ''}`,
      value: text ?? '',
      placeholder: idx === 0 ? firstPlaceholder : ' ',
      canDelete: idx !== 0,
    }));

  // ── 이미지 선택 핸들러(동의/비동의 슬롯별)
  const handleImageChange = async (slot /* 1=agree, 2=disagree */) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const code = localStorage.getItem('code');
        if (!code) { alert('게임 코드가 없습니다.'); return; }
        const key = slot === 1 ? 'dilemma_image_4_1' : 'dilemma_image_4_2';
        const rawUrl = await putRepresentativeImageFile(code, key, file);

        // 3) 로컬 및 화면 동기화
        if (rawUrl) localStorage.setItem(key, rawUrl);
        const resolved = resolveImageUrl(rawUrl);
        if (slot === 1) { setAgreeUrl(resolved); setAgreeFallback(!resolved); }
        else { setDisagreeUrl(resolved); setDisagreeFallback(!resolved); }
      } catch (err) {
        console.error(err);
        alert('이미지 업로드에 실패했습니다.');
        if (slot === 1) setAgreeFallback(true);
        else setDisagreeFallback(true);
      }
    };
    input.click();
  };

  // C 영역 - 입력 필드들
  const [agreeInputs, setAgreeInputs] = useState([
    { id: 1, label: "화면 1 *", value: "", placeholder: "예: Homemate 사용자 최적화 시스템 업그레이드 공지", canDelete: false },
    { id: 2, label: "화면 2 ", value: "", placeholder: "예: 업데이트를 하면 고객님의 감정, 건강 상태, 생활 습관 등을 자동으로 수집하여...", canDelete: true },
    { id: 3, label: "화면 3 ", value: "", placeholder: " ", canDelete: true },
  ]);
  const [disagreeInputs, setDisagreeInputs] = useState([
    { id: 1, label: "화면 1 *", value: "", placeholder: "예: 비동의 시 발생할 수 있는 문제를 설명해주세요.", canDelete: false },
    { id: 2, label: "화면 2 ", value: "", placeholder: " ", canDelete: true },
    { id: 3, label: "화면 3 ", value: "", placeholder: " ", canDelete: true },
  ]);

  // ── 마운트 시 1회:
  //     1) 로컬에 모든 것(agree/disagree 텍스트 + 두 이미지)이 있으면 GET 스킵
  //     2) 없으면 GET 시도 후 비는 값만 채워 로컬에 저장
  //     3) 그래도 이미지가 없으면 기본 이미지 자동 업로드
  useEffect(() => {
    // 0) 대표 이미지 로컬→화면, 없으면 GET → 그래도 없으면 기본 업로드
    const code = localStorage.getItem('code');

    const localAgreeImg = resolveImageUrl(localStorage.getItem('dilemma_image_4_1'));
    const localDisagreeImg = resolveImageUrl(localStorage.getItem('dilemma_image_4_2'));

    if (localAgreeImg) { setAgreeUrl(localAgreeImg); setAgreeFallback(false); }
    if (localDisagreeImg) { setDisagreeUrl(localDisagreeImg); setDisagreeFallback(false); }

    if ((!localAgreeImg || !localDisagreeImg) && code) {
      (async () => {
        try {
          const images = await fetchRepresentativeImages(code);
          const a = images?.dilemma_image_4_1 ?? localStorage.getItem('dilemma_image_4_1') ?? '';
          const d = images?.dilemma_image_4_2 ?? localStorage.getItem('dilemma_image_4_2') ?? '';
          const aResolved = resolveImageUrl(a);
          const dResolved = resolveImageUrl(d);
          setAgreeUrl(aResolved); setAgreeFallback(!aResolved);
          setDisagreeUrl(dResolved); setDisagreeFallback(!dResolved);

          // 서버/로컬 모두 없으면 기본 이미지 업로드
          if (!aResolved) {
            await uploadDefaultFlipImage(1, (resolvedUrl) => {
              setAgreeUrl(resolvedUrl);
              setAgreeFallback(!resolvedUrl);
            });
          }
          if (!dResolved) {
            await uploadDefaultFlipImage(2, (resolvedUrl) => {
              setDisagreeUrl(resolvedUrl);
              setDisagreeFallback(!resolvedUrl);
            });
          }
        } catch (err) {
          console.error('대표 이미지 로드 실패:', err);
          // 실패 시에도 기본 이미지 업로드 시도
          if (!localAgreeImg) {
            await uploadDefaultFlipImage(1, (resolvedUrl) => {
              setAgreeUrl(resolvedUrl);
              setAgreeFallback(!resolvedUrl);
            });
          }
          if (!localDisagreeImg) {
            await uploadDefaultFlipImage(2, (resolvedUrl) => {
              setDisagreeUrl(resolvedUrl);
              setDisagreeFallback(!resolvedUrl);
            });
          }
        }
      })();
    }

    (async () => {
      // 1) 로컬 검사 (키 오타/단수도 허용)
      const localAgreeTexts =
        readLocalFlipArray(['flips_agree_texts', 'filp_agree_text', 'flip_agree_text']);
      const localDisagreeTexts =
        readLocalFlipArray(['flips_disagree_texts', 'flip_disagree_text']);

      const localAgreeImg2 = resolveImageUrl(localStorage.getItem('dilemma_image_4_1'));
      const localDisagreeImg2 = resolveImageUrl(localStorage.getItem('dilemma_image_4_2'));

      const hasAllLocal =
        isNonEmptyStringArray(localAgreeTexts || []) &&
        isNonEmptyStringArray(localDisagreeTexts || []) &&
        !!localAgreeImg2 &&
        !!localDisagreeImg2;

      // 로컬 값이 있으면 상태 세팅하고 GET 스킵
      if (hasAllLocal) {
        // 텍스트 입력 상태 세팅(로컬 → state)
        setAgreeInputs(buildInputsFromArray(localAgreeTexts, '예: Homemate 사용자 최적화 시스템 업그레이드 공지'));
        setDisagreeInputs(buildInputsFromArray(localDisagreeTexts, '예: 비동의 시 발생할 수 있는 문제를 설명해주세요.'));

        // 이미지 상태 세팅(로컬 → state)
        setAgreeUrl(localAgreeImg2); setAgreeFallback(!localAgreeImg2);
        setDisagreeUrl(localDisagreeImg2); setDisagreeFallback(!localDisagreeImg2);
        return; // ✅ GET 건너뛰기
      }

      // 2) 일부만 있거나 아예 없으면: 필요 시 GET
      const code2 = localStorage.getItem('code');
      if (!code2) {
        // code 없으면 GET 자체 불가 → 로컬/폴백만 세팅
        if (localAgreeTexts) {
          setAgreeInputs(buildInputsFromArray(localAgreeTexts, '예: Homemate 사용자 최적화 시스템 업그레이드 공지'));
          localStorage.setItem('flips_agree_texts', JSON.stringify(localAgreeTexts)); // 정규화 저장
        }
        if (localDisagreeTexts) {
          setDisagreeInputs(buildInputsFromArray(localDisagreeTexts, '예: 비동의 시 발생할 수 있는 문제를 설명해주세요.'));
          localStorage.setItem('flips_disagree_texts', JSON.stringify(localDisagreeTexts)); // 정규화 저장
        }
        setAgreeUrl(localAgreeImg2); setAgreeFallback(!localAgreeImg2);
        setDisagreeUrl(localDisagreeImg2); setDisagreeFallback(!localDisagreeImg2);
        return;
      }

      try {
        const res = await axiosInstance.get(`/custom-games/${code2}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        const game = res?.data || {};

        // 서버 이미지 후보
        const rawAgreeImg = pickFromLayers(game, 'dilemma_image_4_1');
        const rawDisagreeImg = pickFromLayers(game, 'dilemma_image_4_2');

        // 서버 텍스트 후보 (여러 경로 대응)
        const serverAgreeArr =
          game?.flips?.agree_texts
          || game?.data?.flips?.agree_texts
          || game?.flips?.agree
          || game?.data?.flips?.agree
          || null;

        const serverDisagreeArr =
          game?.flips?.disagree_texts
          || game?.data?.flips?.disagree_texts
          || game?.flips?.disagree
          || game?.data?.flips?.disagree
          ||null;


        // 각 항목별 "없을 때만" 채움
        // 이미지
        const agreeImgFinal = localAgreeImg || resolveImageUrl(rawAgreeImg);
        const disagreeImgFinal = localDisagreeImg || resolveImageUrl(rawDisagreeImg);

        if (!localAgreeImg && rawAgreeImg) localStorage.setItem('dilemma_image_4_1', rawAgreeImg);
        if (!localDisagreeImg && rawDisagreeImg) localStorage.setItem('dilemma_image_4_2', rawDisagreeImg);

        setAgreeUrl(agreeImgFinal); setAgreeFallback(!agreeImgFinal);
        setDisagreeUrl(disagreeImgFinal); setDisagreeFallback(!disagreeImgFinal);

        // 텍스트
        const agreeTextsFinal = localAgreeTexts || (isNonEmptyStringArray(serverAgreeArr) ? serverAgreeArr : null);
        const disagreeTextsFinal = localDisagreeTexts || (isNonEmptyStringArray(serverDisagreeArr) ? serverDisagreeArr : null);

        if (agreeTextsFinal) {
          setAgreeInputs(buildInputsFromArray(agreeTextsFinal, '예: Homemate 사용자 최적화 시스템 업그레이드 공지'));
          localStorage.setItem('flips_agree_texts', JSON.stringify(agreeTextsFinal)); // 정규화 저장
        }
        if (disagreeTextsFinal) {
          setDisagreeInputs(buildInputsFromArray(disagreeTextsFinal, '예: 비동의 시 발생할 수 있는 문제를 설명해주세요.'));
          localStorage.setItem('flips_disagree_texts', JSON.stringify(disagreeTextsFinal)); // 정규화 저장
        }
      } catch (e) {
        console.error('GET 실패:', e);
        // GET 실패 시 현재 로컬/폴백으로 마무리
        if (localAgreeTexts) {
          setAgreeInputs(buildInputsFromArray(localAgreeTexts, '예: Homemate 사용자 최적화 시스템 업그레이드 공지'));
          localStorage.setItem('flips_agree_texts', JSON.stringify(localAgreeTexts));
        }
        if (localDisagreeTexts) {
          setDisagreeInputs(buildInputsFromArray(localDisagreeTexts, '예: 비동의 시 발생할 수 있는 문제를 설명해주세요.'));
          localStorage.setItem('flips_disagree_texts', JSON.stringify(localDisagreeTexts));
        }
        setAgreeUrl(localAgreeImg); setAgreeFallback(!localAgreeImg);
        setDisagreeUrl(localDisagreeImg); setDisagreeFallback(!localDisagreeImg);
      }
    })();
  }, []);

  // ==== 이하 기존 텍스트/플립 로직은 그대로 ====

  // 동의 / 비동의 입력 onChange 및 저장
  const handleAgreeInputChange = (id, newValue) => {
    setAgreeInputs(prev => {
      const next = prev.map(input => input.id === id ? { ...input, value: newValue } : input);
      const agree_texts = [...next].sort((a,b)=>a.id-b.id).map(it => (it.value ?? '').trim());
      localStorage.setItem('flips_agree_texts', JSON.stringify(agree_texts));
      return next;
    });
  };
  const handleDisagreeInputChange = (id, newValue) => {
    setDisagreeInputs(prev => {
      const next = prev.map(input => input.id === id ? { ...input, value: newValue } : input);
      const disagree_texts = [...next].sort((a,b)=>a.id-b.id).map(it => (it.value ?? '').trim());
      localStorage.setItem('flips_disagree_texts', JSON.stringify(disagree_texts));
      return next;
    });
  };

  const persistAgree = (list) => {
    const agree_texts = [...list].sort((a,b)=>a.id-b.id).map(it => (it.value ?? '').trim());
    localStorage.setItem('flips_agree_texts', JSON.stringify(agree_texts));
  };
  const persistDisagree = (list) => {
    const disagree_texts = [...list].sort((a,b)=>a.id-b.id).map(it => (it.value ?? '').trim());
    localStorage.setItem('flips_disagree_texts', JSON.stringify(disagree_texts));
  };

  const handleAddAgreeInput = () => {
    setAgreeInputs(prev => {
      if (prev.length >= 5) return prev;
      const nextId = prev.reduce((m, it) => Math.max(m, it.id), 0) + 1;
      const next = [...prev, { id: nextId, label: `화면 ${prev.length + 1}`, value: "", placeholder: " ", canDelete: true }];
      persistAgree(next);
      return next;
    });
  };
  const handleAddDisagreeInput = () => {
    setDisagreeInputs(prev => {
      if (prev.length >= 5) return prev;
      const nextId = prev.reduce((m, it) => Math.max(m, it.id), 0) + 1;
      const next = [...prev, { id: nextId, label: `화면 ${prev.length + 1}`, value: "", placeholder: " ", canDelete: true }];
      persistDisagree(next);
      return next;
    });
  };

  const handleDeleteAgreeInput = (idToDelete) => {
    setAgreeInputs(prev => {
      const next = prev
        .filter(input => input.id !== idToDelete)
        .map((input, index) => ({ ...input, id: index + 1, label: `화면 ${index + 1}`, canDelete: index !== 0 }));
      persistAgree(next);
      return next;
    });
  };
  const handleDeleteDisagreeInput = (idToDelete) => {
    setDisagreeInputs(prev => {
      const next = prev
        .filter(input => input.id !== idToDelete)
        .map((input, index) => ({ ...input, id: index + 1, label: `화면 ${index + 1}`, canDelete: index !== 0 }));
      persistDisagree(next);
      return next;
    });
  };

  const putFlips = async ({ agree_texts, disagree_texts }) => {
    const code = localStorage.getItem('code');
    if (!code) throw new Error('게임 코드가 없습니다. (code)');
    await axiosInstance.put(
      `/custom-games/${code}/flips`,
      { agree_texts, disagree_texts },
      { headers: { 'Content-Type': 'application/json' } }
    );
  };

  const handleNext = async () => {
    try {
      const safe = s => {
        const t = (s ?? '').trim();
        return t.length > 0 ? t : '-';
      };

      const agree_texts = [...agreeInputs]
        .sort((a, b) => a.id - b.id)
        .map(it => safe(it.value));

      const disagree_texts = [...disagreeInputs]
        .sort((a, b) => a.id - b.id)
        .map(it => safe(it.value));

      await putFlips({ agree_texts, disagree_texts });

      localStorage.setItem('flips_agree_texts', JSON.stringify(agree_texts));
      localStorage.setItem('flips_disagree_texts', JSON.stringify(disagree_texts));

      navigate('/create05');
    } catch (e) {
      console.error(e);
      alert('플립 저장 중 오류가 발생했습니다.');
    }
  };

  const handleBack = () => navigate('/create03');

  return (
    <CreatorLayout
      headerbar={2}
      headerLeftType="home"
      headerNextDisabled={true}
      onHeaderNextClick={() => console.log('NEXT')}
      frameProps={{
        value: title,
        onChange: (val) => setTitle(val),
        onConfirm: (val) => { setTitle(val); localStorage.setItem("creatorTitle", val); },
      }}
    >
      {/* A */}
      <div style={{ marginTop: -30, marginBottom: '30px' }}>
        <h2 style={{ ...FontStyles.headlineSmall, marginBottom: '16px', color: Colors.grey07 }}>플립 단계</h2>
        <p style={{ ...FontStyles.title, color: Colors.grey05, lineHeight: 1.5, marginBottom: '32px' }}>
          딜레마 상황과 그에 맞는 질문을 설정해주세요. 게임에 참여하는 3명의 플레이 단계에서는 플레이어의 다수결 선택 결과에 따라 다른 내용이 보여집니다. 
        </p>
      </div>

      {/* 동의 */}
      <div style={{ marginTop: 0, marginBottom: '30px' }}>
        <h2 style={{ ...FontStyles.headlineSmall, marginBottom: '0px', color: Colors.grey07 }}>[선택지1] 동의</h2>
        <p style={{ ...FontStyles.title, color: Colors.grey05, marginBottom: '0px' }}>
          '동의'을(를) 선택했을 때 일어날 수 있는 예상치 못한 상황에 대해 설명해주세요.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 100, alignItems: 'flex-start', marginBottom: '20px' }}>
        {/* B: 이미지(동의) */}
        <div style={{ flex: '0 0 360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ width: '100%', height: '180px', border: '2px solid #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', overflow: 'hidden' }}>
            <img
              src={!agreeFallback && agreeUrl ? agreeUrl : create02Image}
              alt="동의 이미지"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
              onError={() => setAgreeFallback(true)}
              onLoad={() => setAgreeFallback(false)}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <span
              onClick={() => handleImageChange(1)}
              style={{ color: '#333', fontSize: 14, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
            >
              이미지 변경
            </span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: Colors.systemRed, ...FontStyles.bodyBold, margin: 0, lineHeight: 1.4 }}>(*권장 이미지 비율 2:1)</p>
          </div>
        </div>

        {/* C: 동의 입력 */}
        <div style={{ flex: '1', marginTop: -10 }}>
          {agreeInputs.map((input) => (
            <CreateInput
              key={input.id}
              label={input.label}
              value={input.value}
              onChange={(e) => handleAgreeInputChange(input.id, e.target.value)}
              placeholder={input.placeholder}
              onDelete={input.canDelete ? () => handleDeleteAgreeInput(input.id) : undefined}
            />
          ))}
          {agreeInputs.length < 5 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <button
                onClick={handleAddAgreeInput}
                style={{ width: '40px', height: '40px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                <img src={inputPlusIcon} alt="입력 필드 추가" style={{ width: '40px', height: '40px' }} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 비동의 */}
      <div style={{ marginTop: 50, marginBottom: '30px' }}>
        <h2 style={{ ...FontStyles.headlineSmall, marginBottom: '0px', color: Colors.grey07 }}>[선택지2] 비동의</h2>
        <p style={{ ...FontStyles.title, color: Colors.grey05, marginBottom: '0px' }}>
          '비동의'을(를) 선택했을 때 일어날 수 있는 예상치 못한 상황에 대해 설명해주세요.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 100, alignItems: 'flex-start', paddingBottom: 40 }}>
        {/* B: 이미지(비동의) */}
        <div style={{ flex: '0 0 360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ width: '100%', height: '180px', border: '2px solid #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', overflow: 'hidden' }}>
            <img
              src={!disagreeFallback && disagreeUrl ? disagreeUrl : create02Image}
              alt="비동의 이미지"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
              onError={() => setDisagreeFallback(true)}
              onLoad={() => setDisagreeFallback(false)}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <span
              onClick={() => handleImageChange(2)}
              style={{ color: '#333', fontSize: 14, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
            >
              이미지 변경
            </span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: Colors.systemRed, ...FontStyles.bodyBold, margin: 0, lineHeight: 1.4 }}>(*권장 이미지 비율 2:1)</p>
          </div>
        </div>

        {/* C: 비동의 입력 */}
        <div style={{ flex: '1', marginTop: -10 }}>
          {disagreeInputs.map((input) => (
            <CreateInput
              key={input.id}
              label={input.label}
              value={input.value}
              onChange={(e) => handleDisagreeInputChange(input.id, e.target.value)}
              placeholder={input.placeholder}
              onDelete={input.canDelete ? () => handleDeleteDisagreeInput(input.id) : undefined}
            />
          ))}
          {disagreeInputs.length < 5 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <button
                onClick={handleAddDisagreeInput}
                style={{ width: '40px', height: '40px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                <img src={inputPlusIcon} alt="입력 필드 추가" style={{ width: '40px', height: '40px' }} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div style={{ position: 'absolute', bottom: '30px', right: '30px' }}>
        <NextGreen onClick={handleNext} />
      </div>
      <div style={{ position: 'absolute', bottom: '30px', left: '30px' }}>
        <BackOrange onClick={() => navigate('/create03')} />
      </div>
    </CreatorLayout>
  );
}
