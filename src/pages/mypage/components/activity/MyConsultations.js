import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MyConsultations.module.css';

const MyConsultations = () => {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  // 임시 데이터 (실제로는 API에서 가져와야 함)
  useEffect(() => {
    const mockConsultations = [
      {
        id: 1,
        expertName: '김수의사',
        expertTitle: '반려동물 행동 전문가',
        petName: '코코',
        consultationType: '행동 상담',
        status: 'completed',
        requestDate: '2024-06-15',
        completedDate: '2024-06-16',
        summary: '강아지 분리불안 증상에 대한 상담',
        price: 30000
      },
      {
        id: 2,
        expertName: '박영양사',
        expertTitle: '반려동물 영양 전문가',
        petName: '초코',
        consultationType: '영양 상담',
        status: 'ongoing',
        requestDate: '2024-06-18',
        completedDate: null,
        summary: '고양이 다이어트 식단 상담',
        price: 25000
      },
      {
        id: 3,
        expertName: '이훈련사',
        expertTitle: '반려견 훈련 전문가',
        petName: '코코',
        consultationType: '훈련 상담',
        status: 'pending',
        requestDate: '2024-06-20',
        completedDate: null,
        summary: '기본 훈련 및 사회화 교육',
        price: 40000
      }
    ];
    
    setConsultations(mockConsultations);
  }, []);

  const handleConsultationClick = (consultation) => {
    // 상담 상세 페이지로 이동 (추후 구현)
    console.log('상담 상세:', consultation.id);
    // navigate(`/consultation/${consultation.id}`);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return '대기중';
      case 'ongoing':
        return '진행중';
      case 'completed':
        return '완료';
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'ongoing':
        return styles.statusOngoing;
      case 'completed':
        return styles.statusCompleted;
      default:
        return '';
    }
  };

  const filteredConsultations = filterStatus === 'all' 
    ? consultations 
    : consultations.filter(c => c.status === filterStatus);

  return (
    <div className={styles.consultationsContainer}>
      <div className={styles.filterSection}>
        <button
          className={`${styles.filterButton} ${filterStatus === 'all' ? styles.active : ''}`}
          onClick={() => handleFilterChange('all')}
        >
          전체
        </button>
        <button
          className={`${styles.filterButton} ${filterStatus === 'pending' ? styles.active : ''}`}
          onClick={() => handleFilterChange('pending')}
        >
          대기중
        </button>
        <button
          className={`${styles.filterButton} ${filterStatus === 'ongoing' ? styles.active : ''}`}
          onClick={() => handleFilterChange('ongoing')}
        >
          진행중
        </button>
        <button
          className={`${styles.filterButton} ${filterStatus === 'completed' ? styles.active : ''}`}
          onClick={() => handleFilterChange('completed')}
        >
          완료
        </button>
      </div>

      {filteredConsultations.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>
            {filterStatus === 'all' 
              ? '상담 내역이 없습니다.' 
              : `${getStatusLabel(filterStatus)} 상담이 없습니다.`}
          </p>
        </div>
      ) : (
        <div className={styles.consultationList}>
          {filteredConsultations.map(consultation => (
            <div 
              key={consultation.id} 
              className={styles.consultationItem}
              onClick={() => handleConsultationClick(consultation)}
            >
              <div className={styles.consultationHeader}>
                <div className={styles.expertInfo}>
                  <h4 className={styles.expertName}>{consultation.expertName}</h4>
                  <p className={styles.expertTitle}>{consultation.expertTitle}</p>
                </div>
                <span className={`${styles.status} ${getStatusClass(consultation.status)}`}>
                  {getStatusLabel(consultation.status)}
                </span>
              </div>

              <div className={styles.consultationBody}>
                <div className={styles.consultationInfo}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>반려동물</span>
                    <span className={styles.infoValue}>{consultation.petName}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>상담 유형</span>
                    <span className={styles.infoValue}>{consultation.consultationType}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>신청일</span>
                    <span className={styles.infoValue}>{consultation.requestDate}</span>
                  </div>
                  {consultation.completedDate && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>완료일</span>
                      <span className={styles.infoValue}>{consultation.completedDate}</span>
                    </div>
                  )}
                </div>
                
                <p className={styles.consultationSummary}>{consultation.summary}</p>
                
                <div className={styles.consultationFooter}>
                  <span className={styles.price}>
                    {consultation.price.toLocaleString()}원
                  </span>
                  {consultation.status === 'completed' && (
                    <button className={styles.reviewButton}>
                      후기 작성
                    </button>
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

export default MyConsultations;