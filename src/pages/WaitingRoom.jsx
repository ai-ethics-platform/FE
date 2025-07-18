import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
import { useWebSocket } from '../WebSocketProvider';
import { FontStyles,Colors } from '../components/styleConstants';
import codeBg from '../assets/roomcodebackground.svg';  // 방 코드 배경 SVG

export default function WaitingRoom() {
  const location = useLocation();
  const allTopics = ['안드로이드', '자율 무기 시스템'];
  const initialTopic = location.state?.topic || '안드로이드';
  const initialIndex = allTopics.indexOf(initialTopic);

  // WebSocket 연결
  const { isConnected, addMessageHandler, removeMessageHandler } = useWebSocket();
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

  const room_code = localStorage.getItem('room_code');

  // // A) 내 ID, 방 생성자 ID 조회
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const { data: me } = await axiosInstance.get('/users/me');
  //       setMyPlayerId(String(me.id));
  //       localStorage.setItem("myuser_id",me.id);
  //       console.log("myuser_id",me.id);

  //       //방정보 조회 -> 여기서 host_id, ready 상태 파악 
  //       const { data: room } = await axiosInstance.get(`/rooms/code/${room_code}`);
  //       setHostUserId(String(room.created_by)); //호스트의 user_id 파악  
  //       console.log("host의 userid= ", room.created_by);
  //       console.log("내가 유저인가요? ", me.id == room.created_by);
  //     } catch (err) {
  //       console.error(' 유저/방 정보 로드 실패:', err);
  //     }
  //   })();
  // }, [room_code]);
// A) 초기 데이터 로드 - 내 정보 조회
const loadMyInfo = async () => {
  try {
    const { data: userInfo } = await axiosInstance.get('/users/me');
    const myUserId = userInfo.id;
    localStorage.setItem('user_id', myUserId);
    setMyPlayerId(String(myUserId));
    console.log('내 정보 로드 완료:', { myUserId });
    return myUserId;
  } catch (err) {
    console.error('내 정보 로드 실패:', err);
    return null;
  }
};

// B) participants 초기 로드 - 수정됨
const loadParticipants = async () => {
  try {
    const { data: room } = await axiosInstance.get(`/rooms/code/${room_code}`);
    console.log('참가자 데이터 로드:', room.participants);
    
    setParticipants(room.participants);

    // ✅ API 응답에 is_host가 있으므로 그대로 사용 (1/0을 boolean으로 변환)
    setAssignments(room.participants.map(p => ({
      player_id: p.user_id,
      is_host: Boolean(p.is_host), // 1 -> true, 0 -> false
      // role_id는 로컬스토리지에서 가져와서 설정
    })));

    const readyMap = {};
    room.participants.forEach(p => {
      readyMap[String(p.user_id)] = p.is_ready ? 1 : 0;
    });
    setStatusIndexMap(readyMap);
    
    // 호스트 정보 설정 (created_by 활용)
    const hostUserId = room.created_by;
    setHostUserId(String(hostUserId));

    return { participants: room.participants, hostUserId };

  } catch (err) {
    console.error('participants 로드 실패:', err);
    return { participants: [], hostUserId: null };
  }
};

// ✅ 새로운 함수: 로컬스토리지에서 역할 정보를 가져와서 assignments 업데이트
const updateAssignmentsWithRoles = () => {
  if (participants.length === 0) return;

  const updatedAssignments = participants.map(p => {
    // 로컬스토리지에서 해당 유저의 역할 찾기
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
      is_host: Boolean(p.is_host), // API에서 받은 is_host 사용
      role_id: userRoleId, // 로컬스토리지에서 가져온 역할
    };
  });

  console.log('역할 정보로 assignments 업데이트:', updatedAssignments);
  setAssignments(updatedAssignments);
};

// C) 역할 배정 로직 - 수정됨
const assignRoles = async () => {
  if (hasAssignedRoles) {
    console.log('역할 배정 이미 진행 중, 스킵');
    return;
  }

  try {
    setHasAssignedRoles(true);
    console.log('역할 배정 API 호출 시작');
    
    const { data: roleAssignmentResult } = await axiosInstance.post(`/rooms/assign-roles/${room_code}`);
    console.log('역할 배정 완료:', roleAssignmentResult);

    // 역할 배정 결과를 로컬스토리지에 저장
    if (roleAssignmentResult.assignments) {
      const assignments = roleAssignmentResult.assignments;
      const myUserId = localStorage.getItem('user_id');
      const currentHostUserId = hostUserId;
      
      // 각 역할별 유저 ID 매핑 (API에서 player_id가 문자열로 옴)
      const roleUserMap = {};
      assignments.forEach(assignment => {
        roleUserMap[assignment.role_id] = String(assignment.player_id);
      });
      
      // 로컬스토리지에 저장
      localStorage.setItem('role1_user_id', roleUserMap[1] || '');
      localStorage.setItem('role2_user_id', roleUserMap[2] || '');
      localStorage.setItem('role3_user_id', roleUserMap[3] || '');
      
      // 내 역할 ID 찾기 (player_id를 문자열로 비교)
      const myAssignment = assignments.find(a => String(a.player_id) === String(myUserId));
      if (myAssignment) {
        localStorage.setItem('myrole_id', String(myAssignment.role_id));
      }
      
      // 호스트의 역할 ID 찾기 (player_id를 문자열로 비교)
      const hostAssignment = assignments.find(a => String(a.player_id) === String(currentHostUserId));
      if (hostAssignment) {
        localStorage.setItem('host_id', String(hostAssignment.role_id));
      }
      
      console.log('로컬스토리지 저장 완료:', {
        myrole_id: myAssignment?.role_id,
        host_id: hostAssignment?.role_id,
        role1_user_id: roleUserMap[1],
        role2_user_id: roleUserMap[2],
        role3_user_id: roleUserMap[3],
      });

      // ✅ 역할 배정 완료 후 즉시 assignments 업데이트
      setTimeout(() => {
        updateAssignmentsWithRoles();
      }, 100);
    }
    
    // 역할 배정 후 최신 데이터 다시 로드
    setTimeout(() => {
      loadParticipants();
      // 로드 후 역할 정보도 업데이트
      setTimeout(() => {
        updateAssignmentsWithRoles();
      }, 200);
    }, 500);
    
  } catch (err) {
    console.error('역할 배정 실패:', err);
    setHasAssignedRoles(false);
  }
};

// D) 참가자 변화 감지 및 역할 배정 트리거
useEffect(() => {
  console.log('참가자 상태 체크:', {
    participantCount: participants.length,
    myUserId: myPlayerId,
    hostUserId: hostUserId,
    isHost: myPlayerId === hostUserId,
    hasAssignedRoles,
  });

  // 조건 확인: 3명 && 내가 호스트 && 역할 미배정
  if (
    participants.length === 3 &&
    myPlayerId === hostUserId &&
    !hasAssignedRoles
  ) {
    console.log('🚀 역할 배정 조건 충족! 역할 배정 시작');
    assignRoles();
  }
}, [participants, myPlayerId, hostUserId, hasAssignedRoles]);

// E) WebSocket 메시지 핸들러
useEffect(() => {
  if (!isConnected) return;

  const handlerId = 'waiting-room';
  
  const messageHandler = (message) => {
    console.log('WaitingRoom 메시지 수신:', message);
    
    switch (message.type) {
      case 'join':
        console.log('새 참가자 입장:', message);
        setTimeout(() => {
          loadParticipants();
        }, 100);
        break;
        
      case 'voice_status_update':
        console.log('음성 상태 업데이트:', message);
        setTimeout(() => {
          loadParticipants();
        }, 100);
        break;
        
      default:
        console.log('기타 메시지로 인한 참가자 업데이트');
        setTimeout(() => {
          loadParticipants();
        }, 200);
        break;
    }
  };
  
  addMessageHandler(handlerId, messageHandler);
  
  return () => {
    removeMessageHandler(handlerId);
  };
}, [isConnected, room_code]);

// F) 준비 상태 폴링 - 수정됨
useEffect(() => {
  const readyStatusPolling = setInterval(async () => {
    try {
      const { data: room } = await axiosInstance.get(`/rooms/code/${room_code}`);
      console.log('준비 상태 폴링 - 참가자 상태:', room.participants.map(p => ({
        id: p.user_id,
        ready: p.is_ready
      })));
      
      // 참가자 데이터 업데이트
      setParticipants(room.participants);
      
      // ✅ is_host 정보 유지하고 역할 정보도 함께 업데이트
      const updatedAssignments = room.participants.map(p => {
        // 로컬스토리지에서 해당 유저의 역할 찾기
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
          is_host: Boolean(p.is_host), // API에서 받은 is_host 사용
          role_id: userRoleId,
        };
      });
      
      setAssignments(updatedAssignments);
      
      // 준비 상태 맵 업데이트
      const readyMap = {};
      room.participants.forEach(p => {
        readyMap[String(p.user_id)] = p.is_ready ? 1 : 0;
      });
      setStatusIndexMap(readyMap);
      
      // 내 준비 상태도 동기화
      if (myPlayerId) {
        const myParticipant = room.participants.find(p => String(p.user_id) === myPlayerId);
        if (myParticipant) {
          setMyStatusIndex(myParticipant.is_ready ? 1 : 0);
        }
      }
      
    } catch (err) {
      console.error('준비 상태 폴링 실패:', err);
    }
  }, 3000);
  
  console.log('준비 상태 폴링 시작 (3초 간격)');
  
  return () => {
    clearInterval(readyStatusPolling);
    console.log('📡 준비 상태 폴링 종료');
  };
}, [room_code, myPlayerId]);

// G) Participant 변화 감지 폴링 (WebSocket 백업용)
useEffect(() => {
  let participantPolling;
  
  if (!isConnected) {
    console.log('📡 WebSocket 미연결, 참가자 변화 폴링 시작');
    participantPolling = setInterval(() => {
      loadParticipants();
    }, 3000);
  }
  
  return () => {
    if (participantPolling) {
      clearInterval(participantPolling);
      console.log('📡 참가자 변화 폴링 종료');
    }
  };
}, [isConnected, room_code]);

// H) 초기 로드 - 중복 제거됨
useEffect(() => {
  const initializeRoom = async () => {
    // 먼저 내 정보 로드
    const myUserId = await loadMyInfo();
    if (myUserId) {
      // 그 다음 참가자 정보 로드
      await loadParticipants();
      // 로드 후 역할 정보 업데이트 (이미 역할이 배정된 경우)
      setTimeout(() => {
        updateAssignmentsWithRoles();
      }, 100);
    }
  };
  
  initializeRoom();
}, [room_code]);

// ✅ participants 변경 시 역할 정보 업데이트
useEffect(() => {
  if (participants.length > 0) {
    // 약간의 딜레이를 주어 상태 업데이트가 완료된 후 실행
    setTimeout(() => {
      updateAssignmentsWithRoles();
    }, 50);
  }
}, [participants]);

// I) assignments 로그 확인용
useEffect(() => {
  console.log('현재 assignments 상태:', assignments);
}, [assignments]);

  // I) 역할 정보 로컬스토리지 저장 (역할 배정 완료 후에만 실행)
  useEffect(() => {
    // assignments에 role_id가 있는 경우에만 실행 (역할 배정 완료 후)
    const hasRoleIds = assignments.some(a => a.role_id != null);
    
    if (hasRoleIds && assignments.length > 0) {
      // 각 역할별 유저 ID 저장
      assignments.forEach(({ role_id, player_id }) => {
        if (role_id) {
          localStorage.setItem(`role${role_id}_user_id`, String(player_id));
        }
      });
      
      // 내 역할 ID 저장
      if (myPlayerId) {
        const myAssign = assignments.find(a => String(a.player_id) === myPlayerId);
        if (myAssign?.role_id != null) {
          localStorage.setItem('myrole_id', String(myAssign.role_id));
        }
      }
      
      console.log('역할 정보 로컬스토리지 업데이트 완료');
    }
  }, [assignments, myPlayerId]);

  // I) "준비하기" 처리
  const handleMicConfirm = async () => {
    try {
      console.log('🎤 준비하기 API 호출');
      const { data } = await axiosInstance.post('/rooms/ready', { room_code });
      
      // 즉시 내 상태 업데이트
      setMyStatusIndex(1);
      setShowMicPopup(false);
      
      // 준비 완료 후 즉시 상태 새로고침 (다른 사용자들의 상태도 확인)
      setTimeout(() => {
        loadParticipants();
      }, 500);
      
      if (data.game_starting && data.start_time) {
        const delay = new Date(data.start_time) - new Date();
        setTimeout(() => window.location.href = '/gameintro2', delay);
      }
    } catch (err) {
      console.error('❌ ready 실패:', err);
    }
  };

  // J) 모두 준비됐는지 감시
  useEffect(() => {
    if (participants.length === 0) return;
    const readyCount = participants.filter(p => p.is_ready).length;
    if (readyCount === participants.length && participants.length === 3) {
      console.log(`✅ 모두 준비 완료 (${readyCount}/${participants.length}) → 게임 시작`);
      window.location.href = '/gameintro2';
    }
  }, [participants]);

  // 플레이어 이미지 매핑
  const getPlayerImage = (userId) => {
    const playerImages = {
      1: player1,
      2: player2,
      3: player3
    };
    return playerImages[userId] || player1; // 기본값은 player1
  };

  // 플레이어 순서
  const getOrderedPlayers = () => {
    if (!myPlayerId || assignments.length !== 3)
      return participants.map(p => p.user_id);

    const me = assignments.find(a => String(a.player_id) === myPlayerId);
    const others = assignments.filter(a => String(a.player_id) !== myPlayerId);
    return [others[0]?.player_id, me?.player_id, others[1]?.player_id].filter(Boolean);
  };

  // ——————————————————————————————
  // 렌더링
  return (
    <Background bgIndex={3}>
      {/* 디버깅 정보 (개발용) */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div>WebSocket: {isConnected ? '✅' : '❌'}</div>
        <div>참가자: {participants.length}/3</div>
        <div>방장: {myPlayerId === hostUserId ? 'YES' : 'NO'}</div>
        <div>역할배정: {hasAssignedRoles ? 'DONE' : 'PENDING'}</div>
        <div>미배정자: {participants.filter(p => p.role_id == null).length}명</div>
        <div>준비완료: {participants.filter(p => p.is_ready).length}/3</div>
        <div style={{ fontSize: '10px', marginTop: '5px' }}>
          {participants.map(p => (
            <div key={p.user_id}>
              {p.user_id}: {p.is_ready ? '✅' : '⏳'}
            </div>
          ))}
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
      width: 200,      // BG 폭
      height: 80,      // BG 높이
      marginLeft: -40,
      zIndex: 1,            // BackButton 아래
      overflow: 'hidden' // BackButton.clipPath 와 맞추기
    }}
  >
    {/* 배경 SVG */}
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

        // BackButton의 clipPath를 좌우 반전해서 사용
      }}
    />

    {/* 텍스트를 BG 위에 */}
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
          <OutPopup onClose={() => setShowOutPopup(false)}/>
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
          const assign = assignments.find(a => String(a.player_id) === String(id));
          const isOwner = String(id) === hostUserId;
          const isMe = String(id) === myPlayerId;
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