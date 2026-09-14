import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getRenewalSuggestions } from '../src/utils/renewalSuggestions.js';

const suggestions = (text, step = 'opening') => getRenewalSuggestions([{ role: 'assistant', content: text }], step);
const labels = result => result.replies.map(reply => reply.label);

test('initial greeting offers recommendations only when the AI offers them', () => {
  const greeting = '혹시 수업에서 다뤄보고 싶은 AI 관련 기술이나 주제가 있으신가요? 있다면 자유롭게 적어주세요. 없다면, 제가 몇 가지 주제를 추천해 드릴 수도 있어요😊';
  assert.deepEqual(labels(suggestions(greeting)), ['주제 추천해줘', '직접 입력하기']);
  assert.deepEqual(labels(suggestions('수업에서 다뤄보고 싶은 주제가 있으신가요? 자유롭게 적어주세요.')), []);
});

test('numbered AI topics become replies without their explanatory descriptions', () => {
  const result = suggestions('추천 주제입니다.\n1. **AI 판사**: 판결을 지원하는 AI입니다.\n2. **자율주행차**: 스스로 주행하는 자동차입니다.\n3. **딥페이크 기술**: 영상 합성 기술입니다.\n어떤 주제로 할까요?');
  assert.deepEqual(labels(result), ['AI 판사', '자율주행차', '딥페이크 기술']);
  assert.ok(result.replies.every(reply => reply.text === reply.label));
});

test('bullet, circled, letter, emoji and unnumbered topic menus are supported', () => {
  for (const markers of [['- ', '- '], ['① ', '② '], ['A) ', 'B) '], ['1️⃣ ', '2️⃣ '], ['', '']]) {
    const result = suggestions(`${markers[0]}AI 판사: 판결을 지원합니다.\n${markers[1]}자율주행차: 스스로 주행합니다.\n관심 있는 주제를 선택해 주세요.`);
    assert.deepEqual(labels(result), ['AI 판사', '자율주행차']);
  }
});

test('value conflicts keep both values and are not split at vs. or nested explanations', () => {
  const first = '정확한 출석 확인(정확성) vs. 개인의 민감한 정보 보호(프라이버시)';
  const second = '모든 학생을 공정하게 대우(공정성) vs. 자유로운 선택(자율성)';
  const result = suggestions(`이런 가치 충돌은 어떠실까요?\n1. ${first}\n'정확한 출석 확인'(정확성)이란? : 출석을 정확하게 확인하는 것입니다.\n  - 설명: 출석과 정보 보호 사이의 갈등입니다.\n2. ${second}\n'자유로운 선택'(자율성)이란? : 스스로 선택하는 것입니다.\n  - 설명: 공정성과 자유 사이의 갈등입니다.\n이 중 마음에 드는 갈등이 있다면 선택하신 가치 충돌을 바탕으로 딜레마 질문을 만들어볼까요?\n이해가 안 가는 부분이 있거나, 다른 가치 충돌이 궁금하거나, 질문이 있다면 말씀해주세요!`, 'question');
  assert.deepEqual(labels(result), [first, second]);
});

test('only the latest menu is selected when an answer contains two separate lists', () => {
  const result = suggestions('어떤 주제로 할까요?\n1. AI 판사\n2. 딥페이크\n먼저 대상 학년을 선택해 주세요.\n1. 중학생\n2. 고등학생\n어느 대상으로 할까요?');
  assert.deepEqual(labels(result), ['중학생', '고등학생']);
});

test('inline quoted, bold and delimited choices are grounded in the question', () => {
  for (const text of [
    '“중학생”, “고등학생”, “대학생” 중 어떤 대상을 원하시나요?',
    '**중학생**, **고등학생**, **대학생** 중 어떤 대상을 원하시나요?',
    '대상은 중학생 / 고등학생 / 대학생 중 어느 쪽인가요?',
    '중학생, 고등학생 또는 대학생 중 어느 대상으로 할까요?',
  ]) assert.deepEqual(labels(suggestions(text)), ['중학생', '고등학생', '대학생']);
});

test('the yes/no wording in an open instruction does not become artificial choices', () => {
  assert.deepEqual(labels(suggestions('예/아니오 질문을 만들고 싶으신가요? 어떤 갈등인지 설명해 주세요.', 'question')), []);
});

test('draft fields never become replies to the teacher confirmation question', () => {
  const draft = '[수정 단계]\n다음과 같이 정리해보았습니다.\n- 주제: AI 판사\n- 질문: AI 판결을 허용해야 할까요?\n- 선택지1: 허용한다\n- 선택지2: 허용하지 않는다\n이 방향으로 정리해볼까요?';
  assert.deepEqual(labels(suggestions(draft, 'question')), ['확정해줘', '수정할 내용 입력']);
});

test('ending confirmation uses the original ending command instead of choosing game outcomes', () => {
  const result = suggestions('🎯 상황 및 딜레마 질문\n질문: AI 판사를 도입할까요?\n✅ 선택지 1: 도입한다\n✅ 선택지 2: 도입하지 않는다\n이 초안으로 확정지을까요?', 'ending');
  assert.deepEqual(labels(result), ['확정', '수정할 내용 입력']);
  assert.equal(result.offerNext, false);
});

test('topic confirmation uses the opening transition protocol, never a new topic named 확정해줘', () => {
  const result = suggestions('선택하신 주제는 AI 판사입니다. 이대로 확정할까요?', 'opening');
  assert.equal(result.offerNext, true);
  assert.deepEqual(labels(result), ['수정할 내용 입력']);
});

test('the next-step instruction uses the existing separate transition control', () => {
  const result = suggestions("수정할 부분이 있다면 알려주세요.\n(이대로 확정하고 넘어가고 싶다면 '다음 단계'를 입력해주세요.)", 'roles');
  assert.equal(result.offerNext, true);
  assert.deepEqual(labels(result), ['수정할 내용 입력']);
  assert.ok(result.replies.every(reply => reply.action === 'focus'));
});

test('template creation instructions and draft reflection questions do not create reply buttons', () => {
  assert.deepEqual(suggestions('질문: 어느 쪽이 옳을까요?\n✅ 선택지 1: 허용한다\n✅ 선택지 2: 허용하지 않는다\n이대로 초안을 완성하고 싶다면 템플릿 생성 버튼을 눌러주세요!', 'ending'), { replies: [], offerNext: false });
  assert.deepEqual(labels(suggestions('질문: 어떤 선택을 할까요?\n✅ 선택지 1: 허용한다\n✅ 선택지 2: 허용하지 않는다', 'ending')), []);
});

test('free-form role and scenario questions have no guessed replies', () => {
  assert.deepEqual(labels(suggestions('세 인물을 직접 만들어보시겠어요? 각 인물의 현재 상황을 설명해주세요.', 'roles')), []);
  assert.deepEqual(labels(suggestions('먼저 딜레마 스토리에 들어갈 구체적인 상황이나 아이디어가 있으신가요? 말씀해 주시면 스토리를 더 풍성하게 구체화해 드릴게요!', 'flip')), []);
});

test('generation commands require an explicit offer in the current question', () => {
  for (const [step, question, command] of [
    ['roles', '제가 역할을 추천해 드릴까요?', '역할 자동 생성해줘'],
    ['flip', '제가 상황을 추천해 드릴까요?', '상황 추천해줘'],
    ['ending', '초안을 제작해 드릴까요?', '초안 제작해줘'],
    ['question', '이 갈등으로 질문을 만들어 드릴까요?', '그 갈등으로 예/아니오 질문 만들어줘'],
  ]) assert.equal(suggestions(question, step).replies[0]?.text, command);
});

test('negative instructions never offer confirmation or advance actions', () => {
  for (const text of ["아직 '다음 단계'를 입력하지 마세요.", '이대로 확정하면 안 됩니다. 수정할 내용을 알려주세요.', '주제를 추천해 드릴 수 없어요.']) {
    assert.deepEqual(suggestions(text), { replies: [], offerNext: false });
  }
});

test('only the last visible assistant reply is considered and a pending user turn clears replies', () => {
  const old = { role: 'assistant', content: '이대로 확정할까요?' };
  assert.deepEqual(getRenewalSuggestions([old, { role: 'user', content: '수정해줘' }], 'roles'), { replies: [], offerNext: false });
  assert.deepEqual(getRenewalSuggestions([old, { role: 'assistant', content: '어떤 부분을 어떻게 바꾸고 싶으신가요?' }], 'roles'), { replies: [], offerNext: false });
  assert.deepEqual(labels(getRenewalSuggestions([old, { role: 'assistant', content: 'hidden', hidden: true }], 'roles')), ['확정해줘', '수정할 내용 입력']);
});

test('stage outlines and lists without selection requests do not become buttons', () => {
  assert.deepEqual(labels(suggestions('1단계: AI 주제 선택\n2단계: 질문 구성\n3단계: 시나리오 생성\n다뤄보고 싶은 이야기를 자유롭게 적어주세요.')), []);
  assert.deepEqual(labels(suggestions('추천 주제는 다음과 같습니다.\n1. AI 판사\n2. 자율주행차')), []);
  assert.deepEqual(labels(suggestions('1. AI 판사\n2. 자율주행차\n수업에서 있었던 일을 구체적으로 설명해 주세요.')), []);
});

test('duplicates, excessive lengths and control commands are not surfaced as topic replies', () => {
  const text = `1. AI 판사\n2. AI 판사\n3. 자율주행차\n4. 딥페이크\n5. 가정용 로봇\n6. ${'긴 주제'.repeat(80)}\n7. 다음 단계\n8. __INIT__\n어떤 주제로 할까요?`;
  assert.deepEqual(labels(suggestions(text)), ['AI 판사', '자율주행차', '딥페이크']);
});

test('empty, malformed and code-only messages produce no suggestions', () => {
  for (const content of [null, {}, '', '```\n1. AI 판사\n2. 자율주행차\n어떤 주제로 할까요?\n```']) {
    assert.deepEqual(getRenewalSuggestions([{ role: 'assistant', content }], 'opening'), { replies: [], offerNext: false });
  }
  assert.deepEqual(getRenewalSuggestions([], 'opening'), { replies: [], offerNext: false });
});
