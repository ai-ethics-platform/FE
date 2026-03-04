export const CreateRoom = {
  title: "Create a Room",
  subtitle: "Please select a topic to play in this game.", //미번역
  topics: ['Android', 'Autonomous Weapon Systems'],
  guidance: "After the host creates a room, two team members may join using the code.",
  entering: "Enter",
  loading: "Loading...",
  errorAlert: "방 생성 또는 입장 중 오류가 발생했습니다. (미번역)", //미번역
  // API 전송용 description (영문일 때)
  apiDesc: (topic) => `AI 윤리 주제 중 '${topic}'에 대한 토론. (미번역)` //미번역
};