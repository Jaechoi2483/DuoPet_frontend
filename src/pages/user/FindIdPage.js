import React, { useState, useEffect } from 'react';
import styles from '../../components/common/FindIDAndPWD.module.css';
import apiClient from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import FindTabHeader from '../../components/common/FindTabHeader';

const FindIdPage = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [timer, setTimer] = useState(180);
  const [timerActive, setTimerActive] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [foundId, setFoundId] = useState('');
  const navigate = useNavigate();

  // 타이머 동작
  useEffect(() => {
    if (timerActive && timer > 0) {
      const countdown = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(countdown);
    } else if (timer === 0) {
      setTimerActive(false);
    }
  }, [timerActive, timer]);

  // 인증번호 전송
  const handleSendCode = async () => {
    if (!phone.trim()) {
      alert('휴대폰 번호를 입력해주세요!');
      return;
    }
    try {
      await apiClient.post('/sms/send', { phone, userName: name });
      setTimer(180);
      setTimerActive(true);
      alert('인증번호가 전송되었습니다.');
    } catch (err) {
      alert('인증번호 전송 실패');
    }
  };

  // 인증번호 확인
  const handleVerifyCode = async () => {
    if (!authCode.trim()) {
      alert('인증번호를 입력해주세요!');
      return;
    }

    if (timer === 0) {
      alert('인증 시간이 만료되었습니다. 재전송해주세요!');
      return;
    }

    try {
      const response = await apiClient.post('/sms/verify', {
        phone,
        authCode: authCode, // 'authCode' → 'code'로 전달
      });

      if (response.data.verified === true) {
        setIsVerified(true);
        alert('인증 성공!');
      } else {
        alert('인증 실패: 코드가 일치하지 않습니다.');
      }
    } catch (err) {
      alert('서버 오류로 인증 실패');
    }
  };

  // 아이디 찾기
  const handleFindId = async () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요!');
      return;
    }

    try {
      const res = await apiClient.post('/users/find-id', { userName: name, phone });
      setFoundId(res.data.loginId);
    } catch (err) {
      alert('일치하는 아이디가 없습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <FindTabHeader />

      <input className={styles.input} placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
      <input
        className={styles.input}
        placeholder="전화번호 (- 없이 입력)"
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
      />

      <div className={styles.authRow}>
        <input
          className={styles.inputAuth}
          placeholder="인증번호"
          value={authCode}
          onChange={(e) => setAuthCode(e.target.value)}
          disabled={isVerified}
        />
        <button className={styles.authButton} onClick={handleSendCode} disabled={timerActive || isVerified}>
          {timerActive ? '재전송' : '받기'}
        </button>
        <button className={styles.authButton} onClick={handleVerifyCode} disabled={isVerified || !authCode}>
          확인
        </button>
      </div>

      {timerActive && !isVerified && (
        <p className={styles.timer}>
          남은 시간: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
        </p>
      )}

      {isVerified && !foundId && <p className={styles.timerSuccess}>✅ 인증 완료</p>}

      <button className={styles.submit} onClick={handleFindId} disabled={!isVerified || !name || !phone}>
        아이디 찾기
      </button>

      {foundId && (
        <>
          <div className={styles.resultBox}>
            찾은 아이디: <strong>{foundId}</strong>
          </div>
          <div className={styles.actionButtons}>
            <button onClick={() => window.location.reload()}>다시 찾기</button>
            <button onClick={() => navigate('/find-password')}>비밀번호 찾기</button>
          </div>
        </>
      )}

      <div className={styles.link} onClick={() => navigate('/login')}>
        로그인 페이지로 돌아가기
      </div>
    </div>
  );
};

export default FindIdPage;
