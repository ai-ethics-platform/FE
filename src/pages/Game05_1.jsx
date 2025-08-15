import React, { useState, useEffect, useRef } from 'react';
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
import { useHostActions,useWebSocketMessage } from '../hooks/useWebSocketMessage';
import { clearAllLocalStorageKeys } from '../utils/storage'; 
import HostCheck3 from '../components/HostCheck3';
import { FontStyles,Colors } from '../components/styleConstants';

const CARD_W = 640;
const CARD_H = 170;
const CIRCLE = 16;
const BORDER = 2;
const LINE = 3;

// 합의선택할때 post하는게 없음 

export default function Game05_01() {
  const nav = useNavigate();
  const pollingRef = useRef(null);
    // 컴포넌트가 마운트될 때마다 최신 completedTopics 를 읽어서 라운드를 설정
    const [round, setRound] = useState(() => {
      const c = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
      return c.length + 1;
    });
  
    // (선택) currentRound 도 localStorage 에 동기화하고 싶으면
    useEffect(() => {
      localStorage.setItem('currentRound', String(round));
    }, [round]);
    const { isConnected, sessionId, sendMessage } = useWebSocket();
    const { isInitialized: webrtcInitialized } = useWebRTC();
    const { isHost,sendNextPage } = useHostActions();
    const [showPopup, setShowPopup] = useState(false);
    const [openProfile, setOpenProfile] = useState(null);
 // 연결 상태 관리 (GameIntro에서 이미 초기화된 상태를 유지)
 const [connectionStatus, setConnectionStatus] = useState({
  websocket: true,
  webrtc: true,
  ready: true
});
    useEffect(() => {
      if (!isConnected) {
        console.warn('❌ WebSocket 연결 끊김 감지됨');
        alert('⚠️ 연결이 끊겨 게임이 초기화됩니다.');
        clearAllLocalStorageKeys();     
        nav('/');
      }
    }, [isConnected]);

     // 🔧 연결 상태 모니터링
        useEffect(() => {
          const newStatus = {
            websocket: isConnected,
            webrtc: webrtcInitialized,
            ready: isConnected && webrtcInitialized
          };
      
          setConnectionStatus(newStatus);
      
          console.log('[game05_1] 연결 상태 업데이트:', newStatus);
        }, [isConnected, webrtcInitialized]);

    // 유저 도착 
    const [arrivalStatus, setArrivalStatus] = useState({
      arrived_users: 0,
      total_required: 3,
      all_arrived: false,
    });

    useEffect(() => {
      const newStatus = {
        websocket: isConnected,
        webrtc: webrtcInitialized,
        ready: isConnected && webrtcInitialized
      };
      setConnectionStatus(newStatus);
      console.log('🔧 [Game04] 연결 상태 업데이트:', newStatus);
    }, [isConnected, webrtcInitialized]);

  // 로컬 저장값
  const roleId        = Number(localStorage.getItem('myrole_id'));
  const roomCode      = localStorage.getItem('room_code') ?? '';
  const mainTopic     = localStorage.getItem('category');
  const subtopic      = localStorage.getItem('subtopic');
  const selectedIndex = Number(localStorage.getItem('selectedCharacterIndex') ?? 0);

  // 역할 이름 가져오기
  const getRoleNameBySubtopic = (subtopic, roleId) => {
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
  const subtopicMap = {
    'AI의 개인 정보 수집': {
      question: '24시간 개인정보 수집 업데이트에 동의하시겠습니까?',
      labels: { agree: '동의', disagree: '비동의' }
    },
    '안드로이드의 감정 표현': {
      question: '감정 엔진 업데이트에 동의하시겠습니까?',
      labels: { agree: '동의', disagree: '비동의' }
    },
    '아이들을 위한 서비스': {
      question: '가정용 로봇 사용에 대한 연령 규제가 필요할까요?',
      labels: { agree: '규제 필요', disagree: '규제 불필요' }
    },
    '설명 가능한 AI': {
      question: "'설명 가능한 AI' 개발을 기업에 의무화해야 할까요?",
      labels: { agree: '의무화 필요', disagree: '의무화 불필요' }
    },
    '지구, 인간, AI': {
      question: '세계적으로 가정용 로봇의 업그레이드 혹은 사용에 제한이 필요할까요?',
      labels: { agree: '제한 필요', disagree: '제한 불필요' }
    }
  };

  // 방장이 어떤걸 선택했는지 받아야함 -> 그래야 이 부분 오류가 해결될 수 있음 , 현재의 오류 : 방장이 선택한 선택지를 몰라서 다른 유저들은 확인이 불가능함 
  const roleName = getRoleNameBySubtopic(subtopic, roleId);

  // 이미지 불러오기
  const neutralImgs = getDilemmaImages(mainTopic, subtopic, 'neutral', selectedIndex);
  const initialMode = localStorage.getItem('mode');
  
  const agreeImgs   = getDilemmaImages(mainTopic, subtopic, initialMode , selectedIndex);
  const neutralLast = neutralImgs[neutralImgs.length - 1];
  const agreeLast   = agreeImgs[agreeImgs.length - 1];

  // 단계 관리
  const [step, setStep] = useState(1);
  const [conf, setConf]                       = useState(0);
  const pct = conf ? ((conf - 1) / 4) * 100 : 0;
  const [consensusChoice, setConsensusChoice] = useState(null);

// state
const [statusData, setStatusData] = useState(null);
const [didSyncChoice, setDidSyncChoice] = useState(false);

// polling
useEffect(() => {
  if (step !== 2) return; 
  let timer;
  const poll = async () => {
    try {
      const res = await axiosInstance.get(
        `/rooms/${roomCode}/rounds/${round}/status`
      );
      setStatusData(res.data);
      // 합의 완료 && 한 번도 sync되지 않았으면
      if (res.data.consensus_completed && !didSyncChoice) {
        const choice = res.data.consensus_choice === 1 ? 'agree' : 'disagree';
        setConsensusChoice(choice);
        setDidSyncChoice(true);
      }
      // 완료 전엔 계속 폴링
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

// 페이지 도착 시 ready 상태 보내기
useEffect(() => {
  const nickname =
    localStorage.getItem('nickname');

  // 도착 기록
  axiosInstance.post('/rooms/page-arrival', {
    room_code: roomCode,
    page_number: round,
    user_identifier: nickname,
  }).catch((e) => {
    console.error('page-arrival 실패:', e);
  });
}, [roomCode, round]);

// 3명의 유저 모두 도착 확인 폴링 
useEffect(() => {
  let timer;
  const poll = async () => {
    try {
      const res = await axiosInstance.get(`/rooms/page-sync-status/${roomCode}/${round}`);
      setArrivalStatus(res.data);

      if (!res.data.all_arrived) {
        timer = setTimeout(poll, 3000); // 3초 폴링
      }
      // all_arrived === true면 폴링 중지 (재호출 안 함)
    } catch (e) {
      console.warn('page-sync-status 오류, 재시도:', e);
      timer = setTimeout(poll, 2000);
    }
  };
  poll();
  return () => clearTimeout(timer);
}, [roomCode, round]);

  
  // Step1: 합의 선택
  const handleConsensus = (choice) => {
    if (!isHost) return alert('⚠️ 방장만 선택할 수 있습니다.');
    if (!arrivalStatus.all_arrived) {
      
        return alert('유저의 입장을 기다리는 중입니다.');
        }
    setConsensusChoice(choice);     // 동의/비동의 저장
  };

  useEffect(() => {
    setConsensusChoice(null);
  }, []);

  useWebSocketMessage("next_page", () => {
    console.log(" next_page 수신됨");
  
    if (step === 1) {
      // Step 1 상태면 → step 2로 진행
      setStep(2);
    } else if (step === 2) {
      // Step 2 상태면 → 동의/비동의에 따라 navigate
      const nextRoute = consensusChoice === 'agree' ? '/game06' : '/game07';
      nav(nextRoute, { state: { consensus: consensusChoice } });
    }
  });

  // const handleStep1Continue = () => {
  //   if (!isHost) return alert('⚠️ 방장만 다음 단계로 진행할 수 있습니다.');
  //   if (!consensusChoice) return alert('⚠️ 먼저 동의 혹은 비동의를 선택해주세요.');
  // };

  const handleStep1Continue = async () => {
        if (!isHost) return alert('⚠️ 방장만 다음 단계로 진행할 수 있습니다.');
        if (!consensusChoice) return alert('⚠️ 먼저 동의 혹은 비동의를 선택해주세요.');
        try {
          const choice = consensusChoice === 'agree' ? 1 : 2;
          await axiosInstance.post(
            `/rooms/rooms/round/${roomCode}/consensus`,
            {
              round_number: round,
              choice:choice,
              subtopic:subtopic
            }
         );
          // 성공 시 step2로 진행 브로드캐스트 
          sendNextPage();         
        } catch (e) {
          console.error('합의 POST 실패:', e);
        }
      };

   // Step2: 합의 확신도
   const submitConfidence = async () => {  
    if (conf === 0) return alert('확신도를 선택해주세요.');

    try {
      await axiosInstance.post(
        `/rooms/rooms/round/${roomCode}/consensus/confidence`,
        { round_number: round, confidence: conf,subtopic: subtopic }
      );
  
      //  현재 subtopic을 completedTopics에 추가
      const prev = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
      const updated = [...new Set([...prev, subtopic])]; 
      localStorage.setItem('completedTopics', JSON.stringify(updated));

      const results = JSON.parse(localStorage.getItem('subtopicResults') || '{}');
      results[subtopic] = consensusChoice;
      localStorage.setItem('subtopicResults', JSON.stringify(results));
       // 각자 내비게이트
        const nextRoute = consensusChoice === 'agree' ? '/game06' : '/game07';
        nav(nextRoute, { state: { consensus: consensusChoice } });
      } catch (err) {
        console.error(err);
      }
    };
 const handleBackClick = () => {
    nav('/game05'); 
  };
  const canClickStep1Next = Boolean(consensusChoice) && arrivalStatus.all_arrived && isHost;

  return (
      <>
    <Layout subtopic={subtopic} round={round}  onProfileClick={setOpenProfile}  onBackClick={handleBackClick} >
    {/* {step === 1 && !arrivalStatus.all_arrived && (
      <div
        style={{
          width: 700,
          minHeight: 0,
          ...FontStyles.headlineSmall,
          color: Colors.systemRed,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
          marginBottom: 12,
        }}
      >
        유저 입장을 기다리는 중... (
        {arrivalStatus.arrived_users}/{arrivalStatus.total_required})
      </div>
    )} */}
      {step === 1 && (
        <>
          <div style={{ marginTop:0, display: 'flex', justifyContent: 'center', gap: 16 }}>
            {[neutralLast, agreeLast].map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`설명 이미지 ${idx + 1}`}
                style={{ width: 400, height: 200, objectFit: 'fill' }}
              />
            ))}
          </div>

          <Card width={936} height={216} extraTop={30}>
            <p style={title}>
            {subtopicMap[subtopic]?.question || ''} 합의를 통해 최종 결정 하세요.
            </p>
            <div style={{ display: 'flex', gap: 24 }}>
            <SelectCardToggle
              label={subtopicMap[subtopic].labels.agree}
              selected={consensusChoice === 'agree'}
              onClick={() => isHost && handleConsensus('agree')}
              disabled={!isHost||!arrivalStatus.all_arrived}              // 호스트만 클릭 가능
              width={330}
              height={62}
            />
            <SelectCardToggle
              label={subtopicMap[subtopic].labels.disagree}
              selected={consensusChoice === 'disagree'}
              onClick={() => isHost && handleConsensus('disagree')}
              disabled={!isHost||!arrivalStatus.all_arrived}              // 호스트만 클릭 가능
              width={330}
              height={62}
            />
          </div>

          </Card>

          <div style={{ marginTop: 40 }}>
          <Continue2
            width={264}
            height={72}
            disabled={!canClickStep1Next}
            onClick={handleStep1Continue}
          />
          </div>
        </>
        
      )}
      {step === 2 && (
        <>
          <Card width={936} height={216} extraTop={150}>
            <p style={title}> 여러분의 선택에 당신은 얼마나 확신을 가지고 있나요?</p>
            <div style={{ position: 'relative', width: '80%', minWidth: 300}}>
            <div
              style={{
                position: 'absolute',
                top: 8,
                left: 0,
                right: 0,
                height: LINE,
                background: Colors.grey03,
                zIndex: 0, // 가장 아래
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
                zIndex: 1, // 중간
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

          <div style={{ marginTop: 80, textAlign: 'center' }}>
            <Continue
              width={264}
              height={72}
              disabled={conf === 0}
              onClick={submitConfidence}
            />
          </div>
        </>
      )}
    </Layout>
  
    </>

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

const title = {
  ...FontStyles.title,
  color: Colors.grey06,
  textAlign: 'center',
};
