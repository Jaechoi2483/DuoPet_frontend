# CORS 및 302 리다이렉트 문제 해결 가이드

## 🚨 현재 문제
- 포트 분리 완료 (3000, 3001)
- 토큰은 정상 전송됨
- 하지만 302 리다이렉트 발생 → 로그인 페이지로

## 🎯 근본 원인
1. **백엔드가 재시작되지 않음** (가장 가능성 높음)
2. JWT 토큰 만료
3. CORS preflight 요청 처리 문제

## ✅ 해결 순서

### 1. 백엔드 완전 재시작
```bash
# Windows PowerShell
# 1. 현재 8080 포트 사용 프로세스 확인
netstat -ano | findstr :8080

# 2. 프로세스 강제 종료
taskkill /PID [프로세스번호] /F

# 3. 백엔드 재시작
cd D:\final_project\DuoPet_backend
mvn spring-boot:run
```

### 2. 백엔드 시작 로그 확인
```
Started DuoPetBackendApplication in X.XXX seconds
```

### 3. 프론트엔드에서 토큰 상태 확인
브라우저 콘솔(F12)에서:
```javascript
// 토큰 존재 여부 확인
console.log('Access Token:', localStorage.getItem('accessToken') ? '있음' : '없음');
console.log('Refresh Token:', localStorage.getItem('refreshToken') ? '있음' : '없음');
console.log('Role:', localStorage.getItem('role'));

// 토큰 만료 확인 (debug-token.js 내용 복사해서 실행)
```

### 4. 네트워크 요청 재시도
1. 페이지 새로고침 (F5)
2. 전문가 상담 페이지 이동
3. 즉시 상담 버튼 클릭
4. Network 탭에서 instant 요청 확인

### 5. 백엔드 로그 모니터링
백엔드 콘솔에서 확인할 내용:
```
JWTFilter 실행: /api/consultation/consultation-rooms/instant
받은 헤더 - Authorization: 있음
받은 헤더 - RefreshToken: 있음
추출된 Access Token (Bearer 제외): eyJhb...
토큰 검증 성공
```

## 🔧 추가 디버깅

### A. 토큰이 만료된 경우
1. 로그아웃
2. 다시 로그인
3. 새 토큰으로 재시도

### B. CORS 문제인 경우
백엔드 SecurityConfig.java 확인:
- addCorsMappings에 3000, 3001 포함 여부
- OPTIONS 메소드 허용 여부

### C. JWT 필터 문제인 경우
백엔드 로그에서:
- "토큰 누락" 메시지
- "토큰 만료" 메시지
- "인증 실패" 메시지

## 📝 체크리스트
- [ ] 백엔드 재시작 완료
- [ ] 백엔드 로그에 에러 없음
- [ ] 프론트엔드 토큰 유효
- [ ] Network 탭에서 토큰 헤더 확인
- [ ] 302가 아닌 200/201 응답 확인

## 🆘 최후의 수단
모든 방법이 실패하면:
1. 브라우저 캐시 완전 삭제
2. 프론트엔드/백엔드 모두 재시작
3. 새 시크릿 창에서 테스트
4. 백엔드 JWTFilter.java에 더 많은 로그 추가