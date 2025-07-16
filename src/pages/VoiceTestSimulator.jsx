// components/VoiceTestSimulator.js
import React, { useState } from 'react';
import { useWebSocket } from '../WebSocketProvider';
import { useVoiceStatusUpdate } from '../hooks/useVoiceWebSocket';

export default function VoiceTestSimulator() {
  const { sendMessage, isConnected } = useWebSocket();
  const [simulatedStates, setSimulatedStates] = useState({
    1: { is_mic_on: false, is_speaking: false },
    2: { is_mic_on: false, is_speaking: false },
    3: { is_mic_on: false, is_speaking: false },
  });

  // 음성 상태 업데이트 수신 (테스트용)
  useVoiceStatusUpdate((message) => {
    console.log('🎧 시뮬레이터에서 음성 상태 수신:', message);
    
    // 받은 메시지로 로컬 상태도 업데이트
    const { participant_id, is_mic_on, is_speaking } = message;
    setSimulatedStates(prev => ({
      ...prev,
      [participant_id]: { is_mic_on, is_speaking }
    }));
  });

  // 시뮬레이션 메시지 전송 (실제 서버에서 브로드캐스트되는 형식)
  const sendVoiceUpdate = (participantId, is_mic_on, is_speaking) => {
    const message = {
      participant_id: participantId,
      nickname: `테스트유저${participantId}`,
      is_mic_on,
      is_speaking
    };
    
    console.log('📡 시뮬레이션 메시지 전송:', message);
    
    // WebSocket으로 전송 (실제 환경에서는 서버에서 브로드캐스트)
    if (sendMessage && isConnected) {
      sendMessage(message);
    } else {
      console.warn('⚠️ WebSocket이 연결되지 않았습니다');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      fontSize: '12px',
      zIndex: 1000,
      minWidth: '300px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '14px' }}>🎮 음성 상태 시뮬레이터</h3>
      
      <div style={{ marginBottom: '15px', fontSize: '10px', color: '#ccc' }}>
        WebSocket 연결: {isConnected ? '✅' : '❌'}
      </div>
      
      {[1, 2, 3].map(participantId => (
        <div key={participantId} style={{ 
          marginBottom: '15px', 
          padding: '10px', 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '5px' 
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            참가자 {participantId} (Role {participantId})
          </div>
          
          <div style={{ marginBottom: '5px' }}>
            상태: 
            <span style={{ 
              color: simulatedStates[participantId].is_speaking ? '#4CAF50' : '#666', 
              marginLeft: '5px' 
            }}>
              {simulatedStates[participantId].is_speaking ? '🗣️ 말하는중' : '🤐 조용함'}
            </span>
            <span style={{ 
              color: simulatedStates[participantId].is_mic_on ? '#2196F3' : '#f44336', 
              marginLeft: '10px' 
            }}>
              {simulatedStates[participantId].is_mic_on ? '🎤 MIC ON' : '🔇 MIC OFF'}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            <button
              onClick={() => sendVoiceUpdate(participantId, true, false)}
              disabled={!isConnected}
              style={{
                padding: '4px 8px',
                fontSize: '10px',
                backgroundColor: isConnected ? '#2196F3' : '#666',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: isConnected ? 'pointer' : 'not-allowed'
              }}
            >
              마이크 ON
            </button>
            
            <button
              onClick={() => sendVoiceUpdate(participantId, true, true)}
              disabled={!isConnected}
              style={{
                padding: '4px 8px',
                fontSize: '10px',
                backgroundColor: isConnected ? '#4CAF50' : '#666',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: isConnected ? 'pointer' : 'not-allowed'
              }}
            >
              말하기 시작
            </button>
            
            <button
              onClick={() => sendVoiceUpdate(participantId, true, false)}
              disabled={!isConnected}
              style={{
                padding: '4px 8px',
                fontSize: '10px',
                backgroundColor: isConnected ? '#FF9800' : '#666',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: isConnected ? 'pointer' : 'not-allowed'
              }}
            >
              말하기 종료
            </button>
            
            <button
              onClick={() => sendVoiceUpdate(participantId, false, false)}
              disabled={!isConnected}
              style={{
                padding: '4px 8px',
                fontSize: '10px',
                backgroundColor: isConnected ? '#f44336' : '#666',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: isConnected ? 'pointer' : 'not-allowed'
              }}
            >
              마이크 OFF
            </button>
          </div>
        </div>
      ))}
      
      <div style={{ fontSize: '10px', color: '#ccc', marginTop: '10px' }}>
        💡 버튼을 클릭하여 음성 상태를 시뮬레이션하세요
        <br />
        📡 실제 서버에서는 브로드캐스트 형태로 전송됩니다
      </div>
    </div>
  );
}