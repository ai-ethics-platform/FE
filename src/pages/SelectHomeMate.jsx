 // useEffect(() => {
  //   if (!websocketConnected) {
  //     console.warn('🔌 [SelectHomeMate] WebSocket 연결 끊김 → 초기화 후 메인으로 이동');
  //     clearAllLocalStorageKeys();
  //     alert('❌ 연결이 끊겨 게임이 초기화됩니다.');
  //     navigate('/');
  //   }
  // }, [websocketConnected, navigate]);

  // useEffect(() => {
  //   if (!websocketConnected && !isPageReloading) {
  //     console.warn('🔌 WebSocket 연결 끊김 → 초기화');
  //     // 함수 참조니까 바로 호출 가능
  //     finalizeDisconnection('❌ 연결이 끊겨 게임이 초기화됩니다.');
  //   }
  // }, [websocketConnected, isPageReloading, finalizeDisconnection]);
  // useEffect(() => {
  //   let cancelled = false;
  //   const isReloadingGraceLocal = () => {
  //     const flag = sessionStorage.getItem('reloading') === 'true';
  //     const expire = parseInt(sessionStorage.getItem('reloading_expire_at') || '0', 10);
  //     if (!flag) return false;
  //     if (Date.now() > expire) {
  //       sessionStorage.removeItem('reloading');
  //       sessionStorage.removeItem('reloading_expire_at');
  //       return false;
  //     }
  //     return true;
  //   };
  
  //   if (!websocketConnected) {
  //     // 1) reloading-grace가 켜져 있으면 finalize 억제
  //     if (isReloadingGraceLocal()) {
  //       console.log('♻️ reloading grace active — finalize 억제');
  //       return;
  //     }
  
  //     // 2) debounce: 잠깐 기다렸다가 여전히 끊겨있으면 finalize
  //     const DEBOUNCE_MS = 1200;
  //     const timer = setTimeout(() => {
  //       if (cancelled) return;
  //       if (!websocketConnected && !isReloadingGraceLocal()) {
  //         console.warn('🔌 WebSocket 연결 끊김 → 초기화 (확정)');
  //         finalizeDisconnection('❌ 연결이 끊겨 게임이 초기화됩니다.');
  //       } else {
  //         console.log('🔁 재연결/리로드 감지 — finalize 스킵');
  //       }
  //     }, DEBOUNCE_MS);
  
  //     return () => {
  //       cancelled = true;
  //       clearTimeout(timer);
  //     };
  //   }
  // }, [websocketConnected, finalizeDisconnection]);
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import ContentTextBox from '../components/ContentTextBox';

// 캐릭터 이미지 임포트
import character1 from '../assets/images/character1.png';
import character2 from '../assets/images/character2.png';
import character3 from '../assets/images/character3.png';
import killerCharacter1 from '../assets/images/Killer_Character1.jpg';
import killerCharacter2 from '../assets/images/Killer_Character2.jpg';
import killerCharacter3 from '../assets/images/Killer_Character3.jpg';

import axiosInstance from '../api/axiosInstance';
import { useWebRTC } from '../WebRTCProvider';
import { useWebSocket } from '../WebSocketProvider';
import { 
  useWebSocketNavigation, 
  useHostActions 
} from '../hooks/useWebSocketMessage';
import { FontStyles, Colors } from '../components/styleConstants';
import voiceManager from '../utils/voiceManager';

// 이미지 에셋 - 언어별 대응
import hostInfoSvg from '../assets/host_info.svg';
import hostInfoSvg_en from '../assets/en/host_info_en.svg';

import HostInfoBadge from '../components/HostInfoBadge';
// Localization 연동
import { translations } from '../utils/language/index';

export default function SelectHomeMate() {
  const navigate = useNavigate();
  
  // 프로젝트 표준 키값 app_lang 사용 및 언어팩 로드
  const getInitialLang = () => {
    const savedAppLang = localStorage.getItem('app_lang');
    const savedLanguage = localStorage.getItem('language');
    
    // 1. 저장된 값이 있다면 최우선 적용
    if (savedAppLang) return savedAppLang;
    if (savedLanguage) return savedLanguage;

    // 2. 저장된 값이 없다면(새 컴퓨터), 브라우저 설정 언어 감지
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('en')) return 'en';
    
    return 'ko'; // 기본값
  };

  const lang = getInitialLang();
  
  // 언어팩 로드 (폴백 보강)
  const currentLangData = translations?.[lang] || translations['ko'] || {};
  const t = currentLangData.SelectHomeMate || {};

  // 언어 설정에 따른 이미지 선택
  const currentHostInfoSvg = (lang !== 'ko') ? hostInfoSvg_en : hostInfoSvg;

  const [activeIndex, setActiveIndex] = useState(null);
  const [hostId, setHostId] = useState(null);
  const [myRoleId, setMyRoleId] = useState(null);
  const [category, setCategory] = useState(null);
  const [voiceInitialized, setVoiceInitialized] = useState(false);

  const [round, setRound] = useState(() => {
    try {
      const c = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
      return c.length + 1;
    } catch (e) {
      return 1;
    }
  });

  const { isConnected: websocketConnected } = useWebSocket();
  const { isHost, sendNextPage } = useHostActions();
  
  useWebSocketNavigation(navigate, { nextPagePath: '/matename' });

  const [arrivalStatus, setArrivalStatus] = useState({
    arrived_users: 0,
    total_required: 3,
    all_arrived: false,
  });
  
  const [roleUserMapping, setRoleUserMapping] = useState({
    role1_user_id: null,
    role2_user_id: null,
    role3_user_id: null,
  });

  useEffect(() => {
    const storedHost = localStorage.getItem('host_id');
    const storedMyRole = localStorage.getItem('myrole_id');
    const storedCategory = localStorage.getItem('category');
    const role1 = localStorage.getItem('role1_user_id');
    const role2 = localStorage.getItem('role2_user_id');
    const role3 = localStorage.getItem('role3_user_id');

    setHostId(storedHost);
    setMyRoleId(storedMyRole);
    setCategory(storedCategory);
    setRoleUserMapping({
      role1_user_id: role1,
      role2_user_id: role2,
      role3_user_id: role3,
    });
  }, [round]);

  useEffect(() => {
    const roomCode = localStorage.getItem('room_code');
    const nickname = localStorage.getItem('nickname');
    if (roomCode && nickname) {
      axiosInstance.post('/rooms/page-arrival', {
        room_code: roomCode,
        page_number: round * 7,
        user_identifier: nickname,
      }).catch((e) => console.error('page-arrival 실패:', e));
    }
  }, [round]);

  useEffect(() => {
    const roomCode = localStorage.getItem('room_code');
    if (!roomCode) return;
    let timer;
    const poll = async () => {
      try {
        const res = await axiosInstance.get(`/rooms/page-sync-status/${roomCode}/${round * 7}`);
        setArrivalStatus(res.data);
        if (!res.data.all_arrived) {
          timer = setTimeout(poll, 3000);
        }
      } catch (e) {
        timer = setTimeout(poll, 2000);
      }
    };
    poll();
    return () => clearTimeout(timer);
  }, [round]);

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

  const currentCategory = localStorage.getItem('category') || '';
  const isAndroid = currentCategory.includes('안드로이드') || currentCategory.toLowerCase().includes('android');
  const isAWS = !isAndroid;

  const images = isAWS 
    ? [killerCharacter1, killerCharacter2, killerCharacter3] 
    : [character1, character2, character3];

  // 하드코딩된 한글을 제거하고 언어팩 데이터에만 의존
  const paragraphs = [
    {
      main: isAWS ? t.mainAws : t.mainAndroid,
      sub: isHost
        ? arrivalStatus.all_arrived
          ? t.subHostAllArrived
          : `${t.subWaiting} ${arrivalStatus.arrived_users}/${arrivalStatus.total_required})`
        : arrivalStatus.all_arrived
          ? t.subGuestAllArrived
          : `${t.subWaiting} ${arrivalStatus.arrived_users}/${arrivalStatus.total_required})`,
    },
  ];

  const handleCharacterSelect = (idx) => {
    if (!isHost) {
      alert(t.alertNotHost || 'Only the host can select a character.');
      return;
    }
    if (!arrivalStatus.all_arrived) {
      alert(t.alertWaitingAll || 'Please wait until all players have entered.');
      return;
    }
    setActiveIndex(idx);
  };

  const handleContinue = async () => {
    if (!isHost) return;
    if (!arrivalStatus.all_arrived || activeIndex === null) return;
    const roomCode = localStorage.getItem('room_code');
    try {
      await axiosInstance.post('/rooms/ai-select', {
        room_code: roomCode,
        ai_type: activeIndex + 1,
      });
      localStorage.setItem('selectedCharacterIndex', String(activeIndex));
      sendNextPage();
    } catch (err) {
      if (err?.response?.status === 400) {
        localStorage.setItem('selectedCharacterIndex', String(activeIndex));
        sendNextPage();
        return;
      }
      alert(t.alertSelectFail || 'Failed to select character.');
    }
  };

  const canSelectCharacter = isHost && arrivalStatus.all_arrived;
  const canClickNext = canSelectCharacter && activeIndex !== null;

  return (
    <Background bgIndex={2}>
      {hostId === myRoleId && (
        <div style={{ position: 'absolute', top: '-120px', right: '0px', zIndex: 10 }}>
          <HostInfoBadge
            src={currentHostInfoSvg}
            alt="Host Info"
            preset="hostInfo"
            width={320}
            height={300}
          />
        </div>
      )}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>      
        <div style={{ position: 'fixed', top: '32.5%', left: 0, transform: 'translateY(-50%)', width: 220, padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
          <UserProfile player="1P" isLeader={hostId === '1'} isMe={myRoleId === '1'} />
          <UserProfile player="2P" isLeader={hostId === '2'} isMe={myRoleId === '2'} />
          <UserProfile player="3P" isLeader={hostId === '3'} isMe={myRoleId === '3'} />
        </div>

        <div style={{ position: 'absolute', top: '46%', left: '50%', transform: 'translate(-50%, -50%)', width: '80vw', maxWidth: 936, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 24 }}>
            {images.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Character ${idx + 1}`}
                onClick={() => handleCharacterSelect(idx)} 
                style={{
                  width: 264, height: 360, objectFit: 'cover', borderRadius: 4,
                  cursor: canSelectCharacter ? 'pointer' : 'not-allowed', 
                  border: activeIndex === idx ? `2px solid #354750` : 'none',
                  transform: activeIndex === idx ? 'scale(1.01)' : 'scale(1)',
                  transition: 'all 0.2s ease-in-out',
                  opacity: canSelectCharacter ? 1 : 0.5,
                  filter: canSelectCharacter ? 'none' : 'grayscale(50%)', 
                }}
              />
            ))}
          </div>
          <div style={{ marginTop: 14, width: '100%' }}>
            <ContentTextBox
              paragraphs={paragraphs}
              onContinue={handleContinue}
              disabled={!canClickNext}
            />
          </div>
        </div>
      </div>
    </Background>
  );
}