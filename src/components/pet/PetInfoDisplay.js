// src/components/pet/PetInfoDisplay.js
import React, { useState, useEffect } from 'react';
import { getPetList, getPetImageUrl } from '../../api/petApi';
import styles from './PetInfoDisplay.module.css';

const PetInfoDisplay = ({ userId, onPetSelect }) => {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchPets();
    }
  }, [userId]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      console.log('Fetching pets for userId:', userId);
      const petData = await getPetList(userId);
      console.log('Fetched pet data:', petData);
      setPets(petData);
      
      // 첫 번째 반려동물을 기본 선택
      if (petData.length > 0) {
        setSelectedPet(petData[0]);
        onPetSelect && onPetSelect(petData[0]);
      }
    } catch (err) {
      setError('반려동물 정보를 불러오는데 실패했습니다.');
      console.error('Error fetching pets:', err);
      console.error('Error details:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handlePetSelect = (pet) => {
    setSelectedPet(pet);
    onPetSelect && onPetSelect(pet);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonAvatar}></div>
          <div className={styles.skeletonText}>
            <div className={styles.skeletonLine}></div>
            <div className={styles.skeletonLine}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>⚠️</span>
          {error}
        </div>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🐾</span>
          <p>등록된 반려동물이 없습니다.</p>
          <button className={styles.addButton}>반려동물 등록하기</button>
        </div>
      </div>
    );
  }

  // 반려동물이 1마리인 경우
  if (pets.length === 1) {
    const pet = pets[0];
    return (
      <div className={styles.container}>
        <div className={styles.singlePetCard}>
          <div className={styles.petImage}>
            {pet.imageUrl ? (
              <img 
                src={getPetImageUrl(pet.renameFilename)} 
                alt={pet.petName}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = pet.animalType === '강아지' 
                    ? '/images/default-dog.svg' 
                    : '/images/default-cat.svg';
                }}
              />
            ) : (
              <div className={styles.defaultAvatar}>
                {pet.animalType === '강아지' ? '🐕' : '🐱'}
              </div>
            )}
          </div>
          <div className={styles.petInfo}>
            <h3 className={styles.petName}>{pet.petName}</h3>
            <div className={styles.petDetails}>
              <span className={styles.petBreed}>{pet.breed || pet.animalType}</span>
              <span className={styles.separator}>·</span>
              <span>{pet.age}세</span>
              <span className={styles.separator}>·</span>
              <span>{pet.gender === 'M' ? '남아' : '여아'}</span>
              <span className={styles.separator}>·</span>
              <span>{pet.weight}kg</span>
            </div>
            <div className={styles.petMeta}>
              <span className={styles.neutered}>
                {pet.neutered === 'Y' ? '중성화 완료' : '중성화 미완료'}
              </span>
              <span className={styles.registrationDate}>
                등록일: {new Date(pet.registrationDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 반려동물이 2-4마리인 경우 (탭 형식)
  if (pets.length <= 4) {
    return (
      <div className={styles.container}>
        <div className={styles.tabContainer}>
          <div className={styles.tabList}>
            {pets.map((pet) => (
              <button
                key={pet.petId}
                className={`${styles.tabItem} ${
                  selectedPet?.petId === pet.petId ? styles.active : ''
                }`}
                onClick={() => handlePetSelect(pet)}
              >
                <div className={styles.tabAvatar}>
                  {pet.imageUrl ? (
                    <img 
                      src={getPetImageUrl(pet.renameFilename)} 
                      alt={pet.petName}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.innerHTML = pet.animalType === '강아지' ? '🐕' : '🐱';
                      }}
                    />
                  ) : (
                    pet.animalType === '강아지' ? '🐕' : '🐱'
                  )}
                </div>
                <span className={styles.tabName}>{pet.petName}</span>
              </button>
            ))}
          </div>
          
          {selectedPet && (
            <div className={styles.selectedPetInfo}>
              <div className={styles.selectedPetImage}>
                {selectedPet.imageUrl ? (
                  <img 
                    src={getPetImageUrl(selectedPet.renameFilename)} 
                    alt={selectedPet.petName}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = selectedPet.animalType === '강아지' 
                        ? '/images/default-dog.svg' 
                        : '/images/default-cat.svg';
                    }}
                  />
                ) : (
                  <div className={styles.defaultAvatar}>
                    {selectedPet.animalType === '강아지' ? '🐕' : '🐱'}
                  </div>
                )}
              </div>
              <div className={styles.selectedPetDetails}>
                <h3 className={styles.petName}>{selectedPet.petName}</h3>
                <p className={styles.petBreed}>{selectedPet.breed || selectedPet.animalType}</p>
                <div className={styles.petStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>나이</span>
                    <span className={styles.statValue}>{selectedPet.age}세</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>성별</span>
                    <span className={styles.statValue}>
                      {selectedPet.gender === 'M' ? '남아' : '여아'}
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>체중</span>
                    <span className={styles.statValue}>{selectedPet.weight}kg</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>중성화</span>
                    <span className={styles.statValue}>
                      {selectedPet.neutered === 'Y' ? '완료' : '미완료'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 반려동물이 5마리 이상인 경우 (드롭다운)
  return (
    <div className={styles.container}>
      <div className={styles.dropdownContainer}>
        <select 
          className={styles.petDropdown}
          value={selectedPet?.petId || ''}
          onChange={(e) => {
            const pet = pets.find(p => p.petId === parseInt(e.target.value));
            handlePetSelect(pet);
          }}
        >
          {pets.map((pet) => (
            <option key={pet.petId} value={pet.petId}>
              {pet.petName} ({pet.animalType} · {pet.age}세)
            </option>
          ))}
        </select>
        
        {selectedPet && (
          <div className={styles.dropdownPetInfo}>
            <div className={styles.petImage}>
              {selectedPet.imageUrl ? (
                <img 
                  src={getPetImageUrl(selectedPet.renameFilename)} 
                  alt={selectedPet.petName}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = selectedPet.animalType === '강아지' 
                      ? '/images/default-dog.png' 
                      : '/images/default-cat.png';
                  }}
                />
              ) : (
                <div className={styles.defaultAvatar}>
                  {selectedPet.animalType === '강아지' ? '🐕' : '🐱'}
                </div>
              )}
            </div>
            <div className={styles.petDetails}>
              <h3>{selectedPet.petName}</h3>
              <p>{selectedPet.breed || selectedPet.animalType}</p>
              <p>{selectedPet.age}세 · {selectedPet.gender === 'M' ? '남아' : '여아'} · {selectedPet.weight}kg</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetInfoDisplay;