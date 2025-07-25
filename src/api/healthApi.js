// src/api/healthApi.js
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
    
    console.log('Health API Request - URL:', config.url);
    console.log('Health API Request - Access Token exists:', !!accessToken);
    console.log('Health API Request - Refresh Token exists:', !!refreshToken);
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (refreshToken) {
      config.headers.RefreshToken = `Bearer ${refreshToken}`;
    }
    
    console.log('Health API Request Headers:', config.headers);
    
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
    console.error('Health API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// 건강 기록 생성
export const createHealthRecord = async (recordData, files) => {
  try {
    const formData = new FormData();
    
    // JSON 데이터를 Blob으로 변환
    const dataBlob = new Blob([JSON.stringify(recordData)], {
      type: 'application/json'
    });
    formData.append('data', dataBlob, 'data.json');
    
    // 파일 추가
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }
    
    console.log('Creating health record with data:', recordData);
    console.log('Files count:', files ? files.length : 0);
    
    const response = await axios.post(`${API_BASE_URL}/api/health/records`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'RefreshToken': `Bearer ${localStorage.getItem('refreshToken')}`
      }
    });
    
    console.log('Health record created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to create health record:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// 반려동물별 건강 기록 목록 조회
export const getHealthRecordsByPet = async (petId) => {
  try {
    console.log('Fetching health records for petId:', petId);
    const response = await api.get(`/api/health/records/pet/${petId}`);
    console.log('Health records fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch health records:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// 건강 기록 단건 조회
export const getHealthRecord = async (recordId) => {
  try {
    const response = await api.get(`/api/health/records/${recordId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch health record:', error);
    throw error;
  }
};

// 건강 기록 수정
export const updateHealthRecord = async (recordId, recordData) => {
  try {
    const response = await api.put(`/api/health/records/${recordId}`, recordData);
    return response.data;
  } catch (error) {
    console.error('Failed to update health record:', error);
    throw error;
  }
};

// 건강 기록 삭제
export const deleteHealthRecord = async (recordId) => {
  try {
    const response = await api.delete(`/api/health/records/${recordId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete health record:', error);
    throw error;
  }
};

export default api;