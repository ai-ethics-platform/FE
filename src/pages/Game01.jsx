// //custom모드 일 경우 endpoint, 부분 수정 필요 
// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Layout from '../components/Layout';
// import ContentTextBox2 from '../components/ContentTextBox2';
// import character1 from '../assets/images/Char1.jpg';
// import character2 from '../assets/images/Char2.jpg';
// import character3 from '../assets/images/Char3.jpg';
// import axiosInstance from '../api/axiosInstance';
// import { useWebSocket } from '../WebSocketProvider';
// import { useWebRTC } from '../WebRTCProvider';
// import { 
//   useWebSocketNavigation, 
//   useHostActions 
// } from '../hooks/useWebSocketMessage';
// import BackButton from '../components/BackButton';
// import { clearAllLocalStorageKeys } from '../utils/storage'; 

// export default function Game01() {
//   const navigate = useNavigate();

//   // WebSocket과 WebRTC 상태 가져오기
//   const { voiceSessionStatus, isInitialized: webrtcInitialized } = useWebRTC();
//   const myRoleId = localStorage.getItem('myrole_id');
//   const { isConnected, sessionId, sendMessage } = useWebSocket();


//   const { isHost, sendNextPage } = useHostActions();
  
//   useWebSocketNavigation(navigate, {
//     infoPath: `/character_description${myRoleId}`,
//     nextPagePath: `/character_description${myRoleId}`
//   });

//   const images = [character1, character2, character3];
//   const subtopic = localStorage.getItem('subtopic');
//   const roomCode = localStorage.getItem('room_code');
//   const nickname = localStorage.getItem('nickname') || 'Guest';

//   const isCustom = (localStorage.getItem('custom') === 'true') || false;
//   const title = localStorage.getItem('title') || '';          // ← 누락돼 있던 title 보강

//   const category = localStorage.getItem('category') || '안드로이드';
//   const isAWS = category === '자율 무기 시스템';

//   const [mateName, setMateName] = useState('');
//   const [round, setRound] = useState(1);
//   const [isLoading, setIsLoading] = useState(true);
//   const hasFetchedAiName = useRef(false);
//   const hasJoined = useRef(false);

//   const [customLoading, setCustomLoading] = useState(false);
//   const [customMain, setCustomMain] = useState(null);   // 받아온 main 텍스트 저장

//   // 1. 라운드 계산
//   useEffect(() => {
//     const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
//     const nextRound = completed.length + 1;
//     setRound(nextRound);
//     localStorage.setItem('currentRound', String(nextRound));
//   }, []);

//   // 2. AI 이름 셋업
//   useEffect(() => {
//     if (hasFetchedAiName.current) return;
//     const stored = localStorage.getItem('mateName');
//     if (stored) {
//       setMateName(stored);
//       hasFetchedAiName.current = true;
//       setIsLoading(false);
//     } else {
//       (async () => {
//         try {
//           const res = await axiosInstance.get('/rooms/ai-name', { params: { room_code: roomCode } });
//           setMateName(res.data.ai_name);
//           localStorage.setItem('mateName', res.data.ai_name);
//         } catch (e) {
//           console.error('AI 이름 불러오기 실패', e);
//         } finally {
//           hasFetchedAiName.current = true;
//           setIsLoading(false);
//         }
//       })();
//     }
//   }, [roomCode]);


//  // 연결 상태 관리 (GameIntro에서 이미 초기화된 상태를 유지)
//  const [connectionStatus, setConnectionStatus] = useState({
//   websocket: true,
//   webrtc: true,
//   ready: true
// });
//     // useEffect(() => {
//     //   if (!isConnected) {
//     //     console.warn('❌ WebSocket 연결 끊김 감지됨');
//     //     alert('⚠️ 연결이 끊겨 게임이 초기화됩니다.');
//     //     clearAllLocalStorageKeys();     
//     //     navigate('/');
//     //   }
//     // }, [isConnected]);

//    // 🔧 연결 상태 모니터링
//     useEffect(() => {
//       const newStatus = {
//         websocket: isConnected,
//         webrtc: webrtcInitialized,
//         ready: isConnected && webrtcInitialized
//       };
  
//       setConnectionStatus(newStatus);
  
//       console.log('[game01] 연결 상태 업데이트:', newStatus);
//     }, [isConnected, webrtcInitialized]);

//   const handleBackClick = () => {
//     navigate('/gamemap'); 
//   };

//   const handleContinue = () => {
//     if (myRoleId) {
//       //navigate('/game08');
//       navigate(`/character_description${myRoleId}`);
//     } else {
//       console.warn('myRoleId가 존재하지 않습니다.');
//     }
//   };
//   const getEulReul = (word) => {
//     if (!word) return '';
//     const lastChar = word[word.length - 1];
//     const code = lastChar.charCodeAt(0);
//     if (code < 0xAC00 || code > 0xD7A3) return '를'; // 한글이 아닐 경우 기본 '를'
//     const jong = (code - 0xAC00) % 28;
//     return jong === 0 ? '를' : '을';
//   };
  

// // 기본 main 텍스트 생성 함수
// const getDefaultMain = () => {
//   if (isAWS) {
//     if (title === '주거, 군사 지역') {
//       return (
//         '지금부터 여러분은 자율무기시스템의 사용과 관련되어 있는 개인 이해관계자입니다.\n' +
//         '자율무기시스템이 각자에게 주는 영향에 대해 함께 생각해 보고 논의할 것입니다.\n\n' +
//         '먼저, 역할을 확인하세요.'
//       );
//     }
//     if (title === '국가 인공지능 위원회') {
//       return (
//         '자율 무기 시스템을 사용한 군사 작전 및 분쟁이 늘어나고 있습니다. ' +
//         '이에 전에 없던 새로운 문제들이 나타나, 국가 인공지능 위원회에서는 긴급 회의를 소집했습니다.\n ' +
//         '국가 인공지능 위원회는 인공지능 산업 육성 및 규제 방안에 대해 논의하는 위원회입니다. ' +
//         '여러분은 자율 무기 시스템과 관련된 국가적 차원의 의제에 대해 함께 논의하여 결정할 대표들입니다.\n\n' +
//         '먼저, 역할을 확인하세요.'
//       );
//     }
//     if (title === '국제 인류 발전 위원회') {
//       return (
//         '전 세계적으로, AWS의 활용과 관련하여 찬성과 반대 입장이 점차 양분되어 가고 있습니다.\n\n' +
//         '이에 국제 평화를 위한 논의와 규제가 이루어지는 인류 발전 위원회에서는 AWS 사용과 관련하여 발생한 문제에 대해 회의를 열었습니다.\n\n' +
//         '여러분은 인류 발전 위원회 회의장에 참석한 대표들입니다. 먼저, 역할을 확인하세요.'
//       );
//     }
//     return '자율 무기 시스템 시나리오입니다. 먼저, 역할을 확인하세요.';
//   }

//   // 안드로이드 기본
//   switch (title) {
//     case '가정':
//       return `지금부터 여러분은 ${mateName}${getEulReul(mateName)} 사용하게 된 가정집의 구성원들입니다.\n 여러분은 가정에서 ${mateName}${getEulReul(mateName)} 사용하며 일어나는 일에 대해 함께 논의하여 결정할 것입니다.\n 먼저, 역할을 확인하세요.`;
//     case '국가 인공지능 위원회':
//       return `비록 몇몇 문제들이 있었지만 ${mateName}의 편의성 덕분에 이후 우리 가정 뿐 아니라 여러 가정에서 HomeMate를 사용하게 되었습니다. \n 이후, 가정 뿐 아니라 국가적인 고민거리들이 나타나게 되어 국가 인공지능 위원회에서는 긴급 회의를 소집했습니다. 국가 인공지능 위원회는 인공지능 산업 육성 및 규제 방안에 대해 논의하는 위원회입니다. 여러분은 HomeMate와 관련된 국가적 규제에 대해 함께 논의하여 결정할 대표들입니다. 먼저, 역할을 확인하세요.`;
//     case '국제 인류 발전 위원회':
//       return `국내에서 몇몇 규제 관련 논의가 있었지만, A사의 로봇 HomeMate는 결국 전 세계로 진출했습니다. 이제 HomeMate뿐 아니라 세계의 여러 로봇 회사에서 비슷한 가정용 로봇을 생산하고 나섰습니다. \n 이에 국제 평화를 위한 논의와 규제가 이루어지는 인류 발전 위원회에서는 세계의 가정용 로봇 사용과 관련하여 발생한 문제에 대해 회의를 열었습니다. 여러분은 인류 발전 위원회 회의장에 참석한 대표들입니다. 먼저, 역할을 확인하세요.`;
//     default:
//       return mateName
//         ? `지금부터 여러분은 ${mateName}${getEulReul(mateName)} 사용하게 됩니다. 다양한 장소에서 어떻게 쓸지 함께 논의해요.`
//         : 'AI 이름을 불러오는 중입니다...';
//   }
// };

// // const main = customMain|| getDefaultMain();

//  const main = getDefaultMain();

// const paragraphs = [{ main }];

//   return (
//     <Layout round={round} subtopic={subtopic} nodescription={true}   onBackClick={handleBackClick} >
//       {/* 본문 */}
//       <div style={{display:'flex',gap:24,flexWrap:'wrap',justifyContent:'center'}}>
//         {images.map((src,i)=>(
//           <img key={i} src={src} alt='' style={{width:264,height:360,objectFit:'cover',borderRadius:4}}/>
//         ))}
//       </div>
//       <div style={{width:'100%',marginTop: 10, maxWidth:900}}>
//         {/* <ContentTextBox  disabled={!isHost} paragraphs={paragraphs} onContinue={handleContinue} /> */}
//         <ContentTextBox2 paragraphs={paragraphs} onContinue={handleContinue} />

//       </div>
//     </Layout>
//   );
// }

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentTextBox2 from '../components/ContentTextBox2';
import character1 from '../assets/images/Char1.jpg';
import character2 from '../assets/images/Char2.jpg';
import character3 from '../assets/images/Char3.jpg';
import axiosInstance from '../api/axiosInstance';
import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider';
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';
import BackButton from '../components/BackButton';
import { clearAllLocalStorageKeys } from '../utils/storage';

export default function Game01() {
  const navigate = useNavigate();

  // WebSocket과 WebRTC 상태 가져오기
  const { voiceSessionStatus, isInitialized: webrtcInitialized } = useWebRTC();
  const myRoleId = localStorage.getItem('myrole_id');
  const { isConnected, sessionId, sendMessage } = useWebSocket();

  const [currentIndex, setCurrentIndex] = useState(0);

  const { isHost, sendNextPage } = useHostActions();

  useWebSocketNavigation(navigate, {
    infoPath: `/character_description${myRoleId}`,
    nextPagePath: `/character_description${myRoleId}`,
  });

  const images = [character1, character2, character3];
  
  const roomCode = localStorage.getItem('room_code');
  const nickname = localStorage.getItem('nickname') || 'Guest';

  const title = localStorage.getItem('title') || ''; 

  const category = localStorage.getItem('category') || '안드로이드';
  const isAWS = category === '자율 무기 시스템';

  const [mateName, setMateName] = useState('');
  const [round, setRound] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetchedAiName = useRef(false);
  const hasJoined = useRef(false);

  const [customLoading, setCustomLoading] = useState(false);
  const [customMain, setCustomMain] = useState(null); 

  const isCustomMode = !!localStorage.getItem('code');
  const rawSubtopic = localStorage.getItem('subtopic');
  const creatorTitle = localStorage.getItem('creatorTitle') || '';
  const subtopic = isCustomMode ? creatorTitle : (rawSubtopic || '');

  let openingArr = [];
  try {
    const raw = localStorage.getItem('opening');
    const parsed = raw ? JSON.parse(raw) : [];
    openingArr = Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (e) {
    console.warn('opening 파싱 실패:', e);
  }
// 이미지 연결 시 dilemma_image_1로 수정하기
  const representativeImageUrl = localStorage.getItem('dilemma_image_3') || '';

  // 1. 라운드 계산
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const nextRound = completed.length + 1;
    setRound(nextRound);
    localStorage.setItem('currentRound', String(nextRound));
  }, []);

  // 2. AI 이름 셋업 (custom 모드에선 필요 X)
  useEffect(() => {
    if (isCustomMode) {
      // custom 모드는 mateName을 쓰지 않으므로 바로 로딩 끝
      setIsLoading(false);
      return;
    }
    if (hasFetchedAiName.current) return;
    const stored = localStorage.getItem('mateName');
    if (stored) {
      setMateName(stored);
      hasFetchedAiName.current = true;
      setIsLoading(false);
    } else {
      (async () => {
        try {
          const res = await axiosInstance.get('/rooms/ai-name', { params: { room_code: roomCode } });
          setMateName(res.data.ai_name);
          localStorage.setItem('mateName', res.data.ai_name);
        } catch (e) {
          console.error('AI 이름 불러오기 실패', e);
        } finally {
          hasFetchedAiName.current = true;
          setIsLoading(false);
        }
      })();
    }
  }, [roomCode, isCustomMode]);

  // 연결 상태 관리 (GameIntro에서 이미 초기화된 상태를 유지)
  const [connectionStatus, setConnectionStatus] = useState({
    websocket: true,
    webrtc: true,
    ready: true,
  });

  useEffect(() => {
    if (!isConnected) {
      console.warn('❌ WebSocket 연결 끊김 감지됨');
      alert('⚠️ 연결이 끊겨 게임이 초기화됩니다.');
      clearAllLocalStorageKeys();
      navigate('/');
    }
  }, [isConnected]);

  // 🔧 연결 상태 모니터링
  useEffect(() => {
    const newStatus = {
      websocket: isConnected,
      webrtc: webrtcInitialized,
      ready: isConnected && webrtcInitialized,
    };

    setConnectionStatus(newStatus);

    console.log('[game01] 연결 상태 업데이트:', newStatus);
  }, [isConnected, webrtcInitialized]);

  const handleBackClick = () => {
    navigate('/gamemap');
  };

  const handleContinue = () => {
    if (myRoleId) {
      // navigate('/game08');
      navigate(`/character_description${myRoleId}`);
    } else {
      console.warn('myRoleId가 존재하지 않습니다.');
    }
  };

  const getEulReul = (word) => {
    if (!word) return '';
    const lastChar = word[word.length - 1];
    const code = lastChar.charCodeAt(0);
    if (code < 0xac00 || code > 0xd7a3) return '를'; // 한글이 아닐 경우 기본 '를'
    const jong = (code - 0xac00) % 28;
    return jong === 0 ? '를' : '을';
  };

  // 기본 main 텍스트 생성 함수
  const getDefaultMain = () => {
    if (isAWS) {
      if (title === '주거, 군사 지역') {
        return (
          '지금부터 여러분은 자율무기시스템의 사용과 관련되어 있는 개인 이해관계자입니다.\n' +
          '자율무기시스템이 각자에게 주는 영향에 대해 함께 생각해 보고 논의할 것입니다.\n\n' +
          '먼저, 역할을 확인하세요.'
        );
      }
      if (title === '국가 인공지능 위원회') {
        return (
          '자율 무기 시스템을 사용한 군사 작전 및 분쟁이 늘어나고 있습니다. ' +
          '이에 전에 없던 새로운 문제들이 나타나, 국가 인공지능 위원회에서는 긴급 회의를 소집했습니다.\n ' +
          '국가 인공지능 위원회는 인공지능 산업 육성 및 규제 방안에 대해 논의하는 위원회입니다. ' +
          '여러분은 자율 무기 시스템과 관련된 국가적 차원의 의제에 대해 함께 논의하여 결정할 대표들입니다.\n\n' +
          '먼저, 역할을 확인하세요.'
        );
      }
      if (title === '국제 인류 발전 위원회') {
        return (
          '전 세계적으로, AWS의 활용과 관련하여 찬성과 반대 입장이 점차 양분되어 가고 있습니다.\n\n' +
          '이에 국제 평화를 위한 논의와 규제가 이루어지는 인류 발전 위원회에서는 AWS 사용과 관련하여 발생한 문제에 대해 회의를 열었습니다.\n\n' +
          '여러분은 인류 발전 위원회 회의장에 참석한 대표들입니다. 먼저, 역할을 확인하세요.'
        );
      }
      return '자율 무기 시스템 시나리오입니다. 먼저, 역할을 확인하세요.';
    }

    // 안드로이드 기본
    switch (title) {
      case '가정':
        return `지금부터 여러분은 ${mateName}${getEulReul(
          mateName,
        )} 사용하게 된 가정집의 구성원들입니다.\n 여러분은 가정에서 ${mateName}${getEulReul(
          mateName,
        )} 사용하며 일어나는 일에 대해 함께 논의하여 결정할 것입니다.\n 먼저, 역할을 확인하세요.`;
      case '국가 인공지능 위원회':
        return `비록 몇몇 문제들이 있었지만 ${mateName}의 편의성 덕분에 이후 우리 가정 뿐 아니라 여러 가정에서 HomeMate를 사용하게 되었습니다. \n 이후, 가정 뿐 아니라 국가적인 고민거리들이 나타나게 되어 국가 인공지능 위원회에서는 긴급 회의를 소집했습니다. 국가 인공지능 위원회는 인공지능 산업 육성 및 규제 방안에 대해 논의하는 위원회입니다. 여러분은 HomeMate와 관련된 국가적 규제에 대해 함께 논의하여 결정할 대표들입니다. 먼저, 역할을 확인하세요.`;
      case '국제 인류 발전 위원회':
        return `국내에서 몇몇 규제 관련 논의가 있었지만, A사의 로봇 HomeMate는 결국 전 세계로 진출했습니다. 이제 HomeMate뿐 아니라 세계의 여러 로봇 회사에서 비슷한 가정용 로봇을 생산하고 나섰습니다. \n 이에 국제 평화를 위한 논의와 규제가 이루어지는 인류 발전 위원회에서는 세계의 가정용 로봇 사용과 관련하여 발생한 문제에 대해 회의를 열었습니다. 여러분은 인류 발전 위원회 회의장에 참석한 대표들입니다. 먼저, 역할을 확인하세요.`;
      default:
        return mateName
          ? `지금부터 여러분은 ${mateName}${getEulReul(mateName)} 사용하게 됩니다. 다양한 장소에서 어떻게 쓸지 함께 논의해요.`
          : 'AI 이름을 불러오는 중입니다...';
    }
  };

  // Editor01과 동일
  const resolveImageUrl = (raw) => {
    if (!raw || raw === '-' || String(raw).trim() === '') return null;
    const u = String(raw).trim();
    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
    const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
    if (!base) return u;
    return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
  };

  const rawRep = localStorage.getItem('representative_image_url') || '';
  const repImg = resolveImageUrl(rawRep);

  // 기존 기본 본문 로직
  const defaultMain = getDefaultMain();
  const rolesBackground = (localStorage.getItem('rolesBackground') || '').trim();
    const paragraphs = isCustomMode
      ? [{ main: rolesBackground || defaultMain }]
      : [{ main: defaultMain }];

  //  paragraphs 변경 시 인덱스 초기화(옵션이지만 권장)
  useEffect(() => {
    setCurrentIndex(0);
  }, [paragraphs.length]);

  return (
    <Layout round={round} subtopic={subtopic} nodescription={true} onBackClick={handleBackClick}>
      {/* 본문 */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        {isCustomMode ? (
          repImg ? (
            <img
              src={repImg}
              alt=""
              style={{ width: 264, height: 360, objectFit: 'cover', borderRadius: 4 }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }} // 선택: 실패 시 감추기
            />
          ) : null
        ) : (
          [character1, character2, character3].map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              style={{ width: 264, height: 360, objectFit: 'cover', borderRadius: 4 }}
            />
          ))
        )}
      </div>

      <div style={{ width: '100%', marginTop: 10, maxWidth: 900 }}>
        <ContentTextBox2
          paragraphs={paragraphs}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          onContinue={handleContinue}
        />
      </div>
    </Layout>
  );
}