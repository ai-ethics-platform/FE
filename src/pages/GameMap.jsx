// pages/GameMap.jsx
import React, { useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import GameMapFrame from '../components/GameMapFrame';
import homeIcon from '../assets/homeIcon.svg';
import aiIcon from '../assets/aiIcon.svg';
import internationalIcon from '../assets/internationalIcon.svg';
import { useWebRTC } from '../WebRTCProvider';
import { useWebSocket } from '../WebSocketProvider';
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';
import { FontStyles,Colors } from '../components/styleConstants';

export default function GameMap() {
  const navigate = useNavigate();
  const subtopic = '라운드 선택';

  const { isInitialized: webrtcInitialized } = useWebRTC();
  const { isConnected: websocketConnected,finalizeDisconnection } = useWebSocket();
  const { isHost, sendNextPage } = useHostActions();
  useWebSocketNavigation(navigate, { nextPagePath: '/game01' });
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
      // 1) reloading-grace가 켜져 있으면 finalize 억제
      if (isReloadingGraceLocal()) {
        console.log('♻️ reloading grace active — finalize 억제');
        return;
      }
  
      // 2) debounce: 잠깐 기다렸다가 여전히 끊겨있으면 finalize
      const DEBOUNCE_MS = 1200;
      const timer = setTimeout(() => {
        if (cancelled) return;
        if (!websocketConnected && !isReloadingGraceLocal()) {
          console.warn('🔌 WebSocket 연결 끊김 → 초기화 (확정)');
          finalizeDisconnection('❌ 연결이 끊겨 게임이 초기화됩니다.');
        } else {
          console.log('🔁 재연결/리로드 감지 — finalize 스킵');
        }
      }, DEBOUNCE_MS);
  
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }
  }, [websocketConnected, finalizeDisconnection]);
  const [connectionStatus, setConnectionStatus] = useState({
    websocket: false, webrtc: false, ready: false
  });

  //  카테고리 읽기(가볍게)
  const category = localStorage.getItem('category') || '안드로이드';
  const isAWS = category === '자율 무기 시스템';

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

  //  섹션과 옵션을 카테고리에 따라 구성
  const sections = isAWS
    ? [
        { title: '주거, 군사 지역', options: ['AI 알고리즘 공개', 'AWS의 권한'] },
        { title: '국가 인공지능 위원회', options: ['사람이 죽지 않는 전쟁', 'AI의 권리와 책임'] },
        { title: '국제 인류 발전 위원회', options: ['AWS 규제'] },
      ]
    : [
        { title: '가정', options: ['AI의 개인 정보 수집', '안드로이드의 감정 표현'] },
        { title: '국가 인공지능 위원회', options: ['아이들을 위한 서비스', '설명 가능한 AI'] },
        { title: '국제 인류 발전 위원회', options: ['지구, 인간, AI'] },
      ];
      const handleSelect = (topic, title) => {
        const prevTitle = localStorage.getItem('title');
        const categoryStored =
          localStorage.getItem('category') || (isAWS ? '자율 무기 시스템' : '안드로이드');
        const mode = 'neutral';
      
        localStorage.setItem('title', title);
        localStorage.setItem('category', categoryStored);
        localStorage.setItem('subtopic', topic);
        localStorage.setItem('mode', mode);
      
        let nextPage;
      
        if (isAWS) {
          // AWS 모드
          if (prevTitle !== title) {
            nextPage = '/game01';
          } else {
            // 타이틀 동일
            if (topic === 'AI의 권리와 책임') {
              nextPage = '/game02';
            } else {
              const myRoleId = localStorage.getItem('myrole_id');
              if (myRoleId === '1' || myRoleId === '2' || myRoleId === '3') {
                nextPage = `/character_description${myRoleId}`;
              } else {
                // 역할 아이디 없으면 안전 폴백
                nextPage = '/game01';
                console.warn('[GameMap][AWS] myrole_id 없음 → /game01로 폴백');
              }
            }
          }
        } else {
          // 안드로이드 모드: 기존 규칙 유지
          nextPage = prevTitle === title ? '/game02' : '/game01';
        }
      
        navigate(nextPage);
      };
      
      
  const completedTopics = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
  const isCompleted = (name) => completedTopics.includes(name);

  //  해금 규칙(카테고리별 1→2→3 단계)
  const getUnlockedOptions = () => {
    const unlocked = new Set();

    if (isAWS) {
      // 1단계: 첫 옵션만 기본 해금
      unlocked.add('AI 알고리즘 공개');
      // 2단계: 1단계 첫 옵션 완료 시
      if (isCompleted('AI 알고리즘 공개')) {
        unlocked.add('AWS의 권한');
        unlocked.add('사람이 죽지 않는 전쟁');
      }
      // 3단계: 2단계 첫 옵션 완료 시
      if (isCompleted('사람이 죽지 않는 전쟁')) {
        unlocked.add('AI의 권리와 책임');
        unlocked.add('AWS 규제');
      }
    } else {
      // 안드로이드 
      unlocked.add('AI의 개인 정보 수집');
      if (isCompleted('AI의 개인 정보 수집')) {
        unlocked.add('안드로이드의 감정 표현');
        unlocked.add('아이들을 위한 서비스');
      }
      if (isCompleted('아이들을 위한 서비스')) {
        unlocked.add('설명 가능한 AI');
        unlocked.add('지구, 인간, AI');
      }
    }
    return unlocked;
  };

  const unlockedOptions = getUnlockedOptions();

  const createOption = (text, title) => {
    const isDone = completedTopics.includes(text);
    const isUnlocked = unlockedOptions.has(text);

    return {
      text,
      disabled: isDone,         // 완료한 항목은 비활성
      locked: !isUnlocked,      // 잠금 표시용
      onClick: () => {
        if (!isDone && isUnlocked) handleSelect(text, title);
      },
    };
  };

  //  섹션 단축 변수
  const s0 = sections[0];
  const s1 = sections[1];
  const s2 = sections[2];

  //  프레임 잠금 여부 (1프레임은 항상 열림, 2/3은 단계 해금)
  const isHomeUnlocked = true;
  const isNationalUnlocked = isAWS
    ? isCompleted('AI 알고리즘 공개')                // AWS 1-1 완료 시 2프레임
    : isCompleted('AI의 개인 정보 수집');          // Android 1-1 완료 시 2프레임
  const isInternationalUnlocked = isAWS
    ? isCompleted('사람이 죽지 않는 전쟁')          // AWS 2-1 완료 시 3프레임
    : isCompleted('아이들을 위한 서비스');          // Android 2-1 완료 시 3프레임
    const handleBackClick = () => {
      window.history.back(); 
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
      }}>
        합의 후 같은 라운드를 선택하세요.
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', gap: 8, marginLeft: 60, marginTop: 12, zIndex: 1 }}>
        {/* 섹션 1 */}
        <GameMapFrame
          icon={homeIcon}
          title={s0.title}
          disabled={!isHomeUnlocked}
          option1={createOption(s0.options[0], s0.title)}
          option2={s0.options[1] ? createOption(s0.options[1], s0.title) : undefined}
        />

        {/* 섹션 2 */}
        <GameMapFrame
          icon={aiIcon}
          title={s1.title}
          disabled={!isNationalUnlocked}
          option1={createOption(s1.options[0], s1.title)}
          option2={s1.options[1] ? createOption(s1.options[1], s1.title) : undefined}
        />

        {/* 섹션 3 */}
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
