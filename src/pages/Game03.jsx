// // pages/Game03.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Layout from '../components/Layout';
// import SelectCardToggle from '../components/SelectButton';
// import Continue from '../components/Continue';
// import contentBoxFrame from '../assets/contentBox4.svg';

// import { getDilemmaImages } from '../components/dilemmaImageLoader';
// import axiosInstance from '../api/axiosInstance';
// import { useWebSocket } from '../WebSocketProvider';
// import { useWebRTC } from '../WebRTCProvider';
// import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';
// import { FontStyles, Colors } from '../components/styleConstants';
// import { clearAllLocalStorageKeys } from '../utils/storage';

// const CARD_W = 640;
// const CARD_H = 170;
// const CIRCLE = 16;
// const BORDER = 2;
// const LINE = 3;

// export default function Game03() {
//   const nav = useNavigate();
//   const pollingRef = useRef(null);

//   // localStorage에서 값 가져오기
//   const roleId        = Number(localStorage.getItem('myrole_id'));
//   const roomCode      = localStorage.getItem('room_code') ?? '';
//   const category      = localStorage.getItem('category') ?? '안드로이드';
//   const mode          = 'neutral';
//   const selectedIndex = Number(localStorage.getItem('selectedCharacterIndex') ?? 0);
//   const [openProfile, setOpenProfile] = useState(null);
//   const isAWS = category === '자율 무기 시스템';

//   //  커스텀 모드 여부
//   const isCustomMode = !!localStorage.getItem('code');
//   const rawSubtopic = localStorage.getItem('subtopic');
//   const creatorTitle = localStorage.getItem('creatorTitle') || '';
//   const subtopic = isCustomMode ? creatorTitle : (rawSubtopic || '');

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

//   // -------- 질문/라벨(안드로이드 기본) --------
//   const subtopicMapAndroid = {
//     'AI의 개인 정보 수집': {
//       question: '24시간 개인정보 수집 업데이트에 동의하시겠습니까?',
//       labels: { agree: '동의', disagree: '비동의' },
//     },
//     '안드로이드의 감정 표현': {
//       question: '감정 엔진 업데이트에 동의하시겠습니까?',
//       labels: { agree: '동의', disagree: '비동의' },
//     },
//     '아이들을 위한 서비스': {
//       question: '가정용 로봇 사용에 대한 연령 규제가 필요할까요?',
//       labels: { agree: '규제 필요', disagree: '규제 불필요' },
//     },
//     '설명 가능한 AI': {
//       question: "'설명 가능한 AI' 개발을 기업에 의무화해야 할까요?",
//       labels: { agree: '의무화 필요', disagree: '의무화 불필요' },
//     },
//     '지구, 인간, AI': {
//       question: '세계적으로 가정용 로봇의 업그레이드 혹은 사용에 제한이 필요할까요?',
//       labels: { agree: '제한 필요', disagree: '제한 불필요' },
//     },
//   };

//   // -------- 질문/라벨(AWS) --------
//   const subtopicMapAWS = {
//     'AI 알고리즘 공개': {
//       question: 'AWS의 판단 로그 및 알고리즘 구조 공개 요구에 동의하시겠습니까?',
//       labels: { agree: '동의', disagree: '비동의' },
//     },
//     'AWS의 권한': {
//       question: 'AWS의 권한을 강화해야 할까요? 제한해야 할까요?',
//       labels: { agree: '강화', disagree: '제한' },
//     },
//     '사람이 죽지 않는 전쟁': {
//       question: '사람이 죽지 않는 전쟁을 평화라고 할 수 있을까요?',
//       labels: { agree: '그렇다', disagree: '아니다' },
//     },
//     'AI의 권리와 책임': {
//       question: 'AWS에게, 인간처럼 권리를 부여할 수 있을까요?',
//       labels: { agree: '그렇다', disagree: '아니다' },
//     },
//     'AWS 규제': {
//       question:
//         'AWS는 국제 사회에서 계속 유지되어야 할까요, 아니면 글로벌 규제를 통해 제한되어야 할까요?',
//       labels: { agree: '유지', disagree: '제한' },
//     },
//   };

//   // 기본(비커스텀) 역할명/질문/라벨
//   const defaultRoleName = isAWS
//     ? getRoleNameBySubtopicAWS(subtopic, roleId)
//     : getRoleNameBySubtopicAndroid(subtopic, roleId);
//   const subtopicMap = isAWS ? subtopicMapAWS : subtopicMapAndroid;

//   //  커스텀 모드 값들 (질문/라벨/역할명/이미지)
//   const char1 = (localStorage.getItem('char1') || '').trim();
//   const char2 = (localStorage.getItem('char2') || '').trim();
//   const char3 = (localStorage.getItem('char3') || '').trim();
//   const customRoleName = roleId === 1 ? char1 : roleId === 2 ? char2 : char3;

//   const customQuestion = (localStorage.getItem('question') || '').trim();
//   const customAgree = (localStorage.getItem('agree_label') || '').trim();
//   const customDisagree = (localStorage.getItem('disagree_label') || '').trim();

//   // 최종 표시 텍스트
//   const roleName = isCustomMode ? (customRoleName || defaultRoleName) : defaultRoleName;
//   const finalQuestion = isCustomMode
//     ? customQuestion
//     : (subtopicMap[subtopic]?.question || '');
//   const finalAgree = isCustomMode
//     ? (customAgree || '동의')
//     : (subtopicMap[subtopic]?.labels.agree || '동의');
//   const finalDisagree = isCustomMode
//     ? (customDisagree || '비동의')
//     : (subtopicMap[subtopic]?.labels.disagree || '비동의');

//   // 이미지 세팅
//   const comicImages = getDilemmaImages(category, subtopic, mode, selectedIndex);
//   const resolveImageUrl = (raw) => {
//     if (!raw || raw === '-' || String(raw).trim() === '') return null;
//     const u = String(raw).trim();
//     if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
//     const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
//     if (!base) return u;
//     return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
//   };
//   const customImage = resolveImageUrl(localStorage.getItem('dilemma_image_3') || '');
//   const displayImages = isCustomMode ? (customImage ? [customImage] : []) : comicImages;

//   // 상태
//   const [step, setStep]         = useState(1);
//   const [agree, setAgree]       = useState(null);
//   const [conf, setConf]         = useState(0);
//   const [isWaiting, setWaiting] = useState(false);
//   const pct = conf ? ((conf - 1) / 4) * 100 : 0;

//   const [round, setRound] = useState(1);
//   useEffect(() => {
//     const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
//     const nextRound = completed.length + 1;
//     setRound(nextRound);
//     localStorage.setItem('currentRound', String(nextRound));
//   }, []);

//   const { isConnected, reconnectAttempts, maxReconnectAttempts,finalizeDisconnection } = useWebSocket();
//   const { isInitialized: webrtcInitialized } = useWebRTC();
//   const { isHost, sendNextPage } = useHostActions();
//   useWebSocketNavigation(nav, { nextPagePath: '/game04', infoPath: '/game04' });

//   // 연결 상태 관리
//   const [connectionStatus, setConnectionStatus] = useState({
//     websocket: true,
//     webrtc: true,
//     ready: true
//   });
//   useEffect(() => {
//     const newStatus = {
//       websocket: isConnected,
//       webrtc: webrtcInitialized,
//       ready: isConnected && webrtcInitialized
//     };
//     setConnectionStatus(newStatus);
//     console.log('🔧 [Game03] 연결 상태 업데이트:', newStatus);
//   }, [isConnected, webrtcInitialized]);

//   useEffect(() => {
//     if (!isConnected && reconnectAttempts >= maxReconnectAttempts) {
//       console.warn('🚫 WebSocket 재연결 실패 → 게임 초기화');
//       alert('⚠️ 연결을 복구하지 못했습니다. 게임이 초기화됩니다.');
//       clearAllLocalStorageKeys();
//       navigate('/');
//     }
//   }, [isConnected, reconnectAttempts, maxReconnectAttempts]);
//   useEffect(() => {
//         let cancelled = false;
//         const isReloadingGraceLocal = () => {
//           const flag = sessionStorage.getItem('reloading') === 'true';
//           const expire = parseInt(sessionStorage.getItem('reloading_expire_at') || '0', 10);
//           if (!flag) return false;
//           if (Date.now() > expire) {
//             sessionStorage.removeItem('reloading');
//             sessionStorage.removeItem('reloading_expire_at');
//             return false;
//           }
//           return true;
//         };
      
//         if (!isConnected) {
//           // 1) reloading-grace가 켜져 있으면 finalize 억제
//           if (isReloadingGraceLocal()) {
//             console.log('♻️ reloading grace active — finalize 억제');
//             return;
//           }
      
//           // 2) debounce: 잠깐 기다렸다가 여전히 끊겨있으면 finalize
//           const DEBOUNCE_MS = 1200;
//           const timer = setTimeout(() => {
//             if (cancelled) return;
//             if (!isConnected && !isReloadingGraceLocal()) {
//               console.warn('🔌 WebSocket 연결 끊김 → 초기화 (확정)');
//               finalizeDisconnection('❌ 연결이 끊겨 게임이 초기화됩니다.');
//             } else {
//               console.log('🔁 재연결/리로드 감지 — finalize 스킵');
//             }
//           }, DEBOUNCE_MS);
      
//           return () => {
//             cancelled = true;
//             clearTimeout(timer);
//           };
//         }
//       }, [isConnected, finalizeDisconnection]);
//   // step 1: 개인 동의/비동의 POST 후 consensus 폴링 시작
//   const handleSubmitChoice = async () => {
//     const choiceInt = agree === 'agree' ? 1 : 2;
//     try {
//       setWaiting(true);
//       await axiosInstance.post(
//         `/rooms/rooms/round/${roomCode}/choice`,
//         { round_number: round, choice: choiceInt, subtopic: subtopic }
//       );
//       pollConsensus();
//     } catch (err) {
//       console.error('선택 전송 중 오류:', err);
//       setWaiting(false);
//     }
//   };

//   // all_completed 체크 폴링
//   const pollConsensus = async () => {
//     try {
//       const res = await axiosInstance.get(
//         `/rooms/${roomCode}/rounds/${round}/status`
//       );
//       if (res.data.all_completed) {
//         clearTimeout(pollingRef.current);
//         setWaiting(false);
//         setStep(2);
//       } else {
//         pollingRef.current = setTimeout(pollConsensus, 2000);
//       }
//     } catch (err) {
//       console.error('consensus 조회 중 오류:', err);
//       pollingRef.current = setTimeout(pollConsensus, 5000);
//     }
//   };

//   // step 2: 확신 선택 POST 후 다음 페이지 이동
//   const handleSubmitConfidence = async () => {
//     try {
//       await axiosInstance.post(
//         `/rooms/rooms/round/${roomCode}/choice/confidence`,
//         { round_number: round, confidence: conf, subtopic: subtopic }
//       );
//       nav('/game04');
//     } catch (err) {
//       console.error('확신 전송 중 오류:', err);
//     }
//   };

//   const handleBackClick = () => {
//     nav('/game02'); 
//   };

//   return (
//     <Layout subtopic={subtopic} round={round} onProfileClick={setOpenProfile} onBackClick={handleBackClick}>
//       {step === 1 && (
//         <>
//           <div style={{ marginTop: 60, display: 'flex', justifyContent: 'center', gap: 10 }}>
//             {displayImages.map((img, idx) => (
//               <img key={idx} src={img} alt={`설명 이미지 ${idx + 1}`} style={{ width: 250, height: 139 }} />
//             ))}
//           </div>

//           <Card width={936} height={216} extraTop={30}>
//             <p style={title}>
//               당신은 {roleName}입니다.
//               {finalQuestion && (
//                 <>
//                   <br />
//                   {finalQuestion}
//                 </>
//               )}
//             </p>
//             <div style={{ display: 'flex', gap: 24 }}>
//               <SelectCardToggle
//                 label={finalAgree}
//                 selected={agree === 'agree'}
//                 onClick={() => setAgree('agree')}
//                 width={330}
//                 height={62}
//               />
//               <SelectCardToggle
//                 label={finalDisagree}
//                 selected={agree === 'disagree'}
//                 onClick={() => setAgree('disagree')}
//                 width={330}
//                 height={62}
//               />
//             </div>
//           </Card>

//           <div style={{ marginTop: 40, textAlign: 'center' }}>
//             {isWaiting
//               ? <p style={{...FontStyles.body}}>다른 플레이어 선택을 기다리는 중…</p>
//               : <Continue width={264} height={72} step={1} disabled={!agree} onClick={handleSubmitChoice} />
//             }
//           </div>
//         </>
//       )}

//       {step === 2 && (
//         <>
//           <Card width={936} height={216} extraTop={150}>
//             <p style={title}>당신의 선택에 얼마나 확신을 가지고 있나요?</p>
//             <div style={{ position: 'relative', width: '80%', minWidth: 300 }}>
//               <div
//                 style={{
//                   position: 'absolute',
//                   top: 8,
//                   left: 0,
//                   right: 0,
//                   height: LINE,
//                   background: Colors.grey03,
//                   zIndex: 0,
//                 }}
//               />
//               <div
//                 style={{
//                   position: 'absolute',
//                   top: 8,
//                   left: 0,
//                   width: `${pct}%`,
//                   height: LINE,
//                   background: Colors.brandPrimary,
//                   zIndex: 1,
//                 }}
//               />
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
//           <div style={{ marginTop: 80 }}>
//             <Continue width={264} height={72} step={2} disabled={conf === 0} onClick={handleSubmitConfidence} />
//           </div>
//         </>
//       )}
//     </Layout>
//   );
// }

// function Card({ children, extraTop = 0, width = CARD_W, height = CARD_H, style = {} }) {
//   return (
//     <div style={{ width, height, marginTop: extraTop, position: 'relative', ...style }}>
//       <img src={contentBoxFrame} alt="" style={{ width: '100%', height: '100%', objectFit: 'fill' }} />
//       <div
//         style={{
//           position: 'absolute',
//           inset: 0,
//           display: 'flex',
//           flexDirection: 'column',
//           justifyContent: 'center',
//           alignItems: 'center',
//           gap: 24,
//           padding: '0 24px',
//         }}
//       >
//         {children}
//       </div>
//     </div>
//   );
// }

// const title = { ...FontStyles.title, color: Colors.grey06, textAlign: 'center' };

// 디폴트 이미지 수정 
// pages/Game03.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SelectCardToggle from '../components/SelectButton';
import Continue from '../components/Continue';
import contentBoxFrame from '../assets/contentBox4.svg';

import { getDilemmaImages } from '../components/dilemmaImageLoader';
import axiosInstance from '../api/axiosInstance';
import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider';
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';
import { FontStyles, Colors } from '../components/styleConstants';
import { clearAllLocalStorageKeys } from '../utils/storage';
import defaultImg from '../assets/images/default.png';
const CARD_W = 640;
const CARD_H = 170;
const CIRCLE = 16;
const BORDER = 2;
const LINE = 3;

export default function Game03() {
  const nav = useNavigate();
  const pollingRef = useRef(null);

  // localStorage에서 값 가져오기
  const roleId        = Number(localStorage.getItem('myrole_id'));
  const roomCode      = localStorage.getItem('room_code') ?? '';
  const category      = localStorage.getItem('category') ?? '안드로이드';
  const mode          = 'neutral';
  const selectedIndex = Number(localStorage.getItem('selectedCharacterIndex') ?? 0);
  const [openProfile, setOpenProfile] = useState(null);
  const isAWS = category === '자율 무기 시스템';

  //  커스텀 모드 여부
  const isCustomMode = !!localStorage.getItem('code');
  const rawSubtopic = localStorage.getItem('subtopic');
  const creatorTitle = localStorage.getItem('creatorTitle') || '';
  const subtopic = isCustomMode ? creatorTitle : (rawSubtopic || '');

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

  // -------- 질문/라벨(안드로이드 기본) --------
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

  // -------- 질문/라벨(AWS) --------
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

  // 기본(비커스텀) 역할명/질문/라벨
  const defaultRoleName = isAWS
    ? getRoleNameBySubtopicAWS(subtopic, roleId)
    : getRoleNameBySubtopicAndroid(subtopic, roleId);
  const subtopicMap = isAWS ? subtopicMapAWS : subtopicMapAndroid;

  //  커스텀 모드 값들 (질문/라벨/역할명/이미지)
  const char1 = (localStorage.getItem('char1') || '').trim();
  const char2 = (localStorage.getItem('char2') || '').trim();
  const char3 = (localStorage.getItem('char3') || '').trim();
  const customRoleName = roleId === 1 ? char1 : roleId === 2 ? char2 : char3;

  const customQuestion = (localStorage.getItem('question') || '').trim();
  const customAgree = (localStorage.getItem('agree_label') || '').trim();
  const customDisagree = (localStorage.getItem('disagree_label') || '').trim();

  // 최종 표시 텍스트
  const roleName = isCustomMode ? (customRoleName || defaultRoleName) : defaultRoleName;
  const finalQuestion = isCustomMode
    ? customQuestion
    : (subtopicMap[subtopic]?.question || '');
  const finalAgree = isCustomMode
    ? (customAgree || '동의')
    : (subtopicMap[subtopic]?.labels.agree || '동의');
  const finalDisagree = isCustomMode
    ? (customDisagree || '비동의')
    : (subtopicMap[subtopic]?.labels.disagree || '비동의');

  // 이미지 세팅
  const comicImages = getDilemmaImages(category, subtopic, mode, selectedIndex);
  const resolveImageUrl = (raw) => {
    if (!raw || raw === '-' || String(raw).trim() === '') return null;
    const u = String(raw).trim();
    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
    const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
    if (!base) return u;
    return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
  };
  const customImage = resolveImageUrl(localStorage.getItem('dilemma_image_3') || '');
  const displayImages = isCustomMode
    ? [customImage || defaultImg]   // ✅ 없으면 defaultImg
    : comicImages;
  // 상태
  const [step, setStep]         = useState(1);
  const [agree, setAgree]       = useState(null);
  const [conf, setConf]         = useState(0);
  const [isWaiting, setWaiting] = useState(false);
  const pct = conf ? ((conf - 1) / 4) * 100 : 0;

  const [round, setRound] = useState(1);
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const nextRound = completed.length + 1;
    setRound(nextRound);
    localStorage.setItem('currentRound', String(nextRound));
  }, []);

  const { isConnected, reconnectAttempts, maxReconnectAttempts,finalizeDisconnection } = useWebSocket();
  const { isInitialized: webrtcInitialized } = useWebRTC();
  const { isHost, sendNextPage } = useHostActions();
  useWebSocketNavigation(nav, { nextPagePath: '/game04', infoPath: '/game04' });

  // 연결 상태 관리
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
    console.log('🔧 [Game03] 연결 상태 업데이트:', newStatus);
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
  // step 1: 개인 동의/비동의 POST 후 consensus 폴링 시작
  const handleSubmitChoice = async () => {
    const choiceInt = agree === 'agree' ? 1 : 2;
    try {
      setWaiting(true);
      await axiosInstance.post(
        `/rooms/rooms/round/${roomCode}/choice`,
        { round_number: round, choice: choiceInt, subtopic: subtopic }
      );
      pollConsensus();
    } catch (err) {
      console.error('선택 전송 중 오류:', err);
      setWaiting(false);
    }
  };

  // all_completed 체크 폴링
  const pollConsensus = async () => {
    try {
      const res = await axiosInstance.get(
        `/rooms/${roomCode}/rounds/${round}/status`
      );
      if (res.data.all_completed) {
        clearTimeout(pollingRef.current);
        setWaiting(false);
        setStep(2);
      } else {
        pollingRef.current = setTimeout(pollConsensus, 2000);
      }
    } catch (err) {
      console.error('consensus 조회 중 오류:', err);
      pollingRef.current = setTimeout(pollConsensus, 5000);
    }
  };

  // step 2: 확신 선택 POST 후 다음 페이지 이동
  const handleSubmitConfidence = async () => {
    try {
      await axiosInstance.post(
        `/rooms/rooms/round/${roomCode}/choice/confidence`,
        { round_number: round, confidence: conf, subtopic: subtopic }
      );
      nav('/game04');
    } catch (err) {
      console.error('확신 전송 중 오류:', err);
    }
  };

  const handleBackClick = () => {
    const idx = window.history.state?.idx ?? 0;
    if (idx > 0) nav(-1);
    else nav('/game02');
  };

  return (
    <Layout subtopic={subtopic} round={round} onProfileClick={setOpenProfile} onBackClick={handleBackClick}>
      {step === 1 && (
        <>
          <div style={{ marginTop: 60, display: 'flex', justifyContent: 'center', gap: 10 }}>
            {displayImages.map((img, idx) => (
              <img key={idx} src={img} alt={`설명 이미지 ${idx + 1}`} style={{ width: 250, height: 139 }}     onError={(e) => { e.currentTarget.src = defaultImg; }} />
            ))}
          </div>

          <Card width={936} height={216} extraTop={30}>
            <p style={title}>
              당신은 {roleName}입니다.
              {finalQuestion && (
                <>
                  <br />
                  {finalQuestion}
                </>
              )}
            </p>
            <div style={{ display: 'flex', gap: 24 }}>
              <SelectCardToggle
                label={finalAgree}
                selected={agree === 'agree'}
                onClick={() => setAgree('agree')}
                width={330}
                height={62}
              />
              <SelectCardToggle
                label={finalDisagree}
                selected={agree === 'disagree'}
                onClick={() => setAgree('disagree')}
                width={330}
                height={62}
              />
            </div>
          </Card>

          <div style={{ marginTop: 40, textAlign: 'center' }}>
            {isWaiting
              ? <p style={{...FontStyles.body}}>다른 플레이어 선택을 기다리는 중…</p>
              : <Continue width={264} height={72} step={1} disabled={!agree} onClick={handleSubmitChoice} />
            }
          </div>
        </>
      )}

      {step === 2 && (
        <>
          {/* ✅ 확신도 선택 박스를 "Round 박스(상단) ↔ 다음(하단)" 사이 중앙에 배치 */}
          <div
            style={{
              width: '100%',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* 중앙 영역(카드) */}
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
                <p style={title}>당신의 선택에 얼마나 확신을 가지고 있나요?</p>
                <div style={{ position: 'relative', width: '80%', minWidth: 300 }}>
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 0,
                      right: 0,
                      height: LINE,
                      background: Colors.grey03,
                      zIndex: 0,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 0,
                      width: `${pct}%`,
                      height: LINE,
                      background: Colors.brandPrimary,
                      zIndex: 1,
                    }}
                  />
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

            {/* 하단 영역(다음) */}
            <div style={{ marginBottom: 8 }}>
              <Continue width={264} height={72} step={2} disabled={conf === 0} onClick={handleSubmitConfidence} />
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
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 24,
          padding: '0 24px',
        }}
      >
        {children}
      </div>
    </div>
  );
}

const title = { ...FontStyles.title, color: Colors.grey06, textAlign: 'center' };
