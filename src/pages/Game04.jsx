import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Layout      from '../components/Layout';
import Continue    from '../components/Continue';
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

const completed = JSON.parse(localStorage.getItem('completedTopics') || '[]');
const initialRound = completed.length + 1;

export default function Game04() {
  const { state } = useLocation();
  const navigate   = useNavigate();

  const { isConnected, reconnectAttempts, maxReconnectAttempts,finalizeDisconnection } = useWebSocket();
  const { isInitialized: webrtcInitialized } = useWebRTC();
  const { isHost, sendNextPage } = useHostActions();
  useWebSocketNavigation(navigate, { nextPagePath: '/game05', infoPath: '/game05' });

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
  //   if (!isConnected && reconnectAttempts >= maxReconnectAttempts) {
  //     console.warn('🚫 WebSocket 재연결 실패 → 게임 초기화');
  //     alert('⚠️ 연결을 복구하지 못했습니다. 게임이 초기화됩니다.');
  //     clearAllLocalStorageKeys();
  //     navigate('/');
  //   }
  // }, [isConnected, reconnectAttempts, maxReconnectAttempts]);
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
      
        if (!isConnected) {
          // 1) reloading-grace가 켜져 있으면 finalize 억제
          if (isReloadingGraceLocal()) {
            console.log('♻️ reloading grace active — finalize 억제');
            return;
          }
      
          // 2) debounce: 잠깐 기다렸다가 여전히 끊겨있으면 finalize
          const DEBOUNCE_MS = 1200;
          const timer = setTimeout(() => {
            if (cancelled) return;
            if (!isConnected && !isReloadingGraceLocal()) {
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
      }, [isConnected, finalizeDisconnection]);
  

  const myVote   = state?.agreement ?? null;

  // 기본 로컬 값들
  const rawSubtopic = localStorage.getItem('subtopic') ?? 'AI의 개인 정보 수집';
  const roomCode    = localStorage.getItem('room_code') ?? '';
  const category    = localStorage.getItem('category') || '안드로이드';
  const isAWS       = category === '자율 무기 시스템';

  // ✅ 커스텀 모드 판별 및 커스텀 값 로드
  const isCustomMode      = !!localStorage.getItem('code');
  const creatorTitle      = localStorage.getItem('creatorTitle') || '';
  const customAgreeLabel  = localStorage.getItem('agree_label') || '동의';
  const customDisagreeLbl = localStorage.getItem('disagree_label') || '비동의';

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

      //  만장일치 여부 저장
      const total = agreeList.length + disagreeList.length;
      const isUnanimous =
        total === 3 && (agreeList.length === 0 || disagreeList.length === 0);

      localStorage.setItem('unanimous', JSON.stringify(isUnanimous));
      console.log('[Game04] 만장일치 여부:', isUnanimous);
 

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
    navigate('/game03');
  };

  // 기본 라벨 맵
  const subtopicMapAndroid = {
    'AI의 개인 정보 수집': {
      question: '24시간 개인정보 수집 업데이트에 동의하시겠습니까?',
      labels: { agree: '동의', disagree: '비동의' },
    },
    '안드로이드의 감정 표현': {
      question: '감정 엔진 업데이트에 동의하시겠습니까?',
      labels: { agree: '동의', disagree: '비동의' },
    },
    '아이들을 위한 서비스': {
      question: '가정용 로봇 사용에 대한 연령 규제가 필요할까요?',
      labels: { agree: '규제 필요', disagree: '규제 불필요' },
    },
    '설명 가능한 AI': {
      question: "'설명 가능한 AI' 개발을 기업에 의무화해야 할까요?",
      labels: { agree: '의무화 필요', disagree: '의무화 불필요' },
    },
    '지구, 인간, AI': {
      question: '세계적으로 가정용 로봇의 업그레이드 혹은 사용에 제한이 필요할까요?',
      labels: { agree: '제한 필요', disagree: '제한 불필요' },
    },
  };

  const subtopicMapAWS = {
    'AI 알고리즘 공개': {
      question: 'AWS의 판단 로그 및 알고리즘 구조 공개 요구에 동의하시겠습니까?',
      labels: { agree: '동의', disagree: '비동의' },
    },
    'AWS의 권한': {
      question: 'AWS의 권한을 강화해야 할까요? 제한해야 할까요?',
      labels: { agree: '강화', disagree: '제한' },
    },
    '사람이 죽지 않는 전쟁': {
      question: '사람이 죽지 않는 전쟁을 평화라고 할 수 있을까요?',
      labels: { agree: '그렇다', disagree: '아니다' },
    },
    'AI의 권리와 책임': {
      question: 'AWS에게, 인간처럼 권리를 부여할 수 있을까요?',
      labels: { agree: '그렇다', disagree: '아니다' },
    },
    'AWS 규제': {
      question:
        'AWS는 국제 사회에서 계속 유지되어야 할까요, 아니면 글로벌 규제를 통해 제한되어야 할까요?',
      labels: { agree: '유지', disagree: '제한' },
    },
  };

  // 최종 사용 라벨
  const subtopicMap = isAWS ? subtopicMapAWS : subtopicMapAndroid;

  //  커스텀/기본 라벨 선택
  const labels = isCustomMode
    ? { agree: customAgreeLabel, disagree: customDisagreeLbl }
    : (subtopicMap[rawSubtopic]?.labels ?? { agree: '동의', disagree: '비동의' });

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
              }}
            >
              <img src={icon} style={{ width: 160, height: 160, marginTop: 40, marginBottom: -10 }} />
              <p style={{ ...FontStyles.headlineSmall, color: Colors.brandPrimary }}>
                {labels[key] ?? (key === 'agree' ? '동의' : '비동의')}
              </p>
              <p style={{ ...FontStyles.headlineLarge, color: Colors.grey06, margin: '16px 0' }}>
                {list.length}명
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 10 }}>
        <p style={{ ...FontStyles.headlineSmall, color: Colors.grey05 }}>
          {secsLeft <= 0 ? '마무리하고 다음으로 넘어가 주세요' : '선택의 이유를 자유롭게 공유해주세요'}
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
