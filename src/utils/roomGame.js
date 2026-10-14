import { customGameStorage, clearCustomGame, setCustomGameCode, saveCustomGame, isCustomGameReady } from './customGameStorage.js';

export function roomGameCode(room) {
  if (!room || typeof room.topic !== 'string') throw new Error('방 정보를 확인하지 못했습니다.');
  if (room.custom_game_code != null) {
    if (typeof room.custom_game_code !== 'string' || !room.custom_game_code.trim()) throw new Error('방의 게임 코드가 올바르지 않습니다.');
    return room.custom_game_code;
  }
  if (['안드로이드', '자율 무기 시스템'].includes(room.topic)) return null;
  // shortcut: Older rooms have no game binding; require a loaded matching invite until they are recreated.
  const code = customGameStorage.getItem('code');
  if (code && customGameStorage.getItem('creatorTitle') === room.topic) return code;
  throw new Error('방의 커스텀 게임을 확인할 수 없습니다. 공유 링크로 다시 접속해 방에 참여해주세요.');
}

export function isRoomGameReady(room) {
  try {
    const code = roomGameCode(room);
    return code ? customGameStorage.getItem('code') === code && isCustomGameReady() : !customGameStorage.getItem('code');
  } catch {
    return false;
  }
}

export async function prepareRoomGame(room, loadGame) {
  const code = roomGameCode(room);
  if (code) {
    setCustomGameCode(code, 'room_guard');
    if (!isCustomGameReady()) saveCustomGame(await loadGame(code), code, 'room_guard');
    if (!isRoomGameReady(room)) throw new Error('방의 게임 데이터를 저장하지 못했습니다. 다시 시도해주세요.');
  } else {
    clearCustomGame('room_guard_basic_room');
  }
}
