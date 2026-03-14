import React, { useState, useEffect } from 'react';
import contentbox from '../assets/contentBox1.svg';
import paginationBothL from '../assets/paginationBothL.svg';
import paginationBothR from '../assets/paginationBothR.svg';
import { Colors, FontStyles } from './styleConstants';
import useTypingEffect from '../hooks/useTypingEffect';
import NextGreen from './NextGreen';
import arrowLdisabled from '../assets/arrowLdisabled.svg';
import arrowRdisabled from '../assets/arrowRdisabled.svg';

export default function ContentTextBox2({
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
  const shouldShowArrows = paragraphs.length > 1;

  useEffect(() => {
    setTypingDone(false);
  }, [currentIndex]);

  const typedMain = useTypingEffect(
    isTextReady ? currentParagraph.main : '',
    20,
    () => setTypingDone(true)
  );
  const typedSub = typingDone ? currentParagraph.sub : '';
  const fullMain = isTextReady ? currentParagraph.main : '';
  const typedLen = Math.min((typedMain || '').length, fullMain.length);
  const visibleMain = fullMain.slice(0, typedLen);
  const hiddenMain = fullMain.slice(typedLen);

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
          left: 40,
          right: 40,
          bottom: 24,
          paddingRight: 30,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 150,
          zIndex: 1,
          // ✅ 단어(공백) 기준으로 줄바꿈: 글자 중간에서 어색하게 끊기는 현상 방지
          // - keep-all: CJK(한글 포함)에서 가능하면 공백에서만 줄바꿈
          // - break-word: 너무 긴 영문/특수문자 토큰만 예외적으로 줄바꿈 허용(오버플로 방지)
          wordBreak: 'keep-all',
          overflowWrap: 'break-word',
          whiteSpace: 'normal',
        }}
      >
        <div>
          <div
            style={{
              ...FontStyles.headlineSmall,
              marginBottom: 3,
              // ✅ 완성 문장 기준으로 줄바꿈을 고정하고(리플로우 방지),
              //    타이핑은 보이는 글자만 늘리되 나머지는 공간만 차지하게 처리
              whiteSpace: 'pre-line',
            }}
          >
            <span>{visibleMain}</span>
            <span aria-hidden="true" style={{ visibility: 'hidden' }}>
              {hiddenMain}
            </span>
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
              right: -67,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
            }}
          >
            <NextGreen 
            onClick={handleContinueClick} 
            disabled={disabled}
            visuallyDisabled={!(typingDone && currentIndex === paragraphs.length - 1)}  
            />
          </div>
        </div>
  
      </div>
  );
}
