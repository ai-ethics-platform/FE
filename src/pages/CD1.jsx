import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox2';

// 이미지 에셋 - 원본 및 영문 경로
import player1DescImg_title1 from '../assets/1player_des1.svg';
import player1DescImg_title2 from '../assets/1player_des2.svg';
import player1DescImg_title3 from '../assets/1player_des3.svg';
import AWS_1 from '../assets/1player_AWS_1.svg';
import AWS_2 from '../assets/1player_AWS_2.svg';
import AWS_3 from '../assets/1player_AWS_3.svg';
import AWS_4 from '../assets/1player_AWS_4.svg';
import AWS_5 from '../assets/1player_AWS_5.svg';

import player1DescImg_title1_en from '../assets/en/1player_des1_en.svg';
import player1DescImg_title2_en from '../assets/en/1player_des2_en.svg'; 
import player1DescImg_title3_en from '../assets/en/1player_des3_en.svg'; 
import AWS_1_en from '../assets/en/1player_AWS_1_en.svg';
import AWS_2_en from '../assets/en/1player_AWS_2_en.svg';
import AWS_3_en from '../assets/en/1player_AWS_3_en.svg';
import AWS_4_en from '../assets/en/1player_AWS_4_en.svg';
import AWS_5_en from '../assets/en/1player_AWS_5_en.svg';

import defaultimg from "../assets/images/Frame235.png";

// 시스템 유틸리티 및 훅
import { translations } from '../utils/language';
import { useWebSocketNavigation } from '../hooks/useWebSocketMessage';
import { useWebSocket } from '../WebSocketProvider';
import axiosInstance from '../api/axiosInstance';
import voiceManager from '../utils/voiceManager';

export default function CD1() {
  const navigate = useNavigate();
  useWebSocketNavigation(navigate, { infoPath: '/game02', nextPagePath: '/game02' });
  const { isConnected: websocketConnected } = useWebSocket();

  // 1. 현재 시스템 언어 확인
  const lang = localStorage.getItem('app_lang') || 'ko';
  const currentLangData = translations?.[lang] || translations['ko'] || {};
  const t = currentLangData.CharacterDescription || {};
  const t_map = currentLangData.GameMap || {};
  const t_ko_map = translations['ko']?.GameMap || {};

  // 2. 카테고리 판별 (한국어/영어 모두 대응 가능하도록 키워드 체크)
  const category = localStorage.getItem('category') || '';
  const isAWS = category === '자율 무기 시스템';
  const isAndroid = category === '안드로이드';

  const isCustomMode = !!localStorage.getItem('code');
  const rawSubtopic = localStorage.getItem('subtopic') || '';
  const subtopic = isCustomMode ? (localStorage.getItem('creatorTitle') || '') : rawSubtopic;

  const [round, setRound] = useState();
  const [voiceInitialized, setVoiceInitialized] = useState(false);

  // 라운드 계산 로직 (기존 유지)
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const nextRound = completed.length + 1;
    setRound(nextRound);
    localStorage.setItem('currentRound', String(nextRound));
  }, []);

  // 음성 세션 초기화 로직 (기존 유지)
  const initializeVoice = useCallback(async () => {
    if (voiceInitialized) return;
    const sessionId = localStorage.getItem('session_id');
    if (!sessionId || !websocketConnected) return;
    try {
      const success = await voiceManager.initializeVoiceSession();
      if (success) {
        setVoiceInitialized(true);
        setTimeout(() => voiceManager.startSpeechDetection(), 1000);
      }
    } catch (err) { console.error(err); }
  }, [voiceInitialized, websocketConnected]);

  useEffect(() => {
    const timer = setTimeout(() => initializeVoice(), 1000);
    return () => clearTimeout(timer);
  }, [initializeVoice]);

  // 3. 이미지 및 텍스트 키 매핑 (서브토픽 값의 한국어/영어 모두 대응)
  const getImg = (ko, en) => (lang !== 'ko' ? en : ko);
  
  let descImg = getImg(player1DescImg_title1, player1DescImg_title1_en);
  let mainTextKey = 'cd1_android_home'; // 기본값

  if (!isAWS) {
    // 안드로이드 시나리오 판단
    const isCouncil = subtopic === '아이들을 위한 서비스' || subtopic === '설명 가능한 AI' || 
                      subtopic === t_map.andOption2_1 || subtopic === t_map.andOption2_2 ||
                      subtopic === t_ko_map.andOption2_1 || subtopic === t_ko_map.andOption2_2;
    const isInternational = subtopic === '지구, 인간, AI' || subtopic === t_map.andOption3_1 || subtopic === t_ko_map.andOption3_1;

    if (isCouncil) {
      descImg = getImg(player1DescImg_title2, player1DescImg_title2_en);
      mainTextKey = 'cd1_android_council';
    } else if (isInternational) {
      descImg = getImg(player1DescImg_title3, player1DescImg_title3_en);
      mainTextKey = 'cd1_android_international';
    }
  } else {
    // AWS 시나리오 판단
    if (subtopic === 'AI 알고리즘 공개' || subtopic === t_map.awsOption1_1 || subtopic === t_ko_map.awsOption1_1) {
      descImg = getImg(AWS_1, AWS_1_en); mainTextKey = 'cd1_aws_1';
    } else if (subtopic === 'AWS의 권한' || subtopic === t_map.awsOption1_2 || subtopic === t_ko_map.awsOption1_2) {
      descImg = getImg(AWS_2, AWS_2_en); mainTextKey = 'cd1_aws_2';
    } else if (subtopic === '사람이 죽지 않는 전쟁' || subtopic === t_map.awsOption2_1 || subtopic === t_ko_map.awsOption2_1) {
      descImg = getImg(AWS_3, AWS_3_en); mainTextKey = 'cd1_aws_3';
    } else if (subtopic === 'AI의 권리와 책임' || subtopic === t_map.awsOption2_2 || subtopic === t_ko_map.awsOption2_2) {
      descImg = getImg(AWS_4, AWS_4_en); mainTextKey = 'cd1_aws_4';
    } else if (subtopic === 'AWS 규제' || subtopic === t_map.awsOption3_1 || subtopic === t_ko_map.awsOption3_1) {
      descImg = getImg(AWS_5, AWS_5_en); mainTextKey = 'cd1_aws_5';
    } else {
      mainTextKey = 'aws_default';
    }
  }

  // 4. 언어팩에서 최종 텍스트 추출
  let mainText = t[mainTextKey] || '';

  // 커스텀 모드 시나리오
  if (isCustomMode) {
    const charDes1 = (localStorage.getItem('charDes1') || '').trim();
    if (charDes1) mainText = charDes1;
    const rawRoleImg = localStorage.getItem('role_image_1') || '';
    descImg = rawRoleImg || defaultimg;
  }

  // 5. 조사 치환 (한국어 모드인 경우에만 작동)
  const mateName = localStorage.getItem('mateName') ?? 'HomeMate';
  const hasBatchim = (word) => {
    if (lang !== 'ko' || !word) return false;
    const lastChar = word[word.length - 1];
    const code = lastChar.charCodeAt(0);
    return (code >= 0xac00 && code <= 0xd7a3) && (code - 0xac00) % 28 !== 0;
  };

  const finalStr = (mainText || "")
    .replaceAll('{{mateName}}', mateName)
    .replaceAll('{{eulReul}}', lang === 'ko' ? (hasBatchim(mateName) ? '을' : '를') : '')
    .replaceAll('{{gwaWa}}', lang === 'ko' ? (hasBatchim(mateName) ? '과' : '와') : '')
    .replaceAll('{{eunNeun}}', lang === 'ko' ? (hasBatchim(mateName) ? '은' : '는') : '');

  // 6. 데이터 구성 및 핸들러 (원본 UI 규격 유지)
  const paragraphs = [{ main: finalStr }];

  const handleContinue = () => {
    navigate('/character_all');
  };

  const handleBackClick = () => {
    navigate('/game01');
  };

  return (
    <Layout round={round} subtopic={subtopic} me="1P" onBackClick={handleBackClick}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32, // 원본 gap 유지
          marginTop: 22,
        }}
      >
        <img
          src={descImg}
          alt="Character Description Image"
          style={{ width: 264, height: 336, objectFit: 'contain', marginBottom: -20 }} // 원본 마진 유지
          onError={(e) => { e.currentTarget.src = defaultimg; }}
        />
        <div style={{ width: '100%', maxWidth: 900 }}>
          {/* ContentTextBox(ContentTextBox2)에 onContinue를 전달하여 내부 화살표 버튼 활성화 */}
          <ContentTextBox paragraphs={paragraphs} onContinue={handleContinue} />
        </div>
      </div>
    </Layout>
  );
}