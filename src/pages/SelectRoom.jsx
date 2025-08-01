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
import randomIcon from '../assets/joinrandom.svg';
import { FontStyles,Colors } from '../components/styleConstants';

export default function SelectRoom() { 
  const navigate = useNavigate();
  const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false); 
const [isJoinRoomOpen, setIsJoinRoomOpen] = useState(false);
const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
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
            gap: 20,
            flexWrap: 'nowrap',
          }}
        >
          <RoomCard
            icon={createIcon}
            title="방 만들기"
            description="새로운 방을 만들고 시뮬레이션을 시작하세요."
            onClick={() => setIsCreateRoomOpen(true)}
          />
          <RoomCard
            icon={joinIcon}
            title="방 참여하기"
            description="코드를 통해 비공개 방에 참여할 수 있습니다."
            onClick={() => setIsJoinRoomOpen(true)} 

          />
          <RoomCard
            icon={randomIcon}
            title="랜덤 방 참여하기"
            description="공개된 방 중 하나에 무작위로 입장합니다."
            disabled
          />
        </div>
      </div>

      {isLogoutPopupOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
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
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100,
    }}
  >
    <JoinRoom onClose={() => setIsJoinRoomOpen(false)} />
  </div>)}

  {isCreateRoomOpen && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(103, 103, 103, 0.4)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100,
    }}
  >
    <CreateRoom disabled={true} onClose={() => setIsCreateRoomOpen(false)} />
  </div>
)}
    </Background>
  );
}
