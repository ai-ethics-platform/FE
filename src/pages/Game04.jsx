// pages/Game04.jsx
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
const completed = JSON.parse(localStorage.getItem('completedTopics') || '[]');
const initialRound = completed.length + 1;

export default function Game04() {
  const { state } = useLocation();
  const navigate   = useNavigate();
  
    const { isConnected, sessionId, sendMessage } = useWebSocket();
    const { isInitialized: webrtcInitialized } = useWebRTC();
    const { isHost, sendNextPage } = useHostActions();
    useWebSocketNavigation(navigate, { nextPagePath: '/game05', infoPath: '/game05' });
    
    const [connectionStatus, setConnectionStatus] = useState({
      websocket: false,
      webrtc: false,
      ready: false
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

  const myVote   = state?.agreement ?? null;
  const subtopic = localStorage.getItem('subtopic') ?? 'AI의 개인 정보 수집';
  const roomCode = localStorage.getItem('room_code') ?? '';

  // const [round, setRound] = useState(1);
  // useEffect(() => {
  //   const completed       = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
  //   const calculatedRound = completed.length + 1;
  //   setRound(calculatedRound);
  //   localStorage.setItem('currentRound', calculatedRound.toString());
  // }, []);
   const [round, setRound] = useState(() => {
        const c = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
        return c.length + 1;
      });
    
      // (선택) currentRound 도 localStorage 에 동기화하고 싶으면
      useEffect(() => {
        localStorage.setItem('currentRound', String(round));
      }, [round]);

  const [agreedList, setAgreedList] = useState([]);
  const [disagreedList, setDisagreedList] = useState([]);
  const [selectedMode, setSelectedMode] = useState(() => localStorage.getItem('mode') ?? null);

 
  
useEffect(() => {
  let attempt = 0;
  const maxAttempts = 5;
  const interval = 1000; // 3초

  const fetchAgreementStatus = async () => {
    try {
      const res = await axiosInstance.get(
        `/rooms/${roomCode}/rounds/${round}/status`
      );
      const participants = res.data.participants;

      // choice = 1: 동의, choice = 2: 비동의
      const agreeList = participants
        .filter(p => p.choice === 1)
        .map(p => `${p.role_id}P`);
      const disagreeList = participants
        .filter(p => p.choice === 2)
        .map(p => `${p.role_id}P`);

      setAgreedList(agreeList);
      setDisagreedList(disagreeList);

      console.log(` [Game04] ${attempt + 1}번째 동의 상태 확인:`, {
        agreeList,
        disagreeList,
      });
      if (agreeList.length > disagreeList.length) {
        localStorage.setItem('mode', 'agree');
        setSelectedMode('agree');
      } else {
        localStorage.setItem('mode', 'disagree');
        setSelectedMode('disagree');
      }

    } catch (err) {
      console.error(' [Game04] 동의 상태 조회 실패:', err);
    }
  };

  // 최초 1회 실행
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


  const [secsLeft, setSecsLeft] = useState(10);
  useEffect(() => {
    if (secsLeft <= 0) return;
    const timer = setInterval(() => setSecsLeft(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secsLeft]);

  const timeStr = `${String(Math.floor(secsLeft/60)).padStart(2,'0')}` +
                  `:${String(secsLeft%60).padStart(2,'0')}`;

  const handleContinue = () => {
    // if (!isHost) {
    //   alert('⚠️ 방장만 진행할 수 있습니다.');
    //   return;
    // }
    // sendNextPage();
    navigate('/game05');

  };
  const currentSubtopic = localStorage.getItem('subtopic');
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


  return (
    <Layout subtopic={subtopic} round={round} >

          <div style={{
            width: 100,
            minHeight: 40,
            ...FontStyles.headlineNormal,
            color: secsLeft <= 10 && secsLeft > 0 ? Colors.systemRed : Colors.grey04,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
          }}>
            {timeStr }
          </div>
      <div style={{ marginTop:10, display: 'flex', gap: 48 }}>

        {[
          { list: agreedList, key: 'agree', icon: agreeIcon },
          {  list: disagreedList, key: 'disagree', icon: disagreeIcon },
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
              <img
                src={icon}
                style={{ width: 160, height: 160, marginTop: 40, marginBottom: -10 }}
              />
              <p style={{ ...FontStyles.headlineSmall, color: Colors.brandPrimary }}>
              {subtopicMap[currentSubtopic]?.labels?.[key] ?? (key === 'agree' ? '동의' : '비동의')}
              </p>
              <p style={{ ...FontStyles.headlineLarge, color: Colors.grey06, margin: '16px 0' }}>
                {list.length}명
              </p>
            </div>
          </div>
        ))}

      </div>

      <div style={{ textAlign: 'center', marginTop: 10 }}>
        <p style={{ 
          ...FontStyles.headlineSmall, 
          color: Colors.grey05
        }}>
          {secsLeft <= 0 
            ? '마무리하고 다음으로 넘어가 주세요.' 
            : '선택의 이유를 한 분씩 공유해 주세요.'}
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 24,
          marginTop: 16,
        }}>
          <Continue
            width={264}
            height={72}
            step={1}
            onClick={handleContinue}
          />
        </div>
      </div>

    </Layout>
  );
}
