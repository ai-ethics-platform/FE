import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import SelectCardToggle from '../components/SelectButton';
import Continue from '../components/Continue';
import contentBoxFrame from '../assets/contentBox4.svg';
import { Colors, FontStyles } from '../components/styleConstants';

import { getDilemmaImages } from '../components/dilemmaImageLoader';

const CARD_W = 640;
const CARD_H = 170;
const BTN_W = 160;
const BTN_H = 48;
const CIRCLE = 16;
const BORDER = 2;
const LINE = 3;

export default function Game03() {
  const nav = useNavigate();

  const category = localStorage.getItem('category') ?? '안드로이드';
  const subtopic = localStorage.getItem('subtopic') ?? '가정 1';
  const mode = localStorage.getItem('mode') ?? 'neutral';

  const selectedIndex = Number(localStorage.getItem('selectedCharacterIndex') ?? 0);

  const comicImages = getDilemmaImages(category, subtopic, mode, selectedIndex);

  const [step, setStep] = useState(1);           
  const [agree, setAgree] = useState(null);      
  const [conf, setConf] = useState(0);           
  const pct = conf ? ((conf - 1) / 4) * 100 : 0;  
  const [round, setRound] = useState(1);

  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const calculatedRound = completed.length + 1;
    setRound(calculatedRound);
    localStorage.setItem('currentRound', calculatedRound.toString()); 
  }, []);

  return (
    <Layout subtopic={subtopic} round = {round} me="3P">
      {step === 1 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            {comicImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`설명 이미지 ${idx + 1}`}
                style={{ width: 230, height: 135.38, objectFit: 'contain' }}
              />
            ))}
          </div>

          <Card width={936} height={216} extraTop={60}>
            <p style={title}>
              Q1) 당신은 요양보호사 K입니다. 24시간 개인정보 수집 업데이트에&nbsp;동의하시겠습니까?
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

          <div style={{ marginTop: 40 }}>
            <Continue
              width={264}
              height={72}
              step={1}
              disabled={!agree}
              onClick={() => setStep(2)}
            />
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <Card width={936} height={216} extraTop={150}>
            <p style={title}>Q2) 당신의 선택에 얼마나 확신이 있나요?</p>
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
                  const isNow = conf === n;
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

          <div style={{ marginTop: 80 }}>
            <Continue
              width={264}
              height={72}
              step={2}
              disabled={conf === 0}
              onClick={() =>
                nav('/game04', {
                  state: { agreement: agree, confidence: conf },
                })
              }
            />
          </div>
        </>
      )}
    </Layout>
  );
}

function Card({ children, extraTop = 0, width = CARD_W, height = CARD_H, style = {} }) {
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
      <img
        src={contentBoxFrame}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'fill' }}
      />
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

const title = {
  ...FontStyles.title,
  color: Colors.grey06,
  textAlign: 'center',
};
