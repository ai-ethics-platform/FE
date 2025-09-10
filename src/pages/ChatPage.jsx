// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { callChatbot } from "../api/axiosInstance";
// import { PROMPTS } from "../components/prompts";
// import "../components/chat.css"; 

// const STORAGE_KEY = "dilemma.flow.v1";
// const ORDER = ["topic", "question", "roles", "scene", "ending"];

// export default function ChatPage() {
//   const [step, setStep] = useState("topic");
//   const [context, setContext] = useState({});
//   const [messages, setMessages] = useState([]); 
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false); 
//   const [error, setError] = useState("");
//   const bottomRef = useRef(null);

//   // 로컬 복구 (이전 대화 및 context 로드)
//   useEffect(() => {
//     const saved = localStorage.getItem(STORAGE_KEY);
//     if (saved) {
//       try {
//         const { step: s, context: c, messages: m } = JSON.parse(saved);
//         if (s) setStep(s);
//         if (c) setContext(c);
//         if (m && Array.isArray(m) && m.length) setMessages(m);
//       } catch (e) {
//         console.log("로컬 저장소 불러오기 실패:", e);
//       }
//     }
//   }, []);

//   // 자동 저장
//   useEffect(() => {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, context, messages }));
//   }, [step, context, messages]);

//   // 스크롤 아래로
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, loading]);

//   // 초기 메시지 설정
//   useEffect(() => {
//     if (messages.length === 0) {
//       setMessages([{ role: "system", content: "세션 시작" }]);
//       handleSend("__INIT__"); // 내부에서 빈 input으로 동일 포맷 전송
//     }
//   }, []);
  
//   const placeholder = useMemo(() => {
//     switch (step) {
//       case "topic": return "예) 주제 추천해줘 / AI 판사로 하자";
//       case "question": return "예) 그 갈등으로 예/아니오 질문 만들어줘";
//       case "roles": return "예) 역할 자동 생성해줘 / 확정해줘";
//       case "scene": return "예) 상황/플립 추천해줘 / 확정해줘";
//       case "ending": return "예) 초안 제작해줘 / 확정";
//       default: return "메시지를 입력하세요";
//     }
//   }, [step]);

//   function normalize(res) {
//     const text =
//       res?.text ??             // 새 스펙
//       res?.output ??           // 구 스펙 하위호환
//       res?.message ??          // 방어
//       "";
  
//     const nextStep = res?.next?.step ?? res?.step ?? null;
//     const newContext = res?.context ?? null;
//     const raw = res?.raw ?? null;
  
//     return { text, nextStep, newContext, raw };
//   }
//   async function handleSend(userText) {
//     const raw = (userText ?? input).trim();
//     const isInit = raw === "__INIT__";
  
//     // 사용자 버블: 초기 콜은 넣지 않음
//     if (!isInit && raw) {
//       setMessages(prev => [...prev, { role: "user", content: raw }]);
//     }
  
//     setLoading(true);
  
//     try {
//       let prompt = PROMPTS[step]; // 현재 step에 맞는 prompt
//       let payload;
  
//       if (step === "topic") {
//         prompt = PROMPTS["topic"];
//         payload = {
//           step: "topic",
//           input: raw,
//           context,
//           prompt: {
//             id: prompt.id,
//             version: prompt.version,
//           },
//         };
//       } else if (step === "question") {
//         prompt = PROMPTS["question"];
  
//         // 대화 흐름을 이어가기 위해 이전 대화 내용과 사용자 입력을 결합
//         const previousMessages = messages.slice(-3); // 마지막 3개 메시지 추출
//         const conversationHistory = previousMessages.map(m => `${m.role}: ${m.content}`).join("\n");
  
//         payload = {
//           step: "question",
//           input: `${conversationHistory}\n${raw}`,  // 대화 내용 + 사용자 입력 결합
//           context,
//           prompt: {
//             id: prompt.id,
//             version: prompt.version,
//             variables: { topic: context.topic },
//           },
//         };
//       }
  
//       const res = await callChatbot(payload);
//       const { text, nextStep, newContext } = normalize(res);
  
//       setMessages(prev => [...prev, { role: "assistant", content: text || "(빈 응답)" }]);
  
//       if (newContext && typeof newContext === "object") setContext(newContext);
  
//       // 서버가 보낸 nextStep으로 이동
//       if (nextStep && ORDER.includes(nextStep)) {
//         setStep(nextStep);
//       } else {
//         advanceStep();  // 수동으로 '다음' 단계로 넘기기
//       }
//     } catch (e) {
//       const msg = e?.response?.data?.error || e?.message || "요청 실패";
//       setError(msg);
//       setMessages(prev => [...prev, { role: "assistant", content: `에러: ${msg}` }]);
//     } finally {
//       setLoading(false);
//       setInput("");
//     }
//   }
  
  
//   function advanceStep() {
//     // 현재 단계로부터 다음 단계로 넘어가기
//     setStep(prev => {
//       const idx = ORDER.indexOf(prev);
//       return idx >= 0 && idx < ORDER.length - 1 ? ORDER[idx + 1] : prev;
//     });
//   }

//   function handleReset() {
//     setStep("topic");
//     setContext({});
//     setMessages([]);
//     setInput("");
//     setError("");
//     localStorage.removeItem(STORAGE_KEY);
//     setTimeout(() => handleSend("__INIT__"), 50);
//   }

//   // topic 단계 종료 감지
//   useEffect(() => {
//     if (step !== "topic") return;

//     const lastMessage = messages[messages.length - 1];
//     if (!lastMessage) return;

//     // 마지막 assistant 메시지가 "주제가 확정되었습니다" 또는 "주제를 확정할까요?"를 포함하면 topic 단계 종료 및 topic 값을 context에 저장
//     if (lastMessage.role === "assistant" && (
//         lastMessage.content.includes("주제가 확정되었습니다") ||
//         lastMessage.content.includes("주제를 확정할까요?")
//       )) {
//       // "선택하신 주제는" 뒤의 텍스트를 추출하여 topic으로 저장
//       const topicTextMatch = lastMessage.content.match(/선택하신 주제는 "(.*?)"/);
//       if (topicTextMatch && topicTextMatch[1]) {
//         const topicText = topicTextMatch[1];  // 추출한 주제 텍스트
//         setContext(prev => ({ ...prev, topic: topicText }));  // context.topic에 저장

//         // 로컬에 주제 저장
//         localStorage.setItem("topic", topicText);

//         setStep("question");  // question 단계로 넘어감
//       }
//     }
//   }, [messages, step]);  // messages와 step이 변경될 때마다 실행

//   return (
//     <div className="chat-wrap">
//       <header className="chat-header">
//         <div className="title">Dilemma Creator</div>
//         <div className="step">현재 단계: <b>{step}</b></div>
//         <button className="reset-btn" onClick={handleReset}>리셋</button>
//       </header>

//       <section className="chat-body" aria-live="polite">
//         {messages.map((m, idx) => (
//           <Bubble key={idx} role={m.role} text={m.content} />
//         ))}

//         {/* 응답 오기 전: 챗봇 말풍선에 "메시지 입력 중…" */}
//         {loading && <Bubble role="assistant" text="메시지 입력 중…" typing />}

//         <div ref={bottomRef} />
//       </section>

//       {error && <div className="error">{error}</div>}

//       <details className="context-view">
//         <summary>컨텍스트 보기</summary>
//         <pre>{JSON.stringify(context, null, 2)}</pre>
//       </details>

//       <form
//         className="chat-input"
//         onSubmit={(e) => {
//           e.preventDefault();
//           if (input.trim().length === 0) return;
//           handleSend();
//         }}
//       >
//         <input
//           placeholder={placeholder}
//           value={input}
//           onChange={e => setInput(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter" && !e.shiftKey) return;
//           }}
//           disabled={loading}
//         />
//         <button disabled={loading || input.trim().length === 0} aria-label="보내기">
//           보내기
//         </button>
//       </form>
//     </div>
//   );
// }

// function Bubble({ role, text, typing }) {
//   const side = role === "user" ? "right" : "left";
//   const kind =
//     role === "user" ? "user" :
//     role === "assistant" ? "assistant" : "system";

//   return (
//     <div className={`bubble-row ${side}`}>
//       <div className={`bubble ${kind} ${typing ? "typing" : ""}`}>
//         <pre className="msg">{text}</pre>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState, useRef } from "react";
import { callChatbot } from "../api/axiosInstance";
import "../components/chat.css"; 

const STORAGE_KEY = "dilemma.flow.v1";

export default function ChatPage() {
  const [messages, setMessages] = useState([]); 
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState("");
  const [context, setContext] = useState({});  
  const bottomRef = useRef(null);

  // 로컬 복구
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { messages: m } = JSON.parse(saved);
        if (m && Array.isArray(m) && m.length) setMessages(m);
      } catch {}
    }
  }, []);

  // 자동 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages }));
  }, [messages]);

  // 스크롤 아래로
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: "system", content: "세션 시작" }]);
      handleSend("__INIT__"); // 첫 대화 시 빈 input 전송
    }
    // eslint-disable-next-line
  }, []);

  const placeholder = "메시지를 입력하세요";  // 단일 프롬프트 사용시 기본 placeholder

  function normalize(res) {
    const text =
      res?.text ??             // 새 스펙
      res?.output ??           // 구 스펙 하위호환
      res?.message ??          // 방어
      "";
  
    const newContext = res?.context ?? null; 
    return { text, newContext };
  }

  async function handleSend(userText) {
    if (loading) return;
    setError("");
  
    const raw = (userText ?? input).trim();
    const isInit = raw === "__INIT__";
  
    // 사용자 메시지 추가
    if (!isInit && raw) {
      setMessages(prev => [...prev, { role: "user", content: raw }]);
    }
  
    setLoading(true);
  
    try {
      // 최근 대화 내용 3개만 가져옴
      const recentMessages = messages.slice(-3);
      // 각 메시지를 줄바꿈으로 결합하여 conversationHistory 생성
      const conversationHistory = recentMessages.map(m => `${m.role}: ${m.content}`).join("\n");
  
      // conversationHistory와 사용자 입력(raw)을 결합하여 input에 전달
      const inputWithHistory = `${conversationHistory}\n${raw}`;
  
      const prompt = {
        id: "pmpt_68c19d5fe3d48193859772e8883a28d20b3f0cca51ff5a73",  // 고정된 프롬프트 ID
        version: "6",
        messages: [
          { role: "system", content: "당신은 한국어를 사용하는 교사들이 AI 윤리 딜레마 기반의 대화형 수업 게임을 설계할 수 있도록 돕는 티칭 어시스턴트 챗봇입니다." },
          ...recentMessages, // 최근 대화 내용 추가
        ],
      };
  
      const payload = {
        input: inputWithHistory,  // 이전 대화 흐름 + 사용자 입력
        context, // sessionstart 변수를 사용하지 않음
        prompt: {
          id: prompt.id,
          version: prompt.version,
          messages: [
            { role: "system", content: "당신은 한국어를 사용하는 교사들이 AI 윤리 딜레마 기반의 대화형 수업 게임을 설계할 수 있도록 돕는 티칭 어시스턴트 챗봇입니다." },
            ...recentMessages, // 최근 대화 내용 추가
          ],
        },
      };
  
      const res = await callChatbot(payload);
      const { text, newContext } = normalize(res);
  
      // 대화 내용 업데이트
      setMessages(prev => [...prev, { role: "assistant", content: text || "(빈 응답)" }]);
  
      if (newContext && typeof newContext === "object") {
        setContext(newContext); // 새로운 context로 업데이트
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
  

  function handleReset() {
    setMessages([]);
    setInput("");
    setError("");
    setContext({});  // context 리셋
    localStorage.removeItem(STORAGE_KEY);
    setTimeout(() => handleSend("__INIT__"), 50);
  }

  return (
    <div className="chat-wrap">
      <header className="chat-header">
        <div className="title">Dilemma Creator</div>
        <button className="reset-btn" onClick={handleReset}>리셋</button>
      </header>

      <section className="chat-body" aria-live="polite">
        {messages.map((m, idx) => (
          <Bubble key={idx} role={m.role} text={m.content} />
        ))}

        {/* 응답 오기 전: 챗봇 말풍선에 "메시지 입력 중…" */}
        {loading && <Bubble role="assistant" text="메시지 입력 중…" typing />}

        <div ref={bottomRef} />
      </section>

      {error && <div className="error">{error}</div>}

      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim().length === 0) return;
          handleSend(input);
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
