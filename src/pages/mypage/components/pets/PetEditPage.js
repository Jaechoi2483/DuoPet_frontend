import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../../../AuthProvider';
import styles from './PetEditPage.module.css';

const PetEditPage = () => {
  const navigate = useNavigate();
  const { petId } = useParams();
  const { userid } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    gender: '',
    age: '',
    weight: '',
    neutered: '',
    description: ''
  });

  const [petImage, setPetImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    // 실제로는 petId를 사용하여 API에서 데이터 가져오기
    // 임시 데이터 설정
    setFormData({
      name: '코코',
      species: '강아지',
      breed: '말티즈',
      gender: '암컷',
      age: '3',
      weight: '4.5',
      neutered: 'Y',
      description: '매우 활발하고 사람을 좋아합니다. 산책을 좋아하며 다른 강아지들과도 잘 어울립니다.'
    });
  }, [petId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPetImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 필수 입력값 검증
    const { name, species, gender, neutered } = formData;
    if (!name || !species || !gender || !neutered) {
      alert('이름, 종류, 성별, 중성화 여부는 필수 입력 항목입니다.');
      return;
    }

    // 실제로는 API 호출
    console.log('반려동물 수정 데이터:', formData);
    console.log('이미지:', petImage);
    
    alert('반려동물 정보가 수정되었습니다.');
    navigate(`/mypage/pet/${petId}`);
  };

  const handleCancel = () => {
    navigate(`/mypage/pet/${petId}`);
  };

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.editContainer}>
          <h1 className={styles.pageTitle}>반려동물 정보 수정</h1>
          
          <form className={styles.editForm} onSubmit={handleSubmit}>
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>기본 정보</h2>
              
              <div className={styles.imageUploadSection}>
                <div className={styles.imageWrapper}>
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="반려동물" 
                      className={styles.petImage}
                    />
                  ) : (
                    <div className={styles.defaultImage}>
                      {formData.species === '강아지' ? '🐕' : '🐈'}
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="petImage"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className={styles.fileInput}
                />
                <label htmlFor="petImage" className={styles.uploadButton}>
                  사진 변경
                </label>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>
                    이름 <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="반려동물 이름"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="species" className={styles.label}>
                    종류 <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="species"
                    name="species"
                    value={formData.species}
                    onChange={handleInputChange}
                    className={styles.select}
                    required
                  >
                    <option value="">선택하세요</option>
                    <option value="강아지">강아지</option>
                    <option value="고양이">고양이</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="breed" className={styles.label}>품종</label>
                  <input
                    type="text"
                    id="breed"
                    name="breed"
                    value={formData.breed}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="예: 말티즈, 러시안블루"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="gender" className={styles.label}>
                    성별 <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={styles.select}
                    required
                  >
                    <option value="">선택하세요</option>
                    <option value="수컷">수컷</option>
                    <option value="암컷">암컷</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="age" className={styles.label}>나이</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="나이 (년)"
                    min="0"
                    max="30"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="weight" className={styles.label}>몸무게</label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="몸무게 (kg)"
                    step="0.1"
                    min="0"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="neutered" className={styles.label}>
                    중성화 여부 <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="neutered"
                    name="neutered"
                    value={formData.neutered}
                    onChange={handleInputChange}
                    className={styles.select}
                    required
                  >
                    <option value="">선택하세요</option>
                    <option value="Y">예</option>
                    <option value="N">아니오</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>추가 정보</h2>
              
              <div className={styles.formGroup}>
                <label htmlFor="description" className={styles.label}>
                  특이사항
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  rows="4"
                  placeholder="반려동물의 성격, 습관, 건강 상태 등을 입력해주세요"
                />
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={handleCancel}
              >
                취소
              </button>
              <button 
                type="submit" 
                className={styles.submitButton}
              >
                수정하기
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default PetEditPage;