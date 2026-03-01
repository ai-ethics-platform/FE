import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import BackButton from '../components/BackButton';
import StatusCard from '../components/StatusCard';
import MicTestPopup from '../components/MicTestPopup';
import OutPopup from '../components/OutPopup';
import GameFrame from '../components/GameFrame';
import player1 from "../assets/1player_withnum.svg";
import player2 from "../assets/2player_withnum.svg";
import player3 from "../assets/3player_withnum.svg";
import axiosInstance from '../api/axiosInstance';
import { FontStyles, Colors } from '../components/styleConstants';
import codeBg from '../assets/roomcodebackground.svg';
// 상단 ESM 방식 임포트
import infoFrame from '../assets/Frame 345.svg';
import CancelReadyPopup from '../components/CancelReadyPopup';
// 언어팩 임포트
import { translations } from '../utils/language/index';

export default function WaitingRoom() {
  const location = useLocation();
  const navigate = useNavigate();

  // 프로젝트 표준 다국어 로드 로직
  const lang = localStorage.getItem('app_lang') || 'ko';
  const t = (lang !== 'ko') ? (translations[lang] || translations['en']) : translations['ko'];
  const tw = t.WaitingRoom || {}; // WaitingRoom 섹션 별도 참조

  // zoom 수정
  // const allTopics = ['안드로이드', '자율 무기 시스템'];

  // const initialTopic = location.state?.topic || '안드로이드';
  // const initialIndex = allTopics.indexOf(initialTopic);

  // zoom 수정
  // 기본 토픽 목록 (언어팩 적용)
  const defaultTopics = [tw.topics?.android, tw.topics?.aws];
  const [category, setCategory] = useState();
  // custom 모드 여부 확인
  const isCustomMode = Boolean(localStorage.getItem('code'));
  const creatorTitle = localStorage.getItem('creatorTitle') || tw.topics?.custom;

  // allTopics 구성
  const allTopics = isCustomMode ? [creatorTitle] : defaultTopics;

  // 최초 렌더링 시 localStorage 반영
  const [currentIndex, setCurrentIndex] = useState(() => {
    const stored = localStorage.getItem('category');
    const i = stored ? allTopics.indexOf(stored) : -1;
    if (i >= 0) return i;

    const fallback = isCustomMode
      ? creatorTitle
      : (location.state?.topic || allTopics[0]);

    const fi = allTopics.indexOf(fallback);
    return fi >= 0 ? fi : 0;
  });

  // 로컬 카테고리값과 UI 인덱스 동기화
  const syncTopicFromLocal = (value) => {
    const cat = (value != null ? value : localStorage.getItem('category')) || '';
    const idx = allTopics.indexOf(cat);
    if (idx >= 0 && idx !== currentIndex) {
      setCurrentIndex(idx);
    }
  };

  // 마운트 직후 동기화 실행
  useEffect(() => {
    syncTopicFromLocal();
  }, []);
  
  // 룸코드 복사 상태
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(room_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000); // 1초 후 제거
    });
  };

  // const setCategoryFromRoom = (room) => {
  //    if (room && typeof room.title === 'string' && room.title.length > 0) {
  //       localStorage.setItem('category', room.title);
  //    }
  // };

  // 폴링 타이머 ID 관리
  const pollingIntervalRef = useRef(null);

  // UI 및 팝업 상태
  const [showMicPopup, setShowMicPopup] = useState(false);
  const [showOutPopup, setShowOutPopup] = useState(false);
  const [myStatusIndex, setMyStatusIndex] = useState(0);
  const [showCancelPopup, setShowCancelPopup] = useState(false);

  // 유저 및 방 정보 상태
  const [myPlayerId, setMyPlayerId] = useState(null);
  const [hostUserId, setHostUserId] = useState(null);

  // 참가자 및 역할 배정 상태
  const [participants, setParticipants] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [statusIndexMap, setStatusIndexMap] = useState({});
  const [hasAssignedRoles, setHasAssignedRoles] = useState(false);

  // 폴링 및 업데이트 상태
  const [isPolling, setIsPolling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const room_code = localStorage.getItem('room_code');

  // 내 정보 조회 로직
  const loadMyInfo = async () => {
    try {
      let nickname = localStorage.getItem('nickname');
      let myUserId = localStorage.getItem('user_id');

      if (!nickname || !myUserId) {
        try {
          console.log('🔍 WaitingRoom: /users/me 호출 시도...');
          const { data: userInfo } = await axiosInstance.get('/users/me', {
            timeout: 5000,
          });
          myUserId = userInfo.id;
          nickname = userInfo.username || `Player_${myUserId}`;

          localStorage.setItem('nickname', nickname);
          localStorage.setItem('user_id', myUserId);
          console.log('✅ WaitingRoom: /users/me 성공:', { myUserId, nickname });
        } catch (apiErr) {
          const isCorsError = !apiErr.response && (apiErr.message?.includes('Network Error') || apiErr.code === 'ERR_NETWORK');
          if (isCorsError) {
            console.error('❌ WaitingRoom CORS 에러');
            console.warn('💡 백엔드 CORS 설정 확인 필요. localStorage 값 사용.');
          } else {
            console.error('❌ WaitingRoom: /users/me 호출 실패');
          }
          
          nickname = localStorage.getItem('nickname');
          myUserId = localStorage.getItem('user_id');
          
          if (!myUserId) {
            throw new Error('user_id 확인 불가');
          }
        }
      }

      setMyPlayerId(String(myUserId));
      return myUserId;
    } catch (err) {
      console.error(`내 정보 로드 실패:`, err);
      return null;
    }
  };

  // 참가자 데이터 및 역할 배정 확인 로직
  const loadParticipants = async () => {
    try {
      const { data: room } = await axiosInstance.get(`/rooms/code/${room_code}`);
      if (room?.title) {
        localStorage.setItem('category', room.title);
        if(isCustomMode){
          localStorage.setItem('creatorTitle', room.title);
        }
      }
      setParticipants(room.participants);
      if (room && typeof room.title === 'string' && room.title.length > 0) {
        localStorage.setItem('category', room.title);
        syncTopicFromLocal(room.title);   // 저장 직후 인덱스 동기화
      }
      const hostUserId = room.created_by;
      setHostUserId(String(hostUserId));

      const readyMap = {};
      room.participants.forEach(p => {
        readyMap[String(p.user_id)] = p.is_ready ? 1 : 0;
      });
      setStatusIndexMap(readyMap);

      const hasRoleAssignments = room.participants.length === 3 && 
      room.participants.every(p => p.role_id != null);
      
      if (hasRoleAssignments && !hasAssignedRoles) {        
        const roleUserMap = {};
        room.participants.forEach(p => {
          roleUserMap[p.role_id] = String(p.user_id);
        });
        
        localStorage.setItem('role1_user_id', roleUserMap[1] || '');
        localStorage.setItem('role2_user_id', roleUserMap[2] || '');
        localStorage.setItem('role3_user_id', roleUserMap[3] || '');
        
        const myUserId = localStorage.getItem('user_id');
        const myParticipant = room.participants.find(p => String(p.user_id) === String(myUserId));
        if (myParticipant && myParticipant.role_id) {
          localStorage.setItem('myrole_id', String(myParticipant.role_id));
        }
        
        const hostParticipant = room.participants.find(p => String(p.user_id) === String(hostUserId));
        if (hostParticipant && hostParticipant.role_id) {
          localStorage.setItem('host_id', String(hostParticipant.role_id));
        }
        
        setHasAssignedRoles(true);
        
        setTimeout(() => {
          updateAssignmentsWithRoles();
        }, 5000);
      }

      return { participants: room.participants, hostUserId };
    } catch (err) {
      console.error(`participants 로드 실패:`, err);
      return { participants: [], hostUserId: null };
    }
  };

  // 배정된 역할 데이터와 상태 동기화
  const updateAssignmentsWithRoles = async () => {
    if (participants.length === 0 || isUpdating) return;
    
    setIsUpdating(true);

    try {      
      const updatedAssignments = participants.map(p => {
        let userRoleId = null;
        for (let roleId = 1; roleId <= 3; roleId++) {
          const roleUserId = localStorage.getItem(`role${roleId}_user_id`);
          if (roleUserId && String(roleUserId) === String(p.user_id)) {
            userRoleId = roleId;
            break;
          }
        }

        return {
          player_id: p.user_id,
          is_host: Boolean(p.is_host),
          role_id: userRoleId,
        };
      });
      setAssignments(updatedAssignments);
      
      if (myPlayerId) {
        const myAssign = updatedAssignments.find(a => String(a.player_id) === myPlayerId);
        if (myAssign?.role_id != null) {
          const currentMyRole = localStorage.getItem('myrole_id');
          if (currentMyRole !== String(myAssign.role_id)) {
            localStorage.setItem('myrole_id', String(myAssign.role_id));
          }
        }
      }
      
      if (hostUserId) {
        const hostAssign = updatedAssignments.find(a => String(a.player_id) === String(hostUserId));
        if (hostAssign?.role_id != null) {
          const currentHostId = localStorage.getItem('host_id');
          if (currentHostId !== String(hostAssign.role_id)) {
            localStorage.setItem('host_id', String(hostAssign.role_id));
          }
        }
      }
      
    } finally {
      setIsUpdating(false);
    }
  };

  // 역할 배정 여부 체크
  const checkIfRolesAlreadyAssigned = () => {
    const role1 = localStorage.getItem('role1_user_id');
    const role2 = localStorage.getItem('role2_user_id');
    const role3 = localStorage.getItem('role3_user_id');
    
    return role1 && role2 && role3;
  };

  // API 데이터 기준 역할 배정 여부 확인
  const checkRolesFromAPI = (participants) => {
    if (participants.length !== 3) return false;
    return participants.every(p => p.role_id != null);
  };

  // 방장 전용 역할 배정 API 호출
  const assignRoles = async () => {
    if (myPlayerId !== hostUserId) return;

    if (hasAssignedRoles || checkIfRolesAlreadyAssigned()) {
      setHasAssignedRoles(true);
      return;
    }

    try {
      setHasAssignedRoles(true);
      console.log(` 방장: 역할 배정 API 호출 시작`);
      
      const { data: roleAssignmentResult } = await axiosInstance.post(`/rooms/assign-roles/${room_code}`);
      
      if (roleAssignmentResult.assignments) {
        const assignments = roleAssignmentResult.assignments;
        const myUserId = localStorage.getItem('user_id');
        
        const roleUserMap = {};
        assignments.forEach(assignment => {
          roleUserMap[assignment.role_id] = String(assignment.player_id);
        });
        
        localStorage.setItem('role1_user_id', roleUserMap[1] || '');
        localStorage.setItem('role2_user_id', roleUserMap[2] || '');
        localStorage.setItem('role3_user_id', roleUserMap[3] || '');
        
        const myAssignment = assignments.find(a => String(a.player_id) === String(myUserId));
        if (myAssignment) {
          localStorage.setItem('myrole_id', String(myAssignment.role_id));
        }
        
        const hostAssignment = assignments.find(a => String(a.player_id) === String(hostUserId));
        if (hostAssignment) {
          localStorage.setItem('host_id', String(hostAssignment.role_id));
        }
      }
      
      setTimeout(() => {
        updateAssignmentsWithRoles();
      }, 5000);
      
    } catch (err) {
      console.error(` 방장: 역할 배정 실패:`, err);
      setHasAssignedRoles(false);
    }
  };

  useEffect(() => {
    if (participants.length === 3 && myPlayerId === hostUserId) {
      const hasApiRoles = participants.every(p => p.role_id != null);
      if (!hasApiRoles) {
        assignRoles();
      }
    }
  }, [participants, myPlayerId, hostUserId]);
  
  // 방 상태 주기적 확인 (폴링)
  const pollRoomStatus = async () => {
    try {
      const { data: room } = await axiosInstance.get(`/rooms/code/${room_code}`);
      setParticipants(room.participants);
      
      const readyMap = {};
      room.participants.forEach(p => {
        readyMap[String(p.user_id)] = p.is_ready ? 1 : 0;
      });
      setStatusIndexMap(readyMap);
      
      if (myPlayerId) {
        const myParticipant = room.participants.find(p => String(p.user_id) === myPlayerId);
        if (myParticipant) {
          const newStatusIndex = myParticipant.is_ready ? 1 : 0;
          if (newStatusIndex !== myStatusIndex) {
            setMyStatusIndex(newStatusIndex);
          }
        }
      }

      // 인원 부족 시 역할 데이터 초기화
      if (room.participants.length < 3) {
        localStorage.removeItem('role1_user_id');
        localStorage.removeItem('role2_user_id');
        localStorage.removeItem('role3_user_id');
        localStorage.removeItem('myrole_id');
        localStorage.removeItem('host_id');
        setAssignments([]);
        setHasAssignedRoles(false);
      }

      // 3명 복귀 시 역할 재배정
      if (room.participants.length === 3 && !room.participants.every(p => p.role_id != null)) {
        if (String(myPlayerId) === String(room.created_by)) {
          assignRoles();
        }
      }
      
      const hasApiRoles = room.participants.length === 3 && room.participants.every(p => p.role_id != null);
      if (hasApiRoles) {
        const roleUserMap = {};
        room.participants.forEach(p => {
          if (p.role_id) roleUserMap[p.role_id] = String(p.user_id);
        });
        
        const currentRole1 = localStorage.getItem('role1_user_id');
        if (currentRole1 !== (roleUserMap[1] || '')) {
          localStorage.setItem('role1_user_id', roleUserMap[1] || '');
          localStorage.setItem('role2_user_id', roleUserMap[2] || '');
          localStorage.setItem('role3_user_id', roleUserMap[3] || '');
          
          const myUserId = localStorage.getItem('user_id');
          const myParticipant = room.participants.find(p => String(p.user_id) === String(myUserId));
          if (myParticipant?.role_id) localStorage.setItem('myrole_id', String(myParticipant.role_id));
          
          const hostUserId = String(room.created_by);
          const hostParticipant = room.participants.find(p => String(p.user_id) === hostUserId);
          if (hostParticipant?.role_id) localStorage.setItem('host_id', String(hostParticipant.role_id));
          
          setHasAssignedRoles(true);
          setTimeout(() => updateAssignmentsWithRoles(), 5000);
        }
      }
      
      const readyCount = room.participants.filter(p => p.is_ready).length;
      if (readyCount === room.participants.length && room.participants.length === 3) {
        stopPolling();
        navigate('/gameintro');
        return; 
      }
      
    } catch (err) {
      console.error(`폴링 실패:`, err);
    }
  };

  // 폴링 시작 및 중지 로직
  const startPolling = () => {
    if (pollingIntervalRef.current) return;
    setIsPolling(true);
    pollRoomStatus();
    pollingIntervalRef.current = setInterval(pollRoomStatus, 5000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
  };

  // 초기화 및 언마운트 처리
  useEffect(() => {
    const initializeRoom = async () => {      
      const myUserId = await loadMyInfo();
      if (!myUserId) return;
      
      const { hostUserId: loadedHostUserId } = await loadParticipants();
      if (!loadedHostUserId) return;
      
      if (checkIfRolesAlreadyAssigned()) setHasAssignedRoles(true);
      
      setTimeout(() => updateAssignmentsWithRoles(), 200);
      setTimeout(() => startPolling(), 5000);
    };
    
    initializeRoom();
    return () => stopPolling();
  }, [room_code]);

  // 참가자 변동 시 배정 정보 업데이트
  useEffect(() => {
    if (participants.length > 0) {
      const timeoutId = setTimeout(() => updateAssignmentsWithRoles(), 100);
      return () => clearTimeout(timeoutId);
    }
  }, [participants]);

  // 마이크 테스트 확인 후 준비 완료 API 호출
  const handleMicConfirm = async () => {
    try {
      await axiosInstance.post('/rooms/ready', { room_code });
      setMyStatusIndex(1);
      setShowMicPopup(false);
      setTimeout(() => pollRoomStatus(), 500);
    } catch (err) {
      console.error(`ready 실패:`, err);
    }
  };

  const getPlayerImage = (roleId) => {
    const playerImages = { 1: player1, 2: player2, 3: player3 };
    return playerImages[roleId] || player1;
  };

  // 나를 가운데로 정렬한 플레이어 순서 반환
  const getOrderedPlayers = () => {
    if (!myPlayerId || participants.length !== 3) {
      return participants.map(p => p.user_id);
    }
    const allPlayerIds = participants.map(p => p.user_id);
    const otherPlayerIds = allPlayerIds.filter(id => String(id) !== String(myPlayerId));
    return [otherPlayerIds[0], myPlayerId, otherPlayerIds[1]].filter(Boolean);
  };

  // 디버깅용 전역 객체 등록
  useEffect(() => {
    window.debugWaitingRoom = {
      getStatus: () => ({
        isPolling,
        myPlayerId,
        hostUserId,
        participants: participants.length,
        hasAssignedRoles,
        statusIndexMap,
      }),
      forcePoll: pollRoomStatus,
      startPolling,
      stopPolling
    };
    return () => { delete window.debugWaitingRoom; };
  }, [isPolling, myPlayerId, hostUserId, participants, hasAssignedRoles, statusIndexMap]);
  
  const handleCancelConfirm = () => {
    setMyStatusIndex(0);
    setShowCancelPopup(false);
  };

  return (
    <Background bgIndex={2}>
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 1000 }}>
        {/* 뒤로 가기 버튼 (사용자 설정값 유지) */}
        <div style={{ position: 'absolute', zIndex: 2, top: -10, left: -10 }}>
          <BackButton onClick={() => setShowOutPopup(true)} /> 
        </div>

        {/* 룸코드 박스 (사용자 설정값 유지) */}
        <div
          style={{
            position: 'absolute',
            top: -10,
            left: 165, 
            width: 200,
            height: 80,
            overflow: 'hidden',
            cursor: 'pointer',
            zIndex: 1,
          }}
        >
          <img
            src={codeBg}
            alt="code background"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'rotate(180deg)',
              clipPath: 'polygon(12% 0%, 100% 0%, 100% 100%, 0% 100%)'
            }}
          />
          <span
            onClick={handleCopy}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...FontStyles.title,
              color: Colors.brandPrimary,
              userSelect: 'none',
            }}
          >
            {tw.code}: {room_code}
          </span>
          {copied && (
            <div
              style={{
                position: 'absolute',
                top: '58px',
                left: '75%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.75)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              {tw.copied}
            </div>
          )}
        </div>

        {/* 정보 안내 프레임 */}
        <div 
          style={{ 
            position: 'absolute', 
            top: 65,  
            left: 150, 
            width: 210, 
            height: 60, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img 
            src={infoFrame} 
            alt="info frame" 
            style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1 }} 
          />
          <span 
            style={{ 
              position: 'relative', 
              zIndex: 2, 
              fontSize: '11px', 
              color: 'white',
              fontWeight: '500',
              marginTop: '5px' 
            }}
          >
            {tw.infoText}
          </span>
        </div>
      </div>

      {showOutPopup && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <OutPopup onClose={() => setShowOutPopup(false)} />
        </div>
      )}

      {/* 상단 게임 주제 프레임 */}
      <div style={{ position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%)' }}>
        <GameFrame
          topic={allTopics[currentIndex]}
          hideArrows={true}
        />
      </div>

      {/* 플레이어 카드 영역 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 32,
        paddingTop: 160,
        height: '100vh',
        boxSizing: 'border-box'
      }}>
        {getOrderedPlayers().map((id, idx) => {
          const assign = assignments.find(a => String(a.player_id) === String(id));
          const isOwner = String(id) === String(hostUserId);
          const isMe = String(id) === String(myPlayerId);
          
          return (
            <div key={id} style={{ transform: `scale(${idx === 1 ? 1 : 0.9})` }}>
              <StatusCard
                player={`${id}${tw.player}`}
                isOwner={isOwner}
                isMe={isMe}
                roleId={assign?.role_id}
                statusIndex={isMe ? myStatusIndex : statusIndexMap[String(id)] || 0}
                onContinueClick={() => setShowMicPopup(true)}
                onCancelClick={() => setShowCancelPopup(true)}
                onStatusChange={isMe ? setMyStatusIndex : undefined}
              />
            </div>
          );
        })}
      </div>

      {showMicPopup && (
        <MicTestPopup
          userImage={getPlayerImage(Number(localStorage.getItem('myrole_id')))}
          onConfirm={handleMicConfirm}
        />
      )}

      {showCancelPopup && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <CancelReadyPopup
            onClose={() => setShowCancelPopup(false)}
            onCancelConfirmed={handleCancelConfirm}
          />
        </div>
      )}
    </Background>
  );
}