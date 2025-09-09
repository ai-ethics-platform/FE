// // 이후 확장편에서 이미지 받아오는 api로 수정+ 이미지 설명 받아오는 엔드포인트 생성 시 이 부분만 수정

// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Layout from '../components/Layout';
// import ContentTextBox from '../components/ContentTextBox2';
// import UserProfile from '../components/Userprofile';
// import { useWebRTC } from '../WebRTCProvider';
// import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
// import { resolveParagraphs } from '../utils/resolveParagraphs';
// import player3DescImg_title1 from '../assets/3player_des1.svg';
// import player3DescImg_title2 from '../assets/3player_des2.svg';
// import player3DescImg_title3 from '../assets/3player_des3.svg';
// import AWS_1 from "../assets/3player_AWS_1.svg";
// import AWS_2 from "../assets/3player_AWS_2.svg";
// import AWS_3 from "../assets/3player_AWS_3.svg";
// import AWS_4 from "../assets/3player_AWS_4.svg";
// import AWS_5 from "../assets/3player_AWS_5.svg";
// import axiosInstance from '../api/axiosInstance';

// export default function CD3() {
//   const navigate = useNavigate();

//   const category = localStorage.getItem('category') || '안드로이드';
//   const isAWS = category === '자율 무기 시스템';
//   const isCustom = (localStorage.getItem('custom') === 'true') || false; // null도 false

//   const subtopic = localStorage.getItem('subtopic') ?? 'AI의 개인 정보 수집';
//   const round = Number(localStorage.getItem('currentRound') ?? '1');
//   const mateName = localStorage.getItem('mateName') ?? 'HomeMate';

//   // WebRTC audio state
//   const { voiceSessionStatus, roleUserMapping, myUserId } = useWebRTC();
//   const { getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);
//   const getVoiceState = (roleId) => {
//     if (String(roleId) === myUserId) {
//       return {
//         is_speaking: voiceSessionStatus.isSpeaking,
//         is_mic_on: voiceSessionStatus.isConnected,
//         nickname: voiceSessionStatus.nickname || ''
//       };
//     }
//     return getVoiceStateForRole(roleId);
//   };

//   let descImg = player3DescImg_title1;
//   let mainText =
//     '당신은 자녀 J씨입니다.\n 함께 사는 노쇠하신 어머니가 걱정되지만, 바쁜 직장생활로 어머니를 돌보아드릴 여유가 거의 없습니다. ';

//   if (!isAWS) {
//     if (subtopic === '아이들을 위한 서비스' || subtopic === '설명 가능한 AI') {
//       descImg = player3DescImg_title2;
//       mainText =
//         '당신은 본 회의를 진행하는 국가 인공지능 위원회의 대표입니다. \n 국가의 발전을 위해 더 나은 결정이 무엇일지 고민이 필요합니다.';
//     } else if (subtopic === '지구, 인간, AI') {
//       descImg = player3DescImg_title3;
//       mainText =
//         '당신은 가정용 로봇을 사용하는 소비자 대표입니다.\n 소비자의 입장에서 어떤 목소리를 내는 것이 좋을지 고민하고 있습니다.';
//     }
//   } else {
//     // 자율 무기 시스템 분기
//     switch (true) {
//       case subtopic === 'AI 알고리즘 공개':
//         descImg= AWS_1 ;
//         mainText =
//           '당신은 군사 AI 윤리 전문가입니다. ' +
//           '당신이 살고 있는 지역에 최근 자율 무기 시스템의 학교 폭격 사건이 일어났습니다.';
//         break;

//       case subtopic === 'AWS의 권한':
//         descImg= AWS_2 ;
//         mainText =
//           '당신은 자율 무기 시스템 TALOS 도입 이후 작전 효율성과 병사들의 변화 양상을 모두 지켜보고 있는 군 지휘관입니다. ' +
//           '당신은 두 병사의 입장을 듣고, 군 전체가 나아갈 방향을 모색하려 합니다.';
//         break;

//       case subtopic === '사람이 죽지 않는 경쟁':
//         descImg= AWS_3 ;
//         mainText =
//           '당신은 본 회의를 진행하는 국가 인공지능 위원회의 대표입니다. ' +
//           '국가의 발전을 위해 더 나은 결정이 무엇일지 고민이 필요합니다.';
//         break;

//       case subtopic === 'AI의 권리와 책임':
//         descImg= AWS_4 ;
//         mainText =
//           '당신은 본 회의를 진행하는 국가 인공지능 위원회의 대표입니다. ' +
//           '국가의 발전을 위해 더 나은 결정이 무엇일지 고민이 필요합니다.';
//         break;

//       case subtopic === 'AWS 규제':
//         descImg= AWS_5 ;
//         mainText =
//           '당신은 저개발국 C의 글로벌 NGO 활동가입니다. ' +
//           '국제사회에 현장의 목소리를 내고자 이 자리에 참석했습니다.';
//         break;

//       default:
//         mainText = '자율 무기 시스템 시나리오입니다. 먼저, 역할을 확인하세요.';
//         break;
//     }
//   }

//   // custom=true면 API 결과로 덮어쓰기 (값 있을 때만)
//   if (isCustom) {
//     if (customText) mainText = customText;
//     if (customImageUrl) descImg = customImageUrl; // URL 문자열도 <img src> 가능
//   }

//   const rawParagraphs = [{ main: mainText }];
//   const paragraphs = resolveParagraphs(rawParagraphs, mateName);

//   const handleBackClick = () => {
//     navigate('/game01');
//   };

//   return (
//     <Layout round={round} subtopic={subtopic} me="3P" onBackClick={handleBackClick}>
//       <div
//         style={{
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           gap: 32,
//           marginTop: 22
//         }}
//       >
//         <img
//           src={descImg}
//           alt="Player 3 설명 이미지"
//           style={{ width: 264, height: 336, objectFit: 'contain', marginBottom: -20 }}
//         />
//         <div style={{ width: '100%', maxWidth: 900 }}>
//           <ContentTextBox
//             paragraphs={paragraphs}
//             onContinue={() => navigate('/character_all')}
//           />
//         </div>
//       </div>
//     </Layout>
//   );
// }
// 이후 확장편에서 이미지 받아오는 api로 수정+ 이미지 설명 받아오는 엔드포인트 생성 시 이 부분만 수정

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox2';
import { useWebRTC } from '../WebRTCProvider';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import { resolveParagraphs } from '../utils/resolveParagraphs';

import player3DescImg_title1 from '../assets/3player_des1.svg';
import player3DescImg_title2 from '../assets/3player_des2.svg';
import player3DescImg_title3 from '../assets/3player_des3.svg';
import AWS_1 from '../assets/3player_AWS_1.svg';
import AWS_2 from '../assets/3player_AWS_2.svg';
import AWS_3 from '../assets/3player_AWS_3.svg';
import AWS_4 from '../assets/3player_AWS_4.svg';
import AWS_5 from '../assets/3player_AWS_5.svg';

import axiosInstance from '../api/axiosInstance';

export default function CD3() {
  const navigate = useNavigate();

  const category = localStorage.getItem('category') || '안드로이드';
  const isAWS = category === '자율 무기 시스템';

  //  커스텀 모드 판단: code 존재 여부
  const isCustomMode = !!localStorage.getItem('code');

  //  커스텀 모드일 때 subtopic은 creatorTitle 사용
  const creatorTitle = localStorage.getItem('creatorTitle') || '';
  const rawSubtopic = localStorage.getItem('subtopic');
  const subtopic = isCustomMode ? creatorTitle : (rawSubtopic ?? 'AI의 개인 정보 수집');

  const round = Number(localStorage.getItem('currentRound') ?? '1');
  const mateName = localStorage.getItem('mateName') ?? 'HomeMate';

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

  let descImg = player3DescImg_title1;
  let mainText =
    '당신은 자녀 J씨입니다.\n 함께 사는 노쇠하신 어머니가 걱정되지만, 바쁜 직장생활로 어머니를 돌보아드릴 여유가 거의 없습니다. ';

  if (!isAWS) {
    if (subtopic === '아이들을 위한 서비스' || subtopic === '설명 가능한 AI') {
      descImg = player3DescImg_title2;
      mainText =
        '당신은 본 회의를 진행하는 국가 인공지능 위원회의 대표입니다. \n 국가의 발전을 위해 더 나은 결정이 무엇일지 고민이 필요합니다.';
    } else if (subtopic === '지구, 인간, AI') {
      descImg = player3DescImg_title3;
      mainText =
        '당신은 가정용 로봇을 사용하는 소비자 대표입니다.\n 소비자의 입장에서 어떤 목소리를 내는 것이 좋을지 고민하고 있습니다.';
    }
  } else {
    // 자율 무기 시스템 분기
    switch (true) {
      case subtopic === 'AI 알고리즘 공개':
        descImg = AWS_1;
        mainText =
          '당신은 군사 AI 윤리 전문가입니다. ' +
          '당신이 살고 있는 지역에 최근 자율 무기 시스템의 학교 폭격 사건이 일어났습니다.';
        break;
      case subtopic === 'AWS의 권한':
        descImg = AWS_2;
        mainText =
          '당신은 자율 무기 시스템 TALOS 도입 이후 작전 효율성과 병사들의 변화 양상을 모두 지켜보고 있는 군 지휘관입니다. ' +
          '당신은 두 병사의 입장을 듣고, 군 전체가 나아갈 방향을 모색하려 합니다.';
        break;
      case subtopic === '사람이 죽지 않는 경쟁':
        descImg = AWS_3;
        mainText =
          '당신은 본 회의를 진행하는 국가 인공지능 위원회의 대표입니다. ' +
          '국가의 발전을 위해 더 나은 결정이 무엇일지 고민이 필요합니다.';
        break;
      case subtopic === 'AI의 권리와 책임':
        descImg = AWS_4;
        mainText =
          '당신은 본 회의를 진행하는 국가 인공지능 위원회의 대표입니다. ' +
          '국가의 발전을 위해 더 나은 결정이 무엇일지 고민이 필요합니다.';
        break;
      case subtopic === 'AWS 규제':
        descImg = AWS_5;
        mainText =
          '당신은 저개발국 C의 글로벌 NGO 활동가입니다. ' +
          '국제사회에 현장의 목소리를 내고자 이 자리에 참석했습니다.';
        break;
      default:
        mainText = '자율 무기 시스템 시나리오입니다. 먼저, 역할을 확인하세요.';
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

  // ✅ 커스텀 모드: 텍스트/이미지 교체
  if (isCustomMode) {
    // 텍스트: charDes3 (단일 문자열)
    const charDes3 = (localStorage.getItem('charDes3') || '').trim();
    if (charDes3) {
      mainText = charDes3;
    }

    // 이미지: role_image_3 (문자열 경로)
    const rawRoleImg = localStorage.getItem('role_image_3') || '';
    const customImg = resolveImageUrl(rawRoleImg);
    if (customImg) {
      descImg = customImg;
    }
    // subtopic은 위에서 creatorTitle로 이미 치환됨
  }

  const rawParagraphs = [{ main: mainText }];
  const paragraphs = resolveParagraphs(rawParagraphs, mateName);

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
            e.currentTarget.style.display = 'none';
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
