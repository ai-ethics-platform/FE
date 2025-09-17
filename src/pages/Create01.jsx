// import React, { useEffect, useState, useRef } from 'react';
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
// import axiosInstance from '../api/axiosInstance';

// // 기본 대표이미지(팩토리) 업로드 → 상태/로컬 반영
// const DEFAULT_UPLOAD_FLAG = 'dilemma_image_1_default_uploaded';

// async function uploadDefaultDilemmaImage1(onApplied) {
//   if (localStorage.getItem(DEFAULT_UPLOAD_FLAG) === '1') return null; // 중복 업로드 방지 // 중복 업로드 방지
//   const code = localStorage.getItem('code');
//   if (!code) return null;

//   try {
//     // 번들된 기본 이미지를 Blob으로 가져오기
//     const resp = await fetch(create02Image);
//     let file = new File([await resp.blob()], 'default.png', { type: 'image/png' });

//     // 2단계 축소(용량 큰 PNG 대비; 내부적으로 JPEG로 전환됨)
//     file = await twoStepCompress(file).catch(() => file);

//     // 기존 업로더로 업로드 (413 대응은 내부에서 함)
//     const url = await putRepresentativeImageFile(code, 'dilemma_image_1', file);
//     if (url) {
//       localStorage.setItem('dilemma_image_1', url);
//       localStorage.setItem(DEFAULT_UPLOAD_FLAG, '1');

//       // const resolved = resolveImageUrl(url);
//       // setImageUrl(resolved);
//       // setUseFallback(!resolved);
//       // defaultUploadedRef.current = true;
//       if (typeof onApplied === 'function') {
//                  const resolved = resolveImageUrl(url);
//                  onApplied(resolved);
//                }
//     }
//     return url;
//   } catch (e) {
//     console.error('기본 대표 이미지 업로드 실패:', e);
//     return null;
//   }
// }
 

//  // 파일 상단 import 근처
// // === 이미지 축소 유틸 시작 ===
// // 목표 바이트(1차/2차), 리사이즈 기준(긴 변), JPEG 품질을 상황에 맞게 조절
// const IMG_COMPRESS_PRESET_1 = { maxEdge: 2000, quality: 0.85, targetBytes: 1.8 * 1024 * 1024 }; // ~1.8MB
// const IMG_COMPRESS_PRESET_2 = { maxEdge: 1280, quality: 0.75, targetBytes: 0.9 * 1024 * 1024 }; // ~0.9MB

// // 이미지 File|Blob -> HTMLImageElement 로드
// function loadImageFromFile(file) {
//   return new Promise((resolve, reject) => {
//     const url = URL.createObjectURL(file);
//     const img = new Image();
//     img.onload = () => {
//       URL.revokeObjectURL(url);
//       resolve(img);
//     };
//     img.onerror = (e) => {
//       URL.revokeObjectURL(url);
//       reject(e);
//     };
//     img.src = url;
//   });
// }

// // (너비, 높이) 비율 유지하며 긴 변을 maxEdge로 리사이즈
// function calcSizeKeepRatio(w, h, maxEdge) {
//   const longEdge = Math.max(w, h);
//   if (longEdge <= maxEdge) return { width: w, height: h };
//   const scale = maxEdge / longEdge;
//   return { width: Math.round(w * scale), height: Math.round(h * scale) };
// }

// // 캔버스로 리사이즈 + JPEG 압축 → Blob
// async function resizeAndCompressToBlob(file, { maxEdge, quality }) {
//   const img = await loadImageFromFile(file);
//   const { width, height } = calcSizeKeepRatio(img.width, img.height, maxEdge);
//   const canvas = document.createElement('canvas');
//   const ctx = canvas.getContext('2d', { alpha: false });
//   canvas.width = width;
//   canvas.height = height;
//   ctx.drawImage(img, 0, 0, width, height);
//   return new Promise((resolve) => {
//     canvas.toBlob(
//       (blob) => resolve(blob),
//       'image/jpeg',
//       quality
//     );
//   });
// }

// // Blob -> File 로 감싸기(서버에 file 필드 필요)
// function blobToFile(blob, fileName = 'image.jpg') {
//   return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
// }

// // 2차 축소 로직:
// // 1) 파일이 크면 1차(큰 리사이즈)로 줄이고,
// // 2) 아직 크거나 서버가 413이면 2차(더 강한 리사이즈) 적용
// async function twoStepCompress(file, { preset1 = IMG_COMPRESS_PRESET_1, preset2 = IMG_COMPRESS_PRESET_2 } = {}) {
//   let working = file;

//   // 원본이 너무 크면 1차 축소
//   if (working.size > preset1.targetBytes) {
//     const blob1 = await resizeAndCompressToBlob(working, preset1);
//     if (blob1 && blob1.size < working.size) {
//       working = blobToFile(blob1, working.name.replace(/\.\w+$/, '') + '_c1.jpg');
//     }
//   }

//   // 그래도 크면 2차 축소
//   if (working.size > preset2.targetBytes) {
//     const blob2 = await resizeAndCompressToBlob(working, preset2);
//     if (blob2 && blob2.size < working.size) {
//       working = blobToFile(blob2, working.name.replace(/\.\w+$/, '') + '_c2.jpg');
//     }
//   }

//   return working;
// }
// // === 이미지 축소 유틸 끝 ===
// const DEFAULT_DATA = {
//   opening: ["문장1.", "문장2.", "문장3."],
//   roles:[
//     {"name": "1P", "description": "1P 문장"},
//     {"name": "2P", "description": "한 문장"},
//     {"name": "3P", "description": "한 문장"}
//   ],
//   rolesBackground: "세 역할 공통 배경 설명",
//   dilemma:{
//     "situation": ["문장1.", "문장2.", "문장3."],
//     "question": "질문 한 문장.",
//     "options": { agree_label: "동의", disagree_label: "비동의" }
//   },
//   flips: {
//     agree_texts: ["문장1.", "문장2.", "문장3.","문장4"],
//     disagree_texts: ["문장1.", "문장2.", "문장3."],
//   },
//   finalMessages: { agree: "동의 엔딩.", disagree: "비동의 엔딩." },
// };

// // 파일 상단 import 근처
// const resolveImageUrl = (raw) => {
//   if (!raw || raw === '-' || String(raw).trim() === '') return null;
//   const u = String(raw).trim();
//   // 절대 URL이면 그대로 사용
//   if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
//   // 상대 경로면 axios baseURL 기준으로 보정
//   const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
//   if (!base) return u; // baseURL 없으면 일단 그대로
//   return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
// };


// function readLocalData() {
//   try {
//     const raw = localStorage.getItem('data');
//     const parsed = raw ? JSON.parse(raw) : null;

//     // 과거에 'data'에 opening 배열만 저장된 레거시 형태 보정
//     // - parsed가 배열이면 완전 레거시
//     if (Array.isArray(parsed)) {
//       return { ...DEFAULT_DATA, opening: parsed };
//     }

//     // - 객체인데 opening만 있는 경우도 DEFAULT와 머지
//     if (parsed && typeof parsed === 'object') {
//       return { ...DEFAULT_DATA, ...parsed, dilemma: { ...DEFAULT_DATA.dilemma, ...(parsed.dilemma || {}) }, flips: { ...DEFAULT_DATA.flips, ...(parsed.flips || {}) }, finalMessages: { ...DEFAULT_DATA.finalMessages, ...(parsed.finalMessages || {}) } };
//     }

//     // 비정상/null이면 기본값
//     return { ...DEFAULT_DATA };
//   } catch {
//     return { ...DEFAULT_DATA };
//   }
// }

// function writeLocalData(nextData) {
//   // DEFAULT_DATA와 깊은 머지(중첩 객체는 필요한 부분만 덮기)
//   const merged = {
//     ...DEFAULT_DATA,
//     ...nextData,
//     dilemma: { ...DEFAULT_DATA.dilemma, ...(nextData?.dilemma || {}) },
//     flips: { ...DEFAULT_DATA.flips, ...(nextData?.flips || {}) },
//     finalMessages: { ...DEFAULT_DATA.finalMessages, ...(nextData?.finalMessages || {}) },
//   };
//   localStorage.setItem('data', JSON.stringify(merged));
//   return merged;
// }

// export default function Create01() {
//   const navigate = useNavigate();

//   // 제목은 서버에서 받아온 값으로 교체됨
//   const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");
//   // A 영역 - 오프닝/제목 멘트 (입력은 안 쓰지만 상태 유지)
//   const [openingText, setOpeningText] = useState("");

//   // B 영역 - 이미지 상태 (기본 이미지로 시작)
//   const [image, setImage] = useState(null);
//   const [isDefaultImage, setIsDefaultImage] = useState(true);
// // 초기 상태는 로컬 우선
// const [imageUrl, setImageUrl] = useState(() => resolveImageUrl(localStorage.getItem('dilemma_image_1')));
// const [useFallback, setUseFallback] = useState(() => !resolveImageUrl(localStorage.getItem('dilemma_image_1')));

//   // C 영역 - 입력 필드: ★ 서버의 data.opening 배열 길이대로 생성됨
//   const [inputs, setInputs] = useState([
//     { id: 1, label: "화면 1 *", value: "", placeholder: "예: Homemate 사용자 최적화 시스템 업그레이드 공지", canDelete: false },
//     { id: 2, label: "화면 2 ", value: "", placeholder: "예: 업데이트를 하면 고객님의 감정, 건강 상태, 생활 습관 등을 자동으로 수집하여...", canDelete: true },
//     { id: 3, label: "화면 3 ", value: "", placeholder: " ", canDelete: true }
//   ]);


// useEffect(() => {
//   // 1) 로컬 먼저 반영
//   const local = resolveImageUrl(localStorage.getItem('dilemma_image_1'));
//   if (local) {
//     setImageUrl(local);
//     setUseFallback(false);
//   }

//   const fetchOnce = async () => {
//     const code = localStorage.getItem('code');
//     if (!code) return;

//     try {
//       const res = await axiosInstance.get(`/custom-games/${code}`, {
//         headers: { 'Content-Type': 'application/json' },
//       });
//       const game = res?.data || {};

//       // 2) 대표 이미지 맵에서 우선적으로 가져오기
//       const rawFromMap =
//         game?.representative_images?.dilemma_image_1 ||
//         game?.data?.representativeImages?.dilemma_image_1 ||
//         null;

//       // 3) 없으면 보조 필드(예: '-')는 무시
//       const raw =
//         (rawFromMap && rawFromMap !== '-') ? rawFromMap
//         : (game?.representative_image_url && game?.representative_image_url !== '-' ? game?.representative_image_url : null);

//       const resolved = resolveImageUrl(raw);

//       // 4) 유효할 때만 로컬/상태 갱신 (이미지 있으면 덮지 않음)
//       if (resolved) {
//         localStorage.setItem('dilemma_image_1', raw);
//         setImageUrl(prev => prev || resolved); // 이미 표시 중이면 유지
//         setUseFallback(false);
//       } else {
//               // 서버/로컬 모두 없으면 기본 이미지도 서버에 업로드
//               await uploadDefaultDilemmaImage1((resolved) => {
//                    setImageUrl(resolved);
//                   setUseFallback(!resolved);
//                  });      // resolved가 없으면 아무 것도 하지 않음(폴백으로 덮지 않음)
//     } 
//   }catch (e) {
//       console.error('게임 정보 GET 실패:', e);
//       if (!localStorage.getItem('dilemma_image_1')) {
//        await uploadDefaultDilemmaImage1((resolved) => {
//          setImageUrl(resolved);
//          setUseFallback(!resolved);
//        });
//      }
//     }
//   };

//   // 즉시 시도 + code 늦게 셋팅되는 경우를 위한 0ms 재시도
//   fetchOnce();
//   const t = setTimeout(fetchOnce, 0);
//   return () => clearTimeout(t);
// }, []);

  
//   const didInit = useRef(false);
//   useEffect(() => {
//     if (didInit.current) return;
//     didInit.current = true;
//     const code = localStorage.getItem('code');

//     //  대표 이미지 맵은 항상 한 번 새로 당겨 로컬에 저장
//     if (code) {
//       (async () => {
//         try {
//           const images = await fetchRepresentativeImages(code);
    
//           // 화면용 썸네일은 dilemma_image_1 기준
//           const img1 = images?.dilemma_image_1 ?? localStorage.getItem('dilemma_image_1') ?? '';
//           const resolved = resolveImageUrl(img1);
//           setImageUrl(resolved);
//           setUseFallback(!resolved);
//         } catch (err) {
//           console.error('대표 이미지 로드 실패:', err);
//           // 실패 시에도 로컬 값이 있으면 그걸로 표시
//           const fallback1 = localStorage.getItem('dilemma_image_1') ?? '';
//           const resolved = resolveImageUrl(fallback1);
//           setImageUrl(resolved);
//           setUseFallback(!resolved);
//         }
//       })();
//     }
    
//     // 1) 로컬 우선
//     try {
//       const localData = readLocalData(); // 스키마 보장된 객체
//       const localOpening = Array.isArray(localData.opening) ? localData.opening : [];
  
//       if (localOpening.length > 0) {
//         const built = localOpening.map((text, idx) => ({
//           id: idx + 1,
//           label: `화면 ${idx + 1}${idx === 0 ? ' *' : ''}`,
//           value: text ?? '',
//           placeholder: idx === 0
//             ? "예: Homemate 사용자 최적화 시스템 업그레이드 공지"
//             : " ",
//           canDelete: idx !== 0,
//         }));
//         setInputs(built);
        
//       } else {
//         writeLocalData(localData); // 명시적으로 한 번 시드
//       }
//     } catch (err) {
//       console.error('로컬 파싱 실패:', err);
//       writeLocalData(DEFAULT_DATA);
//     }
  
//     // const code = localStorage.getItem('code');
//       const hasLocalData = !!localStorage.getItem('data');
//       const hasLocalTitle = !!localStorage.getItem('creatorTitle');
//       if (!code || (hasLocalData && hasLocalTitle)) {
//         console.log('GET 스킵: 로컬 data/creatorTitle 이미 존재');
//         return;
//       }
  
//     (async () => {
//       try {
//         const res = await axiosInstance.get(`/custom-games/${code}`, {
//           headers: { 'Content-Type': 'application/json' },
//         });
//         const game = res?.data || {};
//         const {
//           teacher_name,
//           teacher_school,
//           teacher_email,
//           title: serverTitle,
//           representative_image_url,
//           data: serverData,
//         } = game;
  
//         if (teacher_name !== undefined) localStorage.setItem('teacher_name', teacher_name ?? '');
//         if (teacher_school !== undefined) localStorage.setItem('teacher_school', teacher_school ?? '');
//         if (teacher_email !== undefined) localStorage.setItem('teacher_email', teacher_email ?? '');
//         if (serverTitle !== undefined) localStorage.setItem('creatorTitle', serverTitle ?? '');
//         if (representative_image_url !== undefined) localStorage.setItem('representative_image_url', representative_image_url ?? '');
  
//         // 서버 데이터도 스키마와 머지 후 저장
//         const mergedData = writeLocalData(serverData || {});
//         setTitle(serverTitle ?? '');
  
//         const openingArr = Array.isArray(mergedData.opening) ? mergedData.opening : [];
//         const built = (openingArr.length > 0 ? openingArr : [])
//           .map((text, idx) => ({
//             id: idx + 1,
//             label: `화면 ${idx + 1}${idx === 0 ? ' *' : ''}`,
//             value: text ?? '',
//             placeholder: idx === 0
//               ? "예: Homemate 사용자 최적화 시스템 업그레이드 공지"
//               : " ",
//             canDelete: idx !== 0,
//           }));
  
//         if (built.length > 0) {
//           setInputs(built);
//         } else {
//           // opening이 비어있다면 최소 1개는 UI에 유지
//           setInputs(prev => {
//             saveOpeningToLocal(prev);
//             return prev;
//           });
//         }
//         // if (representative_image_url !== undefined) {
//         //   localStorage.setItem('representative_image_url', representative_image_url ?? '');
//         //   const resolved = resolveImageUrl(representative_image_url);
//         //   setImageUrl(resolved);
//         //   setUseFallback(!resolved); // 값이 없으면 폴백 사용
//         // }
//       } catch (e) {
//         console.error(e);
//         console.log('게임 정보를 불러오지 못했습니다.');
//         // 서버 실패해도 이미 로컬은 스키마로 안전
//       }
//     })();
//   }, [navigate]);
  
// //  모든 대표 이미지 맵을 가져와 localStorage에 저장  /custom-games/{code}/dilemma-images
// async function fetchRepresentativeImages(code) {
//   if (!code) throw new Error('게임 코드가 없습니다. (code)');
//   const res = await axiosInstance.get(`/custom-games/${code}/dilemma-images`, {
//     headers: { 'Content-Type': 'application/json' },
//   });
//   const images = res?.data?.images || {};

//   // 저장 키: dilemma_image_1, dilemma_image_3, dilemma_image_4_1, dilemma_image_4_2
//   const keys = ['dilemma_image_1', 'dilemma_image_3', 'dilemma_image_4_1', 'dilemma_image_4_2'];
//   keys.forEach((k) => {
//     if (images[k] !== undefined) {
//       localStorage.setItem(k, images[k] ?? '');
//     }
//   });

//   return images;
// }

// async function putRepresentativeImageFile(code, slot, file) {
//   if (!code || !slot) throw new Error("code와 slot은 필수입니다.");
//   const form = new FormData();
//   form.append("file", file); // 서버 요구: 필드명 'file'
//     try {
//         const res = await axiosInstance.put(
//           `/custom-games/${code}/dilemma-images/${slot}`,
//           form,
//           { headers: { "Content-Type": "multipart/form-data" } }
//         );
//         const url = res?.data?.url || res?.data?.image_url;
//         if (url) localStorage.setItem(slot, url);
//         return url;
//       } catch (err) {
//         // 서버가 413(용량 초과) 주면 2차 축소 후 1번 더 재시도
//         const status = err?.response?.status;
//         if (status === 413) {
//           // 강한 프리셋으로 다시 한번 축소해서 재업로드
//           const compressed = await twoStepCompress(file, {
//             preset1: IMG_COMPRESS_PRESET_2, // 바로 강하게
//             preset2: { maxEdge: 960, quality: 0.7, targetBytes: 0.6 * 1024 * 1024 }
//           });
//           const form2 = new FormData();
//           form2.append("file", compressed);
//           const retry = await axiosInstance.put(
//             `/custom-games/${code}/dilemma-images/${slot}`,
//             form2,
//             { headers: { "Content-Type": "multipart/form-data" } }
//           );
//           const url2 = retry?.data?.url || retry?.data?.image_url;
//           if (url2) localStorage.setItem(slot, url2);
//           return url2;
//         }
//         throw err;
//       }
    
// }



// // Opening 배열 PUT
// const putOpening = async (inputs) => {
//   const code = localStorage.getItem('code');
//   if (!code) {
//     throw new Error('게임 코드가 없습니다. (code)');
//   }

//   // 입력값을 순서대로 배열화 (id 순서 유지)
//   const openingRaw = [...inputs]
//     .sort((a, b) => a.id - b.id)
//     .map(it => (it.value ?? '').trim());

//   // 서버가 빈 문자열을 허용하지 않는 경우가 많아 최소 1자 보장
//   const opening = openingRaw.map(v => (v.length > 0 ? v : '-'));
//   await axiosInstance.put(
//     `/custom-games/${code}/opening`,
//     { opening },
//     { headers: { 'Content-Type': 'application/json' } }
//   );
// };

// const saveOpeningToLocal = (nextInputs) => {
//   try {
//     const base = readLocalData(); // 항상 스키마 보장된 객체
//     const opening = [...nextInputs]
//       .sort((a, b) => a.id - b.id)
//       .map(it => (it.value ?? ''));

//     const next = { ...base, opening };
//     writeLocalData(next);          // 항상 스키마 보존하면서 저장
//     localStorage.setItem('opening', JSON.stringify(opening)); // 디버그용 유지
//   } catch (err) {
//     console.error('로컬 저장 실패:', err);
//   }
// };

//   // 저장(다음 단계) 클릭 시
//   const handleConfirm = async (finalTitle) => {
//     const hasEmptyFirst = (inputs[0]?.value ?? '').trim().length === 0;
//     if (hasEmptyFirst) {
//       alert('화면 1은 반드시 입력해 주세요.');
//       return;
//     }
//     try {
//       setTitle(finalTitle);
//       localStorage.setItem('creatorTitle', finalTitle);
//       await putOpening(inputs);
//       navigate('/create02');
//     } catch (e) { console.error(e); alert('저장 중 오류'); }
//   };

//   const handleAddInput = () => {
//     setInputs(prev => {
//       if (prev.length >= 5) return prev;
//       const nextId = prev.reduce((m, it) => Math.max(m, it.id), 0) + 1;
//       const next = [
//         ...prev,
//         { id: nextId, label: `화면 ${prev.length + 1} `, value: "", placeholder: " ", canDelete: true }
//       ];
//       saveOpeningToLocal(next); // 
//       return next;
//     });
//   };
  
//   const handleDeleteInput = (idToDelete) => {
//     setInputs(prev => {
//       const filtered = prev.filter(input => input.id !== idToDelete);
//       const next = filtered.map((input, index) => ({
//         ...input,
//         id: index + 1,
//         label: `화면 ${index + 1} `,
//         canDelete: index !== 0,
//       }));
//       saveOpeningToLocal(next); // 
//       return next;
//     });
//   };
  

//   const handleInputChange = (id, newValue) => {
//     setInputs(prev => {
//       const next = prev.map(input =>
//         input.id === id ? { ...input, value: newValue } : input
//       );
//       saveOpeningToLocal(next); //  변경 즉시 전체 동기화
//       return next;
//     });
//   };
  
//   const handleImageChange = () => {
//     const input = document.createElement("input");
//     input.type = "file";
//     input.accept = "image/*";
//     input.onchange = async (e) => {
//       const file = e.target.files?.[0];
//       if (!file) return;
  
//       const code = localStorage.getItem("code");
//       if (!code) {
//         alert("게임 코드가 없습니다.");
//         return;
//       }
  
//       try {
//         // 0) 업로드 전, 프리셋 기준으로 2차 축소 실행(사전 축소)
//       const preCompressed = await twoStepCompress(file);
//       // 1) 업로드 시도(서버에서 413이면 putRepresentativeImageFile 내부에서 추가 축소 후 재시도)
//       const url = await putRepresentativeImageFile(code, "dilemma_image_1", preCompressed);
 
   
//         if (url) {
//           const resolved = resolveImageUrl(url);
//           setImageUrl(resolved);
//           setUseFallback(!resolved);
//         }
//       } catch (err) {
//         console.error(err);
//         alert("이미지 업로드 실패");
//       }
//     };
//     input.click();
//   };
  

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
//       {/* A 영역 - 오프닝/제목 멘트 */}
//       <div style={{ marginTop: -30, marginBottom: '30px' }}>
//         <h2 style={{
//           ...FontStyles.headlineSmall,
//           marginBottom: '16px',
//           color: Colors.grey07
//         }}>
//           오프닝 멘트
//         </h2>

//         <p style={{
//           ...FontStyles.title,
//           color: Colors.grey05,
//           lineHeight: 1.5,
//           marginBottom: '32px'
//         }}>
//           딜레마 상황이 발생하는 기술과 관련된 사회적인 배경, 맥락을 간략하게 소개해 주세요.
//         </p>
//       </div>

//       {/* B, C 영역을 같은 행에 배치 */}
//       <div style={{
//         display: 'flex',
//         gap: 100,
//         alignItems: 'flex-start',
//         marginBottom: '20px'
//       }}>
//         {/* B 영역 - 이미지 영역 */}
//         <div style={{
//           flex: '0 0 360px',
//           display: 'flex',
//           flexDirection: 'column',
//           gap: '20px'
//         }}>
//           {/* 이미지 표시 영역 */}
// <div
//   style={{
//     width: '100%',
//     height: '180px',
//     border: '2px solid #ddd',
//     borderRadius: '8px',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#f8f9fa',
//     overflow: 'hidden'
//   }}
// >
//   <img
//     src={!useFallback && imageUrl ? imageUrl : create02Image}
//     alt="딜레마 이미지"
//     style={{
//       width: '100%',
//       height: '100%',
//       objectFit: 'cover',
//       borderRadius: '6px'
//     }}
//     onError={() => setUseFallback(true)}  // URL 깨지면 즉시 기본 이미지로
//     onLoad={() => setUseFallback(false)}  // 정상 로딩 시 폴백 해제
//   />
// </div>


//           {/* 이미지 변경 링크 */}
//           <div style={{ textAlign: 'center' }}>
//             <span
//               onClick={handleImageChange}
//               style={{
//                 color: '#333',
//                 fontSize: '14px',
//                 cursor: 'pointer',
//                 textDecoration: 'underline',
//                 textUnderlineOffset: '3px'
//               }}
//             >
//               이미지 변경
//             </span>
//           </div>

//           {/* 안내문 */}
//           <div style={{ textAlign: 'center' }}>
//             <p style={{
//               color: Colors.systemRed,
//               ...FontStyles.bodyBold,
//               margin: 0,
//               lineHeight: 1.4
//             }}>
//               (*권장 이미지 비율 2:1)
//             </p>
//           </div>
//         </div>

//         {/* C 영역 - 입력 필드들 (opening 배열로 생성된 만큼 렌더링) */}
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

//           {/* + 버튼 - 기본은 5개 제한 유지. opening이 5개 이상이면 버튼 숨김 */}
//           {inputs.length < 5 && (
//             <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
//               <button
//                 onClick={handleAddInput}
//                 style={{
//                   width: '40px',
//                   height: '40px',
//                   backgroundColor: 'transparent',
//                   border: 'none',
//                   cursor: 'pointer',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   padding: 0
//                 }}
//               >
//                 <img src={inputPlusIcon} alt="입력 필드 추가" style={{ width: '40px', height: '40px' }} />
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       <div style={{ position: 'absolute', bottom: '30px', right: '30px' }}>
//         <NextGreen onClick={() => handleConfirm(title)} />
//       </div>
//     </CreatorLayout>
//   );
// }

import React, { useEffect, useState, useRef } from 'react';
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
import axiosInstance from '../api/axiosInstance';

/* =========================
   공통 유틸/헬퍼 (의존되는 것 우선)
   ========================= */

// 절대/상대 URL 보정 (function 선언 → 안전한 호이스팅)
function resolveImageUrl(raw) {
  if (!raw || raw === '-' || String(raw).trim() === '') return null;
  const u = String(raw).trim();
  if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
  const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
  if (!base) return u;
  return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
}

// === 이미지 축소 유틸 시작 ===
const IMG_COMPRESS_PRESET_1 = { maxEdge: 2000, quality: 0.85, targetBytes: 1.8 * 1024 * 1024 };
const IMG_COMPRESS_PRESET_2 = { maxEdge: 1280, quality: 0.75, targetBytes: 0.9 * 1024 * 1024 };

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
// === 이미지 축소 유틸 끝 ===

// 대표 이미지 업로드 (서버 스펙에 맞춰 PUT 사용)
async function putRepresentativeImageFile(code, slot, file) {
  if (!code || !slot) throw new Error("code와 slot은 필수입니다.");
  const form = new FormData();
  form.append("file", file);
  try {
    const res = await axiosInstance.put(
      `/custom-games/${code}/dilemma-images/${slot}`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    const url = res?.data?.url || res?.data?.image_url;
    if (url) localStorage.setItem(slot, url);
    if (!url) throw new Error('업로드 응답에 url이 없습니다.');
    return url;
  } catch (err) {
    if (err?.response?.status === 413) {
      const compressed = await twoStepCompress(file, {
        preset1: IMG_COMPRESS_PRESET_2,
        preset2: { maxEdge: 960, quality: 0.7, targetBytes: 0.6 * 1024 * 1024 }
      });
      const form2 = new FormData();
      form2.append("file", compressed);
      const retry = await axiosInstance.put(
        `/custom-games/${code}/dilemma-images/${slot}`,
        form2,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const url2 = retry?.data?.url || retry?.data?.image_url;
      if (url2) localStorage.setItem(slot, url2);
      if (!url2) throw new Error('업로드 응답에 url이 없습니다.(retry)');
      return url2;
    }
    throw err;
  }
}

/* =========================
   기본 데이터/로컬 저장 유틸
   ========================= */
const DEFAULT_DATA = {
  opening: ["문장1.", "문장2.", "문장3."],
  roles: [
    { name: "1P", description: "1P 문장" },
    { name: "2P", description: "한 문장" },
    { name: "3P", description: "한 문장" }
  ],
  rolesBackground: "세 역할 공통 배경 설명",
  dilemma: {
    situation: ["문장1.", "문장2.", "문장3."],
    question: "질문 한 문장.",
    options: { agree_label: "동의", disagree_label: "비동의" }
  },
  flips: {
    agree_texts: ["문장1.", "문장2.", "문장3.", "문장4"],
    disagree_texts: ["문장1.", "문장2.", "문장3."]
  },
  finalMessages: { agree: "동의 엔딩.", disagree: "비동의 엔딩." }
};

function readLocalData() {
  try {
    const raw = localStorage.getItem('data');
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) return { ...DEFAULT_DATA, opening: parsed };
    if (parsed && typeof parsed === 'object') {
      return {
        ...DEFAULT_DATA,
        ...parsed,
        dilemma: { ...DEFAULT_DATA.dilemma, ...(parsed.dilemma || {}) },
        flips: { ...DEFAULT_DATA.flips, ...(parsed.flips || {}) },
        finalMessages: { ...DEFAULT_DATA.finalMessages, ...(parsed.finalMessages || {}) }
      };
    }
    return { ...DEFAULT_DATA };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

function writeLocalData(nextData) {
  const merged = {
    ...DEFAULT_DATA,
    ...nextData,
    dilemma: { ...DEFAULT_DATA.dilemma, ...(nextData?.dilemma || {}) },
    flips: { ...DEFAULT_DATA.flips, ...(nextData?.flips || {}) },
    finalMessages: { ...DEFAULT_DATA.finalMessages, ...(nextData?.finalMessages || {}) }
  };
  localStorage.setItem('data', JSON.stringify(merged));
  return merged;
}

// Opening PUT
async function putOpening(inputs) {
  const code = localStorage.getItem('code');
  if (!code) throw new Error('게임 코드가 없습니다. (code)');
  const openingRaw = [...inputs].sort((a, b) => a.id - b.id).map(it => (it.value ?? '').trim());
  const opening = openingRaw.map(v => (v.length > 0 ? v : '-'));
  await axiosInstance.put(
    `/custom-games/${code}/opening`,
    { opening },
    { headers: { 'Content-Type': 'application/json' } }
  );
}

function saveOpeningToLocal(nextInputs) {
  try {
    const base = readLocalData();
    const opening = [...nextInputs].sort((a, b) => a.id - b.id).map(it => (it.value ?? ''));
    const next = { ...base, opening };
    writeLocalData(next);
    localStorage.setItem('opening', JSON.stringify(opening));
  } catch (err) {
    console.error('로컬 저장 실패:', err);
  }
}

// 대표 이미지 맵 GET (선택 사용)
async function fetchRepresentativeImages(code) {
  if (!code) throw new Error('게임 코드가 없습니다. (code)');
  const res = await axiosInstance.get(`/custom-games/${code}/dilemma-images`, {
    headers: { 'Content-Type': 'application/json' }
  });
  const images = res?.data?.images || {};
  const keys = ['dilemma_image_1', 'dilemma_image_3', 'dilemma_image_4_1', 'dilemma_image_4_2'];
  keys.forEach((k) => {
    if (images[k] !== undefined) localStorage.setItem(k, images[k] ?? '');
  });
  return images;
}

/* =========================
   기본 대표이미지 자동 업로드
   ========================= */
const DEFAULT_UPLOAD_FLAG = 'dilemma_image_1';

async function uploadDefaultDilemmaImage1(onApplied) {
  if (localStorage.getItem(DEFAULT_UPLOAD_FLAG) === '1') return null; // 중복 업로드 방지
  const code = localStorage.getItem('code');
  if (!code) return null;

  try {
    const resp = await fetch(create02Image);
    let file = new File([await resp.blob()], 'default.png', { type: 'image/png' });
    file = await twoStepCompress(file).catch(() => file);

    const url = await putRepresentativeImageFile(code, 'dilemma_image_1', file);
    if (url) {
      localStorage.setItem('dilemma_image_1', url);
      localStorage.setItem(DEFAULT_UPLOAD_FLAG, '1');
      if (typeof onApplied === 'function') {
        onApplied(resolveImageUrl(url));
      }
    }
    return url;
  } catch (e) {
    console.error('기본 대표 이미지 업로드 실패:', e);
    return null;
  }
}

/* =========================
   컴포넌트
   ========================= */
export default function Create01() {
  const navigate = useNavigate();

  const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");
  const [openingText, setOpeningText] = useState("");

  // 대표 이미지 상태
  const [imageUrl, setImageUrl] = useState(() => resolveImageUrl(localStorage.getItem('dilemma_image_1')));
  const [useFallback, setUseFallback] = useState(() => !resolveImageUrl(localStorage.getItem('dilemma_image_1')));

  // opening 입력 상태
  const [inputs, setInputs] = useState([
    { id: 1, label: "화면 1 *", value: "", placeholder: "예: Homemate 사용자 최적화 시스템 업그레이드 공지", canDelete: false },
    { id: 2, label: "화면 2 ", value: "", placeholder: "예: 업데이트를 하면 고객님의 감정, 건강 상태, 생활 습관 등을 자동으로 수집하여...", canDelete: true },
    { id: 3, label: "화면 3 ", value: "", placeholder: " ", canDelete: true }
  ]);

  // 첫 로드: 서버/로컬 확인 → 없으면 기본이미지 업로드
  useEffect(() => {
    const local = resolveImageUrl(localStorage.getItem('dilemma_image_1'));
    if (local) {
      setImageUrl(local);
      setUseFallback(false);
    }

    const fetchOnce = async () => {
      const code = localStorage.getItem('code');
      if (!code) return;

      try {
        const res = await axiosInstance.get(`/custom-games/${code}`, {
          headers: { 'Content-Type': 'application/json' }
        });
        const game = res?.data || {};

        const rawFromMap =
          game?.representative_images?.dilemma_image_1 ||
          game?.data?.representativeImages?.dilemma_image_1 ||
          null;

        const raw =
          (rawFromMap && rawFromMap !== '-') ? rawFromMap
          : (game?.representative_image_url && game?.representative_image_url !== '-' ? game?.representative_image_url : null);

        const resolved = resolveImageUrl(raw);

        if (resolved) {
          localStorage.setItem('dilemma_image_1', raw);
          setImageUrl(prev => prev || resolved);
          setUseFallback(false);
        } else {
          // 서버/로컬 모두 없으면 기본 이미지 업로드
          await uploadDefaultDilemmaImage1((resolvedUrl) => {
            setImageUrl(resolvedUrl);
            setUseFallback(!resolvedUrl);
          });
        }
      } catch (e) {
        console.error('게임 정보 GET 실패:', e);
        if (!localStorage.getItem('dilemma_image_1')) {
          await uploadDefaultDilemmaImage1((resolvedUrl) => {
            setImageUrl(resolvedUrl);
            setUseFallback(!resolvedUrl);
          });
        }
      }
    };

    fetchOnce();
    const t = setTimeout(fetchOnce, 0);
    return () => clearTimeout(t);
  }, []);

  // 데이터/타이틀 초기화 + 대표 이미지 맵(선택)
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const code = localStorage.getItem('code');

    if (code) {
      (async () => {
        try {
          const images = await fetchRepresentativeImages(code);
          const img1 = images?.dilemma_image_1 ?? localStorage.getItem('dilemma_image_1') ?? '';
          const resolved = resolveImageUrl(img1);
          setImageUrl(resolved);
          setUseFallback(!resolved);
        } catch (err) {
          console.error('대표 이미지 로드 실패:', err);
          const fallback1 = localStorage.getItem('dilemma_image_1') ?? '';
          const resolved = resolveImageUrl(fallback1);
          setImageUrl(resolved);
          setUseFallback(!resolved);
        }
      })();
    }

    try {
      const localData = readLocalData();
      const localOpening = Array.isArray(localData.opening) ? localData.opening : [];

      if (localOpening.length > 0) {
        const built = localOpening.map((text, idx) => ({
          id: idx + 1,
          label: `화면 ${idx + 1}${idx === 0 ? ' *' : ''}`,
          value: text ?? '',
          placeholder: idx === 0
            ? "예: Homemate 사용자 최적화 시스템 업그레이드 공지"
            : " ",
          canDelete: idx !== 0
        }));
        setInputs(built);
      } else {
        writeLocalData(localData);
      }
    } catch (err) {
      console.error('로컬 파싱 실패:', err);
      writeLocalData(DEFAULT_DATA);
    }

    (async () => {
      const hasLocalData = !!localStorage.getItem('data');
      const hasLocalTitle = !!localStorage.getItem('creatorTitle');
      if (!code || (hasLocalData && hasLocalTitle)) return;

      try {
        const res = await axiosInstance.get(`/custom-games/${code}`, {
          headers: { 'Content-Type': 'application/json' }
        });
        const game = res?.data || {};
        const {
          teacher_name,
          teacher_school,
          teacher_email,
          title: serverTitle,
          representative_image_url,
          data: serverData
        } = game;

        if (teacher_name !== undefined) localStorage.setItem('teacher_name', teacher_name ?? '');
        if (teacher_school !== undefined) localStorage.setItem('teacher_school', teacher_school ?? '');
        if (teacher_email !== undefined) localStorage.setItem('teacher_email', teacher_email ?? '');
        if (serverTitle !== undefined) localStorage.setItem('creatorTitle', serverTitle ?? '');
        if (representative_image_url !== undefined) localStorage.setItem('representative_image_url', representative_image_url ?? '');

        const mergedData = writeLocalData(serverData || {});
        setTitle(serverTitle ?? '');

        const openingArr = Array.isArray(mergedData.opening) ? mergedData.opening : [];
        const built = (openingArr.length > 0 ? openingArr : []).map((text, idx) => ({
          id: idx + 1,
          label: `화면 ${idx + 1}${idx === 0 ? ' *' : ''}`,
          value: text ?? '',
          placeholder: idx === 0
            ? "예: Homemate 사용자 최적화 시스템 업그레이드 공지"
            : " ",
          canDelete: idx !== 0
        }));

        if (built.length > 0) setInputs(built);
        else {
          setInputs(prev => {
            saveOpeningToLocal(prev);
            return prev;
          });
        }
      } catch (e) {
        console.error(e);
        console.log('게임 정보를 불러오지 못했습니다.');
      }
    })();
  }, [navigate]);

  // 이미지 수동 변경
  const handleImageChange = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const code = localStorage.getItem("code");
      if (!code) {
        alert("게임 코드가 없습니다.");
        return;
      }

      try {
        const preCompressed = await twoStepCompress(file);
        const url = await putRepresentativeImageFile(code, "dilemma_image_1", preCompressed);
        if (url) {
          const resolved = resolveImageUrl(url);
          setImageUrl(resolved);
          setUseFallback(!resolved);
        }
      } catch (err) {
        console.error(err);
        alert("이미지 업로드 실패");
      }
    };
    input.click();
  };

  // 입력 관련 핸들러
  const handleAddInput = () => {
    setInputs(prev => {
      if (prev.length >= 5) return prev;
      const nextId = prev.reduce((m, it) => Math.max(m, it.id), 0) + 1;
      const next = [
        ...prev,
        { id: nextId, label: `화면 ${prev.length + 1} `, value: "", placeholder: " ", canDelete: true }
      ];
      saveOpeningToLocal(next);
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
      saveOpeningToLocal(next);
      return next;
    });
  };

  const handleInputChange = (id, newValue) => {
    setInputs(prev => {
      const next = prev.map(input => input.id === id ? { ...input, value: newValue } : input);
      saveOpeningToLocal(next);
      return next;
    });
  };

  // 다음 단계 저장
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
    } catch (e) {
      console.error(e);
      alert('저장 중 오류');
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
      {/* A 영역 - 오프닝/제목 멘트 */}
      <div style={{ marginTop: -30, marginBottom: '30px' }}>
        <h2 style={{ ...FontStyles.headlineSmall, marginBottom: '16px', color: Colors.grey07 }}>
          오프닝 멘트
        </h2>
        <p style={{ ...FontStyles.title, color: Colors.grey05, lineHeight: 1.5, marginBottom: '32px' }}>
          딜레마 상황이 발생하는 기술과 관련된 사회적인 배경, 맥락을 간략하게 소개해 주세요.
        </p>
      </div>

      {/* B, C 영역 */}
      <div style={{ display: 'flex', gap: 100, alignItems: 'flex-start', marginBottom: '20px' }}>
        {/* B: 이미지 */}
        <div style={{ flex: '0 0 360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              src={!useFallback && imageUrl ? imageUrl : create02Image}
              alt="딜레마 이미지"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
              onError={() => setUseFallback(true)}
              onLoad={() => setUseFallback(false)}
            />
          </div>

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

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: Colors.systemRed, ...FontStyles.bodyBold, margin: 0, lineHeight: 1.4 }}>
              (*권장 이미지 비율 2:1)
            </p>
          </div>
        </div>

        {/* C: 입력 필드 */}
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
