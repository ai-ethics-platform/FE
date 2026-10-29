function key(code) {
  try {
    const payload = localStorage.getItem('access_token').split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const owner = JSON.parse(atob(payload)).sub;
    return owner ? `dilemma.preview.edit-code:${encodeURIComponent(owner)}:${encodeURIComponent(code)}` : null;
  } catch { return null; }
}

export function rememberPreviewAccess(code, editCode) {
  if (!code || !editCode) return;
  try { const storageKey = key(code); if (storageKey) sessionStorage.setItem(storageKey, editCode); } catch { /* The code can be entered again. */ }
}

export function readPreviewAccess(code) {
  try { const storageKey = key(code); return storageKey ? sessionStorage.getItem(storageKey) || '' : ''; } catch { return ''; }
}

export function forgetPreviewAccess(code) {
  try { const storageKey = key(code); if (storageKey) sessionStorage.removeItem(storageKey); } catch { /* No persistent access is required. */ }
}

export function gameCodeFromLink(link) {
  try { return new URL(link, window.location.origin).searchParams.get('code') || ''; } catch { return ''; }
}
