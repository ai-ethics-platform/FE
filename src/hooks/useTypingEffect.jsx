// import { useState, useEffect, useRef } from 'react';

// export default function useTypingEffect(text = '', speed = 50, onComplete) {
//   const [displayedText, setDisplayedText] = useState('');
//   const intervalRef = useRef(null);

//   useEffect(() => {
//     if (!text) return;

//     setDisplayedText('');
//     let i = 0;

//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//     }

//     intervalRef.current = setInterval(() => {
//       if (i < text.length) {
//         setDisplayedText((prev) => prev + text.charAt(i));
//         i++;
//       } else {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//         onComplete?.();
//       }
//     }, speed);

//     return () => {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     };
//   }, [text]);

//   return displayedText;
// }
import { useState, useEffect, useRef } from 'react';

export default function useTypingEffect(text = '', speed = 50, onComplete) {
  const [displayedText, setDisplayedText] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    // ❗️ text가 준비되지 않았을 경우 대기
    if (!text || text.length === 0) return;

    let i = 0;
    setDisplayedText('');

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1)); // 안정적으로 잘라냄
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
