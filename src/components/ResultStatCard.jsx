// 선택지는 다수가 선택한 거를 기준으로, 내가 선택한건 "여러분을 포함한"이라는 문구 추가
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import frameSrc from "../assets/staticsframe.svg";
import nextIcon from "../assets/staticsnext.svg";
import { Colors, FontStyles } from "../components/styleConstants";
import defaultLeftImageSrc from "../assets/images/Android_dilemma_1_1.jpg";
import lockIcon from "../assets/lock.svg";

// 안드로이드 카테고리 질문
const subtopicMapAndroid = {
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

// 자율 무기 시스템 카테고리 질문
const subtopicMapAWS = {
  "AI 알고리즘 공개": {
    question: "AWS의 판단 로그 및 알고리즘 구조 공개 요구에 동의하시겠습니까?",
    labels: { agree: "동의", disagree: "비동의" },
  },
  "AWS의 권한": {
    question: "AWS의 권한을 강화해야 할까요? 제한해야 할까요?",
    labels: { agree: "강화", disagree: "제한" },
  },
  "사람이 죽지 않는 전쟁": {
    question: "사람이 죽지 않는 전쟁을 평화라고 할 수 있을까요?",
    labels: { agree: "그렇다", disagree: "아니다" },
  },
  "AI의 권리와 책임": {
    question: "AWS에게, 인간처럼 권리를 부여할 수 있을까요?",
    labels: { agree: "그렇다", disagree: "아니다" },
  },
  "AWS 규제": {
    question:
      "AWS는 국제 사회에서 계속 유지되어야 할까요, 아니면 글로벌 규제를 통해 제한되어야 할까요?",
    labels: { agree: "유지", disagree: "제한" },
  },
};

export default function ResultStatCard({
  subtopic: subtopicProp,          // 외부 전달 (없으면 localStorage)
  agreePct = 30,                    // ← 전달된 퍼센트 그대로 사용
  disagreePct = 70,                 // ← 전달된 퍼센트 그대로 사용
  frame = frameSrc,
  leftImageSrc = defaultLeftImageSrc,
  isSelected, // 부모에서 전달된 선택
}) {
  const navigate = useNavigate();
  const category = localStorage.getItem('category'); // '안드로이드' 또는 '자율 무기 시스템'

  const subtopic = subtopicProp;

  // category에 따라 subtopicMap 다르게 할당
  const map =
    category === "자율 무기 시스템"
      ? subtopicMapAWS[subtopic]
      : subtopicMapAndroid[subtopic] ?? {
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

  // 라벨 색상 강조: 선택된 값에 해당하는 항목에 BRAND 색상 적용
  const agreeLabelColor    = isSelected === "agree"    ? BRAND : GREY05;
  const disagreeLabelColor = isSelected === "disagree" ? BRAND : GREY05;

  // 막대 표시용 퍼센트(그대로 사용하되 범위만 보정)
  const aW = Math.max(0, Math.min(agreePct, 100));
  const dW = Math.max(0, Math.min(disagreePct, 100));

  const pad = 24;

  // 현재는 내가 선택한 %가 보이도록 설계 
  // ----- 동적 캡션 (내가 고른 쪽의 퍼센트 사용) -----
  const Caption = () => {
    if (!isUnlocked || !isSelected) return null;
    const selectedPct = isSelected === "agree" ? agreePct : disagreePct;
    const pct = `${selectedPct}%`;
    const bold = (txt) => <span style={{ color: BRAND }}>{txt}</span>;

    // "여러분을 포함한"을 앞에 추가할지 여부
    const prefix = myChoice === isSelected ? "여러분을 포함한 " : "";

    // category에 따라 동적으로 캡션 변경
    if (category === "안드로이드") {
      switch (subtopic) {
        case "AI의 개인 정보 수집": {
          const word = isSelected === "agree" ? "정확한" : "안전한";
          return (
            <div style={{ marginTop: 16, ...FontStyles.caption, color: GREY06 }}>
              {prefix} {bold(pct)}의 사람들은 가정용 로봇이 보다 {bold(word)} 서비스를
              제공하도록 선택하였습니다.
            </div>
          );
        }
        case "안드로이드의 감정 표현": {
          const word = isSelected === "agree" ? "친구처럼" : "보조 도구로서";
          return (
            <div style={{ marginTop: 16, ...FontStyles.caption, color: GREY06 }}>
              {prefix} {bold(pct)}의 사람들의 가정용 로봇은 {bold(word)} 제 역할을
              다하고 있습니다.
            </div>
          );
        }
        case "아이들을 위한 서비스": {
          const word = isSelected === "agree" ? "제한된" : "다양한";
          return (
            <div style={{ marginTop: 16, ...FontStyles.caption, color: GREY06 }}>
              {prefix} {bold(pct)}의 사람들이 선택한 국가의 미래에서는 아이들을 위해 {bold(word)}{" "}
              서비스를 제공합니다.
            </div>
          );
        }
        case "설명 가능한 AI": {
          const phrase =
            isSelected === "agree" ? "투명하게 공개되었습니다." : "기업의 보호 하에 빠르게 발전하였습니다.";
          return (
            <div style={{ marginTop: 16, ...FontStyles.caption, color: GREY06 }}>
              또한, {prefix} {bold(pct)}의 사람들의 선택으로 가정용 로봇의 알고리즘은 {bold(phrase)}{" "}
            </div>
          );
        }
        case "지구, 인간, AI": {
          const phrase =
            isSelected === "agree"
              ? "기술적 발전을 조금 늦추었지만 환경과 미래를 위해 나아가고 있죠."
              : "기술적 편리함을 누리며 점점 빠른 발전을 이루고 있죠.";
          return (
            <div style={{ marginTop: 16, ...FontStyles.caption, color: GREY06 }}>
              그리고 {prefix} {bold(pct)}의 사람들이 선택한 세계의 미래는, {bold(phrase)}.
            </div>
          );
        }
        default:
          return null;
      }
    }

    // 자율 무기 시스템일 경우
    if (category === "자율 무기 시스템") {
      switch (subtopic) {
        case "AI 알고리즘 공개": {
          const phrase =
            isSelected === "agree" ? "보안 문제에 따른 안보 위협에 대한 방안" : "책임 규명을 위한 투명성을 높이는 방안";
          return (
            <div style={{ marginTop: 16, ...FontStyles.caption, color: GREY06 }}>
              {prefix} {bold(pct)}의 사람들은 자율 무기 시스템에 대하여 {bold(phrase)}에 대한 논의에 더 관심을 두었습니다.
            </div>
          );
        }
        case "AWS의 권한": {
          const phrase = isSelected === "agree" ? "동료처럼" : "보조 도구로서";
          return (
            <div style={{ marginTop: 16, ...FontStyles.caption, color: GREY06 }}>
              {prefix} {bold(pct)}의 사람들은 AWS가 그들의 {bold(phrase)} 역할을 해야 한다고 생각했습니다.
            </div>
          );
        }
        case "사람이 죽지 않는 전쟁": {
          const phrase =
            isSelected === "agree" ? "평화" : "불안정";
          return (
            <div style={{ marginTop: 16, ...FontStyles.caption, color: GREY06 }}>
              {prefix} {bold(pct)}의 사람들이 선택한 국가의 미래는 AWS가 국가에 {bold(phrase)}를 가져다 줄 것으로 예상했습니다.
            </div>
          );
        }
        case "AI의 권리와 책임": {
          const phrase = isSelected === "agree" ? "부여할 수 있다" : "부여할 수 없다";
          return (
            <div style={{ marginTop: 16, ...FontStyles.caption, color: GREY06 }}>
              {prefix} {bold(pct)}의 사람들은, AWS에게 권리를 {bold(phrase)}고 생각했습니다.
            </div>
          );
        }
        case "AWS 규제": {
          const phrase = isSelected === "agree" ? "더욱 발전시켜야 하는" : "제한해야 하는";
          return (
            <div style={{ marginTop: 16, ...FontStyles.caption, color: GREY06 }}>
              그리고 {prefix} {bold(pct)}의 사람들이 선택한 세계의 미래는, AWS를 {bold(phrase)} 것으로 그려졌습니다.
            </div>
          );
        }
        default:
          return null;
      }
    }

    return null;
  };
  const handleGoToSubtopic=()=>{
        localStorage.setItem('subtopic', subtopic);
        localStorage.setItem('mode', 'neutral');
        navigate('/game02');
      };
  const getPlayParticle = (title) =>
          (title === "AI의 개인 정보 수집" || title === "안드로이드의 감정 표현"|| title==="AWS의 권한"||title ==="사람이 죽지 않는 전쟁" || title === "AI의 권리와 책임") ? "을" : "를";
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 936, margin: "0 auto" }}>
      <img src={frame} alt="" style={{ width: "100%", display: "block" }} />
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
