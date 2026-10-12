import assert from 'node:assert/strict';
import { test } from 'node:test';
import { customGameStorage, setCustomGameCode, saveCustomGame, clearCustomGame } from '../src/utils/customGameStorage.js';
import { isRoomGameReady, prepareRoomGame } from '../src/utils/roomGame.js';

test('방에 연결된 게임을 모든 참가자가 로드하고, 확인 실패 시 기본 게임으로 진행하지 않는다', async () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
  const values = new Map();
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: {
    getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key),
  } });
  const game = { code: 'SAME_GAME', title: '맞춤 수업', data: {
    opening: ['우리 반의 이야기'], roles: [1, 2, 3].map(role => ({ name: `역할 ${role}`, description: `설명 ${role}` })),
  } };
  const room = { room_code: '123456', topic: game.title, custom_game_code: game.code };
  try {
    for (const initialCode of [game.code, null, 'OTHER_GAME']) {
      clearCustomGame();
      if (initialCode) {
        setCustomGameCode(initialCode);
        saveCustomGame({ ...game, code: initialCode }, initialCode);
      }
      let loads = 0;
      await prepareRoomGame(room, async code => { loads++; assert.equal(code, game.code); return game; });
      assert.equal(loads, initialCode === game.code ? 0 : 1);
      assert.equal(customGameStorage.getItem('code'), game.code);
      assert.equal(isRoomGameReady(room), true);
    }
    clearCustomGame();
    await assert.rejects(prepareRoomGame(room, async () => { throw new Error('network unavailable'); }), /network unavailable/);
    assert.equal(isRoomGameReady(room), false);
    await assert.rejects(prepareRoomGame(room, async () => ({ ...game, code: 'WRONG_RESPONSE' })), /형식/);
    assert.equal(isRoomGameReady(room), false);
    await assert.rejects(prepareRoomGame(room, async () => ({ ...game, data: { ...game.data, opening: [] } })), /스토리/);
    assert.equal(isRoomGameReady(room), false);

    await prepareRoomGame(room, async () => game);
    assert.equal(isRoomGameReady({ topic: game.title }), true, 'Existing unbound rooms require the matching loaded invite');
    clearCustomGame();
    await assert.rejects(prepareRoomGame({ topic: game.title }, async () => game), /공유 링크/);
    assert.equal(isRoomGameReady({ topic: game.title }), false);
    await prepareRoomGame(room, async () => game);
    await prepareRoomGame({ topic: '안드로이드', custom_game_code: null }, async () => { throw new Error('Must not load a custom game'); });
    assert.equal(customGameStorage.getItem('code'), null);
    assert.equal(isRoomGameReady({ topic: '안드로이드', custom_game_code: null }), true);
    assert.equal(isRoomGameReady({ topic: game.title, custom_game_code: 123 }), false);
    assert.equal(isRoomGameReady(null), false);
  } finally {
    if (original) Object.defineProperty(globalThis, 'sessionStorage', original);
    else delete globalThis.sessionStorage;
  }
});
