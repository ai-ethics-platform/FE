import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { clearAllLocalStorageKeys } from '../src/utils/storage.js';

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
let values;

beforeEach(() => {
  values = new Map(Object.entries({
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    token_type: 'Bearer',
    creatorTitle: '제작한 게임',
    code: 'GAME123',
    url: 'https://example.com/?code=GAME123',
    agreeEnding: '선택지 1 결말',
    disagreeEnding: '선택지 2 결말',
    data: '{"title":"제작한 게임"}',
    app_lang: 'ko',
  }));
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { removeItem: key => values.delete(key) },
  });
});

afterEach(() => {
  if (originalStorage) {
    Object.defineProperty(globalThis, 'localStorage', originalStorage);
  } else {
    delete globalThis.localStorage;
  }
});

test('제작 완료 시 편집 데이터를 정리하고 로그인과 언어 설정은 유지한다', () => {
  clearAllLocalStorageKeys({ preserveAuth: true });

  assert.deepEqual(Object.fromEntries(values), {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    token_type: 'Bearer',
    app_lang: 'ko',
  });
});

test('기존 전체 정리 호출은 인증 토큰도 삭제한다', () => {
  clearAllLocalStorageKeys();

  assert.equal(values.has('access_token'), false);
  assert.equal(values.has('refresh_token'), false);
  assert.equal(values.has('code'), false);
  assert.equal(values.has('data'), false);
  assert.equal(values.get('app_lang'), 'ko');
});

test('로그인 정보가 없으면 제작 완료 시 토큰을 만들지 않는다', () => {
  values.delete('access_token');
  values.delete('refresh_token');

  clearAllLocalStorageKeys({ preserveAuth: true });

  assert.equal(values.has('access_token'), false);
  assert.equal(values.has('refresh_token'), false);
  assert.equal(values.has('creatorTitle'), false);
});
