import { useIsMobile, useIsTablet, useViewportWidth } from '../core/responsive';
import React, { useState, useEffect } from 'react';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import ContentTextBox from '../components/ContentTextBox';
import { useNavigate } from 'react-router-dom';
import gameIntro from '../assets/images/gameintro.png';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import { useWebRTC } from '../WebRTCProvider'; 
import { useWebSocket } from '../WebSocketProvider';
import voiceManager from '../utils/voiceManager';
import { 
  useWebSocketNavigation, 
  useWebSocketMessageAll, 
  useHostActions
} from '../hooks/useWebSocketMessage';

export default function GameIntro2() {
  const m = useIsMobile();
  const tab = useIsTablet();
  const vw = useViewportWidth();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mateName, setMateName] = useState('');
  const [myRoleId, setMyRoleId] = useState(null);
  const [hostId, setHostId] = useState(null);
  const [initStatus, setInitStatus] = useState({
    webSocket: false,
    voiceManager: false,
    webRTC: false
  });

  const { 
    isConnected: wsConnected, 
    sessionId, 
    initializeVoiceWebSocket,
    addMessageHandler,
    removeMessageHandler 
  } = useWebSocket();
  
  const { isHost, sendNextPage } = useHostActions();
  
  useWebSocketNavigation(navigate, { 
    nextPagePath: '/selecthomemate',
    infoPath: '/selecthomemate',
    enableNextPage: true,
    enableInfo: false,
    hostUseInfo: false
  });

  // WebRTC Provider
  const {
    isInitialized: webRTCInitialized,
    signalingConnected,
    peerConnections,
    roleUserMapping,
    myUserId,
    voiceSessionStatus,
    adjustThreshold,
    initializeWebRTC
  } = useWebRTC();

  // 음성 상태 관리
  const { voiceStates, getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);

  useEffect(() => {
    if (!wsConnected) return;

    const storedMyRole = localStorage.getItem('myrole_id');
    const storedHostRole = localStorage.getItem('host_id');
    const isHost = storedMyRole === storedHostRole;


    initializeVoiceWebSocket(isHost)
      .then(() => {
        setInitStatus(s => ({ ...s, webSocket: true }));
      })
      .catch(err => {
        console.error('WS 재연결 실패:', err);
      });

  }, [wsConnected, initializeVoiceWebSocket]);

  useEffect(() => {
    if (!wsConnected || !sessionId) return;

    console.log('🎤 sessionId 확인됨, 음성/WebRTC 초기화 시작');

    // 음성 초기화
    voiceManager.initializeVoiceSession()
      .then(ok => {
        if (!ok) throw new Error('Voice init fail');
        return voiceManager.connectMicrophone();
      })
      .then(() => {
        console.log(' 마이크 연결 완료');
        voiceManager.startSpeechDetection();
        console.log(' 음성 감지 시작 완료');
        setInitStatus(s => ({ ...s, voiceManager: true }));
      })
      .catch(err => {
        console.error(' 음성 초기화 실패:', err);
      });

    // WebRTC 초기화
    initializeWebRTC()
      .then(ok => {
        console.log('WebRTC 초기화 결과:', ok);
        setInitStatus(s => ({ ...s, webRTC: ok }));
        
        if (ok) {
          // 음성 감지 안정화
          setTimeout(() => {
            if (!voiceManager.animationFrame) {
              voiceManager.startSpeechDetection();
            }
          }, 2000);
        }
      })
      .catch(err => {
        console.error('WebRTC 초기화 실패:', err);
      });

  }, [wsConnected, sessionId, initializeWebRTC]);

  // 기본 정보 로드
  useEffect(() => {
    const storedName = localStorage.getItem('mateName');
    const storedMyRole = localStorage.getItem('myrole_id');
    const storedHost = localStorage.getItem('host_id');

    setMateName(storedName || '');
    setMyRoleId(storedMyRole);
    setHostId(storedHost);

    console.log(' GameIntro2 기본 정보 로드:', {
      mateName: storedName,
      myRoleId: storedMyRole,
      hostId: storedHost
    });
  }, []);

  // 메시지 수신 처리
  useEffect(() => {
    if (!wsConnected) return;

    const handlerId = 'gameintro2-handler';
    
    const messageHandler = (message) => {
      console.log(' GameIntro2 메시지 수신:', message.type);
    };
    
    addMessageHandler(handlerId, messageHandler);
    
    return () => {
      removeMessageHandler(handlerId);
    };
  }, [wsConnected, addMessageHandler, removeMessageHandler]);

  // Continue 버튼 클릭 핸들러
  const handleContinue = () => {
    if (isHost) {
      console.log('방장: next_page 메시지 전송');
      sendNextPage();
    } else {
      alert(' 방장만 진행할 수 있습니다.');
    }
  };

  // 디버깅용 메시지 로깅
  const [lastMessage, setLastMessage] = useState(null);
  useWebSocketMessageAll((message) => {
    setLastMessage({
      ...message,
      timestamp: new Date().toLocaleTimeString()
    });
  });

  // VoiceManager 전역 등록
  useEffect(() => {
    window.voiceManager = voiceManager;
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      console.log('🧹 GameIntro2 언마운트 - 음성 감지 중지');
      voiceManager.stopSpeechDetection();
    };
  }, []);

  const paragraphs = [
    {
      main: `  지금은 20XX년, 국내 최대 로봇 개발사 A가 다기능 돌봄 로봇 HomeMate를 개발했습니다.`,
    },
    {
      main:
        `  이 로봇의 기능은 아래와 같습니다.\n` +
        `  • 가족의 감정, 건강 상태, 생활 습관 등을 입력하면 맞춤형 알림, 식단 제안 등의 서비스를 제공\n` +
        `  • 기타 업데이트 시 정교화된 서비스 추가 가능`,
    },
  ];

  return (
    <Background bgIndex={2}>
      {/* 디버그 패널 */}
      <div style={{
        position: 'fixed',
        display: m ? 'none' : undefined,
        top: 10,
        right: 10,
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '11px',
        zIndex: 1000,
        maxWidth: '350px',
        border: '1px solid #333'
      }}>
     
        
        {/* 초기화 상태 */}
        <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #444' }}>
          <div>WebSocket: {initStatus.webSocket ? '✅' : '⏳'}</div>
          <div>VoiceManager: {initStatus.voiceManager ? '✅' : '⏳'}</div>
          <div>WebRTC: {initStatus.webRTC ? '✅' : '⏳'}</div>
        </div>

        {/* 단일 WebSocket 훅 상태 */}
        <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #444' }}>
          <div style={{ color: '#00ff00', fontWeight: 'bold' }}>단일 WebSocket 훅:</div>
          <div>연결: {wsConnected ? '✅' : '❌'}</div>
          <div>세션 ID: {sessionId ? '✅' : '❌'}</div>
          <div>음성 초기화: {voiceManager.sessionInitialized ? '✅' : '❌'}</div>
          <div>마이크: {voiceManager.isConnected ? '✅' : '❌'}</div>
          <div>음성 감지: {voiceManager.animationFrame ? '✅' : '❌'}</div>
        </div>

        {/* WebRTC 상태 */}
        <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #444' }}>
          <div style={{ color: '#ffff00', fontWeight: 'bold' }}>WebRTC:</div>
          <div>초기화: {webRTCInitialized ? '✅' : '❌'}</div>
          <div>시그널링: {signalingConnected ? '✅' : '❌'}</div>
          <div>P2P: {peerConnections.size}개</div>
        </div>

        {/* 역할 정보 */}
        <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #444' }}>
          <div>내 역할: {myRoleId}</div>
          <div>호스트: {hostId}</div>
          <div>상태: {myRoleId === hostId ? '👑 호스트' : '👤 참가자'}</div>
        </div>

        {/* localStorage */}
        <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #444' }}>
          <div style={{ fontSize: '10px' }}>
            role1: {localStorage.getItem('role1_user_id') || 'NULL'}<br/>
            role2: {localStorage.getItem('role2_user_id') || 'NULL'}<br/>
            role3: {localStorage.getItem('role3_user_id') || 'NULL'}<br/>
            session: {localStorage.getItem('session_id') || 'NULL'}
          </div>
        </div>

        {/* 테스트 버튼 */}
        <div>
          <button 
            onClick={() => {
              console.log('🧪 === GPT 방식 완전체 상태 확인 ===');
              console.log('wsConnected:', wsConnected);
              console.log('sessionId:', sessionId);
              console.log('VoiceManager:', voiceManager.getStatus());
              console.log('WebRTC 초기화:', webRTCInitialized);
              console.log('시그널링:', signalingConnected);
              console.log('P2P 연결:', peerConnections.size);
              console.log('내 역할:', myRoleId, '호스트:', hostId);
              
              if (window.debugWebRTC) {
                window.debugWebRTC.debugConnections();
              }
            }}
            style={{ 
              fontSize: '10px', 
              padding: '4px 8px', 
              backgroundColor: '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '4px',
              width: '100%'
            }}
          >
            🧪 완전체 상태 확인
          </button>
          
          {/* 최근 메시지 */}
          {lastMessage && (
            <div style={{ 
              marginTop: '8px', 
              padding: '6px', 
              backgroundColor: '#1a1a1a', 
              borderRadius: '4px',
              fontSize: '10px'
            }}>
              <div style={{ color: '#00ff00', fontWeight: 'bold' }}>
                 최근 메시지 ({lastMessage.timestamp})
              </div>
              <div>타입: {lastMessage.type}</div>
            </div>
          )}
        </div>
      </div>
      
      <div style={m ? { position: 'relative', minHeight: '100vh', overflowX: 'hidden', zIndex: 0 } : { position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        <div style={m ? { zoom: tab ? 0.85 : 0.55, display: 'flex', flexDirection: 'row', gap: 4, justifyContent: 'center', padding: '76px 0 0' } : {
          position: 'fixed',
          top: '32.5%',
          left: 0,
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          alignItems: 'flex-start',
          padding: '20px 0',
          width: 220,
        }}>
          <UserProfile
            player="1P"
            isLeader={hostId === '1'}
            isMe={myRoleId === '1'}
            isSpeaking={myRoleId === '1' ? (voiceSessionStatus?.isSpeaking || false) : getVoiceStateForRole(1).is_speaking}
            isMicOn={myRoleId === '1' ? (voiceSessionStatus?.isConnected || false) : getVoiceStateForRole(1).is_mic_on}
            nickname={getVoiceStateForRole(1).nickname}
          />
          <UserProfile
            player="2P"
            isLeader={hostId === '2'}
            isMe={myRoleId === '2'}
            isSpeaking={myRoleId === '2' ? (voiceSessionStatus?.isSpeaking || false) : getVoiceStateForRole(2).is_speaking}
            isMicOn={myRoleId === '2' ? (voiceSessionStatus?.isConnected || false) : getVoiceStateForRole(2).is_mic_on}
            nickname={getVoiceStateForRole(2).nickname}
          />
          <UserProfile
            player="3P"
            isLeader={hostId === '3'}
            isMe={myRoleId === '3'}
            isSpeaking={myRoleId === '3' ? (voiceSessionStatus?.isSpeaking || false) : getVoiceStateForRole(3).is_speaking}
            isMicOn={myRoleId === '3' ? (voiceSessionStatus?.isConnected || false) : getVoiceStateForRole(3).is_mic_on}
            nickname={getVoiceStateForRole(3).nickname}
          />
        </div>

        <div style={m ? { width: '100%', padding: '12px 12px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center' } : {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80vw',
          maxWidth: 920,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <img
            src={gameIntro}
            alt="Intro Scene"
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'cover',
              borderRadius: 4,
            }}
          />

          <div style={{ marginTop: 24, width: '100%' }}>
            <ContentTextBox
              paragraphs={paragraphs}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              onContinue={handleContinue}
            />
          </div>
        </div>
      </div>
    </Background>
  );
}