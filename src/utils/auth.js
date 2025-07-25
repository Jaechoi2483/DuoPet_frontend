// src/utils/auth.js

// 임시 사용자 데이터 설정 (개발 중)
export const setTestUserData = () => {
  const testUser = {
    userId: 1,
    userName: "테스트 사용자",
    userEmail: "test@example.com",
    phone: "010-1234-5678"
  };
  
  localStorage.setItem('userData', JSON.stringify(testUser));
  localStorage.setItem('accessToken', 'test-token-12345');
  localStorage.setItem('refreshToken', 'test-refresh-token-67890');
};

// 사용자 데이터 가져오기
export const getUserData = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

// 로그인 확인
export const isAuthenticated = () => {
  return !!localStorage.getItem('accessToken');
};

// 로그아웃
export const logout = () => {
  localStorage.removeItem('userData');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};