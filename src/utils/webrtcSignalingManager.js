// utils/webrtcSignalingManager.js
class WebRTCSignalingManager {
    constructor() {
      this.signalingWs = null;
      this.peerConnections = new Map(); // 다중 참가자를 위한 Map
      this.isConnected = false;
      this.roomCode = null;
      this.token = null;
      this.myRoleId = null;
      this.messageHandlers = new Map();
      
      // ICE 서버 설정
      this.iceServers = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };
    }
  
    // 시그널링 서버 연결
    async connectSignalingServer() {
      try {
        this.roomCode = localStorage.getItem('room_code');
        this.token = localStorage.getItem('access_token');
        this.myRoleId = localStorage.getItem('myrole_id');
  
        if (!this.roomCode || !this.token) {
          throw new Error('Room code or token not found');
        }
  
        const wsUrl = `wss://dilemmai.org/ws/voice/signaling?room_code=${this.roomCode}&token=${this.token}`;
        
        console.log('🔗 WebRTC 시그널링 서버 연결 시도:', wsUrl);
        
        this.signalingWs = new WebSocket(wsUrl);
        
        return new Promise((resolve, reject) => {
          this.signalingWs.onopen = (event) => {
            console.log('✅ WebRTC 시그널링 서버 연결 성공');
            this.isConnected = true;
            this.setupMessageHandlers();
            resolve(true);
          };
  
          this.signalingWs.onerror = (error) => {
            console.error('❌ WebRTC 시그널링 서버 연결 실패:', error);
            this.isConnected = false;
            reject(error);
          };
  
          this.signalingWs.onclose = (event) => {
            console.log('🔌 WebRTC 시그널링 서버 연결 종료');
            this.isConnected = false;
          };
        });
      } catch (error) {
        console.error('❌ WebRTC 시그널링 연결 오류:', error);
        throw error;
      }
    }
  
    // 메시지 핸들러 설정
    setupMessageHandlers() {
      this.signalingWs.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 WebRTC 시그널링 메시지 수신:', message);
  
          switch (message.type) {
            case 'offer':
              await this.handleOffer(message);
              break;
            case 'answer':
              await this.handleAnswer(message);
              break;
            case 'candidate':
              await this.handleCandidate(message);
              break;
            default:
              console.log('🤔 알 수 없는 메시지 타입:', message.type);
          }
  
          // 외부 핸들러 호출
          if (this.messageHandlers.has(message.type)) {
            this.messageHandlers.get(message.type)(message);
          }
        } catch (error) {
          console.error('❌ WebRTC 시그널링 메시지 처리 오류:', error);
        }
      };
    }
  
    // Offer 처리
    async handleOffer(message) {
      try {
        const { sdp, from_role } = message;
        
        console.log(`📞 Role ${from_role}로부터 Offer 수신`);
        
        // PeerConnection 생성 또는 가져오기
        const peerConnection = this.getPeerConnection(from_role);
        
        // Remote description 설정
        await peerConnection.setRemoteDescription(new RTCSessionDescription({
          type: 'offer',
          sdp: sdp
        }));
        
        // Answer 생성
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        // Answer 전송
        this.sendMessage({
          type: 'answer',
          sdp: answer.sdp,
          to_role: from_role
        });
        
        console.log(`📤 Role ${from_role}에게 Answer 전송 완료`);
        
      } catch (error) {
        console.error('❌ Offer 처리 오류:', error);
      }
    }
  
    // Answer 처리
    async handleAnswer(message) {
      try {
        const { sdp, from_role } = message;
        
        console.log(`📞 Role ${from_role}로부터 Answer 수신`);
        
        const peerConnection = this.getPeerConnection(from_role);
        
        await peerConnection.setRemoteDescription(new RTCSessionDescription({
          type: 'answer',
          sdp: sdp
        }));
        
        console.log(`✅ Role ${from_role}와 WebRTC 연결 완료`);
        
      } catch (error) {
        console.error('❌ Answer 처리 오류:', error);
      }
    }
  
    // ICE Candidate 처리
    async handleCandidate(message) {
      try {
        const { candidate, sdpMid, sdpMLineIndex, from_role } = message;
        
        console.log(`🧊 Role ${from_role}로부터 ICE Candidate 수신`);
        
        const peerConnection = this.getPeerConnection(from_role);
        
        await peerConnection.addIceCandidate(new RTCIceCandidate({
          candidate: candidate,
          sdpMid: sdpMid,
          sdpMLineIndex: sdpMLineIndex
        }));
        
        console.log(`✅ Role ${from_role} ICE Candidate 추가 완료`);
        
      } catch (error) {
        console.error('❌ ICE Candidate 처리 오류:', error);
      }
    }
  
    // PeerConnection 생성 또는 가져오기
    getPeerConnection(roleId) {
      if (!this.peerConnections.has(roleId)) {
        const peerConnection = new RTCPeerConnection(this.iceServers);
        
        // ICE candidate 이벤트 처리
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            this.sendMessage({
              type: 'candidate',
              candidate: event.candidate.candidate,
              sdpMid: event.candidate.sdpMid,
              sdpMLineIndex: event.candidate.sdpMLineIndex,
              to_role: roleId
            });
          }
        };
        
        // 연결 상태 변경 이벤트
        peerConnection.onconnectionstatechange = () => {
          console.log(`🔄 Role ${roleId} 연결 상태:`, peerConnection.connectionState);
        };
        
        // 미디어 스트림 수신 이벤트
        peerConnection.ontrack = (event) => {
          console.log(`🎵 Role ${roleId}로부터 미디어 스트림 수신:`, event.streams);
          // 여기서 받은 오디오 스트림을 처리
        };
        
        this.peerConnections.set(roleId, peerConnection);
      }
      
      return this.peerConnections.get(roleId);
    }
  
    // 다른 참가자에게 연결 시작 (Offer 생성)
    async startConnection(targetRoleId) {
      try {
        console.log(`🚀 Role ${targetRoleId}에게 연결 시작`);
        
        const peerConnection = this.getPeerConnection(targetRoleId);
        
        // 로컬 미디어 스트림 추가 (voiceManager에서 가져오기)
        // 이 부분은 voiceManager와 연동 필요
        
        // Offer 생성
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        // Offer 전송
        this.sendMessage({
          type: 'offer',
          sdp: offer.sdp,
          to_role: targetRoleId
        });
        
        console.log(`📤 Role ${targetRoleId}에게 Offer 전송 완료`);
        
      } catch (error) {
        console.error('❌ 연결 시작 오류:', error);
      }
    }
  
    // 시그널링 메시지 전송
    sendMessage(message) {
      if (this.signalingWs && this.isConnected) {
        const messageStr = JSON.stringify(message);
        this.signalingWs.send(messageStr);
        console.log('📤 시그널링 메시지 전송:', message);
      } else {
        console.error('❌ 시그널링 서버에 연결되지 않음');
      }
    }
  
    // 메시지 핸들러 등록
    addMessageHandler(type, handler) {
      this.messageHandlers.set(type, handler);
    }
  
    // 메시지 핸들러 제거
    removeMessageHandler(type) {
      this.messageHandlers.delete(type);
    }
  
    // 연결 상태 확인
    getConnectionStatus() {
      return {
        isSignalingConnected: this.isConnected,
        peerConnections: Array.from(this.peerConnections.entries()).map(([roleId, pc]) => ({
          roleId,
          connectionState: pc.connectionState,
          iceConnectionState: pc.iceConnectionState
        }))
      };
    }
  
    // 정리
    cleanup() {
      console.log('🧹 WebRTC 시그널링 매니저 정리');
      
      // PeerConnection 정리
      this.peerConnections.forEach((pc, roleId) => {
        pc.close();
        console.log(`🔌 Role ${roleId} PeerConnection 종료`);
      });
      this.peerConnections.clear();
      
      // WebSocket 정리
      if (this.signalingWs) {
        this.signalingWs.close();
        this.signalingWs = null;
      }
      
      this.isConnected = false;
      this.messageHandlers.clear();
    }
  }
  
  // 싱글톤 인스턴스 생성
  const webrtcSignalingManager = new WebRTCSignalingManager();
  export default webrtcSignalingManager;