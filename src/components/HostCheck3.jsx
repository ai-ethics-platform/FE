import React from 'react';
import closeIcon from '../assets/close.svg';
import SecondaryButton from './SecondaryButton';
import { Colors, FontStyles } from './styleConstants';
import axiosInstance from '../api/axiosInstance';
import { useHostActions } from '../hooks/useWebSocketMessage';
import PrimaryButton from "../components/PrimaryButton"
export default function HostCheck3({ onClose, round, subtopic, consensusChoice }) {
  const { sendNextPage } = useHostActions();

  const handleConfirm = async () => {
    const roomCode = localStorage.getItem('room_code');
    if (!roomCode) {
      alert('room_code가 없습니다. 방에 먼저 입장하세요.');
      return;
    }

    try {
      const intChoice = consensusChoice === 'agree' ? 1 : 2;
      //  합의 선택 서버에 기록
      await axiosInstance.post(
        `/rooms/rooms/round/${roomCode}/consensus`,
        {
          round_number: round,
          choice: intChoice,
          subtopic: subtopic
        }
      );

      //  WebSocket을 통해 step2로 넘어가도록 브로드캐스트
      sendNextPage();
      // 팝업 닫기
      onClose();
    } catch (err) {
      console.error('[HostCheck3] 합의 전송 실패:', err);
      alert('합의 전송 중 오류가 발생했습니다.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
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
        <p style={{ ...FontStyles.headlineSmall, color: Colors.brandPrimary, marginBottom: 40 }}>
          방장만 다음 페이지로 이동할 수 있습니다. <br />
          모든 유저가 해당 화면에 들어와있나요?
        </p>
        <div style={{
          display: 'flex',
          marginTop: 20,
          flexDirection: 'row',
          gap: 16,
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
    </div>
  );
}
