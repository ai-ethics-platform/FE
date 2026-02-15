import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import BackButton from '../components/BackButton';
import RoomCard from '../components/RoomCard';
import LogoutPopup from '../components/LogoutPopup'; 
import JoinRoom from '../components/JoinRoom';
import CreateRoom from '../components/CreateRoom2';
import createIcon from '../assets/roomcreate.svg';
import joinIcon from '../assets/joinviacode.svg';
import dilemmaIcon from "../assets/dilemmaIcon.svg";
import { FontStyles,Colors } from '../components/styleConstants';
import CreateDilemma from '../components/CreateDilemma';
import DilemmaOutPopup from '../components/DilemmaOutPopup';
import HeaderBar from '../components/Expanded/HeaderBar';
import { translations } from '../utils/language/index'; 

export default function SelectRoom() { 
  const navigate = useNavigate();
  
  // --- 시스템 설정된 언어(app_lang) 연동 로직 ---
  const lang = localStorage.getItem('app_lang') || 'ko';
  const t = translations?.[lang]?.SelectRoom || {};

  const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false); 
  const [isJoinRoomOpen, setIsJoinRoomOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isCreateDilemaOpen,setIsCreateDilemaOpen] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleBackClick = () => {
    setIsLogoutPopupOpen(true); 
  };

  const handleLogout = () => {
    navigate('/'); 
  };

  // 언어팩 로드 실패 시 화면 깨짐 방지
  if (!t.createTitle) return null;

  return (
    <Background bgIndex={2}>
    
      <div style={{ position: 'absolute', top: -10, left: -10 }}>
        <div onClick={handleBackClick}>
          <BackButton />
        </div>
      </div>

      <div
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            // 카드 수에 따른 간격 조정 (영문은 2개, 국문은 3개 대응)
            gap: lang === 'en' ? 40 : 20,
            flexWrap: 'nowrap',
          }}
        >
          {/* [방 만들기] 카드 */}
          <RoomCard
            icon={createIcon}
            title={t.createTitle}
            description={
              <span style={{ whiteSpace: 'pre-wrap' }}>{t.createDesc}</span>
            }
            onClick={() => setIsCreateRoomOpen(true)}
          />

          {/* [방 참여하기] 카드 */}
          <RoomCard
            icon={joinIcon}
            title={t.joinTitle}
            description={
              <span style={{ whiteSpace: 'pre-wrap' }}>{t.joinDesc}</span>
            }
            onClick={() => setIsJoinRoomOpen(true)} 
          />

          {/* [딜레마 만들기] 카드 - 영문 버전이 아닐 때만 출력 */}
          {lang !== 'en' && (
            <RoomCard
              icon={dilemmaIcon}
              title={t.dilemmaTitle}
              description={
                <span style={{ whiteSpace: 'pre-wrap' }}>{t.dilemmaDesc}</span>
              }
              onClick={()=> setIsCreateDilemaOpen(true)}
            />
          )}
        </div>
      </div>

      {/* 팝업 레이어 (모달) */}
      {isLogoutPopupOpen && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 9999,
          }}
        >
          <LogoutPopup
            onClose={() => setIsLogoutPopupOpen(false)}
            onLogout={handleLogout}
          />
        </div>
      )}

      {isJoinRoomOpen && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 100,
          }}
        >
          <JoinRoom onClose={() => setIsJoinRoomOpen(false)} />
        </div>
      )}

      {isCreateRoomOpen && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(103, 103, 103, 0.4)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 100,
          }}
        >
          <CreateRoom disabled={true} onClose={() => setIsCreateRoomOpen(false)} />
        </div>
      )}

      {isCreateDilemaOpen && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(103, 103, 103, 0.4)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 100,
          }}
        >
          <CreateDilemma disabled={true} onClose={() => setIsCreateDilemaOpen(false)} />
        </div>
      )}
    </Background>
  );
}