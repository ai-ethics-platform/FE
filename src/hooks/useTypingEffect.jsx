import { useState, useEffect, useRef } from 'react';

export default function useTypingEffect(text = '', speed = 80, onComplete) {
  const [displayedText, setDisplayedText] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!text || text.length === 0) return;

    let i = 0;
    setDisplayedText('');

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1)); 
        i++;
      } else {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        onComplete?.();
      }
    }, speed);

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [text, speed]);

  return displayedText;
}
