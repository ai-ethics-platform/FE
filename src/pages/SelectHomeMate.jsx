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

export default function SelectHomeMate() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(null);
  const [hostId, setHostId] = useState(null);
  const [myRoleId, setMyRoleId] = useState(null);

  //  WebRTC 상태 가져오기
  const { voiceSessionStatus } = useWebRTC();

  // 역할별 사용자 ID 매핑
  const [roleUserMapping, setRoleUserMapping] = useState({
    role1_user_id: null,
    role2_user_id: null,
    role3_user_id: null,
  });

  // 음성 상태 관리 for others
  const { voiceStates, getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);

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
  }, []);

  // 특정 역할의 음성 상태 (내 것은 WebRTC, 다른 사람은 WebSocket)
  const getVoiceStateForRoleWithMyStatus = (roleId) => {
    if (String(roleId) === myRoleId) {
      return {
        is_speaking: voiceSessionStatus.isSpeaking,
        is_mic_on: voiceSessionStatus.isConnected,
        nickname: voiceSessionStatus.nickname || ''
      };
    }
    return getVoiceStateForRole(roleId);
  };

  const paragraphs = [
    {
      main: '  여러분이 생각하는 HomeMate는 어떤 형태인가요?',
      sub: '(함께 토론한 후 1P가 선택하고, "다음" 버튼을 클릭해주세요)',
    },
  ];

  const images = [character1, character2, character3];

  const handleContinue = async () => {
    if (activeIndex === null) {
      alert('캐릭터를 먼저 선택해주세요!');
      return;
    }
    const roomCode = localStorage.getItem('room_code');
    if (!roomCode) {
      alert('room_code가 없습니다. 방에 먼저 입장하세요.');
      return;
    }

    try {
      const { data } = await axiosInstance.post('/rooms/ai-select', {
        room_code: roomCode,
        ai_type: activeIndex + 1,
      });
      console.log('✅ AI 선택 응답:', data);
      localStorage.setItem('selectedCharacterIndex', String(activeIndex));
      navigate('/matename');
    } catch (err) {
      console.error('❌ AI 선택 실패:', err);
      if (err.response) {
        alert(`오류: ${JSON.stringify(err.response.data)}`);
      } else {
        alert('네트워크 오류 또는 서버 문제');
      }
      navigate('/matename');
    }
  };

  return (
    <Background bgIndex={2}>
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
            isSpeaking={getVoiceStateForRoleWithMyStatus(1).is_speaking}
            isMicOn={getVoiceStateForRoleWithMyStatus(1).is_mic_on}
            nickname={getVoiceStateForRoleWithMyStatus(1).nickname}
          />
          <UserProfile
            player="2P"
            isLeader={hostId === '2'}
            isMe={myRoleId === '2'}
            isSpeaking={getVoiceStateForRoleWithMyStatus(2).is_speaking}
            isMicOn={getVoiceStateForRoleWithMyStatus(2).is_mic_on}
            nickname={getVoiceStateForRoleWithMyStatus(2).nickname}
          />
          <UserProfile
            player="3P"
            isLeader={hostId === '3'}
            isMe={myRoleId === '3'}
            isSpeaking={getVoiceStateForRoleWithMyStatus(3).is_speaking}
            isMicOn={getVoiceStateForRoleWithMyStatus(3).is_mic_on}
            nickname={getVoiceStateForRoleWithMyStatus(3).nickname}
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
                onClick={() => setActiveIndex(idx)}
                style={{
                  width: 264,
                  height: 360,
                  objectFit: 'cover',
                  borderRadius: 4,
                  cursor: 'pointer',
                  border: activeIndex === idx ? `2px solid #354750` : 'none',
                  transform: activeIndex === idx ? 'scale(1.01)' : 'scale(1)',
                  transition: 'all 0.2s ease-in-out',
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
