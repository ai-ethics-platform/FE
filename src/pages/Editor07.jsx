import { useState, useEffect } from 'react';
import CreatorLayout from '../components/Expanded/EditorLayout';
import { useNavigate } from 'react-router-dom';
import CreateTextBox from "../components/Expanded/CreateTextBox";
import create02Image from '../assets/images/Frame159.png';
import { Colors, FontStyles } from '../components/styleConstants';

export default function Editor07() {
  const navigate = useNavigate();

  const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [image, setImage] = useState(null);
  const [isDefaultImage, setIsDefaultImage] = useState(true);

  //  방문한 문단 인덱스 추적
  const [visited, setVisited] = useState(() => new Set([0]));
  useEffect(() => {
    setVisited(prev => {
      if (prev.has(currentIndex)) return prev;
      const next = new Set(prev);
      next.add(currentIndex);
      return next;
    });
  }, [currentIndex]);

    const agreeArr = (() => {
      try {
        return JSON.parse(localStorage.getItem("flips_agree_texts") || "[]");
      } catch {
        return [];
      }
    })();
  
    const disagreeArr = (() => {
      try {
        return JSON.parse(localStorage.getItem("flips_disagree_texts") || "[]");
      } catch {
        return [];
      }
    })();
  
    // 예: 여기서는 agree 텍스트만 보여주도록 paragraphs에 할당
    const paragraphs = agreeArr.map(text => ({ main: text }));

  // 3개를 다 읽고 넘긴 상태 조건
  const allVisited = visited.size >= paragraphs.length;
  const isLast = currentIndex === paragraphs.length - 1;
  const canProceed = allVisited && isLast;

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

  // 레이아웃용 상수
  const STAGE_MAX_WIDTH = 1060;
  const MEDIA_WIDTH = 530;
  const MEDIA_HEIGHT = 230;

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
      nextPath="/editor07_1"
     // showNext={canProceed}           
      showBack
      showNext
      backPath="/editor06"
    >
      {/* 스테이지: 가운데 정렬 + 내부 여백 */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
      
        <div style={{ width: '100%', maxWidth: STAGE_MAX_WIDTH, boxSizing: 'border-box' }}>
          {/* 콘텐츠 수직 정렬 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            {/* 이미지 영역 */}
            <div 
            style={{
              ...FontStyles.bodyBold,
              color:Colors.systemRed,
              marginTop:-20,
              overflow: 'hidden',
              position: 'relative',
            }}
            >동의 선택시 
            </div>
            <div
              style={{
                width: MEDIA_WIDTH,
                height: MEDIA_HEIGHT,
                border: '2px solid #ddd',
                backgroundColor: '#f8f9fa',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* 이미지 변경 버튼 (좌상단) */}
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
