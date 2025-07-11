// src/pages/info/FindShelterPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './FindShelterPage.module.css';
import MapContainer from '../../components/map/MapContainer';

const FindShelterPage = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [geocodingCache, setGeocodingCache] = useState({});
  const [geocodingProgress, setGeocodingProgress] = useState({ current: 0, total: 0 });

  // 주소를 위도/경도로 변환하는 지오코딩 함수 (병원 찾기와 동일)
  const geocodeAddress = async (address) => {
    // 캐시 확인
    if (geocodingCache[address]) {
      console.log('✅ 캐시에서 좌표 가져옴:', address, geocodingCache[address]);
      return geocodingCache[address];
    }

    console.log('🔍 지오코딩 시도:', address);

    try {
      // Kakao REST API 사용 (한국 주소에 가장 정확)
      const apiKey = 'c72b3b2a8b1dd13b40c756a5d7c88bb6'; // 공개 API 키 (임시)
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
        {
          headers: {
            'Authorization': `KakaoAK ${apiKey}`
          }
        }
      );
      
      const data = await response.json();
      
      if (data.documents && data.documents.length > 0) {
        const coords = {
          lat: parseFloat(data.documents[0].y),
          lng: parseFloat(data.documents[0].x)
        };
        
        console.log('✅ Kakao 지오코딩 성공:', address, coords);
        
        // 캐시에 저장
        setGeocodingCache(prev => ({
          ...prev,
          [address]: coords
        }));
        
        return coords;
      } else {
        console.warn('⚠️ Kakao API 응답에 결과 없음:', address, data);
      }
    } catch (error) {
      console.error('❌ Kakao 지오코딩 API 에러:', address, error);
    }
    
    // 실패 시 지역별 대략적 좌표 반환
    const regionCoords = getRegionCoords(address);
    console.log('🎯 지오코딩 실패, 지역 좌표 사용:', address, regionCoords);
    return regionCoords;
  };

  // 지역별 대략적 좌표 매핑 (병원 찾기와 동일)
  const getRegionCoords = (address) => {
    // 서울 구별
    if (address.includes('강남구')) return { lat: 37.5172, lng: 127.0473 };
    if (address.includes('서초구')) return { lat: 37.4837, lng: 127.0324 };
    if (address.includes('중랑구')) return { lat: 37.6066, lng: 127.0925 };
    if (address.includes('마포구')) return { lat: 37.5638, lng: 126.9084 };
    if (address.includes('강동구')) return { lat: 37.5301, lng: 127.1238 };
    if (address.includes('동대문구')) return { lat: 37.5744, lng: 127.0395 };
    if (address.includes('송파구')) return { lat: 37.5145, lng: 127.1059 };
    if (address.includes('용산구')) return { lat: 37.5326, lng: 126.9910 };
    
    // 경기도
    if (address.includes('고양시')) return { lat: 37.6584, lng: 126.8320 };
    if (address.includes('성남시')) return { lat: 37.4449, lng: 127.1388 };
    if (address.includes('수원시')) return { lat: 37.2636, lng: 127.0286 };
    if (address.includes('안양시')) return { lat: 37.3943, lng: 126.9568 };
    if (address.includes('부천시')) return { lat: 37.5035, lng: 126.7660 };
    
    // 광역시
    if (address.includes('부산') || address.includes('부산시')) return { lat: 35.1796, lng: 129.0756 };
    if (address.includes('대구') || address.includes('대구시')) return { lat: 35.8714, lng: 128.6014 };
    if (address.includes('인천') || address.includes('인천시')) return { lat: 37.4563, lng: 126.7052 };
    if (address.includes('광주') || address.includes('광주시')) return { lat: 35.1595, lng: 126.8526 };
    if (address.includes('대전') || address.includes('대전시')) return { lat: 36.3504, lng: 127.3845 };
    if (address.includes('울산') || address.includes('울산시')) return { lat: 35.5384, lng: 129.3114 };
    
    // 특별시/도
    if (address.includes('세종') || address.includes('세종시')) return { lat: 36.4800, lng: 127.2890 };
    if (address.includes('제주') || address.includes('제주시') || address.includes('제주도')) return { lat: 33.4996, lng: 126.5312 };
    if (address.includes('서귀포')) return { lat: 33.2541, lng: 126.5600 };
    
    console.warn('⚠️ 주소에서 지역을 찾을 수 없어 서울 기본값 사용:', address);
    // 기본값: 서울 중심부
    return { lat: 37.5665, lng: 126.9780 };
  };

  // 백엔드에서 보호소 데이터 가져오기
  const fetchShelters = async (searchParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/api/info/shelters';
      const params = new URLSearchParams();
      
      // 모든 보호소 데이터를 가져오기 위해 size를 크게 설정
      params.append('size', '100');
      
      if (searchParams.keyword) {
        url += '/search';
        params.append('keyword', searchParams.keyword);
      } else {
        if (params.toString()) {
          url += '?' + params.toString();
        }
      }
      
      console.log('🏠 보호소 API 요청:', url);
      const response = await axios.get(url);
      
      console.log('🏠 보호소 API 응답:', response.data);
      
      // 백엔드 응답을 프론트엔드 형식에 맞게 변환
      const shelterData = response.data.content || response.data;
      console.log('🏠 백엔드 원본 보호소 데이터:', shelterData);
      
      // 모든 보호소의 좌표를 실제 주소로부터 가져오기
      setGeocodingProgress({ current: 0, total: shelterData.length });
      
      const mappedShelters = [];
      for (let i = 0; i < shelterData.length; i++) {
        const shelter = shelterData[i];
        setGeocodingProgress({ current: i + 1, total: shelterData.length });
        
        const position = await geocodeAddress(shelter.address);
        
        mappedShelters.push({
          id: shelter.shelterId?.toString() || shelter.id?.toString(),
          name: shelter.name || shelter.shelterName,
          address: shelter.address,
          phone: shelter.phone,
          position: position,
          rating: shelter.rating || 4.5,
          currentAnimals: shelter.currentAnimals || Math.floor(Math.random() * 30),
          capacity: shelter.capacity || 50,
          operatingHours: shelter.operatingHours || '09:00 - 18:00',
          type: shelter.type || 'private',
          email: shelter.email,
          website: shelter.website,
          managerName: shelter.managerName || '관리자',
          facilities: ['입양상담실', '의료실', '운동장', '보호실'], // 기본 시설
          adoptionProcess: ['상담', '방문', '동물 선택', '입양 신청'], // 기본 절차
          specialNeeds: ['건강검진', '예방접종', '중성화 수술'], // 기본 서비스
          description: `${shelter.shelterName || shelter.name}에서 사랑이 필요한 동물들을 보호하고 있습니다.`
        });
        
        // 지오코딩 API 부하 방지를 위한 짧은 딜레이
        if (i < shelterData.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      setShelters(mappedShelters);
      console.log('🏠 지오코딩 완료!', {
        '총 보호소 수': mappedShelters.length,
        '지오코딩 성공률': `${Object.keys(geocodingCache).length}/${mappedShelters.length}`,
        '완료된 보호소 데이터': mappedShelters
      });
      
      // 지역별 보호소 분포 확인
      const regionDistribution = {};
      mappedShelters.forEach(shelter => {
        const address = shelter.address;
        if (address.includes('서울')) {
          regionDistribution['서울'] = (regionDistribution['서울'] || 0) + 1;
        } else if (address.includes('경기')) {
          regionDistribution['경기'] = (regionDistribution['경기'] || 0) + 1;
        } else if (address.includes('인천')) {
          regionDistribution['인천'] = (regionDistribution['인천'] || 0) + 1;
        } else {
          const region = address.split(' ')[0] || '기타';
          regionDistribution[region] = (regionDistribution[region] || 0) + 1;
        }
      });
      
      console.log('📊 지역별 보호소 분포:', regionDistribution);
      
      // MapContainer에 전달될 데이터 미리보기
      console.log('🗺️ 지도에 표시될 보호소 마커 정보:', mappedShelters.map(s => ({
        name: s.name,
        position: s.position,
        address: s.address
      })));
      
    } catch (err) {
      console.error('보호소 데이터 로딩 실패:', err);
      setError('보호소 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 보호소 데이터 로드
  useEffect(() => {
    fetchShelters();
  }, []);


  // 사용자 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
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
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 클라이언트 사이드 필터링된 보호소 목록 (검색어만 적용)
  const filteredShelters = shelters
    .filter(shelter => 
      shelter.name?.toLowerCase().includes(searchLocation.toLowerCase()) ||
      shelter.address?.toLowerCase().includes(searchLocation.toLowerCase()) ||
      shelter.managerName?.toLowerCase().includes(searchLocation.toLowerCase())
    )
    .map(shelter => ({
      ...shelter,
      distance: userLocation
        ? calculateDistance(
            userLocation.lat,
            userLocation.lng,
            shelter.position.lat,
            shelter.position.lng
          )
        : undefined,
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
        <span className={styles.ratingText}>{rating.toFixed(1)}</span>
      </div>
    );
  };

  // 보호소 타입 한글 변환
  const getTypeLabel = (type) => {
    switch (type) {
      case 'public':
        return '공공';
      case 'private':
        return '민간';
      case 'organization':
        return '단체';
      default:
        return '기타';
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>보호소 찾기</h1>
        <p className={styles.subtitle}>
          사랑이 필요한 동물들을 만나 새로운 가족이 되어주세요
        </p>
      </div>

      {/* 검색 및 필터 */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="보호소명, 지역, 관리자명으로 검색..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                // 엔터키를 누르면 검색어가 이미 상태에 반영되어 자동으로 필터링됨
                console.log('🔍 보호소 검색 실행:', searchLocation);
              }
            }}
            className={styles.searchInput}
          />
          <button 
            className={styles.searchButton}
            onClick={() => {
              // 클라이언트 사이드 검색 - 서버 재호출 없음
              console.log('🔍 보호소 검색 버튼 클릭:', searchLocation);
            }}
          >
            검색
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
            center={filteredShelters.length > 0 ? filteredShelters[0].position : { lat: 37.5665, lng: 126.9780 }}
            zoom={8}
          />
        </div>

        {/* 보호소 목록 */}
        <div className={styles.listArea}>
          <div className={styles.shelterList}>
            {loading && (
              <div className={styles.loading}>
                <p>보호소 정보를 불러오는 중...</p>
                {geocodingProgress.total > 0 && (
                  <p>위치 정보 확인 중: {geocodingProgress.current}/{geocodingProgress.total}</p>
                )}
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ 
                      width: geocodingProgress.total > 0 
                        ? `${(geocodingProgress.current / geocodingProgress.total) * 100}%` 
                        : '0%' 
                    }}
                  ></div>
                </div>
              </div>
            )}
            
            {error && (
              <div className={styles.error}>
                <p>{error}</p>
                <button onClick={() => fetchShelters()}>다시 시도</button>
              </div>
            )}
            
            {!loading && !error && filteredShelters.length === 0 && (
              <div className={styles.noResults}>
                <div className={styles.noResultsIcon}>🏠</div>
                <h3>검색 결과가 없습니다</h3>
                <p>다른 검색어로 다시 시도해보세요</p>
              </div>
            )}
            
            {!loading && !error && filteredShelters.map((shelter) => (
              <div 

                key={shelter.id}
                className={`${styles.shelterCard} ${
                  selectedShelter === shelter.id ? styles.selected : ''
                }`}
                onClick={() => {
                  console.log('🏠 보호소 카드 클릭:', {
                    shelterId: shelter.id,
                    shelterIdType: typeof shelter.id,
                    shelterName: shelter.name,
                    position: shelter.position
                  });
                  setSelectedShelter(shelter.id);
                }}
              >
                <div className={styles.shelterHeader}>
                  <div className={styles.shelterName}>
                    <h3>{shelter.name}</h3>
                    <span
                      className={`${styles.typeBadge} ${styles[shelter.type]}`}
                    >
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
