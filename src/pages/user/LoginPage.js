import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';
import apiClient from '../../utils/axios';
import { AuthContext } from '../../AuthProvider';

function LoginPage() {
  const navigate = useNavigate();
  const { updateTokens } = useContext(AuthContext);

  const [loginId, setLoginId] = useState('');
  const [userPwd, setUserPwd] = useState('');
  const [rememberId, setRememberId] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [error, setError] = useState('');

  // 저장된 ID 및 자동 로그인 여부 불러오기
  useEffect(() => {
    const savedId = localStorage.getItem('rememberId');
    const auto = localStorage.getItem('autoLogin');
    if (savedId) {
      setLoginId(savedId);
      setRememberId(true);
    }
    if (auto === 'true') {
      setAutoLogin(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await apiClient.post('/login', {
        loginId,
        userPwd,
      });

      const data = response.data;

      // 토큰 저장 및 전역 상태 업데이트
      updateTokens(data.accessToken, data.refreshToken);

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

      alert(`${data.nickname}님 환영합니다!`);
      navigate('/mypage');
    } catch (err) {
      console.error('로그인 에러:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('서버와의 연결에 실패했습니다.');
      }
    }
  };

  const handleSocialLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/kakao';
  };

  const handleFaceLogin = () => {
    alert('얼굴 인식 로그인은 현재 준비 중입니다.');
  };

  return (
    <div className={styles.loginContainer}>
      <h2>로그인</h2>
      <p className={styles.subtext}>DuoPet 서비스를 이용하려면 로그인해주세요</p>
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
          <button type="button" className={`${styles.sns} ${styles.kakao}`} onClick={handleSocialLogin}>
            카카오
          </button>
          <button type="button" className={`${styles.sns} ${styles.naver}`} onClick={handleSocialLogin}>
            네이버
          </button>
          <button type="button" className={`${styles.sns} ${styles.google}`} onClick={handleSocialLogin}>
            구글
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
