import React, { useState, useEffect } from 'react';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import ContentTextBox from '../components/ContentTextBox';
import { useNavigate } from 'react-router-dom';
import gameIntro from '../assets/images/gameintro.png';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import { useWebRTC } from '../WebRTCProvider'; // 🆕 WebRTC Hook 사용

export default function GameIntro2() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mateName, setMateName] = useState('');
  const [myRoleId, setMyRoleId] = useState(null);
  const [hostId, setHostId] = useState(null);

  // 🆕 WebRTC Provider에서 상태와 함수들 가져오기
  const {
    isInitialized,
    signalingConnected,
    peerConnections,
    roleUserMapping,
    myUserId,
    voiceSessionStatus,
    adjustThreshold
  } = useWebRTC();

  // 음성 상태 관리 (기존 로직 유지)
  const { voiceStates, getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);

  // 🔧 컴포넌트 초기화
  useEffect(() => {
    const storedName = localStorage.getItem('mateName');
    const storedMyRole = localStorage.getItem('myrole_id');
    const storedHost = localStorage.getItem('host_id');

    setMateName(storedName || '');
    setMyRoleId(storedMyRole);
    setHostId(storedHost);

    console.log('📋 GameIntro2 초기화:', {
      mateName: storedName,
      myRoleId: storedMyRole,
      hostId: storedHost,
      myUserId: myUserId
    });
  }, [myUserId]);

  const paragraphs = [
    {
      main: `  지금은 20XX년, 국내 최대 로봇 개발사 A가 다기능 돌봄 로봇 ${mateName || 'HomeMate'}를 개발했습니다.`,
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
      {/* 🆕 간소화된 디버그 정보 */}
      <div style={{
        position: 'fixed',
        top: 10,
        right: 10,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 1000,
        maxWidth: '300px'
      }}>
        <div>WebRTC 초기화: {isInitialized ? '✅' : '⏳'}</div>
        <div>시그널링: {signalingConnected ? '✅ 연결됨' : '❌ 연결안됨'}</div>
        <div>P2P 연결: {peerConnections.size}개</div>
        <div>음성 세션: {voiceSessionStatus.isConnected ? '✅' : '❌'}</div>
        <div>내 ID: {myUserId}</div>
        <div>내 역할: {myRoleId}</div>
        <div>호스트: {hostId}</div>
        <div>역할: {myRoleId === hostId ? '👑 호스트' : '👤 참가자'}</div>
        
        {/* 🆕 음성 임계값 조정 (디버그용) */}
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #444' }}>
          <div>음성 임계값: {voiceSessionStatus.speakingThreshold}</div>
          <div>
            <button onClick={() => adjustThreshold(-5)} style={{ fontSize: '10px', margin: '2px' }}>-5</button>
            <button onClick={() => adjustThreshold(5)} style={{ fontSize: '10px', margin: '2px' }}>+5</button>
          </div>
          <div>마이크 레벨: {voiceSessionStatus.micLevel}</div>
          <div>말하는 중: {voiceSessionStatus.isSpeaking ? '🎤' : '🔇'}</div>
        </div>
      </div>
      
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        <div style={{
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
            isSpeaking={myRoleId === '1' ? voiceSessionStatus.isSpeaking : getVoiceStateForRole(1).is_speaking}
            isMicOn={myRoleId === '1' ? voiceSessionStatus.isConnected : getVoiceStateForRole(1).is_mic_on}
            nickname={getVoiceStateForRole(1).nickname}
          />
          <UserProfile
            player="2P"
            isLeader={hostId === '2'}
            isMe={myRoleId === '2'}
            isSpeaking={myRoleId === '2' ? voiceSessionStatus.isSpeaking : getVoiceStateForRole(2).is_speaking}
            isMicOn={myRoleId === '2' ? voiceSessionStatus.isConnected : getVoiceStateForRole(2).is_mic_on}
            nickname={getVoiceStateForRole(2).nickname}
          />
          <UserProfile
            player="3P"
            isLeader={hostId === '3'}
            isMe={myRoleId === '3'}
            isSpeaking={myRoleId === '3' ? voiceSessionStatus.isSpeaking : getVoiceStateForRole(3).is_speaking}
            isMicOn={myRoleId === '3' ? voiceSessionStatus.isConnected : getVoiceStateForRole(3).is_mic_on}
            nickname={getVoiceStateForRole(3).nickname}
          />
        </div>

        <div style={{
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
              onContinue={() => {
                console.log('🚀 다음 페이지로 이동 - 음성 세션 및 P2P 연결 유지');
                navigate('/selecthomemate');
              }}
            />
          </div>
        </div>
      </div>
    </Background>
  );
}