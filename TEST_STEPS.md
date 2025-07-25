# 즉시 상담 테스트 단계별 가이드

## 준비사항 체크리스트

- [ ] 백엔드가 실행 중인가? (8080 포트)
- [ ] 백엔드를 재시작했는가? (CORS 설정 적용)
- [ ] 데이터베이스가 실행 중인가?
- [ ] 두 개의 터미널이 준비되어 있는가?

## 실행 단계

### 1. 일반 사용자 프론트엔드 실행 (터미널 1)
```bash
cd D:\final_project\DuoPet_frontend
npm run start:user
```
- 실행 완료 메시지: "Compiled successfully!"
- URL: http://localhost:3000

### 2. 전문가 프론트엔드 실행 (터미널 2)
```bash
cd D:\final_project\DuoPet_frontend
npm run start:vet
```
- 실행 완료 메시지: "Compiled successfully!"
- URL: http://localhost:3001

### 3. 로그인 및 초기 설정

#### 일반 사용자 (포트 3000)
1. http://localhost:3000 접속
2. 로그인 정보 입력:
   - ID: snopia
   - PW: (비밀번호)
3. 개발자 도구(F12) 열기
4. Console 탭에서 다음 확인:
   ```javascript
   localStorage.getItem('role') // 'USER' 확인
   localStorage.getItem('accessToken') // 토큰 있는지 확인
   ```

#### 전문가 (포트 3001)
1. http://localhost:3001 접속
2. 로그인 정보 입력:
   - ID: snopia_vet
   - PW: (비밀번호)
3. 개발자 도구(F12) 열기
4. Console 탭에서 다음 확인:
   ```javascript
   localStorage.getItem('role') // 'VET' 확인
   localStorage.getItem('accessToken') // 토큰 있는지 확인
   ```

### 4. 전문가 온라인 상태 설정 (포트 3001)
1. 마이페이지 접속
2. 온라인 상태 토글 ON으로 변경
3. 전문가 상담 페이지로 이동
4. 본인이 온라인 상태로 표시되는지 확인

### 5. 즉시 상담 요청 (포트 3000)
1. "전문가 상담" 메뉴 클릭
2. 온라인 상태인 전문가 찾기 (snopia_vet)
3. "즉시 상담" 버튼 클릭
4. 모달창에서:
   - 반려동물 선택
   - 증상 입력: "기침을 자주 해요"
   - "상담 요청" 버튼 클릭

### 6. 디버깅 확인사항

#### Console 로그 확인
```
[consultationApi] API_BASE_URL: http://localhost:8080/api/consultation
[consultationApi] 인터셉터 실행 - role: USER
[consultationApi] 현재 포트: 3000
handleInstantConsultRequest 호출됨
```

#### Network 탭 확인
1. Filter에 "instant" 입력
2. 요청 확인:
   - URL: http://localhost:8080/api/consultation/consultation-rooms/instant
   - Method: POST
   - Status: 200 OK (302면 인증 문제)
   - Request Headers:
     - Authorization: Bearer [토큰]
     - Origin: http://localhost:3000

### 7. 전문가 알림 확인 (포트 3001)
1. 상담 요청 알림 토스트가 표시되는지 확인
2. 알림 내용:
   - 요청자 이름
   - 반려동물 정보
   - 증상
3. "수락" 또는 "거절" 버튼 표시 확인

### 8. 상담 수락 및 채팅
1. 전문가가 "수락" 클릭
2. 양쪽 모두 채팅 페이지로 자동 이동
3. 채팅 메시지 전송 테스트

## 문제 발생 시 체크포인트

### 302 리다이렉트 발생
- 백엔드 재시작 필요
- 토큰 만료 확인
- localStorage 초기화 후 재로그인

### CORS 에러
- 백엔드 SecurityConfig 확인
- 3000, 3001 포트 모두 허용되어 있는지 확인

### WebSocket 연결 실패
- 백엔드 WebSocket 엔드포인트 확인
- Network 탭에서 WS 연결 상태 확인

### 알림이 오지 않음
- WebSocket 연결 상태 확인
- 전문가가 온라인 상태인지 확인
- Console에서 WebSocket 메시지 로그 확인