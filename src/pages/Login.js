import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthProvider';
import apiClient from '../utils/axios';
import { initializeKakao } from '../utils/kakaoInit';
import loginStyles from './Login.module.css';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/'; // 이전 페이지 정보
  const { updateTokens } = useContext(AuthContext);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // 컴포넌트가 마운트될 때 이메일 쿠키를 확인합니다.
    const savedUserId = getCookie('savedUserId');
    if (savedUserId) {
      setUserId(savedUserId);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // 비밀번호가 비어있는지 확인
    if (!password || password.trim() === '') {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login', {
        userId,
        password,
      });

      // 응답이 성공인 경우
      if (response.data.code === 'SU') {
        const { accessToken, refreshToken, expirationTime } = response.data.data;
        
        // AuthProvider의 updateTokens 함수 호출
        updateTokens(accessToken, refreshToken);
        
        // 로그인 ID 저장 (WebSocket 연결용)
        localStorage.setItem('loginId', userId);
        
        // WebSocket 연결은 App.js에서 자동으로 처리됩니다
        
        // 아이디 저장 체크박스가 선택되어 있으면 쿠키에 아이디를 저장합니다.
        if (rememberMe) {
          setCookie('savedUserId', userId, 30); // 30일간 저장
        } else {
          // 체크박스가 해제되어 있으면 쿠키를 삭제합니다.
          deleteCookie('savedUserId');
        }
        
        // 로그인 성공 후 이전 페이지로 이동
        navigate(from, { replace: true });
      } else {
        setError(response.data.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setError('아이디 또는 비밀번호가 일치하지 않습니다.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    // Kakao SDK 초기화
    initializeKakao();
    
    if (window.Kakao && window.Kakao.Auth) {
      window.Kakao.Auth.authorize({
        redirectUri: `${window.location.origin}/auth/callback`,
        scope: 'profile_nickname, profile_image, account_email'
      });
    } else {
      console.error('Kakao SDK가 로드되지 않았습니다.');
      setError('카카오 로그인을 사용할 수 없습니다.');
    }
  };

  // 쿠키 관련 함수들
  const setCookie = (name, value, days) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  };

  const getCookie = (name) => {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const deleteCookie = (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  };

  return (
    <div className={loginStyles.loginWrapper}>
      <div className={loginStyles.loginContainer}>
        <h2>로그인</h2>
        {error && <div className={loginStyles.error}>{error}</div>}
        <form onSubmit={handleLogin} className={loginStyles.loginForm}>
          <div className={loginStyles.formGroup}>
            <label htmlFor="userId">아이디</label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              className={loginStyles.input}
              placeholder="아이디를 입력하세요"
            />
          </div>
          <div className={loginStyles.formGroup}>
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={loginStyles.input}
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
            />
          </div>
          <div className={loginStyles.options}>
            <label className={loginStyles.checkbox}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>아이디 저장</span>
            </label>
            <a href="/find-account" className={loginStyles.findAccount}>
              아이디/비밀번호 찾기
            </a>
          </div>
          <button 
            type="submit" 
            className={loginStyles.loginBtn}
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <div className={loginStyles.divider}>
          <span>OR</span>
        </div>
        <div className={loginStyles.socialLogin}>
          <button onClick={handleKakaoLogin} className={loginStyles.kakaoBtn}>
            <img src="/api/placeholder/20/20" alt="Kakao" />
            카카오로 시작하기
          </button>
        </div>
        <div className={loginStyles.signupLink}>
          아직 회원이 아니신가요? <a href="/signup">회원가입</a>
        </div>
      </div>
    </div>
  );
}

export default Login;