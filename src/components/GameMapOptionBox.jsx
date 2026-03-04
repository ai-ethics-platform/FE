// import React from 'react';
// import frame from '../assets/gameoptionbox1.svg';
// import frameDisabled from '../assets/gameoptionboxdisable.svg';
// import { FontStyles, Colors } from './styleConstants';
// export default function GameMapOptionBox({
//     option1 = null,
//     option2 = null,
//   }) {
//     const renderBox = (option, isSecond = false) => {
//       if (!option || !option.text) return null;
  
//       const frameSrc = option.disabled ? frameDisabled : frame;
  
//       return (
//         <div
//           onClick={!option.disabled ? option.onClick : undefined}
//           style={{
//             position: 'relative',
//             width: '15vw',
//             display: 'inline-block',
//             pointerEvents: option.disabled ? 'none' : 'auto', // ✅ 추가
//             cursor: option.disabled ? 'not-allowed' : 'pointer',
//             opacity: option.disabled ? 0.5 : 1,
//             marginTop: isSecond ? '-4.5vh' : '0',
//             marginLeft: isSecond ? '1.4vw' : '0',
//           }}
//         >
//           <img
//             src={frameSrc}
//             alt={option.text}
//             style={{ width: '120%', height: 'auto' }}
//           />
//           <div
//             style={{
//               position: 'absolute',
//               top: '73%',
//               left: '68%',
//               transform: 'translate(-50%, -50%)',
//               ...FontStyles.headlineSmall,
//               fontSize: '1.2vw',
//               color: Colors.brandPrimary,
//               pointerEvents: 'none',
//               whiteSpace: 'nowrap',
//             }}
//           >
//             {option.text}
//           </div>
//         </div>
//       );
//     };
  
//     return (
//       <div style={{ display: 'flex', flexDirection: 'column' }}>
//         {renderBox(option1)}
//         {renderBox(option2, true)}
//       </div>
//     );
//   }
import React from 'react';
// Assets - Normal
import frameT from '../assets/gameoptionbox_T.svg';
import frameL from '../assets/gameoptionbox_L.svg';
import frameM from '../assets/gameoptionbox_M.svg';
import frameR from '../assets/gameoptionbox_R.svg';

// Assets - Disabled
import frameDisableT from '../assets/gameoptionbox_disable_T.svg';
import frameDisableL from '../assets/gameoptionbox_disable_L.svg';
import frameDisableM from '../assets/gameoptionbox_disable_M.svg';
import frameDisableR from '../assets/gameoptionbox_disable_R.svg';

// Assets - Locked
import frameLockedT from '../assets/gameoptionbox_locked_T.svg';
import frameLockedL from '../assets/gameoptionbox_locked_L.svg';
import frameLockedM from '../assets/gameoptionbox_locked_M.svg';
import frameLockedR from '../assets/gameoptionbox_locked_R.svg';

import { FontStyles, Colors } from './styleConstants';

export default function GameMapOptionBox({
  option1 = null,
  option2 = null,
}) {
  const lang = localStorage.getItem('app_lang') || 'ko';
  const isKo = lang === 'ko';

  const renderBox = (option, isSecond = false) => {
    if (!option || !option.text) return null;

    // 1) 상태별 이미지 세트 선택
    let parts;
    if (option.locked) {
      parts = { T: frameLockedT, L: frameLockedL, M: frameLockedM, R: frameLockedR };
    } else if (option.disabled) {
      parts = { T: frameDisableT, L: frameDisableL, M: frameDisableM, R: frameDisableR };
    } else {
      parts = { T: frameT, L: frameL, M: frameM, R: frameR };
    }

    const isInteractive = !option.locked && !option.disabled;

    // 2) 텍스트 길이에 따른 폰트 크기 조절
    const textLength = option.text?.length || 0;
    const dynamicFontSize = !isKo && textLength > 25 
      ? `${Math.max(1.1, 1.5 * (25 / textLength))}vw` 
      : '1.5vw';

    return (
      <div
        onClick={isInteractive ? option.onClick : undefined}
        style={{
          position: 'relative',
          width: 'fit-content',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          pointerEvents: isInteractive ? 'auto' : 'none',
          cursor: isInteractive ? 'pointer' : 'not-allowed',
          opacity: option.locked ? 0.7 : option.disabled ? 0.5 : 1,
          // 두 번째 옵션일 때의 간격 보정
          marginTop: isSecond ? '10px' : '0',
          // 하단 연결선 위치 조절을 원하실 경우 아래 marginLeft 수치를 수동 조정하세요.
          marginLeft: isSecond ? '24px' : '0', 
        }}
      >
        {/* [A] 연결선 파츠 (Line) - 상단 카드와 연결됨 */}
        <div style={{ position: 'relative', height: '100px', width: '50px' }}>
          <img src={parts.T} alt="" style={{ height: '131px', width: '50px', position: 'absolute', top: -31, left: 0 }} />
        </div>

        {/* [B] 박스 그룹 파츠 (L + M + R) */}
        <div style={{ 
          position: 'relative', 
          display: 'flex', 
          alignItems: 'center', 
          marginTop: '-75px', // 연결선 끝점(y=100)과 박스 중앙 정렬 보정
          marginLeft: '50px'  // 연결선이 끝나는 x=50 지점에서 박스 시작
        }}>
          {/* 배경 조각들 */}
          <div style={{ flex: '0 0 auto', display: 'flex' }}>
            <img src={parts.L} alt="" style={{ height: '64px', width: 'auto', display: 'block' }} />
          </div>
          
          {/* 중앙 파츠: 투명한 텍스트로 너비를 확보하여 이미지를 늘림 */}
          <div style={{ 
            flex: '1 1 auto', 
            height: '64px', 
            backgroundImage: `url(${parts.M})`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'auto 100%',
            display: 'flex',
            alignItems: 'center',
            minWidth: '15px'
          }}>
            {/* 박스 확장을 위한 Hidden Text (부피 확보용) */}
            <span style={{ 
              ...FontStyles.headlineSmall, 
              fontSize: dynamicFontSize, 
              padding: '0 1px', 
              visibility: 'hidden', 
              whiteSpace: 'nowrap' 
            }}>
              {option.text}
            </span>
          </div>

          <div style={{ flex: '0 0 auto', display: 'flex' }}>
            <img src={parts.R} alt="" style={{ height: '64px', width: 'auto', display: 'block' }} />
          </div>

          {/* [C] 실제 텍스트 레이어 - L+M+R 전체 기준 완벽한 정중앙 */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}>
            <span style={{
              ...FontStyles.headlineSmall,
              fontSize: dynamicFontSize,
              color: Colors.brandPrimary,
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}>
              {option.text}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      {renderBox(option1)}
      {renderBox(option2, true)}
    </div>
  );
}