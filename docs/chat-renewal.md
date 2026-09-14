# 챗봇 리뉴얼

`npm run dev` 실행 후 `/selectroom?isRenewal=true` 또는
`/selectroom?isRenewal=True`에서 **딜레마 만들기 → 시작하기**를 선택하면
`/chatpage2/renewal`로 이동한다. 옵션이 없거나 다른 값이면 기존 `/chatpage2`로 이동한다.
기존 플레이 승인 절차를 그대로 적용한다.

리뉴얼은 `ChatPage2Renewal.jsx`, `components/renewal/`에 독립적으로 구현했다.
기존 `ChatPage2.jsx`, `chat.css`, 챗봇 API, 파서는 수정하지 않았다.
리뉴얼 JavaScript와 CSS는 새 경로에서만 불러오며 모든 CSS 선택자는
`.renewal-chat` 아래로 한정한다. 기존 흐름과 독립적으로 수정할 수 있도록
컨트롤러와 출력 정규화 로직을 별도로 유지한다.

작성 중 데이터는 `sessionStorage`의 `dilemma.renewal.*` 키에만 기록한다.
새로 진입하면 새 대화를 시작하며 새로고침 시 작성 내용이 사라질 수 있어
브라우저 이탈 경고를 제공한다. 초안이 완성되고 `/custom-games` 생성이 성공한 뒤에만
기존 편집 도구용 저장값을 채우고 `/create00`으로 연결한다.
기존 챗봇 대화 키(`dilemma.flow.v1`, `chat_session_id`)는 이때도 유지한다.

주요 UX 변경은 5단계 진행 표시, 단계별 빠른 답변,
다음 단계 버튼, 고정 입력 영역, 한글 조합 입력 보호, 오류 재시도, 단계 되돌리기 확인,
이전 대화를 읽는 동안 자동 스크롤하지 않기, 모바일 제작 현황 패널이다.

9/15 노션의 리뉴얼 피드백을 반영했다. 기존 게임 로고와 `Creator`를 표시하고,
사이드바에는 제작 단계만 남겼다. 우측 상단의 `AI 제작 가이드` 표시는 제거했다.
사이드바는 차콜, 제목 영역은 밝은 회색, 대화·입력 영역은 흰색으로 구분한다.
로고의 테라코타색을 버튼과 입력창의 강조색으로 사용하고, 어두운 사이드바에서는
밝은 살구색으로 현재 단계와 진행률을 표시한다. 색상은 리뉴얼 화면의 CSS 변수로
관리하며, 챗봇 이름은 15px로 표시한다.

새 답변은 마지막 줄 대신 답변의 시작을 보여준다. 직전 사용자 질문이 짧으면 함께
보여주고, 질문이 길면 답변부터 보여준다. 응답을 기다리며 이전 대화를 읽는 경우
스크롤 위치를 유지한다. `최근 대화 보기`도 최신 답변의 시작으로 돌아간다.

제작 완료 화면이 바로 사라지는 이슈는 `3259fdd`에서 인증 정보 보존으로 이미
수정했다. 편집·미리보기 완료 후 링크 표시·복사·새로고침·명시적인 메인 이동을
로컬 모의 API로 다시 검증했다. 노션의 `샘플 이미지` 항목은 오류 설명 없이
참고 게임 링크만 제공된 항목이다.

프롬프트와 연결된 입력 예시는 기존 `ChatPage2.jsx`의 5단계 placeholder를 그대로
유지한다. 입력창 위의 빠른 답변은 `renewalSuggestions.js`가 **최신 AI 응답**에서
추출한다. 번호·글머리표·인용부호로 제시한 주제나 가치 갈등을 고르라는 질문이면
원문 항목을 최대 3개 표시한다. 설명 문장과 게임 속 선택지·역할·결말은 제외한다.
자유롭게 설명해야 하는 질문이나 명확한 선택지가 없는 경우 버튼을 숨긴다.

초안 확인 질문에는 기존 단계의 `확정해줘` / `확정` 명령을 사용한다.
주제 단계의 확정과 다음 단계 안내는 기존 `다음 단계` 명령 및 준비 상태 검사를
따른다. `수정할 내용 입력`은 입력창에 초점만 옮기며 작성 중인 내용을 유지한다.
응답 대기·오류 중에는 이전 질문의 버튼을 숨긴다. 프롬프트 수정이나 추가 API 호출 없이
프런트엔드에서 인식 가능한 질문 형식만 처리하므로 모든 자유형 표현을 이해하는 방식은 아니다.

검증:

```sh
npm run build
npx eslint src/pages/ChatPage2Renewal.jsx src/components/renewal/RenewalChat.jsx src/utils/renewalDraft.js src/utils/renewalSuggestions.js
node --test tests/storage.test.mjs tests/renewalDraft.test.mjs tests/renewalSuggestions.test.mjs
node tests/renewal.browser.cjs
```

브라우저 검증은 로컬 개발 서버와 Chrome/Playwright가 필요하다.
다른 위치에 설치된 Playwright는 `PLAYWRIGHT_MODULE` 환경변수로 지정할 수 있다.
`RENEWAL_ORIGIN`으로 로컬 주소, `RENEWAL_SCREENSHOTS`로 캡처 저장 경로를 지정할 수 있다.
API 요청은 모두 테스트 응답으로 처리하므로 실제 AI 응답 품질이나 운영 API의
게임 생성을 검증하지 않으며, 서비스에 게임을 생성하지 않는다.
