import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { callChatbot } from "../api/axiosInstance";
import "../components/chat.css"; 
import axiosInstance from "../api/axiosInstance";
const STORAGE_KEY = "dilemma.flow.v1";

// ---------------------- 파싱 유틸 (교체) ----------------------
function parseDilemmaText(text) {
  const result = {};

  const splitSentences = (block) => {
    if (!block) return [];
    const matches = block.match(/[^.!?\n]+[.!?]/g);
    if (matches) return matches.map(s => s.trim()).filter(Boolean);
    return block.split(/\n+/).map(s => s.trim()).filter(Boolean);
  };

  // 공통: 섹션 헤더/경계에 '### ' 같은 마크다운 헤더 허용
  const sec = (letter) => new RegExp(`${letter}\\.`, "u");
  const hdr = (letter) => new RegExp(`(?:^|\\n)\\s*(?:#{1,6}\\s*)?${letter}\\.`, "u");
  const nextHdr = `\\n\\s*(?:#{1,6}\\s*)?[A-F]\\.`; // lookahead용

  // A. 오프닝
  const openingMatch = text.match(new RegExp(
    String.raw`(?:^|\n)\s*(?:#{1,6}\s*)?A\.\s*(?:🎬\s*)?오프닝 멘트\s+([\s\S]*?)(?=${nextHdr})`
  , "u"));
  result.opening = openingMatch ? openingMatch[1].trim() : "";

  // B. 역할 > 캐릭터 이름
  const charMatches = [...text.matchAll(/(?:^|\n)\s*\d+\.\s*\*\*(.*?)\*\*/gu)];
  result.char1 = charMatches[0]?.[1]?.trim() ?? "";
  result.char2 = charMatches[1]?.[1]?.trim() ?? "";
  result.char3 = charMatches[2]?.[1]?.trim() ?? "";

  // B. 역할 > 캐릭터 설명(상황:)  — 앞의 하이픈/대시 허용
  const charDesMatches = [...text.matchAll(
    /[-–]?\s*상황:\s*([\s\S]*?)(?=\n\s*\d+\.\s+\*\*|(?:\n\s*(?:#{1,6}\s*)?[A-F]\.)|(?:\n\s*){2,}|$)/gu
  )];
  result.charDes1 = charDesMatches[0]?.[1]?.trim() ?? "";
  result.charDes2 = charDesMatches[1]?.[1]?.trim() ?? "";
  result.charDes3 = charDesMatches[2]?.[1]?.trim() ?? "";

  // C. 상황 및 딜레마 질문
  const dilemmaMatch = text.match(new RegExp(
    String.raw`(?:^|\n)\s*(?:#{1,6}\s*)?C\.\s*(?:🎯\s*)?상황 및 딜레마 질문\s+([\s\S]*?)(?=${nextHdr})`
  , "u"));
  if (dilemmaMatch) {
    const block = dilemmaMatch[1].trim();
    const qMatch = block.match(/질문:\s*([^\n]+)/u);
    result.question = qMatch ? qMatch[1].trim() : "";
    const withoutQ = block.replace(/질문:\s*[^\n]+/u, "").trim();
    result.dilemma_situation = splitSentences(withoutQ);
  } else {
    result.question = "";
    result.dilemma_situation = [];
  }

  // D/E. 선택지 제목 (공백 허용)
  const choice1Match = text.match(/(?:^|\n)\s*(?:#{1,6}\s*)?D\.\s*✅?\s*선택지\s*1\s*:\s*([^\n]+)/u);
  const choice2Match = text.match(/(?:^|\n)\s*(?:#{1,6}\s*)?E\.\s*✅?\s*선택지\s*2\s*:\s*([^\n]+)/u);
  result.choice1 = choice1Match ? choice1Match[1].trim() : "";
  result.choice2 = choice2Match ? choice2Match[1].trim() : "";

  // D/E. 플립자료 — 다음 섹션 헤더(### X.)까지
  const flipsAgreeMatch = text.match(new RegExp(
    String.raw`(?:^|\n)\s*(?:#{1,6}\s*)?D\.\s*✅?\s*선택지\s*1\s*:([\s\S]*?)📎\s*플립자료:\s*([\s\S]*?)(?=${nextHdr}|$)`
  , "u"));
  const flipsDisagreeMatch = text.match(new RegExp(
    String.raw`(?:^|\n)\s*(?:#{1,6}\s*)?E\.\s*✅?\s*선택지\s*2\s*:([\s\S]*?)📎\s*플립자료:\s*([\s\S]*?)(?=${nextHdr}|$)`
  , "u"));

  result.flips_agree_texts = flipsAgreeMatch ? splitSentences(flipsAgreeMatch[2]) : [];
  result.flips_disagree_texts = flipsDisagreeMatch ? splitSentences(flipsDisagreeMatch[2]) : [];

  // F. 최종 멘트 — “선택지 1 최종선택”/“선택지1 최종선택” 모두 허용
  const agreeEndingMatch = text.match(/선택지\s*1\s*최종선택:\s*[“"']([\s\S]*?)[”"']/u);
  const disagreeEndingMatch = text.match(/선택지\s*2\s*최종선택:\s*[“"']([\s\S]*?)[”"']/u);
  result.agreeEnding = agreeEndingMatch ? agreeEndingMatch[1].trim() : "";
  result.disagreeEnding = disagreeEndingMatch ? disagreeEndingMatch[1].trim() : "";

  return result;
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]); 
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState("");
  const [context, setContext] = useState({});  
  const [showButton, setShowButton] = useState(false);
  const bottomRef = useRef(null);
  const navigate = useNavigate();

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
      handleSend("__INIT__");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const placeholder = "메시지를 입력하세요";

  function normalize(res) {
    const text =
      res?.text ?? res?.output ?? res?.message ?? "";
    const newContext = res?.context ?? null; 
    return { text, newContext };
  }

  // ---- 응답 텍스트를 파싱해서 localStorage에 저장 ----
  function persistParsedToLocalStorage(text) {
    try {
      const parsed = parseDilemmaText(text);

      // 요청하신 키 이름으로 저장 (배열은 JSON)
      localStorage.setItem("opening", parsed.opening);
      localStorage.setItem("char1", parsed.char1 || "");
      localStorage.setItem("char2", parsed.char2 || "");
      localStorage.setItem("char3", parsed.char3 || "");
      localStorage.setItem("charDes1", parsed.charDes1 || "");
      localStorage.setItem("charDes2", parsed.charDes2 || "");
      localStorage.setItem("charDes3", parsed.charDes3 || "");
      localStorage.setItem("dilemma_situation", JSON.stringify(parsed.dilemma_situation || []));
      localStorage.setItem("question", parsed.question || "");
      localStorage.setItem("choice1", parsed.choice1 || "");
      localStorage.setItem("choice2", parsed.choice2 || "");
      localStorage.setItem("flips_agree_texts", JSON.stringify(parsed.flips_agree_texts || []));
      localStorage.setItem("flips_disagree_texts", JSON.stringify(parsed.flips_disagree_texts || [])); // ← 통일
      localStorage.setItem("agreeEnding", parsed.agreeEnding || "");
      localStorage.setItem("disagreeEnding", parsed.disagreeEnding || "");
    } catch (e) {
      console.error("파싱/저장 실패:", e);
    }
  }

  async function handleSend(userText) {
    if (loading) return;
    setError("");

    const raw = (userText ?? input).trim();
    const isInit = raw === "__INIT__";

    if (!isInit && raw) {
      setMessages(prev => [...prev, { role: "user", content: raw }]);
    }

    setLoading(true);

    try {
      // 최근 메시지 1개(바로 직전)만 컨텍스트로 사용
      const recentMessages = messages.slice(-5);
      const conversationHistory = recentMessages.map(m => `${m.role}: ${m.content}`).join("\n");
      const inputWithHistory = `${conversationHistory}\n${raw}`;

      const prompt = {
        id: "pmpt_68c19d5fe3d48193859772e8883a28d20b3f0cca51ff5a73",
        version: "10",
        messages: [
          { role: "system", content: "당신은 한국어를 사용하는 교사들이 AI 윤리 딜레마 기반의 대화형 수업 게임을 설계할 수 있도록 돕는 티칭 어시스턴트 챗봇입니다." },
          ...recentMessages,
        ],
      };

      const payload = {
        input: inputWithHistory,
        context,
        prompt: {
          id: prompt.id,
          version: prompt.version,
          messages: [
            { role: "system", content: "당신은 한국어를 사용하는 교사들이 AI 윤리 딜레마 기반의 대화형 수업 게임을 설계할 수 있도록 돕는 티칭 어시스턴트 챗봇입니다." },
            ...recentMessages,
          ],
        },
      };

      const res = await callChatbot(payload);
      const { text, newContext } = normalize(res);

      setMessages(prev => [...prev, { role: "assistant", content: text || "(빈 응답)" }]);

      // 응답에 템플릿 완료 문구가 있든 없든, 파싱해서 저장 (항상 최신 상태 유지)
      persistParsedToLocalStorage(text);

      // 버튼 노출 조건
      if (text.includes("템플릿 생성")) {
        setShowButton(true);
        localStorage.setItem("template", text);
      }

      if (newContext && typeof newContext === "object") {
        setContext(newContext);
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
    setContext({});
    localStorage.removeItem(STORAGE_KEY);

    // 파싱 결과도 초기화하고 싶으면 아래 키들도 삭제
    [
      "opening","char1","char2","char3","charDes1","charDes2","charDes3",
      "dilemma_situation","question","choice1","choice2",
      "flips_agree_texts","flips_disagree_texts","agreeEnding","disagreeEnding","template"
    ].forEach(k => localStorage.removeItem(k));

    setTimeout(() => handleSend("__INIT__"), 50);
  }

  
  const handleTemplateCreate = async () => {

    try {
      // 로컬에서 읽기
      const teacher_name = localStorage.getItem("teacher_name") || "-";
      const teacher_school = localStorage.getItem("teacher_school") || "-";
      const teacher_email = localStorage.getItem("teacher_email") || "---";
  
      // 로컬에 저장된 게임 데이터 불러오기
      const opening = localStorage.getItem("opening") || "-";
      const char1 = localStorage.getItem("char1") || "-";
      const char2 = localStorage.getItem("char2") || "-";
      const char3 = localStorage.getItem("char3") || "-";
      const charDes1 = localStorage.getItem("charDes1") || "-";
      const charDes2 = localStorage.getItem("charDes2") || "-";
      const charDes3 = localStorage.getItem("charDes3") || "-";
      const dilemma_situation = JSON.parse(localStorage.getItem("dilemma_situation") || "["-"]");
      const question = localStorage.getItem("question") || "-";
      const choice1 = localStorage.getItem("choice1") || "-";
      const choice2 = localStorage.getItem("choice2") || "-";
      const flips_agree_texts = JSON.parse(localStorage.getItem("flips_agree_texts") || "["-"]");
      const flips_disagree_texts = JSON.parse(localStorage.getItem("flips_disagree_texts") || "["-"]");
      const agreeEnding = localStorage.getItem("agreeEnding") || "-";
      const disagreeEnding = localStorage.getItem("disagreeEnding") || "-";
  
      // dataSkeleton 구성
      const dataSkeleton = {
        opening: opening ? [opening] : [],
        roles: [
          { name: char1, description: charDes1 },
          { name: char2, description: charDes2 },
          { name: char3, description: charDes3 },
        ],
        rolesBackground: "",
        dilemma: {
          situation: dilemma_situation,
          question: question,
          options: {
            agree_label: choice1,
            disagree_label: choice2,
          },
        },
        flips: {
          agree_texts: flips_agree_texts,
          disagree_texts: flips_disagree_texts,
        },
        finalMessages: {
          agree: agreeEnding,
          disagree: disagreeEnding,
        },
      };
  
      const payload = {
        teacher_name,
        teacher_school,
        teacher_email,
        title: "-",                    
        representative_image_url: "-", 
        data: dataSkeleton,
      };
  
      const { data: res } = await axiosInstance.post("/custom-games", payload, {
        headers: { "Content-Type": "application/json" },
      });
  
      const code = res?.code ?? null;
      const gameUrl = res?.url ?? null;

      if (code) {
        localStorage.setItem('code', code);
      }
      if (gameUrl) {
        localStorage.setItem('url', gameUrl);
      }
      console.log("게임 생성 성공:", res);
      // 생성 성공 후 페이지 이동
      navigate("/create01");
    } catch (err) {
      console.error("게임 생성 실패:", err);
    }
  };
  

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
        {loading && <Bubble role="assistant" text="메시지 입력 중…" typing />}
        <div ref={bottomRef} />
      </section>

      {error && <div className="error">{error}</div>}

      {showButton && (
        <button 
          className="template-create-btn" 
          style={{
            position: "fixed",
            right: "50px",
            bottom: "100px",
            padding: "20px 40px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={handleTemplateCreate}
        >
          템플릿 생성하기
        </button>
      )}

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
