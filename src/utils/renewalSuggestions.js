// Read-only extraction for the renewal UI. Never rewrite the chatbot response,
// its history, or its prompt. Ambiguous/free-form questions deliberately return no replies.
const EMPTY = { replies: [], offerNext: false };
const MAX_REPLIES = 3;
const FIELD = /^(?:주제|질문|선택지\s*\d*|선택\s*\d+|역할\s*\d*|배경\s*설명|설명|상황\s*시나리오|플립\s*자료|예상하지\s*못한\s*결과|오프닝\s*멘트|최종\s*멘트|\d+단계)\s*[:：]/;
const PICK = /(?:선택해|선택하|선택할|골라|고르|마음에\s*드는|(?:어떤|어느|무슨)\s*(?:주제|기술|갈등|가치|방향|항목|대상|학년|방식|방법|인물|역할|쪽|것|걸)|무엇으로)/;
const REQUEST = /[?？]|(?:입력|선택|설명|알려|말씀|적어|골라|이동|넘어가).{0,15}(?:주세요|주시면)|추천.{0,20}(?:드릴|드려)/;
const OPTIONAL_HELP = /^(?:이해가?\s*안|궁금한\s*점|질문이?\s*있|추가로\s*궁금)/;
const NEGATIVE = /(?:아직|말아|마세요|말고|않|안\s*(?:돼|되|하)|없습니다|없어요|불가)/;
const CONTROL = /다음\s*단계|__INIT__|^INIT$|템플릿\s*생성/;
const FOCUS = { label: '직접 입력하기', action: 'focus' };
const EDIT = { label: '수정할 내용 입력', action: 'focus' };

function plain(value) {
  return value.replace(/\*\*|__|`/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').trim();
}

function choice(value) {
  const label = plain(value).replace(/^['"“”‘’]+|['"“”‘’]+$/g, '').trim();
  if (label.length < 2 || label.length > 160 || FIELD.test(label) || CONTROL.test(label)) return null;
  if (/^(?:설명|예시|추천\s*주제|주제\s*목록|가치\s*충돌)$/.test(label)) return null;
  return { label, text: label, action: 'send' };
}

function unique(replies) {
  const seen = new Set();
  return replies.filter(reply => {
    if (!reply || seen.has(reply.label)) return false;
    seen.add(reply.label);
    return true;
  }).slice(0, MAX_REPLIES);
}

function menuChoice(line) {
  const cleaned = plain(line).replace(/^#{1,6}\s+/, '');
  const match = cleaned.match(/^(?:(\d{1,2})[.)]\s*|[①-⑩]\s*|[1-9]\uFE0F?\u20E3\s*|[A-D가나다][.)]\s*|[-*•·–]\s+)(.+)$/u);
  const body = match ? match[2] : cleaned;
  if (/이란\?\s*[:：]/.test(body)) return null;
  if (FIELD.test(body.replace(/^[✅🎬🎭🎯🌀]\s*/u, ''))) return null;
  // Topic definitions sometimes have no bullets: "AI 판사: 인공지능으로…".
  if (!match && !/^[^:：]{2,80}[:：]/.test(body)) return null;
  const title = body.split(/[:：]|\s+[—–]\s+/)[0].trim();
  const result = choice(title);
  return result ? { ...result, number: match?.[1] ? Number(match[1]) : null, indent: line.match(/^\s*/)[0].length } : null;
}

function extractMenu(lines, requestIndex) {
  let candidates = [];
  for (let index = 0; index < lines.length; index++) {
    const item = menuChoice(lines[index]);
    // A fresh selection question/list starts a new menu. Do not reuse an earlier one.
    const line = plain(lines[index]).replace(/^[-*•]\s+/, '');
    if (!item && index < requestIndex && !FIELD.test(line) && !/이란\?/.test(line) &&
        PICK.test(line) && REQUEST.test(line)) candidates = [];
    if (!item) continue;
    if (item.number === 1 && candidates.some(previous => previous.number !== null)) candidates = [];
    candidates.push(item);
  }
  if (!candidates.length) return [];
  const indent = Math.min(...candidates.map(item => item.indent));
  const replies = unique(candidates.filter(item => item.indent === indent).map(({ label, text, action }) => ({ label, text, action })));
  return replies.length >= 2 ? replies : [];
}

function extractInline(line) {
  const quoted = [...line.matchAll(/["“‘'「]([^"”’'」\n]{2,160})["”’'」]/g)].map(match => choice(match[1]));
  const bold = [...line.matchAll(/\*\*([^*\n]{2,160})\*\*/g)].map(match => choice(match[1]));
  for (const options of [quoted, bold]) {
    const replies = unique(options);
    if (replies.length >= 2) return replies;
  }
  // Only split an explicit "A, B, C 중 …" menu, never arbitrary sentences or 예/아니오.
  const menu = plain(line).match(/^(.{2,240}?)\s+중(?:에서|에)?\s+/);
  if (!menu) return [];
  const options = menu[1].replace(/^(?:대상(?:\s*학년)?|학년|주제|방식)(?:은|는|을|를|[:：])\s*/, '');
  const replies = unique(options.split(/\s*[,、]\s*|\s+\/\s+|\s+또는\s+|\s+혹은\s+/).map(choice));
  return replies.length >= 2 ? replies : [];
}

function confirmation(text) {
  return !NEGATIVE.test(text) && (
    /이\s*방향으로\s*정리해\s*볼까요/.test(text) ||
    /(?:이\s*초안|이대로|지금\s*내용|현재\s*내용|이\s*내용).{0,25}(?:확정|진행|정리|괜찮).{0,20}(?:까요|나요|신가요|괜찮은지)/.test(text)
  );
}

function nextStep(text) {
  return !NEGATIVE.test(text) && (
    /['“‘"]다음\s*단계['”’"](?:를|로)?\s*입력(?:해|하시면|하면)/.test(text) ||
    /다음\s*단계로\s*(?:이동해|넘어가|진행해)\s*(?:주세요|볼까요|셔도)/.test(text)
  );
}

/** @returns {{replies: Array<{label: string, text?: string, action: string}>, offerNext: boolean}} */
export function getRenewalSuggestions(messages, step) {
  let latest;
  for (let index = messages.length - 1; index >= 0; index--) {
    const message = messages[index];
    if (message.hidden || message.role === 'system') continue;
    latest = message;
    break;
  }
  if (latest?.role !== 'assistant' || typeof latest.content !== 'string') return EMPTY;
  const content = latest.content
    .replace(/```[^]*?(?:```|$)/g, '')
    .replace(/^\s*\[(?:수정|확정)\s*단계\]\s*$/gm, '');
  const lines = content.split('\n').filter(line => line.trim());
  if (!lines.length) return EMPTY;

  let requestIndex = -1;
  for (let index = lines.length - 1; index >= 0; index--) {
    const line = plain(lines[index]).replace(/^[-✅🎬🎭🎯🌀]\s*/u, '');
    if (OPTIONAL_HELP.test(line) && !/[?？]/.test(line)) continue;
    if (!FIELD.test(line) && !menuChoice(lines[index]) && !/이란\?\s*[:：]/.test(line) && REQUEST.test(line)) {
      requestIndex = index;
      break;
    }
  }
  if (requestIndex < 0) return EMPTY;
  const request = plain(lines[requestIndex]);
  const closing = lines.slice(requestIndex).map(plain).join(' ');

  // The game draft's choices and reflection questions are not teacher reply options.
  if (/템플릿\s*생성\s*버튼/.test(closing)) return EMPTY;
  if (step !== 'ending' && nextStep(request)) return { replies: [EDIT], offerNext: true };
  if (confirmation(request)) {
    // Opening treats arbitrary user text as a topic; its existing confirmation
    // protocol is "다음 단계", not the later stages' "확정해줘" command.
    if (step === 'opening') return { replies: [EDIT], offerNext: true };
    const text = step === 'ending' ? '확정' : '확정해줘';
    return { replies: [{ label: text, text, action: 'send' }, EDIT], offerNext: false };
  }

  if (PICK.test(request)) {
    const replies = extractInline(lines[requestIndex]);
    if (replies.length) return { replies, offerNext: false };
    const listed = extractMenu(lines, requestIndex);
    if (listed.length) return { replies: listed, offerNext: false };
    return EMPTY;
  }

  // Offer an existing prompt command only when the current question offers that action.
  const offers = {
    opening: { subject: /주제|기술/, command: '주제 추천해줘' },
    question: { subject: /질문/, command: '그 갈등으로 예/아니오 질문 만들어줘' },
    flip: { subject: /상황|시나리오/, command: '상황 추천해줘' },
    roles: { subject: /역할|인물/, command: '역할 자동 생성해줘' },
    ending: { subject: /초안/, command: '초안 제작해줘' },
  };
  const offer = offers[step];
  if (offer?.subject.test(request) && !NEGATIVE.test(request) &&
      /(?:추천|제안|생성|제작|만들어).{0,20}(?:드릴|드려|받|원하시|까요)/.test(request)) {
    return { replies: [{ label: offer.command, text: offer.command, action: 'send' }, FOCUS], offerNext: false };
  }
  return EMPTY;
}
