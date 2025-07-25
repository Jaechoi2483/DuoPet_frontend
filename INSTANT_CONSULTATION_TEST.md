# 즉시 상담 테스트 절차

## 사전 준비

### 1. 백엔드 재시작
백엔드가 CORS 설정을 올바르게 적용하도록 재시작:
```bash
# IntelliJ 또는 터미널에서 백엔드 재시작
# 백엔드 로그에서 "Started DuoPetBackendApplication" 확인
```

### 2. 프론트엔드 환경 설정
`.env` 파일이 올바르게 설정되었는지 확인:
```
REACT_APP_API_BASE_URL=http://localhost:8080
```

## 테스트 실행

### 1단계: 일반 사용자 프론트엔드 실행 (포트 3000)

**터미널 1:**
```bash
cd /mnt/d/final_project/DuoPet_frontend
npm run start:user
```

**브라우저:**
1. http://localhost:3000 접속
2. 일반 사용자 계정(snopia)으로 로그인
3. 개발자 도구(F12) 열고 Console 탭 확인

### 2단계: 전문가 프론트엔드 실행 (포트 3001)

**터미널 2:**
```bash
cd /mnt/d/final_project/DuoPet_frontend
npm run start:vet
```

**브라우저:**
1. 새 브라우저 창에서 http://localhost:3001 접속
2. 전문가 계정(snopia_vet)으로 로그인
3. 개발자 도구(F12) 열고 Console 탭 확인

### 3단계: 즉시 상담 테스트

**일반 사용자(3000)에서:**
1. "전문가 상담" 메뉴 클릭
2. 온라인 상태인 전문가 확인
3. "즉시 상담" 버튼 클릭
4. 반려동물 선택
5. 증상 입력 (예: "기침을 자주 해요")
6. "상담 요청" 버튼 클릭

**확인 사항:**
- Console에서 다음 로그 확인:
  - `[consultationApi] API_BASE_URL: http://localhost:8080/api/consultation`
  - `[consultationApi] 인터셉터 실행 - role: USER`
  - `[consultationApi] 현재 포트: 3000`

**전문가(3001)에서:**
1. 상담 요청 알림이 표시되는지 확인
2. "수락" 또는 "거절" 버튼 클릭

## 문제 해결

### 1. 여전히 302 응답을 받는 경우

**원인:** 토큰이 올바르게 전송되지 않음

**해결:**
1. localStorage 확인:
   ```javascript
   // 브라우저 콘솔에서 실행
   console.log('accessToken:', localStorage.getItem('accessToken'));
   console.log('refreshToken:', localStorage.getItem('refreshToken'));
   console.log('role:', localStorage.getItem('role'));
   ```

2. 토큰이 없다면 다시 로그인

### 2. CORS 에러가 발생하는 경우

**원인:** 백엔드 CORS 설정이 적용되지 않음

**해결:**
1. 백엔드 재시작
2. SecurityConfig의 addCorsMappings 메소드 확인
3. 3000과 3001 포트가 모두 포함되어 있는지 확인

### 3. WebSocket 연결 실패

**원인:** WebSocket 엔드포인트 인증 문제

**해결:**
1. 각 포트에서 독립적으로 WebSocket 연결 확인
2. Network 탭에서 WS 연결 상태 확인

## 성공 기준

1. 일반 사용자가 즉시 상담 요청 성공
2. 전문가가 알림을 받음
3. 전문가가 수락 시 양쪽 모두 채팅 페이지로 이동
4. 채팅 메시지가 양방향으로 전송됨

## 디버깅 팁

1. **Network 탭 활용:**
   - Filter에 "consultation" 입력
   - 각 요청의 Request/Response Headers 확인
   - Status Code가 200인지 확인

2. **Console 로그 확인:**
   - 인증 토큰 관련 로그
   - API 요청 URL 로그
   - WebSocket 연결 로그

3. **Application 탭 활용:**
   - Local Storage 값 확인
   - Cookies 확인 (withCredentials 사용 시)