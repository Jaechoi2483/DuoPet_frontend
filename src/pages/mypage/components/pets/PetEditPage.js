import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../../../AuthProvider';
import { getPetDetail, getPetImageUrl, updatePet } from '../../../../api/petApi';
import styles from './PetEditPage.module.css';

const PetEditPage = () => {
  const navigate = useNavigate();
  const { petId } = useParams();
  const { userNo } = useContext(AuthContext);
  
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPetDetail(petId);
        
        // 백엔드 데이터를 폼 데이터 형식으로 변환
        const transformedData = {
          name: data.petName || '',
          species: data.animalType || '',
          breed: data.breed || '',
          gender: data.gender === 'M' ? '수컷' : data.gender === 'F' ? '암컷' : '',
          age: data.age ? data.age.toString() : '',
          weight: data.weight ? data.weight.toString() : '',
          neutered: data.neutered || '',
          description: '' // 백엔드에 설명 필드가 없음
        };
        
        setFormData(transformedData);
        setOriginalData(data);
        
        // 이미지 미리보기 설정
        if (data.renameFilename) {
          setImagePreview(getPetImageUrl(data.renameFilename));
        }
      } catch (err) {
        console.error('Failed to fetch pet data:', err);
        setError('반려동물 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    if (petId) {
      fetchPetData();
    }
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

    try {
      // 백엔드 형식으로 데이터 변환
      const petData = {
        userId: userNo,
        petName: formData.name,
        animalType: formData.species,
        breed: formData.breed,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender === '수컷' ? 'M' : 'F',
        neutered: formData.neutered,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        file: petImage
      };
      
      await updatePet(petId, petData);
      alert('반려동물 정보가 수정되었습니다.');
      navigate(`/mypage/pet/${petId}`);
    } catch (error) {
      console.error('반려동물 수정 실패:', error);
      alert('반려동물 정보 수정에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    navigate(`/mypage/pet/${petId}`);
  };

  if (loading) {
    return (
      <div className={styles.contentWrapper}>
        <div className={styles.editContainer}>
          <div className={styles.loadingState}>
            <p>반려동물 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.contentWrapper}>
        <div className={styles.editContainer}>
          <div className={styles.errorState}>
            <p>{error}</p>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
              돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.editContainer}>
          <h1 className={styles.pageTitle}>반려동물 정보 수정</h1>
          
          <form className={styles.editForm} onSubmit={handleSubmit}>
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>기본 정보</h2>
              
              <div className={styles.imageUploadSection}>
                <div className={styles.imageWrapper}>
                  {imagePreview || originalData?.renameFilename ? (
                    <img 
                      src={imagePreview || getPetImageUrl(originalData.renameFilename)} 
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