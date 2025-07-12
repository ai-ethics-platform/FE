// import React, { useState } from 'react';
// import { useLocation } from 'react-router-dom';
// import Background from '../components/Background';
// import BackButton from '../components/BackButton';
// import StatusCard from '../components/StatusCard';
// import MicTestPopup from '../components/MicTestPopup';
// import OutPopup from '../components/OutPopup';
// import GameFrame from '../components/GameFrame';
// import player1 from "../assets/1player.svg";

// export default function WaitingRoom() {
//   const location = useLocation();
//   const allTopics = ['안드로이드', '자율 무기 시스템'];

//   //  이전에 선택한 topic을 받아서 해당 index로 초기화
//   const initialTopic = location.state?.topic || '안드로이드';
//   const initialIndex = allTopics.indexOf(initialTopic);
//   const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

//   const [showMicPopup, setShowMicPopup] = useState(false);
//   const [myStatusIndex, setMyStatusIndex] = useState(0);
//   const [showOutPopup, setShowOutPopup] = useState(false);

//   const handleBackClick = () => setShowOutPopup(true);
//   const handleClosePopup = () => setShowOutPopup(false);
//   const handleMicConfirm = () => {
//     setMyStatusIndex(1);
//     setShowMicPopup(false);
//   };

//   return (
//     <Background bgIndex={3}>
//       <div style={{ position: 'absolute', top: -10, left: -10 }} onClick={handleBackClick}>
//         <BackButton />
//       </div>

//       {showOutPopup && (
//         <div style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           width: '100vw',
//           height: '100vh',
//           backgroundColor: 'rgba(0,0,0,0.5)',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           zIndex: 1000,
//         }}>
//           <OutPopup onClose={handleClosePopup} />
//         </div>
//       )}

//       {/*  topic 배열에서 현재 인덱스에 해당하는 주제만 보여줌 */}
      
//        <div
//              style={{
//                 position: 'absolute',
//                 top: '6%',
//                 left: '50%',
//                 transform: 'translateX(-50%)',
//               }}
//             >
      
//       <GameFrame
//         topic={allTopics[currentIndex]}
//         onLeftClick={() => {
//           const newIndex = Math.max(currentIndex - 1, 0);
//           setCurrentIndex(newIndex);
//           console.log(allTopics[newIndex]);
//           localStorage.setItem('category', allTopics[newIndex]); 
//         }}
//         onRightClick={() => {
//           const newIndex = Math.min(currentIndex + 1, allTopics.length - 1);
//           setCurrentIndex(newIndex);
//           console.log(allTopics[newIndex]);
//           localStorage.setItem('category', allTopics[newIndex]); 
//         }}
//         disableLeft={currentIndex === 0}
//         disableRight={currentIndex === allTopics.length - 1}
//         hideArrows={false}
//       />
//       </div>

//       {/* 상태 카드 */}
//       <div style={{
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'flex-start', 
//         gap: '32px', 
//         paddingTop: '160px',
//         height: '100vh',
//         boxSizing: 'border-box',
//       }}>
//         <div style={{ transform: 'scale(0.9)' }}>
//           <StatusCard player="2P" isOwner={false} isMe={false} />
//         </div>
//         <div style={{ transform: 'scale(1.0)' }}>
//           <StatusCard
//             player="1P"
//             isOwner={true}
//             isMe={true}
//             onContinueClick={() => setShowMicPopup(true)}
//             statusIndex={myStatusIndex}
//             onStatusChange={setMyStatusIndex}
//           />
//         </div>
//         <div style={{ transform: 'scale(0.9)' }}>
//           <StatusCard player="3P" isOwner={false} isMe={false} />
//         </div>
//       </div>
//       {showMicPopup && <MicTestPopup userImage={player1} onConfirm={handleMicConfirm} />}
//     </Background>
//   );
// }
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Background from '../components/Background';
import BackButton from '../components/BackButton';
import StatusCard from '../components/StatusCard';
import MicTestPopup from '../components/MicTestPopup';
import OutPopup from '../components/OutPopup';
import GameFrame from '../components/GameFrame';
import player1 from "../assets/1player.svg";

export default function WaitingRoom() {
  const location = useLocation();
  const allTopics = ['안드로이드', '자율 무기 시스템'];
  const initialTopic = location.state?.topic || '안드로이드';
  const initialIndex = allTopics.indexOf(initialTopic);
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

  const [showMicPopup, setShowMicPopup] = useState(false);
  const [myStatusIndex, setMyStatusIndex] = useState(0);
  const [showOutPopup, setShowOutPopup] = useState(false);

  const [myPlayerId, setMyPlayerId] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const token = localStorage.getItem("access_token");
//        const roomCode = localStorage.getItem("room_code");
        const roomCode= "123456";
        const response = await axios.get(
          `https://dilemmai.org/rooms/assign-roles/${roomCode}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setMyPlayerId(response.data.player_id);
      } catch (error) {
        console.error("역할 할당 실패:", error);
      }
    };

    fetchRole();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
   // const sessionId = localStorage.getItem("room_code");
    const sessionId = "123456";
    const socket = new WebSocket(`wss://dilemmai.org/ws/voice/${sessionId}?token=${token}`);

    socket.onopen = () => console.log("WebSocket 연결됨");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.start_time) {
        console.log("게임 시작 시간:", data.start_time);
        // start_time 기반 게임 시작 처리
      }
    };

    return () => socket.close();
  }, []);

  const getOrderedPlayers = () => {
    if (!myPlayerId) return [1, 2, 3];
    const others = [1, 2, 3].filter(id => id !== myPlayerId);
    return [others[0], myPlayerId, others[1]];
  };

  const handleBackClick = () => setShowOutPopup(true);
  const handleClosePopup = () => setShowOutPopup(false);
  const handleMicConfirm = () => {
    setMyStatusIndex(1);
    setShowMicPopup(false);
  };

  const handleReadyClick = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `https://dilemmai.org/rooms/join/ready`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (e) {
      console.error("준비 실패", e);
    }
  };

  return (
    <Background bgIndex={3}>
      <div style={{ position: 'absolute', top: -10, left: -10 }} onClick={handleBackClick}>
        <BackButton />
      </div>

      {showOutPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <OutPopup onClose={handleClosePopup} />
        </div>
      )}

      <div style={{ position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%)' }}>
        <GameFrame
          topic={allTopics[currentIndex]}
          onLeftClick={() => {
            const newIndex = Math.max(currentIndex - 1, 0);
            setCurrentIndex(newIndex);
            localStorage.setItem('category', allTopics[newIndex]);
          }}
          onRightClick={() => {
            const newIndex = Math.min(currentIndex + 1, allTopics.length - 1);
            setCurrentIndex(newIndex);
            localStorage.setItem('category', allTopics[newIndex]);
          }}
          disableLeft={currentIndex === 0}
          disableRight={currentIndex === allTopics.length - 1}
          hideArrows={false}
        />
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '32px',
        paddingTop: '160px',
        height: '100vh',
        boxSizing: 'border-box',
      }}>
        {getOrderedPlayers().map((id, idx) => (
          <div key={id} style={{ transform: `scale(${idx === 1 ? 1.0 : 0.9})` }}>
            <StatusCard
              player={`${id}P`}
              isOwner={id === 1}
              isMe={id === myPlayerId}
              onContinueClick={() => setShowMicPopup(true)}
              statusIndex={id === myPlayerId ? myStatusIndex : 0}
              onStatusChange={id === myPlayerId ? setMyStatusIndex : undefined}
            />
          </div>
        ))}
      </div>

      {showMicPopup && <MicTestPopup userImage={player1} onConfirm={handleMicConfirm} />}
    </Background>
  );
}
