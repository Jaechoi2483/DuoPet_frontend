// JWT 토큰 디코딩 유틸리티

export const decodeJWT = (token) => {
  try {
    // JWT는 3부분으로 구성됨: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }
    
    // payload 부분 디코딩 (base64url -> base64 -> JSON)
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
};

// 토큰에서 사용자 정보 추출
export const getUserInfoFromToken = () => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    console.log('No access token found');
    return null;
  }
  
  const decoded = decodeJWT(accessToken);
  console.log('Decoded JWT:', decoded);
  
  return {
    username: decoded?.sub || decoded?.username,
    userId: decoded?.userId || decoded?.user_id,
    role: decoded?.role || decoded?.authorities?.[0],
    exp: decoded?.exp,
    iat: decoded?.iat
  };
};