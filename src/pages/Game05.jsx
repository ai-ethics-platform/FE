import React, { useState, useEffect } from 'react';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import Continue2 from '../components/Continue2';
import SelectCardToggle from '../components/SelectButton';
import contentBoxFrame from '../assets/contentBox4.svg';
import { useNavigate } from 'react-router-dom';
import { Colors, FontStyles } from '../components/styleConstants';
import GameFrame from '../components/GameFrame';

/* ---------- 디자인 파라미터 ---------- */
const CIRCLE_SIZE = 18;
const CIRCLE_BORDER = 3;
const LINE_THICKNESS = 4;
const TRACK_HEIGHT = 70;
/* ------------------------------------ */

export default function Game03() {

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyMargin   = body.style.margin;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.margin   = '0';
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.margin   = prevBodyMargin;
    };
  }, []);
  /* --------------------------------------------------------------- */

  const navigate = useNavigate();
  const [agreement, setAgreement] = useState(null); // 'agree' | 'disagree'
  const [confidence, setConfidence] = useState(0);  // 1~5
  const subtopic = '가정 1';

  const activePercent = confidence === 0 ? 0 : ((confidence - 1) / 4) * 100;

  const handleContinue = () => {
    console.log('동의 여부:', agreement);
    console.log('확신 점수:', confidence);
    navigate('/game06', { state: { agreement, confidence } });
  };

  return (
    <Background bgIndex={3}>
      {/* ───── 최상위 래퍼: 스크롤 차단 & 풀스크린 ───── */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
        {/* 좌측 프로필 */}
        <div style={{ position: 'absolute', top: 60, left: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <UserProfile player="1P" characterDesc="요양보호사" isLeader />
            <UserProfile player="2P" characterDesc="노모 L" />
            <UserProfile player="3P" characterDesc="자녀J" isMe />
          </div>
        </div>

        {/* GameFrame */}
        <div style={{ position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)' }}>
          <GameFrame topic={`Round 01 : ${subtopic}`} hideArrows />
        </div>

        {/* 동의 여부 */}
        <div style={{ position: 'absolute', top: 260, left: '50%', transform: 'translateX(-50%)', width: 936, height: 216 }}>
          <img src={contentBoxFrame} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 32, padding: '0 40px' }}>
            <p style={{ ...FontStyles.title, color: Colors.grey06, textAlign: 'center' }}>
              Q1) 당신은 요양보호사 K입니다. 24시간 개인정보 수집 업데이트에 동의하시겠습니까?
            </p>
            <div style={{ display: 'flex', gap: 20 }}>
              <SelectCardToggle label="동의"   selected={agreement === 'agree'}    onClick={() => setAgreement('agree')}    width={360} height={72} />
              <SelectCardToggle label="비동의" selected={agreement === 'disagree'} onClick={() => setAgreement('disagree')} width={360} height={72} />
            </div>
          </div>
        </div>

        {/* 확신 점수 */}
        <div style={{ position: 'absolute', top: 516, left: '50%', transform: 'translateX(-50%)', width: 936, height: 216 }}>
          <img src={contentBoxFrame} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 36, padding: '0 40px' }}>
            <p style={{ ...FontStyles.title, color: Colors.grey06, textAlign: 'center' }}>
              Q2) 여러분의 선택에 얼마나 확신을 가지고 있나요?
            </p>
            <div style={{ position: 'relative', width: '40%', minWidth: 500, height: TRACK_HEIGHT }}>
              <div style={{ position: 'absolute', top: '25%', left: 0, right: 0, height: LINE_THICKNESS, backgroundColor: Colors.grey03, transform: 'translateY(-50%)' }} />
              <div style={{ position: 'absolute', top: '25%', left: 0, width: `${activePercent}%`, height: LINE_THICKNESS, backgroundColor: Colors.brandPrimary, transition: 'width 0.25s', transform: 'translateY(-50%)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
                {[1, 2, 3, 4, 5].map((num) => {
                  const isCurrent = confidence === num;
                  const isPassed = confidence > num;
                  return (
                    <div key={num} style={{ textAlign: 'center' }}>
                      <div
                        onClick={() => setConfidence(num)}
                        style={{
                          width: CIRCLE_SIZE,
                          height: CIRCLE_SIZE,
                          borderRadius: '50%',
                          backgroundColor: isCurrent ? Colors.grey01 : isPassed ? Colors.brandPrimary : Colors.grey03,
                          border: `${CIRCLE_BORDER}px solid ${isCurrent ? Colors.brandPrimary : 'transparent'}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          margin: '0 auto',
                        }}
                      />
                      <span style={{ display: 'inline-block', marginTop: 8, ...FontStyles.body, color: Colors.grey06 }}>{num}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Continue 버튼 */}
        <div style={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)' }}>
          <Continue2 width={264} height={72} step={1} onClick={handleContinue} disabled={!agreement || confidence === 0} />
        </div>
      </div>
    </Background>
  );
}
