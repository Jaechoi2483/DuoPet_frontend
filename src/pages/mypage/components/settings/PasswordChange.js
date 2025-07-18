import React, { useState } from 'react';
import styles from './PasswordChange.module.css';

const PasswordChange = ({ onBack }) => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 입력 시 해당 필드의 에러 메시지 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!passwords.currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요.';
    }

    if (!passwords.newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.';
    } else if (passwords.newPassword.length < 8) {
      newErrors.newPassword = '비밀번호는 8자 이상이어야 합니다.';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwords.newPassword)) {
      newErrors.newPassword = '비밀번호는 대소문자와 숫자를 포함해야 합니다.';
    }

    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    if (passwords.currentPassword === passwords.newPassword) {
      newErrors.newPassword = '현재 비밀번호와 동일한 비밀번호는 사용할 수 없습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // 실제로는 API 호출
    console.log('비밀번호 변경:', {
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword
    });

    alert('비밀번호가 성공적으로 변경되었습니다.');
    
    // 폼 초기화
    setPasswords({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    // 이전 페이지로 돌아가기
    onBack();
  };

  return (
    <div className={styles.passwordChangeContainer}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          ← 뒤로가기
        </button>
        <h2 className={styles.title}>비밀번호 변경</h2>
      </div>

      <div className={styles.passwordContent}>
        <div className={styles.infoBox}>
          <p className={styles.infoText}>
            안전한 계정 관리를 위해 정기적으로 비밀번호를 변경해주세요.
          </p>
        </div>

        <form className={styles.passwordForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="currentPassword" className={styles.label}>
              현재 비밀번호
            </label>
            <div className={styles.inputWrapper}>
              <input
                type={showPassword.current ? 'text' : 'password'}
                id="currentPassword"
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.currentPassword ? styles.error : ''}`}
                placeholder="현재 비밀번호를 입력하세요"
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPassword.current ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.currentPassword && (
              <span className={styles.errorMessage}>{errors.currentPassword}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="newPassword" className={styles.label}>
              새 비밀번호
            </label>
            <div className={styles.inputWrapper}>
              <input
                type={showPassword.new ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.newPassword ? styles.error : ''}`}
                placeholder="새 비밀번호를 입력하세요"
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPassword.new ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.newPassword && (
              <span className={styles.errorMessage}>{errors.newPassword}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              새 비밀번호 확인
            </label>
            <div className={styles.inputWrapper}>
              <input
                type={showPassword.confirm ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.confirmPassword ? styles.error : ''}`}
                placeholder="새 비밀번호를 다시 입력하세요"
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPassword.confirm ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className={styles.errorMessage}>{errors.confirmPassword}</span>
            )}
          </div>

          <div className={styles.passwordRules}>
            <h4 className={styles.rulesTitle}>비밀번호 규칙</h4>
            <ul className={styles.rulesList}>
              <li>최소 8자 이상</li>
              <li>대문자, 소문자, 숫자 포함</li>
              <li>특수문자 사용 권장</li>
              <li>개인정보 포함 금지</li>
            </ul>
          </div>

          <button type="submit" className={styles.submitButton}>
            비밀번호 변경
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordChange;