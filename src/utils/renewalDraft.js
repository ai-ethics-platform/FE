// Renewal drafts stay in this tab. Legacy chatbot storage is only written when
// a successfully created game is handed over to the existing editor.
const PREFIX = 'dilemma.renewal.';
const TEACHER_KEYS = ['teacher_name', 'teacher_school', 'teacher_email'];
const EDITOR_KEYS = [
  'opening', 'dilemma_situation', 'question', 'choice1', 'choice2',
  'flips_agree_texts', 'flips_disagree_texts', 'char1', 'char2', 'char3',
  'charDes1', 'charDes2', 'charDes3', 'agreeEnding', 'disagreeEnding',
  'agree_label', 'disagree_label', 'final_dilemma_payload',
];
const EDITOR_CACHE_KEYS = [
  'rolesBackground', 'dilemma_sitation', 'dilemma_image_1', 'dilemma_image_3',
  'dilemma_image_4_1', 'dilemma_image_4_2', 'role_image_1', 'role_image_2',
  'role_image_3', 'dilemma_image_1_default_uploaded',
];

export const renewalDraft = {
  getItem(key) {
    return TEACHER_KEYS.includes(key)
      ? localStorage.getItem(key)
      : sessionStorage.getItem(PREFIX + key);
  },
  setItem(key, value) { sessionStorage.setItem(PREFIX + key, value); },
  removeItem(key) { sessionStorage.removeItem(PREFIX + key); },
};

function draftOwner() {
  const token = localStorage.getItem('access_token') || '';
  let subject = '';
  try {
    const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    subject = JSON.parse(atob(encoded)).sub || '';
  } catch { /* An unreadable identity must not restore a previous user's draft. */ }
  return subject ? JSON.stringify([subject, ...TEACHER_KEYS.map(key => localStorage.getItem(key))]) : null;
}

export function loadRenewalSession() {
  try {
    const saved = JSON.parse(renewalDraft.getItem('flow'));
    const owner = draftOwner();
    if (!owner || saved?.version !== 1 || saved.owner !== owner ||
        !/^renewal-[\w-]+$/.test(saved.sessionId) ||
        !['opening', 'question', 'flip', 'roles', 'ending'].includes(saved.step) ||
        !saved.context || typeof saved.context !== 'object' || Array.isArray(saved.context) ||
        !Array.isArray(saved.messages) || !saved.messages.some(message => message?.role === 'assistant') ||
        !saved.messages.every(message => message && ['system', 'user', 'assistant'].includes(message.role) && typeof message.content === 'string')) return null;
    const boundaries = saved.stepBoundaries;
    if (!boundaries || typeof boundaries !== 'object' || Array.isArray(boundaries) ||
        !Object.values(boundaries).every(value => Number.isInteger(value) && value >= 0 && value <= saved.messages.length)) return null;
    return { ...saved, input: renewalDraft.getItem('pending_input') || '' };
  } catch { return null; }
}

export function saveRenewalSession(snapshot) {
  try {
    const owner = draftOwner();
    if (!owner) return false;
    renewalDraft.setItem('flow', JSON.stringify({ ...snapshot, version: 1, owner }));
    return true;
  } catch (error) {
    console.warn('대화 임시 저장 실패:', error);
    return false;
  }
}

export function clearRenewalSession() {
  try {
    renewalDraft.removeItem('flow');
    renewalDraft.removeItem('pending_input');
  } catch (error) { console.warn('대화 임시 저장 정리 실패:', error); }
}

export function handoffRenewalGame({ code, url, data, title }) {
  EDITOR_CACHE_KEYS.forEach(key => localStorage.removeItem(key));
  EDITOR_KEYS.forEach(key => {
    const value = renewalDraft.getItem(key);
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  });
  localStorage.setItem('code', code);
  if (url) localStorage.setItem('url', url);
  else localStorage.removeItem('url');
  localStorage.setItem('data', JSON.stringify(data));
  localStorage.setItem('creatorTitle', title);
}
