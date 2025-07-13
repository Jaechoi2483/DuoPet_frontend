// src/pages/user/pet/PetRegister.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../signup/SignupStep1.module.css';
import axios from 'axios';

const PetRegister = () => {
  const navigate = useNavigate();

  const [petList, setPetList] = useState([]);
  const [pet, setPet] = useState({
    name: '',
    age: '',
    species: '',
    breed: '',
    gender: '',
    photo: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPet({ ...pet, [name]: value });
  };

  const handleFileChange = (e) => {
    setPet({ ...pet, photo: e.target.files[0] });
  };

  const handleAddPet = () => {
    if (!pet.name || !pet.age || !pet.species || !pet.gender) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    setPetList([...petList, pet]);
    setPet({ name: '', age: '', species: '', breed: '', gender: '', photo: null });
  };

  const handleSubmit = async () => {
    try {
      for (const p of petList) {
        const formData = new FormData();
        formData.append('name', p.name);
        formData.append('age', p.age);
        formData.append('species', p.species);
        formData.append('breed', p.breed);
        formData.append('gender', p.gender);
        if (p.photo) formData.append('photo', p.photo);

        await axios.post('/pet/register', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      alert('반려동물 등록이 완료되었습니다!');
      navigate('/user/mypage');
    } catch (err) {
      alert('등록 중 오류 발생');
      console.error(err);
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>🐶 반려동물 등록</h2>
      <p className={styles.subtitle}>등록할 반려동물의 정보를 입력하세요.</p>

      <div className={styles.formGroup}>
        <label>이름 *</label>
        <input type="text" name="name" value={pet.name} onChange={handleChange} placeholder="예: 초코" />
      </div>

      <div className={styles.formGroup}>
        <label>나이 *</label>
        <input type="number" name="age" value={pet.age} onChange={handleChange} placeholder="예: 3" />
      </div>

      <div className={styles.formGroup}>
        <label>종 *</label>
        <input
          type="text"
          name="species"
          value={pet.species}
          onChange={handleChange}
          placeholder="예: 강아지, 고양이"
        />
      </div>

      <div className={styles.formGroup}>
        <label>품종 (선택)</label>
        <input type="text" name="breed" value={pet.breed} onChange={handleChange} placeholder="예: 푸들, 샴" />
      </div>

      <div className={styles.formGroup}>
        <label>성별 *</label>
        <select name="gender" value={pet.gender} onChange={handleChange}>
          <option value="">선택</option>
          <option value="M">수컷</option>
          <option value="F">암컷</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>사진 첨부 (선택)</label>
        <input type="file" accept=".jpg,.jpeg,.png" onChange={handleFileChange} />
        {pet.photo && <p>✅ 선택된 파일: {pet.photo.name}</p>}
      </div>

      <div className={styles.buttonGroup}>
        <button
          className={styles.cancelButton}
          onClick={() => {
            alert('반려동물 등록을 건너뛰고 로그인 화면으로 이동합니다.');
            navigate('/login');
          }}
        >
          등록 건너뛰기
        </button>

        <button className={styles.nextButton} onClick={handleAddPet}>
          한 마리 더 추가
        </button>

        <button className={styles.prevButton} onClick={handleSubmit}>
          전체 등록 완료
        </button>
      </div>

      {petList.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h4>📝 등록 예정 목록</h4>
          <ul>
            {petList.map((p, idx) => (
              <li key={idx}>
                {p.name} ({p.species}, {p.age}세, {p.gender === 'M' ? '수컷' : '암컷'})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PetRegister;
