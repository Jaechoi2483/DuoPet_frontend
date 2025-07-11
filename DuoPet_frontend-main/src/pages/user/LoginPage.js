import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';

function LoginPage() {
  const [loginId, setLoginId] = useState('');
  const [userPwd, setUserPwd] = useState('');
  const [rememberId, setRememberId] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('로그인 시도:', { loginId, userPwd, rememberId, autoLogin });

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginId: loginId,
          userPwd: userPwd,
        }),
        credentials: 'include', // CORS 설정 시 allowCredentials(true) 필요
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || '로그인 실패');
        return;
      }

      // JWT 토큰 저장
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      // 로그인 성공 안내
      alert(`${data.nickname}님 환영합니다!`);
      window.location.href = '/mypage';
    } catch (error) {
      console.error('로그인 에러:', error);
      alert('서버와의 연결에 실패했습니다.');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2>로그인</h2>
      <p className={styles.subtext}>
        DuoPet 서비스를 이용하려면 로그인해주세요
      </p>
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
        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              checked={rememberId}
              onChange={(e) => setRememberId(e.target.checked)}
            />
            아이디 저장
          </label>
          <label>
            <input
              type="checkbox"
              checked={autoLogin}
              onChange={(e) => setAutoLogin(e.target.checked)}
            />
            자동 로그인
          </label>
        </div>
        <button type="submit" className={styles.loginBtn}>
          로그인
        </button>

        <div className={styles.divider}>또는</div>
        <button className={styles.faceBtn}>📷 얼굴인식 로그인</button>

        <div className={styles.snsLogin}>
          <button className={`${styles.sns} ${styles.kakao}`}>카카오</button>
          <button className={`${styles.sns} ${styles.naver}`}>네이버</button>
          <button className={`${styles.sns} ${styles.google}`}>구글</button>
        </div>

        <div className={styles.loginLinks}>
          <span
            onClick={() => navigate('/signup/step1')}
            className={styles.link}
          >
            회원가입
          </span>
          <span
            onClick={() => navigate('/find-password')}
            className={styles.link}
          >
            비밀번호 찾기
          </span>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
