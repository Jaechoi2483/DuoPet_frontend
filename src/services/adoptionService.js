import apiClient from '../utils/axios';

const adoptionService = {
  // 메인 화면용 추천 동물 목록 조회
  getFeaturedAnimals: async (count = 10) => {
    try {
      const response = await apiClient.get('/api/adoption/featured-animals', {
        params: { count }
      });
      return response.data;
    } catch (error) {
      console.error('추천 동물 목록 조회 실패:', error);
      throw error;
    }
  },

  // 입양 가능한 동물 목록 조회 (페이징)
  getAvailableAnimals: async (page = 0, size = 12) => {
    try {
      const response = await apiClient.get('/api/adoption/animals', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('입양 동물 목록 조회 실패:', error);
      throw error;
    }
  },

  // 동물 상세 정보 조회
  getAnimalDetail: async (animalId) => {
    try {
      const response = await apiClient.get(`/api/adoption/animals/${animalId}`);
      return response.data;
    } catch (error) {
      console.error('동물 상세 정보 조회 실패:', error);
      throw error;
    }
  },

  // 동물 검색 (필터링)
  searchAnimals: async (filters, page = 0, size = 12) => {
    try {
      const response = await apiClient.get('/api/adoption/animals/search', {
        params: {
          ...filters,
          page,
          size
        }
      });
      return response.data;
    } catch (error) {
      console.error('동물 검색 실패:', error);
      throw error;
    }
  },

  // 공공 API 데이터 동기화 (관리자용)
  syncPublicData: async () => {
    try {
      const response = await apiClient.post('/api/adoption/sync');
      return response.data;
    } catch (error) {
      console.error('데이터 동기화 실패:', error);
      throw error;
    }
  }
};

export default adoptionService;