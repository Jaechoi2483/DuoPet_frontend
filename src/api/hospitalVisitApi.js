// src/api/hospitalVisitApi.js
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
    console.error('Hospital Visit API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// 병원 방문 기록 생성
export const createHospitalVisit = async (visitData) => {
  try {
    console.log('Creating hospital visit record with data:', visitData);
    const response = await api.post('/api/health/visits', visitData);
    console.log('Hospital visit record created successfully');
    return response.data;
  } catch (error) {
    console.error('Failed to create hospital visit record:', error);
    throw error;
  }
};

// 반려동물별 병원 방문 기록 조회
export const getHospitalVisitsByPet = async (petId) => {
  try {
    console.log('Fetching hospital visits for petId:', petId);
    const response = await api.get(`/api/health/visits/${petId}`);
    console.log('Hospital visits fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch hospital visits:', error);
    throw error;
  }
};

// 병원 방문 기록 수정
export const updateHospitalVisit = async (visitId, visitData) => {
  try {
    console.log('Updating hospital visit:', visitId, visitData);
    const response = await api.put(`/api/health/visits/${visitId}`, visitData);
    console.log('Hospital visit updated successfully');
    return response.data;
  } catch (error) {
    console.error('Failed to update hospital visit:', error);
    throw error;
  }
};

// 병원 방문 기록 삭제
export const deleteHospitalVisit = async (visitId) => {
  try {
    console.log('Deleting hospital visit:', visitId);
    const response = await api.delete(`/api/health/visits/${visitId}`);
    console.log('Hospital visit deleted successfully');
    return response.data;
  } catch (error) {
    console.error('Failed to delete hospital visit:', error);
    throw error;
  }
};

export default api;