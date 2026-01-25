### 영어 버전(v2, 영어만) 개발 인수인계 (FE)

이 문서는 **영어만 존재하는 v2**를 만들기 위한 FE 인수인계 문서임.  
아래 “수정 범위”만을 이번 작업 스코프로 고정함.

---

### 수정 범위(확정)

- **이미지 교체**
- **SVG(텍스트 포함 가능)**
- **페이지 작업 대상**
  - `GameIntro`
  - `SelectHomeMate`
  - `MateName`
  -`src/pages/Login.jsx`
-`src/pages/Waitingroom.jsx`
-`src/pages/Signup01.jsx`
-`src/pages/Signup02.jsx`
-`src/pages/Selectroom.jsx`
  - `Game01 ~ Game09` (각 페이지 내 텍스트/버튼/설명/레이블 포함)
- **`alert` 문구 영문화**
- **영어 적용으로 인해 달라지는 UI 크기 대응**
  - 줄바꿈/overflow/버튼폭/모달 사이즈 등
  - 필요 시 **asset(이미지/SVG) 재배치 또는 교체**

> 범위 밖: Create/Editor/ChatPage 등 다른 페이지의 영문화는 이번 스코프에 포함하지 않음(추가 요청이 있을 때만 확장).

---

### 작업 목표

- 위 “수정 범위”에 포함된 화면/기능에서 **사용자에게 보이는 한글**
- 해당 화면에서 사용되는 **이미지/SVG에 한글이 노출되지 않음**
- 영어 문장 길이 증가에도 **레이아웃이 깨지지 않도록**

---

### 대상 파일

#### 페이지
-`src/pages/Login.jsx`
-`src/pages/Waitingroom.jsx`
-`src/pages/Signup01.jsx`
-`src/pages/Signup02.jsx`
-`src/pages/Selectroom.jsx`
- `src/pages/GameIntro.jsx`
- `src/pages/SelectHomeMate.jsx`
- `src/pages/MateName.jsx`
- `src/pages/Game01.jsx` ~ `src/pages/Game09.jsx`

#### 공통(알림/에셋/스타일)

- `alert(` 호출이 포함된 페이지/컴포넌트(위 대상 파일들 우선)
- `src/assets/**` (이미지)
- `src/assets/**.svg` (SVG)
- `src/index.css`, `src/App.css`, 각 컴포넌트 CSS(영문 레이아웃 깨짐 대응 시)

---

### 번역/에셋 전달 방식(권장)

#### 1) 텍스트 번역(영문 카피)

- 화면별로 표로 받는 것을 권장(스프레드시트/CSV)
- 최소 컬럼:
  - `screen` (GameIntro, SelectHomeMate, MateName, Game01…Game09)
  - `file` (예: `Game01.jsx`)
  - `ko_source` (원문)
  - `en_target` (번역문)
  - `notes` (최대 길이/줄바꿈 의도/대체 문구)

#### 2) 이미지/SVG 교체

- **가장 빠른 방식**: 동일 경로/동일 파일명으로 영문 에셋을 “덮어쓰기”
  - 장점: 코드 수정 최소화
  - 단점: v1과 같은 브랜치에서 동시 운영이 어려움
- v1/v2를 같이 운영해야 하면:
  - 영문 전용 폴더를 분리하고(`assets-en/` 등) 코드에서 import 분기

---

### 권장 작업 순서

1. **대상 페이지별로 한글 문자열 수집**
   - JSX 텍스트 / 버튼 라벨 / placeholder / 타이틀 / 설명 문구 / `alert` 포함
2. **번역본 반영**
   - 우선 `alert` 및 버튼/CTA처럼 사용자 행동에 직접 영향 있는 문구부터 교체
3. **에셋 교체**
   - 이미지 안에 있는 한글, SVG 텍스트 기반 한글 제거/교체
4. **영문 레이아웃 대응**
   - 긴 문장으로 인한 overflow, 버튼 줄바꿈, 모달 높이/스크롤 처리
5. **QA(아래 체크리스트)**

---

### QA 체크리스트(이번 스코프 전용)

- **텍스트**
  - 대상 페이지에서 한글이 보이지 않음(본문/버튼/모달/툴팁/`alert`)
  - 영문 줄바꿈/문장부호가 자연스러움
- **레이아웃**
  - 긴 문장에서 텍스트가 잘리지 않음
  - 버튼이 겹치거나 화면 밖으로 나가지 않음(모바일 포함)
  - 모달/팝업에서 스크롤이 필요하면 의도대로 동작
- **에셋**
  - 이미지/SVG에서 한글이 보이지 않음(특히 배경 이미지/캐릭터 소개 이미지)
  - 교체 후 깨진 링크(404) 없음

