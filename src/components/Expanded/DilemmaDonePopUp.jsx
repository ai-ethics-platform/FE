import React, { useEffect, useRef } from 'react';
import closeIcon from '../../assets/closeorange.svg';
import SecondaryButtonOrange from './SecondaryButtonOrange';
import { Colors, FontStyles } from '../styleConstants';

export default function DilemmaDonePopUp({ onClose, onLogout, onConfirm }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-label="딜레마 만들기 완료"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const { left, right, top, bottom } = event.currentTarget.getBoundingClientRect();
        if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) onClose();
      }}
      style={{
        width: 'min(602px, calc(100vw - 32px))',
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
          color: Colors.CreatorPrimary,
          marginBottom: 8,
        }}
      >
        딜레마 게임 만들기를 완료할까요?
      </div>

      <div
        style={{
          textAlign: 'center',
          ...FontStyles.body,
          color: Colors.creatorgrey06,
          marginBottom: 32,
        }}
      >
        좌측 상단의 [미리보기 모드]로 전체 내용을 점검을 하셨나요? <br />
        딜레마 게임 만들기를 완료하면 더 이상의 수정은 어렵습니다.
      </div>

      <SecondaryButtonOrange
        onClick={() => {
          if (onConfirm) {
            onConfirm(); // 부모에서 API 호출
          }
        }}
        style={{
          width: 168,
          height: 72,
        }}
      >
        완료하기
      </SecondaryButtonOrange>
    </dialog>
  );
}
