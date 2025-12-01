// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { callChatbot } from "../api/axiosInstance";
// import "../components/chat.css";
// import { persistParsedToLocalStorage } from "../utils/templateparsing";
// import axiosInstance from "../api/axiosInstance";
// import { Colors } from "../components/styleConstants";
// import HeaderBar from "../components/Expanded/HeaderBar3";
// import DilemmaOutPopup from "../components/DilemmaOutPopup";

// const STORAGE_KEY = "dilemma.flow.v1";

// function normalize(res) {
//   const text =
//     res?.response_text ??
//     res?.text ??
//     res?.output ??
//     res?.message ??
//     "";

//   return {
//     text,
//     nextStep: res?.next_step ?? null,
//     currentStep: res?.current_step ?? null,
//     newContext: res?.context ?? null,
//     parsedVars: res?.parsed_variables ?? {},
//     isComplete: !!res?.is_complete,
//     sessionId: res?.session_id ?? null,
//   };
// }

// const HISTORY_LIMIT = 5;

// function buildInputWithHistory(messages, raw, isInit = false) {
//   const recent = messages
//     .filter((m) => m.role === "assistant" || m.role === "user")
//     .slice(-HISTORY_LIMIT);

//   const lines = recent.map((m) => `${m.role}: ${m.content}`);

//   if (!isInit && raw) lines.push(`user: ${raw}`);

//   return lines.join("\n");
// }

// // 🔥 수정: variable 생성 로직을 백엔드 요구사항에 맞게 수정
// function buildVariable(step, ctx) {
//   // Opening 단계는 variable 없음
//   if (step === "opening") return null;

//   // Dilemma 단계: topic만 전달
//   if (step === "question") {
//     const topic = ctx.topic || ctx.dilemma_topic || null;
    
//     if (!topic) {
//       console.warn("⚠️ dilemma 단계인데 topic이 없습니다!");
//       return null;
//     }
    
//     return { topic };
//   }

//   // Flip 단계: question, choice1, choice2 전달
//   if (step === "flip") {
//     return {
//       question: ctx.question,
//       choice1: ctx.choice1,
//       choice2: ctx.choice2,
//     };
//   }

//   // Roles 단계: flip 결과를 structure로 전달
//   if (step === "roles") {
//     return {
//         dilemma_situation: ctx.dilemma_situation,
//         question: ctx.question,
//         choice1: ctx.choice1,
//         flips_agree_texts: ctx.flips_agree_texts,
//         choice2: ctx.choice2,
//         flips_disagree_texts: ctx.flips_disagree_texts,
      
//     };
//   }

// // Ending 단계
//   if (step === "ending") {
//     return {
//       dilemma_situation: forceString(ctx.dilemma_situation),
//       question: forceString(ctx.question),
//       choice1: forceString(ctx.choice1),
//       flips_agree_texts: forceString(ctx.flips_agree_texts),
//       choice2: forceString(ctx.choice2),
//       flips_disagree_texts: forceString(ctx.flips_disagree_texts),
//       char1: forceString(ctx.char1),
//       chardes1: forceString(ctx.chardes1),
//       char2: forceString(ctx.char2),
//       chardes2: forceString(ctx.chardes2),
//       char3: forceString(ctx.char3),
//       chardes3: forceString(ctx.chardes3),
//     };
//   }

//   return null;
// }
// // 배열이면 자동으로 string으로 변환하는 유틸
// function forceString(v) {
//   if (Array.isArray(v)) return v.join("\n");
//   if (v === undefined || v === null) return "";
//   return v;
// }
// export default function ChatPage2() {
//   const navigate = useNavigateSafe();

//   const [sessionId] = useState(() => {
//     const existing = localStorage.getItem("chat_session_id");
//     if (existing) return existing;

//     const newId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
//     localStorage.setItem("chat_session_id", newId);
//     return newId;
//   });

//   const [step, setStep] = useState("opening");
//   const [context, setContext] = useState({});
//   const [messages, setMessages] = useState([{ role: "system", content: "세션 시작" }]);
//   const [input, setInput] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [nextReady, setNextReady] = useState(false); // 🔥 추가: 누락된 상태

//   const bottomRef = useRef(null);
//   const [showTemplateButton, setShowTemplateButton] = useState(false);
//   const [showOutPopup, setShowOutPopup] = useState(false);

//   // --- INIT 호출 ----------------------------------------------------------
//   useEffect(() => {
//     handleInit();
//   }, []);

//   async function handleInit(targetStep = step) {
//     try {
//       setLoading(true);


//       // 🔥 수정: 백엔드 스키마에 맞게 payload 구성
//       const payload = {
//         session_id: sessionId,
//         user_input: "__INIT__",
//         step: targetStep,
//         variable: buildVariable(targetStep, context),
//         context: context
//       };


//       const res = await callChatbot(payload);
      

//       const { text, newContext, parsedVars } = normalize(res);

//       // 기존 메시지 유지 + assistant 추가
//       setMessages(prev => [
//         ...prev,
//         { role: "assistant", content: cleanMarkdown(text) }
//       ]);

//       // context 업데이트 (한 번에 처리)
//       setContext(prev => ({
//         ...prev,
//         ...(newContext || {}),
//         ...(parsedVars || {})
//       }));

//       // step 실제로 변경
//       setStep(targetStep);

//     } catch (e) {
//       console.error("❌ INIT 실패:", e);
//       const errorMsg = e?.response?.data?.detail || e?.message || "INIT 요청 실패";
//       setError(errorMsg);
//       setMessages(prev => [
//         ...prev,
//         { role: "assistant", content: `초기화 실패: ${errorMsg}` }
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   // ----------------------------------------------------------------------

//   useEffect(() => {
//     const clearOnReload = () => {
//       localStorage.removeItem(STORAGE_KEY);

//       const keysToClear = [
//         "opening",
//         "char1", "char2", "char3",
//         "charDes1", "charDes2", "charDes3",
//         "dilemma_situation",
//         "question",
//         "choice1", "choice2",
//         "flips_agree_texts",
//         "flips_disagree_texts",
//         "agreeEnding", "disagreeEnding",
//         "code", "url",
//       ];
//       keysToClear.forEach((k) => localStorage.removeItem(k));
//     };

//     window.addEventListener("beforeunload", clearOnReload);
//     return () => window.removeEventListener("beforeunload", clearOnReload);
//   }, []);

//   // 자동 저장
//   useEffect(() => {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, context, messages }));
//   }, [step, context, messages]);

//   // 항상 스크롤 가장 아래로
//   useEffect(
//     () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
//     [messages, loading]
//   );

//   // Markdown 제거
//   function cleanMarkdown(text) {
//     if (!text) return "";
//     return text
//       .replace(/^#{1,6}\s*/gm, "")
//       .replace(/\*\*(.*?)\*\*/g, "$1")
//       .replace(/\*(.*?)\*/g, "$1")
//       .replace(/__(.*?)__/g, "$1")
//       .replace(/_(.*?)_/g, "$1");
//   }

//   const handleSend = async (userText) => {
//     if (loading) return;
//     setError("");

//     const raw = (userText ?? input).trim();
//     if (!raw) return;

//     // 🔥 수정: "다음 단계" 처리 로직 개선
//     if (raw === "다음 단계") {
//       console.log("➡️ 다음 단계 요청:", {
//         currentStep: step,
//         context: context
//       });

//       setMessages(prev => [...prev, { role: "user", content: raw }]);

//       // step advance
//       const order = ["opening", "question", "flip", "roles", "ending"];
//       const idx = order.indexOf(step);
//       const next = idx < order.length - 1 ? order[idx + 1] : step;

//       if (next === step) {
//         setMessages(prev => [
//           ...prev,
//           { role: "assistant", content: "이미 마지막 단계입니다." }
//         ]);
//         setInput("");
//         return;
//       }

//       // 🔥 수정: step 변경 전에 context 검증
//       if (next === "question" && !context.topic) {
//         setMessages(prev => [
//           ...prev,
//           { role: "assistant", content: "⚠️ 먼저 주제(topic)를 설정해주세요." }
//         ]);
//         setInput("");
//         return;
//       }

//       setStep(next);

//       // INIT 호출
//       setTimeout(() => {
//         handleInit(next);
//       }, 50);

//       setInput("");
//       return;
//     }

//     // 일반 메시지 처리
//     const userMsg = raw;
//     setMessages(prev => [...prev, { role: "user", content: userMsg }]);
//     setLoading(true);

//     try {
//       const inputWithHistory = buildInputWithHistory(
//         messages,
//         userMsg,
//         userMsg === "__INIT__"
//       );

//       // 🔥 수정: 백엔드 스키마에 맞게 payload 구성
//       const payload = {
//         session_id: sessionId,
//         user_input: inputWithHistory,
//         step: step,
//         variable: buildVariable(step, context),
//         context: { ...context }
//       };


//       const res = await callChatbot(payload);
//       const { text, newContext, parsedVars } = normalize(res);


//       // 서버 응답 출력
//       setMessages(prev => [
//         ...prev,
//         { role: "assistant", content: cleanMarkdown(text) }
//       ]);

//       // 🔥 수정: context 업데이트를 한 번에 처리
//       if (parsedVars || newContext) {
//         setContext(prev => ({
//           ...prev,
//           ...(newContext || {}),
//           ...(parsedVars || {})
//         }));
//       }

//       // ENDING 단계 처리
//       if (step === "ending") {
//         const finalText = text;

//         // 🔥 수정: parseDilemmaText 함수가 정의되어 있다고 가정
//         // 없다면 이 부분을 제거하거나 함수를 구현해야 함
//         try {
//           // const parsed = parseDilemmaText(finalText);
//           persistParsedToLocalStorage(finalText);

//           console.log("🎬 최종 초안 파싱 완료");
//         } catch (err) {
//           console.error("파싱 실패:", err);
//         }

//         if (
//           finalText.includes("이대로 초안을 완성하고 싶다면 템플릿 생성 버튼을 눌러주세요") ||
//           finalText.includes("초안으로 확정하시겠습니까")
//         ) {
//           setShowTemplateButton(true);
//         } else {
//           setShowTemplateButton(false);
//         }

//         setNextReady(true);
//       }

//     } catch (err) {
//       const msg =
//         err?.response?.data?.detail ||
//         err?.message ||
//         "요청 실패";

//       console.error("❌ 요청 실패:", err);

//       setError(msg);
//       setMessages(prev => [...prev, { role: "assistant", content: `에러: ${msg}` }]);

//     } finally {
//       setLoading(false);
//       setInput("");
//     }
//   };

//   const readJSON = (key, fallback = []) => {
//     try {
//       const s = localStorage.getItem(key);
//       return s ? JSON.parse(s) : fallback;
//     } catch {
//       return fallback;
//     }
//   };

//   const handleTemplateCreate = async () => {
//     try {
//       const teacher_name = localStorage.getItem("teacher_name") || "-";
//       const teacher_school = localStorage.getItem("teacher_school") || "-";
//       const teacher_email = localStorage.getItem("teacher_email") || "---";

//       const opening = readJSON("opening", []);
//       const char1 = localStorage.getItem("char1") || "-";
//       const char2 = localStorage.getItem("char2") || "-";
//       const char3 = localStorage.getItem("char3") || "-";
//       const charDes1 = localStorage.getItem("charDes1") || "-";
//       const charDes2 = localStorage.getItem("charDes2") || "-";
//       const charDes3 = localStorage.getItem("charDes3") || "-";
//       const dilemma_situation = readJSON("dilemma_situation", ["-"]);
//       const question = localStorage.getItem("question") || "-";
//       const choice1 = localStorage.getItem("choice1") || "-";
//       const choice2 = localStorage.getItem("choice2") || "-";
//       const flips_agree_texts = readJSON("flips_agree_texts", ["-"]);
//       const flips_disagree_texts = readJSON("flips_disagree_texts", ["-"]);
//       const agreeEnding = localStorage.getItem("agreeEnding") || "-";
//       const disagreeEnding = localStorage.getItem("disagreeEnding") || "-";

//       const representativeImages = {
//         dilemma_image_1: "",
//         dilemma_image_3: "",
//         dilemma_image_4_1: "",
//         dilemma_image_4_2: "",
//       };

//       Object.keys(representativeImages).forEach((k) => {
//         if (!representativeImages[k]) delete representativeImages[k];
//       });

//       const data = {
//         opening,
//         roles: [
//           { name: char1, description: charDes1 },
//           { name: char2, description: charDes2 },
//           { name: char3, description: charDes3 },
//         ],
//         rolesBackground: "",
//         dilemma: {
//           situation: dilemma_situation,
//           question,
//           options: { agree_label: choice1, disagree_label: choice2 },
//         },
//         flips: {
//           agree_texts: flips_agree_texts,
//           disagree_texts: flips_disagree_texts,
//         },
//         finalMessages: { agree: agreeEnding, disagree: disagreeEnding },
//         ...(Object.keys(representativeImages).length
//           ? { representativeImages }
//           : {}),
//       };

//       const payload = {
//         teacher_name,
//         teacher_school,
//         teacher_email,
//         title: "제목을 입력하세요",
//         representative_image_url: "-",
//         data,
//       };

//       const { data: res } = await axiosInstance.post("/custom-games", payload, {
//         headers: { "Content-Type": "application/json" },
//       });

//       const code = res?.code ?? null;
//       const gameUrl = res?.url ?? null;

//       if (code) localStorage.setItem("code", code);
//       if (gameUrl) localStorage.setItem("url", gameUrl);

//       navigate("/create00");
//     } catch (err) {
//       console.error("템플릿 생성 실패:", err);
//       alert("템플릿 생성 중 문제가 발생했습니다.");
//     }
//   };

//   // ----------------------------------------------------------------------

//   const placeholder = useMemo(() => {
//     switch (step) {
//       case "opening":
//         return "예) 주제 추천해줘 / AI 판사로 하자";
//       case "question":
//         return "예) 그 갈등으로 예/아니오 질문 만들어줘";
//       case "roles":
//         return "예) 역할 자동 생성해줘 / 확정해줘";
//       case "flip":
//         return "예) 상황/플립 추천해줘 / 확정해줘";
//       case "ending":
//         return "예) 초안 제작해줘 / 확정";
//       default:
//         return "메시지를 입력하세요";
//     }
//   }, [step]);

//   return (
//     <>
//       <div
//         className="chat-wrap"
//         style={{
//           backgroundColor: Colors.creatorgrey01,
//           minHeight: "100vh",
//           inset: 0,
//           display: "flex",
//           flexDirection: "column",
//         }}
//       >
//         <HeaderBar
//           nextDisabled={true}
//           onLeftClick={() => setShowOutPopup(true)}
//           style={{
//             position: "fixed",
//             top: 0,
//             zIndex: 100,
//           }}
//         />

//         {/* 채팅 영역 */}
//         <section
//           className="chat-body"
//           aria-live="polite"
//           style={{
//             flex: 1,
//             overflowY: "auto",
//             paddingTop: "8px",
//             paddingBottom: "80px",
//           }}
//         >
//           {messages.map((m, idx) => (
//             <Bubble key={idx} role={m.role} text={m.content} />
//           ))}

//           {loading && <Bubble role="assistant" text="메시지 입력 중…" typing />}

//           <div ref={bottomRef} />
//         </section>

//         {error && <div className="error">{error}</div>}

//         {showTemplateButton && (
//           <div className="template-btn-container">
//             <button
//               className="template-btn"
//               onClick={(e) => {
//                 e.preventDefault();
//                 handleTemplateCreate();
//                 setShowTemplateButton(false);
//               }}
//             >
//               템플릿 생성
//             </button>
//           </div>
//         )}

//         {/* 입력창 */}
//         <form
//           className="chat-input"
//           onSubmit={(e) => {
//             e.preventDefault();
//             if (!input.trim()) return;
//             handleSend(input);
//           }}
//           style={{
//             background: "#fff",
//             borderTop: "1px solid #ddd",
//             padding: "8px 16px",
//             position: "sticky",
//             bottom: 0,
//           }}
//         >
//           <textarea
//             placeholder={placeholder}
//             value={input}
//             style={{
//               width: "94%",
//               borderRadius: "8px",
//               border: "1px solid #ccc",
//               padding: "8px",
//               resize: "none",
//             }}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.isComposing || e.nativeEvent.isComposing) return;
//               if (e.key === "Enter" && !e.shiftKey) {
//                 e.preventDefault();
//                 if (!loading && input.trim()) {
//                   handleSend(input);
//                 }
//               }
//             }}
//             disabled={loading}
//           />

//           <button
//             disabled={loading || !input.trim()}
//             aria-label="보내기"
//             style={{
//               marginLeft: "0px",
//               backgroundColor: Colors.primary ?? "#f47b00",
//               color: "#fff",
//               border: "none",
//               borderRadius: "6px",
//               padding: "8px 20px",
//               cursor: "pointer",
//             }}
//           >
//             보내기
//           </button>
//         </form>
//       </div>

//       {showOutPopup && (
//         <div
//           role="dialog"
//           aria-modal="true"
//           onClick={() => setShowOutPopup(false)}
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(0,0,0,0.35)",
//             display: "grid",
//             placeItems: "center",
//             zIndex: 10000,
//           }}
//         >
//           <div
//             onClick={(e) => e.stopPropagation()}
//             style={{ pointerEvents: "auto" }}
//           >
//             <DilemmaOutPopup
//               onClose={() => setShowOutPopup(false)}
//               onLogout={() => {
//                 setShowOutPopup(false);
//                 navigate("/selectroom");
//               }}
//             />
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// // ----------------------------------------------------------------------

// function Bubble({ role, text, typing }) {
//   const side = role === "user" ? "right" : "left";
//   const kind =
//     role === "user"
//       ? "user"
//       : role === "assistant"
//       ? "assistant"
//       : "system";

//   return (
//     <div className={`bubble-row ${side}`}>
//       <div className={`bubble ${kind} ${typing ? "typing" : ""}`}>
//         <pre className="msg">{text}</pre>
//       </div>
//     </div>
//   );
// }

// function useNavigateSafe() {
//   try {
//     const { useNavigate } = require("react-router-dom");
//     return useNavigate();
//   } catch {
//     return () => {};
//   }
// } 

import React, { useEffect, useMemo, useRef, useState } from "react";
import { callChatbot } from "../api/axiosInstance";
import { useNavigate } from 'react-router-dom';
import "../components/chat.css";
import { persistParsedToLocalStorage } from "../utils/templateparsing";
import axiosInstance from "../api/axiosInstance";
import { Colors } from "../components/styleConstants";
import HeaderBar from "../components/Expanded/HeaderBar3";
import DilemmaOutPopup from "../components/DilemmaOutPopup";

const STORAGE_KEY = "dilemma.flow.v1";

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

const HISTORY_LIMIT = 5;

function buildInputWithHistory(messages, raw, isInit = false) {
  const recent = messages
    .filter((m) => m.role === "assistant" || m.role === "user")
    .slice(-HISTORY_LIMIT);

  const lines = recent.map((m) => `${m.role}: ${m.content}`);

  if (!isInit && raw) lines.push(`user: ${raw}`);

  return lines.join("\n");
}

// 🔥 수정: variable 생성 로직을 백엔드 요구사항에 맞게 수정
function buildVariable(step, ctx) {
  // Opening 단계는 variable 없음
  if (step === "opening") return null;

  // Dilemma 단계: topic만 전달
  if (step === "question") {
    const topic = ctx.topic || ctx.dilemma_topic || null;
    
    if (!topic) {
      console.warn("⚠️ dilemma 단계인데 topic이 없습니다!");
      return null;
    }
    
    return { topic };
  }

  // Flip 단계: question, choice1, choice2 전달
  if (step === "flip") {
    return {
      question: ctx.question,
      choice1: ctx.choice1,
      choice2: ctx.choice2,
    };
  }

  // Roles 단계: flip 결과를 structure로 전달
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

// Ending 단계
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
// 배열이면 자동으로 string으로 변환하는 유틸
function forceString(v) {
  if (Array.isArray(v)) return v.join("\n");
  if (v === undefined || v === null) return "";
  return v;
}
export default function ChatPage2() {
  const navigate = useNavigate();

  const [sessionId] = useState(() => {
    const existing = localStorage.getItem("chat_session_id");
    if (existing) return existing;

    const newId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("chat_session_id", newId);
    return newId;
  });

  const [step, setStep] = useState("opening");
  const [context, setContext] = useState({});
  const [messages, setMessages] = useState([{ role: "system", content: "세션 시작" }]);
  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nextReady, setNextReady] = useState(false); // 🔥 추가: 누락된 상태

  const bottomRef = useRef(null);
  const [showTemplateButton, setShowTemplateButton] = useState(false);
  const [showOutPopup, setShowOutPopup] = useState(false);

 // --- 🔥 화면 진입 시 context 및 관련 데이터 초기화 ----------------------------------------------------------
  useEffect(() => {
    // context 관련 localStorage 모두 삭제
    const keysToClear = [
      STORAGE_KEY,
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
      "chat_session_id"
    ];
    
    keysToClear.forEach((k) => localStorage.removeItem(k));
    
    // context 상태 초기화
    setContext({});
    
    // 초기화 후 INIT 호출
    handleInit();
  }, []);

  async function handleInit(targetStep = step) {
    try {
      setLoading(true);


      // 🔥 수정: 백엔드 스키마에 맞게 payload 구성
      const payload = {
        session_id: sessionId,
        user_input: "__INIT__",
        step: targetStep,
        variable: buildVariable(targetStep, context),
        context: context
      };


      const res = await callChatbot(payload);
      

      const { text, newContext, parsedVars } = normalize(res);

      // 기존 메시지 유지 + assistant 추가
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: cleanMarkdown(text) }
      ]);

      // context 업데이트 (한 번에 처리)
      setContext(prev => ({
        ...prev,
        ...(newContext || {}),
        ...(parsedVars || {})
      }));

      // step 실제로 변경
      setStep(targetStep);

    } catch (e) {
      console.error("❌ INIT 실패:", e);
      const errorMsg = e?.response?.data?.detail || e?.message || "INIT 요청 실패";
      setError(errorMsg);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: `초기화 실패: ${errorMsg}` }
      ]);
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------------------------

  useEffect(() => {
    const clearOnReload = () => {
      localStorage.removeItem(STORAGE_KEY);

      const keysToClear = [
        "opening",
        "char1", "char2", "char3",
        "charDes1", "charDes2", "charDes3",
        "dilemma_situation",
        "question",
        "choice1", "choice2",
        "flips_agree_texts",
        "flips_disagree_texts",
        "agreeEnding", "disagreeEnding",
        "code", "url",
      ];
      keysToClear.forEach((k) => localStorage.removeItem(k));
    };

    window.addEventListener("beforeunload", clearOnReload);
    return () => window.removeEventListener("beforeunload", clearOnReload);
  }, []);

  // 자동 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, context, messages }));
  }, [step, context, messages]);

  // 항상 스크롤 가장 아래로
  useEffect(
    () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
    [messages, loading]
  );

  // Markdown 제거
  function cleanMarkdown(text) {
    if (!text) return "";
    return text
      .replace(/^#{1,6}\s*/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/_(.*?)_/g, "$1");
  }

  const handleSend = async (userText) => {
    if (loading) return;
    setError("");

    const raw = (userText ?? input).trim();
    if (!raw) return;

    // 🔥 수정: "다음 단계" 처리 로직 개선
    if (
      raw.replace(/\s+/g, "").includes("다음단계") || 
      (raw.includes("다음") && raw.includes("단계"))
    ) {
      console.log("➡️ 다음 단계 요청:", {
        currentStep: step,
        context: context
      });

      setMessages(prev => [...prev, { role: "user", content: raw }]);

      // step advance
      const order = ["opening", "question", "flip", "roles", "ending"];
      const idx = order.indexOf(step);
      const next = idx < order.length - 1 ? order[idx + 1] : step;

      if (next === step) {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "이미 마지막 단계입니다." }
        ]);
        setInput("");
        return;
      }

      // 🔥 수정: step 변경 전에 context 검증
      if (next === "question" && !context.topic) {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "⚠️ 먼저 주제(topic)를 설정해주세요." }
        ]);
        setInput("");
        return;
      }

      setStep(next);

      // INIT 호출
      setTimeout(() => {
        handleInit(next);
      }, 50);

      setInput("");
      return;
    }

    // 일반 메시지 처리
    const userMsg = raw;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const inputWithHistory = buildInputWithHistory(
        messages,
        userMsg,
        userMsg === "__INIT__"
      );

      // 🔥 수정: 백엔드 스키마에 맞게 payload 구성
      const payload = {
        session_id: sessionId,
        user_input: inputWithHistory,
        step: step,
        variable: buildVariable(step, context),
       context: context
      };


      const res = await callChatbot(payload);
      const { text, newContext, parsedVars } = normalize(res);


      // 서버 응답 출력
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: cleanMarkdown(text) }
      ]);

      // 🔥 수정: context 업데이트를 한 번에 처리
      if (parsedVars || newContext) {
        setContext(prev => ({
          ...prev,
          ...(newContext || {}),
          ...(parsedVars || {})
        }));
      }
if (step === "ending") {
  const finalPayload = parsedVars || newContext;

  if (finalPayload) {
    localStorage.setItem("final_dilemma_payload", JSON.stringify(finalPayload));
  }

  // ⭐ 엔딩 variable 전체 localStorage 저장 기능
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

  // 프론트에서 쓰는 키 이름으로 변환
  const storageKey = keyMap[k] ?? k;

  if (Array.isArray(v)) {
    localStorage.setItem(storageKey, JSON.stringify(v));
  } else if (v !== undefined && v !== null) {
    localStorage.setItem(storageKey, v.toString());
  } else {
    localStorage.setItem(storageKey, "");
  }
});

  // 🔥 템플릿 버튼 표시 조건
  const hasRequired =
    finalPayload?.agreeEnding &&
    finalPayload?.disagreeEnding &&
    finalPayload?.question &&
    finalPayload?.opening &&
    finalPayload?.flips_agree_texts &&
    finalPayload?.dilemma_situation;

  if (hasRequired) {
    setShowTemplateButton(true);
  } else {
    setShowTemplateButton(false);
  }

  setNextReady(true);
}

      

    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "요청 실패";

      console.error("❌ 요청 실패:", err);

      setError(msg);
      setMessages(prev => [...prev, { role: "assistant", content: `에러: ${msg}` }]);

    } finally {
      setLoading(false);
      setInput("");
    }
  };

 
const handleTemplateCreate = async () => {
  try {
    const teacher_name = localStorage.getItem("teacher_name") || "-";
    const teacher_school = localStorage.getItem("teacher_school") || "-";
    const teacher_email = localStorage.getItem("teacher_email") || "---";

    // 🔥 ending 단계에서 저장한 최종 payload 가져오기
    const finalPayloadString = localStorage.getItem("final_dilemma_payload");
    if (!finalPayloadString) {
      alert("템플릿 생성에 필요한 데이터가 없습니다. 먼저 엔딩 단계까지 진행해주세요.");
      return;
    }

    let p;
    try {
      p = JSON.parse(finalPayloadString);
    } catch (e) {
      console.error("final_dilemma_payload JSON 파싱 실패:", e, finalPayloadString);
      alert("저장된 템플릿 데이터 형식이 올바르지 않습니다.");
      return;
    }

    // 🔒 방어적으로 배열/문자열 처리
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

    // 이미지 대표 값은 기존 로직 그대로 유지 (비워두면 자동 필터링)
    const representativeImages = {
      dilemma_image_1: "",
      dilemma_image_3: "",
      dilemma_image_4_1: "",
      dilemma_image_4_2: "",
    };

    Object.keys(representativeImages).forEach((k) => {
      if (!representativeImages[k]) delete representativeImages[k];
    });

    // 🔥 최종 data 구조
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

    if (code) localStorage.setItem("code", code);
    if (gameUrl) localStorage.setItem("url", gameUrl);

    navigate("/create00");
    setShowTemplateButton(false);

  } catch (err) {
    console.error("템플릿 생성 실패:", err);
    alert("템플릿 생성 중 문제가 발생했습니다.");
  }
};


  // ----------------------------------------------------------------------

  const placeholder = useMemo(() => {
    switch (step) {
      case "opening":
        return "예) 주제 추천해줘 / AI 판사로 하자";
      case "question":
        return "예) 그 갈등으로 예/아니오 질문 만들어줘";
      case "roles":
        return "예) 역할 자동 생성해줘 / 확정해줘";
      case "flip":
        return "예) 상황/플립 추천해줘 / 확정해줘";
      case "ending":
        return "예) 초안 제작해줘 / 확정";
      default:
        return "메시지를 입력하세요";
    }
  }, [step]);

  return (
    <>
      <div
        className="chat-wrap"
        style={{
          backgroundColor: Colors.creatorgrey01,
          minHeight: "100vh",
          inset: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <HeaderBar
          nextDisabled={true}
          onLeftClick={() => setShowOutPopup(true)}
          style={{
            position: "fixed",
            top: 0,
            zIndex: 100,
          }}
        />

        {/* 채팅 영역 */}
        <section
          className="chat-body"
          aria-live="polite"
          style={{
            flex: 1,
            overflowY: "auto",
            paddingTop: "8px",
            paddingBottom: "80px",
          }}
        >
          {messages.map((m, idx) => (
            <Bubble key={idx} role={m.role} text={m.content} />
          ))}

          {loading && <Bubble role="assistant" text="메시지 입력 중…" typing />}

          <div ref={bottomRef} />
        </section>

        {error && <div className="error">{error}</div>}

        {showTemplateButton && (
          <div className="template-btn-container">
            <button
              className="template-btn"
              onClick={(e) => {
                e.preventDefault();
                handleTemplateCreate();
                //setShowTemplateButton(false);
              }}
            >
              템플릿 생성
            </button>
          </div>
        )}

        {/* 입력창 */}
        <form
          className="chat-input"
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim()) return;
            handleSend(input);
          }}
          style={{
            background: "#fff",
            borderTop: "1px solid #ddd",
            padding: "8px 16px",
            position: "sticky",
            bottom: 0,
          }}
        >
          <textarea
            placeholder={placeholder}
            value={input}
            style={{
              width: "94%",
              borderRadius: "8px",
              border: "1px solid #ccc",
              padding: "8px",
              resize: "none",
            }}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.isComposing || e.nativeEvent.isComposing) return;
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!loading && input.trim()) {
                  handleSend(input);
                }
              }
            }}
            disabled={loading}
          />

          <button
            disabled={loading || !input.trim()}
            aria-label="보내기"
            style={{
              marginLeft: "0px",
              backgroundColor: Colors.primary ?? "#f47b00",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 20px",
              cursor: "pointer",
            }}
          >
            보내기
          </button>
        </form>
      </div>

      {showOutPopup && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowOutPopup(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "grid",
            placeItems: "center",
            zIndex: 10000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: "auto" }}
          >
            <DilemmaOutPopup
              onClose={() => setShowOutPopup(false)}
              onLogout={() => {
                setShowOutPopup(false);
                navigate("/selectroom");
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

function Bubble({ role, text, typing }) {
  const side = role === "user" ? "right" : "left";
  const kind =
    role === "user"
      ? "user"
      : role === "assistant"
      ? "assistant"
      : "system";

  return (
    <div className={`bubble-row ${side}`}>
      <div className={`bubble ${kind} ${typing ? "typing" : ""}`}>
        <pre className="msg">{text}</pre>
      </div>
    </div>
  );
}

