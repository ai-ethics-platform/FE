import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox2';
import { FontStyles } from '../components/styleConstants';
import create02Image from '../assets/images/Frame235.png';
import { translations } from '../utils/language';

// 이미지 에셋 임포트 (원본 구조 유지)
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

import player1DescImg_title1_en from '../assets/en/1player_des1_en.svg';
import player1DescImg_title2_en from '../assets/en/1player_des2_en.svg';
import player1DescImg_title3_en from '../assets/en/1player_des3_en.svg';
import AWS_1_en from '../assets/en/1player_AWS_1_en.svg';
import AWS_2_en from '../assets/en/1player_AWS_2_en.svg';
import AWS_3_en from '../assets/en/1player_AWS_3_en.svg';
import AWS_4_en from '../assets/en/1player_AWS_4_en.svg';
import AWS_5_en from '../assets/en/1player_AWS_5_en.svg';

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
import axiosInstance from '../api/axiosInstance';
import { useWebSocket } from '../WebSocketProvider';
import voiceManager from '../utils/voiceManager';

export default function CD_all() {
  const navigate = useNavigate();
  const lang = localStorage.getItem('app_lang') || localStorage.getItem('language') || 'ko';
  const currentLangData = translations?.[lang] || translations['ko'] || {};
  const t = currentLangData.CharacterDescription || {};
  const t_map = currentLangData.GameMap || {};
  const t_ko_map = translations['ko']?.GameMap || {};

  const [category, setCategory] = useState(localStorage.getItem('category') || '');
  const [title, setTitle] = useState(localStorage.getItem('title') || '');
  const [subtopic, setSubtopic] = useState(localStorage.getItem('subtopic') || '');
  const myRoleId = localStorage.getItem('myrole_id');

  const [images, setImages] = useState([null, null, null]);
  const [round, setRound] = useState();
  const [showSidebarGuide, setShowSidebarGuide] = useState(true);
  const [voiceInitialized, setVoiceInitialized] = useState(false);

  const isCustomMode = !!localStorage.getItem('code');
  const creatorTitle = localStorage.getItem('creatorTitle') || '';
  const { isConnected } = useWebSocket();

  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    setRound(completed.length + 1);
  }, []);

  const resolveImageUrl = (raw) => {
    if (!raw || raw === '-' || String(raw).trim() === '') return null;
    const u = String(raw).trim();
    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
    const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
    return base ? `${base}${u.startsWith('/') ? '' : '/'}${u}` : u;
  };

  useEffect(() => {
    if (isCustomMode) {
      setImages([
        resolveImageUrl(localStorage.getItem('role_image_1')),
        resolveImageUrl(localStorage.getItem('role_image_2')),
        resolveImageUrl(localStorage.getItem('role_image_3'))
      ]);
      return;
    }

    const isEn = lang !== 'ko';
    const isAndroid = category.includes('안드로이드') || category.toLowerCase().includes('android');
    let selectedSet = [create02Image, create02Image, create02Image];

    if (isAndroid) {
      if (title === t_map.andSection1Title || title === t_ko_map.andSection1Title || title === '가정') {
        selectedSet = isEn ? [player1DescImg_title1_en, player2DescImg_title1_en, player3DescImg_title1_en] : [player1DescImg_title1, player2DescImg_title1, player3DescImg_title1];
      } else if (title === t_map.andSection2Title || title === t_ko_map.andSection2Title || title === '국가 인공지능 위원회') {
        selectedSet = isEn ? [player1DescImg_title2_en, player2DescImg_title2_en, player3DescImg_title2_en] : [player1DescImg_title2, player2DescImg_title2, player3DescImg_title2];
      } else if (title === t_map.andSection3Title || title === t_ko_map.andSection3Title || title === '국제 인류 발전 위원회') {
        selectedSet = isEn ? [player1DescImg_title3_en, player2DescImg_title3_en, player3DescImg_title3_en] : [player1DescImg_title3, player2DescImg_title3, player3DescImg_title3];
      }
    } else {
      const awsOption = subtopic;
      if (awsOption === t_map.awsOption1_1 || awsOption === t_ko_map.awsOption1_1 || awsOption === 'AI 알고리즘 공개') {
        selectedSet = isEn ? [AWS_1_en, AWS_1_2_en, AWS_1_3_en] : [AWS_1, AWS_1_2, AWS_1_3];
      } else if (awsOption === t_map.awsOption1_2 || awsOption === t_ko_map.awsOption1_2 || awsOption === 'AWS의 권한') {
        selectedSet = isEn ? [AWS_2_en, AWS_2_2_en, AWS_2_3_en] : [AWS_2, AWS_2_2, AWS_2_3];
      } else if (awsOption === t_map.awsOption2_1 || awsOption === t_ko_map.awsOption2_1 || awsOption === '사람이 죽지 않는 전쟁') {
        selectedSet = isEn ? [AWS_3_en, AWS_3_2_en, AWS_3_3_en] : [AWS_3, AWS_3_2, AWS_3_3];
      } else if (awsOption === t_map.awsOption2_2 || awsOption === t_ko_map.awsOption2_2 || awsOption === 'AI의 권리와 책임') {
        selectedSet = isEn ? [AWS_4_en, AWS_4_2_en, AWS_4_3_en] : [AWS_4, AWS_4_2, AWS_4_3];
      } else if (awsOption === t_map.awsOption3_1 || awsOption === t_ko_map.awsOption3_1 || awsOption === 'AWS 규제') {
        selectedSet = isEn ? [AWS_5_en, AWS_5_2_en, AWS_5_3_en] : [AWS_5, AWS_5_2, AWS_5_3];
      }
    }
    setImages(selectedSet);
  }, [category, title, subtopic, lang, isCustomMode]);

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
    } catch (err) { console.error(err); }
  }, [voiceInitialized, isConnected]);

  useEffect(() => {
    const timer = setTimeout(initializeVoice, 1000);
    return () => clearTimeout(timer);
  }, [initializeVoice]);

  const paragraphs = [{ main: isCustomMode ? t.all_custom_guide : t.all_guide }];

  return (
    <Layout
      subtopic={isCustomMode ? creatorTitle : subtopic}
      round={round}
      onProfileClick={() => setShowSidebarGuide(false)}
      onBackClick={() => navigate(`/character_description${myRoleId}`)}
      sidebarExtra={showSidebarGuide && (
        <div style={{ position: 'relative', textAlign: 'center', width: 'clamp(200px, 18vw, 230px)', pointerEvents: 'none' }}>
          <img src={bubbleSvg} alt="Bubble" style={{ width: '100%', height: 'auto' }} />
          <span style={{ width: '100%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', ...FontStyles.caption }}>
            <div dangerouslySetInnerHTML={{ __html: t.sidebar_bubble }} />
          </span>
        </div>
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 8, marginBottom: 16 }}>
          {images.map((img, idx) => (
            <div key={idx} style={{ width: 260, height: 330, border: '2px solid #ddd', backgroundColor: '#f8f9fa', borderRadius: 2, overflow: 'hidden', boxShadow: '0 8px 16px rgba(0,0,0,0.06)' }}>
              <img src={img || create02Image} alt="Role" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = create02Image; }} />
            </div>
          ))}
        </div>
        <div style={{ width: '100%', maxWidth: 1060 }}>
          <ContentTextBox paragraphs={paragraphs} onContinue={() => navigate('/game02')} />
        </div>
      </div>
    </Layout>
  );
}