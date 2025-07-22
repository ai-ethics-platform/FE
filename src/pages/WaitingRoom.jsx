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

export default function WaitingRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const allTopics = ['안드로이드', '자율 무기 시스템'];
  const initialTopic = location.state?.topic || '안드로이드';
  const initialIndex = allTopics.indexOf(initialTopic);
  
  // 디버깅을 위한 고유 클라이언트 ID 생성
  const [clientId] = useState(() => {
    const id = Math.random().toString(36).substr(2, 9);
    console.log(`🔍 클라이언트 ID: ${id}`);
    return id;
  });

  // ■ ❶ useRef로 폴링 타이머 ID 관리
  const pollingIntervalRef = useRef(null);

  // 1) UI 상태
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [showMicPopup, setShowMicPopup] = useState(false);
  const [showOutPopup, setShowOutPopup] = useState(false);
  const [myStatusIndex, setMyStatusIndex] = useState(0);

  // 2) 유저 & 방 정보
  const [myPlayerId, setMyPlayerId] = useState(null);
  const [hostUserId, setHostUserId] = useState(null);

  // 3) 참가자 & 역할 상태
  const [participants, setParticipants] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [statusIndexMap, setStatusIndexMap] = useState({});
  const [hasAssignedRoles, setHasAssignedRoles] = useState(false);

  // 4) 폴링 관련 상태 (표시용)
  const [isPolling, setIsPolling] = useState(false);

  // 업데이트 중복 방지 플래그
  const [isUpdating, setIsUpdating] = useState(false);
 
  const room_code = localStorage.getItem('room_code');

  // A) 초기 데이터 로드 - 내 정보 조회
  const loadMyInfo = async () => {
    try {
      const { data: userInfo } = await axiosInstance.get('/users/me');
      const myUserId = userInfo.id;
      const nickname = userInfo.username || `Player_${myUserId}`;
      
      localStorage.setItem('nickname', nickname);
      localStorage.setItem('user_id', myUserId);
      
      setMyPlayerId(String(myUserId));
      
      return myUserId;
    } catch (err) {
      console.error(`❌ [${clientId}] 내 정보 로드 실패:`, err);
      return null;
    }
  };

  // B) participants 로드 및 역할 배정 확인
  const loadParticipants = async () => {
    try {
      console.log(`🔄 [${clientId}] API 호출: /rooms/code/${room_code}`);
      const { data: room } = await axiosInstance.get(`/rooms/code/${room_code}`);
      console.log(`📊 [${clientId}] API 응답:`, room);
      
      setParticipants(room.participants);
      
      const hostUserId = room.created_by;
      setHostUserId(String(hostUserId));

      const readyMap = {};
      room.participants.forEach(p => {
        readyMap[String(p.user_id)] = p.is_ready ? 1 : 0;
      });
      setStatusIndexMap(readyMap);

      const hasRoleAssignments = room.participants.length === 3 && 
                                room.participants.every(p => p.role_id != null);
      
      console.log(`🎭 [${clientId}] 역할 배정 상태:`, {
        participantCount: room.participants.length,
        hasRoleAssignments,
        participants: room.participants.map(p => ({
          user_id: p.user_id,
          nickname: p.nickname,
          role_id: p.role_id,
          is_ready: p.is_ready
        }))
      });
      
      if (hasRoleAssignments && !hasAssignedRoles) {
        console.log(`🎭 [${clientId}] API에서 역할 배정 발견!`);
        
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
          console.log(`💾 [${clientId}] 내 역할 저장: ${myParticipant.role_id}`);
        }
        
        const hostParticipant = room.participants.find(p => String(p.user_id) === String(hostUserId));
        if (hostParticipant && hostParticipant.role_id) {
          localStorage.setItem('host_id', String(hostParticipant.role_id));
          console.log(`💾 [${clientId}] 호스트 역할 저장: ${hostParticipant.role_id}`);
        }
        
        setHasAssignedRoles(true);
        
        setTimeout(() => {
          updateAssignmentsWithRoles();
        }, 100);
      }

      return { participants: room.participants, hostUserId };
    } catch (err) {
      console.error(`❌ [${clientId}] participants 로드 실패:`, err);
      return { participants: [], hostUserId: null };
    }
  };

  const updateAssignmentsWithRoles = async () => {
    if (participants.length === 0 || isUpdating) return;
    
    setIsUpdating(true);

    try {
      console.log(`🔄 [${clientId}] assignments 업데이트 시작`, { participantsCount: participants.length });
      
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

      console.log(`📋 [${clientId}] 업데이트된 assignments:`, updatedAssignments);
      setAssignments(updatedAssignments);
      
      if (myPlayerId) {
        const myAssign = updatedAssignments.find(a => String(a.player_id) === myPlayerId);
        if (myAssign?.role_id != null) {
          const currentMyRole = localStorage.getItem('myrole_id');
          if (currentMyRole !== String(myAssign.role_id)) {
            localStorage.setItem('myrole_id', String(myAssign.role_id));
            console.log(`💾 [${clientId}] 내 역할 업데이트: ${myAssign.role_id}`);
          }
        }
      }
      
      if (hostUserId) {
        const hostAssign = updatedAssignments.find(a => String(a.player_id) === String(hostUserId));
        if (hostAssign?.role_id != null) {
          const currentHostId = localStorage.getItem('host_id');
          if (currentHostId !== String(hostAssign.role_id)) {
            localStorage.setItem('host_id', String(hostAssign.role_id));
            console.log(`💾 [${clientId}] 호스트 역할 업데이트: ${hostAssign.role_id}`);
          }
        }
      }
      
    } finally {
      setIsUpdating(false);
    }
  };

  const checkIfRolesAlreadyAssigned = () => {
    const role1 = localStorage.getItem('role1_user_id');
    const role2 = localStorage.getItem('role2_user_id');
    const role3 = localStorage.getItem('role3_user_id');
    
    return role1 && role2 && role3;
  };

  const checkRolesFromAPI = (participants) => {
    if (participants.length !== 3) return false;
    return participants.every(p => p.role_id != null);
  };

  const assignRoles = async () => {
    if (myPlayerId !== hostUserId) {
      console.log(`👤 [${clientId}] 방장이 아니므로 역할 배정 스킵`);
      return;
    }

    if (hasAssignedRoles || checkIfRolesAlreadyAssigned()) {
      console.log(`✅ [${clientId}] 역할이 이미 배정되어 있음`);
      setHasAssignedRoles(true);
      return;
    }

    try {
      setHasAssignedRoles(true);
      console.log(`🚀 [${clientId}] 👑 방장: 역할 배정 API 호출 시작`);
      
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
        
        console.log(`💾 [${clientId}] 👑 방장: 로컬스토리지 저장 완료`);
      }
      
      setTimeout(() => {
        updateAssignmentsWithRoles();
      }, 300);
      
    } catch (err) {
      console.error(`❌ [${clientId}] 👑 방장: 역할 배정 실패:`, err);
      setHasAssignedRoles(false);
    }
  };

  // ■ ❷ 폴링 함수 - 방 상태를 주기적으로 확인
  const pollRoomStatus = async () => {
    try {
      console.log(`🔄 [${clientId}] 폴링 실행 중...`);
      const { data: room } = await axiosInstance.get(`/rooms/code/${room_code}`);
      console.log(`📊 [${clientId}] 폴링 응답:`, {
        participantCount: room.participants.length,
        participants: room.participants.map(p => ({
          user_id: p.user_id,
          nickname: p.nickname,
          role_id: p.role_id,
          is_ready: p.is_ready,
          is_host: p.is_host
        }))
      });
      
      // 1. 참가자 업데이트
      setParticipants(room.participants);
      
      // 2. 준비 상태 맵 업데이트
      const readyMap = {};
      room.participants.forEach(p => {
        readyMap[String(p.user_id)] = p.is_ready ? 1 : 0;
      });
      setStatusIndexMap(readyMap);
      console.log(`📊 [${clientId}] 준비 상태 맵:`, readyMap);
      
      // 3. 내 준비 상태 업데이트
      if (myPlayerId) {
        const myParticipant = room.participants.find(p => String(p.user_id) === myPlayerId);
        if (myParticipant) {
          const newStatusIndex = myParticipant.is_ready ? 1 : 0;
          if (newStatusIndex !== myStatusIndex) {
            console.log(`🔄 [${clientId}] 내 준비 상태 업데이트: ${myStatusIndex} → ${newStatusIndex}`);
            setMyStatusIndex(newStatusIndex);
          }
        }
      }
      
      // 4. 역할 배정 확인 및 적용
      const hasApiRoles = room.participants.length === 3 && 
                         room.participants.every(p => p.role_id != null);
      
      if (hasApiRoles) {
        console.log(`🎭 [${clientId}] 폴링에서 역할 배정 발견!`);
        
        const roleUserMap = {};
        room.participants.forEach(p => {
          if (p.role_id) {
            roleUserMap[p.role_id] = String(p.user_id);
          }
        });
        
        // localStorage 업데이트 여부 확인
        const currentRole1 = localStorage.getItem('role1_user_id');
        const currentRole2 = localStorage.getItem('role2_user_id');
        const currentRole3 = localStorage.getItem('role3_user_id');
        
        if (currentRole1 !== (roleUserMap[1] || '') ||
            currentRole2 !== (roleUserMap[2] || '') ||
            currentRole3 !== (roleUserMap[3] || '')) {
          
          console.log(`💾 [${clientId}] 역할 매핑 업데이트:`, roleUserMap);
          localStorage.setItem('role1_user_id', roleUserMap[1] || '');
          localStorage.setItem('role2_user_id', roleUserMap[2] || '');
          localStorage.setItem('role3_user_id', roleUserMap[3] || '');
          
          // 내 역할 업데이트
          const myUserId = localStorage.getItem('user_id');
          const myParticipant = room.participants.find(p => String(p.user_id) === String(myUserId));
          if (myParticipant && myParticipant.role_id) {
            localStorage.setItem('myrole_id', String(myParticipant.role_id));
            console.log(`💾 [${clientId}] 내 역할 업데이트: ${myParticipant.role_id}`);
          }
          
          // 호스트 역할 업데이트
          const hostUserId = String(room.created_by);
          const hostParticipant = room.participants.find(p => String(p.user_id) === hostUserId);
          if (hostParticipant && hostParticipant.role_id) {
            localStorage.setItem('host_id', String(hostParticipant.role_id));
            console.log(`💾 [${clientId}] 호스트 역할 업데이트: ${hostParticipant.role_id}`);
          }
          
          setHasAssignedRoles(true);
          
          // assignments 즉시 업데이트
          setTimeout(() => {
            updateAssignmentsWithRoles();
          }, 100);
        }
      }
      
      // 5. 모든 유저가 준비 완료되었는지 확인 - 최우선 체크
      const readyCount = room.participants.filter(p => p.is_ready).length;
      console.log(`✅ [${clientId}] 준비 완료 현황: ${readyCount}/${room.participants.length}`);
      
      if (readyCount === room.participants.length && room.participants.length === 3) {
        console.log(`🚀 [${clientId}] 모두 준비 완료 → 게임 시작`);
        
        // 🔥 폴링을 즉시 중지
        stopPolling();
        
        // 게임 화면으로 이동
        navigate('/gameintro');
        return; // 함수 조기 종료
      }
      
    } catch (err) {
      console.error(`❌ [${clientId}] 폴링 실패:`, err);
    }
  };

  // ■ ❸ 폴링 시작 함수
  const startPolling = () => {
    // 이미 폴링 중이면 중복 시작 방지
    if (pollingIntervalRef.current) {
      console.log(`⚠️ [${clientId}] 폴링이 이미 실행 중`);
      return;
    }
    
    console.log(`🔄 [${clientId}] 폴링 시작 (5초 간격)`);
    setIsPolling(true);
    
    // 즉시 한 번 실행
    pollRoomStatus();
    
    // 5초마다 폴링
    pollingIntervalRef.current = setInterval(() => {
      pollRoomStatus();
    }, 5000);
  };

  // ■ ❹ 폴링 중지 함수
  const stopPolling = () => {
    console.log(`⏹️ [${clientId}] stopPolling 호출됨`);
    
    if (pollingIntervalRef.current) {
      console.log(`⏹️ [${clientId}] 폴링 인터벌 클리어: ${pollingIntervalRef.current}`);
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    setIsPolling(false);
    console.log(`⏹️ [${clientId}] 폴링 상태 업데이트 완료`);
  };

  // ■ ❺ 초기화 useEffect
  useEffect(() => {
    const initializeRoom = async () => {
      console.log(`🚀 [${clientId}] 초기화 시작`);
      
      const myUserId = await loadMyInfo();
      if (!myUserId) {
        console.error(`❌ [${clientId}] 사용자 정보 로드 실패`);
        return;
      }
      
      const { hostUserId: loadedHostUserId } = await loadParticipants();
      if (!loadedHostUserId) {
        console.error(`❌ [${clientId}] 호스트 정보 로드 실패`);
        return;
      }
      
      const isHost = String(myUserId) === String(loadedHostUserId);
      console.log(`👤 [${clientId}] 사용자 역할 확인:`, { 
        myUserId, 
        hostUserId: loadedHostUserId, 
        isHost: isHost ? '방장' : '일반 유저' 
      });
      
      if (checkIfRolesAlreadyAssigned()) {
        setHasAssignedRoles(true);
      }
      
      setTimeout(() => {
        updateAssignmentsWithRoles();
      }, 200);
      
      // 폴링 시작
      setTimeout(() => {
        startPolling();
      }, 1000);
    };
    
    initializeRoom();
    
    // ■ ❻ 컴포넌트 언마운트 시 또는 room_code 변경 시 폴링 중지
    return () => {
      console.log(`🧹 [${clientId}] 컴포넌트 cleanup - 폴링 중지`);
      stopPolling();
    };
  }, [room_code]);

  // 방장이고 참가자가 3명일 때 역할 배정
  useEffect(() => {
    if (
      participants.length === 3 &&
      myPlayerId === hostUserId &&
      !hasAssignedRoles
    ) {
      assignRoles();
    }
  }, [participants, myPlayerId, hostUserId, hasAssignedRoles]);

  // 참가자 변경 시 assignments 업데이트
  useEffect(() => {
    if (participants.length > 0) {
      const timeoutId = setTimeout(() => {
        updateAssignmentsWithRoles();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [participants]);

  const handleMicConfirm = async () => {
    try {
      console.log(`🎤 [${clientId}] 준비하기 API 호출`);
      const { data } = await axiosInstance.post('/rooms/ready', { room_code });
      
      setMyStatusIndex(1);
      setShowMicPopup(false);
      
      // 준비 완료 후 즉시 폴링으로 상태 확인 (한 번만)
      setTimeout(() => {
        pollRoomStatus();
      }, 500);
      
    } catch (err) {
      console.error(`❌ [${clientId}] ready 실패:`, err);
    }
  };

  const getPlayerImage = (roleId) => {
    const playerImages = {
      1: player1,
      2: player2,
      3: player3
    };
    return playerImages[roleId] || player1;
  };

  const getOrderedPlayers = () => {
    console.log(`🎯 [${clientId}] getOrderedPlayers 호출:`, {
      myPlayerId,
      participantsLength: participants.length,
      assignmentsLength: assignments.length,
      participants: participants.map(p => ({ user_id: p.user_id, nickname: p.nickname })),
      assignments: assignments.map(a => ({ player_id: a.player_id, role_id: a.role_id }))
    });

    // participants가 있으면 항상 3명을 표시 (assignments가 없어도)
    if (!myPlayerId || participants.length !== 3) {
      const playerIds = participants.map(p => p.user_id);
      console.log(`⚠️ [${clientId}] 조건 미충족, 기본 순서 반환:`, playerIds);
      return playerIds;
    }

    // 나를 가운데 놓고 나머지를 양옆에 배치
    const allPlayerIds = participants.map(p => p.user_id);
    const otherPlayerIds = allPlayerIds.filter(id => String(id) !== String(myPlayerId));
    
    const orderedPlayers = [
      otherPlayerIds[0], // 왼쪽
      myPlayerId,        // 가운데 (나)
      otherPlayerIds[1]  // 오른쪽
    ].filter(Boolean);
    
    console.log(`✅ [${clientId}] 최종 플레이어 순서:`, {
      left: otherPlayerIds[0],
      center: myPlayerId,
      right: otherPlayerIds[1],
      result: orderedPlayers
    });

    return orderedPlayers;
  };

  // 디버깅용 전역 함수
  useEffect(() => {
    window.debugWaitingRoom = {
      getStatus: () => ({
        clientId,
        isPolling,
        pollingIntervalRef: pollingIntervalRef.current,
        myPlayerId,
        hostUserId,
        participants: participants.length,
        hasAssignedRoles,
        statusIndexMap,
        assignments: assignments.length,
      }),
      
      forcePoll: () => {
        console.log('🔧 강제 폴링 실행');
        pollRoomStatus();
      },
      
      startPolling: () => {
        console.log('🔧 폴링 시작');
        startPolling();
      },
      
      stopPolling: () => {
        console.log('🔧 폴링 중지');
        stopPolling();
      }
    };

    return () => {
      delete window.debugWaitingRoom;
    };
  }, [isPolling, myPlayerId, hostUserId, participants, hasAssignedRoles, statusIndexMap, assignments]);


  return (
    <Background bgIndex={3}>
      {/* 디버깅 정보 */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '12px',
        borderRadius: '6px',
        fontSize: '11px',
        zIndex: 1000,
        maxWidth: '350px',
        fontFamily: 'monospace'
      }}>
        <div style={{color: '#00ff00'}}>🔍 Client: {clientId}</div>
        <div style={{color: isPolling ? '#00ff00' : '#ff0000'}}>
          폴링: {isPolling ? '✅ 실행중' : '❌ 중지'}
        </div>
        <div style={{color: '#ffff00'}}>👥 참가자: {participants.length}/3</div>
        <div style={{color: '#00ffff'}}>👤 내 ID: {myPlayerId}</div>
        <div style={{color: '#ff00ff'}}>👑 호스트 ID: {hostUserId}</div>
        <div style={{color: myPlayerId === hostUserId ? '#00ff00' : '#ff0000'}}>
          🎯 방장: {myPlayerId === hostUserId ? 'YES' : 'NO'}
        </div>
        <div style={{color: hasAssignedRoles ? '#00ff00' : '#ff0000'}}>
          🎭 역할배정: {hasAssignedRoles ? 'DONE' : myPlayerId === hostUserId ? 'HOST_PENDING' : 'POLLING'}
        </div>
        <div>🎪 내 역할: {localStorage.getItem('myrole_id') || 'NONE'}</div>
        <div>👑 호스트 역할: {localStorage.getItem('host_id') || 'NONE'}</div>
        <div>✅ 준비완료: {participants.filter(p => p.is_ready).length}/3</div>
        <div>🔄 업데이트 중: {isUpdating ? 'YES' : 'NO'}</div>
        <div>📊 Assignments: {assignments.length}</div>
        <div>🎯 현재 순서: {getOrderedPlayers().join(', ')}</div>
        
        <div style={{ 
          fontSize: '10px', 
          marginTop: '8px', 
          borderTop: '1px solid #555', 
          paddingTop: '5px',
          color: '#cccccc'
        }}>
          <div>📦 LocalStorage:</div>
          <div>role1: {localStorage.getItem('role1_user_id') || 'NULL'}</div>
          <div>role2: {localStorage.getItem('role2_user_id') || 'NULL'}</div>
          <div>role3: {localStorage.getItem('role3_user_id') || 'NULL'}</div>
        </div>
      </div>

      {/* 뒤로 가기 */}
      <div
        style={{
          position: 'absolute',
          top: -10,
          left: -10,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          zIndex: 1000,
          cursor: 'pointer',
        }}
        onClick={() => setShowOutPopup(true)}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <BackButton />
        </div>
        <div
          style={{
            position: 'relative',
            width: 200,
            height: 80,
            marginLeft: -40,
            zIndex: 1,
            overflow: 'hidden'
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
            CODE: {room_code}
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

      {/* 주제 프레임 */}
      <div style={{
        position: 'absolute', top: '6%', left: '50%',
        transform: 'translateX(-50%)'
      }}>
        <GameFrame
          topic={allTopics[currentIndex]}
          onLeftClick={() => {
            const next = Math.max(currentIndex - 1, 0);
            setCurrentIndex(next);
            localStorage.setItem('category', allTopics[next]);
          }}
          onRightClick={() => {
            const next = Math.min(currentIndex + 1, allTopics.length - 1);
            setCurrentIndex(next);
            localStorage.setItem('category', allTopics[next]);
          }}
          disableLeft={currentIndex === 0}
          disableRight={currentIndex === allTopics.length - 1}
          hideArrows={false}
        />
      </div>

      {/* 플레이어 카드 */}
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
          console.log(`🎨 [${clientId}] StatusCard 렌더링:`, {
            id,
            idx,
            myPlayerId,
            isMe: String(id) === String(myPlayerId),
            hostUserId
          });
          
          const assign = assignments.find(a => String(a.player_id) === String(id));
          const isOwner = String(id) === String(hostUserId);
          const isMe = String(id) === String(myPlayerId);
          
          console.log(`🎨 [${clientId}] StatusCard ${idx} 상세:`, {
            id,
            assign,
            isOwner,
            isMe,
            roleId: assign?.role_id,
            statusIndex: isMe ? myStatusIndex : statusIndexMap[String(id)] || 0
          });
          
          return (
            <div key={id} style={{ transform: `scale(${idx === 1 ? 1 : 0.9})` }}>
              <StatusCard
                player={`${id}P`}
                isOwner={isOwner}
                isMe={isMe}
                roleId={assign?.role_id}
                statusIndex={isMe
                  ? myStatusIndex
                  : statusIndexMap[String(id)] || 0}
                onContinueClick={() => setShowMicPopup(true)}
                onStatusChange={isMe ? setMyStatusIndex : undefined}
              />
            </div>
          );
        })}
      </div>

      {/* 준비하기 ▶ 마이크 테스트 팝업 */}
      {showMicPopup && (
        <MicTestPopup
          userImage={getPlayerImage(Number(localStorage.getItem('myrole_id')))}
          onConfirm={handleMicConfirm}
        />
      )}
    </Background>
  );
}