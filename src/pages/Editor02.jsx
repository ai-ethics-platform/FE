// 역할 설명 3명의 이미지 합쳐서 설명 
// api 연결 시 할 것 - 이미지 설명, 이미지 3명에 대한 api 모두 받아오기, 없으면 default 이미지 사용 
// default 이미지가 api로 받아온 이미지여야함

import { useState } from 'react';
import CreatorLayout from '../components/Expanded/EditorLayout';
import { useNavigate } from 'react-router-dom';
import CreateTextBox from "../components/Expanded/CreateTextBox";
import create02Image from '../assets/images/Frame235.png';
import { Colors, FontStyles } from '../components/styleConstants';

export default function Editor02() {
  const navigate = useNavigate();

  const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");
  const [currentIndex, setCurrentIndex] = useState(0);
 // 이미지 상태 각각 분리
const [image1, setImage1] = useState(null);
const [image2, setImage2] = useState(null);
const [image3, setImage3] = useState(null);

const [isDefaultImage1, setIsDefaultImage1] = useState(true);
const [isDefaultImage2, setIsDefaultImage2] = useState(true);
const [isDefaultImage3, setIsDefaultImage3] = useState(true);
const rolesBackground = localStorage.getItem('rolesBackground');
const [paragraphs, setParagraphs] = useState([
  { main: rolesBackground }
]);
// 역할별 이미지 변경 핸들러
const handleImageChange = (setImage, setIsDefault) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setIsDefault(false);
    }
  };
  input.click();
};
 
  //  레이아웃용 상수 (스샷처럼 보이도록)
  const STAGE_MAX_WIDTH = 1060; // 내부 패널 넓이
  const MEDIA_WIDTH = 190;      // 이미지/텍스트 박스 폭
  const MEDIA_HEIGHT = 190;     // 이미지 높이

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
      nextPath="/editor02_1"
      backPath="/editor01"
      showNext
      showBack
    >
     <div style={{ display: 'flex', justifyContent: 'center' }}>
  <div style={{ width: '100%', maxWidth: STAGE_MAX_WIDTH, boxSizing: 'border-box' }}>
    {/* 3열 이미지 영역 */}
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 10,                  // 카드 사이 간격
        marginTop: 8,
        marginBottom: 16,
      }}
    >
      {[
        { image: image1, setImage: setImage1, isDefault: isDefaultImage1, setIsDefault: setIsDefaultImage1 },
        { image: image2, setImage: setImage2, isDefault: isDefaultImage2, setIsDefault: setIsDefaultImage2 },
        { image: image3, setImage: setImage3, isDefault: isDefaultImage3, setIsDefault: setIsDefaultImage3 },
      ].map(({ image, setImage, isDefault, setIsDefault }, idx) => (
        <div
          key={idx}
          style={{
            width: MEDIA_WIDTH,          // 200
            height: MEDIA_HEIGHT,        // 200
            border: '2px solid #ddd',
            backgroundColor: '#f8f9fa',
            overflow: 'hidden',
            position: 'relative',
            borderRadius: 2,
            boxShadow: '0 8px 16px rgba(0,0,0,0.06)',
          }}
        >
          {/* 좌상단 이미지 변경 버튼 */}
          <button
            type="button"
            onClick={() => handleImageChange(setImage, setIsDefault)}
            style={{
              position: 'absolute',
              top: 6,
              left: 6,
              zIndex: 2,
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.15)',
              padding: '6px 10px',
              lineHeight: 1,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              ...FontStyles.bodyBold,
              color: Colors.grey07,
              borderRadius: 3,
            }}
          >
            이미지 변경
          </button>

          <img
            src={isDefault ? create02Image : URL.createObjectURL(image)}
            alt={`역할 이미지 ${idx + 1}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onLoad={(e) => {
              if (!isDefault && image) {
                URL.revokeObjectURL(e.currentTarget.src);
              }
            }}
          />
        </div>
      ))}
    </div>

    {/* 텍스트 박스 */}
    <div style={{ width: '100%' }}>
      <CreateTextBox
        paragraphs={paragraphs}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
      />
    </div>
  </div>
</div>
    </CreatorLayout>
    
  );
}
