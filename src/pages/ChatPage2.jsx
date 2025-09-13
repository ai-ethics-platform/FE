import React, { useEffect, useMemo, useRef, useState } from "react";
import { callChatbot } from "../api/axiosInstance";
import { PROMPTS } from "../components/prompts";
import "../components/chat.css"; 

const STORAGE_KEY = "dilemma.flow.v1";
const ORDER = ["topic", "question", "roles", "scene", "ending"];

// ⬇️ 추가: 최근 N개 대화 + 이번 입력을 묶어서 input으로 보내기
const HISTORY_LIMIT = 5;
function buildInputWithHistory(msgs, raw, isInit, limit = HISTORY_LIMIT) {
  const recent = msgs.filter(m => m.role !== "system").slice(-limit);
  const lines = recent.map(m => `${m.role}: ${m.content}`);
  if (!isInit && raw) lines.push(`user: ${raw}`);
  return lines.join("\n");
}

export default function ChatPage() {
  const [step, setStep] = useState("topic");
  const [context, setContext] = useState({});
  const [messages, setMessages] = useState([]); 
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  // 로컬 복구 (이전 대화 및 context 로드)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { step: s, context: c, messages: m } = JSON.parse(saved);
        if (s) setStep(s);
        if (c) setContext(c);
        if (m && Array.isArray(m) && m.length) setMessages(m);
      } catch (e) {
        console.log("로컬 저장소 불러오기 실패:", e);
      }
    }
  }, []);

  // 자동 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, context, messages }));
  }, [step, context, messages]);

  // 스크롤 아래로
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 초기 메시지 설정
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: "system", content: "세션 시작" }]);
      handleSend("__INIT__");
    }
  }, []);
  
  const placeholder = useMemo(() => {
    switch (step) {
      case "topic": return "예) 주제 추천해줘 / AI 판사로 하자";
      case "question": return "예) 그 갈등으로 예/아니오 질문 만들어줘";
      case "roles": return "예) 역할 자동 생성해줘 / 확정해줘";
      case "scene": return "예) 상황/플립 추천해줘 / 확정해줘";
      case "ending": return "예) 초안 제작해줘 / 확정";
      default: return "메시지를 입력하세요";
    }
  }, [step]);

  function normalize(res) {
    const text =
      res?.text ??             
      res?.output ??           
      res?.message ??          
      "";
  
    const nextStep = res?.next?.step ?? res?.step ?? null;
    const newContext = res?.context ?? null;
    const raw = res?.raw ?? null;
  
    return { text, nextStep, newContext, raw };
  }

  async function handleSend(userText) {
    if (loading) return;
    setError("");
  
    const raw = (userText ?? input).trim();
    const isInit = raw === "__INIT__";
  
    setLoading(true);
  
    try {
      // ⬇️ 먼저 히스토리+현재입력을 합쳐서 만든다(중복/경합 방지)
      const inputWithHistory = buildInputWithHistory(messages, raw, isInit);

      // 이후에야 화면(UI)에 사용자 버블 추가 (초기콜 제외)
      if (!isInit && raw) {
        setMessages(prev => [...prev, { role: "user", content: raw }]);
      }

      let prompt = PROMPTS[step];
      let payload;

      // topic 단계: variables 없음
      if (step === "topic") {
        payload = {
          step: "topic",
          input: inputWithHistory,   // ⬅️ 히스토리 포함
          context,
          prompt: {
            id: prompt.id,
            version: prompt.version,
          },
        };
      } 
      // question 단계: topic 변수 포함
      else if (step === "question") {
        payload = {
          step: "question",
          input: inputWithHistory,   // ⬅️ 히스토리 포함
          context,
          prompt: {
            id: prompt.id,
            version: prompt.version,
            variables: { topic: context.topic },
          },
        };
      } 
      // 그 외 단계(roles/scene/ending): 기본 형태로 전송
      else {
        payload = {
          step,
          input: inputWithHistory,   // ⬅️ 히스토리 포함
          context,
          prompt: {
            id: prompt.id,
            version: prompt.version,
          },
        };
      }
  
      const res = await callChatbot(payload);
      const { text, nextStep, newContext } = normalize(res);
  
      setMessages(prev => [...prev, { role: "assistant", content: text || "(빈 응답)" }]);
  
      if (newContext && typeof newContext === "object") setContext(newContext);
  
      if (nextStep && ORDER.includes(nextStep)) {
        setStep(nextStep);
      } else {
        advanceStep();
      }
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || "요청 실패";
      setError(msg);
      setMessages(prev => [...prev, { role: "assistant", content: `에러: ${msg}` }]);
    } finally {
      setLoading(false);
      setInput("");
    }
  }
  
  function advanceStep() {
    setStep(prev => {
      const idx = ORDER.indexOf(prev);
      return idx >= 0 && idx < ORDER.length - 1 ? ORDER[idx + 1] : prev;
    });
  }

  function handleReset() {
    setStep("topic");
    setContext({});
    setMessages([]);
    setInput("");
    setError("");
    localStorage.removeItem(STORAGE_KEY);
    setTimeout(() => handleSend("__INIT__"), 50);
  }

  // topic 단계 종료 감지
  useEffect(() => {
    if (step !== "topic") return;

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

    if (lastMessage.role === "assistant" && lastMessage.content.includes("주제가 확정되었습니다")) {
      const openingText = lastMessage.content.split("주제가 확정되었습니다")[1].trim();
      setContext(prev => ({ ...prev, topic: openingText }));
      localStorage.setItem("openingText", openingText);
      setStep("question");
    }
  }, [messages, step]);

  return (
    <div className="chat-wrap">
      <header className="chat-header">
        <div className="title">Dilemma Creator</div>
        <div className="step">현재 단계: <b>{step}</b></div>
        <button className="reset-btn" onClick={handleReset}>리셋</button>
      </header>

      <section className="chat-body" aria-live="polite">
        {messages.map((m, idx) => (
          <Bubble key={idx} role={m.role} text={m.content} />
        ))}

        {loading && <Bubble role="assistant" text="메시지 입력 중…" typing />}

        <div ref={bottomRef} />
      </section>

      {error && <div className="error">{error}</div>}

      <details className="context-view">
        <summary>컨텍스트 보기</summary>
        <pre>{JSON.stringify(context, null, 2)}</pre>
      </details>

      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim().length === 0) return;
          handleSend();
        }}
      >
        <input
          placeholder={placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) return;
          }}
          disabled={loading}
        />
        <button disabled={loading || input.trim().length === 0} aria-label="보내기">
          보내기
        </button>
      </form>
    </div>
  );
}

function Bubble({ role, text, typing }) {
  const side = role === "user" ? "right" : "left";
  const kind =
    role === "user" ? "user" :
    role === "assistant" ? "assistant" : "system";

  return (
    <div className={`bubble-row ${side}`}>
      <div className={`bubble ${kind} ${typing ? "typing" : ""}`}>
        <pre className="msg">{text}</pre>
      </div>
    </div>
  );
}
