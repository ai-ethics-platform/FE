import React from 'react';
import contentbox from '../../assets/createcontentbox.svg';
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

// macOS 기본 오버레이 스크롤바는 스크롤하기 전까지 보이지 않아
// 흰 칸 안에 내용이 더 있다는 걸 알 수 없다. 항상 보이는 얇은 스크롤바로 대체한다.
// (이 프로젝트는 전역 스타일시트를 로드하지 않으므로 컴포넌트에서 직접 주입한다.)
const SCROLLBAR_CSS = `
.preview-text-scroll::-webkit-scrollbar { width: 6px; }
.preview-text-scroll::-webkit-scrollbar-track { background: transparent; }
.preview-text-scroll::-webkit-scrollbar-thumb { background: #AAB2B8; border-radius: 3px; }
.preview-text-scroll::-webkit-scrollbar-thumb:hover { background: #8A949B; }
/* 표준 scrollbar-width 를 같이 주면 크롬이 그쪽을 우선해 다시 오버레이(자동 숨김)로 돌아간다.
   ::-webkit-scrollbar 를 모르는 브라우저(파이어폭스)에서만 적용한다. */
@supports not selector(::-webkit-scrollbar) {
  .preview-text-scroll { scrollbar-width: thin; scrollbar-color: #AAB2B8 transparent; }
}
`;

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
            // 프레임을 패딩 박스에 정확히 채운다.
            // contain 이면 SVG(750x212)와 박스 비율이 달라 레터박스가 생기는데,
            // 아래 내용 영역은 박스 기준 고정 inset이라 흰 패널 밖으로 텍스트가 삐져나온다.
            objectFit: 'fill',
            display: 'block',
          }}
          draggable={false}
        />
      </div>

      <style>{SCROLLBAR_CSS}</style>

      {/* 내용: 프레임 SVG 안쪽 흰 사각형에 정확히 맞춘다.
          고정 px inset(top 38 / bottom 24)은 흰 사각형(SVG 기준 y 16.8~154.4)보다 아래로 내려가 있어
          텍스트가 흰 칸 밖으로 넘치고 스크롤도 흰 칸과 어긋나 있었다.
          프레임 <img>는 inset:0 으로 컨테이너 패딩 박스를 그대로 채우므로,
          컨테이너 대비 % 로 잡으면 폭이 줄어도 흰 사각형과 계속 일치한다. */}
      <div
        className="preview-text-scroll"
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

      {/* 페이지네이션: 흰 사각형 아래 여백 띠 */}
      {paragraphs.length > 1 && (
        <div
          style={{
            position: 'absolute',
            left: 30,
            right: 40,
            bottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 1,
          }}
        >
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
        </div>
      )}
    </div>
  );
}
