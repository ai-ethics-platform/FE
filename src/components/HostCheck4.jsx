// selectroom에서 방장이 체크하고 넘어가는 부분
import React from 'react';
import closeIcon from '../assets/close.svg';
import SecondaryButton from './SecondaryButton';
import { Colors, FontStyles } from './styleConstants';
import axiosInstance from '../api/axiosInstance';
import { useHostActions } from '../hooks/useWebSocketMessage';
export default function HostCheck1({ onClose, mateName }) {
    const { sendNextPage } = useHostActions();

    const handleConfirm = async () => {
        const roomCode = localStorage.getItem('room_code');
        if (!roomCode) {
          alert('room_code가 없습니다. 방에 먼저 입장하세요.');
          return;
        }
      };
    
  return (
    <div
      style={{
        width: 552,
        height: 360,
        backgroundColor: Colors.componentBackgroundFloat,
        borderRadius: 12,
        padding: 32,
        position: 'relative',
        ...FontStyles.body,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
      }}
    >
      <img
        src={closeIcon}
        alt="닫기"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 40,
          height: 40,
          cursor: 'pointer',
        }}
      />
      <p style={{ ...FontStyles.headlineSmall, color:Colors.brandPrimary,marginBottom: 40 }}>
        방장만 다음 페이지로 이동할 수 있습니다. <br/>
        모든 유저가 해당 화면에 들어와있나요?
      </p>
      <div style = {{
        display: 'flex',
        marginTop: 20,
        flexDirection: 'row',
        gap: 16, // 버튼 간격
      }}>
      <SecondaryButton 
        style={{ width: 168, height: 72 }}
        onClick={onClose}
      >
        취소
      </SecondaryButton>
      <SecondaryButton 
        style={{ width: 168, height: 72 }}
        onClick={handleConfirm}
      >
        상의완료
      </SecondaryButton>
      </div>
     
    </div>
  );
}
