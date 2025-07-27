// CharacterPopup.jsx
import React from 'react';
import char1 from '../assets/CharacterPopUp1.svg';
import char2 from '../assets/CharacterPopUp2.svg';
import char3 from '../assets/CharacterPopUp3.svg';
import closeIcon from "../assets/close.svg";

import { Colors, FontStyles } from './styleConstants';

export default function CharacterPopup({ subtopic, roleId, mateName,onClose }) {
  // 1) SVG 선택
  const bgSvg = {
    1: char1,
    2: char2,
    3: char3,
  }[roleId] || char1;

  // 2) 캐릭터 타이틀 매핑
  let titleText = '';
  if (['AI의 개인 정보 수집', '안드로이드의 감정 표현'].includes(subtopic)) {
    titleText = roleId === 1 ? '요양보호사 K'
              : roleId === 2 ? '노모 L'
              : '자녀 J';
  } else if (['아이들을 위한 서비스', '설명 가능한 AI'].includes(subtopic)) {
    titleText = roleId === 1 ? '로봇 제조사 연합회 대표'
              : roleId === 2 ? '소비자 대표'
              : '국가 인공지능 위원회 대표';
  } else if (subtopic === '지구, 인간, AI') {
    titleText = roleId === 1 ? '기업 연합체 대표'
              : roleId === 2 ? '국제 환경단체 대표'
              : '소비자 대표';
  }

  // 3) 본문 텍스트 매핑
  let mainText = '';
  if (roleId === 1) {
    mainText =
      `당신은 어머니를 10년 이상 돌본 요양보호사 K입니다.\n` +
      `최근 ${mateName}를 도입한 후 전일제에서 하루 2시간 근무로 전환되었습니다.\n` +
      `당신은 로봇이 수행할 수 없는 업무를 주로 담당하며, 근무 중 ${mateName}와 협업해야 하는 상황이 많습니다.`;
    if (['아이들을 위한 서비스', '설명 가능한 AI'].includes(subtopic)) {
      mainText =
        `당신은 국내 대규모 로봇 제조사 소속이자, 로봇 제조사 연합회의 대표입니다.\n` +
        `당신은 국가적 로봇 산업의 긍정적인 발전과 활용을 위한 목소리를 내기 위하여 참여했습니다.`;
    } else if (subtopic === '지구, 인간, AI') {
      mainText =
        `당신은 ${mateName} 개발사를 포함하여 다양한 기업이 소속된 연합체의 대표입니다.\n` +
        `인공지능과 세계의 발전을 위해 필요한 목소리를 내고자 참석했습니다.`;
    }
  } else if (roleId === 2) {
    mainText =
      `당신은 자녀 J씨의 노모입니다.\n` +
      `가사도우미의 도움을 받다가 최근 ${mateName}의 도움을 받고 있습니다.`;
    if (['아이들을 위한 서비스', '설명 가능한 AI'].includes(subtopic)) {
      mainText =
        `당신은 ${mateName}를 사용해 온 소비자 대표입니다.\n` +
        `당신은 사용자로서 HomeMate 규제 여부와 관련한 목소리를 내고자 참여하였습니다.`;
    } else if (subtopic === '지구, 인간, AI') {
      mainText =
        `당신은 국제적인 환경단체의 대표로 온 환경운동가입니다.\n` +
        `AI의 발전이 환경에 도움이 될지, 문제가 될지 고민 중입니다.`;
    }
  } else if (roleId === 3) {
    mainText =
      `당신은 자녀 J씨입니다.\n` +
      `함께 사는 노쇠하신 어머니가 걱정되지만, 바쁜 직장생활로 어머니를 돌보아드릴 여유가 거의 없습니다.`;
    if (['아이들을 위한 서비스', '설명 가능한 AI'].includes(subtopic)) {
      mainText =
        `당신은 본 회의를 진행하는 국가 인공지능 위원회의 대표입니다.\n` +
        `국가의 발전을 위해 더 나은 결정이 무엇일지 고민이 필요합니다.`;
    } else if (subtopic === '지구, 인간, AI') {
      mainText =
        `당신은 가정용 로봇을 사용하는 소비자 대표입니다.\n` +
        `소비자의 입장에서 어떤 목소리를 내는 것이 좋을지 고민하고 있습니다.`;
    }
  }

  return (
    <div style={{
      position: 'relative',
      width: 264,    // SVG 실제 사이즈에 맞춰 조정하세요
      height: 440,   // SVG 실제 사이즈에 맞춰 조정하세요
      overflow: 'hidden',
      fontFamily: 'sans-serif'
    }}>
      {/* 배경 SVG */}
      <img
        src={bgSvg}
        alt="character background"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
       
      {/* 제목 */}
      <div style={{
        position: 'absolute',
        top: '41.2%',            // 이 값은 SVG 디자인에 맞춰 미세 조정
        left: '50%',
        transform: 'translate(-50%, -50%)',
        ...FontStyles.bodyBold,
        color:Colors.grey01,
        textAlign: 'center',
        whiteSpace: 'nowrap',
      }}>
        {titleText}
      </div>

      {/* 본문 */}
      <div style={{
        position: 'absolute',
        //bottom: '16px',
        top:'52%',        // SVG 디자인에 맞춰 미세 조정
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        ...FontStyles.body,
         color:Colors.grey07,
       // lineHeight: '1.4',
        whiteSpace: 'pre-line',  // `\n`을 줄바꿈으로
      }}>
        {mainText}
      </div>
    </div>
  );
}
