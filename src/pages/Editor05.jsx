// 개별 확신도
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CreatorLayout from '../components/Expanded/EditorLayout';
import Continue from '../components/Continue';
import { Colors, FontStyles } from '../components/styleConstants';
import contentBoxFrame from '../assets/contentBox4.svg';

export default function Create05() {
  const navigate = useNavigate();

  const [title, setTitle] = useState(localStorage.getItem('creatorTitle') || '');
  const [step, setStep] = useState(1);
  const [agree, setAgree] = useState(null);
  const [conf, setConf] = useState(0);
  const [isWaiting, setWaiting] = useState(false);

  // Card 내부 UI 상수
  const CARD_W = 640;
  const CARD_H = 170;
  const CIRCLE = 16;
  const BORDER = 2;
  const LINE = 3;

  const pct = conf ? ((conf - 1) / 4) * 100 : 0;

  const handleContinue=()=> {
    navigate('/editor06');
   }
  return (
    <CreatorLayout
      headerbar={2}
      headerLeftType="home"
      headerNextDisabled={true}
      frameProps={{
        value: title,
        onChange: (val) => setTitle(val),
        onConfirm: (val) => {
          setTitle(val);
          localStorage.setItem('creatorTitle', val);
        },
      }}
      nextPath="/editor06"
      backPath="/editor04"
      showNext
      showBack
    >
    <Card width={740} height={200} extraTop={10} style={{ marginInline: 'auto' }}>
        <p style={{...FontStyles.body, marginBottom: 5}}>당신의 선택에 얼마나 확신을 가지고 있나요?</p>

        <div style={{ position: 'relative', width: '100%', maxWidth: 480, minWidth: 0 }}>
          {/* 회색 베이스 라인 */}
          <div
            style={{
              position: 'absolute',
              top: 22,
              left: 22,
              right: 22,
              height: LINE,
              background: Colors.grey03,
              zIndex: 0, // 가장 아래
            }}
          />

          {/* 진행(채움) 라인 */}
          <div
            style={{
              position: 'absolute',
              top: 22,
              left: 22,
              width: `calc((100% - 44px) * ${pct / 100})`,
              height: LINE,
              background: Colors.brandPrimary,
              zIndex: 1, // 중간
            }}
          />

          {/* 1~5 점 선택 점들 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {[1, 2, 3, 4, 5].map((n) => {
              const isFilled = n <= conf;
              return (
                <button key={n} type="button" aria-label={`확신도 ${n}점`} aria-pressed={conf === n} onClick={() => setConf(n)} style={{ textAlign: 'center', width: 44, padding: 0, border: 0, background: 'transparent', cursor: 'pointer', flexShrink: 0 }}>
                  <div
                    style={{
                      width: CIRCLE,
                      height: CIRCLE,
                      borderRadius: '50%',
                      background: isFilled ? Colors.brandPrimary : Colors.grey03,
                      cursor: 'pointer',
                      margin: '16px auto 8px',
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
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <div style={{ marginTop: 60, display: 'flex', justifyContent: 'center' }}>
        <Continue width={230} height={60} step={2} onClick={handleContinue} />
      </div>
    </CreatorLayout>
  );
}

function Card({ children, extraTop = 0, width = CARD_W, height = CARD_H, style = {} }) {
  return (
    <div style={{ width, height, marginTop: extraTop, position: 'relative', ...style }}>
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
          padding: '0 12px',
        }}
      >
        {children}
      </div>
    </div>
  );
}
