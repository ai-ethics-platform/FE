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
import { FontStyles, Colors } from '../components/styleConstants';
import CreateDilemma from '../components/CreateDilemma';
import DilemmaOutPopup from '../components/DilemmaOutPopup';
import HeaderBar from '../components/Expanded/HeaderBar';
import { translations } from '../utils/language/index'; 

//  신규 팝업 및 아이콘 임포트
import IntroductionPopup from '../components/IntroductionPopup';
import questionIcon from '../assets/Questionmark.svg';

export default function SelectRoom() { 
  const navigate = useNavigate();
  
  // --- 시스템 설정된 언어(app_lang) 연동 로직 ---
  const lang = localStorage.getItem('app_lang') || 'ko';
  const t = translations?.[lang]?.SelectRoom || {};

  const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false); 
  const [isJoinRoomOpen, setIsJoinRoomOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isCreateDilemaOpen, setIsCreateDilemaOpen] = useState(false);
  
  //  게임 소개 팝업 상태 관리
  const [isIntroPopupOpen, setIsIntroPopupOpen] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    //  최초 접속 시 자동 팝업 로직 (세션 스토리지 활용)
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
    if (!hasSeenIntro) {
      setIsIntroPopupOpen(true);
      sessionStorage.setItem('hasSeenIntro', 'true');
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleBackClick = () => {
    setIsLogoutPopupOpen(true); 
  };

  const handleLogout = () => {
    //  로그아웃 시 소개 팝업 기록 초기화
    sessionStorage.removeItem('hasSeenIntro');
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

      {/*  우측 상단 게임 소개 버튼 (물음표 아이콘) */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 5, 
          right: 5, 
          cursor: 'pointer',
          zIndex: 10 
        }}
        onClick={() => setIsIntroPopupOpen(true)}
      >
        <img 
          src={questionIcon} 
          alt="Help" 
          style={{ width: 38, height: 38 }} 
        />
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
      
      {/*  게임 소개 팝업 */}
      {isIntroPopupOpen && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 10001,
          }}
          onClick={() => setIsIntroPopupOpen(false)} // 배경 클릭 시 닫기
        >
          <IntroductionPopup
            isOpen={isIntroPopupOpen}
            onClose={() => setIsIntroPopupOpen(false)}
          />
        </div>
      )}

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