import React from 'react';
import contentbox from '../../assets/createcontentbox.svg';
import paginationBothL from '../../assets/paginationBothL.svg';
import paginationBothR from '../../assets/paginationBothR.svg';
import { Colors, FontStyles } from '../styleConstants';
import arrowLdisabled from '../../assets/arrowLdisabled.svg';
import arrowRdisabled from '../../assets/arrowRdisabled.svg';

export default function ContentTextBox2({
  paragraphs = [],
  currentIndex = 0,
  setCurrentIndex = () => {},
  onContinue,
  disabled = false,
  continueLabel = '다음',
  maxWidth = 650,
  framePadding = 12,       // ✅ 프레임 안쪽 여백(=축소 효과)
}) {
  const currentParagraph = paragraphs[currentIndex] || { main: '', sub: '' };

  const handlePrev = () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); };
  const handleNext = () => { if (currentIndex < paragraphs.length - 1) setCurrentIndex(currentIndex + 1); };

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === paragraphs.length - 1;

  const leftArrowImage  = isFirst ? arrowLdisabled  : paginationBothL;
  const rightArrowImage = isLast  ? arrowRdisabled : paginationBothR;

  const handleContinueClick = () => { if (isLast) onContinue?.(); };
  const arrowOffsetY = -5;
  const arrowOffsetX = -10; 
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth,
        minHeight: 200,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: framePadding,   // 안쪽 여백으로 프레임 축소
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <img
          src={contentbox}
          alt="frame"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',  // ✅ 잘림 없이 전체 보이기
            display: 'block',
          }}
          draggable={false}
        />
      </div>

      {/* 내용 */}
      <div
        style={{
          position: 'absolute',
          top: 38,
          left: 30,
          right: 40,
          bottom: 24,
          paddingRight: 30,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          zIndex: 1,
          wordBreak: 'keep-all',
          whiteSpace: 'normal',
        }}
      >
        <div>
          <div style={{ ...FontStyles.bodyBold, marginBottom: 3 }}>
            {String(currentParagraph.main || '')
              .split('\n')
              .map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
          </div>

          <div style={{ ...FontStyles.bodyBold, color: Colors.grey04 }}>
            {currentParagraph.sub}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {paragraphs.length > 1 && (
            <div
            style={{
              display: 'flex',
              gap: 10,
              transform: `translate(${arrowOffsetX}px, ${arrowOffsetY}px)`, // ✅ X/Y 동시 조절
            }}
          >
            <img
              src={leftArrowImage}
              alt="prev"
              style={{ height: 20, cursor: !isFirst ? 'pointer' : 'default' }}
              onClick={handlePrev}
            />
            <img
              src={rightArrowImage}
              alt="next"
              style={{ height: 20, cursor: !isLast ? 'pointer' : 'default' }}
              onClick={handleNext}
            />
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
