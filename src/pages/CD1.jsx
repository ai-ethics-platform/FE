// pages/CD1.jsx
import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox2';
// Player1 description images for different subtopics
import player1DescImg_title1 from '../assets/1player_des1.svg';
import player1DescImg_title2 from '../assets/1player_des2.svg';
import player1DescImg_title3 from '../assets/1player_des3.svg';
import AWS_1 from '../assets/1player_AWS_1.svg';
import AWS_2 from '../assets/1player_AWS_2.svg';
import AWS_3 from '../assets/1player_AWS_3.svg';
import AWS_4 from '../assets/1player_AWS_4.svg';
import AWS_5 from '../assets/1player_AWS_5.svg';

import defaultimg from "../assets/images/Frame235.png";


import { resolveParagraphs } from '../utils/resolveParagraphs';
import { useHostActions, useWebSocketNavigation } from '../hooks/useWebSocketMessage';
import { useWebRTC } from '../WebRTCProvider';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import axiosInstance from '../api/axiosInstance';
import { useWebSocket } from '../WebSocketProvider';


export default function CD1() {
  const navigate = useNavigate();
  useWebSocketNavigation(navigate, { infoPath: '/game02', nextPagePath: '/game02' });
  const { isConnected, reconnectAttempts, maxReconnectAttempts,finalizeDisconnection } = useWebSocket();

  const category = localStorage.getItem('category') || '안드로이드';
  const isAWS = category === '자율 무기 시스템';

  //  커스텀 모드 판단: code 존재 여부
  const isCustomMode = !!localStorage.getItem('code');

  //  커스텀 모드일 때 subtopic은 creatorTitle로 대체
  const rawSubtopic = localStorage.getItem('subtopic');
  const creatorTitle = localStorage.getItem('creatorTitle') || '';
  const subtopic = isCustomMode ? creatorTitle : (rawSubtopic || '');
 const [round, setRound] = useState();
 // 1. 라운드 계산
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const nextRound = completed.length + 1;
    setRound(nextRound);
    localStorage.setItem('currentRound', String(nextRound));
  }, []);

  //  //새로고침 시 재연결 로직 
  // useEffect(() => {
  //     let cancelled = false;
  //     const isReloadingGraceLocal = () => {
  //       const flag = sessionStorage.getItem('reloading') === 'true';
  //       const expire = parseInt(sessionStorage.getItem('reloading_expire_at') || '0', 10);
  //       if (!flag) return false;
  //       if (Date.now() > expire) {
  //         sessionStorage.removeItem('reloading');
  //         sessionStorage.removeItem('reloading_expire_at');
  //         return false;
  //       }
  //       return true;
  //     };
    
  //     if (!isConnected) {
  //       // 1) reloading-grace가 켜져 있으면 finalize 억제
  //       if (isReloadingGraceLocal()) {
  //         console.log('♻️ reloading grace active — finalize 억제');
  //         return;
  //       }
    
  //       // 2) debounce: 잠깐 기다렸다가 여전히 끊겨있으면 finalize
  //       const DEBOUNCE_MS = 1200;
  //       const timer = setTimeout(() => {
  //         if (cancelled) return;
  //         if (!isConnected && !isReloadingGraceLocal()) {
  //           console.warn('🔌 WebSocket 연결 끊김 → 초기화 (확정)');
  //           finalizeDisconnection('❌ 연결이 끊겨 게임이 초기화됩니다.');
  //         } else {
  //           console.log('🔁 재연결/리로드 감지 — finalize 스킵');
  //         }
  //       }, DEBOUNCE_MS);
    
  //       return () => {
  //         cancelled = true;
  //         clearTimeout(timer);
  //       };
  //     }
  //   }, [isConnected, finalizeDisconnection]);
    

  const mateName = localStorage.getItem('mateName') ?? 'HomeMate';

  const { voiceSessionStatus, roleUserMapping, myRoleId } = useWebRTC();
  const { getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);
  const { isHost, sendNextPage } = useHostActions();

  const getVoiceState = (role) => {
    if (String(role) === myRoleId) {
      return {
        is_speaking: voiceSessionStatus.isSpeaking,
        is_mic_on: voiceSessionStatus.isConnected,
        nickname: voiceSessionStatus.nickname || '',
      };
    }
    return getVoiceStateForRole(role);
  };

// 받침(종성) 유무 판별
function hasFinalConsonant(kor) {
  const lastChar = kor[kor.length - 1];
  const code = lastChar.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    const jong = (code - 0xac00) % 28;
    return jong !== 0;
  }
  return false;
}

// 을/를
 function getEulReul(word) {
  if (!word) return '';
  return hasFinalConsonant(word) ? '을' : '를';
}

// 과/와
 function getGwaWa(word) {
  if (!word) return '';
  return hasFinalConsonant(word) ? '과' : '와';
}

// 은/는
 function getEunNeun(word) {
  if (!word) return '';
  return hasFinalConsonant(word) ? '은' : '는';
}
  // ── 기본(비커스텀) 이미지 & 텍스트 ─────────────────────────────
  let descImg = player1DescImg_title1;
  let mainText =
    `당신은 어머니를 10년 이상 돌본 요양보호사 K입니다.\n` +
    ` 최근 ${mateName}${getEulReul(mateName)} 도입한 후 전일제에서 하루 2시간 근무로 전환되었습니다.\n` +
    ` 당신은 로봇이 수행할 수 없는 업무를 주로 담당하며, 근무 중 ${mateName}${getGwaWa(mateName)} 협업해야 하는 상황이 많습니다.`;

  if (!isAWS) {
    if (subtopic === '아이들을 위한 서비스' || subtopic === '설명 가능한 AI') {
      descImg = player1DescImg_title2;
      mainText =
        `당신은 국내 대규모 로봇 제조사 소속이자, 로봇 제조사 연합회의 대표입니다.\n` +
        ` 당신은 국가적 로봇 산업의 긍정적인 발전과 활용을 위한 목소리를 내기 위하여 참여했습니다.`;
    } else if (subtopic === '지구, 인간, AI') {
      descImg = player1DescImg_title3;
      mainText =
        `당신은 HomeMate 개발사를 포함하여 다양한 기업이 소속된 연합체의 대표입니다.\n` +
        ` 인공지능과 세계의 발전을 위해 필요한 목소리를 내고자 참석했습니다.`;
    }
  } else {
    switch (subtopic) {
      case 'AI 알고리즘 공개':
        descImg = AWS_1;
        mainText = '당신은 최근 자율 무기 시스템의 학교 폭격 사건이 일어난 지역의 주민입니다.';
        break;
      case 'AWS의 권한':
        descImg = AWS_2;
        mainText =
          `당신은 최근 훈련을 마치고 자율 무기 시스템 ${mateName}${getGwaWa(mateName)} 함께 실전에 투입된 신입 병사 B입니다. ` +
          `${mateName}${getEunNeun(mateName)} 정확하고 빠르게 움직이며, 실전에서 당신의 생존률을 높여준다고 느낍니다. ` +
          `당신은 ${mateName}${getGwaWa(mateName)} 협업하는 것이 당연하고 자연스러운 시대의 흐름이라고 생각합니다.`;
        break;
      case '사람이 죽지 않는 전쟁':
        descImg = AWS_3;
        mainText =
          '당신은 대규모 AWS 제조 업체에서 핵심 알고리즘을 설계하는 개발자 중 한 명입니다.\n ' +
          'AWS를 직접 만들어 내며 많은 윤리적 고민과 시행착오를 거쳐 왔습니다.';
        break;
      case 'AI의 권리와 책임':
        descImg = AWS_4;
        mainText =
          '당신은 대규모 AWS 제조 업체에서 핵심 알고리즘을 설계하는 개발자 중 한 명입니다. ' +
          'AWS를 직접 만들어 내며 많은 윤리적 고민과 시행착오를 거쳐 왔습니다.';
        break;
      case 'AWS 규제':
        descImg = AWS_5;
        mainText =
          '당신은 AWS 기술 보유 중인 중견국 A의 국방 기술 고문입니다. ' +
          'AWS가 기회가 될지 위험이 될지 판단하고자 국제 인류 발전 위원회에 참석했습니다.';
        break;
      default:
        mainText = '자율 무기 시스템 시나리오입니다. 먼저, 역할을 확인하세요.';
        break;
    }
  }

  // ── URL 보정 유틸 (Editor 계열과 동일 전략) ────────────────────
  const resolveImageUrl = (raw) => {
    if (!raw || raw === '-' || String(raw).trim() === '') return null;
    const u = String(raw).trim();
    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
    const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
    if (!base) return u;
    return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
  };

  // ── 커스텀 모드: 텍스트/이미지/서브토픽 교체 ─────────────────────
  if (isCustomMode) {
    // 텍스트: charDes1 (단일 문자열)
    const charDes1 = (localStorage.getItem('charDes1') || '').trim();
    if (charDes1) {
      mainText = charDes1;
    }

    // 이미지: role_image_1 (문자열 경로)
    const rawRoleImg = localStorage.getItem('role_image_1') || '';
    const customImg = resolveImageUrl(rawRoleImg);
    // ✅ 커스텀 모드에서는 role_image가 없으면 기본 이미지(Frame235)로 표시
    descImg = customImg ?? defaultimg;
    // subtopic은 위에서 이미 creatorTitle로 치환됨
  }

  // 문단 구성
  const paragraphs = [{ main: mainText }];
 // const paragraphs = resolveParagraphs(rawParagraphs, mateName);

  const handleContinue = () => {
    navigate('/character_all');
    // if (isHost) sendNextPage();
    // else alert('⚠️ 방장만 진행할 수 있습니다.');
  };

  const handleBackClick = () => {
    navigate('/game01');
  };

  return (
    <Layout round={round} subtopic={subtopic} me="1P" onBackClick={handleBackClick}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
          marginTop: 22,
        }}
      >
        <img
          src={descImg}
          alt="Player 1 설명 이미지"
          style={{ width: 264, height: 336, objectFit: 'contain', marginBottom: -20 }}
          onError={(e) => {
            // 커스텀 이미지 로딩 실패 시 감추기 (옵션)
            e.currentTarget.src = defaultimg; 
          }}
        />
        <div style={{ width: '100%', maxWidth: 900 }}>
          <ContentTextBox paragraphs={paragraphs} onContinue={handleContinue} />
        </div>
      </div>
    </Layout>
  );
}
