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
  const [error, setError] = useState('');
  const [lastProvider, setLastProvider] = useState(null);

  // 저장된 ID 및 자동 로그인 여부 불러오기
  useEffect(() => {
    const savedId = localStorage.getItem('rememberId');
    const provider = localStorage.getItem('lastLoginProvider');

    if (savedId) {
      setLoginId(savedId);
      setRememberId(true);
    }
    if (provider) {
      setLastProvider(provider);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await apiClient.post('/login', { loginId, userPwd });
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

      // 소셜 로그인이 아니므로 최근 로그인 기록 삭제
      localStorage.removeItem('lastLoginProvider');

      alert(`${data.nickname}님 환영합니다!`);
      navigate('/');
    } catch (err) {
      console.error('로그인 에러:', err);
      const serverMsg = err.response?.data?.error;
      if (serverMsg) {
        setError(serverMsg); // 백엔드에서 내려준 메시지 출력
      } else {
        setError('서버와의 연결에 실패했습니다.');
      }
    }
  };

  const handleKakaoLogin = () => {
    setError('');
    window.location.href = 'http://localhost:8080/oauth2/authorization/kakao';
  };

  const handleNaverLogin = () => {
    setError('');
    window.location.href = 'http://localhost:8080/oauth2/authorization/naver';
  };

  const handleGoogleLogin = () => {
    setError('');
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const handleFaceLogin = () => {
    navigate('/face-login');
  };

  return (
    <div className={styles.loginContainer}>
      <h2 className={styles.title}>로그인</h2>
      <p className={styles.subtitle}>DuoPet 서비스를 이용하려면 로그인해주세요</p>

      {/* 일반 로그인 폼 */}
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

        {/* 로그인 실패 메시지 */}
        {error && <div className={styles.error}>{error}</div>}

        {/* 아이디 저장 */}
        <div className={styles.checkboxGroup}>
          <label>
            <input type="checkbox" checked={rememberId} onChange={(e) => setRememberId(e.target.checked)} />
            아이디 저장
          </label>
        </div>

        <button type="submit" className={styles.loginBtn}>
          로그인
        </button>
      </form>

      {/* 소셜 로그인 */}
      <div className={styles.divider}>또는</div>

      <div className={styles.snsLogin}>
        <button
          className={`${styles.snsFull} ${styles.face}`}
          onClick={() => {
            setError('');
            handleFaceLogin();
          }}
        >
          <img src="/images/face_logo.png" alt="Face" className={styles.snsIcon} />
          <span className={styles.snsLabel}>얼굴인식 로그인</span>
        </button>

        <button
          className={`${styles.snsFull} ${styles.kakao}`}
          onClick={() => {
            setError('');
            handleKakaoLogin();
          }}
        >
          <img src="/images/kakao_logo.png" alt="Kakao" className={styles.snsIcon} />
          <span className={styles.snsLabel}>카카오로 시작하기</span>
          {lastProvider === 'kakao' && <span className={styles.recentBadge}>최근 로그인</span>}
        </button>

        <button
          className={`${styles.snsFull} ${styles.naver}`}
          onClick={() => {
            setError('');
            handleNaverLogin();
          }}
        >
          <img src="/images/naver_logo.png" alt="Naver" className={styles.snsIcon} />
          <span className={styles.snsLabel}>네이버로 시작하기</span>
          {lastProvider === 'naver' && <span className={styles.recentBadge}>최근 로그인</span>}
        </button>

        <button
          className={`${styles.snsFull} ${styles.google}`}
          onClick={() => {
            setError('');
            handleGoogleLogin();
          }}
        >
          <img src="/images/google.logo.png" alt="Google" className={styles.snsIcon} />
          <span className={styles.snsLabel}>구글로 시작하기</span>
          {lastProvider === 'google' && <span className={styles.recentBadge}>최근 로그인</span>}
        </button>
      </div>

      {/* 회원가입 / 비밀번호 찾기 */}
      <div className={styles.loginLinks}>
        <span onClick={() => navigate('/signup/step1')} className={styles.link}>
          회원가입
        </span>
        <span onClick={() => navigate('/find-password')} className={styles.link}>
          비밀번호 찾기
        </span>
      </div>
    </div>
  );
}

export default LoginPage;
