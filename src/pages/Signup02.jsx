// src/pages/Signup02.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import InputBoxLarge from '../components/InputBoxLarge';
import PasswordCheck from '../components/PasswordCheck';
import SelectDrop from '../components/SelectDrop';
import PrimaryButton from '../components/PrimaryButton';
import backIcon from '../assets/arrow-left.svg';
import logo from '../assets/logo.svg';
import profileIcon from '../assets/login.svg';
import lockIcon from '../assets/password.svg';
import eyeOnIcon from '../assets/eyeon.svg';
import eyeOffIcon from '../assets/eyeoff.svg';
import { Colors, FontStyles } from '../components/styleConstants';
import axios from 'axios';

export default function Signup02() {
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const [username, setUsername] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [gender, setGender] = useState('');
  const [education, setEducation] = useState('');
  // const [grade, setGrade] = useState('');
  const [major, setMajor] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [email, setEmail] = useState('');
  const [birthError, setBirthError] = useState('');

const [isUsernameAvailable, setIsUsernameAvailable] = useState(null); 
const [usernameCheckError, setUsernameCheckError] = useState(''); 

useEffect(() => {
  if (password.length > 0 && password.length < 8) {
    setPasswordError('비밀번호는 최소 8자 이상이어야 합니다.');
  } else if (password && confirmPassword && password !== confirmPassword) {
    setPasswordError('비밀번호가 일치하지 않습니다.');
  } else {
    setPasswordError('');
  }
}, [password, confirmPassword]);


  useEffect(() => {
    if (email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setEmailError('유효한 이메일 주소를 입력하세요.');
    } else {
      setEmailError('');
    }
  }, [email]);

  // 생년월일 유효 검사 
  const handleBirthInput = (setter, maxLength, type) => (e) => {
    const onlyNums = e.target.value.replace(/\D/g, '').slice(0, maxLength);
    setter(onlyNums);
  
    const y = type === 'year' ? onlyNums : birthYear;
    const m = type === 'month' ? onlyNums : birthMonth;
  
    const isValid =
      y.length === 4 && Number(y) >= 1000 && Number(y) <= 2030 &&
      m.length === 2 && Number(m) >= 1 && Number(m) <= 12;
  
    setBirthError(isValid ? '' : '올바른 형식은 2001-01 입니다.');
  };
  // 계열 옵션 
   const majorOptions = ['예술계열', '공학계열', '인문계열', '사회계열']
  // // 학년 옵션
  // const getGradeOptions = () => {
  //   if (education === '중학생' || education === '고등학생') {
  //     return ['1학년', '2학년', '3학년'];
  //   } else if (education === '대학생') {
  //     return ['1학년', '2학년', '3학년', '4학년'];
  //   }
  //   return [];
  // };

  // 폼이 모두 유효해야만 버튼 활성화
  const isFormValid = (
    Boolean(username.trim()) &&
   // isUsernameAvailable === true && 
    Boolean(email.trim()) &&
    !emailError &&
    Boolean(password) &&
    Boolean(confirmPassword) &&
    !passwordError &&
    Boolean(birthYear.trim()) &&
    Boolean(birthMonth.trim()) &&
    (gender === '남' || gender === '여') &&
    Boolean(education) &&
    (
      (education === '중학생' || education === '고등학생')
      ? true
      : Boolean(major)
    )
  );

  const inputStyle = {
    flex: 1,
    height: '8vh',                 
    minHeight: 48,                 
    border: `1px solid ${Colors.grey02}`,
    paddingLeft: 12,
    ...FontStyles.body,
    width: '100%',                 
    outline: 'none',
    backgroundColor: Colors.componentBackground,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
  };

  // 성별 선택 시 
  const selectedGenderStyle = {
    flex: 1,
    height: '7vh',              
    minHeight: 40,
    border: `1px solid ${Colors.brandPrimary}`,
    backgroundColor: Colors.componentBackgroundActive,
    textAlign: 'center',
    lineHeight: '5.5vh',
    cursor: 'pointer',
    color: Colors.grey07,
  };
  const unselectedGenderStyle = {
    flex: 1,
    height: '7vh',
    minHeight: 40,
    borderRadius: 6,
    border: `0.5px solid ${Colors.grey04}`,
    backgroundColor: Colors.componentBackground,
    textAlign: 'center',
    lineHeight: '5.5vh',
    cursor: 'pointer',
    color: Colors.grey07,
  };

  const grayBackground = Colors.grey01;

  const messageTextStyle = {
    color: Colors.systemRed, 
    fontSize: 'clamp(0.75rem, 1vw, 0.875rem)',
    fontFamily: 'inherit', 
    letterSpacing: '-0.015em', 
    marginBottom:'0vh',
  };
  

  // API 연결  - 로그인 중복 확인 
  const handleCheckUsername = async () => {
    const trimmedUsername = username.trim();
  
    if (!trimmedUsername) {
      setUsernameCheckError('아이디를 입력하세요.');
      return;
    }
  
    if (!/^[a-zA-Z0-9_]{4,20}$/.test(trimmedUsername)) {
      setUsernameCheckError('아이디는 영문, 숫자, 언더스코어로 4~20자여야 합니다.');
      return;
    }
  
    try {
      const res = await axios.post(
        'https://dilemmai.org/auth/check-username',
        { username: trimmedUsername },
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      if (res.data.available) {
        setIsUsernameAvailable(true);
        setUsernameCheckError('');
      } else {
        setIsUsernameAvailable(false);
        setUsernameCheckError('이미 사용 중인 아이디입니다.');
      }
    } catch (err) {
      console.error(err);
      setIsUsernameAvailable(false);
      setUsernameCheckError('확인 중 오류가 발생했습니다.');
    }
  };
  
  // API 연결 - 회원가입  
  const handleSignup = async () => {
    const birthdate = `${birthYear}/${birthMonth.padStart(2, '0')}`;  

    const requestBody = {
      username,
      email,
      password,
      birthdate,
      gender,
      education_level: education,
      major,
      is_active: true,
      "data_consent": true,
      "voice_consent": true
    };
    console.log('데이터:', requestBody);  
    try {
      const response = await axios.post('https://dilemmai.org/auth/signup', requestBody, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('회원가입 성공:', response.data);
      navigate('/selectroom');
    } catch (error) {
      console.error('회원가입 실패:', error.response?.data || error.message);
      alert(`회원가입 오류: ${JSON.stringify(error.response?.data?.detail || '')}`);
    }
  };

  return (
    <Background bgIndex={2}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflowY: 'auto',        
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start', 
          padding: '2vh 0',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '50vw',           
            maxWidth: 552,           
            padding: '1vh 24px',     
            boxSizing: 'border-box',
            ...FontStyles.body,
          }}
        >
          <div
            style={{
              position: 'relative',
              height: '6vh',
              maxHeight: 60,
              marginBottom: '3vh',
            }}
          >
            <img
              src={backIcon}
              alt="뒤로가기"
              style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '4vh',
                maxWidth: 40,
                cursor: 'pointer',
              }}
              onClick={() => navigate('/signup01')}
            />
            <div
              style={{
                textAlign: 'center',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <img
                src={logo}
                alt="로고"
                style={{
                  height: '5vh',
                  maxHeight: 48,
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '2.5vh' }}>
            <div
              style={{
              ...FontStyles.title,
                marginBottom: '1vh',
                color: Colors.grey07,
              }}
            >
              아이디, 이메일 및 비밀번호
            </div>
            {/* 아이디 */}
            <div style={{ marginBottom: '2vh'}}>
              <div style = {{position: 'relative'}}>
              <InputBoxLarge
                placeholder="아이디"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setIsUsernameAvailable(null);
                  setUsernameCheckError('');
                }}
                leftIcon={profileIcon}
                style={{
                  width: '100%',
                  height: '8vh',
                  minHeight: 48,
                  fontSize: 'clamp(0.875rem, 1vw, 1rem)',
                  paddingRight: 80,
                }}
              />
              <button
                onClick={handleCheckUsername}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: 12,
                  transform: 'translateY(-50%)',
                  pointerEvents: 'auto',
                  zIndex: 2,
                  background: 'none',
                  border: 'none',
                  color: Colors.brandPrimary,
                  fontSize: 'clamp(0.75rem, 0.9vw, 0.875rem)',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                중복 확인
              </button>
              </div>
              {usernameCheckError && (
                <div style={messageTextStyle}>{usernameCheckError}</div>
              )}
              {isUsernameAvailable === true && (
                <div style={{ ...messageTextStyle, color: Colors.systemGreen }}>
                  사용 가능한 아이디입니다.
                </div>
              )}
            </div>

            {/* 이메일 */}
            <div style={{ marginBottom: '2vh' }}>
              <InputBoxLarge
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={profileIcon}
                style={{
                  width: '100%',
                  height: '8vh',
                  minHeight: 48,
                  fontSize: 'clamp(0.875rem, 1vw, 1rem)',
                }}
              />
              {emailError && (
                <div style={messageTextStyle}>{emailError}</div>
              )}
            </div>

            <div style={{ marginBottom: '2vh' }}>
              <PasswordCheck
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={lockIcon}
                rightIconVisible={eyeOnIcon}
                rightIconHidden={eyeOffIcon}
                isPassword
                style={{
                  width: '100%',
                  height: '8vh',
                  minHeight: 48,
                  fontSize: 'clamp(0.875rem, 1vw, 1rem)',
                }}
              />
            </div>
            <div>
              <PasswordCheck
                placeholder="비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={lockIcon}
                rightIconVisible={eyeOnIcon}
                rightIconHidden={eyeOffIcon}
                isPassword
                style={{
                  width: '100%',
                  height: '8vh',
                  minHeight: 48,
                  fontSize: 'clamp(0.875rem, 1vw, 1rem)',
                }}
              />
             {passwordError && (
              <div style={messageTextStyle}>
                {passwordError}
              </div>
            )}
            </div>
          </div>

          <div style={{ marginBottom: '2vh' }}>
            <div
              style={{
                ...FontStyles.title,
                marginBottom: '0.5vh',
                color: Colors.grey07,
              }}
            >
              생년월 *
            </div>
            <div
              style={{
                display: 'flex',
                gap: '1vw',
                marginBottom: '4vh',
                alignItems: 'center',
              }}
            >
              <input
                style={inputStyle}
                placeholder="년도"
                value={birthYear}
                onChange={handleBirthInput(setBirthYear, 4, 'year')}
                />
              <input
                style={inputStyle}
                placeholder="월"
                value={birthMonth}
                onChange={handleBirthInput(setBirthMonth, 2, 'month')}
                />
            
            </div>
            {birthError && (
              <div style={messageTextStyle}>{birthError}</div>
            )}
          </div>

          <div style={{ marginBottom: '2vh' }}>
            <div
              style={{
                ...FontStyles.title,
                marginBottom: '0.5vh',
                color: Colors.grey07,
              }}
            >
              성별 *
            </div>
            <div style={{ display: 'flex', gap: '1vw', marginBottom: '1vh' }}>
              {['남', '여'].map((g) => (
                <div
                  key={g}
                  onClick={() => setGender(g)}
                  style={gender === g ? selectedGenderStyle : unselectedGenderStyle}
                >
                  {g}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '0vh' }}>
            <div
              style={{
                
                ...FontStyles.title,
                marginBottom: '1vh',
                color: Colors.grey07,
              }}
            >
              현재 학업 상태
            </div>
            <div style={{ marginBottom: '2vh' }}>
              <SelectDrop
                options={['중학생', '고등학생', '대학생','대학원생']}
                value={education}
                onSelect={(option) => {
                  setEducation(option);
                  setMajor('');
                }}
                style={{
                  width: '100%',
                  height: '8vh',
                  fontSize: 'clamp(0.875rem, 1vw, 1rem)',
                  backgroundColor: grayBackground,
                }}
              />
            </div>

            {(education == '대학생' || education== '대학원생')&&(
              <div style={{ marginBottom: '4vh' }}>
                <SelectDrop
                  options={majorOptions}
                  value={major}
                  onSelect={(option) => setMajor(option)}
                  style={{
                    width: '100%',
                    height: '8vh',
                    minHeight: 48,
                    fontSize: 'clamp(0.875rem, 1vw, 1rem)',
                    backgroundColor: grayBackground,
                  }}
                />
              </div>
            )}
          </div>

          {/* ─── “다음” 버튼 ─── */}
          <div style={{ textAlign: 'center', marginBottom: '4vh' }}>
          <PrimaryButton
          disabled={!isFormValid}
          onClick={
            
            handleSignup}
          
          style={{
            width: '100%',
            height: '7.5vh',
            maxHeight: 64,
            fontSize: 'clamp(1rem, 1.1vw, 1.125rem)',
          }}
        >
          다음
        </PrimaryButton>
          </div>
        </div>
      </div>
    </Background>
  );
}