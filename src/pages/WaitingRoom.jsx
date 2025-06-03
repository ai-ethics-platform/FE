import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
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

  //  이전에 선택한 topic을 받아서 해당 index로 초기화
  const initialTopic = location.state?.topic || '안드로이드';
  const initialIndex = allTopics.indexOf(initialTopic);
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

  const [showMicPopup, setShowMicPopup] = useState(false);
  const [myStatusIndex, setMyStatusIndex] = useState(0);
  const [showOutPopup, setShowOutPopup] = useState(false);

  const handleBackClick = () => setShowOutPopup(true);
  const handleClosePopup = () => setShowOutPopup(false);
  const handleMicConfirm = () => {
    setMyStatusIndex(1);
    setShowMicPopup(false);
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

      {/*  topic 배열에서 현재 인덱스에 해당하는 주제만 보여줌 */}
      
       <div
             style={{
                position: 'absolute',
                top: '6%',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
      
        <GameFrame
          topic={allTopics[currentIndex]}
          onLeftClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
          onRightClick={() => setCurrentIndex((prev) => Math.min(prev + 1, allTopics.length - 1))}
          disableLeft={currentIndex === 0}
          disableRight={currentIndex === allTopics.length - 1}
          hideArrows={false}
        />
      </div>

      {/* 상태 카드 */}
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 0,
        paddingTop: 0,
      }}>
        <div style={{ transform: 'scale(0.9)' }}>
          <StatusCard player="2P" isOwner={false} isMe={false} />
        </div>
        <div style={{ transform: 'scale(1.0)' }}>
          <StatusCard
            player="1P"
            isOwner={true}
            isMe={true}
            onContinueClick={() => setShowMicPopup(true)}
            statusIndex={myStatusIndex}
            onStatusChange={setMyStatusIndex}
          />
        </div>
        <div style={{ transform: 'scale(0.9)' }}>
          <StatusCard player="3P" isOwner={false} isMe={false} />
        </div>
      </div>

      {showMicPopup && <MicTestPopup userImage={player1} onConfirm={handleMicConfirm} />}
    </Background>
  );
}
