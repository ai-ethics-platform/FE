import React, { useState, useEffect } from 'react';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import ContentTextBox from '../components/ContentTextBox';
import { useNavigate } from 'react-router-dom';
import gameIntro from '../assets/images/gameintro.png';
import voiceManager from '../utils/voiceManager';
import axiosInstance from '../api/axiosInstance';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';

export default function GameIntro2() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mateName, setMateName] = useState('');
  const [myRoleId, setMyRoleId] = useState(null);
  const [hostId, setHostId] = useState(null);

  // 역할별 사용자 ID 매핑
  const [roleUserMapping, setRoleUserMapping] = useState({
    role1_user_id: null,
    role2_user_id: null,
    role3_user_id: null,
  });

  // 음성 상태 관리
  const { voiceStates, getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);

  // 음성 세션 상태
  const [voiceSessionStatus, setVoiceSessionStatus] = useState({
    isConnected: false,
    isSpeaking: false,
    sessionId: null,
    nickname: null,
    participantId: null,
    micLevel: 0,
    speakingThreshold: 30
  });

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
      hostId: storedHost
    });
  }, []);

  // 역할별 사용자 ID 매핑 저장
  const saveRoleUserMapping = async () => {
    try {
      const roomCode = localStorage.getItem('room_code');
      const { data: room } = await axiosInstance.get(`/rooms/code/${roomCode}`);
      
      console.log('🎯 역할별 사용자 매핑 저장:', room.participants);
      
      const mapping = {
        role1_user_id: null,
        role2_user_id: null,
        role3_user_id: null,
      };
      
      room.participants.forEach(participant => {
        const roleId = participant.role_id;
        const userId = participant.user_id;
        
        if (roleId) {
          localStorage.setItem(`role${roleId}_user_id`, String(userId));
          mapping[`role${roleId}_user_id`] = String(userId);
          console.log(`📝 Role ${roleId} → User ${userId} 매핑 저장`);
        }
      });
      
      setRoleUserMapping(mapping);
      return mapping;
      
    } catch (error) {
      console.error('❌ 역할별 사용자 매핑 저장 실패:', error);
      return null;
    }
  };

  // 음성 세션 초기화
  useEffect(() => {
    const initializeVoiceSession = async () => {
      try {
        console.log('🎤 GameIntro2에서 음성 세션 초기화 시작');
        
        // 1. 역할별 사용자 매핑 저장
        await saveRoleUserMapping();
        
        // 2. 음성 세션 초기화
        const success = await voiceManager.initializeVoiceSession();
        
        if (success) {
          console.log('✅ GameIntro2 음성 세션 초기화 성공');
          
          // 상태 업데이트 주기적으로 확인
          const statusInterval = setInterval(() => {
            const currentStatus = voiceManager.getStatus();
            setVoiceSessionStatus(currentStatus);
          }, 100); // 100ms마다 업데이트 (더 빠른 반응)
          
          return () => {
            clearInterval(statusInterval);
          };
          
        } else {
          console.error('❌ GameIntro2 음성 세션 초기화 실패');
        }
      } catch (error) {
        console.error('❌ GameIntro2 음성 세션 초기화 중 오류:', error);
      }
    };

    const initTimeout = setTimeout(initializeVoiceSession, 1000);
    
    return () => {
      clearTimeout(initTimeout);
    };
  }, []);

  // 임계값 조정 함수
  const adjustThreshold = (delta) => {
    const newThreshold = Math.max(10, Math.min(100, voiceSessionStatus.speakingThreshold + delta));
    voiceManager.setSpeakingThreshold(newThreshold);
  };

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
                console.log('🚀 다음 페이지로 이동 - 음성 세션 유지');
                navigate('/selecthomemate');
              }}
            />
          </div>
        </div>

        
      </div>
    </Background>
  );
}