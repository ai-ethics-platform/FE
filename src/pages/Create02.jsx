// import { useState,useEffect } from 'react';
// import CreatorLayout from '../components/Expanded/CreatorLayout';
// import { useNavigate } from 'react-router-dom';
// import { FontStyles,Colors } from '../components/styleConstants';
// import CustomInput from '../components/Expanded/CustomInput';
// import defaultProfileImg from "../assets/images/Frame235.png";
// import NextGreen from "../components/NextOrange";
// import BackOrange from "../components/Expanded/BackOrange";
// import axiosInstance from '../api/axiosInstance';
// export default function Create02() {
//   const navigate = useNavigate();
//   const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");

//   // 역할 배경 설정 
//   const [back,setback] =useState();

//   // 개별 역할 이름
//   const [char1,setchar1] =useState();
//   const [char2,setchar2] =useState();
//   const [char3,setchar3] =useState();

//   // 개별 역할 설명 
//   const [charDes1,setcharDes1] =useState();
//   const [charDes2,setcharDes2] =useState();
//   const [charDes3,setcharDes3] =useState();

//   // 이미지 상태 각각 분리
//   const [image1, setImage1] = useState(null);
//   const [image2, setImage2] = useState(null);
//   const [image3, setImage3] = useState(null);

//   const [isDefaultImage1, setIsDefaultImage1] = useState(true);
//   const [isDefaultImage2, setIsDefaultImage2] = useState(true);
//   const [isDefaultImage3, setIsDefaultImage3] = useState(true);

// useEffect(() => {
//   try {
//     const raw = localStorage.getItem('data');
//     if (!raw) return;
//     const data = JSON.parse(raw);

//     // rolesBackground
//     setback(data?.rolesBackground ?? '');

//     // roles 배열에서 name/description 추출 (최대 3개)
//     const roles = Array.isArray(data?.roles) ? data.roles : [];
//     setchar1(roles[0]?.name ?? '');
//     setchar2(roles[1]?.name ?? '');
//     setchar3(roles[2]?.name ?? '');

//     setcharDes1(roles[0]?.description ?? '');
//     setcharDes2(roles[1]?.description ?? '');
//     setcharDes3(roles[2]?.description ?? '');
//   } catch (e) {
//     console.error('Failed to parse localStorage.data', e);
//   }
// }, []);

// // 역할별 이미지 변경 핸들러
// const handleImageChange = (setImage, setIsDefault) => {
//   const input = document.createElement("input");
//   input.type = "file";
//   input.accept = "image/*";
//   input.onchange = (e) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setImage(file);
//       setIsDefault(false);
//     }
//   };
//   input.click();
// };

// // 서버에 roles/background PUT
// const putRoles = async ({ roles, background }) => {
//   const code = localStorage.getItem('code');
//   if (!code) throw new Error('게임 코드가 없습니다. (code)');

//   await axiosInstance.put(
//     `/custom-games/${code}/roles`,
//     { roles, background },
//     { headers: { 'Content-Type': 'application/json' } }
//   );
// };

// const handleNext = async () => {
//   try {
//     // 1) 현재 입력값으로 payload 구성
//     const name1 = (char1 ?? '').trim();
//     const name2 = (char2 ?? '').trim();
//     const name3 = (char3 ?? '').trim();
//     const desc1 = (charDes1 ?? '').trim();
//     const desc2 = (charDes2 ?? '').trim();
//     const desc3 = (charDes3 ?? '').trim();
//     const background = (back ?? '').trim();

//     const safe = s => (s && s.length > 0 ? s : '-');
//     const rolesSafe = [
//       { name: safe(name1), description: safe(desc1) },
//       { name: safe(name2), description: safe(desc2) },
//       { name: safe(name3), description: safe(desc3) },
//     ];
//     const backgroundSafe = safe(background);

//     // 2) 서버 PUT
//     await putRoles({ roles: rolesSafe, background: backgroundSafe });

//     // 3) localStorage에 개별 키로 저장
//     const kv = {
//       char1: name1,
//       char2: name2,
//       char3: name3,
//       charDes1: desc1,
//       charDes2: desc2,
//       charDes3: desc3,
//       rolesBackground: background,
//     };
//     Object.entries(kv).forEach(([k, v]) => localStorage.setItem(k, v));

//     // 4) 다음 페이지
//     navigate('/create03');
//   } catch (err) {
//     console.error(err);
//     alert('역할 저장 중 오류가 발생했습니다.');
//   }
// };



// const handleBack = () => {
//   navigate('/create01');
// };

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
//    >
//     <div style={{ 
//       display: "flex", 
//       justifyContent: "center",  // 가로 중앙
//       alignItems: "center",      // 세로 중앙
//       height: "100%",            // 부모 높이 기준
//     }}>
//      <div style={{ marginTop: -30, marginBottom: 30 }}>        <h2 style={{
//               ...FontStyles.headlineNormal,
//               color: Colors.grey07
//             }}>
//               역할
//         </h2>
//          <p style={{
//               ...FontStyles.title,
//               color: Colors.grey05,
//               lineHeight: 1.5,
//               marginBottom: '32px'
//             }}>
//               딜레마 상황에 등장하는 세명의 역할을 설정하세요. 각 역할은 게임에 참여하는 3명의 플레이어에게 임의로 배정됩니다. 
//           </p>
//           <h2 style={{
//               ...FontStyles.headlineSmall,
//               color: Colors.grey07
//             }}>
//               역할 배경 설정
//         </h2>
//         <CustomInput
//           width={1060}
//           height={140}
//           placeholder={`예: 지금부터 여러분은 HomeMate를 사용하게 된 가족집의 구성원들입니다.
//         여러분은 가정에서 HomeMate를 사용하며 일어나는 일에 대해 함께 논의하여 결정할 것입니다.`}
//           value={back}
//           onChange={(e) => setback(e.target.value)}
//         />
//          <h2 style={{
//             marginTop:30,
//               ...FontStyles.headlineSmall,
//               color: Colors.grey07
//             }}>
//               개별 배경 설정
//         </h2>
      
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "row",
//             gap: 20,                 // 행 사이 간격
//             marginTop: 16,
//           }}
//         >
//           {/* 첫번째 역할 */}
//           <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "flex-start", // 전체는 왼쪽 정렬
//           }}
//         >
//           {/* 이미지 + 이미지 변경만 중앙 정렬 */}
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               width: "100%",
//             }}
//           >
//             {/* 이미지 영역 */}
//             <div
//               style={{
//                 width: 230,
//                 height: 230,
//                 border: "2px solid #ddd",
//                 borderRadius: "8px",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 backgroundColor: "#f8f9fa",
//                 overflow: "hidden",
//               }}
//             >
//               <img
//               src={isDefaultImage1 ? defaultProfileImg : URL.createObjectURL(image1)}
//               alt="역할 이미지"
//               style={{ width: "100%", height: "100%", objectFit: "cover" }}
//             />
//             </div>

//             {/* 이미지 변경 */}
//             <span
//           onClick={() => handleImageChange(setImage1, setIsDefaultImage1)}
//           style={{
//             color: Colors.grey06,
//             ...FontStyles.body,
//             cursor: "pointer",
//             textDecoration: "underline",
//             textUnderlineOffset: "3px",
//             marginTop: 8,
//           }}
//         >
//           이미지 변경
//         </span>
//           </div>

//           {/* 역할 이름 */}
//           <h2
//             style={{
//               marginTop: 16,
//               ...FontStyles.title,
//               color: Colors.grey07,
//               textAlign: "left",
//               width: "100%",
//             }}
//           >
//             역할 이름
//           </h2>
//           <CustomInput
//             width={340}
//             height={72}
//             placeholder="예: 요양 보호사 K"
//             value={char1}
//             onChange={(e) => setchar1(e.target.value)}
//           />

//           {/* 설명 */}
//           <h2
//             style={{
//               marginTop: 16,
//               ...FontStyles.title,
//               color: Colors.grey07,
//               textAlign: "left",
//               width: "100%",
//             }}
//           >
//             설명
//           </h2>
//           <CustomInput
//             width={340}
//             height={320}
//             placeholder="예: 당신은 어머니를 10년 이상 돌본 요양 보호사 K입니다."
//             value={charDes1}
//             onChange={(e) => setcharDes1(e.target.value)}
//           />
//         </div>


//           {/* 두번째 역할 */}
//           <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "flex-start", // 전체는 왼쪽 정렬
//           }}
//         >
//           {/* 이미지 + 이미지 변경만 중앙 정렬 */}
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               width: "100%",
//             }}
//           >
//             {/* 이미지 영역 */}
//             <div
//               style={{
//                 width: 230,
//                 height: 230,
//                 border: "2px solid #ddd",
//                 borderRadius: "8px",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 backgroundColor: "#f8f9fa",
//                 overflow: "hidden",
//               }}
//             >
//              <img
//               src={isDefaultImage2 ? defaultProfileImg : URL.createObjectURL(image1)}
//               alt="역할 이미지"
//               style={{ width: "100%", height: "100%", objectFit: "cover" }}
//             />
//             </div>

//             {/* 이미지 변경 */}
//             <span
//           onClick={() => handleImageChange(setImage2, setIsDefaultImage2)}
//           style={{
//             color: Colors.grey06,
//             ...FontStyles.body,
//             cursor: "pointer",
//             textDecoration: "underline",
//             textUnderlineOffset: "3px",
//             marginTop: 8,
//           }}
//         >
//           이미지 변경
//         </span>
//           </div>

//           {/* 역할 이름 */}
//           <h2
//             style={{
//               marginTop: 16,
//               ...FontStyles.title,
//               color: Colors.grey07,
//               textAlign: "left",
//               width: "100%",
//             }}
//           >
//             역할 이름
//           </h2>
//           <CustomInput
//             width={340}
//             height={72}
//             placeholder="예: 노모 L"
//             value={char2}
//             onChange={(e) => setchar2(e.target.value)}
//           />

//           {/* 설명 */}
//           <h2
//             style={{
//               marginTop: 16,
//               ...FontStyles.title,
//               color: Colors.grey07,
//               textAlign: "left",
//               width: "100%",
//             }}
//           >
//             설명
//           </h2>
//           <CustomInput
//             width={340}
//             height={320}
//             placeholder="예: 당신은 자녀J씨의 노모입니다. 가사도우미의 도움을..."
//             value={charDes2}
//             onChange={(e) => setcharDes2(e.target.value)}
//           />
//         </div>


//           {/* 세번째 역할 */}
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "flex-start", // 전체는 왼쪽 정렬
//             }}
//           >
//             {/* 이미지 + 이미지 변경만 중앙 정렬 */}
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 width: "100%",
//               }}
//             >
//               {/* 이미지 영역 */}
//               <div
//                 style={{
//                   width: 230,
//                   height: 230,
//                   border: "2px solid #ddd",
//                   borderRadius: "8px",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   backgroundColor: "#f8f9fa",
//                   overflow: "hidden",
//                 }}
//               >
//                <img
//               src={isDefaultImage3 ? defaultProfileImg : URL.createObjectURL(image1)}
//               alt="역할 이미지"
//               style={{ width: "100%", height: "100%", objectFit: "cover" }}
//             />
//             </div>

//             {/* 이미지 변경 */}
//             <span
//               onClick={() => handleImageChange(setImage3, setIsDefaultImage3)}
//               style={{
//                 color: Colors.grey06,
//                 ...FontStyles.body,
//                 cursor: "pointer",
//                 textDecoration: "underline",
//                 textUnderlineOffset: "3px",
//                 marginTop: 8,
//               }}
//             >
//               이미지 변경
//             </span>
//             </div>

//             {/* 역할 이름 */}
//             <h2
//               style={{
//                 marginTop: 16,
//                 ...FontStyles.title,
//                 color: Colors.grey07,
//                 textAlign: "left",
//                 width: "100%",
//               }}
//             >
//               역할 이름
//             </h2>
//             <CustomInput
//               width={340}
//               height={72}
//               placeholder="예: 자녀 J"
//               value={char3}
//               onChange={(e) => setchar3(e.target.value)}
//             />

//             {/* 설명 */}
//             <h2
//               style={{
//                 marginTop: 16,
//                 ...FontStyles.title,
//                 color: Colors.grey07,
//                 textAlign: "left",
//                 width: "100%",
//               }}
//             >
//               설명
//             </h2>
//             <CustomInput
//               width={340}
//               height={320}
//               placeholder="예: 당신은 자녀J씨입니다. 노쇠하신 어머니가 걱정되어..."
//               value={charDes3}
//               onChange={(e) => setcharDes3(e.target.value)}
//             />
//           </div>

//         </div>
//           </div>  
//         <div style={{
//                 position: 'absolute',
//                 bottom: '30px',
//                 right: '30px'
//               }}>
//                 <NextGreen onClick={handleNext} />
//               </div>
//               <div style={{
//                 position: 'absolute',
//                 bottom: '30px',
//                 left: '30px'
//               }}>
//                 <BackOrange onClick={handleBack} />
//         </div>

//      </div>
//     </CreatorLayout>
//   );
// }

import { useState,useEffect } from 'react';
import CreatorLayout from '../components/Expanded/CreatorLayout';
import { useNavigate } from 'react-router-dom';
import { FontStyles,Colors } from '../components/styleConstants';
import CustomInput from '../components/Expanded/CustomInput';
import defaultProfileImg from "../assets/images/Frame235.png";
import NextGreen from "../components/NextOrange";
import BackOrange from "../components/Expanded/BackOrange";
import axiosInstance from '../api/axiosInstance';
export default function Create02() {
  const navigate = useNavigate();
  const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");

  // 역할 배경 설정 
  const [back,setback] =useState();

  // 개별 역할 이름
  const [char1,setchar1] =useState();
  const [char2,setchar2] =useState();
  const [char3,setchar3] =useState();

  // 개별 역할 설명 
  const [charDes1,setcharDes1] =useState();
  const [charDes2,setcharDes2] =useState();
  const [charDes3,setcharDes3] =useState();

  // 이미지 상태 각각 분리
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);

  const [isDefaultImage1, setIsDefaultImage1] = useState(true);
  const [isDefaultImage2, setIsDefaultImage2] = useState(true);
  const [isDefaultImage3, setIsDefaultImage3] = useState(true);
  useEffect(() => {
    try {
      // 개별 키 로드
      const b  = localStorage.getItem('rolesBackground');
      const n1 = localStorage.getItem('char1');
      const n2 = localStorage.getItem('char2');
      const n3 = localStorage.getItem('char3');
      const d1 = localStorage.getItem('charDes1');
      const d2 = localStorage.getItem('charDes2');
      const d3 = localStorage.getItem('charDes3');
  
      const isValid = (v) => v !== null && v.trim().length > 0;
      const hasAllLocal =
        isValid(b) && isValid(n1) && isValid(n2) && isValid(n3) &&
        isValid(d1) && isValid(d2) && isValid(d3);
  
      if (hasAllLocal) {
        setback(b);
        setchar1(n1); setchar2(n2); setchar3(n3);
        setcharDes1(d1); setcharDes2(d2); setcharDes3(d3);
        return; //  개별 키로 초기화 완료
      }
  
      // 없거나 하나라도 공백이면 data에서 폴백
      const raw = localStorage.getItem('data');
      if (!raw) return;
      const data = JSON.parse(raw);
  
      setback(data?.rolesBackground ?? '');
      const roles = Array.isArray(data?.roles) ? data.roles : [];
      setchar1(roles[0]?.name ?? '');
      setchar2(roles[1]?.name ?? '');
      setchar3(roles[2]?.name ?? '');
      setcharDes1(roles[0]?.description ?? '');
      setcharDes2(roles[1]?.description ?? '');
      setcharDes3(roles[2]?.description ?? '');
  
      // ✨ 폴백 승격: data 값이 비공백이면 개별 키에 즉시 저장(다음 마운트부터 개별 키 경로 사용)
      const promote = (k, v) => { if (v && v.trim().length > 0) localStorage.setItem(k, v); };
      promote('rolesBackground', data?.rolesBackground ?? '');
      promote('char1', roles[0]?.name ?? '');
      promote('char2', roles[1]?.name ?? '');
      promote('char3', roles[2]?.name ?? '');
      promote('charDes1', roles[0]?.description ?? '');
      promote('charDes2', roles[1]?.description ?? '');
      promote('charDes3', roles[2]?.description ?? '');
    } catch (e) {
      console.error('Failed to init from localStorage/data', e);
    }
  }, []);
  

// 역할별 이미지 변경 핸들러
const handleImageChange = (setImage, setIsDefault) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setIsDefault(false);
    }
  };
  input.click();
};

// 서버에 roles/background PUT
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
    // 1) 현재 입력값으로 payload 구성
    const name1 = (char1 ?? '').trim();
    const name2 = (char2 ?? '').trim();
    const name3 = (char3 ?? '').trim();
    const desc1 = (charDes1 ?? '').trim();
    const desc2 = (charDes2 ?? '').trim();
    const desc3 = (charDes3 ?? '').trim();
    const background = (back ?? '').trim();

    const safe = s => (s && s.length > 0 ? s : '-');
    const rolesSafe = [
      { name: safe(name1), description: safe(desc1) },
      { name: safe(name2), description: safe(desc2) },
      { name: safe(name3), description: safe(desc3) },
    ];
    const backgroundSafe = safe(background);

    // 2) 서버 PUT
    await putRoles({ roles: rolesSafe, background: backgroundSafe });

    // // 3) localStorage에 개별 키로 저장
    // const kv = {
    //   char1: name1,
    //   char2: name2,
    //   char3: name3,
    //   charDes1: desc1,
    //   charDes2: desc2,
    //   charDes3: desc3,
    //   rolesBackground: background,
    // };
    // Object.entries(kv).forEach(([k, v]) => localStorage.setItem(k, v));

    // 4) 다음 페이지
    navigate('/create03');
  } catch (err) {
    console.error(err);
    alert('역할 저장 중 오류가 발생했습니다.');
  }
};



const handleBack = () => {
  navigate('/create01');
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
          // 여기서도 원하면 localStorage 저장 가능
          localStorage.setItem("creatorTitle", val);
        },
      }}
   >
    <div style={{ 
      display: "flex", 
      justifyContent: "center",  // 가로 중앙
      alignItems: "center",      // 세로 중앙
      height: "100%",            // 부모 높이 기준
    }}>
     <div style={{ marginTop: -30, marginBottom: 30 }}>        <h2 style={{
              ...FontStyles.headlineNormal,
              color: Colors.grey07
            }}>
              역할
        </h2>
         <p style={{
              ...FontStyles.title,
              color: Colors.grey05,
              lineHeight: 1.5,
              marginBottom: '32px'
            }}>
              딜레마 상황에 등장하는 세명의 역할을 설정하세요. 각 역할은 게임에 참여하는 3명의 플레이어에게 임의로 배정됩니다. 
          </p>
          <h2 style={{
              ...FontStyles.headlineSmall,
              color: Colors.grey07
            }}>
              역할 배경 설정
        </h2>
        <CustomInput
          width={1060}
          height={140}
          placeholder={`예: 지금부터 여러분은 HomeMate를 사용하게 된 가족집의 구성원들입니다.
        여러분은 가정에서 HomeMate를 사용하며 일어나는 일에 대해 함께 논의하여 결정할 것입니다.`}
          value={back}
          onChange={(e) => {
            const v = e.target.value ?? '';
            setback(v);
            localStorage.setItem('rolesBackground', v); 
          }}        />
         <h2 style={{
            marginTop:30,
              ...FontStyles.headlineSmall,
              color: Colors.grey07
            }}>
              개별 배경 설정
        </h2>
      
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 20,                 // 행 사이 간격
            marginTop: 16,
          }}
        >
          {/* 첫번째 역할 */}
          <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start", // 전체는 왼쪽 정렬
          }}
        >
          {/* 이미지 + 이미지 변경만 중앙 정렬 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          >
            {/* 이미지 영역 */}
            <div
              style={{
                width: 230,
                height: 230,
                border: "2px solid #ddd",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f8f9fa",
                overflow: "hidden",
              }}
            >
              <img
              src={isDefaultImage1 ? defaultProfileImg : URL.createObjectURL(image1)}
              alt="역할 이미지"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            </div>

            {/* 이미지 변경 */}
            <span
          onClick={() => handleImageChange(setImage1, setIsDefaultImage1)}
          style={{
            color: Colors.grey06,
            ...FontStyles.body,
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            marginTop: 8,
          }}
        >
          이미지 변경
        </span>
          </div>

          {/* 역할 이름 */}
          <h2
            style={{
              marginTop: 16,
              ...FontStyles.title,
              color: Colors.grey07,
              textAlign: "left",
              width: "100%",
            }}
          >
            역할 이름
          </h2>
          <CustomInput
            width={340}
            height={72}
            placeholder="예: 요양 보호사 K"
            value={char1}
            onChange={(e) => {
              const v = e.target.value ?? '';
              setchar1(v);
              localStorage.setItem('char1', v); 
            }}          />

          {/* 설명 */}
          <h2
            style={{
              marginTop: 16,
              ...FontStyles.title,
              color: Colors.grey07,
              textAlign: "left",
              width: "100%",
            }}
          >
            설명
          </h2>
          <CustomInput
            width={340}
            height={320}
            placeholder="예: 당신은 어머니를 10년 이상 돌본 요양 보호사 K입니다."
            value={charDes1}
            onChange={(e) => {
              const v = e.target.value ?? '';
              setcharDes1(v);
              localStorage.setItem('charDes1', v); 
            }}          />
        </div>


          {/* 두번째 역할 */}
          <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start", // 전체는 왼쪽 정렬
          }}
        >
          {/* 이미지 + 이미지 변경만 중앙 정렬 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          >
            {/* 이미지 영역 */}
            <div
              style={{
                width: 230,
                height: 230,
                border: "2px solid #ddd",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f8f9fa",
                overflow: "hidden",
              }}
            >
             <img
              src={isDefaultImage2 ? defaultProfileImg : URL.createObjectURL(image2)}
              alt="역할 이미지"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            </div>

            {/* 이미지 변경 */}
            <span
          onClick={() => handleImageChange(setImage2, setIsDefaultImage2)}
          style={{
            color: Colors.grey06,
            ...FontStyles.body,
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            marginTop: 8,
          }}
        >
          이미지 변경
        </span>
          </div>

          {/* 역할 이름 */}
          <h2
            style={{
              marginTop: 16,
              ...FontStyles.title,
              color: Colors.grey07,
              textAlign: "left",
              width: "100%",
            }}
          >
            역할 이름
          </h2>
          <CustomInput
            width={340}
            height={72}
            placeholder="예: 노모 L"
            value={char2}
            onChange={(e) => {
              const v = e.target.value ?? '';
              setchar2(v);
              localStorage.setItem('char2', v);
            }}          />

          {/* 설명 */}
          <h2
            style={{
              marginTop: 16,
              ...FontStyles.title,
              color: Colors.grey07,
              textAlign: "left",
              width: "100%",
            }}
          >
            설명
          </h2>
          <CustomInput
            width={340}
            height={320}
            placeholder="예: 당신은 자녀J씨의 노모입니다. 가사도우미의 도움을..."
            value={charDes2}
            onChange={(e) => {
              const v = e.target.value ?? '';
              setcharDes2(v);
              localStorage.setItem('charDes2', v); 
            }}          />
        </div>


          {/* 세번째 역할 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start", 
            }}
          >
            {/* 이미지 + 이미지 변경만 중앙 정렬 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              {/* 이미지 영역 */}
              <div
                style={{
                  width: 230,
                  height: 230,
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f8f9fa",
                  overflow: "hidden",
                }}
              >
               <img
              src={isDefaultImage3 ? defaultProfileImg : URL.createObjectURL(image3)}
              alt="역할 이미지"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            </div>

            {/* 이미지 변경 */}
            <span
              onClick={() => handleImageChange(setImage3, setIsDefaultImage3)}
              style={{
                color: Colors.grey06,
                ...FontStyles.body,
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
                marginTop: 8,
              }}
            >
              이미지 변경
            </span>
            </div>

            {/* 역할 이름 */}
            <h2
              style={{
                marginTop: 16,
                ...FontStyles.title,
                color: Colors.grey07,
                textAlign: "left",
                width: "100%",
              }}
            >
              역할 이름
            </h2>
            <CustomInput
              width={340}
              height={72}
              placeholder="예: 자녀 J"
              value={char3}
              onChange={(e) => {
                const v = e.target.value ?? '';
                setchar3(v);
                localStorage.setItem('char3', v); 
              }}            />

            {/* 설명 */}
            <h2
              style={{
                marginTop: 16,
                ...FontStyles.title,
                color: Colors.grey07,
                textAlign: "left",
                width: "100%",
              }}
            >
              설명
            </h2>
            <CustomInput
              width={340}
              height={320}
              placeholder="예: 당신은 자녀J씨입니다. 노쇠하신 어머니가 걱정되어..."
              value={charDes3}
              onChange={(e) => {
                const v = e.target.value ?? '';
                setcharDes3(v);
                localStorage.setItem('charDes3', v); 
              }}            />
          </div>

        </div>
          </div>  
        <div style={{
                position: 'absolute',
                bottom: '30px',
                right: '30px'
              }}>
                <NextGreen onClick={handleNext} />
              </div>
              <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '30px'
              }}>
                <BackOrange onClick={handleBack} />
        </div>

     </div>
    </CreatorLayout>
  );
}
