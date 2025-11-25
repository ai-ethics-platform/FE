// --- ChatPage2.jsx (최종 완성본) -------------------------------------

import React, { useEffect, useMemo, useRef, useState } from "react";
import { callChatbot } from "../api/axiosInstance";
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
function buildVariable(step, context) {
  if (step === "opening") return null;

  if (step === "dilemma") {
    return context.topic ?? null;
  }

  if (step === "flip") {
    return {
      question: context.question,
      choice1: context.choice1,
      choice2: context.choice2,
    };
  }

  if (step === "roles") {
    return context.structure ?? null;
  }

  if (step === "ending") {
    return {
      structure: context.structure,
      role: context.role,
    };
  }

  return null;
}


export default function ChatPage2() {
  const navigate = useNavigateSafe();

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

  const bottomRef = useRef(null);
  const [showTemplateButton, setShowTemplateButton] = useState(false);
  const [showOutPopup, setShowOutPopup] = useState(false);

  // --- INIT 호출 ----------------------------------------------------------
  useEffect(() => {
    handleInit();
  }, []);
async function handleInit(targetStep = step) {
  try {
    setLoading(true);

    // 🔥 1) 단계별 variable 생성
    let variable = null;

    if (targetStep === "dilemma") {
      variable = context.topic ?? null;
    } 
    else if (targetStep === "flip") {
      variable = {
        question: context.question,
        choice1: context.choice1,
        choice2: context.choice2,
      };
    }
    else if (targetStep === "roles") {
      variable = context.structure ?? null;
    }
    else if (targetStep === "ending") {
      variable = {
        structure: context.structure,
        role: context.role,
      };
    }

    // 🔥 2) INIT payload
    const payload = {
      session_id: sessionId,
      user_input: "__INIT__",
      step: targetStep,
      variable: buildVariable(targetStep, context),
      context
    };

    const res = await callChatbot(payload);
    const { text, newContext, parsedVars } = normalize(res);

    // 🔥 3) 기존 메시지 유지 + assistant 추가
    setMessages(prev => [
      ...prev,
      { role: "assistant", content: cleanMarkdown(text) }
    ]);

    // 🔥 4) context merge
    setContext(prev => ({
      ...prev,
      ...(newContext || {}),
      ...(parsedVars || {})
    }));

    // 🔥 5) step 실제로 변경
    setStep(targetStep);

  } catch (e) {
    console.error("INIT 실패:", e);
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
      "char1",
      "char2",
      "char3",
      "charDes1",
      "charDes2",
      "charDes3",
      "dilemma_situation",
      "question",
      "choice1",
      "choice2",
      "flips_agree_texts",
      "flips_disagree_texts",
      "agreeEnding",
      "disagreeEnding",
      "code",
      "url",
    ];
    keysToClear.forEach((k) => localStorage.removeItem(k));
  };

  window.addEventListener("beforeunload", clearOnReload);

  return () => {
    window.removeEventListener("beforeunload", clearOnReload);
  };
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


  if (raw === "다음 단계") {
      setMessages(prev => [...prev, { role: "user", content: raw }]);
    let variable = null;

    if (step === "opening") {
      variable = context.topic ?? null;
    } else if (step === "dilemma") {
      variable = {
        question: context.question,
        choice1: context.choice1,
        choice2: context.choice2,
      };
    } else if (step === "flip") {
      variable = context.structure ?? null;
    } else if (step === "roles") {
      variable = context.role ?? null;
    } else if (step === "ending") {
      variable = {
        structure: context.structure,
        role: context.role,
      };
    }

    // step advance
    const order = ["opening", "dilemma", "flip", "roles", "ending"];
    const idx = order.indexOf(step);
    const next = idx < order.length - 1 ? order[idx + 1] : step;
    setStep(next);


    // INIT(next)
    setTimeout(() => {
      handleInit(next);
    }, 50);

    setInput("");
    return;
  }

  const userMsg = raw;
  setMessages(prev => [...prev, { role: "user", content: userMsg }]);
  setLoading(true);

  try {
    const inputWithHistory = buildInputWithHistory(
      messages,
      userMsg,
      userMsg === "__INIT__"
    );

    const payload = {
      session_id: sessionId,
      step,
      user_input: inputWithHistory,
      variable: buildVariable(step, context),
      context: { ...context }
    };

    const res = await callChatbot(payload);
    const { text, newContext, parsedVars } = normalize(res);

    // 서버 응답 출력
    setMessages(prev => [
      ...prev,
      { role: "assistant", content: cleanMarkdown(text) }
    ]);

    // parsedVars → context 저장
    if (parsedVars && Object.keys(parsedVars).length > 0) {
      setContext(prev => ({
        ...prev,
        ...parsedVars
      }));
    }

    // newContext → context 저장
    if (newContext) {
      setContext(prev => ({
        ...prev,
        ...newContext
      }));
    }

// ⑤ ENDING 단계 처리
if (step === "ending") {
  // 서버에서 내려주는 원문 text
  const finalText = text;

  // 1) 딜레마 전체 텍스트 파싱 → opening / roles / situation / label / flip / ending 구분
  const parsed = parseDilemmaText(finalText);

  // 2) localStorage 저장
  persistParsedToLocalStorage(finalText);

  // 3) 디버그용 출력
  console.log("🎬 최종 초안 파싱 완료 — 저장된 값들:");
  console.log("opening:", localStorage.getItem("opening"));
  console.log("char1:", localStorage.getItem("char1"));
  console.log("charDes1:", localStorage.getItem("charDes1"));
  console.log("char2:", localStorage.getItem("char2"));
  console.log("charDes2:", localStorage.getItem("charDes2"));
  console.log("char3:", localStorage.getItem("char3"));
  console.log("charDes3:", localStorage.getItem("charDes3"));
  console.log("dilemma_situation:", localStorage.getItem("dilemma_situation"));
  console.log("question:", localStorage.getItem("question"));
  console.log("agree_label:", localStorage.getItem("agree_label"));
  console.log("disagree_label:", localStorage.getItem("disagree_label"));
  console.log("flips_agree_texts:", localStorage.getItem("flips_agree_texts"));
  console.log("flips_disagree_texts:", localStorage.getItem("flips_disagree_texts"));
  console.log("agreeEnding:", localStorage.getItem("agreeEnding"));
  console.log("disagreeEnding:", localStorage.getItem("disagreeEnding"));

  // 4) 템플릿 생성 버튼 표시 여부
  if (
    finalText.includes("이대로 초안을 완성하고 싶다면 템플릿 생성 버튼을 눌러주세요") ||
    finalText.includes("초안으로 확정하시겠습니까")
  ) {
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

    setError(msg);
    setMessages(prev => [...prev, { role: "assistant", content: `에러: ${msg}` }]);

  } finally {
    setLoading(false);
    setInput("");
  }
};


  const readJSON = (key, fallback = []) => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : fallback;
    } catch {
      return fallback;
    }
  };

  const handleTemplateCreate = async () => {
    try {
      const teacher_name = localStorage.getItem("teacher_name") || "-";
      const teacher_school = localStorage.getItem("teacher_school") || "-";
      const teacher_email = localStorage.getItem("teacher_email") || "---";

      const opening = readJSON("opening", []);
      const char1 = localStorage.getItem("char1") || "-";
      const char2 = localStorage.getItem("char2") || "-";
      const char3 = localStorage.getItem("char3") || "-";
      const charDes1 = localStorage.getItem("charDes1") || "-";
      const charDes2 = localStorage.getItem("charDes2") || "-";
      const charDes3 = localStorage.getItem("charDes3") || "-";
      const dilemma_situation = readJSON("dilemma_situation", ["-"]);
      const question = localStorage.getItem("question") || "-";
      const choice1 = localStorage.getItem("choice1") || "-";
      const choice2 = localStorage.getItem("choice2") || "-";
      const flips_agree_texts = readJSON("flips_agree_texts", ["-"]);
      const flips_disagree_texts = readJSON("flips_disagree_texts", ["-"]);
      const agreeEnding = localStorage.getItem("agreeEnding") || "-";
      const disagreeEnding = localStorage.getItem("disagreeEnding") || "-";

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

      if (code) localStorage.setItem("code", code);
      if (gameUrl) localStorage.setItem("url", gameUrl);

      navigate("/create00");
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
      case "dilemma":
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

function useNavigateSafe() {
  try {
    const { useNavigate } = require("react-router-dom");
    return useNavigate();
  } catch {
    return () => {};
  }
}
