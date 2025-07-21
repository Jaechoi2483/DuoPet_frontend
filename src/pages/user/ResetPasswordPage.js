import React, { useState } from 'react';
import styles from '../../components/common/FindIDAndPWD.module.css';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../utils/axios';
import FindTabHeader from '../../components/common/FindTabHeader';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginId = location.state?.loginId || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%*?&])[A-Za-z\d#$@!%*?&]{8,20}$/;

  const handleReset = async () => {
    if (!password || !confirm) {
      alert('비밀번호를 모두 입력해주세요!');
      return;
    }

    if (password !== confirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!passwordRegex.test(password)) {
      alert(
        '비밀번호 형식이 올바르지 않습니다.\n영문 대소문자, 숫자, 특수문자(@#$!%*?&)를 포함한 8~20자로 설정해주세요.'
      );
      return;
    }

    try {
      await apiClient.post('/users/reset-password', {
        loginId,
        newPassword: password,
      });
      alert('비밀번호가 성공적으로 변경되었습니다.');
      navigate('/login');
    } catch (err) {
      alert('비밀번호 변경 실패. 다시 시도해주세요.');
    }
  };

  return (
    <div className={styles.container}>
      <FindTabHeader />
      <div className={styles.successBox}>
        ✅ 인증 완료
        <br />
        <span className={styles.successText}>새로운 비밀번호를 설정해주세요.</span>
      </div>
      <input
        type="password"
        className={styles.input}
        placeholder="새 비밀번호를 입력하세요"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <p className={styles.guideText}>
        비밀번호는 8~20자 사이로, 대/소문자, 숫자, 특수문자(@$!%*?&)를 각각 하나 이상 포함해야 합니다.
      </p>
      <input
        type="password"
        className={styles.input}
        placeholder="비밀번호를 다시 입력하세요"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      <button className={styles.submit} onClick={handleReset} disabled={!password || !confirm}>
        비밀번호 변경
      </button>
      <div className={styles.link} onClick={() => navigate('/login')}>
        로그인 페이지로 돌아가기
      </div>
    </div>
  );
};

export default ResetPasswordPage;
