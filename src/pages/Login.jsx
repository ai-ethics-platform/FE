// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
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
  const [pwVisible, setPwVisible] = useState(false);

  useEffect(() => {
    // 화면 스크롤 방지 (필요하다면)
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <Background bgIndex={1}>
      {/* 전체 화면을 덮는 컨테이너 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* 로그인 폼 래퍼: 폭은 화면 너비의 50% or 최대 500px */}
        <div
          style={{
            width: '50vw',
            maxWidth: 500,
            padding: '2vh 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2vh',
            boxSizing: 'border-box',
          }}
        >
          {/* 1) 상단 텍스트 */}
          <p
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
              margin: 0,
              fontWeight: 600,
              color: Colors.grey09,
            }}
          >
            AI 윤리 시뮬레이션 게임
          </p>

          {/* 2) 프레임 로고 */}
          <div
            style={{
              width: '100%',       // 래퍼(≤500px)의 100%
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {/* Frame1 자체 너비는 래퍼 폭의 80% → 최대 400px */}
            <div
              style={{
                width: '80%',
                maxWidth: 400,
                /* 아래쪽 간격은 gap이나 marginBottom으로 충분함 */
              }}
            >
              <Frame1 style={{ width: '100%' }} />
            </div>
          </div>

          {/* 3) 아이디 입력 */}
          <InputBoxLarge
            placeholder="아이디(이메일)을 입력해 주세요."
            leftIcon={profileIcon}
            bgColor={Colors.componentBackgroundFloat}
            style={{
              width: '100%',
              height: '8vh',
              maxHeight: 60,
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              
            }}
          />
          {/* 4) 비밀번호 입력 */}
          <InputBoxLarge
            placeholder="비밀번호를 입력해 주세요."
            leftIcon={lockIcon}
            rightIconVisible={eyeOnIcon}
            rightIconHidden={eyeOffIcon}
            isPassword={!pwVisible}
            onClickRightIcon={() => setPwVisible((v) => !v)}
            bgColor={Colors.componentBackgroundFloat}
            style={{
              width: '100%',
              height: '8vh',
              maxHeight: 60,
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
            
            }}
          />

          {/* 5) 로그인 버튼 */}
          <PrimaryButton
            style={{
              width: '100%',
              height: '8vh',
              maxHeight: 64,
              fontSize: 'clamp(1rem, 2vw, 1.125rem)',
              marginTop: '2vh',
            }}
            onClick={() => {
              // TODO: 로그인 처리
            }}
          >
            로그인
          </PrimaryButton>

          {/* 6) 회원가입 / 비밀번호 찾기 링크 */}
          <div
            style={{
              display: 'flex',
              gap: '4vw',
              justifyContent: 'center',
              marginTop: '1.5vh',
            }}
          >
            <TextButton onClick={() => navigate('/signup01')}>
              회원가입
            </TextButton>
            <TextButton onClick={() => { /* TODO */ }}>
              비밀번호 찾기
            </TextButton>
          </div>

          {/* 7) Guest 로그인 */}
          <SecondaryButton
            style={{
              width: '100%',
              height: '8vh',
              maxHeight: 64,
              fontSize: 'clamp(1rem, 2vw, 1.125rem)',
              marginTop: '2vh',
            }}
            onClick={() => {
              // TODO: Guest 로그인
            }}
          >
            Guest로 로그인
          </SecondaryButton>
        </div>
      </div>
    </Background>
  );
}
