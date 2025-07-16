// hooks/useVoiceWebSocket.js
import { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../WebSocketProvider';

/**
 * 음성 상태 업데이트 메시지 처리
 * @param {Function} onVoiceUpdate - 음성 상태 업데이트 핸들러
 * @param {Array} dependencies - 의존성 배열
 */
export const useVoiceStatusUpdate = (onVoiceUpdate, dependencies = []) => {
  const { addMessageHandler, removeMessageHandler } = useWebSocket();
  const handlerRef = useRef(onVoiceUpdate);
  const handlerIdRef = useRef(`voice_status_${Date.now()}_${Math.random()}`);

  useEffect(() => {
    handlerRef.current = onVoiceUpdate;
  }, [onVoiceUpdate, ...dependencies]);

  useEffect(() => {
    const handlerId = handlerIdRef.current;
    const messageHandler = (message) => {
      if (message.participant_id && message.hasOwnProperty('is_speaking')) {
        handlerRef.current(message);
      }
    };
    addMessageHandler(handlerId, messageHandler);
    return () => removeMessageHandler(handlerId);
  }, [addMessageHandler, removeMessageHandler]);
};

/**
 * 역할별 음성 상태 관리 훅
 * @param {Object} roleUserMapping - 역할별 사용자 매핑 (e.g. { role1_user_id, role2_user_id, role3_user_id })
 * @returns {Object} 음성 상태 및 getter
 */
export const useVoiceRoleStates = (roleUserMapping) => {
  const [voiceStates, setVoiceStates] = useState({});

  // participant_id를 role_id로 변환
  const getRoleId = (participantId) => {
    const pid = String(participantId);
    if (pid === roleUserMapping.role1_user_id) return 1;
    if (pid === roleUserMapping.role2_user_id) return 2;
    if (pid === roleUserMapping.role3_user_id) return 3;
    return null;
  };

  // 음성 상태 업데이트 핸들러
  const handleVoiceUpdate = (message) => {
    const { participant_id, nickname, is_mic_on, is_speaking } = message;
    setVoiceStates(prev => ({
      ...prev,
      [participant_id]: { nickname, is_mic_on, is_speaking, timestamp: Date.now() }
    }));
  };

  // 메시지 구독
  useVoiceStatusUpdate(handleVoiceUpdate, [roleUserMapping]);

  /**
   * 특정 역할의 음성 상태 가져오기
   * @param {number} roleId
   */
  const getVoiceStateForRole = (roleId) => {
    const mappingKey = `role${roleId}_user_id`;
    const userId = roleUserMapping[mappingKey];
    return voiceStates[userId] || { is_mic_on: false, is_speaking: false, nickname: '' };
  };

  return { voiceStates, getVoiceStateForRole };
};
