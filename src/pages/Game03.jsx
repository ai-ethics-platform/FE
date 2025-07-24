// pages/Game03.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import SelectCardToggle from '../components/SelectButton';
import Continue from '../components/Continue';
import contentBoxFrame from '../assets/contentBox4.svg';
import { Colors, FontStyles } from '../components/styleConstants';

import { getDilemmaImages } from '../components/dilemmaImageLoader';
import axiosInstance from '../api/axiosInstance';
import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider';
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';

import UserProfile from '../components/Userprofile';

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
  const subtopic      = localStorage.getItem('subtopic') ?? '가정 1';
  const mode          = 'neutral';
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
  const comicImages = getDilemmaImages(category, subtopic, mode, selectedIndex);

  // 상태
  const [step, setStep]         = useState(1);
  const [agree, setAgree]       = useState(null);
  const [conf, setConf]         = useState(0);
  const [isWaiting, setWaiting] = useState(false);
  const pct = conf ? ((conf - 1) / 4) * 100 : 0;

  const [round, setRound] = useState(1);
  useEffect(() => {
    const completed  = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const calculated = completed.length + 1;
    setRound(calculated);
    localStorage.setItem('currentRound', calculated.toString());
    return () => clearTimeout(pollingRef.current);
  }, []);

  const { isConnected, sessionId, sendMessage } = useWebSocket();
  const { isInitialized: webrtcInitialized } = useWebRTC();
  const { isHost, sendNextPage } = useHostActions();
  useWebSocketNavigation(nav, { nextPagePath: '/game04', infoPath: '/game04' });
  
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
    console.log('🔧 [Game03] 연결 상태 업데이트:', newStatus);
  }, [isConnected, webrtcInitialized]);
  
  // step 1: 개인 동의/비동의 POST 후 consensus 폴링 시작
  const handleSubmitChoice = async () => {
    const choiceInt = agree === 'agree' ? 1 : 2;
    try {
      setWaiting(true);
      await axiosInstance.post(
        `/rooms/rooms/round/${roomCode}/choice`,
        { round_number: round, choice: choiceInt }
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
        { round_number: round, confidence: conf }
      );
      nav('/game04');
      } catch (err) {
      console.error('확신 전송 중 오류:', err);
    }
  };

  return (
    <Layout subtopic={subtopic} round={round}>
      {step === 1 && (
        <>
          <div style={{ display:'flex', justifyContent:'center', gap:16 }}>
            {comicImages.map((img, idx) => (
              <img key={idx} src={img} alt={`설명 이미지 ${idx+1}`} style={{ width:230, height:135.38, objectFit:'contain' }} />
            ))}
          </div>

          <Card width={936} height={216} extraTop={60} >
            <p style={title}>
              당신은 {roleName}입니다. 24시간 개인정보 수집 업데이트에 동의하시겠습니까?
            </p>
            <div style={{ display:'flex', gap:24 }}>
              <SelectCardToggle label="동의" selected={agree==='agree'} onClick={()=>setAgree('agree')} width={220} height={56} />
              <SelectCardToggle label="비동의" selected={agree==='disagree'} onClick={()=>setAgree('disagree')} width={220} height={56} />
            </div>
          </Card>
          <div style={{ marginTop:40, textAlign:'center' }}>
            {isWaiting
              ? <p>다른 플레이어 선택을 기다리는 중…</p>
              : <Continue width={264} height={72} step={1} disabled={!agree} onClick={handleSubmitChoice} />
            }
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <Card width={936} height={216} extraTop={150} >
            <p style={title}>당신의 선택에 얼마나 확신이 있나요?</p>
            <div style={{ position:'relative', width:'80%', minWidth:300 }}>
              <div style={{ position:'absolute', top:12, left:0, right:0, height:LINE, background:Colors.grey03 }} />
              <div style={{ position:'absolute', top:12, left:0, width:`${pct}%`, height:LINE, background:Colors.brandPrimary }} />
              <div style={{ position:'relative', display:'flex', justifyContent:'space-between' }}>
                {[1,2,3,4,5].map(n => {
                  const isNow = conf===n;
                  const passed = conf>n;
                  return (
                    <div key={n} style={{ textAlign:'center' }}>
                      <div onClick={()=>setConf(n)} style={{ width:CIRCLE, height:CIRCLE, borderRadius:'50%', background: isNow?Colors.grey01:passed?Colors.brandPrimary:Colors.grey03, border:`${BORDER}px solid ${isNow?Colors.brandPrimary:'transparent'}`, cursor:'pointer', margin:'0 auto' }} />
                      <span style={{...FontStyles.caption,color:Colors.grey06,marginTop:4,display:'inline-block'}}>{n}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
          <div style={{ marginTop:80 }}>
            <Continue width={264} height={72} step={2} disabled={conf===0} onClick={handleSubmitConfidence} />
          </div>
        </>
      )}
    </Layout>
  );
}

function Card({ children, extraTop=0, width=CARD_W, height=CARD_H, style={} }) {
  return (
    <div style={{ width, height, marginTop:extraTop, position:'relative', ...style }}>
      <img src={contentBoxFrame} alt="" style={{ width:'100%', height:'100%', objectFit:'fill' }} />
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', gap:24, padding:'0 24px' }}>
        {children}
      </div>
    </div>
  );
}

const title = { ...FontStyles.title, color:Colors.grey06, textAlign:'center' };
