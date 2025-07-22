// pages/MateName.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import InputBoxSmall from '../components/InputBoxSmall';
import ContentTextBox2 from '../components/ContentTextBox2';

import character1 from '../assets/images/character1.png';
import character2 from '../assets/images/character2.png';
import character3 from '../assets/images/character3.png';

import axiosInstance from '../api/axiosInstance';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import { useWebRTC } from '../WebRTCProvider'; // WebRTC Hook

export default function MateName() {
  const navigate = useNavigate();
  const images = [character1, character2, character3];

  const [name, setName] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const roomCode = localStorage.getItem('room_code');
  const [hostId, setHostId] = useState(null);
  const [myRoleId, setMyRoleId] = useState(null);

  // WebRTC 음성 세션 상태 가져오기
  const { voiceSessionStatus } = useWebRTC();

  // 역할별 사용자 ID 매핑
  const [roleUserMapping, setRoleUserMapping] = useState({
    role1_user_id: null,
    role2_user_id: null,
    role3_user_id: null,
  });

  // WebSocket 음성 상태 가져오기 (다른 참가자)
  const { getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);

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

  // 선택된 AI 타입 불러오기
  useEffect(() => {
    const fetchAiSelection = async () => {
      try {
        const response = await axiosInstance.get('/rooms/ai-select', {
          params: { room_code: roomCode },
        });
        const aiType = response.data.ai_type;
        setSelectedIndex(aiType - 1);
      } catch (err) {
        console.error('❌ AI 정보 불러오기 실패:', err);
      }
    };
    fetchAiSelection();
  }, []);

  // 내 음성 상태 대신 WebRTC, 다른 사람은 WebSocket
  const getVoiceState = (roleId) => {
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
      main: '     여러분이 사용자라면 HomeMate를 어떻게 부를까요?',
      sub: '(함께 토론한 후 1P가 입력하고 "다음" 버튼을 클릭해 주세요)',
    },
  ];

  const handleContinue = async () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요!');
      return;
    }
    try {
      await axiosInstance.post('/rooms/ai-name', {
        room_code: roomCode,
        ai_name: name.trim(),
      });
      localStorage.setItem('mateName', name.trim());
      navigate('/gamemap', { state: { selectedIndex } });
    } catch (err) {
      console.error('❌ AI 이름 저장 실패:', err);
      alert(err.response?.data?.detail || '오류가 발생했습니다');
      navigate('/gamemap', { state: { selectedIndex } });
    }
  };

  return (
    <Background bgIndex={2}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        {/* 사이드 프로필 */}
        <div style={{
          position: 'fixed', top: '32.5%', left: 0, transform: 'translateY(-50%)',
          width: 220, padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start'
        }}>
          {[1,2,3].map(role => {
            const vs = getVoiceState(role);
            return (
              <UserProfile
                key={role}
                player={`${role}P`}
                isLeader={hostId === String(role)}
                isMe={myRoleId === String(role)}
                isSpeaking={vs.is_speaking}
                isMicOn={vs.is_mic_on}
                nickname={vs.nickname}
              />
            );
          })}
        </div>

        {/* 메인 컨텐츠 */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '80vw', maxWidth: 936, display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          {selectedIndex !== null && (
            <img
              src={images[selectedIndex]}
              alt="Selected Character"
              style={{ width: 264, height: 350, objectFit: 'cover', borderRadius: 4, border: '2px solid #354750' }}
            />
          )}
          <div style={{ height: 20 }} />
          <InputBoxSmall
            placeholder="HomeMate 이름을 입력하세요"
            width={520} height={64}
            value={name} onChange={e => setName(e.target.value)}
          />
          <div style={{ width: '100%', maxWidth: 936 }}>
            <ContentTextBox2 paragraphs={paragraphs} onContinue={handleContinue} />
          </div>
        </div>
      </div>
    </Background>
  );
}
