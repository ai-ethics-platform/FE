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
import { translations } from '../utils/language/index';

/**
 * [AI 수정] 하드코딩된 주소를 환경변수로 분리
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://dilemmai-idl.com';

export default function Signup02() {
  const navigate = useNavigate();
  const lang = localStorage.getItem('app_lang') || 'ko';
  const t = translations[lang].Signup02;

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
  const [major, setMajor] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null); 
  const [passwordError, setPasswordError] = useState('');
  const [email, setEmail] = useState('');
  const [birthError, setBirthError] = useState('');

  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null); 
  const [usernameCheckError, setUsernameCheckError] = useState(''); 

  useEffect(() => {
    if (password.length > 0 && password.length < 8) {
      setPasswordError(t.passwordLengthError);
    } else if (password && confirmPassword && password !== confirmPassword) {
      setPasswordError(t.passwordMatchError);
    } else {
      setPasswordError('');
    }
  }, [password, confirmPassword, t]);

  useEffect(() => {
    if (email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setEmailError(t.emailInvalid);
    } else {
      setEmailError('');
    }
  }, [email, t]);

  const handleBirthInput = (setter, maxLength, type) => (e) => {
    const onlyNums = e.target.value.replace(/\D/g, '').slice(0, maxLength);
    setter(onlyNums);
  
    const y = type === 'year' ? onlyNums : birthYear;
    const m = type === 'month' ? onlyNums : birthMonth;
  
    const isValid =
      y.length === 4 && Number(y) >= 1000 && Number(y) <= 2030 &&
      m.length === 2 && Number(m) >= 1 && Number(m) <= 12;
  
    setBirthError(isValid ? '' : t.birthFormatError);
  };

  const majorOptions = t.majorOptions;

  const isFormValid = (
    Boolean(username.trim()) &&
    Boolean(email.trim()) &&
    !emailError &&
    Boolean(password) &&
    Boolean(confirmPassword) &&
    !passwordError &&
    Boolean(birthYear.trim()) &&
    Boolean(birthMonth.trim()) &&
    !birthError&&
    (gender === t.genderMale || gender === t.genderFemale) &&
    Boolean(education) &&
    (
      (education === t.eduOptions[0] || education === t.eduOptions[1] || education === t.eduOptions[5])
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

  const handleCheckUsername = async () => {
    const trimmedUsername = username.trim();
  
    if (!trimmedUsername) {
      setUsernameCheckError(t.usernameError);
      return;
    }
  
    if (!/^[a-zA-Z0-9_]{4,20}$/.test(trimmedUsername)) {
      setUsernameCheckError(t.usernameFormatError);
      return;
    }
  
    try {
      // [AI 수정] 하드코딩된 주소를 API_BASE 변수로 교체
      const res = await axios.post(
        `${API_BASE}/auth/check-username`,
        { username: trimmedUsername },
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      if (res.data.available) {
        setIsUsernameAvailable(true);
        setUsernameCheckError('');
      } else {
        setIsUsernameAvailable(false);
        setUsernameCheckError(t.usernameInUse);
      }
    } catch (err) {
      console.error(err);
      setIsUsernameAvailable(false);
      setUsernameCheckError(t.usernameCheckFail);
    }
  };
  
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
    try {
      // [AI 수정] 하드코딩된 주소를 API_BASE 변수로 교체
      await axios.post(`${API_BASE}/auth/signup`, requestBody, {
        headers: { 'Content-Type': 'application/json' },
      });
      const codeToUse =  localStorage.getItem('code');

      if (codeToUse) {
        navigate('/customroom');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('회원가입 실패:', error.response?.data || error.message);
      alert(`${t.signupError} ${JSON.stringify(error.response?.data?.detail || '')}`);
    }
  };

  return (
    <Background bgIndex={2}>
      <div
        style={{
          position: 'absolute', inset: 0, overflowY: 'auto', display: 'flex',
          justifyContent: 'center', alignItems: 'flex-start', padding: '2vh 0', boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '50vw', maxWidth: 552, padding: '1vh 24px', boxSizing: 'border-box', ...FontStyles.body,
          }}
        >
          <div style={{ position: 'relative', height: '6vh', maxHeight: 60, marginBottom: '3vh' }}>
            <img
              src={backIcon} alt="뒤로가기"
              style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '4vh', maxWidth: 40, cursor: 'pointer' }}
              onClick={() => navigate('/signup01')}
            />
            <div style={{ textAlign: 'center', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
              <img src={logo} alt="로고" style={{ height: '5vh', maxHeight: 48 }} />
            </div>
          </div>

          <div style={{ marginBottom: '2.5vh' }}>
            <div style={{ ...FontStyles.title, marginBottom: '1vh', color: Colors.grey07 }}>{t.title1}</div>
            <div style={{ marginBottom: '2vh'}}>
              <div style={{ position: 'relative' }}>
                <InputBoxLarge
                  placeholder={t.usernamePlaceholder}
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setIsUsernameAvailable(null); setUsernameCheckError(''); }}
                  leftIcon={profileIcon}
                  style={{ width: '100%', height: '8vh', minHeight: 48, fontSize: 'clamp(0.875rem, 1vw, 1rem)', paddingRight: lang === 'en' ? 120 : 80 }}
                />
                <button
                  onClick={handleCheckUsername}
                  style={{
                    position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)',
                    pointerEvents: 'auto', zIndex: 2, background: 'none', border: 'none', color: Colors.brandPrimary,
                    fontSize: lang === 'en' ? 'clamp(0.65rem, 0.8vw, 0.8rem)' : 'clamp(0.75rem, 0.9vw, 0.875rem)', padding: 0, cursor: 'pointer',
                  }}
                >
                  {t.checkDuplicate}
                </button>
              </div>
              {usernameCheckError && <div style={messageTextStyle}>{usernameCheckError}</div>}
              {isUsernameAvailable === true && <div style={{ ...messageTextStyle, color: Colors.systemGreen }}>{t.usernameAvailable}</div>}
            </div>

            <div style={{ marginBottom: '2vh' }}>
              <InputBoxLarge
                placeholder={t.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)}
                leftIcon={profileIcon} style={{ width: '100%', height: '8vh', minHeight: 48, fontSize: 'clamp(0.875rem, 1vw, 1rem)' }}
              />
              {emailError && <div style={messageTextStyle}>{emailError}</div>}
            </div>

            <div style={{ marginBottom: '2vh' }}>
              <PasswordCheck
                placeholder={t.passwordPlaceholder} value={password} onChange={(e) => setPassword(e.target.value)}
                leftIcon={lockIcon} rightIconVisible={eyeOnIcon} rightIconHidden={eyeOffIcon} isPassword
                style={{ width: '100%', height: '8vh', minHeight: 48, fontSize: 'clamp(0.875rem, 1vw, 1rem)' }}
              />
            </div>
            <div>
              <PasswordCheck
                placeholder={t.passwordConfirmPlaceholder} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={lockIcon} rightIconVisible={eyeOnIcon} rightIconHidden={eyeOffIcon} isPassword
                style={{ width: '100%', height: '8vh', minHeight: 48, fontSize: 'clamp(0.875rem, 1vw, 1rem)' }}
              />
              {passwordError && <div style={messageTextStyle}>{passwordError}</div>}
            </div>
          </div>

          <div style={{ marginBottom: '2vh' }}>
            <div style={{ ...FontStyles.title, marginBottom: '0.5vh', color: Colors.grey07 }}>{t.birthTitle}</div>
            <div style={{ display: 'flex', gap: '1vw', marginBottom: '4vh', alignItems: 'center' }}>
              <input style={inputStyle} placeholder={t.yearPlaceholder} value={birthYear} onChange={handleBirthInput(setBirthYear, 4, 'year')} />
              <input style={inputStyle} placeholder={t.monthPlaceholder} value={birthMonth} onChange={handleBirthInput(setBirthMonth, 2, 'month')} />
            </div>
            {birthError && <div style={messageTextStyle}>{birthError}</div>}
          </div>

          <div style={{ marginBottom: '2vh' }}>
            <div style={{ ...FontStyles.title, marginBottom: '0.5vh', color: Colors.grey07 }}>{t.genderTitle}</div>
            <div style={{ display: 'flex', gap: '1vw' }}>
              {[t.genderMale, t.genderFemale].map((g) => (
                <div key={g} onClick={() => setGender(g)} style={{ ...(gender === g ? selectedGenderStyle : unselectedGenderStyle), display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, height: 50, ...FontStyles.body, cursor: 'pointer', boxSizing: 'border-box', padding: '0 16px' }}>{g}</div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '0vh' }}>
            <div style={{ ...FontStyles.title, marginBottom: '1vh', color: Colors.grey07 }}>{t.userTypeTitle}</div>
            <div style={{ marginBottom: '2vh' }}>
              <SelectDrop options={t.eduOptions} value={education} onSelect={(option) => { setEducation(option); setMajor(''); }} style={{ width: '100%', height: '8vh', fontSize: 'clamp(0.875rem, 1vw, 1rem)', backgroundColor: grayBackground }} />
            </div>
            {(education === t.eduOptions[2] || education === t.eduOptions[3] || education === t.eduOptions[4]) && (
              <div style={{ marginBottom: '4vh' }}>
                <SelectDrop options={majorOptions} value={major} onSelect={(option) => setMajor(option)} style={{ width: '100%', height: '8vh', minHeight: 48, fontSize: 'clamp(0.875rem, 1vw, 1rem)', backgroundColor: grayBackground }} />
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginBottom: '4vh' }}>
            <PrimaryButton disabled={!isFormValid} onClick={handleSignup} style={{ width: '100%', height: '7.5vh', maxHeight: 64, fontSize: 'clamp(1rem, 1.1vw, 1.125rem)' }}>{t.nextBtn}</PrimaryButton>
          </div>
        </div>
      </div>
    </Background>
  );
}

/**
 * 
 * 1. 상단에 API_BASE 상수를 정의하고 import.meta.env.VITE_API_BASE_URL 환경변수를 적용함.
 * 2. handleCheckUsername 및 handleSignup 함수 내의 axios.post URL을 하드코딩된 주소 대신 ${API_BASE}를 사용하도록 수정함.
 */