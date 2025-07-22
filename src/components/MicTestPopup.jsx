// import React from 'react';
// import closeIcon from '../assets/close.svg';
// import PrimaryButton from './PrimaryButton';
// import { Colors, FontStyles } from './styleConstants';

// export default function MicTestPopup({ onConfirm, userImage }) {
// return (
//     <div
//     style={{
//         position: 'absolute',
//         top: '50%',
//         left: '50%',
//         transform: 'translate(-50%, -50%)',
//         width: 552,
//         height: 540,
//         backgroundColor: Colors.componentBackgroundFloat,
//         borderRadius: 8,
//         boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         justifyContent: 'center',
//         zIndex: 10,
//     }}
//     >
//     <img
//         src={closeIcon}
//         alt="close"
//         onClick={onConfirm}
//         style={{
//             position: 'absolute',
//             top: 12,
//             right: 12,
//             width: 40,
//             height: 40,
//             cursor: 'pointer',
//         }} />

//     <div style={{ marginBottom: 32, ...FontStyles.headlineNormal, color:Colors.brandPrimary }}>
//         마이크를 테스트해 주세요
//     </div>

//       <img
//         src={userImage}
//         alt="user"
//         style={{
//           width: 120,
//           height: 120,
//           borderRadius: '50%',
//           objectFit: 'cover',
//           marginBottom: 32,
//         }}
//       />

//       <div
//         style={{
//           width: 240,
//           height: 24,
//           backgroundColor: Colors.grey04,
//           borderRadius: 4,
//           overflow: 'hidden',
//           marginBottom: 40,
//         }}
//       >
//         <div
//           style={{
//             width: '30%',
//             height: '100%',
//             backgroundColor: Colors.brandDark,
//             transition: 'width 0.2s',
//           }}
//         />
//       </div>

//       <PrimaryButton style={{ width: 168, height: 72 }} onClick={onConfirm}>
//         준비하기
//       </PrimaryButton>
//     </div>
//   );
// }

import React, { useState, useRef, useEffect } from 'react';
import closeIcon from '../assets/close.svg';
import PrimaryButton from './PrimaryButton';
import { Colors, FontStyles } from './styleConstants';

export default function MicTestPopup({ onConfirm, userImage }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const speakingTimeoutRef = useRef(null);

  // 마이크 연결 시작
  const startMic = async () => {
    if (isInitializing) return;
    
    try {
      setIsInitializing(true);
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
        const threshold = 25; // 음성 감지 임계값
        
        // 마이크 레벨 업데이트 (0-100 범위로 정규화)
        const normalizedLevel = Math.min(average * 2, 100);
        setMicLevel(normalizedLevel);
        
        const currentlySpeaking = average > threshold;
        
        if (currentlySpeaking !== isSpeaking) {
          setIsSpeaking(currentlySpeaking);
          console.log('🗣️ 음성 상태:', currentlySpeaking ? '말하는 중' : '조용함', 
                     `(레벨: ${average.toFixed(1)})`);
        }
        
        // 말하기 타이머 관리
        if (currentlySpeaking) {
          if (speakingTimeoutRef.current) {
            clearTimeout(speakingTimeoutRef.current);
          }
          speakingTimeoutRef.current = setTimeout(() => {
            setIsSpeaking(false);
          }, 500);
        }
        
        animationFrameRef.current = requestAnimationFrame(detectSpeech);
      };
      
      detectSpeech();
      
    } catch (error) {
      console.error('❌ 마이크 접근 실패:', error);
      
      if (error.name === 'NotAllowedError') {
        setError('마이크 접근이 거부되었습니다. 브라우저 설정을 확인해주세요.');
      } else if (error.name === 'NotFoundError') {
        setError('마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.');
      } else {
        setError('마이크 연결에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsInitializing(false);
    }
  };

  // 마이크 연결 중지
  const stopMic = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current);
      speakingTimeoutRef.current = null;
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
  };

  // 컴포넌트 마운트 시 자동으로 마이크 연결 시도
  useEffect(() => {
    startMic();
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      stopMic();
    };
  }, []);

  // 준비하기 버튼 클릭 시
  const handleConfirm = () => {
    // 마이크 테스트 성공 여부를 localStorage에 저장
    localStorage.setItem('mic_test_passed', 'true');
    
    // 마이크 리소스 정리
    stopMic();
    
    // 부모 컴포넌트로 확인 이벤트 전달
    onConfirm();
  };

  // 닫기 버튼 클릭 시
  const handleClose = () => {
    stopMic();
    onConfirm();
  };

  // 마이크 레벨에 따른 막대 색상 결정
  const getBarColor = () => {
    if (micLevel > 50) return Colors.brandPrimary;
    if (micLevel > 20) return Colors.brandDark;
    return Colors.grey04;
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 552,
        height: 540,
        backgroundColor: Colors.componentBackgroundFloat,
        borderRadius: 8,
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }}
    >
      <img
        src={closeIcon}
        alt="close"
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 40,
          height: 40,
          cursor: 'pointer',
        }} 
      />

      <div style={{ 
        marginBottom: 32, 
        ...FontStyles.headlineNormal, 
        color: Colors.brandPrimary 
      }}>
        마이크를 테스트해 주세요
      </div>

      {/* 사용자 이미지 */}
      <div style={{ position: 'relative', marginBottom: 32 }}>
        <img
          src={userImage}
          alt="user"
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            objectFit: 'cover',
            // 말하는 중일 때 테두리 효과
            border: isSpeaking ? `3px solid ${Colors.brandPrimary}` : '3px solid transparent',
            transition: 'border-color 0.3s ease',
          }}
        />
        
        {/* 마이크 상태 표시 */}
        {isConnected && (
          <div style={{
            position: 'absolute',
            bottom: -5,
            right: -5,
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: isSpeaking ? Colors.brandPrimary : Colors.grey04,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.3s ease',
            animation: isSpeaking ? 'pulse 1s infinite' : 'none'
          }}>
            <div style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: 'white'
            }} />
          </div>
        )}
      </div>

      {/* 마이크 레벨 막대 */}
      <div
        style={{
          width: 240,
          height: 24,
          backgroundColor: Colors.grey04,
          borderRadius: 4,
          overflow: 'hidden',
          marginBottom: 20,
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${micLevel}%`,
            height: '100%',
            backgroundColor: getBarColor(),
            transition: 'width 0.1s ease, background-color 0.3s ease',
          }}
        />
        
        {/* 임계값 표시선 */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: '2px',
          backgroundColor: 'rgba(0,0,0,0.3)',
          transform: 'translateX(-50%)'
        }} />
      </div>

      {/* 상태 메시지 */}
      <div style={{ 
        marginBottom: 20, 
        height: 20,
        ...FontStyles.body,
        color: Colors.textSecondary,
        textAlign: 'center'
      }}>
        {isInitializing && '마이크 연결 중'}
        {error && (
          <span style={{ color: Colors.error }}>
            {error}
          </span>
        )}
        {isConnected && !error && (
          <span style={{ color: isSpeaking ? Colors.brandPrimary : Colors.textSecondary }}>
            {isSpeaking ? ' 말하는 중 ' : ' 마이크에 대고 말해보세요'}
          </span>
        )}
      </div>

      {/* 준비하기 버튼 */}
      <PrimaryButton 
        style={{ 
          width: 168, 
          height: 72,
          opacity: isConnected && !error ? 1 : 0.5,
          cursor: isConnected && !error ? 'pointer' : 'not-allowed'
        }} 
        onClick={handleConfirm}
        disabled={!isConnected || error}
      >
        준비하기
      </PrimaryButton>
      
      {/* 재시도 버튼 (에러 발생 시) */}
      {error && (
        <button
          onClick={startMic}
          style={{
            marginTop: 10,
            padding: '8px 16px',
            backgroundColor: 'transparent',
            border: `1px solid ${Colors.brandPrimary}`,
            borderRadius: 4,
            color: Colors.brandPrimary,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          다시 시도
        </button>
      )}

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}