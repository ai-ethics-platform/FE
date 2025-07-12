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
  const [myRole, setMyRole] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      const accessToken = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");
     
      try {
        console.log("🔑 access_token:", accessToken);
        console.log("🔁 refresh_token:", refreshToken);
  
        // 1. 내 user_id 확인
        const userInfoRes = await axios.get("https://dilemmai.org/users/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Refresh-Token': `Bearer ${refreshToken}`,
          },
        });
        const myUserId = String(userInfoRes.data.id);
        console.log("✅ 내 user_id는:", myUserId);
        const room_code="123456";

        // 2. 역할 배정 요청
        const roleRes = await axios.post(
          `https://dilemmai.org/rooms/assign-roles/${room_code}/`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'X-Refresh-Token': `Bearer ${refreshToken}`,
            },
          }
        );
  
        console.log("✅ 역할 할당 응답:", roleRes.data);
  
        // 3. 내 역할 찾기
        const myRole = roleRes.data.assignments.find(
          (a) => String(a.player_id) === myUserId
        );
  
        if (myRole) {
          console.log("🧩 내 역할:", myRole.role_name);
          setMyRole(myRole.role_name); // 필요시 상태에 저장
        } else {
          console.warn("😵 내 역할이 배정 목록에 없음");
        }
      } catch (err) {
        console.error("❌ 역할 배정 실패:", err);
      
        if (err.response) {
          const { status, data } = err.response;
          console.error(` 역할 배정 오류 (${status}):`, data);
          setError(` 역할 배정 오류 (${status}): ${data?.detail || "서버 응답 없음"}`);
        } else if (err.request) {
          console.error("❗ 역할 배정 요청 실패: 서버 응답 없음", err.request);
          setError("❗ 역할 배정 요청 실패: 서버로부터 응답이 없습니다.");
        } else {
          console.error("❗ 역할 배정 중 예외 발생:", err.message);
          setError("❗ 역할 배정 중 예기치 못한 오류가 발생했습니다.");
        }
      };
    };
    fetchRole();
  }, []);
  


  // WebSocket 연결
  useEffect(() => {
    console.log("🧪 myPlayerId useEffect 실행됨:", myPlayerId);

    if (!myPlayerId) return;
    
    const token = localStorage.getItem("access_token");
    const sessionId = "123456";

    if (!token) return;

    const socket = new WebSocket(`wss://dilemmai.org/ws/voice/${sessionId}?token=${token}`);

    socket.onopen = () => console.log("WebSocket 연결됨");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.start_time) {
        console.log("게임 시작 시간:", data.start_time);
      }
    };

    socket.onerror = (e) => {
      console.error("WebSocket 에러:", e);
    };

    socket.onclose = () => {
      console.warn("WebSocket 닫힘");
    };

    return () => socket.close();
  }, [myPlayerId]);

  const getOrderedPlayers = () => {
    if (!myPlayerId) return [1, 2, 3];
    const others = [1, 2, 3].filter(id => String(id) !== myPlayerId);
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
              isMe={String(id) === myPlayerId}
              onContinueClick={() => setShowMicPopup(true)}
              statusIndex={String(id) === myPlayerId ? myStatusIndex : 0}
              onStatusChange={String(id) === myPlayerId ? setMyStatusIndex : undefined}
              roleName={String(id) === myPlayerId ? myRole : undefined}
            />
          </div>
        ))}
      </div>

      {showMicPopup && <MicTestPopup userImage={player1} onConfirm={handleMicConfirm} />}
    </Background>
  );
}
