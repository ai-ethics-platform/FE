import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout      from '../components/Layout';
import ContentBox2 from '../components/ContentBox2';
import UserProfile from '../components/Userprofile';

import { useWebRTC } from '../WebRTCProvider';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import voiceManager from '../utils/voiceManager';

const fullText =
  '  여러분의 결정으로 가정용 로봇은 보다 정확한 서비스를 제공하였고, 여러분의 친구처럼 제 역할을 다하고 있습니다.';

export default function Game09() {
  const navigate = useNavigate();
  const subtopic = '다른 사람들이 선택한 미래';

  // WebRTC audio state
  const { voiceSessionStatus, roleUserMapping, myRoleId } = useWebRTC();
  const { getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);
  const getVoiceState = (role) => {
    if (String(role) === myRoleId) {
      return {
        is_speaking: voiceSessionStatus.isSpeaking,
        is_mic_on:    voiceSessionStatus.isConnected,
        nickname:     voiceSessionStatus.nickname || ''
      };
    }
    return getVoiceStateForRole(role);
  };

  // leave WebRTC session on unmount
  useEffect(() => {
    return () => {
      voiceManager.leaveSession()
        .then(success => {
          if (success) console.log('🛑 음성 세션에서 나감 완료');
          else console.warn('⚠️ 음성 세션 나가기 실패');
        });
    };
  }, []);

  return (
    <Layout subtopic={subtopic} me="1P">
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