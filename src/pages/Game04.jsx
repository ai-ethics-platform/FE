// useEffect(() => {
  //       let cancelled = false;
  //       const isReloadingGraceLocal = () => {
  //         const flag = sessionStorage.getItem('reloading') === 'true';
  //         const expire = parseInt(sessionStorage.getItem('reloading_expire_at') || '0', 10);
  //         if (!flag) return false;
  //         if (Date.now() > expire) {
  //           sessionStorage.removeItem('reloading');
  //           sessionStorage.removeItem('reloading_expire_at');
  //           return false;
  //         }
  //         return true;
  //       };
      
  //       if (!isConnected) {
  //         // 1) reloading-grace가 켜져 있으면 finalize 억제
  //         if (isReloadingGraceLocal()) {
  //           console.log('♻️ reloading grace active — finalize 억제');
  //           return;
  //         }
      
  //         // 2) debounce: 잠깐 기다렸다가 여전히 끊겨있으면 finalize
  //         const DEBOUNCE_MS = 1200;
  //         const timer = setTimeout(() => {
  //           if (cancelled) return;
  //           if (!isConnected && !isReloadingGraceLocal()) {
  //             console.warn('🔌 WebSocket 연결 끊김 → 초기화 (확정)');
  //             finalizeDisconnection('❌ 연결이 끊겨 게임이 초기화됩니다.');
  //           } else {
  //             console.log('🔁 재연결/리로드 감지 — finalize 스킵');
  //           }
  //         }, DEBOUNCE_MS);
      
  //         return () => {
  //           cancelled = true;
  //           clearTimeout(timer);
  //         };
  //       }
  //     }, [isConnected, finalizeDisconnection]);
  

  // 기본 로컬 값들


import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Layout    from '../components/Layout';
import Continue  from '../components/Continue';
import boxSelected from '../assets/contentBox5.svg';
import boxUnselect from '../assets/contentBox6.svg';
import { Colors, FontStyles } from '../components/styleConstants';
import agreeIcon from '../assets/agree.svg';
import disagreeIcon from '../assets/disagree.svg';

import axiosInstance from '../api/axiosInstance';
import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider';
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';
import { clearAllLocalStorageKeys } from '../utils/storage';

//  다국어 지원을 위한 임포트
import { translations } from '../utils/language';
import { resolveParagraphs } from '../utils/resolveParagraphs';

const completed = JSON.parse(localStorage.getItem('completedTopics') || '[]');
const initialRound = completed.length + 1;

export default function Game04() {
  const { state } = useLocation();
  const navigate   = useNavigate();

  const { isConnected, reconnectAttempts, maxReconnectAttempts,finalizeDisconnection } = useWebSocket();
  const { isInitialized: webrtcInitialized } = useWebRTC();
  const { isHost, sendNextPage } = useHostActions();
  useWebSocketNavigation(navigate, { nextPagePath: '/game05', infoPath: '/game05' });

  // 1. 다국어 및 기본 설정
  const lang = localStorage.getItem('app_lang') || 'ko';
  const currentLangData = translations[lang] || translations['ko'];
  const t = currentLangData.Game04 || {}; 
  const t_map = currentLangData.GameMap || {};
  const t_ui = currentLangData.UiElements || {};

  // 연결 상태 관리 (GameIntro에서 이미 초기화된 상태를 유지)
  const [connectionStatus, setConnectionStatus] = useState({
    websocket: true,
    webrtc: true,
    ready: true
  });

  useEffect(() => {
    const newStatus = {
      websocket: isConnected,
      webrtc: webrtcInitialized,
      ready: isConnected && webrtcInitialized
    };
    setConnectionStatus(newStatus);
    console.log('[Game04] 연결 상태 업데이트:', newStatus);
  }, [isConnected, webrtcInitialized]);

 // useEffect(() => {
  //       let cancelled = false;
  //       const isReloadingGraceLocal = () => {
  //         const flag = sessionStorage.getItem('reloading') === 'true';
  //         const expire = parseInt(sessionStorage.getItem('reloading_expire_at') || '0', 10);
  //         if (!flag) return false;
  //         if (Date.now() > expire) {
  //           sessionStorage.removeItem('reloading');
  //           sessionStorage.removeItem('reloading_expire_at');
  //           return false;
  //         }
  //         return true;
  //       };
      
  //       if (!isConnected) {
  //         // 1) reloading-grace가 켜져 있으면 finalize 억제
  //         if (isReloadingGraceLocal()) {
  //           console.log('♻️ reloading grace active — finalize 억제');
  //           return;
  //         }
      
  //         // 2) debounce: 잠깐 기다렸다가 여전히 끊겨있으면 finalize
  //         const DEBOUNCE_MS = 1200;
  //         const timer = setTimeout(() => {
  //           if (cancelled) return;
  //           if (!isConnected && !isReloadingGraceLocal()) {
  //             console.warn('🔌 WebSocket 연결 끊김 → 초기화 (확정)');
  //             finalizeDisconnection('❌ 연결이 끊겨 게임이 초기화됩니다.');
  //           } else {
  //             console.log('🔁 재연결/리로드 감지 — finalize 스킵');
  //           }
  //         }, DEBOUNCE_MS);
      
  //         return () => {
  //           cancelled = true;
  //           clearTimeout(timer);
  //         };
  //       }
  //     }, [isConnected, finalizeDisconnection]);

  const myVote   = state?.agreement ?? null;

  // 기본 로컬 값들
  const rawSubtopic = localStorage.getItem('subtopic') || 'AI의 개인 정보 수집';
  const roomCode    = localStorage.getItem('room_code') || '';
  const category    = localStorage.getItem('category') || '안드로이드';
  const isAWS       = category === '자율 무기 시스템';

  // ✅ 커스텀 모드 판별 및 커스텀 값 로드
  const isCustomMode      = !!localStorage.getItem('code');
  const creatorTitle      = localStorage.getItem('creatorTitle') || '';
  const customAgreeLabel  = localStorage.getItem('agree_label') || (lang === 'ko' ? '동의' : 'Agree');
  const customDisagreeLbl = localStorage.getItem('disagree_label') || (lang === 'ko' ? '비동의' : 'Disagree');

  // 2. Stable Key 로직 (영문 주제명이라도 한국어 키를 찾아 데이터 매칭)
  const getStableSubtopicKey = () => {
    if (isCustomMode) return 'custom';
    // GameMap에서 현재 subtopic에 해당하는 key를 찾고, ko 버전의 실제 주제명을 반환
    const mapKey = Object.keys(t_map).find(key => t_map[key] === rawSubtopic);
    return mapKey ? translations['ko'].GameMap[mapKey] : rawSubtopic;
  };

  const stableKey = getStableSubtopicKey();

  // 헤더에 표시될 제목: 커스텀 모드면 creatorTitle 사용
  const subtopic = isCustomMode ? (creatorTitle || rawSubtopic) : rawSubtopic;

  const [openProfile, setOpenProfile] = useState(null);

  const [round, setRound] = useState(() => {
    const c = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    return c.length + 1;
  });

  useEffect(() => {
    localStorage.setItem('currentRound', String(round));
  }, [round]);

  const [agreedList, setAgreedList] = useState([]);
  const [disagreedList, setDisagreedList] = useState([]);
  const [selectedMode, setSelectedMode] = useState(() => localStorage.getItem('mode') ?? null);

  useEffect(() => {
    let attempt = 0;
    const maxAttempts = 5;
    const interval = 1000;

    const fetchAgreementStatus = async () => {
      try {
        const res = await axiosInstance.get(`/rooms/${roomCode}/rounds/${round}/status`);
        const participants = res.data.participants;

        // choice = 1: 동의, choice = 2: 비동의
        const agreeList = participants.filter(p => p.choice === 1).map(p => `${p.role_id}P`);
        const disagreeList = participants.filter(p => p.choice === 2).map(p => `${p.role_id}P`);

        setAgreedList(agreeList);
        setDisagreedList(disagreeList);

        console.log(` [Game04] ${attempt + 1}번째 동의 상태 확인:`, { agreeList, disagreeList });

        if (agreeList.length > disagreeList.length) {
          localStorage.setItem('mode', 'agree');
          setSelectedMode('agree');
        } else {
          localStorage.setItem('mode', 'disagree');
          setSelectedMode('disagree');
        }

        const total = agreeList.length + disagreeList.length;
        const isUnanimous = total === 3 && (agreeList.length === 0 || disagreeList.length === 0);
        
        let history = JSON.parse(localStorage.getItem('unanimousHistory') || '[]');
        history = history.filter(h => h.round !== round);
        
        const unanimousSoFar = history.filter(h => h.isUnanimous).length;
        const nonUnanimousSoFar = history.filter(h => !h.isUnanimous).length;
        
        let nthUnanimous = null;
        let nthNonUnanimous = null;
        if (isUnanimous) {
          nthUnanimous = unanimousSoFar + 1;     
        } else {
          nthNonUnanimous = nonUnanimousSoFar + 1; 
        }
        
        const newEntry = { round, isUnanimous, nthUnanimous, nthNonUnanimous };
        history.push(newEntry);
        
        localStorage.setItem('unanimous', JSON.stringify(isUnanimous));
        localStorage.setItem('unanimousHistory', JSON.stringify(history));
        
        console.log('[Game04] 만장일치 기록 업데이트:', history); 
      } catch (err) {
        console.error(' [Game04] 동의 상태 조회 실패:', err);
      }
    };

    fetchAgreementStatus();
    const intervalId = setInterval(() => {
      attempt += 1;
      if (attempt >= maxAttempts) {
        clearInterval(intervalId);
        console.log('⏹️ [Game04] 동의 상태 폴링 종료 (최대 횟수 도달)');
      } else {
        fetchAgreementStatus();
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [roomCode, round]);

  const [secsLeft, setSecsLeft] = useState(300);
  useEffect(() => {
    if (secsLeft <= 0) return;
    const timer = setInterval(() => setSecsLeft(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secsLeft]);

  const timeStr =
    `${String(Math.floor(secsLeft/60)).padStart(2,'0')}:${String(secsLeft%60).padStart(2,'0')}`;

  const handleContinue = () => {
    navigate('/game05');
  };

  const handleBackClick = () => {
    const idx = window.history.state?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate('/game03');
  };

  // ✅  하드코딩된 subtopicMap 제거 및 언어팩 데이터 활용
  const labels = isCustomMode
    ? { agree: customAgreeLabel, disagree: customDisagreeLbl }
    : (t.labels?.[stableKey] ?? { agree: lang === 'ko' ? '동의' : 'Agree', disagree: lang === 'ko' ? '비동의' : 'Disagree' });

  return (
    <Layout subtopic={subtopic} round={round} onProfileClick={setOpenProfile} onBackClick={handleBackClick}>
      <div
        style={{
          width: 100,
          minHeight: 40,
          ...FontStyles.headlineNormal,
          color: secsLeft <= 10 && secsLeft > 0 ? Colors.systemRed : Colors.grey04,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        {timeStr}
      </div>

      <div style={{ marginTop: 10, display: 'flex', gap: 48 }}>
        {[
          { list: agreedList, key: 'agree', icon: agreeIcon },
          { list: disagreedList, key: 'disagree', icon: disagreeIcon },
        ].map(({ list, key, icon }) => (
          <div key={key} style={{ position: 'relative', width: 360, height: 391 }}>
            <img
              src={key === selectedMode ? boxSelected : boxUnselect}
              alt={`${key} 아이콘`}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'fill',
              }}
            />
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '0 20px',
              }}
            >
              <img src={icon} style={{ width: 160, height: 160, marginTop: 40, marginBottom: -10 }} />
              <p style={{ ...FontStyles.headlineSmall, color: Colors.brandPrimary }}>
                {labels[key] ?? (key === 'agree' ? (lang === 'ko' ? '동의' : 'Agree') : (lang === 'ko' ? '비동의' : 'Disagree'))}
              </p>
              <p style={{ ...FontStyles.headlineLarge, color: Colors.grey06, margin: '16px 0' }}>
                {list.length}{t.unit_person || (lang === 'ko' ? '명' : '')}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 10 }}>
        <p style={{ ...FontStyles.headlineSmall, color: Colors.grey05 }}>
          {secsLeft <= 0 ? t.finish_msg : t.share_reason_msg}
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 24,
            marginTop: 16,
          }}
        >
          <Continue width={264} height={72} step={1} onClick={handleContinue} />
        </div>
      </div>
    </Layout>
  );
}