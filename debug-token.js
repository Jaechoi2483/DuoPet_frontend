// 브라우저 콘솔에서 실행하여 토큰 상태 확인
function debugToken() {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!accessToken) {
    console.error('❌ Access Token이 없습니다!');
    return;
  }
  
  try {
    // JWT 토큰 디코딩 (헤더.페이로드.서명)
    const parts = accessToken.split('.');
    if (parts.length !== 3) {
      console.error('❌ 잘못된 토큰 형식');
      return;
    }
    
    // 페이로드 디코딩
    const payload = JSON.parse(atob(parts[1]));
    
    // 만료 시간 확인
    const exp = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = exp - now;
    
    console.log('🔍 토큰 정보:');
    console.log('- User ID:', payload.userId || payload.userNo);
    console.log('- Role:', payload.role);
    console.log('- 발급 시간:', new Date(payload.iat * 1000).toLocaleString());
    console.log('- 만료 시간:', new Date(exp * 1000).toLocaleString());
    console.log('- 남은 시간:', timeLeft > 0 ? `${Math.floor(timeLeft / 60)}분 ${timeLeft % 60}초` : '만료됨');
    
    if (timeLeft <= 0) {
      console.error('❌ 토큰이 만료되었습니다!');
    } else {
      console.log('✅ 토큰이 유효합니다.');
    }
    
    // RefreshToken 확인
    if (refreshToken) {
      console.log('✅ Refresh Token 존재');
    } else {
      console.warn('⚠️ Refresh Token이 없습니다');
    }
    
  } catch (error) {
    console.error('토큰 파싱 오류:', error);
  }
}

// 함수 실행
debugToken();