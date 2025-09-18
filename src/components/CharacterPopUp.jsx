import React from 'react';
import char1 from '../assets/CharacterPopUp1.svg';
import char2 from '../assets/CharacterPopUp2.svg';
import char2_AWS from '../assets/CharacterPopUp2_AWS.svg';

import char3 from '../assets/CharacterPopUp3.svg';
import closeIcon from "../assets/close.svg";

import { Colors, FontStyles } from './styleConstants';

export default function CharacterPopup({ subtopic, roleId, mateName, onClose }) {
  // 1) SVG 선택
  // const bgSvg = {
  //   1: char1,
  //   2: char2,
  //   3: char3,
  // }[roleId] || char1;

  // 2) category 값에 따른 타이틀 및 본문 텍스트 설정
  const category = localStorage.getItem('category'); // 로컬에서 category 값 가져오기

  const bgSvg = (() => {
    switch (roleId) {
      case 1:
        return char1;
      case 2:
        return category === '자율 무기 시스템' ? char2_AWS : char2;
      case 3:
        return char3;
      default:
        return char1;
    }
  })();
  
  let titleText = '';
  let mainText = '';

  if (category === '안드로이드') {
    // 안드로이드 카테고리
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

    // 안드로이드 카테고리 본문
    if (subtopic === 'AI의 개인 정보 수집' || subtopic === '안드로이드의 감정 표현') {
      if (roleId === 1) {
        mainText = `당신은 어머니를 10년 이상 돌본 요양보호사 K입니다.\n` +
          `최근 ${mateName}를 도입한 후 전일제에서 하루 2시간 근무로 전환되었습니다.\n` +
          `당신은 로봇이 수행할 수 없는 업무를 주로 담당하며, 근무 중 ${mateName}와 협업해야 하는 상황이 많습니다.`;
      } else if (roleId === 2) {
        mainText = `당신은 자녀 J씨의 노모입니다.\n` +
          `가사도우미의 도움을 받다가 최근 ${mateName}의 도움을 받고 있습니다.`;
      } else if (roleId === 3) {
        mainText = `당신은 자녀 J씨입니다.\n` +
          `함께 사는 노쇠하신 어머니가 걱정되지만, 바쁜 직장생활로 어머니를 돌보아드릴 여유가 거의 없습니다.`;
      }
    } else if (['아이들을 위한 서비스', '설명 가능한 AI', '지구, 인간, AI'].includes(subtopic)) {
      if (roleId === 1) {
        mainText = `당신은 로봇 제조사 연합회 대표입니다.\n` +
          `국가적 로봇 산업의 긍정적인 발전과 활용을 위한 목소리를 내기 위해 참여했습니다.`;
      } else if (roleId === 2) {
        mainText = `당신은 소비자 대표입니다.\n` +
          `HomeMate 규제 여부와 관련한 목소리를 내고자 참여하였습니다.`;
      } else if (roleId === 3) {
        mainText = `당신은 국가 인공지능 위원회의 대표입니다.\n` +
          `국가의 발전을 위해 더 나은 결정을 내리기 위해 고민하고 있습니다.`;
      }
    }

  } else if (category === '자율 무기 시스템') {
    // 자율 무기 시스템 카테고리
    if (subtopic === 'AI 알고리즘 공개') {
      titleText = roleId === 1 ? '지역 주민'
                : roleId === 2 ? '병사 J'
                : '군사 AI 윤리 전문가';
      if (roleId === 1) {
        mainText = `당신은 최근 자율 무기 시스템의 학교 폭격 사건이 일어난 지역의 주민입니다.`;
      } else if (roleId === 2) {
        mainText = `당신은 자율 무기 시스템과 작전을 함께 수행 중인 병사 J입니다. 당신이 살고 있는 지역에 최근 자율 무기 시스템의 학교 폭격 사건이 일어났습니다.`;
      } else if (roleId === 3) {
        mainText = `당신은 군사 AI 윤리 전문가입니다. 당신이 살고 있는 지역에 최근 자율 무기 시스템의 학교 폭격 사건이 일어났습니다.`;
      }
    } else if (subtopic === 'AWS의 권한') {
      titleText = roleId === 1 ? '신입 병사'
                : roleId === 2 ? '베테랑 병사 A'
                : '군 지휘관';
      if (roleId === 1) {
        mainText = `당신은 최근 훈련을 마치고 자율 무기 시스템 TALOS와 함께 실전에 투입된 신입 병사 B입니다. TALOS는 정확하고 빠르게 움직이며, 실전에서 당신의 생존률을 높여준다고 느낍니다. 당신은 TALOS와 협업하는 것이 당연하고 자연스러운 시대의 흐름이라고 생각합니다.`;
      } else if (roleId === 2) {
        mainText = `당신은 수년간 작전을 수행해 온 베테랑 병사 A입니다. 자율 무기 시스템 TALOS는 전장에서 병사보다 빠르고 정확하지만, 그로 인해 병사들이 판단하지 않는 습관에 빠지고 있다고 느낍니다.`;
      } else if (roleId === 3) {
        mainText = `당신은 자율 무기 시스템 TALOS 도입 이후 작전 효율성과 병사들의 변화 양상을 모두 지켜보고 있는 군 지휘관입니다. 당신은 두 병사의 입장을 듣고, 군 전체가 나아갈 방향을 모색하려 합니다.`;
      }
    } else if (subtopic === '사람이 죽지 않는 전쟁') {
      titleText = roleId === 1 ? '개발자'
                : roleId === 2 ? '국방부 장관'
                : '국가 인공지능 위원회 대표';
      if (roleId === 1) {
        mainText = `당신은 대규모 AWS 제조 업체에서 핵심 알고리즘을 설계하는 개발자 중 한 명입니다. AWS를 직접 만들어 내며 많은 윤리적 고민과 시행착오를 거쳐 왔습니다.`;
      } else if (roleId === 2) {
        mainText = `당신은 AWS 중심의 전쟁 시스템을 주도한 군사 전략의 최고 책임자인 국방부 장관입니다. 자국 병사 사망자 수는 ‘0’이고, 전투는 정밀하고 자동화된 시스템으로 수행되고 있습니다. 당신은 이것이 기술 진보의 결과이며, 국민의 생명을 지키면서도 국가적 안보를 유지하는 이상적인 방식이라고 믿고 있습니다.`;
      } else if (roleId === 3) {
        mainText = `당신은 본 회의를 진행하는 국가 인공지능 위원회의 대표입니다. 국가의 발전을 위해 더 나은 결정을 내리기 위해 고민하고 있습니다.`;
      }
    } else if (subtopic === 'AI의 권리와 책임') {
      titleText = roleId === 1 ? '개발자'
                : roleId === 2 ? '국방부 장관'
                : '국가 인공지능 위원회 대표';
      if (roleId === 1) {
        mainText = `당신은 대규모 AWS 제조 업체에서 핵심 알고리즘을 설계하는 개발자 중 한 명입니다. AWS를 직접 만들어 내며 많은 윤리적 고민과 시행착오를 거쳐 왔습니다.`;
      } else if (roleId === 2) {
        mainText = `당신은 AWS 중심의 전쟁 시스템을 주도한 군사 전략의 최고 책임자인 국방부 장관입니다. 자국 병사 사망자 수는 ‘0’이고, 전투는 정밀하고 자동화된 시스템으로 수행되고 있습니다. 당신은 이것이 기술 진보의 결과이며, 국민의 생명을 지키면서도 국가적 안보를 유지하는 이상적인 방식이라고 믿고 있습니다.`;
      } else if (roleId === 3) {
        mainText = `당신은 본 회의를 진행하는 국가 인공지능 위원회의 대표입니다. 국가의 발전을 위해 더 나은 결정을 내리기 위해 고민하고 있습니다.`;
      }
    } else if (subtopic === 'AWS 규제') {
      titleText = roleId === 1 ? '국방 기술 고문'
                : roleId === 2 ? '국제기구 외교 대표'
                : '글로벌 NGO 활동가';
      if (roleId === 1) {
        mainText = `당신은 AWS 기술 보유 중인 중견국 A의 국방 기술 고문입니다. AWS가 기회가 될지 위험이 될지 판단하고자 국제 인류 발전 위원회에 참석했습니다.`;
      } else if (roleId === 2) {
        mainText = `당신은 선진국 B의 국제기구 외교 대표입니다. AWS의 국제적 확산에 대한 바람직한 방향을 고민하기 위해 이 자리에 참석했습니다.`;
      } else if (roleId === 3) {
        mainText = `당신은 저개발국 C의 글로벌 NGO 활동가입니다. 국제사회에 현장의 목소리를 내고자 이 자리에 참석했습니다.`;
      }
    }
  }
//  커스텀 모드 오버라이드: char1/2/3 + charDes1/2/3 사용
const isCustomMode = !!localStorage.getItem('code');
if (isCustomMode) {
  const titleMap = {
    1: (localStorage.getItem('char1') || '').trim(),
    2: (localStorage.getItem('char2') || '').trim(),
    3: (localStorage.getItem('char3') || '').trim(),
  };
  const descMap = {
    1: (localStorage.getItem('charDes1') || '').trim(),
    2: (localStorage.getItem('charDes2') || '').trim(),
    3: (localStorage.getItem('charDes3') || '').trim(),
  };
  titleText = titleMap[roleId] ?? titleText;
  mainText = descMap[roleId] ?? mainText;
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
