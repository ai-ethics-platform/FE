// // 여기서 처음 이미지는 나중에 api로 임포트 받아와야함 
// import { useState } from 'react';
// import CreatorLayout from '../components/Expanded/CreatorLayout';
// import { useNavigate } from 'react-router-dom';
// import { FontStyles,Colors } from '../components/styleConstants';
// import CustomInput from '../components/Expanded/CustomInput';
// import defaultProfileImg from "../assets/images/Frame235.png";
// import NextGreen from "../components/NextOrange";
// import BackOrange from "../components/Expanded/BackOrange";
// import DilemmaDonePopUp from '../components/Expanded/DilemmaDonePopUp';

// export default function Create05() {
//   const navigate = useNavigate();
//   const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");

//   // 역할 배경 설정 
//   const [agreeEnding,setagreeEnding] =useState();
//   const [disagreeEnding,setdisagreeEnding] =useState();
//   const [isDoneOpen, setIsDoneOpen] = useState(false); 

//   const handleBack = () => {
//     navigate('/create04');
//   };
//   const handleCompleted = () => {
//     navigate('/creatorending');
//   };
//   return (
//     <>
//     <CreatorLayout
//       headerbar={2}
//       headerLeftType="home"
//       headerNextDisabled={false}
//       onHeaderNextClick={() => setIsDoneOpen(true)}  //
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
//      <div style={{ marginTop: -30, marginBottom: 30 }}>        
//       <h2 style={{
//           ...FontStyles.headlineNormal,
//           color: Colors.grey07
//       }}>
//       최종 멘트 
//       </h2>
//       <p style={{
//           ...FontStyles.title,
//           color: Colors.grey05,
//           lineHeight: 1.5,
//           marginBottom: '32px'
//         }}>
//           최종적으로 선택한 합의 결과에 따른 간단한 엔딩을 작성해주세요. 
//           </p>
//         <h2 style={{
//             ...FontStyles.headlineSmall,
//             color: Colors.grey07
//             }}>
//           [동의 선택 시 엔딩]
//         </h2>
//         <CustomInput
//           width={1060}
//           height={140}
//           placeholder={` 예: 우리 가족은 최종적으로 개인정보 제공에 동의하였고, 사생활 관련한 약간의 불편함을 감수하며...`}
//           value={agreeEnding}
//           onChange={(e) => setagreeEnding(e.target.value)}
//         />
//          <h2 style={{
//             marginTop:30,
//               ...FontStyles.headlineSmall,
//               color: Colors.grey07
//             }}>
//           [비동의 선택 시 엔딩]
//         </h2>
//         <CustomInput
//           width={1060}
//           height={140}
//           placeholder={` 예: 우리 가족은 최종적으로 개인정보 제공에 동의하지 않았고, 사생활 관련한 약간의 불편함은 있으나...`}
//           value={disagreeEnding}
//           onChange={(e) => setdisagreeEnding(e.target.value)}
//         />
//        </div>  
       
//        <div style={{
//               position: 'absolute',
//               bottom: '30px',
//               left: '30px'
//           }}>
//         <BackOrange onClick={handleBack} />
//         </div>

//      </div>
//     </CreatorLayout>

//           {/* 팝업 오버레이 */}
//           {isDoneOpen && (
//             <div
//               onClick={() => setIsDoneOpen(false)} 
//               style={{
//                 position: 'fixed',
//                 inset: 0,
//                 background: 'rgba(0,0,0,0.35)',
//                 zIndex: 10000,
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//               }}
//             >
//               {/* 팝업 내용 영역 클릭은 전파 중단 */}
//               <div onClick={(e) => e.stopPropagation()}>
//                 {/* DilemmaDonePopUp이 제공하는 API에 맞춰 onClose/onConfirm 등 연결 */}
//                 <DilemmaDonePopUp
//                   onClose={() => setIsDoneOpen(false)}
//                   onConfirm={() => {
//                     // 팝업 닫고 다음 화면으로 이동
//                     setIsDoneOpen(false);
//                     handleCompleted(); 
//                   }} />
//               </div>
//             </div>
//           )}
//     </>
//   );
// }

//put할때 title도 put해줘야함, 마지막에 title put해주기 , 미리보기 모드에서도 완료하기 누르면 put할 수 있도록 수정해야함 
// 여기서 처음 이미지는 나중에 api로 임포트 받아와야함
import { useEffect, useState } from 'react';
import CreatorLayout from '../components/Expanded/CreatorLayout';
import { useNavigate } from 'react-router-dom';
import { FontStyles,Colors } from '../components/styleConstants';
import CustomInput from '../components/Expanded/CustomInput';
import defaultProfileImg from "../assets/images/Frame235.png";
import NextGreen from "../components/NextOrange";
import BackOrange from "../components/Expanded/BackOrange";
import DilemmaDonePopUp from '../components/Expanded/DilemmaDonePopUp';
import axiosInstance from '../api/axiosInstance'; // ✅ 추가

export default function Create05() {
  const navigate = useNavigate();
  const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");

  // 최종 멘트
  const [agreeEnding, setAgreeEnding] = useState('');     
  const [disagreeEnding, setDisagreeEnding] = useState(''); 
  const [isDoneOpen, setIsDoneOpen] = useState(false);

  //  초기 로드: localStorage.data.finalMessages → state 세팅
 // Create05.jsx
useEffect(() => {
  try {
    const agreeLocal = localStorage.getItem('agreeEnding');
    const disagreeLocal = localStorage.getItem('disagreeEnding');

    const useLocal =
      typeof agreeLocal === 'string' || typeof disagreeLocal === 'string';

    if (useLocal) {
      const a = (agreeLocal ?? '');
      const d = (disagreeLocal ?? '');
      setAgreeEnding(a);
      setDisagreeEnding(d);

      // ✅ 초기 로드 시에도 로컬에 즉시 저장(승격 저장)
      localStorage.setItem('agreeEnding', a);
      localStorage.setItem('disagreeEnding', d);
      return;
    }

    // data 폴백
    const raw = localStorage.getItem('data');
    if (!raw) return;
    const data = JSON.parse(raw);
    const fm = data?.finalMessages ?? {};
    const a = (fm?.agree ?? '');
    const d = (fm?.disagree ?? '');

    setAgreeEnding(a);
    setDisagreeEnding(d);

    // 폴백으로 세팅해도 로컬에 즉시 저장(승격 저장)
    localStorage.setItem('agreeEnding', a);
    localStorage.setItem('disagreeEnding', d);
  } catch (e) {
    console.error('Failed to parse localStorage.data', e);
  }
}, []);
const putTitle = async (title) => {
  const code = localStorage.getItem('code');
  if (!code) throw new Error('게임 코드가 없습니다. (code)');
  await axiosInstance.put(
    `/custom-games/${code}/title`,
    { title },
    { headers: { 'Content-Type': 'application/json' } }
  );
};

  const handleBack = () => navigate('/create04');

  //  서버 PUT 함수
  const putEnding = async ({ agree, disagree }) => {
    const code = localStorage.getItem('code');
    if (!code) throw new Error('게임 코드가 없습니다. (code)');

    await axiosInstance.put(
      `/custom-games/${code}/ending`,
      { agree, disagree },
      { headers: { 'Content-Type': 'application/json' } }
    );
  };
  const handleSaveAndComplete = async () => {
    try {
      const safe = (s) => {
        const t = (s ?? '').trim();
        return t.length > 0 ? t : '-';
      };
      const agree = safe(agreeEnding);
      const disagree = safe(disagreeEnding);
      const titleSafe = safe(title);
  
      // 1) 서버 PUT
      await putEnding({ agree, disagree });
      // (선택) 타이틀도 함께 PUT
      await putTitle(titleSafe);
  
      // 2) 로컬 보강 저장
      localStorage.setItem('agreeEnding', agree);
      localStorage.setItem('disagreeEnding', disagree);
      localStorage.setItem('creatorTitle', titleSafe);
  
      // 3) 이동
      navigate('/creatorending');
    } catch (e) {
      console.error(e);
      alert('최종 멘트 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <CreatorLayout
        headerbar={2}
        headerLeftType="home"
        headerNextDisabled={false}
        onHeaderNextClick={() => setIsDoneOpen(true)} // 팝업 오픈
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
            <h2 style={{ ...FontStyles.headlineNormal, color: Colors.grey07 }}>최종 멘트</h2>
            <p style={{ ...FontStyles.title, color: Colors.grey05, lineHeight: 1.5, marginBottom: '32px' }}>
              최종적으로 선택한 합의 결과에 따른 간단한 엔딩을 작성해주세요.
            </p>

            <h2 style={{ ...FontStyles.headlineSmall, color: Colors.grey07 }}>[동의 선택 시 엔딩]</h2>
            <CustomInput
              width={1060}
              height={140}
              placeholder={` 예: 우리 가족은 최종적으로 개인정보 제공에 동의하였고, 사생활 관련한 약간의 불편함을 감수하며...`}
              value={agreeEnding}
              onChange={(e) => {
                const v = e.target.value;
                setAgreeEnding(v);
                localStorage.setItem('agreeEnding', v); // ✅ 입력 즉시 저장
              }}            />

            <h2 style={{ marginTop: 30, ...FontStyles.headlineSmall, color: Colors.grey07 }}>[비동의 선택 시 엔딩]</h2>
            <CustomInput
              width={1060}
              height={140}
              placeholder={` 예: 우리 가족은 최종적으로 개인정보 제공에 동의하지 않았고, 사생활 관련한 약간의 불편함은 있으나...`}
              value={disagreeEnding}
              onChange={(e) => {
                const v = e.target.value;
                setDisagreeEnding(v);
                localStorage.setItem('disagreeEnding', v); // ✅ 입력 즉시 저장
              }}            />
          </div>

          <div style={{ position: 'absolute', bottom: '30px', left: '30px' }}>
            <BackOrange onClick={handleBack} />
          </div>
        </div>
      </CreatorLayout>

      {/* 완료 팝업 */}
      {isDoneOpen && (
        <div
          onClick={() => setIsDoneOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <DilemmaDonePopUp
              onClose={() => setIsDoneOpen(false)}
              onConfirm={async () => {
                setIsDoneOpen(false);
                await handleSaveAndComplete(); 
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
