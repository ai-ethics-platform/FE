// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Background from '../components/Background';
// import Frame1 from '../components/Frame1';
// import InputBoxLarge from '../components/InputBoxLarge';
// import PrimaryButton from '../components/PrimaryButton';
// import SecondaryButton from '../components/SecondaryButton';
// import TextButton from '../components/TextButton';
// import profileIcon from '../assets/login.svg';
// import lockIcon from '../assets/password.svg';
// import eyeOnIcon from '../assets/eyeon.svg';
// import eyeOffIcon from '../assets/eyeoff.svg';
// import axios from 'axios'; 
// import GuestLogin from '../components/GuestLogin';
// import { Colors, FontStyles } from '../components/styleConstants';

// export default function Login() {
//   const navigate = useNavigate();
//   const [pwVisible, setPwVisible] = useState(false);
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [showGuestLogin, setShowGuestLogin] = useState(false);

//   useEffect(() => {
//     const original = document.body.style.overflow;
//     document.body.style.overflow = 'hidden';
//     return () => {
//       document.body.style.overflow = original;
//     };
//   }, []);
//   const handleVoiceChange = (enabled) => {
//     console.log('Voice enabled changed to:', enabled);
//     // 필요시 상태 업데이트 or 안내
//   };
//   return (
//     <Background bgIndex={1}>
  
//       <div
//         style={{
//           position: 'absolute',
//           inset: 0,
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           padding: '0 1rem', 

//         }}
//       >
//         <div
//           style={{
//             //width: '50vw',
//             width:'100%',
//             maxWidth: 450,
//             padding: '2vh 0',
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             gap: '2vh',
//             boxSizing: 'border-box',
//           }}
//         >
//          <p style={{
//             fontFamily: 'Cafe24Ohsquareair, Pretendard, sans-serif',
//             fontSize: '26px',
//             color: '#000',
//             margin: 5,
//           }}>
//             AI 윤리 딜레마 게임
//           </p>
//           <div
//             style={{
//               width: '100%',      
//               display: 'flex',
//               justifyContent: 'center',
//             }}
//           >
//             <div
//               style={{
//                 width: '100%',
//                 maxWidth: 552,
//                 maxHeight: 200,
//               }}
//             >
//         <Frame1 style={{ width: '100%', display: 'block', margin: '0 auto' }} />
//         </div>
//           </div>
//           <InputBoxLarge
//             placeholder="아이디을 입력해 주세요."
//             leftIcon={profileIcon}
//             bgColor={Colors.componentBackgroundFloat}
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             style={{
//               width: '100%',
//               height: '8vh',
//               maxHeight: 60,
//               fontSize: 'clamp(0.875rem, 2vw, 1rem)',
//               boxSizing: 'border-box',
//             }}
//           />
//           <InputBoxLarge
//             placeholder="비밀번호를 입력해 주세요."
//             leftIcon={lockIcon}
//             rightIconVisible={eyeOnIcon}
//             rightIconHidden={eyeOffIcon}
//             isPassword={!pwVisible}
//             onClickRightIcon={() => setPwVisible((v) => !v)}
//             bgColor={Colors.componentBackgroundFloat}
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             style={{
//               width: '100%',
//               height: '8vh',
//               maxHeight: 60,
//               fontSize: 'clamp(0.875rem, 2vw, 1rem)',
            
//             }}
//           />
//           <PrimaryButton
//             style={{
//               width: '100%',
//               height: '8vh',
//               maxHeight: 64,
//               fontSize: 'clamp(1rem, 2vw, 1.125rem)',
//               marginTop: '2vh',
//             }}
           
//             onClick={async () => {
//               console.log('입력된 username:', username);
//               console.log('입력된 password:', password);
            
//               try {
//                 const form = new URLSearchParams();
//                 form.append('username', username);
//                 form.append('password', password);
             
//                 const response = await axios.post('https://dilemmai.org/auth/login', form, {
//                   headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded',
//                   },
//                 });
               
//                 // const response = await axios.post(
//                 //   'https://dilemmai.org/auth/login-json',
//                 //   { username, password },                          // JSON 바디
//                 //   { headers: { 'Content-Type': 'application/json' } }
//                 // );            
               
//                 const { access_token, refresh_token } = response.data;

//                 localStorage.setItem('access_token', access_token);
//                 localStorage.setItem('refresh_token', refresh_token);

//                 console.log('로그인 성공:', response.data);
//                 navigate('/selectroom');

//               } catch (error) {
//                 if (error.response) {
//                   console.error('로그인 실패:', error.response.data);
//                   alert('로그인 실패: ' + JSON.stringify(error.response.data.detail, null, 2));
//                 } else {
//                   console.error('Error:', error.message);
//                 }
//               }
//             }}
//             >
//               로그인
//             </PrimaryButton>

//           <div
//             style={{
//               display: 'flex',
//               gap: '4vw',
//               justifyContent: 'center',
//               marginTop: '1.5vh',
//             }}
//           >
//             <TextButton onClick={() => navigate('/signup01')}>
//               회원가입
//             </TextButton>
//             <TextButton onClick={() => { /* TODO */ }}>
//               비밀번호 찾기
//             </TextButton>
//           </div>

//           <SecondaryButton
//             style={{
//               width: '100%',
//               height: '8vh',
//               maxHeight: 64,
//               fontSize: 'clamp(1rem, 2vw, 1.125rem)',
//               marginTop: '2vh',
//             }}
//            onClick={() => setShowGuestLogin(true)}
          
//           >
//             Guest로 로그인
//           </SecondaryButton>
//         {/* 게스트 로그인 팝업 */}
//          {showGuestLogin && (
//             <div
//               style={{
//                position: 'fixed',
//                inset: 0,
//                background: 'rgba(0,0,0,0.45)',
//               display: 'flex',
//                justifyContent: 'center',
//                alignItems: 'center',
//                zIndex: 9999,
//              }}
//            >
//              <GuestLogin onClose={() => setShowGuestLogin(false)} />
//            </div>
//          )}
//         </div>

//       </div>
              

//     </Background>
//   );
// }
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Background from '../components/Background';
import Frame1 from '../components/Frame1';
import InputBoxLarge from '../components/InputBoxLarge';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import TextButton from '../components/TextButton';
import profileIcon from '../assets/login.svg';
import lockIcon from '../assets/password.svg';
import eyeOnIcon from '../assets/eyeon.svg';
import eyeOffIcon from '../assets/eyeoff.svg';
import axios from 'axios';
import GuestLogin from '../components/GuestLogin';
import { Colors, FontStyles } from '../components/styleConstants';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [pwVisible, setPwVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showGuestLogin, setShowGuestLogin] = useState(false);

  // 쿼리에서 code를 상태로 보관(초기값은 로컬스토리지)
  const [inviteCode, setInviteCode] = useState(() => localStorage.getItem('code') || '');

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // URL 쿼리에서 code 읽어 상태/로컬스토리지에 저장
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const codeFromQuery = params.get('code');
    if (codeFromQuery) {
      setInviteCode(codeFromQuery);
      localStorage.setItem('code', codeFromQuery);
    }
  }, [location.search]);

  const handleLogin = async () => {
    console.log('입력된 username:', username);
    console.log('입력된 password:', password);

    try {
      const form = new URLSearchParams();
      form.append('username', username);
      form.append('password', password);

      const response = await axios.post('https://dilemmai.org/auth/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token, refresh_token } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      // 상태값 우선, 없으면 로컬스토리지 fallback
      const codeToUse = inviteCode || localStorage.getItem('code');

      if (codeToUse) {
        // 필요하다면 code를 쿼리로 넘길 수도 있음: `/customroom?code=${encodeURIComponent(codeToUse)}`
        navigate('/customroom', { replace: true });
      } else {
        navigate('/selectroom', { replace: true });
      }
    } catch (error) {
      if (error.response) {
        console.error('로그인 실패:', error.response.data);
        alert('로그인 실패: ' + JSON.stringify(error.response.data.detail, null, 2));
      } else {
        console.error('Error:', error.message);
        alert('로그인 오류: ' + error.message);
      }
    }
  };

  return (
    <Background bgIndex={1}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 1rem',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 450,
            padding: '2vh 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2vh',
            boxSizing: 'border-box',
          }}
        >
          <p
            style={{
              fontFamily: 'Cafe24Ohsquareair, Pretendard, sans-serif',
              fontSize: '26px',
              color: '#000',
              margin: 5,
            }}
          >
            AI 윤리 딜레마 게임
          </p>

          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 552, maxHeight: 200 }}>
              <Frame1 style={{ width: '100%', display: 'block', margin: '0 auto' }} />
            </div>
          </div>

          <InputBoxLarge
            placeholder="아이디를 입력해 주세요."
            leftIcon={profileIcon}
            bgColor={Colors.componentBackgroundFloat}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '100%',
              height: '8vh',
              maxHeight: 60,
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              boxSizing: 'border-box',
            }}
          />

          <InputBoxLarge
            placeholder="비밀번호를 입력해 주세요."
            leftIcon={lockIcon}
            rightIconVisible={eyeOnIcon}
            rightIconHidden={eyeOffIcon}
            isPassword={!pwVisible}
            onClickRightIcon={() => setPwVisible((v) => !v)}
            bgColor={Colors.componentBackgroundFloat}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              height: '8vh',
              maxHeight: 60,
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
            }}
          />

          <PrimaryButton
            style={{
              width: '100%',
              height: '8vh',
              maxHeight: 64,
              fontSize: 'clamp(1rem, 2vw, 1.125rem)',
              marginTop: '2vh',
            }}
            onClick={handleLogin}
          >
            로그인
          </PrimaryButton>

          <div
            style={{
              display: 'flex',
              gap: '4vw',
              justifyContent: 'center',
              marginTop: '1.5vh',
            }}
          >
            <TextButton onClick={() => navigate('/signup01')}>회원가입</TextButton>
            <TextButton onClick={() => { /* TODO: 비밀번호 찾기 */ }}>비밀번호 찾기</TextButton>
          </div>

          <SecondaryButton
            style={{
              width: '100%',
              height: '8vh',
              maxHeight: 64,
              fontSize: 'clamp(1rem, 2vw, 1.125rem)',
              marginTop: '2vh',
            }}
            onClick={() => setShowGuestLogin(true)}
          >
            Guest로 로그인
          </SecondaryButton>

          {showGuestLogin && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
              }}
            >
              <GuestLogin onClose={() => setShowGuestLogin(false)} />
            </div>
          )}
        </div>
      </div>
    </Background>
  );
}
