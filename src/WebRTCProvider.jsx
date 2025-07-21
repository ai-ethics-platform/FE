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

  // 🔧 상태 동기화 useEffect
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
      
      if (Object.values(mapping).some(id => id) && Object.values(roleUserMapping).every(id => !id)) {
        console.log(`🔄 [${providerId}] 역할 매핑 동기화:`, mapping);
        setRoleUserMapping(mapping);
      }
    };

    // 초기 동기화
    syncStateFromLocalStorage();
    
    // 주기적 동기화
    const syncInterval = setInterval(syncStateFromLocalStorage, 1000);
    
    return () => clearInterval(syncInterval);
  }, [myUserId, myRoleId, roleUserMapping, providerId]);

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
      if (currentUserRoleId) {
        for (let targetRole = currentUserRoleId + 1; targetRole <= 3; targetRole++) {
          const targetUserId = mapping[`role${targetRole}_user_id`];
          if (targetUserId) {
            console.log(`   → Role ${targetRole} (User ${targetUserId})에게 Offer 전송 예정`);
          }
        }
        for (let senderRole = 1; senderRole < currentUserRoleId; senderRole++) {
          const senderUserId = mapping[`role${senderRole}_user_id`];
          if (senderUserId) {
            console.log(`   ← Role ${senderRole} (User ${senderUserId})로부터 Offer 수신 예정`);
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
        console.log(`🎤 [${providerId}] 음성 세션 생성/조회 성공:`, voiceSession.session_id);
        localStorage.setItem('voice_session_id', voiceSession.session_id);
      } catch (sessionError) {
        console.error(`❌ [${providerId}] 음성 세션 생성 실패:`, sessionError);
      }
      
      return mapping;
      
    } catch (error) {
      console.error(`❌ [${providerId}] 역할별 사용자 매핑 저장 실패:`, error);
      return null;
    }
  }, [providerId]);

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

  // 🔧 PeerConnection 생성 (강화된 이벤트 핸들러)
  const createPeerConnection = useCallback((remoteUserId) => {
    console.log(`🔗 [${providerId}] PeerConnection 생성: User ${myUserId} ↔ User ${remoteUserId}`);
    
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(config);

    // 🔧 강화된 ICE candidate 이벤트 처리
    pc.onicecandidate = (event) => {
      if (event.candidate && signalingWsRef.current && signalingWsRef.current.readyState === WebSocket.OPEN) {
        console.log(`🧊 [${providerId}] ICE candidate 생성 → User ${remoteUserId}에게 전송`);
        console.log(`   Candidate 상세:`, {
          candidate: event.candidate.candidate.substring(0, 50) + '...',
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex
        });
        
        const candidateMessage = {
          type: "candidate",
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex
        };
        
        signalingWsRef.current.send(JSON.stringify(candidateMessage));
      }
    };

    // 🔧 강화된 연결 상태 변경 이벤트
    pc.onconnectionstatechange = () => {
      const remoteRoleId = getRoleIdByUserId(remoteUserId);
      console.log(`🔗 [${providerId}] Connection 상태 변경 (User ${remoteUserId}, Role ${remoteRoleId}):`, pc.connectionState);
      
      if (pc.connectionState === 'connected') {
        console.log(`✅ [${providerId}] P2P 연결 성공: User ${myUserId} (Role ${myRoleId}) ↔ User ${remoteUserId} (Role ${remoteRoleId})`);
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        console.log(`❌ [${providerId}] P2P 연결 실패/끊김: User ${myUserId} ↔ User ${remoteUserId}`);
      }
    };

    // 🔧 ICE 연결 상태 모니터링 추가
    pc.oniceconnectionstatechange = () => {
      const remoteRoleId = getRoleIdByUserId(remoteUserId);
      console.log(`🧊 [${providerId}] ICE 연결 상태 변경 (User ${remoteUserId}, Role ${remoteRoleId}):`, pc.iceConnectionState);
    };

    // 🔧 Signaling 상태 모니터링 추가
    pc.onsignalingstatechange = () => {
      const remoteRoleId = getRoleIdByUserId(remoteUserId);
      console.log(`📶 [${providerId}] Signaling 상태 변경 (User ${remoteUserId}, Role ${remoteRoleId}):`, pc.signalingState);
      
      // stable 상태가 되면 대기 중인 ICE candidate들 처리
      if (pc.signalingState === 'stable') {
        const pendingCands = pendingCandidates.current.get(remoteUserId) || [];
        if (pendingCands.length > 0) {
          console.log(`🔄 [${providerId}] 대기 중이던 ICE candidates 처리: ${pendingCands.length}개`);
          pendingCands.forEach(async (candidate) => {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
              console.log(`✅ [${providerId}] 지연된 ICE candidate 추가 완료: User ${remoteUserId}`);
            } catch (error) {
              console.warn(`⚠️ [${providerId}] 지연된 ICE candidate 추가 실패:`, error.message);
            }
          });
          pendingCandidates.current.delete(remoteUserId);
        }
      }
    };

    // 원격 스트림 수신 이벤트
    pc.ontrack = (event) => {
      console.log(`🎵 [${providerId}] 원격 스트림 수신 (User ${remoteUserId}):`, event.streams[0]);
      
      // 기존 오디오 요소 제거 (중복 방지)
      const existingAudio = document.querySelector(`audio[data-user-id="${remoteUserId}"]`);
      if (existingAudio) {
        existingAudio.remove();
        console.log(`🗑️ [${providerId}] 기존 오디오 요소 제거: User ${remoteUserId}`);
      }
      
      // 새 오디오 요소 생성
      const audioElement = document.createElement('audio');
      audioElement.srcObject = event.streams[0];
      audioElement.autoplay = true;
      audioElement.volume = 1.0;
      audioElement.setAttribute('data-user-id', remoteUserId);
      document.body.appendChild(audioElement);
      
      const remoteRoleId = getRoleIdByUserId(remoteUserId);
      console.log(`🔊 [${providerId}] 오디오 요소 생성 완료: User ${remoteUserId} (Role ${remoteRoleId})`);
    };

    return pc;
  }, [myUserId, getRoleIdByUserId, myRoleId, providerId]);

  // 🔧 Offer 처리
  const handleOffer = useCallback(async (message) => {
    try {
      console.log(`📨 [${providerId}] Offer 수신 처리 시작:`, message);
      
      // 역할 ID 확인 (localStorage에서 직접)
      let currentRoleId = myRoleId;
      if (!currentRoleId) {
        console.log(`⚠️ [${providerId}] myRoleId가 없음, localStorage에서 직접 확인 중...`);
        const storedRoleId = localStorage.getItem('myrole_id');
        if (storedRoleId) {
          currentRoleId = parseInt(storedRoleId);
          console.log(`📝 [${providerId}] localStorage myrole_id 사용: Role ${currentRoleId}`);
          setMyRoleId(currentRoleId);
        } else {
          console.error(`❌ [${providerId}] localStorage에서도 역할 ID를 찾을 수 없음`);
          return;
        }
      }
      
      console.log(`📋 [${providerId}] 현재 역할 ID: ${currentRoleId}`);
      
      // localStorage에서 직접 사용자 ID 확인
      const getSenderUserId = (roleId) => {
        const userId = localStorage.getItem(`role${roleId}_user_id`);
        console.log(`📝 [${providerId}] Role ${roleId} → User ${userId} (localStorage)`);
        return userId;
      };
      
      // 나보다 낮은 역할 ID들 확인
      const possibleSenders = [];
      for (let roleId = 1; roleId < currentRoleId; roleId++) {
        const senderUserId = getSenderUserId(roleId);
        if (senderUserId && !offerReceivedFromRoles.current.has(roleId)) {
          possibleSenders.push({ roleId, userId: senderUserId });
          console.log(`👤 [${providerId}] 가능한 발신자: Role ${roleId} (User ${senderUserId})`);
        }
      }
      
      console.log(`🔍 [${providerId}] 가능한 발신자 수: ${possibleSenders.length}`);
      
      if (possibleSenders.length === 0) {
        console.warn(`⚠️ [${providerId}] Role ${currentRoleId}로 Offer를 보낼 수 있는 역할이 없음`);
        console.log(`📝 [${providerId}] 이미 받은 Offer:`, Array.from(offerReceivedFromRoles.current));
        return;
      }
      
      // 가장 낮은 역할 ID부터 순차 처리
      const sender = possibleSenders[0];
      const remoteUserId = sender.userId;
      
      console.log(`✅ [${providerId}] Offer 발신자 확정: Role ${sender.roleId} (User ${remoteUserId})`);
      offerReceivedFromRoles.current.add(sender.roleId);
      
      // User ID 기반으로 PeerConnection 생성
      const pc = createPeerConnection(remoteUserId);
      setPeerConnections(prev => new Map(prev.set(remoteUserId, pc)));
      
      // 원격 SDP 설정
      await pc.setRemoteDescription(new RTCSessionDescription({
        type: 'offer',
        sdp: message.sdp
      }));
      
      console.log(`📝 [${providerId}] 원격 SDP 설정 완료: Role ${sender.roleId} (User ${remoteUserId})`);
      
      // 로컬 스트림 추가
      if (voiceManager.mediaStream) {
        voiceManager.mediaStream.getTracks().forEach(track => {
          pc.addTrack(track, voiceManager.mediaStream);
          console.log(`🎤 [${providerId}] 로컬 오디오 트랙 추가 (Answer 생성 시):`, track.kind);
        });
      }
      
      // Answer 생성
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      // Answer를 서버로 전송
      if (signalingWsRef.current && signalingWsRef.current.readyState === WebSocket.OPEN) {
        const answerMessage = {
          type: "answer",
          sdp: answer.sdp
        };
        
        signalingWsRef.current.send(JSON.stringify(answerMessage));
        console.log(`📤 [${providerId}] Answer 전송 완료: Role ${sender.roleId} (User ${remoteUserId})에게`, answerMessage);
      } else {
        console.error(`❌ [${providerId}] WebSocket이 연결되지 않음`);
      }
      
    } catch (error) {
      console.error(`❌ [${providerId}] Offer 처리 오류:`, error);
    }
  }, [createPeerConnection, myRoleId, providerId]);

  // 🔧 Answer 처리 수정 - signaling state 기반으로 개선
  const handleAnswer = useCallback(async (message) => {
    try {
      console.log(`📨 [${providerId}] Answer 수신 처리 시작:`, message);
      
      // localStorage에서 역할 ID 확인
      let currentRoleId = myRoleId;
      if (!currentRoleId) {
        const storedRoleId = localStorage.getItem('myrole_id');
        if (storedRoleId) {
          currentRoleId = parseInt(storedRoleId);
          console.log(`📝 [${providerId}] Answer 처리 - localStorage에서 역할 ID 사용: Role ${currentRoleId}`);
          setMyRoleId(currentRoleId);
        } else {
          console.warn(`⚠️ [${providerId}] Answer 처리 - 역할 ID를 찾을 수 없음`);
          return;
        }
      }
      
      console.log(`📋 [${providerId}] Answer 처리 디버깅:`);
      console.log(`  - 내 Role ID: ${currentRoleId}`);
      console.log(`  - 내가 보낸 Offer:`, Array.from(offerSentToRoles.current));
      console.log(`  - 현재 PeerConnection:`, Array.from(peerConnections.keys()));
      
      // 🔧 중요한 수정: signaling state로 Offer를 보낸 연결 찾기
      let targetPc = null;
      let targetUserId = null;
      let targetRoleId = null;
      
      for (const [userId, pc] of peerConnections.entries()) {
        console.log(`🔍 [${providerId}] User ${userId} 연결 상태 상세:`, {
          localDescription: !!pc.localDescription,
          localDescriptionType: pc.localDescription?.type,
          remoteDescription: !!pc.remoteDescription,
          remoteDescriptionType: pc.remoteDescription?.type,
          connectionState: pc.connectionState,
          signalingState: pc.signalingState,
          iceConnectionState: pc.iceConnectionState
        });
        
        // 🔧 수정: have-local-offer 상태인 연결 찾기 (Offer를 보낸 연결)
        if (pc.signalingState === 'have-local-offer') {
          targetPc = pc;
          targetUserId = userId;
          
          // 해당 User의 Role ID 찾기
          for (let roleId = 1; roleId <= 3; roleId++) {
            const roleUserId = localStorage.getItem(`role${roleId}_user_id`);
            if (roleUserId === userId) {
              targetRoleId = roleId;
              break;
            }
          }
          
          console.log(`✅ [${providerId}] Answer 대상 발견 (signaling state 기준): User ${userId} (Role ${targetRoleId})`);
          break;
        }
      }
      
      if (!targetPc || !targetUserId) {
        console.warn(`⚠️ [${providerId}] have-local-offer 상태의 PeerConnection이 없음`);
        console.log(`📝 [${providerId}] 모든 PeerConnection signaling 상태:`);
        peerConnections.forEach((pc, userId) => {
          console.log(`  User ${userId}: ${pc.signalingState} (connection: ${pc.connectionState})`);
        });
        return;
      }
      
      // Answer 설정
      await targetPc.setRemoteDescription(new RTCSessionDescription({
        type: 'answer',
        sdp: message.sdp
      }));
      
      console.log(`✅ [${providerId}] Answer 처리 완료: User ${targetUserId} (Role ${targetRoleId})`);
      console.log(`📝 [${providerId}] 업데이트된 연결 상태:`, {
        connectionState: targetPc.connectionState,
        iceConnectionState: targetPc.iceConnectionState,
        signalingState: targetPc.signalingState
      });
      
    } catch (error) {
      console.error(`❌ [${providerId}] Answer 처리 오류:`, error);
    }
  }, [peerConnections, myRoleId, providerId]);

  // 🔧 ICE Candidate 처리 개선 - 대기 큐 시스템 추가
  const handleCandidate = useCallback(async (message) => {
    try {
      console.log(`📨 [${providerId}] ICE Candidate 수신 처리:`, message);
      
      if (peerConnections.size === 0) {
        console.warn(`⚠️ [${providerId}] PeerConnection이 없음 - Candidate 무시`);
        return;
      }
      
      const candidate = {
        candidate: message.candidate,
        sdpMid: message.sdpMid,
        sdpMLineIndex: message.sdpMLineIndex
      };
      
      // 🔧 수정: 더 관대한 조건으로 유효한 PeerConnection 찾기
      const validPeers = Array.from(peerConnections.entries())
        .filter(([userId, pc]) => {
          const hasRemoteSdp = pc.remoteDescription !== null;
          const validSignalingStates = ['stable', 'have-remote-offer', 'have-local-offer'];
          const isValidSignalingState = validSignalingStates.includes(pc.signalingState);
          const isValidConnectionState = !['failed', 'closed'].includes(pc.connectionState);
          
          console.log(`🔍 [${providerId}] User ${userId} 유효성 검사:`, {
            hasRemoteSdp,
            signalingState: pc.signalingState,
            isValidSignalingState,
            connectionState: pc.connectionState,
            isValidConnectionState,
            결과: hasRemoteSdp && isValidSignalingState && isValidConnectionState
          });
          
          return hasRemoteSdp && isValidSignalingState && isValidConnectionState;
        });
      
      console.log(`🔍 [${providerId}] 유효한 PeerConnection 수: ${validPeers.length}/${peerConnections.size}`);
      
      if (validPeers.length === 0) {
        // 🔧 추가: Candidate를 일시적으로 저장
        console.warn(`⚠️ [${providerId}] 유효한 PeerConnection이 없음 - candidates를 임시 저장`);
        
        // 모든 PeerConnection에 대해 일시적으로 저장
        peerConnections.forEach((pc, userId) => {
          if (!pendingCandidates.current.has(userId)) {
            pendingCandidates.current.set(userId, []);
          }
          pendingCandidates.current.get(userId).push(candidate);
          console.log(`📦 [${providerId}] ICE candidate 임시 저장: User ${userId}`);
        });
        return;
      }
      
      // 모든 유효한 연결에 Candidate 추가
      for (const [remoteUserId, pc] of validPeers) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          
          const remoteRoleId = getRoleIdByUserId(remoteUserId);
          console.log(`✅ [${providerId}] ICE Candidate 추가 완료: User ${remoteUserId} (Role ${remoteRoleId})`);
        } catch (error) {
          console.warn(`⚠️ [${providerId}] ICE Candidate 추가 실패 (User ${remoteUserId}):`, error.message);
        }
      }
      
    } catch (error) {
      console.error(`❌ [${providerId}] ICE Candidate 처리 오류:`, error);
    }
  }, [peerConnections, getRoleIdByUserId, providerId]);

  // 🔧 Offer 생성 및 전송
  const createAndSendOffer = useCallback(async (targetRoleId) => {
    try {
      const remoteUserId = getUserIdByRole(targetRoleId);
      if (!remoteUserId) {
        console.warn(`⚠️ [${providerId}] Role ${targetRoleId}에 해당하는 사용자 없음`);
        return;
      }
      
      console.log(`🚀 [${providerId}] Offer 생성 시작 → Role ${targetRoleId} (User ${remoteUserId})`);
      
      // Role 기반 추적
      offerSentToRoles.current.add(targetRoleId);
      
      // User ID 기반 PeerConnection 생성
      const pc = createPeerConnection(remoteUserId);
      setPeerConnections(prev => new Map(prev.set(remoteUserId, pc)));
      
      // 로컬 스트림 추가
      if (voiceManager.mediaStream) {
        voiceManager.mediaStream.getTracks().forEach(track => {
          pc.addTrack(track, voiceManager.mediaStream);
          console.log(`🎤 [${providerId}] 로컬 오디오 트랙 추가:`, track.kind);
        });
      }
      
      // Offer 생성
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // Offer를 서버로 전송
      if (signalingWsRef.current && signalingWsRef.current.readyState === WebSocket.OPEN) {
        const offerMessage = {
          type: "offer",
          sdp: offer.sdp
        };
        
        signalingWsRef.current.send(JSON.stringify(offerMessage));
        console.log(`📤 [${providerId}] Offer 생성 → Role ${targetRoleId} (User ${remoteUserId})에게 전송 완료`, offerMessage);
      } else {
        console.error(`❌ [${providerId}] 시그널링 WebSocket이 연결되지 않음`);
      }
      
    } catch (error) {
      console.error(`❌ [${providerId}] Offer 생성 오류:`, error);
    }
  }, [createPeerConnection, getUserIdByRole, providerId]);

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
          console.log(`✅ [${providerId}] WebSocket 연결 성공 (User 토큰 기반)`);
          
          setSignalingConnected(true);
          signalingWsRef.current = ws;
        };

        ws.onmessage = async (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log(`📨 [${providerId}] 시그널링 메시지 수신:`, message);

            if (message.type === 'offer') {
              await handleOffer(message);
            } else if (message.type === 'answer') {
              await handleAnswer(message);
            } else if (message.type === 'candidate') {
              await handleCandidate(message);
            } else {
              console.log(`❓ [${providerId}] 알 수 없는 메시지 타입:`, message.type);
            }
          } catch (error) {
            console.error(`❌ [${providerId}] 시그널링 메시지 처리 오류:`, error);
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
  }, [handleOffer, handleAnswer, handleCandidate, providerId]);

  // 🔧 P2P 연결 시작
  const startPeerConnections = useCallback(() => {
    if (!myRoleId || !Object.values(roleUserMapping).some(id => id)) {
      console.log(`⏳ [${providerId}] P2P 연결 대기 중 - 역할 ID 또는 역할 매핑 없음`);
      return;
    }

    console.log(`🚀 [${providerId}] P2P 연결 시작: 내 역할 ${myRoleId} (User ${myUserId})`);

    // Role 기반 연결 순서, User ID로 실제 통신
    for (let targetRoleId = myRoleId + 1; targetRoleId <= 3; targetRoleId++) {
      const targetUserId = getUserIdByRole(targetRoleId);
      if (targetUserId) {
        console.log(`➡️ [${providerId}] Role ${targetRoleId} (User ${targetUserId})에게 Offer 전송 예정 (내 역할: ${myRoleId})`);
        setTimeout(() => {
          createAndSendOffer(targetRoleId);
        }, (targetRoleId - myRoleId) * 1000);
      } else {
        console.log(`⚠️ [${providerId}] Role ${targetRoleId}에 해당하는 사용자 없음`);
      }
    }
    
    // 내가 받을 Offer 확인
    for (let senderRoleId = 1; senderRoleId < myRoleId; senderRoleId++) {
      const senderUserId = getUserIdByRole(senderRoleId);
      if (senderUserId) {
        console.log(`⬅️ [${providerId}] Role ${senderRoleId} (User ${senderUserId})로부터 Offer 대기 중`);
      }
    }
  }, [myRoleId, roleUserMapping, getUserIdByRole, createAndSendOffer, myUserId, providerId]);

  // 🔧 WebRTC 초기화
  const initializeWebRTC = useCallback(async () => {
    if (initializationPromiseRef.current) {
      console.log(`⚠️ [${providerId}] 이미 초기화 진행 중`);
      return initializationPromiseRef.current;
    }

    initializationPromiseRef.current = (async () => {
      try {
        console.log(`🚀 [${providerId}] WebRTC 초기화 시작`);
        
        // 1. 사용자 ID 확인/설정
        let userId = localStorage.getItem('user_id');
        if (!userId) {
          console.log(`⚠️ [${providerId}] user_id가 없음, /users/me에서 가져오는 중...`);
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
        
        // 3. 음성 세션 초기화
        const voiceSuccess = await voiceManager.initializeVoiceSession();
        if (!voiceSuccess) {
          console.error(`❌ [${providerId}] 음성 세션 초기화 실패`);
          return false;
        }
        
        // 4. WebSocket 연결
        connectSignalingWebSocket();
        
        // 5. 상태 업데이트 주기적 확인
        const statusInterval = setInterval(() => {
          const currentStatus = voiceManager.getStatus();
          setVoiceSessionStatus(currentStatus);
        }, 100);
        
        setIsInitialized(true);
        console.log(`✅ [${providerId}] WebRTC 초기화 완료 (Role-User 하이브리드 방식)`);
        
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

  // 🔧 디버깅 함수
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
    console.log(`📤 [${providerId}] 보낸 Offer:`, Array.from(offerSentToRoles.current));
    console.log(`📥 [${providerId}] 받은 Offer:`, Array.from(offerReceivedFromRoles.current));
    console.log(`📦 [${providerId}] 대기 중인 Candidates:`, pendingCandidates.current.size);
  }, [peerConnections, getRoleIdByUserId, roleUserMapping, myUserId, myRoleId, providerId]);

  // 🔧 P2P 연결 시작 useEffect
  useEffect(() => {
    if (signalingConnected && myRoleId && Object.values(roleUserMapping).some(id => id)) {
      console.log(`🚀 [${providerId}] 시그널링 연결 완료, Role-User 하이브리드 P2P 연결 시작`);
      
      setTimeout(() => {
        startPeerConnections();
      }, 1000);
    }
  }, [signalingConnected, myRoleId, roleUserMapping, startPeerConnections, providerId]);

  // 🔧 디버깅 도구 useEffect
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
              console.log(`✅ 강제 ICE candidate 추가 완료`);
            } catch (error) {
              console.warn(`⚠️ 강제 ICE candidate 추가 실패:`, error.message);
            }
          });
          pendingCandidates.current.delete(userId);
        }
      }
    };
    
    return () => {
      delete window.debugWebRTC;
    };
  }, [peerConnections, signalingConnected, myUserId, myRoleId, roleUserMapping, debugPeerConnections]);

  // 🔧 정리 useEffect
  useEffect(() => {
    return () => {
      console.log(`🧹 [${providerId}] WebRTC Provider 정리 시작`);
      
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
      pendingCandidates.current.clear();
      
      console.log(`✅ [${providerId}] WebRTC Provider 정리 완료`);
    };
  }, [providerId]);

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