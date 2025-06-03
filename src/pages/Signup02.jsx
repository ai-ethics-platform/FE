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

export default function Signup02() {
  const navigate = useNavigate();
  const emailRef = useRef(null);

  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [gender, setGender] = useState('');
  const [education, setEducation] = useState('');
  const [grade, setGrade] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 비밀번호 확인 일치 여부
  useEffect(() => {
    if (password && confirmPassword && password !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setPasswordError('');
    }
  }, [password, confirmPassword]);

  // 이메일 유효성 검사
  useEffect(() => {
    const inputEl = emailRef.current?.querySelector('input');
    const emailValue = inputEl ? inputEl.value : '';
    if (emailValue && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(emailValue)) {
      setEmailError('유효한 이메일 주소를 입력하세요.');
    } else {
      setEmailError('');
    }
  });

  // 숫자만 입력받도록
  const handleNumericInput = (setter) => (e) => {
    const onlyNums = e.target.value.replace(/\D/g, '');
    setter(onlyNums);
  };

  // 학년 옵션
  const getGradeOptions = () => {
    if (education === '중학생' || education === '고등학생') {
      return ['1학년', '2학년', '3학년'];
    } else if (education === '대학생') {
      return ['1학년', '2학년', '3학년', '4학년'];
    }
    return [];
  };

  // 폼이 모두 유효해야만 버튼 활성화
  const isFormValid = (() => {
    const inputEl = emailRef.current?.querySelector('input');
    const emailValue = inputEl ? inputEl.value : '';
    return (
      Boolean(emailValue.trim()) &&
      !emailError &&
      Boolean(password) &&
      Boolean(confirmPassword) &&
      !passwordError &&
      Boolean(birthYear.trim()) &&
      Boolean(birthMonth.trim()) &&
      Boolean(birthDay.trim()) &&
      (gender === '남자' || gender === '여자') &&
      Boolean(education) &&
      Boolean(grade)
    );
  })();

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

  return (
    <Background bgIndex={2}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflowY: 'auto',        // 세로 스크롤 허용
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start', // 상단부터 렌더링
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
              아이디(이메일) 및 비밀번호
            </div>

            <div style={{ marginBottom: '2vh' }} ref={emailRef}>
              <InputBoxLarge
                placeholder="아이디(이메일)"
                leftIcon={profileIcon}
                style={{
                  width: '100%',
                  height: '8vh',
                  minHeight: 48,
                  fontSize: 'clamp(0.875rem, 1vw, 1rem)',
                }}
              />
            </div>
            {emailError && (
              <div
                style={{
                  color: Colors.systemRed,
                  fontSize: 'clamp(0.75rem, 1vw, 0.875rem)',
                  marginBottom: '2vh',
                }}
              >
                {emailError}
              </div>
            )}

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
                <div
                  style={{
                    color: Colors.systemRed,
                    fontSize: 'clamp(0.75rem, 1vw, 0.875rem)',
                    marginTop: '1vh',
                  }}
                >
                  {passwordError}
                </div>
              )}
            </div>
          </div>

          {/* ─── “생년월일” 섹션 ─── */}
          <div style={{ marginBottom: '2vh' }}>
            <div
              style={{
                ...FontStyles.title,
                marginBottom: '0.5vh',
                color: Colors.grey07,
              }}
            >
              생년월일 *
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
                onChange={handleNumericInput(setBirthYear)}
              />
              <input
                style={inputStyle}
                placeholder="월"
                value={birthMonth}
                onChange={handleNumericInput(setBirthMonth)}
              />
              <input
                style={inputStyle}
                placeholder="일"
                value={birthDay}
                onChange={handleNumericInput(setBirthDay)}
              />
            </div>
          </div>

          {/* ─── “성별” 섹션 ─── */}
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
            <div style={{ display: 'flex', gap: '1vw', marginBottom: '2vh' }}>
              {['남자', '여자'].map((g) => (
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

          {/* ─── “학업 상태” 섹션 ─── */}
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
                options={['중학생', '고등학생', '대학생']}
                value={education}
                onSelect={(option) => {
                  setEducation(option);
                  setGrade('');
                }}
                style={{
                  width: '100%',
                  height: '8vh',
                  fontSize: 'clamp(0.875rem, 1vw, 1rem)',
                  backgroundColor: grayBackground,
                }}
              />
            </div>

            {education && (
              <div style={{ marginBottom: '4vh' }}>
                <SelectDrop
                  options={getGradeOptions()}
                  value={grade}
                  onSelect={(option) => setGrade(option)}
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
              style={{
                width: '100%',
                height: '7.5vh',
                maxHeight: 64,
                fontSize: 'clamp(1rem, 1.1vw, 1.125rem)',
              }}
              onClick={() => navigate('/')}
            >
              다음
            </PrimaryButton>
          </div>
        </div>
      </div>
    </Background>
  );
}
