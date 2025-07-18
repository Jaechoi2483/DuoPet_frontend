import React, { useState } from 'react';
import styles from '../../components/common/FindIDAndPWD.module.css';
import apiClient from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import FindTabHeader from '../../components/common/FindTabHeader';

const FindPasswordPage = () => {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [serverCode, setServerCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const sendCode = async () => {
    try {
      const res = await apiClient.post('/send-sms', { email });
      setServerCode(res.data.authCode);
      alert('인증번호가 전송되었습니다.');
    } catch {
      alert('인증번호 전송 실패');
    }
  };

  const verifyCode = () => {
    if (authCode === serverCode) {
      alert('인증 성공!');
      setIsVerified(true);
    } else {
      alert('인증번호가 일치하지 않습니다.');
    }
  };

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
        placeholder="휴대폰 번호"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div className={styles.authRow}>
        <input
          className={styles.inputAuth}
          placeholder="인증번호"
          value={authCode}
          onChange={(e) => setAuthCode(e.target.value)}
        />
        <button className={styles.authButton} onClick={sendCode}>
          받기
        </button>
        <button className={styles.authButton} onClick={verifyCode}>
          확인
        </button>
      </div>
      <button className={styles.submit} onClick={goToResetPage} disabled={!isVerified}>
        비밀번호 재설정
      </button>
      <div className={styles.link} onClick={() => navigate('/login')}>
        로그인 페이지로 돌아가기
      </div>
    </div>
  );
};

export default FindPasswordPage;
