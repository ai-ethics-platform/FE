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

  const agree_label =localStorage.getItem('agree_label');
  const disagree_label =localStorage.getItem('disagree_label');
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
    <div style={{ width: 614, marginInline: 'auto', paddingTop: 8 }}>
        <div
          style={{
            marginLeft: 'auto',
            marginBottom: 16,
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
        <div className="creator-preview-options">
          {[
            { list: agreedList, key: 'agree', icon: agreeIcon },
            { list: disagreedList, key: 'disagree', icon: disagreeIcon },
          ].map(({ list, key, icon }) => (
            <div key={key} style={{ position: 'relative', minHeight: 313, display: 'flex' }}>
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  border: '12px solid transparent',
                  borderImage: `url(${key === selectedMode ? boxSelected : boxUnselect}) 16 fill / 12px / 0 stretch`,
                }}
              />

              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: '100%',
                  padding: '24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <img
                  src={icon}
                  alt=""
                  style={{ width: 160, height: 160, maxWidth: '100%', objectFit: 'contain', flexShrink: 0 }}
                />
                <p style={{ ...FontStyles.headlineSmall, color: Colors.brandPrimary, margin: 0, width: '100%', wordBreak: 'keep-all', overflowWrap: 'anywhere' }}>
                  {key === 'agree' ?  agree_label : disagree_label}
                </p>
                <p style={{ ...FontStyles.headlineLarge, color: Colors.grey06, margin: 'auto 0 0' }}>
                  {list.length}명
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 안내 + 버튼 */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <p style={{ ...FontStyles.headlineSmall, color: Colors.grey05 }}>
            {secsLeft <= 0 ? '마무리하고 다음으로 넘어가 주세요' : '선택의 이유를 자유롭게 공유해주세요'}
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Continue width={230} height={60} onClick={handleContinue} />
          </div>
        </div>
      </div>
    </CreatorLayout>
  );
}
