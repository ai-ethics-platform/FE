import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Background from '../components/Background';
import BackButton from '../components/BackButton';
import StatusCard from '../components/StatusCard';
import MicTestPopup from '../components/MicTestPopup';
import OutPopup from '../components/OutPopup';
import GameFrame from '../components/GameFrame';
import player1 from "../assets/1player.svg";
import player2 from "../assets/2player.svg";
import player3 from "../assets/3player.svg";
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

  // ——————————————————————————————
  // A) 내 ID, 방 생성자 ID 조회
  useEffect(() => {
    (async () => {
      try {
        const { data: me } = await axiosInstance.get('/users/me');
        setMyPlayerId(String(me.id));
        localStorage.setItem("myuser_id",me.id);
        console.log("myuser_id",me.id);
        const { data: room } = await axiosInstance.get(`/rooms/code/${room_code}`);
        setHostUserId(String(room.created_by));
        
        console.log('🏠 방 정보 로드:', {
          myId: me.id,
          hostId: room.created_by,
          isHost: String(me.id) === String(room.created_by)
        });
      } catch (err) {
        console.error('❌ 유저/방 정보 로드 실패:', err);
      }
    })();
  }, [room_code]);

  // B) participants 초기 로드
  const loadParticipants = async () => {
    try {
      const { data: room } = await axiosInstance.get(`/rooms/code/${room_code}`);
      console.log('참가자 데이터 로드:', room.participants);
      
      setParticipants(room.participants);
      setAssignments(room.participants.map(p => ({
        player_id: p.user_id,
        role_id: p.role_id,
        is_host: p.is_host,
      })));
      
      const readyMap = {};
      room.participants.forEach(p => {
        readyMap[String(p.user_id)] = p.is_ready ? 1 : 0;
      });
      setStatusIndexMap(readyMap);
      
      return room.participants;
    } catch (err) {
      console.error(' participants 로드 실패:', err);
      return [];
    }
  };

  useEffect(() => {
    loadParticipants();
  }, [room_code]);

  // C) 역할 배정 로직
  const assignRoles = async () => {
    if (hasAssignedRoles) {
      console.log('🔄 역할 배정 이미 진행 중, 스킵');
      return;
    }

    try {
      setHasAssignedRoles(true);
      console.log('🎯 역할 배정 API 호출 시작');
      
      await axiosInstance.post(`/rooms/assign-roles/${room_code}`);
      console.log('✅ 역할 배정 완료');
      
      // 역할 배정 후 최신 데이터 다시 로드
      setTimeout(() => {
        loadParticipants();
      }, 500);
      
    } catch (err) {
      console.error(' 역할 배정 실패:', err);
      setHasAssignedRoles(false);
    }
  };

  // D) 참가자 변화 감지 및 역할 배정 트리거
  useEffect(() => {
    console.log('📊 참가자 상태 체크:', {
      participantCount: participants.length,
      isHost: myPlayerId === hostUserId,
      hasAssignedRoles,
      participants: participants.map(p => ({ id: p.user_id, role: p.role_id }))
    });

    // 조건 확인: 3명 && 방장 && 역할 미배정 && 역할이 null인 참가자 존재
    if (
      participants.length === 3 &&
      myPlayerId === hostUserId &&
      !hasAssignedRoles &&
      participants.some(p => p.role_id == null)
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
      console.log('🔔 WaitingRoom 메시지 수신:', message);
      
      switch (message.type) {
        case 'join':
          console.log('👋 새 참가자 입장:', message);
          // 참가자 입장 시 방 정보 새로고침
          setTimeout(() => {
            loadParticipants();
          }, 100);
          break;
          
        case 'voice_status_update':
          console.log('🎤 음성 상태 업데이트:', message);
          // 음성 상태 변경도 참가자 변화의 신호로 활용
          setTimeout(() => {
            loadParticipants();
          }, 100);
          break;
          
        case 'room_update':
        case 'participants_update':
          console.log('🔄 방/참가자 업데이트:', message);
          // 방 정보 업데이트 메시지가 있다면
          setTimeout(() => {
            loadParticipants();
          }, 100);
          break;
          
        default:
          // 다른 메시지도 참가자 변화의 신호일 수 있으므로 안전하게 업데이트
          console.log('📨 기타 메시지로 인한 참가자 업데이트');
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

  // F) 준비 상태 폴링 (5초 간격)
  useEffect(() => {
    const readyStatusPolling = setInterval(async () => {
      try {
        const { data: room } = await axiosInstance.get(`/rooms/code/${room_code}`);
        console.log('🔄 준비 상태 폴링 - 참가자 상태:', room.participants.map(p => ({
          id: p.user_id,
          ready: p.is_ready
        })));
        
        // 참가자 데이터 업데이트
        setParticipants(room.participants);
        setAssignments(room.participants.map(p => ({
          player_id: p.user_id,
          role_id: p.role_id,
          is_host: p.is_host,
        })));
        
        // 준비 상태 맵 업데이트
        const readyMap = {};
        room.participants.forEach(p => {
          readyMap[String(p.user_id)] = p.is_ready ? 1 : 0;
        });
        setStatusIndexMap(readyMap);
        
        // 내 준비 상태도 동기화 (다른 탭에서 준비했을 경우를 대비)
        if (myPlayerId) {
          const myParticipant = room.participants.find(p => String(p.user_id) === myPlayerId);
          if (myParticipant) {
            setMyStatusIndex(myParticipant.is_ready ? 1 : 0);
          }
        }
        
      } catch (err) {
        console.error('❌ 준비 상태 폴링 실패:', err);
      }
    }, 5000); // 5초마다 폴링
    
    console.log('📡 준비 상태 폴링 시작 (5초 간격)');
    
    return () => {
      clearInterval(readyStatusPolling);
      console.log('📡 준비 상태 폴링 종료');
    };
  }, [room_code, myPlayerId]);

  // G) Participant 변화 감지 폴링 (WebSocket 백업용)
  useEffect(() => {
    let participantPolling;
    
    // WebSocket이 연결되지 않은 경우에만 참가자 변화 폴링 사용
    if (!isConnected) {
      console.log('📡 WebSocket 미연결, 참가자 변화 폴링 시작');
      participantPolling = setInterval(() => {
        loadParticipants();
      }, 3000); // 3초마다 폴링 (참가자 변화는 조금 더 빠르게)
    }
    
    return () => {
      if (participantPolling) {
        clearInterval(participantPolling);
        console.log('📡 참가자 변화 폴링 종료');
      }
    };
  }, [isConnected, room_code]);

  // H) localStorage 저장
  useEffect(() => {
    if (hostUserId) {
      localStorage.setItem('host_id', hostUserId);
    }
  }, [hostUserId]);
  
  useEffect(() => {
    // assignments: [{ player_id, role_id, is_host }, …]
    assignments.forEach(({ role_id, player_id }) => {
      // role1_user_id, role2_user_id, role3_user_id 로 저장
      localStorage.setItem(`role${role_id}_user_id`, String(player_id));
    });
  }, [assignments]);

  useEffect(() => {
    if (myPlayerId && assignments.length) {
      const myAssign = assignments.find(a => String(a.player_id) === myPlayerId);
      if (myAssign?.role_id != null) {
        localStorage.setItem('myrole_id', String(myAssign.role_id));
      }
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
          userImage={getPlayerImage(Number(myPlayerId))}
          onConfirm={handleMicConfirm}
        />
      )}
    </Background>
  );
}