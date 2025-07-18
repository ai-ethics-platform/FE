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
  const title = localStorage.getItem('title');

  const paragraphs = [
    {
      main: (() => {
        switch (title) {
          case '가정':
            return `지금부터 여러분은 ${mateName}를 사용하게 된 가정집의 구성원들입니다. 여러분은 가정에서 ${mateName}를 사용하며 일어나는 일에 대해 함께 논의하여 결정할 것입니다. \n 먼저, 역할을 확인하세요.`;
          case '국가 인공지능 위원회':
            return `비록 몇몇 문제들이 있었지만 ${mateName}의 편의성 덕분에 이후 우리 가정 뿐 아니라 여러 가정에서 ${mateName}를 사용하게 되었습니다. 이후, 가정 뿐 아니라 국가적인 고민거리들이 나타나게 되어 국가 인공지능 위원회에서는 긴급 회의를 소집했습니다. 국가 인공지능 위원회는 인공지능 산업 육성 및 규제 방안에 대해 논의하는 위원회입니다. 여러분은 ${mateName}와 관련된 국가적 규제에 대해 함께 논의하여 결정할 대표들입니다. \n 먼저, 역할을 확인하세요.`;
          case '국제 인류 발전 위원회':
            return `국내에서 몇몇 규제 관련 논의가 있었지만, A사의 로봇 ${mateName}는 결국 전 세계로 진출했습니다. 이제 ${mateName} 뿐 아니라 세계의 여러 로봇 회사에서 비슷한 가정용 로봇을 생산하고 나섰습니다. 이에 국제 평화를 위한 논의와 규제가 이루어지는 인류 발전 위원회에서는 세계의 가정용 로봇 사용과 관련하여 발생한 문제에 대해 회의를 열었습니다. 여러분은 인류 발전 위원회 회의장에 참석한 대표들입니다. \n 먼저, 역할을 확인하세요.`;
          default:
            return mateName
              ? `지금부터 여러분은 ${mateName}를 사용하게 됩니다. 다양한 장소에서 어떻게 쓸지 함께 논의해요.`
              : 'AI 이름을 불러오는 중입니다...';
        }
      })()
    }
  ];

  if (isLoading) {
    return (
      <Layout round={round} subtopic={subtopic} nodescription={true} >
        <div style={{height:400, display:'flex',justifyContent:'center',alignItems:'center'}}>로딩 중...</div>
      </Layout>
    );
  }

  return (
    <Layout round={round} subtopic={subtopic} nodescription={true}  >
      
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