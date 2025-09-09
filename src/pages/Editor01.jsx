import { useState } from 'react';
import CreatorLayout from '../components/Expanded/EditorLayout';
import { useNavigate } from 'react-router-dom';
import CreateTextBox from "../components/Expanded/CreateTextBox";
import create02Image from '../assets/images/create02.png';
import { Colors, FontStyles } from '../components/styleConstants';
import axiosInstance from '../api/axiosInstance'; 

// Create01과 동일한 URL 보정 유틸
const resolveImageUrl = (raw) => {
  if (!raw || raw === '-' || String(raw).trim() === '') return null;
  const u = String(raw).trim();
  if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
  const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
  if (!base) return u;
  return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
};

//  Create01과 동일한 업로드 함수 (엔드포인트 동일)
async function uploadRepresentativeImage(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await axiosInstance.post('/custom-games/upload-image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const url = res?.data?.url || res?.data?.image_url;
  if (!url) throw new Error('업로드 응답에 url이 없습니다.');
  return url;
}
async function putRepresentativeImages(code, imagesMap = {}) {
  if (!code) throw new Error("code가 필요합니다.");

  const images = Object.fromEntries(
    Object.entries(imagesMap).filter(([, v]) => !!v) // falsy 값 제거
  );

  const { data } = await axiosInstance.put(
    `/custom-games/${code}/representative-images`,
    { images } // <== 딱 이 형태로 보냄
  );

  return data; // 서버 응답 필요하면 사용
}


export default function Editor01() {
  const navigate = useNavigate();

  const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");
  const [currentIndex, setCurrentIndex] = useState(0);

  // 대표 이미지 URL 우선 표시 + 폴백
  const [imageUrl, setImageUrl] = useState(() => {
    const saved = localStorage.getItem('dilemma_image_1');
    return resolveImageUrl(saved);
  });
  const [useFallback, setUseFallback] = useState(false);

  // opening → paragraphs 변환 (기존 로직 유지)
  let paragraphs = [];
  try {
    const raw = localStorage.getItem('opening');
    const arr = raw ? JSON.parse(raw) : [];
    paragraphs = arr.map((txt) => ({ main: txt ?? null }));
  } catch (e) {
    console.error("opening 파싱 실패:", e);
    paragraphs = [];
  }

  // ✅ 이미지 변경 (업로드 → 로컬/상태 저장 → 새로고침 유지)
  const handleImageChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        setUseFallback(false);
        const url = await uploadRepresentativeImage(file);
        // 2) 대표 이미지 맵 PUT: 이 화면에서는 dilemma_image_1만 갱신

      //  localStorage에서 code 가져오기
      const code = localStorage.getItem('code');
      if (!code) throw new Error("code가 없습니다.");

         await putRepresentativeImages(code, { dilemma_image_1: url });
        localStorage.setItem('dilemma_image_1', url);
        setImageUrl(resolveImageUrl(url));
     
      } catch (err) {
        console.error(err);
        alert('이미지 업로드에 실패했습니다.');
        setUseFallback(true);
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
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: STAGE_MAX_WIDTH, boxSizing: 'border-box' }}>
          {/* 콘텐츠 수직 정렬 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            {/* 이미지 영역 */}
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

              {/* ✅ URL 우선, 실패시 기본 이미지로 폴백 */}
              <img
                src={!useFallback && imageUrl ? imageUrl : create02Image}
                alt="딜레마 이미지"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={() => setUseFallback(true)}
                onLoad={() => setUseFallback(false)}
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
