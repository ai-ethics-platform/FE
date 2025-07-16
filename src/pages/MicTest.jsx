// components/MicTest.js
import React, { useState, useRef, useEffect } from 'react';

export default function MicTest() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [error, setError] = useState(null);
  
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // 마이크 연결 시작
  const startMic = async () => {
    try {
      setError(null);
      console.log('🎤 마이크 접근 시도...');
      
      // 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });
      
      mediaStreamRef.current = stream;
      
      // 오디오 컨텍스트 생성
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      // 마이크 소스 연결
      const microphone = audioContextRef.current.createMediaStreamSource(stream);
      microphone.connect(analyserRef.current);
      
      // 분석기 설정
      analyserRef.current.fftSize = 512;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      setIsConnected(true);
      console.log('✅ 마이크 연결 성공!');
      
      // 음성 레벨 감지 시작
      const detectSpeech = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // 평균 음성 레벨 계산
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        const threshold = 50; // 음성 감지 임계값
        
        setMicLevel(average);
        
        const currentlySpeaking = average > threshold;
        
        if (currentlySpeaking !== isSpeaking) {
          setIsSpeaking(currentlySpeaking);
          console.log('🗣️ 음성 상태:', currentlySpeaking ? '말하는 중' : '조용함', 
                     `(레벨: ${average.toFixed(1)})`);
        }
        
        animationFrameRef.current = requestAnimationFrame(detectSpeech);
      };
      
      detectSpeech();
      
    } catch (error) {
      console.error('❌ 마이크 접근 실패:', error);
      setError(error.message);
      
      if (error.name === 'NotAllowedError') {
        setError('마이크 접근이 거부되었습니다. 브라우저 설정을 확인해주세요.');
      } else if (error.name === 'NotFoundError') {
        setError('마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.');
      }
    }
  };

  // 마이크 연결 중지
  const stopMic = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    setIsConnected(false);
    setIsSpeaking(false);
    setMicLevel(0);
    setError(null);
    
    console.log('🔇 마이크 연결 중지');
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopMic();
    };
  }, []);

  return (
    <div style={{ 
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h2>🎤 마이크 연결 테스트</h2>
      
      {/* 연결 상태 */}
      <div style={{ 
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <strong>연결 상태:</strong> 
          <span style={{ 
            color: isConnected ? 'green' : 'red',
            marginLeft: '10px',
            fontWeight: 'bold'
          }}>
            {isConnected ? '✅ 연결됨' : '❌ 연결 안됨'}
          </span>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <strong>말하는 중:</strong> 
          <span style={{ 
            color: isSpeaking ? 'blue' : 'gray',
            marginLeft: '10px',
            fontWeight: 'bold'
          }}>
            {isSpeaking ? '🗣️ 말하는 중' : '🤐 조용함'}
          </span>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <strong>음성 레벨:</strong> 
          <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
            {micLevel.toFixed(1)}
          </span>
        </div>
        
        {/* 음성 레벨 바 */}
        <div style={{ 
          width: '100%',
          height: '20px',
          backgroundColor: '#ddd',
          borderRadius: '10px',
          overflow: 'hidden',
          marginTop: '10px'
        }}>
          <div
            style={{
              width: `${Math.min(micLevel * 2, 100)}%`,
              height: '100%',
              backgroundColor: isSpeaking ? '#4CAF50' : '#ff9800',
              transition: 'width 0.1s ease, background-color 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div style={{ 
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: '8px',
          color: '#c62828'
        }}>
          <strong>⚠️ 에러:</strong> {error}
        </div>
      )}

      {/* 컨트롤 버튼 */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={isConnected ? stopMic : startMic}
          style={{
            padding: '15px 30px',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: isConnected ? '#f44336' : '#4CAF50',
            color: 'white',
            marginRight: '10px'
          }}
        >
          {isConnected ? '🔇 마이크 중지' : '🎤 마이크 시작'}
        </button>
      </div>

      {/* 시각적 피드백 */}
      {isConnected && (
        <div style={{ 
          textAlign: 'center',
          padding: '20px',
          backgroundColor: isSpeaking ? '#e3f2fd' : '#f5f5f5',
          borderRadius: '8px',
          border: isSpeaking ? '2px solid #2196F3' : '2px solid transparent',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ 
            fontSize: '48px',
            marginBottom: '10px',
            animation: isSpeaking ? 'pulse 1s infinite' : 'none'
          }}>
            {isSpeaking ? '🗣️' : '🤐'}
          </div>
          <div style={{ 
            fontSize: '18px',
            fontWeight: 'bold',
            color: isSpeaking ? '#1976d2' : '#666'
          }}>
            {isSpeaking ? '말하는 중...' : '마이크에 대고 말해보세요!'}
          </div>
        </div>
      )}

      {/* 사용 방법 */}
      <div style={{ 
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#fff3e0',
        border: '1px solid #ff9800',
        borderRadius: '8px'
      }}>
        <h3>📋 사용 방법</h3>
        <ol>
          <li>🎤 마이크 시작 버튼을 클릭하세요</li>
          <li>브라우저에서 마이크 접근 권한을 허용하세요</li>
          <li>마이크에 대고 말해보세요</li>
          <li>음성 레벨과 말하는 중 상태를 확인하세요</li>
        </ol>
      </div>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}