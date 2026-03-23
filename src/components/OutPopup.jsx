import React from 'react';
import closeIcon from '../assets/close.svg';
import SecondaryButton from './SecondaryButton';
import { useNavigate } from 'react-router-dom';
import { Colors, FontStyles } from './styleConstants';
import axiosInstance from '../api/axiosInstance'; // ✅ 추가
import { clearAllLocalStorageKeys } from '../utils/storage';
// 다국어 관리를 위한 언어팩 임포트
import { translations } from '../utils/language/index';

export default function OutPopup({ onClose }) {
  const navigate = useNavigate();

  // --- 시스템 설정된 언어(app_lang)를 로드하는 로직 ---
  // 이후 개발 담당자가 이해하기 쉽게 app_lang 기반 동적 로드를 주석으로 명시합니다.
  const savedLang = localStorage.getItem('app_lang');
  const currentLang = (savedLang === 'en') ? 'en' : 'ko';
  
  // index.js의 translations 객체 구조에 맞춰 직접 참조합니다.
  const t = translations[currentLang].OutPopup;
  // ----------------------------------------------

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
  
      // 상황별 메시지 가공 로직
      let finalMsg = "";
      if (room_deleted) {
        finalMsg = t.roomDeleted;
      } else if (new_host) {
        const hostName = new_host.username || new_host.nickname || "someone";
        finalMsg = t.newHost.replace("{name}", hostName);
      } else {
        finalMsg = t.leftWithPlayers.replace("{count}", player_count || 0);
      }

      // 서버의 한국어 message 대신 가공된 다국어 메시지 우선 표시
      alert(finalMsg || message); 

      //clearAllLocalStorageKeys();  // 로컬 스토리지 정리 함수 호출

      //  로컬 스토리지 정리
      localStorage.removeItem("room_code");
      localStorage.removeItem("category");
      localStorage.removeItem("subtopic");
      localStorage.removeItem('myrole_id');
      localStorage.removeItem('host_id');
      localStorage.removeItem('user_id');
      localStorage.removeItem('role1_user_id');
      localStorage.removeItem('role2_user_id');
      localStorage.removeItem('role3_user_id');
      localStorage.removeItem('creatorTitle');
      localStorage.removeItem('nickname');

     //  code 값 확인
     const code = localStorage.getItem("code");

     //  경로 이동 처리
     if (code) {
       navigate("/customroom");   // code가 있으면 customroom
     } else if (requires_lobby_redirect || room_deleted) {
       navigate("/selectroom");
     } else if (game_started) {
       navigate("/selectroom");  // 게임 중 나간 경우 처리용 페이지가 있다면
     } else {
       navigate("/selectroom");  // 대기실에서 나간 경우
     }
    } catch (err) {
      console.error("❌ 방 나가기 실패:", err);
      // 에러 메시지 다국어 처리 적용
      alert(`${t.leaveFail} ${err.response?.data?.message || err.message}`);
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
        alt={t.closeAlt}
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
        {t.title}
      </p>

      <SecondaryButton 
        style={{ width: 168, height: 72}}
        onClick={handleLeaveRoom}
      > 
        {t.leaveBtn}
      </SecondaryButton> 
    </div>
  );
}