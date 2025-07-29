// src/api/petApi.js
import apiClient from '../utils/axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// 사용자의 반려동물 목록 조회
export const getPetList = async (userId) => {
  try {
    const response = await apiClient.get(`/pet/list/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch pet list:', error);
    throw error;
  }
};

// 특정 반려동물 상세 정보 조회
export const getPetDetail = async (petId) => {
  try {
    const response = await apiClient.get(`/pet/${petId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch pet detail:', error);
    throw error;
  }
};

// 반려동물 등록
export const registerPet = async (petData) => {
  try {
    const formData = new FormData();
    
    // JSON 데이터를 문자열로 변환
    const dataBlob = new Blob([JSON.stringify({
      userId: petData.userId,
      petName: petData.petName,
      animalType: petData.animalType,
      breed: petData.breed,
      age: petData.age,
      gender: petData.gender,
      neutered: petData.neutered,
      weight: petData.weight
    })], { type: 'application/json' });
    
    formData.append('data', dataBlob);
    
    // 파일이 있으면 추가
    if (petData.file) {
      formData.append('file', petData.file);
    }
    
    const response = await apiClient.post('/pet/register', formData);
    
    return response.data;
  } catch (error) {
    console.error('Failed to register pet:', error);
    throw error;
  }
};

// 반려동물 정보 수정
export const updatePet = async (petId, petData) => {
  try {
    const formData = new FormData();
    
    // JSON 데이터를 문자열로 변환
    const dataBlob = new Blob([JSON.stringify({
      userId: petData.userId,
      petName: petData.petName,
      animalType: petData.animalType,
      breed: petData.breed,
      age: petData.age,
      gender: petData.gender,
      neutered: petData.neutered,
      weight: petData.weight
    })], { type: 'application/json' });
    
    formData.append('data', dataBlob);
    
    // 파일이 있으면 추가
    if (petData.file) {
      formData.append('file', petData.file);
    }
    
    const response = await apiClient.put(`/pet/update/${petId}`, formData);
    
    return response.data;
  } catch (error) {
    console.error('Failed to update pet:', error);
    throw error;
  }
};

// 반려동물 삭제
export const deletePet = async (petId) => {
  try {
    const response = await apiClient.delete(`/pet/${petId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete pet:', error);
    throw error;
  }
};

// 이미지 URL 생성 헬퍼 함수
export const getPetImageUrl = (filename) => {
  if (!filename) return null;
  return `${API_BASE_URL}/pet/image/${filename}`;
};

// 현재 로그인한 사용자의 반려동물 목록 조회
export const getMyPets = async () => {
  try {
    const response = await apiClient.get('/pet/my-pets');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch my pets:', error);
    throw error;
  }
};

// petApi 객체로 모든 함수 export
export const petApi = {
  getPetList,
  getPetDetail,
  registerPet,
  updatePet,
  deletePet,
  getPetImageUrl,
  getMyPets
};