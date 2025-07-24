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
  const subtopic = localStorage.getItem('subtopic') ?? '가정 1';
  const roomCode = localStorage.getItem('room_code') ?? '';

  const [round, setRound] = useState(1);
  useEffect(() => {
    const completed       = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const calculatedRound = completed.length + 1;
    setRound(calculatedRound);
    localStorage.setItem('currentRound', calculatedRound.toString());
  }, []);

  const [agreedList, setAgreedList] = useState([]);
  const [disagreedList, setDisagreedList] = useState([]);

useEffect(() => {
  let attempt = 0;
  const maxAttempts = 5;
  const interval = 3000; // 3초

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
      }else{
        localStorage.setItem('mode','disagree');
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
    if (!isHost) {
      alert('⚠️ 방장만 진행할 수 있습니다.');
      return;
    }
    sendNextPage();
  };

  return (
    <Layout subtopic={subtopic} round={round} >

      <div style={{ marginTop:50, display: 'flex', gap: 48 }}>
        {[
          { label: '동의',   list: agreedList,    key: 'agree',  icon :agreeIcon },
          { label: '비동의', list: disagreedList, key: 'disagree', icon:disagreeIcon },
        ].map(({ label, list, key,icon }) => (
          <div key={key} style={{ position: 'relative', width: 360, height: 391 }}>
            <img
              src={list.length && state.agreement===key ? boxSelected : boxUnselect}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill' }}
            />
            <div style={{
              position: 'relative', zIndex: 1, height: '100%',
              display: 'flex', flexDirection: 'column',
              justifyContent: 'center', alignItems: 'center', textAlign: 'center',
            }}>
               <img
                src={icon}
                alt={`${label} 아이콘`}
                style={{ width: 160, height: 160, marginTop: 40, marginBottom: -10 }}
              />
              <p style={{ ...FontStyles.headlineSmall, color: Colors.brandPrimary }}>{label}</p>
              <p style={{ ...FontStyles.headlineLarge, color: Colors.grey06, margin: '16px 0' }}>
                {list.length}명
              </p>
              
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 40}}>
        {secsLeft > 0 ? (
          <>
            <p style={{ ...FontStyles.headlineSmall, color: Colors.grey06 }}>
              선택의 이유를 공유해 주세요.
            </p>
            <div style={{
              width: 264, height: 72, margin: '16px auto 0',
              background: Colors.grey04, borderRadius: 8, opacity: 0.6,
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              fontSize: 24, color: Colors.grey01, userSelect: 'none',
            }}>
              {timeStr}
            </div>
          </>
        ) : (
          <Continue
            width={264}
            height={72}
            step={1}
            disabled={!isHost}
            onClick={handleContinue}
          />
        )}
      </div>
    </Layout>
  );
}
