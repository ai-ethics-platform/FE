import contentbox from '../../assets/createcontentbox.svg';
import { useEffect, useRef } from 'react';
import { diagnosticEvent } from '../../utils/creatorDiagnostics';
import paginationBothL from '../../assets/paginationBothL.svg';
import paginationBothR from '../../assets/paginationBothR.svg';
import { Colors, FontStyles } from '../styleConstants';
import arrowLdisabled from '../../assets/arrowLdisabled.svg';
import arrowRdisabled from '../../assets/arrowRdisabled.svg';

// createcontentbox.svg(viewBox 750x212) 안측 흰 사각형:
//   <rect x="16.4004" y="16.7969" width="716.8" height="137.6" />
// 프레임이 objectFit: fill 로 늘어나므로 비율로 환산해두면 어느 크기에서도 맞는다.
const WHITE_PANEL = {
  left: 16.4004 / 750,
  right: (750 - (16.4004 + 716.8)) / 750,
  top: 16.7969 / 212,
  bottom: (212 - (16.7969 + 137.6)) / 212,
};

export default function ContentTextBox2({
  paragraphs = [],
  currentIndex = 0,
  setCurrentIndex = () => {},
  onContinue,
  disabled = false,
  continueLabel = '다음',
  maxWidth = 700,
  framePadding = 12,       //  프레임 안쪽 여백(=축소 효과)
}) {
  const scrollRef = useRef(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [currentIndex]);
  const currentParagraph = paragraphs[currentIndex] || { main: '', sub: '' };

  useEffect(() => {
    diagnosticEvent('state', { action: 'preview_paragraph', count: currentIndex, disabled });
  }, [currentIndex, disabled]);
  const handlePrev = () => {
    diagnosticEvent('action', { action: 'preview_previous', count: currentIndex, blocked: currentIndex <= 0 });
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };
  const handleNext = () => {
    diagnosticEvent('action', { action: 'preview_next', count: currentIndex, blocked: currentIndex >= paragraphs.length - 1 });
    if (currentIndex < paragraphs.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === paragraphs.length - 1;

  const leftArrowImage  = isFirst ? arrowLdisabled  : paginationBothL;
  const rightArrowImage = isLast  ? arrowRdisabled : paginationBothR;

  const handleContinueClick = () => { if (isLast) onContinue?.(); };
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
            // 프레임을 패딩 박스에 정확히 채운다.
            // contain 이면 SVG(750x212)와 박스 비율이 달라 레터박스가 생기는데,
            // 아래 내용 영역은 박스 기준 고정 inset이라 흰 패널 밖으로 텍스트가 삐져나온다.
            objectFit: 'fill',
            display: 'block',
          }}
          draggable={false}
        />
      </div>

      {/* 내용: 프레임 SVG 안쪽 흰 사각형에 정확히 맞춘다.
          고정 px inset(top 38 / bottom 24)은 흰 사각형(SVG 기준 y 16.8~154.4)보다 아래로 내려가 있어
          텍스트가 흰 칸 밖으로 넘치고 스크롤도 흰 칸과 어긋나 있었다.
          프레임 <img>는 inset:0 으로 컨테이너 패딩 박스를 그대로 채우므로,
          컨테이너 대비 % 로 잡으면 폭이 줄어도 흰 사각형과 계속 일치한다. */}
      <div
        className="preview-text-scroll"
        ref={scrollRef}
        tabIndex={0}
        role="region"
        aria-label={`본문 ${currentIndex + 1} / ${Math.max(1, paragraphs.length)}`}
        style={{
          position: 'absolute',
          top: `${WHITE_PANEL.top * 100}%`,
          bottom: `${WHITE_PANEL.bottom * 100}%`,
          left: `${WHITE_PANEL.left * 100}%`,
          right: `${WHITE_PANEL.right * 100}%`,
          boxSizing: 'border-box',
          padding: '12px 6px 12px 14px',
          overflowY: 'auto',
          zIndex: 1,
          wordBreak: 'keep-all',
          whiteSpace: 'normal',
        }}
      >
        {/* Keep one text child: browser translation can replace individual text nodes. */}
        <div style={{ ...FontStyles.bodyBold, marginBottom: 3, whiteSpace: 'pre-wrap' }}>
          {String(currentParagraph.main || '')}
        </div>

        <div style={{ ...FontStyles.bodyBold, color: Colors.grey04 }}>
          {currentParagraph.sub}
        </div>
      </div>

      {paragraphs.length > 1 && (
        <div className="creator-pagination" style={{ position: 'absolute', left: '3%', right: '3%', bottom: 4, display: 'flex', alignItems: 'center', zIndex: 1 }}>
          <button type="button" aria-label="이전 문단" disabled={isFirst} onClick={handlePrev}>
            <img src={leftArrowImage} alt="prev" />
          </button>
          <button type="button" aria-label="다음 문단" disabled={isLast} onClick={handleNext}>
            <img src={rightArrowImage} alt="next" />
          </button>
          <span className="creator-pagination-count" aria-live="polite">{`${currentIndex + 1} / ${paragraphs.length}`}</span>
        </div>
      )}
    </div>
  );
}
