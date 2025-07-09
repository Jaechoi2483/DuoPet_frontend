// src/pages/signup/SignupStep2.js

import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignupStep2.module.css';
import { SignupContext } from '../../../components/context/SignupContext';

function SignupStep2() {
  const navigate = useNavigate();
  const { signupData, setSignupData } = useContext(SignupContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupData({ ...signupData, [name]: value });
  };

  const handleNext = () => {
    const { userName, nickname, phone, age, gender, address, userEmail } =
      signupData;
    if (
      !userName ||
      !nickname ||
      !phone ||
      !age ||
      !gender ||
      !address ||
      !userEmail
    ) {
      alert('모든 항목을 입력해주세요.');
      return;
    }
    navigate('/signup/step3');
  };

  const handlePrev = () => {
    navigate('/signup/step1');
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>회원가입</h2>
      <p className={styles.subtitle}>
        DuoPet 서비스를 위한 정보를 입력해주세요.
      </p>

      <div className={styles.stepHeader}>
        <div className={styles.stepItem}>기본 정보</div>
        <div className={styles.stepItemActive}>개인 정보</div>
        <div className={styles.stepItem}>가입 유형</div>
      </div>

      <div className={styles.formGroup}>
        <label>실명 *</label>
        <input
          type="text"
          name="userName"
          placeholder="실명을 입력하세요"
          value={signupData.userName}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>닉네임 *</label>
        <input
          type="text"
          name="nickname"
          placeholder="닉네임을 입력하세요"
          value={signupData.nickname}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>전화번호 *</label>
        <input
          type="text"
          name="phone"
          placeholder="전화번호를 입력하세요"
          value={signupData.phone}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>나이 *</label>
        <input
          type="number"
          name="age"
          placeholder="나이를 입력하세요"
          value={signupData.age}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>성별 *</label>
        <div className={styles.genderGroup}>
          {['남성', '여성', '기타'].map((label) => (
            <label
              key={label}
              className={`${styles.genderCard} ${
                signupData.gender === label ? styles.selected : ''
              }`}
            >
              <input
                type="radio"
                name="gender"
                value={label}
                checked={signupData.gender === label}
                onChange={handleChange}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>주소 *</label>
        <input
          type="text"
          name="address"
          placeholder="주소를 입력하세요"
          value={signupData.address}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>이메일 *</label>
        <input
          type="email"
          name="userEmail"
          placeholder="이메일을 입력하세요"
          value={signupData.userEmail}
          onChange={handleChange}
        />
      </div>

      <div className={styles.buttonGroup}>
        <button
          type="button"
          className={styles.prevButton}
          onClick={handlePrev}
        >
          이전 단계
        </button>
        <button
          type="button"
          className={styles.nextButton}
          onClick={handleNext}
        >
          다음 단계
        </button>
      </div>
    </div>
  );
}

export default SignupStep2;
