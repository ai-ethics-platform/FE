import DilemmaOutPopup from '../components/DilemmaOutPopup';
import CreatorLayout from '../components/Expanded/CreatorLayout';
import CreatorContentBox from "../components/Expanded/CreatorContentBox";
import Continue from '../components/Expanded/CreateContinue';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { gameCodeFromLink, readPreviewAccess } from '../utils/previewAccess';

export default function Create00() {
  const navigate = useNavigate();
  const location = useLocation();
  const combinedText =
    '수고 많으셨습니다! \n 학생들에게 아래의 URL 링크를 공유하여 \n 직접 만드신 딜레마 게임을 교육에서 활용해 보세요.';
  const [copied, setCopied] = useState(false);

  const handleNext = () => {
    navigate('/selectroom');
  };
  const linkUrl = location.state?.url || localStorage.getItem('url') || null;
  const previewCode = gameCodeFromLink(linkUrl);
  const editCode = previewCode ? readPreviewAccess(previewCode) : '';

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

        {/* 학생 공유 링크와 제작자 체험은 별도로 표시한다. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: '8px 12px',
            gap: 8,
            width: 'min(400px, 100%)',
            boxSizing: 'border-box',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}
        >
          <input
            type="text"
            aria-label="학생용 공유 링크"
            value={linkUrl || ''}
            readOnly
            style={{
              flex: 1,
              minWidth: 0,
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
              fontSize: 16,
              color: 'green',
            }}
          >
            URL이 복사되었습니다
          </div>
        )}

        {previewCode && <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <button onClick={() => navigate(`/preview/${encodeURIComponent(previewCode)}`)} style={{ padding: '14px 28px', background: '#0d575c', color: '#fff', border: 0, borderRadius: 8, font: 'inherit', cursor: 'pointer' }}>혼자 체험하기</button>
          {editCode && <details style={{ marginTop: 16, overflowWrap: 'anywhere' }}>
            <summary>제작자 수정 코드 보관하기</summary>
            <p>다른 기기에서 미리보기를 열 때 필요합니다. 학생에게 공유하지 마세요.</p>
            <code>{editCode}</code>
          </details>}
        </div>}
        <Continue
          onClick={handleNext}
          label="메인화면으로"
          style={{ marginTop: previewCode ? 10 : 80, width: 264, height: 72 }}
        />
      </div>
    </CreatorLayout>
  );
}
