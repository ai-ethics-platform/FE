const pageId = globalThis.crypto?.randomUUID?.() || `page-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const code = value => /^[a-zA-Z0-9_-]{1,20}$/.test(value || '') ? value : null;

// Send only bounded gameplay metadata, never request bodies or credentials.
export function attachGameRequestContext(config) {
  try {
    const api = new URL(import.meta.env.VITE_API_BASE_URL || 'https://dilemmai-idl.com');
    const target = new URL(config.url, config.baseURL || location.origin);
    if (target.origin !== api.origin || !/^\/(?:auth\/login(?:-json)?|custom-games\/[^/]+|rooms\/(?:join(?:\/[^/]+)?|ready|create\/(?:public|private)|page-arrival))$/.test(target.pathname)) return config;
    let storedCode = null, loadedCode = null, storageState = 'available';
    try {
      storedCode = code(sessionStorage.getItem('custom_game_code'));
      loadedCode = code(JSON.parse(sessionStorage.getItem('custom_game_data') || '{}').loadedCode);
    } catch { storageState = 'unavailable'; }
    let roomCode = null, roleId = null;
    try {
      roomCode = code(config.data?.room_code || localStorage.getItem('room_code'));
      roleId = Number(localStorage.getItem('myrole_id')) || null;
    } catch { /* Record the unavailable fields as null. */ }
    const context = {
      version: 1, page_id: pageId,
      path: /^\/[\w/-]*$/.test(location.pathname) ? location.pathname.slice(0, 100) : '/unknown',
      url_code: code(new URLSearchParams(location.search).get('code')),
      game_code: storedCode, loaded_code: loadedCode, storage_state: storageState,
      room_code: roomCode, role_id: [1, 2, 3].includes(roleId) ? roleId : null,
      build_id: (document.querySelector('script[type="module"][src]')?.getAttribute('src') || '').split('/').pop()?.slice(0, 100) || '',
    };
    config.headers = config.headers || {};
    config.headers['x-game-context'] = JSON.stringify(context);
  } catch { /* Diagnostics must never prevent requests. */ }
  return config;
}
