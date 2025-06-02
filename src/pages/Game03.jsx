// src/pages/Game03.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout           from '../components/Layout';
import SelectCardToggle from '../components/SelectButton';
import Continue         from '../components/Continue';
import contentBoxFrame  from '../assets/contentBox4.svg';
import { Colors, FontStyles } from '../components/styleConstants';


const CARD_W = 640;   // Card 기본 폭
const CARD_H = 170;   // Card 기본 높이
const BTN_W  = 160;
const BTN_H  =  48;
const CIRCLE =  16;
const BORDER =   2;
const LINE   =   3;


export default function Game03() {
  const nav = useNavigate();

  const [agree, setAgree] = useState(null); 
  const [conf,  setConf]  = useState(0);    // 1~5, 0 = 미선택
  const pct = conf ? ((conf - 1) / 4) * 100 : 0; // 슬라이더 % (1~5 ⇒ 0~100)

  return (
    <Layout subtopic="가정 1" me="3P">
     
      <Card width={936} height={216}>
        <p style={title}>
          Q1) 24시간 개인정보 수집 업데이트에&nbsp;동의하시겠습니까?
        </p>

        <div style={{ display: 'flex', gap: 24 }}>
          <SelectCardToggle
            label="동의"
            selected={agree === 'agree'}
            onClick={() => setAgree('agree')}
            width={220}
            height={56}
          />
          <SelectCardToggle
            label="비동의"
            selected={agree === 'disagree'}
            onClick={() => setAgree('disagree')}
            width={220}
            height={56}
          />
        </div>
      </Card>

      {/* ──────────────── Q2 카드 ──────────────── */}
      <Card width={936} height={216} extraTop={50}>
        <p style={title}>Q2) 당신의 선택에 얼마나 확신이 있나요?</p>

        {/* 슬라이더 영역 */}
        <div style={{ position: 'relative', width: '80%', minWidth: 300 }}>
          
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 0,
              right: 0,
              height: LINE,
              background: Colors.grey03,
            }}
          />
         
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 0,
              width: `${pct}%`,
              height: LINE,
              background: Colors.brandPrimary,
            }}
          />
         
          <div
            style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            {[1, 2, 3, 4, 5].map((n) => {
              const isNow  = conf === n;
              const passed = conf > n;

              return (
                <div key={n} style={{ textAlign: 'center' }}>
                  <div
                    onClick={() => setConf(n)}
                    style={{
                      width: CIRCLE,
                      height: CIRCLE,
                      borderRadius: '50%',
                      background: isNow
                        ? Colors.grey01
                        : passed
                        ? Colors.brandPrimary
                        : Colors.grey03,
                      border: `${BORDER}px solid ${
                        isNow ? Colors.brandPrimary : 'transparent'
                      }`,
                      cursor: 'pointer',
                      margin: '0 auto',
                    }}
                  />
                  <span
                    style={{
                      ...FontStyles.caption,
                      color: Colors.grey06,
                      marginTop: 4,
                      display: 'inline-block',
                    }}
                  >
                    {n}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        </Card>
        {/* 다음 버튼 */}
        <div style={{ marginTop: 15 }}>
        <Continue
  width={264}
  height={72}
  step={1}
  disabled={!agree || conf === 0}
  onClick={() => {
    console.log('선택값:', agree, conf);    
    nav('/game04', {
      state: { agreement: agree, confidence: conf },
    });
  }}
/>

        </div>
      
    </Layout>
  );
}


function Card({
  children,
  extraTop = 0,
  width = CARD_W,
  height = CARD_H,
  style = {},
}) {
  return (
    <div
      style={{
        width,
        height,
        marginTop: extraTop,
        position: 'relative',
        ...style,
      }}
    >
      {/* 배경 프레임 */}
      <img
        src={contentBoxFrame}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'fill' }}
      />
      {/* 내용 레이어 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 24,
          padding: '0 24px',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ─────────────── 공통 텍스트 스타일 ─────────────── */
const title = {
  ...FontStyles.title,
  color: Colors.grey06,
  textAlign: 'center',
};
