// 여기서 처음 이미지는 나중에 api로 임포트 받아와야함 
import { useState } from 'react';
import CreatorLayout from '../components/Expanded/CreatorLayout';
import { useNavigate } from 'react-router-dom';
import { FontStyles,Colors } from '../components/styleConstants';
import CustomInput from '../components/Expanded/CustomInput';
import defaultProfileImg from "../assets/images/Frame235.png";
import NextGreen from "../components/NextOrange";
import BackOrange from "../components/Expanded/BackOrange";
import DilemmaDonePopUp from '../components/Expanded/DilemmaDonePopUp';

export default function Create05() {
  const navigate = useNavigate();
  const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");

  // 역할 배경 설정 
  const [agreeEnding,setagreeEnding] =useState();
  const [disagreeEnding,setdisagreeEnding] =useState();
  const [isDoneOpen, setIsDoneOpen] = useState(false); 

  const handleBack = () => {
    navigate('/create04');
  };
  const handleCompleted = () => {
    navigate('/creatorending');
  };
  return (
    <>
    <CreatorLayout
      headerbar={2}
      headerLeftType="home"
      headerNextDisabled={false}
      onHeaderNextClick={() => setIsDoneOpen(true)}  //
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
     <div style={{ marginTop: -30, marginBottom: 30 }}>        
      <h2 style={{
          ...FontStyles.headlineNormal,
          color: Colors.grey07
      }}>
      최종 멘트 
      </h2>
      <p style={{
          ...FontStyles.title,
          color: Colors.grey05,
          lineHeight: 1.5,
          marginBottom: '32px'
        }}>
          최종적으로 선택한 합의 결과에 따른 간단한 엔딩을 작성해주세요. 
          </p>
        <h2 style={{
            ...FontStyles.headlineSmall,
            color: Colors.grey07
            }}>
          [동의 선택 시 엔딩]
        </h2>
        <CustomInput
          width={1060}
          height={140}
          placeholder={` 예: 우리 가족은 최종적으로 개인정보 제공에 동의하였고, 사생활 관련한 약간의 불편함을 감수하며...`}
          value={agreeEnding}
          onChange={(e) => setagreeEnding(e.target.value)}
        />
         <h2 style={{
            marginTop:30,
              ...FontStyles.headlineSmall,
              color: Colors.grey07
            }}>
          [비동의 선택 시 엔딩]
        </h2>
        <CustomInput
          width={1060}
          height={140}
          placeholder={` 예: 우리 가족은 최종적으로 개인정보 제공에 동의하지 않았고, 사생활 관련한 약간의 불편함은 있으나...`}
          value={disagreeEnding}
          onChange={(e) => setdisagreeEnding(e.target.value)}
        />
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

          {/* 팝업 오버레이 */}
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
              {/* 팝업 내용 영역 클릭은 전파 중단 */}
              <div onClick={(e) => e.stopPropagation()}>
                {/* DilemmaDonePopUp이 제공하는 API에 맞춰 onClose/onConfirm 등 연결 */}
                <DilemmaDonePopUp
                  onClose={() => setIsDoneOpen(false)}
                  onConfirm={() => {
                    // 팝업 닫고 다음 화면으로 이동
                    setIsDoneOpen(false);
                    handleCompleted(); 
                  }} />
              </div>
            </div>
          )}
    </>
  );
}
