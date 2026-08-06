// src/utils/language/ko/pages/game09.js

export const Game09 = {
  title: "결과: 다른 사람들이 선택한 미래",
  
  prefix: "여러분을 포함한 ",

  lock: {
    prefix: "잠금 해제하려면 ",
    suffix: " 플레이하세요"
  },

  items: {
    // === 안드로이드 ===
    "AI의 개인 정보 수집": {
      question: "24시간 개인정보 수집 업데이트에 동의하시겠습니까?",
      labels: { agree: "동의", disagree: "비동의" },
      words: { agree: "정확한", disagree: "안전한" },
      template: "{prefix}{pct}의 사람들은 가정용 로봇이 보다 {word} 서비스를 제공하도록 선택하였습니다."
    },
    "안드로이드의 감정 표현": {
      question: "감정 엔진 업데이트에 동의하시겠습니까?",
      labels: { agree: "동의", disagree: "비동의" },
      words: { agree: "친구처럼", disagree: "보조 도구로서" },
      template: "{prefix}{pct}의 사람들의 가정용 로봇은 {word} 제 역할을 다하고 있습니다."
    },
    "아이들을 위한 서비스": {
      question: "가정용 로봇 사용에 대한 연령 규제가 필요할까요?",
      labels: { agree: "규제 필요", disagree: "규제 불필요" },
      words: { agree: "제한된", disagree: "다양한" },
      template: "{prefix}{pct}의 사람들이 선택한 국가의 미래에서는 아이들을 위해 {word} 서비스를 제공합니다."
    },
    "설명 가능한 AI": {
      question: "'설명 가능한 AI' 개발을 기업에 의무화해야 할까요?",
      labels: { agree: "의무화 필요", disagree: "의무화 불필요" },
      words: { agree: "투명하게 공개되었습니다.", disagree: "기업의 보호 하에 빠르게 발전하였습니다." },
      template: "또한, {prefix}{pct}의 사람들의 선택으로 가정용 로봇의 알고리즘은 {word}"
    },
    "지구, 인간, AI": {
      question: "세계적으로 가정용 로봇의 업그레이드 혹은 사용에 제한이 필요할까요?",
      labels: { agree: "제한 필요", disagree: "제한 불필요" },
      words: { 
        agree: "기술적 발전을 조금 늦추었지만 환경과 미래를 위해 나아가고 있죠.", 
        disagree: "기술적 편리함을 누리며 점점 빠른 발전을 이루고 있죠." 
      },
      template: "그리고 {prefix}{pct}의 사람들이 선택한 세계의 미래는, {word}"
    },

    // === 자율 무기 시스템 (AWS) ===
    "AI 알고리즘 공개": {
      question: "AWS의 판단 로그 및 알고리즘 구조 공개 요구에 동의하시겠습니까?",
      labels: { agree: "동의", disagree: "비동의" },
      words: { agree: "보안 문제에 따른 안보 위협에 대한 방안", disagree: "책임 규명을 위한 투명성을 높이는 방안" },
      template: "{prefix}{pct}의 사람들은 자율 무기 시스템에 대하여 {word}에 대한 논의에 더 관심을 두었습니다."
    },
    "AWS의 권한": {
      question: "AWS의 권한을 강화해야 할까요? 제한해야 할까요?",
      labels: { agree: "강화", disagree: "제한" },
      words: { agree: "동료처럼", disagree: "보조 도구로서" },
      template: "{prefix}{pct}의 사람들은 AWS가 그들의 {word} 역할을 해야 한다고 생각했습니다."
    },
    "사람이 죽지 않는 전쟁": {
      question: "사람이 죽지 않는 전쟁을 평화라고 할 수 있을까요?",
      labels: { agree: "그렇다", disagree: "아니다" },
      words: { agree: "평화를", disagree: "불안정을" }, 
      template: "{prefix}{pct}의 사람들이 선택한 국가의 미래는 AWS가 국가에 {word} 가져다 줄 것으로 예상했습니다."
    },
    "AI의 권리와 책임": {
      question: "AWS에게, 인간처럼 권리를 부여할 수 있을까요?",
      labels: { agree: "그렇다", disagree: "아니다" },
      words: { agree: "부여할 수 있다", disagree: "부여할 수 없다" },
      template: "{prefix}{pct}의 사람들은, AWS에게 권리를 {word}고 생각했습니다."
    },
    "AWS 규제": {
      question: "AWS는 국제 사회에서 계속 유지되어야 할까요, 아니면 글로벌 규제를 통해 제한되어야 할까요?",
      labels: { agree: "유지", disagree: "제한" },
      words: { agree: "더욱 발전시켜야 하는", disagree: "제한해야 하는" },
      template: "그리고 {prefix}{pct}의 사람들이 선택한 세계의 미래는, AWS를 {word} 것으로 그려졌습니다."
    }
  }
};