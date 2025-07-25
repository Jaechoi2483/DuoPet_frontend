// src/api/scheduleApi.js
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
    console.error('Schedule API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// 일정 생성
export const createSchedule = async (scheduleData) => {
  try {
    console.log('Creating schedule with data:', scheduleData);
    const response = await api.post('/api/health/schedules', scheduleData);
    console.log('Schedule created successfully');
    return response.data;
  } catch (error) {
    console.error('Failed to create schedule:', error);
    throw error;
  }
};

// 반려동물별 일정 조회
export const getSchedulesByPet = async (petId) => {
  try {
    console.log('Fetching schedules for petId:', petId);
    const response = await api.get(`/api/health/schedules/${petId}`);
    console.log('Schedules fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch schedules:', error);
    throw error;
  }
};

// 일정 수정
export const updateSchedule = async (scheduleId, scheduleData) => {
  try {
    console.log('Updating schedule:', scheduleId, scheduleData);
    const response = await api.put(`/api/health/schedules/${scheduleId}`, scheduleData);
    console.log('Schedule updated successfully');
    return response.data;
  } catch (error) {
    console.error('Failed to update schedule:', error);
    throw error;
  }
};

// 일정 삭제
export const deleteSchedule = async (scheduleId) => {
  try {
    console.log('Deleting schedule:', scheduleId);
    const response = await api.delete(`/api/health/schedules/${scheduleId}`);
    console.log('Schedule deleted successfully');
    return response.data;
  } catch (error) {
    console.error('Failed to delete schedule:', error);
    throw error;
  }
};

export default api;