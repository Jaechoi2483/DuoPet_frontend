import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupContext } from '../../../components/context/SignupContext';
import styles from './SignupStep1.module.css';
import apiClient from '../../../utils/axios';

function SignupStep4() {
  const navigate = useNavigate();
  const { signupData } = useContext(SignupContext);

  const [agreeAll, setAgreeAll] = useState(false);
  const [terms1, setTerms1] = useState(false); // 필수
  const [terms2, setTerms2] = useState(false); // 필수
  const [terms3, setTerms3] = useState(false); // 선택

  const [error, setError] = useState('');

  const handleAllAgree = () => {
    const newValue = !agreeAll;
    setAgreeAll(newValue);
    setTerms1(newValue);
    setTerms2(newValue);
    setTerms3(newValue);
  };

  const handleSubmit = () => {
    setError('');

    if (!terms1 || !terms2) {
      setError('필수 약관에 모두 동의해주세요.');
      return;
    }

    console.log('[✅ signupData 최종 확인]', signupData);
    alert('가입 정보가 정상적으로 넘어왔습니다!');
    navigate('/signup/complete'); // 또는 '/login'
  };

  //   const handleSubmit = async () => {
  //     setError('');
  //     if (!terms1 || !terms2) {
  //       setError('필수 약관에 모두 동의해주세요.');
  //       return;
  //     }

  //     try {
  //       const formData = new FormData();
  //       formData.append(
  //         'data',
  //         new Blob([JSON.stringify(signupData)], { type: 'application/json' })
  //       );

  //       if (signupData.profileFile) {
  //         formData.append('file', signupData.profileFile);
  //       }

  //       const res = await fetch('/users/signup/final', {
  //         method: 'POST',
  //         body: formData,
  //       });

  //       if (res.ok) {
  //         alert('회원가입이 완료되었습니다!');
  //         navigate('/login');
  //       } else {
  //         const errText = await res.text();
  //         setError(errText || '회원가입 실패');
  //       }
  //     } catch (err) {
  //       console.error(err);
  //       setError('서버 오류가 발생했습니다.');
  //     }
  //   };

  const handlePrev = () => {
    navigate('/signup/step3');
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>회원가입</h2>
      <p className={styles.subtitle}>DuoPet 서비스 약관에 동의해주세요.</p>

      <div className={styles.stepHeader}>
        <div className={styles.stepItem}>기본 정보</div>
        <div className={styles.stepItem}>개인 정보</div>
        <div className={styles.stepItem}>가입 유형</div>
        <div className={styles.stepItemActive}>약관 동의</div>
      </div>

      <div className={styles.formGroup}>
        <label>
          <input type="checkbox" checked={agreeAll} onChange={handleAllAgree} />
          <strong style={{ marginLeft: '8px' }}>전체 동의</strong>
        </label>
      </div>

      <div className={styles.formGroup}>
        <label>
          <input
            type="checkbox"
            checked={terms1}
            onChange={(e) => setTerms1(e.target.checked)}
          />
          <span style={{ marginLeft: '8px' }}>
            [필수] 서비스 이용 약관 동의
          </span>
        </label>
      </div>

      <div className={styles.formGroup}>
        <label>
          <input
            type="checkbox"
            checked={terms2}
            onChange={(e) => setTerms2(e.target.checked)}
          />
          <span style={{ marginLeft: '8px' }}>
            [필수] 개인정보 수집 및 이용 동의
          </span>
        </label>
      </div>

      <div className={styles.formGroup}>
        <label>
          <input
            type="checkbox"
            checked={terms3}
            onChange={(e) => setTerms3(e.target.checked)}
          />
          <span style={{ marginLeft: '8px' }}>
            [선택] 마케팅 정보 수신 동의
          </span>
        </label>
      </div>

      {error && <p className={styles.globalError}>{error}</p>}

      <div className={styles.buttonGroup}>
        <button className={styles.prevButton} onClick={handlePrev}>
          이전
        </button>
        <button className={styles.nextButton} onClick={handleSubmit}>
          가입 완료
        </button>
      </div>
    </div>
  );
}

export default SignupStep4;
