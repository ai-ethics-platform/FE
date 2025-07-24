import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import ContentTextBox from '../components/ContentTextBox';
import character1 from '../assets/images/character1.png';
import character2 from '../assets/images/character2.png';
import character3 from '../assets/images/character3.png';

import axiosInstance from '../api/axiosInstance';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import { useWebRTC } from '../WebRTCProvider';
import { useWebSocket } from '../WebSocketProvider';
import { 
  useWebSocketNavigation, 
  useHostActions 
} from '../hooks/useWebSocketMessage';

export default function SelectHomeMate() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(null);
  const [hostId, setHostId] = useState(null);
  const [myRoleId, setMyRoleId] = useState(null);

  // WebSocket과 WebRTC 상태 가져오기
  const { voiceSessionStatus, isInitialized: webrtcInitialized } = useWebRTC();
  const { isConnected: websocketConnected } = useWebSocket();

  //  커스텀 훅들 사용 
  const { isHost, sendNextPage } = useHostActions();
  
  //  페이지 이동 메시지 핸들러 
  useWebSocketNavigation(navigate, {
    nextPagePath: '/matename' 
  });

  // 연결 상태 모니터링
  const [connectionStatus, setConnectionStatus] = useState({
    websocket: false,
    webrtc: false,
    ready: false
  });

  // 역할별 사용자 ID 매핑
  const [roleUserMapping, setRoleUserMapping] = useState({
    role1_user_id: null,
    role2_user_id: null,
    role3_user_id: null,
  });

  // 음성 상태 관리 for others
  //const { voiceStates, getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);

  // 컴포넌트 초기화
  useEffect(() => {
    const storedHost = localStorage.getItem('host_id');
    const storedMyRole = localStorage.getItem('myrole_id');
    const role1 = localStorage.getItem('role1_user_id');
    const role2 = localStorage.getItem('role2_user_id');
    const role3 = localStorage.getItem('role3_user_id');

    setHostId(storedHost);
    setMyRoleId(storedMyRole);
    setRoleUserMapping({
      role1_user_id: role1,
      role2_user_id: role2,
      role3_user_id: role3,
    });

    console.log(' [SelectHomeMate] 초기화 완료:', {
      hostId: storedHost,
      myRoleId: storedMyRole,
      roleMapping: { role1, role2, role3 },
      isHost: storedHost === storedMyRole
    });
  }, []);

  //  연결 상태 모니터링
  useEffect(() => {
    const newStatus = {
      websocket: websocketConnected,
      webrtc: webrtcInitialized,
      ready: websocketConnected && webrtcInitialized
    };

    setConnectionStatus(newStatus);

    console.log('🔧 [SelectHomeMate] 연결 상태 업데이트:', newStatus);
  }, [websocketConnected, webrtcInitialized]);

  // 특정 역할의 음성 상태 (내 것은 WebRTC, 다른 사람은 WebSocket)
  // const getVoiceStateForRoleWithMyStatus = (roleId) => {
  //   if (String(roleId) === myRoleId) {
  //     return {
  //       is_speaking: voiceSessionStatus.isSpeaking,
  //       is_mic_on: voiceSessionStatus.isConnected,
  //       nickname: voiceSessionStatus.nickname || ''
  //     };
  //   }
  //   return getVoiceStateForRole(roleId);
  // };

  const paragraphs = [
    {
      main: '  여러분이 생각하는 HomeMate는 어떤 형태인가요?',
      sub: isHost 
        ? '(함께 토론한 후 방장이 선택하고, "다음" 버튼을 클릭해주세요)' 
        : '(방장이 캐릭터를 선택할 때까지 기다려주세요)',
    },
  ];

  const images = [character1, character2, character3];

  // 방장 전용 캐릭터 선택 핸들러
  const handleCharacterSelect = (idx) => {
    if (!isHost) {
      console.log(' [SelectHomeMate] 방장이 아니므로 캐릭터 선택 불가');
      alert('방장만 캐릭터를 선택할 수 있습니다.');
      return;
    }
    
    setActiveIndex(idx);
    console.log(`[SelectHomeMate] 방장이 캐릭터 ${idx + 1} 선택`);
  };

  //  방장 전용 다음 버튼 핸들러 
  const handleContinue = async () => {
    console.log(' [SelectHomeMate] 다음 버튼 클릭');

    //  방장이 아닌 경우 차단
    if (!isHost) {
      alert('방장만 게임을 진행할 수 있습니다.');
      return;
    }

    //  캐릭터 선택 확인
    if (activeIndex === null) {
      alert('캐릭터를 먼저 선택해주세요!');
      return;
    }

    //  연결 상태 확인
    if (!connectionStatus.ready) {
      console.warn('[SelectHomeMate] 연결이 완전하지 않음:', connectionStatus);
      alert('연결 상태를 확인하고 다시 시도해주세요.');
      return;
    }

    const roomCode = localStorage.getItem('room_code');
    if (!roomCode) {
      alert('room_code가 없습니다. 방에 먼저 입장하세요.');
      return;
    }

    try {
      console.log('[SelectHomeMate] AI 선택 요청:', {
        roomCode,
        aiType: activeIndex + 1,
        connectionStatus
      });

      const { data } = await axiosInstance.post('/rooms/ai-select', {
        room_code: roomCode,
        ai_type: activeIndex + 1,
      });
      
      console.log(' [SelectHomeMate] AI 선택 응답:', data);
      localStorage.setItem('selectedCharacterIndex', String(activeIndex));

      const success = sendNextPage();
    
  
    } catch (err) {
      console.error(' [SelectHomeMate] AI 선택 실패:', err);
      if (err.response) {
        alert(`오류: ${JSON.stringify(err.response.data)}`);
      } else {
        alert('네트워크 오류 또는 서버 문제');
      }
     
    }
  };

  return (
    <Background bgIndex={2}>
      {/* 🔧 연결 상태 디버깅 정보 */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '12px',
        borderRadius: '6px',
        fontSize: '11px',
        zIndex: 1000,
        maxWidth: '350px',
        fontFamily: 'monospace'
      }}>
        <div style={{color: '#00ff00'}}>🔍 [SelectHomeMate] 연결 상태</div>
        <div style={{color: connectionStatus.websocket ? '#00ff00' : '#ff0000'}}>
          WebSocket: {connectionStatus.websocket ? '✅ Connected' : '❌ Disconnected'}
        </div>
        <div style={{color: connectionStatus.webrtc ? '#00ff00' : '#ff0000'}}>
          WebRTC: {connectionStatus.webrtc ? '✅ Initialized' : '❌ Not Ready'}
        </div>
        <div style={{color: connectionStatus.ready ? '#00ff00' : '#ff0000'}}>
          Overall: {connectionStatus.ready ? '✅ Ready' : '⚠️ Not Ready'}
        </div>
        <div style={{color: '#ffff00'}}>
          내 역할: {myRoleId || 'NULL'}
        </div>
        <div style={{color: '#ff00ff'}}>
          호스트 역할: {hostId || 'NULL'} {isHost ? '👑' : ''}
        </div>
        <div style={{color: voiceSessionStatus.isSpeaking ? '#00ff00' : '#888888'}}>
          내 음성: {voiceSessionStatus.isSpeaking ? '🗣️ 말하는 중' : '🤐 조용함'}
        </div>
        <div style={{color: '#ffdddd'}}>
          🔧 방장 전용 + 브로드캐스트 적용됨
        </div>
        {!isHost && (
          <div style={{color: '#ffaa00'}}>
            ⏳ 방장의 선택을 기다리는 중...
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        <div style={{
          position: 'fixed',
          top: '32.5%',
          left: 0,
          transform: 'translateY(-50%)',
          width: 220,
          padding: '20px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          alignItems: 'flex-start',
        }}>
          <UserProfile
            player="1P"
            isLeader={hostId === '1'}
            isMe={myRoleId === '1'}
              />
          <UserProfile
            player="2P"
            isLeader={hostId === '2'}
            isMe={myRoleId === '2'}
               />
          <UserProfile
            player="3P"
            isLeader={hostId === '3'}
            isMe={myRoleId === '3'}
               />
        </div>

        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80vw',
          maxWidth: 936,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: 24 }}>
            {images.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Character ${idx + 1}`}
                onClick={() => handleCharacterSelect(idx)} 
                style={{
                  width: 264,
                  height: 360,
                  objectFit: 'cover',
                  borderRadius: 4,
                  cursor: isHost ? 'pointer' : 'not-allowed', 
                  border: activeIndex === idx ? `2px solid #354750` : 'none',
                  transform: activeIndex === idx ? 'scale(1.01)' : 'scale(1)',
                  transition: 'all 0.2s ease-in-out',
                  opacity: isHost ? 1 : 0.7,
                  filter: isHost ? 'none' : 'grayscale(30%)', 
                }}
              />
            ))}
          </div>

          <div style={{ marginTop: 14, width: '100%' }}>
            <ContentTextBox
              paragraphs={paragraphs}
              onContinue={handleContinue}
            />
          </div>
        </div>
      </div>
    </Background>
  );
}