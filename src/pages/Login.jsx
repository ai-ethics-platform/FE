import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Background from '../components/Background';
import Frame1 from '../components/Frame1';
import InputBoxLarge from '../components/InputBoxLarge';
import PrimaryButton from '../components/PrimaryButton';
import TextButton from '../components/TextButton';
import profileIcon from '../assets/login.svg';
import lockIcon from '../assets/password.svg';
import eyeOnIcon from '../assets/eyeon.svg';
import eyeOffIcon from '../assets/eyeoff.svg';
import axios from 'axios';
import axiosInstance from '../api/axiosInstance';
import { Colors, FontStyles } from '../components/styleConstants';
import { clearAllLocalStorageKeys } from '../utils/storage';
import FindIdModal from '../components/FindIdModal';
import FindPasswordModal from '../components/FindPasswordModal';
import Toast from '../components/Toast';

import { translations } from '../utils/language/index';

/**
 * 하드코딩된 주소를 환경변수로 분리
 */
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'https://dilemmai-idl.com';

const LATEST_UPDATE = '2026-08-06';


export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // 언어 설정 상태 관리 (호환성을 위해 두 키값 모두 확인)
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || localStorage.getItem('language') || 'ko');
  const t = translations[lang].Login;

  const [pwVisible, setPwVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showFindId, setShowFindId] = useState(false);
  const [showFindPw, setShowFindPw] = useState(false);
  const [toast, setToast] = useState('');

  // 쿼리에서 code를 상태로 보관(초기값은 로컬스토리지)
  const [inviteCode, setInviteCode] = useState(() => localStorage.getItem('code') || '');

  // 언어 변경 핸들러 (호환성 확보를 위해 이중 키값 저장)
  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLang(selectedLang);
    localStorage.setItem('app_lang', selectedLang);
    localStorage.setItem('language', selectedLang); 
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

  const navigateApprovedUser = () => {
    // 상태값 우선, 없으면 로컬스토리지 fallback
    const codeToUse = inviteCode || localStorage.getItem('code');

    if (codeToUse) {
      // 필요하다면 code를 쿼리로 넘길 수도 있음: `/customroom?code=${encodeURIComponent(codeToUse)}`
      navigate('/customroom', { replace: true });
    } else {
      navigate('/selectroom', { replace: true });
    }
  };

  const checkApplicationAndNavigate = async () => {
    try {
      const response = await axiosInstance.get('/play-applications/me');
      const application = response.data?.application || response.data;

      if (application?.status === 'approved') {
        navigateApprovedUser();
        return;
      }

      if (application?.status === 'pending') {
        navigate('/play-approval/pending', { replace: true });
        return;
      }

      // rejected 또는 알 수 없는 상태는 신청 화면으로 이동
      navigate('/play-approval/apply', { replace: true });
    } catch (error) {
      // 신청 기록이 없는 사용자는 최초 신청 화면으로 이동
      if (error.response?.status === 404) {
        navigate('/play-approval/apply', { replace: true });
        return;
      }

      throw error;
    }
  };

  const handleLogin = async () => {
    // 빈 값이면 서버까지 보내지 않고 무엇이 빠졌는지 바로 알려준다.
    // (예전에는 그대로 요청을 보내 401 응답의 detail JSON 을 alert 로 그대로 뿜었다)
    const id = username.trim();
    const pw = password;
    if (!id && !pw) return setToast(t.emptyBoth);
    if (!id) return setToast(t.emptyId);
    if (!pw) return setToast(t.emptyPw);

    try {
      const form = new URLSearchParams();
      form.append('username', id);
      form.append('password', pw);

      //  하드코딩된 URL을 환경변수 기반 API_BASE로 교체
      const response = await axios.post(`${API_BASE}/auth/login`, form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token, refresh_token } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      await checkApplicationAndNavigate();
    } catch (error) {
      if (!error.response) {
        console.error('로그인 오류:', error.message);
        setToast(t.networkError);
        return;
      }
      const { status, data } = error.response;
      console.error('로그인 실패:', status, data);
      // 401: 아이디/비밀번호 불일치 (BE detail 은 문자열)
      // 422: 요청 형식 검증 실패 (detail 이 배열이라 그대로 노출하면 안 된다)
      if (status === 401) {
        setToast(typeof data?.detail === 'string' ? data.detail : t.wrongCredential);
      } else if (status === 422) {
        setToast(t.invalidInput);
      } else {
        setToast(t.loginFail);
      }
    }
  };

  return (
    <Background bgIndex={1}>
      {/* 드롭박스(Select) 형식의 언어 선택기 
          추후 언어가 추가되면 <option> 태그만 추가.
      */}
      {/* 상단 중앙 배치를 위해 스타일 변경 */}
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

    <div
  style={{
    position: 'fixed',
    right: '20px',
    bottom: '12px',
    fontSize: '12px',
    color: '#ffffff62',
    zIndex: 1000,
    userSelect: 'none',
    pointerEvents: 'none',
  }}
>
  Latest Update : {LATEST_UPDATE}
</div>

      <Toast message={toast} onClose={() => setToast('')} />
    </Background>
  );
}

/**
 *
 * 1. 파일 상단에 API_BASE 상수를 정의하고 import.meta.env.VITE_API_BASE_URL 환경변수를 적용함.
 * 2. handleLogin 함수 내의 axios.post URL을 하드코딩된 주소 대신 ${API_BASE}를 사용하도록 수정함.
 */
