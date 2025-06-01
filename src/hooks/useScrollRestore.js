import { useEffect } from 'react';

export default function useScrollRestore() {
  useEffect(() => {
    // 브라우저 기본 동작 비활성화
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 저장된 위치로 스크롤 복원 (딜레이 줘야 제대로 작동)
    const savedScroll = localStorage.getItem('scrollY');
    if (savedScroll !== null) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScroll, 10));
        }, 150); // 콘텐츠 렌더링 후 시점 고려
      });
    }

    // 새로고침 시 저장
    const handleBeforeUnload = () => {
      localStorage.setItem('scrollY', window.scrollY);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}
