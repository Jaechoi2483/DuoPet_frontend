# 📘 DuoPet 프론트엔드 개발 규칙 (RULE_FRONTEND.md)

## 1. 📁 폴더 구조

```
src/
┣ api/                 # axios 인스턴스, API 호출 함수
┣ assets/              # 폰트, 이미지 등 정적 자원
┣ components/          # 공통/재사용 컴포넌트 (Atoms, Molecules)
┃ ┣ common/
┃ ┣ layout/
┃ ┗ ui/
┣ constants/           # 공통 상수 (e.g., API 경로, 메시지)
┣ contexts/            # 전역 상태 관리 (Auth, Theme)
┣ hooks/               # 커스텀 훅
┣ pages/               # 각 기능별 페이지 컴포넌트 (Organisms)
┣ queries/             # React-Query 쿼리/뮤테이션 훅
┣ styles/              # 전역 스타일 (reset.css, global.css)
┣ types/               # TypeScript 타입/인터페이스 정의
┣ utils/               # 날짜 포맷팅 등 순수 함수
┣ App.js / index.js    # 진입점 및 전역 라우팅
```

## 2. 📌 컴포넌트 규칙

- 페이지 단위는 `pages/{기능}/{기능명}.js`
- 스타일은 `Styled-components` 또는 `Tailwind CSS` 사용을 원칙으로 함 (컴포넌트 단위 스타일링)
- `props`는 TypeScript `interface`로 타입을 명확히 선언하고, 주석으로 설명 추가
- 모든 컴포넌트는 함수형 컴포넌트와 Hooks를 사용

## 3. 🚦 라우터 관리

- `react-router-dom` v6 사용
- 라우팅 설정은 `App.js` 또는 별도의 `Router.js`에서 통합 관리
- `BrowserRouter`는 `index.js`에서 최상단에 한 번만 선언

## 4. 📡 API 통신 및 상태 관리

- **API 통신**: `api/` 폴더에 `axios` 인스턴스를 생성하여 관리. 요청/응답 인터셉터를 활용해 JWT 토큰 자동 주입 및 에러 처리
- **상태 관리**:
  - **전역 상태 (인증, 테마 등)**: `Context API` + `useReducer` 또는 `Zustand` 사용
  - **서버 상태 (API 데이터)**: `React-Query` 또는 `SWR` 사용을 원칙으로 함. 서버 데이터를 `useState`로 관리하지 않음
- **타입 정의**: API 요청/응답 데이터의 `interface`는 `types/api/` 폴더에서 통합 관리하며, 백엔드 DTO와 일관성 유지

## 5. 🧪 기타 규칙

- ESLint + Prettier 적용 필수 (VSCode의 `Format On Save` 설정)
- 커밋 메시지 예시:
  - `feat(notice): 공지사항 목록 조회 페이지 구현`
  - `fix(member): 로그인 폼 유효성 검사 오류 수정`
  - `style(common): 공통 버튼 컴포넌트 디자인 개선`