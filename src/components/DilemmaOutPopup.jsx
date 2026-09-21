// import React from 'react';
// import closeIcon from '../assets/close.svg';
// import SecondaryButton from './SecondaryButton';
// import { Colors, FontStyles } from './styleConstants';

// export default function DilemmaOutPopup({ onClose, onLogout }) {
//   return (
//    <div
//          style={{
//            width: 552,
//            height: 432,
//            justifyContent: 'center',
//            backgroundColor: Colors.componentBackgroundFloat,
//            borderRadius: 12,
//            padding: 32,
//            position: 'relative',
//            ...FontStyles.body,
//            display: 'flex',
//            flexDirection: 'column',
//            alignItems: 'center',
//            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
//          }}
//        >
//          <img
//            src={closeIcon}
//            alt="close"
//            onClick={onClose}
//            style={{
//              position: 'absolute',
//              top: 24,
//              right: 24,
//              width: 40,
//              height: 40,
//              cursor: 'pointer',
//            }}
//          />
   
//          <div style={{ ...FontStyles.headlineNormal, color: Colors.brandPrimary, marginBottom: 8 }}>
//             나가시겠습니까?
//          </div>
  
//          <div style={{ textAlign:'center',...FontStyles.body,color: Colors.grey05, marginBottom: 32 }}>
//            딜레마 게임 만들기를 취소하고 메인 화면으로 돌아가시겠어요? <br/>
//            작성하신 내용은 저장되지 않습니다.            
//            </div>
//       <SecondaryButton
//         onClick={() => {
//           console.log('logout button clicked');
//         }}
//         style={{
//           width: 168,
//           height: 72,
//         }}
//       >
//         나가기
//       </SecondaryButton>
//       <div style={{ marginTop:20,...FontStyles.body,color: Colors.systemRed, marginBottom: 15 }}>
//            *지금까지의 진행 상황을 복구할 수 없습니다. 
//          </div>
//       </div>
//   );
// }

import React, { useEffect, useRef } from 'react';
import closeIcon from '../assets/close.svg';
import SecondaryButton from './SecondaryButton';
import { Colors, FontStyles } from './styleConstants';

export default function DilemmaOutPopup({ onClose, onLogout }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-label="딜레마 만들기 나가기"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const { left, right, top, bottom } = event.currentTarget.getBoundingClientRect();
        if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) onClose();
      }}
      style={{
        width: 'min(552px, calc(100vw - 32px))',
        maxHeight: 'calc(100dvh - 32px)',
        boxSizing: 'border-box',
        border: 0,
        overflowY: 'auto',
        justifyContent: 'flex-start',
        backgroundColor: Colors.componentBackgroundFloat,
        borderRadius: 12,
        padding: '64px 24px 24px',
        position: 'fixed',
        ...FontStyles.body,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <button type="button" aria-label="닫기" onClick={onClose} autoFocus style={{ position: 'absolute', top: 12, right: 12, width: 44, height: 44, padding: 2, background: 'transparent', border: 0, cursor: 'pointer' }}>
        <img src={closeIcon} alt="" style={{ width: '100%', height: '100%' }} />
      </button>

      <div
        style={{
          ...FontStyles.headlineNormal,
          textAlign: 'center',
          overflowWrap: 'anywhere',
          color: Colors.brandPrimary,
          marginBottom: 8,
        }}
      >
        나가시겠습니까?
      </div>

      <div
        style={{
          textAlign: 'center',
          ...FontStyles.body,
          color: Colors.grey05,
          marginBottom: 32,
        }}
      >
        딜레마 게임 만들기를 취소하고 메인 화면으로 돌아가시겠어요? <br />
        작성하신 내용은 저장되지 않습니다.
      </div>

      <SecondaryButton
        onClick={onLogout} // ✅ 부모에서 navigate 실행
        style={{
          width: 168,
          height: 72,
        }}
      >
        나가기
      </SecondaryButton>

      <div
        style={{
          marginTop: 20,
          ...FontStyles.body,
          color: Colors.systemRed,
          marginBottom: 15,
        }}
      >
        *지금까지의 진행 상황을 복구할 수 없습니다.
      </div>
    </dialog>
  );
}
