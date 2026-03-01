// pages/CD2.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox2';

// Player 2 이미지 에셋 임포트
import player2DescImg_title1 from '../assets/2player_des1.svg';
import player2DescImg_title2 from '../assets/2player_des2.svg';
import player2DescImg_title3 from '../assets/2player_des3.svg';
import AWS_1 from "../assets/2player_AWS_1.svg";
import AWS_2 from "../assets/2player_AWS_2.svg";
import AWS_3 from "../assets/2player_AWS_3.svg";
import AWS_4 from "../assets/2player_AWS_4.svg";
import AWS_5 from "../assets/2player_AWS_5.svg";

// 영문 에셋
import player2DescImg_title1_en from '../assets/en/2player_des1_en.svg';
import player2DescImg_title2_en from '../assets/en/2player_des2_en.svg';
import player2DescImg_title3_en from '../assets/en/2player_des3_en.svg';
import AWS_1_en from "../assets/en/2player_AWS_1_en.svg";
import AWS_2_en from "../assets/en/2player_AWS_2_en.svg";
import AWS_3_en from "../assets/en/2player_AWS_3_en.svg";
import AWS_4_en from "../assets/en/2player_AWS_4_en.svg";
import AWS_5_en from "../assets/en/2player_AWS_5_en.svg";

import defaultimg from "../assets/images/Frame235.png";
import { translations } from '../utils/language';
import { useHostActions, useWebSocketNavigation } from '../hooks/useWebSocketMessage';
import { useWebRTC } from '../WebRTCProvider';
import { useWebSocket } from '../WebSocketProvider';
import voiceManager from '../utils/voiceManager';

export default function CD2() {
  const navigate = useNavigate();
  useWebSocketNavigation(navigate, { infoPath: '/game02', nextPagePath: '/game02' });
  const { isConnected } = useWebSocket();

  const lang = localStorage.getItem('app_lang') || 'ko';
  const t = translations?.[lang]?.CharacterDescription || {};
  const t_map = translations?.[lang]?.GameMap || {};
  const [voiceInitialized, setVoiceInitialized] = useState(false);
  const [round, setRound] = useState(1);

  const category = localStorage.getItem('category') || '';
  const isAndroid = category.includes('안드로이드') || category.toLowerCase().includes('android');
  const isAWS = !isAndroid;
  const subtopic = localStorage.getItem('subtopic') || '';
  const mateName = localStorage.getItem('mateName') ?? 'HomeMate';

  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    setRound(completed.length + 1);
  }, []);

  const initializeVoice = useCallback(async () => {
    if (voiceInitialized) return;
    const sessionId = localStorage.getItem('session_id');
    if (!sessionId || !isConnected) return;
    try {
      const success = await voiceManager.initializeVoiceSession();
      if (success) {
        setVoiceInitialized(true);
        setTimeout(() => voiceManager.startSpeechDetection(), 1000);
      }
    } catch (err) { console.error('음성 초기화 실패:', err); }
  }, [voiceInitialized, isConnected]);

  useEffect(() => {
    const timer = setTimeout(initializeVoice, 1000);
    return () => clearTimeout(timer);
  }, [initializeVoice]);

  const getEulReul = (word) => {
    if (lang !== 'ko') return '';
    const code = word.charCodeAt(word.length - 1);
    const hasFinal = (code >= 0xac00 && code <= 0xd7a3) && (code - 0xac00) % 28 !== 0;
    return hasFinal ? '을' : '를';
  };

  // 이미지/텍스트 매핑 로직 (Player 2 전용)
  const getAsset = () => {
    const isEn = lang !== 'ko';
    if (!isAWS) {
      if (subtopic === t_map.andOption2_1 || subtopic === t_map.andOption2_2) 
        return { img: isEn ? player2DescImg_title2_en : player2DescImg_title2, txt: t.cd2_android_council };
      if (subtopic === t_map.andOption3_1) 
        return { img: isEn ? player2DescImg_title3_en : player2DescImg_title3, txt: t.cd2_android_international };
      return { img: isEn ? player2DescImg_title1_en : player2DescImg_title1, txt: t.cd2_android_home };
    } else {
      const awsMap = {
        'AI 알고리즘 공개': { ko: AWS_1, en: AWS_1_en, t: t.cd2_aws_1 },
        'AWS의 권한': { ko: AWS_2, en: AWS_2_en, t: t.cd2_aws_2 },
        '사람이 죽지 않는 전쟁': { ko: AWS_3, en: AWS_3_en, t: t.cd2_aws_3 },
        'AI의 권리와 책임': { ko: AWS_4, en: AWS_4_en, t: t.cd2_aws_4 },
        'AWS 규제': { ko: AWS_5, en: AWS_5_en, t: t.cd2_aws_5 },
      };
      const selected = awsMap[subtopic] || { ko: AWS_1, en: AWS_1_en, t: t.aws_default };
      return { img: isEn ? selected.en : selected.ko, txt: selected.t };
    }
  };

  const { img: descImg, txt: mainText } = getAsset();
  const paragraphs = [{ main: (mainText || "").replaceAll('{{mateName}}', mateName).replaceAll('{{eulReul}}', getEulReul(mateName)) }];

  return (
    <Layout round={round} subtopic={subtopic} me="2P" onBackClick={() => navigate('/game01')}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, marginTop: 22 }}>
        <img src={descImg} alt="Player 2" style={{ width: 264, height: 336, objectFit: 'contain' }} onError={(e) => e.currentTarget.src = defaultimg} />
        <div style={{ width: '100%', maxWidth: 900 }}>
          <ContentTextBox paragraphs={paragraphs} onContinue={() => navigate('/character_all')} />
        </div>
      </div>
    </Layout>
  );
}