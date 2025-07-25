// src/api/videoRecommendApi.js

import apiClient from '../utils/axios'; // 기존 axios 인스턴스 import

export const getRecommendedVideos = async (user_id, keywords) => {
  const res = await apiClient.post('/api/v1/video-recommend/recommend', {
    user_id, // ✨ 테스트용 user_id (로그인 연동 시 동적으로 바꿔줘도 됨!)
    keywords,
  });
  console.log('🔥 추천 영상 API 응답 전체:', res);

  return res.data.data; // FastAPI StandardResponse에서 .data 추출
};
