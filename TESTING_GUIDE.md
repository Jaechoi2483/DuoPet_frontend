# DuoPet 전문가 상담 테스트 가이드

## 포트 분리를 통한 USER/VET 동시 테스트

### 문제 상황
- 같은 브라우저에서 여러 탭을 열어도 localStorage와 쿠키가 공유됨
- 한 탭에서 VET로 로그인하면 다른 탭의 USER 토큰이 덮어씌워짐
- 시크릿 모드를 사용해도 같은 도메인(localhost:3000) 내에서는 쿠키가 공유됨

### 해결 방법: 서로 다른 포트에서 실행

#### 1. Windows에서 실행하는 방법

**터미널 1 - 일반 사용자용 (포트 3000)**
```bash
cd /mnt/d/final_project/DuoPet_frontend
npm run start:user
```

**터미널 2 - 전문가용 (포트 3001)**
```bash
cd /mnt/d/final_project/DuoPet_frontend
npm run start:vet
```

#### 2. Linux/Mac에서 실행하는 방법

**터미널 1 - 일반 사용자용 (포트 3000)**
```bash
cd /mnt/d/final_project/DuoPet_frontend
npm run start:user:unix
```

**터미널 2 - 전문가용 (포트 3001)**
```bash
cd /mnt/d/final_project/DuoPet_frontend
npm run start:vet:unix
```

### 테스트 절차

1. **첫 번째 터미널에서 일반 사용자용 프론트엔드 실행**
   - `npm run start:user` 실행
   - http://localhost:3000 으로 접속
   - 일반 사용자 계정(snopia)으로 로그인

2. **두 번째 터미널에서 전문가용 프론트엔드 실행**
   - `npm run start:vet` 실행
   - http://localhost:3001 으로 접속
   - 전문가 계정(snopia_vet)으로 로그인

3. **즉시 상담 테스트**
   - 일반 사용자(3000포트): 전문가 상담 페이지에서 온라인 전문가의 "즉시 상담" 버튼 클릭
   - 반려동물 선택, 증상 입력 후 "상담 요청" 클릭
   - 전문가(3001포트): 상담 요청 알림이 표시되는지 확인
   - 전문가가 "수락" 클릭 시 양쪽 모두 채팅 페이지로 이동

### 주의사항

1. **포트별 독립성**
   - 각 포트는 완전히 독립된 localStorage를 가짐
   - 3000포트와 3001포트는 서로 다른 도메인으로 취급됨
   - 쿠키와 토큰이 서로 간섭하지 않음

2. **CORS 설정**
   - 백엔드가 여러 포트에서의 요청을 허용하도록 설정되어 있어야 함
   - 현재 백엔드는 개발 환경에서 모든 localhost 포트를 허용하도록 설정됨

3. **브라우저 개발자 도구**
   - 각 포트별로 Network 탭에서 요청 헤더 확인
   - Console에서 인증 토큰 로그 확인
   - Application 탭에서 localStorage 값 확인

### 문제 해결

1. **"포트가 이미 사용 중" 에러**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID [프로세스ID] /F
   
   # Linux/Mac
   lsof -i :3000
   kill -9 [프로세스ID]
   ```

2. **프록시 에러**
   - package.json의 proxy 설정이 제대로 되어 있는지 확인
   - 백엔드가 8080 포트에서 실행 중인지 확인

3. **WebSocket 연결 실패**
   - 각 포트별로 WebSocket 연결이 독립적으로 생성되는지 확인
   - 개발자 도구의 Network 탭에서 WS 연결 확인

### 추가 테스트 시나리오

1. **예약 상담 테스트**
   - 일반 사용자: 전문가 선택 → 날짜/시간 선택 → 예약
   - 전문가: 예약 확인 및 관리

2. **실시간 채팅 테스트**
   - 양방향 메시지 전송 확인
   - 이미지/파일 전송 테스트
   - 채팅 종료 및 이력 저장 확인

3. **알림 시스템 테스트**
   - 즉시 상담 요청 알림
   - 예약 시간 알림
   - 채팅 메시지 알림