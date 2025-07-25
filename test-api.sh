#!/bin/bash
# API 직접 테스트 스크립트

# 브라우저에서 토큰 복사해서 여기에 붙여넣기
ACCESS_TOKEN="여기에_액세스_토큰_붙여넣기"
REFRESH_TOKEN="여기에_리프레시_토큰_붙여넣기"

# 즉시 상담 요청 테스트
curl -X POST http://localhost:8080/api/consultation/consultation-rooms/instant \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "RefreshToken: Bearer $REFRESH_TOKEN" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "vetId": 1,
    "petId": 1,
    "consultationType": "INSTANT",
    "consultationFee": 20000,
    "chiefComplaint": "기침을 자주 해요",
    "status": "PENDING"
  }' \
  -v