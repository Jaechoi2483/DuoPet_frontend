// src/pages/info/FindHospitalPage.js
import React, { useState, useEffect } from 'react';
import styles from './FindHospitalPage.module.css';
import MapContainer from '../../components/map/MapContainer';

const FindHospitalPage = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [filterService, setFilterService] = useState('all');

  // 샘플 병원 데이터 (DuoPetDesign에서 가져옴)
  const sampleHospitals = [
    {
      id: '1',
      name: '듀오펫 동물병원',
      address: '서울시 서초구 반포대로 789',
      phone: '02-1111-2222',
      position: { lat: 37.5048, lng: 127.0048 },
      rating: 4.8,
      reviewCount: 156,
      openHours: '09:00 - 19:00',
      services: ['진료', '수술', '건강검진', '예방접종'],
      specialization: '소동물 내과',
      isEmergency: true
    },
    {
      id: '2',
      name: '서울대학교 수의과대학 부속동물병원',
      address: '서울시 관악구 관악로 1',
      phone: '02-880-1234',
      position: { lat: 37.4601, lng: 126.9519 },
      rating: 4.9,
      reviewCount: 342,
      openHours: '09:00 - 18:00',
      services: ['진료', '수술', '건강검진', '특수진료'],
      specialization: '종합진료',
      isEmergency: true
    },
    {
      id: '3',
      name: '강남펫클리닉',
      address: '서울시 강남구 테헤란로 215',
      phone: '02-3456-7890',
      position: { lat: 37.5173, lng: 127.0473 },
      rating: 4.6,
      reviewCount: 89,
      openHours: '10:00 - 20:00',
      services: ['진료', '미용', '호텔'],
      specialization: '피부과',
      isEmergency: false
    },
    {
      id: '4',
      name: '24시간 응급동물병원',
      address: '서울시 마포구 월드컵로 240',
      phone: '02-2468-1357',
      position: { lat: 37.5565, lng: 126.9364 },
      rating: 4.4,
      reviewCount: 278,
      openHours: '24시간',
      services: ['응급진료', '수술', '입원'],
      specialization: '응급의학',
      isEmergency: true
    }
  ];

  // 사용자 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('위치 정보를 가져올 수 없습니다:', error);
        }
      );
    }
  }, []);

  // 거리 계산 함수
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // 필터링된 병원 목록
  const filteredHospitals = sampleHospitals
    .filter(hospital => 
      filterService === 'all' || 
      (filterService === 'emergency' && hospital.isEmergency) ||
      hospital.services.includes(filterService)
    )
    .filter(hospital => 
      hospital.name.toLowerCase().includes(searchLocation.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchLocation.toLowerCase()) ||
      hospital.specialization.toLowerCase().includes(searchLocation.toLowerCase())
    )
    .map(hospital => ({
      ...hospital,
      distance: userLocation ? 
        calculateDistance(userLocation.lat, userLocation.lng, hospital.position.lat, hospital.position.lng) : 
        undefined
    }))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));

  // 별점 렌더링
  const renderStars = (rating) => {
    return (
      <div className={styles.starRating}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${styles.star} ${
              star <= rating ? styles.starFilled : styles.starEmpty
            }`}
          >
            ★
          </span>
        ))}
        <span className={styles.ratingText}>
          {rating.toFixed(1)} ({sampleHospitals.length > 0 ? '리뷰' : '리뷰 없음'})
        </span>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>동물병원 찾기</h1>
        <p className={styles.subtitle}>가까운 동물병원을 찾아 반려동물의 건강을 지켜주세요</p>
      </div>

      {/* 검색 및 필터 */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="병원명, 지역, 진료과목으로 검색..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterButton} ${filterService === 'all' ? styles.active : ''}`}
            onClick={() => setFilterService('all')}
          >
            전체
          </button>
          <button
            className={`${styles.filterButton} ${filterService === 'emergency' ? styles.active : ''}`}
            onClick={() => setFilterService('emergency')}
          >
            응급진료
          </button>
          <button
            className={`${styles.filterButton} ${filterService === '진료' ? styles.active : ''}`}
            onClick={() => setFilterService('진료')}
          >
            일반진료
          </button>
          <button
            className={`${styles.filterButton} ${filterService === '수술' ? styles.active : ''}`}
            onClick={() => setFilterService('수술')}
          >
            수술
          </button>
        </div>
      </div>

      <div className={styles.contentContainer}>
        {/* 지도 영역 */}
        <div className={styles.mapArea}>
          <div className={styles.mapHeader}>
            <h3>📍 병원 위치</h3>
          </div>
          <MapContainer 
            hospitals={filteredHospitals}
            selectedHospital={selectedHospital}
            onHospitalSelect={setSelectedHospital}
            userLocation={userLocation}
          />
        </div>

        {/* 병원 목록 */}
        <div className={styles.listArea}>
          <div className={styles.hospitalList}>
            {filteredHospitals.map((hospital) => (
              <div 
                key={hospital.id}
                className={`${styles.hospitalCard} ${
                  selectedHospital === hospital.id ? styles.selected : ''
                }`}
                onClick={() => setSelectedHospital(hospital.id)}
              >
                <div className={styles.hospitalHeader}>
                  <div className={styles.hospitalName}>
                    <h3>{hospital.name}</h3>
                    {hospital.isEmergency && (
                      <span className={styles.emergencyBadge}>응급</span>
                    )}
                  </div>
                  <div className={styles.hospitalMeta}>
                    <span className={styles.specialization}>
                      {hospital.specialization}
                    </span>
                    {hospital.distance && (
                      <span className={styles.distance}>
                        {hospital.distance.toFixed(1)}km
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.hospitalInfo}>
                  <p className={styles.address}>📍 {hospital.address}</p>
                  <div className={styles.rating}>
                    {renderStars(hospital.rating)}
                  </div>
                  <p className={styles.phone}>📞 {hospital.phone}</p>
                  <p className={styles.hours}>🕐 {hospital.openHours}</p>
                  
                  <div className={styles.services}>
                    <span>진료과목: </span>
                    {hospital.services.map((service, index) => (
                      <span key={index} className={styles.serviceTag}>
                        {service}
                      </span>
                    ))}
                  </div>

                  <div className={styles.hospitalActions}>
                    <button className={styles.detailButton}>상세보기</button>
                    <button className={styles.reserveButton}>예약하기</button>
                  </div>
                </div>
              </div>
            ))}

            {filteredHospitals.length === 0 && (
              <div className={styles.noResults}>
                <div className={styles.noResultsIcon}>🩺</div>
                <h3>검색 결과가 없습니다</h3>
                <p>다른 검색어로 다시 시도해보세요</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindHospitalPage;
