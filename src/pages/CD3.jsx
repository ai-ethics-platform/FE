import {React }from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import ContentTextBox from '../components/ContentTextBox';
import GameFrame from '../components/GameFrame';
import player1DescImg from '../assets/images/Player3_description.png'; 

export default function CD3() {
  const navigate = useNavigate();
  const subtopic = '가정 1';

  const paragraphs = [
    {
      main:
        '  당신은 자녀 J씨입니다. \n' +
        '  노쇠하신 어머니가 걱정되지만, 바쁜 직장생활로 어머니를 ...',
    },
  ];

  return (
    <Background bgIndex={3}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: 60, left: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <UserProfile player="1P" characterDesc='요양보호사'isLeader />
            <UserProfile player="2P" characterDesc='노모 L' />
            <UserProfile player="3P" characterDesc='자녀J' isMe={true}  />
          </div>
        </div>

        <div style={{ position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)' }}>
          <GameFrame topic={`Round 01 : ${subtopic}`} hideArrows={true} />
        </div>

        <div style={{ marginTop: 250, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
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
