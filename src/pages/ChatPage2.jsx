// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { callChatbot } from "../api/axiosInstance";
// import { PROMPTS } from "../components/prompts";
// import { useNavigate } from 'react-router-dom';
// import "../components/chat.css"; 
// import { persistParsedToLocalStorage } from '../utils/templateparsing';
// import axiosInstance from '../api/axiosInstance';
// import { Colors } from "../components/styleConstants";
// import HeaderBar from '../components/Expanded/HeaderBar3';
// import DilemmaOutPopup from '../components/DilemmaOutPopup'; 

// const STORAGE_KEY = "dilemma.flow.v1";
// const ORDER = ["opening", "dilemma", "flip", "roles", "ending"];

// const HISTORY_LIMIT = 5;
// function buildInputWithHistory(msgs, raw, isInit, limit = HISTORY_LIMIT) {
//   const recent = msgs.filter(m => m.role !== "system").slice(-limit);
//   const lines = recent.map(m => `${m.role}: ${m.content}`);
//   if (!isInit && raw) lines.push(`user: ${raw}`);
//   return lines.join("\n");
// }

// export default function ChatPage2() {
//   const navigate = useNavigate();
//   const [step, setStep] = useState("opening");
//   const [context, setContext] = useState({});
//   const [messages, setMessages] = useState([]); 
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false); 
//   const [error, setError] = useState("");
//   const bottomRef = useRef(null);
//   const [nextReady, setNextReady] = useState(false);
//   const [showTemplateButton, setShowTemplateButton] = useState(false);
//   const [showOutPopup, setShowOutPopup] = useState(false); 
  
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
//   useEffect(() => {
//     // ✅ 완전 초기화: 새로고침 시 이전 세션 정보 제거
//     const clearOnReload = () => {
//       console.log("🔄 새로고침 감지 → 세션 초기화 중...");
  
//       // 저장된 딜레마 진행 데이터 제거
//       localStorage.removeItem(STORAGE_KEY);
  
//       // templateparsing 결과 변수들 모두 제거
//       const keysToClear = [
//         'opening', 'char1', 'char2', 'char3',
//         'charDes1', 'charDes2', 'charDes3',
//         'dilemma_situation', 'question',
//         'choice1', 'choice2',
//         'flips_agree_texts', 'flips_disagree_texts',
//         'agreeEnding', 'disagreeEnding',
//         'code', 'url'
//       ];
//       keysToClear.forEach(k => localStorage.removeItem(k));
//     };
  
//     //  페이지 새로고침 시마다 실행
//     window.addEventListener('beforeunload', clearOnReload);
  
//     //  첫 진입 시에도 기존 데이터 제거 
//     clearOnReload();
  
//     return () => {
//       window.removeEventListener('beforeunload', clearOnReload);
//     };
//   }, []);

//   // 자동 저장
//   useEffect(() => {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, context, messages }));
//   }, [step, context, messages]);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, loading]);

//   //초기 메시지 설정
//   useEffect(() => {
//     if (messages.length === 0) {
//       setMessages([{ role: "system", content: "세션 시작" }]);
//       handleSend("__INIT__");
//     }
//   }, []);
//   useEffect(() => {
//     if (!step) return;
//     if (step === "opening") return;
  
//     const hasInit = messages.some(m => m.role === "assistant" && m.content.includes("세션 시작"));
//     if (hasInit) return;
//       handleSend("__INIT__");
//   }, [step]);
//   useEffect(() => {
//     if (step !== "opening") return;
//     if (messages.length === 0) return;
  
//     const lastMsg = messages[messages.length - 1];
//     if (lastMsg.role !== "assistant" || !lastMsg.content) return;
  
//     const text = lastMsg.content.trim();
  
//     if (!text.includes("당신이 선택하신 주제는")) return;
  
//     const boldMatch = text.match(/당신이 선택하신 주제는\s+\*\*(.+?)\*\*\s*입니다/);
//     const plainMatch = text.match(/당신이 선택하신 주제는\s+(.+?)입니다/);
  
//     let parsedTopic = null;
//     if (boldMatch && boldMatch[1]) {
//       parsedTopic = boldMatch[1].trim();
//     } else if (plainMatch && plainMatch[1]) {
//       parsedTopic = plainMatch[1].trim();
//     }
  
//     if (parsedTopic) {
//       setContext(prev => ({ ...prev, topic: parsedTopic }));
//       setNextReady(true);
//     } else {
//       setNextReady(false); 
//     }
//   }, [messages, step]);
//    const placeholder = useMemo(() => {
//     switch (step) {
//       case "opening": return "예) 주제 추천해줘 / AI 판사로 하자";
//       case "dilemma": return "예) 그 갈등으로 예/아니오 질문 만들어줘";
//       case "roles": return "예) 역할 자동 생성해줘 / 확정해줘";
//       case "flip": return "예) 상황/플립 추천해줘 / 확정해줘";
//       case "ending": return "예) 초안 제작해줘 / 확정";
//       default: return "메시지를 입력하세요";
//     }
//   }, [step]);
//   const readJSON = (key, fallback = []) => {
//     try {
//       const s = localStorage.getItem(key);
//       return s ? JSON.parse(s) : fallback;
//     } catch {
//       return fallback;
//     }
//   };
//   function normalize(res) {
//     const text =
//       res?.text ??             
//       res?.output ??           
//       res?.message ??          
//       "";
  
//     const nextStep = res?.next?.step ?? res?.step ?? null;
//     const newContext = res?.context ?? null;
//     const raw = res?.raw ?? null;
  
//     return { text, nextStep, newContext, raw };
//   }
//   function cleanMarkdown(text) {
//     if (!text) return "";
  
//     return text
//       // Markdown 헤더 (##, ### 등)
//       .replace(/^#{1,6}\s*/gm, "")
//       // 볼드/이탤릭 표시 제거 (**text**, *text*)
//       .replace(/\*\*(.*?)\*\*/g, "$1")
//       .replace(/\*(.*?)\*/g, "$1")
//       .replace(/__(.*?)__/g, "$1")
//       .replace(/_(.*?)_/g, "$1")
//   }
//   function parseDilemmaResponse(text) {
//     const clean = text.replace(/\r?\n+/g, "\n").trim();
  
//     const topicMatch = clean.match(/[-–—]?\s*\**주제\**\s*[:：]\s*(.+)/);
//     const questionMatch = clean.match(/[-–—]?\s*\**질문\**\s*[:：]\s*(.+)/);
//     const choice1Match = clean.match(/[-–—]?\s*\**선택지\s*1\**\s*[:：]\s*(.+)/);
//     const choice2Match = clean.match(/[-–—]?\s*\**선택지\s*2\**\s*[:：]\s*(.+)/);
  
//     const topic = topicMatch ? topicMatch[1].trim() : null;
//     const question = questionMatch ? questionMatch[1].trim() : null;
//     const choice1 = choice1Match ? choice1Match[1].trim() : null;
//     const choice2 = choice2Match ? choice2Match[1].trim() : null;
  
//     console.log("dilemmaparsingtopic:", topic);
//     console.log("dilemmaparsingquestion:", question);
//     console.log("dilemmaparsingchoice1:", choice1);
//     console.log("dilemmaparsingchoice2:", choice2);
  
//     if (topic && question && choice1 && choice2) {
//       return { topic, question, choice1, choice2 };
//     }
//     return null;
//   }
//   function parseFlipResponse(text) {
//     const clean = text.replace(/\r?\n+/g, "\n").trim();
  
//     const afterHeader = clean.split("시나리오와 플립 상황을 결정했습니다")[1]?.trim() || "";
  
//     const scenarioMatch = afterHeader.match(/상황\s*시나리오[:：]?\s*\n?(.+?)(?=\n\s*질문|$)/s);
//     const questionMatch = afterHeader.match(/질문[:：]?\s*\n?(.+?)(?=\n\s*[-–—]?\s*선택지\s*1|$)/s);
  
//     const choice1Block = afterHeader.match(/[-–—]?\s*선택지\s*1[:：]?\s*\n?(.+?)(?=\n\s*[—]?\s*선택지\s*2|$)/s);
//     const choice2Block = afterHeader.match(/[-–—]?\s*선택지\s*2[:：]?\s*\n?(.+)/s);
  
//     // 선택지1 내부 세부
//     const choice1LabelMatch = choice1Block ? choice1Block[1].match(/^([^()]+)\((.*?)\)/m) : null;
//     const choice1DescMatch = choice1Block ? choice1Block[1].match(/\((.*?)\)\.?$/m) : null;
//     const flip1Match = choice1Block ? choice1Block[1].match(/플립자료[:：]?\s*\n?(.+)/s) : null;
  
//     // 선택지2 내부 세부
//     const choice2LabelMatch = choice2Block ? choice2Block[1].match(/^([^()]+)\((.*?)\)/m) : null;
//     const choice2DescMatch = choice2Block ? choice2Block[1].match(/\((.*?)\)\.?$/m) : null;
//     const flip2Match = choice2Block ? choice2Block[1].match(/플립자료[:：]?\s*\n?(.+)/s) : null;
  
//     // 구조 정리
//     const structure = {
//       scenario: scenarioMatch ? scenarioMatch[1].trim() : null,
//       question: questionMatch ? questionMatch[1].trim() : null,
//       choice1: {
//         label: choice1LabelMatch ? choice1LabelMatch[1].trim() : null,
//         description: choice1DescMatch ? choice1DescMatch[1].trim() : null,
//         flip: flip1Match ? flip1Match[1].trim() : null,
//       },
//       choice2: {
//         label: choice2LabelMatch ? choice2LabelMatch[1].trim() : null,
//         description: choice2DescMatch ? choice2DescMatch[1].trim() : null,
//         flip: flip2Match ? flip2Match[1].trim() : null,
//       },
//     };
  
//     console.log("🧩 flipParsing result:", structure);
//     return structure;
//   }
//   function parseRolesResponse(text) {
//     const clean = text
//       .replace(/\r?\n+/g, "\n")
//       .replace(/\*\*(.*?)\*\*/g, "$1")
//       .trim();
  
//     let afterHeader =
//       clean.split(/(?:역할|할)을\s*결정했습니다\.?/)[1]?.trim() || clean;
  
//     afterHeader = afterHeader
//       .replace(/이대로\s*확정해도[\s\S]*$/g, "")
//       .trim();
//       const roleBlocks = afterHeader
//     .split(/\n(?=(?:[-–—•]?\s*)?-?\s*역할\s*\d+[:：])/g)
//     .filter(Boolean);
  
//     const roles = {};
  
//     roleBlocks.forEach((block, i) => {
//       const trimmed = block.trim();
  
      
//       const nameMatch =
//         trimmed.match(/역할\s*\d+\s*[:：]\s*(.+?)(?:\n|$)/) ||
//         trimmed.match(/[-–—•]?\s*([^:\n]+?)\s*(?:\n|$)/);
//       const name = nameMatch ? nameMatch[1].trim() : "";
  
    
//       const descMatch = trimmed.match(/배경\s*설명[:：]?\s*([\s\S]+)/);
//       const description = descMatch ? descMatch[1].trim() : "";
  
//       roles[`role${i + 1}`] = { name, description };
//     });
  
//     console.log("🎭 rolesParsing structured:", roles);
//     return roles;
//   }

//   async function handleSend(userText) {
//     if (loading) return;
//     setError("");
  
//     const raw = (userText ?? input).trim(); 
//     const isInit = raw === "__INIT__";
  
//     if (/^다음\s*단계$/.test(raw)) {   // 공백 허용
//       setMessages(prev => [...prev, { role: "user", content: raw }]);
//       setNextReady(false);
  
//       setStep(prev => {
//         const idx = ORDER.indexOf(prev);
//         if (idx >= 0 && idx < ORDER.length - 1) {
//           return ORDER[idx + 1];
//         }
//         return prev;
//       });
  
//       setInput("");
//       return; 
//     }
  
//     setLoading(true);
//     try {
//       const inputWithHistory = buildInputWithHistory(messages, raw, isInit);
  
//       if (!isInit && raw) {
//         setMessages(prev => [...prev, { role: "user", content: raw }]);
//       }
  
//       let prompt = PROMPTS[step];
//       let payload;
  
//       if (step === "opening") {
//         payload = {
//           step: "opening",
//           input: inputWithHistory,
//           context,
//           prompt: { id: prompt.id, version: prompt.version },
//         };
//       } else if (step === "dilemma") {
//         payload = {
//           step: "dilemma",
//           input: inputWithHistory,
//           context,
//           prompt: {
//             id: prompt.id,
//             version: prompt.version,
//             variables: { topic: context.topic },
//           },
//         };
//       }else if (step === "flip") {
//         payload = {
//           step: "flip",
//           input: inputWithHistory,
//           context,
//           prompt: {
//             id: prompt.id,
//             version: prompt.version,
//             variables: {
//               question: context.question,
//               choice1: context.choice1,
//               choice2: context.choice2,
//             },
//           },
//         };
//       }
//       else if (step === "roles") {
//         payload = {
//           step: "roles",
//           input: inputWithHistory,
//           context,
//           prompt: {
//             id: prompt.id,
//             version: prompt.version,
//             variables: { structure: JSON.stringify(context.structure) },
//           },
//         };
//       }
//       else if (step === "ending") {
//         payload = {
//           step: "ending",
//           input: inputWithHistory,
//           context,
//           prompt: {
//             id: prompt.id,
//             version: prompt.version,
//             variables: {
//               structure: JSON.stringify(context.structure),
//               roles: JSON.stringify(context.roles),
//             },
//           },
//         };
//       }
//        else {
//         payload = {
//           step,
//           input: inputWithHistory,
//           context,
//           prompt: { id: prompt.id, version: prompt.version },
//         };
//       }
  
//       const res = await callChatbot(payload);
//       const { text, nextStep, newContext } = normalize(res);
//       const cleanText = cleanMarkdown(text);
//       setMessages(prev => [...prev, { role: "assistant", content: cleanText || "(빈 응답)" }]);

//       if (step === "dilemma" && text.includes("딜레마 질문과 선택지를 결정했습니다")) {
//         const parsed = parseDilemmaResponse(text);
//         if (parsed) {
//           setContext(prev => ({
//             ...prev,
//             topic: parsed.topic,
//             question: parsed.question,
//             choice1: parsed.choice1, 
//             choice2: parsed.choice2, 
//           }));
//           setNextReady(true); 
//         }
//       }
//         if (step === "flip" && text.includes("시나리오와 플립 상황을 결정했습니다")) {
//           const parsed = parseFlipResponse(text);
//           if (parsed) {
//             setContext(prev => ({
//               ...prev,
//               structure: parsed, 
//             }));
//             setNextReady(true);
//           }
//         }
//       if (step === "roles" && text.includes("역할을 결정했습니다")) {
//         const parsedRoles = parseRolesResponse(text);
//         if (parsedRoles) {
//           setContext(prev => ({ ...prev, roles: parsedRoles }));
//           setNextReady(true);
//         }
//       }
//         if (
//           step === "ending" &&
//           text.includes("최종 초안을 작성해드리겠습니다")
//         ) {
//           persistParsedToLocalStorage(text);
//           console.log("최종 템플릿 로컬 값들 ");

//           console.log(localStorage.getItem('opening'));
//           console.log(localStorage.getItem('char1'));
//           console.log(localStorage.getItem('charDes1'));

//           console.log(localStorage.getItem('char2'));
//           console.log(localStorage.getItem('charDes2'));

//           console.log(localStorage.getItem('char3'));
//           console.log(localStorage.getItem('charDes3'));

//           console.log(localStorage.getItem('dilemma_situation'));
//           console.log(localStorage.getItem('question'));

//           console.log(localStorage.getItem('agree_label'));

//           console.log(localStorage.getItem('disagree_label'));
//           console.log(localStorage.getItem('flips_agree_texts'));
//           console.log(localStorage.getItem('flips_disagree_texts'));

//           console.log(localStorage.getItem('agreeEnding'));
//           console.log(localStorage.getItem('disagreeEnding'));

//           if (text.includes("이대로 초안을 완성하고 싶다면 템플릿 생성 버튼을 눌러주세요")) {
//           setShowTemplateButton(true);
//         } else {
//           setShowTemplateButton(false);
//         }

//         setNextReady(true);
//         }
//       if (newContext && typeof newContext === "object") setContext(newContext);
  
//       if (nextStep && ORDER.includes(nextStep)) {
//         setStep(nextStep);
//       } else {
//         advanceStep();
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
//     setStep(prev => {
//       const idx = ORDER.indexOf(prev);
//       return idx >= 0 && idx < ORDER.length - 1 ? ORDER[idx + 1] : prev;
//     });
//   }
//   const handleTemplateCreate = async () => {
//     try {
//       const teacher_name = localStorage.getItem('teacher_name') || '-';
//       const teacher_school = localStorage.getItem('teacher_school') || '-';
//       const teacher_email = localStorage.getItem('teacher_email') || '---';

//       const opening = readJSON('opening', []);
//       const char1 = localStorage.getItem('char1') || '-';
//       const char2 = localStorage.getItem('char2') || '-';
//       const char3 = localStorage.getItem('char3') || '-';
//       const charDes1 = localStorage.getItem('charDes1') || '-';
//       const charDes2 = localStorage.getItem('charDes2') || '-';
//       const charDes3 = localStorage.getItem('charDes3') || '-';
//       const dilemma_situation = readJSON('dilemma_situation', ['-']);
//       const question = localStorage.getItem('question') || '-';
//       const choice1 = localStorage.getItem('choice1') || '-';
//       const choice2 = localStorage.getItem('choice2') || '-';
//       const flips_agree_texts = readJSON('flips_agree_texts', ['-']);
//       const flips_disagree_texts = readJSON('flips_disagree_texts', ['-']);
//       const agreeEnding = localStorage.getItem('agreeEnding') || '-';
//       const disagreeEnding = localStorage.getItem('disagreeEnding') || '-';

//       const representativeImages = {
//         dilemma_image_1:  '',
//         dilemma_image_3:  '',
//         dilemma_image_4_1: '',
//         dilemma_image_4_2:  '',
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
//         rolesBackground: '',
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
//         ...(Object.keys(representativeImages).length ? { representativeImages } : {}),
//       };

//       const payload = {
//         teacher_name,
//         teacher_school,
//         teacher_email,
//         title: '제목을 입력하세요',
//         representative_image_url: '-',
//         data,
//       };

//       const { data: res } = await axiosInstance.post('/custom-games', payload, {
//         headers: { 'Content-Type': 'application/json' },
//       });

//       const code = res?.code ?? null;
//       const gameUrl = res?.url ?? null;
//       if (code) localStorage.setItem('code', code);
//       if (gameUrl) localStorage.setItem('url', gameUrl);
//       navigate('/create00');
//     } catch (e) {
//       console.error('템플릿 생성 실패:', e);
//       alert('템플릿 생성 중 문제가 발생했습니다.');
//     }
//   };
//   useEffect(() => {
//     if (step !== "opening") return;

//     const lastMessage = messages[messages.length - 1];
//     if (!lastMessage) return;

//     if (lastMessage.role === "assistant" && lastMessage.content.includes("주제가 확정되었습니다")) {
//       const openingText = lastMessage.content.split("주제가 확정되었습니다")[1].trim();
//       setContext(prev => ({ ...prev, topic: openingText }));
//       localStorage.setItem("openingText", openingText);
//       setStep("opening");
//     }
//   }, [messages, step]);

//   return (
//     <>
//     <div
//       className="chat-wrap"
//       style={{
//         backgroundColor: Colors.creatorgrey01,
//         minHeight: "100vh",
//         inset: 0,
//         display: "flex",
//         flexDirection: "column",
//       }}
//     >
//       <HeaderBar
//         nextDisabled={true}
//         onLeftClick={() => setShowOutPopup(true)}  
//         style={{
//           position: 'fixed',
//           top: 0,
//           zIndex:100,
//         }}
//       />
  
//       {/*  채팅 영역 */}
//       <section
//         className="chat-body"
//         aria-live="polite"
//         style={{
//           flex: 1,
//           overflowY: "auto",
//           paddingTop: "8px",
//           paddingBottom: "80px", // 입력창 공간 확보
//         }}
//       >
//         {messages.map((m, idx) => (
//           <Bubble key={idx} role={m.role} text={m.content} />
//         ))}
  
//         {loading && <Bubble role="assistant" text="메시지 입력 중…" typing />}
  
//         <div ref={bottomRef} />
//       </section>
  
//       {/* 오류 표시 */}
//       {error && <div className="error">{error}</div>}
  
//       {/* 템플릿 생성 버튼 */}
//       {showTemplateButton && (
//         <div className="template-btn-container">
//           <button
//             className="template-btn"
//             onClick={(e) => {
//               e.preventDefault();
//               handleTemplateCreate();
//               setShowTemplateButton(false);
//             }}
//           >
//             템플릿 생성
//           </button>
//         </div>
//       )}
  
//       {/* 입력창 */}
//       <form
//         className="chat-input"
//         onSubmit={(e) => {
//           e.preventDefault();
//           if (input.trim().length === 0) return;
//           handleSend(input);
//         }}
//         style={{
//           background: "#fff",
//           borderTop: "1px solid #ddd",
//           padding: "8px 16px",
//           position: "sticky",
//           bottom: 0,
//         }}
//       >
//         <textarea
//           placeholder={placeholder}
//           value={input}
//           style={{
//             width: "94%",
//             borderRadius: "8px",
//             border: "1px solid #ccc",
//             padding: "8px",
//             resize: "none",
//           }}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.isComposing || e.nativeEvent.isComposing) return;
//             if (e.key === "Enter" && !e.shiftKey) {
//               e.preventDefault();
//               if (loading) return;
//               const v = input.trim();
//               if (!v) return;
//               handleSend(v);
//             }
//           }}
//           disabled={loading}
//         />
//         <button
//           disabled={loading || input.trim().length === 0}
//           aria-label="보내기"
//           style={{
//             marginLeft: "0px",
//             backgroundColor: Colors.primary ?? "#f47b00",
//             color: "#fff",
//             border: "none",
//             borderRadius: "6px",
//             padding: "8px 20px",
//             cursor: "pointer",
//           }}
//         >
//           보내기
//         </button>
//       </form>
//     </div>
//     {showOutPopup && (
//   <div
//     role="dialog"
//     aria-modal="true"
//     onClick={() => setShowOutPopup(false)}
//     style={{
//       position: 'fixed',
//       inset: 0,                        
//       background: 'rgba(0,0,0,0.35)',  
//       display: 'grid',
//       placeItems: 'center',            
//       zIndex: 10000                    
//     }}
//   >
//     <div
//       onClick={(e) => e.stopPropagation()}
//       style={{ pointerEvents: 'auto' }} 
//     >
//       <DilemmaOutPopup
//         onClose={() => setShowOutPopup(false)}
//         onLogout={() => {
//           setShowOutPopup(false);
//           navigate('/selectroom');
//         }}
//       />
//     </div>
//   </div>
// )}

//     </>
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

import React, { useEffect, useMemo, useRef, useState } from "react";
import { callChatbot } from "../api/axiosInstance";
import { PROMPTS } from "../components/prompts";
import { useNavigate } from 'react-router-dom';
import "../components/chat.css"; 
import { persistParsedToLocalStorage } from '../utils/templateparsing';
import axiosInstance from '../api/axiosInstance';
import { Colors } from "../components/styleConstants";
import HeaderBar from '../components/Expanded/HeaderBar3';
import DilemmaOutPopup from '../components/DilemmaOutPopup'; 

const STORAGE_KEY = "dilemma.flow.v1";
const ORDER = ["opening", "dilemma", "flip", "roles", "ending"];

const HISTORY_LIMIT = 5;
function buildInputWithHistory(msgs, raw, isInit, limit = HISTORY_LIMIT) {
  const recent = msgs.filter(m => m.role !== "system").slice(-limit);
  const lines = recent.map(m => `${m.role}: ${m.content}`);
  if (!isInit && raw) lines.push(`user: ${raw}`);
  return lines.join("\n");
}

export default function ChatPage2() {
  const navigate = useNavigate();
  const [step, setStep] = useState("opening");
  const [context, setContext] = useState({});
  const [messages, setMessages] = useState([]); 
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const [nextReady, setNextReady] = useState(false);
  const [showTemplateButton, setShowTemplateButton] = useState(false);
  const [showOutPopup, setShowOutPopup] = useState(false); 
const [tempContext, setTempContext] = useState({});
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
  useEffect(() => {
    // ✅ 완전 초기화: 새로고침 시 이전 세션 정보 제거
    const clearOnReload = () => {
      console.log("🔄 새로고침 감지 → 세션 초기화 중...");
  
      // 저장된 딜레마 진행 데이터 제거
      localStorage.removeItem(STORAGE_KEY);
  
      // templateparsing 결과 변수들 모두 제거
      const keysToClear = [
        'opening', 'char1', 'char2', 'char3',
        'charDes1', 'charDes2', 'charDes3',
        'dilemma_situation', 'question',
        'choice1', 'choice2',
        'flips_agree_texts', 'flips_disagree_texts',
        'agreeEnding', 'disagreeEnding',
        'code', 'url'
      ];
      keysToClear.forEach(k => localStorage.removeItem(k));
    };
  
    //  페이지 새로고침 시마다 실행
    window.addEventListener('beforeunload', clearOnReload);
  
    //  첫 진입 시에도 기존 데이터 제거 
    clearOnReload();
  
    return () => {
      window.removeEventListener('beforeunload', clearOnReload);
    };
  }, []);

  // 자동 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, context, messages }));
  }, [step, context, messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  //초기 메시지 설정
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: "system", content: "세션 시작" }]);
      handleSend("시작");
    }
  }, []);
  useEffect(() => {
    if (!step) return;
    if (step === "opening") return;
  
    const hasInit = messages.some(m => m.role === "assistant" && m.content.includes("세션 시작"));
    if (hasInit) return;
      handleSend("시작");
  }, [step]);
  // 🧩 OPENING 단계: 주제 파싱
useEffect(() => {
  if (step !== "opening") return;
  if (messages.length === 0) return;

  const lastMsg = messages[messages.length - 1];
  if (lastMsg.role !== "assistant" || !lastMsg.content) return;

  const text = lastMsg.content.trim();
  if (!text.includes("당신이 선택하신 주제는")) return;

  const boldMatch = text.match(/당신이 선택하신 주제는\s+\*\*(.+?)\*\*\s*입니다/);
  const plainMatch = text.match(/당신이 선택하신 주제는\s+(.+?)입니다/);
  const parsedTopic = (boldMatch?.[1] || plainMatch?.[1] || "").trim();

  if (parsedTopic) {
    setTempContext(prev => ({ ...prev, topic: parsedTopic }));
    setNextReady(true);
  } else {
    setNextReady(false);
  }
}, [messages, step]);

// 🧩 DILEMMA 단계: 질문/선택지 파싱
useEffect(() => {
  if (step !== "dilemma") return;
  if (messages.length === 0) return;

  const lastMsg = messages[messages.length - 1];
  if (lastMsg.role !== "assistant" || !lastMsg.content) return;

  const text = lastMsg.content.trim();
  if (!text.includes("딜레마 질문과 선택지를 결정했습니다")) return;

  const parsed = parseDilemmaResponse(text);
  if (parsed) {
    setTempContext(prev => ({
      ...prev,
      topic: parsed.topic ?? prev.topic,
      question: parsed.question,
      choice1: parsed.choice1,
      choice2: parsed.choice2,
    }));
    setNextReady(true);
  }
}, [messages, step]);

// 🧩 FLIP 단계: 시나리오/플립 파싱
useEffect(() => {
  if (step !== "flip") return;
  if (messages.length === 0) return;

  const lastMsg = messages[messages.length - 1];
  if (lastMsg.role !== "assistant" || !lastMsg.content) return;

  const text = lastMsg.content.trim();
  if (!text.includes("시나리오와 플립 상황을 결정했습니다")) return;

  const parsed = parseFlipResponse(text);
  if (parsed) {
    setTempContext(prev => ({ ...prev, structure: parsed }));
    setNextReady(true);
  }
}, [messages, step]);

// 🧩 ROLES 단계: 역할 파싱
useEffect(() => {
  if (step !== "roles") return;
  if (messages.length === 0) return;

  const lastMsg = messages[messages.length - 1];
  if (lastMsg.role !== "assistant" || !lastMsg.content) return;

  const text = lastMsg.content.trim();
  if (!text.includes("역할을 결정했습니다")) return;

  const parsedRoles = parseRolesResponse(text);
  if (parsedRoles) {
    setTempContext(prev => ({
      ...prev,
      roles: parsedRoles,
      structure: prev.structure ?? context.structure,
    }));
    setNextReady(true);
  }
}, [messages, step]);

// 🧩 ENDING 단계: 최종 초안 파싱
useEffect(() => {
  if (step !== "ending") return;
  if (messages.length === 0) return;

  const lastMsg = messages[messages.length - 1];
  if (lastMsg.role !== "assistant" || !lastMsg.content) return;

  const text = lastMsg.content.trim();
  if (!text.includes("최종 초안을 작성해드리겠습니다")) return;

  persistParsedToLocalStorage(text);

  if (text.includes("이대로 초안을 완성하고 싶다면 템플릿 생성 버튼을 눌러주세요")) {
    setShowTemplateButton(true);
  } else {
    setShowTemplateButton(false);
  }

  setNextReady(true);
}, [messages, step]);
  useEffect(() => {
    if (Object.keys(tempContext).length > 0) {
      setContext(prev => ({ ...prev, ...tempContext }));
      setTempContext({});
    }
  }, [tempContext]);
   const placeholder = useMemo(() => {
    switch (step) {
      case "opening": return "예) 주제 추천해줘 / AI 판사로 하자";
      case "dilemma": return "예) 그 갈등으로 예/아니오 질문 만들어줘";
      case "roles": return "예) 역할 자동 생성해줘 / 확정해줘";
      case "flip": return "예) 상황/플립 추천해줘 / 확정해줘";
      case "ending": return "예) 초안 제작해줘 / 확정";
      default: return "메시지를 입력하세요";
    }
  }, [step]);
  const readJSON = (key, fallback = []) => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : fallback;
    } catch {
      return fallback;
    }
  };
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
  function cleanMarkdown(text) {
    if (!text) return "";
  
    return text
      // Markdown 헤더 (##, ### 등)
      .replace(/^#{1,6}\s*/gm, "")
      // 볼드/이탤릭 표시 제거 (**text**, *text*)
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/_(.*?)_/g, "$1")
  }
  function parseDilemmaResponse(text) {
    const clean = text.replace(/\r?\n+/g, "\n").trim();
  
    const topicMatch = clean.match(/[-–—]?\s*\**주제\**\s*[:：]\s*(.+)/);
    const questionMatch = clean.match(/[-–—]?\s*\**질문\**\s*[:：]\s*(.+)/);
    const choice1Match = clean.match(/[-–—]?\s*\**선택지\s*1\**\s*[:：]\s*(.+)/);
    const choice2Match = clean.match(/[-–—]?\s*\**선택지\s*2\**\s*[:：]\s*(.+)/);
  
    const topic = topicMatch ? topicMatch[1].trim() : null;
    const question = questionMatch ? questionMatch[1].trim() : null;
    const choice1 = choice1Match ? choice1Match[1].trim() : null;
    const choice2 = choice2Match ? choice2Match[1].trim() : null;
  
    console.log("dilemmaparsingtopic:", topic);
    console.log("dilemmaparsingquestion:", question);
    console.log("dilemmaparsingchoice1:", choice1);
    console.log("dilemmaparsingchoice2:", choice2);
  
    if (topic && question && choice1 && choice2) {
      return { topic, question, choice1, choice2 };
    }
    return null;
  }
  function parseFlipResponse(text) {
    const clean = text.replace(/\r?\n+/g, "\n").trim();
  
    const afterHeader = clean.split("시나리오와 플립 상황을 결정했습니다")[1]?.trim() || "";
  
    const scenarioMatch = afterHeader.match(/상황\s*시나리오[:：]?\s*\n?(.+?)(?=\n\s*질문|$)/s);
    const questionMatch = afterHeader.match(/질문[:：]?\s*\n?(.+?)(?=\n\s*[-–—]?\s*선택지\s*1|$)/s);
  
    const choice1Block = afterHeader.match(/[-–—]?\s*선택지\s*1[:：]?\s*\n?(.+?)(?=\n\s*[—]?\s*선택지\s*2|$)/s);
    const choice2Block = afterHeader.match(/[-–—]?\s*선택지\s*2[:：]?\s*\n?(.+)/s);
  
    // 선택지1 내부 세부
    const choice1LabelMatch = choice1Block ? choice1Block[1].match(/^([^()]+)\((.*?)\)/m) : null;
    const choice1DescMatch = choice1Block ? choice1Block[1].match(/\((.*?)\)\.?$/m) : null;
    const flip1Match = choice1Block ? choice1Block[1].match(/플립자료[:：]?\s*\n?(.+)/s) : null;
  
    // 선택지2 내부 세부
    const choice2LabelMatch = choice2Block ? choice2Block[1].match(/^([^()]+)\((.*?)\)/m) : null;
    const choice2DescMatch = choice2Block ? choice2Block[1].match(/\((.*?)\)\.?$/m) : null;
    const flip2Match = choice2Block ? choice2Block[1].match(/플립자료[:：]?\s*\n?(.+)/s) : null;
  
    // 구조 정리
    const structure = {
      scenario: scenarioMatch ? scenarioMatch[1].trim() : null,
      question: questionMatch ? questionMatch[1].trim() : null,
      choice1: {
        label: choice1LabelMatch ? choice1LabelMatch[1].trim() : null,
        description: choice1DescMatch ? choice1DescMatch[1].trim() : null,
        flip: flip1Match ? flip1Match[1].trim() : null,
      },
      choice2: {
        label: choice2LabelMatch ? choice2LabelMatch[1].trim() : null,
        description: choice2DescMatch ? choice2DescMatch[1].trim() : null,
        flip: flip2Match ? flip2Match[1].trim() : null,
      },
    };
  
    console.log("🧩 flipParsing result:", structure);
    return structure;
  }
  function parseRolesResponse(text) {
    const clean = text
      .replace(/\r?\n+/g, "\n")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .trim();
  
    let afterHeader =
      clean.split(/(?:역할|할)을\s*결정했습니다\.?/)[1]?.trim() || clean;
  
    afterHeader = afterHeader
      .replace(/이대로\s*확정해도[\s\S]*$/g, "")
      .trim();
      const roleBlocks = afterHeader
    .split(/\n(?=(?:[-–—•]?\s*)?-?\s*역할\s*\d+[:：])/g)
    .filter(Boolean);
  
    const roles = {};
  
    roleBlocks.forEach((block, i) => {
      const trimmed = block.trim();
  
      
      const nameMatch =
        trimmed.match(/역할\s*\d+\s*[:：]\s*(.+?)(?:\n|$)/) ||
        trimmed.match(/[-–—•]?\s*([^:\n]+?)\s*(?:\n|$)/);
      const name = nameMatch ? nameMatch[1].trim() : "";
  
    
      const descMatch = trimmed.match(/배경\s*설명[:：]?\s*([\s\S]+)/);
      const description = descMatch ? descMatch[1].trim() : "";
  
      roles[`role${i + 1}`] = { name, description };
    });
  
    console.log("🎭 rolesParsing structured:", roles);
    return roles;
  }
// ✅ [추가] 단계별 prompt variables 가드 함수
function getVariables(step, ctx) {
  if (step === "dilemma") {
    return ctx.topic ? { topic: ctx.topic } : undefined;
  }
  if (step === "flip") {
    if (ctx.question && ctx.choice1 && ctx.choice2) {
      return { question: ctx.question, choice1: ctx.choice1, choice2: ctx.choice2 };
    }
    return undefined;
  }
  if (step === "roles") {
    return ctx.structure ? { structure: JSON.stringify(ctx.structure) } : undefined;
  }
  if (step === "ending") {
    if (ctx.structure && ctx.roles) {
      return { structure: JSON.stringify(ctx.structure), roles: JSON.stringify(ctx.roles) };
    }
    return undefined;
  }
  // opening 포함: variables 없음
  return undefined;
}
  async function handleSend(userText) {
    if (loading) return;
    setError("");
  
    const raw = (userText ?? input).trim(); 
    const isInit = raw === "시작";
    if (/^다음\s*단계$/.test(raw)) {
      setMessages(prev => [...prev, { role: "user", content: raw }]);
      setNextReady(false);
    
      // ✅ tempContext도 강제로 병합
      setContext(prev => ({
        ...prev,
        ...tempContext,
      }));
      setTempContext({});
    
      await new Promise(resolve => setTimeout(resolve, 0));
    
      setStep(prev => {
        const idx = ORDER.indexOf(prev);
        if (idx >= 0 && idx < ORDER.length - 1) {
          return ORDER[idx + 1];
        }
        return prev;
      });
    
      setInput("");
      return;
    }
    setLoading(true);
    try {
      const inputWithHistory = buildInputWithHistory(messages, raw, isInit);
  
      if (!isInit && raw) {
        setMessages(prev => [...prev, { role: "user", content: raw }]);
      }
      const prompt = PROMPTS[step];
      const vars = getVariables(step, context);

      let payload = {
        step,
        input: inputWithHistory,
        context:{},
        prompt: {
          id: prompt.id,
          version: prompt.version,
          ...(vars ? { variables: vars } : {}), // ✅ 없으면 포함 안 됨
        },
      };
      const res = await callChatbot(payload);
      const { text, nextStep, newContext } = normalize(res);
      const cleanText = cleanMarkdown(text);
      setMessages(prev => [...prev, { role: "assistant", content: cleanText || "(빈 응답)" }]);

      if (step === "dilemma" && text.includes("딜레마 질문과 선택지를 결정했습니다")) {
        const parsed = parseDilemmaResponse(text);
        if (parsed) {
          setTempContext(parsed);
          setNextReady(true); 
        }
      }
      if (step === "flip" && text.includes("시나리오와 플립 상황을 결정했습니다")) {
        const parsed = parseFlipResponse(text);
        if (parsed) {
          setTempContext({ structure: parsed });  // ✅ 임시 저장
          setNextReady(true);
        }
      }
      
      if (step === "roles" && text.includes("역할을 결정했습니다")) {
        const parsedRoles = parseRolesResponse(text);
        if (parsedRoles) {
          setTempContext({ roles: parsedRoles }); // ✅ 임시 저장
          setNextReady(true);
        }
      }
        if (
          step === "ending" &&
          text.includes("최종 초안을 작성해드리겠습니다")
        ) {
          persistParsedToLocalStorage(text);
          console.log("최종 템플릿 로컬 값들 ");

          console.log(localStorage.getItem('opening'));
          console.log(localStorage.getItem('char1'));
          console.log(localStorage.getItem('charDes1'));

          console.log(localStorage.getItem('char2'));
          console.log(localStorage.getItem('charDes2'));

          console.log(localStorage.getItem('char3'));
          console.log(localStorage.getItem('charDes3'));

          console.log(localStorage.getItem('dilemma_situation'));
          console.log(localStorage.getItem('question'));

          console.log(localStorage.getItem('agree_label'));

          console.log(localStorage.getItem('disagree_label'));
          console.log(localStorage.getItem('flips_agree_texts'));
          console.log(localStorage.getItem('flips_disagree_texts'));

          console.log(localStorage.getItem('agreeEnding'));
          console.log(localStorage.getItem('disagreeEnding'));

          if (text.includes("이대로 초안을 완성하고 싶다면 템플릿 생성 버튼을 눌러주세요")) {
          setShowTemplateButton(true);
        } else {
          setShowTemplateButton(false);
        }

        setNextReady(true);
        }
      if (newContext && typeof newContext === "object") setContext(newContext);
  
      if (nextStep && ORDER.includes(nextStep)) {
        setContext(prev => ({ ...prev, ...tempContext }));
        setTempContext({});
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
    setContext(tempContext); // 🔥 완전 덮어쓰기 (이전 context는 버림)
    setTempContext({}); // ✅ 병합 후 초기화
  
    setStep(prev => {
      const idx = ORDER.indexOf(prev);
      return idx >= 0 && idx < ORDER.length - 1 ? ORDER[idx + 1] : prev;
    });
  }
  const handleTemplateCreate = async () => {
    try {
      const teacher_name = localStorage.getItem('teacher_name') || '-';
      const teacher_school = localStorage.getItem('teacher_school') || '-';
      const teacher_email = localStorage.getItem('teacher_email') || '---';

      const opening = readJSON('opening', []);
      const char1 = localStorage.getItem('char1') || '-';
      const char2 = localStorage.getItem('char2') || '-';
      const char3 = localStorage.getItem('char3') || '-';
      const charDes1 = localStorage.getItem('charDes1') || '-';
      const charDes2 = localStorage.getItem('charDes2') || '-';
      const charDes3 = localStorage.getItem('charDes3') || '-';
      const dilemma_situation = readJSON('dilemma_situation', ['-']);
      const question = localStorage.getItem('question') || '-';
      const choice1 = localStorage.getItem('choice1') || '-';
      const choice2 = localStorage.getItem('choice2') || '-';
      const flips_agree_texts = readJSON('flips_agree_texts', ['-']);
      const flips_disagree_texts = readJSON('flips_disagree_texts', ['-']);
      const agreeEnding = localStorage.getItem('agreeEnding') || '-';
      const disagreeEnding = localStorage.getItem('disagreeEnding') || '-';

      const representativeImages = {
        dilemma_image_1:  '',
        dilemma_image_3:  '',
        dilemma_image_4_1: '',
        dilemma_image_4_2:  '',
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
        rolesBackground: '',
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
        ...(Object.keys(representativeImages).length ? { representativeImages } : {}),
      };

      const payload = {
        teacher_name,
        teacher_school,
        teacher_email,
        title: '제목을 입력하세요',
        representative_image_url: '-',
        data,
      };

      const { data: res } = await axiosInstance.post('/custom-games', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      const code = res?.code ?? null;
      const gameUrl = res?.url ?? null;
      if (code) localStorage.setItem('code', code);
      if (gameUrl) localStorage.setItem('url', gameUrl);
      navigate('/create00');
    } catch (e) {
      console.error('템플릿 생성 실패:', e);
      alert('템플릿 생성 중 문제가 발생했습니다.');
    }
  };
  useEffect(() => {
    if (step !== "opening") return;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;
  
    if (lastMessage.role === "assistant" && lastMessage.content.includes("주제가 확정되었습니다")) {
      const openingText = lastMessage.content.split("주제가 확정되었습니다")[1].trim();
      setTempContext({ topic: openingText }); // ✅ context 말고 tempContext로!
      localStorage.setItem("openingText", openingText);
      setStep("opening");
    }
  }, [messages, step]);
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
          position: 'fixed',
          top: 0,
          zIndex:100,
        }}
      />
  
      {/*  채팅 영역 */}
      <section
        className="chat-body"
        aria-live="polite"
        style={{
          flex: 1,
          overflowY: "auto",
          paddingTop: "8px",
          paddingBottom: "80px", // 입력창 공간 확보
        }}
      >
        {messages.map((m, idx) => (
          <Bubble key={idx} role={m.role} text={m.content} />
        ))}
  
        {loading && <Bubble role="assistant" text="메시지 입력 중…" typing />}
  
        <div ref={bottomRef} />
      </section>
  
      {/* 오류 표시 */}
      {error && <div className="error">{error}</div>}
  
      {/* 템플릿 생성 버튼 */}
      {showTemplateButton && (
        <div className="template-btn-container">
          <button
            className="template-btn"
            onClick={(e) => {
              e.preventDefault();
              handleTemplateCreate();
              setShowTemplateButton(false);
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
          if (input.trim().length === 0) return;
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
              if (loading) return;
              const v = input.trim();
              if (!v) return;
              handleSend(v);
            }
          }}
          disabled={loading}
        />
        <button
          disabled={loading || input.trim().length === 0}
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
      position: 'fixed',
      inset: 0,                        
      background: 'rgba(0,0,0,0.35)',  
      display: 'grid',
      placeItems: 'center',            
      zIndex: 10000                    
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ pointerEvents: 'auto' }} 
    >
      <DilemmaOutPopup
        onClose={() => setShowOutPopup(false)}
        onLogout={() => {
          setShowOutPopup(false);
          navigate('/selectroom');
        }}
      />
    </div>
  </div>
)}

    </>
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

