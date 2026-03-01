import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../Background';
import UserProfile from '../Userprofile';
import InputBoxSmall from '../InputBoxSmall';
import ContentTextBox from '../ContentTextBox';

import character1 from '../../assets/images/character1.png';
import character2 from '../../assets/images/character2.png';
import character3 from '../../assets/images/character3.png';
import killerCharacter1 from '../../assets/images/Killer_Character1.jpg';
import killerCharacter2 from '../../assets/images/Killer_Character2.jpg';
import killerCharacter3 from '../../assets/images/Killer_Character3.jpg';

import axiosInstance from '../../api/axiosInstance';
import { useWebRTC } from '../../WebRTCProvider';
import { useWebSocket } from '../../WebSocketProvider';
import { Colors, FontStyles } from "../styleConstants";
import { useWebSocketNavigation, useHostActions } from '../../hooks/useWebSocketMessage';
import voiceManager from '../../utils/voiceManager';

// 이미지 에셋 - 언어별 대응
import hostInfoSvg from '../../assets/host_info.svg';
import hostInfoSvg_en from '../../assets/en/host_info_en.svg';

import HostInfoBadge from '../HostInfoBadge';
// Localization 연동
import { translations } from '../../utils/language/index';

export default function MateName() {
  const navigate = useNavigate();
  
  // 프로젝트 표준 키값 app_lang 사용 및 언어팩 로드
  const lang = localStorage.getItem('app_lang') || 'ko';
  const t = (lang !== 'ko') ? (translations[lang]?.MateName || translations['en']?.MateName) : translations['ko']?.MateName;
  const tm = t || {};
  
  // 언어 설정에 따른 이미지 선택 (확장형 로직)
  const currentHostInfoSvg = (lang !== 'ko') ? hostInfoSvg_en : hostInfoSvg;

  const [name, setName] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const roomCode = localStorage.getItem('room_code');
  const [hostId, setHostId] = useState(null);
  const [myRoleId, setMyRoleId] = useState(null);

  // 음성 세션 초기화 상태 (화이트 스크린 방지용)
  const [voiceInitialized, setVoiceInitialized] = useState(false);
  
  // 카테고리 인식 로직 강화 (확장형 판별)
  const category = localStorage.getItem('category') || '';
  const isAndroid = category.includes('안드로이드') || category.toLowerCase().includes('android');
  const isAWS = !isAndroid;

  // 카테고리별 이미지 세트 설정
  const images = isAWS
    ? [killerCharacter1, killerCharacter2, killerCharacter3]
    : [character1, character2, character3];

  // UI 텍스트 설정
  const uiText = isAWS
    ? {
        placeholder: tm.placeholderAws || '이 자율 무기 시스템의 이름을 정해 주세요. (방장만 입력 가능)',
        main: tm.mainAws || '여러분이 사용자라면 자율 무기 시스템을 어떻게 부를까요?',
      }
    : {
        placeholder: tm.placeholderAndroid || '여러분의 HomeMate 이름을 지어주세요.(방장만 입력 가능)',
        main: tm.mainAndroid || '     여러분이 사용자라면 HomeMate를 어떻게 부를까요?',
      };

  const { isInitialized: webrtcInitialized } = useWebRTC();
  const { isConnected: websocketConnected } = useWebSocket();
  const { isHost, sendNextPage } = useHostActions();
  
  // 페이지 이동 메시지 핸들러
  useWebSocketNavigation(navigate, { nextPagePath: '/gamemap' });

  // 초기 데이터 로드
  useEffect(() => {
    const storedHost = localStorage.getItem('host_id');
    const storedMyRole = localStorage.getItem('myrole_id');
    setHostId(storedHost);
    setMyRoleId(storedMyRole);
  }, []);

  // 음성 세션 초기화 로직
  const initializeVoice = useCallback(async () => {
    if (voiceInitialized) return;
    const sessionId = localStorage.getItem('session_id');
    if (!sessionId) return;
    try {
      const success = await voiceManager.initializeVoiceSession();
      if (success) {
        setVoiceInitialized(true);
        setTimeout(() => voiceManager.startSpeechDetection(), 1000);
      }
    } catch (err) { console.error(err); }
  }, [voiceInitialized]);

  // 마운트 시 음성 세션 가동
  useEffect(() => {
    const timer = setTimeout(() => initializeVoice(), 1000);
    return () => clearTimeout(timer);
  }, [initializeVoice]);

  // 캐릭터 선택 정보 동기화
  useEffect(() => {
    const initSelected = async () => {
      const raw = localStorage.getItem('selectedCharacterIndex');
      if (raw !== null) {
        const idx = Number(raw);
        if (Number.isInteger(idx)) {
          setSelectedIndex(idx);
          return; 
        }
      }
      if (!roomCode) {
        setSelectedIndex(0);
        return;
      }
      try {
        const { data } = await axiosInstance.get('/rooms/ai-select', {
          params: { room_code: roomCode },
        });
        const idx = Number(data?.ai_type) - 1; 
        setSelectedIndex(idx);
      } catch (e) {
        console.error('[MateName] ai-select 실패:', e);
        setSelectedIndex(0);
      }
    };
    initSelected();
  }, [roomCode, isAWS]);

  useEffect(() => {
    if (selectedIndex !== null) {
      localStorage.setItem('selectedCharacterIndex', String(selectedIndex));
    }
  }, [selectedIndex]);

  // 출력 텍스트 구성
  const paragraphs = [
    { main: uiText.main, sub: tm.subText || '합의 후에 방장이 이름을 작성해주세요.' },
  ];

  // 방장 전용 이름 변경 핸들러
  const handleNameChange = (e) => {
    if (!isHost) {
      alert(tm.alertNotHostInput || '방장이 아니므로 이름 입력이 불가능합니다.');
      return;
    }
    setName(e.target.value);
  };

  const handleContinue = async () => {
    if (!isHost) {
      alert(tm.alertNotHostProgress || '방장만 게임을 진행할 수 있습니다.');
      return;
    }
    if (!name.trim()) {
      alert(tm.alertNoName || '이름을 입력해주세요!');
      return;
    }
    const rc = localStorage.getItem('room_code');
    if (!rc) {
      alert(tm.alertNoRoomCode || 'room_code가 없습니다. 방에 먼저 입장하세요.');
      return;
    }
    const trimmed = name.trim();
    try {
      await axiosInstance.post('/rooms/ai-name', { room_code: rc, ai_name: trimmed });
      localStorage.setItem('mateName', trimmed);
      const ok = sendNextPage();
      if (!ok) navigate('/gamemap');
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400) {
        localStorage.setItem('mateName', trimmed);
        const ok = sendNextPage();
        if (!ok) navigate('/gamemap');
        return;
      }
      console.error('[MateName] AI 이름 저장 실패:', err);
      alert(err?.response?.data?.detail ?? (tm.alertSaveError || '이름 저장 중 오류가 발생했습니다.'));
    }
  };

  return (
    <Background bgIndex={2}>
      {hostId === myRoleId && (
        <div style={{ position: 'absolute', top: '-115px', right: '0px', zIndex: 10 }}>
          <HostInfoBadge
            src={currentHostInfoSvg}
            alt="Host Info"
            preset="hostInfo"
            width={350}
            height={300}
          />
        </div>
      )}
      
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        {/* 사이드 프로필 영역 */}
        <div style={{ position: 'fixed', top: '32.5%', left: 0, transform: 'translateY(-50%)', width: 220, padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
          {[1, 2, 3].map(role => (
            <UserProfile key={role} player={`${role}P`} isLeader={hostId === String(role)} isMe={myRoleId === String(role)} />
          ))}
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div style={{ position: 'absolute', top: '46%', left: '50%', transform: 'translate(-50%, -50%)', width: '80vw', maxWidth: 936, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {selectedIndex !== null && images[selectedIndex] && (
            <img
              src={images[selectedIndex]}     
              alt="Selected Character"
              style={{ width: 264, height: 350, objectFit: 'cover', borderRadius: 4, marginBottom: -15, opacity: isHost ? 1 : 0.8 }}
            />
          )}

          <div style={{ height: 20 }} />

          <InputBoxSmall
            label=""
            labelWidth={0}
            placeholder={uiText.placeholder}
            width={550}
            height={64}
            value={name}
            onChange={handleNameChange}
            style={{ 
              margin: '0 auto', 
              cursor: isHost ? 'text' : 'not-allowed', 
              backgroundColor: isHost ? undefined : '#f5f5f5', 
              fontSize: tm.placeholderSize || 'inherit'
            }}
          />

          <div style={{ width: '100%', marginTop: 10, maxWidth: 936 }}>
            <ContentTextBox paragraphs={paragraphs} onContinue={handleContinue} />
          </div>
        </div>
      </div>
    </Background>
  );
}