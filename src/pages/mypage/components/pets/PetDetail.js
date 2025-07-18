import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './PetDetail.module.css';

const PetDetail = () => {
  const navigate = useNavigate();
  const { petId } = useParams();
  
  // 임시 반려동물 상세 데이터 (실제로는 API에서 가져와야 함)
  const [petData, setPetData] = useState({
    id: 1,
    name: '코코',
    species: '강아지',
    breed: '말티즈',
    gender: '암컷',
    age: 3,
    weight: 4.5,
    neutered: true,
    description: '매우 활발하고 사람을 좋아합니다. 산책을 좋아하며 다른 강아지들과도 잘 어울립니다.',
    image: null,
    registeredDate: '2024-01-15',
    lastModified: '2024-06-20'
  });

  // 의료 기록 (추후 확장 가능)
  const [medicalRecords] = useState([
    {
      id: 1,
      date: '2024-06-15',
      type: '예방접종',
      description: 'DHPPL 종합백신',
      hospital: '행복한 동물병원'
    },
    {
      id: 2,
      date: '2024-05-20',
      type: '건강검진',
      description: '정기 건강검진 - 이상없음',
      hospital: '사랑 동물병원'
    }
  ]);

  useEffect(() => {
    // 실제로는 petId를 사용하여 API 호출
    console.log('반려동물 ID:', petId);
  }, [petId]);

  const handleEdit = () => {
    navigate(`/mypage/pet/${petId}/edit`);
  };

  const handleDelete = () => {
    if (window.confirm(`정말로 ${petData.name}의 정보를 삭제하시겠습니까?`)) {
      // 실제로는 API 호출하여 삭제
      console.log('반려동물 삭제:', petId);
      alert('반려동물 정보가 삭제되었습니다.');
      navigate('/mypage', { state: { activeTab: 'pets' } });
    }
  };

  const handleBack = () => {
    navigate('/mypage', { state: { activeTab: 'pets' } });
  };

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.detailContainer}>
          <div className={styles.header}>
            <h1 className={styles.pageTitle}>{petData.name}의 정보</h1>
            <button className={styles.backButton} onClick={handleBack}>
              ← 목록으로
            </button>
          </div>

          <div className={styles.mainContent}>
            <div className={styles.imageSection}>
              {petData.image ? (
                <img 
                  src={petData.image} 
                  alt={petData.name} 
                  className={styles.petImage}
                />
              ) : (
                <div className={styles.defaultImage}>
                  {petData.species === '강아지' ? '🐕' : '🐈'}
                </div>
              )}
            </div>

            <div className={styles.infoSection}>
              <h2 className={styles.sectionTitle}>기본 정보</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>이름</label>
                  <span className={styles.infoValue}>{petData.name}</span>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>종류</label>
                  <span className={styles.infoValue}>{petData.species}</span>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>품종</label>
                  <span className={styles.infoValue}>{petData.breed}</span>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>성별</label>
                  <span className={styles.infoValue}>{petData.gender}</span>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>나이</label>
                  <span className={styles.infoValue}>{petData.age}살</span>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>몸무게</label>
                  <span className={styles.infoValue}>{petData.weight}kg</span>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>중성화</label>
                  <span className={styles.infoValue}>
                    {petData.neutered ? '완료' : '미완료'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>등록일</label>
                  <span className={styles.infoValue}>{petData.registeredDate}</span>
                </div>
              </div>

              {petData.description && (
                <div className={styles.descriptionSection}>
                  <h3 className={styles.subTitle}>특이사항</h3>
                  <p className={styles.description}>{petData.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.medicalSection}>
            <h2 className={styles.sectionTitle}>의료 기록</h2>
            {medicalRecords.length > 0 ? (
              <div className={styles.medicalList}>
                {medicalRecords.map(record => (
                  <div key={record.id} className={styles.medicalItem}>
                    <div className={styles.medicalDate}>{record.date}</div>
                    <div className={styles.medicalType}>{record.type}</div>
                    <div className={styles.medicalDesc}>{record.description}</div>
                    <div className={styles.medicalHospital}>{record.hospital}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noRecords}>등록된 의료 기록이 없습니다.</p>
            )}
          </div>

          <div className={styles.actionButtons}>
            <button 
              className={styles.editButton}
              onClick={handleEdit}
            >
              정보 수정
            </button>
            <button 
              className={styles.deleteButton}
              onClick={handleDelete}
            >
              삭제
            </button>
          </div>
        </div>
      </div>
  );
};

export default PetDetail;