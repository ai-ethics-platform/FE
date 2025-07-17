// pages/Game01.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox';
import UserProfile from '../components/Userprofile';

import character1 from '../assets/images/Char1.jpg';
import character2 from '../assets/images/Char2.jpg';
import character3 from '../assets/images/Char3.jpg';

import axiosInstance from '../api/axiosInstance';
import { fetchWithAutoToken } from '../utils/fetchWithAutoToken';
import { useWebSocket } from '../WebSocketProvider';
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';
import { useWebRTC } from '../WebRTCProvider';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import voiceManager from '../utils/voiceManager';

export default function Game01() {
  const navigate = useNavigate();
  const { isConnected, sessionId, sendMessage } = useWebSocket();
  const myRoleId = localStorage.getItem('myrole_id');

  console.log('🎮 Game01 렌더링:', { isConnected, sessionId });

  const { isHost, sendNextPage } = useHostActions();
  useWebSocketNavigation(navigate, {
    infoPath: `/character_description${myRoleId}`,
    nextPagePath: `/character_description${myRoleId}`
  });

  const images = [character1, character2, character3];
  const subtopic = localStorage.getItem('subtopic');
  const roomCode = localStorage.getItem('room_code');
  const nickname = localStorage.getItem('nickname') || 'Guest';

  const [mateName, setMateName] = useState('');
  const [round, setRound] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetchedAiName = useRef(false);
  const hasJoined = useRef(false);

  // WebRTC 및 WebSocket 음성 상태
  const { voiceSessionStatus, roleUserMapping, myRoleId: rtcRole } = useWebRTC();
  const { getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);
  const getVoiceState = (role) => {
    if (String(role) === rtcRole) {
      return {
        is_speaking: voiceSessionStatus.isSpeaking,
        is_mic_on: voiceSessionStatus.isConnected,
        nickname: voiceSessionStatus.nickname || ''
      };
    }
    return getVoiceStateForRole(role);
  };

  // 1. 라운드 계산
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const nextRound = completed.length + 1;
    setRound(nextRound);
    localStorage.setItem('currentRound', String(nextRound));
  }, []);

  // 2. AI 이름 셋업
  useEffect(() => {
    if (hasFetchedAiName.current) return;
    const stored = localStorage.getItem('mateName');
    if (stored) {
      setMateName(stored);
      hasFetchedAiName.current = true;
      setIsLoading(false);
    } else {
      (async () => {
        try {
          await fetchWithAutoToken();
          const res = await axiosInstance.get('/rooms/ai-name', { params: { room_code: roomCode } });
          setMateName(res.data.ai_name);
          localStorage.setItem('mateName', res.data.ai_name);
        } catch (e) {
          console.error('❌ AI 이름 불러오기 실패', e);
        } finally {
          hasFetchedAiName.current = true;
          setIsLoading(false);
        }
      })();
    }
  }, [roomCode]);

  // 3. Join 메시지
  useEffect(() => {
    if (isConnected && sessionId && !hasJoined.current) {
      sendMessage({ type: 'join', participant_id: Number(myRoleId), nickname });
      hasJoined.current = true;
    }
  }, [isConnected, sessionId, sendMessage, myRoleId, nickname]);

  // 4. 디버그용 음성 세션 상태 확인
  useEffect(() => {
    const status = voiceManager.getStatus();
    console.log('🎤 음성 상태:', status);
  }, []);

  // Continue
  const handleContinue = () => {
    if (isHost) sendNextPage();
    else alert('⚠️ 방장만 진행할 수 있습니다.');
  };

  const paragraphs = [
    { main: mateName
        ? `지금부터 여러분은 ${mateName}를 사용하게 됩니다. 다양한 장소에서 어떻게 쓸지 함께 논의해요.`
        : 'AI 이름을 불러오는 중입니다...' }
  ];

  if (isLoading) {
    return (
      <Layout round={round} subtopic={subtopic} me="1P">
        <div style={{height:400, display:'flex',justifyContent:'center',alignItems:'center'}}>로딩 중...</div>
      </Layout>
    );
  }

  return (
    <Layout round={round} subtopic={subtopic} me="1P">
      

      {/* 본문 */}
      <div style={{display:'flex',gap:24,flexWrap:'wrap',justifyContent:'center'}}>
        {images.map((src,i)=>(
          <img key={i} src={src} alt='' style={{width:264,height:360,objectFit:'cover',borderRadius:4}}/>
        ))}
      </div>
      <div style={{width:'100%',maxWidth:900}}>
        <ContentTextBox paragraphs={paragraphs} onContinue={handleContinue} />
      </div>
    </Layout>
  );
}