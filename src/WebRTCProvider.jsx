// 음성  송수신까지 구현한 코드 (녹음 종료, 마이크 종료 )
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import voiceManager from './utils/voiceManager';
import axiosInstance from './api/axiosInstance';

// WebRTC Context 생성
const WebRTCContext = createContext();

// WebRTC Provider 컴포넌트
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

  // WebSocket 참조
  const signalingWsRef = useRef(null);
  const connectionAttemptedRef = useRef(false);
  const initializationPromiseRef = useRef(null);

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

function getOrCreatePC(remotePeerId) {
  if (pcsRef.current.has(remotePeerId)) return pcsRef.current.get(remotePeerId);

  const config = {
    iceServers: [
      { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
      // TURN 쓰려면 실제 서버 정보로 교체하세요. (없으면 이 줄은 빼도 됩니다)
      // { urls: 'turn:turn.example.com:3478', username: 'user', credential: 'pass' },
    ],
  };
  
  const pc = new RTCPeerConnection(config);
  
  
  pc.ontrack = (e) => {
    const audio = document.createElement('audio');
    audio.autoplay = true;
    audio.playsInline = true;
    audio.srcObject = e.streams[0];
    audio.setAttribute('data-user-id', remotePeerId);
    document.body.appendChild(audio);
    // 일부 브라우저용
    audio.play().catch(()=>{ /* 첫 사용자 제스처 후 재시도 */ });
  };
  

  // ICE 후보 생성 → to 지정해서 서버로
  pc.onicecandidate = (e) => {
    if (!e.candidate) return;
    const ws = signalingWsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('📤 [signaling] send candidate →', remotePeerId, e.candidate);
      ws.send(JSON.stringify({
        type: 'candidate',
        from:SELF(),
        to: remotePeerId,
        candidate: e.candidate, // 객체 그대로
      }));
    }
  };

  // 상태로그(선택)
  pc.onconnectionstatechange = () => {
    console.log(`PC(${remotePeerId}) connectionState=`, pc.connectionState);
    if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
      // 필요시 정리
    }
  };

  pcsRef.current.set(remotePeerId, pc);
  // (선택) 리액트 state도 유지하고 싶다면 아래 한줄:
  setPeerConnections(new Map(pcsRef.current));

  return pc;
}
const createPeerConnection = (...args) => getOrCreatePC(...args);

async function createOfferTo(remotePeerId) {
  const pc = getOrCreatePC(remotePeerId);

  // 로컬 오디오 트랙 추가
  let stream = voiceManager.mediaStream;
  if (!stream) {
    await voiceManager.initializeVoiceSession();
    stream = voiceManager.mediaStream;
  }
  if (stream) {
    // 같은 트랙 중복 추가 방지: 이미 추가된 발신 트랙이 있으면 생략
    const hasAudio = pc.getSenders().some(s => s.track && s.track.kind === 'audio');
    if (!hasAudio) {
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
    }
  }

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  const ws = signalingWsRef.current;
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log('📤 [signaling] send offer →', remotePeerId);
    ws.send(JSON.stringify({
      type: 'offer',
      from:SELF(),
      to: remotePeerId,
      sdp: offer.sdp,
    }));
  }else{
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

    // 초기 동기화
    syncStateFromLocalStorage();
    
    // 주기적 동기화
    const syncInterval = setInterval(syncStateFromLocalStorage, 1000);
    
    return () => clearInterval(syncInterval);
  }, [myUserId, myRoleId, providerId]); // roleUserMapping 제거

  // 🔧 유틸리티 함수들 (먼저 정의)
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


  //음성 세션 녹음 종료를 위한 코드 
  // WebRTCProvider.jsx
function stopAllOutgoingAudio() {
  try {
    peerConnections.forEach(pc => {
      pc.getSenders().forEach(s => {
        if (s.track && s.track.kind === 'audio' && s.track.readyState !== 'ended') {
          try { s.replaceTrack(null); } catch {}
          try { s.track.stop(); } catch {}
        }
      });
      try { pc.close(); } catch {}
    });
  } catch (e) { console.warn(e); }

  // if (localStreamRef.current) {
  //   try { localStreamRef.current.getTracks().forEach(t => t.stop()); } catch {}
  //   localStreamRef.current = null;
  // }
  console.log('🛑 WebRTC outgoing audio & PCs stopped');
}

useEffect(() => {
  window.stopAllOutgoingAudioGlobal = stopAllOutgoingAudio;
  return () => { delete window.stopAllOutgoingAudioGlobal; };
}, []);


  const startPeerConnections = useCallback(() => {
    // 이제는 서버가 준 peers/peer_joined 이벤트에서 자동으로 오퍼를 보냅니다.
    console.log('ℹ️ startPeerConnections: 역할 기반 수동 연결은 불필요 (from/to 시그널링 적용 완료)');
  }, []);
  
  // 역할별 사용자 ID 매핑 저장
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
      
      // 내 역할 ID 찾기
      let currentUserRoleId = null;
      const currentUserId = localStorage.getItem('user_id');
      
      room.participants.forEach(participant => {
        const roleId = participant.role_id;
        const userId = participant.user_id;
        
        if (roleId) {
          localStorage.setItem(`role${roleId}_user_id`, String(userId));
          mapping[`role${roleId}_user_id`] = String(userId);
          console.log(`📝 [${providerId}] Role ${roleId} → User ${userId} 매핑 저장`);
          
          // 내 역할 ID 찾기
          if (String(userId) === currentUserId) {
            currentUserRoleId = roleId;
            localStorage.setItem('myrole_id', String(roleId));
            console.log(`👤 [${providerId}] 내 역할 확인: User ${userId} = Role ${roleId}`);
          }
        }
      });
      
      setRoleUserMapping(mapping);
      setMyRoleId(currentUserRoleId);
      
      // 🔧 연결 계획 출력
      console.log(`📋 [${providerId}] 연결 계획 (Role ${currentUserRoleId} 기준):`);
      if (currentUserRoleId === 1) {
        console.log(`  Role 1: Offer 전송 안함, Answer만`);
      } else if (currentUserRoleId === 2) {
        console.log(`  Role 2: Role 1에게만 Offer 전송`);
      } else if (currentUserRoleId === 3) {
        console.log(`  Role 3: Role 1, 2에게 Offer 전송`);
      }
      
      // 음성 세션 생성/조회
      try {
        const nickname = localStorage.getItem('nickname') || "사용자";
        const { data: voiceSession } = await axiosInstance.post('/voice/sessions', {
          room_code: roomCode,
          nickname: nickname
        });
        console.log(`🎤 [${providerId}] 음성 세션 생성/조회 성공:`, voiceSession.session_id);
        localStorage.setItem('session_id', voiceSession.session_id);
      } catch (sessionError) {
        console.error(`❌ [${providerId}] 음성 세션 생성 실패:`, sessionError);
      }
      
      return mapping;
      
    } catch (error) {
      console.error(`❌ [${providerId}] 역할별 사용자 매핑 저장 실패:`, error);
      return null;
    }
  }, [providerId]);
  const SELF = () => String(myPeerIdRef.current || localStorage.getItem('user_id'));

  // 🔧 시그널링 WebSocket 연결
  const connectSignalingWebSocket = useCallback(() => {
    if (connectionAttemptedRef.current) {
      console.log(`⚠️ [${providerId}] WebSocket 연결이 이미 시도됨, 중복 방지`);
      return;
    }

    try {
      const roomCode = localStorage.getItem('room_code');
      const token = localStorage.getItem('access_token');
      
      if (!roomCode || !token) {
        console.error(`❌ [${providerId}] room_code 또는 token이 없습니다`, { roomCode, token: !!token });
        return;
      }

      connectionAttemptedRef.current = true;

      const urlsToTry = [
        `wss://dilemmai.org/ws/signaling?room_code=${roomCode}&token=${token}`,
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
        }, 3000);
        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log(`✅ [${providerId}] WebSocket 연결 성공 (signaling)`);
                    setSignalingConnected(true);
          signalingWsRef.current = ws;

          // ① 본인 등록
          const pid = myPeerIdRef.current || localStorage.getItem('user_id');
          console.log('[signaling] send join:', { peer_id: String(pid) });
          ws.send(JSON.stringify({ type: 'join', peer_id: String(pid) }));
        };

        ws.onmessage = async (event) => {

          const msg = JSON.parse(event.data);
          console.log('📨 signaling:', msg);

            // 내가 대상이 아닌 브로드캐스트면 무시
            const toId = msg.to ? String(msg.to) : null;
            if (toId && toId !== SELF()) return;

            // 서버가 필드명을 다르게 줄 수도 있으니 'from' 추론
            const fromId = String(
              msg.from ?? msg.peer_id ?? msg.sender ?? msg.user_id ?? ''
            );
          // ② 서버가 준 기존 참가자 목록 → 1:N 오퍼
          if (msg.type === 'peers' && Array.isArray(msg.peers)) {
            console.log('👥 [signaling] peers list:', msg.peers);

            for (const otherId of msg.peers) {
              console.log('➡️ [signaling] createOfferTo (existing peer):', otherId);
              if (!otherId || otherId === myPeerIdRef.current) continue;
              await createOfferTo(String(otherId));
            }
            return;
          }
          // ③ 누군가 새로 들어옴 → 그 사람에게 오퍼
          if ((msg.type === 'join' || msg.type === 'joined') && msg.peer_id) {
            const otherId = String(msg.peer_id);
            if (otherId !== myPeerIdRef.current) {
              console.log('➡️ [signaling] createOfferTo (join):', otherId);
              await createOfferTo(otherId);
            }
            return;
          }


          // ④ 누군가 나감 → 해당 PC 정리
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

          // ⑤ 타겟 지정 시그널링
          if (msg.type === 'offer' && fromId) {            console.log('🟢 [signaling] offer from:', msg.from);
            const pc = getOrCreatePC(fromId);
            await pc.setRemoteDescription({ type: 'offer', sdp: msg.sdp });

            // 로컬 트랙이 없다면 추가
            let stream = voiceManager.mediaStream;
            if (!stream) {
              await voiceManager.initializeVoiceSession();
              stream = voiceManager.mediaStream;
            }
            if (stream) {
              const hasAudio = pc.getSenders().some(s => s.track && s.track.kind === 'audio');
              if (!hasAudio) {
                stream.getTracks().forEach(t => pc.addTrack(t, stream));
              }
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
            await pc.setRemoteDescription({ type: 'answer', sdp: msg.sdp });
            return;
          }

          if (msg.type === 'candidate' && fromId) {
            console.log('🟢 [signaling] candidate from:', msg.from, msg.candidate);
            const pc = getOrCreatePC(fromId);
            // 서버가 candidate 객체 그대로 줌
            if (msg.candidate) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
              } catch (e) {
                console.warn('addIceCandidate 실패:', e?.message);
              }
            }
            return;
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
// 🚨 WebRTC 스트림 완전 정리 함수
// 🚨 WebRTCProvider.js - terminateWebRTCSession 수정 (무한 루프 방지)

const terminateWebRTCSession = useCallback(async () => {
  console.log('🛑 WebRTC 세션 완전 종료 시작');
  
  try {
    // 🚨 1. VoiceManager 개별 함수들 직접 호출 (terminateVoiceSession 호출 금지)
    console.log('🎵 VoiceManager 녹음 직접 종료...');
    
    // 녹음 중지
    const recordingData = await voiceManager.stopRecording();
    console.log('✅ 녹음 데이터 확보:', recordingData);
    
    // 🚨 2. WebRTC 스트림 트랙들 완전 정지 (핵심!)
    const mediaStream = voiceManager.mediaStream;
    if (mediaStream) {
      console.log('🎤 WebRTC 마스터 스트림 정지 중...');
      mediaStream.getTracks().forEach(track => {
        console.log(`🔇 트랙 정지: ${track.kind}, readyState: ${track.readyState}`);
        if (track.readyState !== 'ended') {
          track.stop();
          console.log(`✅ 트랙 정지 완료: ${track.kind}`);
        }
      });
      console.log('✅ 모든 스트림 트랙 정지 완료');
    }
    
    // 3. VoiceManager 정리 (스트림 제외)
    voiceManager.disconnectMicrophone();
    
    // 4. PeerConnections 정리
    console.log('🔗 PeerConnections 정리 중...');
    peerConnections.forEach((pc, userId) => {
      try {
        // 송신 트랙들 정지
        pc.getSenders().forEach(sender => {
          if (sender.track) {
            console.log(`🔇 PeerConnection 송신 트랙 정지: User ${userId}`);
            sender.track.stop();
          }
        });
        
        // PeerConnection 닫기
        pc.close();
        console.log(`✅ PeerConnection 닫음: User ${userId}`);
      } catch (error) {
        console.warn(`⚠️ PeerConnection 정리 실패: User ${userId}`, error);
      }
    });
    
    // PeerConnections Map 초기화
    setPeerConnections(new Map());
    
    // 5. WebSocket 연결 해제
    if (signalingWsRef.current) {
      console.log('🔌 시그널링 WebSocket 연결 해제');
      signalingWsRef.current.close();
      signalingWsRef.current = null;
      setSignalingConnected(false);
    }
    
    // 6. 오디오 요소들 제거
    const audioElements = document.querySelectorAll('audio[data-user-id]');
    audioElements.forEach(audio => {
      audio.remove();
      console.log('🗑️ 원격 오디오 요소 제거됨');
    });
    
    // 7. 업로드 (마지막에)
    let uploadResult = null;
    if (recordingData?.blob && recordingData.blob.size > 0) {
      console.log('📤 서버 업로드 시작 (스트림 정리 완료 후)...');
      try {
        uploadResult = await voiceManager.uploadRecordingToServer(recordingData);
        console.log('✅ 업로드 완료');
      } catch (e) {
        console.error('❌ 업로드 중 예외:', e);
      }
    }
    
    // 8. 세션 나가기
    try {
      await voiceManager.leaveSession();
      console.log('✅ 세션 나가기 완료');
    } catch (sessionError) {
      console.error('❌ 세션 나가기 실패:', sessionError);
    }
    pcsRef.current.forEach(pc => { try{ pc.close(); }catch{} });
    pcsRef.current.clear();
    setPeerConnections(new Map());

    // 9. VoiceManager 상태 초기화
    voiceManager.sessionId = null;
    voiceManager.nickname = null;
    voiceManager.participantId = null;
    voiceManager.sessionInitialized = false;
    voiceManager.recordingStartTime = null;
    voiceManager.usingWebRTCStream = false;
    voiceManager.mediaStream = null;
    
    // 10. WebRTC 상태 초기화
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
  }
}, [peerConnections]);

  // // 🔧 WebRTC 초기화
// WebRTC Provider에서 VoiceManager에 스트림 전달하는 올바른 방법:
// WebRTCProvider.jsx - initializeWebRTC 함수 수정
const initializeWebRTC = useCallback(async () => {
  if (initializationPromiseRef.current) {
    return initializationPromiseRef.current;
  }

  initializationPromiseRef.current = (async () => {
    try {
      console.log(`🚀 [${providerId}] WebRTC 초기화 시작`);
      
      // 1. 사용자 ID 확인/설정
      let userId = localStorage.getItem('user_id');
      if (!userId) {
        const response = await axiosInstance.get('/users/me');
        userId = String(response.data.id);
        localStorage.setItem('user_id', userId);
      }
      setMyUserId(userId);
      
      // 2. 역할별 사용자 매핑 저장
      const mapping = await saveRoleUserMapping();
      if (!mapping) {
        console.error(`❌ [${providerId}] 역할 매핑 실패`);
        return false;
      }
      
      // 🚨 3. WebRTC에서 마스터 스트림 생성
      console.log('🎤 WebRTC에서 마스터 스트림 생성...');
      const masterStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });
      console.log('✅ WebRTC 마스터 스트림 생성 완료:', masterStream.id);
      
      // 🚨 4. VoiceManager에 스트림 전달하여 초기화
      console.log('🔗 VoiceManager에 스트림 전달...');
      const voiceSuccess = await voiceManager.initializeVoiceSession(masterStream);
      if (!voiceSuccess) {
        console.error(`❌ [${providerId}] 음성 세션 초기화 실패`);
        return false;
      }
      
      // 5. WebSocket 연결
      connectSignalingWebSocket();
      
      // 6. 상태 업데이트
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
}, [saveRoleUserMapping, connectSignalingWebSocket, providerId]);
  // Zoom 회의에서 음성 송수신 끄기 

  // const initializeWebRTC = useCallback(async () => {
  //   if (initializationPromiseRef.current) {
  //     console.log(`⚠️ [${providerId}] 이미 초기화 진행 중`);
  //     return initializationPromiseRef.current;
  //   }
  
  //   initializationPromiseRef.current = (async () => {
  //     try {
  //       console.log(`🚀 [${providerId}] WebRTC 초기화 시작`);
  
  //       // 1. 사용자 ID 확인/설정
  //       let userId = localStorage.getItem('user_id');
  //       if (!userId) {
  //         console.log(`⚠️ [${providerId}] user_id가 없음, /users/me에서 가져오는 중...`);
  //         const response = await axiosInstance.get('/users/me');
  //         userId = String(response.data.id);
  //         localStorage.setItem('user_id', userId);
  //       }
  //       setMyUserId(userId);
  
  //       // 2. 역할별 사용자 매핑 저장
  //       const mapping = await saveRoleUserMapping();
  //       if (!mapping) {
  //         console.error(`❌ [${providerId}] 역할 매핑 실패`);
  //         return false;
  //       }
  
  //       // 🔈 3. 음성 세션 초기화 (조건부)
  //       const isVoiceEnabled = localStorage.getItem('voice_enabled') !== 'false';
  //       if (isVoiceEnabled) {
  //         const voiceSuccess = await voiceManager.initializeVoiceSession();
  //         if (!voiceSuccess) {
  //           console.error(`❌ [${providerId}] 음성 세션 초기화 실패`);
  //           return false;
  //         }
  //         console.log(`🎤 [${providerId}] 음성 세션 초기화 성공`);
  //       } else {
  //         console.log(`🔇 [${providerId}] 음성 기능 꺼짐 - voice session 건너뜀`);
  //       }
  
  //       // 4. WebSocket 연결 (signaling)
  //       connectSignalingWebSocket();
  
  //       // 5. 상태 업데이트 주기적 확인
  //       const statusInterval = setInterval(() => {
  //         const currentStatus = voiceManager.getStatus();
  //         setVoiceSessionStatus(currentStatus);
  //       }, 100);
  
  //       setIsInitialized(true);
  //       console.log(`✅ [${providerId}] WebRTC 초기화 완료`);
  
  //       return () => {
  //         clearInterval(statusInterval);
  //       };
  
  //     } catch (error) {
  //       console.error(`❌ [${providerId}] WebRTC 초기화 중 오류:`, error);
  //       initializationPromiseRef.current = null;
  //       return false;
  //     }
  //   })();
  
  //   return initializationPromiseRef.current;
  // }, [saveRoleUserMapping, connectSignalingWebSocket, providerId]);
  // 🔧 디버깅 함수 강화
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
    
    // 🔧 연결 상태별 예상 동작
    console.log(`\n🎯 [${providerId}] 역할별 예상 연결:`);
    if (myRoleId === 1) {
      console.log(`  Role 1: Offer 전송 안함, Role 2,3으로부터 Offer 수신만`);
    } else if (myRoleId === 2) {
      console.log(`  Role 2: Role 1에게만 Offer 전송, Role 3으로부터 Offer 수신`);
    } else if (myRoleId === 3) {
      console.log(`  Role 3: Role 1,2에게 Offer 전송`);
    }
    
    // voiceManager 상태도 확인
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

  // 🔧 P2P 연결 시작 useEffect - 안정성 개선
  useEffect(() => {
    // 모든 조건이 충족되었는지 확인
    const hasRoleId = myRoleId !== null;
    const hasMapping = Object.values(roleUserMapping).some(id => id);
    
    if (signalingConnected && hasRoleId && hasMapping) {
      console.log(`🚀 [${providerId}] 시그널링 연결 완료, P2P 연결 시작`);
      
      const timeoutId = setTimeout(() => {
        startPeerConnections();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [signalingConnected, myRoleId, startPeerConnections, providerId]); // roleUserMapping 제거하여 순환 방지

  // 🔧 디버깅 도구 useEffect - 의존성 배열 최적화
  useEffect(() => {
    window.debugWebRTC = {
      // 현재 상태 확인
      getStatus: () => ({
        peerConnections: peerConnections.size,
        signalingConnected,
        myUserId,
        myRoleId,
        roleUserMapping,
        pendingCandidates: pendingCandidates.current.size
      }),
      
      // 상세 PeerConnection 상태
      debugConnections: debugPeerConnections,
      
      // 수동 연결 테스트
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
      
      // 강제 ICE candidate 처리
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
    
    return () => {
      delete window.debugWebRTC;
    };
  }, [signalingConnected, myUserId, myRoleId]); // 자주 변경되는 의존성 제거
// 🚨 전역에서 사용할 수 있도록 window에 등록
useEffect(() => {
  window.terminateWebRTCSession = terminateWebRTCSession;
  return () => {
    delete window.terminateWebRTCSession;
  };
}, [terminateWebRTCSession]);
  // 🔧 정리 useEffect - 의존성 최적화
  useEffect(() => {
    return () => {
      console.log(`🧹 [${providerId}] WebRTC Provider 정리 시작`);
      
      // PeerConnection 정리
      peerConnections.forEach(pc => {
        pc.close();
      });
      
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
      pendingCandidates.current.clear();
      
      console.log(`✅ [${providerId}] WebRTC Provider 정리 완료`);
    };
  }, []); // 빈 배열로 컴포넌트 언마운트 시에만 실행

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
    terminateWebRTCSession,
    // 함수들
    initializeWebRTC,
    startPeerConnections,
    debugPeerConnections,
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

export function disconnectWebRTCVoice(peerConnectionsMap) {
  if (!peerConnectionsMap) return;
  // Map이라면:
  const iterable = peerConnectionsMap instanceof Map 
    ? peerConnectionsMap.values() 
    : Object.values(peerConnectionsMap); // 혹시 객체가 오면 fallback
  for (const pc of iterable) {
    try {
      pc.getSenders().forEach(s => { if (s.track?.kind === 'audio') s.track.stop(); });
      pc.close();
    } catch (e) { console.error(e); }
  }
}


