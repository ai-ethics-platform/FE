// 챗봇 결과 "한 박스 붙여넣기" 전용 페이지
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreatorLayout from '../components/Expanded/CreatorLayout';
import CustomInput from '../components/Expanded/CustomInput';
import Continue from '../components/Expanded/CreateContinue';
import { Colors, FontStyles } from '../components/styleConstants';

export default function Create00() {
  const navigate = useNavigate();
  const [finalText, setFinalText] = useState(localStorage.getItem('finalText') || '');

  const pasteFromClipboard = async () => {
    try {
      const txt = await navigator.clipboard.readText();
      setFinalText(txt);
      localStorage.setItem('finalText', txt);
    } catch {
      alert('클립보드 접근이 차단되었습니다. ⌘/Ctrl + V로 직접 붙여넣기 해주세요.');
    }
  };

  const handleNext = () => {
    // 필요하다면 여기서 finalText 검증/정규화 후 저장
    navigate('/create01');
  };

  return (
    <CreatorLayout
      headerbar={1}
      headerLeftType="home"
      headerNextDisabled={true}
      onHeaderLeftClick={() => navigate('/selectroom')}
      onHeaderNextClick={handleNext}
      frame={false}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%' }}>
        <div style={{ alignSelf: 'stretch', marginTop: 10 }}>
          <h2 style={{ ...FontStyles.headlineSmall, color: Colors.grey07, marginBottom: 8 }}>
            챗봇과 사진 구성하기
          </h2>
          <p style={{ ...FontStyles.body, color: Colors.grey05, margin: 0 }}>
            링크의 챗봇으로 시나리오를 전체적으로 구상해보고, 챗봇이 만든 최종 결과를 아래 입력 박스에 그대로 붙여넣어 주세요.
          </p>
        </div>

        <div style={{ alignSelf: 'stretch' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button
              type="button"
              onClick={pasteFromClipboard}
              style={{
                ...FontStyles.bodyBold,
                border: `1px solid ${Colors.grey03}`,
                background: 'white',
                borderRadius: 6,
                padding: '6px 10px',
                cursor: 'pointer',
              }}
            >
              클립보드에서 붙여넣기
            </button>
          </div>

          <CustomInput
            width={1060}
            height={240}
            placeholder="여기에 최종 결과를 붙여넣기 해주세요."
            value={finalText}
            onChange={(e) => {
              const v = e.target.value ?? '';
              setFinalText(v);
              localStorage.setItem('finalText', v);
            }}
          />
        </div>

        <Continue
          onClick={handleNext}
          label="템플릿 생성"
          style={{ marginTop: 12, width: 264, height: 72 }}
        />
      </div>
    </CreatorLayout>
  );
}
