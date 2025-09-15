import React from 'react';
import closeIcon from '../assets/close.svg';
import SecondaryButton from './SecondaryButton';
import { useNavigate } from 'react-router-dom';
import { Colors, FontStyles } from './styleConstants';
import axiosInstance from '../api/axiosInstance'; // ✅ 추가
import { clearAllLocalStorageKeys } from '../utils/storage';
export default function OutPopup({ onClose }) {
  const navigate = useNavigate();
  const handleLeaveRoom = async () => {
    const room_code = String(localStorage.getItem("room_code"));
    console.log("room_code:", room_code);

    try {
      const res = await axiosInstance.post('/rooms/out', {
        room_code
      });

      const {
        player_count,
        room_deleted,
        new_host,
        game_started,
        requires_lobby_redirect,
        message
      } = res.data;
  
      console.log("🚪 방 나가기 응답:", res.data);
  
      alert(message); // 사용자에게 메시지 표시
      clearAllLocalStorageKeys();  // 로컬 스토리지 정리 함수 호출

      // ✅ 로컬 스토리지 정리
      localStorage.removeItem("room_code");
      localStorage.removeItem("category");
      localStorage.removeItem("subtopic");
  
      // ✅ 경로 이동 처리
      if (requires_lobby_redirect || room_deleted) {
        navigate("/selectroom");
      } else if (game_started) {
        navigate("/");  // 게임 중 나간 경우 처리용 페이지가 있다면
      } else {
        navigate("/selectroom");  // 대기실에서 나간 경우
      }
    } catch (err) {
      console.error("❌ 방 나가기 실패:", err);
      alert("방 나가기 실패: " +  err.response.data);
    }
  };
  
  return (
    <div
      style={{
        width: 552,
        height: 360,
        backgroundColor: Colors.grey01,
        borderRadius: 12,
        padding: 32,
        position: 'relative',
        ...FontStyles.body,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
      }}
    >
      <img
        src={closeIcon}
        alt="닫기"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 40,
          height: 40,
          cursor: 'pointer',
        }}
      />

      <p style={{ ...FontStyles.headlineSmall, marginBottom: 40 }}>
        이 방을 나갈까요?
      </p>

      <SecondaryButton 
        style={{ width: 168, height: 72}}
        onClick={handleLeaveRoom}
      > 
        방나가기
      </SecondaryButton> 
    </div>
  );
}
