import React, { useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout      from '../components/Layout';
import ContentBox2 from '../components/ContentBox2';
import UserProfile from '../components/Userprofile';

import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider';
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';

import voiceManager from '../utils/voiceManager';

const fullText =
  '  여러분의 결정으로 가정용 로봇은 보다 정확한 서비스를 제공하였고, 여러분의 친구처럼 제 역할을 다하고 있습니다.';

export default function Game09() {
  const navigate = useNavigate();
  const subtopic = '다른 사람들이 선택한 미래';

   const { isConnected, sessionId, sendMessage } = useWebSocket();
   const { voiceSessionStatus, isInitialized: webrtcInitialized } = useWebRTC();
   const { isHost } = useHostActions();
    const [connectionStatus, setConnectionStatus] = useState({
     websocket: false,
     webrtc: false,
     ready: false
   });
 useWebSocketNavigation(navigate, {
    infoPath: `/game09`,
    nextPagePath: `/game09`
  });
  useEffect(() => {
     const newStatus = {
       websocket: isConnected,
       webrtc: webrtcInitialized,
       ready: isConnected && webrtcInitialized
     };
     setConnectionStatus(newStatus);
   
     console.log(' [Game09] 연결 상태 업데이트:', newStatus);
   }, [isConnected, webrtcInitialized]);  
  
   function clearGameSession() {
    [
      'myrole_id',
      'host_id',
      'user_id',
      'role1_user_id',
      'role2_user_id',
      'role3_user_id',
      'room_code',
      'category',
      'subtopic',
      'mode',
      'access_token',
      'refresh_token',
      'mataName',
      'nickname',
      'title',
      'completedTopics',
      'session_id',
      'selectedCharacterIndex',
      'currentRound',
      'completedTopics'
    ].forEach(key => localStorage.removeItem(key));
  }

  
  // leave WebRTC session on unmount
  useEffect(() => {
    return () => {
      clearGameSession();
      voiceManager.leaveSession()
        .then(success => {
          if (success) console.log('🛑 음성 세션에서 나감 완료');
          else console.warn('⚠️ 음성 세션 나가기 실패');
        });
    };
  }, []);

  return (
    <Layout subtopic={subtopic} >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
        }}
      >
        <ContentBox2 text={fullText} width={936} height={107} />
      </div>
    </Layout>
  );
}