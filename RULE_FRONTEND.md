# 📘 DuoPet 프론트엔드 개발 규칙 (RULE_FRONTEND.md)

## 1. 📁 폴더 구조

```
src/
┣ api/                 # axios 인스턴스, API 호출 함수
┣ assets/              # 폰트, 이미지 등 정적 자원
┣ components/          # 공통/재사용 컴포넌트 (Atoms, Molecules)
┃ ┣ common/
┃ ┣ layout/
┃ ┣ ui/
┃ ┗ map/               # 지도 관련 컴포넌트
┣ constants/           # 공통 상수 (e.g., API 경로, 메시지)
┣ contexts/            # 전역 상태 관리 (Auth, Theme)
┣ hooks/               # 커스텀 훅
┣ pages/               # 각 기능별 페이지 컴포넌트 (Organisms)
┃ ┣ info/              # 정보광장 관련 페이지
┃ ┣ health/            # 건강관리 관련 페이지
┃ ┗ ...
┣ queries/             # React-Query 쿼리/뮤테이션 훅
┣ styles/              # 전역 스타일 (reset.css, global.css)
┣ types/               # TypeScript 타입/인터페이스 정의
┣ utils/               # 날짜 포맷팅 등 순수 함수
┣ App.js / index.js    # 진입점 및 전역 라우팅
```

## 2. 📌 컴포넌트 규칙

- 페이지 단위는 `pages/{기능}/{기능명}.js`
- 스타일은 `CSS Modules` 사용을 원칙으로 함 (컴포넌트 단위 스타일링)
- `props`는 TypeScript `interface`로 타입을 명확히 선언하고, 주석으로 설명 추가
- 모든 컴포넌트는 함수형 컴포넌트와 Hooks를 사용

## 3. 🚦 라우터 관리

- `react-router-dom` v6 사용
- 라우팅 설정은 `App.js` 또는 별도의 `Router.js`에서 통합 관리
- 기능별 라우팅은 별도 파일로 분리 (예: `infoRoutes.js`, `healthRoutes.js`)
- `BrowserRouter`는 `index.js`에서 최상단에 한 번만 선언

## 4. 📡 API 통신 및 상태 관리

- **API 통신**: `api/` 폴더에 `axios` 인스턴스를 생성하여 관리. 요청/응답 인터셉터를 활용해 JWT 토큰 자동 주입 및 에러 처리
- **상태 관리**:
  - **전역 상태 (인증, 테마 등)**: `Context API` + `useReducer` 또는 `Zustand` 사용
  - **서버 상태 (API 데이터)**: `React-Query` 또는 `SWR` 사용을 원칙으로 함. 서버 데이터를 `useState`로 관리하지 않음
- **타입 정의**: API 요청/응답 데이터의 `interface`는 `types/api/` 폴더에서 통합 관리하며, 백엔드 DTO와 일관성 유지

## 5. 🎨 디자인 시스템 (DuoPetDesign 기반)

### 5.1 색상 시스템

```css
/* 주요 색상 */
--primary-blue: #3b82f6;
--primary-blue-hover: #2563eb;
--danger-red: #ef4444;
--success-green: #10b981;
--warning-yellow: #fbbf24;

/* 배경 색상 */
--bg-primary: #ffffff;
--bg-secondary: #f9fafb;
--bg-accent: #f3f4f6;

/* 텍스트 색상 */
--text-primary: #1f2937;
--text-secondary: #6b7280;
--text-muted: #9ca3af;

/* 테두리 색상 */
--border-primary: #e5e7eb;
--border-secondary: #d1d5db;
```

### 5.2 타이포그래피

```css
/* 제목 스타일 */
.title-large {
  font-size: 2.5rem;
  font-weight: bold;
}
.title-medium {
  font-size: 1.75rem;
  font-weight: 700;
}
.title-small {
  font-size: 1.1rem;
  font-weight: 600;
}

/* 본문 스타일 */
.text-body {
  font-size: 1rem;
  line-height: 1.5;
}
.text-small {
  font-size: 0.875rem;
  line-height: 1.4;
}
.text-caption {
  font-size: 0.75rem;
  line-height: 1.3;
}
```

### 5.3 레이아웃 패턴

```css
/* 카드 스타일 */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border: 1px solid #e5e7eb;
}

/* 버튼 스타일 */
.btn-primary {
  background: #3b82f6;
  color: white;
  border: 1px solid #3b82f6;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

/* 입력 필드 스타일 */
.input-field {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

### 5.4 특수 컴포넌트 패턴

#### 병원/보호소 카드 스타일

```css
.hospital-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.hospital-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.hospital-card.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

#### 검색 및 필터 섹션

```css
.search-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.filter-button {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.filter-button.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}
```

#### 별점 시스템

```css
.star-rating {
  display: flex;
  align-items: center;
  gap: 2px;
}

.star-filled {
  color: #fbbf24;
}
.star-empty {
  color: #d1d5db;
}
```

### 5.5 반응형 디자인

```css
/* 모바일 우선 접근 */
@media (max-width: 768px) {
  .grid-layout {
    grid-template-columns: 1fr;
  }

  .title-large {
    font-size: 2rem;
  }

  .filter-buttons {
    justify-content: center;
  }
}
```

## 6. 🗺️ 지도 컴포넌트 가이드 (카카오맵 기반)

### 6.1 MapContainer 컴포넌트 사용법

```javascript
// props 인터페이스
interface MapContainerProps {
  hospitals?: Hospital[];
  selectedHospital?: string;
  onHospitalSelect?: (id: string) => void;
  userLocation?: { lat: number; lng: number };
  center?: { lat: number; lng: number };
  zoom?: number;
}

// 사용 예시
<MapContainer
  hospitals={filteredHospitals}
  selectedHospital={selectedHospital}
  onHospitalSelect={setSelectedHospital}
  userLocation={userLocation}
/>
```

### 6.2 카카오맵 API 키 설정

```bash
# .env 파일
REACT_APP_KAKAO_MAP_KEY=your_kakao_map_api_key

# 카카오 개발자 콘솔 설정
- Web 플랫폼 등록
- 사이트 도메인: http://localhost:3000
- JavaScript 키 사용
```

### 6.3 지도 스타일링

```css
.map-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 600px;
}

.map-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}
```

## 7. 🧪 기타 규칙

- ESLint + Prettier 적용 필수 (VSCode의 `Format On Save` 설정)
- 커밋 메시지 예시:
  - `feat(info): 병원 찾기 페이지 구현`
  - `fix(map): 카카오맵 API 키 설정 오류 수정`
  - `style(hospital): 병원 카드 컴포넌트 디자인 개선`
- CSS Modules 네이밍: `ComponentName.module.css`
- 환경변수는 `REACT_APP_` 접두사 필수

## 8. 📚 DuoPetDesign 참조 파일

- **병원 찾기 페이지**: `/mnt/d/final_workspace/DuoPetDesign/client/src/pages/map/hospitals.tsx`
- **지도 컴포넌트**: `/mnt/d/final_workspace/DuoPetDesign/client/src/components/ui/map.tsx`
- **UI 컴포넌트들**: `/mnt/d/final_workspace/DuoPetDesign/client/src/components/ui/`

이 가이드는 **DuoPet 프로젝트의 일관된 개발 품질과 사용자 경험**을 위한 기준입니다.
