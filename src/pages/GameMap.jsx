// src/pages/GameMap.jsx
import React, { useEffect, useState } from 'react';
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
//  서버 데이터 동기화를 위한 axios 인스턴스 임포트
import axiosInstance from '../api/axiosInstance';
// Localization
import { translations } from '../utils/language/index';

export default function GameMap() {
  const navigate = useNavigate();
  
  // Get language setting and translations
  const lang = localStorage.getItem('app_lang') || 'ko';
  const t = translations?.[lang]?.GameMap || {};
  const t_ko = translations?.['ko']?.GameMap || {}; // 기준 데이터인 한국어 맵

  const subtopic = t.subtopic || '라운드 선택';

  const { isInitialized: webrtcInitialized } = useWebRTC();
  const { isConnected: websocketConnected, finalizeDisconnection } = useWebSocket();
  const { isHost, sendNextPage } = useHostActions();
  useWebSocketNavigation(navigate, { nextPagePath: '/game01' });

  //  방장이 지정한 mateName 동기화 로직
  // 게스트들이 접속했을 때 서버에 저장된 ai_name을 받아와 로컬 스토리지에 저장합니다.
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

  // 수정 끝나면 다시 풀어야함 !! 
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
  
//     if (!websocketConnected) {
//       // 1) reloading-grace가 켜져 있으면 finalize 억제
//       if (isReloadingGraceLocal()) {
//         console.log('♻️ reloading grace active — finalize 억제');
//         return;
//       }
  
//       // 2) debounce: 잠깐 기다렸다가 여전히 끊겨있으면 finalize
//       const DEBOUNCE_MS = 1200;
//       const timer = setTimeout(() => {
//         if (cancelled) return;
//         if (!websocketConnected && !isReloadingGraceLocal()) {
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
//   }, [websocketConnected, finalizeDisconnection]);


  const [connectionStatus, setConnectionStatus] = useState({
    websocket: false, webrtc: false, ready: false
  });

  //  카테고리 읽기(가볍게)
  const category = localStorage.getItem('category') || '안드로이드';
  const isAWS = category.includes('자율 무기 시스템') || category.toLowerCase().includes('weapon');

    // 라운드
  const [round, setRound] = useState(() => {
    const c = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    return c.length + 1;
  });

  useEffect(() => {
    const newStatus = {
      websocket: websocketConnected,
      webrtc: webrtcInitialized,
      ready: websocketConnected && webrtcInitialized
    };
    setConnectionStatus(newStatus);
    console.log('🔧 [Gamemap] 연결 상태 업데이트:', newStatus);
  }, [websocketConnected, webrtcInitialized]);

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = orig; };
  }, []);

  // 섹션과 옵션을 언어팩 데이터로 구성
  const sections = isAWS
    ? [
        { title: t.awsSection1Title || '주거, 군사 지역', options: [t.awsOption1_1 || 'AI 알고리즘 공개', t.awsOption1_2 || 'AWS의 권한'] },
        { title: t.awsSection2Title || '국가 인공지능 위원회', options: [t.awsOption2_1 || '사람이 죽지 않는 전쟁', t.awsOption2_2 || 'AI의 권리와 책임'] },
        { title: t.awsSection3Title || '국제 인류 발전 위원회', options: [t.awsOption3_1 || 'AWS 규제'] },
      ]
    : [
        { title: t.andSection1Title || '가정', options: [t.andOption1_1 || 'AI의 개인 정보 수집', t.andOption1_2 || '안드로이드의 감정 표현'] },
        { title: t.andSection2Title || '국가 인공지능 위원회', options: [t.andOption2_1 || '아이들을 위한 서비스', t.andOption2_2 || '설명 가능한 AI'] },
        { title: t.andSection3Title || '국제 인류 발전 위원회', options: [t.andOption3_1 || '지구, 인간, AI'] },
      ];

  // [핵심 함수] 영문 텍스트를 받아서 한국어 원문 키로 변환하는 함수
  const getStableText = (text) => {
    // 1. 현재 텍스트가 한국어라면 그대로 반환
    if (lang === 'ko') return text;
    
    // 2. 현재 언어팩(t)에서 해당 텍스트를 가진 키(key)를 찾음
    const key = Object.keys(t).find(k => t[k] === text);
    
    // 3. 그 키를 이용해 한국어 데이터(t_ko)의 값을 반환
    if (key && t_ko[key]) return t_ko[key];
    
    return text; // 못 찾으면 원래 텍스트 반환
  };

  const handleSelect = (topic, title) => {
    const prevTitle = localStorage.getItem('title');
    const categoryStored = localStorage.getItem('category') || (isAWS ? '자율 무기 시스템' : '안드로이드');
    const mode = 'neutral';
  
    // 데이터를 저장할 때 현재 표시된 텍스트(topic, title)가 어떤 '키(Key)'인지 찾아서 
    // 항상 한국어 원본으로 저장하도록 변환 로직 적용 (getStableText 사용)
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
        // 비교할 때도 한국어 데이터(t_ko)를 기준으로 비교해야 안전함
        if (stableTopic === (t_ko.awsOption2_2 || 'AI의 권리와 책임')) {
          nextPage = '/game02';
        } else {
          const myRoleId = localStorage.getItem('myrole_id');
          if (['1', '2', '3'].includes(myRoleId)) {
            nextPage = `/character_description${myRoleId}`;
          } else {
            nextPage = '/game01';
          }
        }
      }
    } else {
      nextPage = prevTitle === stableTitle ? '/game02' : '/game01';
    }
  
    navigate(nextPage);
  };
      
  const completedTopics = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
  
  // [수정] 완료 여부 체크 시 영문 텍스트를 한국어 원문으로 변환하여 체크
  const isCompleted = (displayText) => {
    const stableText = getStableText(displayText);
    return completedTopics.includes(stableText);
  };

  const getUnlockedOptions = () => {
    const unlocked = new Set();
    // 해금 로직 (비교 시 현재 언어팩의 텍스트 사용하지만 isCompleted 내부에서 변환됨)
    if (isAWS) {
      unlocked.add(t.awsOption1_1 || 'AI 알고리즘 공개');
      if (isCompleted(t.awsOption1_1 || 'AI 알고리즘 공개')) {
        unlocked.add(t.awsOption1_2 || 'AWS의 권한');
        unlocked.add(t.awsOption2_1 || '사람이 죽지 않는 전쟁');
      }
      if (isCompleted(t.awsOption2_1 || '사람이 죽지 않는 전쟁')) {
        unlocked.add(t.awsOption2_2 || 'AI의 권리와 책임');
        unlocked.add(t.awsOption3_1 || 'AWS 규제');
      }
    } else {
      unlocked.add(t.andOption1_1 || 'AI의 개인 정보 수집');
      if (isCompleted(t.andOption1_1 || 'AI의 개인 정보 수집')) {
        unlocked.add(t.andOption1_2 || '안드로이드의 감정 표현');
        unlocked.add(t.andOption2_1 || '아이들을 위한 서비스');
      }
      if (isCompleted(t.andOption2_1 || '아이들을 위한 서비스')) {
        unlocked.add(t.andOption2_2 || '설명 가능한 AI');
        unlocked.add(t.andOption3_1 || '지구, 인간, AI');
      }
    }
    return unlocked;
  };

  const unlockedOptions = getUnlockedOptions();

  const createOption = (text, title) => {
    const isDone = isCompleted(text); // 여기서 getStableText가 적용됨
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
    ? isCompleted(t.awsOption1_1 || 'AI 알고리즘 공개')
    : isCompleted(t.andOption1_1 || 'AI의 개인 정보 수집');
  const isInternationalUnlocked = isAWS
    ? isCompleted(t.awsOption2_1 || '사람이 죽지 않는 전쟁')
    : isCompleted(t.andOption2_1 || '아이들을 위한 서비스');

  const handleBackClick = () => {
    const idx = window.history.state?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate('/matename');
  };

  return (
    <Layout subtopic={subtopic} nodescription={true} onBackClick={handleBackClick}> 
      <div style={{
        width: 500,
        minHeight: 0,
        ...FontStyles.headlineSmall,
        color: Colors.systemRed,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        whiteSpace: 'pre-wrap', 
        textAlign: 'center'
      }}>
        {t.guideText || '합의 후 같은 라운드를 선택하세요.'}
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