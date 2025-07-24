// src/pages/mypage/components/settings/ShelterForm.jsx
import React from 'react';
import styles from './RoleSettings.module.css';

const ShelterForm = React.memo(({ form, errors, onChange, onFileUpload, uploading }) => {
  console.log('🏠 ShelterForm 렌더링됨');

  return (
    <div className={styles.additionalBox}>
      <h3>보호소 운영자 추가 정보</h3>

      <div className={styles.formGroup}>
        <label>보호소명 *</label>
        <input
          type="text"
          name="shelterName"
          placeholder="예: 행복한 보호소"
          value={form.shelterName || ''}
          onChange={onChange}
        />
        {errors.shelterName && <span className={styles.errorMessage}>{errors.shelterName}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>보호소 연락처 *</label>
        <input
          type="text"
          name="shelterPhone"
          placeholder="예: 010-1234-5678"
          value={form.shelterPhone || ''}
          onChange={onChange}
        />
        {errors.shelterPhone && <span className={styles.errorMessage}>{errors.shelterPhone}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>보호소 이메일 *</label>
        <input
          type="text"
          name="shelterEmail"
          placeholder="예: shelter@example.com"
          value={form.shelterEmail || ''}
          onChange={onChange}
        />
        {errors.shelterEmail && <span className={styles.errorMessage}>{errors.shelterEmail}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>보호소 주소 *</label>
        <input
          type="text"
          name="shelterAddress"
          placeholder="예: 서울시 강남구 테헤란로 123"
          value={form.shelterAddress || ''}
          onChange={onChange}
        />
        {errors.shelterAddress && <span className={styles.errorMessage}>{errors.shelterAddress}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>웹사이트 주소 (선택)</label>
        <input
          type="text"
          name="website"
          placeholder="예: https://happy-shelter.com"
          value={form.website || ''}
          onChange={onChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>수용 가능 동물 수 (선택)</label>
        <input type="number" name="capacity" placeholder="예: 30" value={form.capacity || ''} onChange={onChange} />
      </div>

      <div className={styles.formGroup}>
        <label>운영 시간 *</label>
        <input
          type="text"
          name="operatingHours"
          placeholder="예: 09:00 ~ 18:00"
          value={form.operatingHours || ''}
          onChange={onChange}
        />
        {errors.operatingHours && <span className={styles.errorMessage}>{errors.operatingHours}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>인증 서류 첨부 *</label>
        <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={onFileUpload} disabled={uploading} />
        {form.shelterFileOriginalFilename && (
          <div className={styles.statusMessage}>✅ 파일 선택됨: {form.shelterFileOriginalFilename}</div>
        )}
        {errors.shelterFileOriginalFilename && (
          <span className={styles.errorMessage}>{errors.shelterFileOriginalFilename}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label>파일 설명 *</label>
        <input
          type="text"
          name="authFileDescription"
          placeholder="예: 사업자 등록증 또는 위탁 계약서"
          value={form.authFileDescription || ''}
          onChange={onChange}
        />
        {errors.authFileDescription && <span className={styles.errorMessage}>{errors.authFileDescription}</span>}
      </div>

      <p className={styles.notice}>🔒 첨부한 인증 파일은 관리자 검토 후 승인되며, 보호소 운영 기능이 활성화됩니다.</p>
    </div>
  );
});

export default ShelterForm;
