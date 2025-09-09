// 역할 설명 3명의 이미지 합쳐서 설명
// default 이미지는 서버에서 받은 역할 이미지 URL(없으면 앱 기본 이미지)
// GET:  /custom-games/{code}/role-images  -> { urls: { "1": "...", "2": "...", "3": "..." } }
// POST: /custom-games/{code}/role-images/{slot} (multipart/form-data; field 'file')

import { useState, useEffect } from 'react';
import CreatorLayout from '../components/Expanded/EditorLayout';
import { useNavigate } from 'react-router-dom';
import CreateTextBox from "../components/Expanded/CreateTextBox";
import defaultRoleImg from '../assets/images/Frame235.png';
import { Colors, FontStyles } from '../components/styleConstants';
import axiosInstance from '../api/axiosInstance';

const ROLE_IMG_KEYS = ['role_image_1', 'role_image_2', 'role_image_3'];

const resolveImageUrl = (raw) => {
  if (!raw || raw === '-' || String(raw).trim() === '') return null;
  const u = String(raw).trim();
  if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
  const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
  if (!base) return u;
  return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
};

// 업로드: multipart/form-data, 필드명 'file'
async function uploadRoleImage(slot, file) {
  const code = localStorage.getItem('code');
  if (!code) throw new Error('게임 코드가 없습니다. (code)');
  const form = new FormData();
  form.append('file', file);
  const res = await axiosInstance.post(
    `/custom-games/${code}/role-images/${slot}`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  const url = res?.data?.url || res?.data?.image_url;
  if (!url) throw new Error('업로드 응답에 url이 없습니다.');
  return url;
}

export default function Editor02() {
  const navigate = useNavigate();

  const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");
  const [currentIndex, setCurrentIndex] = useState(0);

  // 역할 배경 한 문단
  const rolesBackground = localStorage.getItem('rolesBackground') || '';
  const [paragraphs, setParagraphs] = useState([{ main: rolesBackground }]);

  // 역할 이미지 URL + 폴백 플래그
  const [img1, setImg1] = useState(() => resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[0])));
  const [img2, setImg2] = useState(() => resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[1])));
  const [img3, setImg3] = useState(() => resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[2])));
  const [fallback1, setFallback1] = useState(!img1);
  const [fallback2, setFallback2] = useState(!img2);
  const [fallback3, setFallback3] = useState(!img3);

  // 초기 로딩: 역할 이미지 GET → 로컬 저장 → 상태 반영
  useEffect(() => {
    (async () => {
      try {
        const code = localStorage.getItem('code');
        if (!code) return;

        const res = await axiosInstance.get(`/custom-games/${code}/role-images`, {
          headers: { 'Content-Type': 'application/json' },
        });
        const urls = res?.data?.urls || {};

        // 슬롯 1
        if (urls['1']) {
          localStorage.setItem(ROLE_IMG_KEYS[0], urls['1']);
          const u = resolveImageUrl(urls['1']);
          setImg1(u); setFallback1(!u);
        } else {
          const saved = resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[0]));
          setImg1(saved); setFallback1(!saved);
        }

        // 슬롯 2
        if (urls['2']) {
          localStorage.setItem(ROLE_IMG_KEYS[1], urls['2']);
          const u = resolveImageUrl(urls['2']);
          setImg2(u); setFallback2(!u);
        } else {
          const saved = resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[1]));
          setImg2(saved); setFallback2(!saved);
        }

        // 슬롯 3
        if (urls['3']) {
          localStorage.setItem(ROLE_IMG_KEYS[2], urls['3']);
          const u = resolveImageUrl(urls['3']);
          setImg3(u); setFallback3(!u);
        } else {
          const saved = resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[2]));
          setImg3(saved); setFallback3(!saved);
        }
      } catch (err) {
        console.error('역할 이미지 로드 실패:', err);
        // 실패해도 로컬/폴백으로 표시
        const s1 = resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[0]));
        const s2 = resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[1]));
        const s3 = resolveImageUrl(localStorage.getItem(ROLE_IMG_KEYS[2]));
        setImg1(s1); setFallback1(!s1);
        setImg2(s2); setFallback2(!s2);
        setImg3(s3); setFallback3(!s3);
      }
    })();
  }, []);

  // 슬롯별 이미지 변경(업로드) → 로컬/상태 덮어쓰기 → 새로고침 유지
  const changeSlotImage = (slot) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const rawUrl = await uploadRoleImage(slot, file);
        localStorage.setItem(ROLE_IMG_KEYS[slot - 1], rawUrl);
        const resolved = resolveImageUrl(rawUrl);

        if (slot === 1) { setImg1(resolved); setFallback1(!resolved); }
        if (slot === 2) { setImg2(resolved); setFallback2(!resolved); }
        if (slot === 3) { setImg3(resolved); setFallback3(!resolved); }
      } catch (err) {
        console.error(err);
        alert('역할 이미지 업로드에 실패했습니다.');
        if (slot === 1) setFallback1(true);
        if (slot === 2) setFallback2(true);
        if (slot === 3) setFallback3(true);
      }
    };
    input.click();
  };

  //  레이아웃용 상수
  const STAGE_MAX_WIDTH = 1060;
  const MEDIA_WIDTH = 190;
  const MEDIA_HEIGHT = 190;

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
              gap: 10,
              marginTop: 8,
              marginBottom: 16,
            }}
          >
            {[{ idx: 1, src: img1, fallback: fallback1, setFallback: setFallback1 },
              { idx: 2, src: img2, fallback: fallback2, setFallback: setFallback2 },
              { idx: 3, src: img3, fallback: fallback3, setFallback: setFallback3 }].map(({ idx, src, fallback, setFallback }) => (
              <div
                key={idx}
                style={{
                  width: MEDIA_WIDTH,
                  height: MEDIA_HEIGHT,
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
                  onClick={() => changeSlotImage(idx)}
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
                  src={!fallback && src ? src : defaultRoleImg}
                  alt={`역할 이미지 ${idx}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={() => setFallback(true)}
                  onLoad={() => setFallback(false)}
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
