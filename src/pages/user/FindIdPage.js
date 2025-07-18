import React, { useState, useEffect } from 'react';
import styles from '../../components/common/FindIDAndPWD.module.css';
import apiClient from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import FindTabHeader from '../../components/common/FindTabHeader';

const FindIdPage = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [timer, setTimer] = useState(180);
  const [timerActive, setTimerActive] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [foundId, setFoundId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (timerActive && timer > 0) {
      const countdown = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(countdown);
    } else if (timer === 0) {
      setTimerActive(false);
    }
  }, [timerActive, timer]);

  const handleSendCode = async () => {
    try {
      const response = await apiClient.post('/sms/send', { phone });
      setSentCode(response.data.authCode);
      setTimer(180);
      setTimerActive(true);
      alert('인증번호가 전송되었습니다.');
    } catch {
      alert('인증번호 전송 실패');
    }
  };

  const handleVerifyCode = async () => {
    try {
      const response = await apiClient.post('/sms/verify', {
        phone,
        authCode,
      });

      if (response.data.verified) {
        setIsVerified(true);
        alert('인증 성공!');
      } else {
        alert('인증번호가 올바르지 않거나 시간이 초과되었습니다.');
      }
    } catch (err) {
      alert('인증 실패');
    }
  };

  const handleFindId = async () => {
    try {
      const res = await apiClient.post('/find-id', { name, phone });
      setFoundId(res.data.loginId);
    } catch {
      alert('일치하는 아이디가 없습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <FindTabHeader />
      <input className={styles.input} placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
      <input
        className={styles.input}
        placeholder="휴대폰 번호"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <div className={styles.authRow}>
        <input
          className={styles.inputAuth}
          placeholder="인증번호"
          value={authCode}
          onChange={(e) => setAuthCode(e.target.value)}
        />
        <button className={styles.authButton} onClick={handleSendCode}>
          받기
        </button>
        <button className={styles.authButton} onClick={handleVerifyCode}>
          확인
        </button>
      </div>
      {timerActive && (
        <p className={styles.timer}>
          남은 시간: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
        </p>
      )}
      <button className={styles.submit} onClick={handleFindId} disabled={!isVerified}>
        아이디 찾기
      </button>
      {foundId && (
        <div className={styles.result}>
          당신의 아이디: <strong>{foundId}</strong>
        </div>
      )}
      <div className={styles.link} onClick={() => navigate('/login')}>
        로그인 페이지로 돌아가기
      </div>
    </div>
  );
};

export default FindIdPage;
