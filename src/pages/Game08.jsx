// import React, { useState,useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// import Layout from '../components/Layout';      
// import ContentBox3 from '../components/ContentBox3';
// import Continue from '../components/Continue';
// import GameFrame from '../components/GameFrame';

// import closeIcon from '../assets/close.svg';

// import img1 from '../assets/images/Android_dilemma_2_1.jpg';
// import img2 from '../assets/images/Android_dilemma_2_2.jpg';
// import img3 from '../assets/images/Android_dilemma_2_3.jpg';
// import img4 from '../assets/images/Android_dilemma_2_4.jpg';
// const comicImages = [img1, img2, img3, img4];

// import profile1Img from '../assets/images/CharacterPopUp1.png';
// import profile2Img from '../assets/images/CharacterPopUp2.png';
// import profile3Img from '../assets/images/CharacterPopUp3.png';
// const profileImages = { '1P': profile1Img, '2P': profile2Img, '3P': profile3Img };
// import { useWebSocket } from '../WebSocketProvider';
// import { useWebRTC } from '../WebRTCProvider';
// import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';



// const paragraphs = [
//   { main:
//     '    여러분의 결정으로 가정용 로봇은 보다 정확한 서비스를 제공하였고, 여러분의 친구처럼 제 역할을 다하고 있습니다. '
//   },
//   { main:
//     '     국가 내에서는 아이들을 위해 다양한 서비스를 제공하며, 가정용 로봇의 알고리즘은 투명하게 공개되었습니다. '
//   },
//   { main:
//     '    그리고 세계는 지금, 기술적 발전을 조금 늦추었지만 환경과 미래를 위해 나아가고 있죠. '
//   },
//   { main:
//     '    여러분이 선택한 가치가 모여 하나의 미래를 만들었습니다. 그 미래에 여러분은 함께할 준비가 되었나요? '
//   }
// ];

// export default function Game08() {
// const navigate = useNavigate();
 
//    const { isConnected, sessionId, sendMessage } = useWebSocket();
//    const { voiceSessionStatus, isInitialized: webrtcInitialized } = useWebRTC();
//    const { isHost } = useHostActions();
//     const [connectionStatus, setConnectionStatus] = useState({
//      websocket: false,
//      webrtc: false,
//      ready: false
//    });
//  useWebSocketNavigation(navigate, {
//     infoPath: `/game09`,
//     nextPagePath: `/game09`
//   });
//   useEffect(() => {
//      const newStatus = {
//        websocket: isConnected,
//        webrtc: webrtcInitialized,
//        ready: isConnected && webrtcInitialized
//      };
//      setConnectionStatus(newStatus);
   
//      console.log(' [Game09] 연결 상태 업데이트:', newStatus);
//    }, [isConnected, webrtcInitialized]);  
   
  
//    const subtopic = '결과: 우리들의 선택';
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [openProfile, setOpenProfile] = useState(null);

//  // Continue
// //  const handleContinue = () => {
// //   //  연결 상태 확인
// //   if (!connectionStatus.ready) {
// //     console.warn(' [game08] 연결이 완전하지 않음:', connectionStatus);
// //     alert('연결 상태를 확인하고 다시 시도해주세요.');
// //     return;
// //   }
// //   //  방장이 아닌 경우 차단
// //   if (!isHost) {
// //     console.log('[game08] 방장이 아니므로 진행 불가');
// //     alert('방장만 페이지를 넘길 수 있습니다.');
// //     return;
// //   }
// //   sendNextPage();
// // };
// const handleContinue = () =>{
//   navigate('/game09');
// }



//   return (
//     <>
//       {openProfile && (
//         <div
//           style={{
//             position: 'fixed', inset: 0,
//             background: 'rgba(0,0,0,0.6)',
//             display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000,
//           }}
//           onClick={() => setOpenProfile(null)}
//         >
//           <div
//             style={{ position: 'relative', background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 12px 30px rgba(0,0,0,0.25)' }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <img
//               src={profileImages[openProfile]}
//               alt={`Profile ${openProfile}`}
//               style={{ width: 360, height: 'auto', display: 'block' }}
//             />
//             <img
//               src={closeIcon}
//               alt="close"
//               style={{ position: 'absolute', top: 24, right: 24, width: 40, height: 40, cursor: 'pointer' }}
//               onClick={() => setOpenProfile(null)}
//             />
//           </div>
//         </div>
//       )}

//       <Layout
//         subtopic={subtopic}
//         onProfileClick={(playerId) => setOpenProfile(playerId)}
//       >
        
//         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
//           <img
//             src={comicImages[currentIndex]}
//             alt={`comic ${currentIndex + 1}`}
//             style={{ width: 760, height: 'auto', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
//           />

//           <div style={{ width: '100%', maxWidth: 900, }}>
//             <ContentBox3
//               paragraphs={paragraphs}
//               currentIndex={currentIndex}
//               setCurrentIndex={setCurrentIndex}
//               onContinue={handleContinue}
//               continueLabel="다른 미래 보러가기"
//             />
//           </div>
//         </div>
//       </Layout>
//     </>
//   );
// }

// 나중에 webRTC 부분만 추가하기 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';      
import ContentBox2 from '../components/ContentBox2';
import Continue3 from '../components/Continue3';
import voiceManager from '../utils/voiceManager';

import closeIcon from '../assets/close.svg';

import img1 from '../assets/images/Android_dilemma_2_1.jpg';
import img2 from '../assets/images/Android_dilemma_2_2.jpg';
import img3 from '../assets/images/Android_dilemma_2_3.jpg';
import img4 from '../assets/images/Android_dilemma_2_4.jpg';
const comicImages = [img1, img2, img3, img4];

import profile1Img from '../assets/images/CharacterPopUp1.png';
import profile2Img from '../assets/images/CharacterPopUp2.png';
import profile3Img from '../assets/images/CharacterPopUp3.png';
const profileImages = { '1P': profile1Img, '2P': profile2Img, '3P': profile3Img };
import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider';
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';

export default function Game08() {
  const navigate = useNavigate();
  const { isConnected, disconnect } = useWebSocket();
  const { isInitialized: webrtcInitialized } = useWebRTC();
  const { isHost } = useHostActions();

  const [connectionStatus, setConnectionStatus] = useState({ websocket: false, webrtc: false, ready: false });
  const [paragraphs, setParagraphs] = useState([]);
  const [openProfile, setOpenProfile] = useState(null);
  const subtopic = '결과: 우리들의 선택';

  // Navigation hooks
  useWebSocketNavigation(navigate, {
    infoPath: `/game09`,
    nextPagePath: `/game09`
  });

  // Clear all game-related localStorage
  function clearGameSession() {
    [
      'myrole_id','host_id','user_id','role1_user_id','role2_user_id','role3_user_id',
      'room_code','category','subtopic','mode','access_token','refresh_token',
      'mataName','nickname','title','session_id','selectedCharacterIndex',
      'currentRound','completedTopics','subtopicResults'
    ].forEach(key => localStorage.removeItem(key));
  }

  // Update connection status
  useEffect(() => {
    setConnectionStatus({
      websocket: isConnected,
      webrtc: webrtcInitialized,
      ready: isConnected && webrtcInitialized
    });
  }, [isConnected, webrtcInitialized]);

  // Build dynamic paragraphs based on localStorage
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const results = JSON.parse(localStorage.getItem('subtopicResults') ?? '{}');

    // 1st
    const ai = results['AI의 개인 정보 수집'];
    const and = results['안드로이드의 감정 표현'];
    let p1;
    if (completed.includes('AI의 개인 정보 수집') && completed.includes('안드로이드의 감정 표현')) {
      p1 = `여러분의 결정으로 가정용 로봇은 보다 ${ai==='agree'?'정확한':'안전한'} 서비스를 제공하였고, 여러분의 ${and==='agree'?'친구처럼':'보조 도구로서'} 제 역할을 다하고 있습니다.`;
    } else if (completed.includes('AI의 개인 정보 수집')) {
      p1 = `여러분의 결정으로 가정용 로봇은 보다 ${ai==='agree'?'정확한':'안전한'} 서비스를 제공하게 되었습니다.`;
    } else {
      p1 = '여러분의 결정으로 가정용 로봇은 보다 정확한 서비스를 제공하였습니다.';
    }
    // 2nd
    const kids = results['아이들을 위한 서비스'];
    const expl = results['설명 가능한 AI'];
    let p2;
    if (completed.includes('아이들을 위한 서비스') && completed.includes('설명 가능한 AI')) {
      p2 = `국가 내에서는 아이들을 위해 ${kids==='agree'?'다양한':'제한된'} 서비스를 제공하며, 가정용 로봇의 알고리즘은 ${expl==='agree'?'투명하게 공개되었습니다':'기업의 보호 하에 빠르게 발전하였습니다'}.`;
    } else if (completed.includes('아이들을 위한 서비스')) {
      p2 = `국가 내에서는 아이들을 위해 ${kids==='agree'?'다양한':'제한된'} 서비스를 제공하게 되었습니다.`;
    } else {
      p2 = '국가 내에서는 아이들을 위해 다양한 서비스를 제공하며, 가정용 로봇의 알고리즘은 투명하게 공개되었습니다.';
    }
    // 3rd
    const earth = results['지구, 인간, AI'];
    let p3 = completed.includes('지구, 인간, AI')
      ? `그리고 세계는 지금, ${earth==='agree'?'기술적 발전을 조금 늦추었지만 환경과 미래를 위해 나아가고 있죠':'기술적 편리함을 누리며 점점 빠른 발전을 이루고 있죠'}.`
      : '그리고 세계는 지금, 기술적 발전을 조금 늦추었지만 환경과 미래를 위해 나아가고 있죠.';
    // 4th
    const p4 = '여러분이 선택한 가치가 모여 하나의 미래를 만들었습니다. 그 미래에 여러분은 함께할 준비가 되었나요?';

    setParagraphs([p1, p2, p3, p4]);
  }, []);

  // Combine for display
  const combinedText = paragraphs.join('\n\n');

  // Exit handler
  const handleExit = () => {
    clearGameSession();
    disconnect?.();
    voiceManager.leaveSession().then(ok => ok ? console.log('음성 세션 종료') : console.warn('음성 세션 종료 실패'));
    navigate('/');
  };

  return (
    <>
      {openProfile && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:2000}} onClick={()=>setOpenProfile(null)}>
          <div style={{position:'relative',background:'#fff',padding:32,borderRadius:12,boxShadow:'0 12px 30px rgba(0,0,0,0.25)'}} onClick={e=>e.stopPropagation()}>
            <img src={profileImages[openProfile]} alt={`Profile ${openProfile}`} style={{width:360,height:'auto'}}/>
            <img src={closeIcon} alt="close" style={{position:'absolute',top:24,right:24,width:40,height:40,cursor:'pointer'}} onClick={()=>setOpenProfile(null)}/>
          </div>
        </div>
      )}

      <Layout subtopic={subtopic} onProfileClick={pid=>setOpenProfile(pid)}>
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:'80vw',maxWidth:936,display:'flex',flexDirection:'column',alignItems:'center',padding:'0 16px'}}>
          <ContentBox2 text={combinedText} width={936} height={407} />
          <div style={{marginTop:20}}>
            <Continue3 label="나가기" width={264} height={72} onClick={handleExit} />
          </div>
        </div>
      </Layout>
    </>
  );
}
