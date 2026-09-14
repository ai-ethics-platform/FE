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
