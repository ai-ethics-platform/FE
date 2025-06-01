import React, { useState } from 'react';
import contentbox from '../assets/contentBox1.svg';
import pagnationLeft from '../assets/paginationleft.svg';
import pagnationRight from '../assets/paginationright.svg';
import pagnationBothL from '../assets/pagnationbothL.svg';
import pagnationBothR from '../assets/pagnationbothR.svg';
import { Colors, FontStyles } from './styleConstants';
import Continue from './Continue2';
import useTypingEffect from '../hooks/useTypingEffect';

export default function ContentTextBox2({
  paragraphs = [], 
  onContinue = () => {},
}) {
  const [currentIndex, setCurrentIndex] = useState(0);     
  const [typingDone, setTypingDone] = useState(false);      

  const currentParagraph = paragraphs[currentIndex] || { main: '', sub: '' };

 
  const typedMain = useTypingEffect(currentParagraph.main, 70, () => {
    setTypingDone(true);
  });

  const typedSub = typingDone ? currentParagraph.sub : '';

  /*─────────────────────────── handlers ───────────────────────────*/
  const handlePrev = () => {
    if (!typingDone) return; 
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setTypingDone(false);
    }
  };

  const handleNext = () => {
    if (!typingDone) return;
    if (currentIndex < paragraphs.length - 1) {
      setCurrentIndex((i) => i + 1);
      setTypingDone(false);
    }
  };

  const showLeft = currentIndex > 0;
  const showRight = currentIndex < paragraphs.length - 1;

  return (
    <div style={{ position: 'relative', width: 960, height: 200 }}>
      <img src={contentbox} alt="frame" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', zIndex: 0 }} />

      <div style={{ position: 'absolute', top: 50, left: 32, right: 32, bottom: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 1 }}>
        <div>
          <div style={{ ...FontStyles.title, color: Colors.brandPrimary, marginBottom: 3 }}>
            {typedMain.split('\n').map((line, idx) => (
            <React.Fragment key={idx}>
            {line}
            < br />
            </React.Fragment>
        ))}
          </div>
          <div style={{ ...FontStyles.subtitle, color: Colors.grey06 }}>{typedSub}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            {showLeft && (
              <img
                src={showRight ? pagnationBothL : pagnationLeft}
                alt="prev"
                style={{ marginBottom:20, height: 24, cursor: typingDone ? 'pointer' : 'default', opacity: typingDone ? 1 : 0.3 }}
                onClick={handlePrev}
              />
            )}
            {showRight && (
              <img
                src={showLeft ? pagnationBothR : pagnationRight}
                alt="next"
                style={{marginBottom:20, height: 24, cursor: typingDone ? 'pointer' : 'default', opacity: typingDone ? 1 : 0.3 }}
                onClick={handleNext}
              />
            )}
          </div>

          {typingDone && currentIndex === paragraphs.length - 1 && (
  <div style={{ marginBottom: 20  }}>
    <Continue
      width={264}
      height={72}
      step={1}
      onClick={onContinue}
    />
  </div>
)}

        </div>
      </div>
    </div>
  );
}
