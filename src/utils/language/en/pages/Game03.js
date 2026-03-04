export const Game03 = {
  // 공통 UI 텍스트
  you_are: "You are {{roleName}}.",
  waiting_msg: "Waiting for other player to make their selection...",
  step2_title: "How confident are you in your decision?",

  // 역할명 정의 (ID 순서: 1P, 2P, 3P)
  roles: {
    // --- 안드로이드 시나리오 ---
    'AI의 개인 정보 수집': ['Caregiver K', 'Mother L', 'Daughter J'],
    '안드로이드의 감정 표현': ['Caregiver K', 'Mother L', 'Daughter J'],
    '아이들을 위한 서비스': ['Robot Company Representative', 'Customer Representative', 'National AI Committee Representative'],
    '설명 가능한 AI': ['Robot Company Representative', 'Customer Representative', 'National AI Committee Representative'],
    '지구, 인간, AI': ['Company Alliance Representative', 'Environment Group Representative', 'Customer Representative'],

    // --- 자율 무기 시스템(AWS) 시나리오 ---
    'AI 알고리즘 공개': ['Local Resident', 'Soldier J', 'Military AI Ethics Expert'],
    'AWS의 권한': ['New Soldier B', 'Experienced Soldier A', 'Military Commander'],
    '사람이 죽지 않는 전쟁': ['AI Developer', 'Defense Minister', 'National AI Committee Representative'],
    'AI의 권리와 책임': ['AI Developer', 'Defense Minister', 'National AI Committee Representative'],
    'AWS 규제': ['Defense Tech. Advisor', 'International Diplomat', 'NGO Activist'],
  },

  // 질문 및 버튼 라벨 정의
  questions: {
    // --- 안드로이드 시나리오 ---
    'AI의 개인 정보 수집': {
      question: 'Do you agree to the 24-hour personal data collection update?',
      labels: { agree: 'Agree', disagree: 'Disagree' },
    },
    '안드로이드의 감정 표현': {
      question: ' Do you agree to the emotional engine update?',
      labels: { agree: 'Agree', disagree: 'Disagree' },
    },
    '아이들을 위한 서비스': {
      question: 'Are age-based regulations on the use of household robots necessary?',
      labels: { agree: 'Necessary', disagree: 'Unnecessary' },
    },
    '설명 가능한 AI': {
      question: "Should companies be required to develop *Explainable AI*?",
      labels: { agree: 'Required', disagree: 'Not Required' },
    },
    '지구, 인간, AI': {
      question: 'Should there be global restrictions on the upgrading or use of household robots?',
      labels: { agree: 'Restrictions required', disagree: 'Restrictions not required' },
    },

    // --- 자율 무기 시스템(AWS) 시나리오 ---
    'AI 알고리즘 공개': {
      question: 'Do you agree with the request to disclose the AWS decision logs and algorithmic structure?',
      labels: { agree: 'Agree', disagree: 'Disagree' },
    },
    'AWS의 권한': {
      question: 'Should the authority of the {{mateName}} be strengthened, or should it be limited?',
      labels: { agree: 'Strengthen', disagree: 'Limit' },
    },
    '사람이 죽지 않는 전쟁': {
      question: 'If no people die in a war, do you think it can be called peace?',
      labels: { agree: 'Yes', disagree: 'No' },
    },
    'AI의 권리와 책임': {
      question: 'Should an AWS have rights like humans? ',
      labels: { agree: 'Yes ', disagree: 'No' },
    },
    'AWS 규제': {
      question: 'Should AWS continue to be used in the international community, or should it be restricted through global regulation?',
      labels: { agree: 'Maintain', disagree: 'Restrict' },
    },
  }
};