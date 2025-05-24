import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function Login() {
  const navigate = useNavigate();

  // 스크롤 제거
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <Background bgIndex={1}>
      <div
        style={{
          minHeight: '100vh', // 정확한 높이 유지
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Pretendard, sans-serif',
          padding: '0 24px', // 모바일 대응
          boxSizing: 'border-box',
          gap: 24,
        }}
      >
        <p style={{ fontSize: 20, fontWeight: 600 }}>
          AI 윤리 시뮬레이션 게임
        </p>

        <Frame1 />

        <InputBoxLarge
          placeholder="아이디(이메일)을 입력해 주세요."
          leftIcon={profileIcon}
        />

        <InputBoxLarge
          placeholder="비밀번호를 입력해 주세요."
          leftIcon={lockIcon}
          rightIconVisible={eyeOnIcon}
          rightIconHidden={eyeOffIcon}
          isPassword={true}
        />

        <PrimaryButton style={{ width: 552, height: 72 }}>
          로그인
        </PrimaryButton>

        <div
          style={{
            display: 'flex',
            gap: 32,
            justifyContent: 'center',
          }}
        >
          <TextButton onClick={() => navigate('/signup01')}>회원가입</TextButton>
          <TextButton>비밀번호 찾기</TextButton>
        </div>

        <SecondaryButton style={{ width: 552, height: 72 }}>
          Guest로 로그인
        </SecondaryButton>
      </div>
    </Background>
  );
}
