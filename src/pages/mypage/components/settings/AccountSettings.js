import React, { useState, useContext } from 'react';
import { AuthContext } from '../../../../AuthProvider';
import styles from './AccountSettings.module.css';

const AccountSettings = ({ onBack }) => {
  const { username } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    username: username || 'user123',
    email: 'user@duopet.com',
    phone: '010-9876-5432',
    name: '정세현'
  });

  const [isEditing, setIsEditing] = useState({
    email: false,
    phone: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (field) => {
    setIsEditing(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleSave = async (field) => {
    // 실제로는 API 호출하여 정보 업데이트
    console.log(`${field} 업데이트:`, formData[field]);
    
    setIsEditing(prev => ({
      ...prev,
      [field]: false
    }));
    
    alert(`${field === 'email' ? '이메일이' : '전화번호가'} 변경되었습니다.`);
  };

  const handleCancel = (field) => {
    // 원래 값으로 되돌리기 (실제로는 서버에서 다시 가져와야 함)
    setIsEditing(prev => ({
      ...prev,
      [field]: false
    }));
  };

  return (
    <div className={styles.accountSettingsContainer}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          ← 뒤로가기
        </button>
        <h2 className={styles.title}>계정 설정</h2>
      </div>

      <div className={styles.settingsContent}>
        <div className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>기본 정보</h3>
          
          <div className={styles.infoItem}>
            <label className={styles.label}>아이디</label>
            <div className={styles.valueRow}>
              <span className={styles.value}>{formData.username}</span>
              <span className={styles.notice}>아이디는 변경할 수 없습니다</span>
            </div>
          </div>

          <div className={styles.infoItem}>
            <label className={styles.label}>이름</label>
            <div className={styles.valueRow}>
              <span className={styles.value}>{formData.name}</span>
            </div>
          </div>
        </div>

        <div className={styles.editableSection}>
          <h3 className={styles.sectionTitle}>연락처 정보</h3>
          
          <div className={styles.editableItem}>
            <label className={styles.label}>이메일</label>
            <div className={styles.editRow}>
              {isEditing.email ? (
                <>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                  <div className={styles.buttonGroup}>
                    <button 
                      className={styles.saveButton}
                      onClick={() => handleSave('email')}
                    >
                      저장
                    </button>
                    <button 
                      className={styles.cancelButton}
                      onClick={() => handleCancel('email')}
                    >
                      취소
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className={styles.value}>{formData.email}</span>
                  <button 
                    className={styles.editButton}
                    onClick={() => handleEdit('email')}
                  >
                    변경
                  </button>
                </>
              )}
            </div>
          </div>

          <div className={styles.editableItem}>
            <label className={styles.label}>전화번호</label>
            <div className={styles.editRow}>
              {isEditing.phone ? (
                <>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="010-0000-0000"
                  />
                  <div className={styles.buttonGroup}>
                    <button 
                      className={styles.saveButton}
                      onClick={() => handleSave('phone')}
                    >
                      저장
                    </button>
                    <button 
                      className={styles.cancelButton}
                      onClick={() => handleCancel('phone')}
                    >
                      취소
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className={styles.value}>{formData.phone}</span>
                  <button 
                    className={styles.editButton}
                    onClick={() => handleEdit('phone')}
                  >
                    변경
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.verificationSection}>
          <h3 className={styles.sectionTitle}>계정 인증</h3>
          <div className={styles.verificationItem}>
            <div className={styles.verificationInfo}>
              <span className={styles.verificationLabel}>이메일 인증</span>
              <span className={styles.verificationStatus}>✓ 인증완료</span>
            </div>
          </div>
          <div className={styles.verificationItem}>
            <div className={styles.verificationInfo}>
              <span className={styles.verificationLabel}>휴대폰 인증</span>
              <span className={styles.verificationStatus}>✓ 인증완료</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;