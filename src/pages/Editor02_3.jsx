// 역할 설명 - 첫번째 유저에 대한 역할 설명 페이지
import { useState, useEffect } from 'react';
import CreatorLayout from '../components/Expanded/EditorLayout';
import { useNavigate } from 'react-router-dom';
import CreateTextBox from "../components/Expanded/CreateTextBox";
import defaultRoleImg from '../assets/images/Frame235.png';
import charBg from '../assets/charbg1.svg'; // ← 경로 확인
import { Colors, FontStyles } from '../components/styleConstants';
import axiosInstance from '../api/axiosInstance';

// 로컬스토리지 키 (1번 슬롯만 사용)
const ROLE_IMG_KEY_2 = 'role_image_3';

// 서버에서 온 상대경로를 baseURL로 보정
const resolveImageUrl = (raw) => {
  if (!raw || raw === '-' || String(raw).trim() === '') return null;
  const u = String(raw).trim();
  if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
  const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
  if (!base) return u;
  return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
};

// 업로드 API (필드명 'file')
async function uploadRoleImageSlot1(file) {
  const code = localStorage.getItem('code');
  if (!code) throw new Error('게임 코드가 없습니다. (code)');
  const form = new FormData();
  form.append('file', file);
  const res = await axiosInstance.post(
    `/custom-games/${code}/role-images/3`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  const url = res?.data?.url || res?.data?.image_url;
  if (!url) throw new Error('업로드 응답에 url이 없습니다.');
  return url;
}

export default function Editor02_1() {
  const navigate = useNavigate();

  const [title, setTitle] = useState(localStorage.getItem("creatorTitle") || "");
  const [currentIndex, setCurrentIndex] = useState(0);

  // 1번 역할 설명/라벨
  const descFromLocal = localStorage.getItem('charDes3') || '';
  const labelFromLocal = localStorage.getItem('char3') || '';

  const [paragraphs, setParagraphs] = useState([{ main: descFromLocal }]);

  // ⭐ 1번 역할 이미지: URL + 폴백 플래그
  const [img1, setImg1] = useState(() => resolveImageUrl(localStorage.getItem(ROLE_IMG_KEY_2)));
  const [fallback1, setFallback1] = useState(!img1);

  // 최초 로딩: 역할 이미지 GET → 로컬/상태 반영
  useEffect(() => {
    (async () => {
      try {
        const code = localStorage.getItem('code');
        if (!code) return;

        const res = await axiosInstance.get(`/custom-games/${code}/role-images`, {
          headers: { 'Content-Type': 'application/json' },
        });
        const urls = res?.data?.urls || {};

        if (urls['1']) {
          localStorage.setItem(ROLE_IMG_KEY_2, urls['3']);
          const u = resolveImageUrl(urls['3']);
          setImg1(u);
          setFallback1(!u);
        } else {
          // 서버에 없으면 로컬 값 사용 → 그래도 없으면 폴백
          const saved = resolveImageUrl(localStorage.getItem(ROLE_IMG_KEY_2));
          setImg1(saved);
          setFallback1(!saved);
        }
      } catch (err) {
        console.error('역할1 이미지 로드 실패:', err);
        const saved = resolveImageUrl(localStorage.getItem(ROLE_IMG_KEY_2));
        setImg1(saved);
        setFallback1(!saved);
      }
    })();
  }, []);

  // 1번 역할 이미지 업로드 → 로컬 덮어쓰기 → 상태 반영
  const handleImageChangeSlot1 = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        setFallback1(false);
        const rawUrl = await uploadRoleImageSlot1(file);
        localStorage.setItem(ROLE_IMG_KEY_2, rawUrl);
        const resolved = resolveImageUrl(rawUrl);
        setImg1(resolved);
        setFallback1(!resolved);
      } catch (err) {
        console.error(err);
        alert('역할 이미지 업로드에 실패했습니다.');
        setFallback1(true);
      }
    };
    input.click();
  };

  // 레이아웃용 상수
  const STAGE_MAX_WIDTH = 1060;
  const MEDIA_WIDTH = 200;
  const MEDIA_HEIGHT = 200;

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
      nextPath="/editor03"
      backPath="/editor02_2"
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
                position: 'relative',
              }}
            >
              {/* 이미지 변경 버튼 (좌상단) */}
              <button
                type="button"
                onClick={handleImageChangeSlot1}
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
                src={!fallback1 && img1 ? img1 : defaultRoleImg}
                alt="역할1 이미지"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={() => setFallback1(true)}
                onLoad={() => setFallback1(false)}
              />
            </div>

            {/* 이미지 하단 라벨 (charbg + 흰 박스 + 직업명) */}
            <div
              style={{
                width: MEDIA_WIDTH,
                marginTop: 6,
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 42,
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
                  color: Colors.player1P,
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
