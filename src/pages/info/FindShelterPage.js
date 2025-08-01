// src/pages/info/FindShelterPage.js
import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/axios';
import styles from './FindShelterPage.module.css';
import MapContainer from '../../components/map/MapContainer';
import PagingView from '../../components/common/pagingView';

const FindShelterPage = () => {
  const [searchInput, setSearchInput] = useState(''); // 입력창의 실시간 값
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1); // 1부터 시작하는 현재 페이지
  const pageSize = 50;

  // 필터 상태 추가
  const [filters, setFilters] = useState({
    region: '',
    animalType: '',
    operatingStatus: '',
  });

  // 백엔드에서 보호소 데이터 가져오기
  const fetchShelters = async (searchParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      // 공공데이터 보호소 API 사용
      let url = '/api/info/shelters/public';
      const params = new URLSearchParams();

      // 모든 보호소 데이터를 가져오기 위해 size를 크게 설정
      params.append('size', '500');

      if (searchParams.keyword) {
        url = '/api/info/shelters/public/search';
        params.append('keyword', searchParams.keyword);
      }

      if (params.toString()) {
        url += '?' + params.toString();
      }

      console.log('🏠 보호소 API 요청:', url);
      const response = await apiClient.get(url);

      console.log('🏠 보호소 API 응답:', response.data);

      // 백엔드 응답을 프론트엔드 형식에 맞게 변환
      const shelterData = response.data.content || response.data;
      console.log('🏠 백엔드 원본 보호소 데이터:', shelterData);

      // ShelterInfoDto 형식에 맞게 매핑 (좌표는 백엔드에서 이미 제공)
      const mappedShelters = shelterData
        .filter((shelter) => shelter.lat && shelter.lng) // 좌표가 있는 보호소만 필터링
        .map((shelter) => ({
          id: shelter.shelterInfoId?.toString(),
          name: shelter.careNm,
          address: shelter.careAddr,
          phone: shelter.careTel,
          position: {
            lat: Number(shelter.lat),
            lng: Number(shelter.lng),
          },
          rating: 4.5, // 기본값
          currentAnimals: Math.floor(Math.random() * 30), // 임시값
          capacity: 50, // 기본값
          operatingHours: formatOperatingHours(shelter.weekOprStime, shelter.weekOprEtime),
          type: determineShelterType(shelter.divisionNm),
          email: '',
          website: '',
          managerName: shelter.orgNm || '관리자',
          facilities: ['입양상담실', '의료실', '운동장', '보호실'], // 기본 시설
          adoptionProcess: ['상담', '방문', '동물 선택', '입양 신청'], // 기본 절차
          specialNeeds: ['건강검진', '예방접종', '중성화 수술'], // 기본 서비스
          description: `${shelter.careNm}에서 사랑이 필요한 동물들을 보호하고 있습니다.`,
          // 추가 정보
          careRegNo: shelter.careRegNo,
          divisionNm: shelter.divisionNm,
          saveTrgtAnimal: shelter.saveTrgtAnimal,
          dsignationDate: shelter.dsignationDate,
          vetPersonCnt: shelter.vetPersonCnt,
          specsPersonCnt: shelter.specsPersonCnt,
        }));

      setShelters(mappedShelters);
      setTotalCount(shelterData.totalElements || mappedShelters.length);
      console.log('🏠 보호소 데이터 로드 완료!', {
        '총 보호소 수': mappedShelters.length,
        '완료된 보호소 데이터': mappedShelters,
      });

      // 지역별 보호소 분포 확인
      const regionDistribution = {};
      mappedShelters.forEach((shelter) => {
        const address = shelter.address;
        const region = address.split(' ')[0] || '기타';
        regionDistribution[region] = (regionDistribution[region] || 0) + 1;
      });

      console.log('📊 지역별 보호소 분포:', regionDistribution);

      // MapContainer에 전달될 데이터 미리보기
      console.log(
        '🗺️ 지도에 표시될 보호소 마커 정보:',
        mappedShelters.map((s) => ({
          name: s.name,
          position: s.position,
          address: s.address,
        }))
      );
    } catch (err) {
      console.error('보호소 데이터 로딩 실패:', err);
      setError('보호소 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = (e) => {
    e.preventDefault(); // form의 기본 동작(새로고침) 방지
    setCurrentPage(1); // 검색 시 항상 첫 페이지로 리셋
    setSearchKeyword(searchInput.trim()); // 입력창의 값을 확정된 검색어로 설정
  };

  // 운영시간 포맷팅 헬퍼 함수
  const formatOperatingHours = (startTime, endTime) => {
    if (!startTime || !endTime) return '09:00 - 18:00';

    try {
      const formatTime = (time) => {
        if (!time) return '';

        // 디버깅용 로그
        console.log('시간 원본 데이터:', time, '타입:', typeof time);

        // 문자열로 변환
        const timeStr = time.toString();

        // 이미 콜론이 있으면 그대로 반환
        if (timeStr.includes(':')) {
          return timeStr;
        }

        // 숫자만 추출
        const numStr = timeStr.replace(/[^0-9]/g, '');

        // 길이에 따라 처리
        if (numStr.length <= 2) {
          // 시간만 있는 경우 (예: "10" -> "10:00")
          return `${numStr.padStart(2, '0')}:00`;
        } else if (numStr.length === 3) {
          // 3자리인 경우 (예: "900" -> "09:00")
          return `${numStr.substring(0, 1).padStart(2, '0')}:${numStr.substring(1, 3)}`;
        } else {
          // 4자리 이상인 경우 (예: "1000" -> "10:00")
          return `${numStr.substring(0, 2)}:${numStr.substring(2, 4)}`;
        }
      };

      const result = `${formatTime(startTime)} - ${formatTime(endTime)}`;
      console.log('포맷팅 결과:', result);
      return result;
    } catch (e) {
      console.error('시간 포맷팅 오류:', e);
      return '09:00 - 18:00';
    }
  };

  // 보호소 타입 결정 헬퍼 함수
  const determineShelterType = (divisionNm) => {
    if (!divisionNm) return 'private';

    if (divisionNm.includes('법인') || divisionNm.includes('지자체') || divisionNm.includes('시설')) {
      return 'public';
    } else if (divisionNm.includes('단체') || divisionNm.includes('협회')) {
      return 'organization';
    }
    return 'private';
  };

  // 컴포넌트 마운트 시 보호소 데이터 로드
  useEffect(() => {
    fetchShelters();
  }, []);

  // 필터 변경 시 데이터 재로드
  useEffect(() => {
    setCurrentPage(1);
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

  // 클라이언트 사이드 필터링된 보호소 목록
  const filteredShelters = shelters
    .filter((shelter) => {
      // 검색어 필터
      const matchesSearch =
        searchKeyword === '' ||
        shelter.name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        shelter.address?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        shelter.managerName?.toLowerCase().includes(searchKeyword.toLowerCase());

      // 지역 필터
      const matchesRegion = filters.region === '' || shelter.address?.includes(filters.region);

      // 보호동물 필터
      const matchesAnimalType =
        filters.animalType === '' || (shelter.saveTrgtAnimal && shelter.saveTrgtAnimal.includes(filters.animalType));

      // 운영상태 필터 (현재는 모두 운영중으로 가정)
      const matchesOperatingStatus = filters.operatingStatus === '' || filters.operatingStatus === 'operating';

      return matchesSearch && matchesRegion && matchesAnimalType && matchesOperatingStatus;
    })
    .map((shelter) => ({
      ...shelter,
      distance: userLocation
        ? calculateDistance(userLocation.lat, userLocation.lng, shelter.position.lat, shelter.position.lng)
        : undefined,
    }))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  const paginatedShelters = filteredShelters.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // 별점 렌더링
  const renderStars = (rating) => {
    return (
      <div className={styles.starRating}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`${styles.star} ${star <= rating ? styles.starFilled : styles.starEmpty}`}>
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
        <p className={styles.subtitle}>사랑이 필요한 동물들을 만나 새로운 가족이 되어주세요</p>
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
          <label htmlFor="animalType">보호동물</label>
          <select
            id="animalType"
            value={filters.animalType}
            onChange={(e) => setFilters((prev) => ({ ...prev, animalType: e.target.value }))}
            className={styles.filterSelect}
          >
            <option value="">전체</option>
            <option value="개">개</option>
            <option value="고양이">고양이</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="operatingStatus">운영상태</label>
          <select
            id="operatingStatus"
            value={filters.operatingStatus}
            onChange={(e) => setFilters((prev) => ({ ...prev, operatingStatus: e.target.value }))}
            className={styles.filterSelect}
          >
            <option value="">전체</option>
            <option value="operating">운영중</option>
            <option value="closed">휴무</option>
          </select>
        </div>
      </div>

      {/* 결과 요약 */}
      <div className={styles.resultSummary}>
        전국 <span className={styles.count}>{totalCount}</span>개의 보호소가 운영 중입니다
      </div>

      {/* 검색 바 */}
      <form className={styles.searchSection} onSubmit={handleSearch}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="보호소명, 지역, 관리자명으로 검색..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                // 엔터키를 누르면 검색어가 이미 상태에 반영되어 자동으로 필터링됨
                console.log('🔍 보호소 검색 실행:', searchInput);
              }
            }}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            검색
          </button>
        </div>
      </form>

      <div className={styles.contentContainer}>
        {/* 지도 영역 */}
        <div className={styles.mapArea}>
          <div className={styles.mapHeader}>
            <h3>📍 보호소 위치</h3>
          </div>
          <MapContainer
            hospitals={paginatedShelters}
            selectedHospital={selectedShelter}
            onHospitalSelect={setSelectedShelter}
            userLocation={userLocation}
            center={paginatedShelters.length > 0 ? paginatedShelters[0].position : { lat: 37.5665, lng: 126.978 }}
            zoom={8}
          />
        </div>

        {/* 보호소 목록 */}
        <div className={styles.listArea}>
          <div className={styles.shelterList}>
            {loading && (
              <div className={styles.loading}>
                <p>보호소 정보를 불러오는 중...</p>
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

            {!loading &&
              !error &&
              paginatedShelters.map((shelter) => (
                <div
                  key={shelter.id}
                  className={`${styles.shelterCard} ${selectedShelter === shelter.id ? styles.selected : ''}`}
                  onClick={() => {
                    console.log('🏠 보호소 카드 클릭:', {
                      shelterId: shelter.id,
                      shelterIdType: typeof shelter.id,
                      shelterName: shelter.name,
                      position: shelter.position,
                    });
                    setSelectedShelter(shelter.id);
                  }}
                >
                  <div className={styles.shelterHeader}>
                    <div className={styles.shelterName}>
                      <h3>{shelter.name}</h3>
                      <span className={`${styles.typeBadge} ${styles[shelter.type]}`}>
                        {getTypeLabel(shelter.type)}
                      </span>
                    </div>
                    <div className={styles.shelterMeta}>
                      {shelter.distance && <span className={styles.distance}>{shelter.distance.toFixed(1)}km</span>}
                    </div>
                  </div>

                  <div className={styles.shelterInfo}>
                    <p className={styles.address}>📍 {shelter.address}</p>
                    <p className={styles.phone}>📞 {shelter.phone || '연락처 없음'}</p>
                    <p className={styles.hours}>🕐 {shelter.operatingHours}</p>

                    {/* 공공데이터 추가 정보 */}
                    {shelter.divisionNm && <p className={styles.division}>🏛️ 구분: {shelter.divisionNm}</p>}

                    {shelter.saveTrgtAnimal && <p className={styles.animals}>🐾 보호동물: {shelter.saveTrgtAnimal}</p>}

                    <div className={styles.staffInfo}>
                      {(shelter.vetPersonCnt > 0 || shelter.specsPersonCnt > 0) && (
                        <div className={styles.staffNumbers}>
                          <span className={styles.staffItem}>👨‍⚕️ 수의사: {shelter.vetPersonCnt || 0}명</span>
                          <span className={styles.staffItem}>👥 전문인력: {shelter.specsPersonCnt || 0}명</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.description}>
                      <p>{shelter.description}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      {(() => {
        // 1. 필터링된 결과의 총 페이지 수를 계산합니다.
        const totalPage = Math.ceil(filteredShelters.length / pageSize);

        // 2. 총 페이지가 1 이하이면 페이징을 보여줄 필요가 없으므로 null을 반환합니다.
        if (totalPage <= 1) return null;

        // 3. 페이지 블록(예: 1~10, 11~20)을 계산합니다.
        const pageBlockSize = 10;
        const currentBlock = Math.ceil(currentPage / pageBlockSize);
        const startPage = (currentBlock - 1) * pageBlockSize + 1;
        const endPage = Math.min(startPage + pageBlockSize - 1, totalPage);

        // 4. 계산된 값들을 PagingView에 전달하여 렌더링합니다.
        return (
          <PagingView
            currentPage={currentPage}
            totalPage={totalPage}
            startPage={startPage}
            endPage={endPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        );
      })()}
    </div>
  );
};

export default FindShelterPage;
