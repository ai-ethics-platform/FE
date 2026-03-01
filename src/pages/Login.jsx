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
import { clearAllLocalStorageKeys } from '../utils/storage';
import FindIdModal from '../components/FindIdModal';
import FindPasswordModal from '../components/FindPasswordModal';
import { translations } from '../utils/language/index';

/**
 *  하드코딩된 주소를 환경변수로 분리
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://dilemmai-idl.com';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // 언어 설정 상태 관리 (초기값은 로컬스토리지 혹은 'ko')
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'ko');
  const t = translations[lang].Login;

  const [pwVisible, setPwVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showGuestLogin, setShowGuestLogin] = useState(false);
  const [showFindId, setShowFindId] = useState(false);
  const [showFindPw, setShowFindPw] = useState(false);

  // 쿼리에서 code를 상태로 보관(초기값은 로컬스토리지)
  const [inviteCode, setInviteCode] = useState(() => localStorage.getItem('code') || '');

  // 언어 변경 핸들러 (드롭다운 선택 시 호출)
  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLang(selectedLang);
    localStorage.setItem('app_lang', selectedLang);
  };

  // 로그인 처음 들어갈 때 로컬값 초기화
  useEffect(() => {
    clearAllLocalStorageKeys();
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
    try {
      const form = new URLSearchParams();
      form.append('username', username);
      form.append('password', password);

      //  하드코딩된 URL을 환경변수 기반 API_BASE로 교체
      const response = await axios.post(`${API_BASE}/auth/login`, form, {
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
        alert(t.loginFail + ' ' + JSON.stringify(error.response.data.detail, null, 2));
      } else {
        console.error('Error:', error.message);
        alert(t.loginError + ' ' + error.message);
      }
    }
  };

  return (
    <Background bgIndex={1}>
      {/* 드롭박스(Select) 형식의 언어 선택기 
          추후 언어가 추가되면 <option> 태그만 추가.
      */}
      {/*  상단 중앙 배치를 위해 스타일 변경 */}
      <div style={{ position: 'absolute', top: '20px', left: '93%', transform: 'translateX(-50%)', zIndex: 1000 }}>
        <select
          value={lang}
          onChange={handleLanguageChange}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #CBD5E1',
            backgroundColor: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            outline: 'none',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0)',
            ...FontStyles.body
          }}
        >
          <option value="ko">한국어 (KR)</option>
          <option value="en">English (US)</option>
          {/* 추후 추가될 언어 예시: <option value="jp">日本語 (JP)</option> */}
        </select>
      </div>

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
            {t.title}
          </p>

          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 552, maxHeight: 200 }}>
              <Frame1 style={{ width: '100%', display: 'block', margin: '0 auto' }} />
            </div>
          </div>

          <InputBoxLarge
            placeholder={t.idPlaceholder}
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
            placeholder={t.pwPlaceholder}
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
            {t.loginBtn}
          </PrimaryButton>

          <div
            style={{
              display: 'flex',
              gap: '4vw',
              justifyContent: 'center',
              marginTop: '1.5vh',
            }}
          >
            <TextButton onClick={() => navigate('/signup01')}>{t.signUp}</TextButton>
            <TextButton onClick={() => setShowFindId(true)}>{t.findId}</TextButton>
            {/* <TextButton onClick={() => setShowFindPw(true)}>Find Password</TextButton> */}
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
            disabled={false}
          >
            {t.guestLogin}
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

          {showFindId && (
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
              onClick={() => setShowFindId(false)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <FindIdModal onClose={() => setShowFindId(false)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Background>
  );
}

/**
 *
 * 1. 파일 상단에 API_BASE 상수를 정의하고 import.meta.env.VITE_API_BASE_URL 환경변수를 적용함.
 * 2. handleLogin 함수 내의 axios.post URL을 하드코딩된 주소 대신 ${API_BASE}를 사용하도록 수정함.
 */