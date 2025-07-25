import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BookmarkedPlaces.module.css';

const BookmarkedPlaces = () => {
  const navigate = useNavigate();
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState([]);
  const [filterType, setFilterType] = useState('all'); // all, hospital, shelter

  // 임시 데이터 (실제로는 API에서 가져와야 함)
  useEffect(() => {
    const mockPlaces = [
      {
        id: 1,
        type: 'hospital',
        name: '24시 종합동물병원',
        address: '서울시 강남구 테헤란로 123',
        phone: '02-1234-5678',
        rating: 4.5,
        reviewCount: 128,
        services: ['24시 응급진료', '중성화수술', '예방접종'],
        bookmarkedAt: '2024-06-15'
      },
      {
        id: 2,
        type: 'shelter',
        name: '행복한 동물보호소',
        address: '경기도 성남시 분당구 판교로 456',
        phone: '031-9876-5432',
        rating: 4.8,
        reviewCount: 45,
        services: ['입양상담', '임시보호', '봉사활동'],
        bookmarkedAt: '2024-06-10'
      },
      {
        id: 3,
        type: 'hospital',
        name: '사랑 동물병원',
        address: '서울시 송파구 올림픽로 789',
        phone: '02-3456-7890',
        rating: 4.2,
        reviewCount: 89,
        services: ['일반진료', '치과진료', '피부과진료'],
        bookmarkedAt: '2024-06-08'
      }
    ];
    
    setBookmarkedPlaces(mockPlaces);
  }, []);

  const handlePlaceClick = (place) => {
    if (place.type === 'hospital') {
      navigate(`/info/hospital/${place.id}`);
    } else if (place.type === 'shelter') {
      navigate(`/info/shelter/${place.id}`);
    }
  };

  const handleRemoveBookmark = (e, placeId) => {
    e.stopPropagation();
    if (window.confirm('북마크를 취소하시겠습니까?')) {
      // 실제로는 API 호출
      setBookmarkedPlaces(bookmarkedPlaces.filter(place => place.id !== placeId));
    }
  };

  const filteredPlaces = filterType === 'all' 
    ? bookmarkedPlaces 
    : bookmarkedPlaces.filter(place => place.type === filterType);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('✨');
    }
    
    return stars.join('');
  };

  return (
    <div className={styles.bookmarkedPlacesContainer}>
      <div className={styles.filterSection}>
        <button
          className={`${styles.filterButton} ${filterType === 'all' ? styles.active : ''}`}
          onClick={() => setFilterType('all')}
        >
          전체
        </button>
        <button
          className={`${styles.filterButton} ${filterType === 'hospital' ? styles.active : ''}`}
          onClick={() => setFilterType('hospital')}
        >
          동물병원
        </button>
        <button
          className={`${styles.filterButton} ${filterType === 'shelter' ? styles.active : ''}`}
          onClick={() => setFilterType('shelter')}
        >
          보호소
        </button>
      </div>

      {filteredPlaces.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🏥</span>
          <p className={styles.emptyMessage}>
            {filterType === 'all' 
              ? '북마크한 장소가 없습니다.' 
              : `북마크한 ${filterType === 'hospital' ? '동물병원이' : '보호소가'} 없습니다.`}
          </p>
          <p className={styles.emptySubMessage}>지도에서 관심있는 장소를 북마크해보세요!</p>
        </div>
      ) : (
        <div className={styles.placeList}>
          {filteredPlaces.map(place => (
            <div 
              key={place.id} 
              className={styles.placeCard}
              onClick={() => handlePlaceClick(place)}
            >
              <div className={styles.placeHeader}>
                <div className={styles.placeTypeIcon}>
                  {place.type === 'hospital' ? '🏥' : '🏠'}
                </div>
                <div className={styles.placeInfo}>
                  <h3 className={styles.placeName}>{place.name}</h3>
                  <p className={styles.placeAddress}>{place.address}</p>
                  <p className={styles.placePhone}>📞 {place.phone}</p>
                </div>
                <button
                  className={styles.bookmarkButton}
                  onClick={(e) => handleRemoveBookmark(e, place.id)}
                >
                  🔖
                </button>
              </div>

              <div className={styles.placeDetails}>
                <div className={styles.placeRating}>
                  <span className={styles.stars}>{renderStars(place.rating)}</span>
                  <span className={styles.ratingText}>
                    {place.rating} ({place.reviewCount}개 리뷰)
                  </span>
                </div>
                
                <div className={styles.placeServices}>
                  {place.services.map((service, index) => (
                    <span key={index} className={styles.serviceTag}>
                      {service}
                    </span>
                  ))}
                </div>
                
                <div className={styles.bookmarkDate}>
                  북마크: {place.bookmarkedAt}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarkedPlaces;