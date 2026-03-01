import React from 'react';
import char1 from '../assets/CharacterPopUp1.svg';
import char2 from '../assets/CharacterPopUp2.svg';
import char2_AWS from '../assets/CharacterPopUp2_AWS.svg';

import char3 from '../assets/CharacterPopUp3.svg';
import closeIcon from "../assets/close.svg";

import { Colors, FontStyles } from './styleConstants';
import { attachJosa } from '../utils/resolveParagraphs';

// 다국어 지원 임포트
import { translations } from '../utils/language';

export default function CharacterPopup({ subtopic, roleId, mateName, onClose }) {
  // 현재 언어 설정 및 언어팩 로드
  const lang = localStorage.getItem('app_lang') || 'ko';
  const t_small = translations[lang]?.SmallDescription || {};
  const t_map = translations[lang]?.GameMap || {};
  const t_ko_map = translations['ko']?.GameMap || {};

  const category = localStorage.getItem('category'); 
  const subtopic1 = localStorage.getItem('subtopic');

  // 확장형 조사 처리 및 변수 치환 헬퍼
  const formatText = (text) => {
    if (!text) return "";
    const isKorean = lang === 'ko';
    
    // 한국어(ko)를 제외한 모든 언어에서는 조사가 붙지 않도록 공백 처리하거나 무력화 
    return text.replaceAll('{{mateName}}', mateName)
               .replaceAll('{{eulReul}}', isKorean ? (attachJosa(mateName, '을/를').replace(mateName, '')) : '')
               .replaceAll('{{gwaWa}}', isKorean ? (attachJosa(mateName, '과/와').replace(mateName, '')) : '')
               .replaceAll('{{eunNeun}}', isKorean ? (attachJosa(mateName, '은/는').replace(mateName, '')) : '');
  };

  // 1) SVG 선택 (이중 매칭 전략 적용)
  const bgSvg = (() => {
    switch (roleId) {
      case 1:
        return char1;
      case 2:
        // 한국어 원문과 현재 언어팩 값을 모두 체크하여 판별 
        const isHomeScenario = 
          subtopic1 === 'AI의 개인 정보 수집' || 
          subtopic1 === '안드로이드의 감정 표현' ||
          subtopic1 === t_ko_map.andOption1_1 || 
          subtopic1 === t_map.andOption1_1;
        return isHomeScenario ? char2 : char2_AWS;
      case 3:
        return char3;
      default:
        return char1;
    }
  })();

  let titleText = '';
  let mainText = '';

  // 카테고리 판별 (일반화된 로직 사용)
  const isAndroid = category === '안드로이드' || category === 'Android' || category === t_map.categoryAndroid;
  const isAWS = category === '자율 무기 시스템' || category === 'Autonomous Weapon Systems' || category === t_map.categoryAWS;

  if (isAndroid) {
    // 안드로이드 카테고리
    if (['AI의 개인 정보 수집', '안드로이드의 감정 표현', t_ko_map.andOption1_1, t_map.andOption1_1].includes(subtopic)) {
      if (roleId === 1) { titleText = t_small.title_caregiver_k; mainText = formatText(t_small.desc_caregiver_k); }
      else if (roleId === 2) { titleText = t_small.title_mother_l; mainText = formatText(t_small.desc_mother_l); }
      else { titleText = t_small.title_child_j; mainText = formatText(t_small.desc_child_j); }
    } else if (['아이들을 위한 서비스', '설명 가능한 AI', t_ko_map.andOption2_1, t_map.andOption2_1, t_ko_map.andOption2_2, t_map.andOption2_2].includes(subtopic)) {
      if (roleId === 1) { titleText = t_small.title_industry_rep; mainText = formatText(t_small.desc_industry_rep); }
      else if (roleId === 2) { titleText = t_small.title_consumer_rep; mainText = formatText(t_small.desc_consumer_rep); }
      else { titleText = t_small.title_council_rep; mainText = formatText(t_small.desc_council_rep); }
    } else if (subtopic === '지구, 인간, AI' || subtopic === t_ko_map.andOption3_1 || subtopic === t_map.andOption3_1) {
      if (roleId === 1) { titleText = t_small.title_enterprise_rep; mainText = formatText(t_small.desc_enterprise_rep); }
      else if (roleId === 2) { titleText = t_small.title_env_rep; mainText = formatText(t_small.desc_env_rep); }
      else { titleText = t_small.title_consumer_rep; mainText = formatText(t_small.desc_consumer_rep); }
    }

  } else if (isAWS) {
    // 자율 무기 시스템 카테고리
    if (subtopic === 'AI 알고리즘 공개' || subtopic === t_ko_map.awsOption1_1 || subtopic === t_map.awsOption1_1) {
      if (roleId === 1) { titleText = t_small.title_resident; mainText = formatText(t_small.desc_resident); }
      else if (roleId === 2) { titleText = t_small.title_soldier_j; mainText = formatText(t_small.desc_soldier_j); }
      else { titleText = t_small.title_ethics_expert; mainText = formatText(t_small.desc_ethics_expert); }
    } else if (subtopic === 'AWS의 권한' || subtopic === t_ko_map.awsOption1_2 || subtopic === t_map.awsOption1_2) {
      if (roleId === 1) { titleText = t_small.title_new_soldier; mainText = formatText(t_small.desc_new_soldier); }
      else if (roleId === 2) { titleText = t_small.title_veteran_soldier; mainText = formatText(t_small.desc_veteran_soldier); }
      else { titleText = t_small.title_commander; mainText = formatText(t_small.desc_commander); }
    } else if (subtopic === '사람이 죽지 않는 전쟁' || subtopic === t_ko_map.awsOption2_1 || subtopic === t_map.awsOption2_1 || subtopic === 'AI의 권리와 책임' || subtopic === t_ko_map.awsOption2_2 || subtopic === t_map.awsOption2_2) {
      if (roleId === 1) { titleText = t_small.title_developer; mainText = formatText(t_small.desc_developer); }
      else if (roleId === 2) { titleText = t_small.title_minister; mainText = formatText(t_small.desc_minister); }
      else { titleText = t_small.title_council_rep; mainText = formatText(t_small.desc_council_rep); }
    } else if (subtopic === 'AWS 규제' || subtopic === t_ko_map.awsOption3_1 || subtopic === t_map.awsOption3_1) {
      if (roleId === 1) { titleText = t_small.title_advisor; mainText = formatText(t_small.desc_advisor); }
      else if (roleId === 2) { titleText = t_small.title_diplomat; mainText = formatText(t_small.desc_diplomat); }
      else { titleText = t_small.title_ngo_activist; mainText = formatText(t_small.desc_ngo_activist); }
    }
  }

  // 커스텀 모드 오버라이드
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

  const getDynamicTitleStyle = (text) => {
    const len = text?.length || 0;
    // 글자 수가 많을수록 폰트를 줄임 (기본 FontStyles.bodyBold 사이즈는 보통 18~20px 추정)
    if (len > 28) return { fontSize: '13.5px' }; 
    return {}; // 기본값 유지 (bodyBold 스타일 따름)
  };

  return (
    <div style={{
      position: 'relative',
      width: 264,
      height: 440,
      overflow: 'hidden',
      fontFamily: 'sans-serif'
    }}>
      <img
        src={bgSvg}
        alt="character background"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
       
      <div style={{
        position: 'absolute',
        top: '41.2%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        ...FontStyles.bodyBold,
        color:Colors.grey01,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        ...getDynamicTitleStyle(titleText)
      }}>
        {titleText}
      </div>

      <div style={{
        position: 'absolute',
        top:'52%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        ...FontStyles.body,
        color:Colors.grey07,
        whiteSpace: 'pre-line',
      }}>
        {mainText}
      </div>
    </div>
  );
}