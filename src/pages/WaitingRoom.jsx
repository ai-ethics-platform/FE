// import React, { useEffect, useState } from 'react';
// import { useLocation } from 'react-router-dom';
// import Background from '../components/Background';
// import BackButton from '../components/BackButton';
// import StatusCard from '../components/StatusCard';
// import MicTestPopup from '../components/MicTestPopup';
// import OutPopup from '../components/OutPopup';
// import GameFrame from '../components/GameFrame';
// import player1 from "../assets/1player_withnum.svg";
// import player2 from "../assets/2player_withnum.svg";
// import player3 from "../assets/3player_withnum.svg";
// import axiosInstance from '../api/axiosInstance';
// import { useWebSocket } from '../WebSocketProvider';
// import { FontStyles, Colors } from '../components/styleConstants';
// import codeBg from '../assets/roomcodebackground.svg';

// export default function WaitingRoom() {
//   const location = useLocation();
//   const allTopics = ['안드로이드', '자율 무기 시스템'];
//   const initialTopic = location.state?.topic || '안드로이드';
//   const initialIndex = allTopics.indexOf(initialTopic);

//   // WebSocket 연결
//   const { isConnected, addMessageHandler, removeMessageHandler } = useWebSocket();
  
//   // ✅ 디버깅을 위한 고유 클라이언트 ID 생성
//   const [clientId] = useState(() => {
//     const id = Math.random().toString(36).substr(2, 9);
//     console.log(`🔍 클라이언트 ID: ${id}`);
//     return id;
//   });

//   // 1) UI 상태
//   const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
//   const [showMicPopup, setShowMicPopup] = useState(false);
//   const [showOutPopup, setShowOutPopup] = useState(false);
//   const [myStatusIndex, setMyStatusIndex] = useState(0);

//   // 2) 유저 & 방 정보
//   const [myPlayerId, setMyPlayerId] = useState(null);
//   const [hostUserId, setHostUserId] = useState(null);

//   // 3) 참가자 & 역할 상태
//   const [participants, setParticipants] = useState([]);
//   const [assignments, setAssignments] = useState([]);
//   const [statusIndexMap, setStatusIndexMap] = useState({});
//   const [hasAssignedRoles, setHasAssignedRoles] = useState(false);

//   // ✅ 업데이트 중복 방지 플래그
//   const [isUpdating, setIsUpdating] = useState(false);

//   const room_code = localStorage.getItem('room_code');

//   // A) 초기 데이터 로드 - 내 정보 조회
//   const loadMyInfo = async () => {
//     try {
//       const { data: userInfo } = await axiosInstance.get('/users/me');
//       const myUserId = userInfo.id;
//       localStorage.setItem('user_id', myUserId);
//       setMyPlayerId(String(myUserId));
//       console.log(`🔍 [${clientId}] 내 정보 로드 완료:`, { myUserId });
//       return myUserId;
//     } catch (err) {
//       console.error(`❌ [${clientId}] 내 정보 로드 실패:`, err);
//       return null;
//     }
//   };

//   // B) participants 초기 로드
//   const loadParticipants = async () => {
//     try {
//       const { data: room } = await axiosInstance.get(`/rooms/code/${room_code}`);
//       console.log(`📊 [${clientId}] 참가자 데이터 로드:`, room.participants);
      
//       setParticipants(room.participants);
      
//       // 호스트 정보 설정
//       const hostUserId = room.created_by;
//       setHostUserId(String(hostUserId));

//       // 준비 상태 맵 업데이트
//       const readyMap = {};
//       room.participants.forEach(p => {
//         readyMap[String(p.user_id)] = p.is_ready ? 1 : 0;
//       });
//       setStatusIndexMap(readyMap);

//       return { participants: room.participants, hostUserId };
//     } catch (err) {
//       console.error(`❌ [${clientId}] participants 로드 실패:`, err);
//       return { participants: [], hostUserId: null };
//     }
//   };

//   // ✅ 단일 업데이트 함수로 통합
//   const updateAssignmentsWithRoles = async () => {
//     if (participants.length === 0 || isUpdating) return;
    
//     setIsUpdating(true);
//     console.log(`🔄 [${clientId}] assignments 업데이트 시작`);

//     try {
//       const updatedAssignments = participants.map(p => {
//         // 로컬스토리지에서 해당 유저의 역할 찾기
//         let userRoleId = null;
//         for (let roleId = 1; roleId <= 3; roleId++) {
//           const roleUserId = localStorage.getItem(`role${roleId}_user_id`);
//           if (roleUserId && String(roleUserId) === String(p.user_id)) {
//             userRoleId = roleId;
//             break;
//           }
//         }

//         return {
//           player_id: p.user_id,
//           is_host: Boolean(p.is_host),
//           role_id: userRoleId,
//         };
//       });

//       console.log(`✅ [${clientId}] assignments 업데이트 완료:`, updatedAssignments);
//       setAssignments(updatedAssignments);
      
//       // 내 역할 ID 저장 (한 번만)
//       if (myPlayerId) {
//         const myAssign = updatedAssignments.find(a => String(a.player_id) === myPlayerId);
//         if (myAssign?.role_id != null) {
//           const currentMyRole = localStorage.getItem('myrole_id');
//           if (currentMyRole !== String(myAssign.role_id)) {
//             localStorage.setItem('myrole_id', String(myAssign.role_id));
//             console.log(`💾 [${clientId}] 내 역할 업데이트: ${myAssign.role_id}`);
//           }
//         }
//       }
      
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   // ✅ 역할 배정 상태 체크
//   const checkIfRolesAlreadyAssigned = () => {
//     const role1 = localStorage.getItem('role1_user_id');
//     const role2 = localStorage.getItem('role2_user_id');
//     const role3 = localStorage.getItem('role3_user_id');
    
//     const allRolesAssigned = role1 && role2 && role3;
    
//     console.log(`🔍 [${clientId}] 역할 배정 상태:`, {
//       allRolesAssigned,
//       role1, role2, role3
//     });
    
//     return allRolesAssigned;
//   };

//   // C) 역할 배정 로직 - 단순화
//   const assignRoles = async () => {
//     if (hasAssignedRoles) {
//       console.log(`⏸️ [${clientId}] 역할 배정 이미 진행 중, 스킵`);
//       return;
//     }

//     if (checkIfRolesAlreadyAssigned()) {
//       console.log(`✅ [${clientId}] 역할이 이미 배정되어 있음`);
//       setHasAssignedRoles(true);
//       return;
//     }

//     try {
//       setHasAssignedRoles(true);
//       console.log(`🚀 [${clientId}] 역할 배정 API 호출 시작`);
      
//       const { data: roleAssignmentResult } = await axiosInstance.post(`/rooms/assign-roles/${room_code}`);
//       console.log(`🎉 [${clientId}] 역할 배정 완료:`, roleAssignmentResult);

//       if (roleAssignmentResult.assignments) {
//         const assignments = roleAssignmentResult.assignments;
//         const myUserId = localStorage.getItem('user_id');
//         const currentHostUserId = hostUserId;
        
//         // 로컬스토리지에 한 번만 저장
//         const roleUserMap = {};
//         assignments.forEach(assignment => {
//           roleUserMap[assignment.role_id] = String(assignment.player_id);
//         });
        
//         localStorage.setItem('role1_user_id', roleUserMap[1] || '');
//         localStorage.setItem('role2_user_id', roleUserMap[2] || '');
//         localStorage.setItem('role3_user_id', roleUserMap[3] || '');
        
//         // 내 역할 ID 저장
//         const myAssignment = assignments.find(a => String(a.player_id) === String(myUserId));
//         if (myAssignment) {
//           localStorage.setItem('myrole_id', String(myAssignment.role_id));
//         }
        
//         // 호스트 역할 ID 저장
//         const hostAssignment = assignments.find(a => String(a.player_id) === String(currentHostUserId));
//         if (hostAssignment) {
//           localStorage.setItem('host_id', String(hostAssignment.role_id));
//         }
        
//         console.log(`💾 [${clientId}] 로컬스토리지 저장 완료`);
//       }
      
//       // ✅ 단일 업데이트로 통합
//       setTimeout(() => {
//         updateAssignmentsWithRoles();
//       }, 300);
      
//     } catch (err) {
//       console.error(`❌ [${clientId}] 역할 배정 실패:`, err);
//       setHasAssignedRoles(false);
//     }
//   };

//   // D) 참가자 변화 감지 및 역할 배정 트리거
//   useEffect(() => {
//     console.log(`🔍 [${clientId}] 참가자 상태 체크:`, {
//       participantCount: participants.length,
//       myUserId: myPlayerId,
//       hostUserId: hostUserId,
//       isHost: myPlayerId === hostUserId,
//       hasAssignedRoles,
//     });

//     if (checkIfRolesAlreadyAssigned()) {
//       if (!hasAssignedRoles) {
//         console.log(`✅ [${clientId}] 역할이 이미 배정되어 있음, 상태 업데이트`);
//         setHasAssignedRoles(true);
//       }
//       return;
//     }

//     if (
//       participants.length === 3 &&
//       myPlayerId === hostUserId &&
//       !hasAssignedRoles
//     ) {
//       console.log(`🚀 [${clientId}] 역할 배정 조건 충족!`);
//       assignRoles();
//     }
//   }, [participants, myPlayerId, hostUserId, hasAssignedRoles]);

//   // E) WebSocket 메시지 핸들러
//   useEffect(() => {
//     if (!isConnected) return;

//     const handlerId = 'waiting-room';
    
//     const messageHandler = (message) => {
//       console.log(`📨 [${clientId}] WebSocket 메시지:`, message);
      
//       switch (message.type) {
//         case 'join':
//           setTimeout(() => {
//             loadParticipants();
//           }, 100);
//           break;
          
//         case 'voice_status_update':
//           setTimeout(() => {
//             loadParticipants();
//           }, 100);
//           break;
          
//         default:
//           setTimeout(() => {
//             loadParticipants();
//           }, 200);
//           break;
//       }
//     };
    
//     addMessageHandler(handlerId, messageHandler);
    
//     return () => {
//       removeMessageHandler(handlerId);
//     };
//   }, [isConnected, room_code]);

//   // F) 준비 상태 폴링 - 단순화
//   useEffect(() => {
//     const readyStatusPolling = setInterval(async () => {
//       console.log(`🔄 [${clientId}] 폴링 실행`);
      
//       try {
//         const { data: room } = await axiosInstance.get(`/rooms/code/${room_code}`);
        
//         // 참가자 데이터 업데이트
//         setParticipants(room.participants);
        
//         // 준비 상태 맵 업데이트
//         const readyMap = {};
//         room.participants.forEach(p => {
//           readyMap[String(p.user_id)] = p.is_ready ? 1 : 0;
//         });
//         setStatusIndexMap(readyMap);
        
//         // 내 준비 상태 동기화
//         if (myPlayerId) {
//           const myParticipant = room.participants.find(p => String(p.user_id) === myPlayerId);
//           if (myParticipant) {
//             setMyStatusIndex(myParticipant.is_ready ? 1 : 0);
//           }
//         }
        
//       } catch (err) {
//         console.error(`❌ [${clientId}] 폴링 실패:`, err);
//       }
//     }, 5000); // 5초로 늘림
    
//     console.log(`📡 [${clientId}] 폴링 시작 (5초 간격)`);
    
//     return () => {
//       clearInterval(readyStatusPolling);
//       console.log(`📡 [${clientId}] 폴링 종료`);
//     };
//   }, [room_code, myPlayerId]);

//   // G) WebSocket 백업 폴링
//   useEffect(() => {
//     let participantPolling;
    
//     if (!isConnected) {
//       console.log(`📡 [${clientId}] WebSocket 미연결, 백업 폴링 시작`);
//       participantPolling = setInterval(() => {
//         loadParticipants();
//       }, 5000);
//     }
    
//     return () => {
//       if (participantPolling) {
//         clearInterval(participantPolling);
//         console.log(`📡 [${clientId}] 백업 폴링 종료`);
//       }
//     };
//   }, [isConnected, room_code]);

//   // H) 초기 로드
//   useEffect(() => {
//     const initializeRoom = async () => {
//       console.log(`🚀 [${clientId}] 초기화 시작`);
      
//       const myUserId = await loadMyInfo();
//       if (myUserId) {
//         await loadParticipants();
        
//         // 역할이 이미 배정되어 있는지 확인
//         if (checkIfRolesAlreadyAssigned()) {
//           setHasAssignedRoles(true);
//         }
        
//         setTimeout(() => {
//           updateAssignmentsWithRoles();
//         }, 200);
//       }
//     };
    
//     initializeRoom();
//   }, [room_code]);

//   // I) participants 변경 시 업데이트 (debounce 적용)
//   useEffect(() => {
//     if (participants.length > 0) {
//       const timeoutId = setTimeout(() => {
//         updateAssignmentsWithRoles();
//       }, 100);
      
//       return () => clearTimeout(timeoutId);
//     }
//   }, [participants]);

//   // J) "준비하기" 처리
//   const handleMicConfirm = async () => {
//     try {
//       console.log(`🎤 [${clientId}] 준비하기 API 호출`);
//       const { data } = await axiosInstance.post('/rooms/ready', { room_code });
      
//       // 즉시 내 상태 업데이트
//       setMyStatusIndex(1);
//       setShowMicPopup(false);
      
//       // 준비 완료 후 즉시 상태 새로고침
//       setTimeout(() => {
//         loadParticipants();
//       }, 500);
      
//       if (data.game_starting && data.start_time) {
//         const delay = new Date(data.start_time) - new Date();
//         setTimeout(() => window.location.href = '/gameintro2', delay);
//       }
//     } catch (err) {
//       console.error(`❌ [${clientId}] ready 실패:`, err);
//     }
//   };

//   // K) 모두 준비됐는지 감시
//   useEffect(() => {
//     if (participants.length === 0) return;
//     const readyCount = participants.filter(p => p.is_ready).length;
//     if (readyCount === participants.length && participants.length === 3) {
//       console.log(`✅ [${clientId}] 모두 준비 완료 (${readyCount}/${participants.length}) → 게임 시작`);
//       window.location.href = '/gameintro2';
//     }
//   }, [participants]);

//   // 플레이어 이미지 매핑
//   const getPlayerImage = (roleId) => {
//     const playerImages = {
//       1: player1,
//       2: player2,
//       3: player3
//     };
//     return playerImages[roleId] || player1;
//   };

//   // 플레이어 순서
//   const getOrderedPlayers = () => {
//     if (!myPlayerId || assignments.length !== 3)
//       return participants.map(p => p.user_id);

//     const me = assignments.find(a => String(a.player_id) === myPlayerId);
//     const others = assignments.filter(a => String(a.player_id) !== myPlayerId);
//     return [others[0]?.player_id, me?.player_id, others[1]?.player_id].filter(Boolean);
//   };

//   // 렌더링
//   return (
//     <Background bgIndex={3}>
//       {/* ✅ 디버깅 정보 강화 */}
//       <div style={{
//         position: 'absolute',
//         top: '10px',
//         right: '10px',
//         background: 'rgba(0,0,0,0.7)',
//         color: 'white',
//         padding: '10px',
//         borderRadius: '4px',
//         fontSize: '11px',
//         zIndex: 1000,
//         maxWidth: '300px'
//       }}>
//         <div>🔍 Client: {clientId}</div>
//         <div>WebSocket: {isConnected ? '✅' : '❌'}</div>
//         <div>참가자: {participants.length}/3</div>
//         <div>내 ID: {myPlayerId}</div>
//         <div>호스트 ID: {hostUserId}</div>
//         <div>방장: {myPlayerId === hostUserId ? 'YES' : 'NO'}</div>
//         <div>역할배정: {hasAssignedRoles ? 'DONE' : 'PENDING'}</div>
//         <div>내 역할: {localStorage.getItem('myrole_id') || 'NONE'}</div>
//         <div>준비완료: {participants.filter(p => p.is_ready).length}/3</div>
//         <div>업데이트 중: {isUpdating ? 'YES' : 'NO'}</div>
//         <div style={{ fontSize: '10px', marginTop: '5px', borderTop: '1px solid #555', paddingTop: '5px' }}>
//           <div>LocalStorage:</div>
//           <div>role1: {localStorage.getItem('role1_user_id')}</div>
//           <div>role2: {localStorage.getItem('role2_user_id')}</div>
//           <div>role3: {localStorage.getItem('role3_user_id')}</div>
//         </div>
//       </div>

//       {/* 뒤로 가기 */}
//       <div
//         style={{
//           position: 'absolute',
//           top: -10,
//           left: -10,
//           display: 'flex',
//           alignItems: 'center',
//           gap: 8,
//           zIndex: 1000,
//           cursor: 'pointer',
//         }}
//         onClick={() => setShowOutPopup(true)}
//       >
//         <div style={{ position: 'relative', zIndex: 2 }}>
//           <BackButton />
//         </div>
//         <div
//           style={{
//             position: 'relative',
//             width: 200,
//             height: 80,
//             marginLeft: -40,
//             zIndex: 1,
//             overflow: 'hidden'
//           }}
//         >
//           <img
//             src={codeBg}
//             alt="code background"
//             style={{
//               position: 'absolute',
//               top: 0,
//               left: 0,
//               width: '100%',
//               height: '100%',
//               objectFit: 'cover',
//               transform: 'rotate(180deg)',
//               clipPath: 'polygon(12% 0%, 100% 0%, 100% 100%, 0% 100%)'
//             }}
//           />
//           <span
//             style={{
//               position: 'absolute',
//               top: 0,
//               left: 0,
//               width: '100%',
//               height: '100%',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               ...FontStyles.title,
//               color: Colors.brandPrimary,
//               userSelect: 'none',
//             }}
//           >
//             CODE: {room_code}
//           </span>
//         </div>
//       </div>

//       {showOutPopup && (
//         <div style={{
//           position: 'fixed', inset: 0,
//           backgroundColor: 'rgba(0,0,0,0.5)',
//           display: 'flex', justifyContent: 'center', alignItems: 'center',
//           zIndex: 1000
//         }}>
//           <OutPopup onClose={() => setShowOutPopup(false)} />
//         </div>
//       )}

//       {/* 주제 프레임 */}
//       <div style={{
//         position: 'absolute', top: '6%', left: '50%',
//         transform: 'translateX(-50%)'
//       }}>
//         <GameFrame
//           topic={allTopics[currentIndex]}
//           onLeftClick={() => {
//             const next = Math.max(currentIndex - 1, 0);
//             setCurrentIndex(next);
//             localStorage.setItem('category', allTopics[next]);
//           }}
//           onRightClick={() => {
//             const next = Math.min(currentIndex + 1, allTopics.length - 1);
//             setCurrentIndex(next);
//             localStorage.setItem('category', allTopics[next]);
//           }}
//           disableLeft={currentIndex === 0}
//           disableRight={currentIndex === allTopics.length - 1}
//           hideArrows={false}
//         />
//       </div>

//       {/* 플레이어 카드 */}
//       <div style={{
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'flex-start',
//         gap: 32,
//         paddingTop: 160,
//         height: '100vh',
//         boxSizing: 'border-box'
//       }}>
//         {getOrderedPlayers().map((id, idx) => {
//           const assign = assignments.find(a => String(a.player_id) === String(id));
//           const isOwner = String(id) === hostUserId;
//           const isMe = String(id) === myPlayerId;
          
//           console.log(`🎮 [${clientId}] 플레이어 카드 렌더링:`, {
//             id, 
//             roleId: assign?.role_id, 
//             isOwner, 
//             isMe
//           });
          
//           return (
//             <div key={id} style={{ transform: `scale(${idx === 1 ? 1 : 0.9})` }}>
//               <StatusCard
//                 player={`${id}P`}
//                 isOwner={isOwner}
//                 isMe={isMe}
//                 roleId={assign?.role_id}
//                 statusIndex={isMe
//                   ? myStatusIndex
//                   : statusIndexMap[String(id)] || 0}
//                 onContinueClick={() => setShowMicPopup(true)}
//                 onStatusChange={isMe ? setMyStatusIndex : undefined}
//               />
//             </div>
//           );
//         })}
//       </div>

//       {/* 준비하기 ▶ 마이크 테스트 팝업 */}
//       {showMicPopup && (
//         <MicTestPopup
//           userImage={getPlayerImage(Number(localStorage.getItem('myrole_id')))}
//           onConfirm={handleMicConfirm}
//         />
//       )}
//     </Background>
//   );
// }

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
import { FontStyles, Colors } from '../components/styleConstants';
import codeBg from '../assets/roomcodebackground.svg';

export default function WaitingRoom() {
  const location = useLocation();
  const allTopics = ['안드로이드', '자율 무기 시스템'];
  const initialTopic = location.state?.topic || '안드로이드';
  const initialIndex = allTopics.indexOf(initialTopic);

  // WebSocket 연결
  const { isConnected, addMessageHandler, removeMessageHandler } = useWebSocket();
  
  // ✅ 디버깅을 위한 고유 클라이언트 ID 생성
  const [clientId] = useState(() => {
    const id = Math.random().toString(36).substr(2, 9);
    console.log(`🔍 클라이언트 ID: ${id}`);
    return id;
  });

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

  // ✅ 업데이트 중복 방지 플래그
  const [isUpdating, setIsUpdating] = useState(false);

  const room_code = localStorage.getItem('room_code');

  // A) 초기 데이터 로드 - 내 정보 조회
  const loadMyInfo = async () => {
    try {
      const { data: userInfo } = await axiosInstance.get('/users/me');
      const myUserId = userInfo.id;
      localStorage.setItem('user_id', myUserId);
      setMyPlayerId(String(myUserId));
      console.log(`🔍 [${clientId}] 내 정보 로드 완료:`, { myUserId });
      return myUserId;
    } catch (err) {
      console.error(`❌ [${clientId}] 내 정보 로드 실패:`, err);
      return null;
    }
  };

  // B) participants 초기 로드
  const loadParticipants = async () => {
    try {
      const { data: room } = await axiosInstance.get(`/rooms/code/${room_code}`);
      console.log(`📊 [${clientId}] 참가자 데이터 로드:`, room.participants);
      
      setParticipants(room.participants);
      
      // 호스트 정보 설정
      const hostUserId = room.created_by;
      setHostUserId(String(hostUserId));

      // 준비 상태 맵 업데이트
      const readyMap = {};
      room.participants.forEach(p => {
        readyMap[String(p.user_id)] = p.is_ready ? 1 : 0;
      });
      setStatusIndexMap(readyMap);

      return { participants: room.participants, hostUserId };
    } catch (err) {
      console.error(`❌ [${clientId}] participants 로드 실패:`, err);
      return { participants: [], hostUserId: null };
    }
  };

  // ✅ 단일 업데이트 함수로 통합 - host_id 설정 추가
  const updateAssignmentsWithRoles = async () => {
    if (participants.length === 0 || isUpdating) return;
    
    setIsUpdating(true);
    console.log(`🔄 [${clientId}] assignments 업데이트 시작`);

    try {
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
          is_host: Boolean(p.is_host),
          role_id: userRoleId,
        };
      });

      console.log(`✅ [${clientId}] assignments 업데이트 완료:`, updatedAssignments);
      setAssignments(updatedAssignments);
      
      // 내 역할 ID 저장 (한 번만)
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
      
      // ✅ 호스트 역할 ID 저장 (모든 유저에서 실행)
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

  // ✅ 역할 배정 상태 체크
  const checkIfRolesAlreadyAssigned = () => {
    const role1 = localStorage.getItem('role1_user_id');
    const role2 = localStorage.getItem('role2_user_id');
    const role3 = localStorage.getItem('role3_user_id');
    
    const allRolesAssigned = role1 && role2 && role3;
    
    console.log(`🔍 [${clientId}] 역할 배정 상태:`, {
      allRolesAssigned,
      role1, role2, role3
    });
    
    return allRolesAssigned;
  };

  // C) 역할 배정 로직 - 단순화
  const assignRoles = async () => {
    if (hasAssignedRoles) {
      console.log(`⏸️ [${clientId}] 역할 배정 이미 진행 중, 스킵`);
      return;
    }

    if (checkIfRolesAlreadyAssigned()) {
      console.log(`✅ [${clientId}] 역할이 이미 배정되어 있음`);
      setHasAssignedRoles(true);
      return;
    }

    try {
      setHasAssignedRoles(true);
      console.log(`🚀 [${clientId}] 역할 배정 API 호출 시작`);
      
      const { data: roleAssignmentResult } = await axiosInstance.post(`/rooms/assign-roles/${room_code}`);
      console.log(`🎉 [${clientId}] 역할 배정 완료:`, roleAssignmentResult);

      if (roleAssignmentResult.assignments) {
        const assignments = roleAssignmentResult.assignments;
        const myUserId = localStorage.getItem('user_id');
        const currentHostUserId = hostUserId;
        
        // 로컬스토리지에 한 번만 저장
        const roleUserMap = {};
        assignments.forEach(assignment => {
          roleUserMap[assignment.role_id] = String(assignment.player_id);
        });
        
        localStorage.setItem('role1_user_id', roleUserMap[1] || '');
        localStorage.setItem('role2_user_id', roleUserMap[2] || '');
        localStorage.setItem('role3_user_id', roleUserMap[3] || '');
        
        // 내 역할 ID 저장
        const myAssignment = assignments.find(a => String(a.player_id) === String(myUserId));
        if (myAssignment) {
          localStorage.setItem('myrole_id', String(myAssignment.role_id));
        }
        
        // 호스트 역할 ID 저장
        const hostAssignment = assignments.find(a => String(a.player_id) === String(currentHostUserId));
        if (hostAssignment) {
          localStorage.setItem('host_id', String(hostAssignment.role_id));
        }
        
        console.log(`💾 [${clientId}] 로컬스토리지 저장 완료`);
      }
      
      // ✅ 단일 업데이트로 통합
      setTimeout(() => {
        updateAssignmentsWithRoles();
      }, 300);
      
    } catch (err) {
      console.error(`❌ [${clientId}] 역할 배정 실패:`, err);
      setHasAssignedRoles(false);
    }
  };

  // D) 참가자 변화 감지 및 역할 배정 트리거
  useEffect(() => {
    console.log(`🔍 [${clientId}] 참가자 상태 체크:`, {
      participantCount: participants.length,
      myUserId: myPlayerId,
      hostUserId: hostUserId,
      isHost: myPlayerId === hostUserId,
      hasAssignedRoles,
    });

    if (checkIfRolesAlreadyAssigned()) {
      if (!hasAssignedRoles) {
        console.log(`✅ [${clientId}] 역할이 이미 배정되어 있음, 상태 업데이트`);
        setHasAssignedRoles(true);
      }
      return;
    }

    if (
      participants.length === 3 &&
      myPlayerId === hostUserId &&
      !hasAssignedRoles
    ) {
      console.log(`🚀 [${clientId}] 역할 배정 조건 충족!`);
      assignRoles();
    }
  }, [participants, myPlayerId, hostUserId, hasAssignedRoles]);

  // E) WebSocket 메시지 핸들러
  useEffect(() => {
    if (!isConnected) return;

    const handlerId = 'waiting-room';
    
    const messageHandler = (message) => {
      console.log(`📨 [${clientId}] WebSocket 메시지:`, message);
      
      switch (message.type) {
        case 'join':
          setTimeout(() => {
            loadParticipants();
          }, 100);
          break;
          
        case 'voice_status_update':
          setTimeout(() => {
            loadParticipants();
          }, 100);
          break;
          
        default:
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

  // F) 준비 상태 폴링 - 단순화
  useEffect(() => {
    const readyStatusPolling = setInterval(async () => {
      console.log(`🔄 [${clientId}] 폴링 실행`);
      
      try {
        const { data: room } = await axiosInstance.get(`/rooms/code/${room_code}`);
        
        // 참가자 데이터 업데이트
        setParticipants(room.participants);
        
        // 준비 상태 맵 업데이트
        const readyMap = {};
        room.participants.forEach(p => {
          readyMap[String(p.user_id)] = p.is_ready ? 1 : 0;
        });
        setStatusIndexMap(readyMap);
        
        // 내 준비 상태 동기화
        if (myPlayerId) {
          const myParticipant = room.participants.find(p => String(p.user_id) === myPlayerId);
          if (myParticipant) {
            setMyStatusIndex(myParticipant.is_ready ? 1 : 0);
          }
        }
        
      } catch (err) {
        console.error(`❌ [${clientId}] 폴링 실패:`, err);
      }
    }, 5000); // 5초로 늘림
    
    console.log(`📡 [${clientId}] 폴링 시작 (5초 간격)`);
    
    return () => {
      clearInterval(readyStatusPolling);
      console.log(`📡 [${clientId}] 폴링 종료`);
    };
  }, [room_code, myPlayerId]);

  // G) WebSocket 백업 폴링
  useEffect(() => {
    let participantPolling;
    
    if (!isConnected) {
      console.log(`📡 [${clientId}] WebSocket 미연결, 백업 폴링 시작`);
      participantPolling = setInterval(() => {
        loadParticipants();
      }, 5000);
    }
    
    return () => {
      if (participantPolling) {
        clearInterval(participantPolling);
        console.log(`📡 [${clientId}] 백업 폴링 종료`);
      }
    };
  }, [isConnected, room_code]);

  // H) 초기 로드
  useEffect(() => {
    const initializeRoom = async () => {
      console.log(`🚀 [${clientId}] 초기화 시작`);
      
      const myUserId = await loadMyInfo();
      if (myUserId) {
        await loadParticipants();
        
        // 역할이 이미 배정되어 있는지 확인
        if (checkIfRolesAlreadyAssigned()) {
          setHasAssignedRoles(true);
        }
        
        setTimeout(() => {
          updateAssignmentsWithRoles();
        }, 200);
      }
    };
    
    initializeRoom();
  }, [room_code]);

  // I) participants 변경 시 업데이트 (debounce 적용)
  useEffect(() => {
    if (participants.length > 0) {
      const timeoutId = setTimeout(() => {
        updateAssignmentsWithRoles();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [participants]);

  // J) "준비하기" 처리
  const handleMicConfirm = async () => {
    try {
      console.log(`🎤 [${clientId}] 준비하기 API 호출`);
      const { data } = await axiosInstance.post('/rooms/ready', { room_code });
      
      // 즉시 내 상태 업데이트
      setMyStatusIndex(1);
      setShowMicPopup(false);
      
      // 준비 완료 후 즉시 상태 새로고침
      setTimeout(() => {
        loadParticipants();
      }, 500);
      
      if (data.game_starting && data.start_time) {
        const delay = new Date(data.start_time) - new Date();
        setTimeout(() => window.location.href = '/gameintro2', delay);
      }
    } catch (err) {
      console.error(`❌ [${clientId}] ready 실패:`, err);
    }
  };

  // K) 모두 준비됐는지 감시
  useEffect(() => {
    if (participants.length === 0) return;
    const readyCount = participants.filter(p => p.is_ready).length;
    if (readyCount === participants.length && participants.length === 3) {
      console.log(`✅ [${clientId}] 모두 준비 완료 (${readyCount}/${participants.length}) → 게임 시작`);
      window.location.href = '/gameintro2';
    }
  }, [participants]);

  // 플레이어 이미지 매핑
  const getPlayerImage = (roleId) => {
    const playerImages = {
      1: player1,
      2: player2,
      3: player3
    };
    return playerImages[roleId] || player1;
  };

  // 플레이어 순서
  const getOrderedPlayers = () => {
    if (!myPlayerId || assignments.length !== 3)
      return participants.map(p => p.user_id);

    const me = assignments.find(a => String(a.player_id) === myPlayerId);
    const others = assignments.filter(a => String(a.player_id) !== myPlayerId);
    return [others[0]?.player_id, me?.player_id, others[1]?.player_id].filter(Boolean);
  };

  // 렌더링
  return (
    <Background bgIndex={3}>
      {/* ✅ 디버깅 정보 강화 - host_id 추가 */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '4px',
        fontSize: '11px',
        zIndex: 1000,
        maxWidth: '300px'
      }}>
        <div>🔍 Client: {clientId}</div>
        <div>WebSocket: {isConnected ? '✅' : '❌'}</div>
        <div>참가자: {participants.length}/3</div>
        <div>내 ID: {myPlayerId}</div>
        <div>호스트 ID: {hostUserId}</div>
        <div>방장: {myPlayerId === hostUserId ? 'YES' : 'NO'}</div>
        <div>역할배정: {hasAssignedRoles ? 'DONE' : 'PENDING'}</div>
        <div>내 역할: {localStorage.getItem('myrole_id') || 'NONE'}</div>
        <div>호스트 역할: {localStorage.getItem('host_id') || 'NONE'}</div>
        <div>준비완료: {participants.filter(p => p.is_ready).length}/3</div>
        <div>업데이트 중: {isUpdating ? 'YES' : 'NO'}</div>
        <div style={{ fontSize: '10px', marginTop: '5px', borderTop: '1px solid #555', paddingTop: '5px' }}>
          <div>LocalStorage:</div>
          <div>role1: {localStorage.getItem('role1_user_id')}</div>
          <div>role2: {localStorage.getItem('role2_user_id')}</div>
          <div>role3: {localStorage.getItem('role3_user_id')}</div>
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
          const assign = assignments.find(a => String(a.player_id) === String(id));
          const isOwner = String(id) === hostUserId;
          const isMe = String(id) === myPlayerId;
          
          console.log(`🎮 [${clientId}] 플레이어 카드 렌더링:`, {
            id, 
            roleId: assign?.role_id, 
            isOwner, 
            isMe
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