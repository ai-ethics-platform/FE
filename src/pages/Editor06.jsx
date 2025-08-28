// 개별 선택 공유
import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import CreatorLayout from '../components/Expanded/EditorLayout';
import Continue from '../components/Continue';
import { Colors, FontStyles } from '../components/styleConstants';
import agreeIcon from '../assets/agree.svg';
import disagreeIcon from '../assets/disagree.svg';
import boxSelected from '../assets/contentBox5.svg';
import boxUnselect from '../assets/contentBox6.svg';

export default function Create05() {
  const navigate = useNavigate();

  const [title, setTitle] = useState(localStorage.getItem('creatorTitle') || '');
  const [agreedList, setAgreedList] = useState([]);
  const [disagreedList, setDisagreedList] = useState([]);
  const [selectedMode, setSelectedMode] = useState(() => localStorage.getItem('mode') ?? null);
  const [secsLeft, setSecsLeft] = useState(300);

  //  표지 크기 80%로 축소
  const BOX_W = 360;
  const BOX_H = 391;
  const SCALE = 0.8;
  const SCALED_W = Math.round(BOX_W * SCALE);   // 288
  const SCALED_H = Math.round(BOX_H * SCALE);   // 313
  const GAP = Math.round(48 * SCALE);           // 간격도 살짝 축소 (옵션)

  useEffect(() => {
    if (secsLeft <= 0) return;
    const timer = setInterval(() => setSecsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secsLeft]);

  const timeStr =
    `${String(Math.floor(secsLeft / 60)).padStart(2, '0')}:${String(secsLeft % 60).padStart(2, '0')}`;
  
  const handleContinue=()=> {
      navigate('/editor07');
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
      nextPath="/editor07"
      backPath="/editor05"
      showNext
      showBack
    >
    <div style={{ position: 'relative', paddingTop: 8 }}>
        {/* 타이머: 오른쪽 위 absolute */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: 0,
            width: 100,
            minHeight: 40,
            ...FontStyles.headlineNormal,
            color: secsLeft <= 10 && secsLeft > 0 ? Colors.systemRed : Colors.grey04,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 8,
            padding: '6px 8px',
          }}
        >
          {timeStr}
        </div>

        {/* 동의 / 비동의 표지들 */}
        <div style={{ marginTop: -20, display: 'flex', gap: GAP, justifyContent: 'center' }}>
          {[
            { list: agreedList, key: 'agree', icon: agreeIcon },
            { list: disagreedList, key: 'disagree', icon: disagreeIcon },
          ].map(({ list, key, icon }) => (
            <div key={key} style={{ position: 'relative', width: SCALED_W, height: SCALED_H }}>
              <img
                src={key === selectedMode ? boxSelected : boxUnselect}
                alt={`${key} 표지`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'fill',
                }}
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
                <img
                  src={icon}
                  alt=""
                  style={{ width: 160, height: 160, marginTop: 40, marginBottom: -10 }}
                />
                <p style={{ ...FontStyles.headlineSmall, color: Colors.brandPrimary }}>
                  {key === 'agree' ? '동의' : '비동의'}
                </p>
                <p style={{ ...FontStyles.headlineLarge, color: Colors.grey06, marginTop: -10 }}>
                  {list.length}명
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 안내 + 버튼 */}
        <div style={{ textAlign: 'center', marginTop: 0 }}>
          <p style={{ ...FontStyles.headlineSmall, color: Colors.grey05 }}>
            {secsLeft <= 0 ? '마무리하고 다음으로 넘어가 주세요' : '선택의 이유를 자유롭게 공유해주세요'}
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: -10,
            }}
          >
            <Continue width={230} height={60} onClick={handleContinue} />
          </div>
        </div>
      </div>
    </CreatorLayout>
  );
}
