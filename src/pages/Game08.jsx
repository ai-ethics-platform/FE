import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';      
import ContentBox3 from '../components/ContentBox3';
import Continue3 from '../components/Continue3';
import voiceManager from '../utils/voiceManager';

import closeIcon from '../assets/close.svg';

// 이미지 import
import img1 from '../assets/images/Android_dilemma_2_1.jpg';
import img2 from '../assets/images/Android_dilemma_2_2.jpg';
import img3 from '../assets/images/Android_dilemma_2_3.jpg';
import img4 from '../assets/images/Android_dilemma_2_4.jpg';
const comicImages = [img1, img2, img3, img4];

import profile1Img from '../assets/images/CharacterPopUp1.png';
import profile2Img from '../assets/images/CharacterPopUp2.png';
import profile3Img from '../assets/images/CharacterPopUp3.png';
const profileImages = { '1P': profile1Img, '2P': profile2Img, '3P': profile3Img };

import { useWebSocket } from '../WebSocketProvider';
import { useWebRTC } from '../WebRTCProvider';
import { useWebSocketNavigation, useHostActions } from '../hooks/useWebSocketMessage';
import { Colors,FontStyles } from '../components/styleConstants';
import Continue from '../components/Continue';
import { clearAllLocalStorageKeys } from '../utils/storage';

// 언어팩 가져오기
import { translations } from '../utils/language';

export default function Game08() {
  const navigate = useNavigate();
  const { isConnected, reconnectAttempts, maxReconnectAttempts,disconnect,finalizeDisconnection } = useWebSocket();
  //const { isInitialized: webrtcInitialized } = useWebRTC();

  //음성 녹음 종료를 위한 실험 코드 
  const { isInitialized: webrtcInitialized, stopAllOutgoingAudio } = useWebRTC();

  const { isHost } = useHostActions();

  const [paragraphs, setParagraphs] = useState([]);
  const [openProfile, setOpenProfile] = useState(null);
  
  // 현재 언어 설정 확인 (기본값 ko)
  const lang = localStorage.getItem('language') || 'ko';
  console.log('🔴 현재 언어:', lang);
  console.log('🔴 전체 번역 객체:', translations);
  console.log('🔴 현재 언어의 데이터:', translations[lang]);
  //  대문자 Game08 키로 접근
  const t = translations[lang]?.Game08 || translations['ko'].Game08; 

  // 제목도 언어팩에서 가져옴
  const subtopic = t.subtopic; 

 // 연결 상태 관리 (GameIntro에서 이미 초기화된 상태를 유지)
 const [connectionStatus, setConnectionStatus] = useState({
   websocket: true,
   webrtc: true,
   ready: true
 });

  // Navigation hooks
  useWebSocketNavigation(navigate, {
    infoPath: `/game09`,
    nextPagePath: `/game09`
  });


  // Clear all game-related localStorage
  function clearGameSession() {
    [
      'myrole_id','host_id','user_id','role1_user_id','role2_user_id','role3_user_id',
      'room_code','category','subtopic','mode','access_token','refresh_token',
      'mateName','nickname','title','session_id','selectedCharacterIndex',
      'currentRound','completedTopics','subtopicResults'
    ].forEach(key => localStorage.removeItem(key));
  }

  // Update connection status
  useEffect(() => {
    setConnectionStatus({
      websocket: isConnected,
      webrtc: webrtcInitialized,
      ready: isConnected && webrtcInitialized
    });
  }, [isConnected, webrtcInitialized]);
  
  
    // useEffect(() => {
    //   if (!isConnected && reconnectAttempts >= maxReconnectAttempts) {
    //     console.warn('🚫 WebSocket 재연결 실패 → 게임 초기화');
    //     alert('⚠️ 연결을 복구하지 못했습니다. 게임이 초기화됩니다.');
    //     clearAllLocalStorageKeys();
    //     navigate('/');
    //   }
    // }, [isConnected, reconnectAttempts, maxReconnectAttempts]);
    
    // 수정 끝나면 돌아와야함 
    // useEffect(() => {
    //        let cancelled = false;
    //        const isReloadingGraceLocal = () => {
    //          const flag = sessionStorage.getItem('reloading') === 'true';
    //          const expire = parseInt(sessionStorage.getItem('reloading_expire_at') || '0', 10);
    //          if (!flag) return false;
    //          if (Date.now() > expire) {
    //            sessionStorage.removeItem('reloading');
    //            sessionStorage.removeItem('reloading_expire_at');
    //            return false;
    //          }
    //          return true;
    //        };
          
    //        if (!isConnected) {
    //          // 1) reloading-grace가 켜져 있으면 finalize 억제
    //          if (isReloadingGraceLocal()) {
    //            console.log('♻️ reloading grace active — finalize 억제');
    //            return;
    //          }
          
    //          // 2) debounce: 잠깐 기다렸다가 여전히 끊겨있으면 finalize
    //          const DEBOUNCE_MS = 1200;
    //          const timer = setTimeout(() => {
    //            if (cancelled) return;
    //            if (!isConnected && !isReloadingGraceLocal()) {
    //              console.warn('🔌 WebSocket 연결 끊김 → 초기화 (확정)');
    //              finalizeDisconnection('❌ 연결이 끊겨 게임이 초기화됩니다.');
    //            } else {
    //              console.log('🔁 재연결/리로드 감지 — finalize 스킵');
    //            }
    //          }, DEBOUNCE_MS);
          
    //          return () => {
    //            cancelled = true;
    //            clearTimeout(timer);
    //          };
    //        }
    //      }, [isConnected, finalizeDisconnection]);
      
    

  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const results   = JSON.parse(localStorage.getItem('subtopicResults') ?? '{}');
    const category  = localStorage.getItem('category') || '안드로이드';
    const isAWS     = category === '자율 무기 시스템';
  
    // agree면 왼쪽, disagree면 오른쪽 선택 (기존 주석 유지)
    // const pick = (res, left, right) => (res === 'disagree' ? right : left);

    // ===== [AWS 시나리오] =====
    // 구조: Intro + Option1 + Mid + Option2 + End (조립형)
    if (isAWS) {
      // 결과 값 (agree / disagree) - 기본값 처리
      const rExplain  = results['AI 알고리즘 공개'] || 'agree';  // 동의/비동의
      const rPower    = results['AWS의 권한'] || 'agree';        // 강화/제한 (agree/disagree로 저장됨)
      const rZeroWar  = results['사람이 죽지 않는 전쟁'] || 'agree'; // 그렇다/아니다 (agree/disagree)
      const rRights   = results['AI의 권리와 책임'] || 'agree';      // 그렇다/아니다 (agree/disagree)
      const rRegulate = results['AWS 규제'] || 'agree';          // 유지/제한 (agree/disagree)
  
      const has = (key) => completed.includes(key);

      // 1) 문장 1 (안전성/책임 + 권한)
      // intro + opt1[rExplain] + mid + opt2[rPower] + end
      const p1Data = t.aws.p1;
      const p1 = `${p1Data.intro}${p1Data.opt1[rExplain]}${p1Data.mid}${p1Data.opt2[rPower]}${p1Data.end}`;
  
      // 2) 문장 2 (전쟁 양상 + 권리)
      const p2Data = t.aws.p2;
      const p2 = `${p2Data.intro}${p2Data.opt1[rZeroWar]}${p2Data.mid}${p2Data.opt2[rRights]}${p2Data.end}`;
  
      // 3) 문장 3 (세계 흐름)
      const p3Data = t.aws.p3;
      // p3는 mid, opt2가 없고 opt1과 end만 있는 구조
      const p3 = `${p3Data.intro}${p3Data.opt1[rRegulate]}${p3Data.end}`;
  
      // 4) 문장 4 (공통 마무리)
      const p4 = t.aws.p4;
  
      setParagraphs([p1, p2, p3, p4]);
      return;
    }
  
    // ===== [안드로이드 시나리오] ===== (기존 로직 흐름 유지)
    // 구조: 통문장 선택 (Safe vs Convenient)
    
    // 1st Paragraph: AI 개인정보(Safe vs Accurate) + 감정표현(Tool vs Friend)
    // 설명: AI 정보 수집을 '비동의'하면 보안/안전 중시(Safe), '동의'하면 정확성 중시(Convenient)
    const ai = results['AI의 개인 정보 수집'];
    const p1Type = (ai === 'disagree') ? 'safe' : 'convenient';
    const p1 = t.android.p1[p1Type];

    // 2nd Paragraph: 아이들 서비스(Limited vs Diverse) + 설명가능(Transparent vs Corporate)
    // 아이들 서비스를 '동의'(제한)하면 Safe, '비동의'(다양)하면 Convenient
    const kids = results['아이들을 위한 서비스'];
    const p2Type = (kids === 'agree') ? 'safe' : 'convenient';
    const p2 = t.android.p2[p2Type];

    // 3rd Paragraph: 지구/인간/AI (Env vs Tech Speed)
    // 환경/지구 보호 '동의'하면 Env, '비동의'(기술발전)하면 Fast
    const earth = results['지구, 인간, AI'];
    const p3Type = (earth === 'agree') ? 'env' : 'fast';
    const p3 = t.android.p3[p3Type];

    // 4th Paragraph: 공통 마무리
    const p4 = t.android.p4;
  
    setParagraphs([p1, p2, p3, p4]);

  }, [lang, t]); // 언어나 번역객체가 로드되면 실행

  // Combine for display
  const combinedText = paragraphs.join('\n\n');

  const handleExit = async () => {
    console.log('🚪 게임 종료 시작');
    
    try {
      //  STEP 1: 종료 전 상태 확인
      console.log('=== 종료 전 미디어 상태 확인 ===');
      await debugMediaState('종료 전');
      
      //  STEP 2: 즉시 브라우저 레벨 강제 정리 (더미 스트림 없이!)
      console.log('🚨 브라우저 레벨 즉시 강제 정리 시작...');
      await forceBrowserCleanupWithoutDummy();
      
      //  STEP 3: 강제 정리 후 상태 확인
      console.log('=== 강제 정리 후 상태 ===');
      await debugMediaState('강제 정리 후');
      
      // STEP 4: 기존 VoiceManager 종료 로직
      console.log('🛑 VoiceManager 종료 중...');
      const result = await voiceManager.terminateVoiceSession();
      console.log(result ? '✅ 음성 세션 종료 성공' : '❌ 음성 세션 종료 실패');
      
      // STEP 5: VoiceManager 종료 후 상태 확인
      console.log('=== VoiceManager 종료 후 상태 ===');
      await debugMediaState('VoiceManager 종료 후');
      
      // STEP 6: 추가 WebRTC 정리
      if (window.stopAllOutgoingAudioGlobal) {
        console.log('🛑 WebRTC 전역 오디오 정지 함수 호출');
        window.stopAllOutgoingAudioGlobal();
      }
      
      // STEP 7: 다시 한번 강제 정리 (더미 스트림 없이!)
      console.log('🚨 최종 강제 정리...');
      await forceBrowserCleanupWithoutDummy();

      // ✅ 의도적 '나가기'는 finalizeDisconnection으로 통일
      // - disconnect()를 직접 호출하면 Provider 쪽에서 "연결 끊김/게임 초기화" 알럿이 뜰 수 있음
      // - finalizeDisconnection은 중복 호출을 막고, 메시지도 여기서 지정 가능
      console.log('✅ 나가기 완료 → 메인으로 이동');
      await finalizeDisconnection?.('게임을 나갔습니다.');
      return;
      
    } catch (error) {
      console.error('❌ 게임 종료 중 오류:', error);
      // 오류가 발생해도 강제 정리 시도 (더미 스트림 없이!)
      await forceBrowserCleanupWithoutDummy();
      await finalizeDisconnection?.('게임을 나갔습니다.');
      return;
    }
  };

  //  핵심 수정: 더미 스트림 생성하지 않는 정리 함수
  const forceBrowserCleanupWithoutDummy = async () => {
    console.log('🚨 === 브라우저 레벨 강제 정리 시작 (더미 스트림 없이) ===');
    
    try {
      // 1. 모든 전역 객체의 스트림 확인 및 정리
      console.log('1️⃣ 전역 객체 스트림 정리...');
      
      // VoiceManager 완전 정리
      if (window.voiceManager) {
        console.log('🎤 VoiceManager 강제 정리');
        
        // MediaRecorder 강제 정지
        if (window.voiceManager.mediaRecorder) {
          try {
            if (window.voiceManager.mediaRecorder.state === 'recording') {
              console.log('⏹️ MediaRecorder 강제 정지');
              window.voiceManager.mediaRecorder.stop();
            }
          } catch (e) {
            console.log('⚠️ MediaRecorder 정지 실패:', e.message);
          }
          window.voiceManager.mediaRecorder = null;
        }
        
        // MediaStream 강제 정리
        if (window.voiceManager.mediaStream) {
          console.log('🔇 MediaStream 강제 정리');
          window.voiceManager.mediaStream.getTracks().forEach((track, i) => {
            console.log(`  트랙 ${i+1} 강제 정지: ${track.kind} (${track.readyState})`);
            if (track.readyState !== 'ended') {
              track.stop();
            }
          });
          window.voiceManager.mediaStream = null;
        }
        
        // VoiceManager 상태 완전 초기화
        window.voiceManager.isRecording = false;
        window.voiceManager.isConnected = false;
        window.voiceManager.sessionInitialized = false;
        window.voiceManager.recordedChunks = [];
      }
      
      // 2. 페이지의 모든 DOM 요소에서 미디어 스트림 찾아서 정리
      console.log('2️⃣ DOM 요소 미디어 스트림 정리...');
      const allElements = document.querySelectorAll('*');
      let foundElements = 0;
      
      allElements.forEach(el => {
        if (el.srcObject) {
          foundElements++;
          console.log(`📱 발견된 srcObject: ${el.tagName} - ${el.srcObject.constructor.name}`);
          
          if (typeof el.srcObject.getTracks === 'function') {
            el.srcObject.getTracks().forEach(track => {
              console.log(`  🔇 DOM 트랙 정지: ${track.kind} (${track.readyState})`);
              if (track.readyState !== 'ended') {
                track.stop();
              }
            });
          }
          el.srcObject = null;
        }
      });
      
      if (foundElements === 0) {
        console.log('✅ DOM에서 srcObject 없음');
      } else {
        console.log(`🔧 ${foundElements}개 DOM 요소 정리됨`);
      }
      
      // 3. WebRTC PeerConnection 강제 정리
      console.log('3️⃣ WebRTC PeerConnection 강제 정리...');
      if (window.debugWebRTC) {
        const status = window.debugWebRTC.getStatus();
        console.log(`WebRTC 연결 수: ${status.peerConnections}`);
      }
      
      // 🚨 4. 더미 스트림 생성 대신 직접적인 정리만
      console.log('4️⃣ 직접적인 미디어 정리 (더미 스트림 생성 안함)...');
      
      // AudioContext 정리
      console.log('5️⃣ AudioContext 정리...');
      if (window.voiceManager && window.voiceManager.audioContext) {
        try {
          if (window.voiceManager.audioContext.state !== 'closed') {
            await window.voiceManager.audioContext.close();
            console.log('🔊 AudioContext 강제 종료');
          }
          window.voiceManager.audioContext = null;
        } catch (e) {
          console.log('⚠️ AudioContext 정리 실패:', e.message);
        }
      }
      
      // 6. 브라우저에게 명시적으로 미디어 사용 완료 알림
      console.log('6️⃣ 브라우저 미디어 사용 완료 알림...');
      
      // 미디어 권한 상태 확인만 (새 스트림 생성 안함)
      try {
        const permission = await navigator.permissions.query({name: 'microphone'});
        console.log(`🎤 현재 마이크 권한 상태: ${permission.state}`);
        
        if (permission.state === 'granted') {
          console.log('📝 권한은 granted이지만 실제 스트림은 모두 정리됨');
        }
      } catch (e) {
        console.log('⚠️ 권한 확인 불가:', e.message);
      }
      
      console.log('✅ 브라우저 레벨 강제 정리 완료 (더미 스트림 생성 없이)');
      
    } catch (error) {
      console.error('❌ 브라우저 강제 정리 중 오류:', error);
    }
  };

  // 기존 debugMediaState 함수는 그대로 유지
  const debugMediaState = async (step) => {
    console.log(`\n📊 [${step}] 미디어 상태 디버깅:`);
    
    if (window.voiceManager) {
      const status = window.voiceManager.getStatus();
      console.log(`  VoiceManager 상태:`, {
        isConnected: status.isConnected,
        isSpeaking: status.isSpeaking,
        isRecording: status.isRecording,
        sessionInitialized: status.sessionInitialized,
        usingWebRTCStream: status.usingWebRTCStream
      });
      
      // MediaStream 상태
      if (window.voiceManager.mediaStream) {
        const tracks = window.voiceManager.mediaStream.getTracks();
        console.log(`  MediaStream:`, {
          id: window.voiceManager.mediaStream.id,
          active: window.voiceManager.mediaStream.active,
          trackCount: tracks.length
        });
        
        tracks.forEach((track, i) => {
          console.log(`    Track ${i + 1}:`, {
            kind: track.kind,
            enabled: track.enabled,
            readyState: track.readyState,
            label: track.label
          });
        });
      } else {
        console.log(`  MediaStream: null`);
      }
      
      // MediaRecorder 상태
      if (window.voiceManager.mediaRecorder) {
        console.log(`  MediaRecorder:`, {
          state: window.voiceManager.mediaRecorder.state,
          mimeType: window.voiceManager.mediaRecorder.mimeType
        });
      } else {
        console.log(`  MediaRecorder: null`);
      }
    }
    
    // DOM 검사
    const allElementsWithSrc = document.querySelectorAll('*');
    let foundSrcObjects = 0;
    allElementsWithSrc.forEach(el => {
      if (el.srcObject) {
        foundSrcObjects++;
        console.log(`  ⚠️ 발견된 srcObject: ${el.tagName}`, el.srcObject);
      }
    });
    
    if (foundSrcObjects === 0) {
      console.log(`  ✅ DOM srcObject: 없음`);
    } else {
      console.log(`  ⚠️ DOM srcObject: ${foundSrcObjects}개 발견!`);
    }
    
    console.log(`📊 [${step}] 디버깅 완료\n`);
  };

  // 🚨 페이지 언마운트 시에도 더미 스트림 생성 금지
  window.addEventListener('beforeunload', () => {
    console.log('🚪 페이지 언마운트 - 최종 마이크 정리 (더미 스트림 없이)');
    
    try {
      // 1. 전역 변수들 확인
      if (window.voiceManager) {
        if (window.voiceManager.mediaStream) {
          window.voiceManager.mediaStream.getTracks().forEach(track => track.stop());
          window.voiceManager.mediaStream = null;
        }
        if (window.voiceManager.mediaRecorder) {
          if (window.voiceManager.mediaRecorder.state !== 'inactive') {
            window.voiceManager.mediaRecorder.stop();
          }
          window.voiceManager.mediaRecorder = null;
        }
      }
      
      // 2. DOM 요소들
      document.querySelectorAll('audio, video').forEach(el => {
        if (el.srcObject) {
          el.srcObject.getTracks().forEach(track => track.stop());
          el.srcObject = null;
        }
      });
      
      console.log('✅ beforeunload 정리 완료 (더미 스트림 생성 없음)');
    } catch (e) {
      console.log('⚠️ beforeunload 정리 중 오류:', e);
    }
  });

  // 🚨 전역 함수도 더미 스트림 생성 없이 수정
  window.forceStopAllMicrophones = async () => {
    console.log('🚨 전역 마이크 강제 정지 함수 실행 (더미 스트림 없이)');
    
    try {
      // 1. 현재 페이지의 모든 미디어 요소 정리
      document.querySelectorAll('audio, video, *').forEach(el => {
        if (el.srcObject && typeof el.srcObject.getTracks === 'function') {
          el.srcObject.getTracks().forEach(track => {
            if (track.kind === 'audio' && track.readyState !== 'ended') {
              console.log(`🔇 강제 정지: ${track.label}`);
              track.stop();
            }
          });
          el.srcObject = null;
        }
      });
      
      // 2. VoiceManager 완전 정리
      if (window.voiceManager) {
        window.voiceManager.mediaStream = null;
        window.voiceManager.mediaRecorder = null;
        window.voiceManager.isRecording = false;
        window.voiceManager.isConnected = false;
      }
      
      console.log('✅ 전역 마이크 정지 완료 (더미 스트림 생성 없음)');
      return true;
    } catch (e) {
      console.log('⚠️ 전역 마이크 정지 실패:', e.message);
      return false;
    }
  };

  const handleBackClick = () => {
    const mode = localStorage.getItem('mode');
    navigate(mode === 'agree' ? '/game06' : '/game07'); 
  };
  const handleFutureClick = () => {
    
    navigate('/game09'); 
  };

  return (
    <>
      <Layout subtopic={subtopic}  onProfileClick={setOpenProfile}  onBackClick={handleBackClick} >
        <div style={{position:'absolute',top:'60%',left:'50%',transform:'translate(-50%,-50%)',width:'80vw',maxWidth:936,display:'flex',flexDirection:'column',alignItems:'center',padding:'0 16px'}}>
          <ContentBox3 text={combinedText} width={936} height={407} />
          
          <div
          style={{
            marginTop: 20,
            display: "flex",
            gap: 30,              // 버튼 사이 간격
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",     // 화면 좁아지면 자동 줄바꿈
          }}
        >
          {/* 버튼 텍스트도 언어팩 적용 */}
          <Continue label={t.buttons.future} width={264} height={72} onClick={handleFutureClick} />
          <Continue3 label={t.buttons.exit} width={264} height={72} onClick={handleExit} />
        </div>
        </div>
      </Layout>
    </>
  );
}