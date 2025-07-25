// src/api/vaccinationApi.js
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
    console.error('Vaccination API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// 예방접종 생성
export const createVaccination = async (vaccinationData) => {
  try {
    console.log('Creating vaccination with data:', vaccinationData);
    const response = await api.post('/api/health/vaccinations', vaccinationData);
    console.log('Vaccination created successfully');
    return response.data;
  } catch (error) {
    console.error('Failed to create vaccination:', error);
    throw error;
  }
};

// 반려동물별 예방접종 목록 조회
export const getVaccinationsByPet = async (petId) => {
  try {
    console.log('Fetching vaccinations for petId:', petId);
    const response = await api.get(`/api/health/vaccinations/${petId}`);
    console.log('Vaccinations fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch vaccinations:', error);
    throw error;
  }
};

// 예방접종 수정
export const updateVaccination = async (vaccinationId, vaccinationData) => {
  try {
    const response = await api.put(`/api/health/vaccinations/${vaccinationId}`, vaccinationData);
    return response.data;
  } catch (error) {
    console.error('Failed to update vaccination:', error);
    throw error;
  }
};

// 예방접종 삭제
export const deleteVaccination = async (vaccinationId) => {
  try {
    const response = await api.delete(`/api/health/vaccinations/${vaccinationId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete vaccination:', error);
    throw error;
  }
};

export default api;