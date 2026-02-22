import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox2';
import UserProfile from '../components/Userprofile';

import { useWebRTC } from '../WebRTCProvider';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import voiceManager from '../utils/voiceManager';
import { useHostActions, useWebSocketNavigation } from '../hooks/useWebSocketMessage';
// Player2 description images for different subtopics
import player2DescImg_title1 from '../assets/2player_des1.svg';
import player2DescImg_title2 from '../assets/2player_des2.svg';
import player2DescImg_title3 from '../assets/2player_des3.svg';

//  영문용 에셋 임포트 (_en)
import player2DescImg_title1_en from '../assets/en/2player_des1_en.svg';
import player2DescImg_title2_en from '../assets/en/2player_des2_en.svg';
import player2DescImg_title3_en from '../assets/en/2player_des3_en.svg';

import { resolveParagraphs } from '../utils/resolveParagraphs';
import AWS_1 from "../assets/2player_AWS_1.svg";
import AWS_2 from "../assets/2player_AWS_2.svg";
import AWS_3 from "../assets/2player_AWS_3.svg";
import AWS_4 from "../assets/2player_AWS_4.svg";
import AWS_5 from "../assets/2player_AWS_5.svg";

//  영문용 AWS 에셋 임포트 (_en)
import AWS_1_en from "../assets/en/2player_AWS_1_en.svg";
import AWS_2_en from "../assets/en/2player_AWS_2_en.svg";
import AWS_3_en from "../assets/en/2player_AWS_3_en.svg";
import AWS_4_en from "../assets/en/2player_AWS_4_en.svg";
import AWS_5_en from "../assets/en/2player_AWS_5_en.svg";

import { useWebSocket } from '../WebSocketProvider';
import defaultimg from "../assets/images/Frame235.png";

import axiosInstance from '../api/axiosInstance';
//  다국어 지원 임포트
import { translations } from '../utils/language';

export default function CD2() {
  const navigate = useNavigate();
  useWebSocketNavigation(navigate, { 
    infoPath: '/game02',
    nextPagePath: '/game02'
  });
  const { isConnected, reconnectAttempts, maxReconnectAttempts,finalizeDisconnection } = useWebSocket();

  //  다국어 설정
  const lang = localStorage.getItem('language') || localStorage.getItem('app_lang') || 'ko';
  const t = translations[lang].CharacterDescription;
  const t_map = translations[lang].GameMap;
  // ✅ 이미지 매칭을 위해 한국어 맵 기준점 확보
  const t_ko_map = translations['ko'].GameMap;

  const currentCategory = localStorage.getItem('category') || '';

// 2. 안드로이드 여부 확인 (한글/영어/대소문자 무관하게 체크)
  const isAndroid = currentCategory.includes('안드로이드') || currentCategory.toLowerCase().includes('android');

// 3. 안드로이드가 아니면 모두 AWS로 간주 (향후 외국어 추가 시 대응 가능)
  const isAWS = !isAndroid;
  //  커스텀 모드 판단: code 존재 여부
  const isCustomMode = !!localStorage.getItem('code');

  //  커스텀 모드일 때 subtopic은 creatorTitle로 대체
  const creatorTitle = localStorage.getItem('creatorTitle') || '';
  const rawSubtopic = localStorage.getItem('subtopic');
  const subtopic = isCustomMode ? creatorTitle : (rawSubtopic ?? 'AI의 개인 정보 수집');

  const mateName = localStorage.getItem('mateName') ?? 'HomeMate';

   const [round, setRound] = useState();
   // 1. 라운드 계산
    useEffect(() => {
      const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
      const nextRound = completed.length + 1;
      setRound(nextRound);
      localStorage.setItem('currentRound', String(nextRound));
    }, []);
  const { isHost, sendNextPage } = useHostActions();
// // 새로고침 시 재연결 로직 
//  useEffect(() => {
//      let cancelled = false;
//      const isReloadingGraceLocal = () => {
//        const flag = sessionStorage.getItem('reloading') === 'true';
//        const expire = parseInt(sessionStorage.getItem('reloading_expire_at') || '0', 10);
//        if (!flag) return false;
//        if (Date.now() > expire) {
//          sessionStorage.removeItem('reloading');
//          sessionStorage.removeItem('reloading_expire_at');
//          return false;
//        }
//        return true;
//      };
    
//      if (!isConnected) {
//        // 1) reloading-grace가 켜져 있으면 finalize 억제
//        if (isReloadingGraceLocal()) {
//          console.log('♻️ reloading grace active — finalize 억제');
//          return;
//        }
    
//        // 2) debounce: 잠깐 기다렸다가 여전히 끊겨있으면 finalize
//        const DEBOUNCE_MS = 1200;
//        const timer = setTimeout(() => {
//          if (cancelled) return;
//          if (!isConnected && !isReloadingGraceLocal()) {
//            console.warn('🔌 WebSocket 연결 끊김 → 초기화 (확정)');
//            finalizeDisconnection('❌ 연결이 끊겨 게임이 초기화됩니다.');
//          } else {
//            console.log('🔁 재연결/리로드 감지 — finalize 스킵');
//          }
//        }, DEBOUNCE_MS);
    
//        return () => {
//          cancelled = true;
//          clearTimeout(timer);
//        };
//      }
//    }, [isConnected, finalizeDisconnection]);

  // WebRTC audio state
  const { voiceSessionStatus, roleUserMapping, myRoleId } = useWebRTC();
  const { getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);
  
  const getVoiceState = (role) => {
    if (String(role) === myRoleId) {
      return {
        is_speaking: voiceSessionStatus.isSpeaking,
        is_mic_on: voiceSessionStatus.isConnected,
        nickname: voiceSessionStatus.nickname || ''
      };
    }
    return getVoiceStateForRole(role);
  };

 
// 받침(종성) 유무 판별
function hasFinalConsonant(kor) {
  //  영문일 경우 조사 불필요
  if (lang === 'en') return false;
  const lastChar = kor[kor.length - 1];
  const code = lastChar.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    const jong = (code - 0xac00) % 28;
    return jong !== 0;
  }
  return false;
}

// 을/를
 function getEulReul(word) {
  if (!word || lang === 'en') return '';
  return hasFinalConsonant(word) ? '을' : '를';
}

// 과/와
 function getGwaWa(word) {
  if (!word || lang === 'en') return '';
  return hasFinalConsonant(word) ? '과' : '와';
}

// 은/는
 function getEunNeun(word) {
  if (!word || lang === 'en') return '';
  return hasFinalConsonant(word) ? '은' : '는';
}
  // 기본 이미지 & 텍스트
  //  이미지 선택 헬퍼
  const getImg = (koImg, enImg) => (lang === 'en' ? enImg : koImg);

  // 로직 개선: 한국어 매칭값과 현재 언어 매칭값 모두 확인 (이미지는 한국어 원문 데이터에 종속적이기 때문)
  let descImg = getImg(player2DescImg_title1, player2DescImg_title1_en);
  let mainText = t.cd2_android_home;

  if (!isAWS) {
    if (subtopic === t_map.andOption2_1 || subtopic === t_ko_map.andOption2_1 || subtopic === t_map.andOption2_2 || subtopic === t_ko_map.andOption2_2) {
      descImg = getImg(player2DescImg_title2, player2DescImg_title2_en);
      mainText = t.cd2_android_council;
    } else if (subtopic === t_map.andOption3_1 || subtopic === t_ko_map.andOption3_1) {
      descImg = getImg(player2DescImg_title3, player2DescImg_title3_en);
      mainText = t.cd2_android_international;
    }
  } else {
    // 자율 무기 시스템 분기
    // switch문 조건에서 t_ko_map을 함께 확인하여 영문 모드에서도 이미지 매칭 성공하도록 수정
    switch (true) {
      case subtopic === t_map.awsOption1_1 || subtopic === t_ko_map.awsOption1_1:
        descImg = getImg(AWS_1, AWS_1_en);
        mainText = t.cd2_aws_1;
        break;

      case subtopic === t_map.awsOption1_2 || subtopic === t_ko_map.awsOption1_2:
        descImg = getImg(AWS_2, AWS_2_en);
        mainText = t.cd2_aws_2;
        break;

      case subtopic === t_map.awsOption2_1 || subtopic === t_ko_map.awsOption2_1:
        descImg = getImg(AWS_3, AWS_3_en);
        mainText = t.cd2_aws_3;
        break;

      case subtopic === t_map.awsOption2_2 || subtopic === t_ko_map.awsOption2_2:
        descImg = getImg(AWS_4, AWS_4_en);
        mainText = t.cd2_aws_4;
        break;

      case subtopic === t_map.awsOption3_1 || subtopic === t_ko_map.awsOption3_1:
        descImg = getImg(AWS_5, AWS_5_en);
        mainText = t.cd2_aws_5;
        break;

      default:
        mainText = t.aws_default;
        break;
    }
  }

  // URL 보정 유틸 (Editor 계열과 동일)
  const resolveImageUrl = (raw) => {
    if (!raw || raw === '-' || String(raw).trim() === '') return null;
    const u = String(raw).trim();
    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
    const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
    if (!base) return u;
    return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
  };

  //  커스텀 모드: 텍스트/이미지/서브토픽 교체
  if (isCustomMode) {
    // 텍스트: charDes2 (단일 문자열)
    const charDes2 = (localStorage.getItem('charDes2') || '').trim();
    if (charDes2) {
      mainText = charDes2;
    }

    // 이미지: role_image_2 (문자열 경로)
    const rawRoleImg = localStorage.getItem('role_image_2') || '';
    const customImg = resolveImageUrl(rawRoleImg);
    // ✅ 커스텀 모드에서는 role_image가 없으면 기본 이미지(Frame235)로 표시
    descImg = customImg ?? defaultimg;
    // subtopic은 위에서 creatorTitle로 이미 치환됨
  }

  const paragraphs = [{ 
    main: mainText
      .replaceAll('{{mateName}}', mateName)
      .replaceAll('{{eulReul}}', getEulReul(mateName))
      .replaceAll('{{gwaWa}}', getGwaWa(mateName))
      .replaceAll('{{eunNeun}}', getEunNeun(mateName))
  }];

  const handleContinue = () => {
    navigate('/character_all');
    // if (isHost) sendNextPage();
    // else alert('⚠️ 방장만 진행할 수 있습니다.');
  };

  const handleBackClick = () => {
    navigate('/game01'); 
  };

  return (
    <>
      <Layout round={round} subtopic={subtopic} me="2P" onBackClick={handleBackClick}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
          marginTop: 22
        }}>
          <img
            src={descImg}
            alt="Player 2 설명 이미지"
            style={{ width: 264, height: 336, objectFit: 'contain', marginBottom: -20 }}
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
                e.currentTarget.src = defaultimg;
                return;
              }
              e.currentTarget.style.display = 'none'; 
            }}
          />
          <div style={{ width: '100%', maxWidth: 900 }}>
            <ContentTextBox
              paragraphs={paragraphs}
              onContinue={handleContinue}
            />
          </div>
        </div>
      </Layout>
    </>
  );
}