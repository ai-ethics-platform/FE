import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox2';
import UserProfile from '../components/Userprofile';

import { useWebRTC } from '../WebRTCProvider';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import voiceManager from '../utils/voiceManager';
import { useHostActions, useWebSocketNavigation } from '../hooks/useWebSocketMessage';
// Player2 설명 이미지 에셋
import player2DescImg_title1 from '../assets/2player_des1.svg';
import player2DescImg_title2 from '../assets/2player_des2.svg';
import player2DescImg_title3 from '../assets/2player_des3.svg';

// 영문용 에셋 임포트
import player2DescImg_title1_en from '../assets/en/2player_des1_en.svg';
import player2DescImg_title2_en from '../assets/en/2player_des2_en.svg';
import player2DescImg_title3_en from '../assets/en/2player_des3_en.svg';

import { resolveParagraphs } from '../utils/resolveParagraphs';
import AWS_1 from "../assets/2player_AWS_1.svg";
import AWS_2 from "../assets/2player_AWS_2.svg";
import AWS_3 from "../assets/2player_AWS_3.svg";
import AWS_4 from "../assets/2player_AWS_4.svg";
import AWS_5 from "../assets/2player_AWS_5.svg";

// 영문용 AWS 에셋 임포트
import AWS_1_en from "../assets/en/2player_AWS_1_en.svg";
import AWS_2_en from "../assets/en/2player_AWS_2_en.svg";
import AWS_3_en from "../assets/en/2player_AWS_3_en.svg";
import AWS_4_en from "../assets/en/2player_AWS_4_en.svg";
import AWS_5_en from "../assets/en/2player_AWS_5_en.svg";

import { useWebSocket } from '../WebSocketProvider';
import defaultimg from "../assets/images/Frame235.png";

import axiosInstance from '../api/axiosInstance';
// 다국어 지원 임포트
import { translations } from '../utils/language';

export default function CD2() {
  const navigate = useNavigate();
  useWebSocketNavigation(navigate, { 
    infoPath: '/game02',
    nextPagePath: '/game02'
  });
  const { isConnected, finalizeDisconnection } = useWebSocket();

  // 프로젝트 표준 다국어 설정 로직
  const lang = localStorage.getItem('app_lang') || 'ko';
  const currentLangData = translations?.[lang] || translations['ko'] || {};
  const t = currentLangData.CharacterDescription || {};
  const t_map = currentLangData.GameMap || {};
  const t_ko_map = translations['ko']?.GameMap || {};

  // 음성 세션 초기화 상태 추가 (오류 해결)
  const [voiceInitialized, setVoiceInitialized] = useState(false);

  const currentCategory = localStorage.getItem('category') || '';
  const isAndroid = currentCategory.includes('안드로이드') || currentCategory.toLowerCase().includes('android');
  const isAWS = !isAndroid;

  const isCustomMode = !!localStorage.getItem('code');
  const creatorTitle = localStorage.getItem('creatorTitle') || '';
  const rawSubtopic = localStorage.getItem('subtopic');
  const subtopic = isCustomMode ? creatorTitle : (rawSubtopic ?? 'AI의 개인 정보 수집');

  const mateName = localStorage.getItem('mateName') ?? 'HomeMate';
  const [round, setRound] = useState();

  // 라운드 계산 및 저장
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const nextRound = completed.length + 1;
    setRound(nextRound);
    localStorage.setItem('currentRound', String(nextRound));
  }, []);

  const { isHost, sendNextPage } = useHostActions();

  // WebRTC 및 음성 상태 관련 훅
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

  // 받침 유무 판별 및 조사 처리
  const hasFinalConsonant = (kor) => {
    if (lang !== 'ko') return false;
    const lastChar = kor[kor.length - 1];
    const code = lastChar.charCodeAt(0);
    return code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
  };

  const getEulReul = (word) => (lang !== 'ko' ? '' : (hasFinalConsonant(word) ? '을' : '를'));
  const getGwaWa = (word) => (lang !== 'ko' ? '' : (hasFinalConsonant(word) ? '과' : '와'));
  const getEunNeun = (word) => (lang !== 'ko' ? '' : (hasFinalConsonant(word) ? '은' : '는'));

  // 이미지 선택 헬퍼 로직
  const getImg = (koImg, enImg) => (lang !== 'ko' && enImg ? enImg : koImg);

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

  const resolveImageUrl = (raw) => {
    if (!raw || raw === '-' || String(raw).trim() === '') return null;
    const u = String(raw).trim();
    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
    const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
    return base ? `${base}${u.startsWith('/') ? '' : '/'}${u}` : u;
  };

  if (isCustomMode) {
    const charDes2 = (localStorage.getItem('charDes2') || '').trim();
    if (charDes2) mainText = charDes2;
    const customImg = resolveImageUrl(localStorage.getItem('role_image_2') || '');
    descImg = customImg ?? defaultimg;
  }

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

  useEffect(() => {
    const timer = setTimeout(() => initializeVoice(), 1000);
    return () => clearTimeout(timer);
  }, [initializeVoice]);

  const handleContinue = () => { navigate('/character_all'); };
  const handleBackClick = () => { navigate('/game01'); };

  return (
    <Layout round={round} subtopic={subtopic} me="2P" onBackClick={handleBackClick}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, marginTop: 22 }}>
        <img
          src={descImg}
          alt="Player 2 설명 이미지"
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