// src/pages/info/FindShelterPage.js
import React, { useState, useEffect } from 'react';
import styles from './FindShelterPage.module.css';
import MapContainer from '../../components/map/MapContainer';

const FindShelterPage = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [filterType, setFilterType] = useState('all');

  // 보호소 샘플 데이터 (DuoPetDesign 기반)
  const sampleShelters = [
    {
      id: '1',
      name: '서울시 동물보호센터',
      address: '서울시 중랑구 망우로 298',
      phone: '02-2049-4141',
      position: { lat: 37.6004, lng: 127.0735 },
      city: '서울',
      region: '중랑구',
      type: 'public',
      rating: 4.5,
      currentAnimals: 45,
      capacity: 80,
      operatingHours: '09:00 - 18:00',
      facilities: ['입양상담실', '치료실', '격리실', '운동장'],
      adoptionProcess: ['상담', '견학', '신청서 작성', '심사', '입양'],
      specialNeeds: ['중성화 수술', '예방접종', '건강검진'],
      description: '서울시에서 운영하는 공공 동물보호센터로 안전하고 체계적인 입양 서비스를 제공합니다.'
    },
    {
      id: '2',
      name: '사랑의 동물보호소',
      address: '경기도 고양시 일산동구 장항동 892',
      phone: '031-977-2400',
      position: { lat: 37.6570, lng: 126.7706 },
      city: '고양시',
      region: '일산동구',
      type: 'private',
      rating: 4.8,
      currentAnimals: 28,
      capacity: 50,
      operatingHours: '10:00 - 17:00',
      facilities: ['입양상담실', '놀이방', '훈련장', '의료실'],
      adoptionProcess: ['전화상담', '방문예약', '동물 만나기', '입양 결정'],
      specialNeeds: ['행동교정', '사회화 훈련', '건강관리'],
      description: '개인이 운영하는 민간 보호소로 따뜻한 사랑으로 동물들을 돌보고 있습니다.'
    },
    {
      id: '3',
      name: '경기도 동물보호센터',
      address: '경기도 성남시 수정구 복정동 649-2',
      phone: '031-8016-8580',
      position: { lat: 37.4435, lng: 127.1277 },
      city: '성남시',
      region: '수정구',
      type: 'public',
      rating: 4.3,
      currentAnimals: 67,
      capacity: 100,
      operatingHours: '09:00 - 18:00',
      facilities: ['진료실', '수술실', '격리실', '운동장', '훈련장'],
      adoptionProcess: ['온라인 신청', '서류 심사', '센터 방문', '동물 선택', '입양'],
      specialNeeds: ['응급치료', '재활훈련', '사회화'],
      description: '경기도에서 운영하는 대규모 동물보호센터로 전문적인 의료 서비스를 제공합니다.'
    },
    {
      id: '4',
      name: '한국동물구조관리협회',
      address: '서울시 강남구 도산대로 308',
      phone: '02-6262-0395',
      position: { lat: 37.5276, lng: 127.0378 },
      city: '서울',
      region: '강남구',
      type: 'organization',
      rating: 4.7,
      currentAnimals: 23,
      capacity: 40,
      operatingHours: '10:00 - 18:00',
      facilities: ['의료실', '격리실', '상담실', '임시보호실'],
      adoptionProcess: ['상담', '가정환경 확인', '시범입양', '정식입양'],
      specialNeeds: ['응급구조', '치료', '재활'],
      description: '동물 구조 및 보호 전문 기관으로 긴급 상황 대응과 전문 치료를 제공합니다.'
    },
    {
      id: '5',
      name: '인천시 동물보호센터',
      address: '인천시 서구 가좌동 621-1',
      phone: '032-440-8896',
      position: { lat: 37.4781, lng: 126.6562 },
      city: '인천',
      region: '서구',
      type: 'public',
      rating: 4.2,
      currentAnimals: 38,
      capacity: 60,
      operatingHours: '09:00 - 17:00',
      facilities: ['진료실', '입양상담실', '운동장', '보호실'],
      adoptionProcess: ['전화상담', '방문', '동물 선택', '입양신청', '승인'],
      specialNeeds: ['건강검진', '예방접종', '중성화'],
      description: '인천시에서 운영하는 공공 동물보호센터로 체계적인 보호 서비스를 제공합니다.'
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

  // 필터링된 보호소 목록
  const filteredShelters = sampleShelters
    .filter(shelter => 
      filterType === 'all' || shelter.type === filterType
    )
    .filter(shelter => 
      shelter.name.toLowerCase().includes(searchLocation.toLowerCase()) ||
      shelter.address.toLowerCase().includes(searchLocation.toLowerCase()) ||
      shelter.city.toLowerCase().includes(searchLocation.toLowerCase()) ||
      shelter.region.toLowerCase().includes(searchLocation.toLowerCase())
    )
    .map(shelter => ({
      ...shelter,
      distance: userLocation ? 
        calculateDistance(userLocation.lat, userLocation.lng, shelter.position.lat, shelter.position.lng) : 
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
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  // 보호소 타입 한글 변환
  const getTypeLabel = (type) => {
    switch (type) {
      case 'public': return '공공';
      case 'private': return '민간';
      case 'organization': return '단체';
      default: return '기타';
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>보호소 찾기</h1>
        <p className={styles.subtitle}>사랑이 필요한 동물들을 만나 새로운 가족이 되어주세요</p>
      </div>

      {/* 검색 및 필터 */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="보호소명, 지역으로 검색..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterButton} ${filterType === 'all' ? styles.active : ''}`}
            onClick={() => setFilterType('all')}
          >
            전체
          </button>
          <button
            className={`${styles.filterButton} ${filterType === 'public' ? styles.active : ''}`}
            onClick={() => setFilterType('public')}
          >
            공공보호소
          </button>
          <button
            className={`${styles.filterButton} ${filterType === 'private' ? styles.active : ''}`}
            onClick={() => setFilterType('private')}
          >
            민간보호소
          </button>
          <button
            className={`${styles.filterButton} ${filterType === 'organization' ? styles.active : ''}`}
            onClick={() => setFilterType('organization')}
          >
            단체보호소
          </button>
        </div>
      </div>

      <div className={styles.contentContainer}>
        {/* 지도 영역 */}
        <div className={styles.mapArea}>
          <div className={styles.mapHeader}>
            <h3>📍 보호소 위치</h3>
          </div>
          <MapContainer 
            hospitals={filteredShelters}
            selectedHospital={selectedShelter}
            onHospitalSelect={setSelectedShelter}
            userLocation={userLocation}
          />
        </div>

        {/* 보호소 목록 */}
        <div className={styles.listArea}>
          <div className={styles.shelterList}>
            {filteredShelters.map((shelter) => (
              <div 
                key={shelter.id}
                className={`${styles.shelterCard} ${
                  selectedShelter === shelter.id ? styles.selected : ''
                }`}
                onClick={() => setSelectedShelter(shelter.id)}
              >
                <div className={styles.shelterHeader}>
                  <div className={styles.shelterName}>
                    <h3>{shelter.name}</h3>
                    <span className={`${styles.typeBadge} ${styles[shelter.type]}`}>
                      {getTypeLabel(shelter.type)}
                    </span>
                  </div>
                  <div className={styles.shelterMeta}>
                    <span className={styles.occupancy}>
                      {shelter.currentAnimals}/{shelter.capacity}
                    </span>
                    {shelter.distance && (
                      <span className={styles.distance}>
                        {shelter.distance.toFixed(1)}km
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.shelterInfo}>
                  <p className={styles.address}>📍 {shelter.address}</p>
                  <div className={styles.rating}>
                    {renderStars(shelter.rating)}
                  </div>
                  <p className={styles.phone}>📞 {shelter.phone}</p>
                  <p className={styles.hours}>🕐 {shelter.operatingHours}</p>
                  
                  <div className={styles.facilities}>
                    <span>보유시설: </span>
                    {shelter.facilities.map((facility, index) => (
                      <span key={index} className={styles.facilityTag}>
                        {facility}
                      </span>
                    ))}
                  </div>

                  <div className={styles.description}>
                    <p>{shelter.description}</p>
                  </div>

                  <div className={styles.shelterActions}>
                    <button className={styles.detailButton}>상세보기</button>
                    <button className={styles.visitButton}>방문예약</button>
                  </div>
                </div>
              </div>
            ))}

            {filteredShelters.length === 0 && (
              <div className={styles.noResults}>
                <div className={styles.noResultsIcon}>🏠</div>
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

export default FindShelterPage;