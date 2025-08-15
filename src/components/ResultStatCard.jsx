import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import frameSrc from "../assets/staticsframe.svg";
import nextIcon from "../assets/staticsnext.svg";
import { Colors, FontStyles } from "../components/styleConstants";
import defaultLeftImageSrc from "../assets/images/Android_dilemma_1_1.jpg";
import lockIcon from "../assets/lock.svg";

const subtopicMap = {
  "AI의 개인 정보 수집": {
    question: "24시간 개인정보 수집 업데이트에 동의하시겠습니까?",
    labels: { agree: "동의", disagree: "비동의" },
  },
  "안드로이드의 감정 표현": {
    question: "감정 엔진 업데이트에 동의하시겠습니까?",
    labels: { agree: "동의", disagree: "비동의" },
  },
  "아이들을 위한 서비스": {
    question: "가정용 로봇 사용에 대한 연령 규제가 필요할까요?",
    labels: { agree: "규제 필요", disagree: "규제 불필요" },
  },
  "설명 가능한 AI": {
    question: "'설명 가능한 AI' 개발을 기업에 의무화해야 할까요?",
    labels: { agree: "의무화 필요", disagree: "의무화 불필요" },
  },
  "지구, 인간, AI": {
    question: "세계적으로 가정용 로봇의 업그레이드 혹은 사용에 제한이 필요할까요?",
    labels: { agree: "제한 필요", disagree: "제한 불필요" },
  },
};

export default function ResultStatCard({
  subtopic: subtopicProp,          // 외부 전달 (없으면 localStorage)
  agreePct = 30,                    // ← 전달된 퍼센트 그대로 사용
  disagreePct = 70,                 // ← 전달된 퍼센트 그대로 사용
  frame = frameSrc,
  leftImageSrc = defaultLeftImageSrc,
}) {
  const navigate = useNavigate();

  const subtopic = subtopicProp  ;
  const map = subtopicMap[subtopic] ?? {
    question: "질문을 준비 중입니다.",
    labels: { agree: "동의", disagree: "비동의" },
  };

  // 선택 결과 & 완료 여부
  const results = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("subtopicResults") ?? "{}"); }
    catch { return {}; }
  }, []);
  const myChoice = results?.[subtopic] ?? "disagree";

  const completedTopics = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("completedTopics") ?? "[]"); }
    catch { return []; }
  }, []);
  const isUnlocked = completedTopics.includes(subtopic);

  // 색상
  const GREY02 = Colors?.grey02;
  const GREY05 = Colors?.grey05;
  const GREY06 = Colors?.grey06;
  const BRAND  = Colors?.brandPrimary;

  // 라벨 색상 강조: 선택=BRAND, 비선택=GREY05
  const agreeLabelColor    = myChoice === "agree"    ? BRAND : GREY05;
  const disagreeLabelColor = myChoice === "disagree" ? BRAND : GREY05;

  // 막대 표시용 퍼센트(그대로 사용하되 범위만 보정)
  const aW = Math.max(0, Math.min(agreePct, 100));
  const dW = Math.max(0, Math.min(disagreePct, 100));

  const pad = 24;

  // 현재는 내가 선택한 %가 보이도록 설계 
  // ----- 동적 캡션 (내가 고른 쪽의 퍼센트 사용) -----
  const Caption = () => {
    if (!isUnlocked || !myChoice) return null;
    const selectedPct = myChoice === "agree" ? agreePct : disagreePct; // 전달값 그대로
    const pct = `${selectedPct}%`;
    const bold = (txt) => <span style={{ color: BRAND }}>{txt}</span>;

    switch (subtopic) {
      case "AI의 개인 정보 수집": {
        const word = myChoice === "agree" ? "정확한" : "안전한";
        return (
          <div style={{ marginTop: 16, ...FontStyles.caption, color: GREY06 }}>
            여러분을 포함한 {bold(pct)}의 사람들은 가정용 로봇이 보다 {bold(word)} 서비스를
            제공하도록 선택하였습니다.
          </div>
        );
      }
      case "안드로이드의 감정 표현": {
        const word = myChoice === "agree" ? "친구처럼" : "보조 도구로서";
        return (
          <div style={{ marginTop: 16, ...FontStyles.caption, color: GREY06 }}>
            여러분을 포함한 {bold(pct)}의 사람들의 가정용 로봇은 {bold(word)} 제 역할을
            다하고 있습니다.
          </div>
        );
      }
      case "아이들을 위한 서비스": {
        const word = myChoice === "agree" ? "제한된" : "다양한";
        return (
          <div style={{ marginTop: 16, ...FontStyles.caption, color: GREY06 }}>
            여러분을 포함한 {bold(pct)}의 사람들이 선택한 국가의 미래에서는 아이들을 위해 {bold(word)}{" "}
            서비스를 제공합니다.
          </div>
        );
      }
      case "설명 가능한 AI": {
        const phrase =
          myChoice === "agree" ? "투명하게 공개되었습니다." : "기업의 보호 하에 빠르게 발전하였습니다.";
        return (
          <div style={{ marginTop: 16, ...FontStyles.caption, color: GREY06 }}>
            또한, 여러분을 포함한 {bold(pct)}의 사람들의 선택으로 가정용 로봇의 알고리즘은 {bold(phrase)}{" "}
            
          </div>
        );
      }
      case "지구, 인간, AI": {
        const phrase =
          myChoice === "agree"
            ? "기술적 발전을 조금 늦추었지만 환경과 미래를 위해 나아가고 있죠."
            : "기술적 편리함을 누리며 점점 빠른 발전을 이루고 있죠.";
        return (
          <div style={{ marginTop: 16, ...FontStyles.caption, color: GREY06 }}>
            그리고 여러분을 포함한 {bold(pct)}의 사람들이 선택한 세계의 미래는, {bold(phrase)}.
          </div>
        );
      }
      default:
        return null;
    }
  };
  const getPlayParticle = (title) =>
    (title === "AI의 개인 정보 수집" || title === "안드로이드의 감정 표현") ? "을" : "를";

  const handleGoToSubtopic=()=>{
    localStorage.setItem('subtopic', subtopic);
    localStorage.setItem('mode', 'neutral');
    navigate('/game02');
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 936, margin: "0 auto" }}>
      <img src={frame} alt="" style={{ width: "100%", display: "block" }} />

      {/* 콘텐츠 레이어 */}
      <div
        style={{
          position: "absolute",
          inset: pad,
          display: "grid",
          gridTemplateColumns: "235px 1fr",
          columnGap: 2,
          alignItems: "start",
        }}
      >
        {/* 왼쪽: [ subtopic ] + 이미지 */}
        <div style={{ display: "grid", rowGap: 12, alignItems: "start", justifyItems: "start" }}>
          <div
            style={{
              width: 200,
              display: "grid",
              gridTemplateColumns: "18px 1fr 18px",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <span style={{ ...FontStyles.bodyBold, color: BRAND, justifySelf: "start" }}>[</span>
            <div
              style={{
                ...FontStyles.bodyBold,
                color: BRAND,
                textAlign: "center",
                lineHeight: 1.2,
                wordBreak: "keep-all",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                padding: "0 2px",
              }}
            >
              {subtopic}
            </div>
            <span style={{ ...FontStyles.bodyBold, color: BRAND, justifySelf: "end" }}>]</span>
          </div>

         {/* 이미지 (잠금 시 딤 처리 + 락 아이콘) */}
<div
  style={{
    position: "relative",
    width: 200,
    height: 103,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
    borderRadius: 0, // 필요시 8~12px로
  }}
>
  <img
    src={leftImageSrc}
    alt=""
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
    }}
  />

  {/* isLocked일 때만 오버레이 */}
  {!isUnlocked && (
    <>
      {/* 50% 블랙 딤 */}
        <div
            style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            pointerEvents: "none",
            }}
        />
        {/* 락 아이콘 중앙 */}
        <img
            src={lockIcon}
            alt="locked"
            style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 24,
            height: 24,
            pointerEvents: "none",
            }}
        />
        </>
    )}
    </div>
        </div>

        {/* 오른쪽: 질문 + 막대 + 설명/CTA */}
        <div>
          <div style={{ ...FontStyles.bodyBold, color: GREY06, marginBottom: 16, lineHeight: 1.35 }}>
            {map.question}
          </div>

          {isUnlocked ? (
            <>
              {/* 통계 막대 (완료 시) */}
              <div style={{ display: "flex", height: 56, width: "100%", borderRadius: 6, overflow: "hidden" }}>
                {/* 왼쪽(동의) - 배경 고정, 라벨 색상만 강조 */}
                <div
                  style={{
                    width: `${aW}%`,
                    minWidth: 64,
                    background: agreeLabelColor,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 16px",
                    gap: 8,
                  }}
                >
                  <span style={{ ...FontStyles.bodyBold, color: "#FFFFFF" }}>
                    {map.labels.agree}
                  </span>
                  <span style={{ marginLeft: 4, ...FontStyles.body, color: "#FFFFFF", opacity: 0.9 }}>
                    {agreePct}%
                  </span>
                </div>

                {/* 오른쪽(비동의) - 배경 고정, 라벨 색상만 강조 */}
                <div
                  style={{
                    width: `${dW}%`,
                    minWidth: 64,
                    background: disagreeLabelColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    padding: "0 16px",
                    gap: 8,
                  }}
                >
                  <span style={{ ...FontStyles.body, color: "#FFFFFF", opacity: 0.95 }}>
                    {disagreePct}%
                  </span>
                  <span style={{ ...FontStyles.bodyBold, color: "#FFFFFF" }}>
                    {map.labels.disagree}
                  </span>
                </div>
              </div>

              {/* 동적 하단 설명 */}
              <Caption />
            </>
          ) : (
            <>
              {/* 잠금 상태: 회색 단색 바 + 우측 CTA */}
              <div style={{ position: "relative", width: "100%" }}>
                <div style={{ height: 56, width: "100%", borderRadius: 6, background: GREY02 }} />
                <div
                  role="button"
                  onClick={handleGoToSubtopic}
                  //onClick={() => navigate("/game02")}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "0 16px",
                    borderRadius: 4,
                    background: GREY02,
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <span style={{ whiteSpace: "nowrap" }}>
                    <span style={{ ...FontStyles.body, color: GREY06 }}>잠금 해제하려면 </span>
                    <span style={{ ...FontStyles.bodyBold, color: GREY06 }}>
                      {subtopic}
                    </span>
                    <span style={{ ...FontStyles.body, color: GREY06 }}>{getPlayParticle(subtopic)} 플레이하세요</span>
                  </span>
                  <img src={nextIcon} alt="" style={{ width: 40, height: 40 }} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
