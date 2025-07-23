// pages/GameMap.jsx
import React, { useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import GameMapFrame from '../components/GameMapFrame';
import UserProfile from '../components/Userprofile';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';

import homeIcon from '../assets/homeIcon.svg';
import aiIcon from '../assets/aiIcon.svg';
import internationalIcon from '../assets/internationalIcon.svg';
import { useWebRTC } from '../WebRTCProvider';
import { useWebSocket } from '../WebSocketProvider';

// 🔥 커스텀 훅 임포트 (SelectHomeMate와 동일)
import { 
  useWebSocketNavigation, 
  useHostActions 
} from '../hooks/useWebSocketMessage';

export default function GameMap() {
  const navigate = useNavigate();
  const subtopic = '라운드 선택';
  const round = Number(localStorage.getItem('currentRound') ?? 1);
  // WebSocket과 WebRTC 상태 가져오기
  const { voiceSessionStatus, isInitialized: webrtcInitialized } = useWebRTC();
  const { isConnected: websocketConnected } = useWebSocket();


    // 🔥 커스텀 훅들 사용 (SelectHomeMate와 동일)
    const { isHost, sendNextPage } = useHostActions();
    
    // 🔥 페이지 이동 메시지 핸들러 (useWebSocketNavigation 사용)
    useWebSocketNavigation(navigate, {
      nextPagePath: '/game01'  // 다음 페이지 경로
    });
    
    // 🔧 연결 상태 모니터링
      const [connectionStatus, setConnectionStatus] = useState({
        websocket: false,
        webrtc: false,
        ready: false
      });

 // 🔧 연결 상태 모니터링
  useEffect(() => {
    const newStatus = {
      websocket: websocketConnected,
      webrtc: webrtcInitialized,
      ready: websocketConnected && webrtcInitialized
    };

    setConnectionStatus(newStatus);

    console.log('🔧 [Gamemap] 연결 상태 업데이트:', newStatus);
  }, [websocketConnected, webrtcInitialized]);
 // const { getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);

  // // 나 및 다른 참가자의 음성 상태
  // const getVoiceState = (roleId) => {
  //   if (String(roleId) === myRoleId) {
  //     return {
  //       is_speaking: voiceSessionStatus.isSpeaking,
  //       is_mic_on: voiceSessionStatus.isConnected,
  //       nickname: voiceSessionStatus.nickname || ''
  //     };
  //   }
  //   return getVoiceStateForRole(roleId);
  // };

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = orig; };
  }, []);

  const handleSelect = (topic,title) => {
    const category = localStorage.getItem('category') || '안드로이드';
    const mode = 'neutral';
    localStorage.setItem('title', title);
    localStorage.setItem('category', category);
    localStorage.setItem('subtopic', topic);
    localStorage.setItem('mode', mode);
    // 2. AI 이름 저장 성공 후 next_page 브로드캐스트 전송
    console.log('👑 [GameMap] 방장이므로 next_page 브로드캐스트 전송');
    navigate('/game01');
  };

  const completedTopics = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
  const isCompleted = (name) => completedTopics.includes(name);

  const getUnlockedOptions = () => {
    const unlocked = new Set(['가정 1']);
    if (isCompleted('가정 1')) {
      unlocked.add('가정 2');
      unlocked.add('국가 인공지능 위원회 1');
    }
    if (isCompleted('국가 인공지능 위원회 1')) {
      unlocked.add('국가 인공지능 위원회 2');
      unlocked.add('국제 인류 발전 위원회 1');
    }
    return unlocked;
  };

  const unlockedOptions = getUnlockedOptions();
  const createOption = (text,title) => ({
    text,
    disabled: !unlockedOptions.has(text),
    onClick: () => handleSelect(text,title)
  });

  return (
    <Layout subtopic={subtopic} nodescription={true}>

      {/* 메인 맵 프레임 */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 8, marginLeft: 60, marginTop: 12, zIndex: 1 }}>
        <GameMapFrame
          icon={homeIcon}
          title="가정"
          option1={createOption('가정 1','가정')}
          option2={createOption('가정 2','가정')}
        />
        <GameMapFrame
          icon={aiIcon}
          title="국가 인공지능 위원회"
          option1={createOption('국가 인공지능 위원회 1','국가 인공지능 위원회')}
          option2={createOption('국가 인공지능 위원회 2','국가 인공지능 위원회')}
        />
        <GameMapFrame
          icon={internationalIcon}
          title="국제 인류발전 위원회"
          option1={createOption('국제 인류 발전 위원회 1','국제 인류 발전 위원회')}
        />
      </div>
    </Layout>
  );
}
