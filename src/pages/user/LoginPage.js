import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './LoginPage.module.css';
import apiClient from '../../utils/axios';
import { AuthContext } from '../../AuthProvider';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateTokens } = useContext(AuthContext);

  const [loginId, setLoginId] = useState('');
  const [userPwd, setUserPwd] = useState('');
  const [rememberId, setRememberId] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [error, setError] = useState('');
  const [lastProvider, setLastProvider] = useState(null);

  // 저장된 ID 및 자동 로그인 여부 불러오기
  useEffect(() => {
    const savedId = localStorage.getItem('rememberId');
    const auto = localStorage.getItem('autoLogin');
    const provider = localStorage.getItem('lastLoginProvider');

    if (savedId) {
      setLoginId(savedId);
      setRememberId(true);
    }
    if (auto === 'true') {
      setAutoLogin(true);
    }
    if (provider) {
      setLastProvider(provider);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get('error');

    if (errorParam === 'inactive') {
      setError('탈퇴된 계정입니다. 관리자에게 문의하세요.');
      navigate('/login', { replace: true }); // alert 대신 URL만 정리
    } else if (errorParam === 'bad_credentials') {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  }, [location, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await apiClient.post(
        '/login',
        { loginId, userPwd },
        {
          headers: {
            ExtendLogin: autoLogin.toString(), // 'true' 또는 'false'
          },
        }
      );

      const data = response.data;

      // 토큰 저장 및 전역 상태 업데이트
      updateTokens(data.accessToken, data.refreshToken);

      // loginId를 항상 저장 (WebSocket 연결을 위해)
      localStorage.setItem('loginId', loginId);

      // ID 저장/삭제
      if (rememberId) {
        localStorage.setItem('rememberId', loginId);
      } else {
        localStorage.removeItem('rememberId');
      }

      // 자동 로그인 저장
      if (autoLogin) {
        localStorage.setItem('autoLogin', 'true');
      } else {
        localStorage.removeItem('autoLogin');
      }

      // 소셜 로그인이 아니므로 최근 로그인 기록 삭제
      localStorage.removeItem('lastLoginProvider');

      alert(`${data.nickname}님 환영합니다!`);
      navigate('/');
    } catch (err) {
      console.error('로그인 에러:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('서버와의 연결에 실패했습니다.');
      }
    }
  };

  const handleKakaoLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/kakao';
  };

  const handleNaverLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/naver';
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const handleFaceLogin = () => {
    navigate('/face-login');
  };

  return (
    <div className={styles.loginContainer}>
      <h2 className={styles.title}>로그인</h2>
      <p className={styles.subtitle}>DuoPet 서비스를 이용하려면 로그인해주세요</p>

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="아이디를 입력하세요"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={userPwd}
          onChange={(e) => setUserPwd(e.target.value)}
        />
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.checkboxGroup}>
          <label>
            <input type="checkbox" checked={rememberId} onChange={(e) => setRememberId(e.target.checked)} />
            아이디 저장
          </label>
          <label>
            <input type="checkbox" checked={autoLogin} onChange={(e) => setAutoLogin(e.target.checked)} />
            자동 로그인
          </label>
        </div>
        <button type="submit" className={styles.loginBtn}>
          로그인
        </button>

        <div className={styles.divider}>또는</div>

        <button type="button" onClick={handleFaceLogin} className={styles.faceBtn}>
          📷 얼굴인식 로그인
        </button>

        <div className={styles.snsLogin}>
          <button type="button" className={`${styles.snsFull} ${styles.kakao}`} onClick={handleKakaoLogin}>
            <span className={styles.snsLabel}>카카오로 시작하기</span>
            {lastProvider === 'kakao' && <span className={styles.recentBadge}>최근 로그인</span>}
          </button>

          <button type="button" className={`${styles.snsFull} ${styles.naver}`} onClick={handleNaverLogin}>
            <span className={styles.snsLabel}>네이버로 시작하기</span>
            {lastProvider === 'naver' && <span className={styles.recentBadge}>최근 로그인</span>}
          </button>

          <button type="button" className={`${styles.snsFull} ${styles.google}`} onClick={handleGoogleLogin}>
            <span className={styles.snsLabel}>구글로 시작하기</span>
            {lastProvider === 'google' && <span className={styles.recentBadge}>최근 로그인</span>}
          </button>
        </div>

        <div className={styles.loginLinks}>
          <span onClick={() => navigate('/signup/step1')} className={styles.link}>
            회원가입
          </span>
          <span onClick={() => navigate('/find-password')} className={styles.link}>
            비밀번호 찾기
          </span>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
