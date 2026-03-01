// 커스텀 모드일 때 opening 부분 수정
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import gameIntro from '../assets/images/gameintro.png';
import ContentBox4 from '../components/ContentBox4';
import Continue from '../components/Continue';
import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider';
import { Colors, FontStyles } from '../components/styleConstants';
import { 
  useWebSocketNavigation, 
  useHostActions 
} from '../hooks/useWebSocketMessage';
import { clearAllLocalStorageKeys } from '../utils/storage';
import axiosInstance from '../api/axiosInstance';
import voiceManager from '../utils/voiceManager';
// Localization 연동
import { translations } from '../utils/language/index';

export default function GameIntro() {
  const navigate = useNavigate();
  
  // 프로젝트 표준 키값 app_lang 사용 및 언어팩 로드
  const lang = localStorage.getItem('app_lang') || 'ko';
  const t = (lang !== 'ko') ? (translations[lang] || translations['en']) : translations['ko'];
  const tg = t.GameIntro || {};

  const { isConnected, addMessageHandler, removeMessageHandler, sendMessage, initializeVoiceWebSocket, reconnectAttempts, maxReconnectAttempts } = useWebSocket();
  
  const { 
    isInitialized: webrtcInitialized, 
    signalingConnected, 
    peerConnections,
    initializeWebRTC,
    voiceSessionStatus,
  } = useWebRTC();

  // [수정] 누락되었던 음성 세션 초기화 상태 추가
  const [voiceInitialized, setVoiceInitialized] = useState(false);

  // 호스트 ID와 내 역할 ID 상태
  const [hostId, setHostId] = useState(null);
  const [currentMyRoleId, setCurrentMyRoleId] = useState(null);

  // AI 이름 상태
  const [mateName, setMateName] = useState(localStorage.getItem('mateName') || 'HomeMate');

  const connectionEstablishedRef = useRef(false);
  const initMessageSentRef = useRef(false);
  const sendMessageRef = useRef(null);
  
  const category = localStorage.getItem('category');
  
  // 확장형 로직: Android 미포함 시 AWS로 간주
  const isAndroid = category && (category.includes('안드로이드') || category.toLowerCase().includes('android'));
  const isAWS = !isAndroid;

  // 언어팩 기반 동적 텍스트 할당
  const ANDROID_TEXT = tg.androidText || '';
  const AWS_TEXT = tg.awsText || '';
  const AWS_TEXT_LEFT = tg.awsTextLeft || '';
  
  const TEACHER_TEXT = 
  '👋 안녕하세요! AI 윤리 딜레마 게임에 오신 걸 환영합니다.\n\n' + 
  '[ 게임 진행 방법 ]\n'+ 
  '여러분은 이제 AI 기술과 관련된 가상 상황에 \n 놓여집니다. 그리고 자신에게 주어진 역할의 인물이 \n 되어 어떤 선택을 할지 결정한 뒤, 친구들과 의견을 \n 나누며 최선의 결론을 합의하게 됩니다.\n\n' 
  +'자, 이제 시작해볼까요? '
  
  const isCustomMode = !!localStorage.getItem('code');

  // 커스텀 인트로 우선 사용 설정
  const customIntroText = tg.customIntro || TEACHER_TEXT;
  const rawFullText = isCustomMode ? customIntroText : (isAWS ? AWS_TEXT : ANDROID_TEXT);

  // {{mateName}} 치환 로직
  const fullText = rawFullText.replaceAll('{{mateName}}', mateName);

  const { isHost, sendNextPage } = useHostActions();
  
  useWebSocketNavigation(navigate, {
    nextPagePath: '/selecthomemate'
  });
  
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  // 로컬스토리지 역할 정보 로드
  useEffect(() => {
    const storedHost = localStorage.getItem('host_id');
    const storedMyRole = localStorage.getItem('myrole_id');

    setHostId(storedHost);
    setCurrentMyRoleId(storedMyRole);

    // console.log(`역할 정보 로드:`, {
    //    hostId: storedHost,
    //    myRoleId: storedMyRole,
    // });
  }, []);

  // AI 이름 서버 동기화
  useEffect(() => {
    if (isCustomMode) return;
    const roomCode = localStorage.getItem('room_code');
    if (!roomCode) return;

    (async () => {
      try {
        const res = await axiosInstance.get('/rooms/ai-name', { params: { room_code: roomCode } });
        if (res.data && res.data.ai_name) {
          setMateName(res.data.ai_name);
          localStorage.setItem('mateName', res.data.ai_name);
        }
      } catch (e) {
        console.error('AI 이름 불러오기 실패', e);
      }
    })();
  }, [isCustomMode]);

  // WebSocket 초기화 메시지 전송 로직
  const sendInitMessage = useCallback(() => {
    if (initMessageSentRef.current) return false;
    
    const userId = localStorage.getItem('user_id');
    const nickname = localStorage.getItem('nickname');
    
    if (!userId || !nickname) return false;
    
    const initMessage = {
      type: "init",
      data: { user_id: Number(userId), nickname: nickname }
    };

    const success = sendMessageRef.current?.(initMessage);
    if (success) {
      initMessageSentRef.current = true;
      return true;
    }
    return false;
  }, []);

  // 1) WebSocket 연결 및 이벤트 핸들러 등록
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const hostIdVal = localStorage.getItem('host_id');
    const myRoleIdVal = localStorage.getItem('myrole_id');
    
    if (!userId || !hostIdVal || !myRoleIdVal) return;

    const isHostUser = hostIdVal === myRoleIdVal;
    const handlerId = "connection-established";

    const messageHandler = (message) => {
      if (message.type === 'connection_established') {
        if (!connectionEstablishedRef.current && !initMessageSentRef.current) {
          connectionEstablishedRef.current = true;
          sendInitMessage();
        }
      }
    };
    
    addMessageHandler(handlerId, messageHandler);

    const connectWithRetry = async (attempt = 1, maxAttempts = 3) => {
      try {
        await initializeVoiceWebSocket(isHostUser);
      } catch (err) {
        if (attempt < maxAttempts) {
          const retryDelay = Math.min(1000 * attempt, 5000);
          setTimeout(() => connectWithRetry(attempt + 1, maxAttempts), retryDelay);
        }
      }
    };

    connectWithRetry();

    return () => removeMessageHandler(handlerId);
  }, [initializeVoiceWebSocket, addMessageHandler, removeMessageHandler, sendInitMessage]);

  // 2) WebRTC 초기화 로직
  useEffect(() => {
    if (!webrtcInitialized && isConnected) {
      initializeWebRTC().catch(err => console.error(`WebRTC 초기화 실패:`, err));
    }
  }, [webrtcInitialized, isConnected, initializeWebRTC]);

  // 3) 음성 세션 초기화 로직 (여기서 voiceInitialized 참조함)
  const initializeVoice = useCallback(async () => {
    if (voiceInitialized) return;

    const sessionId = localStorage.getItem('session_id');
    if (!connectionEstablishedRef.current || !sessionId || !webrtcInitialized) return;

    try {
      const success = await voiceManager.initializeVoiceSession();
      if (success) {
        setVoiceInitialized(true);
        setTimeout(() => voiceManager.startSpeechDetection(), 1000);
      }
    } catch (err) {
      console.error(`음성 초기화 에러:`, err);
    }
  }, [voiceInitialized, webrtcInitialized]);

  // 조건 충족 시 음성 세션 시작 타이머 가동
  useEffect(() => {
    if (connectionEstablishedRef.current && webrtcInitialized && !voiceInitialized) {
      const timer = setTimeout(() => initializeVoice(), 1000);
      return () => clearTimeout(timer);
    }
  }, [connectionEstablishedRef.current, webrtcInitialized, voiceInitialized, initializeVoice]);

  // const handleContinue = useCallback(() => { ... });

  // P2P 연결 수 계산 (3인 기준 음성 연결 확인)
  const connectedPeerCount = (() => {
    try {
      if (!peerConnections) return 0;
      const pcs = peerConnections instanceof Map ? Array.from(peerConnections.values()) : Object.values(peerConnections);
      return pcs.filter((pc) => pc && (pc.connectionState === 'connected' || pc.iceConnectionState === 'connected')).length;
    } catch { return 0; }
  })();

  const allVoicesConnected = connectedPeerCount >= 2;

  // 다음 단계 진행 가능 여부 판별
  const canProceed = isCustomMode
    ? true
    : (connectionEstablishedRef.current && webrtcInitialized && allVoicesConnected);

  const handleContinue = () => {
    if (isCustomMode) {
      navigate('/game01');
    } else {
      navigate('/selecthomemate');
    }
  };

  const debugSpeed = window.location.hostname === 'localhost' ? 0 : 70;

  return (
    <Background bgIndex={2}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: 60, left: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, zIndex: 10, alignItems: 'flex-start', width: 'fit-content', margin: 0, padding: 0 }}>
            <UserProfile player="1P" isLeader={hostId === '1'} isMe={currentMyRoleId === '1'} nodescription={true} />
            <UserProfile player="2P" isLeader={hostId === '2'} isMe={currentMyRoleId === '2'} nodescription={true} />
            <UserProfile player="3P" isLeader={hostId === '3'} isMe={currentMyRoleId === '3'} nodescription={true} />
          </div>
        </div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80vw', maxWidth: 936, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px' }}>
          <ContentBox4 
            text={fullText} 
            leftText={isAWS} 
            leftTextContent={isAWS? AWS_TEXT_LEFT : ''} 
            typingSpeed={debugSpeed}
          />
          <div style={{ marginTop: 20 }}>
            <Continue
              width={264}
              height={72}
              onClick={handleContinue}
              label={tg.continueBtn || "다음"}
              disabled={!canProceed}
            />
          </div>
        </div>
      </div>
    </Background>
  );
}