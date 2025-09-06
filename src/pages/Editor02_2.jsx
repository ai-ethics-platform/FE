// 역할 설명 - 첫번째 유저에 대한 역할 설명 페이지
import { useState } from 'react';
import CreatorLayout from '../components/Expanded/EditorLayout';
import { useNavigate } from 'react-router-dom';
import CreateTextBox from "../components/Expanded/CreateTextBox";
import create02Image from '../assets/images/Frame235.png';
import charBg from '../assets/charbg2.svg'; // ← 경로 확인해서 맞춰줘
import { Colors, FontStyles } from '../components/styleConstants';

export default function Editor02_2() {
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
  const descFromLocal =localStorage.getItem('charDes2');
  const labelFromLocal =localStorage.getItem('char2');

  const [paragraphs, setParagraphs] = useState([{ main: descFromLocal }]);
  // 예시 텍스트


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

  // 레이아웃용 상수 (스샷처럼 보이도록)
  const STAGE_MAX_WIDTH = 1060; // 내부 패널 넓이
  const MEDIA_WIDTH = 200;      // 이미지/텍스트 박스 폭
  const MEDIA_HEIGHT = 200;     // 이미지 높이

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
      nextPath="/editor02_3"
      backPath="/editor02_1"
      showNext
      showBack
    >
      {/* 스테이지: 가운데 정렬 + 내부 여백 */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: STAGE_MAX_WIDTH, boxSizing: 'border-box' }}>
          <div style={{ marginTop:-20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            {/* 이미지 영역 */}
            <div
              style={{
                width: MEDIA_WIDTH,
                height: MEDIA_HEIGHT,
                border: '2px solid #ddd',
                backgroundColor: '#f8f9fa',
                overflow: 'hidden',
                position: 'relative', // 버튼 오버레이용
              }}
            >
              {/* 이미지 변경 버튼 (좌상단) */}
              <button
                type="button"
                onClick={() => handleImageChange(setImage1, setIsDefaultImage1)}
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
                src={isDefaultImage1 ? create02Image : URL.createObjectURL(image1)}
                alt="딜레마 이미지"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onLoad={(e) => {
                  if (!isDefaultImage1 && image1) {
                    URL.revokeObjectURL(e.currentTarget.src);
                  }
                }}
              />
            </div>

            {/* ▶ 이미지 하단 라벨 (charbg + 흰 박스 + 직업명) */}
            <div
              style={{
                width: MEDIA_WIDTH,
                marginTop: 6,
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 42, // 라벨 영역 높이
              }}
            >
              <img
                src={charBg}
                alt=""
                draggable={false}
                style={{
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                  filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))',
                }}
              />
              {/* 중앙 흰 박스 + 텍스트 */}
              <div
                style={{
                  position: 'absolute',
                  padding: '6px 12px',
                  background: '#fff',
                  ...FontStyles.bodyBold,
                  color: Colors.player2P,
                  lineHeight: 1,
                }}
              >
                {labelFromLocal}
                </div>
            </div>
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
    </CreatorLayout>
  );
}
