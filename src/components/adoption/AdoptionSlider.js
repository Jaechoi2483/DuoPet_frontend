import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdoptionSlider.module.css';
import adoptionService from '../../services/adoptionService';

const AdoptionSlider = () => {
  const [animals, setAnimals] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // useRef를 사용하여 인터벌 및 타임아웃 ID를 저장합니다.
  // 이 값들은 리렌더링 되어도 초기화되지 않습니다.
  const autoSlideInterval = useRef(null);
  const pauseTimeout = useRef(null);

  useEffect(() => {
    const fetchFeaturedAnimals = async () => {
      try {
        setLoading(true);
        const data = await adoptionService.getFeaturedAnimals(10);
        setAnimals(data);
        setError(null);
      } catch (err) {
        console.error('입양 동물 데이터 로드 실패:', err);
        setError('입양 동물 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedAnimals();
  }, []);

  // 다음 슬라이드로 이동하는 함수 (useCallback으로 불필요한 재생성 방지)
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= animals.length - 1 ? 0 : prev + 1));
  }, [animals.length]);

  // 자동 슬라이드를 시작하는 함수
  const startAutoSlide = useCallback(() => {
    stopAutoSlide(); // 기존 인터벌이 있다면 정리
    autoSlideInterval.current = setInterval(handleNext, 3000); // 3초마다 handleNext 호출
  }, [handleNext]);

  // 자동 슬라이드를 멈추는 함수
  const stopAutoSlide = () => {
    clearInterval(autoSlideInterval.current);
  };

  // 컴포넌트 마운트, 언마운트 및 animal 데이터 변경 시 자동 슬라이드 관리
  useEffect(() => {
    if (animals.length > 0) {
      startAutoSlide();
    }
    // 컴포넌트가 언마운트될 때 모든 타이머를 정리합니다 (메모리 누수 방지)
    return () => {
      stopAutoSlide();
      clearTimeout(pauseTimeout.current);
    };
  }, [animals.length, startAutoSlide]);

  // 이전 버튼 클릭 핸들러
  const handlePreviousClick = () => {
    stopAutoSlide(); // 자동 슬라이드 멈춤
    clearTimeout(pauseTimeout.current); // 기존 일시정지 타임아웃이 있다면 초기화

    setCurrentIndex((prev) => (prev === 0 ? animals.length - 1 : prev - 1));

    // 5초 후에 자동 슬라이드를 다시 시작합니다.
    pauseTimeout.current = setTimeout(startAutoSlide, 5000);
  };

  // 다음 버튼 클릭 핸들러
  const handleNextClick = () => {
    stopAutoSlide();
    clearTimeout(pauseTimeout.current);

    handleNext(); // 다음 슬라이드로 즉시 이동

    pauseTimeout.current = setTimeout(startAutoSlide, 5000);
  };

  const handleAnimalClick = (animalId) => {
    navigate(`/adoption/detail/${animalId}`);
  };

  const handleViewAll = () => {
    navigate('/adoption');
  };

  if (loading) {
    return (
      <div className={styles.sliderContainer}>
        <div className={styles.loading}>입양 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error || animals.length === 0) {
    return (
      <div className={styles.sliderContainer}>
        <div className={styles.error}>
          {error || '표시할 입양 동물이 없습니다.'}
        </div>
      </div>
    );
  }

  // 현재 표시할 동물들 (3개씩 표시)
  const displayAnimals = [];
  for (let i = 0; i < 3; i++) {
    // 3개 미만일 경우를 대비하여 animals.length가 0이 아닐 때만 실행
    if (animals.length > 0) {
      const index = (currentIndex + i) % animals.length;
      displayAnimals.push(animals[index]);
    }
  }

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>사랑을 기다리는 아이들</h2>
        <button className={styles.viewAllBtn} onClick={handleViewAll}>
          전체보기 →
        </button>
      </div>

      <div className={styles.sliderWrapper}>
        <button
          className={styles.navButton}
          onClick={handlePreviousClick} // 수정된 핸들러 연결
          aria-label="이전"
        >
          ‹
        </button>

        <div className={styles.animalCards}>
          {displayAnimals.map((animal, idx) => (
            <div
              key={`${animal.animalId}-${idx}`}
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
                <div className={styles.statusBadge}>{animal.processState}</div>
              </div>

              <div className={styles.animalInfo}>
                <h3 className={styles.animalBreed}>{animal.kindCd}</h3>
                <p className={styles.animalDetails}>
                  {animal.sexCd === 'M'
                    ? '수컷'
                    : animal.sexCd === 'F'
                      ? '암컷'
                      : '미상'}
                  {animal.age && ` · ${animal.age}`}
                </p>
                <p className={styles.shelterInfo}>{animal.careNm}</p>
                <p className={styles.location}>{animal.careAddr}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          className={styles.navButton}
          onClick={handleNextClick} // 수정된 핸들러 연결
          aria-label="다음"
        >
          ›
        </button>
      </div>

      {/* 인디케이터 로직은 현재 1개씩 이동하는 기준으로 변경됩니다. */}
      <div className={styles.indicators}>
        {animals.map((_, idx) => (
          <span
            key={idx}
            className={`${styles.indicator} ${
              currentIndex === idx ? styles.active : ''
            }`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default AdoptionSlider;
