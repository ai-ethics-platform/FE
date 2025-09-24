import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import ContentTextBox from '../components/ContentTextBox2';
import { Colors, FontStyles } from '../components/styleConstants';
import create02Image from '../assets/images/Frame235.png';

import player1DescImg_title1 from '../assets/1player_des1.svg';
import player1DescImg_title2 from '../assets/1player_des2.svg';
import player1DescImg_title3 from '../assets/1player_des3.svg';
import AWS_1 from '../assets/1player_AWS_1.svg';
import AWS_2 from '../assets/1player_AWS_2.svg';
import AWS_3 from '../assets/1player_AWS_3.svg';
import AWS_4 from '../assets/1player_AWS_4.svg';
import AWS_5 from '../assets/1player_AWS_5.svg';
import player2DescImg_title1 from '../assets/2player_des1.svg';
import player2DescImg_title2 from '../assets/2player_des2.svg';
import player2DescImg_title3 from '../assets/2player_des3.svg';
import AWS_1_2 from '../assets/2player_AWS_1.svg';
import AWS_2_2 from '../assets/2player_AWS_2.svg';
import AWS_3_2 from '../assets/2player_AWS_3.svg';
import AWS_4_2 from '../assets/2player_AWS_4.svg';
import AWS_5_2 from '../assets/2player_AWS_5.svg';
import player3DescImg_title1 from '../assets/3player_des1.svg';
import player3DescImg_title2 from '../assets/3player_des2.svg';
import player3DescImg_title3 from '../assets/3player_des3.svg';
import AWS_1_3 from '../assets/3player_AWS_1.svg';
import AWS_2_3 from '../assets/3player_AWS_2.svg';
import AWS_3_3 from '../assets/3player_AWS_3.svg';
import AWS_4_3 from '../assets/3player_AWS_4.svg';
import AWS_5_3 from '../assets/3player_AWS_5.svg';

import bubbleSvg from '../assets/bubble.svg';
import bubblePolygonSvg from '../assets/bubble_polygon.svg';
import axiosInstance from '../api/axiosInstance';
import { useWebSocket } from '../WebSocketProvider';

export default function Editor02() {
  const navigate = useNavigate();

  const [title, setTitle] = useState(localStorage.getItem('title') || '');
  const [category, setCategory] = useState(localStorage.getItem('category') || '');
  const [subtopic, setSubtopic] = useState(localStorage.getItem('subtopic') || '');
  const [currentIndex, setCurrentIndex] = useState(0);
  const myRoleId = localStorage.getItem('myrole_id');

  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
 const [round,setRound]=useState();
  const [isDefaultImage1, setIsDefaultImage1] = useState(true);
  const [isDefaultImage2, setIsDefaultImage2] = useState(true);
  const [isDefaultImage3, setIsDefaultImage3] = useState(true);

  const [openProfile, setOpenProfile] = useState(null);

  const isCustomMode = !!localStorage.getItem('code');
  const creatorTitle = localStorage.getItem('creatorTitle') || '';
  const { isConnected, reconnectAttempts, maxReconnectAttempts,finalizeDisconnection } = useWebSocket();

 // 1. 라운드 계산
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const nextRound = completed.length + 1;
    setRound(nextRound);
    localStorage.setItem('currentRound', String(nextRound));
  }, []);
 // 새로고침 시 재연결 로직 
  useEffect(() => {
      let cancelled = false;
      const isReloadingGraceLocal = () => {
        const flag = sessionStorage.getItem('reloading') === 'true';
        const expire = parseInt(sessionStorage.getItem('reloading_expire_at') || '0', 10);
        if (!flag) return false;
        if (Date.now() > expire) {
          sessionStorage.removeItem('reloading');
          sessionStorage.removeItem('reloading_expire_at');
          return false;
        }
        return true;
      };
    
      if (!isConnected) {
        // 1) reloading-grace가 켜져 있으면 finalize 억제
        if (isReloadingGraceLocal()) {
          console.log('♻️ reloading grace active — finalize 억제');
          return;
        }
    
        // 2) debounce: 잠깐 기다렸다가 여전히 끊겨있으면 finalize
        const DEBOUNCE_MS = 1200;
        const timer = setTimeout(() => {
          if (cancelled) return;
          if (!isConnected && !isReloadingGraceLocal()) {
            console.warn('🔌 WebSocket 연결 끊김 → 초기화 (확정)');
            finalizeDisconnection('❌ 연결이 끊겨 게임이 초기화됩니다.');
          } else {
            console.log('🔁 재연결/리로드 감지 — finalize 스킵');
          }
        }, DEBOUNCE_MS);
    
        return () => {
          cancelled = true;
          clearTimeout(timer);
        };
      }
    }, [isConnected, finalizeDisconnection]);
  // 기본 문구
  let paragraphs = [{ main: '각자 맡은 역할에 대해 돌아가면서 소개해 보세요.' }];

  // 커스텀 모드면 문구 교체
  if (isCustomMode) {
    //const rolesBackground = (localStorage.getItem('rolesBackground') || '').trim();
    const guideText = '각자의 역할을 소개하는 시간을 가져보세요.';
    paragraphs = [{ main: [guideText].filter(Boolean).join('\n\n') }];
  }

  const STAGE_MAX_WIDTH = 1060;
  const MEDIA_WIDTH = 260;
  const MEDIA_HEIGHT = 330;

  // 상대 경로 보정
  const resolveImageUrl = (raw) => {
    if (!raw || raw === '-' || String(raw).trim() === '') return null;
    const u = String(raw).trim();
    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
    const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
    if (!base) return u;
    return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
  };

  useEffect(() => {
    // 커스텀 모드: role_image_1~3 사용 + subtopic을 creatorTitle로 표기
    if (isCustomMode) {
      const r1 = resolveImageUrl(localStorage.getItem('role_image_1') || '');
      const r2 = resolveImageUrl(localStorage.getItem('role_image_2') || '');
      const r3 = resolveImageUrl(localStorage.getItem('role_image_3') || '');

      setImage1(r1);
      setImage2(r2);
      setImage3(r3);

      setIsDefaultImage1(!r1);
      setIsDefaultImage2(!r2);
      setIsDefaultImage3(!r3);

      // 화면 상단 표기를 위해서만 교체 (실제 상태 값은 유지)
      // setSubtopic(creatorTitle);  // 상태를 바꾸고 싶다면 주석 해제
      return;
    }

    // 기본 모드: 카테고리/타이틀/서브토픽에 따라 기본 이미지 매핑
    let imagePath = [];
    if (category === '안드로이드') {
      if (title === '가정') {
        imagePath = [player1DescImg_title1, player2DescImg_title1, player3DescImg_title1];
      } else if (title === '국가 인공지능 위원회') {
        imagePath = [player1DescImg_title2, player2DescImg_title2, player3DescImg_title2];
      } else if (title === '국제 인류 발전 위원회') {
        imagePath = [player1DescImg_title3, player2DescImg_title3, player3DescImg_title3];
      }
    } else if (category === '자율 무기 시스템') {
      if (subtopic === 'AI 알고리즘 공개') {
        imagePath = [AWS_1, AWS_1_2, AWS_1_3];
      } else if (subtopic === 'AWS의 권한') {
        imagePath = [AWS_2, AWS_2_2, AWS_2_3];
      } else if (subtopic === '사람이 죽지 않는 전쟁') {
        imagePath = [AWS_3, AWS_3_2, AWS_3_3];
      } else if (subtopic === 'AI의 권리와 책임') {
        imagePath = [AWS_4, AWS_4_2, AWS_4_3];
      } else if (subtopic === 'AWS 규제') {
        imagePath = [AWS_5, AWS_5_2, AWS_5_3];
      }
    }

    setImage1(imagePath[0]);
    setImage2(imagePath[1]);
    setImage3(imagePath[2]);

    setIsDefaultImage1(!imagePath[0]);
    setIsDefaultImage2(!imagePath[1]);
    setIsDefaultImage3(!imagePath[2]);
  }, [isCustomMode, category, title, subtopic]);

  const handleBackClick = () => {
    navigate(`/character_description${myRoleId}`);
  };

  return (
    <Layout
      subtopic={isCustomMode ? creatorTitle : subtopic}
      round={round}
      onProfileClick={setOpenProfile}
      onBackClick={handleBackClick}
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: STAGE_MAX_WIDTH, boxSizing: 'border-box' }}>
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
            {[
              { image: image1, isDefault: isDefaultImage1, setIsDefault: setIsDefaultImage1 },
              { image: image2, isDefault: isDefaultImage2, setIsDefault: setIsDefaultImage2 },
              { image: image3, isDefault: isDefaultImage3, setIsDefault: setIsDefaultImage3 },
            ].map(({ image, isDefault, setIsDefault }, idx) => (
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
                <img
                  src={image || (isDefault ? create02Image : '')}
                  alt={`역할 이미지 ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={(e) => {
                    e.currentTarget.src = create02Image;  // 깨지면 기본 이미지로 교체
                  }}
               />
              </div>
            ))}
          </div>

          {/* Bubble SVG와 텍스트 배치 (기존 유지) */}
          <div
          style={{
            position: 'fixed', 
            bottom: '190px',     
            left: '-200px',       
            zIndex: 1000,        
            textAlign: 'center',
          }}
        >
            <img src={bubbleSvg} alt="Bubble" style={{ width: '250px' }} />
            <span
              style={{
                width: '100%',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#fff',
                ...FontStyles.caption,
              }}
            >
              <>
                캐릭터 패널을 클릭하면 <br />
                해당 캐릭터의 정보를 볼 수 있습니다.
              </>
            </span>
          </div>

          <div style={{ width: '100%' }}>
            <ContentTextBox
              paragraphs={paragraphs}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              onContinue={() => navigate('/game02')}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
