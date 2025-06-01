import React from 'react';
import Background from '../components/Background';
import UserProfile from '../components/Userprofile';
import ContentBox2 from '../components/ContentBox2';
import Continue from '../components/Continue';
import { useNavigate } from 'react-router-dom';
import { FontStyles } from '../components/styleConstants';
import GameFrame from '../components/GameFrame';
export default function GameIntro() {
  const navigate = useNavigate();
  const subtopic = '가정 1';

  const fullText =
   '  우리 가족은 최종적으로  감정 업데이트에 동의하였고, \n' +
'   HomeMate와 더욱 친밀한 교류를 이어나가게 되었습니다. \n\n' +
'   비록 몇몇 문제들이 있었지만 HomeMate의 편의성 덕분에 이후 \n' + 
'   우리 가정 뿐 아니라 여러 가정에서 HomeMate를 사용하게 되었습니다.\n\n' + 
'   이후, 가정 뿐 아니라 국가적인 고민거리들이 나타나게 되는데...'
  return (
    <Background bgIndex={3}>
      <div
        style={{
        position: 'fixed',         
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',        
        zIndex: 0,  
        }}
>
    <div style={{ position: 'absolute', top: 60, left: 0 }}>
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        alignItems: 'flex-start',     
        width: 'fit-content',       
        margin: 0,                    
        padding: 0,
  }}>
    <UserProfile player="1P" characterDesc="요양보호사" isLeader />
    <UserProfile player="2P" characterDesc="노모 L" />
    <UserProfile player="3P" characterDesc="자녀J" isMe />
  </div>
     </div>

         {/* GameFrame */}
        <div style={{ position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)' }}>
        <GameFrame topic={`Round 01 : ${subtopic}`} hideArrows />
        </div>
        <div style={{
        ...FontStyles.title,
        position: 'absolute',
        top: 236,
        left: 390,
        width: 936,
        height: 467,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        }}>
        <ContentBox2 text={fullText} />
        <div style={{ marginTop: 20 }}>
            <Continue 
            width={264} 
            height={72} 
            step={1} 
            onClick={() => {
            console.log('클릭됨');
            navigate('/selectroom');
  }} 
    />
        </div>
        </div>
    </div>
    </Background>
  );
}
