// // pages/Game01.js - 디버깅 버전
// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';

// import Layout from '../components/Layout';
// import ContentTextBox from '../components/ContentTextBox';

// import character1 from '../assets/images/Char1.jpg';
// import character2 from '../assets/images/Char2.jpg';
// import character3 from '../assets/images/Char3.jpg';

// import axiosInstance from '../api/axiosInstance';
// import { fetchWithAutoToken } from '../utils/fetchWithAutoToken';
// import { useWebSocket } from '../WebSocketProvider';
// import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';

// export default function Game01() {
//   const navigate = useNavigate();
//   const { isConnected, sessionId, sendMessage } = useWebSocket();
//   const myRoleId = localStorage.getItem('myrole_id');

//   // 디버깅을 위한 로그
//   console.log('🎮 Game01 렌더링 시작');
//   console.log('🔌 WebSocket 연결 상태:', isConnected);
//   console.log('🆔 Session ID:', sessionId);

//   const { isHost, sendNextPage } = useHostActions();

//   // WebSocket 네비게이션 처리 (Character Description 1로 이동)
//   useWebSocketNavigation(navigate, {
//     infoPath: `/character_description${myRoleId}`,
//     nextPagePath: `/character_description${myRoleId}`
//   });
  
//   const images = [character1, character2, character3];
//   const subtopic = localStorage.getItem('subtopic');
//   const roomCode = localStorage.getItem('room_code');
//   const nickname = localStorage.getItem('nickname') || 'Guest';

//   const [mateName, setMateName] = useState('');
//   const [round, setRound] = useState(1);
//   const [isLoading, setIsLoading] = useState(true);
//   const hasFetchedAiName = useRef(false);
//   const hasJoined = useRef(false);

//   // 1. 라운드 계산
//   useEffect(() => {
//     console.log('🎯 라운드 계산 시작');
//     const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
//     const nextRound = completed.length + 1;
//     setRound(nextRound);
//     localStorage.setItem('currentRound', nextRound.toString());
//     console.log('🎯 라운드 설정 완료:', nextRound);
//   }, []);

//   // 2. AI 이름 설정
//   useEffect(() => {
//     if (hasFetchedAiName.current) return;
//     const storedName = localStorage.getItem('mateName');
//     if (storedName) {
//       setMateName(storedName);
//       hasFetchedAiName.current = true;
//       setIsLoading(false);
//     } else {
//       (async () => {
//         try {
//           await fetchWithAutoToken();
//           const res = await axiosInstance.get('/rooms/ai-name', { params: { room_code: roomCode } });
//           setMateName(res.data.ai_name);
//           localStorage.setItem('mateName', res.data.ai_name);
//         } catch (err) {
//           console.error('❌ AI 이름 불러오기 실패:', err);
//         } finally {
//           hasFetchedAiName.current = true;
//           setIsLoading(false);
//         }
//       })();
//     }
//   }, [roomCode]);

//   // 3. Join 메시지 전송
//   useEffect(() => {
//     if (isConnected && sessionId && !hasJoined.current) {
//       sendMessage({ type: 'join', participant_id: Number(myRoleId), nickname });
//       hasJoined.current = true;
//       console.log('🔀 Join 메시지 전송:', { participant_id: myRoleId, nickname });
//     }
//   }, [isConnected, sessionId, sendMessage, myRoleId, nickname]);

//   // Continue 버튼 핸들
//   const handleContinue = () => {
//     console.log('🎮 Continue 버튼 클릭');
//     if (isHost) {
//       const sent = sendNextPage();
//       if (sent) console.log('➡️ 방장이 next_page 메시지 보냄');
//     } else {
//       alert('⚠️ 방장만 진행할 수 있습니다.');
//     }
//   };

//   const paragraphs = [
//     {
//       main: mateName
//         ? `  지금부터 여러분은 ${mateName}를 사용하게 된 사용자입니다.
//   다양한 장소에서 ${mateName}를 어떻게 사용하는지 함께 논의하고 결정할 것입니다.`
//         : '  AI 이름을 불러오는 중입니다...',
//     },
//   ];

//   if (isLoading) {
//     console.log('⏳ 로딩 중...');
//     return (
//       <Layout round={round} subtopic={subtopic}>
//         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, fontSize: 18 }}>
//           로딩 중...
//         </div>
//       </Layout>
//     );
//   }

//   console.log('🎮 Game01 렌더링 완료');

//   return (
//     <Layout round={round} subtopic={subtopic}>
     
//         <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
//           {images.map((src, idx) => (
//             <img key={idx} src={src} alt={`Character ${idx + 1}`} style={{ width: 264, height: 360, objectFit: 'cover', borderRadius: 4 }} />
//           ))}
//         </div>
//         <div style={{ width: '100%', maxWidth: 900 }}>
//           <ContentTextBox paragraphs={paragraphs} onContinue={handleContinue} />
//         </div>
//     </Layout>
//   );
// }// pages/Game01.js - 수정된 Layout 사용
// pages/Game01.js - 수정된 Layout 사용
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox';

import character1 from '../assets/images/Char1.jpg';
import character2 from '../assets/images/Char2.jpg';
import character3 from '../assets/images/Char3.jpg';

import axiosInstance from '../api/axiosInstance';
import { fetchWithAutoToken } from '../utils/fetchWithAutoToken';
import { useWebSocket } from '../WebSocketProvider';
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';
import voiceManager from '../utils/voiceManager';

export default function Game01() {
  const navigate = useNavigate();
  const { isConnected, sessionId, sendMessage } = useWebSocket();
  const myRoleId = localStorage.getItem('myrole_id');

  // 디버깅을 위한 로그
  console.log('🎮 Game01 렌더링 시작');
  console.log('🔌 WebSocket 연결 상태:', isConnected);
  console.log('🆔 Session ID:', sessionId);

  const { isHost, sendNextPage } = useHostActions();

  // WebSocket 네비게이션 처리 (Character Description 1로 이동)
  useWebSocketNavigation(navigate, {
    infoPath: `/character_description${myRoleId}`,
    nextPagePath: `/character_description${myRoleId}`
  });
  
  const images = [character1, character2, character3];
  const subtopic = localStorage.getItem('subtopic');
  const roomCode = localStorage.getItem('room_code');
  const nickname = localStorage.getItem('nickname') || 'Guest';

  const [mateName, setMateName] = useState('');
  const [round, setRound] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetchedAiName = useRef(false);
  const hasJoined = useRef(false);

  // 1. 라운드 계산
  useEffect(() => {
    console.log('🎯 라운드 계산 시작');
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const nextRound = completed.length + 1;
    setRound(nextRound);
    localStorage.setItem('currentRound', nextRound.toString());
    console.log('🎯 라운드 설정 완료:', nextRound);
  }, []);

  // 2. AI 이름 설정
  useEffect(() => {
    if (hasFetchedAiName.current) return;
    const storedName = localStorage.getItem('mateName');
    if (storedName) {
      setMateName(storedName);
      hasFetchedAiName.current = true;
      setIsLoading(false);
    } else {
      (async () => {
        try {
          await fetchWithAutoToken();
          const res = await axiosInstance.get('/rooms/ai-name', { params: { room_code: roomCode } });
          setMateName(res.data.ai_name);
          localStorage.setItem('mateName', res.data.ai_name);
        } catch (err) {
          console.error('❌ AI 이름 불러오기 실패:', err);
        } finally {
          hasFetchedAiName.current = true;
          setIsLoading(false);
        }
      })();
    }
  }, [roomCode]);

  // 3. Join 메시지 전송
  useEffect(() => {
    if (isConnected && sessionId && !hasJoined.current) {
      sendMessage({ type: 'join', participant_id: Number(myRoleId), nickname });
      hasJoined.current = true;
      console.log('🔀 Join 메시지 전송:', { participant_id: myRoleId, nickname });
    }
  }, [isConnected, sessionId, sendMessage, myRoleId, nickname]);

  // 4. 음성 세션 상태 확인 (초기화 안 함)
  useEffect(() => {
    const checkVoiceSession = () => {
      const currentStatus = voiceManager.getStatus();
      console.log('🎤 Game01 음성 세션 상태 확인:', {
        isConnected: currentStatus.isConnected,
        sessionId: currentStatus.sessionId,
        participantId: currentStatus.participantId
      });
      
      if (!currentStatus.isConnected) {
        console.warn('⚠️ 음성 세션이 초기화되지 않았습니다. GameIntro2에서 먼저 초기화해주세요.');
      }
    };

    // 상태 확인만 하고 초기화는 하지 않음
    const checkTimeout = setTimeout(checkVoiceSession, 500);
    
    return () => {
      clearTimeout(checkTimeout);
    };
  }, []);

  // Continue 버튼 핸들
  const handleContinue = () => {
    console.log('🎮 Continue 버튼 클릭');
    if (isHost) {
      const sent = sendNextPage();
      if (sent) console.log('➡️ 방장이 next_page 메시지 보냄');
    } else {
      alert('⚠️ 방장만 진행할 수 있습니다.');
    }
  };

  const paragraphs = [
    {
      main: mateName
        ? `  지금부터 여러분은 ${mateName}를 사용하게 된 사용자입니다.
  다양한 장소에서 ${mateName}를 어떻게 사용하는지 함께 논의하고 결정할 것입니다.`
        : '  AI 이름을 불러오는 중입니다...',
    },
  ];

  if (isLoading) {
    console.log('⏳ 로딩 중...');
    return (
      <Layout round={round} subtopic={subtopic}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, fontSize: 18 }}>
          로딩 중...
        </div>
      </Layout>
    );
  }

  console.log('🎮 Game01 렌더링 완료');

  return (
    <Layout round={round} subtopic={subtopic}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
       

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {images.map((src, idx) => (
            <img key={idx} src={src} alt={`Character ${idx + 1}`} style={{ width: 264, height: 360, objectFit: 'cover', borderRadius: 4 }} />
          ))}
        </div>
        
        <div style={{ width: '100%', maxWidth: 900 }}>
          <ContentTextBox paragraphs={paragraphs} onContinue={handleContinue} />
        </div>
      </div>
    </Layout>
  );
}