// src/utils/axios.js
import axios from 'axios';

// 페이지에서 공통으로 사용할 axios 객체 생성함
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  // Content-Type을 기본값으로 설정하지 않음 (FormData 전송을 위해)
  // withCredentials는 요청별로 설정하도록 변경
});

// 요청 인터셉터 (토큰 처리)
apiClient.interceptors.request.use(
  (config) => {
    // 인증이 필요하지 않은 공개 API 경로들
    const publicPaths = ['/api/adoption', '/api/info', '/notice', '/board', '/upload'];

    // 현재 요청 URL이 공개 API인지 확인
    const isPublicPath = publicPaths.some((path) => config.url.includes(path));

    // Content-Type 설정 (FormData가 아닌 경우에만)
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    // FormData인 경우 Content-Type을 설정하지 않음 (axios가 자동으로 multipart/form-data와 boundary 설정)

    // 공개 API가 아닌 경우에만 토큰 추가 및 인증 쿠키 포함
    if (!isPublicPath) {
      // axios 로 요청시 같이 전송보낼 토큰 지정 처리
      // 로그인 성공시 저장해 놓은 localStorage 에서 토큰을 꺼냄
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (accessToken && refreshToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`; //빽틱 사용해야 함
        config.headers['RefreshToken'] = `Bearer ${refreshToken}`; //빽틱 사용해야 함
      }

      // 인증이 필요한 요청에만 쿠키 포함
      config.withCredentials = true;
    } else {
      // 공개 API는 쿠키 미포함
      config.withCredentials = false;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    // ✅ 응답 헤더에 새 토큰이 있으면 저장 (옵션)
    const newAccessToken = response.headers['authorization']?.split(' ')[1];
    const newRefreshToken = response.headers['refresh-token']?.split(' ')[1];

    if (newAccessToken) {
      localStorage.setItem('accessToken', newAccessToken);
      console.log('[axios] AccessToken 갱신됨');
    }
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
      console.log('[axios] RefreshToken 갱신됨');
    }

    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    const isAccessExpired =
      error?.response?.status === 401 && error?.response?.headers['token-expired'] === 'AccessToken';

    // ✅ AccessToken 만료 → 재발급 시도
    if (isAccessExpired && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/reissue`, null, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            RefreshToken: `Bearer ${refreshToken}`,
            ExtendLogin: 'true',
          },
          withCredentials: true,
        });

        const newAccessToken = res.headers['authorization']?.split(' ')[1];
        const newRefreshToken = res.headers['refresh-token']?.split(' ')[1];

        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        }

        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        // 재요청
        return apiClient(originalRequest);
      } catch (reissueError) {
        console.error('🔴 리이슈 실패:', reissueError);
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
