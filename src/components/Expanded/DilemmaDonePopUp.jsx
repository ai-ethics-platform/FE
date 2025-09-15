import React from 'react';
import closeIcon from '../../assets/closeorange.svg';
import SecondaryButtonOrange from './SecondaryButtonOrange';
import { Colors, FontStyles } from '../styleConstants';

export default function DilemmaDonePopUp({ onClose, onLogout, onConfirm }) {
  return (
    <div
      style={{
        width: 602,
        height: 302,
        justifyContent: 'center',
        backgroundColor: Colors.componentBackgroundFloat,
        borderRadius: 12,
        padding: 32,
        position: 'relative',
        ...FontStyles.body,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <img
        src={closeIcon}
        alt="close"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          width: 40,
          height: 40,
          cursor: 'pointer',
        }}
      />

      <div
        style={{
          ...FontStyles.headlineNormal,
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
        좌측 상단의 [미리보기모드]로 전체 내용을 점검을 하셨나요? <br />
        딜레마 게임 만들기를 완료하면 더 이상의 수정은 어렵습니다
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
    </div>
  );
}
