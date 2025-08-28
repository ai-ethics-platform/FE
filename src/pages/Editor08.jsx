// 합의 선택

import { useState } from 'react';
import CreatorLayout from '../components/Expanded/EditorLayout';
import { useNavigate } from 'react-router-dom';
import create02Image from '../assets/images/Frame159.png';
import { Colors, FontStyles } from '../components/styleConstants';

import contentBoxFrame from '../assets/contentBox4.svg';
import SelectCardToggle from '../components/SelectButton';
import Continue from '../components/Continue2';

const CARD_W = 740;
const CARD_H = 170;

export default function Editor08() {
  const navigate = useNavigate();

  const [title, setTitle] = useState(localStorage.getItem('creatorTitle') || '');
  const [image1, setImage1] = useState(null);
  const [isDefaultImage1, setIsDefaultImage1] = useState(true);
  const [agree, setAgree] = useState(null);

  const STAGE_MAX_WIDTH = 1060;
  const MEDIA_WIDTH = 280;
  const MEDIA_HEIGHT = 200;

  const QUESTION_TEXT =
    '당신은 운전자 K입니다. 자율주행자동차의 정확성을 우선시해야 할까요?';

  // 공통 라벨 스타일 (질문/동의/비동의 모두 동일 톤)
  const labelBoxStyle = {
    padding: '8px 14px',
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.15)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
    ...FontStyles.bodyBold,
    color: Colors.grey07,
    lineHeight: 1.2,
    textAlign: 'center',
    pointerEvents: 'none', 
  };
  const handleContinue=()=> {
    navigate('/editor09');
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
      nextPath="/editor09"
      backPath="/editor07"
      showNext
      showBack
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: STAGE_MAX_WIDTH, boxSizing: 'border-box' }}>
          {/* 이미지 영역 */}
          <div
            style={{
              marginTop: -20,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <div
              style={{
                width: MEDIA_WIDTH,
                height: MEDIA_HEIGHT,
                border: '2px solid #ddd',
                backgroundColor: '#f8f9fa',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <img
                src={isDefaultImage1 ? create02Image : URL.createObjectURL(image1)}
                alt="딜레마 이미지"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onLoad={(e) => {
                  if (!isDefaultImage1 && image1) {
                    URL.revokeObjectURL(e.currentTarget.src);
                  }
                }}
              />
            </div>
          </div>

          {/* 질문 + 선택지 카드 */}
          <Card width={740} height={160} extraTop={10} style={{ marginInline: 'auto' }}>
          {/* 중앙 흰 박스 (질문) */}
            <div style={labelBoxStyle}>{QUESTION_TEXT}</div>

            {/* 동의 / 비동의 */}
            <div style={{ display: 'flex', gap: 24 }}>
              {/* 동의 */}
              <div style={{ position: 'relative', width: 260, height: 45 }}>
                <div
                  style={{
                    ...labelBoxStyle,
                    position: 'absolute',
                    left: '50%',
                    top: 4, // 토글 상단에 살짝 걸치도록
                    transform: 'translateX(-50%)',
                  }}
                >
                  동의
                </div>
                <SelectCardToggle
                  label={''}               // ← 내부 라벨 사용 안 함
                  selected={agree === 'agree'}
                  onClick={() => setAgree('agree')}
                  width={260}
                  height={45}
                />
              </div>

              {/* 비동의 */}
              <div style={{ position: 'relative', width: 260, height: 45 }}>
                <div
                  style={{
                    ...labelBoxStyle,
                    position: 'absolute',
                    left: '50%',
                    top: 4,
                    transform: 'translateX(-50%)',
                  }}
                >
                  비동의
                </div>
                <SelectCardToggle
                  label={''}
                  selected={agree === 'disagree'}
                  onClick={() => setAgree('disagree')}
                  width={260}
                  height={45}
                />
              </div>
            </div>
          </Card>

          {/* 다음 버튼 */}
          <div style={{ marginTop: 17, display: 'flex', justifyContent: 'center' }}>
            <Continue width={230} height={60} onClick={handleContinue} />
          </div>
        </div>
      </div>
    </CreatorLayout>
  );
}

function Card({ children, extraTop = 0, width = CARD_W, height = CARD_H, style = {} }) {
  return (
    <div style={{ width, height, marginTop: extraTop, position: 'relative', ...style }}>
      <img src={contentBoxFrame} alt="" style={{ width: '100%', height: '100%', objectFit: 'fill' }} />
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
