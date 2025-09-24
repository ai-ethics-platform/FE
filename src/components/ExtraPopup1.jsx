import React, { useMemo } from 'react';
import { Colors, FontStyles } from './styleConstants';
import popup1 from '../assets/popup1.svg';
import popup2 from '../assets/popup2.svg';

export default function ExtraPopup({ mode = 1, width, height }) {
  const bgImage = mode === 2 ? popup2 : popup1;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // mode별 기본 크기 지정
  const defaultSize = useMemo(() => {
    if (mode === 2) {
      return { width: 480, height: 200 };
    }
    return { width: 360, height: 264 };
  }, [mode]);

  const finalWidth = width ?? defaultSize.width;
  const finalHeight = height ?? defaultSize.height;

  const message = useMemo(() => {
    switch (mode) {
      case 1: {
        const pool = [
          '당신이 이 중 다른 역할이었다면 어떠한 선택을 했을지 이야기해 보세요',
          '놓친 선택에서 얻을 수 있었던 건 무엇일까요?',
        ];
        return pick(pool);
      }
      case 2:
        return '이 쟁점과 관련되어 있지만 여기에 없는 다른 이해관계자를 지목하고, 그들이 제기할 반대 의견은 무엇일지 논의해 보세요';
      case 3: {
        const prefix = '[MISSION 카드의 내용을 다른 플레이어와 공유하고 미션을 수행하세요]';
        const pool = [
          '서로 의견이 다른 이유는 어떤 가치 차이 때문일까요?',
          '상대의 반대 의견을 참고해서 내 생각을 보완해 보세요.',
          '상대 주장에서 내가 지금 바로 인정할 수 있는 점 한 가지는 무엇인가요?',
        ];
        return `${prefix}\n\n${pick(pool)}`;
      }
      case 4:
        return '이제 당신은 반대 의견을 낸 플레이어의 편에서 30초간 말해 보고 설득할 이유 하나를 덧붙여 보세요';
      default:
        return '';
    }
  }, [mode]);

  return (
    <div
      style={{
        position: 'relative',
        width: finalWidth,
        height: finalHeight,
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {/* 배경 프레임 */}
      <img
        src={bgImage}
        alt="popup frame"
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
          display: 'block',
        }}
      />

      {/* 텍스트 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 28px',
          textAlign: 'left',
          whiteSpace: 'pre-line',
          lineHeight: 1.5,
          color: Colors?.black ?? '#111',
          ...FontStyles?.body,
          fontSize: FontStyles?.body?.fontSize ?? 18,
          fontWeight: 600,
          wordBreak: 'keep-all',
        }}
      >
        {message}
      </div>
    </div>
  );
}