import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../../AuthProvider';
import { getPetList, getPetImageUrl, deletePet } from '../../../../api/petApi';
import styles from './PetList.module.css';

const PetList = () => {
  const navigate = useNavigate();
  const { userNo, isAuthLoading } = useContext(AuthContext);
  
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('PetList - userNo:', userNo, 'isAuthLoading:', isAuthLoading);
    if (!isAuthLoading && userNo) {
      fetchPets();
    } else if (!isAuthLoading && !userNo) {
      setLoading(false);
      setError('사용자 정보를 찾을 수 없습니다.');
    }
  }, [userNo, isAuthLoading]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPetList(userNo);
      
      // 데이터 구조 변환
      const transformedPets = data.map(pet => ({
        id: pet.petId,
        name: pet.petName,
        species: pet.animalType,
        breed: pet.breed,
        gender: pet.gender === 'M' ? '수컷' : '암컷',
        age: pet.age,
        weight: pet.weight,
        image: pet.renameFilename ? getPetImageUrl(pet.renameFilename) : null,
        neutered: pet.neutered === 'Y'
      }));
      
      setPets(transformedPets);
    } catch (err) {
      console.error('Failed to fetch pets:', err);
      setError('반려동물 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleDeletePet = async (e, petId) => {
    e.stopPropagation();
    if (window.confirm('정말로 이 반려동물 정보를 삭제하시겠습니까?')) {
      try {
        await deletePet(petId);
        // 삭제 성공 후 목록 새로고침
        setPets(pets.filter(pet => pet.id !== petId));
        alert('반려동물 정보가 삭제되었습니다.');
      } catch (error) {
        console.error('반려동물 삭제 실패:', error);
        alert('반려동물 정보 삭제에 실패했습니다.');
      }
    }
  };

  if (isAuthLoading || loading) {
    return (
      <div className={styles.petListContainer}>
        <div className={styles.loadingState}>
          <p>반려동물 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.petListContainer}>
        <div className={styles.errorState}>
          <p>{error}</p>
          <button onClick={fetchPets} className={styles.retryButton}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

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