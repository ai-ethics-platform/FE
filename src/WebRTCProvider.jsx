// 12월 30일 수정 전, 원본 코드
// import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
// import voiceManager from './utils/voiceManager';
// import axiosInstance from './api/axiosInstance';

// // WebRTC Context 생성
// const WebRTCContext = createContext();

// // 재연결 그레이스 상수 (ms)
// const RECONNECT_GRACE_MS = 20000; // 20초

// export const useWebRTC = () => {
//   const context = useContext(WebRTCContext);
//   if (!context) {
//     throw new Error('useWebRTC must be used within a WebRTCProvider');
//   }
//   return context;
// };

// const WebRTCProvider = ({ children }) => {
//   // 🔧 디버깅용 Provider ID를 맨 위로 이동
//   const [providerId] = useState(() => {
//     const id = Math.random().toString(36).substr(2, 6);
//     console.log(`🔧 WebRTCProvider ID: ${id}`);
//     return id;
//   });

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
//   const [myRoleId, setMyRoleId] = useState(null);
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

//   // 🔧 연결 추적 (Role 기반으로 추적, User ID로 실제 연결)
//   const offerSentToRoles = useRef(new Set()); // 내가 Offer를 보낸 역할들
//   const offerReceivedFromRoles = useRef(new Set()); // 내가 Offer를 받은 역할들

//   // 🔧 ICE Candidate 큐 (원격 SDP 설정 전까지 임시 저장)
//   const pendingCandidates = useRef(new Map()); // userId -> candidates[]

//   // 최상단 상태들 아래에 추가
//   const myPeerIdRef = useRef(null);
//   useEffect(() => {
//     const uid = localStorage.getItem('user_id');
//     if (uid) myPeerIdRef.current = String(uid);  // peer_id = user_id
//   }, []);

//   // 파일 상단 상태 선언부 근처
//   const pcsRef = useRef(new Map()); // peerId -> RTCPeerConnection

//   function getOrCreatePC(remotePeerId) {
//     if (pcsRef.current.has(remotePeerId)) return pcsRef.current.get(remotePeerId);

//     const config = {
//       iceServers: [
//         { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
//       ],
//     };
    
//     const pc = new RTCPeerConnection(config);
    
//     pc.ontrack = (e) => {
//       const audio = document.createElement('audio');
//       audio.autoplay = true;
//       audio.playsInline = true;
//       audio.srcObject = e.streams[0];
//       audio.setAttribute('data-user-id', remotePeerId);
//       document.body.appendChild(audio);
//       // 일부 브라우저용
//       audio.play().catch(()=>{ /* 첫 사용자 제스처 후 재시도 */ });
//     };
    
//     pc.onicecandidate = (e) => {
//       if (!e.candidate) return;
//       const ws = signalingWsRef.current;
//       if (ws && ws.readyState === WebSocket.OPEN) {
//         console.log('📤 [signaling] send candidate →', remotePeerId, e.candidate);
//         ws.send(JSON.stringify({
//           type: 'candidate',
//           from: SELF(),
//           to: remotePeerId,
//           candidate: e.candidate,
//         }));
//       }
//     };

//     pc.onconnectionstatechange = () => {
//       console.log(`PC(${remotePeerId}) connectionState=`, pc.connectionState);
//       if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
//         // 필요시 정리
//       }
//     };

//     pcsRef.current.set(remotePeerId, pc);
//     setPeerConnections(new Map(pcsRef.current));

//     return pc;
//   }
//   const createPeerConnection = (...args) => getOrCreatePC(...args);

//   async function createOfferTo(remotePeerId) {
//     const pc = getOrCreatePC(remotePeerId);

//     // 로컬 오디오 트랙 추가
//     let stream = voiceManager.mediaStream;
//     if (!stream) {
//       await voiceManager.initializeVoiceSession(); // 내부에서 session_id 체크 및 초기화 시도
//       stream = voiceManager.mediaStream;
//     }
//     if (stream) {
//       // 같은 트랙 중복 추가 방지
//       const hasAudio = pc.getSenders().some(s => s.track && s.track.kind === 'audio');
//       if (!hasAudio) {
//         stream.getTracks().forEach(t => pc.addTrack(t, stream));
//       }
//     }

//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);

//     const ws = signalingWsRef.current;
//     if (ws && ws.readyState === WebSocket.OPEN) {
//       console.log('📤 [signaling] send offer →', remotePeerId);
//       ws.send(JSON.stringify({
//         type: 'offer',
//         from:SELF(),
//         to: remotePeerId,
//         sdp: offer.sdp,
//       }));
//     } else {
//       console.warn('⚠️ [signaling] offer not sent (ws not open)');
//     }
//   }

//   // 🔧 상태 동기화 useEffect - 의존성 배열 수정
//   useEffect(() => {
//     const syncStateFromLocalStorage = () => {
//       const storedUserId = localStorage.getItem('user_id');
//       const storedRoleId = localStorage.getItem('myrole_id');
      
//       if (storedUserId && !myUserId) {
//         console.log(`🔄 [${providerId}] myUserId 동기화: ${storedUserId}`);
//         setMyUserId(storedUserId);
//       }
      
//       if (storedRoleId && !myRoleId) {
//         const roleIdNum = parseInt(storedRoleId);
//         console.log(`🔄 [${providerId}] myRoleId 동기화: ${roleIdNum}`);
//         setMyRoleId(roleIdNum);
//       }
      
//       // 역할 매핑도 동기화
//       const mapping = {
//         role1_user_id: localStorage.getItem('role1_user_id'),
//         role2_user_id: localStorage.getItem('role2_user_id'),
//         role3_user_id: localStorage.getItem('role3_user_id'),
//       };
      
//       const hasMapping = Object.values(mapping).some(id => id);
//       const hasCurrentMapping = Object.values(roleUserMapping).some(id => id);
      
//       if (hasMapping && !hasCurrentMapping) {
//         console.log(`🔄 [${providerId}] 역할 매핑 동기화:`, mapping);
//         setRoleUserMapping(mapping);
//       }
//     };

//     syncStateFromLocalStorage();
//     const syncInterval = setInterval(syncStateFromLocalStorage, 1000);
//     return () => clearInterval(syncInterval);
//   }, [myUserId, myRoleId, providerId]);

//   // 🔧 유틸리티 함수들
//   const getUserIdByRole = useCallback((roleId) => {
//     return roleUserMapping[`role${roleId}_user_id`];
//   }, [roleUserMapping]);

//   const getRoleIdByUserId = useCallback((userId) => {
//     for (let roleId = 1; roleId <= 3; roleId++) {
//       if (roleUserMapping[`role${roleId}_user_id`] === userId) {
//         return roleId;
//       }
//     }
//     return null;
//   }, [roleUserMapping]);

//   const SELF = () => String(myPeerIdRef.current || localStorage.getItem('user_id'));

//   // ----------------------------
//   // 시그널링 WebSocket 연결
//   // ----------------------------
//   const connectSignalingWebSocket = useCallback(() => {
//     if (connectionAttemptedRef.current) {
//       console.log(`⚠️ [${providerId}] WebSocket 연결이 이미 시도됨, 중복 방지`);
//       return;
//     }

//     try {
//       const roomCode = localStorage.getItem('room_code');
//       const token = localStorage.getItem('access_token');
      
//       if (!roomCode || !token) {
//         console.error(`❌ [${providerId}] room_code 또는 token이 없습니다`, { roomCode, token: !!token });
//         return;
//       }

//       connectionAttemptedRef.current = true;

//       const urlsToTry = [
//         `wss://dilemmai-idl.com/ws/signaling?room_code=${roomCode}&token=${token}`,
//       ];
      
//       console.log(`🔌 [${providerId}] 시그널링 WebSocket 연결 시작 (User 토큰 기반)`);

//       const tryConnection = (urlIndex = 0) => {
//         if (urlIndex >= urlsToTry.length) {
//           console.error(`❌ [${providerId}] 모든 WebSocket URL 시도 실패`);
//           connectionAttemptedRef.current = false;
//           return;
//         }
        
//         const currentUrl = urlsToTry[urlIndex];
//         console.log(`🔗 [${providerId}] URL ${urlIndex + 1}/${urlsToTry.length} 시도:`, currentUrl);
        
//         const ws = new WebSocket(currentUrl);
        
//         const connectionTimeout = setTimeout(() => {
//           if (ws.readyState === WebSocket.CONNECTING) {
//             console.log(`⏰ [${providerId}] URL ${urlIndex + 1} 연결 타임아웃 (3초 초과)`);
//             ws.close();
//             tryConnection(urlIndex + 1);
//           }
//         }, 3000);
//         ws.onopen = () => {
//           clearTimeout(connectionTimeout);
//           console.log(`✅ [${providerId}] WebSocket 연결 성공 (signaling)`);
//           setSignalingConnected(true);
//           signalingWsRef.current = ws;

//           const pid = myPeerIdRef.current || localStorage.getItem('user_id');
//           console.log('[signaling] send join:', { peer_id: String(pid) });
//           ws.send(JSON.stringify({ type: 'join', peer_id: String(pid) }));
//         };

//         ws.onmessage = async (event) => {
//           try {
//             const msg = JSON.parse(event.data);
//             console.log('📨 signaling:', msg);

//             const toId = msg.to ? String(msg.to) : null;
//             if (toId && toId !== SELF()) return;

//             const fromId = String(msg.from ?? msg.peer_id ?? msg.sender ?? msg.user_id ?? '');

//             if (msg.type === 'peers' && Array.isArray(msg.peers)) {
//               console.log('👥 [signaling] peers list:', msg.peers);
//               for (const otherId of msg.peers) {
//                 if (!otherId || otherId === myPeerIdRef.current) continue;
//                 await createOfferTo(String(otherId));
//               }
//               return;
//             }

//             if ((msg.type === 'join' || msg.type === 'joined') && msg.peer_id) {
//               const otherId = String(msg.peer_id);
//               if (otherId !== myPeerIdRef.current) {
//                 await createOfferTo(otherId);
//               }
//               return;
//             }

//             if (msg.type === 'peer_left' && msg.peer_id) {
//               const otherId = String(msg.peer_id);
//               const pc = pcsRef.current.get(otherId);
//               if (pc) {
//                 try { pc.close(); } catch {}
//                 pcsRef.current.delete(otherId);
//                 setPeerConnections(new Map(pcsRef.current));
//               }
//               const audio = document.querySelector(`audio[data-user-id="${otherId}"]`);
//               if (audio) audio.remove();
//               return;
//             }

//             if (msg.type === 'offer' && fromId) {
//               console.log('🟢 [signaling] offer from:', msg.from);
//               const pc = getOrCreatePC(fromId);
//               await pc.setRemoteDescription({ type: 'offer', sdp: msg.sdp });

//               // 로컬 트랙이 없다면 추가
//               let stream = voiceManager.mediaStream;
//               if (!stream) {
//                 await voiceManager.initializeVoiceSession();
//                 stream = voiceManager.mediaStream;
//               }
//               if (stream) {
//                 const hasAudio = pc.getSenders().some(s => s.track && s.track.kind === 'audio');
//                 if (!hasAudio) {
//                   stream.getTracks().forEach(t => pc.addTrack(t, stream));
//                 }
//               }

//               const answer = await pc.createAnswer();
//               await pc.setLocalDescription(answer);
//               ws.send(JSON.stringify({
//                 type: 'answer',
//                 to: fromId,
//                 from:SELF(),
//                 sdp: answer.sdp,
//               }));
//               return;
//             }

//             if (msg.type === 'answer' && fromId) {
//               console.log('🟢 [signaling] answer from:', msg.from);
//               const pc = getOrCreatePC(fromId);
//               await pc.setRemoteDescription({ type: 'answer', sdp: msg.sdp });
//               return;
//             }

//             if (msg.type === 'candidate' && fromId) {
//               console.log('🟢 [signaling] candidate from:', msg.from, msg.candidate);
//               const pc = getOrCreatePC(fromId);
//               if (msg.candidate) {
//                 try {
//                   await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
//                 } catch (e) {
//                   console.warn('addIceCandidate 실패:', e?.message);
//                 }
//               }
//               return;
//             }
//           } catch (e) {
//             console.error('❌ signaling onmessage 처리 중 오류:', e);
//           }
//         };

//         ws.onclose = (event) => {
//           clearTimeout(connectionTimeout);
//           console.log(`🔌 [${providerId}] WebSocket 연결 종료 (URL ${urlIndex + 1}):`, {
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
//           console.error(`❌ [${providerId}] WebSocket 오류 (URL ${urlIndex + 1}):`, error);
          
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
//       console.error(`❌ [${providerId}] 시그널링 WebSocket 연결 실패:`, error);
//       connectionAttemptedRef.current = false;
//     }
//   }, [providerId]);

//   // 🚨 WebRTC 스트림 완전 정리 함수 (terminateWebRTCSession)
//   const terminateWebRTCSession = useCallback(async () => {
//     console.log('🛑 WebRTC 세션 완전 종료 시작');
    
//     try {
//       console.log('🎵 VoiceManager 녹음 직접 종료...');
//       const recordingData = await voiceManager.stopRecording();
//       console.log('✅ 녹음 데이터 확보:', recordingData);
      
//       const mediaStream = voiceManager.mediaStream;
//       if (mediaStream) {
//         console.log('🎤 WebRTC 마스터 스트림 정지 중...');
//         mediaStream.getTracks().forEach(track => {
//           console.log(`🔇 트랙 정지: ${track.kind}, readyState: ${track.readyState}`);
//           if (track.readyState !== 'ended') {
//             track.stop();
//             console.log(`✅ 트랙 정지 완료: ${track.kind}`);
//           }
//         });
//         console.log('✅ 모든 스트림 트랙 정지 완료');
//       }
      
//       voiceManager.disconnectMicrophone();
      
//       console.log('🔗 PeerConnections 정리 중...');
//       peerConnections.forEach((pc, userId) => {
//         try {
//           pc.getSenders().forEach(sender => {
//             if (sender.track) {
//               console.log(`🔇 PeerConnection 송신 트랙 정지: User ${userId}`);
//               sender.track.stop();
//             }
//           });
//           pc.close();
//           console.log(`✅ PeerConnection 닫음: User ${userId}`);
//         } catch (error) {
//           console.warn(`⚠️ PeerConnection 정리 실패: User ${userId}`, error);
//         }
//       });
      
//       setPeerConnections(new Map());
      
//       if (signalingWsRef.current) {
//         console.log('🔌 시그널링 WebSocket 연결 해제');
//         signalingWsRef.current.close();
//         signalingWsRef.current = null;
//         setSignalingConnected(false);
//       }
      
//       const audioElements = document.querySelectorAll('audio[data-user-id]');
//       audioElements.forEach(audio => {
//         audio.remove();
//         console.log('🗑️ 원격 오디오 요소 제거됨');
//       });
      
//       let uploadResult = null;
//       if (recordingData?.blob && recordingData.blob.size > 0) {
//         console.log('📤 서버 업로드 시작 (스트림 정리 완료 후)...');
//         try {
//           uploadResult = await voiceManager.uploadRecordingToServer(recordingData);
//           console.log('✅ 업로드 완료');
//         } catch (e) {
//           console.error('❌ 업로드 중 예외:', e);
//         }
//       }
      
//       try {
//         await voiceManager.leaveSession();
//         console.log('✅ 세션 나가기 완료');
//       } catch (sessionError) {
//         console.error('❌ 세션 나가기 실패:', sessionError);
//       }
//       pcsRef.current.forEach(pc => { try{ pc.close(); }catch{} });
//       pcsRef.current.clear();
//       setPeerConnections(new Map());
  
//       // VoiceManager 상태 초기화
//       voiceManager.sessionId = null;
//       voiceManager.nickname = null;
//       voiceManager.participantId = null;
//       voiceManager.sessionInitialized = false;
//       voiceManager.recordingStartTime = null;
//       voiceManager.usingWebRTCStream = false;
//       voiceManager.mediaStream = null;
      
//       // WebRTC 상태 초기화
//       setIsInitialized(false);
//       setVoiceSessionStatus({
//         isConnected: false,
//         isSpeaking: false,
//         sessionId: null,
//         nickname: null,
//         participantId: null,
//         micLevel: 0,
//         speakingThreshold: 30
//       });
      
//       console.log('✅ WebRTC 세션 완전 종료 완료');
//       return { recordingData, uploadResult };
      
//     } catch (error) {
//       console.error('❌ WebRTC 세션 종료 중 오류:', error);
//       return false;
//     }
//   }, [peerConnections]);

//   // ----------------------------
//   // WebRTC 초기화 함수
//   // ----------------------------
//   const saveRoleUserMapping = useCallback(async () => {
//     try {
//       const roomCode = localStorage.getItem('room_code');
//       if (!roomCode) {
//         console.log(`[${providerId}] room_code가 없어서 역할 매핑 스킵`);
//         return null;
//       }

//       const { data: room } = await axiosInstance.get(`/rooms/code/${roomCode}`);
      
//       console.log(`🎭 [${providerId}] 역할별 사용자 매핑 저장:`, room.participants);
      
//       const mapping = {
//         role1_user_id: null,
//         role2_user_id: null,
//         role3_user_id: null,
//       };
      
//       let currentUserRoleId = null;
//       const currentUserId = localStorage.getItem('user_id');
      
//       room.participants.forEach(participant => {
//         const roleId = participant.role_id;
//         const userId = participant.user_id;
        
//         if (roleId) {
//           localStorage.setItem(`role${roleId}_user_id`, String(userId));
//           mapping[`role${roleId}_user_id`] = String(userId);
//           console.log(`📝 [${providerId}] Role ${roleId} → User ${userId} 매핑 저장`);
          
//           if (String(userId) === currentUserId) {
//             currentUserRoleId = roleId;
//             localStorage.setItem('myrole_id', String(roleId));
//             console.log(`👤 [${providerId}] 내 역할 확인: User ${userId} = Role ${roleId}`);
//           }
//         }
//       });
      
//       setRoleUserMapping(mapping);
//       setMyRoleId(currentUserRoleId);
      
//       console.log(`📋 [${providerId}] 연결 계획 (Role ${currentUserRoleId} 기준):`);
//       if (currentUserRoleId === 1) {
//         console.log(`  Role 1: Offer 전송 안함, Answer만`);
//       } else if (currentUserRoleId === 2) {
//         console.log(`  Role 2: Role 1에게만 Offer 전송`);
//       } else if (currentUserRoleId === 3) {
//         console.log(`  Role 3: Role 1, 2에게 Offer 전송`);
//       }
      
//       // 음성 세션 생성/조회
//       try {
//         const nickname = localStorage.getItem('nickname') || "사용자";
//         const { data: voiceSession } = await axiosInstance.post('/voice/sessions', {
//           room_code: roomCode,
//           nickname: nickname
//         });
//         console.log(`🎤 [${providerId}] 음성 세션 생성/조회 성공:`, voiceSession.session_id);
//         localStorage.setItem('session_id', voiceSession.session_id);
//       } catch (sessionError) {
//         console.error(`❌ [${providerId}] 음성 세션 생성 실패:`, sessionError);
//       }
      
//       return mapping;
      
//     } catch (error) {
//       console.error(`❌ [${providerId}] 역할별 사용자 매핑 저장 실패:`, error);
//       return null;
//     }
//   }, [providerId]);

//   const initializeWebRTC = useCallback(async () => {
//     if (initializationPromiseRef.current) {
//       return initializationPromiseRef.current;
//     }

//     initializationPromiseRef.current = (async () => {
//       try {
//         console.log(`🚀 [${providerId}] WebRTC 초기화 시작`);
        
//         // 1. 사용자 ID 확인/설정
//         let userId = localStorage.getItem('user_id');
//         if (!userId) {
//           const response = await axiosInstance.get('/users/me');
//           userId = String(response.data.id);
//           localStorage.setItem('user_id', userId);
//         }
//         setMyUserId(userId);
        
//         // 2. 역할별 사용자 매핑 저장
//         const mapping = await saveRoleUserMapping();
//         if (!mapping) {
//           console.error(`❌ [${providerId}] 역할 매핑 실패`);
//           return false;
//         }
        
//         // 3. WebRTC에서 마스터 스트림 생성 (getUserMedia)
//         console.log('🎤 WebRTC에서 마스터 스트림 생성...');
//         const masterStream = await navigator.mediaDevices.getUserMedia({
//           audio: {
//             echoCancellation: true,
//             noiseSuppression: true,
//             autoGainControl: true,
//             sampleRate: 44100
//           }
//         });
//         console.log('✅ WebRTC 마스터 스트림 생성 완료:', masterStream.id);
        
//         // 4. VoiceManager에 스트림 전달하여 초기화
//         console.log('🔗 VoiceManager에 스트림 전달...');
//         const voiceSuccess = await voiceManager.initializeVoiceSession(masterStream);
//         if (!voiceSuccess) {
//           console.error(`❌ [${providerId}] 음성 세션 초기화 실패`);
//           return false;
//         }
        
//         // 5. WebSocket 연결 (signaling)
//         connectSignalingWebSocket();
        
//         // 6. 상태 업데이트 주기적 확인
//         const statusInterval = setInterval(() => {
//           const currentStatus = voiceManager.getStatus();
//           setVoiceSessionStatus(currentStatus);
//         }, 100);
        
//         setIsInitialized(true);
//         console.log(`✅ [${providerId}] WebRTC 초기화 완료`);
        
//         return () => {
//           clearInterval(statusInterval);
//         };
        
//       } catch (error) {
//         console.error(`❌ [${providerId}] WebRTC 초기화 중 오류:`, error);
//         initializationPromiseRef.current = null;
//         return false;
//       }
//     })();

//     return initializationPromiseRef.current;
//   }, [saveRoleUserMapping, connectSignalingWebSocket, providerId]);

//   // ----------------------------
//   // 새로고침(리로딩) 감지 + 자동 재연결(그레이스)
//   // ----------------------------
//   const setReloadingFlagForGrace = useCallback(() => {
//     try {
//       sessionStorage.setItem('reloading', 'true');
//       const expireAt = Date.now() + RECONNECT_GRACE_MS;
//       sessionStorage.setItem('reloading_expire_at', String(expireAt));
//       console.log(`♻️ [reloading] set (expireAt=${expireAt})`);
//     } catch (e) {
//       // ignore
//     }
//   }, []);

//   const clearReloadingFlag = useCallback(() => {
//     try {
//       sessionStorage.removeItem('reloading');
//       sessionStorage.removeItem('reloading_expire_at');
//       console.log('♻️ [reloading] cleared');
//     } catch (e) {}
//   }, []);

//   const isReloadingGraceLocal = useCallback(() => {
//     try {
//       const flag = sessionStorage.getItem('reloading') === 'true';
//       const expire = parseInt(sessionStorage.getItem('reloading_expire_at') || '0', 10);
//       if (!flag) return false;
//       if (Date.now() > expire) {
//         clearReloadingFlag();
//         return false;
//       }
//       return true;
//     } catch (e) {
//       return false;
//     }
//   }, [clearReloadingFlag]);

//   // beforeunload에서 reloading 플래그 설정
//   useEffect(() => {
//     const handleBeforeUnload = () => {
//       setReloadingFlagForGrace();
//     };

//     const handleLoadCleanup = () => {
//       const expire = parseInt(sessionStorage.getItem('reloading_expire_at') || '0', 10);
//       if (!expire || Date.now() > expire) {
//         clearReloadingFlag();
//       }
//     };

//     handleLoadCleanup();
//     window.addEventListener('beforeunload', handleBeforeUnload);
//     window.addEventListener('load', handleLoadCleanup);

//     return () => {
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//       window.removeEventListener('load', handleLoadCleanup);
//     };
//   }, [setReloadingFlagForGrace, clearReloadingFlag]);

//   // 마운트 시: reloading flag가 있으면 일정 시간 동안 initializeWebRTC 시도
//   useEffect(() => {
//     let canceled = false;
//     const attemptAutoReconnect = async () => {
//       const roomCode = localStorage.getItem('room_code');
//       const nickname = localStorage.getItem('nickname');
//       if (!(roomCode && nickname)) return;

//       if (!isReloadingGraceLocal()) return;

//       console.log(`♻️ [${providerId}] 페이지 새로고침 감지 — WebRTC 자동 재연결 시도 (grace)`);
//       const MAX_WAIT_MS = RECONNECT_GRACE_MS;
//       const RETRY_INTERVAL_MS = 2000;
//       const startAt = Date.now();
//       let lastError = null;

//       while (!canceled && (Date.now() - startAt < MAX_WAIT_MS)) {
//         if (!isReloadingGraceLocal()) {
//           console.log(`♻️ [${providerId}] reloading 플래그가 사라짐 — 재연결 중단`);
//           return;
//         }

//         try {
//           console.log(`🔄 [${providerId}] 자동 재연결 시도 (elapsed ${Date.now() - startAt}ms)`);
//           const res = await initializeWebRTC();
//           // initializeWebRTC returns truthy if succeeded (or a cleanup function). treat non-false as success.
//           if (res) {
//             console.log(`✅ [${providerId}] WebRTC 자동 재연결 성공`);
//             clearReloadingFlag();
//             return;
//           } else {
//             throw new Error('initializeWebRTC 실패');
//           }
//         } catch (err) {
//           lastError = err;
//           console.warn(`⚠️ [${providerId}] 자동 재연결 실패:`, err?.message || err);
//         }

//         const timeLeft = MAX_WAIT_MS - (Date.now() - startAt);
//         if (timeLeft <= 0) break;
//         await new Promise(resolve => setTimeout(resolve, Math.min(RETRY_INTERVAL_MS, timeLeft)));
//       }

//       console.error(`🚫 [${providerId}] 자동 재연결 제한 시간(${RECONNECT_GRACE_MS}ms) 초과`);
//       if (lastError) console.error('마지막 에러:', lastError);
//     };

//     attemptAutoReconnect();

//     return () => { canceled = true; };
//   }, [initializeWebRTC, providerId, isReloadingGraceLocal, clearReloadingFlag]);

//   // window.terminateWebRTCSession export
//   useEffect(() => {
//     window.terminateWebRTCSession = terminateWebRTCSession;
//     return () => { delete window.terminateWebRTCSession; };
//   }, [terminateWebRTCSession]);

//   // stopAllOutgoingAudioGlobal
//   function stopAllOutgoingAudio() {
//     try {
//       pcsRef.current.forEach(pc => {
//         pc.getSenders().forEach(s => {
//           if (s.track && s.track.kind === 'audio' && s.track.readyState !== 'ended') {
//             try { s.replaceTrack(null); } catch {}
//             try { s.track.stop(); } catch {}
//           }
//         });
//         try { pc.close(); } catch {}
//       });
//     } catch (e) { console.warn(e); }

//     console.log('🛑 WebRTC outgoing audio & PCs stopped');
//   }

//   useEffect(() => {
//     window.stopAllOutgoingAudioGlobal = stopAllOutgoingAudio;
//     return () => { delete window.stopAllOutgoingAudioGlobal; };
//   }, []);

//   // P2P 연결 시작 useEffect
//   const startPeerConnections = useCallback(() => {
//     console.log('ℹ️ startPeerConnections: 역할 기반 수동 연결은 불필요 (from/to 시그널링 적용 완료)');
//   }, []);

//   // debugPeerConnections
//   const debugPeerConnections = useCallback(() => {
//     console.log(`🔍 [${providerId}] === PeerConnection 상태 전체 리포트 ===`);
//     peerConnections.forEach((pc, userId) => {
//       const roleId = getRoleIdByUserId(userId);
//       console.log(`\n👤 User ${userId} (Role ${roleId}):`);
//       console.log(`  - Connection State: ${pc.connectionState}`);
//       console.log(`  - ICE Connection State: ${pc.iceConnectionState}`);
//       console.log(`  - Signaling State: ${pc.signalingState}`);
//       console.log(`  - Local Description: ${pc.localDescription?.type || 'null'}`);
//       console.log(`  - Remote Description: ${pc.remoteDescription?.type || 'null'}`);
//       console.log(`  - ICE Gathering State: ${pc.iceGatheringState}`);
//     });
//     console.log(`\n📋 [${providerId}] 역할 매핑:`, roleUserMapping);
//     console.log(`👤 [${providerId}] 내 정보: User ${myUserId}, Role ${myRoleId}`);
//     console.log(`📤 [${providerId}] 보낸 Offer (Role):`, Array.from(offerSentToRoles.current));
//     console.log(`📥 [${providerId}] 받은 Offer (Role):`, Array.from(offerReceivedFromRoles.current));
//     console.log(`📦 [${providerId}] 대기 중인 Candidates:`, Object.fromEntries(pendingCandidates.current));
//     const voiceStatus = voiceManager.getStatus();
//     console.log(`\n🎤 [${providerId}] 음성 상태:`, voiceStatus);
//     console.log(`🔊 [${providerId}] 미디어 스트림:`, voiceManager.mediaStream ? 'AVAILABLE' : 'NULL');
//     if (voiceManager.mediaStream) {
//       console.log(`🎵 [${providerId}] 트랙 수:`, voiceManager.mediaStream.getTracks().length);
//       voiceManager.mediaStream.getTracks().forEach((track, index) => {
//         console.log(`  Track ${index}: ${track.kind}, enabled: ${track.enabled}, readyState: ${track.readyState}`);
//       });
//     }
//   }, [peerConnections, getRoleIdByUserId, roleUserMapping, myUserId, myRoleId, providerId]);

//   // P2P 연결 트리거
//   useEffect(() => {
//     const hasRoleId = myRoleId !== null;
//     const hasMapping = Object.values(roleUserMapping).some(id => id);
    
//     if (signalingConnected && hasRoleId && hasMapping) {
//       console.log(`🚀 [${providerId}] 시그널링 연결 완료, P2P 연결 시작`);
//       const timeoutId = setTimeout(() => { startPeerConnections(); }, 1000);
//       return () => clearTimeout(timeoutId);
//     }
//   }, [signalingConnected, myRoleId, startPeerConnections, providerId]);

//   // debug window object
//   useEffect(() => {
//     window.debugWebRTC = {
//       getStatus: () => ({
//         peerConnections: peerConnections.size,
//         signalingConnected,
//         myUserId,
//         myRoleId,
//         roleUserMapping,
//         pendingCandidates: pendingCandidates.current.size
//       }),
//       debugConnections: debugPeerConnections,
//       testConnection: (targetUserId) => {
//         const pc = peerConnections.get(targetUserId);
//         if (pc) {
//           console.log(`🔍 User ${targetUserId} 연결 테스트:`, {
//             connectionState: pc.connectionState,
//             iceConnectionState: pc.iceConnectionState,
//             signalingState: pc.signalingState
//           });
//         } else {
//           console.log(`❌ User ${targetUserId}에 대한 PeerConnection이 없음`);
//         }
//       },
//       processPendingCandidates: (userId) => {
//         const pc = peerConnections.get(userId);
//         const candidates = pendingCandidates.current.get(userId);
//         if (pc && candidates) {
//           console.log(`🔄 강제 ICE candidate 처리: User ${userId}, ${candidates.length}개`);
//           candidates.forEach(async (candidate) => {
//             try {
//               await pc.addIceCandidate(new RTCIceCandidate(candidate));
//               console.log(` 강제 ICE candidate 추가 완료`);
//             } catch (error) {
//               console.warn(` 강제 ICE candidate 추가 실패:`, error.message);
//             }
//           });
//           pendingCandidates.current.delete(userId);
//         }
//       }
//     };
//     return () => { delete window.debugWebRTC; };
//   }, [signalingConnected, myUserId, myRoleId]);

//   // 정리 useEffect (언마운트)
//   useEffect(() => {
//     return () => {
//       console.log(`🧹 [${providerId}] WebRTC Provider 정리 시작`);
//       peerConnections.forEach(pc => { pc.close(); });
//       if (signalingWsRef.current) {
//         signalingWsRef.current.close();
//         signalingWsRef.current = null;
//       }
//       const audioElements = document.querySelectorAll('audio[data-user-id]');
//       audioElements.forEach(audio => { audio.remove(); });
//       offerSentToRoles.current.clear();
//       offerReceivedFromRoles.current.clear();
//       pendingCandidates.current.clear();
//       console.log(`✅ [${providerId}] WebRTC Provider 정리 완료`);
//     };
//   }, []); // 마운트 시 한 번
// // ----------------------------
// // 디버그 유틸리티
// // ----------------------------
// useEffect(() => {
//   window.debugWebRTCConnections = {
//     // 전체 연결 요약
//     summary: () => {
//       console.log('=== WebRTC PeerConnection 요약 ===');
//       console.log(`총 PeerConnections: ${peerConnections.size}`);
//       peerConnections.forEach((pc, userId) => {
//         console.log(`User ${userId}: connectionState=${pc.connectionState}, iceConnectionState=${pc.iceConnectionState}`);
//       });
//     },

//     // 각 PeerConnection별 상세 상태
//     details: () => {
//       console.log('=== WebRTC PeerConnection 상세 상태 ===');
//       peerConnections.forEach((pc, userId) => {
//         console.log(`\nUser ${userId}:`);
//         console.log(`  - Connection State: ${pc.connectionState}`);
//         console.log(`  - ICE Connection State: ${pc.iceConnectionState}`);
//         console.log(`  - Signaling State: ${pc.signalingState}`);
//         console.log(`  - Local Description: ${pc.localDescription?.type || 'null'}`);
//         console.log(`  - Remote Description: ${pc.remoteDescription?.type || 'null'}`);
//         console.log(`  - ICE Gathering State: ${pc.iceGatheringState}`);
//       });
//     },

//     // 연결된 유저 ID만 간단히 보기
//     connectedUsers: () => {
//       const users = [];
//       peerConnections.forEach((pc, userId) => {
//         if (pc.connectionState === 'connected') users.push(userId);
//       });
//       console.log('✅ 연결된 유저 ID:', users);
//       console.log('총 연결 수:', users.length);
//       return users;
//     },

//     // 현재 로컬 트랙 상태 확인
//     localTracks: () => {
//       const stream = voiceManager.mediaStream;
//       if (!stream) return console.log('❌ 로컬 미디어 스트림 없음');
//       console.log('=== 로컬 트랙 상태 ===');
//       stream.getTracks().forEach((track, idx) => {
//         console.log(`Track ${idx}: kind=${track.kind}, enabled=${track.enabled}, readyState=${track.readyState}`);
//       });
//     }
//   };

//   return () => { delete window.debugWebRTCConnections; };
// }, [peerConnections]);

//   // Context 값
//   const contextValue = {
//     isInitialized,
//     signalingConnected,
//     peerConnections,
//     roleUserMapping,
//     myUserId,
//     myRoleId,
//     voiceSessionStatus,
//     terminateWebRTCSession,
//     initializeWebRTC,
//     startPeerConnections,
//     debugPeerConnections,
//     adjustThreshold: (delta) => {
//       const newThreshold = Math.max(10, Math.min(100, voiceSessionStatus.speakingThreshold + delta));
//       voiceManager.setSpeakingThreshold(newThreshold);
//     },
//     toggleMic: () => voiceManager.toggleMic?.(),
//     getMicLevel: () => voiceSessionStatus.micLevel,
//     isSpeaking: () => voiceSessionStatus.isSpeaking,
//     getUserIdByRole,
//     getRoleIdByUserId,
//   };

//   return (
//     <WebRTCContext.Provider value={contextValue}>
//       {children}
//     </WebRTCContext.Provider>
//   );
// };

// export default WebRTCProvider;

// // 유틸함수
// export function disconnectWebRTCVoice(peerConnectionsMap) {
//   if (!peerConnectionsMap) return;
//   const iterable = peerConnectionsMap instanceof Map 
//     ? peerConnectionsMap.values() 
//     : Object.values(peerConnectionsMap);
//   for (const pc of iterable) {
//     try {
//       pc.getSenders().forEach(s => { if (s.track?.kind === 'audio') s.track.stop(); });
//       pc.close();
//     } catch (e) { console.error(e); }
//   }
// }
// WebRTCProvider.jsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import voiceManager from './utils/voiceManager';
import axiosInstance, { ensureFreshAccessToken } from './api/axiosInstance';

// ----------------------------
// ICE(STUN/TURN) 설정
// - 기본: STUN만으로도 되는 환경이 많지만, 일부 NAT/회사망에서는 P2P가 실패함
// - 권장: 백엔드에서 `/webrtc/ice-config`로 ICE 설정을 받아오면(Twilio TURN 포함) 특수 환경에서도 연결 성공률이 올라감
// - fallback: 백엔드 호출이 실패하면 Vite env 또는 기본 STUN으로 내려감
//
// Vite env 예시:
//   VITE_STUN_URLS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302
//   VITE_TURN_URLS=turn:turn.example.com:3478?transport=udp,turn:turn.example.com:3478?transport=tcp,turns:turn.example.com:5349
//   VITE_TURN_USERNAME=...
//   VITE_TURN_CREDENTIAL=...
// ----------------------------
const DEFAULT_STUN_URLS = ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'];

function getIceServersFromEnv() {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
  const rawStunUrls = env.VITE_STUN_URLS;
  const rawTurnUrls = env.VITE_TURN_URLS;
  const turnUsername = env.VITE_TURN_USERNAME;
  const turnCredential = env.VITE_TURN_CREDENTIAL;

  const stunUrls = rawStunUrls
    ? String(rawStunUrls).split(',').map((s) => s.trim()).filter(Boolean)
    : DEFAULT_STUN_URLS;

  const iceServers = [{ urls: (stunUrls.length > 0 ? stunUrls : DEFAULT_STUN_URLS) }];

  // TURN이 설정된 경우에만 추가
  if (rawTurnUrls && turnUsername && turnCredential) {
    const urls = String(rawTurnUrls)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (urls.length > 0) {
      iceServers.push({
        urls,
        username: String(turnUsername),
        credential: String(turnCredential),
      });
    }
  }

  return iceServers;
}

function parseCandidateType(candidate) {
  try {
    if (!candidate) return null;
    // Chrome 등 일부 환경은 candidate.type을 제공하지만, 표준적으로는 candidate.candidate 문자열에 typ 정보가 있음
    if (candidate.type) return String(candidate.type);
    const candStr = String(candidate.candidate || '');
    const m = candStr.match(/\btyp\s+(\w+)\b/i);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

function normalizeIceServers(iceServers) {
  if (!Array.isArray(iceServers)) return null;
  const normalized = [];
  for (const s of iceServers) {
    if (!s) continue;
    const urls = s.urls;
    if (!urls) continue;
    const entry = { urls };
    if (s.username) entry.username = s.username;
    if (s.credential) entry.credential = s.credential;
    normalized.push(entry);
  }
  return normalized.length > 0 ? normalized : null;
}

function maskCredential(cred) {
  try {
    if (cred == null) return cred;
    const s = String(cred);
    if (s.length <= 6) return '******';
    return `${s.slice(0, 3)}***${s.slice(-2)}`;
  } catch {
    return '***';
  }
}

function maskIceServersForLog(iceServers) {
  try {
    if (!Array.isArray(iceServers)) return iceServers;
    return iceServers.map((s) => ({
      urls: s?.urls,
      username: s?.username,
      credential: s?.credential ? maskCredential(s.credential) : undefined,
    }));
  } catch {
    return iceServers;
  }
}

// WebRTC Context 생성
const WebRTCContext = createContext();

/**
 *  시그널링용 웹소켓 베이스 주소를 환경변수에서 가져옵니다.
 */
const WS_BASE = import.meta.env.VITE_WS_BASE_URL || 'wss://dilemmai-idl.com';

// 재연결 그레이스 상수 (ms)
const RECONNECT_GRACE_MS = 20000; // 20초

export const useWebRTC = () => {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error('useWebRTC must be used within a WebRTCProvider');
  }
  return context;
};

const WebRTCProvider = ({ children }) => {
  // 🔧 디버깅용 Provider ID를 맨 위로 이동
  const [providerId] = useState(() => {
    const id = Math.random().toString(36).substr(2, 6);
    console.log(`🔧 WebRTCProvider ID: ${id}`);
    return id;
  });

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

  const location = useLocation();

  // WebSocket 참조
  const signalingWsRef = useRef(null);
  const connectionAttemptedRef = useRef(false);
  const initializationPromiseRef = useRef(null);
  const masterStreamRef = useRef(null); // ✅ 마이크 스트림 1회 생성 후 재사용(재시도 시 중복 생성 방지)

  // ----------------------------
  // ICE config (server → env → default STUN)
  // - Twilio TURN은 credential이 TTL을 가지므로, TTL 기준으로 갱신
  // ----------------------------
  const iceServersRef = useRef(getIceServersFromEnv());
  const iceConfigCacheRef = useRef({
    expireAt: 0,
    source: 'env',
    turnEnabled: false,
    lastError: null,
  });
  const [iceConfigStatus, setIceConfigStatus] = useState(() => ({
    source: 'env',
    turnEnabled: false,
    ttl: null,
    lastFetchedAt: null,
    lastError: null,
  }));

  const fetchIceConfigFromServer = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('access_token이 없습니다');

    // 백엔드 명세: GET /webrtc/ice-config?token={JWT}
    const res = await axiosInstance.get('/webrtc/ice-config', {
      params: { token },
      timeout: 6000,
    });

    const data = res?.data || {};
    const normalized = normalizeIceServers(data.iceServers);
    if (!normalized) {
      throw new Error('iceServers 형식이 올바르지 않습니다');
    }

    const ttlSeconds = Number.isFinite(Number(data.ttl)) ? Number(data.ttl) : 3600;
    const turnEnabled = !!data.turnEnabled;

    return { iceServers: normalized, ttlSeconds, turnEnabled };
  }, []);

  const ensureIceServersReady = useCallback(async () => {
    const now = Date.now();
    // 만료 60초 전부터는 새로 갱신
    const shouldRefresh = !(iceConfigCacheRef.current.expireAt && now < (iceConfigCacheRef.current.expireAt - 60_000));
    if (!shouldRefresh) return iceServersRef.current;

    try {
      const { iceServers, ttlSeconds, turnEnabled } = await fetchIceConfigFromServer();
      iceServersRef.current = iceServers;
      iceConfigCacheRef.current = {
        expireAt: now + Math.max(60, ttlSeconds) * 1000,
        source: 'server',
        turnEnabled,
        lastError: null,
      };
      setIceConfigStatus({
        source: 'server',
        turnEnabled,
        ttl: ttlSeconds,
        lastFetchedAt: now,
        lastError: null,
      });
      console.log('🧊 ICE config loaded from server:', { turnEnabled, ttlSeconds, iceServers });
      return iceServersRef.current;
    } catch (e) {
      const fallback = getIceServersFromEnv();
      iceServersRef.current = fallback;
      iceConfigCacheRef.current = {
        expireAt: now + 5 * 60 * 1000, // 실패 시 5분 후 재시도
        source: 'env',
        turnEnabled: false,
        lastError: e?.message || String(e),
      };
      setIceConfigStatus({
        source: 'env',
        turnEnabled: false,
        ttl: null,
        lastFetchedAt: now,
        lastError: e?.message || String(e),
      });
      console.warn('⚠️ ICE config fetch failed → fallback to env/default STUN:', e?.message || e);
      return iceServersRef.current;
    }
  }, [fetchIceConfigFromServer]);

  // 🔧 연결 추적 (Role 기반으로 추적, User ID로 실제 연결)
  const offerSentToRoles = useRef(new Set()); // 내가 Offer를 보낸 역할들
  const offerReceivedFromRoles = useRef(new Set()); // 내가 Offer를 받은 역할들

  // 🔧 ICE Candidate 큐 (원격 SDP 설정 전까지 임시 저장)
  const pendingCandidates = useRef(new Map()); // userId -> candidates[]

  // 최상단 상태들 아래에 추가
  const myPeerIdRef = useRef(null);
  useEffect(() => {
    const uid = localStorage.getItem('user_id');
    if (uid) myPeerIdRef.current = String(uid);  // peer_id = user_id
  }, []);

  // 파일 상단 상태 선언부 근처
  const pcsRef = useRef(new Map()); // peerId -> RTCPeerConnection

  // ----------------------------
  // 브라우저 자동재생 정책 대응:
  // - 일부 환경에서 audio.play()가 사용자 제스처 없이는 막힘
  // - 실패 시 로그를 남기고, 첫 클릭/터치 때 모든 원격 오디오 재생을 재시도
  // ----------------------------
  const audioUnlockListenerAddedRef = useRef(false);
  const requestAudioUnlock = useCallback(() => {
    if (audioUnlockListenerAddedRef.current) return;
    audioUnlockListenerAddedRef.current = true;

    const tryPlayAll = () => {
      // ✅ 원칙 (4): AudioContext unlock (모바일 사파리 대응)
      try {
        if (voiceManager?.audioContext?.state === 'suspended') {
          voiceManager.audioContext.resume();
          console.log('🔊 AudioContext resumed (사용자 제스처)');
        }
      } catch (e) {
        console.warn('⚠️ AudioContext resume 실패:', e?.message);
      }
      
      const audios = document.querySelectorAll('audio[data-user-id]');
      audios.forEach((a) => {
        try {
          const p = a.play?.();
          if (p && typeof p.catch === 'function') {
            p.catch(() => {});
          }
        } catch {}
      });
      window.removeEventListener('click', tryPlayAll);
      window.removeEventListener('touchstart', tryPlayAll);
      audioUnlockListenerAddedRef.current = false;
    };

    window.addEventListener('click', tryPlayAll, { once: true });
    window.addEventListener('touchstart', tryPlayAll, { once: true });
  }, []);

  // ----------------------------
  // Offer 충돌(글레어) 처리용 유틸 (Perfect Negotiation - 간소화)
  // - 서버가 peers/join을 누구에게 어떻게 브로드캐스트하든, 양쪽이 offer를 만들어도 안전하게 수락하게 함
  // - user_id가 숫자일 가능성이 높으니 숫자 비교 우선, 아니면 문자열 비교
  // ----------------------------
  function comparePeerIds(a, b) {
    const na = Number(a);
    const nb = Number(b);
    if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
    return String(a).localeCompare(String(b));
  }

  function isPoliteTo(remotePeerId) {
    const selfId = SELF();
    const otherId = String(remotePeerId);
    if (!selfId || !otherId) return true;
    // 낮은 ID를 polite로 두는 관례: 충돌 시 polite가 rollback 후 수락
    return comparePeerIds(selfId, otherId) < 0;
  }

  // peerId -> boolean
  const makingOfferRef = useRef(new Map());

  function enqueueIceCandidate(peerId, candidate) {
    const key = String(peerId);
    if (!key || !candidate) return;
    const list = pendingCandidates.current.get(key) || [];
    list.push(candidate);
    pendingCandidates.current.set(key, list);
  }

  async function flushPendingIceCandidates(peerId) {
    const key = String(peerId);
    const pc = pcsRef.current.get(key);
    const list = pendingCandidates.current.get(key);
    if (!pc || !list || list.length === 0) return;

    // remoteDescription이 있어야 addIceCandidate가 안정적으로 동작(특히 Safari)
    if (!pc.remoteDescription) return;

    console.log(`📦 flush ICE candidates → ${key} (${list.length}개)`);
    for (const c of list) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(c));
      } catch (e) {
        console.warn('flush addIceCandidate 실패:', e?.message);
      }
    }
    pendingCandidates.current.delete(key);
  }

  function getOrCreatePC(remotePeerId) {
    const key = String(remotePeerId);
    const selfId = SELF();
    if (!key) return null;
    // 절대 자기 자신과 PC를 만들지 않음 (중복/셀프 연결 방지)
    if (selfId && key === selfId) {
      console.warn('⛔️ skip create PC for SELF()', { selfId, remotePeerId: key });
      return null;
    }

    if (pcsRef.current.has(key)) return pcsRef.current.get(key);

    const config = {
      iceServers: iceServersRef.current || getIceServersFromEnv(),
      // 필요 시 TURN only로 강제하고 싶다면(디버깅용):
      // iceTransportPolicy: 'relay',
    };
    
    const pc = new RTCPeerConnection(config);
    
    pc.ontrack = (e) => {
      const audio = document.createElement('audio');
      audio.autoplay = true;
      audio.playsInline = true;
      // 일부 브라우저에서 e.streams가 비어있을 수 있음
      const stream = (e.streams && e.streams[0]) ? e.streams[0] : new MediaStream([e.track]);
      audio.srcObject = stream;
      audio.setAttribute('data-user-id', key);
      document.body.appendChild(audio);
      // 자동재생이 막히면(특히 모바일/사파리) 로그 남기고, 사용자 제스처에서 재시도
      try {
        const p = audio.play();
        if (p && typeof p.catch === 'function') {
          p.catch((err) => {
            console.warn('🔇 remote audio play blocked:', {
              remotePeerId,
              name: err?.name,
              message: err?.message,
            });
            requestAudioUnlock();
          });
        }
      } catch (err) {
        console.warn('🔇 remote audio play failed (sync):', {
          remotePeerId,
          name: err?.name,
          message: err?.message,
        });
        requestAudioUnlock();
      }
    };
    
    pc.onicecandidate = (e) => {
      if (!e.candidate) return;
      const ws = signalingWsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        const candType = parseCandidateType(e.candidate);
        console.log('📤 [signaling] send candidate →', key, { type: candType, candidate: e.candidate });
        ws.send(JSON.stringify({
          type: 'candidate',
          from: SELF(),
          to: key,
          candidate: e.candidate,
        }));
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[${providerId}] PC(${key}) connectionState=`, pc.connectionState);
  
  // ✅ 추가: 상태가 변할 때마다 리액트의 peerConnections 상태를 갱신합니다.
  // 이 코드가 있어야 GameIntro의 peerCount가 0에서 2로 올라갑니다.
      setPeerConnections(new Map(pcsRef.current));

      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
    // 필요 시 정리 로직 유지
      }
    };

    pcsRef.current.set(key, pc);
    setPeerConnections(new Map(pcsRef.current));

    return pc;
  }
  const createPeerConnection = (...args) => getOrCreatePC(...args);

  // ✅ 원칙 (3): 글레어(양쪽 동시 offer) 방지 - offer initiator 규칙
  // - 양쪽이 동시에 offer를 보내면 충돌이 잦고 연결이 불안정해짐
  // - userId 비교로 "큰 쪽만 offer 시작" 규칙을 적용해서 글레어 빈도를 확 낮춤
  function shouldInitiate(remotePeerId) {
    const myId = SELF();
    const remoteId = String(remotePeerId);
    // 숫자 비교: 같은 경우는 없어야 하지만 혹시 모르니 false 반환
    if (myId === remoteId) return false;
    // 숫자 형식이면 숫자 비교, 아니면 문자열 비교
    const myNum = parseInt(myId, 10);
    const remoteNum = parseInt(remoteId, 10);
    if (!isNaN(myNum) && !isNaN(remoteNum)) {
      return myNum > remoteNum;
    }
    return myId > remoteId;
  }

  async function createOfferTo(remotePeerId) {
    const pc = getOrCreatePC(remotePeerId);
    if (!pc) return;

    // ✅ 원칙 (4): masterStream이 없으면 offer 생성 스킵 (인자 없는 initializeVoiceSession 호출 제거)
    let stream = masterStreamRef.current || voiceManager.mediaStream;
    if (!stream) {
      console.warn('⚠️ createOfferTo: 로컬 스트림이 없어 offer 생성 스킵. initializeWebRTC를 먼저 호출하세요.');
      return;
    }
    
    // 같은 트랙 중복 추가 방지
    const hasAudio = pc.getSenders().some(s => s.track && s.track.kind === 'audio');
    if (!hasAudio) {
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
    }

    const peerKey = String(remotePeerId);
    let offer = null;
    try {
      makingOfferRef.current.set(peerKey, true);
      offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
    } catch (e) {
      console.error('❌ createOffer/setLocalDescription 실패:', {
        remotePeerId: peerKey,
        signalingState: pc.signalingState,
        message: e?.message,
      });
      return;
    } finally {
      makingOfferRef.current.set(peerKey, false);
    }

    const ws = signalingWsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('📤 [signaling] send offer →', peerKey);
      ws.send(JSON.stringify({
        type: 'offer',
        from:SELF(),
        to: peerKey,
        sdp: offer?.sdp,
      }));
    } else {
      console.warn('⚠️ [signaling] offer not sent (ws not open)');
    }
  }

  // 🔧 상태 동기화 useEffect - 의존성 배열 수정
  useEffect(() => {
    const syncStateFromLocalStorage = () => {
      const storedUserId = localStorage.getItem('user_id');
      const storedRoleId = localStorage.getItem('myrole_id');
      
      if (storedUserId && !myUserId) {
        console.log(`🔄 [${providerId}] myUserId 동기화: ${storedUserId}`);
        setMyUserId(storedUserId);
      }
      
      if (storedRoleId && !myRoleId) {
        const roleIdNum = parseInt(storedRoleId);
        console.log(`🔄 [${providerId}] myRoleId 동기화: ${roleIdNum}`);
        setMyRoleId(roleIdNum);
      }
      
      // 역할 매핑도 동기화
      const mapping = {
        role1_user_id: localStorage.getItem('role1_user_id'),
        role2_user_id: localStorage.getItem('role2_user_id'),
        role3_user_id: localStorage.getItem('role3_user_id'),
      };
      
      const hasMapping = Object.values(mapping).some(id => id);
      const hasCurrentMapping = Object.values(roleUserMapping).some(id => id);
      
      if (hasMapping && !hasCurrentMapping) {
        console.log(`🔄 [${providerId}] 역할 매핑 동기화:`, mapping);
        setRoleUserMapping(mapping);
      }
    };

    syncStateFromLocalStorage();
    const syncInterval = setInterval(syncStateFromLocalStorage, 1000);
    return () => clearInterval(syncInterval);
  }, [myUserId, myRoleId, providerId]);

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

  const SELF = () => String(myPeerIdRef.current || localStorage.getItem('user_id'));

  // ----------------------------
  // 시그널링 WebSocket 연결
  // ----------------------------
  const connectSignalingWebSocket = useCallback(async () => {
    if (connectionAttemptedRef.current) {
      console.log(`⚠️ [${providerId}] WebSocket 연결이 이미 시도됨, 중복 방지`);
      return;
    }

    try {
      const roomCode = localStorage.getItem('room_code');
      
      // ✅ WebSocket 연결 전에 토큰 만료 체크 → 필요하면 refresh
      let token = localStorage.getItem('access_token');
      try {
        token = await ensureFreshAccessToken({ skewSeconds: 60 });
        if (!token) {
          console.error(`❌ [${providerId}] 토큰 갱신 실패 또는 토큰 없음`);
          return;
        }
      } catch (e) {
        console.error(`❌ [${providerId}] 토큰 갱신 중 오류:`, e?.message || e);
        // 갱신 실패해도 기존 토큰으로 시도
        token = localStorage.getItem('access_token');
      }
      
      if (!roomCode || !token) {
        console.error(`❌ [${providerId}] room_code 또는 token이 없습니다`, { roomCode, token: !!token });
        return;
      }

      connectionAttemptedRef.current = true;

      /**
       *  하드코딩된 주소를 환경변수(VITE_WS_BASE_URL) 기반으로 변경
       */
      const urlsToTry = [
        `${WS_BASE}/ws/signaling?room_code=${roomCode}&token=${token}`,
      ];
      
      console.log(`🔌 [${providerId}] 시그널링 WebSocket 연결 시작 (User 토큰 기반)`);

      const tryConnection = (urlIndex = 0) => {
        if (urlIndex >= urlsToTry.length) {
          console.error(`❌ [${providerId}] 모든 WebSocket URL 시도 실패`);
          connectionAttemptedRef.current = false;
          return;
        }
        
        const currentUrl = urlsToTry[urlIndex];
        console.log(`🔗 [${providerId}] URL ${urlIndex + 1}/${urlsToTry.length} 시도:`, currentUrl);
        
        const ws = new WebSocket(currentUrl);
        
        const connectionTimeout = setTimeout(() => {
          if (ws.readyState === WebSocket.CONNECTING) {
            console.log(`⏰ [${providerId}] URL ${urlIndex + 1} 연결 타임아웃 (3초 초과)`);
            ws.close();
            tryConnection(urlIndex + 1);
          }
        }, 5000);
        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log(`✅ [${providerId}] WebSocket 연결 성공 (signaling)`);
          setSignalingConnected(true);
          signalingWsRef.current = ws;

          // ✅ 재연결/페이지 이동 시 중복 PC 누적 방지: 기존 연결/오디오 정리
          try {
            if (pcsRef.current.size > 0) {
              console.warn(`🧹 [${providerId}] signaling onopen: 기존 PeerConnections 정리 후 재시작 (count=${pcsRef.current.size})`);
              pcsRef.current.forEach((pc) => { try { pc.close(); } catch {} });
              pcsRef.current.clear();
              setPeerConnections(new Map());
            }
            const audioEls = document.querySelectorAll('audio[data-user-id]');
            audioEls.forEach((a) => a.remove());
          } catch {}

          const pid = myPeerIdRef.current || localStorage.getItem('user_id');
          console.log('[signaling] send join:', { peer_id: String(pid) });
          ws.send(JSON.stringify({ type: 'join', peer_id: String(pid) }));
        };

        ws.onmessage = async (event) => {
          try {
            const msg = JSON.parse(event.data);
            console.log('📨 signaling:', msg);

            const toId = msg.to ? String(msg.to) : null;
            if (toId && toId !== SELF()) return;

            const fromId = String(msg.from ?? msg.peer_id ?? msg.sender ?? msg.user_id ?? '');

            if (msg.type === 'peers' && Array.isArray(msg.peers)) {
              console.log('👥 [signaling] peers list:', msg.peers);
              for (const otherId of msg.peers) {
                if (!otherId || String(otherId) === SELF()) continue;
                // 레이스로 myPeerIdRef.current가 아직 null일 수 있으니 SELF() 기준으로 자기 자신 제외
                if (String(otherId) === SELF()) continue;
                // ✅ 원칙 (3): 글레어 방지 - userId 비교로 offer initiator 제한
                // 🚨 임시 비활성화: 연결 테스트를 위해 글레어 방지를 우선 꺼둠
                if (!shouldInitiate(String(otherId))) {
                  console.log(`⏭️ [signaling] 글레어 방지: ${SELF()} < ${otherId}, offer 스킵`);
                  continue;
                 }
                console.log(`📤 [signaling] peers → offer 생성 시작: ${SELF()} → ${otherId}`);
                await createOfferTo(String(otherId));
              }
              return;
            }

            if ((msg.type === 'join' || msg.type === 'joined') && msg.peer_id) {
              const otherId = String(msg.peer_id);
              // 레이스로 myPeerIdRef.current가 아직 null일 수 있으니 SELF() 기준으로 자기 자신 제외
              if (otherId === SELF()) return;
              // ✅ 원칙 (3): 글레어 방지 - userId 비교로 offer initiator 제한
              // 🚨 임시 비활성화: 연결 테스트를 위해 글레어 방지를 우선 꺼둠
              if (!shouldInitiate(otherId)) {
                 console.log(`⏭️ [signaling] 글레어 방지: ${SELF()} < ${otherId}, offer 스킵 (join/joined)`);
                 return;
               }
              console.log(`📤 [signaling] join/joined → offer 생성 시작: ${SELF()} → ${otherId}`);
              await createOfferTo(otherId);
              return;
            }

            if (msg.type === 'peer_left' && msg.peer_id) {
              const otherId = String(msg.peer_id);
              const pc = pcsRef.current.get(otherId);
              if (pc) {
                try { pc.close(); } catch {}
                pcsRef.current.delete(otherId);
                setPeerConnections(new Map(pcsRef.current));
              }
              const audio = document.querySelector(`audio[data-user-id="${otherId}"]`);
              if (audio) audio.remove();
              return;
            }

            if (msg.type === 'offer' && fromId) {
              console.log('🟢 [signaling] offer from:', msg.from);
              const pc = getOrCreatePC(fromId);
              if (!pc) return;

              // Perfect Negotiation(간소화): offer 충돌 처리
              const polite = isPoliteTo(fromId);
              const makingOffer = !!makingOfferRef.current.get(String(fromId));
              const offerCollision = makingOffer || pc.signalingState !== 'stable';

              if (offerCollision && !polite) {
                console.warn('🟠 offer collision → ignore (impolite)', {
                  fromId,
                  signalingState: pc.signalingState,
                  makingOffer,
                });
                return;
              }

              try {
                if (offerCollision && polite) {
                  // rollback 후 상대 offer 수락
                  try {
                    await pc.setLocalDescription({ type: 'rollback' });
                  } catch {}
                }
                await pc.setRemoteDescription({ type: 'offer', sdp: msg.sdp });
              } catch (e) {
                console.error('❌ setRemoteDescription(offer) 실패:', {
                  fromId,
                  signalingState: pc.signalingState,
                  message: e?.message,
                });
                throw e;
              }

              // Safari 등에서 candidate가 먼저 오면 큐에 쌓였다가 여기서 처리해야 함
              await flushPendingIceCandidates(fromId);

              // ✅ 원칙 (4): masterStream이 없으면 answer 생성 스킵 (인자 없는 initializeVoiceSession 호출 제거)
              let stream = masterStreamRef.current || voiceManager.mediaStream;
              if (!stream) {
                console.warn('⚠️ offer 수신: 로컬 스트림이 없어 answer 생성 스킵. initializeWebRTC를 먼저 호출하세요.');
                return;
              }
              
              const hasAudio = pc.getSenders().some(s => s.track && s.track.kind === 'audio');
              if (!hasAudio) {
                stream.getTracks().forEach(t => pc.addTrack(t, stream));
              }

              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              ws.send(JSON.stringify({
                type: 'answer',
                to: fromId,
                from:SELF(),
                sdp: answer.sdp,
              }));
              return;
            }

            if (msg.type === 'answer' && fromId) {
              console.log('🟢 [signaling] answer from:', msg.from);
              const pc = getOrCreatePC(fromId);
              if (!pc) return;
              try {
                await pc.setRemoteDescription({ type: 'answer', sdp: msg.sdp });
              } catch (e) {
                console.error('❌ setRemoteDescription(answer) 실패:', {
                  fromId,
                  signalingState: pc.signalingState,
                  message: e?.message,
                });
                throw e;
              }
              await flushPendingIceCandidates(fromId);
              return;
            }

            if (msg.type === 'candidate' && fromId) {
              console.log('🟢 [signaling] candidate from:', msg.from, msg.candidate);
              const pc = getOrCreatePC(fromId);
              if (!pc) return;
              if (msg.candidate) {
                try {
                  // remoteDescription 없으면 큐잉 (특히 Safari)
                  if (!pc.remoteDescription) {
                    enqueueIceCandidate(fromId, msg.candidate);
                    return;
                  }
                  await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
                } catch (e) {
                  // 실패한 candidate도 큐에 보관했다가 remoteDescription 후 재시도
                  enqueueIceCandidate(fromId, msg.candidate);
                  console.warn('addIceCandidate 실패(큐잉):', e?.message);
                }
              }
              return;
            }
          } catch (e) {
            console.error('❌ signaling onmessage 처리 중 오류:', e);
          }
        };

        ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.log(`🔌 [${providerId}] WebSocket 연결 종료 (URL ${urlIndex + 1}):`, {
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
          console.error(`❌ [${providerId}] WebSocket 오류 (URL ${urlIndex + 1}):`, error);
          
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
      console.error(`❌ [${providerId}] 시그널링 WebSocket 연결 실패:`, error);
      connectionAttemptedRef.current = false;
    }
  }, [providerId]);

  // 🚨 WebRTC 스트림 완전 정리 함수 (terminateWebRTCSession)
  const terminateWebRTCSession = useCallback(async () => {
    // ✅ 원칙 (3): 종료 플래그를 제일 먼저 세팅해서 auto-init/워치독 레이스 방지
    voiceManager.exitInProgress = true;
    
    // 중복 종료 방지 (특히 페이지 이동/중복 클릭)
    if (window.__terminateWebRTCSessionInProgress) {
      console.warn('⚠️ terminateWebRTCSession: 이미 종료 처리 중 (중복 호출 방지)');
      return false;
    }
    window.__terminateWebRTCSessionInProgress = true;

    console.log('🛑 WebRTC 세션 완전 종료 시작');
    
    try {
      console.log('🎵 VoiceManager 녹음 직접 종료...');
      const recordingData = await voiceManager.stopRecording();
      console.log('✅ 녹음 데이터 확보:', recordingData);
      // 디버그용: 콘솔에서 재다운로드 시도할 수 있게 마지막 녹음 데이터를 보관
      // (다운로드 팝업이 브라우저 정책으로 막혔을 때 대비)
      try { window.__lastRecordingData = recordingData; } catch {}

      // ✅ 게임 종료 시: webm 원본을 로컬 파일로 저장(다운로드) — 기본 동작
      // - "녹음이 처음부터 끝까지 되었는지"를 확인하는 1순위 방법
      // - 브라우저 정책으로 자동 다운로드가 막히면 window.__lastRecordingData로 수동 저장 가능
      try {
        const disabled = localStorage.getItem('download_recording_on_end') === 'false';
        if (!disabled && recordingData?.blob?.size > 0) {
          voiceManager.saveRecordingToLocal(recordingData, { reason: 'terminate_webrtc' });
        } else {
          console.log('ℹ️ 로컬 저장 스킵:', {
            disabled,
            hasBlob: !!recordingData?.blob,
            size: recordingData?.blob?.size || 0,
          });
        }
      } catch (e) {
        console.warn('⚠️ 로컬 저장 처리 중 오류(무시):', e?.message || e);
      }
      
      const mediaStream = voiceManager.mediaStream;
      if (mediaStream) {
        console.log('🎤 WebRTC 마스터 스트림: track.stop()은 하지 않음 (releaseMic에서만)');
      }
      
      voiceManager.disconnectMicrophone();
      
      console.log('🔗 PeerConnections 정리 중...');
      peerConnections.forEach((pc, userId) => {
        try {
          pc.getSenders().forEach(sender => {
            if (sender.track) {
              console.log(`🔌 PeerConnection 송신 트랙 분리: User ${userId}`);
              try { sender.replaceTrack(null); } catch {}
            }
          });
          pc.close();
          console.log(`✅ PeerConnection 닫음: User ${userId}`);
        } catch (error) {
          console.warn(`⚠️ PeerConnection 정리 실패: User ${userId}`, error);
        }
      });
      
      setPeerConnections(new Map());
      
      if (signalingWsRef.current) {
        console.log('🔌 시그널링 WebSocket 연결 해제');
        signalingWsRef.current.close();
        signalingWsRef.current = null;
        setSignalingConnected(false);
      }
      
      const audioElements = document.querySelectorAll('audio[data-user-id]');
      audioElements.forEach(audio => {
        audio.remove();
        console.log('🗑️ 원격 오디오 요소 제거됨');
      });
      
      let uploadResult = null;
      if (recordingData?.blob && recordingData.blob.size > 0) {
        console.log('📤 서버 업로드 시작 (스트림 정리 완료 후)...');
        try {
          uploadResult = await voiceManager.uploadRecordingToServer(recordingData);
          console.log('✅ 업로드 완료');

          // (선택) 서버가 변환해서 만든 wav도 로컬에 저장
          // - 기본은 OFF (원본 webm 확인이 목적)
          // - 필요 시 localStorage.setItem('download_server_wav_on_end','true') 로 켜기
          try {
            const shouldSaveServerWav =
              (localStorage.getItem('download_server_wav_on_end') === 'true');
            const fp = uploadResult?.file_path;
            if (shouldSaveServerWav && fp) {
              await voiceManager.downloadServerRecordingFile(fp, { reason: 'upload_wav' });
            } else {
              console.log('ℹ️ 서버 wav 로컬 저장 스킵:', { shouldSaveServerWav, filePath: fp });
            }
          } catch (e) {
            console.warn('⚠️ 서버 wav 로컬 저장 중 오류(무시):', e?.message || e);
          }
        } catch (e) {
          console.error('❌ 업로드 중 예외:', e);
        }
      }

      // (가능하면) 세션 조회로 현재 상태를 로그 (백엔드 응답에 참가자/녹음 경로가 들어있다면 여기서 3명 업로드 여부 확인 가능)
      try {
        const sid = voiceManager.sessionId || localStorage.getItem('session_id');
        if (sid) {
          const verify = await axiosInstance.get(`/voice/sessions/${sid}`);
          console.log('📋 음성 세션 조회(업로드 직후):', verify.data);
        }
      } catch (e) {
        console.warn('⚠️ 음성 세션 조회 실패(무시):', e?.response?.status, e?.response?.data || e?.message);
      }
      
      try {
        await voiceManager.leaveSession();
        console.log('✅ 세션 나가기 완료');
      } catch (sessionError) {
        console.error('❌ 세션 나가기 실패:', sessionError);
      }

      // ✅ 마지막: 마이크 완전 해제 (track.stop은 여기서만)
      console.log('🧯 마이크 완전 해제 시작...');
      try {
        if (typeof voiceManager.releaseMic === 'function') {
          voiceManager.releaseMic();
          console.log('✅ releaseMic() 호출 완료');
        } else {
          console.warn('⚠️ releaseMic 함수가 없음');
        }
      } catch (e) {
        console.error('❌ releaseMic 호출 실패:', e);
      }
      
      // ✅ masterStreamRef도 명시적으로 정리
      if (masterStreamRef.current) {
        console.log('🔇 masterStreamRef 정리 중...');
        try {
          masterStreamRef.current.getTracks?.().forEach((t) => {
            console.log(`  - masterStream track ${t.kind}: ${t.readyState} → stop`);
            try { t.stop(); } catch (e) { console.warn('track.stop 실패:', e); }
          });
        } catch (e) {
          console.warn('⚠️ masterStreamRef 정리 실패:', e);
        }
        masterStreamRef.current = null;
        console.log('✅ masterStreamRef 정리 완료');
      }

      pcsRef.current.forEach(pc => { try{ pc.close(); }catch{} });
      pcsRef.current.clear();
      setPeerConnections(new Map());
  
      // VoiceManager 상태 초기화
      voiceManager.sessionId = null;
      voiceManager.nickname = null;
      voiceManager.participantId = null;
      voiceManager.sessionInitialized = false;
      voiceManager.recordingStartTime = null;
      voiceManager.usingWebRTCStream = false;
      voiceManager.mediaStream = null;
      
      // WebRTC 상태 초기화
      setIsInitialized(false);
      setVoiceSessionStatus({
        isConnected: false,
        isSpeaking: false,
        sessionId: null,
        nickname: null,
        participantId: null,
        micLevel: 0,
        speakingThreshold: 30
      });
      
      console.log('✅ WebRTC 세션 완전 종료 완료');
      return { recordingData, uploadResult };
      
    } catch (error) {
      console.error('❌ WebRTC 세션 종료 중 오류:', error);
      return false;
    } finally {
      window.__terminateWebRTCSessionInProgress = false;
    }
  }, [peerConnections]);

  // ----------------------------
  // WebRTC 초기화 함수
  // ----------------------------
  const saveRoleUserMapping = useCallback(async () => {
    try {
      const roomCode = localStorage.getItem('room_code');
      if (!roomCode) {
        console.log(`[${providerId}] room_code가 없어서 역할 매핑 스킵`);
        return null;
      }

      const { data: room } = await axiosInstance.get(`/rooms/code/${roomCode}`);
      
      console.log(`🎭 [${providerId}] 역할별 사용자 매핑 저장:`, room.participants);
      
      const mapping = {
        role1_user_id: null,
        role2_user_id: null,
        role3_user_id: null,
      };
      
      let currentUserRoleId = null;
      const currentUserId = localStorage.getItem('user_id');
      
      room.participants.forEach(participant => {
        const roleId = participant.role_id;
        const userId = participant.user_id;
        
        if (roleId) {
          localStorage.setItem(`role${roleId}_user_id`, String(userId));
          mapping[`role${roleId}_user_id`] = String(userId);
          console.log(`📝 [${providerId}] Role ${roleId} → User ${userId} 매핑 저장`);
          
          if (String(userId) === currentUserId) {
            currentUserRoleId = roleId;
            localStorage.setItem('myrole_id', String(roleId));
            console.log(`👤 [${providerId}] 내 역할 확인: User ${userId} = Role ${roleId}`);
          }
        }
      });
      
      setRoleUserMapping(mapping);
      setMyRoleId(currentUserRoleId);
      
      console.log(`📋 [${providerId}] 연결 계획 (Role ${currentUserRoleId} 기준):`);
      if (currentUserRoleId === 1) {
        console.log(`  Role 1: Offer 전송 안함, Answer만`);
      } else if (currentUserRoleId === 2) {
        console.log(`  Role 2: Role 1에게만 Offer 전송`);
      } else if (currentUserRoleId === 3) {
        console.log(`  Role 3: Role 1, 2에게 Offer 전송`);
      }
      
      // 음성 세션 생성/조회
      // - session_id가 없으면 VoiceManager(녹음) 초기화가 불가능하므로, 실패 시 재시도 후 실패로 처리
      {
        const nickname = localStorage.getItem('nickname') || "사용자";
        let lastErr = null;
        const maxAttempts = 5;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            const { data: voiceSession } = await axiosInstance.post('/voice/sessions', {
              room_code: roomCode,
              nickname: nickname
            });
            if (!voiceSession?.session_id) throw new Error('voiceSession.session_id가 없습니다.');
            console.log(`🎤 [${providerId}] 음성 세션 생성/조회 성공:`, voiceSession.session_id);
            localStorage.setItem('session_id', voiceSession.session_id);
            lastErr = null;
            break;
          } catch (e) {
            lastErr = e;
            const delay = Math.min(1000 * attempt, 4000);
            console.error(`❌ [${providerId}] 음성 세션 생성 실패 (시도 ${attempt}/${maxAttempts})`, e?.response?.data || e?.message || e);
            await new Promise(r => setTimeout(r, delay));
          }
        }
        if (lastErr) {
          throw lastErr;
        }
      }
      
      return mapping;
      
    } catch (error) {
      console.error(`❌ [${providerId}] 역할별 사용자 매핑 저장 실패:`, error);
      return null;
    }
  }, [providerId]);

  const initializeWebRTC = useCallback(async () => {
    if (initializationPromiseRef.current) {
      return initializationPromiseRef.current;
    }

    initializationPromiseRef.current = (async () => {
      try {
        console.log(`🚀 [${providerId}] WebRTC 초기화 시작`);
        
        // 1. 사용자 ID 확인/설정
        let userId = localStorage.getItem('user_id');
        const userIdLooksValid = !!(userId && /^\d+$/.test(String(userId)));
        const isGuestMode = localStorage.getItem('guest_mode') === 'true';
        // 게스트/레거시 데이터 대비: user_id가 숫자 형식이 아니면 서버에서 다시 조회해 교정
        // 단, 게스트 모드일 때는 /users/me 호출하지 않음 (500 에러 방지)
        if (!userId || !userIdLooksValid) {
          if (!isGuestMode) {
            try {
              console.log('🔍 /users/me 호출 시도...');
              const response = await axiosInstance.get('/users/me', {
                timeout: 5000, // 5초 타임아웃
              });
              userId = String(response.data.id);
              localStorage.setItem('user_id', userId);
              console.log('✅ /users/me 성공:', userId);
            } catch (e) {
              const isCorsError = !e.response && (e.message?.includes('Network Error') || e.code === 'ERR_NETWORK');
              if (isCorsError) {
                console.error('❌ CORS 에러 발생: /users/me', {
                  message: e.message,
                  code: e.code,
                  config: {
                    url: e.config?.url,
                    method: e.config?.method,
                    headers: e.config?.headers,
                  }
                });
                console.warn('💡 백엔드 CORS 설정을 확인하세요. 임시로 localStorage의 user_id를 사용합니다.');
              } else {
                console.error('❌ /users/me 호출 실패:', e.response?.status, e.response?.data || e.message);
              }
              
              // CORS 에러여도 localStorage에 user_id가 있으면 사용
              userId = localStorage.getItem('user_id');
              if (!userId) {
                throw new Error('user_id를 확인할 수 없습니다. 로그인을 다시 시도하세요.');
              }
            }
          } else {
            console.warn('⚠️ 게스트 모드인데 user_id가 없습니다. 정상적인 게스트 로그인 플로우를 확인하세요.');
          }
        }
        setMyUserId(userId);

        // 1.5 ICE 서버 설정 선로딩 (TURN 포함 가능) - WS 연결/Offer 생성 전에 준비
        await ensureIceServersReady();
        
        // 2. 역할별 사용자 매핑 저장
        const mapping = await saveRoleUserMapping();
        if (!mapping) {
          console.error(`❌ [${providerId}] 역할 매핑 실패`);
          return false;
        }
        
        // 3. WebRTC에서 마스터 스트림 생성 (getUserMedia)
        let masterStream = masterStreamRef.current;
        const reuseOk = !!(masterStream && masterStream.getAudioTracks?.().some((t) => t.readyState === 'live'));
        if (!reuseOk) {
          // ✅ 가능하면 VoiceManager가 이미 확보해둔 baseMicStream(로컬녹음용 gUM)을 재사용
          if (voiceManager?.hasLiveAudioTrack?.(voiceManager?.baseMicStream)) {
            masterStream = voiceManager.baseMicStream;
            masterStreamRef.current = masterStream;
            console.log('♻️ VoiceManager baseMicStream을 WebRTC masterStream으로 재사용:', masterStream.id);
          } else if (typeof voiceManager?.ensureBaseMicStream === 'function') {
            masterStream = await voiceManager.ensureBaseMicStream();
            masterStreamRef.current = masterStream;
            console.log('♻️ VoiceManager.ensureBaseMicStream으로 masterStream 확보:', masterStream.id);
          } else {
            console.log('🎤 WebRTC에서 마스터 스트림 생성...');
            masterStream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 44100
              }
            });
            masterStreamRef.current = masterStream;
            console.log('✅ WebRTC 마스터 스트림 생성 완료:', masterStream.id);
          }
        } else {
          console.log('♻️ 기존 마스터 스트림 재사용:', masterStream.id);
        }

        // ✅ 원칙 (1): baseMicStream 세팅 (녹음 스트림 생성 실패 시 보험)
        // masterStream을 확보한 직후 voiceManager.baseMicStream에도 세팅
        if (!voiceManager.baseMicStream || !voiceManager.hasLiveAudioTrack?.(voiceManager.baseMicStream)) {
          voiceManager.baseMicStream = masterStream;
          console.log('🔗 voiceManager.baseMicStream ← masterStream 세팅 완료');
        }

        // ✅ 녹음 전용 스트림: base(masterStream)에서 clone을 1회 생성(중간 교체 금지)
        try {
          voiceManager.ensureRecordingStreamFromBase?.(masterStream);
        } catch (e) {
          console.warn('⚠️ ensureRecordingStreamFromBase 실패(무시):', e?.message || e);
        }
        
        // 4. VoiceManager에 스트림 전달하여 초기화
        console.log('🔗 VoiceManager에 스트림 전달...');
        const voiceSuccess = await voiceManager.initializeVoiceSession(masterStream);
        if (!voiceSuccess) {
          console.error(`❌ [${providerId}] 음성 세션 초기화 실패`);
          throw new Error('VoiceManager.initializeVoiceSession 실패');
        }
        // ✅ 안정성: 초기화 직후 녹음 시작을 한 번 더 보장(멱등)
        try { voiceManager.startRecording?.(); } catch {}
        
        // 5. WebSocket 연결 (signaling) - async 함수이므로 await
        await connectSignalingWebSocket();
        
        // 6. 상태 업데이트 주기적 확인
        const statusInterval = setInterval(() => {
          const currentStatus = voiceManager.getStatus();
          setVoiceSessionStatus(currentStatus);
        }, 100);
        
        setIsInitialized(true);
        console.log(`✅ [${providerId}] WebRTC 초기화 완료`);
        
        return () => {
          clearInterval(statusInterval);
        };
        
      } catch (error) {
        console.error(`❌ [${providerId}] WebRTC 초기화 중 오류:`, error);
        initializationPromiseRef.current = null;
        return false;
      }
    })();

    return initializationPromiseRef.current;
  }, [saveRoleUserMapping, connectSignalingWebSocket, providerId, ensureIceServersReady]);

  // 게임 라우트에 들어오면 자동으로 WebRTC 초기화(=녹음 시작)되도록 함
  // - 특정 페이지에서만 initializeWebRTC()가 호출되면 유저 동선에 따라 "끝부분만 녹음"될 수 있음
  useEffect(() => {
    let cancelled = false;

    const path = location?.pathname || '';
    const shouldAutoInit =
      path.startsWith('/game') ||
      path.startsWith('/character_') ||
      path === '/gamemap' ||
      path === '/selecthomemate' ||
      path === '/matename' ||
      path === '/mictest';

    if (!shouldAutoInit) return () => { cancelled = true; };

    // ✅ 핵심: 라우트 전환/로컬스토리지 준비 타이밍 이슈 대응
    // - 기존 로직은 초반에 조건이 안 맞으면 5번만 시도하고 "영원히" 포기해서
    //   녹음이 끝부분(나가기 직전)만 되는 현상이 생길 수 있음
    // - 그래서 게임 관련 라우트에 있는 동안, 필요한 값이 준비될 때까지 주기적으로 재시도
    const intervalMs = 1500;
    const maxWaitMs = 60_000; // 60초 동안만 자동 재시도 (무한 루프 방지)
    const startedAt = Date.now();

    const tick = async () => {
      if (cancelled) return;
      // 퇴장/종료 진행 중이면 절대 자동으로 녹음/초기화 재시작하지 않음 (레이스 방지)
      if (voiceManager?.exitInProgress) return;
      if (isInitialized || initializationPromiseRef.current) {
        return;
      }
      // ✅ 0) WebRTC/세션 준비 전이라도 "로컬 녹음"은 먼저 켜서 시작점을 앞으로 당김
      // - user가 말한 증상(마지막 1~2초만 녹음)은 보통 초반 init 실패로 발생
      try {
        await voiceManager.startLocalMicRecordingIfNeeded?.();
        await voiceManager.ensureRecordingActive?.();
      } catch {}

      // 이미 WebRTC가 초기화되어 있으면(=송수신 세팅 완료) 여기서 더 init 시도는 불필요
      if (isInitialized) return;

      // 최소 선행 조건: access_token, room_code
      const token = localStorage.getItem('access_token');
      const roomCode = localStorage.getItem('room_code');
      if (!(token && roomCode)) {
        if (voiceManager?.isDebugMode) {
          console.log(`⏳ [${providerId}] auto init 대기(선행 조건 부족)`, {
            path,
            hasToken: !!token,
            hasRoomCode: !!roomCode,
          });
        }
        return;
      }

      try {
        const ok = await initializeWebRTC();
        if (ok) return;
      } catch (e) {
        console.warn(`⚠️ [${providerId}] auto initializeWebRTC 예외:`, e?.message || e);
      }
    };

    // 즉시 1회 시도 + 주기적 재시도
    tick();
    const timer = setInterval(() => {
      if (Date.now() - startedAt > maxWaitMs) {
        clearInterval(timer);
        return;
      }
      tick();
    }, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [isInitialized, initializeWebRTC, providerId, location?.pathname]);

  // ----------------------------
  // 새로고침(리로딩) 감지 + 자동 재연결(그레이스)
  // ----------------------------
  const setReloadingFlagForGrace = useCallback(() => {
    try {
      sessionStorage.setItem('reloading', 'true');
      const expireAt = Date.now() + RECONNECT_GRACE_MS;
      sessionStorage.setItem('reloading_expire_at', String(expireAt));
      console.log(`♻️ [reloading] set (expireAt=${expireAt})`);
    } catch (e) {
      // ignore
    }
  }, []);

  const clearReloadingFlag = useCallback(() => {
    try {
      sessionStorage.removeItem('reloading');
      sessionStorage.removeItem('reloading_expire_at');
      console.log('♻️ [reloading] cleared');
    } catch (e) {}
  }, []);

  const isReloadingGraceLocal = useCallback(() => {
    try {
      const flag = sessionStorage.getItem('reloading') === 'true';
      const expire = parseInt(sessionStorage.getItem('reloading_expire_at') || '0', 10);
      if (!flag) return false;
      if (Date.now() > expire) {
        clearReloadingFlag();
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }, [clearReloadingFlag]);

  // beforeunload에서 reloading 플래그 설정
  useEffect(() => {
    const handleBeforeUnload = () => {
      setReloadingFlagForGrace();
    };

    const handleLoadCleanup = () => {
      const expire = parseInt(sessionStorage.getItem('reloading_expire_at') || '0', 10);
      if (!expire || Date.now() > expire) {
        clearReloadingFlag();
      }
    };

    handleLoadCleanup();
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handleLoadCleanup);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoadCleanup);
    };
  }, [setReloadingFlagForGrace, clearReloadingFlag]);

  // 마운트 시: reloading flag가 있으면 일정 시간 동안 initializeWebRTC 시도
  useEffect(() => {
    let canceled = false;
    const attemptAutoReconnect = async () => {
      const roomCode = localStorage.getItem('room_code');
      const nickname = localStorage.getItem('nickname');
      if (!(roomCode && nickname)) return;

      if (!isReloadingGraceLocal()) return;
      if (isInitialized || signalingConnected || initializationPromiseRef.current) {
        return;
      }
      console.log(`♻️ [${providerId}] 페이지 새로고침 감지 — WebRTC 자동 재연결 시도 (grace)`);
      const MAX_WAIT_MS = RECONNECT_GRACE_MS;
      const RETRY_INTERVAL_MS = 2000;
      const startAt = Date.now();
      let lastError = null;

      while (!canceled && (Date.now() - startAt < MAX_WAIT_MS)) {
        if (!isReloadingGraceLocal()) {
          console.log(`♻️ [${providerId}] reloading 플래그가 사라짐 — 재연결 중단`);
          return;
        }

        try {
          console.log(`🔄 [${providerId}] 자동 재연결 시도 (elapsed ${Date.now() - startAt}ms)`);
          const res = await initializeWebRTC();
          // initializeWebRTC returns truthy if succeeded (or a cleanup function). treat non-false as success.
          if (res) {
            console.log(`✅ [${providerId}] WebRTC 자동 재연결 성공`);
            clearReloadingFlag();
            return;
          } else {
            throw new Error('initializeWebRTC 실패');
          }
        } catch (err) {
          lastError = err;
          console.warn(`⚠️ [${providerId}] 자동 재연결 실패:`, err?.message || err);
        }

        const timeLeft = MAX_WAIT_MS - (Date.now() - startAt);
        if (timeLeft <= 0) break;
        await new Promise(resolve => setTimeout(resolve, Math.min(RETRY_INTERVAL_MS, timeLeft)));
      }

      console.error(`🚫 [${providerId}] 자동 재연결 제한 시간(${RECONNECT_GRACE_MS}ms) 초과`);
      if (lastError) console.error('마지막 에러:', lastError);
    };

    attemptAutoReconnect();

    return () => { canceled = true; };
  }, [initializeWebRTC, providerId, isReloadingGraceLocal, clearReloadingFlag]);

  // window.terminateWebRTCSession export
  useEffect(() => {
    window.terminateWebRTCSession = terminateWebRTCSession;
    return () => { delete window.terminateWebRTCSession; };
  }, [terminateWebRTCSession]);

  // stopAllOutgoingAudioGlobal
  function stopAllOutgoingAudio() {
    try {
      pcsRef.current.forEach(pc => {
        pc.getSenders().forEach(s => {
          if (s.track && s.track.kind === 'audio' && s.track.readyState !== 'ended') {
            try { s.replaceTrack(null); } catch {}
          }
        });
        try { pc.close(); } catch {}
      });
    } catch (e) { console.warn(e); }

    console.log('🛑 WebRTC outgoing audio & PCs stopped');
  }

  useEffect(() => {
    window.stopAllOutgoingAudioGlobal = stopAllOutgoingAudio;
    return () => { delete window.stopAllOutgoingAudioGlobal; };
  }, []);

  // P2P 연결 시작 useEffect
  const startPeerConnections = useCallback(() => {
    console.log('ℹ️ startPeerConnections: 역할 기반 수동 연결은 불필요 (from/to 시그널링 적용 완료)');
  }, []);

  // debugPeerConnections
  const debugPeerConnections = useCallback(() => {
    console.log(`🔍 [${providerId}] === PeerConnection 상태 전체 리포트 ===`);
    peerConnections.forEach((pc, userId) => {
      const roleId = getRoleIdByUserId(userId);
      console.log(`\n👤 User ${userId} (Role ${roleId}):`);
      console.log(`  - Connection State: ${pc.connectionState}`);
      console.log(`  - ICE Connection State: ${pc.iceConnectionState}`);
      console.log(`  - Signaling State: ${pc.signalingState}`);
      console.log(`  - Local Description: ${pc.localDescription?.type || 'null'}`);
      console.log(`  - Remote Description: ${pc.remoteDescription?.type || 'null'}`);
      console.log(`  - ICE Gathering State: ${pc.iceGatheringState}`);
    });
    console.log(`\n📋 [${providerId}] 역할 매핑:`, roleUserMapping);
    console.log(`👤 [${providerId}] 내 정보: User ${myUserId}, Role ${myRoleId}`);
    console.log(`📤 [${providerId}] 보낸 Offer (Role):`, Array.from(offerSentToRoles.current));
    console.log(`📥 [${providerId}] 받은 Offer (Role):`, Array.from(offerReceivedFromRoles.current));
    console.log(`📦 [${providerId}] 대기 중인 Candidates:`, Object.fromEntries(pendingCandidates.current));
    const voiceStatus = voiceManager.getStatus();
    console.log(`\n🎤 [${providerId}] 음성 상태:`, voiceStatus);
    console.log(`🔊 [${providerId}] 미디어 스트림:`, voiceManager.mediaStream ? 'AVAILABLE' : 'NULL');
    if (voiceManager.mediaStream) {
      console.log(`🎵 [${providerId}] 트랙 수:`, voiceManager.mediaStream.getTracks().length);
      voiceManager.mediaStream.getTracks().forEach((track, index) => {
        console.log(`  Track ${index}: ${track.kind}, enabled: ${track.enabled}, readyState: ${track.readyState}`);
      });
    }
  }, [peerConnections, getRoleIdByUserId, roleUserMapping, myUserId, myRoleId, providerId]);

  // P2P 연결 트리거
  useEffect(() => {
    const hasRoleId = myRoleId !== null;
    const hasMapping = Object.values(roleUserMapping).some(id => id);
    
    if (signalingConnected && hasRoleId && hasMapping) {
      console.log(`🚀 [${providerId}] 시그널링 연결 완료, P2P 연결 시작`);
      const timeoutId = setTimeout(() => { startPeerConnections(); }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [signalingConnected, myRoleId, startPeerConnections, providerId]);

  // debug window object
  useEffect(() => {
    window.debugWebRTC = {
      getStatus: () => ({
        peerConnections: peerConnections.size,
        signalingConnected,
        myUserId,
        myRoleId,
        roleUserMapping,
        pendingCandidates: pendingCandidates.current.size,
        iceConfigStatus,
      }),
      // 현재 적용 중인 iceServers를 확인 (credential은 마스킹)
      getIceConfig: () => ({
        ...iceConfigStatus,
        iceServers: maskIceServersForLog(iceServersRef.current),
      }),
      // TURN이 실제로 relay 후보를 뱉는지 “강제” 확인 (iceTransportPolicy: 'relay')
      // - relay candidate가 1개라도 나오면 TURN 경유 가능 상태
      testTurnRelay: async (timeoutMs = 8000) => {
        const iceServers = iceServersRef.current || getIceServersFromEnv();
        const results = { relay: 0, srflx: 0, host: 0, other: 0, candidates: [], errors: [] };

        const pc = new RTCPeerConnection({
          iceServers,
          iceTransportPolicy: 'relay',
        });

        try {
          pc.createDataChannel('turn-test');
          pc.onicecandidateerror = (e) => {
            // 일부 브라우저는 상세가 비어있을 수 있음
            results.errors.push({
              errorCode: e?.errorCode,
              errorText: e?.errorText,
              url: e?.url,
              address: e?.address,
              port: e?.port,
              hostCandidate: e?.hostCandidate,
            });
          };
          pc.onicecandidate = (e) => {
            const c = e.candidate;
            if (!c) return;
            const t = parseCandidateType(c) || 'other';
            if (t === 'relay') results.relay += 1;
            else if (t === 'srflx') results.srflx += 1;
            else if (t === 'host') results.host += 1;
            else results.other += 1;
            results.candidates.push({
              type: t,
              protocol: c.protocol,
              address: c.address,
              port: c.port,
            });
          };

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          await new Promise((resolve) => {
            let done = false;
            const finish = () => {
              if (done) return;
              done = true;
              resolve();
            };
            const timer = setTimeout(finish, timeoutMs);
            pc.onicegatheringstatechange = () => {
              if (pc.iceGatheringState === 'complete') {
                clearTimeout(timer);
                finish();
              }
            };
          });
        } finally {
          try { pc.close(); } catch {}
        }

        console.log('🧪 TURN relay test result:', results);
        return results;
      },
      debugConnections: debugPeerConnections,
      testConnection: (targetUserId) => {
        const pc = peerConnections.get(targetUserId);
        if (pc) {
          console.log(`🔍 User ${targetUserId} 연결 테스트:`, {
            connectionState: pc.connectionState,
            iceConnectionState: pc.iceConnectionState,
            signalingState: pc.signalingState
          });
        } else {
          console.log(`❌ User ${targetUserId}에 대한 PeerConnection이 없음`);
        }
      },
      processPendingCandidates: (userId) => {
        const pc = peerConnections.get(userId);
        const candidates = pendingCandidates.current.get(userId);
        if (pc && candidates) {
          console.log(`🔄 강제 ICE candidate 처리: User ${userId}, ${candidates.length}개`);
          candidates.forEach(async (candidate) => {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
              console.log(` 강제 ICE candidate 추가 완료`);
            } catch (error) {
              console.warn(` 강제 ICE candidate 추가 실패:`, error.message);
            }
          });
          pendingCandidates.current.delete(userId);
        }
      }
    };
    return () => { delete window.debugWebRTC; };
  }, [signalingConnected, myUserId, myRoleId, iceConfigStatus]);

  // 정리 useEffect (언마운트)
  useEffect(() => {
    return () => {
      if (voiceManager.exitInProgress) {
        console.log(`🧹 [${providerId}] WebRTC Provider 정리 시작`);
        peerConnections.forEach(pc => { pc.close(); });
        if (signalingWsRef.current) {
          signalingWsRef.current.close();
          signalingWsRef.current = null;
        }
        const audioElements = document.querySelectorAll('audio[data-user-id]');
        audioElements.forEach(audio => { audio.remove(); });
        offerSentToRoles.current.clear();
        offerReceivedFromRoles.current.clear();
        pendingCandidates.current.clear();
        console.log(`✅ [${providerId}] WebRTC Provider 정리 완료`);
      } else {
        console.log(`ℹ️ [${providerId}] WebRTC Provider 소프트 정리 (인스턴스 교체) - 연결 유지`);
      }
    }
  }, [providerId, peerConnections]); // 마운트 시 한 번
// ----------------------------
// 디버그 유틸리티
// ----------------------------
useEffect(() => {
  window.debugWebRTCConnections = {
    // 전체 연결 요약
    summary: () => {
      console.log('=== WebRTC PeerConnection 요약 ===');
      console.log(`총 PeerConnections: ${peerConnections.size}`);
      peerConnections.forEach((pc, userId) => {
        console.log(`User ${userId}: connectionState=${pc.connectionState}, iceConnectionState=${pc.iceConnectionState}`);
      });
    },

    // 각 PeerConnection별 상세 상태
    details: () => {
      console.log('=== WebRTC PeerConnection 상세 상태 ===');
      peerConnections.forEach((pc, userId) => {
        console.log(`\nUser ${userId}:`);
        console.log(`  - Connection State: ${pc.connectionState}`);
        console.log(`  - ICE Connection State: ${pc.iceConnectionState}`);
        console.log(`  - Signaling State: ${pc.signalingState}`);
        console.log(`  - Local Description: ${pc.localDescription?.type || 'null'}`);
        console.log(`  - Remote Description: ${pc.remoteDescription?.type || 'null'}`);
        console.log(`  - ICE Gathering State: ${pc.iceGatheringState}`);
      });
    },

    // 연결된 유저 ID만 간단히 보기
    connectedUsers: () => {
      const users = [];
      peerConnections.forEach((pc, userId) => {
        if (pc.connectionState === 'connected') users.push(userId);
      });
      console.log('✅ 연결된 유저 ID:', users);
      console.log('총 연결 수:', users.length);
      return users;
    },

    // 현재 로컬 트랙 상태 확인
    localTracks: () => {
      const stream = voiceManager.mediaStream;
      if (!stream) return console.log('❌ 로컬 미디어 스트림 없음');
      console.log('=== 로컬 트랙 상태 ===');
      stream.getTracks().forEach((track, idx) => {
        console.log(`Track ${idx}: kind=${track.kind}, enabled=${track.enabled}, readyState=${track.readyState}`);
      });
    }
  };

  return () => { delete window.debugWebRTCConnections; };
}, [peerConnections]);

  // Context 값
  const contextValue = {
    isInitialized,
    signalingConnected,
    peerConnections,
    roleUserMapping,
    myUserId,
    myRoleId,
    iceConfigStatus,
    voiceSessionStatus,
    terminateWebRTCSession,
    initializeWebRTC,
    startPeerConnections,
    debugPeerConnections,
    refreshIceConfig: ensureIceServersReady,
    adjustThreshold: (delta) => {
      const newThreshold = Math.max(10, Math.min(100, voiceSessionStatus.speakingThreshold + delta));
      voiceManager.setSpeakingThreshold(newThreshold);
    },
    toggleMic: () => voiceManager.toggleMic?.(),
    getMicLevel: () => voiceSessionStatus.micLevel,
    isSpeaking: () => voiceSessionStatus.isSpeaking,
    getUserIdByRole,
    getRoleIdByUserId,
  };

  return (
    <WebRTCContext.Provider value={contextValue}>
      {children}
    </WebRTCContext.Provider>
  );
};

export default WebRTCProvider;

// 유틸함수
export function disconnectWebRTCVoice(peerConnectionsMap) {
  if (!peerConnectionsMap) return;
  const iterable = peerConnectionsMap instanceof Map 
    ? peerConnectionsMap.values() 
    : Object.values(peerConnectionsMap);
  for (const pc of iterable) {
    try {
      pc.getSenders().forEach(s => { if (s.track?.kind === 'audio') s.track.stop(); });
      pc.close();
    } catch (e) { console.error(e); }
  }
}

/**
 * 1. 상단에 WS_BASE 상수를 선언하고 VITE_WS_BASE_URL 환경변수를 적용함.
 * 2. connectSignalingWebSocket 함수 내 하드코딩된 'wss://dilemmai-idl.com' 주소를 WS_BASE 변수로 대체함.
 */
