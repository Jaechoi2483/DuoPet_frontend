import React, { useState, useEffect } from 'react';
import styles from '../../components/common/FindIDAndPWD.module.css';
import apiClient from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import FindTabHeader from '../../components/common/FindTabHeader';

const FindPasswordPage = () => {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [phone, setPhone] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [timer, setTimer] = useState(180);
  const [timerActive, setTimerActive] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // 타이머
  useEffect(() => {
    if (timerActive && timer > 0) {
      const countdown = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(countdown);
    } else if (timer === 0) {
      setTimerActive(false);
    }
  }, [timerActive, timer]);

  // 인증번호 전송
  const sendCode = async () => {
    if (!phone.trim()) {
      alert('전화번호를 입력해주세요!');
      return;
    }

    try {
      await apiClient.post('/sms/send', { loginId, phone });
      setTimer(180);
      setTimerActive(true);
      alert('인증번호가 전송되었습니다.');
    } catch {
      alert('인증번호 전송 실패');
    }
  };

  // 인증번호 확인
  const verifyCode = async () => {
    if (!authCode.trim()) {
      alert('인증번호를 입력해주세요!');
      return;
    }

    if (timer === 0) {
      alert('인증 시간이 만료되었습니다.');
      return;
    }

    try {
      const res = await apiClient.post('/sms/verify', {
        phone,
        authCode,
      });

      if (res.data.verified === true) {
        setIsVerified(true);
        alert('인증 성공!');
      } else {
        alert('인증번호가 일치하지 않습니다.');
      }
    } catch {
      alert('서버 오류로 인증 실패');
    }
  };

  // 비밀번호 재설정 페이지로 이동
  const goToResetPage = () => {
    navigate('/reset-password', { state: { loginId } });
  };

  return (
    <div className={styles.container}>
      <FindTabHeader />

      <input
        className={styles.input}
        placeholder="아이디"
        value={loginId}
        onChange={(e) => setLoginId(e.target.value)}
      />
      <input
        className={styles.input}
        placeholder="전화번호 (- 없이 입력)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <div className={styles.authRow}>
        <input
          className={styles.inputAuth}
          placeholder="인증번호"
          value={authCode}
          onChange={(e) => setAuthCode(e.target.value)}
          disabled={isVerified}
        />
        <button className={styles.authButton} onClick={sendCode} disabled={timerActive || isVerified}>
          {timerActive ? '재전송' : '받기'}
        </button>
        <button className={styles.authButton} onClick={verifyCode} disabled={isVerified || !authCode}>
          확인
        </button>
      </div>

      {timerActive && !isVerified && (
        <p className={styles.timer}>
          남은 시간: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
        </p>
      )}

      {isVerified && <p className={styles.timerSuccess}>✅ 인증 완료</p>}

      <button className={styles.submit} onClick={goToResetPage} disabled={!loginId || !phone || !isVerified}>
        비밀번호 재설정
      </button>

      <div className={styles.link} onClick={() => navigate('/login')}>
        로그인 페이지로 돌아가기
      </div>
    </div>
  );
};

export default FindPasswordPage;
