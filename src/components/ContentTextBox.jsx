import React, { useState,useEffect } from 'react';
import contentbox from '../assets/contentBox1.svg';
import paginationLeft from '../assets/paginationleft.svg';
import paginationRight from '../assets/paginationright.svg';
import paginationBothL from '../assets/paginationbothL.svg';
import paginationBothR from '../assets/paginationbothR.svg';
import { Colors, FontStyles } from './styleConstants';
import Continue from './Continue';
import useTypingEffect from '../hooks/useTypingEffect';

export default function ContentTextBox({
  paragraphs = [],
  currentIndex = 0,
  setCurrentIndex = () => {},
  onContinue = () => {},
  continueLabel = "다음",
}) 
 {
  const [typingDone, setTypingDone] = useState(false);
  const currentParagraph = paragraphs[currentIndex] || { main: '', sub: '' };
  const isTextReady = currentParagraph.main && currentParagraph.main.length > 0;

  useEffect(() => {
    setTypingDone(false);
  }, [currentIndex]);
 
  const typedMain = useTypingEffect(
    isTextReady ? currentParagraph.main : '',
    70,
    () => setTypingDone(true)
  );
  const typedSub = typingDone ? currentParagraph.sub : '';

  const handlePrev = () => {
    if (!typingDone) return;
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setTypingDone(false);
    }
  };

  const handleNext = () => {
    if (!typingDone) return;
    if (currentIndex < paragraphs.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTypingDone(false);
    } else {
      onContinue();
    }
  };

  const showLeft = currentIndex > 0;
  const showRight = currentIndex < paragraphs.length - 1;

  return (
   <div style={{ position: 'relative', width: 960, minHeight: 200 }}>
    <img
        src={contentbox}
        alt="frame"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 50,
          left: 32,
          right: 32,
          bottom: 24,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight : 150,
          zIndex: 1,
        }}
      >
        <div>
          <div style={{ ...FontStyles.bodyBold, marginBottom: 3 }}>
            {typedMain.split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </div>
          <div style={{ ...FontStyles.caption, color: Colors.grey04 }}>{typedSub}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            {showLeft && (
              <img
                src={showRight ? paginationBothL : paginationLeft}
                alt="prev"
                style={{
                  marginBottom: 20,
                  height: 24,
                  cursor: typingDone ? 'pointer' : 'default',
                  opacity: typingDone ? 1 : 0.3,
                }}
                onClick={handlePrev}
              />
            )}
            {showRight && (
              <img
                src={showLeft ? paginationBothR : paginationRight}
                alt="next"
                style={{
                  marginBottom: 40,
                  height: 24,
                  cursor: typingDone ? 'pointer' : 'default',
                  opacity: typingDone ? 1 : 0.3,
                }}
                onClick={handleNext}
              />
            )}
          </div>
          {typingDone && currentIndex === paragraphs.length - 1 && (
            <div style={{ marginBottom: 20 }}>
              <Continue width={264} height={72} step={2} onClick={onContinue} label={continueLabel}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
