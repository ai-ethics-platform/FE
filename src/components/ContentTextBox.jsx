import React, { useState, useEffect } from 'react';
import contentbox from '../assets/contentBox1.svg';
import paginationLeft from '../assets/paginationleft.svg';
import paginationRight from '../assets/paginationright.svg';
import paginationBothL from '../assets/paginationBothL.svg';
import paginationBothR from '../assets/paginationBothR.svg';
import { Colors, FontStyles } from './styleConstants';
import Continue from './Continue';
import useTypingEffect from '../hooks/useTypingEffect';
import Next2 from './Next2'; // ⬅️ 새로 추가

export default function ContentTextBox({
  paragraphs = [],
  currentIndex = 0,
  setCurrentIndex = () => {},
  onContinue ,
  disabled = false,
  continueLabel = '다음',
}) {
  const [typingDone, setTypingDone] = useState(false);
  const currentParagraph = paragraphs[currentIndex] || { main: '', sub: '' };
  const isTextReady = currentParagraph.main && currentParagraph.main.length > 0;

  useEffect(() => {
    setTypingDone(false);
  }, [currentIndex]);
  // disabled 상태의 스타일
  const containerOpacity = disabled ? 0.5 : 1;
  const interactionEnabled = !disabled && typingDone;

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
          // width: '100%',
          // height: '100%',
          objectFit: 'contain',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 30,
          left: 32,
          right: 32,
          bottom: 24,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 150,
          zIndex: 1,
        }}
      >
        <div>
          <div style={{ ...FontStyles.headlineSmall, marginBottom: 3 }}>
            {typedMain.split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </div>
          <div style={{ ...FontStyles.caption, color: Colors.grey04 }}>
            {typedSub}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            {showLeft && (
              <img
                src={showRight ? paginationBothL : paginationLeft}
                alt="prev"
                style={{
                  marginBottom: -80,
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
                  marginBottom: -80,
                  height: 24,
                  cursor: typingDone ? 'pointer' : 'default',
                  opacity: typingDone ? 1 : 0.3,
                }}
                onClick={handleNext}
              />
            )}
          </div>
         
          <div
            style={{
              position: 'absolute',
              right: -67,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
            }}
          >
            <Next2 
            onClick={handleNext} 
            disabled={disabled}
            visuallyDisabled={!(typingDone && currentIndex === paragraphs.length - 1)}  
            />
          </div>
        </div>
  
      </div>
    </div>
  );
}
