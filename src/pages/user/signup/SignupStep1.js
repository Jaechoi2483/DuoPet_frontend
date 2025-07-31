// src/pages/signup/SignupStep1.js

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignupStep1.module.css';
import { SignupContext } from '../../../components/context/SignupContext';
import apiClient from '../../../utils/axios';

function SignupStep1() {
  const navigate = useNavigate();
  const { setSignupData } = useContext(SignupContext);

  const [loginId, setLoginId] = useState('');
  const [userPwd, setUserPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const [idAvailable, setIdAvailable] = useState(null);
  const [error, setError] = useState('');

  const isPasswordValid = (pwd) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,20}$/;
    return regex.test(pwd);
  };

  const checkLoginId = async () => {
    if (!loginId || loginId.trim() === '') {
      setError('아이디를 입력해주세요.');
      setIdAvailable(null);
      return;
    }
    try {
      const res = await apiClient.get(`/users/check-id?loginId=${loginId}`);
      setIdAvailable(!res.data);
    } catch (err) {
      console.error(err);
      setError('아이디 중복 확인 중 오류가 발생했습니다.');
    }
  };

  const handleNext = () => {
    setError('');
    const validPwd = isPasswordValid(userPwd);
    const matchPwd = userPwd === confirmPwd;

    if (!loginId || !userPwd || !confirmPwd) {
      setError('필수 항목을 입력해주세요.');
      return;
    }

    if (!idAvailable) {
      setError('아이디 중복 확인이 필요합니다.');
      return;
    }

    if (!validPwd) {
      setError('비밀번호 조건이 맞지 않습니다.');
      return;
    }

    if (!matchPwd) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // Context에 저장만 하고 다음 단계로 이동
    setSignupData((prev) => ({
      ...prev,
      loginId,
      userPwd,
    }));

    navigate('/signup/step2');
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>회원가입</h2>
      <p className={styles.subtitle}>DuoPet 서비스를 이용하기 위한 회원가입입니다</p>

      <div className={styles.stepHeader}>
        <div className={styles.stepItemActive}>기본 정보</div>
        <div className={styles.stepItem}>개인 정보</div>
        <div className={styles.stepItem}>가입 유형</div>
        <div className={styles.stepItem}>약관 동의</div>
      </div>

      <div className={styles.formGroup}>
        <label>아이디 *</label>

        {/* input + 버튼 한 줄 정렬 */}
        <div className={styles.inputRow}>
          <input
            type="text"
            className={styles.inputField}
            placeholder="아이디를 입력하세요"
            value={loginId}
            onChange={(e) => {
              setLoginId(e.target.value);
              setIdAvailable(null);
              setError('');
            }}
          />
          <button type="button" className={styles.checkButton} onClick={checkLoginId}>
            중복 확인
          </button>
        </div>

        {/* 메시지 영역 */}
        {loginId === '' && error === '아이디를 입력해주세요.' && (
          <div className={`${styles.statusMessage} ${styles.statusError}`}>{error}</div>
        )}
        {loginId && idAvailable === false && (
          <div className={`${styles.statusMessage} ${styles.statusError}`}>이미 사용 중인 아이디입니다.</div>
        )}
        {loginId && idAvailable === true && (
          <div className={`${styles.statusMessage} ${styles.statusSuccess}`}>사용 가능한 아이디입니다.</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label>비밀번호 *</label>
        <input
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={userPwd}
          onChange={(e) => setUserPwd(e.target.value)}
        />
        <ul className={styles.pwdChecklist}>
          <li className={userPwd.length >= 8 && userPwd.length <= 20 ? styles.pass : styles.fail}>
            - 비밀번호 길이: 8~20자
          </li>
          <li className={/[A-Z]/.test(userPwd) ? styles.pass : styles.fail}>- 대문자(A~Z) 1자 이상 포함</li>
          <li className={/[a-z]/.test(userPwd) ? styles.pass : styles.fail}>- 소문자(a~z) 1자 이상 포함</li>
          <li className={/\d/.test(userPwd) ? styles.pass : styles.fail}>- 숫자(0~9) 1자 이상 포함</li>
          <li className={/[@$!%*?#&]/.test(userPwd) ? styles.pass : styles.fail}>
            - 특수문자(@, $, !, %, *, ?, #, &) 1자 이상 포함
          </li>
        </ul>
      </div>

      <div className={styles.formGroup}>
        <label>비밀번호 확인 *</label>
        <input
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          value={confirmPwd}
          onChange={(e) => setConfirmPwd(e.target.value)}
        />
        {confirmPwd && confirmPwd !== userPwd && <small className={styles.error}>비밀번호가 일치하지 않습니다.</small>}
      </div>

      {error &&
        error !== '아이디를 입력해주세요.' && ( // 아이디 관련 에러는 위에서 출력
          <p className={styles.globalError}>{error}</p>
        )}

      <button className={styles.nextButton} onClick={handleNext}>
        다음
      </button>
      <p className={styles.loginLink}>
        이미 계정이 있으신가요?{' '}
        <span onClick={() => navigate('/login')} className={styles.linkText}>
          로그인
        </span>
      </p>
    </div>
  );
}

export default SignupStep1;
