import assert from 'node:assert/strict';
import { test } from 'node:test';
import { customGameStorage, setCustomGameCode, saveCustomGame, isCustomGameReady, clearCustomGame } from '../src/utils/customGameStorage.js';
import { clearAllLocalStorageKeys } from '../src/utils/storage.js';

const makeStorage = () => {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  };
};

const game = {
  code: 'CLASS1',
  title: '교사 게임',
  data: {
    opening: ['배경 설명'],
    roles: [{ name: '학생', description: '학생 입장' }],
    roleImages: { 1: '/role.png' },
    representativeImages: { dilemma_image_3: '/question.png' },
    dilemma: { situation: ['상황'], question: '질문', options: { agree_label: '찬성', disagree_label: '반대' } },
    flips: { agree_texts: ['추가 설명'], disagree_texts: ['다른 설명'] },
    finalMessages: { agree: '찬성 결말', disagree: '반대 결말' },
  },
};

test('커스텀 플레이 데이터는 탭별로 저장하며 수신·형식 검증·저장 성공 후에만 준비된다', () => {
  const originalSession = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
  const originalLocal = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const tabA = makeStorage();
  const tabB = makeStorage();
  const shared = makeStorage();
  const setTab = tab => Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: tab });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: shared });
  try {
    shared.setItem('code', 'EDITOR');
    shared.setItem('opening', '["제작 중인 본문"]');
    setTab(tabA);
    assert.equal(customGameStorage.getItem('code'), null);
    setCustomGameCode(game.code);
    assert.equal(isCustomGameReady(), false);

    for (const invalid of [null, {}, { ...game, code: 42 }, { ...game, code: 'OTHER' },
      { ...game, title: null }, { ...game, data: null }, { ...game, data: [] }, { ...game, data: '{}' }]) {
      assert.throws(() => saveCustomGame(invalid, game.code));
      assert.equal(isCustomGameReady(), false);
    }
    saveCustomGame(game, game.code);
    assert.equal(isCustomGameReady(), true);
    assert.equal(customGameStorage.getItem('opening'), '["배경 설명"]');
    assert.equal(customGameStorage.getItem('question'), '질문');
    assert.equal(customGameStorage.getItem('char1'), '학생');
    assert.equal(customGameStorage.getItem('charDes1'), '학생 입장');
    assert.equal(customGameStorage.getItem('role_image_1'), '/role.png');
    assert.equal(customGameStorage.getItem('dilemma_image_3'), '/question.png');
    assert.equal(customGameStorage.getItem('agreeEnding'), '찬성 결말');
    assert.equal(customGameStorage.getItem('disagreeEnding'), '반대 결말');
    assert.equal(shared.getItem('code'), 'EDITOR');
    assert.equal(shared.getItem('opening'), '["제작 중인 본문"]');

    setTab(tabB);
    setCustomGameCode('CLASS2');
    saveCustomGame({ code: 'CLASS2', title: '', data: { arbitraryKey: true } }, 'CLASS2');
    clearAllLocalStorageKeys();
    clearCustomGame();
    setTab(tabA);
    assert.equal(isCustomGameReady(), true);
    assert.equal(customGameStorage.getItem('code'), 'CLASS1');
    assert.equal(customGameStorage.getItem('opening'), '["배경 설명"]');
    clearAllLocalStorageKeys();
    assert.equal(isCustomGameReady(), true);

    setCustomGameCode('CLASS3');
    assert.equal(isCustomGameReady(), false);
    assert.equal(customGameStorage.getItem('opening'), null);
    saveCustomGame({ code: 'CLASS3', title: '', data: {} }, 'CLASS3');
    assert.equal(isCustomGameReady(), true); // 선택 항목이나 본문 내용은 검증하지 않는다.
    clearCustomGame();
    setCustomGameCode('CLASS1');
    setTab({ ...tabA, setItem() { throw new Error('QuotaExceededError'); } });
    assert.throws(() => saveCustomGame(game, game.code), /QuotaExceededError/);
    assert.equal(isCustomGameReady(), false);
    setTab({ ...tabA, setItem() {} });
    assert.throws(() => saveCustomGame(game, game.code), /저장/);
    assert.equal(isCustomGameReady(), false);
  } finally {
    for (const [key, descriptor] of [['sessionStorage', originalSession], ['localStorage', originalLocal]]) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
