import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './AdoptionDetail.module.css';
import adoptionService from '../../services/adoptionService';

const AdoptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchAnimalDetail();
  }, [id]);

  const fetchAnimalDetail = async () => {
    try {
      setLoading(true);
      const data = await adoptionService.getAnimalDetail(id);
      setAnimal(data);
      setError(null);
    } catch (err) {
      console.error('동물 상세 정보 조회 실패:', err);
      setError('동물 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/adoption');
  };

  const handleInquiry = () => {
    // 보호소 문의 기능 구현
    if (animal?.shelterTel) {
      window.location.href = `tel:${animal.shelterTel}`;
    } else {
      alert('보호소 연락처가 없습니다.');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          {error || '동물 정보를 찾을 수 없습니다.'}
          <button onClick={handleBack} className={styles.backButton}>
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button onClick={handleBack} className={styles.backLink}>
        ← 목록으로 돌아가기
      </button>

      <div className={styles.detailCard}>
        <div className={styles.imageSection}>
          <div className={styles.mainImage}>
            <img
              src={!imageError && animal.imageUrl ? animal.imageUrl : '/default-animal.svg'}
              alt={animal.kindCd}
              onError={() => setImageError(true)}
              className={styles.image}
            />
            <span className={styles.statusBadge}>{animal.processState}</span>
          </div>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.basicInfo}>
            <h1 className={styles.breed}>{animal.kindCd || animal.breed || '품종 정보 없음'}</h1>
            <div className={styles.tags}>
              <span className={styles.tag}>
                <span className={styles.icon}>👤</span>
                {animal.sexCd === 'M' ? '수컷' : animal.sexCd === 'F' ? '암컷' : '미상'}
              </span>
              {animal.age !== null && animal.age !== undefined && (
                <span className={styles.tag}>
                  <span className={styles.icon}>🎂</span>
                  {animal.age === 0 ? '1살 미만' : `${animal.age}살`}
                </span>
              )}
              {animal.weight && (
                <span className={styles.tag}>
                  <span className={styles.icon}>⚖️</span>
                  {animal.weight}kg
                </span>
              )}
              <span className={styles.tag}>
                <span className={styles.icon}>✂️</span>
                중성화 {animal.neuterYn === 'Y' ? '완료' : animal.neuterYn === 'N' ? '미완료' : '미상'}
              </span>
            </div>
          </div>

          <div className={styles.detailInfo}>
            <h2 className={styles.sectionTitle}>기본 정보</h2>
            <dl className={styles.infoList}>
              <div className={styles.infoItem}>
                <dt>발견 장소</dt>
                <dd>{animal.happenPlace || '정보 없음'}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>발견 날짜</dt>
                <dd>{animal.happenDate || '정보 없음'}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>특징</dt>
                <dd>{animal.specialMark || '특별한 특징이 없습니다.'}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>품종</dt>
                <dd>{animal.kindCd || animal.breed || '정보 없음'}</dd>
              </div>
            </dl>
          </div>

          <div className={styles.shelterInfo}>
            <h2 className={styles.sectionTitle}>보호소 정보</h2>
            <dl className={styles.infoList}>
              <div className={styles.infoItem}>
                <dt>보호소명</dt>
                <dd>{animal.shelterName || '정보 없음'}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>보호소 주소</dt>
                <dd>{animal.shelterAddress || '정보 없음'}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>연락처</dt>
                <dd>{animal.shelterPhone || '정보 없음'}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>관할 기관</dt>
                <dd>{animal.orgNm || '정보 없음'}</dd>
              </div>
            </dl>
          </div>

          <div className={styles.actionButtons}>
            <button onClick={handleInquiry} className={styles.primaryButton}>
              입양 문의하기
            </button>
            <button className={styles.secondaryButton}>
              관심 동물 등록
            </button>
          </div>

          <div className={styles.notice}>
            <p>
              <strong>안내사항:</strong> 입양을 희망하시는 경우, 해당 보호소로 직접 문의해 주시기 바랍니다.
              보호 동물의 상태와 입양 가능 여부는 수시로 변경될 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdoptionDetail;