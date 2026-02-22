import React from 'react';
import logo from '../assets/logo.svg';
import crownIcon from '../assets/crown.svg';
import peopleIcon from '../assets/PeopleIcon.svg';
import cardButtonImg from '../assets/CardButton.svg';
import { Colors, FontStyles } from './styleConstants';
import { translations } from '../utils/language/index';

export default function IntroductionPopup({ isOpen, onClose }) {
  const lang = localStorage.getItem('app_lang') || 'ko';
  
  if (!isOpen) return null;

  // 언어팩에서 현재 언어에 맞는 데이터 가져오기
  const t = translations?.[lang]?.IntroductionPopup || {};

  /**
   * {{키워드}} 감지 및 포인트 컬러 적용 함수
   */
  const renderStyledText = (text) => {
    if (!text) return "";
    const parts = text.split(/(\{\{.*?\}\})/g);
    return parts.map((part, index) => {
      if (part.startsWith('{{') && part.endsWith('}}')) {
        const contentText = part.slice(2, -2);
        return (
          <span key={index} style={{ color: Colors.brandPrimary || '#006B75', fontWeight: 'bold' }}>
            {contentText}
          </span>
        );
      }
      return part;
    });
  };

  /**
   * 청록색 구분선 컴포넌트
   */
  const Divider = () => (
    <div 
      style={{ 
        width: '100%', 
        height: '1px', 
        backgroundColor: Colors.brandPrimary || '#006B75',
        opacity: 0.4,
        margin: '12px 0' // 세로 압축을 위해 간격 조정
      }} 
    />
  );

  return (
    <div
      style={{
        width: '640px',          // 가로를 살짝 늘림
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '25px 40px',    // 상하 여백을 줄여 세로 길이 최적화
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.2)',
        zIndex: 10002,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 상단 텍스트 및 로고 */}
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <p style={{ fontSize: '16px', color: '#111111', fontWeight: '600', marginBottom: '5px' }}>
          {t.title}
        </p>
        <img src={logo} alt="Logo" style={{ width: '210px' }} />
      </div>

      {/* 메인 설명 텍스트 */}
      <div style={{ 
        textAlign: 'center', 
        fontSize: '15px', 
        color: '#000000', 
        lineHeight: '1.6', 
        whiteSpace: 'pre-wrap',
        marginBottom: '5px'
      }}>
        {renderStyledText(t.description)}
      </div>

      <Divider />

      {/* 역할 설명 영역 */}
      <div style={{ width: '100%' }}>
        {/* 방장 영역 */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <img src={crownIcon} alt="Host" style={{ width: '50px', marginRight: '15px' }} />
          <div>
            <p style={{ fontWeight: 'bold', fontSize: '16px', color: '#000000', marginBottom: '2px' }}>
              {t.hostTitle}
            </p>
            <p style={{ fontSize: '13px', color: '#111111', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
              {t.hostDesc}
            </p>
          </div>
        </div>

        {/* 참여자 영역 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={peopleIcon} alt="People" style={{ width: '50px', marginRight: '15px' }} />
          <div>
            <p style={{ fontWeight: 'bold', fontSize: '16px', color: '#000000', marginBottom: '2px' }}>
              {t.playerTitle}
            </p>
            <p style={{ fontSize: '13px', color: '#111111', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
              {t.playerDesc}
            </p>
          </div>
        </div>
      </div>

      <Divider />

      {/* 푸터 문구 */}
      <p style={{ fontWeight: 'bold', fontSize: '15px', color: '#000000', marginBottom: '18px' }}>
        {t.footer}
      </p>

      {/* 하단 닫기 버튼: 이미지 자체에 텍스트가 있으므로 추가 텍스트 없이 렌더링 */}
      <img 
        src={cardButtonImg} 
        alt="Close" 
        onClick={onClose}
        style={{
          width: '160px', 
          cursor: 'pointer',
          transition: 'transform 0.1s ease',
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      />
    </div>
  );
}