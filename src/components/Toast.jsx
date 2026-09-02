import React, { useEffect } from 'react';
import { Colors, FontStyles } from './styleConstants';

/**
 * 화면 하단에 잠깐 떴다 사라지는 공용 토스트.
 * 브라우저 기본 alert() 대신 사용한다.
 *
 *   const [toast, setToast] = useState('');
 *   ...
 *   <Toast message={toast} onClose={() => setToast('')} />
 *
 * message 가 빈 값이면 아무것도 렌더하지 않는다.
 * 같은 메시지를 연속으로 띄우려면 setToast('') 후 다시 넣거나 key 를 바꿔준다.
 */
export default function Toast({ message, duration = 2600, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <>
      {/* aria-live 영역 안에 넣으면 스타일 텍스트까지 읽히므로 밖에 둔다. */}
      <style>{`@keyframes toast-in {
        from { opacity: 0; transform: translate(-50%, 8px); }
        to   { opacity: 1; transform: translate(-50%, 0); }
      }`}</style>

      <div
        role="status"
        aria-live="polite"
        style={{
          position: 'fixed',
          left: '50%',
          bottom: 48,
          transform: 'translateX(-50%)',
          maxWidth: 'min(90vw, 440px)',
          padding: '14px 24px',
          borderRadius: 8,
          backgroundColor: 'rgba(24, 24, 24, 0.88)',
          color: Colors.grey01,
          ...FontStyles.body,
          textAlign: 'center',
          // 메시지에 '\n' 을 넣어 줄을 나눌 수 있게 한다.
          whiteSpace: 'pre-line',
          wordBreak: 'keep-all',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.24)',
          // 모달(zIndex 9999~10000) 위에서도 보이도록
          zIndex: 10001,
          pointerEvents: 'none',
          animation: 'toast-in 180ms ease-out',
        }}
      >
        {message}
      </div>
    </>
  );
}
