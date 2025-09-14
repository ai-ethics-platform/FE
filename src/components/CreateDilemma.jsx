// // 수정할 것 
// // 챗봇 완성 시 챗봇 api를 연결할 수 있는 페이지로 연결하도록 수정해야함
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import closeIcon from '../assets/close.svg';
// import PrimaryButton from './PrimaryButton';
// import { Colors, FontStyles } from './styleConstants';
// import axiosInstance from '../api/axiosInstance';
// import InputBoxSmall from './InputBoxSmall'; 

// export default function CreateDilemma({ onClose }) {
//   const navigate = useNavigate();
//   const [name, setName] = useState('');
//   const [school, setSchool] = useState('');
//   const [email, setEmail] = useState('');

//   // 시작하기 클릭
//   const handleCreateDilemma = async () => {
//     // 로컬에 저장
//     localStorage.setItem('teacher_name', name);
//     localStorage.setItem('teacher_school', school);
//     localStorage.setItem('teacher_email', email);

//     // 다음 페이지 이동
//     navigate('/chatpage3');
//   };

//   // 세 값 중 하나라도 없으면 true
//   const isDisabled = !name.trim() || !school.trim() || !email.trim();

//   return (
//     <div
//       style={{
//         width: 552,
//         height: 548,
//         justifyContent: 'center',
//         backgroundColor: Colors.componentBackgroundFloat,
//         borderRadius: 12,
//         padding: 32,
//         position: 'relative',
//         ...FontStyles.body,
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
//       }}
//     >
//       <img
//         src={closeIcon}
//         alt="close"
//         onClick={onClose}
//         style={{
//           position: 'absolute',
//           top: 24,
//           right: 24,
//           width: 40,
//           height: 40,
//           cursor: 'pointer',
//         }}
//       />

//       <div style={{ ...FontStyles.headlineNormal, color: Colors.brandPrimary, marginBottom: 8 }}>
//          딜레마 게임 만들기 
//       </div>
//       <div style={{ ...FontStyles.body,color: Colors.systemRed, marginBottom: 15 }}>
//         *현재 딜레마 게임 만들기는 교수자 대상으로 제공하고 있습니다. 
//       </div>
//       <div style={{ textAlign:'center',...FontStyles.body,color: Colors.grey06, marginBottom: 32 }}>
//         원하시는 주제로 딜레마 게임을 직접 만들어 교육에서 활용할 수 있습니다.<br/>
//         부적절한 콘텐츠를 제작하는 것을 방지하기 위해 정보를 제공받고 있습니다. <br/>
//         아래에 선생님의 정보를 입력해주세요. 
//       </div>

//       <div style={{ width: '100%', marginBottom: 24 }}>
//         <InputBoxSmall
//           label="이름"
//           width='300px'
//           value={name}
//           placeholder='이름을 입력하세요'
//           onChange={(e) => setName(e.target.value)}
//         />
//         <InputBoxSmall
//           label="근무지"
//           width='300px'
//           value={school}
//           placeholder='학교를 입력하세요'
//           onChange={(e) => setSchool(e.target.value)}
//         />
//         <InputBoxSmall
//           label={<>교수자용<br/>이메일</>}
//           width='300px'
//           value={email}
//           placeholder='학교 메일을 입력하세요'
//           onChange={(e) => setEmail(e.target.value)}
//         />
//       </div>

//       <PrimaryButton
//         onClick={handleCreateDilemma}
//         disabled={isDisabled}
//         style={{
//           width: 168,
//           height: 72,
//           opacity: isDisabled ? 0.5 : 1, // 비활성화 시 흐리게
//           cursor: isDisabled ? 'not-allowed' : 'pointer',
//         }}
//       >
//         {'시작하기'}
//       </PrimaryButton>
//     </div>
//   );
// }

// 수정할 것 
// 챗봇 완성 시 챗봇 api를 연결할 수 있는 페이지로 연결하도록 수정해야함
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import closeIcon from '../assets/close.svg';
import PrimaryButton from './PrimaryButton';
import { Colors, FontStyles } from './styleConstants';
import axiosInstance from '../api/axiosInstance';
import InputBoxSmall from './InputBoxSmall'; 


export default function CreateDilemma({ onClose }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [email, setEmail] = useState('');
  const GPTS_URL = 'https://chatgpt.com/g/g-68c588a5afa881919352989f07138007-ai-yunri-dilrema-sinario-caesbos';

  function openNewTabSafely(url) {
    // 1) 가장 안정적인 직열기
    const w = window.open(url, '_blank', 'noopener,noreferrer');
    if (w) return true;
  
    // 2) 팝업 차단 환경용 앵커 폴백 (현재 탭은 절대 변경하지 않음)
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    return true;
  }
  
  const handleCreateDilemma = (e) => {
    e?.preventDefault?.(); // 혹시 폼 submit 방지
  
    // 사용자 입력 저장
    localStorage.setItem('teacher_name', name);
    localStorage.setItem('teacher_school', school);
    localStorage.setItem('teacher_email', email);
  
    // 새 탭 열기 (현재 탭은 건드리지 않음)
    openNewTabSafely(GPTS_URL);
  
    // 우리 앱은 항상 gpts_page로 이동
    navigate('/chatpage3', { replace: true });
  };
  
  // 세 값 중 하나라도 없으면 true
  const isDisabled = !name.trim() || !school.trim() || !email.trim();

  return (
    <div
      style={{
        width: 552,
        height: 548,
        justifyContent: 'center',
        backgroundColor: Colors.componentBackgroundFloat,
        borderRadius: 12,
        padding: 32,
        position: 'relative',
        ...FontStyles.body,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <img
        src={closeIcon}
        alt="close"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          width: 40,
          height: 40,
          cursor: 'pointer',
        }}
      />

      <div style={{ ...FontStyles.headlineNormal, color: Colors.brandPrimary, marginBottom: 8 }}>
         딜레마 게임 만들기 
      </div>
      <div style={{ ...FontStyles.body,color: Colors.systemRed, marginBottom: 15 }}>
        *현재 딜레마 게임 만들기는 교수자 대상으로 제공하고 있습니다. 
      </div>
      <div style={{ textAlign:'center',...FontStyles.body,color: Colors.grey06, marginBottom: 32 }}>
        원하시는 주제로 딜레마 게임을 직접 만들어 교육에서 활용할 수 있습니다.<br/>
        부적절한 콘텐츠를 제작하는 것을 방지하기 위해 정보를 제공받고 있습니다. <br/>
        아래에 선생님의 정보를 입력해주세요. 
      </div>

      <div style={{ width: '100%', marginBottom: 24 }}>
        <InputBoxSmall
          label="이름"
          width='300px'
          value={name}
          placeholder='이름을 입력하세요'
          onChange={(e) => setName(e.target.value)}
        />
        <InputBoxSmall
          label="근무지"
          width='300px'
          value={school}
          placeholder='학교를 입력하세요'
          onChange={(e) => setSchool(e.target.value)}
        />
        <InputBoxSmall
          label={<>교수자용<br/>이메일</>}
          width='300px'
          value={email}
          placeholder='학교 메일을 입력하세요'
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <PrimaryButton
        onClick={handleCreateDilemma}
        disabled={isDisabled}
        style={{
          width: 168,
          height: 72,
          opacity: isDisabled ? 0.5 : 1,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
        }}
      >
        {'시작하기'}
      </PrimaryButton>
    </div>
  );
}
