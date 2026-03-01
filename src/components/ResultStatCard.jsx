// 선택지는 다수가 선택한 거를 기준으로, 내가 선택한건 "여러분을 포함한"이라는 문구 추가
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import frameSrc from "../assets/staticsframe.svg";
import nextIcon from "../assets/staticsnext.svg";
import { Colors, FontStyles } from "../components/styleConstants";
import defaultAndroidLeftImageSrc from "../assets/images/Android_dilemma_1_1.jpg";
import defaultAwsLeftImageSrc from "../assets/images/Killer_Character3.jpg";
import lockIcon from "../assets/lock.svg";

// 언어팩 가져오기
import { translations } from '../utils/language';

// 안드로이드 카테고리 질문 (언어팩 연동으로 대체됨)
// 자율 무기 시스템 카테고리 질문 (언어팩 연동으로 대체됨)

export default function ResultStatCard({
  subtopic: subtopicProp,          // 외부 전달 (없으면 localStorage)
  agreePct = 30,                    // ← 전달된 퍼센트 그대로 사용
  disagreePct = 70,                 // ← 전달된 퍼센트 그대로 사용
  frame = frameSrc,
  leftImageSrc,
  isSelected, // 부모에서 전달된 선택
}) {
  const navigate = useNavigate();
  const category = localStorage.getItem('category'); // '안드로이드' 또는 '자율 무기 시스템'

  // 현재 언어 설정 확인
  const lang = localStorage.getItem('language') || 'ko';
  
  // 대문자 Game09 데이터를 안전하게 가져오기
  // 데이터가 로드되지 않았을 경우를 대비해 빈 객체({})와 items를 기본값으로 설정
  const t = translations[lang]?.Game09 || translations['ko']?.Game09 || { items: {} };

  const resolvedLeftImageSrc =
    leftImageSrc ??
    (category === "자율 무기 시스템"
      ? defaultAwsLeftImageSrc
      : defaultAndroidLeftImageSrc);

  const subtopic = subtopicProp;

  // category에 따라 subtopicMap 다르게 할당 (기존 하드코딩을 언어팩 데이터로 변경)
  // itemData.subtopicName이 있으면 그것을 제목으로 사용 (영문 지원)
  const itemData = t.items?.[subtopic] || {
    subtopicName: subtopic,
    question: "Loading...",
    labels: { agree: "Agree", disagree: "Disagree" },
    words: { agree: "", disagree: "" },
    template: ""
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
    const pctText = `${selectedPct}%`;
    const bold = (txt) => <span style={{ color: BRAND, fontWeight: 'bold' }}>{txt}</span>;

    // "여러분을 포함한"을 앞에 추가할지 여부
    const prefixText = myChoice === isSelected ? t.prefix : "";

    // category에 따라 동적으로 캡션 변경
    // 기존의 switch-case 문을 언어팩의 template 기능으로 대체하여 간소화
    const selectedWord = isSelected === "agree" ? itemData.words.agree : itemData.words.disagree;

    if (!itemData.template) return null;

    let templateStr = itemData.template;
    templateStr = templateStr.replace("{prefix}", prefixText); 

    // 템플릿 쪼개기 ({pct}, {word} 등 스타일 적용을 위해)
    const parts = templateStr.split(/(\{pct\}|\{word\})/g);

    return (
      <div style={{ marginTop: 16, ...FontStyles.caption, color: GREY06 }}>
        {parts.map((part, index) => {
          if (part === "{pct}") return <React.Fragment key={index}>{bold(pctText)}</React.Fragment>;
          if (part === "{word}") return <React.Fragment key={index}>{bold(selectedWord)}</React.Fragment>;
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
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
              {/* 화면에는 언어팩의 subtopicName(영어 등)을 보여주고, 없으면 키값(한글) 사용 */}
              {itemData.subtopicName || subtopic}
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
              src={resolvedLeftImageSrc}
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
            {itemData.question}
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
                    {itemData.labels.agree}
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
                    {itemData.labels.disagree}
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
                    <span style={{ ...FontStyles.body, color: GREY06 }}>{t.lock?.prefix}</span>
                    <span style={{ ...FontStyles.bodyBold, color: GREY06 }}>
                      {/* 화면 표시용 제목 (영문/한글) */}
                      {itemData.subtopicName || subtopic}
                    </span>
                    <span style={{ ...FontStyles.body, color: GREY06 }}>
                       {/* 한국어일 때만 조사 함수 실행하여 붙임 */}
                       {lang === 'ko' ? getPlayParticle(subtopic) : ''} 
                       {t.lock?.suffix}
                    </span>
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