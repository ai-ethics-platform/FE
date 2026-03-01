import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentBox2 from '../components/ContentBox2';
import PrimaryButton from '../components/PrimaryButton';

// 이미지 에셋 임포트
import player2DescImg_title1 from '../assets/2player_des1.svg';
import player2DescImg_title2 from '../assets/2player_des2.svg';
import player2DescImg_title3 from '../assets/2player_des3.svg';
import AWS_1 from '../assets/2player_AWS_1.svg';
import AWS_2 from '../assets/2player_AWS_2.svg';
import AWS_3 from '../assets/2player_AWS_3.svg';
import AWS_4 from '../assets/2player_AWS_4.svg';
import AWS_5 from '../assets/2player_AWS_5.svg';
import player2DescImg_title1_en from '../assets/en/2player_des1_en.svg';
import player2DescImg_title2_en from '../assets/en/2player_des2_en.svg';
import player2DescImg_title3_en from '../assets/en/2player_des3_en.svg';
import AWS_1_en from '../assets/en/2player_AWS_1_en.svg';
import AWS_2_en from '../assets/en/2player_AWS_2_en.svg';
import AWS_3_en from '../assets/en/2player_AWS_3_en.svg';
import AWS_4_en from '../assets/en/2player_AWS_4_en.svg';
import AWS_5_en from '../assets/en/2player_AWS_5_en.svg';
import defaultimg from "../assets/images/Frame235.png";

import { translations } from '../utils/language';
import { useWebSocketNavigation } from '../hooks/useWebSocketMessage';
import { useWebSocket } from '../WebSocketProvider';
import voiceManager from '../utils/voiceManager';

export default function CD2() {
  const navigate = useNavigate();
  useWebSocketNavigation(navigate, { infoPath: '/game02', nextPagePath: '/game02' });
  const { isConnected: websocketConnected } = useWebSocket();

  const lang = localStorage.getItem('app_lang') || localStorage.getItem('language') || 'ko';
  const currentLangData = translations?.[lang] || translations['ko'] || {};
  const t = currentLangData.CharacterDescription || {};
  const t_map = currentLangData.GameMap || {};
  const t_ko_map = translations['ko']?.GameMap || {};

  const [voiceInitialized, setVoiceInitialized] = useState(false);
  const [round, setRound] = useState();

  const category = localStorage.getItem('category') || '';
  const isAndroid = category.includes('안드로이드') || category.toLowerCase().includes('android');
  const isAWS = !isAndroid;
  const isCustomMode = !!localStorage.getItem('code');
  const subtopic = isCustomMode ? (localStorage.getItem('creatorTitle') || '') : (localStorage.getItem('subtopic') || '');

  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    setRound(completed.length + 1);
  }, []);

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

  const getImg = (ko, en) => (lang !== 'ko' ? en : ko);
  let descImg = getImg(player2DescImg_title1, player2DescImg_title1_en);
  let mainText = t.cd2_android_home;

  if (!isAWS) {
    if (subtopic === t_map.andOption2_1 || subtopic === t_ko_map.andOption2_1) {
      descImg = getImg(player2DescImg_title2, player2DescImg_title2_en);
      mainText = t.cd2_android_council;
    } else if (subtopic === t_map.andOption3_1 || subtopic === t_ko_map.andOption3_1) {
      descImg = getImg(player2DescImg_title3, player2DescImg_title3_en);
      mainText = t.cd2_android_international;
    }
  } else {
    if (subtopic === t_map.awsOption1_1 || subtopic === t_ko_map.awsOption1_1) { descImg = getImg(AWS_1, AWS_1_en); mainText = t.cd2_aws_1; }
    else if (subtopic === t_map.awsOption1_2 || subtopic === t_ko_map.awsOption1_2) { descImg = getImg(AWS_2, AWS_2_en); mainText = t.cd2_aws_2; }
    else if (subtopic === t_map.awsOption2_1 || subtopic === t_ko_map.awsOption2_1) { descImg = getImg(AWS_3, AWS_3_en); mainText = t.cd2_aws_3; }
    else if (subtopic === t_map.awsOption2_2 || subtopic === t_ko_map.awsOption2_2) { descImg = getImg(AWS_4, AWS_4_en); mainText = t.cd2_aws_4; }
    else if (subtopic === t_map.awsOption3_1 || subtopic === t_ko_map.awsOption3_1) { descImg = getImg(AWS_5, AWS_5_en); mainText = t.cd2_aws_5; }
    else { mainText = t.aws_default; }
  }

  if (isCustomMode) {
    mainText = (localStorage.getItem('charDes2') || '').trim() || mainText;
    descImg = localStorage.getItem('role_image_2') || defaultimg;
  }

  const mateName = localStorage.getItem('mateName') ?? 'HomeMate';
  const hasBatchim = (word) => {
    if (lang !== 'ko' || !word) return false;
    const code = word.charCodeAt(word.length - 1);
    return (code >= 0xac00 && code <= 0xd7a3) && (code - 0xac00) % 28 !== 0;
  };

  const finalStr = (mainText || "")
    .replaceAll('{{mateName}}', mateName)
    .replaceAll('{{eulReul}}', hasBatchim(mateName) ? '을' : '를')
    .replaceAll('{{gwaWa}}', hasBatchim(mateName) ? '과' : '와')
    .replaceAll('{{eunNeun}}', hasBatchim(mateName) ? '은' : '는');

  return (
    <Layout round={round} subtopic={subtopic} me="2P" onBackClick={() => navigate('/game01')}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, marginTop: 22 }}>
        <img src={descImg} alt="Character" style={{ width: 264, height: 336, objectFit: 'contain' }} />
        <ContentBox2 text={finalStr} />
        <PrimaryButton onClick={() => navigate('/character_all')} style={{ width: 400, height: 60, marginTop: 10 }}>
          {currentLangData.UiElements?.next || '다음'}
        </PrimaryButton>
      </div>
    </Layout>
  );
}