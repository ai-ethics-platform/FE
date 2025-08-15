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
import { 
  useWebSocketNavigation, 
  useHostActions 
} from '../hooks/useWebSocketMessage';
import { FontStyles,Colors } from '../components/styleConstants';
export default function GameMap() {
  const navigate = useNavigate();
  const subtopic = '라운드 선택';
  const round = Number(localStorage.getItem('currentRound') ?? 1);
  // WebSocket과 WebRTC 상태 가져오기
  const { voiceSessionStatus, isInitialized: webrtcInitialized } = useWebRTC();
  const { isConnected: websocketConnected } = useWebSocket();
  const { isHost, sendNextPage } = useHostActions();
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
    const prevTitle = localStorage.getItem('title');
    const category = localStorage.getItem('category') || '안드로이드';
    const mode = 'neutral';
    localStorage.setItem('title', title);
    localStorage.setItem('category', category);
    localStorage.setItem('subtopic', topic);
    localStorage.setItem('mode', mode);
   
      //  이전 title과 같으면 game02, 다르면 game01
    const nextPage = prevTitle === title ? '/game02' : '/game01';

    console.log(` [GameMap] ${prevTitle === title ? '같은 주제 재선택' : '새 주제 선택'} → ${nextPage}로 이동`);
    navigate(nextPage);

  };

  const completedTopics = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
  const isCompleted = (name) => completedTopics.includes(name);

  const getUnlockedOptions = () => {
    const unlocked = new Set(['AI의 개인 정보 수집']);
    if (isCompleted('AI의 개인 정보 수집')) {
      unlocked.add('안드로이드의 감정 표현');
      unlocked.add('아이들을 위한 서비스');
    }
    if (isCompleted('아이들을 위한 서비스')) {
      unlocked.add('설명 가능한 AI');
      unlocked.add('지구, 인간, AI');
    }
    return unlocked;
  };

  const unlockedOptions = getUnlockedOptions();
  // const createOption = (text,title) => ({
  //   text,
  //   disabled: !unlockedOptions.has(text),
  //   onClick: () => handleSelect(text,title)
  // });

  const createOption = (text, title) => {
    const isDone = completedTopics.includes(text);
    const isUnlocked = unlockedOptions.has(text);
  
    return {
      text,
      disabled: isDone,
      locked: !isUnlocked,
      onClick: () => {
        if (!isDone && isUnlocked) handleSelect(text, title);
      },
    };
  };
  
//  GameMapFrame 해금 조건
const isHomeUnlocked = true;
const isNationalUnlocked = isCompleted('AI의 개인 정보 수집');
const isInternationalUnlocked = isCompleted('아이들을 위한 서비스');
  return (
    <Layout subtopic={subtopic} nodescription={true} showBackButton={false}>
        <div style={{
            width: 500,
            minHeight: 0,
            ...FontStyles.headlineSmall,
            color: Colors.systemRed,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
          }}>
          합의 후 같은 라운드를 선택하세요.
            </div>
      {/* 메인 맵 프레임 */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 8, marginLeft: 60, marginTop: 12, zIndex: 1 }}>
        <GameMapFrame
          icon={homeIcon}
          title="가정"
          disabled={!isHomeUnlocked} // 항상 false
          option1={createOption('AI의 개인 정보 수집','가정')}
          option2={createOption('안드로이드의 감정 표현','가정')}
        />
        <GameMapFrame
          icon={aiIcon}
          title="국가 인공지능 위원회"
          disabled={!isNationalUnlocked} // '가정 1'이 끝나야 true
          option1={createOption('아이들을 위한 서비스','국가 인공지능 위원회')}
          option2={createOption('설명 가능한 AI','국가 인공지능 위원회')}
        />
        <GameMapFrame
          icon={internationalIcon}
          disabled={!isInternationalUnlocked} // '국가 인공지능 위원회 1'이 끝나야 true
          title="국제 인류 발전 위원회"
          option1={createOption('지구, 인간, AI','국제 인류 발전 위원회')}
        />
      </div>
    </Layout>
  );
}
