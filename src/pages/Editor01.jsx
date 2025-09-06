// game01에서 사용하는 텍스트 3개의 입력을 get해와야함
import { useState } from 'react';
import CreatorLayout from '../components/Expanded/EditorLayout';
import { useNavigate } from 'react-router-dom';
import CreateTextBox from "../components/Expanded/CreateTextBox";
import create02Image from '../assets/images/create02.png';
import { Colors, FontStyles } from '../components/styleConstants';

export default function Editor01() {
  const navigate = useNavigate();

  const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [image, setImage] = useState(null);
  const [isDefaultImage, setIsDefaultImage] = useState(true);

  // // 예시 텍스트
  // const paragraphs = [
  //   { main: '자율 주행 자동차는 도로 위에서 다양한 상황을 처리해야 합니다.' },
  //   { main: '예를 들어, 자율 주행 자동차가 한 보행자를 인식하고 멈추는 과정에서, 높은 정확성을 가진 알고리즘이 필요한데, 이 알고리즘은 사람의 행동을 예측하고 그에 따라 반응해야 합니다.' },
  //   { main: '하지만 이 알고리즘이 너무 복잡하면, 왜 특정한 행동을 했는지 설명할 수 없게 됩니다.' },
  // ];
  let paragraphs = [];
  try {
    const raw = localStorage.getItem('opening'); // '["문장1.","문장2.","문장3."]'
    const arr = raw ? JSON.parse(raw) : [];      // ["문장1.","문장2.","문장3."]
  
    paragraphs = arr.map((txt) => ({
      main: txt ?? null,
    }));
  } catch (e) {
    console.error("opening 파싱 실패:", e);
    paragraphs = [];
  }
  // 이미지 변경
  const handleImageChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        setImage(file);
        setIsDefaultImage(false);
      }
    };
    input.click();
  };

  //  레이아웃용 상수 (스샷처럼 보이도록)
  const STAGE_MAX_WIDTH = 1060; // 내부 패널 넓이
  const MEDIA_WIDTH = 530;      // 이미지/텍스트 박스 폭
  const MEDIA_HEIGHT = 230;     // 이미지 높이

  return (
    <CreatorLayout
      headerbar={2}
      headerLeftType="home"
      headerNextDisabled={true}
      frameProps={{
        value: title,
        onChange: (val) => setTitle(val),
        onConfirm: (val) => {
          setTitle(val);
          localStorage.setItem("creatorTitle", val);
        },
      }}
      nextPath="/editor02"
      showNext
      
    >
      {/* 스테이지: 가운데 정렬 + 내부 여백 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '100%',
          maxWidth: STAGE_MAX_WIDTH,
          boxSizing: 'border-box',
        }}>
          {/* 콘텐츠 수직 정렬 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}>
            {/* 이미지 영역 */}
            <div
              style={{
                width: MEDIA_WIDTH,
                height: MEDIA_HEIGHT,
                border: '2px solid #ddd',
                backgroundColor: '#f8f9fa',
                overflow: 'hidden',
                position: 'relative',                // ✅ 버튼 오버레이용

              }}
            >
                {/*  이미지 변경 버튼 (좌상단) */}
                <button
                  type="button"
                  onClick={handleImageChange}
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: 2,
                    zIndex: 2,
                    background: '#fff',
                    border: '1px solid rgba(0,0,0,0.15)',
                    padding: '6px 10px',
                    lineHeight: 1,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                    color: Colors.grey07,
                    ...FontStyles.bodyBold,
                  }}
                >
                  이미지 변경
                </button>
              <img
                src={isDefaultImage ? create02Image : URL.createObjectURL(image)}
                alt="딜레마 이미지"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onLoad={(e) => {
                  if (!isDefaultImage && image) {
                    URL.revokeObjectURL(e.currentTarget.src);
                  }
                }}
              />
            </div>
            <div style={{ width: '100%' }}>
              <CreateTextBox
                paragraphs={paragraphs}
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
              />
            </div>
          </div>
        </div>
      
      </div>
    </CreatorLayout>
    
  );
}
