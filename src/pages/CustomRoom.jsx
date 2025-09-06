import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import BackButton from '../components/BackButton';
import RoomCard from '../components/RoomCard';
import LogoutPopup from '../components/LogoutPopup'; 
import JoinRoom from '../components/JoinRoom';
import CreateRoom from '../components/Expanded/CreateDilemmaRoom';
import createIcon from '../assets/roomcreate.svg';
import joinIcon from '../assets/joinviacode.svg';
import dilemmaIcon from "../assets/dilemmaIcon.svg";
import { FontStyles,Colors } from '../components/styleConstants';

import GameFrame from "../components/GameFrame";
export default function SelectRoom() { 
  const navigate = useNavigate();
  const [title, setTitle] = useState(localStorage.getItem('creatorTitle') || '');

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
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 0,
        }}
      >
        {/* 가운데 정렬된 세로 스택 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,             // GameFrame과 카드 사이 간격
          }}
        >
          <GameFrame topic={title} hideArrows />
            <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 20,
              flexWrap: 'nowrap',
              justifyContent: 'center',
              alignItems: 'stretch',
              width: '100%',
            }}
          >
            <RoomCard
              icon={createIcon}
              title="방 만들기"
              description={
                <>
                  새로운 방을 만들고<br />
                  시뮬레이션을 시작하세요.
                </>
              }
              onClick={() => setIsCreateRoomOpen(true)}
            />
            <RoomCard
              icon={joinIcon}
              title="방 참여하기"
              description={
                <>
                  코드를 통해 비공개 방에<br />
                  참여할 수 있습니다.
                </>
              }
              onClick={() => setIsJoinRoomOpen(true)}
            />
          </div>
        </div>
      </div>
  
      {/* 팝업들 */}
      {isLogoutPopupOpen && (
        <div style={overlayStyle}>
          <LogoutPopup
            onClose={() => setIsLogoutPopupOpen(false)}
            onLogout={handleLogout}
          />
        </div>
      )}
  
      {isJoinRoomOpen && (
        <div style={overlayStyle}>
          <JoinRoom onClose={() => setIsJoinRoomOpen(false)} />
        </div>
      )}
  
      {isCreateRoomOpen && (
        <div style={{ ...overlayStyle, backgroundColor: 'rgba(103,103,103,0.4)' }}>
          <CreateRoom disabled={true} onClose={() => setIsCreateRoomOpen(false)} />
        </div>
      )}
    </Background>
  );
}
const overlayStyle = {
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
  };
  