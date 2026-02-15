// src/utils/language/en/pages/game09.js

export const Game09 = {
  title: "Result: The Future Chosen by Others ",
  
  prefix: "Including you, ",

  lock: {
    prefix: "Unlock to ",
    suffix: " play"
  },

  items: {
    // [중요] 키 값은 한글 유지! (DB 연동용)
    // [추가] subtopicName: 화면에 보여줄 영어 제목

    // === 안드로이드 ===
    "AI의 개인 정보 수집": {
      subtopicName: "AI Personal Data Collection",
      question: "Would you agree to a 24-hour personal data collection update?",
      labels: { agree: "Agree", disagree: "Disagree" },
      words: { agree: "(번역누락)", disagree: "(번역누락)" },
      template: "{prefix}{pct} of people chose to allow home robots to —-  {word}."
    },
    "안드로이드의 감정 표현": {
      subtopicName: "Emotional Expression of Androids",
      question: "Would you agree to an emotional engine update?",
      labels: { agree: "Agree", disagree: "Disagree" },
      words: { agree: "(번역누락)", disagree: "(번역누락)" },
      template: "{prefix}{pct} of chose for home robots to act —- {word}."
    },
    "아이들을 위한 서비스": {
      subtopicName: "Services for Children",
      question: "Is age regulation for home robot use necessary?",
      labels: { agree: "Regulation needed", disagree: "Not needed" },
      words: { agree: "(번역누락)", disagree: "(번역누락)" },
      template: "{prefix}{pct} of the participants chose a future with —- {word}"
    },
    "설명 가능한 AI": {
      subtopicName: "Explainable AI",
      question: "Should companies be required to develop explainable AI?",
      labels: { agree: "Mandate required", disagree: "Not required" },
      words: { agree: "(번역누락)", disagree: "(번역누락)" },
      template: "{prefix}{pct} of the home robot algorithms rapidly evolved under corporate protection."
    },
    "지구, 인간, AI": {
      subtopicName: "Earth, Humans, and AI",
      question: "Should there be global limits on the upgrade or use of home robots?",
      labels: { agree: "Restrictions needed", disagree: " Not needed" },
      words: { 
        agree: "(번역누락)", 
        disagree: "(번역누락)" 
      },
      template: "Although technological progress slowed somewhat, {pct} of the world is moving forward for the environment and the future."
    },

    // === 자율 무기 시스템 (AWS) ===
    "AI 알고리즘 공개": {
      subtopicName: "Disclosure of AI Algorithms",
      question: "Do you agree with the request to disclose the AWS decision logs and algorithmic structure?",
      labels: { agree: "Agree", disagree: "Disagree" },
      words: { agree: "increasing transparency to ensure accountability", disagree: "addressing security risks and national security threats" },
      template: "{prefix}{pct} of participants were more interested in discussions about {word} related to autonomous weapon systems."
    },
    "AWS의 권한": {
      subtopicName: "Authority of AWS",
      question: "Should the authority of the AWS be strengthened, or should it be limited?",
      labels: { agree: "Strengthen", disagree: "Limit" },
      words: { agree: "like a teammate ", disagree: "as a supporting tool" },
      template: "{prefix}{pct} of participants believed that AWS should act  {word}."
    },
    "사람이 죽지 않는 전쟁": {
      subtopicName: "A War Without Loss of Human Life",
      question: "If no people die in a war, do you think it can be called peace?",
      labels: { agree: "Yes", disagree: "No" },
      words: { agree: "peace ", disagree: "instability" },
      template: "{prefix}{pct} of participants expected that a future shaped by their choice would bring {word} to the nation through AWS."
    },
    "AI의 권리와 책임": {
      subtopicName: "AI Rights and Responsibilities",
      question: "Should an AWS have rights like humans?",
      labels: { agree: "Yes", disagree: "No" },
      words: { agree: "can", disagree: "cannot" },
      template: "{prefix}{pct} of participants believed that rights {word} be granted to AWS."
    },
    "AWS 규제": {
      subtopicName: "AWS Regulation",
      question: "Should AWS continue to be used in the international community, or should it be restricted through global regulation?",
      labels: { agree: "Maintain", disagree: "Restrict" },
      words: { agree: "further developed", disagree: "restricted" },
      template: "And {prefix}{pct} of participants envisioned a future of the world in which AWS should be  {word}."
    }
  }
};