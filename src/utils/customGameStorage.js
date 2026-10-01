const CODE_KEY = 'custom_game_code';
const DATA_KEY = 'custom_game_data';

export const customGameStorage = {
  getItem(key) {
    try {
      if (key === 'code') return sessionStorage.getItem(CODE_KEY);
      return JSON.parse(sessionStorage.getItem(DATA_KEY) || '{}')[key] ?? null;
    } catch {
      return null;
    }
  },
};

export function setCustomGameCode(code) {
  if (sessionStorage.getItem(CODE_KEY) !== code) {
    sessionStorage.removeItem(DATA_KEY);
  }
  sessionStorage.setItem(CODE_KEY, code);
}

export function clearCustomGame() {
  sessionStorage.removeItem(DATA_KEY);
  sessionStorage.removeItem(CODE_KEY);
}

export function isCustomGameReady() {
  const code = customGameStorage.getItem('code');
  return Boolean(code && customGameStorage.getItem('loadedCode') === code);
}

export function saveCustomGame(payload, expectedCode) {
  if (!payload || typeof payload.code !== 'string' || payload.code !== expectedCode ||
      typeof payload.title !== 'string' || !payload.data ||
      typeof payload.data !== 'object' || Array.isArray(payload.data)) {
    throw new Error('게임 데이터 형식이 올바르지 않습니다.');
  }
  const { code, title, representative_image_url, representative_images, data } = payload;
  const values = { loadedCode: code };
  const setStr = (key, value) => { values[key] = String(value ?? ''); };
  const setArr = (key, value) => { values[key] = JSON.stringify(Array.isArray(value) ? value : []); };
  // 제목
  setStr('creatorTitle', title || data?.title || '');

  // 이미지(대표)
  setStr('repersentative_image_url', representative_image_url || '');

  // 이미지(대표 묶음)
  // 요구사항: dilemma_image_1, dilemma_image_3, dilemma_image_4_1, dilemma_image_4_2 로 저장
  const repImgs = data?.representativeImages || representative_images || {};
  setStr('dilemma_image_1', repImgs?.dilemma_image_1 || '');
  setStr('dilemma_image_3', repImgs?.dilemma_image_3 || '');
  setStr('dilemma_image_4_1', repImgs?.dilemma_image_4_1 || '');
  setStr('dilemma_image_4_2', repImgs?.dilemma_image_4_2 || '');

  // 데이터 본문
  // opening: 배열
  setArr('opening', data?.opening);

  // roles -> char1/2/3, charDes1/2/3
  const roles = Array.isArray(data?.roles) ? data.roles : [];
  const r1 = roles[0] || {};
  const r2 = roles[1] || {};
  const r3 = roles[2] || {};
  setStr('char1', r1.name || '');
  setStr('char2', r2.name || '');
  setStr('char3', r3.name || '');
  setStr('charDes1', r1.description || '');
  setStr('charDes2', r2.description || '');
  setStr('charDes3', r3.description || '');

  // rolesBackground: 문자열
  setStr('rolesBackground', data?.rolesBackground || '');

  // roleImages -> role_image_1, role_image_2, role_image_3
  const roleImages = data?.roleImages || {};
  setStr('role_image_1', roleImages?.['1'] || '');
  setStr('role_image_2', roleImages?.['2'] || '');
  setStr('role_image_3', roleImages?.['3'] || '');

  // dilemma
  const dilemma = data?.dilemma || {};
  setArr('dilemma_sitation', dilemma?.situation); // 요구 철자 그대로
  setStr('question', dilemma?.question || '');

  const opts = dilemma?.options || {};
  setStr('agree_label', opts?.agree_label || '');
  setStr('disagree_label', opts?.disagree_label || '');

  // flips: 배열
  const flips = data?.flips || {};
  setArr('flips_agree_texts', flips?.agree_texts);
  setArr('flips_disagree_texts', flips?.disagree_texts);

  // finalMessages
  const finals = data?.finalMessages || {};
  setStr('agreeEnding', finals?.agree || '');
  setStr('disagreeEnding', finals?.disagree || '');

  const serialized = JSON.stringify(values);
  sessionStorage.setItem(DATA_KEY, serialized);
  if (sessionStorage.getItem(DATA_KEY) !== serialized) {
    throw new Error('게임 데이터를 저장하지 못했습니다.');
  }
}
