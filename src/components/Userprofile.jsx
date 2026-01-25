import React from 'react';
import { Colors, FontStyles } from './styleConstants';
// 기본 아이콘들 (디테일 없음)
import icon1 from '../assets/1player.svg';
import icon2 from '../assets/2player.svg';
import icon3 from '../assets/3player.svg';
// 마이크 켜진 아이콘들 (디테일 없음)
import icon1MicOn from '../assets/1playermikeon.svg';
import icon2MicOn from '../assets/2playermikeon.svg';
import icon3MicOn from '../assets/3playermikeon.svg';
// 프로필 아이콘들 (디테일 있음)
import profile1 from '../assets/1playerprofile.svg';
import profile2 from '../assets/2playerprofile.svg';
import profile3 from '../assets/3playerprofile.svg';

// 안드로이드 1,2 제외 나머지 프로필 아이콘
import profile2_default from "../assets/2playerprofile_default.svg";
import profile2Micon_default from "../assets/2playerprofil_defaultmikeon.svg";
// 프로필 마이크 켜진 아이콘들 (디테일 있음)
import profile1MicOn from '../assets/1playerprofilemikeon.svg';
import profile2MicOn from '../assets/2playerprofilemikeon.svg';
import profile3MicOn from '../assets/3playerprofilemikeon.svg';

// 생성 모드용 이미지
import frame235 from '../assets/creatorprofiledefault.svg';
import defaultimg from "../assets/images/Frame235.png";
import crownIcon from '../assets/crown.svg';
import isMeIcon from '../assets/speaking.svg';
import axiosInstance from "../api/axiosInstance";
const colorMap = {
  '1P': Colors.player1P,
  '2P': Colors.player2P,
  '3P': Colors.player3P,
};
const iconMap = { '1P': icon1, '2P': icon2, '3P': icon3 };
const iconMicOnMap = { '1P': icon1MicOn, '2P': icon2MicOn, '3P': icon3MicOn };
const profileMap = { '1P': profile1, '2P': profile2, '3P': profile3 };
const profileMicOnMap = { '1P': profile1MicOn, '2P': profile2MicOn, '3P': profile3MicOn };

/**
 * @param {string} player      '1P' | '2P' | '3P'
 * @param {boolean} isLeader    방장 여부
 * @param {boolean} isMe        내 프로필 여부
 * @param {boolean} isSpeaking  말하고 있는 상태
 * @param {boolean} [nodescription=false]  true일 경우 description 강제 비활성화, 기본 아이콘 사용
 * @param {boolean} [create=false]  true일 경우 모든 캐릭터 이미지를 frame235로 사용
 * @param {string} [description='']  직접 전달된 설명 텍스트 (우선순위 높음)
 */
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
  // 커스텀 모드 판별
  const isCustomMode = !!localStorage.getItem('code');

  // localStorage raw read
  const rawSubtopic = localStorage.getItem('subtopic');
  // nodescription이 true면 무조건 서브토픽 무시
  const subtopic = nodescription ? null : rawSubtopic;
  const hasSubtopic = Boolean(subtopic);
  const roleNum = parseInt(player.replace('P', ''), 10);
  let mappedDesc = '';


  // 1) description prop이 있으면 우선 사용
  if (description && description.trim() !== '') {
    mappedDesc = description;
  }
  // 2) 커스텀 모드면 char1/char2/char3 사용 (nodescription이면 표시 안 함)
  else if (!nodescription && isCustomMode) {
    const customKey = player === '1P' ? 'char1' : player === '2P' ? 'char2' : 'char3';
    const customDesc = (localStorage.getItem(customKey) || '').trim();
    if (customDesc) {
      mappedDesc = customDesc;
    }
  }
  // 3) 기본(비커스텀) 매핑
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
        mappedDesc = roleNum === 1 ? '지역 주민' : roleNum === 2 ? '병사 ' : '군사 AI 윤리 전문가';
        break;
      }
      case 'AWS의 권한': {
        mappedDesc = roleNum === 1 ? '신입 병사' : roleNum === 2 ? '베테랑 병사 ' : '군 지휘관';
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
  }

  // 디테일 여부: create 모드가 아닐 때만 description 표시
  const isDetailed = !nodescription && mappedDesc !== '';
  const finalDesc = isDetailed ? mappedDesc : '';
// 로컬 읽기(따옴표 JSON 저장 대비)
const resolveImageSrc = (raw) => {
  if (!raw || raw === '-' || String(raw).trim() === '') return null;
  const u = String(raw).trim();
  if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
  const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
  if (!base) return u;
  return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
};
const readLocalUrl = (key) => {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  let val = raw.trim();
  try {
    const parsed = JSON.parse(val);
    if (typeof parsed === 'string') val = parsed.trim();
  } catch (_) {}
  return val || null;
};

const customRoleImageMap = {
  '1P': readLocalUrl('role_image_1'),
  '2P': readLocalUrl('role_image_2'),
  '3P': readLocalUrl('role_image_3'),
};

const getIcon = () => {
  if (create) return frame235;

  // ✅ 커스텀 모드면 role_image_* 무조건 우선 (nodescription 여부 상관 X)
  if (isCustomMode) {
    const customImg = customRoleImageMap[player];
    if (customImg) {
      return resolveImageSrc(customImg);
    } else {
      // 커스텀 모드인데 로컬 이미지 없음 → defaultimg 강제 사용
      return defaultimg;
    }    
  }

  // 상세 아이콘(프로필) 로직
  if (!nodescription && mappedDesc !== '') {
    if (player === '2P') {
      if (subtopic === 'AI의 개인 정보 수집' || subtopic === '안드로이드의 감정 표현') {
        return isSpeaking ? profile2MicOn : profile2;
      } else {
        return isSpeaking ? profile2Micon_default : profile2_default;
      }
    }
    return isSpeaking ? profileMicOnMap[player] : profileMap[player];
  }

  // 기본(동그란) 아이콘
  return isSpeaking ? iconMicOnMap[player] : iconMap[player];
};
  const icon = getIcon();

  const { style: externalStyle, ...divProps } = rest;
  const baseStyle = {
    position: 'relative',
    width: 200,
    height: 96,
    backgroundColor: Colors.componentBackgroundFloat,
    padding: '12px 12px 12px 20px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  };
  const containerSize = isSpeaking ? 70 : 64;

  return (
    <div {...divProps} style={{ ...baseStyle, ...externalStyle }}>
      {isMe && (
        <img
          src={isMeIcon}
          alt="내 차례 표시"
          style={{ position: 'absolute', top: 0, left: 0, width: 8, height: '100%' }}
        />
      )}
      <div
        style={{
          width: containerSize,
          height: containerSize,
          borderRadius: '50%',
          backgroundColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <img
          src={icon}
          alt={`${player} 아이콘`}
          style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: '50%' }}
          onError={(e) => { e.currentTarget.src = defaultimg; }} 
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', lineHeight: 1 }}>
          <span style={{ ...FontStyles.title, color: colorMap[player] }}>
            {player.replace('P', '')}
          </span>
          {isLeader && <img src={crownIcon} alt="방장" style={{ width: 20, height: 20, marginLeft: 6 }} />}
        </div>
        {isDetailed && (
          <div
            style={{
              ...FontStyles.body,
              color: colorMap[player],
              marginTop: 2,
              maxWidth: 180,
              wordBreak: 'keep-all',
              whiteSpace: 'normal',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.2,
            }}
          >
            {finalDesc}
          </div>
        )}
      </div>
    </div>
  );
}