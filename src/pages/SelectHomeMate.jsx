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
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import ContentTextBox from '../components/ContentTextBox';
// 안드로이드 캐릭터 이미지
import character1 from '../assets/images/character1.png';
import character2 from '../assets/images/character2.png';
import character3 from '../assets/images/character3.png';
// 자율 무기 시스템 캐릭터 이미지
import killerCharacter1 from '../assets/images/Killer_Character1.jpg';
import killerCharacter2 from '../assets/images/Killer_Character2.jpg';
import killerCharacter3 from '../assets/images/Killer_Character3.jpg';

import { clearAllLocalStorageKeys } from '../utils/storage';
import axiosInstance from '../api/axiosInstance';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import { useWebRTC } from '../WebRTCProvider';
import { useWebSocket } from '../WebSocketProvider';
import { 
  useWebSocketNavigation, 
  useHostActions 
} from '../hooks/useWebSocketMessage';
import { FontStyles,Colors } from '../components/styleConstants';
import HostCheck1 from '../components/HostCheck1';

// 이미지 에셋 - 언어별 대응
import hostInfoSvg from '../assets/host_info.svg';
import hostInfoSvg_en from '../assets/en/host_info_en.svg'; // 사용자 규칙: _en 접미사

import HostInfoBadge from '../components/HostInfoBadge';
// Localization
import { translations } from '../utils/language/index';

export default function SelectHomeMate() {
  const navigate = useNavigate();
  
  // Get language setting and translations
  const lang = localStorage.getItem('language') || 'ko';
  const t = translations?.[lang]?.SelectHomeMate || {};

  // 언어 설정에 따른 이미지 선택
  const currentHostInfoSvg = lang === 'en' ? hostInfoSvg_en : hostInfoSvg;

  const [activeIndex, setActiveIndex] = useState(null);
  const [hostId, setHostId] = useState(null);
  const [myRoleId, setMyRoleId] = useState(null);
  const [category, setCategory] = useState(null);

  // round 계산 (기본값 그대로)
  const [round, setRound] = useState(() => {
    const c = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    return c.length + 1;
  });

  // WebSocket과 WebRTC 상태 가져오기
  const { voiceSessionStatus, isInitialized: webrtcInitialized } = useWebRTC();
  const { 
    isConnected: websocketConnected,
    isPageReloading,
    finalizeDisconnection
  } = useWebSocket();
  //  커스텀 훅들 사용 
  const { isHost, sendNextPage } = useHostActions();
  
  //  페이지 이동 메시지 핸들러 
  useWebSocketNavigation(navigate, {
    nextPagePath: '/matename' 
  });

  // 연결 상태 모니터링
  const [connectionStatus, setConnectionStatus] = useState({
    websocket: false,
    webrtc: false,
    ready: false
  });

  // 유저 도착 상태 추가
  const [arrivalStatus, setArrivalStatus] = useState({
    arrived_users: 0,
    total_required: 3,
    all_arrived: false,
  });
  
  // 역할별 사용자 ID 매핑
  const [roleUserMapping, setRoleUserMapping] = useState({
    role1_user_id: null,
    role2_user_id: null,
    role3_user_id: null,
  });

  // 컴포넌트 초기화
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

    console.log(' [SelectHomeMate] 초기화 완료:', {
      hostId: storedHost,
      myRoleId: storedMyRole,
      category: storedCategory,
      roleMapping: { role1, role2, role3 },
      isHost: storedHost === storedMyRole,
      round: round
    });
  }, [round]);

  useEffect(() => {
    const newStatus = {
      websocket: websocketConnected,
      webrtc: true,
      ready: true,
    };
    setConnectionStatus(newStatus);
  }, [websocketConnected]);

  // 페이지 도착 시 ready 상태 보내기 (round * 2 사용)
  useEffect(() => {
    const roomCode = localStorage.getItem('room_code');
    const nickname = localStorage.getItem('nickname');

    if (roomCode && nickname) {
      // 도착 기록 - API 호출 시에만 round * 2 사용
      axiosInstance.post('/rooms/page-arrival', {
        room_code: roomCode,
        page_number: round * 7,
        user_identifier: nickname,
      }).catch((e) => {
        console.error('[SelectHomeMate] page-arrival 실패:', e);
      });
    }
  }, [round]);

  // 3명의 유저 모두 도착 확인 폴링 (round * 2 사용)
  useEffect(() => {
    const roomCode = localStorage.getItem('room_code');
    if (!roomCode) return;

    let timer;
    const poll = async () => {
      try {
        // API 호출 시에만 round * 2 사용
        const res = await axiosInstance.get(`/rooms/page-sync-status/${roomCode}/${round * 7}`);
        setArrivalStatus(res.data);

        console.log('[SelectHomeMate] 도착 상태:', res.data);

        if (!res.data.all_arrived) {
          timer = setTimeout(poll, 3000); // 3초 폴링
        }
        // all_arrived === true면 폴링 중지
      } catch (e) {
        console.warn('[SelectHomeMate] page-sync-status 오류, 재시도:', e);
        timer = setTimeout(poll, 2000);
      }
    };
    poll();
    return () => clearTimeout(timer);
  }, [round]);

  // ▼▼▼ [핵심 수정] 카테고리 인식 로직 강화 (GameIntro와 동일한 로직 적용) ▼▼▼
  // localStorage에서 가져올 때 렌더링 시점에 바로 반영되도록 변수 선언
  const currentCategory = localStorage.getItem('category');
  
  const isAndroid = currentCategory && (currentCategory.includes('안드로이드') || currentCategory.toLowerCase().includes('android'));
  // 안드로이드가 아니면 AWS로 간주 (영어/한국어 모두 대응 가능)
  const isAWS = !isAndroid;

  // category에 따른 이미지 선택
  const getImages = () => {
    // 위에서 계산한 isAWS 플래그 사용
    if (isAWS) {
      return [killerCharacter1, killerCharacter2, killerCharacter3];
    } else {
      // category === '안드로이드' 또는 기본값
      return [character1, character2, character3];
    }
  };

  const images = getImages();

  // 텍스트 선택 로직 (isAWS 사용)
  const paragraphs = [
    {
      main: isAWS
        ? (t.mainAws || ' 여러분이 생각하는 자율 무기 시스템은 어떤 형태인가요?')
        : (t.mainAndroid || ' 여러분이 생각하는 HomeMate는 어떤 형태인가요?'),
      sub: isHost
        ? arrivalStatus.all_arrived
          ? (t.subHostAllArrived || `(함께 토론한 후 방장이 선택하고, '다음' 버튼을 클릭해주세요)`)
          : `${t.subWaiting || '(유저 입장 대기 중...'} ${arrivalStatus.arrived_users}/${arrivalStatus.total_required})`
        : arrivalStatus.all_arrived
          ? (t.subGuestAllArrived || '(방장이 캐릭터를 선택할 때까지 기다려주세요)')
          : `${t.subWaiting || '(유저 입장 대기 중...'} ${arrivalStatus.arrived_users}/${arrivalStatus.total_required})`,
    },
  ];

  // 방장 전용 캐릭터 선택 핸들러 (모든 유저 도착 후에만 활성화)
  const handleCharacterSelect = (idx) => {
    if (!isHost) {
      console.log('[SelectHomeMate] 방장이 아니므로 캐릭터 선택 불가');
      alert(t.alertNotHost || '방장만 캐릭터를 선택할 수 있습니다.');
      return;
    }
    
    if (!arrivalStatus.all_arrived) {
      console.log('[SelectHomeMate] 아직 모든 유저가 도착하지 않음');
      alert(t.alertWaitingAll || '모든 유저가 입장할 때까지 기다려주세요.');
      return;
    }
    
    setActiveIndex(idx);
    console.log(`[SelectHomeMate] 방장이 캐릭터 ${idx + 1} 선택 (카테고리: ${currentCategory})`);
  };

  const handleContinue = async () => {
    if (!isHost) {
      alert(t.alertNotHost || '방장만 게임을 진행할 수 있습니다.');
      return;
    }
    if (!arrivalStatus.all_arrived) {
      alert(t.alertWaitingAll || '모든 유저가 입장할 때까지 기다려주세요.');
      return;
    }
    if (activeIndex === null) {
      alert(t.alertSelectCharacter || '캐릭터를 먼저 선택해주세요!');
      return;
    }
    const roomCode = localStorage.getItem('room_code');
    if (!roomCode) {
      alert(t.alertNoRoomCode || 'room_code가 없습니다. 방에 먼저 입장하세요.');
      return;
    }

    try {
      //  1) 메이트 캐릭터 선택 POST
      const { data } = await axiosInstance.post('/rooms/ai-select', {
        room_code: roomCode,
        ai_type: activeIndex + 1,
      });

      console.log('[SelectHomeMate] AI 선택 성공:', data);
      localStorage.setItem('selectedCharacterIndex', String(activeIndex));

      //  2) WebSocket으로 다음 페이지 브로드캐스트
      sendNextPage();
    } catch (err) {
      // 서버에 이미 저장된 상태(중복 저장)로 400이 오는 경우: 로컬만 저장하고 그대로 진행
      const status = err?.response?.status;
      if (status === 400) {
        console.warn('[SelectHomeMate] AI 선택: 이미 저장된 것으로 판단(400) → 로컬 저장 후 진행', err?.response?.data);
        localStorage.setItem('selectedCharacterIndex', String(activeIndex));
        sendNextPage();
        return;
      }

      console.error('[SelectHomeMate] AI 선택 실패:', err);
      alert(t.alertSelectFail || '메이트 선택 실패');
    }
  };

  // 캐릭터 선택 및 다음 버튼 활성화 조건
  const canSelectCharacter = isHost && arrivalStatus.all_arrived;
  const canClickNext = canSelectCharacter && activeIndex !== null;

  return (
    <Background bgIndex={2}>
     {hostId === myRoleId && (
      <div 
        style={{
          position: 'absolute',
          top: '-120px',
          right: '0px', 
          zIndex: 10, 
        }}
      >
        <HostInfoBadge
          src={currentHostInfoSvg} // ✅ 언어에 따른 이미지 적용
          alt="Host Info"
          preset="hostInfo"
          width={320}
          height={300}
        />
      </div>
    )}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>      
        <div style={{
          position: 'fixed',
          top: '32.5%',
          left: 0,
          transform: 'translateY(-50%)',
          width: 220,
          padding: '20px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          alignItems: 'flex-start',
        }}>
          <UserProfile
            player="1P"
            isLeader={hostId === '1'}
            isMe={myRoleId === '1'}
          />
          <UserProfile
            player="2P"
            isLeader={hostId === '2'}
            isMe={myRoleId === '2'}
          />
          <UserProfile
            player="3P"
            isLeader={hostId === '3'}
            isMe={myRoleId === '3'}
          />
        </div>

        <div style={{
          position: 'absolute',
          top: '46%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80vw',
          maxWidth: 936,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: 24 }}>
            {images.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Character ${idx + 1} (${currentCategory})`}
                onClick={() => handleCharacterSelect(idx)} 
                style={{
                  width: 264,
                  height: 360,
                  objectFit: 'cover',
                  borderRadius: 4,
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
              disabled={!canClickNext} // ContentTextBox에 disabled prop이 있다면
            />
          </div>
        </div>
      </div>
    </Background>
  );
}