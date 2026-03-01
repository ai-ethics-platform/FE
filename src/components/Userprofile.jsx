import React from 'react';
import { Colors, FontStyles } from './styleConstants';
import icon1 from '../assets/1player.svg';
import icon2 from '../assets/2player.svg';
import icon3 from '../assets/3player.svg';
import icon1MicOn from '../assets/1playermikeon.svg';
import icon2MicOn from '../assets/2playermikeon.svg';
import icon3MicOn from '../assets/3playermikeon.svg';
import profile1 from '../assets/1playerprofile.svg';
import profile2 from '../assets/2playerprofile.svg';
import profile3 from '../assets/3playerprofile.svg';
import profile2_default from "../assets/2playerprofile_default.svg";
import profile2Micon_default from "../assets/2playerprofil_defaultmikeon.svg";
import profile1MicOn from '../assets/1playerprofilemikeon.svg';
import profile2MicOn from '../assets/2playerprofilemikeon.svg';
import profile3MicOn from '../assets/3playerprofilemikeon.svg';
import frame235 from '../assets/creatorprofiledefault.svg';
import defaultimg from "../assets/images/Frame235.png";
import crownIcon from '../assets/crown.svg';
import isMeIcon from '../assets/speaking.svg';
import axiosInstance from "../api/axiosInstance";

// 다국어 지원 임포트
import { translations } from '../utils/language';

const colorMap = { '1P': Colors.player1P, '2P': Colors.player2P, '3P': Colors.player3P };
const iconMap = { '1P': icon1, '2P': icon2, '3P': icon3 };
const iconMicOnMap = { '1P': icon1MicOn, '2P': icon2MicOn, '3P': icon3MicOn };
const profileMap = { '1P': profile1, '2P': profile2, '3P': profile3 };
const profileMicOnMap = { '1P': profile1MicOn, '2P': profile2MicOn, '3P': profile3MicOn };

export default function UserProfile({
  player = '1P',
  isLeader = false,
  isMe = false,
  isSpeaking = false,
  nodescription = false,
  create = false,
  description = '',
  ...rest
}) {
  const lang = localStorage.getItem('app_lang') || 'ko';
  const t_map = translations[lang]?.GameMap || {};
  const t_ko_map = translations['ko']?.GameMap || {};

  const isCustomMode = !!localStorage.getItem('code');
  const rawSubtopic = localStorage.getItem('subtopic');
  const subtopic = nodescription ? null : rawSubtopic;
  
  // 1순위: 프롭으로 전달된 설명, 2순위: 커스텀 모드 이름
  let mappedDesc = (description || '').trim();

  // 필요한 변수 정의 (충돌 해결 과정에서 추가)
  const roleNum = parseInt(player.replace('P', ''), 10);
  const hasSubtopic = !!subtopic;

  if (mappedDesc === '' && !nodescription && isCustomMode) {
    const customKey = player === '1P' ? 'char1' : player === '2P' ? 'char2' : 'char3';
    
    // [두 변경 사항 모두 수락 및 통합]
    const customDesc = (localStorage.getItem(customKey) || '').trim();
    if (customDesc) {
      mappedDesc = customDesc;
    }
  }
  // 3) 기본(비커스텀) 매핑 - 원본(upstream)의 새로운 시나리오 데이터 유지
  else if (hasSubtopic) {
    switch (subtopic) {
      // 안드로이드 관련 서브토픽
      case 'AI의 개인 정보 수집':
      case '안드로이드의 감정 표현':
        mappedDesc = roleNum === 1 ? '요양보호사 K' : roleNum === 2 ? '노모 L' : '자녀 J';
        break;
      case '아이들을 위한 서비스':
      case '설명 가능한 AI':
        mappedDesc =
          roleNum === 1 ? '로봇 제조사 연합회 대표' : roleNum === 2 ? '소비자 대표' : '국가 인공지능 위원회 대표';
        break;
      case '지구, 인간, AI':
        mappedDesc =
          roleNum === 1 ? '기업 연합체 대표' : roleNum === 2 ? '국제 환경단체 대표' : '소비자 대표';
        break;

      // 자율 무기 시스템 관련 서브토픽
      case 'AI 알고리즘 공개': {
        mappedDesc = roleNum === 1 ? '지역 주민' : roleNum === 2 ? '병사 J' : '군사 AI 윤리 전문가';
        break;
      }
      case 'AWS의 권한': {
        mappedDesc = roleNum === 1 ? '신입 병사' : roleNum === 2 ? '베테랑 병사 A' : '군 지휘관';
        break;
      }
      case '사람이 죽지 않는 전쟁': {
        mappedDesc = roleNum === 1 ? '개발자' : roleNum === 2 ? '국방부 장관' : '국가 인공지능 위원회 대표';
        break;
      }
      case 'AI의 권리와 책임': {
        mappedDesc = roleNum === 1 ? '개발자' : roleNum === 2 ? '국방부 장관' : '국가 인공지능 위원회 대표';
        break;
      }
      case 'AWS 규제': {
        mappedDesc = roleNum === 1 ? '국방 기술 고문' : roleNum === 2 ? '국제기구 외교 대표' : '글로벌 NGO 활동가';
        break;
      }
      default:
        mappedDesc = '';
    }
    mappedDesc = (localStorage.getItem(customKey) || '').trim();
  }

  const isDetailed = !nodescription && mappedDesc !== '';
  const finalDesc = isDetailed ? mappedDesc : '';

  const resolveImageSrc = (raw) => {
    if (!raw || raw === '-' || String(raw).trim() === '') return null;
    const u = String(raw).trim();
    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
    const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
    return base ? `${base}${u.startsWith('/') ? '' : '/'}${u}` : u;
  };

  const getIcon = () => {
    if (create) return frame235;
    if (isCustomMode) {
      const customImg = localStorage.getItem(`role_image_${player.replace('P', '')}`);
      return customImg ? resolveImageSrc(customImg) : defaultimg;
    }

    // 상세 아이콘(프로필) 로직 - 확장형 매칭
    if (!nodescription && mappedDesc !== '') {
      if (player === '2P') {
        const isHome = subtopic === 'AI의 개인 정보 수집' || subtopic === t_ko_map.andOption1_1 || subtopic === t_map.andOption1_1;
        if (isHome) return isSpeaking ? profile2MicOn : profile2;
        return isSpeaking ? profile2Micon_default : profile2_default;
      }
      return isSpeaking ? profileMicOnMap[player] : profileMap[player];
    }
    return isSpeaking ? iconMicOnMap[player] : iconMap[player];
  };

  const icon = getIcon();
  const { style: externalStyle, ...divProps } = rest;

  return (
    <div {...divProps} style={{ 
      position: 'relative', width: 215, height: 96, 
      backgroundColor: Colors.componentBackgroundFloat, 
      padding: '12px 12px 12px 20px', boxSizing: 'border-box', 
      display: 'flex', alignItems: 'center', cursor: 'pointer',
      ...externalStyle 
    }}>
      {isMe && (
        <img src={isMeIcon} alt="me" style={{ position: 'absolute', top: 0, left: 0, width: 8, height: '100%' }} />
      )}
      <div style={{ width: isSpeaking ? 70 : 64, height: isSpeaking ? 70 : 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <img src={icon} alt={player} style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: '50%' }} onError={(e) => { e.currentTarget.src = defaultimg; }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', lineHeight: 1 }}>
          <span style={{ ...FontStyles.title, color: colorMap[player] }}>{player.replace('P', '')}</span>
          {isLeader && <img src={crownIcon} alt="leader" style={{ width: 20, height: 20, marginLeft: 6 }} />}
        </div>
        {isDetailed && (
          <div style={{ ...FontStyles.body, color: colorMap[player], marginTop: 2, maxWidth: 230, wordBreak: 'keep-all', whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
            {finalDesc}
          </div>
        )}
      </div>
    </div>
  );
}