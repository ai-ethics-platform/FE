
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

import { Colors, FontStyles } from '../components/styleConstants';

export default function Login() {
  const navigate = useNavigate();

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
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
          boxSizing: 'border-box',
          gap: 24,
          fontFamily: FontStyles.body.fontFamily,
        }}
      >
        {/* 제목 */}
         <p style={{ fontSize: 20, marginBottom: 0,fontWeight: 600 }}>
          AI 윤리 시뮬레이션 게임
        </p>



        {/* 로고 프레임 */}
        <Frame1 style={{ marginTop: 0 }} />

        {/* 아이디 입력 */}
        <InputBoxLarge
          placeholder="아이디(이메일)을 입력해 주세요."
          leftIcon={profileIcon}
          bgColor={Colors.componentBackgroundFloat}
        />

        {/* 비밀번호 입력 */}
        <InputBoxLarge
          placeholder="비밀번호를 입력해 주세요."
          leftIcon={lockIcon}
          rightIconVisible={eyeOnIcon}
          rightIconHidden={eyeOffIcon}
          isPassword={true}
          bgColor={Colors.componentBackgroundFloat}
        />

        {/* 로그인 버튼 */}
        <PrimaryButton style={{ width: 580, height: 72 }}>
          로그인
        </PrimaryButton>

        {/* 링크 버튼들 */}
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

        {/* 게스트 로그인 */}
        <SecondaryButton style={{ width: 580, height: 72 }}>
          Guest로 로그인
        </SecondaryButton>
      </div>
    </Background>
  );
}
