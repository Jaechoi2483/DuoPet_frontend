// src/pages/mypage/components/settings/VetForm.jsx
import React from 'react';
import styles from './RoleSettings.module.css';

const VetForm = React.memo(({ form, errors, onChange, onFileUpload }) => {
  console.log('💉 VetForm 렌더링됨');

  return (
    <div className={styles.additionalBox}>
      <h3>전문가 추가 정보</h3>

      <div className={styles.formGroup}>
        <label>전문 분야 *</label>
        <select name="specialization" value={form.specialization || ''} onChange={onChange}>
          <option value="">전문 분야 선택</option>
          <option value="내과">내과</option>
          <option value="외과">외과</option>
          <option value="피부과">피부과</option>
          <option value="행동치료">행동치료</option>
          <option value="치과">치과</option>
          <option value="재활">재활</option>
          <option value="직접입력">직접입력</option>
        </select>
        {form.isCustomSpecialization && (
          <input
            type="text"
            name="specialization"
            placeholder="전문 분야를 직접 입력하세요"
            value={form.specialization || ''}
            onChange={onChange}
            style={{ marginTop: '10px' }}
          />
        )}
        {errors.specialization && <span className={styles.errorMessage}>{errors.specialization}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>수의사 면허번호 *</label>
        <input
          type="text"
          name="licenseNumber"
          placeholder="예: 제XXXXX호"
          value={form.licenseNumber || ''}
          onChange={onChange}
        />
        {errors.licenseNumber && <span className={styles.errorMessage}>{errors.licenseNumber}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>소속 병원명 *</label>
        <input
          type="text"
          name="hospital"
          placeholder="예: 펫프렌즈 동물병원"
          value={form.hospital || ''}
          onChange={onChange}
        />
        {errors.hospital && <span className={styles.errorMessage}>{errors.hospital}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>병원 주소 *</label>
        <input
          type="text"
          name="vetHospitalAddress"
          placeholder="예: 서울 서초구 방배로 101"
          value={form.vetHospitalAddress || ''}
          onChange={onChange}
        />
        {errors.vetHospitalAddress && <span className={styles.errorMessage}>{errors.vetHospitalAddress}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>웹사이트 주소 (선택)</label>
        <input
          type="text"
          name="website"
          placeholder="예: https://clinicpet.com"
          value={form.website || ''}
          onChange={onChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>수의사 면허증 첨부 *</label>
        <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={onFileUpload} />
        {form.vetFileOriginalFilename && (
          <div className={styles.statusMessage}>✅ 파일 선택됨: {form.vetFileOriginalFilename}</div>
        )}
        {errors.vetFileOriginalFilename && (
          <span className={styles.errorMessage}>{errors.vetFileOriginalFilename}</span>
        )}
      </div>

      <p className={styles.notice}>
        🔒 수의사 면허증 첨부는 필수이며, 관리자 승인 후 전문가 기능을 사용할 수 있습니다.
      </p>
    </div>
  );
});

export default VetForm;
