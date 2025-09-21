// WebRTCProvider.jsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import voiceManager from './utils/voiceManager';
import axiosInstance from './api/axiosInstance';

// WebRTC Context 생성
const WebRTCContext = createContext();

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
    
    pc.onicecandidate = (e) => {
      if (!e.candidate) return;
      const ws = signalingWsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log('📤 [signaling] send candidate →', remotePeerId, e.candidate);
        ws.send(JSON.stringify({
          type: 'candidate',
          from: SELF(),
          to: remotePeerId,
          candidate: e.candidate,
        }));
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`PC(${remotePeerId}) connectionState=`, pc.connectionState);
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        // 필요시 정리
      }
    };

    pcsRef.current.set(remotePeerId, pc);
    setPeerConnections(new Map(pcsRef.current));

    return pc;
  }
  const createPeerConnection = (...args) => getOrCreatePC(...args);

  async function createOfferTo(remotePeerId) {
    const pc = getOrCreatePC(remotePeerId);

    // 로컬 오디오 트랙 추가
    let stream = voiceManager.mediaStream;
    if (!stream) {
      await voiceManager.initializeVoiceSession(); // 내부에서 session_id 체크 및 초기화 시도
      stream = voiceManager.mediaStream;
    }
    if (stream) {
      // 같은 트랙 중복 추가 방지
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
                if (!otherId || otherId === myPeerIdRef.current) continue;
                await createOfferTo(String(otherId));
              }
              return;
            }

            if ((msg.type === 'join' || msg.type === 'joined') && msg.peer_id) {
              const otherId = String(msg.peer_id);
              if (otherId !== myPeerIdRef.current) {
                await createOfferTo(otherId);
              }
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
              if (msg.candidate) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
                } catch (e) {
                  console.warn('addIceCandidate 실패:', e?.message);
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
    console.log('🛑 WebRTC 세션 완전 종료 시작');
    
    try {
      console.log('🎵 VoiceManager 녹음 직접 종료...');
      const recordingData = await voiceManager.stopRecording();
      console.log('✅ 녹음 데이터 확보:', recordingData);
      
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
      
      voiceManager.disconnectMicrophone();
      
      console.log('🔗 PeerConnections 정리 중...');
      peerConnections.forEach((pc, userId) => {
        try {
          pc.getSenders().forEach(sender => {
            if (sender.track) {
              console.log(`🔇 PeerConnection 송신 트랙 정지: User ${userId}`);
              sender.track.stop();
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
        } catch (e) {
          console.error('❌ 업로드 중 예외:', e);
        }
      }
      
      try {
        await voiceManager.leaveSession();
        console.log('✅ 세션 나가기 완료');
      } catch (sessionError) {
        console.error('❌ 세션 나가기 실패:', sessionError);
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
        
        // 3. WebRTC에서 마스터 스트림 생성 (getUserMedia)
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
        
        // 4. VoiceManager에 스트림 전달하여 초기화
        console.log('🔗 VoiceManager에 스트림 전달...');
        const voiceSuccess = await voiceManager.initializeVoiceSession(masterStream);
        if (!voiceSuccess) {
          console.error(`❌ [${providerId}] 음성 세션 초기화 실패`);
          return false;
        }
        
        // 5. WebSocket 연결 (signaling)
        connectSignalingWebSocket();
        
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
  }, [saveRoleUserMapping, connectSignalingWebSocket, providerId]);

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
            try { s.track.stop(); } catch {}
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
        pendingCandidates: pendingCandidates.current.size
      }),
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
  }, [signalingConnected, myUserId, myRoleId]);

  // 정리 useEffect (언마운트)
  useEffect(() => {
    return () => {
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
    };
  }, []); // 마운트 시 한 번
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
    voiceSessionStatus,
    terminateWebRTCSession,
    initializeWebRTC,
    startPeerConnections,
    debugPeerConnections,
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
