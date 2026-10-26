import { useIsMobile } from '../core/responsive';
import React, { useState, useEffect } from 'react';
import contentbox from '../assets/contentBox1.svg';
import paginationBothL from '../assets/paginationBothL.svg';
import paginationBothR from '../assets/paginationBothR.svg';
import { Colors, FontStyles } from './styleConstants';
import useTypingEffect from '../hooks/useTypingEffect';
import Next2 from './Next2'; // ⬅️ 새로 추가
import arrowLdisabled from '../assets/arrowLdisabled.svg';
import arrowRdisabled from '../assets/arrowRdisabled.svg';

export default function ContentTextBox({
  paragraphs = [],
  currentIndex = 0,
  setCurrentIndex = () => {},
  onContinue ,
  disabled = false,
  continueLabel = '다음',
}) {
  const m = useIsMobile();
  const [typingDone, setTypingDone] = useState(false);
  const currentParagraph = paragraphs[currentIndex] || { main: '', sub: '' };
  const isTextReady = currentParagraph.main && currentParagraph.main.length > 0;
  const shouldShowArrows = paragraphs.length > 1;

  useEffect(() => {
    setTypingDone(false);
  }, [currentIndex]);

  const typedMain = useTypingEffect(
    isTextReady ? currentParagraph.main : '',
    undefined,
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
    } 
  };
  const isFirst = currentIndex === 0;
const isLast = currentIndex === paragraphs.length - 1;

const leftArrowImage = isFirst ? arrowLdisabled : paginationBothL;
const rightArrowImage = isLast ? arrowRdisabled : paginationBothR;
const handleContinueClick = () => {
  if (!typingDone) return;
  if (currentIndex === paragraphs.length - 1) {
    onContinue?.();
  }
};

  return (
    <div style={{ position: 'relative', width: m ? '100%' : 960, maxWidth: m ? 960 : undefined, minHeight: m ? 260 : 200 }}>
      <img
        src={contentbox}
        alt="frame"
        style={{
          position: 'absolute',
          inset: 0,
          // width: '100%',
          // height: '100%',
          objectFit: m ? 'fill' : 'contain',
          width: m ? '100%' : undefined,
          height: m ? '100%' : undefined,
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 30,
          left: m ? 20 : 40,
          right: m ? 24 : 50,
          bottom: 24,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 150,
          zIndex: 1,
          ...(m ? { position: 'relative', inset: 'auto', padding: '32px 28px 88px' } : {}),
          wordBreak: 'normal',
          overflowWrap: 'anywhere',
          whiteSpace: 'normal',
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
          <div style={{ ...FontStyles.headlineSmall, color: Colors.grey04 }}>
            {typedSub}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {paragraphs.length > 1 && (
              <div style={{ display: 'flex', gap: 16 }}>
                <img
                  src={leftArrowImage}
                  alt="prev"
                  style={{
                    marginBottom: -80,
                    height: 24,
                    cursor: typingDone && !isFirst ? 'pointer' : 'default',
                    opacity: typingDone ? 1 : 0.3,
                  }}
                  onClick={handlePrev}
                />
                <img
                  src={rightArrowImage}
                  alt="next"
                  style={{
                    marginBottom: -80,
                    height: 24,
                    cursor: typingDone && !isLast ? 'pointer' : 'default',
                    opacity: typingDone ? 1 : 0.3,
                  }}
                  onClick={handleNext}
                />
              </div>
            )}
          </div>

          </div>
         
          <div
            style={{
              position: 'absolute',
              right: m ? 4 : -67,
              ...(m ? { bottom: 4 } : { top: '50%', transform: 'translateY(-50%)' }),
              zIndex: 2,
            }}
          >
            <Next2 
            onClick={handleContinueClick} 
            disabled={disabled}
            visuallyDisabled={!(typingDone && currentIndex === paragraphs.length - 1)}  
            />
          </div>
        </div>
  
      </div>
  );
}
