// src/pages/mypage/components/settings/RoleSettings.js

import React, { useState, useContext } from 'react';
import styles from './RoleSettings.module.css';
import apiClient from '../../../../utils/axios';
import { AuthContext } from '../../../../AuthProvider';

const RoleSettings = ({ onBack }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const { userid } = useContext(AuthContext);

  const handleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      alert('역할을 선택해주세요.');
      return;
    }

    try {
      const response = await apiClient.put('/users/update-role', {
        userId: userid,
        role: selectedRole,
      });

      alert('가입 유형이 성공적으로 변경되었습니다.');
      onBack(); // 변경 후 이전 페이지로 이동
    } catch (error) {
      console.error(error);
      alert('가입 유형 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.roleChangeContainer}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          ← 뒤로가기
        </button>
        <h2 className={styles.title}>가입 유형 변경</h2>
      </div>

      <div className={styles.infoBox}>
        <p className={styles.infoText}>변경된 가입 유형에 따라 이용 가능한 서비스가 달라질 수 있습니다.</p>
      </div>

      <form className={styles.roleForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>회원 역할</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input type="radio" name="role" value="user" checked={selectedRole === 'user'} onChange={handleChange} />
              일반 사용자 (반려동물 보호자)
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" name="role" value="vet" checked={selectedRole === 'vet'} onChange={handleChange} />
              전문가 (수의사 등)
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="role"
                value="shelter"
                checked={selectedRole === 'shelter'}
                onChange={handleChange}
              />
              보호소 운영자
            </label>
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>
          저장
        </button>
      </form>
    </div>
  );
};

export default RoleSettings;
