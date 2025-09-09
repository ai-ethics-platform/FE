// Editor07_1 (비동의 화면) — 로컬(dilemma_image_4_2) 우선, 없으면 디폴트 이미지, 변경 시 POST 업로드
import { useState, useEffect } from 'react';
import CreatorLayout from '../components/Expanded/EditorLayout';
import { useNavigate } from 'react-router-dom';
import CreateTextBox from "../components/Expanded/CreateTextBox";
import create02Image from '../assets/images/Frame159.png';
import { Colors, FontStyles } from '../components/styleConstants';
import axiosInstance from '../api/axiosInstance';

// 상대경로를 axios baseURL 기준 절대경로로 보정
const resolveImageUrl = (raw) => {
  if (!raw || raw === '-' || String(raw).trim() === '') return null;
  const u = String(raw).trim();
  if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
  const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
  if (!base) return u;
  return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
};

// 이미지 업로드 (현재 공통 엔드포인트)
async function uploadImage(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await axiosInstance.post('/custom-games/upload-image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const url = res?.data?.url || res?.data?.image_url;
  if (!url) throw new Error('업로드 응답에 url이 없습니다.');
  return url; // 로컬에는 원본 그대로 저장
}

export default function Editor07() {
  const navigate = useNavigate();

  const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");
  const [currentIndex, setCurrentIndex] = useState(0);

  // 텍스트: 비동의 분기
  const disagreeArr = (() => {
    try {
      return JSON.parse(localStorage.getItem("flips_disagree_texts") || "[]");
    } catch {
      return [];
    }
  })();
  const paragraphs = disagreeArr.map(text => ({ main: text }));

  // 방문 추적
  const [visited, setVisited] = useState(() => new Set([0]));
  useEffect(() => {
    setVisited(prev => {
      if (prev.has(currentIndex)) return prev;
      const next = new Set(prev);
      next.add(currentIndex);
      return next;
    });
  }, [currentIndex]);

  // 이미지: 로컬 'dilemma_image_4_2' 우선, 없으면 디폴트 폴백
  const [imageUrl, setImageUrl] = useState(() => {
    const saved = localStorage.getItem('dilemma_image_4_2');
    return resolveImageUrl(saved);
  });
  const [useFallback, setUseFallback] = useState(() => !resolveImageUrl(localStorage.getItem('dilemma_image_4_2')));

  // 이미지 변경 (업로드 → 로컬 저장 → 상태 반영)
  const handleImageChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        setUseFallback(false); // 시도 중엔 폴백 해제
        const rawUrl = await uploadImage(file);
        localStorage.setItem('dilemma_image_4_2', rawUrl); // ← 비동의 키에 저장
        const resolved = resolveImageUrl(rawUrl);
        setImageUrl(resolved);
        setUseFallback(!resolved);
      } catch (err) {
        console.error(err);
        alert('이미지 업로드에 실패했습니다.');
        setUseFallback(true);
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
      nextPath="/editor08"
      // showNext={canProceed}
      showBack
      showNext
      backPath="/editor07"
    >
      {/* 스테이지: 가운데 정렬 + 내부 여백 */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: STAGE_MAX_WIDTH, boxSizing: 'border-box' }}>
          {/* 콘텐츠 수직 정렬 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            {/* 타이틀 라벨 */}
            <div
              style={{
                ...FontStyles.bodyBold,
                color: Colors.systemRed,
                marginTop: -20,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              비동의 선택시
            </div>

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
                src={!useFallback && imageUrl ? imageUrl : create02Image}
                alt="비동의 이미지"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={() => setUseFallback(true)}
                onLoad={() => setUseFallback(false)}
              />
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
      </div>
    </CreatorLayout>
  );
}
