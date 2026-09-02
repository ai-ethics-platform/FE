import React, { useState, useEffect, useRef } from 'react';
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
  const [toastMessage, setToastMessage] = useState('');
  const toastTimerRef = useRef(null);

  // 쿼리에서 code를 상태로 보관(초기값은 로컬스토리지)
  const [inviteCode, setInviteCode] = useState(() => localStorage.getItem('code') || '');

  // 언어 변경 핸들러 (호환성 확보를 위해 이중 키값 저장)
  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLang(selectedLang);
    localStorage.setItem('app_lang', selectedLang);
    localStorage.setItem('language', selectedLang); 
  };

  // 기존 서비스의 하단 알림 방식 유지
  const showToast = (message) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToastMessage(message);

    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage('');
    }, 2500);
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

  // 하단 알림 타이머 정리
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
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

  // 승인된 사용자는 기존 code 흐름에 따라 방 선택 화면으로 이동
  const navigateApprovedUser = () => {
    const codeToUse = inviteCode || localStorage.getItem('code');

    if (codeToUse) {
      navigate('/customroom', { replace: true });
    } else {
      navigate('/selectroom', { replace: true });
    }
  };

  // 로그인 성공 후 현재 사용자의 플레이 승인 상태 확인
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
    try {
      const form = new URLSearchParams();
      form.append('username', username);
      form.append('password', password);

      // 하드코딩된 URL을 환경변수 기반 API_BASE로 교체
      const response = await axios.post(`${API_BASE}/auth/login`, form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token, refresh_token } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      try {
        await checkApplicationAndNavigate();
      } catch (approvalError) {
        console.error(
          '플레이 승인 상태 조회 실패:',
          approvalError.response?.data || approvalError.message
        );
        showToast(t.loginError + ' ' + approvalError.message);
      }
    } catch (error) {
      if (error.response) {
        console.error('로그인 실패:', error.response.data);
        showToast(t.loginFail + ' ' + JSON.stringify(error.response.data.detail, null, 2));
      } else {
        console.error('Error:', error.message);
        showToast(t.loginError + ' ' + error.message);
      }
    }
  };

  return (
    <Background bgIndex={1}>
      <style>
        {`
          @keyframes toast-in {
            from {
              opacity: 0;
              transform: translate(-50%, 8px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
        `}
      </style>

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

          {/* 게스트 로그인 기능은 보존하되 로그인 페이지에서는 노출하지 않음 */}

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

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            left: '50%',
            bottom: '48px',
            transform: 'translateX(-50%)',
            maxWidth: 'min(90vw, 440px)',
            padding: '14px 24px',
            borderRadius: '8px',
            backgroundColor: 'rgba(24, 24, 24, 0.88)',
            color: '#E6ECEF',
            fontFamily: 'Pretendard, sans-serif',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '24px',
            letterSpacing: '-0.025em',
            textAlign: 'center',
            whiteSpace: 'pre-line',
            wordBreak: 'keep-all',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.24)',
            zIndex: 10001,
            pointerEvents: 'none',
            animation: 'toast-in 180ms ease-out',
          }}
        >
          {toastMessage}
        </div>
      )}
    </Background>
  );
}

/**
 *
 * 1. 기존 API_BASE 환경변수 구성을 유지함.
 * 2. 로그인 성공 후 플레이 승인 상태 확인 및 이동 분기를 추가함.
 * 3. 게스트 로그인 UI를 로그인 페이지에서 숨김.
 * 4. 로그인 오류는 기존 방식대로 언어팩과 백엔드 detail을 사용함.
 */
