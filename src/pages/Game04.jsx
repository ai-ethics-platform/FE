import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Layout      from '../components/Layout';      
import Continue    from '../components/Continue';
import boxSelected from '../assets/contentBox5.svg';
import boxUnselect from '../assets/contentBox6.svg';
import profile1    from '../assets/1playerprofile.svg';
import profile2    from '../assets/2playerprofile.svg';
import profile3    from '../assets/3playerprofile.svg';
import { Colors, FontStyles } from '../components/styleConstants';

const agreed    = ['1P', '2P'];
const disagreed = ['3P'];
const avatarOf  = { '1P': profile1, '2P': profile2, '3P': profile3 };

export default function Game04() {
  const { state } = useLocation();
  const nav = useNavigate();

  const myVote = state?.agreement ?? null;
  const subtopic = localStorage.getItem('subtopic') ?? '가정 1';

  const [round, setRound] = useState(1);
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const calculatedRound = completed.length + 1;
    setRound(calculatedRound);
    localStorage.setItem('currentRound', calculatedRound.toString());
  }, []);

  // 타이머 관련
  const [secsLeft, setSecsLeft] = useState(10);
  useEffect(() => {
    if (secsLeft <= 0) return;
    const id = setInterval(() => setSecsLeft(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [secsLeft]);

  const timeStr = `${String(Math.floor(secsLeft / 60)).padStart(2, '0')
                 }:${String(secsLeft % 60).padStart(2, '0')}`;

  const handleContinue = () => nav('/game05');

  return (
    <Layout subtopic={subtopic} round={round} me="3P">
      <div style={{ display: 'flex', gap: 48 }}>
        {[{ label: '동의', list: agreed, key: 'agree' },
          { label: '비동의', list: disagreed, key: 'disagree' }]
          .map(({ label, list, key }) => (
            <div key={key} style={{ position: 'relative', width: 360, height: 391 }}>
              <img
                src={myVote === key ? boxSelected : boxUnselect}
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill' }}
              />
              <div style={{
                position: 'relative', zIndex: 1, height: '100%',
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', textAlign: 'center',
              }}>
                <p style={{ ...FontStyles.headlineSmall, color: Colors.grey06 }}>{label}</p>
                <p style={{ ...FontStyles.headlineLarge, color: Colors.grey06, margin: '16px 0' }}>
                  {list.length}명
                </p>
                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  {list.map(id => (
                    <img key={id} src={avatarOf[id]} alt={id} style={{ width: 48, height: 48 }} />
                  ))}
                </div>
              </div>
            </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 26 }}>
        {secsLeft > 0 ? (
          <>
            <p style={{ ...FontStyles.headlineSmall, color: Colors.grey06 }}>
              선택의 이유를 공유해 주세요.
            </p>
            <div style={{
              width: 264, height: 72, margin: '16px auto 0',
              background: Colors.grey04, borderRadius: 8, opacity: 0.6,
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              fontSize: 24, color: Colors.grey01, userSelect: 'none',
            }}>
              {timeStr}
            </div>
          </>
        ) : (
          <Continue width={264} height={72} step={1} onClick={handleContinue} />
        )}
      </div>
    </Layout>
  );
}
