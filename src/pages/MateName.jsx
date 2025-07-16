// // //로컬스토리지 말고 API 연결로 만들어두는 중 
// // // roomcode는 모두 수정 필요 
// // import React, { useState,useEffect } from 'react';
// // import { useLocation, useNavigate } from 'react-router-dom';

// // import Layout from '../components/Layout';
// // import InputBoxSmall from '../components/InputBoxSmall';
// // import ContentTextBox2 from '../components/ContentTextBox2';

// // import character1 from '../assets/images/character1.png';
// // import character2 from '../assets/images/character2.png';
// // import character3 from '../assets/images/character3.png';
// // import axiosInstance from '../api/axiosInstance';
// // import { fetchWithAutoToken } from '../utils/fetchWithAutoToken';
// // export default function MateName() {
// //   const location = useLocation();
// //   const navigate = useNavigate();

// //   const images = [character1, character2, character3];

// //   const [name, setName] = useState('');
// //   const paragraphs = [
// //     {
// //       main: '     여러분이 사용자라면 HomeMate를 어떻게 부를까요?',
// //       sub: '(함께 토론한 후 1P가 입력하고 "다음" 버튼을 클릭해 주세요)',
// //     },
// //   ];
// //   const [selectedIndex, setSelectedIndex] = useState(null);
// //   const roomCode = '123456';
// //   useEffect(() => {
// //     const fetchAiSelection = async () => {
// //       try {
// //         await fetchWithAutoToken();

// //         const response = await axiosInstance.get('/rooms/ai-select', {
// //           params: {
// //             room_code: roomCode,
// //           },
// //         });

// //         const aiType = response.data.ai_type;      // 서버 값: 1, 2, 3
// //         const index = aiType - 1;                  // 프론트 인덱스: 0, 1, 2
// //         setSelectedIndex(index);
// //         console.log('선택된 AI 인덱스:', index);
// //       } catch (err) {
// //         console.error(' AI 정보 불러오기 실패:', err);
// //       }
// //     };

// //     fetchAiSelection();
// //   }, []);

// //   const handleContinue = () => {
// //     if (!name.trim()) {
// //       alert('이름을 입력해주세요!');
// //       return;
// //     }

// //     localStorage.setItem('mateName', name);
// //     navigate('/gamemap', {
// //       state: { selectedIndex },
// //     });
// //   };

// //   return (
// //     <Layout subtopic="가정 1" me="1P">
// //       <div
// //         style={{
// //           display: 'flex',
// //           flexDirection: 'column',
// //           alignItems: 'center',
// //           gap: 4,
// //         }}
// //       >
// //         <img
// //           src={images[selectedIndex]}
// //           alt="Selected Character"
// //           style={{
// //             width: 264,
// //             height: 360,
// //             objectFit: 'cover',
// //             borderRadius: 4,
// //             border: '2px solid #354750',
// //           }}
// //         />
// //         <InputBoxSmall
// //           placeholder="여러분의 HomeMate 이름을 입력하세요"
// //           width={520}
// //           height={64}
// //           value={name}
// //           onChange={(e) => setName(e.target.value)}
// //         />
// //         <div style={{ width: '100%', maxWidth: 936 }}>
// //           <ContentTextBox2 paragraphs={paragraphs} onContinue={handleContinue} />
// //         </div>
// //       </div>
// //     </Layout>
// //   );
// // }
// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import Background from '../components/Background';
// import UserProfile from '../components/Userprofile';

// import Layout from '../components/Layout';
// import InputBoxSmall from '../components/InputBoxSmall';
// import ContentTextBox2 from '../components/ContentTextBox2';

// import character1 from '../assets/images/character1.png';
// import character2 from '../assets/images/character2.png';
// import character3 from '../assets/images/character3.png';

// import axiosInstance from '../api/axiosInstance';
// import { fetchWithAutoToken } from '../utils/fetchWithAutoToken';

// export default function MateName() {
//   const navigate = useNavigate();
//   const images = [character1, character2, character3];

//   const [name, setName] = useState('');
//   const [selectedIndex, setSelectedIndex] = useState(null);
//   const roomCode= localStorage.getItem('room_code');
//   const [hostId, setHostId] = useState(null);
//   const [myRoleId, setMyRoleId] = useState(null);
  
    
//   const paragraphs = [
//     {
//       main: '     여러분이 사용자라면 HomeMate를 어떻게 부를까요?',
//       sub: '(함께 토론한 후 1P가 입력하고 "다음" 버튼을 클릭해 주세요)',
//     },
//   ];
//  useEffect(() => {
//     // 로컬스토리지에서 hostId, myRoleId 불러오기
//     const storedHost = localStorage.getItem('host_id');
//     const storedMyRole = localStorage.getItem('myrole_id');
//     setHostId(storedHost);
//     setMyRoleId(storedMyRole);
//   }, []);

//   useEffect(() => {
//     const fetchAiSelection = async () => {
//       try {
//         await fetchWithAutoToken();
//         const response = await axiosInstance.get('/rooms/ai-select', {
//           params: { room_code: roomCode },
//         });

//         const aiType = response.data.ai_type;
//         const index = aiType ;
//         setSelectedIndex(index);
//         console.log('선택된 AI 인덱스:', index);
//       } catch (err) {
//         console.error('❌ AI 정보 불러오기 실패:', err);
//       }
//     };

//     fetchAiSelection();
//   }, []);

//   const handleContinue = async () => {
//     if (!name.trim()) {
//       alert('이름을 입력해주세요!');
//       return;
//     }

//     try {
//       await fetchWithAutoToken();

//       await axiosInstance.post('/rooms/ai-name', {
//         room_code: roomCode,
//         ai_name: name.trim(),
//       });
//       console.log(name);
//       localStorage.setItem('matename', name);
//       navigate('/gamemap', {
//         state: { selectedIndex },
//       });
//     } catch (err) {
//       console.error('❌ AI 이름 저장 실패:', err);
//       const msg = err.response?.data?.detail;
//       alert(`이름 저장 중 오류: ${msg || '알 수 없는 오류'}`);
//     }
//   };

//   return (
//     <Background bgIndex={3}>
//         <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>
//               <div style={{
//                 position: 'fixed',
//                 top: '32.5%',
//                 left: 0,
//                 transform: 'translateY(-50%)',
//                 width: 220,
//                 padding: '20px 0',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 gap: 24,
//                 alignItems: 'flex-start',
//               }}>
//                 <UserProfile player="1P" isLeader={hostId === '1'} isMe={myRoleId === '1'} />
//                 <UserProfile player="2P" isLeader={hostId === '2'} isMe={myRoleId === '2'} />
//                 <UserProfile player="3P" isLeader={hostId === '3'} isMe={myRoleId === '3'} />
//               </div>
//               <div style={{
//           position: 'absolute',
//           top: '50%',
//           left: '50%',
//           transform: 'translate(-50%, -50%)',
//           width: '80vw',
//           maxWidth: 936,
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//         }}>

//         {selectedIndex !== null && (
//           <img
//             src={images[selectedIndex]}
//             alt="Selected Character"
//             style={{
//               width: 264,
//               height: 350,
//               objectFit: 'cover',
//               borderRadius: 4,
//               border: '2px solid #354750',
//             }}
//           />
//         )}
//           <div style={{ height: 20 }} />
//         <InputBoxSmall
//           placeholder="여러분의 HomeMate 이름을 입력하세요"
//           width={520}
//           height={64}
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />
//         <div style={{ width: '100%', maxWidth: 936 }}>
//           <ContentTextBox2 paragraphs={paragraphs} onContinue={handleContinue} />
//         </div>

//       </div>
//       </div>
//       </Background>
//   );
// }
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import InputBoxSmall from '../components/InputBoxSmall';
import ContentTextBox2 from '../components/ContentTextBox2';

import character1 from '../assets/images/character1.png';
import character2 from '../assets/images/character2.png';
import character3 from '../assets/images/character3.png';

import axiosInstance from '../api/axiosInstance';
import { fetchWithAutoToken } from '../utils/fetchWithAutoToken';
import voiceManager from '../utils/voiceManager';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';

export default function MateName() {
  const navigate = useNavigate();
  const images = [character1, character2, character3];

  const [name, setName] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const roomCode = localStorage.getItem('room_code');
  const [hostId, setHostId] = useState(null);
  const [myRoleId, setMyRoleId] = useState(null);

  // 역할별 사용자 ID 매핑
  const [roleUserMapping, setRoleUserMapping] = useState({
    role1_user_id: null,
    role2_user_id: null,
    role3_user_id: null,
  });

  // 음성 상태 관리
  const { voiceStates, getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);

  // 음성 세션 상태
  const [voiceSessionStatus, setVoiceSessionStatus] = useState({
    isConnected: false,
    isSpeaking: false,
    sessionId: null,
    nickname: null,
    participantId: null,
    micLevel: 0,
    speakingThreshold: 30
  });

  const paragraphs = [
    {
      main: '     여러분이 사용자라면 HomeMate를 어떻게 부를까요?',
      sub: '(함께 토론한 후 1P가 입력하고 "다음" 버튼을 클릭해 주세요)',
    },
  ];

  useEffect(() => {
    // 로컬스토리지에서 hostId, myRoleId 불러오기
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
  }, []);

  // 음성 세션 상태 업데이트
  useEffect(() => {
    const statusInterval = setInterval(() => {
      const currentStatus = voiceManager.getStatus();
      setVoiceSessionStatus(currentStatus);
    }, 100);
    
    return () => clearInterval(statusInterval);
  }, []);

  // 특정 역할의 음성 상태 가져오기 (내 것은 실시간, 다른 사람은 WebSocket)
  const getVoiceStateForRoleWithMyStatus = (roleId) => {
    const roleIdStr = String(roleId);
    
    // 내 역할이면 실시간 상태 반환
    if (roleIdStr === myRoleId) {
      return {
        is_speaking: voiceSessionStatus.isSpeaking,
        is_mic_on: voiceSessionStatus.isConnected,
        nickname: voiceSessionStatus.nickname || ''
      };
    }
    
    // 다른 사람 역할이면 WebSocket 상태 반환
    return getVoiceStateForRole(roleId);
  };

  useEffect(() => {
    const fetchAiSelection = async () => {
      try {
        await fetchWithAutoToken();
        const response = await axiosInstance.get('/rooms/ai-select', {
          params: { room_code: roomCode },
        });

        const aiType = response.data.ai_type;
        const index = aiType-1;
        setSelectedIndex(index);
        console.log('선택된 AI 인덱스:', index);
      } catch (err) {
        console.error('❌ AI 정보 불러오기 실패:', err);
      }
    };

    fetchAiSelection();
  }, []);

  const handleContinue = async () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요!');
      return;
    }

    try {
      await fetchWithAutoToken();

      await axiosInstance.post('/rooms/ai-name', {
        room_code: roomCode,
        ai_name: name.trim(),
      });
      console.log(name);
      localStorage.setItem('matename', name);
      navigate('/gamemap', {
        state: { selectedIndex },
      });
    } catch (err) {
      navigate('/gamemap', {
        state: { selectedIndex },
      });
      console.error('❌ AI 이름 저장 실패:', err);
      const msg = err.response?.data?.detail;
      alert(`이름 저장 중 오류: ${msg || '알 수 없는 오류'}`);
    }
  };

  return (
    <Background bgIndex={3}>
  

      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        <div style={{
          position: 'fixed',
          top: '32.5%',
          left: 0,
          transform: 'translateY(-50%)',
          width: 220,
          padding: '20px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          alignItems: 'flex-start',
        }}>
          <UserProfile 
            player="1P" 
            isLeader={hostId === '1'} 
            isMe={myRoleId === '1'} 
            isSpeaking={getVoiceStateForRoleWithMyStatus(1).is_speaking}
            isMicOn={getVoiceStateForRoleWithMyStatus(1).is_mic_on}
            nickname={getVoiceStateForRoleWithMyStatus(1).nickname}
          />
          <UserProfile 
            player="2P" 
            isLeader={hostId === '2'} 
            isMe={myRoleId === '2'} 
            isSpeaking={getVoiceStateForRoleWithMyStatus(2).is_speaking}
            isMicOn={getVoiceStateForRoleWithMyStatus(2).is_mic_on}
            nickname={getVoiceStateForRoleWithMyStatus(2).nickname}
          />
          <UserProfile 
            player="3P" 
            isLeader={hostId === '3'} 
            isMe={myRoleId === '3'} 
            isSpeaking={getVoiceStateForRoleWithMyStatus(3).is_speaking}
            isMicOn={getVoiceStateForRoleWithMyStatus(3).is_mic_on}
            nickname={getVoiceStateForRoleWithMyStatus(3).nickname}
          />
        </div>

        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80vw',
          maxWidth: 936,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          {selectedIndex !== null && (
            <img
              src={images[selectedIndex]}
              alt="Selected Character"
              style={{
                width: 264,
                height: 350,
                objectFit: 'cover',
                borderRadius: 4,
                border: '2px solid #354750',
              }}
            />
          )}
          <div style={{ height: 20 }} />
          <InputBoxSmall
            placeholder="여러분의 HomeMate 이름을 입력하세요"
            width={520}
            height={64}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div style={{ width: '100%', maxWidth: 936 }}>
            <ContentTextBox2 paragraphs={paragraphs} onContinue={handleContinue} />
          </div>
        </div>

      </div>
    </Background>
  );
}