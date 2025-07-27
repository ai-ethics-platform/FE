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
import frame from '../assets/gameoptionbox1.svg';
import frameDisabled from '../assets/gameoptionboxdisable.svg';
import frameLocked from '../assets/gameoptionboxlocked.svg'; // 🔒 추가
import { FontStyles, Colors } from './styleConstants';

export default function GameMapOptionBox({
  option1 = null,
  option2 = null,
}) {
  const renderBox = (option, isSecond = false) => {
    if (!option || !option.text) return null;

    // 🔧 우선순위: locked > disabled > normal
    let frameSrc = frame;
    if (option.locked) {
      frameSrc = frameLocked;
    } else if (option.disabled) {
      frameSrc = frameDisabled;
    }

    const isInteractive = !option.locked && !option.disabled;

    return (
      <div
        onClick={isInteractive ? option.onClick : undefined}
        style={{
          position: 'relative',
          width: '15vw',
          display: 'inline-block',
          pointerEvents: isInteractive ? 'auto' : 'none',
          cursor: isInteractive ? 'pointer' : 'not-allowed',
          opacity: option.locked ? 0.7 : option.disabled ? 0.5 : 1,
          marginTop: isSecond ? '-4.5vh' : '0',
          marginLeft: isSecond ? '1.4vw' : '0',
        }}
      >
        <img
          src={frameSrc}
          alt={option.text}
          style={{ width: '120%', height: 'auto' }}
        />
        <div
          style={{
            position: 'absolute',
            top: '73%',
            left: '68%',
            transform: 'translate(-50%, -50%)',
            ...FontStyles.headlineSmall,
            fontSize: '1.2vw',
            color: Colors.brandPrimary,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {option.text}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {renderBox(option1)}
      {renderBox(option2, true)}
    </div>
  );
}
