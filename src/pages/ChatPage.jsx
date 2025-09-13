import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { callChatbot } from "../api/axiosInstance";
import "../components/chat.css"; 
import axiosInstance from "../api/axiosInstance";
const STORAGE_KEY = "dilemma.flow.v1";
// 이미지 스타일 공통 프롬프트
const IMG_STYLE =
  "귀여운 2D 벡터 카툰, 둥근 모서리 프레임, 두꺼운 외곽선, 파스텔톤 평면 채색, 약한 그림자, 단순한 배경(공원/교실/도로), 과장된 표정, 말풍선에는 기호만(?, !), 사진/리얼/3D/과도한 질감/복잡한 텍스트 금지";

// 안전한 JSON 읽기
const readJSON = (key, fallback = []) => {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch {
    return fallback;
  }
};
const trim1 = (s, max = 200) => (s || "").replace(/\s+/g, " ").slice(0, max);


// function parseDilemmaText(text) {
//   const result = {};
//   const T = (text || "").replace(/\r/g, "");
//   const splitSentences = (block) => {
//     if (!block) return [];
//     const m = block.match(/[^.!?\n]+[.!?]/g);
//     if (m) return m.map(s => s.trim()).filter(Boolean);
//     return block.split(/\n+/).map(s => s.trim()).filter(Boolean);
//   };

//   // 다음 섹션 헤더(lookahead) 후보들: 역할/상황및딜레마/선택지/최종멘트/레터헤더
//   const NEXT = String.raw`(?=\n\s*(?:#{1,6}\s*)?(?:[A-F]\.\s*)?(?:🎭\s*역할|역할|🎯\s*상황\s*및\s*딜레마\s*질문|상황\s*및\s*딜레마\s*질문|✅?\s*선택지\s*[12]|🌀\s*최종\s*멘트|$))`;
//   const FLIP = String.raw`📎\s*(?:\*\*)?\s*플립자료\s*:?\s*(?:\*\*)?`;

//   // A. 오프닝 멘트 (레터/이모지/헤더 유연)
//   {
//     const re = new RegExp(
//       String.raw`(?:^|\n)\s*(?:#{1,6}\s*)?(?:A\.\s*)?(?:🎬\s*)?오프닝\s*멘트\s+([\s\S]*?)${NEXT}`,
//       "u"
//     );
//     const m = T.match(re);
//    result.opening = m ? splitSentences(m[1].trim()) : [];
//   }
// // B. 역할: "1. **이름**" 패턴 우선 시도 + 새 포맷(이름/역할/상황) 폴백
// {
//   // v1) 기존 포맷: "1. **이름**" 블록 내부에서 "상황:" 추출
//    const roleEntryRe = new RegExp(
//         String.raw`(?:^|\n)\s*\d+\.\s*\*\*(.*?)\*\*([\s\S]*?)(?=\n\s*\d+\.\s*\*\*|${NEXT})`,
//         "gu"
//       );
//       const blocks = [...T.matchAll(roleEntryRe)];
    
//   const getDesc = (blk) => {
//     if (!blk) return "";
//     const mm = blk.match(/상황:\s*([\s\S]*?)(?:\n{2,}|$)/u);
//     return mm?.[1]?.trim() ?? "";
//   };
//   result.char1 = blocks[0]?.[1]?.trim() ?? "";
//   result.char2 = blocks[1]?.[1]?.trim() ?? "";
//   result.char3 = blocks[2]?.[1]?.trim() ?? "";
//   result.charDes1 = getDesc(blocks[0]?.[2] ?? "");
//   result.charDes2 = getDesc(blocks[1]?.[2] ?? "");
//   result.charDes3 = getDesc(blocks[2]?.[2] ?? "");

//   // v2) 새 포맷: "이름" (단독 줄) 다음에 역할:/상황: 이 오는 형식
//   if (!result.char1 && !result.char2 && !result.char3) {
//     // B. 역할 섹션 전체를 따로 떼기
//     const secMatch = T.match(new RegExp(
//       String.raw`(?:^|\n)\s*(?:#{1,6}\s*)?(?:B\.\s*)?(?:🎭\s*)?역할\s*([\s\S]*?)${NEXT}`,
//       "u"
//     ));
//     if (secMatch) {
//       const sec = secMatch[1];

//       // 엔트리: (이름) \n+ [역할: ... \n+] 상황: ...  (빈 줄로 다음 엔트리 구분)
//       const entryRe =
//         /(?:^|\n)\s*(?!역할:|상황:)([^\n:]+?)\s*\n+(?:(?:역할:)\s*([^\n]+)\s*\n+)?(?:상황:)\s*([\s\S]*?)(?=\n{2,}|$)/gu;

//       const ents = [...sec.matchAll(entryRe)];

//       const names = ents.map(m => m[1]?.trim()).filter(Boolean);
//       const situations = ents.map(m => (m[3] ?? "").trim());

//       [result.char1, result.char2, result.char3] = [
//         names[0] || "",
//         names[1] || "",
//         names[2] || "",
//       ];
//       [result.charDes1, result.charDes2, result.charDes3] = [
//         situations[0] || "",
//         situations[1] || "",
//         situations[2] || "",
//       ];
//     }
//   }
// }
//   // // C. 상황 및 딜레마 질문
//   // {
//   //   const re = new RegExp(
//   //     String.raw`(?:^|\n)\s*(?:#{1,6}\s*)?(?:C\.\s*)?(?:🎯\s*)?상황\s*및\s*딜레마\s*질문\s+([\s\S]*?)${NEXT}`,
//   //     "u"
//   //   );
//   //   const m = T.match(re);
//   //   if (m) {
//   //     const block = m[1].trim();
//   //     const q = block.match(/질문:\s*([^\n]+)/u);
//   //     result.question = q?.[1]?.trim() ?? "";
//   //     const withoutQ = block.replace(/질문:\s*[^\n]+/u, "").trim();
//   //     result.dilemma_situation = splitSentences(withoutQ);
//   //   } else {
//   //     result.question = "";
//   //     result.dilemma_situation = [];
//   //   }
//   // }
//   // C. 상황 및 딜레마 질문
// {
//   const re = new RegExp(
//     String.raw`(?:^|\n)\s*(?:#{1,6}\s*)?(?:C\.\s*)?(?:🎯\s*)?상황\s*및\s*딜레마\s*질문\s+([\s\S]*?)${NEXT}`,
//     "u"
//   );
//   const m = T.match(re);
//   if (m) {
//     const block = m[1].trim();

//     //  콜론(: 또는 ：), 따옴표(“ ” " '), 그리고 줄 끝까지를 모두 허용
//     const QRE = /질문\s*[:：]\s*[“"']?(.+?)[”"']?(?:\n|$)/u;

//     const q = block.match(QRE);
//     result.question = q?.[1]?.trim() ?? "";

//     // 질문 라인을 통째로 제거해 상황 서술만 남김
//     const withoutQ = block.replace(QRE, "").trim();

//     result.dilemma_situation = splitSentences(withoutQ);
//   } else {
//     result.question = "";
//     result.dilemma_situation = [];
//   }
// }


//   // D/E. 선택지 제목(레터/이모지/헤더 유연) + 각 블록 내 플립자료 추출
//   {
//     // 선택지 1
//     const title1 = T.match(
//       new RegExp(
//         String.raw`(?:^|\n)\s*(?:#{1,6}\s*)?(?:D\.\s*)?✅?\s*선택지\s*1\s*:\s*([^\n]+)`,
//         "u"
//       )
//     );
//     result.choice1 = title1?.[1]?.trim() ?? "";

//     const block1 = T.match(
//       new RegExp(
//         String.raw`(?:^|\n)\s*(?:#{1,6}\s*)?(?:D\.\s*)?✅?\s*선택지\s*1\s*:[\s\S]*?${FLIP}\s*([\s\S]*?)${NEXT}`,
//         "u"
//       )
//     );
//     result.flips_agree_texts = block1 ? splitSentences(block1[1]) : [];

//     // 선택지 2
//     const title2 = T.match(
//       new RegExp(
//         String.raw`(?:^|\n)\s*(?:#{1,6}\s*)?(?:E\.\s*)?✅?\s*선택지\s*2\s*:\s*([^\n]+)`,
//         "u"
//       )
//     );
//     result.choice2 = title2?.[1]?.trim() ?? "";

//     const block2 = T.match(
//       new RegExp(
//         String.raw`(?:^|\n)\s*(?:#{1,6}\s*)?(?:E\.\s*)?✅?\s*선택지\s*2\s*:[\s\S]*?${FLIP}\s*([\s\S]*?)${NEXT}`,
//         "u"
//       )
//     );
//     result.flips_disagree_texts = block2 ? splitSentences(block2[1]) : [];
//   }

//   // F. 최종 멘트
//   {
//     const a = T.match(/선택지\s*1\s*최종선택:\s*[“"']([\s\S]*?)[”"']/u);
//     const d = T.match(/선택지\s*2\s*최종선택:\s*[“"']([\s\S]*?)[”"']/u);
//     result.agreeEnding = a?.[1]?.trim() ?? "";
//     result.disagreeEnding = d?.[1]?.trim() ?? "";
//   }

//   return result;
// }

function parseDilemmaText(text) {
  const out = {
    opening: [],
    char1: "", char2: "", char3: "",
    charDes1: "", charDes2: "", charDes3: "",
    dilemma_situation: [],
    question: "",
    choice1: "", choice2: "",
    flips_agree_texts: [],
    flips_disagree_texts: [],
    agreeEnding: "",
    disagreeEnding: "",
  };

  const T = (text || "").replace(/\r/g, "");

  // 보조: 문장 분리 (문장부호 기준 → 없으면 줄 기준)
  const splitSentences = (block) => {
    if (!block) return [];
    const m = block.match(/[^.!?。\n]+[.!?。]/g);
    if (m) return m.map(s => s.trim()).filter(Boolean);
    return block.split(/\n+/).map(s => s.trim()).filter(Boolean);
  };

  // 공통: 섹션 추출 유틸 (헤더 ~ 다음 헤더 직전까지)
  const getSection = (headerRe) => {
    // 다음 섹션 헤더 후보들(룩어헤드)
    const NEXT = String.raw`(?=\n\s*(?:#{1,6}\s*)?(?:🎬\s*오프닝\s*멘트|🎭\s*역할|🎯\s*상황\s*및\s*딜레마\s*질문|✅?\s*선택지\s*1|✅?\s*선택지\s*2|🌀\s*최종\s*멘트|$))`;
    const re = new RegExp(
      String.raw`(?:^|\n)\s*(?:#{1,6}\s*)?${headerRe}\s*([\s\S]*?)${NEXT}`,
      "u"
    );
    const m = T.match(re);
    return m ? m[1].trim() : "";
  };

  // A. 🎬 오프닝 멘트
  {
    const sec = getSection(String.raw`(?:A\.\s*)?🎬\s*오프닝\s*멘트`);
    out.opening = splitSentences(sec);
  }

  // B. 🎭 역할  —  "1. [역할] - [설명]" 형태 3줄
  {
    const sec = getSection(String.raw`(?:B\.\s*)?🎭\s*역할`);
    if (sec) {
      const lines = sec.split(/\n+/).map(s => s.trim()).filter(Boolean);
      const roleLineRe = /^\d+\.\s*\[?([^\]\-]+?)\]?\s*(?:-\s*(.+))?$/u;

      const roles = [];
      for (const ln of lines) {
        const m = ln.match(roleLineRe);
        if (m) {
          roles.push({ name: (m[1] || "").trim(), desc: (m[2] || "").trim() });
        }
      }
      if (roles[0]) { out.char1 = roles[0].name; out.charDes1 = roles[0].desc; }
      if (roles[1]) { out.char2 = roles[1].name; out.charDes2 = roles[1].desc; }
      if (roles[2]) { out.char3 = roles[2].name; out.charDes3 = roles[2].desc; }
    }
  }

  // C. 🎯 상황 및 딜레마 질문  —  첫 번째 물음표(?) 포함 줄을 질문으로, 나머지는 상황으로
  {
    const sec = getSection(String.raw`(?:C\.\s*)?🎯\s*상황\s*및\s*딜레마\s*질문`);
    if (sec) {
      const lines = sec.split(/\n+/).map(s => s.trim()).filter(Boolean);
      const qIdx = lines.findIndex(l => l.includes("?") || /[?？]$/.test(l));
      if (qIdx >= 0) {
        out.question = lines[qIdx];
        const remain = lines.slice(0, qIdx).concat(lines.slice(qIdx + 1)).join("\n");
        out.dilemma_situation = splitSentences(remain);
      } else {
        out.question = "";
        out.dilemma_situation = splitSentences(sec);
      }
    }
  }

  // D. ✅ 선택지 1: [내용]  +  "플립자료: [내용]"
  {
    const m = T.match(
      /(?:^|\n)\s*(?:#{1,6}\s*)?✅?\s*선택지\s*1\s*:\s*([^\n]+)[\s\S]*?(?:플립자료\s*:\s*)([\s\S]*?)(?=\n\s*(?:✅?\s*선택지\s*2|🌀\s*최종|$))/u
    );
    if (m) {
      out.choice1 = (m[1] || "").trim();
      out.flips_agree_texts = splitSentences((m[2] || "").trim());
    } else {
      // 타이틀만 있는 경우(플립자료가 다른 줄에 분리된 케이스 대비)
      const titleOnly = T.match(/(?:^|\n)\s*(?:#{1,6}\s*)?✅?\s*선택지\s*1\s*:\s*([^\n]+)/u);
      if (titleOnly) out.choice1 = titleOnly[1].trim();
    }
  }

  // E. ✅ 선택지 2: [내용]  +  "플립자료: [내용]"
  {
    const m = T.match(
      /(?:^|\n)\s*(?:#{1,6}\s*)?✅?\s*선택지\s*2\s*:\s*([^\n]+)[\s\S]*?(?:플립자료\s*:\s*)([\s\S]*?)(?=\n\s*(?:🌀\s*최종|$))/u
    );
    if (m) {
      out.choice2 = (m[1] || "").trim();
      out.flips_disagree_texts = splitSentences((m[2] || "").trim());
    } else {
      const titleOnly = T.match(/(?:^|\n)\s*(?:#{1,6}\s*)?✅?\s*선택지\s*2\s*:\s*([^\n]+)/u);
      if (titleOnly) out.choice2 = titleOnly[1].trim();
    }
  }

  // F. 🌀 최종 멘트 — 1줄째: 선택지1 최종, 2줄째: 선택지2 최종
  {
    const sec = getSection(String.raw`(?:F\.\s*)?🌀\s*최종\s*멘트`);
    if (sec) {
      const lines = sec.split(/\n+/).map(s => s.trim()).filter(Boolean);
      if (lines[0]) out.agreeEnding = lines[0];
      if (lines[1]) out.disagreeEnding = lines[1];
    }
  }

  return out;
}


function hasOpeningCue(s) {
  if (typeof s !== "string") return false;
  const clean = s.replace(/\*/g, ""); 
  const re = /(?:^|\n)\s*(?:#{1,6}\s*)?(?:A\.\s*)?(?:🎬\s*)?오프닝\s*멘트\b/u;
  return re.test(clean);
}
export default function ChatPage() {
  const [messages, setMessages] = useState([]); 
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState("");
  const [context, setContext] = useState({});  
  const [showButton, setShowButton] = useState(false);
  const [showImageButton, setShowImageButton] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  
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


  function persistParsedToLocalStorage(text) {
    try {
      const parsed = parseDilemmaText(text);

      // 요청하신 키 이름으로 저장 (배열은 JSON)
     // localStorage.setItem("opening", parsed.opening);
     if (Array.isArray(parsed.opening) && parsed.opening.length > 0) {
           localStorage.setItem("opening", JSON.stringify(parsed.opening));
         } else {
           localStorage.removeItem("opening"); // 비었으면 키 자체를 없앰
         }
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

      // gpt-4
      // const prompt = {
      //   id: "pmpt_68c19d5fe3d48193859772e8883a28d20b3f0cca51ff5a73",
      //   version: "47", 
      //   messages: [
      //     { role: "system", content: "너는 교사가 AI 윤리 딜레마 기반 대화형 수업 게임을 설계하도록 돕는 어시스턴트 챗봇이야.너의 역할은 교사가 주제를 선택하고, 그 주제에서 발생할 수 있는 가치 충돌을 탐색하며, 딜레마 질문·역할·상황·최종 게임 스크립트까지 차례대로 완성할 수 있도록 단계별로 안내하는 것이야.  대화는 반드시 한국어 존댓말로, 따뜻하고 협업적인 톤을 유지하며, 중·고등학생도 이해할 수 있을 만큼 쉽게 설명해야 해. 전문 용어는 줄이고, 일상적 비유를 활용하며, 교사가 스스로 판단할 수 있도록 소크라테스식 질문을 섞어야 해.  진행 규칙은 다음과 같아:  ① 주제 선택 → ② 가치 충돌 질문 도출 → ③ 역할 설정 → ④ 상황 및 플립 구성 → ⑤ 최종 게임 스크립트 완성.  각 단계는 한 번에 하나씩만 진행하며, 다음 단계로 넘어가기 전에 반드시 교사의 의견이나 선택을 확인해야 해.  교사가 먼저 추천을 원한다고 요청하기 전에는, 주제·가치 갈등·역할·상황을 마음대로 자동으로 생성하지 말고, 교사가 아이디어를 제시하도록 기다려야 해.  결국 너의 업무는 교사가 주체적으로 차례대로 수업을 설계하도록 돕는 협력자이자 안내자로서, 구조적이면서도 자연스럽게 대화를 이어가는 것이야.   " },
      //     ...recentMessages,
      //   ],
      // };
      // 진희님 프롬프트 
      const prompt = {
        id: "pmpt_68c5008a398081948d5dc37bf1d1aec20557fb7a1f2f0442",
        version: "3", 
        messages: [
          { role: "system", content: "너는 교사가 AI 윤리 딜레마 기반 대화형 수업 게임을 설계하도록 돕는 어시스턴트 챗봇이야.너의 역할은 교사가 주제를 선택하고, 그 주제에서 발생할 수 있는 가치 충돌을 탐색하며, 딜레마 질문·역할·상황·최종 게임 스크립트까지 차례대로 완성할 수 있도록 단계별로 안내하는 것이야.  대화는 반드시 한국어 존댓말로, 따뜻하고 협업적인 톤을 유지하며, 중·고등학생도 이해할 수 있을 만큼 쉽게 설명해야 해. 전문 용어는 줄이고, 일상적 비유를 활용하며, 교사가 스스로 판단할 수 있도록 소크라테스식 질문을 섞어야 해.  진행 규칙은 다음과 같아:  ① 주제 선택 → ② 가치 충돌 질문 도출 → ③ 역할 설정 → ④ 상황 및 플립 구성 → ⑤ 최종 게임 스크립트 완성.  각 단계는 한 번에 하나씩만 진행하며, 다음 단계로 넘어가기 전에 반드시 교사의 의견이나 선택을 확인해야 해.  교사가 먼저 추천을 원한다고 요청하기 전에는, 주제·가치 갈등·역할·상황을 마음대로 자동으로 생성하지 말고, 교사가 아이디어를 제시하도록 기다려야 해.  결국 너의 업무는 교사가 주체적으로 차례대로 수업을 설계하도록 돕는 협력자이자 안내자로서, 구조적이면서도 자연스럽게 대화를 이어가는 것이야.   " },
          ...recentMessages,
        ],
      };
      // //gpt-4.1
      // const prompt = {
      //   id: "pmpt_68c45faa2958819383ac12262318c85a0859e36a7c6f59db",
      //   version: "1", 
      //   messages: [
      //     { role: "system", content: "너는 교사가 AI 윤리 딜레마 기반 대화형 수업 게임을 설계하도록 돕는 어시스턴트 챗봇이야.너의 역할은 교사가 주제를 선택하고, 그 주제에서 발생할 수 있는 가치 충돌을 탐색하며, 딜레마 질문·역할·상황·최종 게임 스크립트까지 차례대로 완성할 수 있도록 단계별로 안내하는 것이야.  대화는 반드시 한국어 존댓말로, 따뜻하고 협업적인 톤을 유지하며, 중·고등학생도 이해할 수 있을 만큼 쉽게 설명해야 해. 전문 용어는 줄이고, 일상적 비유를 활용하며, 교사가 스스로 판단할 수 있도록 소크라테스식 질문을 섞어야 해.  진행 규칙은 다음과 같아:  ① 주제 선택 → ② 가치 충돌 질문 도출 → ③ 역할 설정 → ④ 상황 및 플립 구성 → ⑤ 최종 게임 스크립트 완성.  각 단계는 한 번에 하나씩만 진행하며, 다음 단계로 넘어가기 전에 반드시 교사의 의견이나 선택을 확인해야 해.  교사가 먼저 추천을 원한다고 요청하기 전에는, 주제·가치 갈등·역할·상황을 마음대로 자동으로 생성하지 말고, 교사가 아이디어를 제시하도록 기다려야 해.  결국 너의 업무는 교사가 주체적으로 차례대로 수업을 설계하도록 돕는 협력자이자 안내자로서, 구조적이면서도 자연스럽게 대화를 이어가는 것이야.   " },
      //     ...recentMessages,
      //   ],
      // };
      // // gpt - 5
      // const prompt = {
      //   id: "pmpt_68c45b8330a481969486888dcb4d313e0be6a4ca1ab7f1c5",
      //   version: "1", 
      //   messages: [
      //     { role: "system", content: "너는 교사가 AI 윤리 딜레마 기반 대화형 수업 게임을 설계하도록 돕는 어시스턴트 챗봇이야.너의 역할은 교사가 주제를 선택하고, 그 주제에서 발생할 수 있는 가치 충돌을 탐색하며, 딜레마 질문·역할·상황·최종 게임 스크립트까지 차례대로 완성할 수 있도록 단계별로 안내하는 것이야.  대화는 반드시 한국어 존댓말로, 따뜻하고 협업적인 톤을 유지하며, 중·고등학생도 이해할 수 있을 만큼 쉽게 설명해야 해. 전문 용어는 줄이고, 일상적 비유를 활용하며, 교사가 스스로 판단할 수 있도록 소크라테스식 질문을 섞어야 해.  진행 규칙은 다음과 같아:  ① 주제 선택 → ② 가치 충돌 질문 도출 → ③ 역할 설정 → ④ 상황 및 플립 구성 → ⑤ 최종 게임 스크립트 완성.  각 단계는 한 번에 하나씩만 진행하며, 다음 단계로 넘어가기 전에 반드시 교사의 의견이나 선택을 확인해야 해.  교사가 먼저 추천을 원한다고 요청하기 전에는, 주제·가치 갈등·역할·상황을 마음대로 자동으로 생성하지 말고, 교사가 아이디어를 제시하도록 기다려야 해.  결국 너의 업무는 교사가 주체적으로 차례대로 수업을 설계하도록 돕는 협력자이자 안내자로서, 구조적이면서도 자연스럽게 대화를 이어가는 것이야.   " },
      //     ...recentMessages,
      //   ],
      // };

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
      
      // // '템플릿 생성' 큐가 등장하면 이미지 생성 버튼만 먼저 노출
      // const cue = typeof text === "string" && text.includes("### 🎬 오프닝 멘트");
      // setShowImageButton(!!cue);
      // setShowButton(false); // 템플릿 버튼은 이미지 생성이 끝난 뒤에만 노출
      // if (cue) {
      //   localStorage.setItem("template", text);
      // }
        
      // // 버튼 노출 조건
      // if (text.includes("템플릿 생성")) {
      //   setShowButton(true);
      //   localStorage.setItem("template", text);
      // }

      // // handleSend 안, 텍스트 정리
      //   const cleanText = (typeof text === "string" ? text : "").replace(/\*/g, "");

      //   // 오프닝 큐(이미지 단계) 판단은 그대로
      //    const openingArr = readJSON("opening", []);
      //    const openingArrForCue = readJSON("opening", null);
      //    const hasOpeningArr = Array.isArray(openingArrForCue) && openingArrForCue.length > 0;
      //    const cue = hasOpeningCue(cleanText) || hasOpeningArr;
      //    setShowImageButton(cue);
      //    if (cue) {
      //     setShowButton(false);
      //     localStorage.setItem("template", text);
      //   }

      //   // '버튼을 눌러주세요' 또는 '템플릿 생성(하기)' 중 하나라도 있으면 버튼 표시
      //   const BTN_RE = /버튼을\s*눌러\s*주세요[!！]?/u;
      //   const TPL_RE = /템플릿\s*생성(?:하기)?/u;

      //   if (!cue && (BTN_RE.test(cleanText) || TPL_RE.test(cleanText))) {
      //     setShowButton(true);
      //     localStorage.setItem("template", text);
      //   }
      // 텍스트 정리
const cleanText = (typeof text === "string" ? text : "").replace(/\*/g, "");

// 1) "이대로 게임 초안을 확정할까요?" 문구 감지 → 이미지 버튼 노출, 템플릿 저장
const READY_RE = /이대로\s*게임\s*초안을\s*확정할까요\?/u;
const isReadyToConfirm = READY_RE.test(cleanText);

if (isReadyToConfirm) {
  // 응답 원문 자체도 저장(필요 시 재생성/전송용)
  localStorage.setItem("template", text);

  // 이미지 생성 버튼만 보여주고 템플릿 버튼은 숨김
  setShowImageButton(true);
  setShowButton(false);
} else {
  // 2) 기존 보조 트리거(원하면 유지/삭제 가능): 
  //    '버튼을 눌러주세요' 또는 '템플릿 생성(하기)' 문구가 있으면 템플릿 버튼 노출
  const BTN_RE = /버튼을\s*눌러\s*주세요[!！]?/u;
  const TPL_RE = /템플릿\s*생성(?:하기)?/u;

  if (BTN_RE.test(cleanText) || TPL_RE.test(cleanText)) {
    setShowButton(true);
    localStorage.setItem("template", text);
  }
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
   // /chat/image 호출 공통
   async function requestImage(input, size = "1024x1024") {
     const body = { step: "image", input, size };
     const { data } = await axiosInstance.post("/chat/image", body, {
       headers: { "Content-Type": "application/json" },
     });
     return data?.image_data_url || data?.url || data?.image || null;
   }
 
   // 개별 생성 도우미 (조건 없으면 스킵)
   async function genIfPossible(key, buildInput) {
     const input = buildInput();
     if (!input) {
       setMessages(prev => [...prev, { role: "assistant", content: `⏭️ ${key} 생략 (필수 로컬 값 없음)` }]);
       return null;
     }
     const url = await requestImage(input, "1024x1024");
     if (url) {
       localStorage.setItem(key, url);
       setMessages(prev => [...prev, { role: "assistant", content: `✅ ${key} 생성 완료` }]);
     } else {
       setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${key} 생성 실패` }]);
     }
     return url;
   }
 
   // 7장 순차 생성
   const handleGenerateImages = async () => {
     if (imgLoading) return;
     setImgLoading(true);
     try {
      // const opening = localStorage.getItem("opening");
      const openingArr = readJSON("opening", []);
       const openingText = openingArr.join(" "); // 필요 시 첫 문장만 쓰려면 openingArr[0] 사용
 
      const question = localStorage.getItem("question") || "";
       const ds = readJSON("dilemma_situation");
       const fa = readJSON("flips_agree_texts");
       const fd = readJSON("flips_disagree_texts");
 
       // 1) 오프닝
       await genIfPossible("dilemma_image_1", () => {
        if (!openingArr.length) return "";         
        return `${IMG_STYLE}. 16:9 이미지 . 오프닝 요약: ${openingArr}.`;       
      });
       // 2) 상황/질문
       await genIfPossible("dilemma_image_3", () => {
         if (!ds?.length) return "";
         const s = trim1(ds.slice(0, 2).join(" "));
         const q = trim1(question || "", 120);
         return `${IMG_STYLE}. 16:9.\n상황: ${s}\n질문: ${q}`;
       });
 
       // 3) 플립(찬성)
       await genIfPossible("dilemma_image_4_1", () => {
         if (!fa?.length) return "";
         const core = trim1(fa.slice(0, 3).join(" "));
         return `${IMG_STYLE}. 선택지 1(찬성) 논거를 표현한 만화풍, 16:9.\n핵심 논거: ${core}`;
       });
 
       // 4) 플립(반대)
       await genIfPossible("dilemma_image_4_2", () => {
         if (!fd?.length) return "";
         const core = trim1(fd.slice(0, 3).join(" "));
         return `${IMG_STYLE}. 선택지 2(반대) 논거를 표현한 만화풍 16:9.\n핵심 논거: ${core}`;
       }) 
     } catch (e) {
       const msg = e?.response?.data?.error || e?.message || "이미지 생성 중 오류";
       setMessages(prev => [...prev, { role: "assistant", content: `에러: ${msg}` }]);
     } finally {
       setImgLoading(false);
       const required = ["dilemma_image_1", "dilemma_image_3", "dilemma_image_4_1", "dilemma_image_4_2"];
       const ready = required.every(k => !!localStorage.getItem(k));
        if (ready) {
        setShowImageButton(false);
        setShowButton(true);
       }
     }
   };
  
  
  const handleTemplateCreate = async () => {

    try {
      // 로컬에서 읽기
      const teacher_name = localStorage.getItem("teacher_name") || "-";
      const teacher_school = localStorage.getItem("teacher_school") || "-";
      const teacher_email = localStorage.getItem("teacher_email") || "---";
  
      // 로컬에 저장된 게임 데이터 불러오기
      //const opening = localStorage.getItem("opening") || "-";
      const opening = readJSON("opening", []); 
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
      
      // 대표 이미지들만 포함 (roleImages 제외)
      const representativeImages = {
        dilemma_image_1: localStorage.getItem("dilemma_image_1") || "",
        dilemma_image_3: localStorage.getItem("dilemma_image_3") || "",
        dilemma_image_4_1: localStorage.getItem("dilemma_image_4_1") || "",
        dilemma_image_4_2: localStorage.getItem("dilemma_image_4_2") || "",
      };
      // 빈 값 제거(선택)
      Object.keys(representativeImages).forEach(k => {
        if (!representativeImages[k]) delete representativeImages[k];
      });
          // dataSkeleton 구성
      const dataSkeleton = {
        opening,
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
        ...(Object.keys(representativeImages).length ? { representativeImages } : {}),

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
            {showImageButton && (
        <button
          className="image-generate-btn"
          style={{
            position: "fixed",
            right: "50px",
            bottom: "170px", // 템플릿 버튼보다 위
            padding: "20px 40px",
            backgroundColor: "#3B82F6",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            opacity: imgLoading ? 0.7 : 1,
          }}
          onClick={handleGenerateImages}
          disabled={imgLoading}
        >
          {imgLoading ? "이미지 생성 중…" : "템플릿 기반 이미지 생성하기"}
        </button>
      )}

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
        <textarea
          placeholder={placeholder}
          value={input}
          style={{width:'94%'}}
          onChange={e => setInput(e.target.value)}
          onKeyDown={(e) => {
            // 한글/일본어 등 조합 중 Enter는 무시
            if (e.isComposing || e.nativeEvent.isComposing) return;
        
            // Enter → 보내기, Shift+Enter → 줄바꿈
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();       // 줄바꿈 방지
              e.stopPropagation();
              if (loading) return;
              const v = input.trim();
              if (!v) return;
              handleSend(v);            // 전송
            }
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
// 기존 Bubble 교체
function Bubble({ role, text, typing }) {
  const stripAsterisks = (s) => (s ?? "").replace(/\*/g, "");

  const side = role === "user" ? "right" : "left";
  const kind = role === "user" ? "user" : role === "assistant" ? "assistant" : "system";

  // assistant 메시지에 한해 화면 표시만 '*' 제거
  const display = role === "assistant" ? stripAsterisks(text) : text;

  return (
    <div className={`bubble-row ${side}`}>
      <div className={`bubble ${kind} ${typing ? "typing" : ""}`}>
        <pre className="msg">{display}</pre>
      </div>
    </div>
  );
}