import React, { useState, useEffect, useRef } from 'react';
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
import hostInfoSvg from '../assets/host_info2.svg';
import defaultImg from '../assets/images/default.png';
import HostInfoBadge from '../components/HostInfoBadge';

const CARD_W = 640;
const CARD_H = 170;
const CIRCLE = 16;
const BORDER = 2;
const LINE = 3;

// 절대/상대 URL 보정
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
  const pollingRef = useRef(null);

  // 라운드
  const [round, setRound] = useState(() => {
    const c = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    return c.length + 1;
  });
  useEffect(() => {
    localStorage.setItem('currentRound', String(round));
  }, [round]);

  const { isConnected, reconnectAttempts, maxReconnectAttempts,finalizeDisconnection } = useWebSocket();
  const { isInitialized: webrtcInitialized } = useWebRTC();
  const { isHost, sendNextPage } = useHostActions();
  const [openProfile, setOpenProfile] = useState(null);

  // 연결 상태(로그용)
  const [connectionStatus, setConnectionStatus] = useState({
    websocket: true,
    webrtc: true,
    ready: true,
  });
  useEffect(() => {
    const newStatus = {
      websocket: isConnected,
      webrtc: webrtcInitialized,
      ready: isConnected && webrtcInitialized,
    };
    setConnectionStatus(newStatus);
    console.log('[game05_1] 연결 상태 업데이트:', newStatus);
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
  // // 도착 상태
  const [arrivalStatus, setArrivalStatus] = useState({
    arrived_users: 0,
    total_required: 3,
    all_arrived: false,
  });

  // 로컬 저장값
  const roleId        = Number(localStorage.getItem('myrole_id'));
  const roomCode      = localStorage.getItem('room_code') ?? '';
  const mainTopic     = localStorage.getItem('category');
  const subtopic      = localStorage.getItem('subtopic');
  const selectedIndex = Number(localStorage.getItem('selectedCharacterIndex') ?? 0);
  const category      = localStorage.getItem('category') ?? '안드로이드';
  const mode          = localStorage.getItem('mode');
  const isAWS         = category === '자율 무기 시스템';
  const hostId = Number(localStorage.getItem('host_id'));

  //  커스텀 모드 판별 + 헤더용 제목 치환
  const isCustomMode  = !!localStorage.getItem('code');
  const creatorTitle  = localStorage.getItem('creatorTitle') || '';
  const headerSubtopic = isCustomMode ? (creatorTitle || subtopic) : subtopic;

  // 질문/라벨(기존 맵)
  const subtopicMapAndroid = {
    'AI의 개인 정보 수집': { question: '24시간 개인정보 수집 업데이트에 동의하시겠습니까?', labels: { agree: '동의', disagree: '비동의' } },
    '안드로이드의 감정 표현': { question: '감정 엔진 업데이트에 동의하시겠습니까?', labels: { agree: '동의', disagree: '비동의' } },
    '아이들을 위한 서비스': { question: '가정용 로봇 사용에 대한 연령 규제가 필요할까요?', labels: { agree: '규제 필요', disagree: '규제 불필요' } },
    '설명 가능한 AI': { question: "'설명 가능한 AI' 개발을 기업에 의무화해야 할까요?", labels: { agree: '의무화 필요', disagree: '의무화 불필요' } },
    '지구, 인간, AI': { question: '세계적으로 가정용 로봇의 업그레이드 혹은 사용에 제한이 필요할까요?', labels: { agree: '제한 필요', disagree: '제한 불필요' } },
  };
  const subtopicMapAWS = {
    'AI 알고리즘 공개': { question: 'AWS의 판단 로그 및 알고리즘 구조 공개 요구에 동의하시겠습니까?', labels: { agree: '동의', disagree: '비동의' } },
    'AWS의 권한': { question: 'AWS의 권한을 강화해야 할까요? 제한해야 할까요?', labels: { agree: '강화', disagree: '제한' } },
    '사람이 죽지 않는 전쟁': { question: '사람이 죽지 않는 전쟁을 평화라고 할 수 있을까요?', labels: { agree: '그렇다', disagree: '아니다' } },
    'AI의 권리와 책임': { question: 'AWS에게, 인간처럼 권리를 부여할 수 있을까요?', labels: { agree: '그렇다', disagree: '아니다' } },
    'AWS 규제': { question: 'AWS는 국제 사회에서 계속 유지되어야 할까요, 아니면 글로벌 규제를 통해 제한되어야 할까요?', labels: { agree: '유지', disagree: '제한' } },
  };

  // -------- 안드로이드 역할명 --------
  const getRoleNameBySubtopicAndroid = (subtopic, roleId) => {
    switch (subtopic) {
      case 'AI의 개인 정보 수집':
      case '안드로이드의 감정 표현':
        return roleId === 1 ? '요양보호사 K' : roleId === 2 ? '노모 L' : '자녀 J';
      case '아이들을 위한 서비스':
      case '설명 가능한 AI':
        return roleId === 1 ? '로봇 제조사 연합회 대표'
             : roleId === 2 ? '소비자 대표'
             : '국가 인공지능 위원회 대표';
      case '지구, 인간, AI':
        return roleId === 1 ? '기업 연합체 대표'
             : roleId === 2 ? '국제 환경단체 대표'
             : '소비자 대표';
      default:
        return '';
    }
  };

  // -------- AWS 역할명 --------
  const getRoleNameBySubtopicAWS = (subtopic, roleId) => {
    const idx = Math.max(0, Math.min(2, (roleId ?? 1) - 1)); // 1→0, 2→1, 3→2
    const map = {
      'AI 알고리즘 공개':     ['지역 주민', '병사 J', '군사 AI 윤리 전문가'],
      'AWS의 권한':         ['신입 병사', '베테랑 병사 A', '군 지휘관'],
      '사람이 죽지 않는 전쟁': ['개발자', '국방부 장관', '국가 인공지능 위원회 대표'],
      'AI의 권리와 책임':   ['개발자', '국방부 장관', '국가 인공지능 위원회 대표'],
      'AWS 규제':          ['국방 기술 고문', '국제기구 외교 대표', '글로벌 NGO 활동가'],
    };
    const arr = map[subtopic];
    return Array.isArray(arr) ? arr[idx] : '';
  };
      const defaultRoleName = isAWS
    ? getRoleNameBySubtopicAWS(subtopic, roleId)
    : getRoleNameBySubtopicAndroid(subtopic, roleId);
  const subtopicMap = isAWS ? subtopicMapAWS : subtopicMapAndroid;

  //  커스텀 모드 값들 (질문/라벨/역할명/이미지)
  const char1 = (localStorage.getItem('char1') || '').trim();
  const char2 = (localStorage.getItem('char2') || '').trim();
  const char3 = (localStorage.getItem('char3') || '').trim();
  const customRoleName = roleId === 1 ? char1 : roleId === 2 ? char2 : char3;
  //  커스텀 질문/라벨 가져오기
  const customQuestion = (localStorage.getItem('question') || '').trim();
  const customAgree    = (localStorage.getItem('agree_label') || '').trim();
  const customDisagree = (localStorage.getItem('disagree_label') || '').trim();

  //  실제 표시할 질문/라벨 확정
  const questionText = isCustomMode
    ? (customQuestion || '')
    : (subtopicMap[subtopic]?.question || '');

  const agreeLabel = isCustomMode
    ? (customAgree || '동의')
    : (subtopicMap[subtopic]?.labels?.agree || '동의');

  const disagreeLabel = isCustomMode
    ? (customDisagree || '비동의')
    : (subtopicMap[subtopic]?.labels?.disagree || '비동의');

  // 기존(템플릿) 이미지들
  const neutralImgs = getDilemmaImages(mainTopic, subtopic, 'neutral', selectedIndex);
  const initialMode = localStorage.getItem('mode');
  const agreeImgs   = getDilemmaImages(mainTopic, subtopic, initialMode, selectedIndex);
  const neutralLast = neutralImgs[neutralImgs.length - 1];
  const agreeLast   = agreeImgs[agreeImgs.length - 1];

  const rawAgreeImg = localStorage.getItem('dilemma_image_4_1') || '';
  const rawDisagreeImg = localStorage.getItem('dilemma_image_4_2') || '';
  const localAgreeImg = resolveImageUrl(rawAgreeImg);
  const localDisagreeImg = resolveImageUrl(rawDisagreeImg);
  
  const selectedLocalImg =
    mode === 'agree'
      ? (localAgreeImg || defaultImg)
      : mode === 'disagree'
      ? (localDisagreeImg || defaultImg)
      : defaultImg;

  // 단계/확신/합의
  const [step, setStep] = useState(1);
  const [conf, setConf] = useState(0);
  const pct = conf ? ((conf - 1) / 4) * 100 : 0;
  const [consensusChoice, setConsensusChoice] = useState(null);

  const [statusData, setStatusData] = useState(null);
  const [didSyncChoice, setDidSyncChoice] = useState(false);
  const roleName = isCustomMode ? (customRoleName || defaultRoleName) : defaultRoleName;

  // 합의 상태 폴링(step2에서)
  useEffect(() => {
    if (step !== 2) return;
    let timer;
    const poll = async () => {
      try {
        const res = await axiosInstance.get(`/rooms/${roomCode}/rounds/${round}/status`);
        setStatusData(res.data);
        if (res.data.consensus_completed && !didSyncChoice) {
          const choice = res.data.consensus_choice === 1 ? 'agree' : 'disagree';
          setConsensusChoice(choice);
          setDidSyncChoice(true);
        }
        if (!res.data.consensus_completed) {
          timer = setTimeout(poll, 2000);
        }
      } catch {
        timer = setTimeout(poll, 5000);
      }
    };
    poll();
    return () => clearTimeout(timer);
  }, [roomCode, round, step, didSyncChoice]);

  // 페이지 도착 기록
  useEffect(() => {
    const nickname = localStorage.getItem('nickname');
    axiosInstance.post('/rooms/page-arrival', {
      room_code: roomCode,
      page_number: round,
      user_identifier: nickname,
    }).catch((e) => console.error('page-arrival 실패:', e));
  }, [roomCode, round]);

  // 사용자 도착 폴링
  useEffect(() => {
    let timer;
    const poll = async () => {
      try {
        const res = await axiosInstance.get(`/rooms/page-sync-status/${roomCode}/${round}`);
        setArrivalStatus(res.data);
        if (!res.data.all_arrived) {
          timer = setTimeout(poll, 3000);
        }
      } catch (e) {
        console.warn('page-sync-status 오류, 재시도:', e);
        timer = setTimeout(poll, 2000);
      }
    };
    poll();
    return () => clearTimeout(timer);
  }, [roomCode, round]);

  // host가 합의 선택
  const handleConsensus = (choice) => {
    if (!isHost) return alert('⚠️ 방장만 선택할 수 있습니다.');
    if (!arrivalStatus.all_arrived) return alert('다른 플레이어들이 스토리를 다 읽을 때까지 기다려주세요.');
    setConsensusChoice(choice);
  };
  useEffect(() => {
    setConsensusChoice(null);
  }, []);

  // next_page 브로드캐스트 수신
  useWebSocketMessage('next_page', () => {
    console.log(' next_page 수신됨');
    if (step === 1) setStep(2);
    else if (step === 2) {
      const nextRoute = consensusChoice === 'agree' ? '/game06' : '/game07';
      nav(nextRoute, { state: { consensus: consensusChoice } });
    }
  });

  // Step1 → Step2
  const handleStep1Continue = async () => {
    if (!isHost) return alert('⚠️ 방장만 다음 단계로 진행할 수 있습니다.');
    if (!consensusChoice) return alert('⚠️ 먼저 동의 혹은 비동의를 선택해주세요.');
    try {
      const choice = consensusChoice === 'agree' ? 1 : 2;
      await axiosInstance.post(`/rooms/rooms/round/${roomCode}/consensus`, {
        round_number: round,
        choice,
        subtopic, // 서버로는 기존 subtopic 유지
      });
      // 성공 시 step2로 진행 브로드캐스트
      sendNextPage();
    } catch (e) {
      console.error('합의 POST 실패:', e);
    }
  };

  // Step2 확신도 제출
  const submitConfidence = async () => {
    if (conf === 0) return alert('확신도를 선택해주세요.');
    try {
      await axiosInstance.post(`/rooms/rooms/round/${roomCode}/consensus/confidence`, {
        round_number: round,
        confidence: conf,
        subtopic, // 서버로는 기존 subtopic 유지
      });
      const prev = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
      const updated = [...new Set([...prev, subtopic])];
      localStorage.setItem('completedTopics', JSON.stringify(updated));
      const results = JSON.parse(localStorage.getItem('subtopicResults') || '{}');
      results[subtopic] = consensusChoice;
      localStorage.setItem('subtopicResults', JSON.stringify(results));
      const nextRoute = consensusChoice === 'agree' ? '/game06' : '/game07';
      nav(nextRoute, { state: { consensus: consensusChoice } });
    } catch (err) {
      console.error(err);
    }
  };

  const handleBackClick = () => {
    const idx = window.history.state?.idx ?? 0;
    if (idx > 0) nav(-1);
    else nav('/game05');
  };
  const canClickStep1Next = Boolean(consensusChoice) && arrivalStatus.all_arrived && isHost;

  return (
    <Layout subtopic={headerSubtopic} round={round} onProfileClick={setOpenProfile} onBackClick={handleBackClick}>
      {/* hostInfoSvg: Layout(.layout-stage)의 transform(scale) 영향을 피하려고 Portal로 body에 렌더링 */}
      {hostId === roleId && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: '-105px',
            right: '0px',
            zIndex: 9999,
            pointerEvents: 'auto',
          }}
        >
          <HostInfoBadge
            src={hostInfoSvg}
            alt="Host Info"
            preset="hostInfo"
            width={300}
            height={300}
          />
        </div>,
        document.body
      )}
   
      {step === 1 && (
        <>
          {/*  커스텀 모드 && 로컬 지정 이미지가 있을 때는 해당 1장만 표시 */}
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
            // 기존 두 장 미리보기(네추럴, 합의쪽)
            <div style={{ marginTop: 0, display: 'flex', justifyContent: 'center', gap: 16 }}>
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
          <p style={title}>
             당신은 {roleName}입니다.
             <br />
             {questionText || ''} <br/> 합의를 통해 최종 결정하세요.
             </p>
             
            <div style={{ display: 'flex', gap: 24 }}>
              <SelectCardToggle
                label={agreeLabel}
                selected={consensusChoice === 'agree'}
                onClick={() => isHost && handleConsensus('agree')}
                disabled={!isHost || !arrivalStatus.all_arrived}
                width={330}
                height={62}
              />
              <SelectCardToggle
                label={disagreeLabel}
                selected={consensusChoice === 'disagree'}
                onClick={() => isHost && handleConsensus('disagree')}
                disabled={!isHost || !arrivalStatus.all_arrived}
                width={330}
                height={62}
              />
            </div>
          </Card>

          <div style={{ marginTop: 40 }}>
            <Continue2 width={264} height={72} disabled={!canClickStep1Next} onClick={handleStep1Continue} />
          </div>
        </>
      )}

      {step === 2 && (
        <>
          {/* ✅ [Round] 헤더와 [다음] 버튼 사이 중앙에 확신도 박스 배치 */}
          <div
            style={{
              width: '100%',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* 중앙(확신도 카드) */}
            <div
              style={{
                flex: 1,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Card width={936} height={216} extraTop={0}>
                <p style={title}> 여러분의 선택에 당신은 얼마나 확신을 가지고 있나요?</p>

                <div style={{ position: 'relative', width: '80%', minWidth: 300 }}>
                  <div style={{ position: 'absolute', top: 8, left: 0, right: 0, height: LINE, background: Colors.grey03, zIndex: 0 }} />
                  <div style={{ position: 'absolute', top: 8, left: 0, width: `${pct}%`, height: LINE, background: Colors.brandPrimary, zIndex: 1 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                    {[1, 2, 3, 4, 5].map((n) => {
                      const isFilled = n <= conf;
                      return (
                        <div key={n} style={{ textAlign: 'center' }}>
                          <div
                            onClick={() => setConf(n)}
                            style={{
                              width: CIRCLE,
                              height: CIRCLE,
                              borderRadius: '50%',
                              background: isFilled ? Colors.brandPrimary : Colors.grey03,
                              cursor: 'pointer',
                              margin: '0 auto',
                            }}
                          />
                          <span style={{ ...FontStyles.caption, color: Colors.grey06, marginTop: 4, display: 'inline-block' }}>
                            {n}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>

            {/* 하단(다음 버튼) */}
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <Continue width={264} height={72} disabled={conf === 0} onClick={submitConfidence} />
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

function Card({ children, extraTop = 0, width = CARD_W, height = CARD_H, style = {} }) {
  return (
    <div style={{ width, height, marginTop: extraTop, position: 'relative', ...style }}>
      <img src={contentBoxFrame} alt="" style={{ width: '100%', height: '100%', objectFit: 'fill' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 24, padding: '0 24px' }}>
        {children}
      </div>
    </div>
  );
}

const title = { ...FontStyles.title, color: Colors.grey06, textAlign: 'center' };

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
