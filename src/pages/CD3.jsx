import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox2';
import { useWebRTC } from '../WebRTCProvider';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';

import player3DescImg_title1 from '../assets/3player_des1.svg';
import player3DescImg_title2 from '../assets/3player_des2.svg';
import player3DescImg_title3 from '../assets/3player_des3.svg';

//  영문용 에셋 임포트 (_en)
import player3DescImg_title1_en from '../assets/en/3player_des1_en.svg';
import player3DescImg_title2_en from '../assets/en/3player_des2_en.svg';
import player3DescImg_title3_en from '../assets/en/3player_des3_en.svg';

import AWS_1 from '../assets/3player_AWS_1.svg';
import AWS_2 from '../assets/3player_AWS_2.svg';
import AWS_3 from '../assets/3player_AWS_3.svg';
import AWS_4 from '../assets/3player_AWS_4.svg';
import AWS_5 from '../assets/3player_AWS_5.svg';

//  영문용 AWS 에셋 임포트 (_en)
import AWS_1_en from '../assets/en/3player_AWS_1_en.svg';
import AWS_2_en from '../assets/en/3player_AWS_2_en.svg';
import AWS_3_en from '../assets/en/3player_AWS_3_en.svg';
import AWS_4_en from '../assets/en/3player_AWS_4_en.svg';
import AWS_5_en from '../assets/en/3player_AWS_5_en.svg';

import defaultimg from "../assets/images/Frame235.png";

import axiosInstance from '../api/axiosInstance';
import { useWebSocket } from '../WebSocketProvider';
//  다국어 지원 임포트
import { translations } from '../utils/language';

export default function CD3() {
  const navigate = useNavigate();
  const { isConnected, reconnectAttempts, maxReconnectAttempts, finalizeDisconnection } = useWebSocket();

  //  다국어 설정
  const lang = localStorage.getItem('app_lang') || 'ko';
  
  // [표시용] 현재 언어 데이터
  const t = translations[lang].CharacterDescription;
  const t_map = translations[lang].GameMap;

  // [논리 판단용] 한국어 기준 데이터 (저장된 값이 한국어이므로)
  const t_ko_map = translations['ko'].GameMap; 

  const category = localStorage.getItem('category') || '안드로이드';
  
  // 카테고리 판단도 한국어 키값과 비교하여 안전성 확보
  const isAWS = category.includes('자율 무기 시스템') || category === 'Autonomous Weapon Systems' || category === t_ko_map.categoryAWS;

  //  커스텀 모드 판단: code 존재 여부
  const isCustomMode = !!localStorage.getItem('code');

  //  커스텀 모드일 때 subtopic은 creatorTitle 사용
  const creatorTitle = localStorage.getItem('creatorTitle') || '';
  const rawSubtopic = localStorage.getItem('subtopic');
  const subtopic = isCustomMode ? creatorTitle : (rawSubtopic ?? 'AI의 개인 정보 수집');

  const [round, setRound] = useState();
  // 1. 라운드 계산
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedTopics') ?? '[]');
    const nextRound = completed.length + 1;
    setRound(nextRound);
    localStorage.setItem('currentRound', String(nextRound));
  }, []);
  const mateName = localStorage.getItem('mateName') ?? 'HomeMate';

  //  // 새로고침 시 재연결 로직 
  //   useEffect(() => {
  //       let cancelled = false;
  //       const isReloadingGraceLocal = () => {
  //         const flag = sessionStorage.getItem('reloading') === 'true';
  //         const expire = parseInt(sessionStorage.getItem('reloading_expire_at') || '0', 10);
  //         if (!flag) return false;
  //         if (Date.now() > expire) {
  //           sessionStorage.removeItem('reloading');
  //           sessionStorage.removeItem('reloading_expire_at');
  //           return false;
  //         }
  //         return true;
  //       };
        
  //       if (!isConnected) {
  //         // 1) reloading-grace가 켜져 있으면 finalize 억제
  //         if (isReloadingGraceLocal()) {
  //           console.log('♻️ reloading grace active — finalize 억제');
  //           return;
  //         }
        
  //         // 2) debounce: 잠깐 기다렸다가 여전히 끊겨있으면 finalize
  //         const DEBOUNCE_MS = 1200;
  //         const timer = setTimeout(() => {
  //           if (cancelled) return;
  //           if (!isConnected && !isReloadingGraceLocal()) {
  //             console.warn('🔌 WebSocket 연결 끊김 → 초기화 (확정)');
  //             finalizeDisconnection('❌ 연결이 끊겨 게임이 초기화됩니다.');
  //           } else {
  //             console.log('🔁 재연결/리로드 감지 — finalize 스킵');
  //           }
  //         }, DEBOUNCE_MS);
        
  //         return () => {
  //           cancelled = true;
  //           clearTimeout(timer);
  //         };
  //       }
  //     }, [isConnected, finalizeDisconnection]);

  // WebRTC audio state (필요 시 사용)
  const { voiceSessionStatus, roleUserMapping, myUserId } = useWebRTC();
  const { getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);
  const getVoiceState = (roleId) => {
    if (String(roleId) === myUserId) {
      return {
        is_speaking: voiceSessionStatus.isSpeaking,
        is_mic_on: voiceSessionStatus.isConnected,
        nickname: voiceSessionStatus.nickname || '',
      };
    }
    return getVoiceStateForRole(roleId);
  };

  //  이미지 선택 헬퍼
  const getImg = (koImg, enImg) => (lang === 'en' ? enImg : koImg);

  let descImg = getImg(player3DescImg_title1, player3DescImg_title1_en);
  let mainText = t.cd3_android_home;

  // [핵심 수정] 주제 판단 시 't_map'(현재언어)이 아닌 't_ko_map'(한국어)과 비교해야 함
  if (!isAWS) {
    if (subtopic === t_ko_map.andOption2_1 || subtopic === t_ko_map.andOption2_2) {
      descImg = getImg(player3DescImg_title2, player3DescImg_title2_en);
      mainText = t.cd3_android_council;
    } else if (subtopic === t_ko_map.andOption3_1) {
      descImg = getImg(player3DescImg_title3, player3DescImg_title3_en);
      mainText = t.cd3_android_international;
    }
  } else {
    // 자율 무기 시스템 분기 (마찬가지로 t_ko_map 사용)
    switch (true) {
      case subtopic === t_ko_map.awsOption1_1:
        descImg = getImg(AWS_1, AWS_1_en);
        mainText = t.cd3_aws_1;
        break;
      case subtopic === t_ko_map.awsOption1_2:
        descImg = getImg(AWS_2, AWS_2_en);
        mainText = t.cd3_aws_2;
        break;
      case subtopic === t_ko_map.awsOption2_1:
        descImg = getImg(AWS_3, AWS_3_en);
        mainText = t.cd3_aws_3;
        break;
      case subtopic === t_ko_map.awsOption2_2:
        descImg = getImg(AWS_4, AWS_4_en);
        mainText = t.cd3_aws_4;
        break;
      case subtopic === t_ko_map.awsOption3_1:
        descImg = getImg(AWS_5, AWS_5_en);
        mainText = t.cd3_aws_5;
        break;
      default:
        mainText = t.aws_default;
        break;
    }
  }

  // URL 보정 유틸 (Editor 계열과 동일)
  const resolveImageUrl = (raw) => {
    if (!raw || raw === '-' || String(raw).trim() === '') return null;
    const u = String(raw).trim();
    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
    const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
    if (!base) return u;
    return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
  };

  //  커스텀 모드: 텍스트/이미지 교체
  if (isCustomMode) {
    // 텍스트: charDes3 (단일 문자열)
    const charDes3 = (localStorage.getItem('charDes3') || '').trim();
    if (charDes3) {
      mainText = charDes3;
    }

    // 이미지: role_image_3 (문자열 경로)
    const rawRoleImg = localStorage.getItem('role_image_3') || '';
    const customImg = resolveImageUrl(rawRoleImg);
    // ✅ 커스텀 모드에서는 role_image가 없으면 기본 이미지(Frame235)로 표시
    descImg = customImg ?? defaultimg;
    // subtopic은 위에서 creatorTitle로 이미 치환됨
  }

  //  조사 처리를 위해 헬퍼 함수 정의 (필요 시)
  const hasFinalConsonant = (kor) => {
    if (lang === 'en') return false;
    const lastChar = kor[kor.length - 1];
    const code = lastChar.charCodeAt(0);
    return code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
  };
  const getEulReul = (word) => lang === 'en' ? '' : (hasFinalConsonant(word) ? '을' : '를');

  const paragraphs = [{ 
    main: mainText
      .replaceAll('{{mateName}}', mateName)
      .replaceAll('{{eulReul}}', getEulReul(mateName))
  }];

  const handleBackClick = () => {
    navigate('/game01');
  };

  return (
    <Layout round={round} subtopic={subtopic} me="3P" onBackClick={handleBackClick}>
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
          alt="Player 3 설명 이미지"
          style={{ width: 264, height: 336, objectFit: 'contain', marginBottom: -20 }}
          onError={(e) => {
            // 커스텀 이미지 로딩 실패 시 감추기 (옵션)
            e.currentTarget.src = defaultimg; 
          }}
        />
        <div style={{ width: '100%', maxWidth: 900 }}>
          <ContentTextBox
            paragraphs={paragraphs}
            onContinue={() => navigate('/character_all')}
          />
        </div>
      </div>
    </Layout>
  );
}