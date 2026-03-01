// pages/CD1.jsx
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox2';
// Player1 설명 이미지 에셋
import player1DescImg_title1 from '../assets/1player_des1.svg';
import player1DescImg_title2 from '../assets/1player_des2.svg';
import player1DescImg_title3 from '../assets/1player_des3.svg';
import AWS_1 from '../assets/1player_AWS_1.svg';
import AWS_2 from '../assets/1player_AWS_2.svg';
import AWS_3 from '../assets/1player_AWS_3.svg';
import AWS_4 from '../assets/1player_AWS_4.svg';
import AWS_5 from '../assets/1player_AWS_5.svg';

// 영문용 에셋 임포트
import player1DescImg_title1_en from '../assets/en/1player_des1_en.svg';
import player1DescImg_title2_en from '../assets/en/1player_des2_en.svg'; 
import player1DescImg_title3_en from '../assets/en/1player_des3_en.svg'; 
import AWS_1_en from '../assets/en/1player_AWS_1_en.svg';
import AWS_2_en from '../assets/en/1player_AWS_2_en.svg';
import AWS_3_en from '../assets/en/1player_AWS_3_en.svg';
import AWS_4_en from '../assets/en/1player_AWS_4_en.svg';
import AWS_5_en from '../assets/en/1player_AWS_5_en.svg';

import defaultimg from "../assets/images/Frame235.png";

// 다국어 지원 및 유틸 임포트
import { translations } from '../utils/language';
import { resolveParagraphs } from '../utils/resolveParagraphs';
import { useHostActions, useWebSocketNavigation } from '../hooks/useWebSocketMessage';
import { useWebRTC } from '../WebRTCProvider';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import axiosInstance from '../api/axiosInstance';
import { useWebSocket } from '../WebSocketProvider';
import voiceManager from '../utils/voiceManager';

export default function CD1() {
  const navigate = useNavigate();
  
  // 페이지 이동 메시지 핸들러
  useWebSocketNavigation(navigate, { infoPath: '/game02', nextPagePath: '/game02' });
  const { isConnected, finalizeDisconnection } = useWebSocket();

  // 프로젝트 표준 다국어 로드 로직
  const lang = localStorage.getItem('app_lang') || 'ko';
  const t = translations?.[lang]?.CharacterDescription || translations['ko']?.CharacterDescription || {};
  const t_map = translations?.[lang]?.GameMap || translations['ko']?.GameMap || {};

  // 음성 세션 초기화 상태 추가 (ReferenceError 해결)
  const [voiceInitialized, setVoiceInitialized] = useState(false);

  const category = localStorage.getItem('category') || '안드로이드';
  const isAndroid = category.includes('안드로이드') || category.toLowerCase().includes('android');
  const isAWS = !isAndroid;

  // 커스텀 모드 판단
  const isCustomMode = !!localStorage.getItem('code');

  // 서브토픽 및 라운드 설정
  const rawSubtopic = localStorage.getItem('subtopic');
  const creatorTitle = localStorage.getItem('creatorTitle') || '';
  const subtopic = isCustomMode ? creatorTitle : (rawSubtopic || '');
  const [round, setRound] = useState();

  // 세션 정보 로그 출력
  useEffect(() => {
    console.log('[CD1] Current Session Info:', { lang, category, subtopic });
  }, []);

  // 라운드 계산 및 저장
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const nextRound = completed.length + 1;
    setRound(nextRound);
    localStorage.setItem('currentRound', String(nextRound));
  }, []);

  // 새로고침 시 재연결 로직 (기존 개발자 주석 유지)
  /*
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
       if (isReloadingGraceLocal()) return;
       const DEBOUNCE_MS = 1200;
       const timer = setTimeout(() => {
         if (cancelled) return;
         if (!isConnected && !isReloadingGraceLocal()) {
           finalizeDisconnection('❌ 연결이 끊겨 게임이 초기화됩니다.');
         }
       }, DEBOUNCE_MS);
    
       return () => {
         cancelled = true;
         clearTimeout(timer);
       };
     }
  }, [isConnected, finalizeDisconnection]);
  */

  const mateName = localStorage.getItem('mateName') ?? 'HomeMate';

  const { voiceSessionStatus, roleUserMapping, myRoleId } = useWebRTC();
  const { getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);
  const { isHost, sendNextPage } = useHostActions();

  // 음성 상태 반환 함수
  const getVoiceState = (role) => {
    if (String(role) === myRoleId) {
      return {
        is_speaking: voiceSessionStatus.isSpeaking,
        is_mic_on: voiceSessionStatus.isConnected,
        nickname: voiceSessionStatus.nickname || '',
      };
    }
    return getVoiceStateForRole(role);
  };

  // 받침 유무 판별 (한국어 전용)
  function hasFinalConsonant(kor) {
    if (lang !== 'ko') return false; 
    const lastChar = kor[kor.length - 1];
    const code = lastChar.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const jong = (code - 0xac00) % 28;
      return jong !== 0;
    }
    return false;
  }

  // 조사 치환 함수
  const getEulReul = (word) => (lang !== 'ko' ? '' : (hasFinalConsonant(word) ? '을' : '를'));
  const getGwaWa = (word) => (lang !== 'ko' ? '' : (hasFinalConsonant(word) ? '과' : '와'));
  const getEunNeun = (word) => (lang !== 'ko' ? '' : (hasFinalConsonant(word) ? '은' : '는'));

  // 이미지 및 텍스트 결정 로직
  const getImg = (koImg, enImg) => (lang !== 'ko' && enImg ? enImg : koImg);

  let descImg = getImg(player1DescImg_title1, player1DescImg_title1_en);
  let mainText = t.cd1_android_home || "당신은 요양보호사 K입니다.";

  if (!isAWS) {
    // 안드로이드 분기
    if (subtopic === t_map.andOption2_1 || subtopic === t_map.andOption2_2 || subtopic === '아이들을 위한 서비스' || subtopic === '설명 가능한 AI') {
      descImg = getImg(player1DescImg_title2, player1DescImg_title2_en);
      mainText = t.cd1_android_council;
    } else if (subtopic === t_map.andOption3_1 || subtopic === '지구, 인간, AI') {
      descImg = getImg(player1DescImg_title3, player1DescImg_title3_en);
      mainText = t.cd1_android_international;
    }
  } else {
    // 자율 무기 시스템 분기
    switch (subtopic) {
      case 'AI 알고리즘 공개':
      case t_map.awsOption1_1:
        descImg = getImg(AWS_1, AWS_1_en);
        mainText = t.cd1_aws_1;
        break;
      case 'AWS의 권한':
      case t_map.awsOption1_2:
        descImg = getImg(AWS_2, AWS_2_en);
        mainText = t.cd1_aws_2;
        break;
      case '사람이 죽지 않는 전쟁':
      case t_map.awsOption2_1:
        descImg = getImg(AWS_3, AWS_3_en);
        mainText = t.cd1_aws_3;
        break;
      case 'AI의 권리와 책임':
      case t_map.awsOption2_2:
        descImg = getImg(AWS_4, AWS_4_en);
        mainText = t.cd1_aws_4;
        break;
      case 'AWS 규제':
      case t_map.awsOption3_1:
        descImg = getImg(AWS_5, AWS_5_en);
        mainText = t.cd1_aws_5;
        break;
      default:
        mainText = t.aws_default;
        break;
    }
  }

  // URL 보정 유틸
  const resolveImageUrl = (raw) => {
    if (!raw || raw === '-' || String(raw).trim() === '') return null;
    const u = String(raw).trim();
    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
    const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
    return base ? `${base}${u.startsWith('/') ? '' : '/'}${u}` : u;
  };

  // 커스텀 모드 데이터 적용
  if (isCustomMode) {
    const charDes1 = (localStorage.getItem('charDes1') || '').trim();
    if (charDes1) mainText = charDes1;
    const customImg = resolveImageUrl(localStorage.getItem('role_image_1') || '');
    descImg = customImg ?? defaultimg;
  }

  // 최종 문구 구성
  const paragraphs = [{ 
    main: (mainText || "")
      .replaceAll('{{mateName}}', mateName)
      .replaceAll('{{eulReul}}', getEulReul(mateName))
      .replaceAll('{{gwaWa}}', getGwaWa(mateName))
      .replaceAll('{{eunNeun}}', getEunNeun(mateName))
  }];

  // 음성 세션 초기화 로직
  const initializeVoice = useCallback(async () => {
    if (voiceInitialized) return;
    const sessionId = localStorage.getItem('session_id');
    if (!sessionId) return;
    try {
      const success = await voiceManager.initializeVoiceSession();
      if (success) {
        setVoiceInitialized(true);
        setTimeout(() => voiceManager.startSpeechDetection(), 1000);
      }
    } catch (err) { console.error(err); }
  }, [voiceInitialized]);

  // 마운트 시 음성 세션 가동
  useEffect(() => {
    const timer = setTimeout(() => initializeVoice(), 1000);
    return () => clearTimeout(timer);
  }, [initializeVoice]);

  const handleContinue = () => {
    navigate('/character_all');
  };

  const handleBackClick = () => {
    navigate('/game01');
  };

  return (
    <Layout round={round} subtopic={subtopic} me="1P" onBackClick={handleBackClick}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, marginTop: 22 }}>
        <img
          src={descImg}
          alt="Player 1 설명 이미지"
          style={{ width: 264, height: 336, objectFit: 'contain', marginBottom: -20 }}
          onError={(e) => {
            const retryCount = parseInt(e.currentTarget.dataset.retryCount || '0');
            if (retryCount < 3) {
              e.currentTarget.dataset.retryCount = String(retryCount + 1);
              const cacheBuster = `?retry=${retryCount + 1}&t=${Date.now()}`;
              const newSrc = e.currentTarget.src.includes('?') ? `${e.currentTarget.src.split('?')[0]}${cacheBuster}` : `${e.currentTarget.src}${cacheBuster}`;
              setTimeout(() => { if (e.currentTarget) e.currentTarget.src = newSrc; }, 300 * retryCount);
              return;
            }
            if (e.currentTarget.dataset.fallbackAttempted !== 'true') {
              e.currentTarget.dataset.fallbackAttempted = 'true';
              e.currentTarget.src = defaultimg;
              return;
            }
            e.currentTarget.style.display = 'none'; 
          }}
        />
        <div style={{ width: '100%', maxWidth: 900 }}>
          <ContentTextBox paragraphs={paragraphs} onContinue={handleContinue} />
        </div>
      </div>
    </Layout>
  );
}