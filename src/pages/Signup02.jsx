import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import InputBoxLarge from '../components/InputBoxLarge';
import PasswordCheck from '../components/PasswordCheck';
import SelectDrop from '../components/SelectDrop';
import PrimaryButton from '../components/PrimaryButton';
import backIcon from '../assets/arrowLdefault.svg';
import logo from '../assets/logo.svg';
import profileIcon from '../assets/login.svg';
import lockIcon from '../assets/password.svg';
import eyeOnIcon from '../assets/eyeon.svg';
import eyeOffIcon from '../assets/eyeoff.svg';

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
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (password && confirmPassword && password !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setPasswordError('');
    }
  }, [password, confirmPassword]);

  useEffect(() => {
    const emailValue = emailRef.current?.querySelector('input')?.value || '';
    if (emailValue && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(emailValue)) {
      setEmailError('유효한 이메일 주소를 입력하세요.');
    } else {
      setEmailError('');
    }
  });

  const handleNumericInput = (setter) => (e) => {
    const onlyNums = e.target.value.replace(/\D/g, '');
    setter(onlyNums);
  };

  const isFormValid = (() => {
    const emailValue = emailRef.current?.querySelector('input')?.value || '';
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
      Boolean(education)
    );
  })();

  const inputStyle = {
    flex: 1,
    height: 62,
    border: '1px solid #CBD5E1',
    borderRadius: 8,
    paddingLeft: 12,
    fontSize: 16,
    width:190,
    outline: 'none',
    backgroundColor: '#F1F5F9',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center'
  };

  const selectedGenderStyle = {
    flex: 1,
    height: 48,
    borderRadius: 6,
    border: '1.5px solid #334155',
    backgroundColor: '#E2E8F0',
    textAlign: 'center',
    lineHeight: '48px',
    cursor: 'pointer',
    fontWeight: 600,
    color: '#1E293B'
  };

  const unselectedGenderStyle = {
    flex: 1,
    height: 48,
    borderRadius: 6,
    border: '1px solid #CBD5E1',
    backgroundColor: '#F1F5F9',
    textAlign: 'center',
    lineHeight: '48px',
    cursor: 'pointer',
    fontWeight: 400,
    color: '#1E293B'
  };

  const grayBackground = '#F1F5F9';

  return (
    <Background bgIndex={1}>
      <div
        style={{
          maxWidth: 552,
          margin: '0 auto',
          padding: '40px 24px',
          fontFamily: 'Pretendard, sans-serif',
          color: '#1E293B',
        }}
      >
        <div style={{ position: 'relative', marginBottom: 40 }}>
          <img
            src={backIcon}
            alt="뒤로가기"
            style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/signup01')}
          />
          <div style={{ textAlign: 'center' }}>
            <img src={logo} alt="로고" style={{ height: 48 }} />
          </div>
        </div>

        {/* 아이디 및 비밀번호 */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>아이디(이메일) 및 비밀번호</div>

          <div style={{ marginBottom: 16 }} ref={emailRef}>
            <InputBoxLarge placeholder="아이디(이메일)" leftIcon={profileIcon} bgColor={grayBackground} />
          </div>
          {emailError && <div style={{ color: '#EF4444', fontSize: 12, marginBottom: 16 }}>{emailError}</div>}

          <div style={{ marginBottom: 16 }}>
            <PasswordCheck
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={lockIcon}
              rightIconVisible={eyeOnIcon}
              rightIconHidden={eyeOffIcon}
              isPassword
              bgColor={grayBackground}
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
              bgColor={grayBackground}
            />
            {passwordError && <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{passwordError}</div>}
          </div>
        </div>

        {/* 생년월일 */}
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>생년월일*</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, alignItems: 'center' }}>
          <input style={inputStyle} placeholder="년도" value={birthYear} onChange={handleNumericInput(setBirthYear)} />
          <input style={inputStyle} placeholder="월" value={birthMonth} onChange={handleNumericInput(setBirthMonth)} />
          <input style={inputStyle} placeholder="일" value={birthDay} onChange={handleNumericInput(setBirthDay)} />
        </div>

        {/* 성별 */}
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>성별*</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
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

        {/* 학업 상태 */}
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>현재 학업 상태</div>
        <div style={{ marginBottom: 40 }}>
          <SelectDrop
            options={['중학생', '고등학생', '대학생']}
            value={education}
            onSelect={(option) => setEducation(option)}
            bgColor={grayBackground}
          />
        </div>

        {/* 다음 버튼 */}
        <div style={{ textAlign: 'center' }}>
          <PrimaryButton
            disabled={!isFormValid}
            style={{ width: 552, height: 72 }}
            onClick={() => navigate('/')}
          >
            다음
          </PrimaryButton>
        </div>
      </div>
    </Background>
  );
}
