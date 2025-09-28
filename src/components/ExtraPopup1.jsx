// ExtraPopupModal.jsx
import React, { useMemo } from 'react';
import { Colors, FontStyles } from './styleConstants';
import popup1 from '../assets/popup1.svg';
import popup2 from '../assets/popup2.svg';
import closeIcon from '../assets/close.svg';

export default function ExtraPopupModal({ open, onClose, mode = 1, popupStep }) {
  if (!open) return null;

  const bgImage = mode === 2 ? popup2 : popup1;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const defaultSize = useMemo(() => {
    switch (mode) {
      case 2:
        return { width: 400, height: 150 };
      case 3:
        return { width: 420, height: 200 };
      default:
        return { width: 300, height: 230 };
    }
  }, [mode]);

  const message = useMemo(() => {
    switch (mode) {
      case 1:
        return pick([
          '당신이 이 중 다른 역할이었다면 어떠한 선택을 했을지 이야기해 보세요',
          '놓친 선택에서 얻을 수 있었던 건 무엇일까요?',
        ]);
      case 2:
        return '이 쟁점과 관련되어 있지만 여기에 없는 다른 이해관계자를 지목하고, 그들이 제기할 반대 의견은 무엇일지 논의해 보세요';
      case 4:
        return '이제 당신은 반대 의견을 낸 플레이어의 편에서 30초간 말해 보고 설득할 이유 하나를 덧붙여 보세요';
      default:
        return '';
    }
  }, [mode]);

  // 위치 스타일
  const positionStyles = popupStep === 2
    ? { top: '68%', right: '13%' }
    : { top: '30%', right: 10 };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)', // 화면 어둡게
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        zIndex: 4000,
      }}
      onClick={onClose} // 바깥 클릭 시 닫기
    >
      <div
        style={{
          position: 'absolute',
          ...positionStyles,
          width: defaultSize.width,
          height: defaultSize.height,
        }}
        onClick={(e) => e.stopPropagation()} // 내부 클릭은 닫히지 않음
      >
        {/* 배경 */}
        <img
          src={bgImage}
          alt="popup frame"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
          }}
        />

        {/* 텍스트 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            //padding: '24px 28px',
            padding: 10,
            textAlign:'center',
            whiteSpace: 'pre-line',
            lineHeight: 1.5,
            color: Colors.black,
            ...FontStyles.body,
            fontWeight: 600,
            wordBreak: 'keep-all',
          }}
        >
          {message}
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <img src={closeIcon} alt="닫기" style={{ width: 24, height: 24 }} />
        </button>
      </div>
    </div>
  );
}