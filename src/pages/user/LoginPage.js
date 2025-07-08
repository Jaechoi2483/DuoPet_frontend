import React, { useState } from 'react';
import styles from './LoginPage.module.css';

function LoginPage() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberId, setRememberId] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('로그인 시도:', { loginId, password, rememberId, autoLogin });
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          <a href="/signup">회원가입</a>
          <a href="/find-password">비밀번호 찾기</a>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
