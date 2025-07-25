# 백엔드 재시작 가이드

## 백엔드 재시작이 필요한 경우

1. CORS 설정 변경 후
2. SecurityConfig 변경 후
3. 302 리다이렉트 오류 발생 시

## 백엔드 재시작 방법

### 1. 현재 실행 중인 백엔드 종료
- IntelliJ IDEA에서 실행 중이라면 빨간 정지 버튼 클릭
- 터미널에서 실행 중이라면 Ctrl + C

### 2. 백엔드 재실행

**IntelliJ IDEA에서:**
1. DuoPetBackendApplication 파일 열기
2. main 메소드 왼쪽의 초록색 화살표 클릭
3. "Run DuoPetBackendApplication" 선택

**터미널에서:**
```bash
cd /mnt/d/final_project/DuoPet_backend
./mvnw spring-boot:run
```

### 3. 백엔드 정상 실행 확인

백엔드가 정상적으로 실행되면 다음과 같은 로그가 표시됩니다:
```
Started DuoPetBackendApplication in X.XXX seconds
```

### 4. CORS 설정 확인

백엔드가 재시작된 후, 브라우저 개발자 도구에서 확인:
- Network 탭에서 API 요청 확인
- Response Headers에서 `Access-Control-Allow-Origin` 헤더 확인
- 3000과 3001 포트가 모두 허용되는지 확인

## 주의사항

- 백엔드를 재시작하면 모든 WebSocket 연결이 끊어집니다
- 프론트엔드를 새로고침하여 WebSocket을 재연결해야 합니다
- 백엔드 재시작 후 약 10-20초 정도 기다린 후 테스트를 시작하세요