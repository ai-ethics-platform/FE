import React, { useEffect, useState } from 'react';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import GameFrame from '../components/GameFrame';
import { useVoiceRoleStates } from '../hooks/useVoiceRoleStates';
import voiceManager from '../utils/voiceManager';
import BackButton from './BackButton';

// Character popup components
import CharacterPopup1 from '../components/CharacterPopUp';
import CharacterPopup2 from '../components/CharacterPopUp';
import CharacterPopup3 from '../components/CharacterPopUp';
import closeIcon from "../assets/close.svg";
import { FontStyles,Colors } from './styleConstants';
export default function Layout({
  subtopic ,
  onProfileClick,
  children,
  round,
  nodescription = false,
  onBackClick,
  showBackButton = true,
  allowScroll = false
}) {
  // Zoom for responsive scaling
  const [zoom, setZoom] = useState(1);

  // Room-specific roles
  const [hostId, setHostId] = useState(null);
  const [myRoleId, setMyRoleId] = useState(null);

  // 역할별 사용자 ID 매핑
  const [roleUserMapping, setRoleUserMapping] = useState({
    role1_user_id: null,
    role2_user_id: null,
    role3_user_id: null,
  });

  // 음성 상태 관리 (다른 사용자들의 상태) - WebSocket으로 받는 데이터
  const { voiceStates, getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);

  // 내 음성 세션 상태 (실시간 로컬 상태)
  const [myVoiceSessionStatus, setMyVoiceSessionStatus] = useState({
    isConnected: false,
    isSpeaking: false,
    sessionId: null,
    nickname: null,
    participantId: null,
    micLevel: 0,
    speakingThreshold: 30,
    
  });

  // 팝업 상태 
  const [openProfile, setOpenProfile] = useState(null);
  const roleIdMap = { '1P': 1, '2P': 2, '3P': 3 };
  const mateName = localStorage.getItem('mateName') || 'HomeMate'; 
  useEffect(() => {
    // 로컬스토리지에서 데이터 불러오기
    const storedHost = localStorage.getItem('host_id');
    const storedMyRole = localStorage.getItem('myrole_id');
    const role1UserId = localStorage.getItem('role1_user_id');
    const role2UserId = localStorage.getItem('role2_user_id');
    const role3UserId = localStorage.getItem('role3_user_id');

    setHostId(storedHost);
    setMyRoleId(storedMyRole);
    setRoleUserMapping({
      role1_user_id: role1UserId,
      role2_user_id: role2UserId,
      role3_user_id: role3UserId,
    });

    console.log('📋 Layout 초기화:', {
      hostId: storedHost,
      myRoleId: storedMyRole,
      roleMapping: {
        role1: role1UserId,
        role2: role2UserId,
        role3: role3UserId,
      }
    });

    // 윈도우 크기에 따라 zoom 계산
    const onResize = () => {
      setZoom(Math.min(window.innerWidth / 1280, window.innerHeight / 720, 1));
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // 내 음성 세션 상태 업데이트 (실시간)
  useEffect(() => {
    const statusInterval = setInterval(() => {
      const currentStatus = voiceManager.getStatus();
      setMyVoiceSessionStatus(currentStatus);
    }, 100); // 100ms마다 업데이트 (빠른 반응)
    
    return () => clearInterval(statusInterval);
  }, []);

  // 특정 역할의 음성 상태 가져오기 (내 것은 실시간, 다른 사람은 WebSocket)
  const getVoiceStateForRoleWithMyStatus = (roleId) => {
    const roleIdStr = String(roleId);
    
    // 내 역할이면 실시간 상태 반환
    if (roleIdStr === myRoleId) {
      return {
        is_speaking: myVoiceSessionStatus.isSpeaking,
        is_mic_on: myVoiceSessionStatus.isConnected,
        nickname: myVoiceSessionStatus.nickname || ''
      };
    }
    
    // 다른 사람 역할이면 WebSocket 상태 반환
    return getVoiceStateForRole(roleId);
  };
  const viewportOverride = allowScroll
    ? {
        position: "relative",
        top: "auto", right: "auto", bottom: "auto", left: "auto",
        overflowY: "auto",
        height: "100vh",
      }
    : {};

  const stageOverride = allowScroll
    ? {
        position: "relative",
        top: "auto",
        left: "50%",
        transform: "translateX(-50%)",       // 스케일 제거
        width: "1060px",
        minHeight: "720px",
        padding: "42px 24px 32px",
      }
    : {};
  return (
    <>
      {/* Profile Popup as Component */}
      {!nodescription && openProfile && (
        <div
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.6)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            zIndex: 2000 
          }}
          onClick={() => setOpenProfile(null)}
        >
          <div
            style={{ 
              position: 'relative', 
              background: '#fff', 
              padding: 32, 
              borderRadius: 12, 
              boxShadow: '0 12px 30px rgba(0,0,0,0.25)' 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {openProfile === '1P' && 
            <CharacterPopup1
            subtopic={subtopic}
            roleId={roleIdMap[openProfile]}
            mateName={mateName}
            />}
            {openProfile === '2P' && 
            <CharacterPopup2 
            subtopic={subtopic}
            roleId={roleIdMap[openProfile]}
            mateName={mateName}
            />}
            {openProfile === '3P' &&
            <CharacterPopup3 
            subtopic={subtopic}
            roleId={roleIdMap[openProfile]}
            mateName={mateName}/>}
            <img
              src={closeIcon}
              alt="close"
              style={{ 
                position: 'absolute', 
                top: 3, 
                right: 3, 
                width: 31, 
                cursor: 'pointer' 
              }}
              onClick={() => setOpenProfile(null)}
            />
          </div>
        </div>
      )}
      <Background bgIndex={2}>
      {showBackButton && ( 
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: -2,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              zIndex: 1000,
              cursor: 'pointer',
            }}
          >
            <div style={{ position: 'relative', zIndex: 2 }}>
              <BackButton onClick={onBackClick} />
            </div>
          </div>
        )}
        <style>{`
          html, body, #root {
            margin: 0;
            padding: 0;
            height: 100%;
          }

          .layout-viewport {
            position: fixed;
            inset: 0;
            overflow: hidden;
          }

          .layout-sidebar {
            position: fixed;
            top: 38.5%;
            left: 0;
            transform: translateY(-50%);
            width: 220px;
            padding: 20px 0;
            display: flex;
            flex-direction: column;
            gap: 24px;
            align-items: flex-start;
          }

          .layout-stage {
            width: 1060px;
            height: 720px;
            position: absolute;
            top: 52%;
            left: 50%;
            transform: translate(-50%, -50%) scale(${zoom});
            transform-origin: top center;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 42px 24px 32px;
          }

          .layout-gameframe {
            width: 100%;
            max-width: 500px;
            margin-bottom: 10px;
          }

          @media (max-width: 1024px) {
            .layout-sidebar {
              position: static;
              transform: none;
              width: 100%;
              flex-direction: row;
              justify-content: center;
              padding: 12px 0;
            }
            .layout-stage {
              position: static;
              width: 100%;
              height: auto;
              transform: none !important;
              padding: 24px 16px;
            }
          } .profile-hint {
            position: absolute;
            top: 20px;         /* 상단에서의 위치 */
            left: 6%;
            transform: translateX(-50%);
            font-size: 14px;   /* 글씨 크기 */
            color: ${Colors.grey06};
            text-align: center;
            opacity: 0.8;
          }
            
        `}</style>
        <div className="layout-viewport" style={viewportOverride}>
        {!nodescription && (
          <div className="profile-hint">
            프로필을 선택하면 <br /> 역할 설명을 볼 수 있습니다
          </div>
        )}
          <aside className="layout-sidebar">
            <UserProfile
              player="1P"
              isLeader={hostId === '1'}
              isMe={myRoleId === '1'}
              isSpeaking={getVoiceStateForRoleWithMyStatus(1).is_speaking}
              isMicOn={getVoiceStateForRoleWithMyStatus(1).is_mic_on}
              nickname={getVoiceStateForRoleWithMyStatus(1).nickname}
              nodescription={nodescription}
              {...(onProfileClick && {
                onClick: () => setOpenProfile('1P'),
                style: { cursor: 'pointer' },
              })}
            />
            <UserProfile
              player="2P"
              isLeader={hostId === '2'}
              isMe={myRoleId === '2'}
              isSpeaking={getVoiceStateForRoleWithMyStatus(2).is_speaking}
              isMicOn={getVoiceStateForRoleWithMyStatus(2).is_mic_on}
              nickname={getVoiceStateForRoleWithMyStatus(2).nickname}
              nodescription={nodescription}
              {...(onProfileClick && {
                onClick: () => setOpenProfile('2P'),
                style: { cursor: 'pointer' },
              })}
            />
            <UserProfile
              player="3P"
              characterDesc="자녀 J"
              isLeader={hostId === '3'}
              isMe={myRoleId === '3'}
              isSpeaking={getVoiceStateForRoleWithMyStatus(3).is_speaking}
              isMicOn={getVoiceStateForRoleWithMyStatus(3).is_mic_on}
              nickname={getVoiceStateForRoleWithMyStatus(3).nickname}
              nodescription={nodescription}
              {...(onProfileClick && {
                onClick: () =>setOpenProfile('3P'),
                style: { cursor: 'pointer' },
              })}
            />
          </aside>

          <section className="layout-stage"style={stageOverride}>
            <div className="layout-gameframe">
              <GameFrame
                topic={
                  round != null
                    ? `Round ${round.toString().padStart(2, '0')} : ${subtopic}`
                    : `${subtopic}`
                }
                hideArrows
              />
            </div>
            {children}
          </section>
        </div>
      </Background>
    </>
  );
}

