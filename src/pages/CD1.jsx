import {React }from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import ContentTextBox from '../components/ContentTextBox';
import GameFrame from '../components/GameFrame';
import player1DescImg from '../assets/images/Player1_description.png'; // 🔹 이미지 추가

export default function CD1() {
  const navigate = useNavigate();
  const subtopic = '가정 1';

  const paragraphs = [
    {
      main:
        '  당신은 어머니를 10년 이상 돌본 요양보호사 K입니다.\n' +
        '  최근 ...',
    },
  ];

  return (
    <Background bgIndex={3}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0 }}>
        {/* 유저 프로필 */}
        <div style={{ position: 'absolute', top: 60, left: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <UserProfile player="1P" characterDesc='요양보호사'isLeader={true} isMe />
            <UserProfile player="2P" characterDesc='노모 L'  />
            <UserProfile player="3P" characterDesc='자녀J' />
          </div>
        </div>

        {/* GameFrame */}
        <div style={{ position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)' }}>
          <GameFrame topic={`Round 01 : ${subtopic}`} hideArrows={true} />
        </div>

        {/* 중앙 콘텐츠 */}
        <div style={{ marginTop: 250, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/*  가운데 설명 이미지 */}
          <div style={{ marginBottom: 24 }}>
            <img
              src={player1DescImg}
              alt="Player 1 설명 이미지"
              style={{
                width: 264,
                height:336,
                objectFit: 'contain',
               
              }}
            />
          </div>

          {/* 텍스트 + 다음 버튼 */}
          <div style={{ marginTop: 24, width: 936 }}>
            <ContentTextBox
              paragraphs={paragraphs}
              onContinue={() => navigate('/game02')}
            />
          </div>
        </div>
      </div>
    </Background>
  );
}
