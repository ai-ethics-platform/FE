import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SelectCardToggle from '../components/SelectButton';
import Continue2 from '../components/Continue2';
import Continue from '../components/Continue';
import contentBoxFrame from '../assets/contentBox4.svg';

import { getDilemmaImages } from '../components/dilemmaImageLoader';
import axiosInstance from '../api/axiosInstance';
import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider';
import { useHostActions, useWebSocketMessage } from '../hooks/useWebSocketMessage';
import { FontStyles, Colors } from '../components/styleConstants';
import { clearAllLocalStorageKeys } from '../utils/storage';
import hostInfoSvg from '../assets/host_info3.svg';
import hostInfoEnSvg from '../assets/en/host_info3_en.svg'; 
import defaultImg from '../assets/images/default.png';
import HostInfoBadge from '../components/HostInfoBadge';

// 다국어 지원 임포트
import { translations } from '../utils/language';

const CARD_W = 936;
const CARD_H = 216;
const CIRCLE = 16;
const LINE = 3;

const resolveImageUrl = (raw) => {
  if (!raw || raw === '-' || String(raw).trim() === '') return null;
  const u = String(raw).trim();
  if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
  const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
  if (!base) return u;
  return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
};

export default function Game05_01() {
  const nav = useNavigate();
  
  const lang = localStorage.getItem('app_lang') || localStorage.getItem('language') || 'ko';
  const rawCategory = localStorage.getItem('category') || '안드로이드';
  const rawSubtopic = localStorage.getItem('subtopic') || '';
  const mateName = localStorage.getItem('mateName') || 'HomeMate'; 
  const savedCode = localStorage.getItem('code');
  const isCustomMode = !!(savedCode && savedCode !== 'null' && savedCode !== 'undefined');

  const headerSubtopic = isCustomMode ? (localStorage.getItem('creatorTitle') || rawSubtopic) : rawSubtopic;

  const currentLangData = translations[lang] || translations['ko'];
  const t = useMemo(() => {
    const root = currentLangData?.Game05_1 || {};
    return root.Game05_1 || root;
  }, [currentLangData]);

  const ui = useMemo(() => {
    const root = currentLangData?.UiElements || {};
    return root.UiElements || root;
  }, [currentLangData]);

  const tKo = useMemo(() => {
    const root = translations['ko']?.Game05_1 || {};
    return root.Game05_1 || root;
  }, []);

  const stableKey = useMemo(() => {
    if (isCustomMode) return 'custom';
    return rawSubtopic; 
  }, [isCustomMode, rawSubtopic]);

  const roleId = Number(localStorage.getItem('myrole_id') || 1);
  const roleName = isCustomMode 
    ? (localStorage.getItem(`char${roleId}`) || (lang === 'ko' ? '참여자' : 'Participant'))
    : (t?.roles?.[stableKey]?.[roleId - 1] || tKo?.roles?.[stableKey]?.[roleId - 1] || 'Participant');

  const questionData = t?.questions?.[stableKey] || tKo?.questions?.[stableKey] || {};
  const rawQuestion = isCustomMode 
    ? (localStorage.getItem('question') || '') 
    : (questionData.question || '');
  
  const questionText = rawQuestion.replace(/{{mateName}}|{mateName}/g, mateName);

  const agreeLabel = isCustomMode
    ? (localStorage.getItem('agree_label') || (lang === 'ko' ? '동의' : 'Agree'))
    : (questionData.labels?.agree || 'Agree');

  const disagreeLabel = isCustomMode
    ? (localStorage.getItem('disagree_label') || (lang === 'ko' ? '비동의' : 'Disagree'))
    : (questionData.labels?.disagree || 'Disagree');

  const [round] = useState(() => JSON.parse(localStorage.getItem('completedTopics') ?? '[]').length + 1);
  const { isHost: wsIsHost, sendNextPage } = useHostActions();
  
  const roomCode = localStorage.getItem('room_code') ?? '';
  const hostId = Number(localStorage.getItem('host_id'));
  const selectedCharacterIndex = Number(localStorage.getItem('selectedCharacterIndex') ?? 0);

  const isHost = wsIsHost || (roleId === hostId);

  const [step, setStep] = useState(1);
  const [conf, setConf] = useState(0);
  const pct = conf ? ((conf - 1) / 4) * 100 : 0;
  
  const [consensusChoice, setConsensusChoice] = useState(null);
  const [didSyncChoice, setDidSyncChoice] = useState(false);

  const [showHostBadge, setShowHostBadge] = useState(true);
  const [arrivalStatus, setArrivalStatus] = useState({ arrived_users: 0, total_required: 3, all_arrived: false });

  const stableCategory = (rawCategory.toLowerCase().includes('android') || rawCategory.includes('안드로이드')) ? '안드로이드' : '자율 무기 시스템';
  const neutralImgs = getDilemmaImages(stableCategory, rawSubtopic, 'neutral', selectedCharacterIndex);
  const agreeImgs = getDilemmaImages(stableCategory, rawSubtopic, localStorage.getItem('mode') || 'neutral', selectedCharacterIndex);
  const neutralLast = neutralImgs[neutralImgs.length - 1];
  const agreeLast = agreeImgs[agreeImgs.length - 1];

  const localAgreeImg = resolveImageUrl(localStorage.getItem('dilemma_image_4_1'));
  const localDisagreeImg = resolveImageUrl(localStorage.getItem('dilemma_image_4_2'));
  const selectedLocalImg = localStorage.getItem('mode') === 'agree' ? (localAgreeImg || defaultImg) : (localDisagreeImg || defaultImg);

  const pollingTimerRef = useRef(null);
  const statusPollingTimerRef = useRef(null);

  // 페이지 진입 신호 전송
  useEffect(() => {
    const nickname = localStorage.getItem('nickname');
    if (!roomCode || !round || !nickname) return;

    axiosInstance.post('/rooms/page-arrival', {
      room_code: roomCode,
      page_number: round,
      user_identifier: nickname,
    }).catch((e) => console.error('page-arrival 실패:', e));
  }, [roomCode, round]);

  // 참여자 도착 상태 폴링
  useEffect(() => {
    const pollArrival = async () => {
      if (!roomCode || !round) return;
      try {
        const res = await axiosInstance.get(`/rooms/page-sync-status/${roomCode}/${round}`);
        setArrivalStatus(res.data);
        if (!res.data.all_arrived) {
          pollingTimerRef.current = setTimeout(pollArrival, 3000);
        }
      } catch (e) { 
        pollingTimerRef.current = setTimeout(pollArrival, 3000); 
      }
    };
    pollArrival();
    return () => { if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current); };
  }, [roomCode, round]);

  // ✅ 동기화 핵심: Step 1 상태에서도 서버의 합의 완료 여부를 계속 체크 (Catch-up 로직)
  useEffect(() => {
    const pollStatus = async () => {
      try {
        const res = await axiosInstance.get(`/rooms/${roomCode}/rounds/${round}/status`);
        // 서버에서 합의가 이미 완료되었다면 참여자 화면을 Step 2로 점프시킴
        if (res.data.consensus_completed) {
          const choice = res.data.consensus_choice === 1 ? 'agree' : 'disagree';
          setConsensusChoice(choice);
          localStorage.setItem('consensus_choice', choice);
          localStorage.setItem('mode', choice);
          setDidSyncChoice(true);
          
          if (step === 1) setStep(2); // 동기화 핵심 부분
        } else {
          statusPollingTimerRef.current = setTimeout(pollStatus, 2000);
        }
      } catch {
        statusPollingTimerRef.current = setTimeout(pollStatus, 5000);
      }
    };

    if (!didSyncChoice) {
      pollStatus();
    }
    
    return () => { if (statusPollingTimerRef.current) clearTimeout(statusPollingTimerRef.current); };
  }, [roomCode, round, step, didSyncChoice]);

  // 소켓 메시지 수신 핸들러
  useWebSocketMessage('next_page', () => {
    const finalChoice = consensusChoice || localStorage.getItem('consensus_choice');
    if (step === 1) {
      setStep(2);
    } else {
      if (finalChoice) {
        localStorage.setItem('mode', finalChoice);
      }
      const nextRoute = finalChoice === 'agree' ? '/game06' : '/game07';
      nav(nextRoute, { state: { consensus: finalChoice } });
    }
  });

  // 방장 선택 검문소 함수 (경고 시스템)
  const handleConsensus = (choice) => {
    if (!isHost) {
      alert(t?.alerts?.host_only || tKo?.alerts?.host_only);
      return;
    }
    if (!arrivalStatus.all_arrived) {
      alert(t?.alerts?.wait_others || tKo?.alerts?.wait_others);
      return;
    }
    setConsensusChoice(choice);
  };

  const handleStep1Continue = async () => {
    // 1. 방장 권한 및 필수 선택값 체크
    if (!isHost) return; // 훅 내부에서 경고가 처리됨

    if (!consensusChoice) {
      alert(t?.alerts?.select_first || tKo?.alerts?.select_first);
      return;
    }

    if (!arrivalStatus.all_arrived) {
      alert(t?.alerts?.wait_others || tKo?.alerts?.wait_others);
      return;
    }
    
    // 2. 서버에 합의 결과 기록 (DB 업데이트 선행)
    try {
      await axiosInstance.post(`/rooms/rooms/round/${roomCode}/consensus`, {
        round_number: round,
        choice: consensusChoice === 'agree' ? 1 : 2,
        subtopic: rawSubtopic, 
      });

      localStorage.setItem('consensus_choice', consensusChoice);
      localStorage.setItem('mode', consensusChoice); 

      // 3. 기록 성공 후 소켓 신호 송신 (모두 이동 명령)
      sendNextPage(); 
    } catch (e) { 
      console.error(e); 
    }
  };

  const submitConfidence = async () => {
    if (conf === 0) {
      alert(t?.alerts?.select_confidence || tKo?.alerts?.select_confidence);
      return;
    }
    const finalChoice = consensusChoice || localStorage.getItem('consensus_choice');
    
    try {
      await axiosInstance.post(`/rooms/rooms/round/${roomCode}/consensus/confidence`, {
        round_number: round,
        confidence: conf,
        subtopic: rawSubtopic,
      });

      const prev = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
      localStorage.setItem('completedTopics', JSON.stringify([...new Set([...prev, rawSubtopic])]));

      const results = JSON.parse(localStorage.getItem('subtopicResults') || '{}');
      results[rawSubtopic] = finalChoice; 
      localStorage.setItem('subtopicResults', JSON.stringify(results));

      localStorage.setItem('mode', finalChoice);

      const nextRoute = finalChoice === 'agree' ? '/game06' : '/game07';
      nav(nextRoute, { state: { consensus: finalChoice } });
    } catch (err) { console.error(err); }
  };

  const handleBackClick = () => {
    const idx = window.history.state?.idx ?? 0;
    if (idx > 0) nav(-1);
    else nav('/game05');
  };

  const nextButtonLabel = ui.next || (lang === 'ko' ? "다음" : "Next");

  return (
    <Layout subtopic={headerSubtopic} round={round} onBackClick={handleBackClick}>
      {hostId === roleId && showHostBadge && typeof document !== 'undefined' && createPortal(
        <div style={{ position: 'fixed', top: '-100px', right: '1.5vw', zIndex: 9999 }}>
          <HostInfoBadge 
            src={lang === 'ko' ? hostInfoSvg : hostInfoEnSvg} 
            alt="Host Info" 
            preset="hostInfo" 
            width={300} 
            height={300} 
            onClose={() => setShowHostBadge(false)} 
          />
        </div>, document.body
      )}
   
      {step === 1 && (
        <>
          {isCustomMode && selectedLocalImg ? (
            <div style={{ marginTop: 0, display: 'flex', justifyContent: 'center' }}>
              <img
                src={selectedLocalImg}
                alt="합의 결과 미리보기"
                style={{ width: 400, height: 200, objectFit: 'cover', borderRadius: 8 }}
                onError={(e) => { e.currentTarget.src = defaultImg; }}
               />
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              {[neutralLast, agreeLast].map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`설명 이미지 ${idx + 1}`}
                  style={{ width: 400, height: 200, objectFit: 'fill' }}
                  onError={(e) => { e.currentTarget.src = defaultImg; }}
                />
              ))}
            </div>
          )}

          <Card width={936} height={216} extraTop={30}>
            <div style={{ textAlign: 'center' }}>
              <p style={title}>
                {(t?.you_are || tKo?.you_are || "당신은 {{roleName}}입니다.")?.replace('{{roleName}}', roleName)}
                <br />
                {questionText} <br/> {t?.consensus_msg || tKo?.consensus_msg || "합의를 통해 최종 결정하세요."}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <SelectCardToggle 
                label={agreeLabel} 
                selected={consensusChoice === 'agree'} 
                onClick={() => handleConsensus('agree')} 
                disabled={!isHost} 
                width={330} height={62} 
              />
              <SelectCardToggle 
                label={disagreeLabel} 
                selected={consensusChoice === 'disagree'} 
                onClick={() => handleConsensus('disagree')} 
                disabled={!isHost} 
                width={330} height={62} 
              />
            </div>
          </Card>
          <div style={{ marginTop: 40 }}>
            <Continue2 width={264} height={72} label={nextButtonLabel} onClick={handleStep1Continue} />
          </div>
        </>
      )}

      {step === 2 && (
  <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card width={936} height={216} extraTop={0}>
        {/* 💡 핵심: 텍스트와 슬라이더를 하나의 div로 묶어서 '한 덩어리'로 만듭니다. */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          width: '100%',
          paddingTop: '45px', // 1. 박스 상단에서 이 덩어리 전체가 얼마나 내려올지 결정 (수치 조절 가능)
          gap: '50px'         // 2. 텍스트와 슬라이더 바 사이의 간격 고정
        }}>
          <p style={title}>{t?.step2_title || tKo?.step2_title || "여러분의 선택에 당신은 얼마나 확신을 가지고 있나요?"}</p>
          
          <div style={{ position: 'relative', width: '80%', minWidth: 300 }}>
            <div style={{ position: 'absolute', top: 8, left: 0, right: 0, height: LINE, background: Colors.grey03, zIndex: 0 }} />
            <div style={{ position: 'absolute', top: 8, left: 0, width: `${pct}%`, height: LINE, background: Colors.brandPrimary, zIndex: 1 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} style={{ textAlign: 'center' }}>
                  <div
                    onClick={() => setConf(n)}
                    style={{ width: CIRCLE, height: CIRCLE, borderRadius: '50%', background: n <= conf ? Colors.brandPrimary : Colors.grey03, cursor: 'pointer', margin: '0 auto' }}
                  />
                  <span style={{ ...FontStyles.caption, color: Colors.grey06, marginTop: 4, display: 'inline-block' }}>{n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 💡 Card 컴포넌트의 두 번째 자식 슬롯을 비워둠으로써 슬라이더가 맨 아래로 튕겨나가는 것을 방지합니다. */}
        <div />
      </Card>
    </div>
    <div style={{ marginBottom: 8 }}>
      <Continue width={264} height={72} step={2} disabled={conf === 0} label={nextButtonLabel} onClick={submitConfidence} />
    </div>
  </div>
)}
    </Layout>
  );
}

function Card({ children, extraTop = 0, width = CARD_W, height = CARD_H }) {
  const childrenArray = React.Children.toArray(children);
  const textContent = childrenArray[0];
  const buttonContent = childrenArray[1];

  return (
    <div style={{ width, height, marginTop: extraTop, position: 'relative' }}>
      <img src={contentBoxFrame} alt="" style={{ width: '100%', height: '100%', objectFit: 'fill' }} />
      <div style={{ 
        position: 'absolute', 
        top: 0, left: 0, right: 0,
        padding: '15px 24px 0 24px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        zIndex: 1
       }}>
        {textContent}
      </div>
      {buttonContent && (
        <div style={{ 
          position: 'absolute', 
          bottom: '25px', 
          left: 0, right: 0,
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          zIndex: 2
        }}>
          {buttonContent}
        </div>
      )}
    </div>
  );
}

const title = { 
  ...FontStyles.title, 
  color: Colors.grey06, 
  textAlign: 'center',
  whiteSpace: 'pre-wrap', 
  wordBreak: 'keep-all',
  margin: 0,
  lineHeight: '1.25' 
};
// // // 팝업 보여주는 코드 
// // // 시간 조정하기 
// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Layout from '../components/Layout';
// import SelectCardToggle from '../components/SelectButton';
// import Continue2 from '../components/Continue2';
// import Continue from '../components/Continue';
// import contentBoxFrame from '../assets/contentBox4.svg';

// import { getDilemmaImages } from '../components/dilemmaImageLoader';
// import axiosInstance from '../api/axiosInstance';
// import { useWebSocket } from '../WebSocketProvider';
// import { useWebRTC } from '../WebRTCProvider';
// import { useHostActions, useWebSocketMessage } from '../hooks/useWebSocketMessage';
// import { FontStyles, Colors } from '../components/styleConstants';
// import { clearAllLocalStorageKeys } from '../utils/storage';
// import hostInfoSvg from '../assets/host_info.svg';
// import defaultImg from '../assets/images/default.png';
// import ExtraPopup from '../components/ExtraPopup1';

// const CARD_W = 640;
// const CARD_H = 170;
// const CIRCLE = 16;
// const BORDER = 2;
// const LINE = 3;

// // 절대/상대 URL 보정
// const resolveImageUrl = (raw) => {
//   if (!raw || raw === '-' || String(raw).trim() === '') return null;
//   const u = String(raw).trim();
//   if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
//   const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
//   if (!base) return u;
//   return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
// };

// export default function Game05_01() {
//   const nav = useNavigate();
//   const pollingRef = useRef(null);

  
//   // 라운드
//   const [round, setRound] = useState(() => {
//     const c = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
//     return c.length + 1;
//   });
//   useEffect(() => {
//     localStorage.setItem('currentRound', String(round));
//   }, [round]);

//   const { isConnected, reconnectAttempts, maxReconnectAttempts,finalizeDisconnection } = useWebSocket();
//   const { isInitialized: webrtcInitialized } = useWebRTC();
//   const { isHost, sendNextPage } = useHostActions();
//   const [openProfile, setOpenProfile] = useState(null);
//   const getUnanimousRecord = (round) => {
//     try {
//       const history = JSON.parse(localStorage.getItem('unanimousHistory') || '[]');
//       if (!Array.isArray(history)) return null;
//       return history.find(h => Number(h.round) === Number(round)) || null;
//     } catch {
//       return null;
//     }
//   };
  
//   const getUnanimousCounters = () => {
//     try {
//       return JSON.parse(
//         localStorage.getItem('unanimousCounters') || '{"unanimousCount":0,"nonUnanimousCount":0}'
//       );
//     } catch {
//       return { unanimousCount: 0, nonUnanimousCount: 0 };
//     }
//   };
//   const [extraStep, setExtraStep] = useState(null);  // 1,2,4 또는 null
//   const [showExtra, setShowExtra] = useState(false); //  팝업 열림/닫힘
 
//   // useEffect(() => {
//   //   const rec = getUnanimousRecord(round);
//   //   if (!rec) { setExtraStep(null); setShowExtra(false); return; }
  
//   //   if (rec.isUnanimous) {
//   //     if (rec.nthUnanimous === 1||rec.nthUnanimous === 3) {
//   //       // step1: 3분 후 팝업
//   //       setExtraStep(1);
//   //       setShowExtra(false);
//   //       const t = setTimeout(() => setShowExtra(true), 3*60*1000);
//   //       return () => clearTimeout(t);
//   //     }
//   //     if (rec.nthUnanimous === 2) {
//   //       // step2: 팝업은 "다음 버튼"에서 열리도록, 여기서는 세팅만
//   //       setExtraStep(2);
//   //       setShowExtra(false);
//   //     }
//   //   } else {
//   //     if (rec.nthNonUnanimous === 1) {
//   //       // step4: 2분 후 팝업
//   //       setExtraStep(4);
//   //       setShowExtra(false);
//   //       const t = setTimeout(() => setShowExtra(true), 2*60*1000);
//   //       return () => clearTimeout(t);
//   //     }
//   //   }
//   // }, [round]);
//   useEffect(() => {
//     const rec = getUnanimousRecord(round);
//     if (!rec) { setExtraStep(null); setShowExtra(false); return; }
  
//     if (rec.isUnanimous) {
//       if (rec.nthUnanimous === 1 || rec.nthUnanimous === 3) {
//         setExtraStep(1);
//         setShowExtra(false);
//       }
//       if (rec.nthUnanimous === 2) {
//         setExtraStep(2);
//         setShowExtra(false);
//       }
//     } else {
//       if (rec.nthNonUnanimous === 1) {
//         setExtraStep(4);
//         setShowExtra(false);
//       }
//     }
//   }, [round]);

//   // 연결 상태(로그용)
//   const [connectionStatus, setConnectionStatus] = useState({
//     websocket: true,
//     webrtc: true,
//     ready: true,
//   });
//   useEffect(() => {
//     const newStatus = {
//       websocket: isConnected,
//       webrtc: webrtcInitialized,
//       ready: isConnected && webrtcInitialized,
//     };
//     setConnectionStatus(newStatus);
//     console.log('[game05_1] 연결 상태 업데이트:', newStatus);
//   }, [isConnected, webrtcInitialized]);
 
//     useEffect(() => {
//           let cancelled = false;
//           const isReloadingGraceLocal = () => {
//             const flag = sessionStorage.getItem('reloading') === 'true';
//             const expire = parseInt(sessionStorage.getItem('reloading_expire_at') || '0', 10);
//             if (!flag) return false;
//             if (Date.now() > expire) {
//               sessionStorage.removeItem('reloading');
//               sessionStorage.removeItem('reloading_expire_at');
//               return false;
//             }
//             return true;
//           };
        
//           if (!isConnected) {
//             // 1) reloading-grace가 켜져 있으면 finalize 억제
//             if (isReloadingGraceLocal()) {
//               console.log('♻️ reloading grace active — finalize 억제');
//               return;
//             }
        
//             // 2) debounce: 잠깐 기다렸다가 여전히 끊겨있으면 finalize
//             const DEBOUNCE_MS = 1200;
//             const timer = setTimeout(() => {
//               if (cancelled) return;
//               if (!isConnected && !isReloadingGraceLocal()) {
//                 console.warn('🔌 WebSocket 연결 끊김 → 초기화 (확정)');
//                 finalizeDisconnection('❌ 연결이 끊겨 게임이 초기화됩니다.');
//               } else {
//                 console.log('🔁 재연결/리로드 감지 — finalize 스킵');
//               }
//             }, DEBOUNCE_MS);
        
//             return () => {
//               cancelled = true;
//               clearTimeout(timer);
//             };
//           }
//         }, [isConnected, finalizeDisconnection]);
//   // // 도착 상태
//   const [arrivalStatus, setArrivalStatus] = useState({
//     arrived_users: 0,
//     total_required: 3,
//     all_arrived: false,
//   });

//   // 로컬 저장값
//   const roleId        = Number(localStorage.getItem('myrole_id'));
//   const roomCode      = localStorage.getItem('room_code') ?? '';
//   const mainTopic     = localStorage.getItem('category');
//   const subtopic      = localStorage.getItem('subtopic');
//   const selectedIndex = Number(localStorage.getItem('selectedCharacterIndex') ?? 0);
//   const category      = localStorage.getItem('category') ?? '안드로이드';
//   const mode          = localStorage.getItem('mode');
//   const isAWS         = category === '자율 무기 시스템';
//   const hostId = Number(localStorage.getItem('host_id'));

//   //  커스텀 모드 판별 + 헤더용 제목 치환
//   const isCustomMode  = !!localStorage.getItem('code');
//   const creatorTitle  = localStorage.getItem('creatorTitle') || '';
//   const headerSubtopic = isCustomMode ? (creatorTitle || subtopic) : subtopic;
//   // -------- 안드로이드 역할명 --------
//   const getRoleNameBySubtopicAndroid = (subtopic, roleId) => {
//     switch (subtopic) {
//       case 'AI의 개인 정보 수집':
//       case '안드로이드의 감정 표현':
//         return roleId === 1 ? '요양보호사 K' : roleId === 2 ? '노모 L' : '자녀 J';
//       case '아이들을 위한 서비스':
//       case '설명 가능한 AI':
//         return roleId === 1 ? '로봇 제조사 연합회 대표'
//              : roleId === 2 ? '소비자 대표'
//              : '국가 인공지능 위원회 대표';
//       case '지구, 인간, AI':
//         return roleId === 1 ? '기업 연합체 대표'
//              : roleId === 2 ? '국제 환경단체 대표'
//              : '소비자 대표';
//       default:
//         return '';
//     }
//   };

//   // -------- AWS 역할명 --------
//   const getRoleNameBySubtopicAWS = (subtopic, roleId) => {
//     const idx = Math.max(0, Math.min(2, (roleId ?? 1) - 1)); // 1→0, 2→1, 3→2
//     const map = {
//       'AI 알고리즘 공개':     ['지역 주민', '병사 J', '군사 AI 윤리 전문가'],
//       'AWS의 권한':         ['신입 병사', '베테랑 병사 A', '군 지휘관'],
//       '사람이 죽지 않는 전쟁': ['개발자', '국방부 장관', '국가 인공지능 위원회 대표'],
//       'AI의 권리와 책임':   ['개발자', '국방부 장관', '국가 인공지능 위원회 대표'],
//       'AWS 규제':          ['국방 기술 고문', '국제기구 외교 대표', '글로벌 NGO 활동가'],
//     };
//     const arr = map[subtopic];
//     return Array.isArray(arr) ? arr[idx] : '';
//   };

  
//   // 질문/라벨(기존 맵)
//   const subtopicMapAndroid = {
//     'AI의 개인 정보 수집': { question: '24시간 개인정보 수집 업데이트에 동의하시겠습니까?', labels: { agree: '동의', disagree: '비동의' } },
//     '안드로이드의 감정 표현': { question: '감정 엔진 업데이트에 동의하시겠습니까?', labels: { agree: '동의', disagree: '비동의' } },
//     '아이들을 위한 서비스': { question: '가정용 로봇 사용에 대한 연령 규제가 필요할까요?', labels: { agree: '규제 필요', disagree: '규제 불필요' } },
//     '설명 가능한 AI': { question: "'설명 가능한 AI' 개발을 기업에 의무화해야 할까요?", labels: { agree: '의무화 필요', disagree: '의무화 불필요' } },
//     '지구, 인간, AI': { question: '세계적으로 가정용 로봇의 업그레이드 혹은 사용에 제한이 필요할까요?', labels: { agree: '제한 필요', disagree: '제한 불필요' } },
//   };
//   const subtopicMapAWS = {
//     'AI 알고리즘 공개': { question: 'AWS의 판단 로그 및 알고리즘 구조 공개 요구에 동의하시겠습니까?', labels: { agree: '동의', disagree: '비동의' } },
//     'AWS의 권한': { question: 'AWS의 권한을 강화해야 할까요? 제한해야 할까요?', labels: { agree: '강화', disagree: '제한' } },
//     '사람이 죽지 않는 전쟁': { question: '사람이 죽지 않는 전쟁을 평화라고 할 수 있을까요?', labels: { agree: '그렇다', disagree: '아니다' } },
//     'AI의 권리와 책임': { question: 'AWS에게, 인간처럼 권리를 부여할 수 있을까요?', labels: { agree: '그렇다', disagree: '아니다' } },
//     'AWS 규제': { question: 'AWS는 국제 사회에서 계속 유지되어야 할까요, 아니면 글로벌 규제를 통해 제한되어야 할까요?', labels: { agree: '유지', disagree: '제한' } },
//   };
//     // 기본(비커스텀) 역할명/질문/라벨
//     const defaultRoleName = isAWS
//     ? getRoleNameBySubtopicAWS(subtopic, roleId)
//     : getRoleNameBySubtopicAndroid(subtopic, roleId);
//   const subtopicMap = isAWS ? subtopicMapAWS : subtopicMapAndroid;

//   //  커스텀 모드 값들 (질문/라벨/역할명/이미지)
//   const char1 = (localStorage.getItem('char1') || '').trim();
//   const char2 = (localStorage.getItem('char2') || '').trim();
//   const char3 = (localStorage.getItem('char3') || '').trim();
//   const customRoleName = roleId === 1 ? char1 : roleId === 2 ? char2 : char3;

//   //  커스텀 질문/라벨 가져오기
//   const customQuestion = (localStorage.getItem('question') || '').trim();
//   const customAgree    = (localStorage.getItem('agree_label') || '').trim();
//   const customDisagree = (localStorage.getItem('disagree_label') || '').trim();
//   const roleName = isCustomMode ? (customRoleName || defaultRoleName) : defaultRoleName;

//   //  실제 표시할 질문/라벨 확정
//   const questionText = isCustomMode
//     ? (customQuestion || '')
//     : (subtopicMap[subtopic]?.question || '');

//   const agreeLabel = isCustomMode
//     ? (customAgree || '동의')
//     : (subtopicMap[subtopic]?.labels?.agree || '동의');

//   const disagreeLabel = isCustomMode
//     ? (customDisagree || '비동의')
//     : (subtopicMap[subtopic]?.labels?.disagree || '비동의');

//   // 기존(템플릿) 이미지들
//   const neutralImgs = getDilemmaImages(mainTopic, subtopic, 'neutral', selectedIndex);
//   const initialMode = localStorage.getItem('mode');
//   const agreeImgs   = getDilemmaImages(mainTopic, subtopic, initialMode, selectedIndex);
//   const neutralLast = neutralImgs[neutralImgs.length - 1];
//   const agreeLast   = agreeImgs[agreeImgs.length - 1];

//   const rawAgreeImg = localStorage.getItem('dilemma_image_4_1') || '';
//   const rawDisagreeImg = localStorage.getItem('dilemma_image_4_2') || '';
//   const localAgreeImg = resolveImageUrl(rawAgreeImg);
//   const localDisagreeImg = resolveImageUrl(rawDisagreeImg);
  
//   const selectedLocalImg =
//     mode === 'agree'
//       ? (localAgreeImg || defaultImg)
//       : mode === 'disagree'
//       ? (localDisagreeImg || defaultImg)
//       : defaultImg;

//   // 단계/확신/합의
//   const [step, setStep] = useState(1);
//   const [conf, setConf] = useState(0);
//   const pct = conf ? ((conf - 1) / 4) * 100 : 0;
//   const [consensusChoice, setConsensusChoice] = useState(null);

//   const [statusData, setStatusData] = useState(null);
//   const [didSyncChoice, setDidSyncChoice] = useState(false);

//   // 합의 상태 폴링(step2에서)
//   useEffect(() => {
//     if (step !== 2) return;
//     let timer;
//     const poll = async () => {
//       try {
//         const res = await axiosInstance.get(`/rooms/${roomCode}/rounds/${round}/status`);
//         setStatusData(res.data);
//         if (res.data.consensus_completed && !didSyncChoice) {
//           const choice = res.data.consensus_choice === 1 ? 'agree' : 'disagree';
//           setConsensusChoice(choice);
//           setDidSyncChoice(true);
//         }
//         if (!res.data.consensus_completed) {
//           timer = setTimeout(poll, 2000);
//         }
//       } catch {
//         timer = setTimeout(poll, 5000);
//       }
//     };
//     poll();
//     return () => clearTimeout(timer);
//   }, [roomCode, round, step, didSyncChoice]);

//   // 페이지 도착 기록
//   useEffect(() => {
//     const nickname = localStorage.getItem('nickname');
//     axiosInstance.post('/rooms/page-arrival', {
//       room_code: roomCode,
//       page_number: round,
//       user_identifier: nickname,
//     }).catch((e) => console.error('page-arrival 실패:', e));
//   }, [roomCode, round]);

//   // 사용자 도착 폴링
//   useEffect(() => {
//     let timer;
//     const poll = async () => {
//       try {
//         const res = await axiosInstance.get(`/rooms/page-sync-status/${roomCode}/${round}`);
//         setArrivalStatus(res.data);
//         if (!res.data.all_arrived) {
//           timer = setTimeout(poll, 3000);
//         }
//       } catch (e) {
//         console.warn('page-sync-status 오류, 재시도:', e);
//         timer = setTimeout(poll, 2000);
//       }
//     };
//     poll();
//     return () => clearTimeout(timer);
//   }, [roomCode, round]);

//   // host가 합의 선택
//   const handleConsensus = (choice) => {
//     if (!isHost) return alert('⚠️ 방장만 선택할 수 있습니다.');
//     if (!arrivalStatus.all_arrived) return alert('유저의 입장을 기다리는 중입니다.');
//     setConsensusChoice(choice);
//   };
//   useEffect(() => {
//     setConsensusChoice(null);
//   }, []);

//   // next_page 브로드캐스트 수신
//   // useWebSocketMessage('next_page', () => {
//   //   console.log(' next_page 수신됨');
//   //   // if (step === 1) setStep(2);
//   //   if (step === 1) {
//   //     if (extraStep === 2) {

//   //       if (!isHost) {
//   //         // 게스트만 팝업 + 1분 잠금
//   //         setShowExtra(true);
//   //         setNextDisabled(true);
//   //         setTimeout(() => {
//   //           setShowExtra(false);
//   //           setNextDisabled(false);
//   //           setStep(2);   // 팝업 닫힌 후 Step2로 이동
//   //         }, 60 * 1000); 
//   //       } else {
//   //         // 호스트는 이미 handleStep1Continue에서 처리했으니 그냥 Step2로 이동
//   //         setStep(2);
//   //       }
//   //     } else {
//   //       // 그냥 바로 Step2 이동
//   //       setStep(2);
//   //     }
//   //   } 
//   //   else if (step === 2) {
//   //     const nextRoute = consensusChoice === 'agree' ? '/game06' : '/game07';
//   //     nav(nextRoute, { state: { consensus: consensusChoice } });
//   //   }
//   // });
//   // 🔹 next_page 수신 로직 통일
// useWebSocketMessage('next_page', () => {
//   console.log(' next_page 수신됨');
//   if (step === 1) {
//     if ([1,2,4].includes(extraStep)) {
//       if (!isHost) {
//         setShowExtra(true);
//         setNextDisabled(true);
//         setTimeout(() => {
//           setShowExtra(false);
//           setNextDisabled(false);
//           setStep(2);
//         }, 50 * 1000);
//       } 
//     } else {
//       setStep(2);
//     }
//   } 
//   else if (step === 2) {
//     const nextRoute = consensusChoice === 'agree' ? '/game06' : '/game07';
//     nav(nextRoute, { state: { consensus: consensusChoice } });
//   }
// });
//   const [nextDisabled, setNextDisabled] = useState(false);


//   // Step1 → Step2
//   const handleStep1Continue = async () => {
//     if (!isHost) return alert('⚠️ 방장만 진행할 수 있습니다.');
//     if (!consensusChoice) return alert('⚠️ 동의/비동의 먼저 선택해주세요.');
  
//     try {
//       const choice = consensusChoice === 'agree' ? 1 : 2;
//       await axiosInstance.post(`/rooms/rooms/round/${roomCode}/consensus`, {
//         round_number: round,
//         choice,
//         subtopic,
//       });
  
//       if ([1,2,4].includes(extraStep)) {
//         sendNextPage(); // Step2(확신도 페이지)로 이동
//         setShowExtra(true);
//         setNextDisabled(true);
//         setTimeout(() => {
//           setNextDisabled(false);
//           setStep(2);   // 👉 여기서 Step2로 전환
//         }, 50*1000);
//       } else {
//         // 다른 경우는 그냥 바로 넘어감
//         sendNextPage();
//       }
  
//     } catch (e) {
//       console.error('합의 POST 실패:', e);
//     }
//   };

//   // Step2 확신도 제출
//   const submitConfidence = async () => {
//     if (conf === 0) return alert('확신도를 선택해주세요.');
//     try {
//       await axiosInstance.post(`/rooms/rooms/round/${roomCode}/consensus/confidence`, {
//         round_number: round,
//         confidence: conf,
//         subtopic, // 서버로는 기존 subtopic 유지
//       });
//       const prev = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
//       const updated = [...new Set([...prev, subtopic])];
//       localStorage.setItem('completedTopics', JSON.stringify(updated));
//       const results = JSON.parse(localStorage.getItem('subtopicResults') || '{}');
//       results[subtopic] = consensusChoice;
//       localStorage.setItem('subtopicResults', JSON.stringify(results));
//       const nextRoute = consensusChoice === 'agree' ? '/game06' : '/game07';
//       nav(nextRoute, { state: { consensus: consensusChoice } });
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleBackClick = () => nav('/game05');
//   const canClickStep1Next = Boolean(consensusChoice) && arrivalStatus.all_arrived && isHost;

//   return (
//     <>
//     <Layout subtopic={headerSubtopic} round={round} onProfileClick={setOpenProfile} onBackClick={handleBackClick} hostmessage={true}  popupStep={extraStep}>
//       {step === 1 && (
//         <>
//           {/*  커스텀 모드 && 로컬 지정 이미지가 있을 때는 해당 1장만 표시 */}
//           {isCustomMode && selectedLocalImg ? (
//             <div style={{ marginTop: 0, display: 'flex', justifyContent: 'center' }}>
//               <img
//                 src={selectedLocalImg}
//                 alt="합의 결과 미리보기"
//                 style={{ width: 400, height: 200, objectFit: 'cover', borderRadius: 8 }}
//                 onError={(e) => { e.currentTarget.src = defaultImg; }}

//                />
//             </div>
//           ) : (
//             // 기존 두 장 미리보기(네추럴, 합의쪽)
//             <div style={{ marginTop: 0, display: 'flex', justifyContent: 'center', gap: 16 }}>
//               {[neutralLast, agreeLast].map((img, idx) => (
//                 <img
//                   key={idx}
//                   src={img}
//                   alt={`설명 이미지 ${idx + 1}`}
//                   style={{ width: 400, height: 200, objectFit: 'fill' }}
//                   onError={(e) => { e.currentTarget.src = defaultImg; }}

//                 />
//               ))}
//             </div>
//           )}
//           <Card width={936} height={216} extraTop={30}>
//             <p style={title}>
//             당신은 {roleName}입니다.
//             <br />
//             {questionText || ''} <br/> 합의를 통해 최종 결정하세요.
//             </p>
//             <div style={{ display: 'flex', gap: 24 }}>
//               <SelectCardToggle
//                 label={agreeLabel}
//                 selected={consensusChoice === 'agree'}
//                 onClick={() => isHost && handleConsensus('agree')}
//                 disabled={!isHost || !arrivalStatus.all_arrived}
//                 width={330}
//                 height={62}
//               />
//               <SelectCardToggle
//                 label={disagreeLabel}
//                 selected={consensusChoice === 'disagree'}
//                 onClick={() => isHost && handleConsensus('disagree')}
//                 disabled={!isHost || !arrivalStatus.all_arrived}
//                 width={330}
//                 height={62}
//               />
//             </div>
//           </Card>

//           <div style={{ marginTop: 40 }}>
//             <Continue2 width={264} height={72} disabled={!canClickStep1Next||nextDisabled} onClick={handleStep1Continue} />
//           </div>
//         </>
//       )}

//       {step === 2 && (
//         <>
//           <Card width={936} height={216} extraTop={150}>
//             <p style={title}> 여러분의 선택에 당신은 얼마나 확신을 가지고 있나요?</p>
//             <div style={{ position: 'relative', width: '80%', minWidth: 300 }}>
//               <div style={{ position: 'absolute', top: 8, left: 0, right: 0, height: LINE, background: Colors.grey03, zIndex: 0 }} />
//               <div style={{ position: 'absolute', top: 8, left: 0, width: `${pct}%`, height: LINE, background: Colors.brandPrimary, zIndex: 1 }} />
//               <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
//                 {[1, 2, 3, 4, 5].map((n) => {
//                   const isFilled = n <= conf;
//                   return (
//                     <div key={n} style={{ textAlign: 'center' }}>
//                       <div
//                         onClick={() => setConf(n)}
//                         style={{
//                           width: CIRCLE,
//                           height: CIRCLE,
//                           borderRadius: '50%',
//                           background: isFilled ? Colors.brandPrimary : Colors.grey03,
//                           cursor: 'pointer',
//                           margin: '0 auto',
//                         }}
//                       />
//                       <span style={{ ...FontStyles.caption, color: Colors.grey06, marginTop: 4, display: 'inline-block' }}>
//                         {n}
//                       </span>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </Card>

//           <div style={{ marginTop: 80, textAlign: 'center' }}>
//             <Continue width={264} height={72} disabled={conf === 0} onClick={submitConfidence} />
//           </div>
//         </>
//       )}
       
//     </Layout>
//     {extraStep && showExtra && (
//       <ExtraPopup
//         open={showExtra}
//         onClose={() => setShowExtra(false)}
//         mode={extraStep}
//         popupStep={extraStep}
//         round={round}
//       />
//     )}
//     </>
//   );
 
// }


// function Card({ children, extraTop = 0, width = CARD_W, height = CARD_H, style = {} }) {
//   return (
//     <div style={{ width, height, marginTop: extraTop, position: 'relative', ...style }}>
//       <img src={contentBoxFrame} alt="" style={{ width: '100%', height: '100%', objectFit: 'fill' }} />
//       <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 24, padding: '0 24px' }}>
//         {children}
//       </div>
//     </div>
//   );
// }

// const title = { ...FontStyles.title, color: Colors.grey06, textAlign: 'center' };
