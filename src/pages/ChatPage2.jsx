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

export default function ChatPage() {
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

  //초기 메시지 설정
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: "system", content: "세션 시작" }]);
      handleSend("__INIT__");
    }
  }, []);
  useEffect(() => {
    if (!step) return;
    if (step === "opening") return;
  
    // ✅ 이미 init 메시지가 있다면 중복 방지
    const hasInit = messages.some(m => m.role === "assistant" && m.content.includes("세션 시작"));
    if (hasInit) return;
  
    console.log(`[AUTO INIT] step changed to ${step}, sending __INIT__`);
    handleSend("__INIT__");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
  useEffect(() => {
    if (step !== "opening") return;
    if (messages.length === 0) return;
  
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== "assistant" || !lastMsg.content) return;
  
    const text = lastMsg.content.trim();
  
    // 🔍 "당신이 선택하신 주제는 ..." 문장이 포함되어 있을 때만 작동
    if (!text.includes("당신이 선택하신 주제는")) return;
  
    // ✅ 굵은 텍스트(**...**) 안의 주제 추출
    const boldMatch = text.match(/당신이 선택하신 주제는\s+\*\*(.+?)\*\*\s*입니다/);
    // ✅ 일반 텍스트 버전 대응 ("당신이 선택하신 주제는 AI 리더십입니다.")
    const plainMatch = text.match(/당신이 선택하신 주제는\s+(.+?)입니다/);
  
    let parsedTopic = null;
    if (boldMatch && boldMatch[1]) {
      parsedTopic = boldMatch[1].trim();
    } else if (plainMatch && plainMatch[1]) {
      parsedTopic = plainMatch[1].trim();
    }
  
    //  정확한 조건일 때만 context 저장 + 버튼 표시
    if (parsedTopic) {
      setContext(prev => ({ ...prev, topic: parsedTopic }));
      setNextReady(true);
    } else {
      setNextReady(false); // 다른 메시지일 때는 버튼 숨김
    }
  }, [messages, step]);
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
    // 줄바꿈 및 불필요한 공백 정리
    const clean = text.replace(/\r?\n+/g, "\n").trim();
  
    // Markdown 포함된 패턴 대응
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
    // 불필요한 줄바꿈 정리
    const clean = text.replace(/\r?\n+/g, "\n").trim();
  
    // "시나리오와 플립 상황을 결정했습니다." 이후의 내용만 추출
    const afterHeader = clean.split("시나리오와 플립 상황을 결정했습니다")[1]?.trim() || "";
  
    // 공통 패턴: 콜론(:)이 없고 줄바꿈으로 구분될 수도 있으므로, 다음 줄 내용을 가져오도록 처리
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
    // 1️⃣ 줄바꿈 / 마크다운 정리
    const clean = text
      .replace(/\r?\n+/g, "\n")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .trim();
  
    // 2️⃣ "역할을 결정했습니다" 또는 "할을 결정했습니다" 이후 텍스트 추출
    let afterHeader =
      clean.split(/(?:역할|할)을\s*결정했습니다\.?/)[1]?.trim() || clean;
  
    // 3️⃣ 안내 문구 제거
    afterHeader = afterHeader
      .replace(/이대로\s*확정해도[\s\S]*$/g, "")
      .trim();
  
    // 4️⃣ 역할 블록 분리 (번호 or dash 기반 구분)
    //    → "- 역할 1:", "역할 1:", "1. " 등 다양한 형태 지원
    const roleBlocks = afterHeader
    .split(/\n(?=(?:[-–—•]?\s*)?-?\s*역할\s*\d+[:：])/g)
    .filter(Boolean);
  
    const roles = {};
  
    roleBlocks.forEach((block, i) => {
      const trimmed = block.trim();
  
      // 이름 (역할명)
      const nameMatch =
        trimmed.match(/역할\s*\d+\s*[:：]\s*(.+?)(?:\n|$)/) ||
        trimmed.match(/[-–—•]?\s*([^:\n]+?)\s*(?:\n|$)/);
      const name = nameMatch ? nameMatch[1].trim() : "";
  
      // 설명
      const descMatch = trimmed.match(/배경\s*설명[:：]?\s*([\s\S]+)/);
      const description = descMatch ? descMatch[1].trim() : "";
  
      roles[`role${i + 1}`] = { name, description };
    });
  
    console.log("🎭 rolesParsing structured:", roles);
    return roles;
  }

  async function handleSend(userText) {
    if (loading) return;
    setError("");
  
    const raw = (userText ?? input).trim(); // 입력값 정리
    const isInit = raw === "__INIT__";
  
    //  사용자가 "다음단계" 또는 "다음 단계"를 입력했을 때 바로 다음으로 이동
    if (/^다음\s*단계$/.test(raw)) {   // 공백 허용
      setMessages(prev => [...prev, { role: "user", content: raw }]);
      setNextReady(false);
  
      // 🔁 현재 단계가 ORDER 배열 안에 있을 때만 이동
      setStep(prev => {
        const idx = ORDER.indexOf(prev);
        if (idx >= 0 && idx < ORDER.length - 1) {
          return ORDER[idx + 1];
        }
        return prev;
      });
  
      setInput("");
      return; // ✅ API 호출하지 않음
    }
  
    setLoading(true);
    try {
      const inputWithHistory = buildInputWithHistory(messages, raw, isInit);
  
      if (!isInit && raw) {
        setMessages(prev => [...prev, { role: "user", content: raw }]);
      }
  
      let prompt = PROMPTS[step];
      let payload;
  
      if (step === "opening") {
        payload = {
          step: "opening",
          input: inputWithHistory,
          context,
          prompt: { id: prompt.id, version: prompt.version },
        };
      } else if (step === "dilemma") {
        payload = {
          step: "dilemma",
          input: inputWithHistory,
          context,
          prompt: {
            id: prompt.id,
            version: prompt.version,
            variables: { topic: context.topic },
          },
        };
      }else if (step === "flip") {
        payload = {
          step: "flip",
          input: inputWithHistory,
          context,
          prompt: {
            id: prompt.id,
            version: prompt.version,
            variables: {
              question: context.question,
              choice1: context.choice1,
              choice2: context.choice2,
            },
          },
        };
      }
      else if (step === "roles") {
        payload = {
          step: "roles",
          input: inputWithHistory,
          context,
          prompt: {
            id: prompt.id,
            version: prompt.version,
            variables: { structure: JSON.stringify(context.structure) }, // JSON 문자열로 전달
          },
        };
      }
      else if (step === "ending") {
        payload = {
          step: "ending",
          input: inputWithHistory,
          context,
          prompt: {
            id: prompt.id,
            version: prompt.version,
            variables: {
              structure: JSON.stringify(context.structure),
              roles: JSON.stringify(context.roles),
            },
          },
        };
      }
       else {
        payload = {
          step,
          input: inputWithHistory,
          context,
          prompt: { id: prompt.id, version: prompt.version },
        };
      }
  
      const res = await callChatbot(payload);
      const { text, nextStep, newContext } = normalize(res);
      const cleanText = cleanMarkdown(text);
      setMessages(prev => [...prev, { role: "assistant", content: cleanText || "(빈 응답)" }]);

      if (step === "dilemma" && text.includes("딜레마 질문과 선택지를 결정했습니다")) {
        const parsed = parseDilemmaResponse(text);
        if (parsed) {
          setContext(prev => ({
            ...prev,
            topic: parsed.topic,
            question: parsed.question,
            choice1: parsed.choice1, // "선택지1"
            choice2: parsed.choice2, // "선택지2"
          }));
          setNextReady(true); // 다음 단계 버튼 표시
        }
      }
      // ✅ flip 단계 파싱
        if (step === "flip" && text.includes("시나리오와 플립 상황을 결정했습니다")) {
          const parsed = parseFlipResponse(text);
          if (parsed) {
            setContext(prev => ({
              ...prev,
              structure: parsed, // 구조 전체 저장
            }));
            setNextReady(true);
          }
        }
      if (step === "roles" && text.includes("역할을 결정했습니다")) {
        const parsedRoles = parseRolesResponse(text);
        if (parsedRoles) {
          setContext(prev => ({ ...prev, roles: parsedRoles }));
          setNextReady(true);
        }
      }
      // Ending 단계 감지
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
  // 템플릿 생성 → /custom-games POST 후 /create01 이동
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
      setContext(prev => ({ ...prev, topic: openingText }));
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
  
      {/* ✅ 템플릿 생성 버튼 */}
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
  
      {/* ✅ 입력창 */}
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
      inset: 0,                        // top/right/bottom/left: 0
      background: 'rgba(0,0,0,0.35)',  // 반투명 배경
      display: 'grid',
      placeItems: 'center',            // 가운데 정렬
      zIndex: 10000                    // 헤더(100)보다 확실히 높게
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ pointerEvents: 'auto' }} // 내부 클릭은 유지
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
