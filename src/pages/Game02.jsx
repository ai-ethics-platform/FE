import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import ContentTextBox from '../components/ContentTextBox';
import GameFrame from '../components/GameFrame';
import closeIcon from '../assets/close.svg';

// 4-컷 이미지
import img1 from '../assets/images/Android_dilemma1_1.jpg';
import img2 from '../assets/images/Android_dilemma1_2.jpg';
import img3 from '../assets/images/Android_dilemma1_3.jpg';
import img4 from '../assets/images/Android_dilemma1_4.jpg';
const images = [img1, img2, img3, img4];

// 팝업 프로필
import profile1Img from '../assets/images/CharacterPopUp1.png';
import profile2Img from '../assets/images/CharacterPopUp2.png';
import profile3Img from '../assets/images/CharacterPopUp3.png';
const profileImages = { '1P': profile1Img, '2P': profile2Img, '3P': profile3Img };

export default function Game02() {
  const navigate = useNavigate();
  const subtopic = '가정 1';

  const paragraphs = [
    { main: '[  🔔 Homemate 사용자 최적화 시스템 업그레이드 공지 ]' },
    {
      main:
        '  업데이트를 하면 고객님의 감정, 건강 상태, 생활 습관 등을 자동으로 수집하여\n' +
        '보다 정확한 맞춤형 서비스를 제공할 수 있습니다.',
    },
    { main: '  다만, 이를 위해 24시간 정보 수집 기능을 활성화해야 합니다.' },
    {
      main:
        '  수집되는 정보는 다음과 같습니다:\n' +
        '  - 스마트폰 내 건강 정보, 채팅 기록, 위치 이력 등 사적인 데이터 접근\n' +
        '  - *동의하지 않을 경우, 현재 수준의 서비스가 유지됩니다.',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [openProfile, setOpenProfile] = useState(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const updateZoom = () => {
      setZoom(Math.min(window.innerWidth / 1280, window.innerHeight / 720, 1));
    };
    updateZoom();
    window.addEventListener('resize', updateZoom);
    return () => window.removeEventListener('resize', updateZoom);
  }, []);

  const handleContinue = () => navigate('/game03');

  return (
    <Background bgIndex={3}>
      <style>{`
        html,body,#root{height:100%;margin:0;}
        /* viewport identical to Game01 */
        .g02-viewport{position:fixed;inset:0;display:flex;justify-content:flex-start;align-items:center;overflow:hidden;}
        .g02-root{width:1280px;height:720px;transform-origin:top left;}
        .g02-wrapper{display:grid;grid-template-columns:220px 1fr;width:100%;height:100%;}
        .g02-sidebar{padding:20px 0;display:flex;flex-direction:column;gap:24px;align-items:flex-start;}
        .g02-stage{display:flex;flex-direction:column;align-items:center;padding:40px 24px 32px;}
        .g02-gameframe{width:100%;max-width:500px;margin-bottom:32px;}
        /* comic fixed height so text box fits */
        .g02-comic{width:760px;height:auto;margin-bottom:0px;flex-shrink:0;}
        .g02-textbox{width:100%;max-width:900px;}

        /* Modal popup */
        .g02-modal{position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;justify-content:center;align-items:center;z-index:2000;}
        .g02-modal-body{position:relative;background:#fff;padding:32px;border-radius:12px;box-shadow:0 12px 30px rgba(0,0,0,0.25);}        
        .g02-modal-body img.profile{width:360px;height:auto;}
        .g02-close{position:absolute;top:24px;right:24px;width:40px;height:40px;cursor:pointer;}

        /* mobile same rules as Game01 */
        @media(max-width:1024px){
          .g02-viewport{position:static;display:block;overflow:auto;}
          .g02-root{width:100%;height:auto;transform:none!important;}
          .g02-wrapper{grid-template-columns:1fr;}
          .g02-sidebar{flex-direction:row;justify-content:center;padding:12px 0;}
          .g02-comic{width:clamp(240px,90vw,760px);}        }
      `}</style>

      
      {openProfile && (
        <div className="g02-modal" onClick={() => setOpenProfile(null)}>
          <div className="g02-modal-body" onClick={(e) => e.stopPropagation()}>
            <img className="profile" src={profileImages[openProfile]} alt={openProfile} />
            <img className="g02-close" src={closeIcon} alt="close" onClick={() => setOpenProfile(null)} />
          </div>
        </div>
      )}

      
      <div className="g02-viewport">
        <div
          className="g02-root"
          style={{ position:'absolute', top:'50%', left:0, transform:`translateY(-50%) scale(${zoom})` }}
        >
          <div className="g02-wrapper">
            
            <aside className="g02-sidebar">
              <UserProfile player="1P" characterDesc="요양보호사" isLeader style={{cursor:'pointer'}} onClick={() => setOpenProfile('1P')} />
              <UserProfile player="2P" characterDesc="노모 L" style={{cursor:'pointer'}} onClick={() => setOpenProfile('2P')} />
              <UserProfile player="3P" characterDesc="자녀J" isMe style={{cursor:'pointer'}} onClick={() => setOpenProfile('3P')} />
            </aside>

            
            <section className="g02-stage">
              <div className="g02-gameframe">
                <GameFrame topic={`Round 01 : ${subtopic}`} hideArrows />
              </div>

              <img className="g02-comic" src={images[currentIndex]} alt={`comic ${currentIndex+1}`} />

              <div className="g02-textbox">
                <ContentTextBox
                  paragraphs={paragraphs}
                  currentIndex={currentIndex}
                  setCurrentIndex={setCurrentIndex}
                  onContinue={handleContinue}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </Background>
  );
}