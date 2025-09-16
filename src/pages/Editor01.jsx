import { useState } from 'react';
import CreatorLayout from '../components/Expanded/EditorLayout';
import { useNavigate } from 'react-router-dom';
import CreateTextBox from "../components/Expanded/CreateTextBox";
import create02Image from '../assets/images/default.png';
import { Colors, FontStyles } from '../components/styleConstants';
import axiosInstance from '../api/axiosInstance'; 

// === 이미지 축소 유틸 시작 ===
// 목표 바이트(1차/2차), 리사이즈 기준(긴 변), JPEG 품질을 상황에 맞게 조절
const IMG_COMPRESS_PRESET_1 = { maxEdge: 2000, quality: 0.85, targetBytes: 1.8 * 1024 * 1024 }; // ~1.8MB
const IMG_COMPRESS_PRESET_2 = { maxEdge: 1280, quality: 0.75, targetBytes: 0.9 * 1024 * 1024 }; // ~0.9MB

// 이미지 File|Blob -> HTMLImageElement 로드
function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

// (너비, 높이) 비율 유지하며 긴 변을 maxEdge로 리사이즈
function calcSizeKeepRatio(w, h, maxEdge) {
  const longEdge = Math.max(w, h);
  if (longEdge <= maxEdge) return { width: w, height: h };
  const scale = maxEdge / longEdge;
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

// 캔버스로 리사이즈 + JPEG 압축 → Blob
async function resizeAndCompressToBlob(file, { maxEdge, quality }) {
  const img = await loadImageFromFile(file);
  const { width, height } = calcSizeKeepRatio(img.width, img.height, maxEdge);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      'image/jpeg',
      quality
    );
  });
}

// Blob -> File 로 감싸기(서버에 file 필드 필요)
function blobToFile(blob, fileName = 'image.jpg') {
  return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
}

// 2차 축소 로직:
// 1) 파일이 크면 1차(큰 리사이즈)로 줄이고,
// 2) 아직 크거나 서버가 413이면 2차(더 강한 리사이즈) 적용
async function twoStepCompress(file, { preset1 = IMG_COMPRESS_PRESET_1, preset2 = IMG_COMPRESS_PRESET_2 } = {}) {
  let working = file;

  // 원본이 너무 크면 1차 축소
  if (working.size > preset1.targetBytes) {
    const blob1 = await resizeAndCompressToBlob(working, preset1);
    if (blob1 && blob1.size < working.size) {
      working = blobToFile(blob1, working.name.replace(/\.\w+$/, '') + '_c1.jpg');
    }
  }

  // 그래도 크면 2차 축소
  if (working.size > preset2.targetBytes) {
    const blob2 = await resizeAndCompressToBlob(working, preset2);
    if (blob2 && blob2.size < working.size) {
      working = blobToFile(blob2, working.name.replace(/\.\w+$/, '') + '_c2.jpg');
    }
  }

  return working;
}
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
  
// ✅ 이미지 변경 (업로드 전 2단계 축소 → 업로드 → 로컬/상태 저장)
const handleImageChange = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUseFallback(false);

      // 1) 업로드 전에 2단계(사이즈 기준) 축소 수행
      const compressed = await twoStepCompress(file);  // ← 이미 선언된 유틸 사용
      const uploadTarget = compressed || file;

      // 2) 업로드
      const url = await uploadRepresentativeImage(uploadTarget);

      // 3) 서버의 대표 이미지 맵 갱신(dilemma_image_1만 사용)
      const code = localStorage.getItem('code');
      if (!code) throw new Error("code가 없습니다.");

      await putRepresentativeImages(code, { dilemma_image_1: url });

      // 4) 로컬/상태 반영
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
      nextPath="/editor02_1"
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
