// src/pages/GameMap.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import GameMapFrame from '../components/GameMapFrame';
import homeIcon from '../assets/homeIcon.svg';
import aiIcon from '../assets/aiIcon.svg';
import internationalIcon from '../assets/internationalIcon.svg';
import { useWebRTC } from '../WebRTCProvider';
import { useWebSocket } from '../WebSocketProvider';
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';
import { FontStyles, Colors } from '../components/styleConstants';
// 서버 데이터 동기화를 위한 axios 인스턴스 임포트
import axiosInstance from '../api/axiosInstance';
import voiceManager from '../utils/voiceManager';
// Localization 연동
import { translations } from '../utils/language/index';

export default function GameMap() {
  const navigate = useNavigate();
  
  // 프로젝트 표준 키값 app_lang 사용 및 언어팩 로드
  const lang = localStorage.getItem('app_lang') || 'ko';
  const t = (lang !== 'ko') ? (translations[lang]?.GameMap || translations['en']?.GameMap) : translations['ko']?.GameMap;
  const t_ko = translations?.['ko']?.GameMap || {}; // 기준 데이터인 한국어 맵
  const tm = t || {};

  const subtopic = tm.subtopic || '라운드 선택';

  const { isInitialized: webrtcInitialized } = useWebRTC();
  const { isConnected: websocketConnected, finalizeDisconnection } = useWebSocket();
  const { isHost, sendNextPage } = useHostActions();
  
  // 페이지 이동 메시지 핸들러
  useWebSocketNavigation(navigate, { nextPagePath: '/game01' });

  // 음성 세션 초기화 상태 (연결 일관성 유지용)
  const [voiceInitialized, setVoiceInitialized] = useState(false);

  // 게스트를 위한 AI 이름(mateName) 서버 동기화 로직
  useEffect(() => {
    const syncMateName = async () => {
      const roomCode = localStorage.getItem('room_code');
      if (!roomCode) return;

      try {
        const { data } = await axiosInstance.get('/rooms/ai-select', {
          params: { room_code: roomCode },
        });

        if (data && data.ai_name) {
          localStorage.setItem('mateName', data.ai_name);
          console.log('✅ [Gamemap] AI 이름 동기화 완료:', data.ai_name);
        }
      } catch (err) {
        console.error('❌ [Gamemap] AI 이름 동기화 실패:', err);
      }
    };

    syncMateName();
  }, []);

  // 음성 세션 초기화 로직 (ReferenceError 방지 및 안정화)
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

  // 수정 끝나면 다시 풀어야함 !! 
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
  
     if (!websocketConnected) {
       if (isReloadingGraceLocal()) return;
       const DEBOUNCE_MS = 1200;
       const timer = setTimeout(() => {
         if (cancelled) return;
         if (!websocketConnected && !isReloadingGraceLocal()) {
           finalizeDisconnection('❌ 연결이 끊겨 게임이 초기화됩니다.');
         }
       }, DEBOUNCE_MS);
  
       return () => {
         cancelled = true;
         clearTimeout(timer);
       };
     }
  }, [websocketConnected, finalizeDisconnection]);
*/

  // 카테고리 판별 로직 (확장형 적용)
  const category = localStorage.getItem('category') || '';
  const isAndroid = category.includes('안드로이드') || category.toLowerCase().includes('android');
  const isAWS = !isAndroid;

  // 라운드 계산 로직
  const [round, setRound] = useState(() => {
    try {
      const c = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
      return c.length + 1;
    } catch (e) {
      return 1;
    }
  });

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = orig; };
  }, []);

  // 섹션 및 옵션 데이터 구성
  const sections = isAWS
    ? [
        { title: tm.awsSection1Title || '주거, 군사 지역', options: [tm.awsOption1_1 || 'AI 알고리즘 공개', tm.awsOption1_2 || 'AWS의 권한'] },
        { title: tm.awsSection2Title || '국가 인공지능 위원회', options: [tm.awsOption2_1 || '사람이 죽지 않는 전쟁', tm.awsOption2_2 || 'AI의 권리와 책임'] },
        { title: tm.awsSection3Title || '국제 인류 발전 위원회', options: [tm.awsOption3_1 || 'AWS 규제'] },
      ]
    : [
        { title: tm.andSection1Title || '가정', options: [tm.andOption1_1 || 'AI의 개인 정보 수집', tm.andOption1_2 || '안드로이드의 감정 표현'] },
        { title: tm.andSection2Title || '국가 인공지능 위원회', options: [tm.andOption2_1 || '아이들을 위한 서비스', tm.andOption2_2 || '설명 가능한 AI'] },
        { title: tm.andSection3Title || '국제 인류 발전 위원회', options: [tm.andOption3_1 || '지구, 인간, AI'] },
      ];

  // 영문 텍스트를 한국어 원문 키로 변환하는 로직 (기능 보존)
  const getStableText = (text) => {
    if (lang === 'ko') return text;
    const key = Object.keys(tm).find(k => tm[k] === text);
    if (key && t_ko[key]) return t_ko[key];
    return text;
  };

  const handleSelect = (topic, title) => {
    const prevTitle = localStorage.getItem('title');
    const categoryStored = localStorage.getItem('category') || (isAWS ? '자율 무기 시스템' : '안드로이드');
    const mode = 'neutral';
  
    // 한국어 원본 텍스트로 변환하여 저장
    const stableTitle = getStableText(title);
    const stableTopic = getStableText(topic);

    localStorage.setItem('title', stableTitle);
    localStorage.setItem('category', categoryStored);
    localStorage.setItem('subtopic', stableTopic);
    localStorage.setItem('mode', mode);
  
    let nextPage;
  
    if (isAWS) {
      if (prevTitle !== stableTitle) {
        nextPage = '/game01';
      } else {
        if (stableTopic === (t_ko.awsOption2_2 || 'AI의 권리와 책임')) {
          nextPage = '/game02';
        } else {
          const myRoleId = localStorage.getItem('myrole_id');
          nextPage = ['1', '2', '3'].includes(myRoleId) ? `/character_description${myRoleId}` : '/game01';
        }
      }
    } else {
      nextPage = prevTitle === stableTitle ? '/game02' : '/game01';
    }
  
    navigate(nextPage);
  };
      
  const completedTopics = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
  
  // 완료 여부 체크 로직
  const isCompleted = (displayText) => {
    const stableText = getStableText(displayText);
    return completedTopics.includes(stableText);
  };

  const getUnlockedOptions = () => {
    const unlocked = new Set();
    if (isAWS) {
      unlocked.add(tm.awsOption1_1 || 'AI 알고리즘 공개');
      if (isCompleted(tm.awsOption1_1 || 'AI 알고리즘 공개')) {
        unlocked.add(tm.awsOption1_2 || 'AWS의 권한');
        unlocked.add(tm.awsOption2_1 || '사람이 죽지 않는 전쟁');
      }
      if (isCompleted(tm.awsOption2_1 || '사람이 죽지 않는 전쟁')) {
        unlocked.add(tm.awsOption2_2 || 'AI의 권리와 책임');
        unlocked.add(tm.awsOption3_1 || 'AWS 규제');
      }
    } else {
      unlocked.add(tm.andOption1_1 || 'AI의 개인 정보 수집');
      if (isCompleted(tm.andOption1_1 || 'AI의 개인 정보 수집')) {
        unlocked.add(tm.andOption1_2 || '안드로이드의 감정 표현');
        unlocked.add(tm.andOption2_1 || '아이들을 위한 서비스');
      }
      if (isCompleted(tm.andOption2_1 || '아이들을 위한 서비스')) {
        unlocked.add(tm.andOption2_2 || '설명 가능한 AI');
        unlocked.add(tm.andOption3_1 || '지구, 인간, AI');
      }
    }
    return unlocked;
  };

  const unlockedOptions = getUnlockedOptions();

  const createOption = (text, title) => {
    const isDone = isCompleted(text);
    const isUnlocked = unlockedOptions.has(text);

    return {
      text,
      disabled: isDone,
      locked: !isUnlocked,
      onClick: () => {
        if (!isDone && isUnlocked) handleSelect(text, title);
      },
    };
  };

  const s0 = sections[0];
  const s1 = sections[1];
  const s2 = sections[2];

  const isHomeUnlocked = true;
  const isNationalUnlocked = isAWS
    ? isCompleted(tm.awsOption1_1 || 'AI 알고리즘 공개')
    : isCompleted(tm.andOption1_1 || 'AI의 개인 정보 수집');
  const isInternationalUnlocked = isAWS
    ? isCompleted(tm.awsOption2_1 || '사람이 죽지 않는 전쟁')
    : isCompleted(tm.andOption2_1 || '아이들을 위한 서비스');

  const handleBackClick = () => {
    const idx = window.history.state?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate('/matename');
  };

  return (
    <Layout subtopic={subtopic} nodescription={true} onBackClick={handleBackClick}> 
      <div style={{
        width: '100%',
        maxWidth: 900,
        minHeight: 0,
        ...FontStyles.headlineSmall,
        color: Colors.systemRed,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        whiteSpace: 'nowrap', 
        textAlign: 'center'
      }}>
        {tm.guideText || '합의 후 같은 라운드를 선택하세요.'}
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', gap: 8, marginLeft: 60, marginTop: 12, zIndex: 1 }}>
        <GameMapFrame
          icon={homeIcon}
          title={s0.title}
          disabled={!isHomeUnlocked}
          option1={createOption(s0.options[0], s0.title)}
          option2={s0.options[1] ? createOption(s0.options[1], s0.title) : undefined}
        />

        <GameMapFrame
          icon={aiIcon}
          title={s1.title}
          disabled={!isNationalUnlocked}
          option1={createOption(s1.options[0], s1.title)}
          option2={s1.options[1] ? createOption(s1.options[1], s1.title) : undefined}
        />

        <GameMapFrame
          icon={internationalIcon}
          title={s2.title}
          disabled={!isInternationalUnlocked}
          option1={createOption(s2.options[0], s2.title)}
          option2={s2.options[1] ? createOption(s2.options[1], s2.title) : undefined}
        />
      </div>
    </Layout>
  );
}