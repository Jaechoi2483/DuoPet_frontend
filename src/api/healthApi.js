// src/api/healthApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';
const AI_API_BASE_URL = 'http://localhost:8000'; // FastAPI 서버 포트

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

// AI 진단 - 종합 진단 (안구, 체형, 피부 통합)
export const analyzeHealthComprehensive = async (images, petType = 'dog', petInfo = {}) => {
  try {
    const formData = new FormData();
    
    // 이미지 파일들 추가
    images.forEach((image, index) => {
      formData.append('images', image);
    });
    
    // 펫 타입 추가
    formData.append('pet_type', petType);
    
    // 펫 정보 추가 (선택사항)
    if (petInfo && Object.keys(petInfo).length > 0) {
      formData.append('pet_info', JSON.stringify(petInfo));
    }
    
    console.log('Sending comprehensive diagnosis request');
    
    // 프록시를 통해 라우팅되도록 상대 경로 사용
    // 임시로 절대 경로 사용 (프록시 문제 해결 시 원복)
    const response = await axios.post('http://localhost:8000/api/v1/health-diagnose/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'RefreshToken': `Bearer ${localStorage.getItem('refreshToken')}`
      }
    });
    
    console.log('Comprehensive diagnosis result:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to analyze health comprehensively:', error);
    throw error;
  }
};

// AI 진단 - 안구 질환 진단
export const analyzeEyeDisease = async (image, petType = 'dog') => {
  try {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('pet_type', petType);
    
    const response = await axios.post('http://localhost:8000/api/v1/health-diagnose/analyze/eye', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'RefreshToken': `Bearer ${localStorage.getItem('refreshToken')}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to analyze eye disease:', error);
    throw error;
  }
};

// AI 진단 - 체형 평가 (BCS)
export const analyzeBCS = async (images, petType = 'dog', petInfo = {}) => {
  try {
    const formData = new FormData();
    
    // 여러 각도의 이미지 추가
    images.forEach((image) => {
      formData.append('images', image);
    });
    
    formData.append('pet_type', petType);
    
    if (petInfo && Object.keys(petInfo).length > 0) {
      formData.append('pet_info', JSON.stringify(petInfo));
    }
    
    const response = await axios.post('http://localhost:8000/api/v1/health-diagnose/analyze/bcs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'RefreshToken': `Bearer ${localStorage.getItem('refreshToken')}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to analyze BCS:', error);
    throw error;
  }
};

// AI 진단 - 피부 질환 진단
export const analyzeSkinDisease = async (image, petType = 'dog') => {
  try {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('pet_type', petType);
    
    const response = await axios.post('http://localhost:8000/api/v1/health-diagnose/analyze/skin', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'RefreshToken': `Bearer ${localStorage.getItem('refreshToken')}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to analyze skin disease:', error);
    throw error;
  }
};

// AI 진단 - 단일 진단 (새로운 엔드포인트)
export const analyzeSingleDiagnosis = async (images, diagnosisType, petType = 'dog', petInfo = {}) => {
  try {
    const formData = new FormData();
    
    // 이미지 파일들 추가
    images.forEach((image) => {
      formData.append('images', image);
    });
    
    // 진단 유형 추가 (필수)
    formData.append('diagnosis_type', diagnosisType);
    
    // 펫 타입 추가
    formData.append('pet_type', petType);
    
    // 펫 정보 추가 (선택사항)
    if (petInfo.age) formData.append('pet_age', petInfo.age);
    if (petInfo.weight) formData.append('pet_weight', petInfo.weight);
    if (petInfo.breed) formData.append('pet_breed', petInfo.breed);
    
    console.log('Sending single diagnosis request:', diagnosisType);
    
    const response = await axios.post('http://localhost:8000/api/v1/health-diagnose/analyze-single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'RefreshToken': `Bearer ${localStorage.getItem('refreshToken')}`
      }
    });
    
    console.log('Single diagnosis result:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to analyze single diagnosis:', error);
    throw error;
  }
};

// AI 진단 - 서비스 상태 확인
export const getDiagnosisStatus = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/v1/health-diagnose/status');
    return response.data;
  } catch (error) {
    console.error('Failed to get diagnosis status:', error);
    throw error;
  }
};

// AI 진단 - 촬영 가이드 가져오기
export const getDiagnosisGuide = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/v1/health-diagnose/guide');
    return response.data;
  } catch (error) {
    console.error('Failed to get diagnosis guide:', error);
    throw error;
  }
};

export default api;