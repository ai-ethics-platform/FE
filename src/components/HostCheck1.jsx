// selectroom에서 방장이 체크하고 넘어가는 부분
import React from 'react';
import closeIcon from '../assets/close.svg';
import SecondaryButton from './SecondaryButton';
import { Colors, FontStyles } from './styleConstants';
import axiosInstance from '../api/axiosInstance';
import { useHostActions } from '../hooks/useWebSocketMessage';
export default function HostCheck1({ onClose, activeIndex }) {
    const { sendNextPage } = useHostActions();

    const handleConfirm = async () => {
        const roomCode = localStorage.getItem('room_code');
        if (!roomCode) {
          alert('room_code가 없습니다. 방에 먼저 입장하세요.');
          return;
        }
    
        try {
          //  1) 메이트 캐릭터 선택 POST
          const { data } = await axiosInstance.post('/rooms/ai-select', {
            room_code: roomCode,
            ai_type: activeIndex + 1,
          });
    
          console.log('[HostCheck1] AI 선택 성공:', data);
          localStorage.setItem('selectedCharacterIndex', String(activeIndex));
    
          //  2) WebSocket으로 다음 페이지 브로드캐스트
          sendNextPage();
    
          //  3) 팝업 닫기
          onClose();
        } catch (err) {
          console.error('[HostCheck1] AI 선택 실패:', err);
          alert('메이트 선택 실패');
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
     <PrimaryButton
        style={{ width: 168, height: 72 }}
        onClick={handleConfirm}
        >
        확인완료
    </PrimaryButton>
      </div>
     
    </div>
  );
}
