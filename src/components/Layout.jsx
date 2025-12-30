import React, { useEffect, useState } from 'react';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import GameFrame from '../components/GameFrame';
import { useVoiceRoleStates } from '../hooks/useVoiceRoleStates';
import voiceManager from '../utils/voiceManager';
import BackButton from './BackButton';
import hostInfoSvg from '../assets/host_info.svg'; // 상단 import 필요
import HostInfoBadge from '../components/HostInfoBadge';

// Character popup components
import CharacterPopup1 from '../components/CharacterPopUp';
import CharacterPopup2 from '../components/CharacterPopUp';
import CharacterPopup3 from '../components/CharacterPopUp';
import closeIcon from "../assets/close.svg";
import { FontStyles,Colors } from './styleConstants';
import ExtraPopup from '../components/ExtraPopup1'; // ✅ 여기 import 필요

export default function Layout({
  subtopic ,
  onProfileClick,
  children,
  round,
  nodescription = false,
  onBackClick,
  showBackButton = true,
  allowScroll = false,
  hostmessage = false,   

  popupStep = null,   // ✅ 추가
  sidebarExtra = null,

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

    // 윈도우 크기에 따라 zoom 계산 (최소 0.6 보장)
    const onResize = () => {
      const widthRatio = window.innerWidth / 1480;  // 좌측 사이드바 고려 (220 + 1060 + 여백)
      const heightRatio = window.innerHeight / 800; // 상하 여백 고려
      const scale = Math.min(widthRatio, heightRatio, 1);
      setZoom(Math.max(scale, 0.6)); // 최소 60% 크기 보장
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
  // allowScroll 페이지(Game09 등): 화면 상단부터 자연스럽게 스크롤되도록 viewport 정렬만 조정
  // (position/inset/transform을 덮어써서 레이아웃이 깨지지 않게 최소 override만 적용)
  const viewportOverride = allowScroll
    ? {
        overflowY: "auto",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: 24,
        paddingBottom: 24,
      }
    : {};

  // allowScroll 페이지: width는 반응형(100% + maxWidth)로 두고, transform은 건드리지 않음(zoom scale 유지)
  const stageOverride = allowScroll
    ? {
        width: "100%",
        maxWidth: "1060px",
        minHeight: "720px",
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
         {hostmessage && hostId === myRoleId && (
          <div
            style={{
              position: 'fixed',  
              top: '50%',
              left: '20px',
              transform: `translateY(calc(-50% + 200px)) scale(${zoom})`,
              transformOrigin: 'left top',
              zIndex: 10,  // 유저 프로필(z-index: 10)보다 높음  
            }}
          >
            <HostInfoBadge
              src={hostInfoSvg}
              alt="Host Info"
              preset="hostInfo"
              width={300}
              height={300}
            />
          </div>
        )}
{/* {popupStep && (
  <div
    style={{
      position: 'fixed',
      zIndex: 3000,
      ...(popupStep === 2
        ? {
          top: '68%', 
          right:'13%'     
          }
        : {
            top: '30%',      
            right: 10,
          }),
    }}
  >
    <ExtraPopup mode={popupStep}
    />
  </div>
)} */}
        <style>{`
          html, body, #root {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
          }

          .layout-viewport {
            position: fixed;
            inset: 0;
            overflow: auto; /* 스크롤 허용 */
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column; /* 모바일/allowScroll에서도 깨지지 않게 기본은 column */
          }

          .layout-sidebar {
            position: fixed;
            top: 50%;
            left: 0;
            transform: translateY(-50%) scale(${zoom});
            transform-origin: left center;
            width: 220px;
            padding: 20px 0;
            display: flex;
            flex-direction: column;
            gap: 0px;
            align-items: flex-start;
            z-index: 10;
          }

          .layout-sidebar-profiles {
            display: flex;
            flex-direction: column;
            gap: 24px;
            align-items: flex-start;
            width: 100%;
          }

          .layout-sidebar-extra {
            margin-top: 10px; /* 유저프로필 바로 아래 */
            margin-left: 14px; /* 살짝 오른쪽 */
            align-self: flex-start;
          }

          .layout-stage {
            width: 1060px;
            min-height: 720px;
            height: auto;
            position: relative;
            transform: scale(${zoom});
            transform-origin: center center;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 42px 24px 32px;
            margin: 40px auto;
          }

          .layout-gameframe {
            width: 100%;
            max-width: 500px;
            margin-bottom: 10px;
          }

          @media (max-width: 1024px) {
            .layout-sidebar {
              position: static;
              transform: scale(${zoom});
              transform-origin: top center;
              width: 100%;
              left: auto;
              top: auto;
              flex-direction: column;
              justify-content: flex-start;
              padding: 12px 0;
              margin-bottom: 20px;
              align-items: center;
            }

            .layout-sidebar-profiles {
              flex-direction: row;
              justify-content: center;
              align-items: flex-start;
              width: 100%;
            }

            .layout-sidebar-extra {
              margin-left: 0;
              align-self: center;
            }

            .layout-stage {
              position: static;
              width: 100%;
              max-width: 1060px;
              transform: scale(${zoom});
              padding: 24px 16px;
              margin: 20px auto;
            }
          }
          
          .profile-hint {
            position: absolute;
            top: 20px;
            left: 6%;
            transform: translateX(-50%);
            font-size: 14px;
            color: ${Colors.grey06};
            text-align: center;
            opacity: 0.8;
          }
            
        `}</style>
        <div className="layout-viewport" style={viewportOverride}>
        {!nodescription && (
          <div className="profile-hint">
          </div>
        )}
          <aside className="layout-sidebar">
            <div className="layout-sidebar-profiles">
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
            </div>

            {sidebarExtra && (
              <div className="layout-sidebar-extra">
                {sidebarExtra}
              </div>
            )}
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

