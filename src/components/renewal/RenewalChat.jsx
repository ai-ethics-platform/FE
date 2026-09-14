import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import logo from '../../assets/logo.svg';
import { getRenewalSuggestions } from '../../utils/renewalSuggestions';
import './renewal-chat.css';

const STEPS = [
  // Keep input examples verbatim from ChatPage2: wording is part of the prompt flow.
  { id: 'opening', label: '주제 정하기', detail: '이야기의 출발점', title: '어떤 이야기를 만들어 볼까요?', description: '수업에서 나누고 싶은 질문을 알려주세요. AI와 함께 딜레마로 만들어 봐요.', placeholder: '예) 주제 추천해줘 / AI 판사로 하자' },
  { id: 'question', label: '딜레마 만들기', detail: '정답 없는 두 가지 선택', title: '생각이 갈리는 순간을 만들어 봐요.', description: '예/아니오로 답할 수 있는 질문과 두 가지 선택지를 함께 다듬어요.', placeholder: '예) 그 갈등으로 예/아니오 질문 만들어줘' },
  { id: 'flip', label: '예상하지 못한 결과', detail: '선택 뒤에 찾아오는 반전', title: '그 선택 뒤에는 어떤 일이 일어날까요?', description: '처음에는 미처 생각하지 못했던 결과로 토론을 한 단계 깊게 만들어요.', placeholder: '예) 상황 추천해줘 / 확정해줘' },
  { id: 'roles', label: '등장인물 정하기', detail: '서로 다른 입장과 시선', title: '같은 상황, 서로 다른 입장을 만나 봐요.', description: '학생들이 몰입할 수 있도록 각 인물의 관점과 역할을 구체화해요.', placeholder: '예) 역할 자동 생성해줘 / 확정해줘' },
  { id: 'ending', label: '마무리하기', detail: '이야기를 하나의 게임으로', title: '이제, 하나의 딜레마 게임으로.', description: '결말을 확인하고 초안을 제작하거나 확정해 주세요. 이후 편집 화면에서 그림과 내용을 다듬을 수 있어요.', placeholder: '예) 초안 제작해줘 / 확정' },
];

function Icon({ name, size = 20 }) {
  const paths = {
    arrow: <path d="m9 5 7 7-7 7M4 12h12" />,
    back: <path d="m14 6-6 6 6 6" />,
    up: <path d="M12 19V5m-6 6 6-6 6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    spark: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" /><path d="m20 2 .6 1.4L22 4l-1.4.6L20 6l-.6-1.4L18 4l1.4-.6L20 2Z" /></>,
    book: <><path d="M12 6C9 4 5 4 3 5v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v14" /></>,
    list: <><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.spark}</svg>;
}

function hasText(value) {
  return Array.isArray(value) ? value.some(hasText) : typeof value === 'string' && value.trim().length > 0;
}

function isStepReady(step, context) {
  const fields = {
    opening: ['topic'],
    question: ['question', 'choice1', 'choice2', 'dilemma_situation'],
    flip: ['flips_agree_texts', 'flips_disagree_texts'],
    roles: ['char1', 'char2', 'char3', 'chardes1', 'chardes2', 'chardes3'],
  };
  return (fields[step] || []).length > 0 && fields[step].every(key => hasText(context[key]));
}

function ConfirmDialog({ action, onClose, onConfirm }) {
  const dialogRef = useRef(null);
  useEffect(() => { dialogRef.current?.showModal(); }, []);
  const isBack = action === 'back';
  return (
    <dialog ref={dialogRef} className="rn-dialog" aria-labelledby="rn-dialog-title" aria-describedby="rn-dialog-description" onCancel={onClose} onClick={event => { if (event.target === dialogRef.current) onClose(); }}>
      <div className="rn-dialog-icon"><Icon name={isBack ? 'back' : 'book'} size={24} /></div>
      <h2 id="rn-dialog-title">{isBack ? '이전 단계를 다시 만들까요?' : '게임 만들기를 나갈까요?'}</h2>
      <p id="rn-dialog-description">{isBack ? '이전 단계부터 작성한 내용과 대화가 지워지고 해당 단계를 다시 시작해요.' : '지금 나가면 작성 중인 대화가 사라져요. 게임을 완성한 뒤 편집 화면으로 이동하는 것을 추천해요.'}</p>
      <div className="rn-dialog-actions">
        <button autoFocus type="button" className="rn-secondary" onClick={onClose}>계속 작성하기</button>
        <button type="button" className="rn-primary" onClick={onConfirm}>{isBack ? '다시 만들기' : '나가기'}</button>
      </div>
    </dialog>
  );
}

export default function RenewalChat({ step, context, messages, input, setInput, inputRef, loading, needsInit, creating, error, canRetry, onRetry, showTemplateButton, onSend, onBack, onCreate, onExit, renderMessage }) {
  const stepIndex = STEPS.findIndex(item => item.id === step);
  const current = STEPS[stepIndex];
  const suggestions = useMemo(() => getRenewalSuggestions(messages, step), [messages, step]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [following, setFollowing] = useState(true);
  const scrollRef = useRef(null);
  const followRef = useRef(true);
  const autoScrollTopRef = useRef(null);
  const blocked = loading || creating || needsInit;
  const visibleMessages = messages.filter(message => !message.hidden && message.role !== 'system');
  const ready = !blocked && isStepReady(step, context);
  const showSuggestions = !blocked && !error && (suggestions.replies.length > 0 || suggestions.offerNext);
  const progress = showTemplateButton ? 100 : stepIndex * 20;

  const scrollToLatestTurn = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const latest = container.querySelector('[role="log"]')?.lastElementChild;
    if (!latest) return;

    // Keep the question in view with the start of its answer. A very long user
    // message must not push the new answer below the visible conversation.
    const previous = latest.previousElementSibling;
    const showQuestion = latest.classList.contains('is-assistant') &&
      previous?.classList.contains('is-user') && previous.offsetHeight < container.clientHeight / 3;
    const anchor = showQuestion ? previous : latest;
    container.scrollTop += anchor.getBoundingClientRect().top - container.getBoundingClientRect().top - 24;
    autoScrollTopRef.current = container.scrollTop;
  }, []);

  useLayoutEffect(() => {
    if (followRef.current) scrollToLatestTurn();
  }, [messages, loading, step, scrollToLatestTurn]);

  useEffect(() => {
    if (!blocked) inputRef.current?.focus({ preventScroll: true });
  }, [blocked, inputRef]);

  const send = text => {
    if (blocked || !text.trim()) return;
    followRef.current = true;
    setFollowing(true);
    onSend(text);
  };

  return (
    <div className="renewal-chat">
      <header className="rn-header">
        <div className="rn-brand"><span className="rn-brand-logo" role="img" aria-label="DilemmA.I." style={{ maskImage: `url("${logo}")`, WebkitMaskImage: `url("${logo}")` }} /><span>Creator</span></div>
        <div className="rn-header-actions">
          <button type="button" className="rn-mobile-summary rn-icon-button" aria-label={sidebarOpen ? '제작 현황 닫기' : '제작 현황 열기'} aria-expanded={sidebarOpen} aria-controls="rn-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}><Icon name={sidebarOpen ? 'close' : 'list'} /></button>
          <button type="button" className="rn-exit" disabled={loading || creating} onClick={() => setConfirmAction('exit')}><Icon name="back" size={16} /><span>나가기</span></button>
        </div>
      </header>

      <div className="rn-workspace">
        {sidebarOpen && <button type="button" className="rn-sidebar-backdrop" aria-label="제작 현황 닫기" onClick={() => setSidebarOpen(false)} />}
        <aside className="rn-sidebar" id="rn-sidebar" data-open={sidebarOpen} aria-label="게임 제작 현황">
          <div className="rn-progress-label"><span>게임 제작 단계</span><span>{showTemplateButton ? 5 : stepIndex} / 5 완료</span></div>
          <div className="rn-progress-track" role="progressbar" aria-label="게임 제작 진행률" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div>
          <ol className="rn-steps">
            {STEPS.map((item, index) => {
              const complete = index < stepIndex || showTemplateButton;
              return <li key={item.id} className={`${index === stepIndex ? 'is-current' : ''} ${complete ? 'is-complete' : ''}`} aria-current={index === stepIndex ? 'step' : undefined}>
                <span className="rn-step-number">{complete ? <Icon name="check" size={15} /> : `0${index + 1}`}</span>
                <div><span className="rn-step-label">{item.label}</span><span className="rn-step-detail">{item.detail}</span></div>
                {index === stepIndex && !showTemplateButton && <span className="rn-current-dot" />}
              </li>;
            })}
          </ol>

        </aside>

        <main className="rn-main">
          <div className="rn-main-heading"><div><span className="rn-eyebrow">STEP {String(stepIndex + 1).padStart(2, '0')} <span>/ 05</span></span><h1>{current.title}</h1><p>{current.description}</p></div></div>
          <div className="rn-conversation" ref={scrollRef} onScroll={event => {
            const element = event.currentTarget;
            if (autoScrollTopRef.current !== null && Math.abs(element.scrollTop - autoScrollTopRef.current) < 1) return;
            autoScrollTopRef.current = null;
            const nearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 90;
            followRef.current = nearBottom;
            setFollowing(nearBottom);
          }}>
            <div className="rn-conversation-inner">
              <div className="rn-conversation-start"><span />함께 만드는 딜레마, 여기서 시작해요<span /></div>
              <div role="log" aria-label="AI와의 제작 대화" aria-live="polite" aria-relevant="additions text">
                {visibleMessages.map((message, index) => <article className={`rn-message ${message.role === 'user' ? 'is-user' : 'is-assistant'}`} key={index}>
                  {message.role === 'assistant' && <div className="rn-avatar"><Icon name="spark" size={18} /></div>}
                  <div className="rn-message-content"><div className="rn-message-author">{message.role === 'assistant' ? <>딜레마 가이드<span>AI</span></> : '나'}</div><div className="rn-message-text">{message.role === 'assistant' ? renderMessage(message.content) : message.content}</div></div>
                </article>)}
              </div>

              {loading && <div className="rn-message is-assistant rn-thinking" role="status"><div className="rn-avatar"><Icon name="spark" size={18} /></div><div><div className="rn-message-author">딜레마 가이드<span>AI</span></div><div className="rn-thinking-text"><span className="rn-typing-dots"><i /><i /><i /></span>AI가 딜레마에 빠졌어요... 금방 답변을 가져올게요!</div></div></div>}
            </div>
          </div>

          <div className="rn-composer-area">
            {!following && <button type="button" className="rn-latest" onClick={() => { followRef.current = true; setFollowing(true); scrollToLatestTurn(); }}>최근 대화 보기 ↓</button>}
            {error && <div className="rn-error" role="alert"><span>{error}</span>{canRetry && <button type="button" disabled={loading || creating} onClick={onRetry}>다시 시도</button>}</div>}
            {showTemplateButton && <div className="rn-complete"><span className="rn-complete-icon"><Icon name="check" /></span><div><strong>게임 초안이 완성됐어요!</strong><p>편집 화면에서 내용을 검토하고 그림을 추가해 보세요.</p></div><button type="button" className="rn-primary" disabled={blocked} onClick={onCreate}>{creating ? '템플릿 생성 중…' : '템플릿 생성'}<Icon name="arrow" size={16} /></button></div>}
            {showSuggestions && <div className="rn-composer-toolbar">
              <div className="rn-suggestions" role="group" aria-label="현재 AI 질문에 대한 빠른 답변">{suggestions.replies.map(suggestion => <button key={suggestion.label} type="button" title={suggestion.label} onClick={() => {
                if (suggestion.action === 'focus') inputRef.current?.focus({ preventScroll: true });
                else send(suggestion.text);
              }}><Icon name="spark" size={13} /><span className="rn-suggestion-label">{suggestion.label}</span></button>)}</div>
              {suggestions.offerNext && step !== 'ending' && <button type="button" className="rn-next" disabled={!ready} title={ready ? '현재 내용을 확정하고 다음 단계로 이동' : 'AI와 이 단계의 내용을 먼저 만들어 주세요'} onClick={() => send('다음 단계')}>다음 단계<Icon name="arrow" size={15} /></button>}
            </div>}
            <form className="rn-composer" onSubmit={event => { event.preventDefault(); send(input); }} aria-label="메시지 작성">
              <label htmlFor="rn-chat-input" className="rn-sr-only">AI에게 보낼 메시지</label>
              <textarea id="rn-chat-input" ref={inputRef} rows={1} value={input} onChange={event => setInput(event.target.value)} placeholder={current.placeholder} disabled={blocked} onKeyDown={event => {
                if (event.nativeEvent.isComposing || event.keyCode === 229) return;
                if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(input); }
              }} />
              <button className="rn-send" type="submit" aria-label="보내기" disabled={blocked || !input.trim()}><Icon name="up" size={21} /></button>
            </form>
            <div className="rn-composer-footer"><div>{step !== 'opening' && <button type="button" className="rn-back" disabled={blocked} onClick={() => setConfirmAction('back')}><Icon name="back" size={13} />이전 단계</button>}<span className="rn-keyboard-hint">Enter로 전송 · Shift + Enter로 줄바꿈</span></div><span>AI가 만든 내용은 수업 전에 꼭 확인해 주세요.</span></div>
          </div>
        </main>
      </div>
      {confirmAction && <ConfirmDialog action={confirmAction} onClose={() => setConfirmAction(null)} onConfirm={() => { const action = confirmAction; setConfirmAction(null); if (action === 'back') onBack(); else onExit(); }} />}
    </div>
  );
}
