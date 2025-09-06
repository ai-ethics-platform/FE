// // api 연결할 것 - 이미지, 화면 내용 3개 
// import { useState } from 'react';
// import DilemmaOutPopup from '../components/DilemmaOutPopup';
// import CreatorLayout from '../components/Expanded/CreatorLayout';
// import CreatorContentBox from "../components/Expanded/CreatorContentBox";
// import Continue from '../components/Continue';
// import { useNavigate } from 'react-router-dom';
// import CreateInput from '../components/Expanded/CreateInput';
// import inputPlusIcon from '../assets/inputplus.svg'; 
// import create02Image from '../assets/images/create02.png';
// import { FontStyles, Colors } from '../components/styleConstants';
// import NextGreen from "../components/NextOrange";
// import BackOrange from "../components/Expanded/BackOrange";

// export default function Create04() {
//   const navigate = useNavigate();
//   const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");


//   // B 영역 - 이미지 상태 (기본 이미지로 시작)
//     const [image1, setImage1] = useState(null);
//     const [image2, setImage2] = useState(null);

//     const [isDefaultImage1, setIsDefaultImage1] = useState(true);
//     const [isDefaultImage2, setIsDefaultImage2] = useState(true);

//     // 역할별 이미지 변경 핸들러
//     const handleImageChange = (setImage, setIsDefault) => {
//     const input = document.createElement("input");
//     input.type = "file";
//     input.accept = "image/*";
//     input.onchange = (e) => {
//         const file = e.target.files?.[0];
//         if (file) {
//         setImage(file);
//         setIsDefault(false);
//         }
//     };
//     input.click();
//     };
//   // C 영역 - 입력 필드들을 배열로 관리
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
    

//   const handleNext = () => {
//     navigate('/create05');
//   };
//   const handleBack = () => {
//     navigate('/create03');
//   };
//   const handleConfirm = async (finalTitle) => {
//     // TODO
//   };
// // 입력값 변경
// const handleAgreeInputChange = (id, newValue) => {
//     setAgreeInputs(prev =>
//       prev.map(input => input.id === id ? { ...input, value: newValue } : input)
//     );
//   };
  
//   const handleDisagreeInputChange = (id, newValue) => {
//     setDisagreeInputs(prev =>
//       prev.map(input => input.id === id ? { ...input, value: newValue } : input)
//     );
//   };
  
//   // 입력 필드 추가
//   const handleAddAgreeInput = () => {
//     setAgreeInputs(prev => {
//       if (prev.length >= 5) return prev;
//       const nextId = prev.reduce((m, it) => Math.max(m, it.id), 0) + 1;
//       return [...prev, { id: nextId, label: `화면 ${prev.length + 1}`, value: "", placeholder: " ", canDelete: true }];
//     });
//   };
  
//   const handleAddDisagreeInput = () => {
//     setDisagreeInputs(prev => {
//       if (prev.length >= 5) return prev;
//       const nextId = prev.reduce((m, it) => Math.max(m, it.id), 0) + 1;
//       return [...prev, { id: nextId, label: `화면 ${prev.length + 1}`, value: "", placeholder: " ", canDelete: true }];
//     });
//   };
  
//   // 입력 필드 삭제
//   const handleDeleteAgreeInput = (idToDelete) => {
//     setAgreeInputs(prev =>
//       prev.filter(input => input.id !== idToDelete).map((input, index) => ({
//         ...input,
//         id: index + 1,
//         label: `화면 ${index + 1}`
//       }))
//     );
//   };
  
//   const handleDeleteDisagreeInput = (idToDelete) => {
//     setDisagreeInputs(prev =>
//       prev.filter(input => input.id !== idToDelete).map((input, index) => ({
//         ...input,
//         id: index + 1,
//         label: `화면 ${index + 1}`
//       }))
//     );
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
//           // 여기서도 원하면 localStorage 저장 가능
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
//           플립 단계 
//         </h2>
//         <p style={{
//           ...FontStyles.title,
//           color: Colors.grey05,
//           lineHeight: 1.5,
//           marginBottom: '32px'
//         }}>
//         딜레마 상황과 그에 맞는 질문을 설정해주세요. 게임에 참여하는 3명의 플레이 단계에서는 플레이어의 다수결 선택 결과에 따라 다른 내용이 보여집니다. 
//         </p>
//       </div>

//       {/* B, C 영역을 같은 행에 배치 */}
//       <div style={{ marginTop: 0, marginBottom: '30px' }}>
//         <h2 style={{
//           ...FontStyles.headlineSmall,
//           marginBottom: '0px',
//           color: Colors.grey07
//         }}>
//           [선택지1] 동의 
//         </h2>
//         <p style={{
//           ...FontStyles.title,
//           color: Colors.grey05,
//          // lineHeight: 1.5,
//           marginBottom: '0px'
//         }}>
//         '동의'을(를) 선택했을 때 일어날 수 있는 예상치 못한 상황에 대해 설명해주세요.
//          </p>
//       </div>
//       <div style={{
//         display: 'flex',
//         gap: 100,
//         alignItems: 'flex-start',
//         marginBottom: '20px'
//       }}>
      
//         {/* B 영역 - 이미지 영역 (왼쪽) */}
//         <div style={{
//           flex: '0 0 360px', // 고정 너비
//           display: 'flex',
//           flexDirection: 'column',
//           gap: '20px'
//         }}>
//           {/* 이미지 표시 영역 */}
//           <div
//             style={{
//               width: '100%',
//               height: '180px',
//               border: '2px solid #ddd',
//               borderRadius: '8px',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               backgroundColor: '#f8f9fa',
//               overflow: 'hidden'
//             }}
//           >
//             <img
//               src={isDefaultImage1 ? create02Image : URL.createObjectURL(image1)}
//               alt="딜레마 이미지"
//               style={{
//                 width: '100%',
//                 height: '100%',
//                 objectFit: 'cover',
//                 borderRadius: '6px'
//               }}
//               onLoad={(e) => {
//                 if (!isDefaultImage1 && image1) {
//                   URL.revokeObjectURL(e.currentTarget.src);
//                 }
//               }}
//             />
//           </div>

//           {/* 이미지 변경 링크 */}
//           <div style={{
//             textAlign: 'center'
//           }}>
//             <span
//             onClick={() => handleImageChange(setImage1, setIsDefaultImage1)}
//             style={{ color: '#333', fontSize: 14, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
//             >
//             이미지 변경
//             </span>

//           </div>

//           {/* 빨간 글씨 안내문 */}
//           <div style={{
//             textAlign: 'center'
//           }}>
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

//         {/* C 영역 - 입력 필드들 (오른쪽) */}
//         <div style={{ flex: '1',marginTop:-10 }}>
//         {agreeInputs.map((input) => (
//             <CreateInput
//                 key={input.id}
//                 label={input.label}
//                 value={input.value}
//                 onChange={(e) => handleAgreeInputChange(input.id, e.target.value)}
//                 placeholder={input.placeholder}
//                 onDelete={input.canDelete ? () => handleDeleteAgreeInput(input.id) : undefined}
//             />
//             ))}

//           {/* + 버튼 - 5개 미만일 때만 표시 */}
//           {agreeInputs.length < 5 && (
//             <div style={{
//               display: 'flex',
//               justifyContent: 'center',
//               marginTop: '20px'
//             }}>
//               <button
//                 onClick={handleAddAgreeInput}
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
//                 <img
//                   src={inputPlusIcon}
//                   alt="입력 필드 추가"
//                   style={{ width: '40px', height: '40px' }}
//                 />
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//       {/*  비동의 */}
//       {/* B, C 영역을 같은 행에 배치 */}
//       <div style={{ marginTop: 50, marginBottom: '30px' }}>
//         <h2 style={{
//           ...FontStyles.headlineSmall,
//           marginBottom: '0px',
//           color: Colors.grey07
//         }}>
//           [선택지2] 비동의 
//         </h2>
//         <p style={{
//           ...FontStyles.title,
//           color: Colors.grey05,
//          // lineHeight: 1.5,
//           marginBottom: '0px'
//         }}>
//         '비동의'을(를) 선택했을 때 일어날 수 있는 예상치 못한 상황에 대해 설명해주세요.
//          </p>
//       </div>
//       <div style={{
//         display: 'flex',
//         gap: 100,
//         alignItems: 'flex-start',
//         paddingBottom: 40      }}>
      
//         {/* B 영역 - 이미지 영역 (왼쪽) */}
//         <div style={{
//           flex: '0 0 360px', // 고정 너비
//           display: 'flex',
//           flexDirection: 'column',
//           gap: '20px'
//         }}>
//           {/* 이미지 표시 영역 */}
//           <div
//             style={{
//               width: '100%',
//               height: '180px',
//               border: '2px solid #ddd',
//               borderRadius: '8px',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               backgroundColor: '#f8f9fa',
//               overflow: 'hidden'
//             }}
//           >
//             <img
//               src={isDefaultImage2 ? create02Image : URL.createObjectURL(image2)}
//               alt="딜레마 이미지"
//               style={{
//                 width: '100%',
//                 height: '100%',
//                 objectFit: 'cover',
//                 borderRadius: '6px'
//               }}
//               onLoad={(e) => {
//                 if (!isDefaultImage2 && image2) {
//                   URL.revokeObjectURL(e.currentTarget.src);
//                 }
//               }}
//             />
//           </div>

//           {/* 이미지 변경 링크 */}
//           <div style={{
//             textAlign: 'center'
//           }}>
//            <span
//             onClick={() => handleImageChange(setImage2, setIsDefaultImage2)}
//             style={{ color: '#333', fontSize: 14, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
//             >
//             이미지 변경
//             </span>
//           </div>

//           {/* 빨간 글씨 안내문 */}
//           <div style={{
//             textAlign: 'center'
//           }}>
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

//         {/* C 영역 - 입력 필드들 (오른쪽) */}
//         <div style={{ flex: '1',marginTop:-10 }}>
//           {/* C 영역 - 비동의 입력 필드들 */}
//             {disagreeInputs.map((input) => (
//             <CreateInput
//                 key={input.id}
//                 label={input.label}
//                 value={input.value}
//                 onChange={(e) => handleDisagreeInputChange(input.id, e.target.value)}
//                 placeholder={input.placeholder}
//                 onDelete={input.canDelete ? () => handleDeleteDisagreeInput(input.id) : undefined}
//             />
//             ))}

//           {/* + 버튼 - 5개 미만일 때만 표시 */}
//           {disagreeInputs.length < 5 && (
//             <div style={{
//               display: 'flex',
//               justifyContent: 'center',
//               marginTop: '20px'
//             }}>
//               <button
//                 onClick={handleAddDisagreeInput}
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
//                 <img
//                   src={inputPlusIcon}
//                   alt="입력 필드 추가"
//                   style={{ width: '40px', height: '40px' }}
//                 />
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//       <div style={{
//       position: 'absolute',
//       bottom: '30px',
//       right: '30px'
//     }}>
//       <NextGreen onClick={handleNext} />
//     </div>
//     <div style={{
//                 position: 'absolute',
//                 bottom: '30px',
//                 left: '30px'
//             }}>
//             <BackOrange onClick={handleBack} />
//             </div>
//     </CreatorLayout>
//   );
// }

// api 연결할 것 - 이미지, 화면 내용 3개 
import { useEffect, useState } from 'react';
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
import BackOrange from "../components/Expanded/BackOrange";
import axiosInstance from '../api/axiosInstance'; //  추가

export default function Create04() {
  const navigate = useNavigate();
  const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");

  // B 영역 - 이미지 상태 (기본 이미지로 시작)
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [isDefaultImage1, setIsDefaultImage1] = useState(true);
  const [isDefaultImage2, setIsDefaultImage2] = useState(true);

  const buildInputsFromArray = (arr, firstPlaceholder) =>
    (Array.isArray(arr) ? arr : []).map((text, idx) => ({
      id: idx + 1,
      label: `화면 ${idx + 1}${idx === 0 ? ' *' : ''}`,
      value: text ?? '',
      placeholder: idx === 0 ? firstPlaceholder : ' ',
      canDelete: idx !== 0,
    }));

  const handleImageChange = (setImage, setIsDefault) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) { setImage(file); setIsDefault(false); }
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

  //  초기 로딩: localStorage.data.flips → state 반영
//  초기 로딩: 개별 키 우선 → state 세팅 + 즉시 로컬 저장(승격)
//  없으면 data에서 → state 세팅 + 즉시 로컬 저장(승격)
useEffect(() => {
  try {
    // 1) 개별 키 우선 - 다시 진입했을때
    const agreeLocalRaw = localStorage.getItem('flips_agree_texts');
    const disagreeLocalRaw = localStorage.getItem('flips_disagree_texts');

    const agreeLocal = agreeLocalRaw ? JSON.parse(agreeLocalRaw) : null;
    const disagreeLocal = disagreeLocalRaw ? JSON.parse(disagreeLocalRaw) : null;

    const hasAgreeLocal = Array.isArray(agreeLocal) && agreeLocal.length > 0;
    const hasDisagreeLocal = Array.isArray(disagreeLocal) && disagreeLocal.length > 0;

    if (hasAgreeLocal || hasDisagreeLocal) {
      if (hasAgreeLocal) {
        const builtAgree = buildInputsFromArray(
          agreeLocal,
          '예: Homemate 사용자 최적화 시스템 업그레이드 공지'
        );
        setAgreeInputs(builtAgree);
        //  초기 로드 시에도 로컬 저장(승격)
        persistAgree(builtAgree);
      }
      if (hasDisagreeLocal) {
        const builtDisagree = buildInputsFromArray(
          disagreeLocal,
          '예: 비동의 시 발생할 수 있는 문제를 설명해주세요.'
        );
        setDisagreeInputs(builtDisagree);
        //  초기 로드 시에도 로컬 저장(승격)
        persistDisagree(builtDisagree);
      }
      return; // 개별 키로 로드했으면 종료
    }

    // 2) 처음 페이지 들어왔을때: data에서 폴백 로드
    const raw = localStorage.getItem('data');
    if (!raw) return;
    const data = JSON.parse(raw);
    const flips = data?.flips ?? {};

    const agree = Array.isArray(flips?.agree_texts) ? flips.agree_texts : [];
    const disagree = Array.isArray(flips?.disagree_texts) ? flips.disagree_texts : [];

    if (agree.length > 0) {
      const builtAgree = agree.map((text, idx) => ({
        id: idx + 1,
        label: `화면 ${idx + 1}${idx === 0 ? ' *' : ''}`,
        value: text ?? '',
        placeholder: idx === 0
          ? "예: Homemate 사용자 최적화 시스템 업그레이드 공지"
          : " ",
        canDelete: idx !== 0,
      }));
      setAgreeInputs(builtAgree);
      //  폴백으로 세팅해도 즉시 로컬 저장(승격)
      persistAgree(builtAgree);
    }

    if (disagree.length > 0) {
      const builtDisagree = disagree.map((text, idx) => ({
        id: idx + 1,
        label: `화면 ${idx + 1}${idx === 0 ? ' *' : ''}`,
        value: text ?? '',
        placeholder: idx === 0
          ? "예: 비동의 시 발생할 수 있는 문제를 설명해주세요."
          : " ",
        canDelete: idx !== 0,
      }));
      setDisagreeInputs(builtDisagree);
      //  폴백으로 세팅해도 즉시 로컬 저장(승격)
      persistDisagree(builtDisagree);
    }
  } catch (e) {
    console.error('Failed to parse localStorage.data', e);
  }
}, []);


// 동의 입력 onChange
const handleAgreeInputChange = (id, newValue) => {
  setAgreeInputs(prev => {
    const next = prev.map(input =>
      input.id === id ? { ...input, value: newValue } : input
    );
    const agree_texts = [...next]
      .sort((a, b) => a.id - b.id)
      .map(it => (it.value ?? '').trim());
    localStorage.setItem('flips_agree_texts', JSON.stringify(agree_texts)); //  즉시 저장
    return next;
  });
};

// 비동의 입력 onChange
const handleDisagreeInputChange = (id, newValue) => {
  setDisagreeInputs(prev => {
    const next = prev.map(input =>
      input.id === id ? { ...input, value: newValue } : input
    );
    const disagree_texts = [...next]
      .sort((a, b) => a.id - b.id)
      .map(it => (it.value ?? '').trim());
    localStorage.setItem('flips_disagree_texts', JSON.stringify(disagree_texts)); //  즉시 저장
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
    persistAgree(next); //  즉시 저장
    return next;
  });
};
const handleAddDisagreeInput = () => {
  setDisagreeInputs(prev => {
    if (prev.length >= 5) return prev;
    const nextId = prev.reduce((m, it) => Math.max(m, it.id), 0) + 1;
    const next = [...prev, { id: nextId, label: `화면 ${prev.length + 1}`, value: "", placeholder: " ", canDelete: true }];
    persistDisagree(next); // 즉시 저장
    return next;
  });
};

const handleDeleteAgreeInput = (idToDelete) => {
  setAgreeInputs(prev => {
    const next = prev
      .filter(input => input.id !== idToDelete)
      .map((input, index) => ({ ...input, id: index + 1, label: `화면 ${index + 1}`, canDelete: index !== 0 }));
    persistAgree(next); //  즉시 저장
    return next;
  });
};
const handleDeleteDisagreeInput = (idToDelete) => {
  setDisagreeInputs(prev => {
    const next = prev
      .filter(input => input.id !== idToDelete)
      .map((input, index) => ({ ...input, id: index + 1, label: `화면 ${index + 1}`, canDelete: index !== 0 }));
    persistDisagree(next); //  즉시 저장
    return next;
  });
};
  //  PUT 함수
  const putFlips = async ({ agree_texts, disagree_texts }) => {
    const code = localStorage.getItem('code');
    if (!code) throw new Error('게임 코드가 없습니다. (code)');

    await axiosInstance.put(
      `/custom-games/${code}/flips`,
      { agree_texts, disagree_texts },
      { headers: { 'Content-Type': 'application/json' } }
    );
  };

  //  Next: 현재 값 → PUT → 로컬 저장 → 다음 페이지
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

      // 1) 서버 PUT
      await putFlips({ agree_texts, disagree_texts });

      // 2) 로컬 저장 (개별 키 + data 병합)
      localStorage.setItem('flips_agree_texts', JSON.stringify(agree_texts));
      localStorage.setItem('flips_disagree_texts', JSON.stringify(disagree_texts));

      // 3) 다음 페이지
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
        {/* B: 이미지 */}
        <div style={{ flex: '0 0 360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ width: '100%', height: '180px', border: '2px solid #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', overflow: 'hidden' }}>
            <img
              src={isDefaultImage1 ? create02Image : URL.createObjectURL(image1)}
              alt="딜레마 이미지"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
              onLoad={(e) => { if (!isDefaultImage1 && image1) URL.revokeObjectURL(e.currentTarget.src); }}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <span onClick={() => handleImageChange(setImage1, setIsDefaultImage1)} style={{ color: '#333', fontSize: 14, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
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
        {/* B: 이미지 */}
        <div style={{ flex: '0 0 360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ width: '100%', height: '180px', border: '2px solid #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', overflow: 'hidden' }}>
            <img
              src={isDefaultImage2 ? create02Image : URL.createObjectURL(image2)}
              alt="딜레마 이미지"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
              onLoad={(e) => { if (!isDefaultImage2 && image2) URL.revokeObjectURL(e.currentTarget.src); }}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <span onClick={() => handleImageChange(setImage2, setIsDefaultImage2)} style={{ color: '#333', fontSize: 14, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
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
        <BackOrange onClick={handleBack} />
      </div>
    </CreatorLayout>
  );
}
