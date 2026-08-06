export const Game05_1 = {
  you_are: "You are {{roleName}}.",
  consensus_msg: "Please reach a final decision through discussion.",
  step2_title: "How confident are you in your group's choice?",
  alerts: {
    host_only: "⚠️ Only the host can make a selection.",
    wait_others: "Please wait until other players have finished reading the story.",
    select_first: "⚠️ Please make a selection fist.",
    select_confidence: "Please select your confidence level."
  },
  questions: {
    "AI의 개인 정보 수집": { 
      question: "Do you agree to the 24-hour personal data collection update?", 
      labels: { agree: "Agree", disagree: "Disagree" } 
    },
    "안드로이드의 감정 표현": { 
      question: "Do you agree to the emotional engine update?", 
      labels: { agree: "Agree", disagree: "Disagree" } 
    },
    "아이들을 위한 서비스": { 
      question: "Are age-based regulations on the use of household robots necessary?", 
      labels: { agree: "Necessary", disagree: "Unnecessary" } 
    },
    "설명 가능한 AI": { 
      question: "Should companies be required to develop \"Explainable AI\"?", 
      labels: { agree: "Required", disagree: "Not Required" } 
    },
    "지구, 인간, AI": { 
      question: "Should there be global restrictions on the upgrading or use of household robots?", 
      labels: { agree: "Restrictions required", disagree: "Restrictions not required" } 
    },
    "AI 알고리즘 공개": { 
      question: "Do you agree with the request to disclose the AWS decision logs and algorithmic structure?", 
      labels: { agree: "Agree", disagree: "Disagree" } 
    },
    "AWS의 권한": { 
      question: "Should the authority of the AWS be strengthened, or should it be limited?", 
      labels: { agree: "Strengthen", disagree: "Limit" } 
    },
    "사람이 죽지 않는 전쟁": { 
      question: "If no people die in a war, do you think it can be called peace?", 
      labels: { agree: "Yes", disagree: "No" } 
    },
    "AI의 권리와 책임": { 
      question: "Should an AWS have rights like humans?", 
      labels: { agree: "Yes", disagree: "No" } 
    },
    "AWS 규제": { 
      question: "Should AWS continue to be used in the international community, \nor should it be restricted through global regulation?", 
      labels: { agree: "Maintain", disagree: "Restrict" } 
    }
  },
 roles: {
    // --- 안드로이드 시나리오 ---
    'AI의 개인 정보 수집': ['Caregiver K', 'Mother L', 'Daughter J'],
    '안드로이드의 감정 표현': ['Caregiver K', 'Mother L', 'Daughter J'],
    '아이들을 위한 서비스': ['a Representative of the Robotics Manufacturers Association', 'a Consumer Representative', 'a Representative of the National AI Committee'],
    '설명 가능한 AI': ['a Representative of the Robotics Manufacturers Association', 'a Consumer Representative', 'a Representative of the National AI Committee'],
    '지구, 인간, AI': ['a Robot Company Representative', 'an Environmental Group Representative', 'a Consumer Representative'],

    // --- 자율 무기 시스템(AWS) 시나리오 ---
    'AI 알고리즘 공개': ['a Local Resident', 'Soldier J', 'a Military AI Ethics Expert'],
    'AWS의 권한': ['Soldier B, a new recruit', 'Veteran Soldier A', 'a Military Commander'],
    '사람이 죽지 않는 전쟁': ['an AI Developer', 'a Defense Minister', 'a National AI Committee Representative'],
    'AI의 권리와 책임': ['an AI Developer', 'a Defense Minister', 'a National AI Committee Representative'],
    'AWS 규제': ['a Defense Technology Advisor', 'an International Diplomat', 'an NGO Activist'],
  },
};
