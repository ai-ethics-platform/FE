import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom'; // 페이지 이동 감지를 위해 추가
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import GameFrame from '../components/GameFrame';
import { useVoiceRoleStates } from '../hooks/useVoiceRoleStates';
import voiceManager from '../utils/voiceManager';
import BackButton from './BackButton';
import hostInfoSvg from '../assets/host_info.svg'; 
import hostInfoSvg_en from '../assets/en/host_info_en.svg'; // 영문용 에셋 추가
import HostInfoBadge from '../components/HostInfoBadge';

// 서버 데이터 동기화를 위한 axios 인스턴스 임포트
import axiosInstance from '../api/axiosInstance';

// Character popup components
import CharacterPopup1 from '../components/CharacterPopUp';
import CharacterPopup2 from '../components/CharacterPopUp';
import CharacterPopup3 from '../components/CharacterPopUp';
import closeIcon from "../assets/close.svg";
import { FontStyles, Colors } from './styleConstants';
import ExtraPopup from '../components/ExtraPopup1'; 

// 다국어 지원 임포트
import { translations } from '../utils/language';

export default function Layout({
  subtopic, onProfileClick, children, round, nodescription = false,
  onBackClick, showBackButton = true, allowScroll = false, hostmessage = false,
  popupStep = null, sidebarExtra = null,
}) {
  const [zoom, setZoom] = useState(1);
  const location = useLocation(); // 현재 경로 감지
  
  // [다국어 확장 설계] 현재 언어 로드 및 폴백(Fallback) 처리
  const lang = localStorage.getItem('app_lang') || localStorage.getItem('language') || 'ko';
  const currentLangData = translations[lang] || translations['en'] || translations['ko'];
  
  const t_small = currentLangData.SmallDescription || {};
  const t_map = currentLangData.GameMap || {};
  const t_ko_map = translations['ko']?.GameMap || {}; 

  const [hostId, setHostId] = useState(null);
  const [myRoleId, setMyRoleId] = useState(null);
  const [roleUserMapping, setRoleUserMapping] = useState({
    role1_user_id: null, role2_user_id: null, role3_user_id: null,
  });

  const { voiceStates, getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);
  const [myVoiceSessionStatus, setMyVoiceSessionStatus] = useState({
    isConnected: false, isSpeaking: false, sessionId: null, nickname: null, participantId: null, micLevel: 0, speakingThreshold: 30,
  });

  const [openProfile, setOpenProfile] = useState(null);
  const roleIdMap = { '1P': 1, '2P': 2, '3P': 3 };

  // mateName을 상태(State)로 관리하여 서버 응답 시 즉시 UI 반영
  const [mateName, setMateName] = useState(localStorage.getItem('mateName') || 'HomeMate'); 

  // [선제적 동기화 로직] 
  // 참여자가 어느 페이지에 있든, 부족한 방 정보(이름, 카테고리 등)를 서버에서 가져와 로컬 스토리지에 미리 채워줍니다.
  const syncMateName = async () => {
    const roomCode = localStorage.getItem('room_code');
    if (!roomCode) return;

    try {
      const { data } = await axiosInstance.get('/rooms/ai-name', {
        params: { room_code: roomCode },
      });

      if (data) {
        // 1. AI 이름 동기화 (방장이 지은 이름을 참여자 브라우저에 배달)
        const finalMateName = data.ai_name || data.mate_name;
        if (finalMateName) {
          localStorage.setItem('mateName', finalMateName);
          // 현재 상태와 다를 경우에만 업데이트하여 불필요한 리렌더링 방지
          if (mateName !== finalMateName) setMateName(finalMateName);
        }

        // 2. 환경 정보 선제 동기화
        // 다른 게임 페이지들을 일일이 수정하지 않아도 정상 작동하도록 로컬 스토리지를 미리 채워둡니다.
        if (data.category) localStorage.setItem('category', data.category);
        if (data.title) localStorage.setItem('title', data.title);
        if (data.subtopic) localStorage.setItem('subtopic', data.subtopic);

        console.log('✅ [Layout Sync] 데이터 동기화 완료:', { mateName: finalMateName, category: data.category });
      }
    } catch (err) {
      console.error('❌ [Layout Sync] 서버 동기화 실패:', err);
    }
  };

  // 마운트 시 및 페이지 이동 시마다 데이터를 체크하여 참여자 브라우저를 최신화합니다.
  useEffect(() => {
    syncMateName();
  }, [location.pathname]);

  // 역방향 매칭 및 실시간 재번역 헬퍼 함수
  const getTranslatedValue = (raw) => {
    if (!raw) return '';
    const foundKey = Object.keys(t_ko_map).find(k => t_ko_map[k] === raw);
    let resultText = (foundKey && t_map[foundKey]) ? t_map[foundKey] : raw;
    return resultText.replaceAll('{{mateName}}', mateName);
  };


  const getSidebarRoleName = (player) => {
    const roleId = roleIdMap[player];
    const category = (localStorage.getItem('category') || '').trim();
    const title = (localStorage.getItem('title') || '').trim();
    const subtopic = (localStorage.getItem('subtopic') || '').trim();
    
    // 현재 타이틀과 서브토픽이 어느 언어팩의 어떤 키에 해당하는지 확인
    const isAndroid = category === '안드로이드';
    const isAWS = category === '자율 무기 시스템';
    
    if (isAndroid) {
      if (title === '가정') {
        return roleId === 1 ? t_small.title_caregiver_k : roleId === 2 ? t_small.title_mother_l : t_small.title_child_j;
      }
      if (title === '국가 인공지능 위원회') {
        return roleId === 1 ? t_small.title_industry_rep : roleId === 2 ? t_small.title_consumer_rep : t_small.title_council_rep;
      }
      if (title === '국제 인류 발전 위원회') {
        return roleId === 1 ? t_small.title_industry_rep : roleId === 2 ? t_small.title_env_rep : t_small.title_consumer_rep;
      }
    }
    
    if (isAWS) {
      if (subtopic === 'AI 알고리즘 공개') {
        return roleId === 1 ? t_small.title_resident : roleId === 2 ? t_small.title_soldier_j : t_small.title_ethics_expert;
      }
      if (subtopic === 'AWS의 권한') {
        return roleId === 1 ? t_small.title_new_soldier : roleId === 2 ? t_small.title_veteran_soldier : t_small.title_commander;
      }
      if (subtopic === '사람이 죽지 않는 전쟁') {
        return roleId === 1 ? t_small.title_developer : roleId === 2 ? t_small.title_minister : t_small.title_council_rep;
      }
      if (subtopic === 'AWS 규제') {
        return roleId === 1 ? t_small.title_advisor : roleId === 2 ? t_small.title_diplomat : t_small.title_ngo_activist;
      }
    }
    return ''; 
  };

  useEffect(() => {
    const storedHost = localStorage.getItem('host_id');
    const storedMyRole = localStorage.getItem('myrole_id');
    const role1UserId = localStorage.getItem('role1_user_id');
    const role2UserId = localStorage.getItem('role2_user_id');
    const role3UserId = localStorage.getItem('role3_user_id');

    setHostId(storedHost);
    setMyRoleId(storedMyRole);
    setRoleUserMapping({
      role1_user_id: role1UserId, role2_user_id: role2UserId, role3_user_id: role3UserId,
    });

    const onResize = () => {
      const widthRatio = window.innerWidth / 1480;
      const heightRatio = window.innerHeight / 800;
      const scale = Math.min(widthRatio, heightRatio, 1);
      setZoom(Math.max(scale, 0.6));
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const statusInterval = setInterval(() => setMyVoiceSessionStatus(voiceManager.getStatus()), 100);
    return () => clearInterval(statusInterval);
  }, []);

  const getVoiceStateForRoleWithMyStatus = (roleId) => {
    const roleIdStr = String(roleId);
    if (roleIdStr === myRoleId) return { is_speaking: myVoiceSessionStatus.isSpeaking, is_mic_on: myVoiceSessionStatus.isConnected, nickname: myVoiceSessionStatus.nickname || '' };
    return getVoiceStateForRole(roleId);
  };

  const viewportOverride = allowScroll ? { overflowY: "auto", alignItems: "flex-start", justifyContent: "center", paddingTop: 24, paddingBottom: 24 } : {};
  const stageOverride = allowScroll ? { width: "100%", maxWidth: "1060px", minHeight: "720px" } : {};

  return (
    <>
      {!nodescription && openProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }} onClick={() => setOpenProfile(null)}>
          <div style={{ position: 'relative', background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 12px 30px rgba(0,0,0,0.25)' }} onClick={(e) => e.stopPropagation()}>
            {openProfile === '1P' && <CharacterPopup1 subtopic={subtopic} roleId={1} mateName={mateName} />}
            {openProfile === '2P' && <CharacterPopup2 subtopic={subtopic} roleId={2} mateName={mateName} />}
            {openProfile === '3P' && <CharacterPopup3 subtopic={subtopic} roleId={3} mateName={mateName} />}
            <img src={closeIcon} alt="close" style={{ position: 'absolute', top: 3, right: 3, width: 31, cursor: 'pointer' }} onClick={() => setOpenProfile(null)} />
          </div>
        </div>
      )}
      <Background bgIndex={2}>
        {showBackButton && (
          <div style={{ position: 'absolute', top: 0, left: -2, display: 'flex', alignItems: 'center', gap: 8, zIndex: 1000, cursor: 'pointer' }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <BackButton onClick={onBackClick} />
            </div>
          </div>
        )}
        {hostmessage && hostId === myRoleId && (
          <div style={{ position: 'fixed', top: '50%', left: '20px', transform: `translateY(calc(-50% + 200px)) scale(${zoom})`, transformOrigin: 'left top', zIndex: 10 }}>
            <HostInfoBadge 
              src={lang === 'ko' ? hostInfoSvg : hostInfoSvg_en} 
              alt="Host Info" 
              preset="hostInfo" 
              width={300} 
              height={300} 
            />
          </div>
        )}
        <style>{`
          html, body, #root { margin: 0; padding: 0; height: 100%; overflow: hidden; }
          .layout-viewport { position: fixed; inset: 0; overflow: auto; display: flex; align-items: center; justify-content: center; flex-direction: column; }
          .layout-sidebar { position: fixed; top: 50%; left: 0; transform: translateY(-50%) scale(${zoom}); transform-origin: left center; width: 300px; padding: 20px 0; display: flex; flex-direction: column; gap: 0px; align-items: flex-start; z-index: 10; }
          .layout-sidebar-profiles { display: flex; flex-direction: column; gap: 24px; align-items: flex-start; width: 100%; }
          .layout-sidebar-extra { margin-top: 10px; margin-left: 14px; align-self: flex-start; }
          .layout-stage { width: 1060px; min-height: 720px; height: auto; position: relative; transform: scale(${zoom}); transform-origin: center center; display: flex; flex-direction: column; align-items: center; padding: 5px 24px 32px; margin: 40px auto; }
          .layout-gameframe { width: auto; max-width: none; margin-bottom: 10px; display: flex; justify-content: center; }
        `}</style>
        <div className="layout-viewport" style={viewportOverride}>
          <aside className="layout-sidebar">
            <div className="layout-sidebar-profiles">
              {['1P', '2P', '3P'].map(p => {
                const mappedUserId = roleUserMapping[`role${roleIdMap[p]}_user_id`];
                return (
                  <UserProfile
                    key={p} player={p}
                    description={getSidebarRoleName(p)}
                    isLeader={hostId === roleIdMap[p].toString()}
                    isMe={myRoleId === roleIdMap[p].toString()}
                    isSpeaking={getVoiceStateForRoleWithMyStatus(roleIdMap[p]).is_speaking}
                    isMicOn={getVoiceStateForRoleWithMyStatus(roleIdMap[p]).is_mic_on}
                    nickname={getVoiceStateForRoleWithMyStatus(roleIdMap[p]).nickname}
                    nodescription={nodescription}
                    onClick={() => {
                      if (mappedUserId) {
                        setOpenProfile(p);
                        if (onProfileClick) onProfileClick(p);
                      }
                    }}
                    style={{ cursor: mappedUserId ? 'pointer' : 'default' }}
                  />
                );
              })}
            </div>
            {sidebarExtra && (
              <div className="layout-sidebar-extra">
                {sidebarExtra}
              </div>
            )}
          </aside>
          <section className="layout-stage" style={stageOverride}>
            <div className="layout-gameframe">
              <GameFrame
                topic={round != null ? `${t_small.round_label || 'Round'} ${round.toString().padStart(2, '0')} : ${getTranslatedValue(subtopic)}` : `${getTranslatedValue(subtopic)}`}
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