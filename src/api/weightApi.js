// src/api/weightApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 추가
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (refreshToken) {
      config.headers.RefreshToken = `Bearer ${refreshToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Weight API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// 체중 기록 생성
export const createWeight = async (weightData) => {
  try {
    console.log('Creating weight record with data:', weightData);
    const response = await api.post('/api/health/weights', weightData);
    console.log('Weight record created successfully');
    return response.data;
  } catch (error) {
    console.error('Failed to create weight record:', error);
    throw error;
  }
};

// 반려동물별 체중 기록 조회
export const getWeightsByPet = async (petId) => {
  try {
    console.log('Fetching weights for petId:', petId);
    const response = await api.get(`/api/health/weights/${petId}`);
    console.log('Weights fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch weights:', error);
    throw error;
  }
};

// 체중 기록 수정
export const updateWeight = async (weightId, weightData) => {
  try {
    const response = await api.put(`/api/health/weights/${weightId}`, weightData);
    return response.data;
  } catch (error) {
    console.error('Failed to update weight:', error);
    throw error;
  }
};

// 체중 기록 삭제
export const deleteWeight = async (weightId) => {
  try {
    const response = await api.delete(`/api/health/weights/${weightId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete weight:', error);
    throw error;
  }
};

export default api;