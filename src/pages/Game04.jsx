// pages/Game04.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Layout      from '../components/Layout';      
import Continue    from '../components/Continue';
import boxSelected from '../assets/contentBox5.svg';
import boxUnselect from '../assets/contentBox6.svg';
import profile1    from '../assets/1playerprofile.svg';
import profile2    from '../assets/2playerprofile.svg';
import profile3    from '../assets/3playerprofile.svg';
import { Colors, FontStyles } from '../components/styleConstants';

import axiosInstance from '../api/axiosInstance';
import { fetchWithAutoToken } from '../utils/fetchWithAutoToken';
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';

// 🆕 WebRTC Hooks
import { useWebRTC } from '../WebRTCProvider';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import UserProfile from '../components/Userprofile';

const avatarOf = { '1P': profile1, '2P': profile2, '3P': profile3 };

export default function Game04() {
  const { state } = useLocation();
  const navigate   = useNavigate();

  // WebSocket: 다음 페이지(Game05)로 이동
  useWebSocketNavigation(navigate, { nextPagePath: '/game05', infoPath: '/game05' });
  const { isHost, sendNextPage } = useHostActions();

  // WebRTC 음성 상태
  const { voiceSessionStatus, roleUserMapping, myRoleId: rtcRole } = useWebRTC();
  const { getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);
  const getVoiceState = (role) => {
    if (String(role) === rtcRole) {
      return {
        is_speaking: voiceSessionStatus.isSpeaking,
        is_mic_on:    voiceSessionStatus.isConnected,
        nickname:     voiceSessionStatus.nickname || ''
      };
    }
    return getVoiceStateForRole(role);
  };

  const myVote   = state?.agreement ?? null;
  const subtopic = localStorage.getItem('subtopic') ?? '가정 1';
  const roomCode = localStorage.getItem('room_code') ?? '';

  const [round, setRound] = useState(1);
  useEffect(() => {
    const completed       = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const calculatedRound = completed.length + 1;
    setRound(calculatedRound);
    localStorage.setItem('currentRound', calculatedRound.toString());
  }, []);

  // participants 상태 확인 및 mode 저장
  useEffect(() => {
    (async () => {
      try {
        await fetchWithAutoToken();
        const res = await axiosInstance.get(
          `/rooms/${roomCode}/rounds/${round}/status`
        );
        const parts = res.data.participants;
        const agreeCount    = parts.filter(p => p.choice === 1).length;
        const disagreeCount = parts.filter(p => p.choice === 2).length;
        const majorityMode = agreeCount >= disagreeCount ? 'agree' : 'disagree';
        localStorage.setItem('mode', majorityMode);
      } catch (err) {
        console.error('참여자 상태 조회 오류:', err);
      }
    })();
  }, [roomCode, round]);

  const agreedList    = state?.agreement === 'agree'    ? ['1P','2P'] : [];
  const disagreedList = state?.agreement === 'disagree' ? ['3P']      : [];

  const [secsLeft, setSecsLeft] = useState(10);
  useEffect(() => {
    if (secsLeft <= 0) return;
    const timer = setInterval(() => setSecsLeft(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secsLeft]);

  const timeStr = `${String(Math.floor(secsLeft/60)).padStart(2,'0')}` +
                  `:${String(secsLeft%60).padStart(2,'0')}`;

  const handleContinue = () => {
    if (!isHost) {
      alert('⚠️ 방장만 진행할 수 있습니다.');
      return;
    }
    sendNextPage();
  };

  return (
    <Layout subtopic={subtopic} round={round} me="3P">

      <div style={{ display: 'flex', gap: 48, marginLeft: 240 }}>
        {[
          { label: '동의',   list: agreedList,    key: 'agree'    },
          { label: '비동의', list: disagreedList, key: 'disagree' },
        ].map(({ label, list, key }) => (
          <div key={key} style={{ position: 'relative', width: 360, height: 391 }}>
            <img
              src={list.length && state.agreement===key ? boxSelected : boxUnselect}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill' }}
            />
            <div style={{
              position: 'relative', zIndex: 1, height: '100%',
              display: 'flex', flexDirection: 'column',
              justifyContent: 'center', alignItems: 'center', textAlign: 'center',
            }}>
              <p style={{ ...FontStyles.headlineSmall, color: Colors.grey06 }}>{label}</p>
              <p style={{ ...FontStyles.headlineLarge, color: Colors.grey06, margin: '16px 0' }}>
                {list.length}명
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                {list.map(id => (
                  <img key={id} src={avatarOf[id]} alt={id} style={{ width: 48, height: 48 }} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 26, marginLeft: 240 }}>
        {secsLeft > 0 ? (
          <>
            <p style={{ ...FontStyles.headlineSmall, color: Colors.grey06 }}>
              선택의 이유를 공유해 주세요.
            </p>
            <div style={{
              width: 264, height: 72, margin: '16px auto 0',
              background: Colors.grey04, borderRadius: 8, opacity: 0.6,
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              fontSize: 24, color: Colors.grey01, userSelect: 'none',
            }}>
              {timeStr}
            </div>
          </>
        ) : (
          <Continue
            width={264}
            height={72}
            step={1}
            disabled={!isHost}
            onClick={handleContinue}
          />
        )}
      </div>
    </Layout>
  );
}
