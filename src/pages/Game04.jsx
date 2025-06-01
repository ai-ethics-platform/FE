import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Background  from '../components/Background';
import UserProfile from '../components/Userprofile';
import GameFrame   from '../components/GameFrame';
import Continue    from '../components/Continue';

import boxSelected   from '../assets/contentBox5.svg';
import boxUnselected from '../assets/contentBox6.svg';

import profile1 from '../assets/1playerprofile.svg';
import profile2 from '../assets/2playerprofile.svg';
import profile3 from '../assets/3playerprofile.svg';

import { Colors, FontStyles } from '../components/styleConstants';

/* 예시 집계 데이터 (서버/컨텍스트에서 가져오는 영역) */
const agreed    = ['1P', '2P'];
const disagreed = ['3P'];

/* 아바타 매핑 */
const avatarOf = { '1P': profile1, '2P': profile2, '3P': profile3 };

export default function Game04() {
  /* 🔑 여기만 변경: agreement 키로 받기 */
  const { state } = useLocation();
  const myVote = state?.agreement ?? null;     // 'agree' | 'disagree' | null

  const navigate = useNavigate();
  const handleContinue = () => navigate('/game05');

  /* 타이머 (10초 데모) */
  const [secsLeft, setSecsLeft] = useState(10);
  useEffect(() => {
    if (secsLeft <= 0) return;
    const id = setInterval(() => setSecsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secsLeft]);

  const mm = String(Math.floor(secsLeft / 60)).padStart(2, '0');
  const ss = String(secsLeft % 60).padStart(2, '0');
  const timeStr = `${mm}:${ss}`;

  return (
    <Background bgIndex={3}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
        {/* 좌측 프로필 */}
        <div style={{ position: 'absolute', top: 60, left: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <UserProfile player="1P" characterDesc="요양보호사" isLeader />
            <UserProfile player="2P" characterDesc="노모 L" />
            <UserProfile player="3P" characterDesc="자녀J" isMe />
          </div>
        </div>

        {/* 타이틀 */}
        <div style={{ position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)' }}>
          <GameFrame topic="Round 01 : 가정집" hideArrows />
        </div>

        {/* 동의 / 비동의 카드 */}
        <div style={{ position: 'absolute', top: 260, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 48 }}>
          {[
            { label: '동의',   list: agreed,    key: 'agree'    },
            { label: '비동의', list: disagreed, key: 'disagree'},
          ].map(({ label, list, key }) => (
            <div key={key} style={{ position: 'relative', width: 360, height: 391 }}>
              {/* 선택 여부에 따라 프레임 교체 */}
              <img
                src={myVote === key ? boxSelected : boxUnselected}
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill' }}
              />
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <p style={{ ...FontStyles.headlineSmall, color: Colors.grey06 }}>{label}</p>
                <p style={{ ...FontStyles.headlineLarge, color: Colors.grey06, margin: '16px 0' }}>
                  {list.length}명
                </p>
                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  {list.map((id) => (
                    <img key={id} src={avatarOf[id]} alt={id} style={{ width: 48, height: 48 }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 타이머 / Continue */}
      {/* 타이머 / Continue */}
<div style={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
  {secsLeft > 0 ? (
    <> {/* Fragment 하나로 묶기 */}
      <p style={{ ...FontStyles.headlineSmall, color:Colors.grey06 }}>
        선택의 이유를 공유해 주세요.
      </p>

      <div
        style={{
          width: 264,
          height: 72,
          background: Colors.grey04,
          borderRadius: 8,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.6,
          fontSize: 24,
          color: Colors.grey01,
          userSelect: 'none',
          marginTop: 16,
        }}
      >
        {timeStr}
      </div>
    </>
  ) : (
    <Continue onClick={handleContinue} step={1} />
  )}
</div>
      </div>
    </Background>
  );
}
