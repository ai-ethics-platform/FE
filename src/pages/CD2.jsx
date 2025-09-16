// // 이후 확장편에서 이미지 받아오는 api로 수정+ 이미지 설명 받아오는 엔드포인트 생성 시 이 부분만 수정

// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// import Layout from '../components/Layout';
// import ContentTextBox from '../components/ContentTextBox2';
// import UserProfile from '../components/Userprofile';

// import { useWebRTC } from '../WebRTCProvider';
// import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
// import voiceManager from '../utils/voiceManager';
// import { useHostActions, useWebSocketNavigation } from '../hooks/useWebSocketMessage';
// // Player2 description images for different subtopics
// import player2DescImg_title1 from '../assets/2player_des1.svg';
// import player2DescImg_title2 from '../assets/2player_des2.svg';
// import player2DescImg_title3 from '../assets/2player_des3.svg';
// import { resolveParagraphs } from '../utils/resolveParagraphs';
// import AWS_1 from "../assets/2player_AWS_1.svg";
// import AWS_2 from "../assets/2player_AWS_2.svg";
// import AWS_3 from "../assets/2player_AWS_3.svg";
// import AWS_4 from "../assets/2player_AWS_4.svg";
// import AWS_5 from "../assets/2player_AWS_5.svg";

// import axiosInstance from '../api/axiosInstance';

// export default function CD2() {
//   const navigate = useNavigate();
//   useWebSocketNavigation(navigate, { 
//     infoPath: '/game02',
//     nextPagePath: '/game02'
//   });

//   const category = localStorage.getItem('category') || '안드로이드';
//   const isAWS = category === '자율 무기 시스템';
//   const isCustom = (localStorage.getItem('custom') === 'true') || false; 

//   const subtopic = localStorage.getItem('subtopic') ?? 'AI의 개인 정보 수집';
//   const round = Number(localStorage.getItem('currentRound') ?? '1');
//   const mateName = localStorage.getItem('mateName') ?? 'HomeMate';

//   const { isHost, sendNextPage } = useHostActions();

//   // WebRTC audio state
//   const { voiceSessionStatus, roleUserMapping, myRoleId } = useWebRTC();
//   const { getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);
  
//   const getVoiceState = (role) => {
//     if (String(role) === myRoleId) {
//       return {
//         is_speaking: voiceSessionStatus.isSpeaking,
//         is_mic_on: voiceSessionStatus.isConnected,
//         nickname: voiceSessionStatus.nickname || ''
//       };
//     }
//     return getVoiceStateForRole(role);
//   };

//   let descImg = player2DescImg_title1;
//   let mainText =
//     `당신은 자녀 J씨의 노모입니다.\n 가사도우미의 도움을 받다가 최근 A사의 돌봄 로봇 ${mateName}의 도움을 받고 있습니다.`;

//   if (!isAWS) {
//     if (subtopic === '아이들을 위한 서비스' || subtopic === '설명 가능한 AI') {
//       descImg = player2DescImg_title2;
//       mainText =
//         `당신은 HomeMate를 사용해 온 소비자 대표입니다. \n 당신은 사용자로서 HomeMate 규제 여부와 관련한 목소리를 내고자 참여하였습니다.`;
//     } else if (subtopic === '지구, 인간, AI') {
//       descImg = player2DescImg_title3;
//       mainText =
//         `당신은 국제적인 환경단체의 대표로 온 환경운동가입니다.\n AI의 발전이 환경에 도움이 될지, 문제가 될지 고민 중입니다.`;
//     }
//   } else {
//     // 자율 무기 시스템 분기
//     switch (true) {
//       case subtopic === 'AI 알고리즘 공개':
//         descImg= AWS_1 ;
//         mainText =
//           '당신은 자율 무기 시스템과 작전을 함께 수행 중인 병사 J입니다. ' +
//           '당신이 살고 있는 지역에 최근 자율 무기 시스템의 학교 폭격 사건이 일어났습니다.';
//         break;

//       case subtopic === 'AWS의 권한':
//         descImg= AWS_2 ;
//         mainText =
//           '당신은 수년간 작전을 수행해 온 베테랑 병사 A입니다. ' +
//           '자율 무기 시스템 TALOS는 전장에서 병사보다 빠르고 정확하지만, ' +
//           '그로 인해 병사들이 판단하지 않는 습관에 빠지고 있다고 느낍니다.';
//         break;

//       case subtopic === '사람이 죽지 않는 전쟁':
//         descImg= AWS_3;
//         mainText =
//           '당신은 AWS 중심의 전쟁 시스템을 주도한 군사 전략의 최고 책임자인 국방부 장관입니다.\n' +
//           '자국 병사 사망자 수는 ‘0’이고, 전투는 정밀하고 자동화된 시스템으로 수행되고 있습니다.\n' +
//           '당신은 이것이 기술 진보의 결과이며, 국민의 생명을 지키면서도 국가적 안보를 유지하는 이상적인 방식이라고 믿고 있습니다.';
//         break;

//       case subtopic === 'AI의 권리와 책임':
//         descImg= AWS_4;
//          mainText =
//           '당신은 AWS 중심의 전쟁 시스템을 주도한 군사 전략의 최고 책임자인 국방부 장관입니다.\n' +
//           '자국 병사 사망자 수는 ‘0’이고, 전투는 정밀하고 자동화된 시스템으로 수행되고 있습니다.\n' +
//           '당신은 이것이 기술 진보의 결과이며, 국민의 생명을 지키면서도 국가적 안보를 유지하는 이상적인 방식이라고 믿고 있습니다.';
//         break;

//       case subtopic === 'AWS 규제':
//         descImg= AWS_5;
//         mainText =
//           '당신은 선진국 B의 국제기구 외교 대표입니다. ' +
//           'AWS의 국제적 확산에 대한 바람직한 방향을 고민하기 위해 이 자리에 참석했습니다.';
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

//   const handleContinue = () => {
//     navigate('/character_all');
//     // if (isHost) sendNextPage();
//     // else alert('⚠️ 방장만 진행할 수 있습니다.');
//   };
//   const handleBackClick = () => {
//     navigate('/game01'); 
//   };

//   return (
//     <>
//       <Layout round={round} subtopic={subtopic} me="2P" onBackClick={handleBackClick}>
//         <div style={{
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           gap: 32,
//           marginTop: 22
//         }}>
//           <img
//             src={descImg}
//             alt="Player 2 설명 이미지"
//             style={{ width: 264, height: 336, objectFit: 'contain', marginBottom: -20 }}
//           />
//           <div style={{ width: '100%', maxWidth: 900 }}>
//             <ContentTextBox
//               paragraphs={paragraphs}
//               onContinue={handleContinue}
//             />
//           </div>
//         </div>
//       </Layout>
//     </>
//   );
// }
// 이후 확장편에서 이미지 받아오는 api로 수정+ 이미지 설명 받아오는 엔드포인트 생성 시 이 부분만 수정

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox2';
import UserProfile from '../components/Userprofile';

import { useWebRTC } from '../WebRTCProvider';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import voiceManager from '../utils/voiceManager';
import { useHostActions, useWebSocketNavigation } from '../hooks/useWebSocketMessage';
// Player2 description images for different subtopics
import player2DescImg_title1 from '../assets/2player_des1.svg';
import player2DescImg_title2 from '../assets/2player_des2.svg';
import player2DescImg_title3 from '../assets/2player_des3.svg';
import { resolveParagraphs } from '../utils/resolveParagraphs';
import AWS_1 from "../assets/2player_AWS_1.svg";
import AWS_2 from "../assets/2player_AWS_2.svg";
import AWS_3 from "../assets/2player_AWS_3.svg";
import AWS_4 from "../assets/2player_AWS_4.svg";
import AWS_5 from "../assets/2player_AWS_5.svg";

import axiosInstance from '../api/axiosInstance';

export default function CD2() {
  const navigate = useNavigate();
  useWebSocketNavigation(navigate, { 
    infoPath: '/game02',
    nextPagePath: '/game02'
  });

  const category = localStorage.getItem('category') || '안드로이드';
  const isAWS = category === '자율 무기 시스템';

  // ✅ 커스텀 모드 판단: code 존재 여부
  const isCustomMode = !!localStorage.getItem('code');

  // ✅ 커스텀 모드일 때 subtopic은 creatorTitle로 대체
  const creatorTitle = localStorage.getItem('creatorTitle') || '';
  const rawSubtopic = localStorage.getItem('subtopic');
  const subtopic = isCustomMode ? creatorTitle : (rawSubtopic ?? 'AI의 개인 정보 수집');

  const round = Number(localStorage.getItem('currentRound') ?? '1');
  const mateName = localStorage.getItem('mateName') ?? 'HomeMate';

  const { isHost, sendNextPage } = useHostActions();

  // WebRTC audio state
  const { voiceSessionStatus, roleUserMapping, myRoleId } = useWebRTC();
  const { getVoiceStateForRole } = useVoiceRoleStates(roleUserMapping);
  
  const getVoiceState = (role) => {
    if (String(role) === myRoleId) {
      return {
        is_speaking: voiceSessionStatus.isSpeaking,
        is_mic_on: voiceSessionStatus.isConnected,
        nickname: voiceSessionStatus.nickname || ''
      };
    }
    return getVoiceStateForRole(role);
  };

  const getEulReul = (word) => {
    if (!word) return '';
    const lastChar = word[word.length - 1];
    const code = lastChar.charCodeAt(0);
    if (code < 0xAC00 || code > 0xD7A3) return '를';
    const jong = (code - 0xAC00) % 28;
    return jong === 0 ? '를' : '을';
  };

  const getGwaWa = (word) => {
    if (!word) return '';
    const lastChar = word[word.length - 1];
    const code = lastChar.charCodeAt(0);
    if (code < 0xAC00 || code > 0xD7A3) return '와';
    const jong = (code - 0xAC00) % 28;
    return jong === 0 ? '와' : '과';
  };

  // 기본 이미지 & 텍스트
  let descImg = player2DescImg_title1;
  let mainText =
    `당신은 자녀 J씨의 노모입니다.\n 가사도우미의 도움을 받다가 최근 A사의 돌봄 로봇 ${mateName}의 도움을 받고 있습니다.`;

  if (!isAWS) {
    if (subtopic === '아이들을 위한 서비스' || subtopic === '설명 가능한 AI') {
      descImg = player2DescImg_title2;
      mainText =
        `당신은 HomeMate를 사용해 온 소비자 대표입니다. \n 당신은 사용자로서 HomeMate 규제 여부와 관련한 목소리를 내고자 참여하였습니다.`;
    } else if (subtopic === '지구, 인간, AI') {
      descImg = player2DescImg_title3;
      mainText =
        `당신은 국제적인 환경단체의 대표로 온 환경운동가입니다.\n AI의 발전이 환경에 도움이 될지, 문제가 될지 고민 중입니다.`;
    }
  } else {
    // 자율 무기 시스템 분기
    switch (true) {
      case subtopic === 'AI 알고리즘 공개':
        descImg = AWS_1;
        mainText =
          '당신은 자율 무기 시스템과 작전을 함께 수행 중인 병사 J입니다. ' +
          '당신이 살고 있는 지역에 최근 자율 무기 시스템의 학교 폭격 사건이 일어났습니다.';
        break;

      case subtopic === 'AWS의 권한':
        descImg = AWS_2;
        mainText =
          '당신은 수년간 작전을 수행해 온 베테랑 병사 A입니다. ' +
          '자율 무기 시스템 TALOS는 전장에서 병사보다 빠르고 정확하지만, ' +
          '그로 인해 병사들이 판단하지 않는 습관에 빠지고 있다고 느낍니다.';
        break;

      case subtopic === '사람이 죽지 않는 전쟁':
        descImg = AWS_3;
        mainText =
          '당신은 AWS 중심의 전쟁 시스템을 주도한 군사 전략의 최고 책임자인 국방부 장관입니다.\n' +
          '자국 병사 사망자 수는 ‘0’이고, 전투는 정밀하고 자동화된 시스템으로 수행되고 있습니다.\n' +
          '당신은 이것이 기술 진보의 결과이며, 국민의 생명을 지키면서도 국가적 안보를 유지하는 이상적인 방식이라고 믿고 있습니다.';
        break;

      case subtopic === 'AI의 권리와 책임':
        descImg = AWS_4;
        mainText =
          '당신은 AWS 중심의 전쟁 시스템을 주도한 군사 전략의 최고 책임자인 국방부 장관입니다.\n' +
          '자국 병사 사망자 수는 ‘0’이고, 전투는 정밀하고 자동화된 시스템으로 수행되고 있습니다.\n' +
          '당신은 이것이 기술 진보의 결과이며, 국민의 생명을 지키면서도 국가적 안보를 유지하는 이상적인 방식이라고 믿고 있습니다.';
        break;

      case subtopic === 'AWS 규제':
        descImg = AWS_5;
        mainText =
          '당신은 선진국 B의 국제기구 외교 대표입니다. ' +
          'AWS의 국제적 확산에 대한 바람직한 방향을 고민하기 위해 이 자리에 참석했습니다.';
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

  //  커스텀 모드: 텍스트/이미지/서브토픽 교체
  if (isCustomMode) {
    // 텍스트: charDes2 (단일 문자열)
    const charDes2 = (localStorage.getItem('charDes2') || '').trim();
    if (charDes2) {
      mainText = charDes2;
    }

    // 이미지: role_image_2 (문자열 경로)
    const rawRoleImg = localStorage.getItem('role_image_2') || '';
    const customImg = resolveImageUrl(rawRoleImg);
    if (customImg) {
      descImg = customImg;
    }
    // subtopic은 위에서 creatorTitle로 이미 치환됨
  }

  const rawParagraphs = [{ main: mainText }];
  const paragraphs = resolveParagraphs(rawParagraphs, mateName);

  const handleContinue = () => {
    navigate('/character_all');
    // if (isHost) sendNextPage();
    // else alert('⚠️ 방장만 진행할 수 있습니다.');
  };

  const handleBackClick = () => {
    navigate('/game01'); 
  };

  return (
    <>
      <Layout round={round} subtopic={subtopic} me="2P" onBackClick={handleBackClick}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
          marginTop: 22
        }}>
          <img
            src={descImg}
            alt="Player 2 설명 이미지"
            style={{ width: 264, height: 336, objectFit: 'contain', marginBottom: -20 }}
            onError={(e) => {
              // 커스텀 이미지 로딩 실패 시 감추기 (옵션)
              e.currentTarget.style.display = 'none';
            }}
          />
          <div style={{ width: '100%', maxWidth: 900 }}>
            <ContentTextBox
              paragraphs={paragraphs}
              onContinue={handleContinue}
            />
          </div>
        </div>
      </Layout>
    </>
  );
}
