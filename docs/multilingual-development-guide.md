# DILEMMA.I. 다국어 버전 개발 개요 및 추후 유지보수 가이드

* 작업 브랜치: `feature/env-refactoring`
* 현재 지원 언어: 한국어(`ko`), 영어(`en`)
* 기본 언어: 한국어
* 언어 저장 키: `app_lang`

---

본 문서는 DILEMMA.I. FE의 한국어·영어 다국어 지원 작업과, 작업 과정에서 함께 진행한 오류 수정 및 기능 개선 내용을 정리한 문서임.

## 1. 작업 개요

기존 한국어 중심의 DILEMMA.I. 서비스에 다국어 지원 구조를 추가함.

현재는 영어만 추가되어 있으나, 영어 전용 구조가 아니라 향후 다른 언어도 확장할 수 있도록 언어팩과 이미지 에셋을 언어별로 분리함.

주요 작업 내용은 다음과 같음.

* 로그인 화면에 언어 선택 기능 추가
* 페이지 이동 및 새로고침 후에도 선택 언어 유지
* JSX 내부의 사용자 표시 문구를 언어팩으로 분리
* 문구가 포함된 이미지와 SVG를 언어별로 분리
* 영어 문장 길이에 맞게 버튼과 화면 배치 조정
* 사용자에게 표시되는 오류 및 팝업 문구 다국어 처리
* API 및 WebSocket 주소를 환경변수로 분리
* 빌드 확인, 환경변수 관리 및 메타태그 보완

---

## 2. 기존 서비스와 다국어 버전의 차이

### 2.1 언어 및 화면 구성

| 구분     | 기존 서비스          | 다국어 버전          |
| ------ | --------------- | --------------- |
| 지원 언어  | 한국어 중심          | 한국어·영어          |
| 언어 선택  | 별도 기능 없음        | 로그인 화면에서 선택     |
| 언어 저장  | 별도 저장 없음        | `app_lang`으로 저장 |
| 기본 언어  | 한국어 고정          | 저장값이 없으면 한국어    |
| 언어 유지  | 별도 처리 없음        | 이동·새로고침 후 유지    |
| 문구 관리  | JSX 내부에 직접 작성   | 언어팩으로 분리        |
| 이미지 문구 | 한국어 에셋 사용       | 언어별 에셋 사용       |
| 화면 배치  | 한국어 문장 기준       | 영어 길이에 맞게 조정    |
| 오류 안내  | 서버 응답 또는 한국어 출력 | 프론트 언어팩 우선 사용   |

### 2.2 개발 및 유지보수 구조

| 구분           | 기존 서비스            | 다국어 버전            |
| ------------ | ----------------- | ----------------- |
| API 주소       | 코드 일부에 직접 작성      | Vite 환경변수 사용      |
| WebSocket 주소 | Provider 등에 직접 작성 | Vite 환경변수 사용      |
| `.env` 관리    | 저장소에 포함될 수 있음     | Git 추적 대상에서 제외    |
| 환경변수 예시      | 별도 안내 없음          | `.env.example` 제공 |
| 빌드 검증        | 수동 확인 중심          | GitHub Actions 추가 |
| 메타태그         | 기본 정보 부족          | 서비스 정보 및 공유 태그 보완 |

---

## 3. 다국어 구조

### 3.1 언어 저장

현재 선택 언어는 `localStorage`의 `app_lang` 값으로 관리함.

```javascript
const lang = localStorage.getItem('app_lang') || 'ko';
```

저장값이 없을 경우 한국어를 기본값으로 사용함.

로그인하지 않은 상태에서도 언어 선택을 유지할 수 있고, 별도의 전역 상태관리 라이브러리 없이 기존 프로젝트 구조를 크게 변경하지 않는 방식임.

일부 기존 코드와의 호환을 위해 `language` 키가 함께 남아 있을 수 있으나, 신규 코드에서는 `app_lang`을 기준으로 사용하는 것을 권장함.

---

### 3.2 언어팩 구성

언어팩은 페이지와 컴포넌트 단위로 분리되어 있음.

```text
src/utils/language/
├── index.js
├── ko/
│   ├── pages/
│   └── components/
└── en/
    ├── pages/
    └── components/
```

`src/utils/language/index.js`에서 각 언어 파일을 불러와 하나의 `translations` 객체로 관리함.

```javascript
export const translations = {
  ko: {
    Login: LoginKo,
    WaitingRoom: WaitingRoomKo,
    MicTestPopup: MicTestPopupKo
  },
  en: {
    Login: LoginEn,
    WaitingRoom: WaitingRoomEn,
    MicTestPopup: MicTestPopupEn
  }
};
```

페이지 또는 컴포넌트에서는 현재 언어에 해당하는 데이터를 사용함.

```javascript
const lang = localStorage.getItem('app_lang') || 'ko';
const t = translations?.[lang]?.MicTestPopup || {};
```

화면 문구는 가능한 한 JSX에 직접 작성하지 않고 언어팩 값을 사용함.

```jsx
<PrimaryButton>
  {t.confirmBtn || '준비하기'}
</PrimaryButton>
```

뒤의 한국어 문구는 번역 키 누락 시 화면이 빈칸이 되는 것을 방지하기 위한 기본값임.

---

### 3.3 이미지 에셋

일부 이미지와 SVG에는 문구가 이미지 내부에 포함되어 있어 언어팩만으로 번역할 수 없음.

영어 전용 에셋은 다음 경로에서 관리함.

```text
src/assets/en/
```

현재 언어에 따라 기본 에셋 또는 영어 에셋을 선택하도록 처리함.

영어 문장의 길이에 맞춰 다음 UI 요소도 함께 조정함.

* 버튼 폭
* 글자 크기
* 줄바꿈
* 팝업 크기
* 텍스트 영역 높이
* 이미지 크기 및 위치

---

## 4. 실제 사용자 흐름과 번역 범위

실제 사용자에게 제공되는 화면은 라우터 등록 여부만으로 판단하지 않음.

다음 내용을 함께 확인함.

* 접근 경로가 등록되어 있는지
* 버튼이나 `navigate()`에서 실제로 호출되는지
* 다른 페이지 안에서 실제로 렌더링되는지
* 코드가 주석 처리되거나 비활성화되어 있지 않은지
* 직접 URL 입력으로만 접근하는 개발용 화면인지

### 4.1 주요 사용자 흐름

| 단계    | 주요 페이지·컴포넌트                    | 주요 기능        |
| ----- | ------------------------------ | ------------ |
| 로그인   | `Login.jsx`                    | 로그인, 언어 선택   |
| 계정    | `Signup01.jsx`, `Signup02.jsx` | 회원가입         |
| 계정 보조 | `FindIdModal.jsx`              | 아이디 찾기       |
| 비회원   | `GuestLogin.jsx`               | 비회원 로그인      |
| 방 선택  | `SelectRoom.jsx`               | 방 만들기·참여     |
| 안내    | `IntroductionPopup.jsx`        | 게임 소개        |
| 방 생성  | `CreateRoom2.jsx`              | 일반 게임방 생성    |
| 방 참여  | `JoinRoom.jsx`                 | 참여 코드 입력     |
| 대기실   | `WaitingRoom.jsx`              | 참가자·역할·준비 상태 |
| 마이크   | `MicTestPopup.jsx`             | 마이크 연결 확인    |
| 게임 시작 | `GameIntro.jsx`                | 게임 소개        |
| 게임 진행 | `Game01.jsx` ~ `Game09.jsx`    | 딜레마 진행       |
| 결과    | 결과 관련 페이지·컴포넌트                 | 선택 결과 표시     |

### 4.2 번역 적용 주요 페이지

```text
Login.jsx
Signup01.jsx
Signup02.jsx
SelectRoom.jsx
WaitingRoom.jsx
GameIntro.jsx
SelectHomeMate.jsx
MateName.jsx
GameMap.jsx
Game01.jsx ~ Game09.jsx
CD1.jsx
CD2.jsx
CD3.jsx
CD_all.jsx
```

### 4.3 번역 적용 주요 컴포넌트

```text
GuestLogin.jsx
FindIdModal.jsx
IntroductionPopup.jsx
CreateRoom2.jsx
JoinRoom.jsx
LogoutPopup.jsx
OutPopup.jsx
CancelReadyPopup.jsx
MicTestPopup.jsx
```

---

## 5. 번역 작업 범위에서 제외된 기능

### 5.1 후속 다국어 확장 검토 대상

다음 기능은 향후 서비스 운영 방향과 요구사항에 따라 추가 적용이 검토될 수 있는 대상이므로 이번 번역 작업 범위에서 제외함.

* 커스텀 딜레마 만들기
* 커스텀 딜레마 편집
* 커스텀 딜레마 초대 및 실행
* 제작 과정의 채팅 기능
* 커스텀 딜레마 제작 완료 화면

관련 주요 파일은 다음과 같음.

```text
src/pages/CustomRoom.jsx
src/pages/Create00.jsx ~ Create05.jsx
src/pages/Editor01.jsx ~ Editor10_1.jsx
src/pages/ChatPage.jsx
src/pages/ChatPage2.jsx
src/pages/ChatPage3.jsx
src/pages/CreatorEnding.jsx
```

추후 해당 기능을 다국어 지원 범위에 포함할 경우 진입 화면뿐 아니라 제작·초대·실행까지 전체 흐름을 함께 확인해야 함.

---

### 5.2 비활성화 또는 개발용 기능

다음 기능은 현재 일반 사용자 흐름에서 사용되지 않아 번역 범위에서 제외함.

| 파일                      | 제외 사유            |
| ----------------------- | ---------------- |
| `FindPasswordModal.jsx` | 로그인 화면에서 기능 비활성화 |
| `MicTest.jsx`           | 독립 테스트 페이지       |
| `GameIntro2.jsx`        | 연결 상태 확인·디버깅 페이지 |
| `Componentcheck.jsx`    | UI 컴포넌트 확인 페이지   |

실제 대기실의 마이크 테스트는 `MicTest.jsx`가 아니라 `MicTestPopup.jsx`를 사용함.

향후 해당 기능을 실제 사용자 화면에 연결할 경우 언어팩 추가 여부를 함께 검토해야 함.

---

## 6. 다국어 작업과 함께 개선된 사항

### 6.1 API 및 WebSocket 환경변수 적용

코드에 직접 작성되어 있던 서버 주소를 환경변수로 분리함.

```env
VITE_API_BASE_URL=https://dilemmai-idl.com
VITE_WS_BASE_URL=wss://dilemmai-idl.com
```

주요 적용 파일은 다음과 같음.

```text
src/api/axiosInstance.js
src/WebSocketProvider.jsx
src/WebRTCProvider.jsx
src/useVoiceWebsocket.jsx
```

환경변수가 없을 경우 기존 운영 주소를 기본값으로 사용하도록 처리함.

---

### 6.2 `.env` 관리 방식 개선

실제 환경변수가 포함된 파일은 Git 추적 대상에서 제외함.

```gitignore
.env
.env.local
```

필요한 변수 이름과 예시는 다음 파일에서 확인 가능함.

```text
.env.example
```

배포 환경에서도 코드에서 사용하는 이름과 동일하게 등록해야 함.

```text
VITE_API_BASE_URL
VITE_WS_BASE_URL
```

---

### 6.3 사용자 오류 메시지 개선

서버에서 반환된 한국어 문구를 그대로 출력하기보다 가능한 범위에서 프론트 언어팩의 메시지를 사용하도록 변경함.

주요 대상은 다음과 같음.

* 로그인 오류
* 회원가입 오류
* 방 나가기 오류
* 준비 취소
* 마이크 권한 거부
* 마이크 장치 없음
* 마이크 연결 실패

---

### 6.4 마이크 테스트 팝업 개선

대기실의 준비하기 동작에서 `MicTestPopup.jsx`가 사용됨.

다음 내용을 보완함.

* 팝업 닫기와 준비 완료 동작 분리
* 팝업 종료 시 마이크 스트림 정리
* AudioContext 등 오디오 리소스 정리
* 마이크 오류 문구 다국어 처리

---

### 6.5 빌드 확인 추가

다음 GitHub Actions workflow를 추가함.

```text
.github/workflows/build-check.yml
```

브랜치 푸시 또는 Pull Request 과정에서 의존성 설치와 빌드 오류를 확인할 수 있음.

---

### 6.6 메타태그 보완

`index.html`에 서비스 정보와 링크 공유에 필요한 메타태그를 추가하거나 정리함.

주요 항목은 다음과 같음.

* 페이지 제목
* 서비스 설명
* canonical
* Open Graph
* X/Twitter 공유 이미지
* 대표 이미지 설명

---

## 7. 새로운 언어 추가 방법

예를 들어 일본어(`jp`)를 추가하는 경우 다음 순서로 작업함.

### 7.1 언어팩 폴더 생성

```text
src/utils/language/jp/
├── pages/
└── components/
```

한국어 또는 영어 언어팩을 기준으로 동일한 파일과 동일한 키 구조를 생성함.

```text
src/utils/language/jp/pages/Login.js
src/utils/language/jp/pages/WaitingRoom.js
src/utils/language/jp/components/MicTestPopup.js
```

언어별 키 구조가 다르면 특정 화면의 문구가 출력되지 않을 수 있음.

---

### 7.2 언어팩 등록

`src/utils/language/index.js`에서 새 언어 파일을 import함.

```javascript
import { Login as LoginJp } from './jp/pages/Login';
import { MicTestPopup as MicTestPopupJp } from './jp/components/MicTestPopup';
```

`translations` 객체에 새 언어를 추가함.

```javascript
export const translations = {
  ko: {
    Login: LoginKo,
    MicTestPopup: MicTestPopupKo
  },
  en: {
    Login: LoginEn,
    MicTestPopup: MicTestPopupEn
  },
  jp: {
    Login: LoginJp,
    MicTestPopup: MicTestPopupJp
  }
};
```

---

### 7.3 언어 선택 항목 추가

로그인 화면의 언어 선택 요소에 새로운 option을 추가함.

```jsx
<option value="jp">日本語</option>
```

선택 후 `localStorage`의 `app_lang`에 `jp`가 저장되는지 확인함.

---

### 7.4 언어별 이미지 추가

이미지나 SVG 내부에 문구가 포함된 경우 새 언어 에셋 폴더를 생성함.

```text
src/assets/jp/
```

예시:

```text
meready_jp.svg
uready_jp.svg
continue_jp.svg
```

이미지를 사용하는 컴포넌트에서도 `app_lang` 값에 따라 새 언어 에셋을 선택하도록 분기를 추가해야 함.

---

### 7.5 추가 언어 UI 확인

새로운 언어를 추가한 뒤 다음 항목을 확인함.

* 버튼 문구 잘림
* 본문 줄바꿈
* 팝업 크기
* 글꼴 지원
* 언어별 이미지 출력
* 날짜와 숫자 형식
* 번역 키 누락
* 한국어 fallback 노출 여부

---

## 8. 최소 검증 항목

### 언어 기능

* [ ] 한국어에서 영어로 전환 가능
* [ ] 영어에서 한국어로 전환 가능
* [ ] 페이지 이동 후 언어 유지
* [ ] 새로고침 후 언어 유지
* [ ] 영어 화면에 불필요한 한국어가 남지 않음

### 계정 및 방 기능

* [ ] 일반 로그인
* [ ] 회원가입
* [ ] 아이디 찾기
* [ ] 비회원 로그인
* [ ] 방 만들기
* [ ] 방 참여하기
* [ ] 로그아웃

### 대기실 및 게임

* [ ] 참가자 3명 입장
* [ ] 역할 배정
* [ ] 마이크 테스트 팝업
* [ ] 마이크 권한 허용·거부 처리
* [ ] 준비 및 준비 취소
* [ ] 3명 준비 완료 후 게임 시작
* [ ] 게임 진행 화면
* [ ] 결과 화면

### 기술 확인

* [ ] API 요청 주소 정상
* [ ] WebSocket 연결 정상
* [ ] 로컬 빌드 성공
* [ ] GitHub Actions 빌드 성공
* [ ] 브라우저 Console의 치명적 오류 없음
* [ ] 언어별 SVG와 이미지 정상 출력

---

## 9. 유지보수 시 주의사항

* 사용자에게 보이는 문구는 JSX에 직접 작성하지 않고 언어팩에 추가함
* 모든 언어팩에서 같은 키 구조를 유지함
* 새로운 페이지나 팝업을 추가할 때 다국어 적용 여부를 함께 검토함
* 이미지 내부에 문구가 있으면 언어별 에셋이 필요한지 확인함
* 현재 언어 관리 기준 키는 `app_lang`임
* 신규 코드에서는 `language` 키보다 `app_lang` 사용을 권장함
* API와 WebSocket 주소는 코드에 직접 작성하지 않고 환경변수로 관리함
* fallback으로 인해 번역 키 누락 시 한국어가 표시될 수 있음
* 영어 화면에서 한국어 문구가 남아 있지 않은지 직접 확인해야 함
* 서버 또는 사용자가 생성한 동적 콘텐츠는 언어팩에서 자동 번역되지 않음
* 대기실 이후 기능은 참가자 3명과 WebSocket 상태가 필요하므로 다중 사용자 환경에서 확인하는 것이 좋음
* 개발용 페이지는 일반 사용자 흐름에 포함되지 않는 한 반드시 번역할 필요는 없음
