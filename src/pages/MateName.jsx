// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Background from '../components/Background';
// import UserProfile from '../components/Userprofile';
// import InputBoxSmall from '../components/InputBoxSmall';
// import ContentTextBox from '../components/ContentTextBox';

// import character1 from '../assets/images/character1.png';
// import character2 from '../assets/images/character2.png';
// import character3 from '../assets/images/character3.png';

// import axiosInstance from '../api/axiosInstance';
// import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
// import { useWebRTC } from '../WebRTCProvider';
// import { useWebSocket } from '../WebSocketProvider';
// import {Colors,FontStyles} from "../components/styleConstants";
// import { 
//   useWebSocketNavigation, 
//   useHostActions 
// } from '../hooks/useWebSocketMessage';
// export default function MateName() {
//   const navigate = useNavigate();
//   const images = [character1, character2, character3];

//   const [name, setName] = useState('');
//   const [selectedIndex, setSelectedIndex] = useState(null);
//   const roomCode = localStorage.getItem('room_code');
//   const [hostId, setHostId] = useState(null);
//   const [myRoleId, setMyRoleId] = useState(null);

//   // WebSocket과 WebRTC 상태 가져오기
//   const { voiceSessionStatus, isInitialized: webrtcInitialized } = useWebRTC();
//   const { isConnected: websocketConnected } = useWebSocket();

//   const { isHost, sendNextPage } = useHostActions();
  
//   useWebSocketNavigation(navigate, {
//     nextPagePath: '/gamemap'  // 다음 페이지 경로
//   });

//   //  연결 상태 모니터링
//   const [connectionStatus, setConnectionStatus] = useState({
//     websocket: false,
//     webrtc: false,
//     ready: false
//   });

//   // 역할별 사용자 ID 매핑
//   const [roleUserMapping, setRoleUserMapping] = useState({
//     role1_user_id: null,
//     role2_user_id: null,
//     role3_user_id: null,
//   });

//   // WebSocket 음성 상태 가져오기 (다른 참가자)
// const { getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);

//   // 컴포넌트 초기화
//   useEffect(() => {
//     const storedHost = localStorage.getItem('host_id');
//     const storedMyRole = localStorage.getItem('myrole_id');
//     const role1 = localStorage.getItem('role1_user_id');
//     const role2 = localStorage.getItem('role2_user_id');
//     const role3 = localStorage.getItem('role3_user_id');

//     setHostId(storedHost);
//     setMyRoleId(storedMyRole);
//     setRoleUserMapping({
//       role1_user_id: role1,
//       role2_user_id: role2,
//       role3_user_id: role3,
//     });

//     console.log('🔧 [MateName] 초기화 완료:', {
//       hostId: storedHost,
//       myRoleId: storedMyRole,
//       roleMapping: { role1, role2, role3 },
//       isHost: storedHost === storedMyRole
//     });
//   }, []);

//   //  연결 상태 모니터링
//   useEffect(() => {
//     const newStatus = {
//       websocket: websocketConnected,
//       webrtc: webrtcInitialized,
//       ready: websocketConnected && webrtcInitialized
//     };

//     setConnectionStatus(newStatus);

//     console.log('🔧 [MateName] 연결 상태 업데이트:', newStatus);
//   }, [websocketConnected, webrtcInitialized]);


//   // 선택된 AI 타입 불러오기
//   useEffect(() => {
//     const fetchAiSelection = async () => {
//       try {
//         const response = await axiosInstance.get('/rooms/ai-select', {
//           params: { room_code: roomCode },
//         });
//         const aiType = response.data.ai_type;
//         setSelectedIndex(aiType - 1);
//         console.log(' [MateName] AI 선택 정보 로드:', aiType);
//       } catch (err) {
//         console.error(' [MateName] AI 정보 불러오기 실패:', err);
//       }
//     };
//     fetchAiSelection();
//   }, [roomCode]);

// // selectedIndex가 설정되면 localStorage에 저장
// useEffect(() => {
//   if (selectedIndex !== null) {
//     localStorage.setItem('selectedCharacterIndex', selectedIndex);
//     console.log(' [MateName] selectedCharacterIndex 저장됨:', selectedIndex);
//   }
// }, [selectedIndex]);


//   const paragraphs = [
//     {
//       main: '     여러분이 사용자라면 HomeMate를 어떻게 부를까요?',
//       sub: 
//          '합의 후에 방장이 이름을 작성해주세요.'
//     },
//   ];

//   //  방장 전용 이름 입력 핸들러
//   const handleNameChange = (e) => {
//     if (!isHost) {
//       alert('방장이 아니므로 이름 입력이 불가능합니다.');
//       console.log('⚠️ [MateName] 방장이 아니므로 이름 입력 불가');
//       return;
//     }
//     setName(e.target.value);
//     console.log(`✏️ [MateName] 방장이 이름 입력: "${e.target.value}"`);
//   };

//   const handleContinue = async () => {
//     console.log('➡️ [MateName] 다음 버튼 클릭');

//     //  방장이 아닌 경우 차단
//     if (!isHost) {
//       console.log('⚠️ [MateName] 방장이 아니므로 진행 불가');
//       alert('방장만 게임을 진행할 수 있습니다.');
//       return;
//     }

//     //  이름 입력 확인
//     if (!name.trim()) {
//       alert('이름을 입력해주세요!');
//       return;
//     }
//     const roomCode = localStorage.getItem('room_code');
//       if (!roomCode) {
//          alert('room_code가 없습니다. 방에 먼저 입장하세요.');
//          return;
//        }
//     const trimmed = name.trim();
//     try {
//       // 1) AI 이름 저장
//      await axiosInstance.post('/rooms/ai-name', {
//          room_code: roomCode,
//          ai_name: trimmed,
//        });
//        console.log('[MateName] AI 이름 저장 완료:', trimmed);
//        localStorage.setItem('mateName', trimmed);
  
//      // 2) next_page 브로드캐스트
//        const ok = sendNextPage();
//        if (!ok) {
//          console.error('[MateName] next_page 전송 실패 → 로컬 네비게이션 fallback');
//          navigate('/gamemap');
//        }

//       } 
//       catch (err) {
//        console.error('[MateName] AI 이름 저장 실패:', err);
//        alert(err?.response?.data?.detail ?? '이름 저장 중 오류가 발생했습니다.');
//      }
//    };
    

//   return (
//     <Background bgIndex={2}>
      
//       <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>
//         {/* 사이드 프로필 */}
//         <div style={{
//           position: 'fixed', top: '32.5%', left: 0, transform: 'translateY(-50%)',
//           width: 220, padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start'
//         }}>
//           {[1,2,3].map(role => {
//            // const vs = getVoiceState(role);
//             return (
//               <UserProfile
//                 key={role}
//                 player={`${role}P`}
//                 isLeader={hostId === String(role)}
//                 isMe={myRoleId === String(role)}
//               />
//             );
//           })}
//         </div>

//         {/* 메인 컨텐츠 */}
//         <div style={{
//           position: 'absolute', top: '46%', left: '50%', transform: 'translate(-50%, -50%)',
//           width: '80vw', maxWidth: 936, display: 'flex', flexDirection: 'column', alignItems: 'center'
//         }}>
//           {selectedIndex !== null && (
//             <img
//               src={images[selectedIndex]}
//               alt="Selected Character"
//               style={{ 
//                 width: 264, 
//                 height: 350, 
//                 objectFit: 'cover', 
//                 borderRadius: 4, 
//                 marginBottom: -15,
//                 opacity: isHost ? 1 : 0.8, 

//               }}
//             />
//           )}
//           <div style={{ height: 20 }} />

//           <InputBoxSmall
//             label=""            // 라벨 비우기
//             labelWidth={0}
//             placeholder={"여러분의 HomeMate 이름을 지어주세요.(방장만 입력 가능)"}
//             width={520} 
//             height={64}
//             value={name} 
//             onChange={handleNameChange} 
//             style={{
//               margin: '0 auto',
//               margin: '0 auto',         
//               cursor: isHost ? 'text' : 'not-allowed', 
//               backgroundColor: isHost ? undefined : '#f5f5f5' 
//             }}
//           />

//           <div style={{ width: '100%',marginTop: 10, maxWidth: 936 }}>
//             <ContentTextBox 
//               paragraphs={paragraphs} 
//               onContinue={handleContinue}
//             />
//           </div>
//         </div>
        
//       </div>
// {/* 
//       {showPopup && (
//                 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
//                   <HostCheck2
//                     onClose={() => setShowPopup(false)}
//                     mateName={name}
//                   />
//                   </div>
//               )} */}
//     </Background>
//   );
// }

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import InputBoxSmall from '../components/InputBoxSmall';
import ContentTextBox from '../components/ContentTextBox';

import character1 from '../assets/images/character1.png';
import character2 from '../assets/images/character2.png';
import character3 from '../assets/images/character3.png';
import killerCharacter1 from '../assets/images/Killer_Character1.jpg';
import killerCharacter2 from '../assets/images/Killer_Character2.jpg';
import killerCharacter3 from '../assets/images/Killer_Character3.jpg';

import axiosInstance from '../api/axiosInstance';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import { useWebRTC } from '../WebRTCProvider';
import { useWebSocket } from '../WebSocketProvider';
import { Colors, FontStyles } from "../components/styleConstants";
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';
import { clearAllLocalStorageKeys } from '../utils/storage';

import hostInfoSvg from '../assets/host_info.svg';

export default function MateName() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const roomCode = localStorage.getItem('room_code');
  const [hostId, setHostId] = useState(null);
  const [myRoleId, setMyRoleId] = useState(null);
  const category = localStorage.getItem('category') || '안드로이드';

// 카테고리별 이미지 세트
  const isAWS = category === '자율 무기 시스템';
  const images = isAWS
    ? [killerCharacter1, killerCharacter2, killerCharacter3]
    : [character1, character2, character3];

    const uiText = isAWS
    ? {
        placeholder: '여러분이 사용자라면 자율무기시스템을 어떻게 부를까요? (방장만 입력 가능)',
        main: '여러분이 생각하는 자율무기시스템은 어떤 형태인가요?',
      }
    : {
        placeholder: '여러분의 HomeMate 이름을 지어주세요.(방장만 입력 가능)',
        main: '     여러분이 사용자라면 HomeMate를 어떻게 부를까요?',
      };

  const { voiceSessionStatus, isInitialized: webrtcInitialized } = useWebRTC();
  const { isConnected: websocketConnected } = useWebSocket();
  const { isHost, sendNextPage } = useHostActions();
  useWebSocketNavigation(navigate, { nextPagePath: '/gamemap' });

  const [connectionStatus, setConnectionStatus] = useState({ websocket: false, webrtc: false, ready: false });
  const [roleUserMapping, setRoleUserMapping] = useState({
    role1_user_id: null,
    role2_user_id: null,
    role3_user_id: null,
  });
  const { getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);

  useEffect(() => {
    const storedHost = localStorage.getItem('host_id');
    const storedMyRole = localStorage.getItem('myrole_id');
    const role1 = localStorage.getItem('role1_user_id');
    const role2 = localStorage.getItem('role2_user_id');
    const role3 = localStorage.getItem('role3_user_id');

    setHostId(storedHost);
    setMyRoleId(storedMyRole);
    setRoleUserMapping({ role1_user_id: role1, role2_user_id: role2, role3_user_id: role3 });
  }, []);

  useEffect(() => {
    const newStatus = {
      websocket: websocketConnected,
      webrtc: webrtcInitialized,
      ready: websocketConnected && webrtcInitialized,
    };
    setConnectionStatus(newStatus);
  }, [websocketConnected, webrtcInitialized]);
 useEffect(() => {
    if (!websocketConnected) {
      console.warn('❌ WebSocket 연결 끊김 감지됨');
      alert('⚠️ 연결이 끊겨 게임이 초기화됩니다.');
      clearAllLocalStorageKeys();
      navigate('/');
    }
  }, [websocketConnected]);

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
    // 2) 로컬 없을 때만 API 호출 (ai_type은 1~3)
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

  const paragraphs = [
    { main: uiText.main, sub: '합의 후에 방장이 이름을 작성해주세요.' },
  ];

  const handleNameChange = (e) => {
    if (!isHost) {
      alert('방장이 아니므로 이름 입력이 불가능합니다.');
      return;
    }
    setName(e.target.value);
  };

  const handleContinue = async () => {
    if (!isHost) {
      alert('방장만 게임을 진행할 수 있습니다.');
      return;
    }
    if (!name.trim()) {
      alert('이름을 입력해주세요!');
      return;
    }
    const rc = localStorage.getItem('room_code');
    if (!rc) {
      alert('room_code가 없습니다. 방에 먼저 입장하세요.');
      return;
    }
    const trimmed = name.trim();
    try {
      await axiosInstance.post('/rooms/ai-name', { room_code: rc, ai_name: trimmed });
      localStorage.setItem('mateName', trimmed);
      const ok = sendNextPage();
      if (!ok) navigate('/gamemap');
    } catch (err) {
      console.error('[MateName] AI 이름 저장 실패:', err);
      alert(err?.response?.data?.detail ?? '이름 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <Background bgIndex={2}>
       {hostId === myRoleId && (
            <div 
              style={{
                position: 'absolute',
                top:'-105px',
                right: '0px', 
                zIndex: 10, 
              }}
            >
              <img 
                src={hostInfoSvg} 
                alt="Host Info"
                style={{
                  width: '300px', 
                  height: '300px', 
                }}
              />
            </div>
          )}
      
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        {/* 사이드 프로필 */}
        <div style={{ position: 'fixed', top: '32.5%', left: 0, transform: 'translateY(-50%)', width: 220, padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
          {[1, 2, 3].map(role => (
            <UserProfile key={role} player={`${role}P`} isLeader={hostId === String(role)} isMe={myRoleId === String(role)} />
          ))}
        </div>

        {/* 메인 컨텐츠 */}
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
            width={520}
            height={64}
            value={name}
            onChange={handleNameChange}
            style={{ margin: '0 auto', cursor: isHost ? 'text' : 'not-allowed', backgroundColor: isHost ? undefined : '#f5f5f5' }}
          />

          <div style={{ width: '100%', marginTop: 10, maxWidth: 936 }}>
            <ContentTextBox paragraphs={paragraphs} onContinue={handleContinue} />
          </div>
        </div>
      </div>
    </Background>
  );
}
