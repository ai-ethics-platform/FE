import DilemmaOutPopup from '../components/DilemmaOutPopup';
import CreatorLayout from '../components/Expanded/CreatorLayout';
import CreatorContentBox from "../components/Expanded/CreatorContentBox";
import Continue from '../components/Expanded/CreateContinue';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Create00() {
  const navigate = useNavigate();
  const combinedText =
    '수고 많으셨습니다! \n 학생들에게 아래의 URL 링크를 공유하여 \n 직접 만드신 딜레마 게임을 교육에서 활용해 보세요.';
  const [copied, setCopied] = useState(false);

  const handleNext = () => {
    navigate('/selectroom');
  };
  const linkUrl=localStorage.getItem("url") ||  null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(linkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2초 후 알림 숨기기
    } catch (err) {
      console.error("복사 실패:", err);
    }
  };

  return (
    <CreatorLayout
      headerbar={1}
      headerLeftType="home"
      headerNextDisabled={true}
      onHeaderLeftClick={() => navigate('/selectroom')}
      onHeaderNextClick={() => console.log('NEXT')}
      frame={false}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, position: 'relative' }}>
        {/* 콘텐츠 박스 */}
        <CreatorContentBox topicText="딜레마 게임 만들기 완료" text={combinedText} />

        {/* URL 박스 (absolute) */}
        <div
          style={{
            position: 'absolute',
            top: '55%', // 위치 조정 가능
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: '8px 12px',
            gap: 8,
            width: 360,
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}
        >
          <input
            type="text"
            value={linkUrl}
            readOnly
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 14,
              background: 'transparent',
              color: '#333',
            }}
          />
          <button
            onClick={handleCopy}
            style={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: '4px 12px',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            복사
          </button>
        </div>

        {/* 복사 알림 */}
        {copied && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(55% + 50px)',
              fontSize: 16,
              color: 'green',
            }}
          >
            URL이 복사되었습니다
          </div>
        )}

        <Continue
          onClick={handleNext}
          label="메인화면으로"
          style={{ marginTop: 80, width: 264, height: 72 }}
        />
      </div>
    </CreatorLayout>
  );
}
