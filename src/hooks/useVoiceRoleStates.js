import { useState, useEffect, useCallback } from 'react';
import { useWebSocketMessage } from './useWebSocketMessage';

/**
 * 역할별 음성 상태를 관리하는 훅
 * @param {Object} roleUserMapping - 역할과 사용자 ID 매핑 { role1_user_id, role2_user_id, role3_user_id }
 * @returns {Object} { voiceStates, getVoiceStateForRole }
 */
export const useVoiceRoleStates = (roleUserMapping) => {
  // 각 역할별 음성 상태 저장
  const [voiceStates, setVoiceStates] = useState({
    1: { is_speaking: false, is_mic_on: false, nickname: '' },
    2: { is_speaking: false, is_mic_on: false, nickname: '' },
    3: { is_speaking: false, is_mic_on: false, nickname: '' }
  });

  // user_id를 role_id로 변환하는 함수
  const getUserIdToRoleId = useCallback((userId) => {
    if (!roleUserMapping || !userId) return null;
    
    const userIdStr = String(userId);
    if (roleUserMapping.role1_user_id === userIdStr) return 1;
    if (roleUserMapping.role2_user_id === userIdStr) return 2;
    if (roleUserMapping.role3_user_id === userIdStr) return 3;
    
    return null;
  }, [roleUserMapping]);

  // 음성 상태 업데이트 메시지 처리
  useWebSocketMessage('voice_status_update', (message) => {
    try {
      const { participant_id, nickname, is_mic_on, is_speaking } = message.data || message;
      
      console.log('🎤 음성 상태 업데이트:', {
        participant_id,
        nickname,
        is_mic_on,
        is_speaking,
        roleUserMapping
      });

      // participant_id(user_id)를 role_id로 변환
      const roleId = getUserIdToRoleId(participant_id);
      
      if (roleId) {
        setVoiceStates(prev => ({
          ...prev,
          [roleId]: {
            is_speaking: Boolean(is_speaking),
            is_mic_on: Boolean(is_mic_on),
            nickname: nickname || prev[roleId]?.nickname || ''
          }
        }));

        console.log(`👤 Role ${roleId} 음성 상태:`, {
          is_speaking: Boolean(is_speaking),
          is_mic_on: Boolean(is_mic_on),
          nickname: nickname || ''
        });
      } else {
        console.warn('⚠️ 알 수 없는 participant_id:', participant_id);
      }
    } catch (error) {
      console.error('❌ 음성 상태 업데이트 처리 오류:', error, message);
    }
  }, [getUserIdToRoleId]);

  // 특정 역할의 음성 상태를 가져오는 함수
  const getVoiceStateForRole = useCallback((roleId) => {
    const roleIdStr = String(roleId);
    return voiceStates[roleIdStr] || { 
      is_speaking: false, 
      is_mic_on: false, 
      nickname: '' 
    };
  }, [voiceStates]);

  // 초기화 시 로그
  useEffect(() => {
    console.log('🎮 VoiceRoleStates 초기화:', {
      roleUserMapping,
      voiceStates
    });
  }, [roleUserMapping]);

  // 상태 변경 시 로그
  useEffect(() => {
    console.log('🔄 Voice States 업데이트:', voiceStates);
  }, [voiceStates]);

  return {
    voiceStates,
    getVoiceStateForRole
  };
};