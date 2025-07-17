import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import SelectCardToggle from '../components/SelectButton';
import Continue from '../components/Continue2';
import contentBoxFrame from '../assets/contentBox4.svg';
import { Colors, FontStyles } from '../components/styleConstants';

import { getDilemmaImages } from '../components/dilemmaImageLoader';
import axiosInstance from '../api/axiosInstance';
import { fetchWithAutoToken } from '../utils/fetchWithAutoToken';
import { useHostActions } from '../hooks/useWebSocketMessage';

// 🆕 WebRTC Hooks
import { useWebRTC } from '../WebRTCProvider';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import UserProfile from '../components/Userprofile';

const CARD_W = 640;
const CARD_H = 170;
const CIRCLE = 16;
const BORDER = 2;
const LINE = 3;

export default function Game05_01() {
  const nav = useNavigate();
  const pollingRef = useRef(null);

  // WebSocket host actions
  const { isHost } = useHostActions();

  // WebRTC 음성 상태
  const { voiceSessionStatus, roleUserMapping, myRoleId: rtcRole } = useWebRTC();
  const { getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);
  const getVoiceState = (role) => {
    if (String(role) === rtcRole) {
      return {
        is_speaking: voiceSessionStatus.isSpeaking,
        is_mic_on:    voiceSessionStatus.isConnected,
        nickname:     voiceSessionStatus.nickname || ''
      };
    }
    return getVoiceStateForRole(role);
  };

  // 로컬 저장값
  const roleId        = Number(localStorage.getItem('myrole_id'));
  const roomCode      = localStorage.getItem('room_code') ?? '';
  const mainTopic     = localStorage.getItem('category') ?? '안드로이드';
  const subtopic      = localStorage.getItem('subtopic') ?? '가정 1';
  const selectedIndex = Number(localStorage.getItem('selectedCharacterIndex') ?? 0);

  // 라운드 계산
  const [round, setRound] = useState(1);
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const r = completed.length + 1;
    setRound(r);
    localStorage.setItem('currentRound', String(r));
    return () => clearTimeout(pollingRef.current);
  }, []);

  // 역할명
  const roleNames = { 1: '요양보호사 K', 2: '노모 L', 3: '자녀 J' };
  const roleName  = roleNames[roleId] || '참여자';

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
        await fetchWithAutoToken();
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
      alert('⚠️ 합의 선택은 호스트만 가능합니다.');
      return;
    }
    const intChoice = choice === 'agree' ? 1 : 2;
    setConsensusChoice(choice);
    try {
      await fetchWithAutoToken();
      await axiosInstance.post(
        `/rooms/rooms/round/${roomCode}/consensus`,
        { round_number: round, choice: intChoice }
      );
    } catch (err) {
      console.error('합의 전송 중 오류:', err);
    }
  };

  // Step1 Continue (다음 단계)
  const handleStep1Continue = () => {
    if (!isHost) {
      alert('⚠️ 호스트만 다음 단계로 진행할 수 있습니다.');
      return;
    }
    setStep(2);
  };

  // Step2: 합의 확신도
  const submitConfidence = async () => {
    if (!isHost) {
      alert('⚠️ 확신도 제출은 호스트만 가능합니다.');
      return;
    }
    try {
      await fetchWithAutoToken();
      await axiosInstance.post(
        `/rooms/rooms/round/${roomCode}/consensus/confidence`,
        { round_number: round, confidence: conf }
      );
      const nextRoute = consensusChoice === 'agree' ? '/game06' : '/game07';
      nav(nextRoute, { state: { consensus: consensusChoice } });
    } catch (err) {
      console.error('확신 전송 중 오류:', err);
    }
  };

  return (
    <Layout subtopic={subtopic} round={round} me="3P">
    
      {step === 1 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginLeft: 240 }}>
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
              Q1) 당신은 <strong>{roleName}</strong>입니다. 합의 선택을 진행하시겠습니까?
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

          <div style={{ marginTop: 40, marginLeft: 240 }}>
            <Continue
              width={264}
              height={72}
              step={1}
              disabled={!statusData?.consensus_completed}
              onClick={handleStep1Continue}
            />
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <Card width={936} height={216} extraTop={150}>
            <p style={title}>Q2) 합의된 결정에 얼마나 확신이 있나요?</p>
            <div style={{ position: 'relative', width: '80%', minWidth: 300, marginLeft: 240 }}>
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

          <div style={{ marginTop: 80, textAlign: 'center', marginLeft: 240 }}>
            <Continue
              width={264}
              height={72}
              step={2}
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
