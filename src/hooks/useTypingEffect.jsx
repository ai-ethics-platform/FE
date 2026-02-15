import { useEffect, useState, useLayoutEffect, useRef } from 'react';

export default function useTypingEffect(text = '', speed = 70, onComplete) {
  const [displayedText, setDisplayedText] = useState('');
  const intervalRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  // ✅ 전역 속도 조절 설정
  // 테스트 환경(localhost)일 때는 10ms로 강제 고정, 실제 서비스는 파라미터로 들어온 speed 사용
  const finalSpeed = window.location.hostname === 'localhost' ? 1 : speed;

  // 콜백은 ref로 보관해서 effect가 불필요하게 재시작(리셋)되지 않게 함
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // ✅ 인덱스/문장이 바뀔 때 "그리기 전에" 타이핑 상태를 즉시 리셋해서
  //     잠깐 텍스트가 보였다가 사라지는 플리커(점프)를 방지
  useLayoutEffect(() => {
    // 이전 interval 정리
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // 문장이 바뀌면 즉시 비우기(첫 페인트 전에 반영됨)
    setDisplayedText('');

    if (!text || text.length === 0) return;

    let i = 0;
    intervalRef.current = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        onCompleteRef.current?.();
      }
    }, finalSpeed); // ✅ speed 대신 finalSpeed 적용

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text, finalSpeed]); // ✅ finalSpeed 의존성 추가

  return displayedText;
}