export const Game05_1 = {
  you_are: "You are {{roleName}}.",
  consensus_msg: "Please reach a final decision through discussion.",
  step2_title: "How confident are you in your group's choice?",
  alerts: {
    host_only: "⚠️ Only the host can make a selection. (미번역)",
    wait_others: "Please wait until other players have finished reading the story. (미번역)",
    select_first: "⚠️ Please select Agree or Disagree first. (미번역)",
    select_confidence: "Please select your confidence level. (미번역)"
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
      question: "Should companies be required to develop *Explainable AI*?", 
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
      question: "Should AWS continue to be used in the international community, or should it be restricted through global regulation?", 
      labels: { agree: "Maintain", disagree: "Restrict" } 
    }
  },
  roles: {
    "AI의 개인 정보 수집": ["Caregiver K", "Mother L", "Daughter J"],
    "안드로이드의 감정 표현": ["Caregiver K", "Mother L", "Daughter J"],
    "아이들을 위한 서비스": ["Robot Company Representative", "Customer Representative", "National AI Committee Representative"],
    "설명 가능한 AI": ["Robot Company Representative", "Customer Representative", "National AI Committee Representative"],
    "지구, 인간, AI": ["Company Alliance Representative", "Environment Group Representative", "Customer Representative"],
    "AI 알고리즘 공개": ["Local Resident", "Soldier J", "Military AI Ethics Expert"],
    "AWS의 권한": ["New Soldier B", "Experienced Soldier A", "Military Commander"],
    "사람이 죽지 않는 전쟁": ["AI Developer", "Defense Minister", "National AI Committee Representative"],
    "AI의 권리와 책임": ["AI Developer", "Defense Minister", "National AI Committee Representative"],
    "AWS 규제": ["Defense Tech. Advisor", "INternational Diplomat", "NGO Activist"]
  }
};
