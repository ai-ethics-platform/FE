import React from 'react';
import { Colors, FontStyles } from './styleConstants';
// 아이콘 임포트 생략 (기존과 동일)
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
  const isCustomMode = !!localStorage.getItem('code');
  const roleNum = parseInt(player.replace('P', ''), 10);

  // 1. 현재 언어팩 로드 (자동 감지)
  const lang = localStorage.getItem('app_lang') || localStorage.getItem('language') || 'ko';
  const currentLangData = translations[lang] || translations['ko'];
  const t_small = currentLangData.SmallDescription || {};

  // 2. 설명값 결정 (우선순위 로직)
  let mappedDesc = '';

  if (description && description.trim() !== '') {
    // [우선순위 1] 부모(Layout 등)가 직접 번역해서 넘겨준 경우
    mappedDesc = description;
  } else if (!nodescription && isCustomMode) {
    // [우선순위 2] 커스텀 모드
    const customKey = player === '1P' ? 'char1' : player === '2P' ? 'char2' : 'char3';
    mappedDesc = (localStorage.getItem(customKey) || '').trim();
  } else if (!nodescription) {
    // [우선순위 3] 자동 감지 폴백 (MateName 등에서 유용)
    const subtopic = (localStorage.getItem('subtopic') || '').trim();
    const title = (localStorage.getItem('title') || '').trim();
    const category = (localStorage.getItem('category') || '').trim();
    const isAndroid = category === '안드로이드';

    if (isAndroid) {
      if (title === '가정') {
        mappedDesc = roleNum === 1 ? t_small.title_caregiver_k : roleNum === 2 ? t_small.title_mother_l : t_small.title_child_j;
      } else if (title.includes('국가')) {
        mappedDesc = roleNum === 1 ? t_small.title_industry_rep : roleNum === 2 ? t_small.title_consumer_rep : t_small.title_council_rep;
      } else if (title.includes('국제')) {
        mappedDesc = roleNum === 1 ? t_small.title_industry_rep : roleNum === 2 ? t_small.title_env_rep : t_small.title_consumer_rep;
      }
    } else {
      // AWS 시나리오 (subtopic 기준)
      if (subtopic === 'AI 알고리즘 공개') {
        mappedDesc = roleNum === 1 ? t_small.title_resident : roleNum === 2 ? t_small.title_soldier_j : t_small.title_ethics_expert;
      } else if (subtopic === 'AWS의 권한') {
        mappedDesc = roleNum === 1 ? t_small.title_new_soldier : roleNum === 2 ? t_small.title_veteran_soldier : t_small.title_commander;
      } else if (subtopic === '사람이 죽지 않는 전쟁' || subtopic === 'AI의 권리와 책임') {
        mappedDesc = roleNum === 1 ? t_small.title_developer : roleNum === 2 ? t_small.title_minister : t_small.title_council_rep;
      } else if (subtopic === 'AWS 규제') {
        mappedDesc = roleNum === 1 ? t_small.title_advisor : roleNum === 2 ? t_small.title_diplomat : t_small.title_ngo_activist;
      }
    }
  }

  const isDetailed = !nodescription && mappedDesc !== '';
  const finalDesc = isDetailed ? mappedDesc : '';

  // 이미지 로직 및 렌더링 부분은 이전과 동일 (생략 없이 유지)
  const resolveImageSrc = (raw) => {
    if (!raw || raw === '-' || String(raw).trim() === '') return null;
    const u = String(raw).trim();
    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
    const base = axiosInstance?.defaults?.baseURL?.replace(/\/+$/, '');
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
    if (isCustomMode) {
      const customImg = customRoleImageMap[player];
      return customImg ? resolveImageSrc(customImg) : defaultimg;
    }
    const subtopic = localStorage.getItem('subtopic') || '';
    if (!nodescription && mappedDesc !== '') {
      if (player === '2P') {
        if (subtopic.includes('개인 정보') || subtopic.includes('감정 표현')) {
          return isSpeaking ? profile2MicOn : profile2;
        } else {
          return isSpeaking ? profile2Micon_default : profile2_default;
        }
      }
      return isSpeaking ? profileMicOnMap[player] : profileMap[player];
    }
    return isSpeaking ? iconMicOnMap[player] : iconMap[player];
  };

  const icon = getIcon();
  const { style: externalStyle, ...divProps } = rest;
  const baseStyle = {
    position: 'relative', width: 210, height: 96,
    backgroundColor: Colors.componentBackgroundFloat,
    padding: '12px 12px 12px 20px', boxSizing: 'border-box',
    display: 'flex', alignItems: 'center', cursor: 'pointer',
  };
  const containerSize = isSpeaking ? 70 : 64;

  return (
    <div {...divProps} style={{ ...baseStyle, ...externalStyle }}>
      {isMe && (
        <img src={isMeIcon} alt="me" style={{ position: 'absolute', top: 0, left: 0, width: 8, height: '100%' }} />
      )}
      <div style={{ width: containerSize, height: containerSize, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <img src={icon} alt={player} style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: '50%' }} onError={(e) => { e.currentTarget.src = defaultimg; }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', lineHeight: 1 }}>
          <span style={{ ...FontStyles.title, color: colorMap[player] }}>{player.replace('P', '')}</span>
          {isLeader && <img src={crownIcon} alt="leader" style={{ width: 20, height: 20, marginLeft: 6 }} />}
        </div>
        {isDetailed && (
          <div style={{ ...FontStyles.body, color: colorMap[player], marginTop: 2, maxWidth: 180, wordBreak: 'keep-all', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
            {finalDesc}
          </div>
        )}
      </div>
    </div>
  );
}