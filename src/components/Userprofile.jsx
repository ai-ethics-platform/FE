// import React from 'react';
// import { Colors, FontStyles } from './styleConstants';
// // 기본 아이콘들 (디테일 없음)
// import icon1 from '../assets/1player.svg';
// import icon2 from '../assets/2player.svg';
// import icon3 from '../assets/3player.svg';
// // 마이크 켜진 아이콘들 (디테일 없음)
// import icon1MicOn from '../assets/1playermikeon.svg';
// import icon2MicOn from '../assets/2playermikeon.svg';
// import icon3MicOn from '../assets/3playermikeon.svg';
// // 프로필 아이콘들 (디테일 있음)
// import profile1 from '../assets/1playerprofile.svg';
// import profile2 from '../assets/2playerprofile.svg';
// import profile3 from '../assets/3playerprofile.svg';
// // 프로필 마이크 켜진 아이콘들 (디테일 있음)
// import profile1MicOn from '../assets/1playerprofilemikeon.svg';
// import profile2MicOn from '../assets/2playerprofilemikeon.svg';
// import profile3MicOn from '../assets/3playerprofilemikeon.svg';

// import crownIcon from '../assets/crown.svg';
// import isMeIcon from '../assets/speaking.svg'; 

// const colorMap = {
//   '1P': Colors.player1P,
//   '2P': Colors.player2P,
//   '3P': Colors.player3P,
// };

// // 기본 아이콘 맵 (디테일 없음)
// const iconMap = {
//   '1P': icon1,
//   '2P': icon2,
//   '3P': icon3,
// };

// // 마이크 켜진 아이콘 맵 (디테일 없음)
// const iconMicOnMap = {
//   '1P': icon1MicOn,
//   '2P': icon2MicOn,
//   '3P': icon3MicOn,
// };

// // 프로필 아이콘 맵 (디테일 있음)
// const profileMap = {
//   '1P': profile1,
//   '2P': profile2,
//   '3P': profile3,
// };

// // 프로필 마이크 켜진 아이콘 맵 (디테일 있음)
// const profileMicOnMap = {
//   '1P': profile1MicOn,
//   '2P': profile2MicOn,
//   '3P': profile3MicOn,
// };
// export default function UserProfile({
//   player = '1P',
//   characterDesc = '',
//   isLeader = false,
//   isMe = false,
//   isSpeaking = false,
//   ...rest           
// }) {

//   const isDetailed = characterDesc?.trim() !== '';
//   const color = colorMap[player] || Colors.player1P;
//    // 아이콘 선택 로직
//    const getIcon = () => {
//     if (isDetailed) {
//       // 디테일이 있는 경우
//       return isSpeaking ? profileMicOnMap[player] : profileMap[player];
//     } else {
//       // 디테일이 없는 경우
//       return isSpeaking ? iconMicOnMap[player] : iconMap[player];
//     }
//   };
  
//   const icon = getIcon();
//   const { style: externalStyle, ...divProps } = rest;
//   const baseStyle = {
//     position: 'relative',
//     width: 200,
//     height: 96,
//     backgroundColor: Colors.componentBackgroundFloat,
//     padding: '12px 12px 12px 20px',
//     boxSizing: 'border-box',
//     display: 'flex',
//     alignItems: 'center',
//     cursor: 'pointer',
//   };
//   const containerSize = isSpeaking ? 70 : 64;


//   return (
//     <div {...divProps} style={{ ...baseStyle, ...externalStyle }}>
//       {isMe && (
//         <img
//           src={isMeIcon}
//           alt="내 차례 표시"
//           style={{ position: 'absolute', top: 0, left: 0, width: 8, height: '100%' }}
//         />
//       )}
//       <div
//         style={{
//           width: containerSize,
//           height: containerSize,
//           borderRadius: '50%',
//           backgroundColor: !isDetailed ? color : 'transparent',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           flexShrink: 0,
//         }}
//       >
//         <img
//           src={icon}
//           alt={`${player} 아이콘`}
//           style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: '50%' }}
//         />
//       </div>
//       <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 12 }}>
//         <div style={{ display: 'flex', alignItems: 'center', lineHeight: 1 }}>
//         <span style={{ ...FontStyles.title, color }}>{player.replace('P', '')}</span>
//         {isLeader && (
//             <img
//               src={crownIcon}
//               alt="방장"
//               style={{ width: 20, height: 20, marginLeft: 6 }}
//             />
//           )}
//         </div>

//         {isDetailed && (
//           <div
//             style={{
//               ...FontStyles.Body,
//               color,
//               marginTop: 2,
//               maxWidth: 120,
//               whiteSpace: 'nowrap',
//               overflow: 'hidden',
//               textOverflow: 'ellipsis',
//               lineHeight: 1.2,
//             }}
//           >
//             {characterDesc}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


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
// 프로필 마이크 켜진 아이콘들 (디테일 있음)
import profile1MicOn from '../assets/1playerprofilemikeon.svg';
import profile2MicOn from '../assets/2playerprofilemikeon.svg';
import profile3MicOn from '../assets/3playerprofilemikeon.svg';

import crownIcon from '../assets/crown.svg';
import isMeIcon from '../assets/speaking.svg';

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
 */
export default function UserProfile({
  player = '1P',
  isLeader = false,
  isMe = false,
  isSpeaking = false,
  nodescription = false,
  ...rest
}) {
  // localStorage raw read
  const rawSubtopic = localStorage.getItem('subtopic');
  // nodescription이 true면 무조건 서브토픽 무시
  const subtopic = nodescription ? null : rawSubtopic;
  const hasSubtopic = Boolean(subtopic);
  const roleNum = parseInt(player.replace('P',''), 10);
  let mappedDesc = '';

  if (hasSubtopic) {
    switch (subtopic) {
      case '가정 1':
      case '가정 2':
        mappedDesc = roleNum === 1 ? '요양보호사 K' : roleNum === 2 ? '노모 L' : '자녀 J';
        break;
      case '국가 인공지능 위원회 1':
      case '국가 인공지능 위원회 2':
        mappedDesc = roleNum === 1 ? '로봇 제조사 연합회 대표'
          : roleNum === 2 ? '소비자 대표'
          : '국가 인공지능 위원회 대표';
        break;
      case '국제 인류 발전 위원회 1':
        mappedDesc = roleNum === 1 ? '기업 연합체 대표'
          : roleNum === 2 ? '국제 환경단체 대표'
          : '소비자 대표';
        break;
      default:
        mappedDesc = '';
    }
  }

  // 디테일 여부: nodescription false, 서브토픽 유효, 매핑 설명 존재
  const isDetailed = hasSubtopic && mappedDesc !== '';
  const finalDesc = isDetailed ? mappedDesc : '';

  // 아이콘 결정
  const getIcon = () => {
    if (isDetailed) return isSpeaking ? profileMicOnMap[player] : profileMap[player];
    return isSpeaking ? iconMicOnMap[player] : iconMap[player];
  };
  const icon = getIcon();

  const { style: externalStyle, ...divProps } = rest;
  const baseStyle = {
    position: 'relative',
    width: 216,
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
      <div style={{
        width: containerSize,
        height: containerSize,
        borderRadius: '50%',
        backgroundColor: !isDetailed ? colorMap[player] : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <img
          src={icon}
          alt={`${player} 아이콘`}
          style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: '50%' }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', lineHeight: 1 }}>
          <span style={{ ...FontStyles.title, color: colorMap[player] }}>{player.replace('P', '')}</span>
          {isLeader && <img src={crownIcon} alt="방장" style={{ width: 20, height: 20, marginLeft: 6 }} />}
        </div>
        {isDetailed && (
          <div style={{
            ...FontStyles.Body,
            color: colorMap[player],
            marginTop: 2,
            maxWidth: 120,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.2,
          }}>{finalDesc}</div>
        )}
      </div>
    </div>
  );
}
