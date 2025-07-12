import { useEffect } from 'react';

export default function useScrollRestore() {
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const savedScroll = localStorage.getItem('scrollY');
    if (savedScroll !== null) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScroll, 10));
        }, 150); 
      });
    }

    const handleBeforeUnload = () => {
      localStorage.setItem('scrollY', window.scrollY);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}
