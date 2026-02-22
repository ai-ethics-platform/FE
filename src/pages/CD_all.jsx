//캐릭터끼리 설명하세요 페이지 
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate 임포트 유지
import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox2';
import { Colors, FontStyles } from '../components/styleConstants';
import create02Image from '../assets/images/Frame235.png';

//  다국어 지원 임포트
import { translations } from '../utils/language';

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

//  영문 전용 이미지 에셋 (_en)
import player1DescImg_title1_en from '../assets/en/1player_des1_en.svg';
import player1DescImg_title2_en from '../assets/en/1player_des2_en.svg';
import player1DescImg_title3_en from '../assets/en/1player_des3_en.svg';
import AWS_1_en from '../assets/en/1player_AWS_1_en.svg';
import AWS_2_en from '../assets/en/1player_AWS_2_en.svg';
import AWS_3_en from '../assets/en/1player_AWS_3_en.svg';
import AWS_4_en from '../assets/en/1player_AWS_4_en.svg';
import AWS_5_en from '../assets/en/1player_AWS_5_en.svg';

// 2P, 3P 영문 에셋 임포트
import player2DescImg_title1_en from '../assets/en/2player_des1_en.svg';
import player2DescImg_title2_en from '../assets/en/2player_des2_en.svg';
import player2DescImg_title3_en from '../assets/en/2player_des3_en.svg';
import AWS_1_2_en from '../assets/en/2player_AWS_1_en.svg';
import AWS_2_2_en from '../assets/en/2player_AWS_2_en.svg';
import AWS_3_2_en from '../assets/en/2player_AWS_3_en.svg';
import AWS_4_2_en from '../assets/en/2player_AWS_4_en.svg';
import AWS_5_2_en from '../assets/en/2player_AWS_5_en.svg';

import player3DescImg_title1_en from '../assets/en/3player_des1_en.svg';
import player3DescImg_title2_en from '../assets/en/3player_des2_en.svg';
import player3DescImg_title3_en from '../assets/en/3player_des3_en.svg';
import AWS_1_3_en from '../assets/en/3player_AWS_1_en.svg';
import AWS_2_3_en from '../assets/en/3player_AWS_2_en.svg';
import AWS_3_3_en from '../assets/en/3player_AWS_3_en.svg';
import AWS_4_3_en from '../assets/en/3player_AWS_4_en.svg';
import AWS_5_3_en from '../assets/en/3player_AWS_5_en.svg';

import bubbleSvg from '../assets/bubble.svg';
import bubblePolygonSvg from '../assets/bubble_polygon.svg';
import axiosInstance from '../api/axiosInstance';
import { useWebSocket } from '../WebSocketProvider';

export default function CD_all() {
  const navigate = useNavigate();

  //  현재 언어 설정 및 언어팩
  const lang = localStorage.getItem('app_lang') || 'ko';
  const t = translations[lang].CharacterDescription;
  const t_map = translations[lang].GameMap;
  const t_ko_map = translations['ko'].GameMap;

  const [title, setTitle] = useState(localStorage.getItem('title') || '');
  const [category, setCategory] = useState(localStorage.getItem('category') || '');
  const [subtopic, setSubtopic] = useState(localStorage.getItem('subtopic') || '');
  const [currentIndex, setCurrentIndex] = useState(0);
  const myRoleId = localStorage.getItem('myrole_id');

  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [round, setRound] = useState();
  const [isDefaultImage1, setIsDefaultImage1] = useState(true);
  const [isDefaultImage2, setIsDefaultImage2] = useState(true);
  const [isDefaultImage3, setIsDefaultImage3] = useState(true);

  const [openProfile, setOpenProfile] = useState(null);

  // 사이드바 가이드 말풍선 노출 여부 상태
  const [showSidebarGuide, setShowSidebarGuide] = useState(false);

  const isCustomMode = !!localStorage.getItem('code');
  const creatorTitle = localStorage.getItem('creatorTitle') || '';
  const { isConnected, reconnectAttempts, maxReconnectAttempts, finalizeDisconnection } = useWebSocket();

  // 1. 라운드 계산 및 가이드 초기화
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const nextRound = completed.length + 1;
    setRound(nextRound);
    localStorage.setItem('currentRound', String(nextRound));
    
    // 사이드바 가이드를 아직 확인하지 않았다면 표시
    setShowSidebarGuide(true);
  }, []);

  // 새로고침 시 재연결 로직 
  // useEffect(() => {
  //     let cancelled = false;
  //     const isReloadingGraceLocal = () => {
  //       const flag = sessionStorage.getItem('reloading') === 'true';
  //       const expire = parseInt(sessionStorage.getItem('reloading_expire_at') || '0', 10);
  //       if (!flag) return false;
  //       if (Date.now() > expire) {
  //         sessionStorage.removeItem('reloading');
  //         sessionStorage.removeItem('reloading_expire_at');
  //         return false;
  //       }
  //       return true;
  //     };
    
  //     if (!isConnected) {
  //       // 1) reloading-grace가 켜져 있으면 finalize 억제
  //       if (isReloadingGraceLocal()) {
  //         console.log('♻️ reloading grace active — finalize 억제');
  //         return;
  //       }
    
  //       // 2) debounce: 잠깐 기다렸다가 여전히 끊겨있으면 finalize
  //       const DEBOUNCE_MS = 1200;
  //       const timer = setTimeout(() => {
  //         if (cancelled) return;
  //         if (!isConnected && !isReloadingGraceLocal()) {
  //           console.warn('🔌 WebSocket 연결 끊김 → 초기화 (확정)');
  //           finalizeDisconnection('❌ 연결이 끊겨 게임이 초기화됩니다.');
  //         } else {
  //           console.log('🔁 재연결/리로드 감지 — finalize 스킵');
  //         }
  //       }, DEBOUNCE_MS);
    
  //       return () => {
  //         cancelled = true;
  //         clearTimeout(timer);
  //       };
  //     }
  //   }, [isConnected, finalizeDisconnection]);

  // 기본 문구
  let paragraphs = [{ main: t.all_guide }];

  // 커스텀 모드면 문구 교체
  if (isCustomMode) {
    const guideText = t.all_custom_guide;
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
    // 커스텀 모드
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
      return;
    }

    //  언어에 따른 이미지 선택 헬퍼
    const getImg = (koImg, enImg) => (lang === 'en' && enImg ? enImg : koImg);

    // 기본 모드 매핑
    let imagePath = [];
    const isAndroid = category === '안드로이드' || category === 'Android' || category === t_map.categoryAndroid;
    const isAWS_Cat = category === '자율 무기 시스템' || category === 'Autonomous Weapon Systems' || category === t_map.categoryAWS;

    if (isAndroid) {
      if (title === '가정' || title === t_ko_map.andSection1Title || title === t_map.andSection1Title) {
        imagePath = [
          getImg(player1DescImg_title1, player1DescImg_title1_en), 
          getImg(player2DescImg_title1, player2DescImg_title1_en), 
          getImg(player3DescImg_title1, player3DescImg_title1_en)
        ];
      } else if (title === '국가 인공지능 위원회' || title === t_ko_map.andSection2Title || title === t_map.andSection2Title) {
        imagePath = [
          getImg(player1DescImg_title2, player1DescImg_title2_en),
          getImg(player2DescImg_title2, player2DescImg_title2_en),
          getImg(player3DescImg_title2, player3DescImg_title2_en)
        ];
      } else if (title === '국제 인류 발전 위원회' || title === t_ko_map.andSection3Title || title === t_map.andSection3Title) {
        imagePath = [
          getImg(player1DescImg_title3, player1DescImg_title3_en),
          getImg(player2DescImg_title3, player2DescImg_title3_en),
          getImg(player3DescImg_title3, player3DescImg_title3_en)
        ];
      }
    } else if (isAWS_Cat) {
      if (subtopic === 'AI 알고리즘 공개' || subtopic === t_ko_map.awsOption1_1 || subtopic === t_map.awsOption1_1) {
        imagePath = [
          getImg(AWS_1, AWS_1_en), 
          getImg(AWS_1_2, AWS_1_2_en), 
          getImg(AWS_1_3, AWS_1_3_en)
        ];
      } else if (subtopic === 'AWS의 권한' || subtopic === t_ko_map.awsOption1_2 || subtopic === t_map.awsOption1_2) {
        imagePath = [
          getImg(AWS_2, AWS_2_en), 
          getImg(AWS_2_2, AWS_2_2_en), 
          getImg(AWS_2_3, AWS_2_3_en)
        ];
      } else if (subtopic === '사람이 죽지 않는 전쟁' || subtopic === t_ko_map.awsOption2_1 || subtopic === t_map.awsOption2_1) {
        imagePath = [
          getImg(AWS_3, AWS_3_en), 
          getImg(AWS_3_2, AWS_3_2_en), 
          getImg(AWS_3_3, AWS_3_3_en)
        ];
      } else if (subtopic === 'AI의 권리와 책임' || subtopic === t_ko_map.awsOption2_2 || subtopic === t_map.awsOption2_2) {
        imagePath = [
          getImg(AWS_4, AWS_4_en), 
          getImg(AWS_4_2, AWS_4_2_en), 
          getImg(AWS_4_3, AWS_4_3_en)
        ];
      } else if (subtopic === 'AWS 규제' || subtopic === t_ko_map.awsOption3_1 || subtopic === t_map.awsOption3_1) {
        imagePath = [
          getImg(AWS_5, AWS_5_en), 
          getImg(AWS_5_2, AWS_5_2_en), 
          getImg(AWS_5_3, AWS_5_3_en)
        ];
      }
    }

    if (imagePath.length > 0) {
      setImage1(imagePath[0]);
      setImage2(imagePath[1]);
      setImage3(imagePath[2]);
      setIsDefaultImage1(false);
      setIsDefaultImage2(false);
      setIsDefaultImage3(false);
    } else {
      setImage1(create02Image);
      setImage2(create02Image);
      setImage3(create02Image);
    }
  }, [isCustomMode, category, title, subtopic, lang]);

  const handleBackClick = () => {
    navigate(`/character_description${myRoleId}`);
  };

  return (
    <Layout
      subtopic={isCustomMode ? creatorTitle : subtopic}
      round={round}
      onProfileClick={(p) => {
        setOpenProfile(p);
        // 프로필 클릭 시 가이드 끄기
        setShowSidebarGuide(false);

        //localStorage.setItem('sidebar_guide_seen', 'true');
        
      }}
      onBackClick={handleBackClick}
      sidebarExtra={
        showSidebarGuide && (
          <div
            style={{
              position: 'relative',
              textAlign: 'center',
              width: 'clamp(200px, 18vw, 230px)',
              pointerEvents: 'none', 
            }}
          >
            <img
              src={bubbleSvg}
              alt="Bubble"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
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
              <div dangerouslySetInnerHTML={{ __html: t.sidebar_bubble }} />
            </span>
          </div>
        )
      }
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
              { image: image1, isDefault: isDefaultImage1 },
              { image: image2, isDefault: isDefaultImage2 },
              { image: image3, isDefault: isDefaultImage3 },
            ].map(({ image, isDefault }, idx) => (
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
                  src={image || create02Image}
                  alt={`역할 이미지 ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={(e) => {
                    const retryCount = parseInt(e.currentTarget.dataset.retryCount || '0');
                    if (retryCount < 3) {
                      e.currentTarget.dataset.retryCount = String(retryCount + 1);
                      const imgSrc = e.currentTarget.src;
                      const cacheBuster = `?retry=${retryCount + 1}&t=${Date.now()}`;
                      const newSrc = imgSrc.includes('?') ? `${imgSrc.split('?')[0]}${cacheBuster}` : `${imgSrc}${cacheBuster}`;
                      setTimeout(() => { if (e.currentTarget) e.currentTarget.src = newSrc; }, 300 * retryCount);
                      return;
                    }
                    if (e.currentTarget.dataset.fallbackAttempted !== 'true') {
                      e.currentTarget.dataset.fallbackAttempted = 'true';
                      e.currentTarget.dataset.retryCount = '0';
                      e.currentTarget.src = create02Image;
                      return;
                    }
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ))}
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