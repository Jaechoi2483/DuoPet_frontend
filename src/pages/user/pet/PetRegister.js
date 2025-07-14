// src/pages/user/pet/PetRegister.js

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../signup/SignupStep1.module.css';
import axios from 'axios';

const PetRegister = () => {
  const navigate = useNavigate();
  const [petList, setPetList] = useState([]);
  const [pet, setPet] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    gender: '',
    neutered: '',
    weight: '',
    photo: null,
    originalFilename: '',
  });

  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPet({ ...pet, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPet({
      ...pet,
      photo: file,
      originalFilename: file ? file.name : '',
    });
  };

  const handleAddPet = () => {
    const { name, species, gender, neutered } = pet;
    if (!name || !species || !gender || !neutered) {
      alert('이름, 종류, 성별, 중성화 여부는 필수 입력입니다.');
      return;
    }

    const copiedPet = {
      ...pet,
      photo: pet.photo,
    };

    setPetList([...petList, copiedPet]);
    setPet({
      name: '',
      species: '',
      breed: '',
      age: '',
      gender: '',
      neutered: '',
      weight: '',
      photo: null,
      originalFilename: '',
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (index) => {
    const newList = petList.filter((_, i) => i !== index);
    setPetList(newList);
  };

  const handleSubmit = async () => {
    if (petList.length === 0) {
      alert('한 마리 이상 등록해주세요.');
      return;
    }

    const rawUserId = localStorage.getItem('userId');
    const userId = rawUserId ? parseInt(rawUserId, 10) : null;

    if (!userId) {
      alert('유저 정보가 없습니다. 로그인 후 다시 시도해주세요.');
      navigate('/login');
      return;
    }

    try {
      // handleSubmit 함수 내부
      for (const p of petList) {
        const formData = new FormData();
        const petData = {
          userId: userId,
          petName: p.name,
          animalType: p.species,
          breed: p.breed,
          age: p.age,
          gender: p.gender,
          neutered: p.neutered,
          weight: p.weight,
        };

        const jsonBlob = new Blob([JSON.stringify(petData)], {
          type: 'application/json',
        });
        formData.append('data', jsonBlob);

        // 수정: 파일이 있을 때만 append
        if (p.photo) {
          formData.append('file', p.photo);
        }

        await axios.post('/pet/register', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      alert('반려동물 등록이 완료되었습니다.');
      localStorage.removeItem('userId');
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>반려동물 등록</h2>

      <div className={styles.formGroup}>
        <label>이름 *</label>
        <input name="name" value={pet.name} onChange={handleChange} />
      </div>

      <div className={styles.formGroup}>
        <label>종 *</label>
        <select name="species" value={pet.species} onChange={handleChange}>
          <option value="">선택</option>
          <option value="강아지">강아지</option>
          <option value="고양이">고양이</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>품종</label>
        <input name="breed" value={pet.breed} onChange={handleChange} />
      </div>

      <div className={styles.formGroup}>
        <label>나이(년)</label>
        <input name="age" type="number" value={pet.age} onChange={handleChange} />
      </div>

      <div className={styles.formGroup}>
        <label>성별 *</label>
        <select name="gender" value={pet.gender} onChange={handleChange}>
          <option value="">선택</option>
          <option value="M">♂ 수컷</option>
          <option value="F">♀ 암컷</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>중성화 여부 *</label>
        <select name="neutered" value={pet.neutered} onChange={handleChange}>
          <option value="">선택</option>
          <option value="Y">예</option>
          <option value="N">아니오</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>체중(kg)</label>
        <input name="weight" type="number" step="0.1" value={pet.weight} onChange={handleChange} />
      </div>

      <div className={styles.formGroup}>
        <label>프로필 사진</label>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} key={pet.photo ? pet.photo.name : 'file'} />
        {pet.originalFilename && <p>선택된 파일: {pet.originalFilename}</p>}
      </div>

      <button className={styles.nextButton} onClick={handleAddPet}>
        입력사항 저장
      </button>

      {petList.length > 0 && (
        <div className={styles.petCardList}>
          {petList.map((p, idx) => {
            const getAnimalIcon = (type) => (type === '강아지' ? '🐶' : '🐱');
            return (
              <div className={styles.petCard} key={idx}>
                <button className={styles.removePetBtn} onClick={() => handleDelete(idx)}>
                  ×
                </button>
                <div style={{ flex: 1 }}>
                  <div>
                    {getAnimalIcon(p.species)} <strong>{p.name}</strong> (
                    <span className={p.gender === 'M' ? styles.genderIconMale : styles.genderIconFemale}>
                      {p.gender === 'M' ? '♂ 수컷' : '♀ 암컷'}
                    </span>
                    , 중성화: {p.neutered === 'Y' ? '예' : '아니오'})
                  </div>
                  <div>
                    종: {p.species}
                    {p.breed && ` | 품종: ${p.breed}`}
                  </div>
                  {p.age && <div>나이: {p.age}세</div>}
                  {p.weight && <div>체중: {p.weight}kg</div>}
                  {p.originalFilename && (
                    <div
                      style={{
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      첨부 이미지: {p.originalFilename}
                    </div>
                  )}
                </div>
                {p.photo && (
                  <div className={styles.petImagePreview}>
                    <img src={URL.createObjectURL(p.photo)} alt="미리보기" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.buttonGroup}>
        <button className={styles.prevButton} onClick={() => navigate('/signup/step5')}>
          이전 단계
        </button>
        <button className={styles.nextButton} onClick={handleSubmit}>
          전체 등록하기
        </button>
      </div>
    </div>
  );
};

export default PetRegister;
