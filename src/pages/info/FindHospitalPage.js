// src/pages/info/FindHospitalPage.js
import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/axios';
import styles from './FindHospitalPage.module.css';
import MapContainer from '../../components/map/MapContainer';
import PagingView from '../../components/common/pagingView';

const FindHospitalPage = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [filterService, setFilterService] = useState('all');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [geocodingCache, setGeocodingCache] = useState({});
  const [geocodingProgress, setGeocodingProgress] = useState({ current: 0, total: 0 });
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 50; // 한 페이지에 표시할 병원 수

  // 필터 상태 추가
  const [filters, setFilters] = useState({
    region: '',
    operatingHours: '',
    hospitalSize: '',
  });

  // 주소를 위도/경도로 변환하는 지오코딩 함수 (Kakao API 사용)
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
            Authorization: `KakaoAK ${apiKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.documents && data.documents.length > 0) {
        const coords = {
          lat: parseFloat(data.documents[0].y),
          lng: parseFloat(data.documents[0].x),
        };

        console.log('✅ Kakao 지오코딩 성공:', address, coords);

        // 캐시에 저장
        setGeocodingCache((prev) => ({
          ...prev,
          [address]: coords,
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

  // 지역별 대략적 좌표 매핑 (전국 주요 도시 추가)
  const getRegionCoords = (address) => {
    // 서울 구별
    if (address.includes('강남구')) return { lat: 37.5172, lng: 127.0473 };
    if (address.includes('서초구')) return { lat: 37.4837, lng: 127.0324 };
    if (address.includes('중랑구')) return { lat: 37.6066, lng: 127.0925 };
    if (address.includes('마포구')) return { lat: 37.5638, lng: 126.9084 };
    if (address.includes('강동구')) return { lat: 37.5301, lng: 127.1238 };
    if (address.includes('동대문구')) return { lat: 37.5744, lng: 127.0395 };
    if (address.includes('송파구')) return { lat: 37.5145, lng: 127.1059 };
    if (address.includes('용산구')) return { lat: 37.5326, lng: 126.991 };

    // 경기도
    if (address.includes('고양시')) return { lat: 37.6584, lng: 126.832 };
    if (address.includes('성남시')) return { lat: 37.4449, lng: 127.1388 };
    if (address.includes('수원시')) return { lat: 37.2636, lng: 127.0286 };
    if (address.includes('안양시')) return { lat: 37.3943, lng: 126.9568 };
    if (address.includes('부천시')) return { lat: 37.5035, lng: 126.766 };

    // 광역시
    if (address.includes('부산') || address.includes('부산시')) return { lat: 35.1796, lng: 129.0756 };
    if (address.includes('대구') || address.includes('대구시')) return { lat: 35.8714, lng: 128.6014 };
    if (address.includes('인천') || address.includes('인천시')) return { lat: 37.4563, lng: 126.7052 };
    if (address.includes('광주') || address.includes('광주시')) return { lat: 35.1595, lng: 126.8526 };
    if (address.includes('대전') || address.includes('대전시')) return { lat: 36.3504, lng: 127.3845 };
    if (address.includes('울산') || address.includes('울산시')) return { lat: 35.5384, lng: 129.3114 };

    // 특별시/도
    if (address.includes('세종') || address.includes('세종시')) return { lat: 36.48, lng: 127.289 };
    if (address.includes('제주') || address.includes('제주시') || address.includes('제주도'))
      return { lat: 33.4996, lng: 126.5312 };
    if (address.includes('서귀포')) return { lat: 33.2541, lng: 126.56 };

    // 전라남도
    if (address.includes('목포') || address.includes('목포시')) return { lat: 34.8118, lng: 126.3922 };
    if (address.includes('여수') || address.includes('여수시')) return { lat: 34.7604, lng: 127.6622 };
    if (address.includes('순천') || address.includes('순천시')) return { lat: 34.9507, lng: 127.4872 };

    // 전라북도
    if (address.includes('전주') || address.includes('전주시')) return { lat: 35.8242, lng: 127.148 };
    if (address.includes('군산') || address.includes('군산시')) return { lat: 35.9676, lng: 126.7368 };

    // 경상남도
    if (address.includes('창원') || address.includes('창원시')) return { lat: 35.228, lng: 128.6811 };
    if (address.includes('진주') || address.includes('진주시')) return { lat: 35.18, lng: 128.1076 };

    // 경상북도
    if (address.includes('포항') || address.includes('포항시')) return { lat: 36.019, lng: 129.3435 };
    if (address.includes('경주') || address.includes('경주시')) return { lat: 35.8562, lng: 129.2247 };

    // 충청남도
    if (address.includes('천안') || address.includes('천안시')) return { lat: 36.8151, lng: 127.1139 };
    if (address.includes('아산') || address.includes('아산시')) return { lat: 36.7898, lng: 127.2014 };

    // 충청북도
    if (address.includes('청주') || address.includes('청주시')) return { lat: 36.6424, lng: 127.489 };
    if (address.includes('충주') || address.includes('충주시')) return { lat: 36.991, lng: 127.9259 };

    // 강원도
    if (address.includes('춘천') || address.includes('춘천시')) return { lat: 37.8813, lng: 127.7298 };
    if (address.includes('원주') || address.includes('원주시')) return { lat: 37.3422, lng: 127.9202 };

    console.warn('⚠️ 주소에서 지역을 찾을 수 없어 서울 기본값 사용:', address);
    // 기본값: 서울 중심부
    return { lat: 37.5665, lng: 126.978 };
  };

  // 백엔드에서 병원 데이터 가져오기
  const fetchHospitals = async (page = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      // Info Plaza의 hospital API 사용
      let url = '/api/info/hospitals';
      const params = new URLSearchParams();

      // 페이징 처리 - 한 번에 50개씩만 가져오기
      params.append('page', page.toString());
      params.append('size', pageSize.toString());

      // 검색어가 있으면 검색 API 사용
      if (searchLocation) {
        url = '/api/info/hospitals/search';
        params.append('keyword', searchLocation);
      }

      if (params.toString()) {
        url += '?' + params.toString();
      }

      console.log('API 요청:', url);
      const response = await apiClient.get(url);

      console.log('API 응답:', response.data);
      console.log('API 응답 구조:', {
        hasContent: response.data.content !== undefined,
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
        number: response.data.number,
        size: response.data.size,
      });

      // 백엔드 응답을 프론트엔드 형식에 맞게 변환
      // 페이징 응답 구조 처리
      const isPagedResponse = response.data.content !== undefined;
      const hospitalData = isPagedResponse ? response.data.content : response.data;
      console.log('백엔드 원본 데이터:', hospitalData);

      // 페이징 정보 설정
      if (isPagedResponse) {
        setTotalCount(response.data.totalElements || 0);
        setTotalPages(response.data.totalPages || 0);
        console.log('페이징 정보 설정:', {
          totalCount: response.data.totalElements,
          totalPages: response.data.totalPages,
          currentPage: currentPage,
        });
      } else {
        setTotalCount(hospitalData.length);
        setTotalPages(Math.ceil(hospitalData.length / pageSize));
      }

      // HospitalDto.Response 형식에 맞게 매핑
      const mappedHospitals = hospitalData
        .filter((hospital) => hospital.latitude && hospital.longitude) // 좌표가 있는 병원만 필터링
        .map((hospital) => ({
          id: hospital.vetId?.toString(), // vetId -> hospitalId
          name: hospital.name, // name -> businessName
          address: hospital.address, // address -> roadAddress
          phone: hospital.phone,
          position: {
            lat: Number(hospital.latitude),
            lng: Number(hospital.longitude),
          },
          rating: hospital.rating || 4.5,
          reviewCount: hospital.reviewCount || 0,
          openHours: hospital.openHours || '09:00 - 18:00',
          services: hospital.services || ['진료', '건강검진', '예방접종'],
          specialization: hospital.specialization || '종합진료',
          isEmergency: hospital.isEmergency || false,
          website: hospital.website,
          email: hospital.email,
          description: hospital.description,
        }));

      setHospitals(mappedHospitals);
      console.log('🏥 지오코딩 완료!', {
        '현재 페이지': currentPage + 1,
        '총 페이지 수': totalPages,
        '전체 병원 수': totalCount,
        '현재 페이지 병원 수': mappedHospitals.length,
        '지오코딩 성공률': `${Object.keys(geocodingCache).length}/${mappedHospitals.length}`,
        '완료된 병원 데이터': mappedHospitals,
      });

      // 지역별 병원 분포 확인
      const regionDistribution = {};
      mappedHospitals.forEach((hospital) => {
        const address = hospital.address;
        if (!address) {
          return;
        }
        if (address.includes('서울')) {
          regionDistribution['서울'] = (regionDistribution['서울'] || 0) + 1;
        } else if (address.includes('목포')) {
          regionDistribution['목포'] = (regionDistribution['목포'] || 0) + 1;
        } else if (address.includes('제주')) {
          regionDistribution['제주'] = (regionDistribution['제주'] || 0) + 1;
        } else if (address.includes('부산')) {
          regionDistribution['부산'] = (regionDistribution['부산'] || 0) + 1;
        } else {
          const region = address.split(' ')[0] || '기타';
          regionDistribution[region] = (regionDistribution[region] || 0) + 1;
        }
      });

      console.log('📊 지역별 병원 분포:', regionDistribution);

      // MapContainer에 전달될 데이터 미리보기
      console.log(
        '🗺️ 지도에 표시될 마커 정보:',
        mappedHospitals.map((h) => ({
          name: h.name,
          position: h.position,
          address: h.address,
        }))
      );
    } catch (err) {
      console.error('병원 데이터 로딩 실패:', err);
      setError('병원 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 병원 데이터 로드
  useEffect(() => {
    fetchHospitals();
  }, []);

  // 페이지 변경 시 데이터 재로드
  useEffect(() => {
    fetchHospitals(currentPage);
  }, [currentPage]);

  // 필터 변경 시 첫 페이지로 리셋하고 데이터 재로드
  useEffect(() => {
    setCurrentPage(0); // 필터 변경 시 첫 페이지로
    if (filters.region || filters.operatingHours || filters.hospitalSize) {
      fetchHospitals(0);
    }
  }, [filters]);

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
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 거리 계산 추가
  const hospitalsWithDistance = hospitals.map((hospital) => ({
    ...hospital,
    distance: userLocation
      ? calculateDistance(userLocation.lat, userLocation.lng, hospital.position.lat, hospital.position.lng)
      : undefined,
  }));

  // 별점 렌더링
  const renderStars = (rating) => {
    return (
      <div className={styles.starRating}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`${styles.star} ${star <= rating ? styles.starFilled : styles.starEmpty}`}>
            ★
          </span>
        ))}
        <span className={styles.ratingText}>
          {rating.toFixed(1)} ({hospitals.length > 0 ? '리뷰' : '리뷰 없음'})
        </span>
      </div>
    );
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page - 1); // PagingView는 1부터 시작, API는 0부터 시작
    window.scrollTo({ top: 0, behavior: 'smooth' }); // 페이지 상단으로 스크롤
  };

  // 페이지네이션 계산 함수
  const calculatePagination = () => {
    const pageGroupSize = 10;
    const currentPageDisplay = currentPage + 1; // API는 0부터, 화면은 1부터

    const currentGroup = Math.ceil(currentPageDisplay / pageGroupSize);
    const startPage = (currentGroup - 1) * pageGroupSize + 1;
    const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

    return {
      currentPage: currentPageDisplay,
      totalPage: totalPages,
      startPage,
      endPage,
    };
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>동물병원 찾기</h1>
        <p className={styles.subtitle}>가까운 동물병원을 찾아 반려동물의 건강을 지켜주세요</p>
      </div>

      {/* 필터 섹션 */}
      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label htmlFor="region">지역</label>
          <select
            id="region"
            value={filters.region}
            onChange={(e) => setFilters((prev) => ({ ...prev, region: e.target.value }))}
            className={styles.filterSelect}
          >
            <option value="">전체</option>
            <option value="서울">서울</option>
            <option value="경기">경기</option>
            <option value="인천">인천</option>
            <option value="부산">부산</option>
            <option value="대구">대구</option>
            <option value="광주">광주</option>
            <option value="대전">대전</option>
            <option value="울산">울산</option>
            <option value="세종">세종</option>
            <option value="강원">강원</option>
            <option value="충북">충북</option>
            <option value="충남">충남</option>
            <option value="전북">전북</option>
            <option value="전남">전남</option>
            <option value="경북">경북</option>
            <option value="경남">경남</option>
            <option value="제주">제주</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="operatingHours">운영시간</label>
          <select
            id="operatingHours"
            value={filters.operatingHours}
            onChange={(e) => setFilters((prev) => ({ ...prev, operatingHours: e.target.value }))}
            className={styles.filterSelect}
          >
            <option value="">전체</option>
            <option value="operating">운영중</option>
            <option value="closed">휴진</option>
            <option value="24hours">24시간</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="hospitalSize">병원규모</label>
          <select
            id="hospitalSize"
            value={filters.hospitalSize}
            onChange={(e) => setFilters((prev) => ({ ...prev, hospitalSize: e.target.value }))}
            className={styles.filterSelect}
          >
            <option value="">전체</option>
            <option value="large">대형병원</option>
            <option value="medium">중형병원</option>
            <option value="small">일반병원</option>
          </select>
        </div>
      </div>

      {/* 결과 요약 */}
      <div className={styles.resultSummary}>
        전국 <span className={styles.count}>{totalCount}</span>개의 동물병원이 운영 중입니다
      </div>

      {/* 검색 및 필터 */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="병원명, 지역, 진료과목으로 검색..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                // 엔터키를 누르면 첫 페이지로 이동하고 검색
                console.log('🔍 검색 실행:', searchLocation);
                setCurrentPage(0);
                fetchHospitals(0);
              }
            }}
            className={styles.searchInput}
          />
          <button
            className={styles.searchButton}
            onClick={() => {
              // 검색 버튼 클릭 시 첫 페이지로 이동하고 검색
              console.log('🔍 검색 버튼 클릭:', searchLocation);
              setCurrentPage(0);
              fetchHospitals(0);
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
            <h3>📍 병원 위치</h3>
          </div>
          <MapContainer
            hospitals={hospitalsWithDistance}
            selectedHospital={selectedHospital}
            onHospitalSelect={setSelectedHospital}
            userLocation={userLocation}
            center={
              hospitalsWithDistance.length > 0 ? hospitalsWithDistance[0].position : { lat: 37.5665, lng: 126.978 }
            }
            zoom={8}
          />
        </div>

        {/* 병원 목록 */}
        <div className={styles.listArea}>
          <div className={styles.hospitalList}>
            {loading && (
              <div className={styles.loading}>
                <p>병원 정보를 불러오는 중...</p>
                {geocodingProgress.total > 0 && (
                  <p>
                    위치 정보 확인 중: {geocodingProgress.current}/{geocodingProgress.total}
                  </p>
                )}
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width:
                        geocodingProgress.total > 0
                          ? `${(geocodingProgress.current / geocodingProgress.total) * 100}%`
                          : '0%',
                    }}
                  ></div>
                </div>
              </div>
            )}

            {error && (
              <div className={styles.error}>
                <p>{error}</p>
                <button onClick={() => fetchHospitals()}>다시 시도</button>
              </div>
            )}

            {!loading && !error && hospitalsWithDistance.length === 0 && (
              <div className={styles.noResults}>
                <div className={styles.noResultsIcon}>🏥</div>
                <h3>검색 결과가 없습니다</h3>
                <p>다른 검색어로 다시 시도해보세요</p>
              </div>
            )}

            {!loading &&
              !error &&
              hospitalsWithDistance.map((hospital) => (
                <div
                  key={hospital.id}
                  className={`${styles.hospitalCard} ${selectedHospital === hospital.id ? styles.selected : ''}`}
                  onClick={() => {
                    console.log('🏥 병원 카드 클릭:', {
                      hospitalId: hospital.id,
                      hospitalIdType: typeof hospital.id,
                      hospitalName: hospital.name,
                      position: hospital.position,
                    });
                    setSelectedHospital(hospital.id);
                  }}
                >
                  <div className={styles.hospitalHeader}>
                    <div className={styles.hospitalName}>
                      <h3>{hospital.name}</h3>
                      {hospital.isEmergency && <span className={styles.emergencyBadge}>응급</span>}
                    </div>
                    <div className={styles.hospitalMeta}>
                      <span className={styles.specialization}>{hospital.specialization}</span>
                      {hospital.distance && <span className={styles.distance}>{hospital.distance.toFixed(1)}km</span>}
                    </div>
                  </div>

                  <div className={styles.hospitalInfo}>
                    <p className={styles.address}>📍 {hospital.address}</p>
                    <div className={styles.rating}>{renderStars(hospital.rating)}</div>
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
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* 페이징 */}
      {(() => {
        console.log('페이징 렌더링 체크:', {
          totalPages,
          totalCount,
          currentPage,
          hospitalsLength: hospitals.length,
        });

        if (totalPages > 0) {
          const pagination = calculatePagination();
          console.log('페이지네이션 계산:', pagination);

          return (
            <PagingView
              currentPage={pagination.currentPage}
              totalPage={pagination.totalPage}
              startPage={pagination.startPage}
              endPage={pagination.endPage}
              onPageChange={handlePageChange}
            />
          );
        } else {
          return null;
        }
      })()}
    </div>
  );
};

export default FindHospitalPage;
