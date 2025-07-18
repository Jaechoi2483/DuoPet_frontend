import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupContext, initialSignupData } from '../../../components/context/SignupContext';
import styles from './SignupStep1.module.css';
import apiClient from '../../../utils/axios';

function SignupStep4() {
  const navigate = useNavigate();
  const { signupData, setSignupData } = useContext(SignupContext);

  const [agreeAll, setAgreeAll] = useState(false);
  const [terms1, setTerms1] = useState(false);
  const [terms2, setTerms2] = useState(false);
  const [terms3, setTerms3] = useState(false);
  const [error, setError] = useState('');

  const handleAllAgree = () => {
    const newValue = !agreeAll;
    setAgreeAll(newValue);
    setTerms1(newValue);
    setTerms2(newValue);
    setTerms3(newValue);
  };

  const handleSubmit = async () => {
    setError('');
    if (!terms1 || !terms2) {
      setError('필수 약관에 모두 동의해주세요.');
      return;
    }

    try {
      // 1. USERS 테이블 등록
      const formData = new FormData();
      formData.append('data', new Blob([JSON.stringify(signupData)], { type: 'application/json' }));
      if (signupData.profileFile) {
        formData.append('file', signupData.profileFile);
      }

      const userRes = await apiClient.post('/users/signup/final', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const userId = userRes.data.userId;
      localStorage.setItem('userId', userId); // 펫 등록에 필요
      console.log('[Step4] 저장할 userId:', userId);

      // 2. VET 테이블 등록
      if (signupData.role === 'vet') {
        const vetDto = {
          name: signupData.userName,
          licenseNumber: signupData.licenseNumber,
          phone: signupData.phone,
          email: signupData.userEmail,
          address: signupData.address,
          website: signupData.website,
          specialization: signupData.specialization,
          vetFileOriginalFilename: signupData.vetFileOriginalFilename,
          vetFileRenameFilename: signupData.vetFileRenameFilename,
        };

        const vetFormData = new FormData();
        vetFormData.append('vetDto', new Blob([JSON.stringify(vetDto)], { type: 'application/json' }));

        if (!signupData.licenseFile) {
          setError('면허증 첨부파일이 누락되었습니다.');
          return;
        }

        vetFormData.append('licenseFile', signupData.licenseFile);
        vetFormData.append('loginId', signupData.loginId);

        await apiClient.post('/vet/register', vetFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // 3. SHELTER 테이블 등록
      if (signupData.role === 'shelter') {
        const shelterDto = {
          shelterName: signupData.shelterName,
          phone: signupData.phone,
          email: signupData.userEmail,
          address: signupData.address,
          website: signupData.website,
          capacity: signupData.capacity,
          operatingHours: signupData.operatingHours,
          shelterFileOriginalFilename: signupData.shelterFileOriginalFilename,
          shelterFileRenameFilename: signupData.shelterFileRenameFilename,
          authFileDescription: signupData.authFileDescription,
        };

        const shelterFormData = new FormData();
        shelterFormData.append('shelterDto', new Blob([JSON.stringify(shelterDto)], { type: 'application/json' }));

        if (!signupData.shelterProfileFile) {
          setError('인증 첨부파일이 누락되었습니다.');
          return;
        }

        shelterFormData.append('shelterProfileFile', signupData.shelterProfileFile);
        shelterFormData.append('loginId', signupData.loginId);

        await apiClient.post('/shelter/register', shelterFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // Context 초기화 (보안 차원)
      setSignupData(initialSignupData);

      alert('회원가입이 완료되었습니다!');
      navigate('/signup/step5'); // 반려동물 등록 단계로 이동
    } catch (err) {
      console.error(err);

      // 1. 서버가 응답한 에러 메시지 가져오기
      const message = err.response?.data;

      // 2. 특정 필드 누락 등 예상 가능한 경우
      if (message?.includes('LOGIN_ID')) {
        setError('아이디가 누락되었습니다. 처음부터 다시 시도해주세요.');
      } else {
        // 3. 그 외 일반적인 오류
        setError('회원가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    }
  };

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

      <div className={styles.agreementBox}>
        <div className={`${styles.agreeItem} ${styles.agreeAll}`}>
          <input type="checkbox" checked={agreeAll} onChange={handleAllAgree} />
          전체 약관에 동의합니다
        </div>

        <div className={styles.agreeItem}>
          <input type="checkbox" checked={terms1} onChange={(e) => setTerms1(e.target.checked)} />
          [필수] 서비스 이용 약관 동의
        </div>

        <div className={styles.agreeItem}>
          <input type="checkbox" checked={terms2} onChange={(e) => setTerms2(e.target.checked)} />
          [필수] 개인정보 수집 및 이용 동의
        </div>

        <div className={styles.agreeItem}>
          <input type="checkbox" checked={terms3} onChange={(e) => setTerms3(e.target.checked)} />
          [선택] 마케팅 정보 수신 동의
        </div>
      </div>

      {error && <p className={styles.agreeError}>{String(error)}</p>}

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
