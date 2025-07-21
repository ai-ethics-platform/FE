import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Background from '../components/Background';
import BackButton from '../components/BackButton';
import StatusCard from '../components/StatusCard';
import MicTestPopup from '../components/MicTestPopup';
import OutPopup from '../components/OutPopup';
import GameFrame from '../components/GameFrame';
import player1 from "../assets/1player_withnum.svg";
import player2 from "../assets/2player_withnum.svg";
import player3 from "../assets/3player_withnum.svg";
import axiosInstance from '../api/axiosInstance';
import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider'; 
import { FontStyles, Colors } from '../components/styleConstants';
import codeBg from '../assets/roomcodebackground.svg';
import voiceManager from '../utils/voiceManager';

export default function WaitingRoom() {
  const location = useLocation();
  const allTopics = ['안드로이드', '자율 무기 시스템'];
  const initialTopic = location.state?.topic || '안드로이드';
  const initialIndex = allTopics.indexOf(initialTopic);

  // WebSocket 연결
  const { isConnected, addMessageHandler, removeMessageHandler, sendMessage, initializeVoiceWebSocket } = useWebSocket();
  
  // 🔧 WebRTC 연결 - 중복 제거 및 단일 진입점 사용
  const { 
    isInitialized: webrtcInitialized, 
    signalingConnected, 
    peerConnections,
    initializeWebRTC,
    voiceSessionStatus,
    roleUserMapping,
    myRoleId,
    myUserId
  } = useWebRTC();
  
  // 디버깅을 위한 고유 클라이언트 ID 생성
  const [clientId] = useState(() => {
    const id = Math.random().toString(36).substr(2, 9);
    console.log(`🔍 클라이언트 ID: ${id}`);
    return id;
  });

  // 1) UI 상태
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [showMicPopup, setShowMicPopup] = useState(false);
  const [showOutPopup, setShowOutPopup] = useState(false);
  const [myStatusIndex, setMyStatusIndex] = useState(0);

  // 2) 유저 & 방 정보
  const [myPlayerId, setMyPlayerId] = useState(null);
  const [hostUserId, setHostUserId] = useState(null);

  // 3) 참가자 & 역할 상태
  const [participants, setParticipants] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [statusIndexMap, setStatusIndexMap] = useState({});
  const [hasAssignedRoles, setHasAssignedRoles] = useState(false);

  // 4) 음성 관련 상태
  const [voiceInitialized, setVoiceInitialized] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);

  // 5) 메시지 관련 상태 추가
  const [initMessageSent, setInitMessageSent] = useState(false);
  const [joinedUsers, setJoinedUsers] = useState(new Set());
  const [voiceStatusUsers, setVoiceStatusUsers] = useState(new Map());

  // 업데이트 중복 방지 플래그
  const [isUpdating, setIsUpdating] = useState(false);

  // 🔧 WebRTC 준비 완료 상태 추가
  const [webrtcReady, setWebrtcReady] = useState(false);
 
  const room_code = localStorage.getItem('room_code');

  // Websocket init 메시지 보내기 
  const sendInitMessage = () => {
    if (!isConnected || initMessageSent) return;
    
    const userId = localStorage.getItem('user_id');
    const nickname = localStorage.getItem('nickname');
    
    if (!userId || !nickname) {
      console.warn('⚠️ 사용자 정보가 없어서 init 메시지 전송 불가');
      return;
    }
    const initMessage = {
      type: "init",
      data: {
        user_id: parseInt(userId, 10),
        guest_id: null,
        nickname: nickname
      }
    };

    const success = sendMessage(initMessage);
    if (success) {
      setInitMessageSent(true);
      console.log(`📤 Websocket init 메시지 전송 완료:`, initMessage);
    } else {
      console.error(`❌ [${clientId}] init 메시지 전송 실패`);
    }
  };

  const sendVoiceStatusUpdate = (isMicOn, isSpeaking) => {
    if (!isConnected) return;

    const userId = localStorage.getItem('user_id');
    
    const voiceStatusMessage = {
      type: "voice_status_update",
      data: {
        user_id: parseInt(userId),
        guset_id:null,
        is_mic_on: isMicOn,
        is_speaking: isSpeaking,
        session_id: sessionId,
      }
    };

    const success = sendMessage(voiceStatusMessage);
    if (success) {
      console.log(`📤 [${clientId}] 음성 상태 업데이트:`, voiceStatusMessage);
    }
  };

  // 🔧 중복 WebSocket 연결 제거 - WebRTCProvider만 사용

  // A) 초기 데이터 로드 - 내 정보 조회 (우선순위 높음)
  const loadMyInfo = async () => {
    try {
      const { data: userInfo } = await axiosInstance.get('/users/me');
      const myUserId = userInfo.id;
      const nickname = userInfo.username || `Player_${myUserId}`;
      
      localStorage.setItem('nickname', nickname);
      localStorage.setItem('user_id', myUserId);
      
      setMyPlayerId(String(myUserId));
      
      return myUserId;
    } catch (err) {
      console.error(`❌ [${clientId}] 내 정보 로드 실패:`, err);
      return null;
    }
  };

  // B) participants 로드 및 역할 배정 확인
  const loadParticipants = async () => {
    try {
      const { data: room } = await axiosInstance.get(`/rooms/code/${room_code}`);
      
      setParticipants(room.participants);
      
      const hostUserId = room.created_by;
      setHostUserId(String(hostUserId));

      const readyMap = {};
      room.participants.forEach(p => {
        readyMap[String(p.user_id)] = p.is_ready ? 1 : 0;
      });
      setStatusIndexMap(readyMap);

      const hasRoleAssignments = room.participants.every(p => p.role_id != null);
      
      if (hasRoleAssignments && !hasAssignedRoles) {
        console.log(`🎭 [${clientId}] API에서 역할 배정 발견!`);
        
        const roleUserMap = {};
        room.participants.forEach(p => {
          roleUserMap[p.role_id] = String(p.user_id);
        });
        
        localStorage.setItem('role1_user_id', roleUserMap[1] || '');
        localStorage.setItem('role2_user_id', roleUserMap[2] || '');
        localStorage.setItem('role3_user_id', roleUserMap[3] || '');
        
        const myUserId = localStorage.getItem('user_id');
        const myParticipant = room.participants.find(p => String(p.user_id) === String(myUserId));
        if (myParticipant && myParticipant.role_id) {
          localStorage.setItem('myrole_id', String(myParticipant.role_id));
          console.log(`💾 [${clientId}] 내 역할 저장: ${myParticipant.role_id}`);
        }
        
        const hostParticipant = room.participants.find(p => String(p.user_id) === String(hostUserId));
        if (hostParticipant && hostParticipant.role_id) {
          localStorage.setItem('host_id', String(hostParticipant.role_id));
          console.log(`💾 [${clientId}] 호스트 역할 저장: ${hostParticipant.role_id}`);
        }
        
        setHasAssignedRoles(true);
        
        setTimeout(() => {
          updateAssignmentsWithRoles();
        }, 100);
      }

      return { participants: room.participants, hostUserId };
    } catch (err) {
      console.error(`❌ [${clientId}] participants 로드 실패:`, err);
      return { participants: [], hostUserId: null };
    }
  };

  // 음성 세션 초기화
  const initializeVoice = async () => {
    if (voiceInitialized) {
      console.log(`⚠️ [${clientId}] 음성이 이미 초기화됨`);
      return;
    }

    const sessionId = localStorage.getItem('session_id');
    if (!isConnected || !sessionId) {
      console.log(`⏳ [${clientId}] WebSocket 연결 및 세션 대기 중...`);
      setTimeout(() => initializeVoice(), 1000);
      return;
    }

    try {
      console.log(`🎤 [${clientId}] 음성 세션 초기화 시작`);
      
      window.webSocketInstance = { sendMessage };
      
      const success = await voiceManager.initializeVoiceSession();
      
      if (success) {
        setVoiceInitialized(true);
        setMicPermissionGranted(true);
        console.log(`✅ [${clientId}] 음성 세션 초기화 완료`);
        
        // 음성 초기화 완료 후 init 메시지 전송
        setTimeout(() => {
          sendInitMessage();
        }, 1000);
        
      } else {
        console.error(`❌ [${clientId}] 음성 세션 초기화 실패`);
        setMicPermissionGranted(false);
      }
    } catch (err) {
      console.error(`❌ [${clientId}] 음성 초기화 에러:`, err);
      setMicPermissionGranted(false);
    }
  };

  // 나머지 함수들은 기존과 동일...
  const updateAssignmentsWithRoles = async () => {
    if (participants.length === 0 || isUpdating) return;
    
    setIsUpdating(true);

    try {
      const updatedAssignments = participants.map(p => {
        let userRoleId = null;
        for (let roleId = 1; roleId <= 3; roleId++) {
          const roleUserId = localStorage.getItem(`role${roleId}_user_id`);
          if (roleUserId && String(roleUserId) === String(p.user_id)) {
            userRoleId = roleId;
            break;
          }
        }

        return {
          player_id: p.user_id,
          is_host: Boolean(p.is_host),
          role_id: userRoleId,
        };
      });

      setAssignments(updatedAssignments);
      
      if (myPlayerId) {
        const myAssign = updatedAssignments.find(a => String(a.player_id) === myPlayerId);
        if (myAssign?.role_id != null) {
          const currentMyRole = localStorage.getItem('myrole_id');
          if (currentMyRole !== String(myAssign.role_id)) {
            localStorage.setItem('myrole_id', String(myAssign.role_id));
          }
        }
      }
      
      if (hostUserId) {
        const hostAssign = updatedAssignments.find(a => String(a.player_id) === String(hostUserId));
        if (hostAssign?.role_id != null) {
          const currentHostId = localStorage.getItem('host_id');
          if (currentHostId !== String(hostAssign.role_id)) {
            localStorage.setItem('host_id', String(hostAssign.role_id));
          }
        }
      }
      
    } finally {
      setIsUpdating(false);
    }
  };

  const checkIfRolesAlreadyAssigned = () => {
    const role1 = localStorage.getItem('role1_user_id');
    const role2 = localStorage.getItem('role2_user_id');
    const role3 = localStorage.getItem('role3_user_id');
    
    return role1 && role2 && role3;
  };

  const checkRolesFromAPI = (participants) => {
    if (participants.length !== 3) return false;
    return participants.every(p => p.role_id != null);
  };

  const assignRoles = async () => {
    if (myPlayerId !== hostUserId) {
      console.log(`👤 [${clientId}] 방장이 아니므로 역할 배정 스킵`);
      return;
    }

    if (hasAssignedRoles || checkIfRolesAlreadyAssigned()) {
      console.log(`✅ [${clientId}] 역할이 이미 배정되어 있음`);
      setHasAssignedRoles(true);
      return;
    }

    try {
      setHasAssignedRoles(true);
      console.log(`🚀 [${clientId}] 👑 방장: 역할 배정 API 호출 시작`);
      
      const { data: roleAssignmentResult } = await axiosInstance.post(`/rooms/assign-roles/${room_code}`);
      
      if (roleAssignmentResult.assignments) {
        const assignments = roleAssignmentResult.assignments;
        const myUserId = localStorage.getItem('user_id');
        
        const roleUserMap = {};
        assignments.forEach(assignment => {
          roleUserMap[assignment.role_id] = String(assignment.player_id);
        });
        
        localStorage.setItem('role1_user_id', roleUserMap[1] || '');
        localStorage.setItem('role2_user_id', roleUserMap[2] || '');
        localStorage.setItem('role3_user_id', roleUserMap[3] || '');
        
        const myAssignment = assignments.find(a => String(a.player_id) === String(myUserId));
        if (myAssignment) {
          localStorage.setItem('myrole_id', String(myAssignment.role_id));
        }
        
        const hostAssignment = assignments.find(a => String(a.player_id) === String(hostUserId));
        if (hostAssignment) {
          localStorage.setItem('host_id', String(hostAssignment.role_id));
        }
        
        console.log(`💾 [${clientId}] 👑 방장: 로컬스토리지 저장 완료`);
      }
      
      setTimeout(() => {
        updateAssignmentsWithRoles();
      }, 300);
      
    } catch (err) {
      console.error(`❌ [${clientId}] 👑 방장: 역할 배정 실패:`, err);
      setHasAssignedRoles(false);
    }
  };

  // ✅ WebSocket 메시지 핸들러 강화
  useEffect(() => {
    if (!isConnected) return;

    const handlerId = 'waiting-room-enhanced';
    
    const messageHandler = (message) => {
      console.log(`📨 [${clientId}] WebSocket 메시지 수신:`, message);
      
      switch (message.type) {
        case 'join':
          if (message.participant_id && message.nickname) {
            setJoinedUsers(prev => new Set([...prev, message.participant_id]));
            console.log(`👋 [${clientId}] 새 유저 참가: ${message.nickname} (ID: ${message.participant_id})`);
          }
          
          setTimeout(() => {
            loadParticipants();
          }, 100);
          break;
          
        case 'voice_status_update':
          setTimeout(() => {
            loadParticipants();
          }, 100);
          break;
          
        default:
          if (message.participant_id && message.nickname) {
            setVoiceStatusUsers(prev => new Map(prev.set(message.participant_id, {
              nickname: message.nickname,
              is_mic_on: message.is_mic_on,
              is_speaking: message.is_speaking,
              lastUpdate: Date.now()
            })));
            
            console.log(`🎤 [${clientId}] 음성 상태 브로드캐스트: ${message.nickname} - 마이크: ${message.is_mic_on ? 'ON' : 'OFF'}, 말하기: ${message.is_speaking ? 'ON' : 'OFF'}`);
          }
          
          setTimeout(() => {
            loadParticipants();
          }, 200);
          break;
      }
    };
    
    addMessageHandler(handlerId, messageHandler);
    
    return () => {
      removeMessageHandler(handlerId);
    };
  }, [isConnected, room_code, sendMessage, joinedUsers]);

  // ✅ 음성 상태 변화 감지 및 전송
  useEffect(() => {
    if (!voiceInitialized || !isConnected) return;

    const statusInterval = setInterval(() => {
      const status = voiceManager.getStatus();
      
      if (status.isConnected !== voiceSessionStatus.isConnected || 
          status.isSpeaking !== voiceSessionStatus.isSpeaking) {
        
        sendVoiceStatusUpdate(status.isConnected, status.isSpeaking);
      }
    }, 500);

    return () => clearInterval(statusInterval);
  }, [voiceInitialized, isConnected, voiceSessionStatus]);

  // 나머지 useEffect들...

  useEffect(() => {
    if (
      participants.length === 3 &&
      myPlayerId === hostUserId &&
      !hasAssignedRoles
    ) {
      assignRoles();
    }
  }, [participants, myPlayerId, hostUserId, hasAssignedRoles]);

  useEffect(() => {
      if (hasAssignedRoles) return;

    const unifiedPolling = setInterval(async () => {
      try {
        const { data: room } = await axiosInstance.get(`/rooms/code/${room_code}`);
        
        setParticipants(room.participants);
        
        const readyMap = {};
        room.participants.forEach(p => {
          readyMap[String(p.user_id)] = p.is_ready ? 1 : 0;
        });
        setStatusIndexMap(readyMap);
        
        if (myPlayerId) {
          const myParticipant = room.participants.find(p => String(p.user_id) === myPlayerId);
          if (myParticipant) {
            setMyStatusIndex(myParticipant.is_ready ? 1 : 0);
          }
        }
        
        if (myPlayerId !== hostUserId && room.participants.length === 3) {
          const hasApiRoles = checkRolesFromAPI(room.participants);
          const hasLocalRoles = checkIfRolesAlreadyAssigned();
          
          if (hasApiRoles && !hasLocalRoles) {
            const roleUserMap = {};
            room.participants.forEach(p => {
              if (p.role_id) {
                roleUserMap[p.role_id] = String(p.user_id);
              }
            });
            
            localStorage.setItem('role1_user_id', roleUserMap[1] || '');
            localStorage.setItem('role2_user_id', roleUserMap[2] || '');
            localStorage.setItem('role3_user_id', roleUserMap[3] || '');
            
            const myUserId = localStorage.getItem('user_id');
            const myParticipant = room.participants.find(p => String(p.user_id) === String(myUserId));
            if (myParticipant && myParticipant.role_id) {
              localStorage.setItem('myrole_id', String(myParticipant.role_id));
            }
            
            const hostParticipant = room.participants.find(p => String(p.user_id) === String(hostUserId));
            if (hostParticipant && hostParticipant.role_id) {
              localStorage.setItem('host_id', String(hostParticipant.role_id));
            }
            
            setHasAssignedRoles(true);
            
            setTimeout(() => {
              updateAssignmentsWithRoles();
            }, 100);
          }
        }
        
      } catch (err) {
        console.error(`❌ [${clientId}] 통합 폴링 실패:`, err);
      }
    }, 2000);
    
    return () => {
      clearInterval(unifiedPolling);
    };
  }, [room_code, myPlayerId, hostUserId, hasAssignedRoles]);

  useEffect(() => {
    const initializeRoom = async () => {
      console.log(`🚀 [${clientId}] 초기화 시작`);
      
      const myUserId = await loadMyInfo();
      if (!myUserId) {
        console.error(`❌ [${clientId}] 사용자 정보 로드 실패`);
        return;
      }
      
      const { hostUserId: loadedHostUserId } = await loadParticipants();
      if (!loadedHostUserId) {
        console.error(`❌ [${clientId}] 호스트 정보 로드 실패`);
        return;
      }
      
      const isHost = String(myUserId) === String(loadedHostUserId);
      console.log(`👤 [${clientId}] 사용자 역할 확인:`, { 
        myUserId, 
        hostUserId: loadedHostUserId, 
        isHost: isHost ? '방장' : '일반 유저' 
      });
      
      const tryWebSocketInit = async (attempt = 1, maxAttempts = 5) => {
        try {
          await initializeVoiceWebSocket(isHost);
          console.log(`✅ [${clientId}] WebSocket 초기화 완료`);

          setTimeout(async () => {
            sendInitMessage();
            console.log(`📤 [${clientId}] WebSocket 초기화 메시지 전송 완료`);
          }, 2000);

          return true;
        } catch (error) {
          console.warn(`⚠️ [${clientId}] WebSocket 초기화 실패 (시도 ${attempt}/${maxAttempts})`);
          
          if (!isHost && attempt < maxAttempts) {
            setTimeout(() => {
              tryWebSocketInit(attempt + 1, maxAttempts);
            }, 3000);
            return false;
          } else {
            console.error(`❌ [${clientId}] WebSocket 초기화 최종 실패`);
            return false;
          }
        }
      };
      
      await tryWebSocketInit();
      
      if (checkIfRolesAlreadyAssigned()) {
        setHasAssignedRoles(true);
      }
      
      setTimeout(() => {
        updateAssignmentsWithRoles();
      }, 200);
    };
    
    initializeRoom();
  }, [room_code]);

  // 🔧 WebRTC 초기화 - 모든 조건이 충족되었을 때만 실행
  useEffect(() => {
    if (
      participants.length === 3 && 
      hasAssignedRoles && 
      !webrtcInitialized &&
      !webrtcReady
    ) {
      console.log('🚀 [WaitingRoom] WebRTC 초기화 조건 충족 - WebRTCProvider 시작');
      
      setWebrtcReady(true);
      
      // WebRTCProvider의 initializeWebRTC만 호출
      initializeWebRTC()
        .then(() => {
          console.log('✅ [WaitingRoom] WebRTCProvider 초기화 완료');
          
          // 음성 감지 시작
          setTimeout(() => {
            voiceManager.startSpeechDetection();
            console.log('🎤 [WaitingRoom] 음성 감지 시작');
          }, 2000);
        })
        .catch(err => {
          console.error('❌ [WaitingRoom] WebRTC 초기화 실패:', err);
          setWebrtcReady(false);
        });
    }
  }, [participants, hasAssignedRoles, webrtcInitialized, webrtcReady, initializeWebRTC]);

  useEffect(() => {
    const sessionId = localStorage.getItem('session_id');
    const myRoleId = localStorage.getItem('myrole_id');
    const hostId = localStorage.getItem('host_id');
    
    if (isConnected && sessionId && myRoleId && hostId && !voiceInitialized) {
      console.log(`🎤 [${clientId}] 음성 초기화 조건 충족`);
      
      setTimeout(() => {
        initializeVoice();
      }, 1000);
    }
  }, [isConnected, voiceInitialized]);

  useEffect(() => {
    if (hasAssignedRoles && isConnected && !voiceInitialized) {
      setTimeout(() => {
        const sessionId = localStorage.getItem('session_id');
        if (sessionId) {
          initializeVoice();
        }
      }, 500);
    }
  }, [hasAssignedRoles, isConnected, voiceInitialized]);

  useEffect(() => {
    if (participants.length > 0) {
      const timeoutId = setTimeout(() => {
        updateAssignmentsWithRoles();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [participants]);

  const handleMicConfirm = async () => {
    try {
      console.log(`🎤 [${clientId}] 준비하기 API 호출`);
      const { data } = await axiosInstance.post('/rooms/ready', { room_code });
      
      setMyStatusIndex(1);
      setShowMicPopup(false);
      
      setTimeout(() => {
        loadParticipants();
      }, 500);
      
      if (data.game_starting && data.start_time) {
        const delay = new Date(data.start_time) - new Date();
        setTimeout(() => window.location.href = '/gameintro2', delay);
      }
    } catch (err) {
      console.error(`❌ [${clientId}] ready 실패:`, err);
    }
  };

  useEffect(() => {
    if (participants.length === 0) return;
    const readyCount = participants.filter(p => p.is_ready).length;
    if (readyCount === participants.length && participants.length === 3) {
      console.log(`✅ [${clientId}] 모두 준비 완료 → 게임 시작`);
      window.location.href = '/gameintro2';
    }
  }, [participants]);

  useEffect(() => {
    return () => {
      if (voiceInitialized) {
        console.log(`🧹 [${clientId}] 컴포넌트 언마운트, 음성 정리`);
        voiceManager.cleanup();
      }
    };
  }, [voiceInitialized]);

  const getPlayerImage = (roleId) => {
    const playerImages = {
      1: player1,
      2: player2,
      3: player3
    };
    return playerImages[roleId] || player1;
  };

  const getOrderedPlayers = () => {
    if (!myPlayerId || assignments.length !== 3)
      return participants.map(p => p.user_id);

    const me = assignments.find(a => String(a.player_id) === myPlayerId);
    const others = assignments.filter(a => String(a.player_id) !== myPlayerId);
    return [others[0]?.player_id, me?.player_id, others[1]?.player_id].filter(Boolean);
  };

  // 디버깅용 전역 함수 강화
  useEffect(() => {
    window.debugWaitingRoom = {
      sendTestInit: () => {
        sendInitMessage();
      },
      sendTestVoiceStatus: (isMicOn = true, isSpeaking = false) => {
        sendVoiceStatusUpdate(isMicOn, isSpeaking);
      },
      
      // 현재 상태 확인
      getConnectionStatus: () => ({
        isConnected,
        voiceInitialized,
        webrtcInitialized,
        signalingConnected,
        initMessageSent,
        joinedUsers: Array.from(joinedUsers),
        voiceStatusUsers: Object.fromEntries(voiceStatusUsers),
        peerConnections: peerConnections.size,
        roleUserMapping,
        myRoleId,
        myUserId
      }),
      
      // P2P 연결 상태 확인
      checkP2PConnections: () => {
        console.log('🔗 P2P 연결 상태:');
        peerConnections.forEach((pc, userId) => {
          console.log(`User ${userId}: ${pc.connectionState}`);
        });
        return peerConnections;
      },
      
      // WebRTC Provider 상태 강제 확인
      forceWebRTCInit: () => {
        console.log('🔧 강제 WebRTC 초기화 시도');
        initializeWebRTC();
      }
    };

    return () => {
      delete window.debugWaitingRoom;
    };
  }, [isConnected, voiceInitialized, webrtcInitialized, signalingConnected, initMessageSent, joinedUsers, voiceStatusUsers, peerConnections, roleUserMapping, myRoleId, myUserId, initializeWebRTC]);

  return (
    <Background bgIndex={3}>
      {/* ✅ 디버깅 정보 강화 - WebRTC 상태 추가 */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '12px',
        borderRadius: '6px',
        fontSize: '11px',
        zIndex: 1000,
        maxWidth: '350px',
        fontFamily: 'monospace'
      }}>
        <div style={{color: '#00ff00'}}>🔍 Client: {clientId}</div>
        <div style={{color: isConnected ? '#00ff00' : '#ff0000'}}>
          WebSocket: {isConnected ? '✅' : '❌'}
        </div>
        <div style={{color: webrtcInitialized ? '#00ff00' : '#ff0000'}}>
          WebRTC Provider: {webrtcInitialized ? '✅' : '❌'}
        </div>
        <div style={{color: signalingConnected ? '#00ff00' : '#ff0000'}}>
          시그널링: {signalingConnected ? '✅' : '❌'}
        </div>
        <div style={{color: '#00ffff'}}>
          P2P 연결: {peerConnections.size}/2
        </div>
        <div style={{color: '#ffff00'}}>👥 참가자: {participants.length}/3</div>
        <div style={{color: '#00ffff'}}>👤 내 ID: {myPlayerId}</div>
        <div style={{color: '#ff00ff'}}>👑 호스트 ID: {hostUserId}</div>
        <div style={{color: myPlayerId === hostUserId ? '#00ff00' : '#ff0000'}}>
          🎯 방장: {myPlayerId === hostUserId ? 'YES' : 'NO'}
        </div>
        <div style={{color: hasAssignedRoles ? '#00ff00' : '#ff0000'}}>
          🎭 역할배정: {hasAssignedRoles ? 'DONE' : myPlayerId === hostUserId ? 'HOST_PENDING' : 'POLLING'}
        </div>
        <div style={{color: voiceInitialized ? '#00ff00' : '#ff0000'}}>
          🎤 음성세션: {voiceInitialized ? 'INIT' : 'PENDING'}
        </div>
        <div style={{color: micPermissionGranted ? '#00ff00' : '#ff0000'}}>
          🔊 마이크권한: {micPermissionGranted ? 'OK' : 'DENIED'}
        </div>
        <div>🎪 내 역할: {myRoleId || localStorage.getItem('myrole_id') || 'NONE'}</div>
        <div>👑 호스트 역할: {localStorage.getItem('host_id') || 'NONE'}</div>
        <div>✅ 준비완료: {participants.filter(p => p.is_ready).length}/3</div>
        <div>🔄 업데이트 중: {isUpdating ? 'YES' : 'NO'}</div>
        <div style={{color: webrtcReady ? '#00ff00' : '#ff0000'}}>
          🚀 WebRTC 준비: {webrtcReady ? 'READY' : 'WAITING'}
        </div>
        
        <div style={{ 
          fontSize: '10px', 
          marginTop: '8px', 
          borderTop: '1px solid #555', 
          paddingTop: '5px',
          color: '#cccccc'
        }}>
          <div>📦 LocalStorage:</div>
          <div>role1: {localStorage.getItem('role1_user_id') || 'NULL'}</div>
          <div>role2: {localStorage.getItem('role2_user_id') || 'NULL'}</div>
          <div>role3: {localStorage.getItem('role3_user_id') || 'NULL'}</div>
        </div>
        
        <div style={{ 
          fontSize: '10px', 
          marginTop: '5px', 
          borderTop: '1px solid #555', 
          paddingTop: '5px',
          color: '#cccccc'
        }}>
          <div>🌐 WebRTC Provider:</div>
          <div>초기화: {webrtcInitialized ? 'OK' : 'NO'}</div>
          <div>시그널링: {signalingConnected ? 'OK' : 'NO'}</div>
          <div>내 User ID: {myUserId || 'NULL'}</div>
          <div>내 Role ID: {myRoleId || 'NULL'}</div>
        </div>
      </div>

      {/* 뒤로 가기 */}
      <div
        style={{
          position: 'absolute',
          top: -10,
          left: -10,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          zIndex: 1000,
          cursor: 'pointer',
        }}
        onClick={() => setShowOutPopup(true)}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <BackButton />
        </div>
        <div
          style={{
            position: 'relative',
            width: 200,
            height: 80,
            marginLeft: -40,
            zIndex: 1,
            overflow: 'hidden'
          }}
        >
          <img
            src={codeBg}
            alt="code background"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'rotate(180deg)',
              clipPath: 'polygon(12% 0%, 100% 0%, 100% 100%, 0% 100%)'
            }}
          />
          <span
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...FontStyles.title,
              color: Colors.brandPrimary,
              userSelect: 'none',
            }}
          >
            CODE: {room_code}
          </span>
        </div>
      </div>

      {showOutPopup && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <OutPopup onClose={() => setShowOutPopup(false)} />
        </div>
      )}

      {/* 주제 프레임 */}
      <div style={{
        position: 'absolute', top: '6%', left: '50%',
        transform: 'translateX(-50%)'
      }}>
        <GameFrame
          topic={allTopics[currentIndex]}
          onLeftClick={() => {
            const next = Math.max(currentIndex - 1, 0);
            setCurrentIndex(next);
            localStorage.setItem('category', allTopics[next]);
          }}
          onRightClick={() => {
            const next = Math.min(currentIndex + 1, allTopics.length - 1);
            setCurrentIndex(next);
            localStorage.setItem('category', allTopics[next]);
          }}
          disableLeft={currentIndex === 0}
          disableRight={currentIndex === allTopics.length - 1}
          hideArrows={false}
        />
      </div>

      {/* 플레이어 카드 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 32,
        paddingTop: 160,
        height: '100vh',
        boxSizing: 'border-box'
      }}>
        {getOrderedPlayers().map((id, idx) => {
          const assign = assignments.find(a => String(a.player_id) === String(id));
          const isOwner = String(id) === hostUserId;
          const isMe = String(id) === myPlayerId;
          
          return (
            <div key={id} style={{ transform: `scale(${idx === 1 ? 1 : 0.9})` }}>
              <StatusCard
                player={`${id}P`}
                isOwner={isOwner}
                isMe={isMe}
                roleId={assign?.role_id}
                statusIndex={isMe
                  ? myStatusIndex
                  : statusIndexMap[String(id)] || 0}
                onContinueClick={() => setShowMicPopup(true)}
                onStatusChange={isMe ? setMyStatusIndex : undefined}
              />
            </div>
          );
        })}
      </div>

      {/* 준비하기 ▶ 마이크 테스트 팝업 */}
      {showMicPopup && (
        <MicTestPopup
          userImage={getPlayerImage(Number(localStorage.getItem('myrole_id')))}
          onConfirm={handleMicConfirm}
        />
      )}
    </Background>
  );
}