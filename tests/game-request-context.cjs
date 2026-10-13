const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('src/utils/gameRequestContext.js', 'utf8')
  .replace('export function', 'function').replaceAll('import.meta.env', '({})');
const storage = new Map();
const context = vm.createContext({ URL, URLSearchParams, Math, Date,
  location: { origin: 'https://www.dilemmai.org', pathname: '/', search: '?code=GAME_A' },
  document: { querySelector: () => null },
  sessionStorage: { getItem: key => storage.get(key) || null },
  localStorage: { getItem: () => null },
});
vm.runInContext(source, context);
const request = url => context.attachGameRequestContext({ url, headers: {} });
let metadata = JSON.parse(request('https://dilemmai-idl.com/auth/login').headers['x-game-context']);
assert.equal(metadata.url_code, 'GAME_A');
assert.equal(metadata.game_code, null);
storage.set('custom_game_code', 'GAME_A');
storage.set('custom_game_data', JSON.stringify({ loadedCode: 'GAME_A' }));
metadata = JSON.parse(request('https://dilemmai-idl.com/rooms/create/private').headers['x-game-context']);
assert.equal(metadata.game_code, 'GAME_A');
assert.equal(metadata.loaded_code, 'GAME_A');
context.sessionStorage.getItem = () => { throw new Error('blocked'); };
metadata = JSON.parse(request('https://dilemmai-idl.com/rooms/ready').headers['x-game-context']);
assert.equal(metadata.storage_state, 'unavailable');
assert.equal(request('https://another-site.example/auth/login').headers['x-game-context'], undefined);
assert.equal(request('https://dilemmai-idl.com/rooms/code/123456').headers['x-game-context'], undefined);
console.log('Game request context checks passed');
