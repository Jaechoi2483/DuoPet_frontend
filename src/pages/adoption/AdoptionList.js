import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdoptionList.module.css';
import adoptionService from '../../services/adoptionService';
import PagingView from '../../components/common/pagingView';

const AdoptionList = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // 필터 상태
  const [filters, setFilters] = useState({
    region: '',
    type: '',
    gender: '',
    neutered: ''
  });
  
  const navigate = useNavigate();
  const pageSize = 12;

  useEffect(() => {
    fetchAnimals();
  }, [currentPage, filters]);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      let response;
      
      // 필터가 적용되었는지 확인
      const hasFilters = Object.values(filters).some(value => value !== '');
      
      if (hasFilters) {
        response = await adoptionService.searchAnimals(filters, currentPage, pageSize);
      } else {
        response = await adoptionService.getAvailableAnimals(currentPage, pageSize);
      }
      
      setAnimals(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      setError(null);
    } catch (err) {
      console.error('동물 목록 조회 실패:', err);
      setError('동물 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnimalClick = (animalId) => {
    navigate(`/adoption/detail/${animalId}`);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(0); // 필터 변경 시 첫 페이지로
  };

  const handlePageChange = (page) => {
    setCurrentPage(page - 1); // PagingView는 1부터 시작, API는 0부터 시작
  };

  if (loading && animals.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>입양 정보</h1>
        <p className={styles.subtitle}>
          사랑스러운 반려동물들이 새로운 가족을 기다리고 있습니다
        </p>
      </div>

      {/* 필터 섹션 */}
      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label htmlFor="region">지역</label>
          <select
            id="region"
            value={filters.region}
            onChange={(e) => handleFilterChange('region', e.target.value)}
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
          <label htmlFor="type">동물 종류</label>
          <select
            id="type"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">전체</option>
            <option value="개">개</option>
            <option value="고양이">고양이</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="gender">성별</label>
          <select
            id="gender"
            value={filters.gender}
            onChange={(e) => handleFilterChange('gender', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">전체</option>
            <option value="M">수컷</option>
            <option value="F">암컷</option>
            <option value="Q">미상</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="neutered">중성화</label>
          <select
            id="neutered"
            value={filters.neutered}
            onChange={(e) => handleFilterChange('neutered', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">전체</option>
            <option value="Y">완료</option>
            <option value="N">미완료</option>
            <option value="U">미상</option>
          </select>
        </div>
      </div>

      {/* 결과 요약 */}
      <div className={styles.resultSummary}>
        총 <span className={styles.count}>{totalElements}</span>마리의 동물이 새로운 가족을 기다리고 있습니다
      </div>

      {/* 동물 목록 */}
      {error ? (
        <div className={styles.error}>{error}</div>
      ) : animals.length === 0 ? (
        <div className={styles.noData}>
          조건에 맞는 동물이 없습니다.
        </div>
      ) : (
        <div className={styles.animalGrid}>
          {animals.map((animal) => (
            <div
              key={animal.animalId}
              className={styles.animalCard}
              onClick={() => handleAnimalClick(animal.animalId)}
            >
              <div className={styles.imageWrapper}>
                <img
                  src={animal.imageUrl || '/default-animal.svg'}
                  alt={animal.kindCd}
                  className={styles.animalImage}
                  onError={(e) => {
                    e.target.src = '/default-animal.svg';
                  }}
                />
                <div className={styles.statusBadge}>
                  {animal.processState}
                </div>
              </div>

              <div className={styles.animalInfo}>
                <h3 className={styles.animalBreed}>{animal.kindCd}</h3>
                <div className={styles.animalDetails}>
                  <span className={styles.gender}>
                    {animal.sexCd === 'M' ? '수컷' : animal.sexCd === 'F' ? '암컷' : '미상'}
                  </span>
                  {animal.age && <span className={styles.age}>{animal.age}</span>}
                  {animal.weight && <span className={styles.weight}>{animal.weight}</span>}
                </div>
                <p className={styles.shelterName}>{animal.careNm}</p>
                <p className={styles.location}>{animal.careAddr}</p>
                {animal.happenDate && (
                  <p className={styles.date}>발견일: {animal.happenDate}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 페이징 */}
      {totalPages > 0 && (
        <PagingView
          pageGroupSize={10}
          totalCount={totalElements}
          currentPage={currentPage + 1} // PagingView는 1부터 시작
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default AdoptionList;