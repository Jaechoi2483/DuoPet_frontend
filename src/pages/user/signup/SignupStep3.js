import React, { useContext, useState } from 'react';
import axios from 'axios';
import { SignupContext } from '../../../components/context/SignupContext';
import styles from './SignupStep1.module.css'; // 통합 CSS
import { useNavigate } from 'react-router-dom';

const SignupStep3 = ({ onNext, onPrev }) => {
  const { signupData, setSignupData } = useContext(SignupContext);
  const [selectedRole, setSelectedRole] = useState(signupData.role);
  const navigate = useNavigate();

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setSignupData({ ...signupData, role });
  };

  const handlePrev = () => {
    navigate('/signup/step2');
  };

  const handleNext = () => {
    if (!selectedRole) {
      alert('가입 유형을 선택해주세요.');
      return;
    }
    navigate('/signup/step4');
  };

  const validateStep = () => {
    if (selectedRole === 'vet') {
      const { specialization, licenseNumber, hospital, vetHospitalAddress, vetFileOriginalFilename } = signupData;
      if (!specialization || !licenseNumber || !hospital || !vetHospitalAddress || !vetFileOriginalFilename) {
        alert('전문가 필수 정보를 모두 입력해주세요.');
        return false;
      }
    }

    if (selectedRole === 'shelter') {
      const { shelterName, shelterPhone, shelterEmail, shelterAddress, operatingHours } = signupData;
      if (!shelterName || !shelterPhone || !shelterEmail || !shelterAddress || !operatingHours) {
        alert('보호소 필수 정보를 모두 입력해주세요.');
        return false;
      }
    }

    return true;
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>회원가입</h2>
      <p className={styles.subtitle}>DuoPet 서비스를 위한 정보를 입력해주세요.</p>

      <div className={styles.stepHeader}>
        <div className={styles.stepItem}>기본 정보</div>
        <div className={styles.stepItem}>개인 정보</div>
        <div className={styles.stepItemActive}>가입 유형</div>
        <div className={styles.stepItem}>약관 동의</div>
      </div>

      <h2 className={styles.title}>가입 유형 선택</h2>
      <p className={styles.subtitle}>서비스 이용 목적에 맞는 유형을 선택해주세요.</p>

      <div className={styles.roleBox}>
        {['user', 'vet', 'shelter'].map((role) => (
          <label className={styles.radioCard} key={role}>
            <input
              type="radio"
              name="role"
              value={role}
              checked={selectedRole === role}
              onChange={() => handleRoleChange(role)}
            />
            <div className={styles.radioContent} onClick={() => handleRoleChange(role)}>
              <strong>
                {role === 'user'
                  ? '일반 사용자 (반려동물 보호자)'
                  : role === 'vet'
                    ? '전문가 (수의사 등)'
                    : '보호소 운영자'}
              </strong>
              <p>
                {role === 'user'
                  ? '건강 관리, 커뮤니티, AI 분석 기능 등을 사용할 수 있습니다.'
                  : role === 'vet'
                    ? '전문 상담, 콘텐츠 제공 등 전문가 전용 기능을 사용할 수 있습니다.'
                    : '입양 등록, 보호소 운영 기능을 사용할 수 있습니다.'}
              </p>
            </div>
          </label>
        ))}
      </div>

      {selectedRole === 'vet' && <VetForm signupData={signupData} setSignupData={setSignupData} />}
      {selectedRole === 'shelter' && <ShelterForm signupData={signupData} setSignupData={setSignupData} />}

      <div className={styles.buttonGroup}>
        <button className={styles.prevButton} onClick={handlePrev}>
          이전
        </button>
        <button
          className={styles.nextButton}
          onClick={() => {
            if (validateStep()) handleNext();
          }}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default SignupStep3;

// 전문가 폼
const VetForm = ({ signupData, setSignupData }) => {
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/vet/upload-temp', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { originalFilename, renameFilename } = res.data;

      console.log('[DEBUG] 서버 응답 파일명:', originalFilename, renameFilename);

      setSignupData((prev) => {
        const newData = {
          ...prev,
          vetFileOriginalFilename: originalFilename,
          vetFileRenameFilename: renameFilename,
          licenseFile: file,
          originalFilename, // 백엔드용
          renameFilename, // 백엔드용
        };
        console.log('[DEBUG] setSignupData 후 값:', newData);
        return newData;
      });
    } catch (err) {
      alert('면허증 업로드 실패');
    }
  };

  return (
    <div className={styles.additionalBox}>
      <h3>전문가 추가 정보</h3>

      <div className={styles.formGroup}>
        <label>전문 분야 *</label>
        <select
          value={signupData.specialization || ''}
          onChange={(e) => {
            const value = e.target.value;
            setSignupData({
              ...signupData,
              specialization: value === '직접입력' ? '' : value,
              isCustomSpecialization: value === '직접입력',
            });
          }}
        >
          <option value="">전문 분야 선택</option>
          <option value="내과">내과</option>
          <option value="외과">외과</option>
          <option value="피부과">피부과</option>
          <option value="행동치료">행동치료</option>
          <option value="치과">치과</option>
          <option value="재활">재활</option>
          <option value="직접입력">직접입력</option>
        </select>
        {signupData.isCustomSpecialization && (
          <input
            type="text"
            placeholder="전문 분야를 직접 입력하세요"
            value={signupData.specialization}
            onChange={(e) => setSignupData({ ...signupData, specialization: e.target.value })}
            style={{ marginTop: '10px' }}
          />
        )}
      </div>

      <div className={styles.formGroup}>
        <label>수의사 면허번호 *</label>
        <input
          type="text"
          placeholder="예: 제XXXXX호"
          value={signupData.licenseNumber || ''}
          onChange={(e) => setSignupData({ ...signupData, licenseNumber: e.target.value })}
        />
      </div>

      <div className={styles.formGroup}>
        <label>소속 병원명 *</label>
        <input
          type="text"
          placeholder="예: 펫프렌즈 동물병원"
          value={signupData.hospital || ''}
          onChange={(e) => setSignupData({ ...signupData, hospital: e.target.value })}
        />
      </div>

      <div className={styles.formGroup}>
        <label>병원 주소 *</label>
        <input
          type="text"
          placeholder="예: 서울 서초구 방배로 101"
          value={signupData.vetHospitalAddress || ''}
          onChange={(e) => setSignupData({ ...signupData, vetHospitalAddress: e.target.value })}
        />
      </div>

      <div className={styles.formGroup}>
        <label>웹사이트 주소 (선택)</label>
        <input
          type="text"
          placeholder="예: https://clinicpet.com"
          value={signupData.website || ''}
          onChange={(e) => setSignupData({ ...signupData, website: e.target.value })}
        />
      </div>

      <div className={styles.formGroup}>
        <label>수의사 면허증 첨부 *</label>
        <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileUpload} />
        {signupData.vetFileOriginalFilename && (
          <div className={styles.statusMessage}>✅ 파일 선택됨: {signupData.vetFileOriginalFilename}</div>
        )}
      </div>

      <p className={styles.notice}>
        🔒 수의사 면허증 첨부는 필수이며, 관리자 승인 후 전문가 기능을 사용할 수 있습니다.
      </p>
    </div>
  );
};

// 보호소 폼
const ShelterForm = ({ signupData, setSignupData }) => {
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/shelter/upload-temp', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { originalFilename, renameFilename } = res.data;

      setSignupData((prev) => ({
        ...prev,
        shelterProfileFile: file,
        shelterFileOriginalFilename: originalFilename,
        shelterFileRenameFilename: renameFilename,
      }));
    } catch (err) {
      alert('파일 업로드 실패');
    }
  };

  return (
    <div className={styles.additionalBox}>
      <h3>보호소 운영자 추가 정보</h3>

      <div className={styles.formGroup}>
        <label>보호소명 *</label>
        <input
          type="text"
          placeholder="예: 사랑의 보호소"
          value={signupData.shelterName || ''}
          onChange={(e) => setSignupData({ ...signupData, shelterName: e.target.value })}
        />
      </div>

      <div className={styles.formGroup}>
        <label>보호소 연락처 *</label>
        <input
          type="text"
          placeholder="예: 02-123-4567"
          value={signupData.shelterPhone || ''}
          onChange={(e) => setSignupData({ ...signupData, shelterPhone: e.target.value })}
        />
      </div>

      <div className={styles.formGroup}>
        <label>보호소 이메일 *</label>
        <input
          type="text"
          placeholder="예: info@shelter.com"
          value={signupData.shelterEmail || ''}
          onChange={(e) => setSignupData({ ...signupData, shelterEmail: e.target.value })}
        />
      </div>

      <div className={styles.formGroup}>
        <label>보호소 주소 *</label>
        <input
          type="text"
          placeholder="예: 서울 마포구 상암로 123"
          value={signupData.shelterAddress || ''}
          onChange={(e) => setSignupData({ ...signupData, shelterAddress: e.target.value })}
        />
      </div>

      <div className={styles.formGroup}>
        <label>웹사이트 주소 (선택)</label>
        <input
          type="text"
          placeholder="예: https://shelter.or.kr"
          value={signupData.website || ''}
          onChange={(e) => setSignupData({ ...signupData, website: e.target.value })}
        />
      </div>

      <div className={styles.formGroup}>
        <label>수용 가능 동물 수 (선택)</label>
        <input
          type="number"
          placeholder="예: 30"
          value={signupData.capacity || ''}
          onChange={(e) => setSignupData({ ...signupData, capacity: e.target.value })}
        />
      </div>

      <div className={styles.formGroup}>
        <label>운영 시간 *</label>
        <input
          type="text"
          placeholder="예: 오전 10시 ~ 오후 6시"
          value={signupData.operatingHours || ''}
          onChange={(e) => setSignupData({ ...signupData, operatingHours: e.target.value })}
        />
      </div>

      <div className={styles.formGroup}>
        <label>인증 서류 첨부 *</label>
        <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileUpload} />
        {signupData.shelterFileOriginalFilename && (
          <div className={styles.statusMessage}>✅ 파일 선택됨: {signupData.shelterFileOriginalFilename}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label>파일 설명 *</label>
        <input
          type="text"
          placeholder="예: 운영 위탁 계약서, 수용 보험증 등"
          value={signupData.authFileDescription || ''}
          onChange={(e) => setSignupData({ ...signupData, authFileDescription: e.target.value })}
        />
      </div>

      <p className={styles.notice}>🔒 첨부한 인증 파일은 관리자 검토 후 승인되며, 보호소 운영 기능이 활성화됩니다.</p>
    </div>
  );
};
