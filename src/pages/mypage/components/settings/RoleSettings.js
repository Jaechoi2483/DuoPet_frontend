// ✅ 최종 리팩토링 RoleSettings.js
// 전문가(VetForm), 보호소(ShelterForm) 분리 완료, 커서 튕김 해결됨

import React, { useState, useContext, useEffect, useCallback } from 'react';
import styles from './RoleSettings.module.css';
import apiClient from '../../../../utils/axios';
import { AuthContext } from '../../../../AuthProvider';
import ShelterForm from './ShelterForm';
import VetForm from './VetForm';

const RoleSettings = ({ onBack }) => {
  const { userNo } = useContext(AuthContext);
  const [selectedRole, setSelectedRole] = useState('');
  const [vetForm, setVetForm] = useState({
    specialization: '',
    isCustomSpecialization: false,
    licenseNumber: '',
    hospital: '',
    vetHospitalAddress: '',
    website: '',
    vetFileOriginalFilename: '',
    vetFileRenameFilename: '',
    licenseFile: null,
    phone: '',
    email: '',
  });
  const [shelterForm, setShelterForm] = useState({
    shelterName: '',
    shelterPhone: '',
    shelterEmail: '',
    shelterAddress: '',
    capacity: '',
    operatingHours: '',
    shelterFileOriginalFilename: '',
    shelterFileRenameFilename: '',
    shelterProfileFile: null,
    authFileDescription: '',
    website: '',
  });
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!selectedRole) return;
    if (selectedRole === 'vet' && !vetForm.licenseNumber && !vetForm.hospital) {
      setVetForm({
        specialization: '',
        isCustomSpecialization: false,
        licenseNumber: '',
        hospital: '',
        vetHospitalAddress: '',
        website: '',
        vetFileOriginalFilename: '',
        vetFileRenameFilename: '',
        licenseFile: null,
        phone: '',
        email: '',
      });
    } else if (selectedRole === 'shelter' && !shelterForm.shelterName && !shelterForm.shelterPhone) {
      setShelterForm({
        shelterName: '',
        shelterPhone: '',
        shelterEmail: '',
        shelterAddress: '',
        capacity: '',
        operatingHours: '',
        shelterFileOriginalFilename: '',
        shelterFileRenameFilename: '',
        shelterProfileFile: null,
        authFileDescription: '',
        website: '',
      });
    }
  }, [selectedRole]);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setErrors({});
  };

  const handleVetInputChange = (e) => {
    const { name, value } = e.target;
    setVetForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleShelterInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setShelterForm((prev) => {
      if (prev[name] === value) return prev;
      return { ...prev, [name]: value };
    });
  }, []);

  const handleShelterFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setShelterForm((prev) => ({
      ...prev,
      shelterFileOriginalFilename: file.name,
      shelterFileRenameFilename: file.name,
      shelterProfileFile: file,
    }));
  };

  const handleVetFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVetForm((prev) => ({
      ...prev,
      licenseFile: file,
      vetFileOriginalFilename: file.name,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!selectedRole) newErrors.selectedRole = '역할을 선택해주세요.';
    if (selectedRole === 'vet') {
      if (!vetForm.specialization) newErrors.specialization = '전문 분야를 입력해주세요.';
      if (!vetForm.licenseNumber) newErrors.licenseNumber = '면허번호를 입력해주세요.';
      if (!vetForm.hospital) newErrors.hospital = '병원명을 입력해주세요.';
      if (!vetForm.vetHospitalAddress) newErrors.vetHospitalAddress = '병원 주소를 입력해주세요.';
      if (!vetForm.vetFileOriginalFilename) newErrors.vetFileOriginalFilename = '면허증 파일을 첨부해주세요.';
    }
    if (selectedRole === 'shelter') {
      if (!shelterForm.shelterName) newErrors.shelterName = '보호소명을 입력해주세요.';
      if (!shelterForm.shelterPhone) newErrors.shelterPhone = '연락처를 입력해주세요.';
      if (!shelterForm.shelterEmail) newErrors.shelterEmail = '이메일을 입력해주세요.';
      if (!shelterForm.shelterAddress) newErrors.shelterAddress = '주소를 입력해주세요.';
      if (!shelterForm.operatingHours) newErrors.operatingHours = '운영시간을 입력해주세요.';
      if (!shelterForm.shelterFileOriginalFilename) newErrors.shelterFileOriginalFilename = '인증 파일을 첨부해주세요.';
      if (!shelterForm.authFileDescription) newErrors.authFileDescription = '파일 설명을 입력해주세요.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (selectedRole === 'vet') {
        const formData = new FormData();
        formData.append('userId', userNo);
        formData.append('name', vetForm.hospital);
        formData.append('licenseNumber', vetForm.licenseNumber);
        formData.append('phone', vetForm.phone);
        formData.append('email', vetForm.email);
        formData.append('address', vetForm.vetHospitalAddress);
        formData.append('website', vetForm.website);
        formData.append('specialization', vetForm.specialization);
        if (vetForm.licenseFile) {
          formData.append('licenseFile', vetForm.licenseFile);
        }
        await apiClient.post('/mypage/role/vet', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('전문가 역할로 변경 요청이 완료되었습니다.');
      }
      if (selectedRole === 'shelter') {
        const formData = new FormData();
        formData.append('userId', userNo);
        formData.append('shelterName', shelterForm.shelterName);
        formData.append('phone', shelterForm.shelterPhone);
        formData.append('email', shelterForm.shelterEmail);
        formData.append('address', shelterForm.shelterAddress);
        formData.append('website', shelterForm.website);
        formData.append('capacity', shelterForm.capacity);
        formData.append('operatingHours', shelterForm.operatingHours);
        formData.append('authFileDescription', shelterForm.authFileDescription);
        if (shelterForm.shelterProfileFile) {
          formData.append('shelterProfileFile', shelterForm.shelterProfileFile);
        }
        await apiClient.post('/mypage/role/shelter', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('보호소 운영자 역할로 변경 요청이 완료되었습니다.');
      }
      onBack();
    } catch (error) {
      alert('가입 유형 변경 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  return (
    <div className={styles.passwordChangeContainer}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          ← 뒤로가기
        </button>
        <h2 className={styles.title}>가입 유형 변경</h2>
      </div>
      <div className={styles.passwordContent}>
        <form className={styles.passwordForm} onSubmit={handleSubmit}>
          <div className={styles.infoBox}>
            <p className={styles.infoText}>변경된 가입 유형에 따라 이용 가능한 서비스가 달라질 수 있습니다.</p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>회원 역할</label>
            <div className={styles.radioGroup + ' ' + styles.radioGroupWide}>
              {['vet', 'shelter'].map((role) => (
                <div key={role} className={styles.radioLabel + ' ' + styles.radioLabelWide}>
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    id={`role-${role}`}
                    checked={selectedRole === role}
                    onChange={() => handleRoleChange(role)}
                  />
                  <label htmlFor={`role-${role}`} className={styles.radioContent}>
                    <strong>{role === 'vet' ? '전문가 (수의사 등)' : '보호소 운영자'}</strong>
                    <div className={styles.radioDesc}>
                      {role === 'vet' && '전문 상담, 콘텐츠 제공 등 전문가 전용 기능을 사용할 수 있습니다.'}
                      {role === 'shelter' && '입양 등록, 보호소 운영 기능을 사용할 수 있습니다.'}
                    </div>
                  </label>
                </div>
              ))}
            </div>
            {errors.selectedRole && <span className={styles.errorMessage}>{errors.selectedRole}</span>}
          </div>

          {/* 역할별 폼 렌더링 */}
          {selectedRole === 'vet' && (
            <VetForm
              form={vetForm}
              errors={errors}
              onChange={handleVetInputChange}
              onFileUpload={handleVetFileUpload}
            />
          )}
          {selectedRole === 'shelter' && (
            <ShelterForm
              form={shelterForm}
              errors={errors}
              onChange={handleShelterInputChange}
              onFileUpload={handleShelterFileUpload}
              uploading={uploading}
            />
          )}

          <button type="submit" className={styles.submitButton} disabled={uploading}>
            저장
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoleSettings;
