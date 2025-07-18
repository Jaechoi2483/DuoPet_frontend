import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PetList.module.css';

const PetList = () => {
  const navigate = useNavigate();
  
  // 임시 반려동물 데이터 (실제로는 API에서 가져와야 함)
  const [pets, setPets] = useState([
    {
      id: 1,
      name: '코코',
      species: '강아지',
      breed: '말티즈',
      gender: '암컷',
      age: 3,
      weight: 4.5,
      image: null,
      neutered: true
    },
    {
      id: 2,
      name: '초코',
      species: '고양이',
      breed: '러시안블루',
      gender: '수컷',
      age: 2,
      weight: 5.2,
      image: null,
      neutered: false
    }
  ]);

  const handleAddPet = () => {
    navigate('/mypage/pet/register');
  };

  const handlePetClick = (petId) => {
    navigate(`/mypage/pet/${petId}`);
  };

  const handleEditPet = (e, petId) => {
    e.stopPropagation();
    navigate(`/mypage/pet/${petId}/edit`);
  };

  const handleDeletePet = (e, petId) => {
    e.stopPropagation();
    if (window.confirm('정말로 이 반려동물 정보를 삭제하시겠습니까?')) {
      // 실제로는 API 호출
      setPets(pets.filter(pet => pet.id !== petId));
    }
  };

  return (
    <div className={styles.petListContainer}>
      <div className={styles.listHeader}>
        <h2 className={styles.sectionTitle}>내 반려동물</h2>
        <button className={styles.addButton} onClick={handleAddPet}>
          + 반려동물 추가
        </button>
      </div>

      {pets.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>등록된 반려동물이 없습니다.</p>
          <button className={styles.emptyAddButton} onClick={handleAddPet}>
            첫 반려동물 등록하기
          </button>
        </div>
      ) : (
        <div className={styles.petGrid}>
          {pets.map(pet => (
            <div 
              key={pet.id} 
              className={styles.petCard}
              onClick={() => handlePetClick(pet.id)}
            >
              <div className={styles.petImageWrapper}>
                {pet.image ? (
                  <img src={pet.image} alt={pet.name} className={styles.petImage} />
                ) : (
                  <div className={styles.defaultPetImage}>
                    {pet.species === '강아지' ? '🐕' : '🐈'}
                  </div>
                )}
              </div>
              
              <div className={styles.petInfo}>
                <h3 className={styles.petName}>{pet.name}</h3>
                <p className={styles.petDetails}>
                  {pet.breed} • {pet.gender} • {pet.age}살
                </p>
                <p className={styles.petWeight}>몸무게: {pet.weight}kg</p>
                {pet.neutered && (
                  <span className={styles.neuteredBadge}>중성화 완료</span>
                )}
              </div>

              <div className={styles.petActions}>
                <button 
                  className={styles.editButton}
                  onClick={(e) => handleEditPet(e, pet.id)}
                >
                  수정
                </button>
                <button 
                  className={styles.deleteButton}
                  onClick={(e) => handleDeletePet(e, pet.id)}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PetList;