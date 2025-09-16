// // 아무것도 post 안한 디폴트일때 그 디폴트 이미지도 POST 하도록 하기
// import { useState, useEffect } from 'react';
// import CreatorLayout from '../components/Expanded/CreatorLayout';
// import { useNavigate } from 'react-router-dom';
// import { FontStyles, Colors } from '../components/styleConstants';
// import CustomInput from '../components/Expanded/CustomInput';
// import defaultProfileImg from "../assets/images/Frame235.png";
// import NextGreen from "../components/NextOrange";
// import BackOrange from "../components/Expanded/BackOrange";
// import axiosInstance from '../api/axiosInstance';

// const ROLE_IMG_KEYS = ['role_image_1', 'role_image_2', 'role_image_3'];

// // 절대 URL 보정
// const resolveImageUrl = (raw) => {
//   if (!raw || raw === '-' || String(raw).trim() === '') return null;
//   const u = String(raw).trim();
//   if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
//   const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
//   if (!base) return u;
//   return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
// };
//  const writeLocal = (k, v) => {
//      try { localStorage.setItem(k, v ?? ''); } catch {}
//   };
// // 역할 이미지 업로드 (개별 슬롯)
// async function uploadRoleImage(slot, file) {
//   const code = localStorage.getItem('code');
//   if (!code) throw new Error('게임 코드가 없습니다. (code)');
//   const form = new FormData();
//   form.append('file', file);
//   const res = await axiosInstance.put(
//     `/custom-games/${code}/role-images/${slot}`,
//     form,
//     { headers: { 'Content-Type': 'multipart/form-data' } }
//   );
//   const url = res?.data?.url || res?.data?.image_url;
//   if (!url) throw new Error('업로드 응답에 url이 없습니다.');
//   return url;
// }

// // ✅ 기본 이미지 파일(Frame235)을 Blob→File로 래핑해서 해당 슬롯에 POST
// async function uploadDefaultForSlot(slot, {
//   onApplied
// } = {}) {
//   const code = localStorage.getItem('code');
//   if (!code) throw new Error('게임 코드가 없습니다. (code)');

//   // 번들된 정적 에셋을 fetch해서 Blob 획득
//   const resp = await fetch(defaultProfileImg);
//   const blob = await resp.blob();
//   const file = new File([blob], `default_role_${slot}.png`, { type: blob.type || 'image/png' });

//   // 서버 업로드
//   const url = await uploadRoleImage(slot, file);

//   // 로컬/상태 반영 콜백
//   if (typeof onApplied === 'function') onApplied(url);
//   return url;
// }

// export default function Create02() {
//   const navigate = useNavigate();
//   const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");

//   // 텍스트(역할/설명/배경)
//   const [back, setBack] = useState('');
//   const [char1, setChar1] = useState('');
//   const [char2, setChar2] = useState('');
//   const [char3, setChar3] = useState('');
//   const [charDes1, setCharDes1] = useState('');
//   const [charDes2, setCharDes2] = useState('');
//   const [charDes3, setCharDes3] = useState('');

//   // 역할 이미지 상태 (URL + 폴백 플래그)
//   const [img1, setImg1] = useState(() => resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[0])));
//   const [img2, setImg2] = useState(() => resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[1])));
//   const [img3, setImg3] = useState(() => resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[2])));
//   const [fallback1, setFallback1] = useState((prev => {
//     const s = resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[0]));
//     return !s; // 없으면 기본 이미지를 화면에 보여줌
//   })());
//   const [fallback2, setFallback2] = useState((prev => {
//     const s = resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[1]));
//     return !s;
//   })());
//   const [fallback3, setFallback3] = useState((prev => {
//     const s = resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[2]));
//     return !s;
//   })());

//   // 1) 텍스트 초기화 (로컬 → data 승격)
//   useEffect(() => {
//     try {
//       const b  = localStorage.getItem('rolesBackground') || '';
//       const n1 = localStorage.getItem('char1') || '';
//       const n2 = localStorage.getItem('char2') || '';
//       const n3 = localStorage.getItem('char3') || '';
//       const d1 = localStorage.getItem('charDes1') || '';
//       const d2 = localStorage.getItem('charDes2') || '';
//       const d3 = localStorage.getItem('charDes3') || '';

//       const isValid = (v) => v && v.trim().length > 0;
//       const hasAllLocal =
//         isValid(b) && isValid(n1) && isValid(n2) && isValid(n3) &&
//         isValid(d1) && isValid(d2) && isValid(d3);

//       if (hasAllLocal) {
//         setBack(b); setChar1(n1); setChar2(n2); setChar3(n3);
//         setCharDes1(d1); setCharDes2(d2); setCharDes3(d3);
//       } else {
//         const raw = localStorage.getItem('data');
//         if (raw) {
//           const data = JSON.parse(raw);
//           const roles = Array.isArray(data?.roles) ? data.roles : [];
//           const rb = data?.rolesBackground ?? '';
//           const rn1 = roles[0]?.name ?? '';
//           const rn2 = roles[1]?.name ?? '';
//           const rn3 = roles[2]?.name ?? '';
//           const rd1 = roles[0]?.description ?? '';
//           const rd2 = roles[1]?.description ?? '';
//           const rd3 = roles[2]?.description ?? '';

//           setBack(rb);
//           setChar1(rn1); setChar2(rn2); setChar3(rn3);
//           setCharDes1(rd1); setCharDes2(rd2); setCharDes3(rd3);

//           // 승격 저장
//           const promote = (k, v) => { if (v && v.trim().length > 0) localStorage.setItem(k, v); };
//           promote('rolesBackground', rb);
//           promote('char1', rn1); promote('char2', rn2); promote('char3', rn3);
//           promote('charDes1', rd1); promote('charDes2', rd2); promote('charDes3', rd3);
//         }
//       }
//     } catch (e) {
//       console.error('Failed to init text from localStorage/data', e);
//     }
//   }, []);

//   // 2) 이미지 초기화: GET 없이 진행
//   // - 화면엔 즉시 기본 이미지(Frame235) 보임 (fallback=true일 때)
//   // - 서버에는 기본 이미지를 즉시 POST (각 슬롯별 한번만)
//   useEffect(() => {
//     const initImages = async () => {
//       const code = localStorage.getItem('code');
//       if (!code) {
//         // 코드 없으면 서버 업로드는 스킵, 화면은 기본 이미지 유지
//         setImg1(resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[0])));
//         setImg2(resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[1])));
//         setImg3(resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[2])));
//         return;
//       }

//       // 로컬 값으로 먼저 세팅 (있으면)
//       const s1 = resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[0]));
//       const s2 = resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[1]));
//       const s3 = resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[2]));
//       setImg1(s1); setFallback1(!s1);
//       setImg2(s2); setFallback2(!s2);
//       setImg3(s3); setFallback3(!s3);

//       // 없으면 기본 이미지(Frame235)를 서버에 업로드 후 로컬/상태 갱신
//       try {
//         if (!s1) {
//           await uploadDefaultForSlot(1, {
//             onApplied: (rawUrl) => {
//               const u = resolveImageUrl(rawUrl);
//               setImg1(u); setFallback1(!u);
//             }
//           });
//         }
//       } catch (e) {
//         console.error('기본 이미지 업로드 실패(1):', e);
//         setFallback1(true);
//       }
//       try {
//         if (!s2) {
//           await uploadDefaultForSlot(2, {
//             onApplied: (rawUrl) => {
//               const u = resolveImageUrl(rawUrl);
//               setImg2(u); setFallback2(!u);
//             }
//           });
//         }
//       } catch (e) {
//         console.error('기본 이미지 업로드 실패(2):', e);
//         setFallback2(true);
//       }
//       try {
//         if (!s3) {
//           await uploadDefaultForSlot(3, {
//             onApplied: (rawUrl) => {
//               const u = resolveImageUrl(rawUrl);
//               setImg3(u); setFallback3(!u);
//             }
//           });
//         }
//       } catch (e) {
//         console.error('기본 이미지 업로드 실패(3):', e);
//         setFallback3(true);
//       }
//     };

//     initImages();
//   }, []);

//   // 사용자가 직접 이미지 변경
//   const changeSlotImage = (slot) => {
//     const input = document.createElement('input');
//     input.type = 'file';
//     input.accept = 'image/*';
//     input.onchange = async (e) => {
//       const file = e.target.files?.[0];
//       if (!file) return;
//       try {
//         const rawUrl = await uploadRoleImage(slot, file);
//         localStorage.setItem(ROLE_IMG_KEYS[slot - 1], rawUrl);
//         const resolved = resolveImageUrl(rawUrl);
//         if (slot === 1) { setImg1(resolved); setFallback1(!resolved); }
//         if (slot === 2) { setImg2(resolved); setFallback2(!resolved); }
//         if (slot === 3) { setImg3(resolved); setFallback3(!resolved); }
//       } catch (err) {
//         console.error(err);
//         alert('역할 이미지 업로드에 실패했습니다.');
//         if (slot === 1) setFallback1(true);
//         if (slot === 2) setFallback2(true);
//         if (slot === 3) setFallback3(true);
//       }
//     };
//     input.click();
//   };

//   // 역할 텍스트 저장
//   const putRoles = async ({ roles, background }) => {
//     const code = localStorage.getItem('code');
//     if (!code) throw new Error('게임 코드가 없습니다. (code)');
//     await axiosInstance.put(
//       `/custom-games/${code}/roles`,
//       { roles, background },
//       { headers: { 'Content-Type': 'application/json' } }
//     );
//   };

//   const handleNext = async () => {
//     try {
//       const name1 = (char1 || '').trim();
//       const name2 = (char2 || '').trim();
//       const name3 = (char3 || '').trim();
//       const desc1 = (charDes1 || '').trim();
//       const desc2 = (charDes2 || '').trim();
//       const desc3 = (charDes3 || '').trim();
//       const background = (back || '').trim();

//       const safe = (s) => (s && s.length > 0 ? s : '-');
//       const rolesSafe = [
//         { name: safe(name1), description: safe(desc1) },
//         { name: safe(name2), description: safe(desc2) },
//         { name: safe(name3), description: safe(desc3) },
//       ];
//       await putRoles({ roles: rolesSafe, background: safe(background) });
//     // ✅ 서버에 보낸 값 그대로 로컬에도 정규화 반영
//      writeLocal('char1', rolesSafe[0].name);
//      writeLocal('char2', rolesSafe[1].name);
//      writeLocal('char3', rolesSafe[2].name);
//      writeLocal('charDes1', rolesSafe[0].description);
//      writeLocal('charDes2', rolesSafe[1].description);
//      writeLocal('charDes3', rolesSafe[2].description);
//      writeLocal('rolesBackground', safe(background));

//       navigate('/create03');
//     } catch (err) {
//       console.error(err);
//       alert('역할 저장 중 오류가 발생했습니다.');
//     }
//   };

//   const handleBack = () => navigate('/create01');

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
//       <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
//         <div style={{ marginTop: -30, marginBottom: 30 }}>
//           <h2 style={{ ...FontStyles.headlineNormal, color: Colors.grey07 }}>역할</h2>
//           <p style={{ ...FontStyles.title, color: Colors.grey05, lineHeight: 1.5, marginBottom: '32px' }}>
//             딜레마 상황에 등장하는 세명의 역할을 설정하세요. 각 역할은 게임에 참여하는 3명의 플레이어에게 임의로 배정됩니다.
//           </p>
// {/* 
//           <h2 style={{ ...FontStyles.headlineSmall, color: Colors.grey07 }}>역할 배경 설정</h2>
//           <CustomInput
//             width={1060}
//             height={140}
//             placeholder={`예: 지금부터 여러분은 HomeMate를 사용하게 된 가족집의 구성원들입니다.
// 여러분은 가정에서 HomeMate를 사용하며 일어나는 일에 대해 함께 논의하여 결정할 것입니다.`}
//             value={back}
//             onChange={(e) => {
//               const v = e.target.value || '';
//               setBack(v);
//               localStorage.setItem('rolesBackground', v);
//             }}
//           /> */}

//           <h2 style={{ marginTop: 30, ...FontStyles.headlineSmall, color: Colors.grey07 }}>개별 배경 설정</h2>

//           <div style={{ display: "flex", flexDirection: "row", gap: 20, marginTop: 16 }}>
//             {/* 1번 역할 */}
//             <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
//               <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
//                 <div style={{ width: 230, height: 230, border: "2px solid #ddd", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8f9fa", overflow: "hidden" }}>
//                   <img
//                     src={!fallback1 && img1 ? img1 : defaultProfileImg}
//                     alt="역할1 이미지"
//                     style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                     onError={() => setFallback1(true)}
//                     onLoad={() => setFallback1(false)}
//                   />
//                 </div>
//                 <span
//                   onClick={() => changeSlotImage(1)}
//                   style={{ color: Colors.grey06, ...FontStyles.body, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px", marginTop: 8 }}
//                 >
//                   이미지 변경
//                 </span>
//               </div>

//               <h2 style={{ marginTop: 16, ...FontStyles.title, color: Colors.grey07, textAlign: "left", width: "100%" }}>역할 이름</h2>
//               <CustomInput
//                 width={340}
//                 height={72}
//                 placeholder="예: 요양 보호사 K"
//                 value={char1}
//                 onChange={(e) => {
//                   const v = e.target.value || '';
//                   setChar1(v);
//                   localStorage.setItem('char1', v);
//                 }}
//               />
//               <h2 style={{ marginTop: 16, ...FontStyles.title, color: Colors.grey07, textAlign: "left", width: "100%" }}>설명</h2>
//               <CustomInput
//                 width={340}
//                 height={320}
//                 placeholder="예: 당신은 어머니를 10년 이상 돌본 요양 보호사 K입니다."
//                 value={charDes1}
//                 onChange={(e) => {
//                   const v = e.target.value || '';
//                   setCharDes1(v);
//                   localStorage.setItem('charDes1', v);
//                 }}
//               />
//             </div>

//             {/* 2번 역할 */}
//             <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
//               <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
//                 <div style={{ width: 230, height: 230, border: "2px solid #ddd", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8f9fa", overflow: "hidden" }}>
//                   <img
//                     src={!fallback2 && img2 ? img2 : defaultProfileImg}
//                     alt="역할2 이미지"
//                     style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                     onError={() => setFallback2(true)}
//                     onLoad={() => setFallback2(false)}
//                   />
//                 </div>
//                 <span
//                   onClick={() => changeSlotImage(2)}
//                   style={{ color: Colors.grey06, ...FontStyles.body, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px", marginTop: 8 }}
//                 >
//                   이미지 변경
//                 </span>
//               </div>

//               <h2 style={{ marginTop: 16, ...FontStyles.title, color: Colors.grey07, textAlign: "left", width: "100%" }}>역할 이름</h2>
//               <CustomInput
//                 width={340}
//                 height={72}
//                 placeholder="예: 노모 L"
//                 value={char2}
//                 onChange={(e) => {
//                   const v = e.target.value || '';
//                   setChar2(v);
//                   localStorage.setItem('char2', v);
//                 }}
//               />
//               <h2 style={{ marginTop: 16, ...FontStyles.title, color: Colors.grey07, textAlign: "left", width: "100%" }}>설명</h2>
//               <CustomInput
//                 width={340}
//                 height={320}
//                 placeholder="예: 당신은 자녀J씨의 노모입니다. 가사도우미의 도움을..."
//                 value={charDes2}
//                 onChange={(e) => {
//                   const v = e.target.value || '';
//                   setCharDes2(v);
//                   localStorage.setItem('charDes2', v);
//                 }}
//               />
//             </div>

//             {/* 3번 역할 */}
//             <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
//               <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
//                 <div style={{ width: 230, height: 230, border: "2px solid #ddd", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8f9fa", overflow: "hidden" }}>
//                   <img
//                     src={!fallback3 && img3 ? img3 : defaultProfileImg}
//                     alt="역할3 이미지"
//                     style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                     onError={() => setFallback3(true)}
//                     onLoad={() => setFallback3(false)}
//                   />
//                 </div>
//                 <span
//                   onClick={() => changeSlotImage(3)}
//                   style={{ color: Colors.grey06, ...FontStyles.body, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px", marginTop: 8 }}
//                 >
//                   이미지 변경
//                 </span>
//               </div>

//               <h2 style={{ marginTop: 16, ...FontStyles.title, color: Colors.grey07, textAlign: "left", width: "100%" }}>역할 이름</h2>
//               <CustomInput
//                 width={340}
//                 height={72}
//                 placeholder="예: 자녀 J"
//                 value={char3}
//                 onChange={(e) => {
//                   const v = e.target.value || '';
//                   setChar3(v);
//                   localStorage.setItem('char3', v);
//                 }}
//               />
//               <h2 style={{ marginTop: 16, ...FontStyles.title, color: Colors.grey07, textAlign: "left", width: "100%" }}>설명</h2>
//               <CustomInput
//                 width={340}
//                 height={320}
//                 placeholder="예: 당신은 자녀J씨입니다. 노쇠하신 어머니가 걱정되어..."
//                 value={charDes3}
//                 onChange={(e) => {
//                   const v = e.target.value || '';
//                   setCharDes3(v);
//                   localStorage.setItem('charDes3', v);
//                 }}
//               />
//             </div>
//           </div>
//         </div>

//         <div style={{ position: 'absolute', bottom: '30px', right: '30px' }}>
//           <NextGreen onClick={handleNext} />
//         </div>
//         <div style={{ position: 'absolute', bottom: '30px', left: '30px' }}>
//           <BackOrange onClick={() => handleBack()} />
//         </div>
//       </div>
//     </CreatorLayout>
//   );
// }
// 아무것도 post 안한 디폴트일때 그 디폴트 이미지도 POST 하도록 하기
import { useState, useEffect } from 'react';
import CreatorLayout from '../components/Expanded/CreatorLayout';
import { useNavigate } from 'react-router-dom';
import { FontStyles, Colors } from '../components/styleConstants';
import CustomInput from '../components/Expanded/CustomInput';
import defaultProfileImg from "../assets/images/Frame235.png";
import NextGreen from "../components/NextOrange";
import BackOrange from "../components/Expanded/BackOrange";
import axiosInstance from '../api/axiosInstance';


// === 이미지 축소 유틸 시작 ===
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
// === 이미지 축소 유틸 끝 ===

const ROLE_IMG_KEYS = ['role_image_1', 'role_image_2', 'role_image_3'];

// 절대 URL 보정
const resolveImageUrl = (raw) => {
  if (!raw || raw === '-' || String(raw).trim() === '') return null;
  const u = String(raw).trim();
  if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
  const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
  if (!base) return u;
  return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
};
 const writeLocal = (k, v) => {
     try { localStorage.setItem(k, v ?? ''); } catch {}
  };
// 역할 이미지 업로드 (개별 슬롯)
async function uploadRoleImage(slot, file) {
  const code = localStorage.getItem('code');
  if (!code) throw new Error('게임 코드가 없습니다. (code)');

// 0) 업로드 전 사전 2차 축소
  const preCompressed = await twoStepCompress(file);
  const form = new FormData();
  form.append('file', preCompressed);
  try {
    const res = await axiosInstance.put(
      `/custom-games/${code}/role-images/${slot}`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    const url = res?.data?.url || res?.data?.image_url;
    if (!url) throw new Error('업로드 응답에 url이 없습니다.');
    return url;
  } catch (err) {
    // 413이면 더 강하게 줄여서 1회 재시도
    if (err?.response?.status === 413) {
      const stronger = await twoStepCompress(preCompressed, {
        preset1: { maxEdge: 1280, quality: 0.75, targetBytes: 0.9 * 1024 * 1024 },
        preset2: { maxEdge: 960, quality: 0.70, targetBytes: 0.6 * 1024 * 1024 },
      });
      const form2 = new FormData();
      form2.append('file', stronger);
      const retry = await axiosInstance.put(
        `/custom-games/${code}/role-images/${slot}`,
        form2,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const url2 = retry?.data?.url || retry?.data?.image_url;
      if (!url2) throw new Error('업로드 응답에 url이 없습니다.(retry)');
      return url2;
    }
    throw err;
  }
}

// ✅ 기본 이미지 파일(Frame235)을 Blob→File로 래핑해서 해당 슬롯에 POST
async function uploadDefaultForSlot(slot, {
  onApplied
} = {}) {
  const code = localStorage.getItem('code');
  if (!code) throw new Error('게임 코드가 없습니다. (code)');

  // 번들된 정적 에셋을 fetch해서 Blob 획득
  const resp = await fetch(defaultProfileImg);
  const blob = await resp.blob();
 // const file = new File([blob], `default_role_${slot}.png`, { type: blob.type || 'image/png' });
   let file = new File([blob], `default_role_${slot}.png`, { type: blob.type || 'image/png' });
   // PNG라 해도 용량 큰 경우가 있어서 JPEG로 2차 축소 (twoStepCompress 내부에서 JPEG로 바뀜)
   file = await twoStepCompress(file);
  // 서버 업로드
  const url = await uploadRoleImage(slot, file);

  // 로컬/상태 반영 콜백
  if (typeof onApplied === 'function') onApplied(url);
  return url;
}

export default function Create02() {
  const navigate = useNavigate();
  const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");

  // 텍스트(역할/설명/배경)
  const [back, setBack] = useState('');
  const [char1, setChar1] = useState('');
  const [char2, setChar2] = useState('');
  const [char3, setChar3] = useState('');
  const [charDes1, setCharDes1] = useState('');
  const [charDes2, setCharDes2] = useState('');
  const [charDes3, setCharDes3] = useState('');

  // 역할 이미지 상태 (URL + 폴백 플래그)
  const [img1, setImg1] = useState(() => resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[0])));
  const [img2, setImg2] = useState(() => resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[1])));
  const [img3, setImg3] = useState(() => resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[2])));
  const [fallback1, setFallback1] = useState((prev => {
    const s = resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[0]));
    return !s; // 없으면 기본 이미지를 화면에 보여줌
  })());
  const [fallback2, setFallback2] = useState((prev => {
    const s = resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[1]));
    return !s;
  })());
  const [fallback3, setFallback3] = useState((prev => {
    const s = resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[2]));
    return !s;
  })());

  // 1) 텍스트 초기화 (로컬 → data 승격)
  useEffect(() => {
    try {
      const b  = localStorage.getItem('rolesBackground') || '';
      const n1 = localStorage.getItem('char1') || '';
      const n2 = localStorage.getItem('char2') || '';
      const n3 = localStorage.getItem('char3') || '';
      const d1 = localStorage.getItem('charDes1') || '';
      const d2 = localStorage.getItem('charDes2') || '';
      const d3 = localStorage.getItem('charDes3') || '';

      const isValid = (v) => v && v.trim().length > 0;
      const hasAllLocal =
        isValid(b) && isValid(n1) && isValid(n2) && isValid(n3) &&
        isValid(d1) && isValid(d2) && isValid(d3);

      if (hasAllLocal) {
        setBack(b); setChar1(n1); setChar2(n2); setChar3(n3);
        setCharDes1(d1); setCharDes2(d2); setCharDes3(d3);
      } else {
        const raw = localStorage.getItem('data');
        if (raw) {
          const data = JSON.parse(raw);
          const roles = Array.isArray(data?.roles) ? data.roles : [];
          const rb = data?.rolesBackground ?? '';
          const rn1 = roles[0]?.name ?? '';
          const rn2 = roles[1]?.name ?? '';
          const rn3 = roles[2]?.name ?? '';
          const rd1 = roles[0]?.description ?? '';
          const rd2 = roles[1]?.description ?? '';
          const rd3 = roles[2]?.description ?? '';

          setBack(rb);
          setChar1(rn1); setChar2(rn2); setChar3(rn3);
          setCharDes1(rd1); setCharDes2(rd2); setCharDes3(rd3);

          // 승격 저장
          const promote = (k, v) => { if (v && v.trim().length > 0) localStorage.setItem(k, v); };
          promote('rolesBackground', rb);
          promote('char1', rn1); promote('char2', rn2); promote('char3', rn3);
          promote('charDes1', rd1); promote('charDes2', rd2); promote('charDes3', rd3);
        }
      }
    } catch (e) {
      console.error('Failed to init text from localStorage/data', e);
    }
  }, []);

  // 2) 이미지 초기화: GET 없이 진행
  // - 화면엔 즉시 기본 이미지(Frame235) 보임 (fallback=true일 때)
  // - 서버에는 기본 이미지를 즉시 POST (각 슬롯별 한번만)
  useEffect(() => {
    const initImages = async () => {
      const code = localStorage.getItem('code');
      if (!code) {
        // 코드 없으면 서버 업로드는 스킵, 화면은 기본 이미지 유지
        setImg1(resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[0])));
        setImg2(resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[1])));
        setImg3(resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[2])));
        return;
      }

      // 로컬 값으로 먼저 세팅 (있으면)
      const s1 = resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[0]));
      const s2 = resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[1]));
      const s3 = resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[2]));
      setImg1(s1); setFallback1(!s1);
      setImg2(s2); setFallback2(!s2);
      setImg3(s3); setFallback3(!s3);

      // 없으면 기본 이미지(Frame235)를 서버에 업로드 후 로컬/상태 갱신
      try {
        if (!s1) {
          await uploadDefaultForSlot(1, {
            onApplied: (rawUrl) => {
              const u = resolveImageUrl(rawUrl);
              setImg1(u); setFallback1(!u);
            }
          });
        }
      } catch (e) {
        console.error('기본 이미지 업로드 실패(1):', e);
        setFallback1(true);
      }
      try {
        if (!s2) {
          await uploadDefaultForSlot(2, {
            onApplied: (rawUrl) => {
              const u = resolveImageUrl(rawUrl);
              setImg2(u); setFallback2(!u);
            }
          });
        }
      } catch (e) {
        console.error('기본 이미지 업로드 실패(2):', e);
        setFallback2(true);
      }
      try {
        if (!s3) {
          await uploadDefaultForSlot(3, {
            onApplied: (rawUrl) => {
              const u = resolveImageUrl(rawUrl);
              setImg3(u); setFallback3(!u);
            }
          });
        }
      } catch (e) {
        console.error('기본 이미지 업로드 실패(3):', e);
        setFallback3(true);
      }
    };

    initImages();
  }, []);

  // 사용자가 직접 이미지 변경
  const changeSlotImage = (slot) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const rawUrl = await uploadRoleImage(slot, file);
        localStorage.setItem(ROLE_IMG_KEYS[slot - 1], rawUrl);
        const resolved = resolveImageUrl(rawUrl);
        if (slot === 1) { setImg1(resolved); setFallback1(!resolved); }
        if (slot === 2) { setImg2(resolved); setFallback2(!resolved); }
        if (slot === 3) { setImg3(resolved); setFallback3(!resolved); }
      } catch (err) {
        console.error(err);
        alert('역할 이미지 업로드에 실패했습니다.');
        if (slot === 1) setFallback1(true);
        if (slot === 2) setFallback2(true);
        if (slot === 3) setFallback3(true);
      }
    };
    input.click();
  };

  // 역할 텍스트 저장
  const putRoles = async ({ roles, background }) => {
    const code = localStorage.getItem('code');
    if (!code) throw new Error('게임 코드가 없습니다. (code)');
    await axiosInstance.put(
      `/custom-games/${code}/roles`,
      { roles, background },
      { headers: { 'Content-Type': 'application/json' } }
    );
  };

  const handleNext = async () => {
    try {
      const name1 = (char1 || '').trim();
      const name2 = (char2 || '').trim();
      const name3 = (char3 || '').trim();
      const desc1 = (charDes1 || '').trim();
      const desc2 = (charDes2 || '').trim();
      const desc3 = (charDes3 || '').trim();
      const background = (back || '').trim();

      const safe = (s) => (s && s.length > 0 ? s : '-');
      const rolesSafe = [
        { name: safe(name1), description: safe(desc1) },
        { name: safe(name2), description: safe(desc2) },
        { name: safe(name3), description: safe(desc3) },
      ];
      await putRoles({ roles: rolesSafe, background: safe(background) });
    // ✅ 서버에 보낸 값 그대로 로컬에도 정규화 반영
     writeLocal('char1', rolesSafe[0].name);
     writeLocal('char2', rolesSafe[1].name);
     writeLocal('char3', rolesSafe[2].name);
     writeLocal('charDes1', rolesSafe[0].description);
     writeLocal('charDes2', rolesSafe[1].description);
     writeLocal('charDes3', rolesSafe[2].description);
     writeLocal('rolesBackground', safe(background));

      navigate('/create03');
    } catch (err) {
      console.error(err);
      alert('역할 저장 중 오류가 발생했습니다.');
    }
  };

  const handleBack = () => navigate('/create01');

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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <div style={{ marginTop: -30, marginBottom: 30 }}>
          <h2 style={{ ...FontStyles.headlineNormal, color: Colors.grey07 }}>역할</h2>
          <p style={{ ...FontStyles.title, color: Colors.grey05, lineHeight: 1.5, marginBottom: '32px' }}>
            딜레마 상황에 등장하는 세명의 역할을 설정하세요. 각 역할은 게임에 참여하는 3명의 플레이어에게 임의로 배정됩니다.
          </p>
{/* 
          <h2 style={{ ...FontStyles.headlineSmall, color: Colors.grey07 }}>역할 배경 설정</h2>
          <CustomInput
            width={1060}
            height={140}
            placeholder={`예: 지금부터 여러분은 HomeMate를 사용하게 된 가족집의 구성원들입니다.
여러분은 가정에서 HomeMate를 사용하며 일어나는 일에 대해 함께 논의하여 결정할 것입니다.`}
            value={back}
            onChange={(e) => {
              const v = e.target.value || '';
              setBack(v);
              localStorage.setItem('rolesBackground', v);
            }}
          /> */}

          <h2 style={{ marginTop: 30, ...FontStyles.headlineSmall, color: Colors.grey07 }}>개별 배경 설정</h2>

          <div style={{ display: "flex", flexDirection: "row", gap: 20, marginTop: 16 }}>
            {/* 1번 역할 */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                <div style={{ width: 230, height: 230, border: "2px solid #ddd", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8f9fa", overflow: "hidden" }}>
                  <img
                    src={!fallback1 && img1 ? img1 : defaultProfileImg}
                    alt="역할1 이미지"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={() => setFallback1(true)}
                    onLoad={() => setFallback1(false)}
                  />
                </div>
                <span
                  onClick={() => changeSlotImage(1)}
                  style={{ color: Colors.grey06, ...FontStyles.body, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px", marginTop: 8 }}
                >
                  이미지 변경
                </span>
              </div>

              <h2 style={{ marginTop: 16, ...FontStyles.title, color: Colors.grey07, textAlign: "left", width: "100%" }}>역할 이름</h2>
              <CustomInput
                width={340}
                height={72}
                placeholder="예: 요양 보호사 K"
                value={char1}
                onChange={(e) => {
                  const v = e.target.value || '';
                  setChar1(v);
                  localStorage.setItem('char1', v);
                }}
              />
              <h2 style={{ marginTop: 16, ...FontStyles.title, color: Colors.grey07, textAlign: "left", width: "100%" }}>설명</h2>
              <CustomInput
                width={340}
                height={320}
                placeholder="예: 당신은 어머니를 10년 이상 돌본 요양 보호사 K입니다."
                value={charDes1}
                onChange={(e) => {
                  const v = e.target.value || '';
                  setCharDes1(v);
                  localStorage.setItem('charDes1', v);
                }}
              />
            </div>

            {/* 2번 역할 */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                <div style={{ width: 230, height: 230, border: "2px solid #ddd", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8f9fa", overflow: "hidden" }}>
                  <img
                    src={!fallback2 && img2 ? img2 : defaultProfileImg}
                    alt="역할2 이미지"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={() => setFallback2(true)}
                    onLoad={() => setFallback2(false)}
                  />
                </div>
                <span
                  onClick={() => changeSlotImage(2)}
                  style={{ color: Colors.grey06, ...FontStyles.body, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px", marginTop: 8 }}
                >
                  이미지 변경
                </span>
              </div>

              <h2 style={{ marginTop: 16, ...FontStyles.title, color: Colors.grey07, textAlign: "left", width: "100%" }}>역할 이름</h2>
              <CustomInput
                width={340}
                height={72}
                placeholder="예: 노모 L"
                value={char2}
                onChange={(e) => {
                  const v = e.target.value || '';
                  setChar2(v);
                  localStorage.setItem('char2', v);
                }}
              />
              <h2 style={{ marginTop: 16, ...FontStyles.title, color: Colors.grey07, textAlign: "left", width: "100%" }}>설명</h2>
              <CustomInput
                width={340}
                height={320}
                placeholder="예: 당신은 자녀J씨의 노모입니다. 가사도우미의 도움을..."
                value={charDes2}
                onChange={(e) => {
                  const v = e.target.value || '';
                  setCharDes2(v);
                  localStorage.setItem('charDes2', v);
                }}
              />
            </div>

            {/* 3번 역할 */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                <div style={{ width: 230, height: 230, border: "2px solid #ddd", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8f9fa", overflow: "hidden" }}>
                  <img
                    src={!fallback3 && img3 ? img3 : defaultProfileImg}
                    alt="역할3 이미지"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={() => setFallback3(true)}
                    onLoad={() => setFallback3(false)}
                  />
                </div>
                <span
                  onClick={() => changeSlotImage(3)}
                  style={{ color: Colors.grey06, ...FontStyles.body, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px", marginTop: 8 }}
                >
                  이미지 변경
                </span>
              </div>

              <h2 style={{ marginTop: 16, ...FontStyles.title, color: Colors.grey07, textAlign: "left", width: "100%" }}>역할 이름</h2>
              <CustomInput
                width={340}
                height={72}
                placeholder="예: 자녀 J"
                value={char3}
                onChange={(e) => {
                  const v = e.target.value || '';
                  setChar3(v);
                  localStorage.setItem('char3', v);
                }}
              />
              <h2 style={{ marginTop: 16, ...FontStyles.title, color: Colors.grey07, textAlign: "left", width: "100%" }}>설명</h2>
              <CustomInput
                width={340}
                height={320}
                placeholder="예: 당신은 자녀J씨입니다. 노쇠하신 어머니가 걱정되어..."
                value={charDes3}
                onChange={(e) => {
                  const v = e.target.value || '';
                  setCharDes3(v);
                  localStorage.setItem('charDes3', v);
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '30px', right: '30px' }}>
          <NextGreen onClick={handleNext} />
        </div>
        <div style={{ position: 'absolute', bottom: '30px', left: '30px' }}>
          <BackOrange onClick={() => handleBack()} />
        </div>
      </div>
    </CreatorLayout>
  );
}
