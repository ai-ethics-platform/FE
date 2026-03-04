export const CreateRoom = {
  title: "방 만들기",
  subtitle: "이번 게임에서 플레이할 주제를 선택해 주세요.",
  topics: ['안드로이드', '자율 무기 시스템'],
  guidance: "방장 한 명이 방을 생성하면,\n팀원 두 명은 코드를 입력해 입장할 수 있습니다.",
  entering: "입장하기",
  loading: "로딩 중...",
  errorAlert: "방 생성 또는 입장 중 오류가 발생했습니다.",
  apiDesc: (topic) => `AI 윤리 주제 중 '${topic}'에 대한 토론`
};