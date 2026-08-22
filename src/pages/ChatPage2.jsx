// 이전 단계 도입 전 코드 
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { callChatbot } from "../api/axiosInstance";
// import { useNavigate } from 'react-router-dom';
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
//   const navigate = useNavigate();

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

//  // --- 🔥 화면 진입 시 context 및 관련 데이터 초기화 ----------------------------------------------------------
//   useEffect(() => {
//     // context 관련 localStorage 모두 삭제
//     const keysToClear = [
//       STORAGE_KEY,
//       "final_dilemma_payload",
//       "opening",
//       "char1", "char2", "char3",
//       "charDes1", "charDes2", "charDes3",
//       "dilemma_situation",
//       "question",
//       "choice1", "choice2",
//       "flips_agree_texts",
//       "flips_disagree_texts",
//       "agreeEnding", "disagreeEnding",
//       "agree_label", "disagree_label",
//       "topic", "dilemma_topic",
//       "chat_session_id"
//     ];
    
//     keysToClear.forEach((k) => localStorage.removeItem(k));
    
//     // context 상태 초기화
//     setContext({});
    
//     // 초기화 후 INIT 호출
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
//     if (
//       raw.replace(/\s+/g, "").includes("다음단계") || 
//       (raw.includes("다음") && raw.includes("단계"))
//     ) {
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
//        context: context
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
// if (step === "ending") {
//   const finalPayload = parsedVars || newContext;

//   if (finalPayload) {
//     localStorage.setItem("final_dilemma_payload", JSON.stringify(finalPayload));
//   }

//   // ⭐ 엔딩 variable 전체 localStorage 저장 기능
//   const keys = [
//     "opening",
//     "dilemma_situation",
//     "question",
//     "choice1",
//     "choice2",
//     "flips_agree_texts",
//     "flips_disagree_texts",
//     "char1",
//     "chardes1",
//     "char2",
//     "chardes2",
//     "char3",
//     "chardes3",
//     "agreeEnding",
//     "disagreeEnding",
//     "agree_label",
//     "disagree_label",
//   ];

// const keyMap = {
//   chardes1: "charDes1",
//   chardes2: "charDes2",
//   chardes3: "charDes3",
// };

// keys.forEach((k) => {
//   let v = finalPayload?.[k];

//   // 프론트에서 쓰는 키 이름으로 변환
//   const storageKey = keyMap[k] ?? k;

//   if (Array.isArray(v)) {
//     localStorage.setItem(storageKey, JSON.stringify(v));
//   } else if (v !== undefined && v !== null) {
//     localStorage.setItem(storageKey, v.toString());
//   } else {
//     localStorage.setItem(storageKey, "");
//   }
// });

//   // 🔥 템플릿 버튼 표시 조건
//   const hasRequired =
//     finalPayload?.agreeEnding &&
//     finalPayload?.disagreeEnding &&
//     finalPayload?.question &&
//     finalPayload?.opening &&
//     finalPayload?.flips_agree_texts &&
//     finalPayload?.dilemma_situation;

//   if (hasRequired) {
//     setShowTemplateButton(true);
//   } else {
//     setShowTemplateButton(false);
//   }

//   setNextReady(true);
// }

      

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

 
// const handleTemplateCreate = async () => {
//   try {
//     const teacher_name = localStorage.getItem("teacher_name") || "-";
//     const teacher_school = localStorage.getItem("teacher_school") || "-";
//     const teacher_email = localStorage.getItem("teacher_email") || "---";

//     // 🔥 ending 단계에서 저장한 최종 payload 가져오기
//     const finalPayloadString = localStorage.getItem("final_dilemma_payload");
//     if (!finalPayloadString) {
//       alert("템플릿 생성에 필요한 데이터가 없습니다. 먼저 엔딩 단계까지 진행해주세요.");
//       return;
//     }

//     let p;
//     try {
//       p = JSON.parse(finalPayloadString);
//     } catch (e) {
//       console.error("final_dilemma_payload JSON 파싱 실패:", e, finalPayloadString);
//       alert("저장된 템플릿 데이터 형식이 올바르지 않습니다.");
//       return;
//     }

//     // 🔒 방어적으로 배열/문자열 처리
//     const opening =
//       Array.isArray(p.opening)
//         ? p.opening
//         : p.opening
//         ? [p.opening]
//         : [];

//     const dilemma_situation =
//       Array.isArray(p.dilemma_situation)
//         ? p.dilemma_situation
//         : p.dilemma_situation
//         ? [p.dilemma_situation]
//         : [];

//     const flips_agree_texts =
//       Array.isArray(p.flips_agree_texts)
//         ? p.flips_agree_texts
//         : p.flips_agree_texts
//         ? [p.flips_agree_texts]
//         : [];

//     const flips_disagree_texts =
//       Array.isArray(p.flips_disagree_texts)
//         ? p.flips_disagree_texts
//         : p.flips_disagree_texts
//         ? [p.flips_disagree_texts]
//         : [];

//     const char1 = p.char1 || "-";
//     const char2 = p.char2 || "-";
//     const char3 = p.char3 || "-";
//     const charDes1 = p.chardes1 || "-";
//     const charDes2 = p.chardes2 || "-";
//     const charDes3 = p.chardes3 || "-";

//     const question = p.question || "-";
//     const choice1 = p.agree_label || "-";
//     const choice2 = p.disagree_label || "-";
//     const agreeEnding = p.agreeEnding || "-";
//     const disagreeEnding = p.disagreeEnding || "-";

//     // 이미지 대표 값은 기존 로직 그대로 유지 (비워두면 자동 필터링)
//     const representativeImages = {
//       dilemma_image_1: "",
//       dilemma_image_3: "",
//       dilemma_image_4_1: "",
//       dilemma_image_4_2: "",
//     };

//     Object.keys(representativeImages).forEach((k) => {
//       if (!representativeImages[k]) delete representativeImages[k];
//     });

//     // 🔥 최종 data 구조
//     const data = {
//       opening,
//       roles: [
//         { name: char1, description: charDes1 },
//         { name: char2, description: charDes2 },
//         { name: char3, description: charDes3 },
//       ],
//       rolesBackground: "",
//       dilemma: {
//         situation: dilemma_situation,
//         question,
//         options: { agree_label: choice1, disagree_label: choice2 },
//       },
//       flips: {
//         agree_texts: flips_agree_texts,
//         disagree_texts: flips_disagree_texts,
//       },
//       finalMessages: { agree: agreeEnding, disagree: disagreeEnding },
//       ...(Object.keys(representativeImages).length
//         ? { representativeImages }
//         : {}),
//     };

//     const payload = {
//       teacher_name,
//       teacher_school,
//       teacher_email,
//       title: "제목을 입력하세요",
//       representative_image_url: "-",
//       data,
//     };

//     const { data: res } = await axiosInstance.post("/custom-games", payload, {
//       headers: { "Content-Type": "application/json" },
//     });

//     const code = res?.code ?? null;
//     const gameUrl = res?.url ?? null;

//     if (code) localStorage.setItem("code", code);
//     if (gameUrl) localStorage.setItem("url", gameUrl);

//     navigate("/create00");
//     setShowTemplateButton(false);

//   } catch (err) {
//     console.error("템플릿 생성 실패:", err);
//     alert("템플릿 생성 중 문제가 발생했습니다.");
//   }
// };


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
//                 //setShowTemplateButton(false);
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

import React, { useEffect, useMemo, useRef, useState } from "react";
import { callChatbot } from "../api/axiosInstance";
import { useNavigate } from 'react-router-dom';
import "../components/chat.css";
import { persistParsedToLocalStorage, parseDilemmaText } from "../utils/templateparsing";
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

// 한 단계 안에서 왕복이 6~8턴까지 가므로 5줄은 앞서 정한 값이 창밖으로 밀려난다.
const HISTORY_LIMIT = 12;

// 입력창이 늘어날 수 있는 최대 높이(px). 넘어가면 입력창 안에서 스크롤한다.
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

//  수정: variable 생성 로직을 백엔드 요구사항에 맞게 수정
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

// ---------------------------
// 서버 context 키 정규화 + ending fallback
// ---------------------------
const coalesce = (...vals) => {
  for (const v of vals) {
    if (v === undefined || v === null) continue;
    const s = typeof v === "string" ? v.trim() : v;
    if (typeof s === "string") {
      if (s.length) return s;
      continue;
    }
    // 배열/객체도 "값이 있다"로 취급
    return v;
  }
  return "";
};

const ensureArray = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean);
  if (typeof v === "string") {
    // 문장/줄바꿈 기반으로 대충 split (서버가 string으로 주는 케이스 방어)
    const parts = v
      .replace(/\r/g, "")
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.length ? parts : [v];
  }
  return [String(v)];
};

function normalizeContext(ctx) {
  const next = { ...(ctx || {}) };

  // topic
  next.topic = coalesce(next.topic, next.dilemma_topic, next.opening_topic);

  // 딜레마 핵심(상황/질문/선택지/플립)
  // ending_* 접두 키는 BE가 세션 context에 보존하는 ending 단계 추출 결과.
  // 이번 턴 추출(parsedVars)이 비어도 과거 턴에 성공한 값을 살린다. (QA #13)
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

  // 역할(이름/설명)
  next.char1 = coalesce(next.char1, next.roles_char1, next.ending_char1);
  next.char2 = coalesce(next.char2, next.roles_char2, next.ending_char2);
  next.char3 = coalesce(next.char3, next.roles_char3, next.ending_char3);

  // 백엔드/프론트 키 혼재 방어: chardes* / charDes* 둘 다 채움
  next.chardes1 = coalesce(next.chardes1, next.roles_chardes1, next.ending_chardes1, next.charDes1);
  next.chardes2 = coalesce(next.chardes2, next.roles_chardes2, next.ending_chardes2, next.charDes2);
  next.chardes3 = coalesce(next.chardes3, next.roles_chardes3, next.ending_chardes3, next.charDes3);
  next.charDes1 = next.chardes1;
  next.charDes2 = next.chardes2;
  next.charDes3 = next.chardes3;

  // opening: 서버가 다양한 형태로 줄 수 있어 우선순위로 흡수
  // - opening은 "문장 배열"을 기대하지만, 여기서는 문자열/배열 모두 허용
  next.opening = coalesce(
    next.opening,
    next.opening_texts,
    next.ending_opening,
    next.opening_result
  );

  // 최종 멘트/선택지 라벨: ending 단계 추출에서만 나온다.
  // 템플릿 버튼 조건(agreeEnding && disagreeEnding && …)이 이번 턴 추출에만
  // 매달리지 않도록, BE context에 보존된 ending_ 값을 폴백으로 쓴다. (QA #13)
  next.agreeEnding = coalesce(next.agreeEnding, next.ending_agreeEnding);
  next.disagreeEnding = coalesce(next.disagreeEnding, next.ending_disagreeEnding);
  next.agree_label = coalesce(next.agree_label, next.ending_agree_label);
  next.disagree_label = coalesce(next.disagree_label, next.ending_disagree_label);

  return next;
}

// 모델이 상태 관리용으로 출력하는 내부 단계 라벨([수정 단계]/[확정 단계]).
// 프롬프트(v24~)가 이 라벨로 자기 상태를 추적하므로 히스토리에는 남기고,
// 교사에게 보이는 화면에서만 지운다. (QA #3)
function stripStageLabels(text) {
  if (typeof text !== "string") return text;
  return text
    .replace(/^[ \t]*\[(?:수정|확정) ?단계\][ \t]*\n?/gm, "")
    .replace(/^\n+/, "");
}

// '플립(자료)'는 내부 용어라 교사에게 낯설다. 모델 출력의 '- 플립자료:' 라벨은
// BE 추출·FE 파서(templateparsing.js)가 앵커로 쓰는 고정 문자열이므로 원문(히스토리·
// localStorage)에는 그대로 두고, 화면에 그릴 때만 바꿔 보여준다. (QA 8/15 #4)
function renameFlipTerms(text) {
  if (typeof text !== "string") return text;
  return text.replace(/📎?[ \t]*플립[ \t]*자료/g, "예상하지 못한 결과");
}

// 모델은 소제목(##)과 강조(**)를 섞어 답한다. 예전에는 저장 전에 이 기호들을
// 지웠는데(cleanMarkdown), 그러면 단계 구분이 사라져 한 덩어리 글로 보였다. (QA #8)
// 이제 원문 그대로 저장하고 화면에서만 서식으로 그린다.
// 히스토리·변수 추출은 영향받지 않는다 —
// 히스토리는 모델이 직접 쓴 원문을 그대로 되돌려받고,
// 변수 추출은 BE의 parsed_variables를 쓰기 때문에 화면 텍스트를 파싱하지 않는다.
const BOLD_RE = /\*\*([^*]+)\*\*/g;
const HEADING_RE = /^[ \t]*(#{1,6})[ \t]+(.*)$/;

// 모델이 볼드(**)를 넣었다 뺐다 해서 단계별로 소제목이 굵었다 얇았다 한다. (QA 8/15 #13)
// 마크다운 유무와 무관하게, 알려진 구획 표지는 FE가 항상 같은 서식으로 그린다.
// - 섹션 제목 줄(🎬/🎭/🎯/🌀): 줄 전체를 msg-heading으로
// - 라벨 줄("- 주제:", "✅ 선택지 1:", "-- 선택지1 최종선택:", "질문:" 등): 라벨만 strong으로
// 이미 **가 들어 있는 줄은 기존 인라인 볼드 경로가 처리하므로 건드리지 않는다.
// (라벨 정규식이 ** 문자를 라벨로 집어삼켜 리터럴 별표가 노출되는 회귀 방지)
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

// pre(white-space: pre-wrap) 안에서 그리므로 줄바꿈은 문자 그대로 넣는다.
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
  const [inputNotice, setInputNotice] = useState("");

  const bottomRef = useRef(null);
  const messagesRef = useRef(messages);
  const stepBoundariesRef = useRef({}); // step 진입 시점의 messages 길이(=해당 step 시작 경계)
  const lastUserTextRef = useRef("");
  const pendingNextStepRef = useRef(null); // { fromStep, toStep, retryText }
  const inputNoticeTimerRef = useRef(null);
  const inputRef = useRef(null);
  const [showTemplateButton, setShowTemplateButton] = useState(false);
  const [showOutPopup, setShowOutPopup] = useState(false);

  // 입력창은 한 줄 높이로 고정돼 있어서 아이디어를 길게 쓰면 자기가 쓴 글이
  // 안 보였다. 내용에 맞춰 늘리고, 상한을 넘으면 그때부터 스크롤한다. (QA #6)
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

  // step별로 "되돌아갔을 때 지워야 하는" 결과 키들 (context + localStorage 정리용)
  const STEP_CLEAR_CONFIG = useMemo(
    () => ({
      opening: {
        contextKeys: ["topic", "dilemma_topic"],
        storageKeys: ["topic", "dilemma_topic"],
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
        ],
        // 프론트에서 실제로 쓰는 localStorage 키(`charDes*`)도 같이 제거
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
    return () => {
      if (inputNoticeTimerRef.current) clearTimeout(inputNoticeTimerRef.current);
    };
  }, []);

  const showInputNotice = (message, durationMs = 2500) => {
    setInputNotice(message);
    if (inputNoticeTimerRef.current) clearTimeout(inputNoticeTimerRef.current);
    // durationMs가 0/음수/없음이면 "유저가 다시 입력/전송할 때까지" 유지
    if (!durationMs || durationMs <= 0) {
      inputNoticeTimerRef.current = null;
      return;
    }
    inputNoticeTimerRef.current = setTimeout(() => {
      setInputNotice("");
      inputNoticeTimerRef.current = null;
    }, durationMs);
  };

  // ✅ 채팅 페이지에서는 바깥(body) 스크롤을 막고, 채팅 영역만 스크롤되도록 고정
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
      "chat_session_id",
      // 이전 편집 세션의 게임 데이터/이미지 캐시 (새 챗봇 세션 시작 = 새 게임)
      "data", "creatorTitle", "url",
      "rolesBackground", "dilemma_sitation",
      "dilemma_image_1", "dilemma_image_3", "dilemma_image_4_1", "dilemma_image_4_2",
      "role_image_1", "role_image_2", "role_image_3",
      "dilemma_image_1_default_uploaded"
    ];
    
    keysToClear.forEach((k) => localStorage.removeItem(k));
    
    // context 상태 초기화
    setContext({});
    
    // 초기화 후 INIT 호출
    handleInit();
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
    keysToRemove.forEach((k) => {
      delete next[k];
    });
    return next;
  }

  function clearLocalStorageFromIndex(fromIdx) {
    // 되돌아가면 "그 단계부터 이후 결과"는 다시 생성해야 하므로 삭제
    for (let i = fromIdx; i < STEP_ORDER.length; i++) {
      const s = STEP_ORDER[i];
      const conf = STEP_CLEAR_CONFIG[s];
      (conf?.storageKeys || []).forEach((k) => localStorage.removeItem(k));
    }
    localStorage.removeItem("final_dilemma_payload");
  }

  async function handleInit(targetStep = step, options = {}) {
    try {
      setLoading(true);

      // step 진입 경계 기록 (INIT이 assistant 메시지를 추가하기 '직전' 길이)
      const boundary =
        typeof options.boundaryOverride === "number"
          ? options.boundaryOverride
          : messagesRef.current.length;
      stepBoundariesRef.current[targetStep] = boundary;

      const ctxToUse = options.contextOverride ?? context;

      // 🔥 수정: 백엔드 스키마에 맞게 payload 구성
      const payload = {
        session_id: sessionId,
        user_input: "__INIT__",
        step: targetStep,
        variable: buildVariable(targetStep, ctxToUse),
        context: ctxToUse
      };


      const res = await callChatbot(payload);
      

      const { text, newContext, parsedVars } = normalize(res);

      // 기존 메시지 유지 + assistant 추가
      // 서버 응답을 그대로 보여준다.
      // (ending 단계에서 응답을 FE 하드코딩 대본으로 갈아치우던 분기는 제거했다.
      //  화면과 실제 저장/발행 값이 어긋나 오염을 아무도 못 보던 원인이었다.)
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: text }
      ]);

      // context 업데이트 (한 번에 처리)
      if (options.contextOverride) {
        // backStep 등에서 "정리된 context"를 기준으로 업데이트해야 할 때
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

      // step 실제로 변경
      setStep(targetStep);

    } catch (e) {
      console.error("❌ INIT 실패:", e);
      const errorMsg = e?.response?.data?.detail || e?.message || "INIT 요청 실패";
      const status = e?.response?.status;

      // "다음 단계" 시도 직후 INIT에서 400이 터지면, 직전 유저 입력을 다시 보내도록 유도
      if (
        status === 400 &&
        pendingNextStepRef.current?.toStep === targetStep
      ) {
        const retryText = pendingNextStepRef.current?.retryText || "";
        // 안내문은 사라지지 않게(유저가 다시 전송할 때까지)
        showInputNotice("오류가 발생했습니다. 다시 입력해주세요", 0);
        if (retryText) setInput(retryText);
        setStep(pendingNextStepRef.current.fromStep);
        pendingNextStepRef.current = null;
        setError("");
        return;
      }

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
  // scrollIntoView()의 반환값이 useEffect cleanup으로 인식되는 문제를 방지
  // 일부 브라우저에서 Promise가 반환되며 발생하던 "is not a function" 흰 화면 오류를 해결
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // Markdown 제거
  const handleSend = async (userText) => {
    if (loading) return;
    setError("");
    setInputNotice("");

    const raw = (userText ?? input).trim();
    if (!raw) return;

    // "다음 단계" 요청은 여기서 가로채 바로 다음 방을 열지 않는다.
    // 이 말이 현재 단계 프롬프트에 도달해야 모델이 [확정 단계] 포맷을 내놓고,
    // 변수 추출이 읽을 대상이 생긴다. 이동은 응답을 받은 뒤에 한다.
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

      // step 변경 전에 context 검증
      if (next === "question" && !context.topic) {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "⚠️ 먼저 주제(topic)를 설정해주세요." }
        ]);
        setInput("");
        return;
      }

      advanceTo = next;

      // 다음 단계 INIT이 실패(400)하면 "직전 유저 입력"을 다시 보내야 하므로 미리 저장
      pendingNextStepRef.current = {
        fromStep: step,
        toStep: next,
        retryText: lastUserTextRef.current,
      };

      console.log("➡️ 다음 단계 요청:", { currentStep: step, next, context });
    }

    // 일반 메시지 처리
    const userMsg = raw;
    lastUserTextRef.current = userMsg;
    setMessages(prev => [
      ...prev,
      advanceTo
        ? { role: "user", content: userMsg, skipHistory: true }
        : { role: "user", content: userMsg }
    ]);
    setLoading(true);
    let preserveInput = false;

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

      const mergedForDisplay = normalizeContext({
        ...context,
        ...(newContext || {}),
        ...(parsedVars || {}),
      });

      // 서버 응답 출력
      // "다음 단계" 턴의 응답은 화면에 그리지 않는다.
      // 이 왕복은 모델이 [확정 단계] 포맷을 내놓게 해서 백엔드 변수 추출에
      // 읽을 대상을 주기 위한 것이고, 교사에게는 곧바로 뒤따르는 다음 단계
      // 안내만 보이면 된다. 그리면 한 턴에 두 번 말하는 것처럼 보인다.
      //
      // 배열에서 빼는 대신 표시만 끄는 이유:
      // - buildInputWithHistory는 skipHistory만 보므로 히스토리에는 그대로 남는다
      // - stepBoundariesRef가 messages 길이를 step 경계로 쓰므로(이전 단계 복귀에
      //   slice(0, boundary)를 쓴다) 인덱스가 밀리면 안 된다
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: text,
          hidden: !!advanceTo,
        }
      ]);

      // 🔥 수정: context 업데이트를 한 번에 처리
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
  // BE 추출(gpt-4o-mini)이 이 턴에 실패해 parsed_variables가 비어 와도,
  // 확정 포맷 텍스트가 화면에 있으면 FE 파서로 직접 읽어 "빈 필드만" 보강한다.
  // BE가 준 값은 절대 덮어쓰지 않는다. 파싱은 볼드(**)만 걷어낸 사본으로 하고
  // 원문(messages/히스토리)은 건드리지 않는다. (QA 8/15 #18 — 템플릿 버튼이 거의 안 나옴)
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
        // 파서는 charDes*(대문자)·choice*로 돌려주므로 BE 키 이름으로도 채워준다
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

      // 다음 턴에 모델이 확정 포맷 없이(🎬 없이) 답해도 버튼 조건이 유지되도록
      // 보강값을 FE context에도 남긴다. 여기서도 빈 필드만 채운다 —
      // BE가 이미 준 값이나 이후 턴의 새 추출값을 덮어쓰지 않는다.
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

      // 확정 응답을 받은 뒤에 다음 단계를 연다.
      // loading을 끄지 않고 이어서 호출해야 입력창이 깜빡이지 않는다.
      // (setMessages 반영을 기다려야 handleInit이 단계 경계를 제대로 잡는다)
      if (advanceTo) {
        await new Promise(resolve => setTimeout(resolve, 50));
        await handleInit(advanceTo);
      }

    } catch (err) {
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "요청 실패";

      console.error("❌ 요청 실패:", err);

      // 확정 요청이 실패했으면 단계를 넘기지 않는다
      if (advanceTo) pendingNextStepRef.current = null;

      // 400이면 "방금 입력한 메시지"를 인풋에 다시 채워서 재전송 UX 제공
      if (status === 400) {
        showInputNotice("오류가 발생했습니다. 다시 입력해주세요.", 2500);
        setInput(userMsg);
        preserveInput = true;
      }
      setError(msg);
      setMessages(prev => [...prev, { role: "assistant", content: `에러: ${msg}` }]);

    } finally {
      setLoading(false);
      // 400일 때는 재전송을 위해 input을 유지
      if (!preserveInput) setInput("");
    }
  };

  const handleBackStep = () => {
    if (loading) return;

    const idx = STEP_ORDER.indexOf(step);
    if (idx <= 0) return; // opening에서는 뒤로 불가

    const targetStep = STEP_ORDER[idx - 1];
    const targetIdx = idx - 1;

    // "해당 단계부터 이후" 결과를 삭제한 context로 되돌아가기
    const cleanedContext = pruneContextFromIndex(context, targetIdx);
    setContext(cleanedContext);
    clearLocalStorageFromIndex(targetIdx);

    // 엔딩에서 만들어진 버튼/상태는 뒤로가면 무조건 숨김
    setShowTemplateButton(false);
    setNextReady(false);
    setError("");
    setInput("");

    // 메시지는 targetStep 진입 경계까지 잘라냄 (targetStep에서 했던 대화/결과가 사라지는 효과)
    const boundary = stepBoundariesRef.current[targetStep];
    const trimmed =
      typeof boundary === "number"
        ? messagesRef.current.slice(0, boundary)
        : messagesRef.current.slice();

    // 사용자에게는 "이전단계"라고 보이게(표시용), 히스토리에는 포함되지 않게 처리
    const nextMessages = [
      ...trimmed,
      { role: "user", content: "이전단계", skipHistory: true },
    ];
    setMessages(nextMessages);

    setStep(targetStep);

    // 해당 step을 "새로 시작" (INIT 다시 호출해서 프롬프트/가이드 재생성)
    const boundaryOverride = nextMessages.length;
    setTimeout(() => {
      handleInit(targetStep, {
        contextOverride: cleanedContext,
        boundaryOverride,
      });
    }, 0);
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

    // 새 게임 데이터로 편집 도구 localStorage를 시드 — 이전 게임 data가 남아 편집 도구가 옛 내용을 보여주는 문제 방지
    localStorage.setItem("data", JSON.stringify(data));
    localStorage.setItem("creatorTitle", payload.title || "");

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
        return "예) 상황 추천해줘 / 확정해줘";
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
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100dvh",
          overflow: "hidden",
          overscrollBehavior: "none",
          backgroundColor: "#F2EEED",
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
            minHeight: 0,
            overflowY: "auto",
            overscrollBehavior: "contain",
            marginTop: 0,
            background: "#F2EEED",
            padding: "16px",
            paddingTop: "86px", // 헤더(약 70px) + 여백
            paddingBottom: "16px",
          }}
        >
          {messages
            .filter((m) => !m.hidden)
            .map((m, idx) => (
              <Bubble
                key={idx}
                role={m.role}
                text={
                  m.role === "assistant"
                    ? renameFlipTerms(stripStageLabels(m.content))
                    : m.content
                }
              />
            ))}

          {loading && <Bubble role="assistant" text="AI가 딜레마에 빠졌어요... 금방 답변을 가져올게요!" typing />}

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
            position: "relative",
            display: "flex",
            gap: "8px",
            // 입력창이 세로로 늘어나도 버튼은 44px을 유지하며 아래에 붙는다.
            alignItems: "flex-end",
          }}
        >
          {inputNotice && (
            <div
              style={{
                position: "absolute",
                left: 16,
                right: 16,
                top: -28,
                fontSize: 13,
                fontWeight: 600,
                color: "#b91c1c",
              }}
            >
              {inputNotice}
            </div>
          )}
          <textarea
            ref={inputRef}
            placeholder={placeholder}
            value={input}
            rows={1}
            style={{
              flex: 1,
              minWidth: 0,
              borderRadius: "8px",
              border: "1px solid #ccc",
              padding: "6px 8px",
              resize: "none",
              fontSize: "14px",
              lineHeight: 1.35,
              minHeight: "44px",
              maxHeight: `${INPUT_MAX_HEIGHT}px`,
              overflowY: "auto",
            }}
            onChange={(e) => {
              if (inputNotice) setInputNotice("");
              setInput(e.target.value);
            }}
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
            type="button"
            onClick={handleBackStep}
            disabled={loading || step === "opening"}
            aria-label="이전 단계로 돌아가기"
            style={{
              backgroundColor: "#fff",
              color: Colors.primary ?? "#f47b00",
              border: `1px solid ${Colors.primary ?? "#f47b00"}`,
              borderRadius: "6px",
              padding: "10px 16px",
              minHeight: "44px",
              fontSize: "15px",
              cursor: loading || step === "opening" ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            이전 단계
          </button>

          <button
            disabled={loading || !input.trim()}
            aria-label="보내기"
            style={{
              marginLeft: "0px",
              backgroundColor: Colors.primary ?? "#f47b00",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "10px 24px",
              minHeight: "44px",
              fontSize: "15px",
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
        <pre className="msg">{role === "assistant" ? renderMarkdownLite(text) : text}</pre>
      </div>
    </div>
  );
}

