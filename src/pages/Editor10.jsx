// 최종 멘트 (엔딩 화면) 
import { useState } from 'react';
import CreatorLayout from '../components/Expanded/EditorLayout';
import { useNavigate } from 'react-router-dom';
import { Colors, FontStyles } from '../components/styleConstants';
import endingFrame from '../assets/creatorendingbox.svg';
import Continue3 from '../components/Continue3';
import DilemmaDonePopUp from '../components/Expanded/DilemmaDonePopUp';

export default function Editor10() {
  const navigate = useNavigate();

  const [title, setTitle] = useState(localStorage.getItem('creatorTitle') || '');
  const [endingText] = useState(
    localStorage.getItem('endingText') ||
      '우리 가족은 최종적으로 개인정보 제공에 동의하였고, 사생활 관련한 약간의 불편함을 감수하며...'
  );

  const [isDoneOpen, setIsDoneOpen] = useState(false); 

  const STAGE_MAX_WIDTH = 1060;
  const FRAME_W = 700;
  const FRAME_H = 320;

  const handleFirst = () => {
    navigate('/editor01');
  };

  const handleCompleted = () => {
    navigate('/creatorending');
  };

  // 흰 텍스트 박스 스타일
  const labelBoxStyle = {
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.15)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
    ...FontStyles.bodyBold,
    color: Colors.grey07,
    lineHeight: 1.6,
    textAlign: 'left',
    whiteSpace: 'pre-wrap',
  };

  return (
    <>
      <CreatorLayout
        headerbar={2}
        headerLeftType="home"
        headerNextDisabled={false}
        onHeaderNextClick={() => setIsDoneOpen(true)}  
        frameProps={{
          value: title,
          onChange: (val) => setTitle(val),
          onConfirm: (val) => {
            setTitle(val);
            localStorage.setItem('creatorTitle', val);
          },
        }}
        backPath="/editor09"
        showBack
      >
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: STAGE_MAX_WIDTH, boxSizing: 'border-box' }}>
            <div
              style={{
                margin: '3px auto 0',
                width: FRAME_W,
                height: FRAME_H,
                position: 'relative',
              }}
            >
              {/* 프레임(장식) */}
              <img
                src={endingFrame}
                alt=""
                draggable={false}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'fill',
                  pointerEvents: 'none',
                }}
              />

              {/* 중앙 흰 박스(짧은 직사각형) */}
              <div
                style={{
                  position: 'absolute',
                  left: 80,
                  right: 70,
                  top: '50%',
                  height: 70,                 
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ ...labelBoxStyle, width: '100%', height: '100%' }}>{endingText}</div>
              </div>
            </div>

            <div style={{ marginTop: 17, display: 'flex', justifyContent: 'center' }}>
              <Continue3
                label={'처음부터 다시 보기'}
                width={230}
                height={60}
                onClick={handleFirst}
              />
            </div>
          </div>
        </div>
      </CreatorLayout>

      {/* 팝업 오버레이 */}
      {isDoneOpen && (
        <div
          onClick={() => setIsDoneOpen(false)} 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* 팝업 내용 영역 클릭은 전파 중단 */}
          <div onClick={(e) => e.stopPropagation()}>
            {/* DilemmaDonePopUp이 제공하는 API에 맞춰 onClose/onConfirm 등 연결 */}
            <DilemmaDonePopUp
              onClose={() => setIsDoneOpen(false)}
              onConfirm={() => {
                // 팝업 닫고 다음 화면으로 이동
                setIsDoneOpen(false);
                handleCompleted(); 
              }} />
          </div>
        </div>
      )}
    </>
  );
}
