// import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
// import voiceManager from './utils/voiceManager';
// import axiosInstance from './api/axiosInstance';

// // WebRTC Context 생성
// const WebRTCContext = createContext();

// // WebRTC Provider 컴포넌트
// const WebRTCProvider = ({ children }) => {
//   // 상태 관리
//   const [isInitialized, setIsInitialized] = useState(false);
//   const [signalingConnected, setSignalingConnected] = useState(false);
//   const [peerConnections, setPeerConnections] = useState(new Map());
//   const [roleUserMapping, setRoleUserMapping] = useState({
//     role1_user_id: null,
//     role2_user_id: null,
//     role3_user_id: null,
//   });
//   const [myUserId, setMyUserId] = useState(null);
//   const [voiceSessionStatus, setVoiceSessionStatus] = useState({
//     isConnected: false,
//     isSpeaking: false,
//     sessionId: null,
//     nickname: null,
//     participantId: null,
//     micLevel: 0,
//     speakingThreshold: 30
//   });

//   // WebSocket 참조
//   const signalingWsRef = useRef(null);
//   const connectionAttemptedRef = useRef(false);
//   const initializationPromiseRef = useRef(null);

//   // 🔧 역할별 사용자 ID 매핑 저장
//   const saveRoleUserMapping = useCallback(async () => {
//     try {
//       const roomCode = localStorage.getItem('room_code');
//       if (!roomCode) {
//         console.log('⚠️ room_code가 없어서 역할 매핑 스킵');
//         return null;
//       }

//       const { data: room } = await axiosInstance.get(`/rooms/code/${roomCode}`);
      
//       console.log('🎯 WebRTCProvider - 역할별 사용자 매핑 저장:', room.participants);
      
//       const mapping = {
//         role1_user_id: null,
//         role2_user_id: null,
//         role3_user_id: null,
//       };
      
//       room.participants.forEach(participant => {
//         const roleId = participant.role_id;
//         const userId = participant.user_id;
        
//         if (roleId) {
//           localStorage.setItem(`role${roleId}_user_id`, String(userId));
//           mapping[`role${roleId}_user_id`] = String(userId);
//           console.log(`📝 Role ${roleId} → User ${userId} 매핑 저장`);
//         }
//       });
      
//       setRoleUserMapping(mapping);
      
//       // 음성 세션 생성/조회
//       try {
//         const nickname = localStorage.getItem('nickname') || "사용자";
//         const { data: voiceSession } = await axiosInstance.post('/voice/sessions', {
//           room_code: roomCode,
//           nickname: nickname
//         });
//         console.log('✅ 음성 세션 생성/조회 성공:', voiceSession.session_id);
//         localStorage.setItem('voice_session_id', voiceSession.session_id);
//       } catch (sessionError) {
//         console.error('❌ 음성 세션 생성 실패:', sessionError);
//       }
      
//       return mapping;
      
//     } catch (error) {
//       console.error('❌ 역할별 사용자 매핑 저장 실패:', error);
//       return null;
//     }
//   }, []);

//   // 🔧 PeerConnection 생성
//   const createPeerConnection = useCallback((remoteUserId) => {
//     const config = {
//       iceServers: [
//         { urls: 'stun:stun.l.google.com:19302' },
//         { urls: 'stun:stun1.l.google.com:19302' }
//       ]
//     };

//     const pc = new RTCPeerConnection(config);

//     // ICE candidate 이벤트 처리
//     pc.onicecandidate = (event) => {
//       if (event.candidate && signalingWsRef.current && signalingWsRef.current.readyState === WebSocket.OPEN) {
//         console.log('🧊 ICE candidate 생성 → 서버로 전송');
//         signalingWsRef.current.send(JSON.stringify({
//           type: "candidate",
//           candidate: event.candidate.candidate,
//           sdpMid: event.candidate.sdpMid,
//           sdpMLineIndex: event.candidate.sdpMLineIndex
//         }));
//       }
//     };

//     // 연결 상태 변경 이벤트
//     pc.onconnectionstatechange = () => {
//       console.log(`🔗 PeerConnection 상태 변경 (${remoteUserId}):`, pc.connectionState);
//     };

//     // 원격 스트림 수신 이벤트
//     pc.ontrack = (event) => {
//       console.log(`🎵 원격 스트림 수신 (${remoteUserId}):`, event.streams[0]);
//       const audioElement = document.createElement('audio');
//       audioElement.srcObject = event.streams[0];
//       audioElement.autoplay = true;
//       audioElement.volume = 1.0;
//       audioElement.setAttribute('data-user-id', remoteUserId);
//       document.body.appendChild(audioElement);
//     };

//     return pc;
//   }, []);

//   // 🔧 Offer 처리
//   const handleOffer = useCallback(async (message) => {
//     try {
//       console.log('🎯 Offer 수신 처리 시작:', message);
      
//       const remoteUserId = message.fromUserId || 'unknown';
//       const pc = createPeerConnection(remoteUserId);
      
//       setPeerConnections(prev => new Map(prev.set(remoteUserId, pc)));
      
//       await pc.setRemoteDescription(new RTCSessionDescription({
//         type: 'offer',
//         sdp: message.sdp
//       }));
      
//       // 로컬 스트림 추가
//       if (voiceManager.mediaStream) {
//         voiceManager.mediaStream.getTracks().forEach(track => {
//           pc.addTrack(track, voiceManager.mediaStream);
//           console.log('🎵 로컬 오디오 트랙 추가 (Answer 생성 시):', track.kind);
//         });
//       }
      
//       const answer = await pc.createAnswer();
//       await pc.setLocalDescription(answer);
      
//       if (signalingWsRef.current && signalingWsRef.current.readyState === WebSocket.OPEN) {
//         signalingWsRef.current.send(JSON.stringify({
//           type: "answer",
//           sdp: answer.sdp
//         }));
//         console.log('📤 Answer 생성 → 서버로 전송 완료');
//       }
      
//     } catch (error) {
//       console.error('❌ Offer 처리 오류:', error);
//     }
//   }, [createPeerConnection]);

//   // 🔧 Answer 처리
//   const handleAnswer = useCallback(async (message) => {
//     try {
//       console.log('🎯 Answer 수신 처리 시작:', message);
      
//       const remoteUserId = message.fromUserId || 'unknown';
//       const pc = peerConnections.get(remoteUserId);
      
//       if (pc) {
//         await pc.setRemoteDescription(new RTCSessionDescription({
//           type: 'answer',
//           sdp: message.sdp
//         }));
//         console.log('✅ Answer 처리 완료');
//       } else {
//         console.warn('⚠️ 해당 사용자의 PeerConnection을 찾을 수 없음:', remoteUserId);
//       }
      
//     } catch (error) {
//       console.error('❌ Answer 처리 오류:', error);
//     }
//   }, [peerConnections]);

//   // 🔧 ICE Candidate 처리
//   const handleCandidate = useCallback(async (message) => {
//     try {
//       console.log('🧊 ICE Candidate 수신 처리:', message);
      
//       const remoteUserId = message.fromUserId || 'unknown';
//       const pc = peerConnections.get(remoteUserId);
      
//       if (pc) {
//         await pc.addIceCandidate(new RTCIceCandidate({
//           candidate: message.candidate,
//           sdpMid: message.sdpMid,
//           sdpMLineIndex: message.sdpMLineIndex
//         }));
//         console.log('✅ ICE Candidate 추가 완료');
//       } else {
//         console.warn('⚠️ 해당 사용자의 PeerConnection을 찾을 수 없음:', remoteUserId);
//       }
      
//     } catch (error) {
//       console.error('❌ ICE Candidate 처리 오류:', error);
//     }
//   }, [peerConnections]);

//   // 🔧 Offer 생성 및 전송
//   const createAndSendOffer = useCallback(async (remoteUserId) => {
//     try {
//       console.log('🎯 Offer 생성 시작 → 상대방:', remoteUserId);
      
//       const pc = createPeerConnection(remoteUserId);
//       setPeerConnections(prev => new Map(prev.set(remoteUserId, pc)));
      
//       // 로컬 스트림 추가
//       if (voiceManager.mediaStream) {
//         voiceManager.mediaStream.getTracks().forEach(track => {
//           pc.addTrack(track, voiceManager.mediaStream);
//           console.log('🎵 로컬 오디오 트랙 추가:', track.kind);
//         });
//       }
      
//       const offer = await pc.createOffer();
//       await pc.setLocalDescription(offer);
      
//       if (signalingWsRef.current && signalingWsRef.current.readyState === WebSocket.OPEN) {
//         signalingWsRef.current.send(JSON.stringify({
//           type: "offer",
//           sdp: offer.sdp
//         }));
//         console.log('📤 Offer 생성 → 서버로 전송 완료');
//       } else {
//         console.error('❌ 시그널링 WebSocket이 연결되지 않음');
//       }
      
//     } catch (error) {
//       console.error('❌ Offer 생성 오류:', error);
//     }
//   }, [createPeerConnection]);

//   // 🔧 시그널링 WebSocket 연결
//   const connectSignalingWebSocket = useCallback(() => {
//     if (connectionAttemptedRef.current) {
//       console.log('⚠️ WebSocket 연결이 이미 시도됨, 중복 방지');
//       return;
//     }

//     try {
//       const roomCode = localStorage.getItem('room_code');
//       const token = localStorage.getItem('access_token');
      
//       if (!roomCode || !token) {
//         console.error('❌ room_code 또는 token이 없습니다', { roomCode, token: !!token });
//         return;
//       }

//       connectionAttemptedRef.current = true;

//       const urlsToTry = [
//         `wss://dilemmai.org/ws/signaling?room_code=${roomCode}&token=${token}`,
//       ];
      
//       console.log('🔌 WebRTCProvider - 시그널링 WebSocket 연결 시작');
      
//       const tryConnection = (urlIndex = 0) => {
//         if (urlIndex >= urlsToTry.length) {
//           console.error('❌ 모든 WebSocket URL 시도 실패');
//           connectionAttemptedRef.current = false;
//           return;
//         }
        
//         const currentUrl = urlsToTry[urlIndex];
//         console.log(`🔄 URL ${urlIndex + 1}/${urlsToTry.length} 시도:`, currentUrl);
        
//         const ws = new WebSocket(currentUrl);
        
//         const connectionTimeout = setTimeout(() => {
//           if (ws.readyState === WebSocket.CONNECTING) {
//             console.log(`⏰ URL ${urlIndex + 1} 연결 타임아웃 (3초 초과)`);
//             ws.close();
//             tryConnection(urlIndex + 1);
//           }
//         }, 3000);

//         ws.onopen = () => {
//           clearTimeout(connectionTimeout);
//           console.log('✅ WebRTCProvider - WebSocket 연결 성공!');
          
//           setSignalingConnected(true);
//           signalingWsRef.current = ws;
//         };

//         ws.onmessage = async (event) => {
//           try {
//             const message = JSON.parse(event.data);
//             console.log('📨 WebRTCProvider - 시그널링 메시지:', message);

//             if (message.type === 'offer') {
//               await handleOffer(message);
//             } else if (message.type === 'answer') {
//               await handleAnswer(message);
//             } else if (message.type === 'candidate') {
//               await handleCandidate(message);
//             }
//           } catch (error) {
//             console.error('❌ 시그널링 메시지 처리 오류:', error);
//           }
//         };

//         ws.onclose = (event) => {
//           clearTimeout(connectionTimeout);
//           console.log(`🔌 WebSocket 연결 종료 (URL ${urlIndex + 1}):`, {
//             code: event.code,
//             reason: event.reason || '이유 없음',
//             wasClean: event.wasClean
//           });
          
//           setSignalingConnected(false);
//           signalingWsRef.current = null;
//           connectionAttemptedRef.current = false;
          
//           if (event.code !== 1000) {
//             setTimeout(() => {
//               tryConnection(urlIndex + 1);
//             }, 1500);
//           }
//         };

//         ws.onerror = (error) => {
//           clearTimeout(connectionTimeout);
//           console.error(`❌ WebSocket 오류 (URL ${urlIndex + 1}):`, error);
          
//           setSignalingConnected(false);
//           signalingWsRef.current = null;
//           connectionAttemptedRef.current = false;
          
//           setTimeout(() => {
//             tryConnection(urlIndex + 1);
//           }, 500);
//         };
//       };
      
//       tryConnection(0);

//     } catch (error) {
//       console.error('❌ 시그널링 WebSocket 연결 실패:', error);
//       connectionAttemptedRef.current = false;
//     }
//   }, [handleOffer, handleAnswer, handleCandidate]);

//   // 🔧 P2P 연결 시작
//   const startPeerConnections = useCallback(() => {
//     if (!myUserId || !Object.values(roleUserMapping).some(id => id)) {
//       console.log('⏳ P2P 연결 대기 중 - 사용자 ID 또는 역할 매핑 없음');
//       return;
//     }

//     console.log('🚀 WebRTCProvider - P2P 연결 시작:', myUserId);
    
//     Object.entries(roleUserMapping).forEach(([roleKey, userId]) => {
//       if (userId && userId !== myUserId) {
//         console.log(`🔗 ${userId}와 P2P 연결 확인`);
//         if (parseInt(myUserId) < parseInt(userId)) {
//           console.log(`📤 ${userId}에게 Offer 전송`);
//           createAndSendOffer(userId);
//         } else {
//           console.log(`📥 ${userId}로부터 Offer 대기 중`);
//         }
//       }
//     });
//   }, [myUserId, roleUserMapping, createAndSendOffer]);

//   // 🔧 WebRTC 초기화 (한 번만 실행)
//   const initializeWebRTC = useCallback(async () => {
//     if (initializationPromiseRef.current) {
//       return initializationPromiseRef.current;
//     }

//     initializationPromiseRef.current = (async () => {
//       try {
//         console.log('🚀 WebRTCProvider - 초기화 시작');
        
//         // 1. 사용자 ID 확인/설정
//         let userId = localStorage.getItem('user_id');
//         if (!userId) {
//           console.log('⚠️ user_id가 없음, /users/me에서 가져오는 중...');
//           const response = await axiosInstance.get('/users/me');
//           userId = String(response.data.id);
//           localStorage.setItem('user_id', userId);
//         }
//         setMyUserId(userId);
        
//         // 2. 역할별 사용자 매핑 저장
//         const mapping = await saveRoleUserMapping();
//         if (!mapping) {
//           console.error('❌ 역할 매핑 실패');
//           return false;
//         }
        
//         // 3. 음성 세션 초기화
//         const voiceSuccess = await voiceManager.initializeVoiceSession();
//         if (!voiceSuccess) {
//           console.error('❌ 음성 세션 초기화 실패');
//           return false;
//         }
        
//         // 4. WebSocket 연결
//         connectSignalingWebSocket();
        
//         // 5. 상태 업데이트 주기적 확인
//         const statusInterval = setInterval(() => {
//           const currentStatus = voiceManager.getStatus();
//           setVoiceSessionStatus(currentStatus);
//         }, 100);
        
//         setIsInitialized(true);
//         console.log('✅ WebRTCProvider - 초기화 완료');
        
//         // 정리 함수 반환
//         return () => {
//           clearInterval(statusInterval);
//         };
        
//       } catch (error) {
//         console.error('❌ WebRTCProvider 초기화 중 오류:', error);
//         return false;
//       }
//     })();

//     return initializationPromiseRef.current;
//   }, [saveRoleUserMapping, connectSignalingWebSocket]);

//   // 🔧 초기화 useEffect
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       initializeWebRTC();
//     }, 1000);

//     return () => {
//       clearTimeout(timer);
//     };
//   }, [initializeWebRTC]);

//   // 🔧 P2P 연결 시작 useEffect
//   useEffect(() => {
//     if (signalingConnected && Object.values(roleUserMapping).some(id => id) && myUserId) {
//       console.log('📊 WebRTCProvider - 시그널링 연결 완료 감지, P2P 연결 시작');
//       startPeerConnections();
//     }
//   }, [signalingConnected, roleUserMapping, myUserId, startPeerConnections]);

//   // 🔧 정리 useEffect
//   useEffect(() => {
//     return () => {
//       console.log('🧹 WebRTCProvider 정리 시작');
      
//       // PeerConnection 정리
//       peerConnections.forEach(pc => {
//         pc.close();
//       });
//       setPeerConnections(new Map());
      
//       // WebSocket 정리
//       if (signalingWsRef.current) {
//         signalingWsRef.current.close();
//         signalingWsRef.current = null;
//       }
      
//       // 원격 오디오 요소 정리
//       const audioElements = document.querySelectorAll('audio[data-user-id]');
//       audioElements.forEach(audio => {
//         audio.remove();
//       });
      
//       console.log('✅ WebRTCProvider 정리 완료');
//     };
//   }, []);

//   // 🔧 Context에서 제공할 값들
//   const contextValue = {
//     // 상태
//     isInitialized,
//     signalingConnected,
//     peerConnections,
//     roleUserMapping,
//     myUserId,
//     voiceSessionStatus,
    
//     // 함수들
//     initializeWebRTC,
//     adjustThreshold: (delta) => {
//       const newThreshold = Math.max(10, Math.min(100, voiceSessionStatus.speakingThreshold + delta));
//       voiceManager.setSpeakingThreshold(newThreshold);
//     },
    
//     // 음성 관련
//     toggleMic: () => voiceManager.toggleMic(),
//     getMicLevel: () => voiceSessionStatus.micLevel,
//     isSpeaking: () => voiceSessionStatus.isSpeaking,
//   };

//   return (
//     <WebRTCContext.Provider value={contextValue}>
//       {children}
//     </WebRTCContext.Provider>
//   );
// };

// // 🔧 Custom Hook
// export const useWebRTC = () => {
//   const context = useContext(WebRTCContext);
//   if (!context) {
//     throw new Error('useWebRTC must be used within a WebRTCProvider');
//   }
//   return context;
// };

// export default WebRTCProvider;
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import voiceManager from './utils/voiceManager';
import axiosInstance from './api/axiosInstance';

// WebRTC Context 생성
const WebRTCContext = createContext();

// WebRTC Provider 컴포넌트
const WebRTCProvider = ({ children }) => {
  // 상태 관리
  const [isInitialized, setIsInitialized] = useState(false);
  const [signalingConnected, setSignalingConnected] = useState(false);
  const [peerConnections, setPeerConnections] = useState(new Map());
  const [roleUserMapping, setRoleUserMapping] = useState({
    role1_user_id: null,
    role2_user_id: null,
    role3_user_id: null,
  });
  const [myUserId, setMyUserId] = useState(null);
  const [myRoleId, setMyRoleId] = useState(null);
  const [voiceSessionStatus, setVoiceSessionStatus] = useState({
    isConnected: false,
    isSpeaking: false,
    sessionId: null,
    nickname: null,
    participantId: null,
    micLevel: 0,
    speakingThreshold: 30
  });

  // WebSocket 참조
  const signalingWsRef = useRef(null);
  const connectionAttemptedRef = useRef(false);
  const initializationPromiseRef = useRef(null);

  // 🆕 연결 추적 (Role 기반으로 추적, User ID로 실제 연결)
  const offerSentToRoles = useRef(new Set()); // 내가 Offer를 보낸 역할들
  const offerReceivedFromRoles = useRef(new Set()); // 내가 Offer를 받은 역할들

  // 🔧 역할별 사용자 ID 매핑 저장
  const saveRoleUserMapping = useCallback(async () => {
    try {
      const roomCode = localStorage.getItem('room_code');
      if (!roomCode) {
        console.log('⚠️ room_code가 없어서 역할 매핑 스킵');
        return null;
      }

      const { data: room } = await axiosInstance.get(`/rooms/code/${roomCode}`);
      
      console.log('🎯 WebRTCProvider - 역할별 사용자 매핑 저장:', room.participants);
      
      const mapping = {
        role1_user_id: null,
        role2_user_id: null,
        role3_user_id: null,
      };
      
      // 내 역할 ID 찾기
      let currentUserRoleId = null;
      const currentUserId = localStorage.getItem('user_id');
      
      room.participants.forEach(participant => {
        const roleId = participant.role_id;
        const userId = participant.user_id;
        
        if (roleId) {
          localStorage.setItem(`role${roleId}_user_id`, String(userId));
          mapping[`role${roleId}_user_id`] = String(userId);
          console.log(`📝 Role ${roleId} → User ${userId} 매핑 저장`);
          
          // 내 역할 ID 찾기
          if (String(userId) === currentUserId) {
            currentUserRoleId = roleId;
            console.log(`👤 내 역할 확인: User ${userId} = Role ${roleId}`);
          }
        }
      });
      
      setRoleUserMapping(mapping);
      setMyRoleId(currentUserRoleId);
      
      // 🆕 연결 계획 출력
      console.log(`📋 연결 계획 (Role ${currentUserRoleId} 기준):`);
      if (currentUserRoleId) {
        for (let targetRole = currentUserRoleId + 1; targetRole <= 3; targetRole++) {
          const targetUserId = mapping[`role${targetRole}_user_id`];
          if (targetUserId) {
            console.log(`  📤 Role ${targetRole} (User ${targetUserId})에게 Offer 전송 예정`);
          }
        }
        for (let senderRole = 1; senderRole < currentUserRoleId; senderRole++) {
          const senderUserId = mapping[`role${senderRole}_user_id`];
          if (senderUserId) {
            console.log(`  📥 Role ${senderRole} (User ${senderUserId})로부터 Offer 수신 예정`);
          }
        }
      }
      
      // 음성 세션 생성/조회
      try {
        const nickname = localStorage.getItem('nickname') || "사용자";
        const { data: voiceSession } = await axiosInstance.post('/voice/sessions', {
          room_code: roomCode,
          nickname: nickname
        });
        console.log('✅ 음성 세션 생성/조회 성공:', voiceSession.session_id);
        localStorage.setItem('voice_session_id', voiceSession.session_id);
      } catch (sessionError) {
        console.error('❌ 음성 세션 생성 실패:', sessionError);
      }
      
      return mapping;
      
    } catch (error) {
      console.error('❌ 역할별 사용자 매핑 저장 실패:', error);
      return null;
    }
  }, []);

  // 🔧 PeerConnection 생성 (User ID 기반)
  const createPeerConnection = useCallback((remoteUserId) => {
    console.log(`🔗 PeerConnection 생성: User ${myUserId} ↔ User ${remoteUserId}`);
    
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(config);

    // ICE candidate 이벤트 처리
    pc.onicecandidate = (event) => {
      if (event.candidate && signalingWsRef.current && signalingWsRef.current.readyState === WebSocket.OPEN) {
        console.log(`🧊 ICE candidate 생성 → User ${remoteUserId}에게 전송`);
        signalingWsRef.current.send(JSON.stringify({
          type: "candidate",
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex
        }));
      }
    };

    // 연결 상태 변경 이벤트
    pc.onconnectionstatechange = () => {
      console.log(`🔗 PeerConnection 상태 변경 (User ${remoteUserId}):`, pc.connectionState);
      if (pc.connectionState === 'connected') {
        const remoteRoleId = getRoleIdByUserId(remoteUserId);
        console.log(`✅ P2P 연결 성공: User ${myUserId} (Role ${myRoleId}) ↔ User ${remoteUserId} (Role ${remoteRoleId})`);
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        console.log(`❌ P2P 연결 실패/끊김: User ${myUserId} ↔ User ${remoteUserId}`);
      }
    };

    // 원격 스트림 수신 이벤트
    pc.ontrack = (event) => {
      console.log(`🎵 원격 스트림 수신 (User ${remoteUserId}):`, event.streams[0]);
      
      // 기존 오디오 요소 제거 (중복 방지)
      const existingAudio = document.querySelector(`audio[data-user-id="${remoteUserId}"]`);
      if (existingAudio) {
        existingAudio.remove();
      }
      
      // 새 오디오 요소 생성
      const audioElement = document.createElement('audio');
      audioElement.srcObject = event.streams[0];
      audioElement.autoplay = true;
      audioElement.volume = 1.0;
      audioElement.setAttribute('data-user-id', remoteUserId);
      document.body.appendChild(audioElement);
      
      const remoteRoleId = getRoleIdByUserId(remoteUserId);
      console.log(`🔊 오디오 요소 생성 완료: User ${remoteUserId} (Role ${remoteRoleId})`);
    };

    return pc;
  }, [myUserId]);

  // 🔧 유틸리티 함수들
  const getUserIdByRole = useCallback((roleId) => {
    return roleUserMapping[`role${roleId}_user_id`];
  }, [roleUserMapping]);

  const getRoleIdByUserId = useCallback((userId) => {
    for (let roleId = 1; roleId <= 3; roleId++) {
      if (roleUserMapping[`role${roleId}_user_id`] === userId) {
        return roleId;
      }
    }
    return null;
  }, [roleUserMapping]);
// 🔧 Offer 처리 (완전히 수정된 버전)
const handleOffer = useCallback(async (message) => {
    try {
      console.log('🎯 Offer 수신 처리 시작:', message);
      
      // 🆕 역할 ID 확인 (localStorage에서 직접)
      let currentRoleId = myRoleId;
      if (!currentRoleId) {
        console.log('⚠️ myRoleId가 없음, localStorage에서 직접 확인 중...');
        const storedRoleId = localStorage.getItem('myrole_id');
        if (storedRoleId) {
          currentRoleId = parseInt(storedRoleId);
          console.log(`🔍 localStorage myrole_id 사용: Role ${currentRoleId}`);
          setMyRoleId(currentRoleId);
        } else {
          console.error('❌ localStorage에서도 역할 ID를 찾을 수 없음');
          return;
        }
      }
      
      console.log(`📋 현재 역할 ID: ${currentRoleId}`);
      
      // 🆕 localStorage에서 직접 사용자 ID 확인
      const getSenderUserId = (roleId) => {
        const userId = localStorage.getItem(`role${roleId}_user_id`);
        console.log(`🔍 Role ${roleId} → User ${userId} (localStorage)`);
        return userId;
      };
      
      // 🆕 나보다 낮은 역할 ID들 확인
      const possibleSenders = [];
      for (let roleId = 1; roleId < currentRoleId; roleId++) {
        const senderUserId = getSenderUserId(roleId);
        if (senderUserId && !offerReceivedFromRoles.current.has(roleId)) {
          possibleSenders.push({ roleId, userId: senderUserId });
          console.log(`✅ 가능한 발신자: Role ${roleId} (User ${senderUserId})`);
        }
      }
      
      console.log(`📊 가능한 발신자 수: ${possibleSenders.length}`);
      
      if (possibleSenders.length === 0) {
        console.warn(`⚠️ Role ${currentRoleId}로 Offer를 보낼 수 있는 역할이 없음`);
        console.log('🔍 이미 받은 Offer:', Array.from(offerReceivedFromRoles.current));
        return;
      }
      
      // 가장 낮은 역할 ID부터 순차 처리
      const sender = possibleSenders[0];
      const remoteUserId = sender.userId;
      
      console.log(`📥 Offer 발신자 확정: Role ${sender.roleId} (User ${remoteUserId})`);
      offerReceivedFromRoles.current.add(sender.roleId);
      
      // User ID 기반으로 PeerConnection 생성
      const pc = createPeerConnection(remoteUserId);
      setPeerConnections(prev => new Map(prev.set(remoteUserId, pc)));
      
      // 원격 SDP 설정
      await pc.setRemoteDescription(new RTCSessionDescription({
        type: 'offer',
        sdp: message.sdp
      }));
      
      console.log(`✅ 원격 SDP 설정 완료: Role ${sender.roleId} (User ${remoteUserId})`);
      
      // 로컬 스트림 추가
      if (voiceManager.mediaStream) {
        voiceManager.mediaStream.getTracks().forEach(track => {
          pc.addTrack(track, voiceManager.mediaStream);
          console.log('🎵 로컬 오디오 트랙 추가 (Answer 생성 시):', track.kind);
        });
      }
      
      // Answer 생성
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      // Answer를 서버로 전송
      if (signalingWsRef.current && signalingWsRef.current.readyState === WebSocket.OPEN) {
        signalingWsRef.current.send(JSON.stringify({
          type: "answer",
          sdp: answer.sdp
        }));
        console.log(`📤 Answer 전송 완료: Role ${sender.roleId} (User ${remoteUserId})에게`);
      } else {
        console.error('❌ WebSocket이 연결되지 않음');
      }
      
    } catch (error) {
      console.error('❌ Offer 처리 오류:', error);
    }
  }, [createPeerConnection, myRoleId]);
  // 🔧 Answer 처리 (Role 기반 로직, User ID로 실제 처리)
  const handleAnswer = useCallback(async (message) => {
    try {
      console.log('🎯 Answer 수신 처리 시작:', message);
      
      if (!myRoleId) {
        console.warn('⚠️ 내 역할 ID가 없음');
        return;
      }
      
      // 🆕 내가 Offer를 보낸 역할들 중에서 Answer를 받을 역할 찾기
      let receiverRoleId = null;
      let receiverUserId = null;
      
      // 내 역할보다 높은 역할들 중에서 내가 Offer를 보낸 역할 찾기
      for (let roleId = myRoleId + 1; roleId <= 3; roleId++) {
        if (offerSentToRoles.current.has(roleId)) {
          const userId = getUserIdByRole(roleId);
          if (userId && peerConnections.has(userId)) {
            receiverRoleId = roleId;
            receiverUserId = userId;
            break; // 가장 낮은 역할부터 순차 처리
          }
        }
      }
      
      if (!receiverRoleId || !receiverUserId) {
        console.warn(`⚠️ Answer를 받을 수 있는 역할이 없음`);
        return;
      }
      
      console.log(`📥 Answer 수신자 확정: Role ${receiverRoleId} (User ${receiverUserId})`);
      
      const pc = peerConnections.get(receiverUserId);
      
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription({
          type: 'answer',
          sdp: message.sdp
        }));
        console.log(`✅ Answer 처리 완료: Role ${receiverRoleId} (User ${receiverUserId})`);
      } else {
        console.warn('⚠️ 해당 사용자의 PeerConnection을 찾을 수 없음:', receiverUserId);
      }
      
    } catch (error) {
      console.error('❌ Answer 처리 오류:', error);
    }
  }, [peerConnections, myRoleId, getUserIdByRole]);

  // 🔧 ICE Candidate 처리
  const handleCandidate = useCallback(async (message) => {
    try {
      console.log('🧊 ICE Candidate 수신 처리:', message);
      
      // 원격 SDP가 설정된 PeerConnection에만 Candidate 추가
      const validPeers = Array.from(peerConnections.entries())
        .filter(([userId, pc]) => 
          pc.remoteDescription && // 원격 SDP가 설정됨
          (pc.connectionState === 'new' || 
           pc.connectionState === 'connecting' ||
           pc.connectionState === 'connected')
        );
      
      if (validPeers.length === 0) {
        console.warn('⚠️ 원격 SDP가 설정된 PeerConnection이 없음');
        return;
      }
      
      // 모든 유효한 연결에 Candidate 추가
      for (const [remoteUserId, pc] of validPeers) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate({
            candidate: message.candidate,
            sdpMid: message.sdpMid,
            sdpMLineIndex: message.sdpMLineIndex
          }));
          const remoteRoleId = getRoleIdByUserId(remoteUserId);
          console.log(`✅ ICE Candidate 추가 완료: User ${remoteUserId} (Role ${remoteRoleId})`);
        } catch (error) {
          console.warn(`⚠️ ICE Candidate 추가 실패 (User ${remoteUserId}):`, error.message);
        }
      }
      
    } catch (error) {
      console.error('❌ ICE Candidate 처리 오류:', error);
    }
  }, [peerConnections, getRoleIdByUserId]);

  // 🔧 Offer 생성 및 전송 (Role 기반 결정, User ID로 전송)
  const createAndSendOffer = useCallback(async (targetRoleId) => {
    try {
      const remoteUserId = getUserIdByRole(targetRoleId);
      if (!remoteUserId) {
        console.warn(`⚠️ Role ${targetRoleId}에 해당하는 사용자 없음`);
        return;
      }
      
      console.log(`🎯 Offer 생성 시작 → Role ${targetRoleId} (User ${remoteUserId})`);
      
      // Role 기반 추적
      offerSentToRoles.current.add(targetRoleId);
      
      // User ID 기반 PeerConnection 생성
      const pc = createPeerConnection(remoteUserId);
      setPeerConnections(prev => new Map(prev.set(remoteUserId, pc)));
      
      // 로컬 스트림 추가
      if (voiceManager.mediaStream) {
        voiceManager.mediaStream.getTracks().forEach(track => {
          pc.addTrack(track, voiceManager.mediaStream);
          console.log('🎵 로컬 오디오 트랙 추가:', track.kind);
        });
      }
      
      // Offer 생성
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // Offer를 서버로 전송 (User 토큰 기반 시그널링)
      if (signalingWsRef.current && signalingWsRef.current.readyState === WebSocket.OPEN) {
        signalingWsRef.current.send(JSON.stringify({
          type: "offer",
          sdp: offer.sdp
        }));
        console.log(`📤 Offer 생성 → Role ${targetRoleId} (User ${remoteUserId})에게 전송 완료`);
      } else {
        console.error('❌ 시그널링 WebSocket이 연결되지 않음');
      }
      
    } catch (error) {
      console.error('❌ Offer 생성 오류:', error);
    }
  }, [createPeerConnection, getUserIdByRole]);

  // 🔧 시그널링 WebSocket 연결
  const connectSignalingWebSocket = useCallback(() => {
    if (connectionAttemptedRef.current) {
      console.log('⚠️ WebSocket 연결이 이미 시도됨, 중복 방지');
      return;
    }

    try {
      const roomCode = localStorage.getItem('room_code');
      const token = localStorage.getItem('access_token');
      
      if (!roomCode || !token) {
        console.error('❌ room_code 또는 token이 없습니다', { roomCode, token: !!token });
        return;
      }

      connectionAttemptedRef.current = true;

      const urlsToTry = [
        `wss://dilemmai.org/ws/signaling?room_code=${roomCode}&token=${token}`,
      ];
      
      console.log('🔌 WebRTCProvider - 시그널링 WebSocket 연결 시작 (User 토큰 기반)');
      
      const tryConnection = (urlIndex = 0) => {
        if (urlIndex >= urlsToTry.length) {
          console.error('❌ 모든 WebSocket URL 시도 실패');
          connectionAttemptedRef.current = false;
          return;
        }
        
        const currentUrl = urlsToTry[urlIndex];
        console.log(`🔄 URL ${urlIndex + 1}/${urlsToTry.length} 시도:`, currentUrl);
        
        const ws = new WebSocket(currentUrl);
        
        const connectionTimeout = setTimeout(() => {
          if (ws.readyState === WebSocket.CONNECTING) {
            console.log(`⏰ URL ${urlIndex + 1} 연결 타임아웃 (3초 초과)`);
            ws.close();
            tryConnection(urlIndex + 1);
          }
        }, 3000);

        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('✅ WebRTCProvider - WebSocket 연결 성공! (User 토큰 기반)');
          
          setSignalingConnected(true);
          signalingWsRef.current = ws;
        };

        ws.onmessage = async (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('📨 WebRTCProvider - 시그널링 메시지:', message);

            if (message.type === 'offer') {
              await handleOffer(message);
            } else if (message.type === 'answer') {
              await handleAnswer(message);
            } else if (message.type === 'candidate') {
              await handleCandidate(message);
            } else {
              console.log('❓ 알 수 없는 메시지 타입:', message.type);
            }
          } catch (error) {
            console.error('❌ 시그널링 메시지 처리 오류:', error);
          }
        };

        ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.log(`🔌 WebSocket 연결 종료 (URL ${urlIndex + 1}):`, {
            code: event.code,
            reason: event.reason || '이유 없음',
            wasClean: event.wasClean
          });
          
          setSignalingConnected(false);
          signalingWsRef.current = null;
          connectionAttemptedRef.current = false;
          
          if (event.code !== 1000) {
            setTimeout(() => {
              tryConnection(urlIndex + 1);
            }, 1500);
          }
        };

        ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error(`❌ WebSocket 오류 (URL ${urlIndex + 1}):`, error);
          
          setSignalingConnected(false);
          signalingWsRef.current = null;
          connectionAttemptedRef.current = false;
          
          setTimeout(() => {
            tryConnection(urlIndex + 1);
          }, 500);
        };
      };
      
      tryConnection(0);

    } catch (error) {
      console.error('❌ 시그널링 WebSocket 연결 실패:', error);
      connectionAttemptedRef.current = false;
    }
  }, [handleOffer, handleAnswer, handleCandidate]);

  // 🔧 P2P 연결 시작 (Role 기반 결정)
  const startPeerConnections = useCallback(() => {
    if (!myRoleId || !Object.values(roleUserMapping).some(id => id)) {
      console.log('⏳ P2P 연결 대기 중 - 역할 ID 또는 역할 매핑 없음');
      return;
    }

    console.log(`🚀 WebRTCProvider - P2P 연결 시작: 내 역할 ${myRoleId} (User ${myUserId})`);
    
    // 🆕 Role 기반 연결 순서, User ID로 실제 통신
    // Role 1 → Role 2, Role 3
    // Role 2 → Role 3
    for (let targetRoleId = myRoleId + 1; targetRoleId <= 3; targetRoleId++) {
      const targetUserId = getUserIdByRole(targetRoleId);
      if (targetUserId) {
        console.log(`📤 Role ${targetRoleId} (User ${targetUserId})에게 Offer 전송 예정 (내 역할: ${myRoleId})`);
        setTimeout(() => {
          createAndSendOffer(targetRoleId);
        }, (targetRoleId - myRoleId) * 1000); // 역할 차이만큼 지연
      } else {
        console.log(`⚠️ Role ${targetRoleId}에 해당하는 사용자 없음`);
      }
    }
    
    // 내가 받을 Offer 확인
    for (let senderRoleId = 1; senderRoleId < myRoleId; senderRoleId++) {
      const senderUserId = getUserIdByRole(senderRoleId);
      if (senderUserId) {
        console.log(`📥 Role ${senderRoleId} (User ${senderUserId})로부터 Offer 대기 중`);
      }
    }
  }, [myRoleId, roleUserMapping, getUserIdByRole, createAndSendOffer, myUserId]);

  // 🔧 WebRTC 초기화
  const initializeWebRTC = useCallback(async () => {
    if (initializationPromiseRef.current) {
      return initializationPromiseRef.current;
    }

    initializationPromiseRef.current = (async () => {
      try {
        console.log('🚀 WebRTCProvider - 초기화 시작');
        
        // 1. 사용자 ID 확인/설정
        let userId = localStorage.getItem('user_id');
        if (!userId) {
          console.log('⚠️ user_id가 없음, /users/me에서 가져오는 중...');
          const response = await axiosInstance.get('/users/me');
          userId = String(response.data.id);
          localStorage.setItem('user_id', userId);
        }
        setMyUserId(userId);
        
        // 2. 역할별 사용자 매핑 저장 (내 역할 ID도 설정됨)
        const mapping = await saveRoleUserMapping();
        if (!mapping) {
          console.error('❌ 역할 매핑 실패');
          return false;
        }
        
        // 3. 음성 세션 초기화
        const voiceSuccess = await voiceManager.initializeVoiceSession();
        if (!voiceSuccess) {
          console.error('❌ 음성 세션 초기화 실패');
          return false;
        }
        
        // 4. WebSocket 연결 (User 토큰 기반)
        connectSignalingWebSocket();
        
        // 5. 상태 업데이트 주기적 확인
        const statusInterval = setInterval(() => {
          const currentStatus = voiceManager.getStatus();
          setVoiceSessionStatus(currentStatus);
        }, 100);
        
        setIsInitialized(true);
        console.log('✅ WebRTCProvider - 초기화 완료 (Role-User 하이브리드 방식)');
        
        return () => {
          clearInterval(statusInterval);
        };
        
      } catch (error) {
        console.error('❌ WebRTCProvider 초기화 중 오류:', error);
        return false;
      }
    })();

    return initializationPromiseRef.current;
  }, [saveRoleUserMapping, connectSignalingWebSocket]);

  // 🔧 초기화 useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      initializeWebRTC();
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [initializeWebRTC]);

  // 🔧 P2P 연결 시작 useEffect
  useEffect(() => {
    if (signalingConnected && myRoleId && Object.values(roleUserMapping).some(id => id)) {
      console.log('📊 WebRTCProvider - 시그널링 연결 완료, Role-User 하이브리드 P2P 연결 시작');
      startPeerConnections();
    }
  }, [signalingConnected, myRoleId, roleUserMapping, startPeerConnections]);

  // 🔧 정리 useEffect
  useEffect(() => {
    return () => {
      console.log('🧹 WebRTCProvider 정리 시작');
      
      // PeerConnection 정리
      peerConnections.forEach(pc => {
        pc.close();
      });
      setPeerConnections(new Map());
      
      // WebSocket 정리
      if (signalingWsRef.current) {
        signalingWsRef.current.close();
        signalingWsRef.current = null;
      }
      
      // 원격 오디오 요소 정리
      const audioElements = document.querySelectorAll('audio[data-user-id]');
      audioElements.forEach(audio => {
        audio.remove();
      });
      
      // 추적 상태 정리
      offerSentToRoles.current.clear();
      offerReceivedFromRoles.current.clear();
      
      console.log('✅ WebRTCProvider 정리 완료');
    };
  }, []);

  // 🔧 Context에서 제공할 값들
  const contextValue = {
    // 상태
    isInitialized,
    signalingConnected,
    peerConnections,
    roleUserMapping,
    myUserId,
    myRoleId,
    voiceSessionStatus,
    
    // 함수들
    initializeWebRTC,
    adjustThreshold: (delta) => {
      const newThreshold = Math.max(10, Math.min(100, voiceSessionStatus.speakingThreshold + delta));
      voiceManager.setSpeakingThreshold(newThreshold);
    },
    
    // 음성 관련
    toggleMic: () => voiceManager.toggleMic(),
    getMicLevel: () => voiceSessionStatus.micLevel,
    isSpeaking: () => voiceSessionStatus.isSpeaking,
    
    // 역할-사용자 변환 유틸리티
    getUserIdByRole,
    getRoleIdByUserId,
  };

  return (
    <WebRTCContext.Provider value={contextValue}>
      {children}
    </WebRTCContext.Provider>
  );
};

// 🔧 Custom Hook
export const useWebRTC = () => {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error('useWebRTC must be used within a WebRTCProvider');
  }
  return context;
};

export default WebRTCProvider;