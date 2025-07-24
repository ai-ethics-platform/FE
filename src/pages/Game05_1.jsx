import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import SelectCardToggle from '../components/SelectButton';
import Continue from '../components/Continue2';
import contentBoxFrame from '../assets/contentBox4.svg';
import { Colors, FontStyles } from '../components/styleConstants';

import { getDilemmaImages } from '../components/dilemmaImageLoader';
import axiosInstance from '../api/axiosInstance';
import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider';
import { useHostActions,useWebSocketMessage } from '../hooks/useWebSocketMessage';

const CARD_W = 640;
const CARD_H = 170;
const CIRCLE = 16;
const BORDER = 2;
const LINE = 3;

export default function Game05_01() {
  const nav = useNavigate();
  const pollingRef = useRef(null);

    const { isConnected, sessionId, sendMessage } = useWebSocket();
    const { isInitialized: webrtcInitialized } = useWebRTC();
    const { isHost,sendNextPage } = useHostActions();
    
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
      case '가정 1':
      case '가정 2':
        return roleId === 1 ? '요양보호사 K' : roleId === 2 ? '노모 L' : '자녀 J';
      case '국가 인공지능 위원회 1':
      case '국가 인공지능 위원회 2':
        return roleId === 1 ? '로봇 제조사 연합회 대표'
             : roleId === 2 ? '소비자 대표'
             : '국가 인공지능 위원회 대표';
      case '국제 인류 발전 위원회 1':
        return roleId === 1 ? '기업 연합체 대표'
             : roleId === 2 ? '국제 환경단체 대표'
             : '소비자 대표';
      default:
        return '';
    }
  };
  
  const roleName = getRoleNameBySubtopic(subtopic, roleId);

  // 라운드 계산
  const [round, setRound] = useState(1);
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const r = completed.length + 1;
    setRound(r);
    localStorage.setItem('currentRound', String(r));
    return () => clearTimeout(pollingRef.current);
  }, []);

  // 이미지 불러오기
  const neutralImgs = getDilemmaImages(mainTopic, subtopic, 'neutral', selectedIndex);
  const agreeImgs   = getDilemmaImages(mainTopic, subtopic, 'agree', selectedIndex);
  const neutralLast = neutralImgs[neutralImgs.length - 1];
  const agreeLast   = agreeImgs[agreeImgs.length - 1];

  // 단계 관리
  const [step, setStep] = useState(1);
  const [consensusChoice, setConsensusChoice] = useState(null);
  const [statusData, setStatusData]           = useState(null);
  const [conf, setConf]                       = useState(0);
  const pct = conf ? ((conf - 1) / 4) * 100 : 0;

  // 합의 상태 폴링
  useEffect(() => {
    let timer;
    const poll = async () => {
      try {
        const res = await axiosInstance.get(
          `/rooms/${roomCode}/rounds/${round}/status`
        );
        setStatusData(res.data);
        if (!res.data.consensus_completed) {
          timer = setTimeout(poll, 2000);
        }
      } catch {
        timer = setTimeout(poll, 5000);
      }
    };
    if (step === 1) poll();
    return () => clearTimeout(timer);
  }, [roomCode, round, step]);

  // Step1: 합의 선택
  const handleConsensus = async (choice) => {
    if (!isHost) {
      alert(' 합의 선택은 호스트만 가능합니다.');
      return;
    }
    const intChoice = choice === 'agree' ? 1 : 2;
    setConsensusChoice(choice);
    try {
      await axiosInstance.post(
        `/rooms/rooms/round/${roomCode}/consensus`,
        { round_number: round, choice: intChoice }
      );
    } catch (err) {
      console.error('합의 전송 중 오류:', err);
    }
  };

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

  
  // Step1 Continue
  const handleStep1Continue = () => {
    if (!isHost) {
      alert('⚠️ 호스트만 다음 단계로 진행할 수 있습니다.');
      return;
    }
    sendNextPage();
  };

  // Step2: 합의 확신도
  const submitConfidence = async () => {
    if (!isHost) {
      alert('⚠️ 확신도 제출은 호스트만 가능합니다.');
      return;
    }
    try {
      await axiosInstance.post(
        `/rooms/rooms/round/${roomCode}/consensus/confidence`,
        { round_number: round, confidence: conf }
      );
      // const nextRoute = consensusChoice === 'agree' ? '/game06' : '/game07';
      // nav(nextRoute, { state: { consensus: consensusChoice } });
      sendNextPage(); // 모든 유저가 game06 또는 game07로 navigate
    } catch (err) {
      console.error('확신 전송 중 오류:', err);
    }
  };

  return (
    <Layout subtopic={subtopic} round={round} >
    
      {step === 1 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            {[neutralLast, agreeLast].map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`설명 이미지 ${idx + 1}`}
                style={{ width: 400, height: 180, objectFit: 'fill' }}
              />
            ))}
          </div>

          <Card width={936} height={216} extraTop={60}>
            <p style={title}>
              당신은 <strong>{roleName}</strong>입니다. 합의 선택을 진행하시겠습니까?
            </p>
            <div style={{ display: 'flex', gap: 24 }}>
              <SelectCardToggle
                label="동의"
                selected={consensusChoice === 'agree'}
                onClick={() => handleConsensus('agree')}
                width={220}
                height={56}
              />
              <SelectCardToggle
                label="비동의"
                selected={consensusChoice === 'disagree'}
                onClick={() => handleConsensus('disagree')}
                width={220}
                height={56}
              />
            </div>
          </Card>

          <div style={{ marginTop: 40 }}>
            <Continue
              width={264}
              height={72}
              disabled={!statusData?.consensus_completed}
              onClick={handleStep1Continue}
            />
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <Card width={936} height={216} extraTop={150}>
            <p style={title}>합의된 결정에 얼마나 확신이 있나요?</p>
            <div style={{ position: 'relative', width: '80%', minWidth: 300}}>
              <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: LINE, background: Colors.grey03 }} />
              <div style={{ position: 'absolute', top: 12, left: 0, width: `${pct}%`, height: LINE, background: Colors.brandPrimary }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {[1, 2, 3, 4, 5].map((n) => {
                  const isNow = conf === n;
                  const passed = conf > n;
                  return (
                    <div key={n} style={{ textAlign: 'center' }}>
                      <div
                        onClick={() => setConf(n)}
                        style={{
                          width: CIRCLE,
                          height: CIRCLE,
                          borderRadius: '50%',
                          background: isNow ? Colors.grey01 : passed ? Colors.brandPrimary : Colors.grey03,
                          border: `${BORDER}px solid ${isNow ? Colors.brandPrimary : 'transparent'}`,
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
