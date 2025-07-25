import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BookmarkedAdoptions.module.css';

const BookmarkedAdoptions = () => {
  const navigate = useNavigate();
  const [bookmarkedAnimals, setBookmarkedAnimals] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // all, available, adopted

  // 임시 데이터 (실제로는 API에서 가져와야 함)
  useEffect(() => {
    const mockAnimals = [
      {
        id: 1,
        name: '뽀삐',
        species: '강아지',
        breed: '믹스견',
        age: '2년',
        gender: '수컷',
        weight: '8kg',
        status: 'available',
        shelterName: '행복한 동물보호소',
        shelterLocation: '경기도 성남시',
        personality: '활발하고 사람을 좋아함',
        image: null,
        bookmarkedAt: '2024-06-18'
      },
      {
        id: 2,
        name: '나비',
        species: '고양이',
        breed: '코리안숏헤어',
        age: '1년',
        gender: '암컷',
        weight: '3.5kg',
        status: 'available',
        shelterName: '사랑 동물보호센터',
        shelterLocation: '서울시 송파구',
        personality: '조용하고 온순함',
        image: null,
        bookmarkedAt: '2024-06-16'
      },
      {
        id: 3,
        name: '초코',
        species: '강아지',
        breed: '푸들',
        age: '3년',
        gender: '수컷',
        weight: '5kg',
        status: 'adopted',
        shelterName: '희망 동물보호소',
        shelterLocation: '인천시 남동구',
        personality: '똑똑하고 애교가 많음',
        image: null,
        bookmarkedAt: '2024-06-10',
        adoptedDate: '2024-06-12'
      }
    ];
    
    setBookmarkedAnimals(mockAnimals);
  }, []);

  const handleAnimalClick = (animal) => {
    navigate(`/adoption/detail/${animal.id}`);
  };

  const handleRemoveBookmark = (e, animalId) => {
    e.stopPropagation();
    if (window.confirm('북마크를 취소하시겠습니까?')) {
      // 실제로는 API 호출
      setBookmarkedAnimals(bookmarkedAnimals.filter(animal => animal.id !== animalId));
    }
  };

  const filteredAnimals = filterStatus === 'all' 
    ? bookmarkedAnimals 
    : bookmarkedAnimals.filter(animal => 
        filterStatus === 'available' ? animal.status === 'available' : animal.status === 'adopted'
      );

  const getStatusLabel = (status) => {
    return status === 'available' ? '입양가능' : '입양완료';
  };

  const getStatusClass = (status) => {
    return status === 'available' ? styles.statusAvailable : styles.statusAdopted;
  };

  return (
    <div className={styles.bookmarkedAdoptionsContainer}>
      <div className={styles.filterSection}>
        <button
          className={`${styles.filterButton} ${filterStatus === 'all' ? styles.active : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          전체
        </button>
        <button
          className={`${styles.filterButton} ${filterStatus === 'available' ? styles.active : ''}`}
          onClick={() => setFilterStatus('available')}
        >
          입양가능
        </button>
        <button
          className={`${styles.filterButton} ${filterStatus === 'adopted' ? styles.active : ''}`}
          onClick={() => setFilterStatus('adopted')}
        >
          입양완료
        </button>
      </div>

      {filteredAnimals.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🐾</span>
          <p className={styles.emptyMessage}>
            {filterStatus === 'all' 
              ? '북마크한 입양동물이 없습니다.' 
              : `${getStatusLabel(filterStatus)} 동물이 없습니다.`}
          </p>
          <p className={styles.emptySubMessage}>입양을 기다리는 동물들을 만나보세요!</p>
        </div>
      ) : (
        <div className={styles.animalGrid}>
          {filteredAnimals.map(animal => (
            <div 
              key={animal.id} 
              className={styles.animalCard}
              onClick={() => handleAnimalClick(animal)}
            >
              <div className={styles.imageWrapper}>
                {animal.image ? (
                  <img 
                    src={animal.image} 
                    alt={animal.name} 
                    className={styles.animalImage}
                  />
                ) : (
                  <div className={styles.defaultImage}>
                    {animal.species === '강아지' ? '🐕' : '🐈'}
                  </div>
                )}
                <button
                  className={styles.bookmarkButton}
                  onClick={(e) => handleRemoveBookmark(e, animal.id)}
                >
                  🔖
                </button>
              </div>

              <div className={styles.animalInfo}>
                <div className={styles.animalHeader}>
                  <h3 className={styles.animalName}>{animal.name}</h3>
                  <span className={`${styles.status} ${getStatusClass(animal.status)}`}>
                    {getStatusLabel(animal.status)}
                  </span>
                </div>

                <div className={styles.animalDetails}>
                  <p className={styles.basicInfo}>
                    {animal.breed} • {animal.gender} • {animal.age}
                  </p>
                  <p className={styles.weight}>체중: {animal.weight}</p>
                  <p className={styles.personality}>{animal.personality}</p>
                </div>

                <div className={styles.shelterInfo}>
                  <span className={styles.shelterName}>{animal.shelterName}</span>
                  <span className={styles.shelterLocation}>{animal.shelterLocation}</span>
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.bookmarkDate}>
                    북마크: {animal.bookmarkedAt}
                  </span>
                  {animal.status === 'adopted' && animal.adoptedDate && (
                    <span className={styles.adoptedDate}>
                      입양일: {animal.adoptedDate}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarkedAdoptions;