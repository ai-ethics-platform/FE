// 이후 확장편에서 이미지 받아오는 api로 수정+ 이미지 설명 받아오는 엔드포인트 생성 시 이 부분만 수정

// pages/CD1.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentTextBox from '../components/ContentTextBox2';
// Player1 description images for different subtopics
import player1DescImg_title1 from '../assets/1player_des1.svg';
import player1DescImg_title2 from '../assets/1player_des2.svg';
import player1DescImg_title3 from '../assets/1player_des3.svg';
import AWS_1 from "../assets/1player_AWS_1.svg";
import AWS_2 from "../assets/1player_AWS_2.svg";
import AWS_3 from "../assets/1player_AWS_3.svg";
import AWS_4 from "../assets/1player_AWS_4.svg";
import AWS_5 from "../assets/1player_AWS_5.svg";

import { resolveParagraphs } from '../utils/resolveParagraphs';
import { useHostActions, useWebSocketNavigation } from '../hooks/useWebSocketMessage';
import { useWebRTC } from '../WebRTCProvider';
import { useVoiceRoleStates } from '../hooks/useVoiceWebSocket';
import axiosInstance from '../api/axiosInstance';

export default function CD1() {
  const navigate = useNavigate();
  useWebSocketNavigation(navigate, { infoPath: '/game02', nextPagePath: '/game02' });
  const category = localStorage.getItem('category') || '안드로이드';
  const isAWS = category === '자율 무기 시스템';

  const rawSubtopic = localStorage.getItem('subtopic');
  const subtopic = rawSubtopic || '';
  const round = Number(localStorage.getItem('currentRound'));
  const mateName = localStorage.getItem('mateName') ?? 'HomeMate';

  const isCustom = (localStorage.getItem('custom') === 'true') || false;
  const roleId = 1;

  const { isHost, sendNextPage } = useHostActions();
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
    if (code < 0xAC00 || code > 0xD7A3) return '를'; // 한글이 아닐 경우 기본 '를'
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

  // 커스텀 모드일 경우 
    
    // const [customLoading, setCustomLoading] = useState(false);
    // const [customError, setCustomError] = useState(null);
    // const [customImageUrl, setCustomImageUrl] = useState(null);
    // const [customText, setCustomText] = useState(null);
  
    // // 커스텀 로드 (엔드포인트 확정되면 URL/필드명만 맞추면 됨)
    // useEffect(() => {
    //   if (!isCustom) return;
    //   let cancelled = false;
  
    //   (async () => {
    //     try {
    //       setCustomLoading(true);
    //       setCustomError(null);
  
    //       const params = { category, subtopic, role_id: 1, round };
  
    //       // 예시 엔드포인트: 실제 확정 후 교체
    //       const descReq = axiosInstance.get('/custom/roles/description', { params });
    //       const imgReq = axiosInstance.get('/custom/roles/image', { params });
  
    //       const [descRes, imgRes] = await Promise.allSettled([descReq, imgReq]);
  
    //       const text =
    //         descRes.status === 'fulfilled'
    //           ? (descRes.value?.data?.text ?? descRes.value?.data?.description ?? '')
    //           : '';
  
    //       const imageUrl =
    //         imgRes.status === 'fulfilled'
    //           ? (imgRes.value?.data?.image_url ?? imgRes.value?.data?.url ?? '')
    //           : '';
  
    //       if (!cancelled) {
    //         setCustomText(text || null);
    //         setCustomImageUrl(imageUrl || null);
    //         setCustomLoading(false);
    //       }
    //     } catch (e) {
    //       if (!cancelled) {
    //         setCustomError(e);
    //         setCustomLoading(false);
    //       }
    //     }
    //   })();
  
    //   return () => {
    //     cancelled = true;
    //   };
    // }, [isCustom, category, subtopic, round]);

  // Determine description image and main text based on subtopic
  let descImg = player1DescImg_title1;

  // 기본(안드로이드 기본 문구)
  let mainText =
    `당신은 어머니를 10년 이상 돌본 요양보호사 K입니다.\n` +
    ` 최근 ${mateName}${getEulReul(mateName)} 도입한 후 전일제에서 하루 2시간 근무로 전환되었습니다.\n` +
    ` 당신은 로봇이 수행할 수 없는 업무를 주로 담당하며, 근무 중 ${mateName}${getGwaWa(mateName)} 협업해야 하는 상황이 많습니다.`;

  //  안드로이드 vs AWS 분기
  if (!isAWS) {
    // ---- 안드로이드 기존 로직 유지 ----
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
    // ---- 자율 무기 시스템 분기 ----
    switch (subtopic) {
      case 'AI 알고리즘 공개':
        descImg= AWS_1 ;
        mainText = '당신은 최근 자율 무기 시스템의 학교 폭격 사건이 일어난 지역의 주민입니다.';
        break;

      case 'AWS의 권한':
        descImg= AWS_2 ;
        mainText =
          '당신은 최근 훈련을 마치고 자율 무기 시스템 TALOS와 함께 실전에 투입된 신입 병사 B입니다. ' +
          'TALOS는 정확하고 빠르게 움직이며, 실전에서 당신의 생존률을 높여준다고 느낍니다. ' +
          '당신은 TALOS와 협업하는 것이 당연하고 자연스러운 시대의 흐름이라고 생각합니다.';
        break;

      case '사람이 죽지 않는 전쟁':
        descImg= AWS_3 ;
        mainText =
          '당신은 대규모 AWS 제조 업체에서 핵심 알고리즘을 설계하는 개발자 중 한 명입니다. ' +
          'AWS를 직접 만들어 내며 많은 윤리적 고민과 시행착오를 거쳐 왔습니다.';
        break;

      case 'AI의 권리와 책임':
        descImg= AWS_4 ;
        mainText =
          '당신은 대규모 AWS 제조 업체에서 핵심 알고리즘을 설계하는 개발자 중 한 명입니다. ' +
          'AWS를 직접 만들어 내며 많은 윤리적 고민과 시행착오를 거쳐 왔습니다.';
        break;

      case 'AWS 규제':
        descImg= AWS_5 ;
        mainText =
          '당신은 AWS 기술 보유 중인 중견국 A의 국방 기술 고문입니다. ' +
          'AWS가 기회가 될지 위험이 될지 판단하고자 국제 인류 발전 위원회에 참석했습니다.';
        break;

      default:
        mainText = '자율 무기 시스템 시나리오입니다. 먼저, 역할을 확인하세요.';
        break;
    }
  }
   // custom=true면 API 결과로 덮어쓰기 (값 있을 때만)
   if (isCustom) {
    if (customText) mainText = customText;
    if (customImageUrl) descImg = customImageUrl; // URL 문자열도 <img src> 가능
  }


  const rawParagraphs = [{ main: mainText }];
  const paragraphs = resolveParagraphs(rawParagraphs, mateName);

  const handleContinue = () => {
    navigate('/game02');
    // if (isHost) sendNextPage();
    // else alert('⚠️ 방장만 진행할 수 있습니다.');
  };
  const handleBackClick = () => {
    navigate('/game01'); 
  };
  return (
    <Layout round={round} subtopic={subtopic} me="1P" onBackClick={handleBackClick}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 32,
        marginTop: 22
      }}>
        <img
          src={descImg}
          alt="Player 1 설명 이미지"
          style={{
            width: 264,
            height: 336,
            objectFit: 'contain',
            marginBottom: -20,
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
  );
}
