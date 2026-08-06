import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox2';

// 3P 이미지 에셋
import player3DescImg_title1 from '../assets/3player_des1.svg';
import player3DescImg_title2 from '../assets/3player_des2.svg';
import player3DescImg_title3 from '../assets/3player_des3.svg';
import AWS_1 from '../assets/3player_AWS_1.svg';
import AWS_2 from '../assets/3player_AWS_2.svg';
import AWS_3 from '../assets/3player_AWS_3.svg';
import AWS_4 from '../assets/3player_AWS_4.svg';
import AWS_5 from '../assets/3player_AWS_5.svg';

import player3DescImg_title1_en from '../assets/en/3player_des1_en.svg';
import player3DescImg_title2_en from '../assets/en/3player_des2_en.svg'; 
import player3DescImg_title3_en from '../assets/en/3player_des3_en.svg'; 
import AWS_1_en from '../assets/en/3player_AWS_1_en.svg';
import AWS_2_en from '../assets/en/3player_AWS_2_en.svg';
import AWS_3_en from '../assets/en/3player_AWS_3_en.svg';
import AWS_4_en from '../assets/en/3player_AWS_4_en.svg';
import AWS_5_en from '../assets/en/3player_AWS_5_en.svg';

import defaultimg from "../assets/images/Frame235.png";

import { translations } from '../utils/language';
import { useWebSocketNavigation } from '../hooks/useWebSocketMessage';
import { useWebSocket } from '../WebSocketProvider';
import axiosInstance from '../api/axiosInstance';
import voiceManager from '../utils/voiceManager';

export default function CD3() {
  const navigate = useNavigate();
  useWebSocketNavigation(navigate, { infoPath: '/game02', nextPagePath: '/game02' });
  const { isConnected: websocketConnected } = useWebSocket();

  const lang = localStorage.getItem('app_lang') || 'ko';
  const currentLangData = translations?.[lang] || translations['ko'] || {};
  const t = currentLangData.CharacterDescription || {};
  const t_map = currentLangData.GameMap || {};
  const t_ko_map = translations['ko']?.GameMap || {};

  const category = localStorage.getItem('category') || '';
  const isAWS = category === '자율 무기 시스템';
  const isCustomMode = !!localStorage.getItem('code');
  const rawSubtopic = localStorage.getItem('subtopic') || '';
  const subtopic = isCustomMode ? (localStorage.getItem('creatorTitle') || '') : rawSubtopic;

  const [round, setRound] = useState();
  const [voiceInitialized, setVoiceInitialized] = useState(false);

  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const nextRound = completed.length + 1;
    setRound(nextRound);
    localStorage.setItem('currentRound', String(nextRound));
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
  let descImg = getImg(player3DescImg_title1, player3DescImg_title1_en);
  let mainTextKey = 'cd3_android_home';

  if (!isAWS) {
    const isCouncil = subtopic === '아이들을 위한 서비스' || subtopic === '설명 가능한 AI' || subtopic === t_map.andOption2_1 || subtopic === t_ko_map.andOption2_1;
    const isInternational = subtopic === '지구, 인간, AI' || subtopic === t_map.andOption3_1 || subtopic === t_ko_map.andOption3_1;

    if (isCouncil) {
      descImg = getImg(player3DescImg_title2, player3DescImg_title2_en);
      mainTextKey = 'cd3_android_council';
    } else if (isInternational) {
      descImg = getImg(player3DescImg_title3, player3DescImg_title3_en);
      mainTextKey = 'cd3_android_international';
    }
  } else {
    if (subtopic === 'AI 알고리즘 공개' || subtopic === t_map.awsOption1_1 || subtopic === t_ko_map.awsOption1_1) { descImg = getImg(AWS_1, AWS_1_en); mainTextKey = 'cd3_aws_1'; }
    else if (subtopic === 'AWS의 권한' || subtopic === t_map.awsOption1_2 || subtopic === t_ko_map.awsOption1_2) { descImg = getImg(AWS_2, AWS_2_en); mainTextKey = 'cd3_aws_2'; }
    else if (subtopic === '사람이 죽지 않는 전쟁' || subtopic === t_map.awsOption2_1 || subtopic === t_ko_map.awsOption2_1) { descImg = getImg(AWS_3, AWS_3_en); mainTextKey = 'cd3_aws_3'; }
    else if (subtopic === 'AI의 권리와 책임' || subtopic === t_map.awsOption2_2 || subtopic === t_ko_map.awsOption2_2) { descImg = getImg(AWS_4, AWS_4_en); mainTextKey = 'cd3_aws_4'; }
    else if (subtopic === 'AWS 규제' || subtopic === t_map.awsOption3_1 || subtopic === t_ko_map.awsOption3_1) { descImg = getImg(AWS_5, AWS_5_en); mainTextKey = 'cd3_aws_5'; }
    else { mainTextKey = 'aws_default'; }
  }

  let mainText = t[mainTextKey] || '';

  if (isCustomMode) {
    const charDes3 = (localStorage.getItem('charDes3') || '').trim();
    if (charDes3) mainText = charDes3;
    const rawRoleImg = localStorage.getItem('role_image_3') || '';
    descImg = rawRoleImg || defaultimg;
  }

  const mateName = localStorage.getItem('mateName') ?? 'HomeMate';
  const hasBatchim = (word) => {
    if (lang !== 'ko' || !word) return false;
    const code = word[word.length - 1].charCodeAt(0);
    return (code >= 0xac00 && code <= 0xd7a3) && (code - 0xac00) % 28 !== 0;
  };

  const finalStr = (mainText || "")
    .replaceAll('{{mateName}}', mateName)
    .replaceAll('{{eulReul}}', lang === 'ko' ? (hasBatchim(mateName) ? '을' : '를') : '')
    .replaceAll('{{gwaWa}}', lang === 'ko' ? (hasBatchim(mateName) ? '과' : '와') : '')
    .replaceAll('{{eunNeun}}', lang === 'ko' ? (hasBatchim(mateName) ? '은' : '는') : '');

  const paragraphs = [{ main: finalStr }];

  return (
    <Layout round={round} subtopic={subtopic} me="3P" onBackClick={() => navigate('/game01')}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, marginTop: 22 }}>
        <img src={descImg} alt="Character" style={{ width: 264, height: 336, objectFit: 'contain', marginBottom: -20 }} onError={(e) => { e.currentTarget.src = defaultimg; }} />
        <div style={{ width: '100%', maxWidth: 900 }}>
          <ContentTextBox paragraphs={paragraphs} onContinue={() => navigate('/character_all')} />
        </div>
      </div>
    </Layout>
  );
}