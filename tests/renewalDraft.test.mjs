import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { renewalDraft, handoffRenewalGame } from '../src/utils/renewalDraft.js';

const originalLocal = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const originalSession = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
let legacy;
let draft;
const storage = values => ({
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: key => values.delete(key),
});

beforeEach(() => {
  legacy = new Map(Object.entries({
    'dilemma.flow.v1': 'original conversation', chat_session_id: 'original-session',
    opening: 'original opening', final_dilemma_payload: 'original payload',
    data: 'original game', code: 'OLD', teacher_name: '교사',
    access_token: 'existing-auth', dilemma_image_1: 'old-image',
  }));
  draft = new Map();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage(legacy) });
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: storage(draft) });
});

afterEach(() => {
  if (originalLocal) Object.defineProperty(globalThis, 'localStorage', originalLocal);
  else delete globalThis.localStorage;
  if (originalSession) Object.defineProperty(globalThis, 'sessionStorage', originalSession);
  else delete globalThis.sessionStorage;
});

test('renewal draft writes and resets leave every legacy storage value intact', () => {
  const before = new Map(legacy);
  renewalDraft.setItem('opening', 'new opening');
  renewalDraft.setItem('chat_session_id', 'renewal-session');
  renewalDraft.setItem('final_dilemma_payload', 'new payload');
  renewalDraft.removeItem('data');
  assert.equal(renewalDraft.getItem('opening'), 'new opening');
  assert.equal(renewalDraft.getItem('teacher_name'), '교사');
  assert.equal(renewalDraft.getItem('data'), null);
  assert.deepEqual(legacy, before);
});

test('successful game handoff populates the editor and preserves legacy conversation and authentication', () => {
  renewalDraft.setItem('opening', '["new opening"]');
  renewalDraft.setItem('charDes1', 'new role description');
  const data = { opening: ['new opening'] };
  handoffRenewalGame({ code: 'NEW', url: '/game/NEW', data, title: '새 게임' });
  assert.equal(legacy.get('code'), 'NEW');
  assert.equal(legacy.get('opening'), '["new opening"]');
  assert.equal(legacy.get('charDes1'), 'new role description');
  assert.deepEqual(JSON.parse(legacy.get('data')), data);
  assert.equal(legacy.has('dilemma_image_1'), false);
  assert.equal(legacy.get('dilemma.flow.v1'), 'original conversation');
  assert.equal(legacy.get('chat_session_id'), 'original-session');
  assert.equal(legacy.get('access_token'), 'existing-auth');
});
