import React, { useEffect, useMemo, useRef, useState } from "react";
import { callChatbot } from "../api/axiosInstance";
import { useNavigate } from 'react-router-dom';
import { parseDilemmaText } from "../utils/templateparsing";
import axiosInstance from "../api/axiosInstance";
import { sendIngestEvent } from "../api/adminIngest";
import { downloadTranscriptCsv } from "../utils/transcriptCsv";

import RenewalChat from '../components/renewal/RenewalChat';
import { renewalDraft, handoffRenewalGame, loadRenewalSession, saveRenewalSession, clearRenewalSession } from '../utils/renewalDraft';

// Legacy implementation is archived in ChatPage2Legacy.jsx.
const STORAGE_KEY = 'flow';

function normalize(res) {
  const text =
    res?.response_text ??
    res?.text ??
    res?.output ??
    res?.message ??
    "";

  return {
    text,
    nextStep: res?.next_step ?? null,
    currentStep: res?.current_step ?? null,
    newContext: res?.context ?? null,
    parsedVars: res?.parsed_variables ?? {},
    isComplete: !!res?.is_complete,
    sessionId: res?.session_id ?? null,
  };
}

const HISTORY_LIMIT = 12;

const INPUT_MAX_HEIGHT = 132;

function buildInputWithHistory(messages, raw, isInit = false) {
  const recent = messages
    .filter(
      (m) =>
        (m.role === "assistant" || m.role === "user") &&
        !m?.skipHistory
    )
    .slice(-HISTORY_LIMIT);

  const lines = recent.map((m) => `${m.role}: ${m.content}`);

  if (!isInit && raw) lines.push(`user: ${raw}`);

  return lines.join("\n");
}

function buildVariable(step, ctx) {
  if (step === "opening") return null;

  if (step === "question") {
    const topic = ctx.topic || ctx.dilemma_topic || null;

    if (!topic) {
      console.warn("⚠️ dilemma 단계인데 topic이 없습니다!");
      return null;
    }

    return { topic };
  }

  if (step === "flip") {
    return {
      question: ctx.question,
      choice1: ctx.choice1,
      choice2: ctx.choice2,
    };
  }

  if (step === "roles") {
    return {
        dilemma_situation: ctx.dilemma_situation,
        question: ctx.question,
        choice1: ctx.choice1,
        flips_agree_texts: ctx.flips_agree_texts,
        choice2: ctx.choice2,
        flips_disagree_texts: ctx.flips_disagree_texts,

    };
  }

  if (step === "ending") {
    return {
      dilemma_situation: forceString(ctx.dilemma_situation),
      question: forceString(ctx.question),
      choice1: forceString(ctx.choice1),
      flips_agree_texts: forceString(ctx.flips_agree_texts),
      choice2: forceString(ctx.choice2),
      flips_disagree_texts: forceString(ctx.flips_disagree_texts),
      char1: forceString(ctx.char1),
      chardes1: forceString(ctx.chardes1),
      char2: forceString(ctx.char2),
      chardes2: forceString(ctx.chardes2),
      char3: forceString(ctx.char3),
      chardes3: forceString(ctx.chardes3),
    };
  }

  return null;
}
function forceString(v) {
  if (Array.isArray(v)) return v.join("\n");
  if (v === undefined || v === null) return "";
  return v;
}

const coalesce = (...vals) => {
  for (const v of vals) {
    if (v === undefined || v === null) continue;
    const s = typeof v === "string" ? v.trim() : v;
    if (typeof s === "string") {
      if (s.length) return s;
      continue;
    }
    return v;
  }
  return "";
};

function normalizeContext(ctx) {
  const next = { ...(ctx || {}) };

  next.topic = coalesce(next.topic, next.dilemma_topic, next.opening_topic);

  next.dilemma_situation = coalesce(
    next.dilemma_situation,
    next.flip_dilemma_situation,
    next.ending_dilemma_situation,
    next.flip_result // flip_result가 통문장으로 오기도 함
  );
  next.question = coalesce(
    next.question,
    next.flip_question,
    next.question_question,
    next.ending_question
  );
  next.choice1 = coalesce(
    next.choice1,
    next.flip_choice1,
    next.question_choice1
  );
  next.choice2 = coalesce(
    next.choice2,
    next.flip_choice2,
    next.question_choice2
  );
  next.flips_agree_texts = coalesce(
    next.flips_agree_texts,
    next.flip_flips_agree_texts,
    next.ending_flips_agree_texts
  );
  next.flips_disagree_texts = coalesce(
    next.flips_disagree_texts,
    next.flip_flips_disagree_texts,
    next.ending_flips_disagree_texts
  );

  next.char1 = coalesce(next.char1, next.roles_char1, next.ending_char1);
  next.char2 = coalesce(next.char2, next.roles_char2, next.ending_char2);
  next.char3 = coalesce(next.char3, next.roles_char3, next.ending_char3);

  next.chardes1 = coalesce(next.chardes1, next.roles_chardes1, next.ending_chardes1, next.charDes1);
  next.chardes2 = coalesce(next.chardes2, next.roles_chardes2, next.ending_chardes2, next.charDes2);
  next.chardes3 = coalesce(next.chardes3, next.roles_chardes3, next.ending_chardes3, next.charDes3);
  next.charDes1 = next.chardes1;
  next.charDes2 = next.chardes2;
  next.charDes3 = next.chardes3;

  next.opening = coalesce(
    next.opening,
    next.opening_texts,
    next.ending_opening,
    next.opening_result
  );

  next.agreeEnding = coalesce(next.agreeEnding, next.ending_agreeEnding);
  next.disagreeEnding = coalesce(next.disagreeEnding, next.ending_disagreeEnding);
  next.agree_label = coalesce(next.agree_label, next.ending_agree_label);
  next.disagree_label = coalesce(next.disagree_label, next.ending_disagree_label);

  return next;
}

function stripStageLabels(text) {
  if (typeof text !== "string") return text;
  return text
    .replace(/^[ \t]*\[(?:수정|확정) ?단계\][ \t]*\n?/gm, "")
    .replace(/^\n+/, "");
}

function renameFlipTerms(text) {
  if (typeof text !== "string") return text;
  return text.replace(/(?:📎[ \t]*)?플립[ \t]*자료/gu, "예상하지 못한 결과");
}

const BOLD_RE = /\*\*([^*]+)\*\*/g;
const HEADING_RE = /^[ \t]*(#{1,6})[ \t]+(.*)$/;

const SECTION_LINE_RE = /^[ \t]*(?:🎬|🎭|🎯|🌀)[^:\n]*$/;
const CHOICE_LABEL_RE = /^([ \t]*)(✅[ \t]*선택지[ \t]*\d+[ \t]*[:：])(.*)$/;
const LIST_LABEL_RE = /^([ \t]*-{1,2}[ \t]*)([^:\n]{1,24}[:：])(.*)$/;
const QUESTION_LABEL_RE = /^([ \t]*)(질문[ \t]*[:：])(.*)$/;

function renderInlineMarkdown(line, keyPrefix) {
  const nodes = [];
  let cursor = 0;
  BOLD_RE.lastIndex = 0;

  let match;
  while ((match = BOLD_RE.exec(line)) !== null) {
    if (match.index > cursor) nodes.push(line.slice(cursor, match.index));
    nodes.push(<strong key={`${keyPrefix}-b${match.index}`}>{match[1]}</strong>);
    cursor = match.index + match[0].length;
  }
  if (cursor < line.length) nodes.push(line.slice(cursor));

  return nodes.length ? nodes : line;
}

function renderMarkdownLite(text) {
  if (typeof text !== "string") return text;

  const lines = text.split("\n");
  return lines.map((line, i) => {
    const heading = line.match(HEADING_RE);
    let body;

    if (heading) {
      body = (
        <span className="msg-heading">{renderInlineMarkdown(heading[2], `h${i}`)}</span>
      );
    } else if (!line.includes("**") && SECTION_LINE_RE.test(line)) {
      body = <span className="msg-heading">{line}</span>;
    } else if (!line.includes("**")) {
      const label =
        line.match(CHOICE_LABEL_RE) ||
        line.match(LIST_LABEL_RE) ||
        line.match(QUESTION_LABEL_RE);
      body = label ? (
        <>
          {label[1]}
          <strong>{label[2]}</strong>
          {label[3]}
        </>
      ) : (
        line
      );
    } else {
      body = renderInlineMarkdown(line, `l${i}`);
    }

    return (
      <React.Fragment key={i}>
        {body}
        {i < lines.length - 1 ? "\n" : null}
      </React.Fragment>
    );
  });
}

export default function ChatPage2() {
  const navigate = useNavigate();

  const [restored] = useState(loadRenewalSession);
  const [sessionId] = useState(() => restored?.sessionId || `renewal-${crypto.randomUUID()}`);
  const initializedRef = useRef(false);
  const busyRef = useRef(false);
  const retryActionRef = useRef(null);
  const [needsInit, setNeedsInit] = useState(!restored);
  const [creating, setCreating] = useState(false);
  const creatingRef = useRef(false);
  const [step, setStep] = useState(restored?.step || "opening");
  const [context, setContext] = useState(restored?.context || {});
  const [messages, setMessages] = useState(restored?.messages || [{ role: "system", content: "세션 시작" }]);
  const [input, setInput] = useState(restored?.input || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [storageWarning, setStorageWarning] = useState('');

  const messagesRef = useRef(messages);
  const stepBoundariesRef = useRef(restored?.stepBoundaries || {}); // step 진입 시점의 messages 길이
  const inputRef = useRef(null);
  const [showTemplateButton, setShowTemplateButton] = useState(!!restored?.showTemplateButton);
  const finishedRef = useRef(false);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, INPUT_MAX_HEIGHT)}px`;
  }, [input]);

  const STEP_ORDER = useMemo(
    () => ["opening", "question", "flip", "roles", "ending"],
    []
  );

  const STEP_CLEAR_CONFIG = useMemo(
    () => ({
      opening: {
        contextKeys: ["topic", "dilemma_topic", "opening", "opening_texts", "opening_result"],
        storageKeys: ["topic", "dilemma_topic", "opening"],
      },
      question: {
        contextKeys: ["dilemma_situation", "question", "choice1", "choice2"],
        storageKeys: ["dilemma_situation", "question", "choice1", "choice2"],
      },
      flip: {
        contextKeys: ["flips_agree_texts", "flips_disagree_texts"],
        storageKeys: ["flips_agree_texts", "flips_disagree_texts"],
      },
      roles: {
        contextKeys: [
          "char1",
          "chardes1",
          "char2",
          "chardes2",
          "char3",
          "chardes3",
          "charDes1", "charDes2", "charDes3",
        ],
        storageKeys: [
          "char1",
          "char2",
          "char3",
          "chardes1",
          "chardes2",
          "chardes3",
          "charDes1",
          "charDes2",
          "charDes3",
        ],
      },
      ending: {
        contextKeys: ["agreeEnding", "disagreeEnding", "agree_label", "disagree_label"],
        storageKeys: ["agreeEnding", "disagreeEnding", "agree_label", "disagree_label"],
      },
    }),
    []
  );

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    if (restored) return;
    const keysToClear = [
      STORAGE_KEY,
      'pending_input',
      "final_dilemma_payload",
      "opening",
      "char1", "char2", "char3",
      "charDes1", "charDes2", "charDes3",
      "dilemma_situation",
      "question",
      "choice1", "choice2",
      "flips_agree_texts",
      "flips_disagree_texts",
      "agreeEnding", "disagreeEnding",
      "agree_label", "disagree_label",
      "topic", "dilemma_topic",
      "chat_session_id",
      "data", "creatorTitle", "url",
      "rolesBackground", "dilemma_sitation",
      "dilemma_image_1", "dilemma_image_3", "dilemma_image_4_1", "dilemma_image_4_2",
      "role_image_1", "role_image_2", "role_image_3",
      "dilemma_image_1_default_uploaded"
    ];

    try {
      keysToClear.forEach((k) => renewalDraft.removeItem(k));
      renewalDraft.setItem('chat_session_id', sessionId);
    } catch { setStorageWarning('대화를 임시 저장하지 못했어요. 새로고침 전에 대화기록을 다운로드해 주세요.'); }

    setContext({});

    handleInit();

    const startedAt = new Date().toISOString();
    try { renewalDraft.setItem('admin_started_at', startedAt); }
    catch { setStorageWarning('대화를 임시 저장하지 못했어요. 새로고침 전에 대화기록을 다운로드해 주세요.'); }
    const teacher_name = renewalDraft.getItem("teacher_name") || "-";
    const teacher_school = renewalDraft.getItem("teacher_school") || "-";
    const teacher_email = renewalDraft.getItem("teacher_email") || "---";
    sendIngestEvent('start', {
      session_id: sessionId,
      teacher_name,
      teacher_school,
      teacher_email,
      started_at: startedAt,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one initialization per mounted session
  }, []);

  function pruneContextFromIndex(ctx, fromIdx) {
    const keysToRemove = new Set();
    for (let i = fromIdx; i < STEP_ORDER.length; i++) {
      const s = STEP_ORDER[i];
      const conf = STEP_CLEAR_CONFIG[s];
      (conf?.contextKeys || []).forEach((k) => keysToRemove.add(k));
    }

    if (keysToRemove.size === 0) return ctx;

    const next = { ...ctx };
    const affectedSteps = STEP_ORDER.slice(fromIdx);
    Object.keys(next).forEach((key) => {
      // Also remove backend aliases, otherwise normalization restores old results.
      if (keysToRemove.has(key) || affectedSteps.some(stage => key.startsWith(`${stage}_`)) ||
          [...keysToRemove].some(field => key.endsWith(`_${field}`))) delete next[key];
    });
    return next;
  }

  function clearLocalStorageFromIndex(fromIdx) {
    for (let i = fromIdx; i < STEP_ORDER.length; i++) {
      const s = STEP_ORDER[i];
      const conf = STEP_CLEAR_CONFIG[s];
      (conf?.storageKeys || []).forEach((k) => renewalDraft.removeItem(k));
    }
    renewalDraft.removeItem("final_dilemma_payload");
  }

  async function handleInit(targetStep = step, options = {}) {
    busyRef.current = true;
    setNeedsInit(true);
    setError('');
    retryActionRef.current = null;
    try {
      setLoading(true);

      const boundary =
        typeof options.boundaryOverride === "number"
          ? options.boundaryOverride
          : messagesRef.current.length;
      stepBoundariesRef.current[targetStep] = boundary;

      const ctxToUse = options.contextOverride ?? context;

      const payload = {
        session_id: sessionId,
        user_input: "__INIT__",
        step: targetStep,
        variable: buildVariable(targetStep, ctxToUse),
        context: ctxToUse
      };


      const res = await callChatbot(payload);


      const { text, newContext, parsedVars } = normalize(res);

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: text }
      ]);

      if (options.contextOverride) {
        setContext(
          normalizeContext({
            ...options.contextOverride,
            ...(newContext || {}),
            ...(parsedVars || {}),
          })
        );
      } else {
        setContext((prev) =>
          normalizeContext({
            ...prev,
            ...(newContext || {}),
            ...(parsedVars || {}),
          })
        );
      }

      setStep(targetStep);
      setNeedsInit(false);

    } catch (e) {
      console.error("❌ INIT 실패:", e);
      setError('대화를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
      retryActionRef.current = () => handleInit(targetStep, options);
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  }


  useEffect(() => {
    const warnOnReload = (event) => {
      if (!messagesRef.current.some(message => message.role === 'user') && !inputRef.current?.value) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnOnReload);
    return () => window.removeEventListener('beforeunload', warnOnReload);
  }, []);

  // Keep the last completed response. Never replay an interrupted request on reload.
  useEffect(() => {
    if (loading || creating || needsInit || finishedRef.current) return;
    const saved = saveRenewalSession({ sessionId, step, context, messages, showTemplateButton, stepBoundaries: stepBoundariesRef.current });
    setStorageWarning(saved ? '' : '대화를 임시 저장하지 못했어요. 새로고침 전에 대화기록을 다운로드해 주세요.');
    sendIngestEvent('progress', {
      session_id: sessionId,
      teacher_name: renewalDraft.getItem('teacher_name') || '-',
      teacher_school: renewalDraft.getItem('teacher_school') || '-',
      teacher_email: renewalDraft.getItem('teacher_email') || '---',
      started_at: renewalDraft.getItem('admin_started_at'),
      turn_count: messages.filter(message => message.role === 'user').length,
      messages,
    });
  }, [sessionId, step, context, messages, showTemplateButton, loading, creating, needsInit]);

  useEffect(() => {
    if (loading || creating || finishedRef.current) return;
    try { renewalDraft.setItem('pending_input', input); }
    catch { setStorageWarning('입력을 임시 저장하지 못했어요. 새로고침 전에 대화기록을 다운로드해 주세요.'); }
  }, [input, loading, creating]);

  const handleSend = async (userText) => {
    if (busyRef.current || creatingRef.current || needsInit) return;
    retryActionRef.current = null;
    setError("");

    const raw = (userText ?? input).trim();
    if (!raw) return;
    try { renewalDraft.setItem('pending_input', raw); }
    catch { setStorageWarning('입력을 임시 저장하지 못했어요. 새로고침 전에 대화기록을 다운로드해 주세요.'); }

    const wantsNextStep =
      raw.replace(/\s+/g, "").includes("다음단계") ||
      (raw.includes("다음") && raw.includes("단계"));

    let advanceTo = null;

    if (wantsNextStep) {
      const idx = STEP_ORDER.indexOf(step);
      const next = idx < STEP_ORDER.length - 1 ? STEP_ORDER[idx + 1] : step;

      if (next === step) {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "이미 마지막 단계입니다." }
        ]);
        setInput("");
        return;
      }

      if (next === "question" && !context.topic) {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "⚠️ 먼저 주제(topic)를 설정해주세요." }
        ]);
        setInput("");
        return;
      }

      advanceTo = next;

      console.log("➡️ 다음 단계 요청:", { currentStep: step, next, context });
    }

    const userMsg = raw;
    setMessages(prev => [
      ...prev,
      advanceTo
        ? { role: "user", content: userMsg, skipHistory: true }
        : { role: "user", content: userMsg }
    ]);
    busyRef.current = true;
    setLoading(true);
    setInput('');
    let preserveInput = false;

    try {
      const inputWithHistory = buildInputWithHistory(
        messages,
        userMsg,
        userMsg === "__INIT__"
      );

      const payload = {
        session_id: sessionId,
        user_input: inputWithHistory,
        step: step,
        variable: buildVariable(step, context),
       context: context
      };


      const res = await callChatbot(payload);
      const { text, newContext, parsedVars } = normalize(res);

      const mergedForDisplay = normalizeContext({
        ...context,
        ...(newContext || {}),
        ...(parsedVars || {}),
      });

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: text,
          hidden: !!advanceTo,
        }
      ]);

      if (parsedVars || newContext) {
        setContext((prev) =>
          normalizeContext({
            ...prev,
            ...(newContext || {}),
            ...(parsedVars || {}),
          })
        );
      }
if (step === "ending") {
  const finalPayload = { ...mergedForDisplay };
  if (typeof text === "string" && text.includes("🎬")) {
    let parsedFromText = null;
    try {
      parsedFromText = parseDilemmaText(text.replace(/\*\*/g, ""));
    } catch {
      parsedFromText = null;
    }
    if (parsedFromText) {
      const fallback = {
        ...parsedFromText,
        chardes1: parsedFromText.charDes1,
        chardes2: parsedFromText.charDes2,
        chardes3: parsedFromText.charDes3,
        agree_label: parsedFromText.choice1,
        disagree_label: parsedFromText.choice2,
      };
      const isEmptyVal = (v) =>
        v === undefined ||
        v === null ||
        (typeof v === "string" && !v.trim()) ||
        (Array.isArray(v) && v.length === 0);
      Object.entries(fallback).forEach(([k, v]) => {
        if (isEmptyVal(finalPayload[k]) && !isEmptyVal(v)) finalPayload[k] = v;
      });

      setContext((prev) => {
        const merged = { ...prev };
        Object.entries(fallback).forEach(([k, v]) => {
          if (isEmptyVal(merged[k]) && !isEmptyVal(v)) merged[k] = v;
        });
        return normalizeContext(merged);
      });
    }
  }

  if (finalPayload) {
    renewalDraft.setItem("final_dilemma_payload", JSON.stringify(finalPayload));
  }

  const keys = [
    "opening",
    "dilemma_situation",
    "question",
    "choice1",
    "choice2",
    "flips_agree_texts",
    "flips_disagree_texts",
    "char1",
    "chardes1",
    "char2",
    "chardes2",
    "char3",
    "chardes3",
    "agreeEnding",
    "disagreeEnding",
    "agree_label",
    "disagree_label",
  ];

const keyMap = {
  chardes1: "charDes1",
  chardes2: "charDes2",
  chardes3: "charDes3",
};

keys.forEach((k) => {
  let v = finalPayload?.[k];

  const storageKey = keyMap[k] ?? k;

  if (Array.isArray(v)) {
    renewalDraft.setItem(storageKey, JSON.stringify(v));
  } else if (v !== undefined && v !== null) {
    renewalDraft.setItem(storageKey, v.toString());
  } else {
    renewalDraft.setItem(storageKey, "");
  }
});

  const hasRequired = [
    'agreeEnding', 'disagreeEnding', 'question', 'opening', 'dilemma_situation',
    'flips_agree_texts', 'flips_disagree_texts', 'agree_label', 'disagree_label',
    'char1', 'char2', 'char3', 'chardes1', 'chardes2', 'chardes3',
  ].every(key => {
    const value = finalPayload[key];
    return Array.isArray(value) ? value.some(item => String(item || '').trim()) :
      typeof value === 'string' && value.trim().length > 0;
  });

  if (hasRequired) {
    setShowTemplateButton(true);
  } else {
    setShowTemplateButton(false);
  }


}

      if (advanceTo) {
        await handleInit(advanceTo, {
          contextOverride: mergedForDisplay,
          boundaryOverride: messages.length + 2,
        });
      }

    } catch (err) {
      console.error('Renewal chat request failed:', err);
      setInput(userMsg);
      preserveInput = true;
      setError('메시지를 보내지 못했어요. 입력한 내용은 그대로 보관했어요.');
      retryActionRef.current = () => handleSend(userMsg);
      setMessages(messages);
      setContext(context);
      setShowTemplateButton(showTemplateButton);
    } finally {
      busyRef.current = false;
      setLoading(false);
      if (!preserveInput) setInput('');
    }
  };

  const handleBackStep = () => {
    if (busyRef.current || creatingRef.current) return;

    const idx = STEP_ORDER.indexOf(step);
    if (idx <= 0) return; // opening에서는 뒤로 불가

    const targetStep = STEP_ORDER[idx - 1];
    const targetIdx = idx - 1;

    const cleanedContext = pruneContextFromIndex(context, targetIdx);
    setContext(cleanedContext);
    clearLocalStorageFromIndex(targetIdx);

    setShowTemplateButton(false);

    setError("");
    setInput("");

    const boundary = stepBoundariesRef.current[targetStep];
    STEP_ORDER.slice(targetIdx).forEach(stage => { delete stepBoundariesRef.current[stage]; });
    const trimmed =
      typeof boundary === "number"
        ? messagesRef.current.slice(0, boundary)
        : messagesRef.current.slice();

    const nextMessages = [
      ...trimmed,
      { role: "user", content: "이전단계", skipHistory: true },
    ];
    setMessages(nextMessages);

    setStep(targetStep);

    const boundaryOverride = nextMessages.length;
    handleInit(targetStep, {
      contextOverride: cleanedContext,
      boundaryOverride,
    });
  };

  const handleTemplateCreate = async () => {
  if (busyRef.current || creatingRef.current || !showTemplateButton) return;
  creatingRef.current = true;
  setCreating(true);
  setError('');
  retryActionRef.current = null;
  try {
    const teacher_name = renewalDraft.getItem("teacher_name") || "-";
    const teacher_school = renewalDraft.getItem("teacher_school") || "-";
    const teacher_email = renewalDraft.getItem("teacher_email") || "---";

    const finalPayloadString = renewalDraft.getItem("final_dilemma_payload") || JSON.stringify(context);
    if (!finalPayloadString) {
      throw new Error("Missing final dilemma payload");
    }

    let p;
    try {
      p = JSON.parse(finalPayloadString);
    } catch (e) {
      console.error("final_dilemma_payload JSON 파싱 실패:", e, finalPayloadString);
      throw new Error("Invalid final dilemma payload");
    }

    const opening =
      Array.isArray(p.opening)
        ? p.opening
        : p.opening
        ? [p.opening]
        : [];

    const dilemma_situation =
      Array.isArray(p.dilemma_situation)
        ? p.dilemma_situation
        : p.dilemma_situation
        ? [p.dilemma_situation]
        : [];

    const flips_agree_texts =
      Array.isArray(p.flips_agree_texts)
        ? p.flips_agree_texts
        : p.flips_agree_texts
        ? [p.flips_agree_texts]
        : [];

    const flips_disagree_texts =
      Array.isArray(p.flips_disagree_texts)
        ? p.flips_disagree_texts
        : p.flips_disagree_texts
        ? [p.flips_disagree_texts]
        : [];

    const char1 = p.char1 || "-";
    const char2 = p.char2 || "-";
    const char3 = p.char3 || "-";
    const charDes1 = p.chardes1 || "-";
    const charDes2 = p.chardes2 || "-";
    const charDes3 = p.chardes3 || "-";

    const question = p.question || "-";
    const choice1 = p.agree_label || "-";
    const choice2 = p.disagree_label || "-";
    const agreeEnding = p.agreeEnding || "-";
    const disagreeEnding = p.disagreeEnding || "-";

    const representativeImages = {
      dilemma_image_1: "",
      dilemma_image_3: "",
      dilemma_image_4_1: "",
      dilemma_image_4_2: "",
    };

    Object.keys(representativeImages).forEach((k) => {
      if (!representativeImages[k]) delete representativeImages[k];
    });

    const data = {
      opening,
      roles: [
        { name: char1, description: charDes1 },
        { name: char2, description: charDes2 },
        { name: char3, description: charDes3 },
      ],
      rolesBackground: "",
      dilemma: {
        situation: dilemma_situation,
        question,
        options: { agree_label: choice1, disagree_label: choice2 },
      },
      flips: {
        agree_texts: flips_agree_texts,
        disagree_texts: flips_disagree_texts,
      },
      finalMessages: { agree: agreeEnding, disagree: disagreeEnding },
      ...(Object.keys(representativeImages).length
        ? { representativeImages }
        : {}),
    };

    const payload = {
      teacher_name,
      teacher_school,
      teacher_email,
      title: "제목을 입력하세요",
      representative_image_url: "-",
      data,
    };

    const { data: res } = await axiosInstance.post("/custom-games", payload, {
      headers: { "Content-Type": "application/json" },
    });

    const code = res?.code ?? null;
    const gameUrl = res?.url ?? null;
    if (!code) throw new Error('Game creation response is missing its code');

    const turnCount = messages.filter((m) => m.role === "user").length;
    const endedAt = new Date().toISOString();
    const startedAt = renewalDraft.getItem("admin_started_at");
    sendIngestEvent('complete', {
      session_id: sessionId,
      teacher_name,
      teacher_school,
      teacher_email,
      started_at: startedAt,
      ended_at: endedAt,
      turn_count: turnCount,
      game_code: code,
      game_url: gameUrl,
      messages,
    });

    handoffRenewalGame({ code, url: gameUrl, data, title: payload.title });
    clearRenewalSession();
    finishedRef.current = true;

    navigate("/create00");
    setShowTemplateButton(false);

  } catch (err) {
    console.error("템플릿 생성 실패:", err);
    setError('게임을 생성하지 못했어요. 완성한 내용은 유지되니 다시 시도해 주세요.');
    retryActionRef.current = handleTemplateCreate;
  } finally {
    creatingRef.current = false;
    setCreating(false);
  }
};



  const handleExit = () => {
    sendIngestEvent('abandon', {
      session_id: sessionId,
      teacher_name: renewalDraft.getItem('teacher_name') || '-',
      teacher_school: renewalDraft.getItem('teacher_school') || '-',
      teacher_email: renewalDraft.getItem('teacher_email') || '---',
      started_at: renewalDraft.getItem('admin_started_at'),
      ended_at: new Date().toISOString(),
      turn_count: messages.filter(message => message.role === 'user').length,
      messages,
    });
    clearRenewalSession();
    finishedRef.current = true;
    navigate('/selectroom');
  };

  const handleDownloadTranscript = () => {
    downloadTranscriptCsv({
      sessionId,
      teacherName: renewalDraft.getItem('teacher_name') || '-',
      teacherSchool: renewalDraft.getItem('teacher_school') || '-',
      teacherEmail: renewalDraft.getItem('teacher_email') || '---',
      startedAt: renewalDraft.getItem('admin_started_at'),
      turnCount: messages.filter((message) => message.role === 'user').length,
      messages,
    });
  };

  return (
    <RenewalChat
      step={step}
      context={context}
      messages={messages}
      input={input}
      setInput={setInput}
      inputRef={inputRef}
      loading={loading}
      needsInit={needsInit}
      creating={creating}
      error={error}
      storageWarning={storageWarning}
      canRetry={!!retryActionRef.current}
      onRetry={() => retryActionRef.current?.()}
      showTemplateButton={showTemplateButton}
      onSend={handleSend}
      onBack={handleBackStep}
      onCreate={handleTemplateCreate}
      onDownloadTranscript={handleDownloadTranscript}
      onExit={handleExit}
      renderMessage={text => renderMarkdownLite(renameFlipTerms(stripStageLabels(text)))}
    />
  );
}
