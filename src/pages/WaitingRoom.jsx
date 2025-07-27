// 수정할 것 - 마이크 팝업 페이지 음성 키기, category, 비공개, 공개 수정하기 
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
import CancelReadyPopup from '../components/CancelReadyPopup';

export default function WaitingRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  // zoom 수정
  // const allTopics = ['안드로이드', '자율 무기 시스템'];
  const allTopics = ['안드로이드'];

  const initialTopic = location.state?.topic || '안드로이드';
  const initialIndex = allTopics.indexOf(initialTopic);
 
  //룸코드 복사 
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(room_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000); // 1초 후 사라짐
    });
  };
  //  useRef로 폴링 타이머 ID 관리
  const pollingIntervalRef = useRef(null);

  // 1) UI 상태
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [showMicPopup, setShowMicPopup] = useState(false);
  const [showOutPopup, setShowOutPopup] = useState(false);
  const [myStatusIndex, setMyStatusIndex] = useState(0);
  const [showCancelPopup, setShowCancelPopup] = useState(false);

  // 2) 유저 & 방 정보
  const [myPlayerId, setMyPlayerId] = useState(null);
  const [hostUserId, setHostUserId] = useState(null);

  // 3) 참가자 & 역할 상태
  const [participants, setParticipants] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [statusIndexMap, setStatusIndexMap] = useState({});
  const [hasAssignedRoles, setHasAssignedRoles] = useState(false);

  // 4) 폴링 관련 상태
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
      console.error(`내 정보 로드 실패:`, err);
      return null;
    }
  };

  // B) participants 로드 및 역할 배정 확인
  const loadParticipants = async () => {
    try {
      const { data: room } = await axiosInstance.get(`/rooms/code/${room_code}`);
      console.log(`API 응답:`, room);
      
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
      console.log(`방장이 아니므로 역할 배정 스킵`);
      return;
    }

    if (hasAssignedRoles || checkIfRolesAlreadyAssigned()) {
      console.log(`역할이 이미 배정되어 있음`);
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
        
        console.log(` 방장: 로컬스토리지 저장 완료`);
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
    console.log('✅ myStatusIndex 변경됨:', myStatusIndex);
  }, [myStatusIndex]);
  //  폴링 함수 - 방 상태를 주기적으로 확인
  const pollRoomStatus = async () => {

    try {
      const { data: room } = await axiosInstance.get(`/rooms/code/${room_code}`);
      // 1. 참가자 업데이트
      setParticipants(room.participants);
      
      // 2. 준비 상태 맵 업데이트
      const readyMap = {};
      room.participants.forEach(p => {
        readyMap[String(p.user_id)] = p.is_ready ? 1 : 0;
      });
      setStatusIndexMap(readyMap);
      
      // 3. 내 준비 상태 업데이트
      if (myPlayerId) {
        const myParticipant = room.participants.find(p => String(p.user_id) === myPlayerId);
        if (myParticipant) {
          const newStatusIndex = myParticipant.is_ready ? 1 : 0;
          if (newStatusIndex !== myStatusIndex) {
            setMyStatusIndex(newStatusIndex);
          }
        }
      }
      
      // 4. 역할 배정 확인 및 적용
      const hasApiRoles = room.participants.length === 3 && 
      room.participants.every(p => p.role_id != null);
      
      if (hasApiRoles) {
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
          
          localStorage.setItem('role1_user_id', roleUserMap[1] || '');
          localStorage.setItem('role2_user_id', roleUserMap[2] || '');
          localStorage.setItem('role3_user_id', roleUserMap[3] || '');
          
          // 내 역할 업데이트
          const myUserId = localStorage.getItem('user_id');
          const myParticipant = room.participants.find(p => String(p.user_id) === String(myUserId));
          if (myParticipant && myParticipant.role_id) {
            localStorage.setItem('myrole_id', String(myParticipant.role_id));
          }
          
          // 호스트 역할 업데이트
          const hostUserId = String(room.created_by);
          const hostParticipant = room.participants.find(p => String(p.user_id) === hostUserId);
          if (hostParticipant && hostParticipant.role_id) {
            localStorage.setItem('host_id', String(hostParticipant.role_id));
          }
          
          setHasAssignedRoles(true);
          
          // assignments 즉시 업데이트
          setTimeout(() => {
            updateAssignmentsWithRoles();
          }, 5000);
        }
      }
      
      // 5. 모든 유저가 준비 완료되었는지 확인 - 최우선 체크
      const readyCount = room.participants.filter(p => p.is_ready).length;
      console.log(`준비 완료 현황: ${readyCount}/${room.participants.length}`);
      
      if (readyCount === room.participants.length && room.participants.length === 3) {
        console.log(`모두 준비 완료`);
        stopPolling();
        
        // 게임 화면으로 이동
        navigate('/gameintro');
        return; 
      }
      
    } catch (err) {
      console.error(`폴링 실패:`, err);
    }
  };

  // 폴링 시작 함수
  const startPolling = () => {
    // 이미 폴링 중이면 중복 시작 방지
    if (pollingIntervalRef.current) {
      return;
    }
    setIsPolling(true);
    
    // 즉시 한 번 실행
    pollRoomStatus();
    
    // 5초마다 폴링
    pollingIntervalRef.current = setInterval(() => {
      pollRoomStatus();
    }, 5000);
  };

  // 폴링 중지 함수
  const stopPolling = () => {
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    setIsPolling(false);
  };

  // 초기화 useEffect
  useEffect(() => {
    const initializeRoom = async () => {      
      const myUserId = await loadMyInfo();
      if (!myUserId) {
        console.error(`사용자 정보 로드 실패`);
        return;
      }
      
      const { hostUserId: loadedHostUserId } = await loadParticipants();
      if (!loadedHostUserId) {
        console.error(`호스트 정보 로드 실패`);
        return;
      }
      
      const isHost = String(myUserId) === String(loadedHostUserId);
      // console.log(`사용자 역할 확인:`, { 
      //   myUserId, 
      //   hostUserId: loadedHostUserId, 
      //   isHost: isHost ? '방장' : '일반 유저' 
      // });
      
      if (checkIfRolesAlreadyAssigned()) {
        setHasAssignedRoles(true);
      }
      
      setTimeout(() => {
        updateAssignmentsWithRoles();
      }, 200);
      
      // 폴링 시작
      setTimeout(() => {
        startPolling();
      }, 5000);
    };
    
    initializeRoom();
    
    // 컴포넌트 언마운트 시 또는 room_code 변경 시 폴링 중지
    return () => {
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
      console.log(`준비하기 API 호출`);
      const { data } = await axiosInstance.post('/rooms/ready', { room_code });
      console.log('✅ 준비 눌림 → 상태 1로 설정 시도');

      setMyStatusIndex(1);
      setShowMicPopup(false);
      
      // 준비 완료 후 즉시 폴링으로 상태 확인 
      setTimeout(() => {
        pollRoomStatus();
      }, 500);
      
    } catch (err) {
      console.error(`ready 실패:`, err);
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
    // console.log(`getOrderedPlayers 호출:`, {
    //   myPlayerId,
    //   participantsLength: participants.length,
    //   assignmentsLength: assignments.length,
    //   participants: participants.map(p => ({ user_id: p.user_id, nickname: p.nickname })),
    //   assignments: assignments.map(a => ({ player_id: a.player_id, role_id: a.role_id }))
    // });

    // participants가 있으면 항상 3명을 표시 (assignments가 없어도)
    if (!myPlayerId || participants.length !== 3) {
      const playerIds = participants.map(p => p.user_id);
      console.log(`조건 미충족, 기본 순서 반환:`, playerIds);
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
    
    // console.log(`최종 플레이어 순서:`, {
    //   left: otherPlayerIds[0],
    //   center: myPlayerId,
    //   right: otherPlayerIds[1],
    //   result: orderedPlayers
    // });

    return orderedPlayers;
  };
  const isReady = Boolean(statusIndexMap[myPlayerId] === 1);

  // 디버깅용 전역 함수
  useEffect(() => {
    window.debugWaitingRoom = {
      getStatus: () => ({
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
        console.log('폴링 실행');
        pollRoomStatus();
      },
      
      startPolling: () => {
        console.log(' 폴링 시작');
        startPolling();
      },
      
      stopPolling: () => {
        console.log(' 폴링 중지');
        stopPolling();
      }
    };

    return () => {
      delete window.debugWaitingRoom;
    };
  }, [isPolling, myPlayerId, hostUserId, participants, hasAssignedRoles, statusIndexMap, assignments]);
  const handleCancelConfirm = () => {
    // 1) 로컬 인덱스 리셋
    setMyStatusIndex(0);
    // 2) 팝업 닫기
    setShowCancelPopup(false);
  };

  return (
    <Background bgIndex={2}>
      {/* 디버깅 정보 */}
      {/* <div style={{
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
          <div> LocalStorage:</div>
          <div>role1: {localStorage.getItem('role1_user_id') || 'NULL'}</div>
          <div>role2: {localStorage.getItem('role2_user_id') || 'NULL'}</div>
          <div>role3: {localStorage.getItem('role3_user_id') || 'NULL'}</div>
        </div>
      </div> */}

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
        >
        <div style={{ position: 'relative', zIndex: 2 }}>
        <BackButton onClick={() => setShowOutPopup(true)} /> 
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
              cursor: 'pointer',
              ...FontStyles.title,
              color: Colors.brandPrimary,
              userSelect: 'none',
            }}
          >
            CODE: {room_code}
          </span>
                {/* 툴팁 */}
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
                Copied!
              </div>
            )}
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
          
          hideArrows={true}
         //zoom 수정  hideArrows={false}

        />
      </div>

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
          // console.log(`StatusCard 렌더링:`, {
          //   id,
          //   idx,
          //   myPlayerId,
          //   isMe: String(id) === String(myPlayerId),
          //   hostUserId
          // });
          
          const assign = assignments.find(a => String(a.player_id) === String(id));
          const isOwner = String(id) === String(hostUserId);
          const isMe = String(id) === String(myPlayerId);
          
          // console.log(`StatusCard ${idx} 상세:`, {
          //   id,
          //   assign,
          //   isOwner,
          //   isMe,
          //   roleId: assign?.role_id,
          //   statusIndex: isMe ? myStatusIndex : statusIndexMap[String(id)] || 0
          // });
          
          return (
            <div key={id} style={{ transform: `scale(${idx === 1 ? 1 : 0.9})` }}>
              <StatusCard
                player={`${id}P`}
                isOwner={isOwner}
                isMe={isMe}
                roleId={assign?.role_id}
                // statusIndex={isMe
                //   ? myStatusIndex
                //   : statusIndexMap[String(id)] || 0}
                // //onContinueClick={() => setShowMicPopup(true)}
                // onContinueClick={() => {
                //   console.log('버튼 눌림', { isReady, myStatusIndex });
                //   if (!isMe) return;
                //   if (isReady) {
                //     console.log('➡ 준비 취소 팝업 띄우기');
                //     setShowCancelPopup(true);
                //   } else {
                //     console.log('➡ 마이크 팝업 띄우기');
                //     setShowMicPopup(true);
                //   }
                // }}
                statusIndex={
                  isMe
                          ? myStatusIndex
                          : statusIndexMap[String(id)] || 0
                     }
                  onContinueClick={() => setShowMicPopup(true)}
                  onCancelClick={() => setShowCancelPopup(true)}  // 
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
      {showCancelPopup && (
          <div style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
          }}>
              <CancelReadyPopup
          onClose={() => setShowCancelPopup(false)}
          onCancelConfirmed={handleCancelConfirm}  // ← 이제 정의된 함수를 넘김
        />
          </div>
    )}
    </Background>
  );
}