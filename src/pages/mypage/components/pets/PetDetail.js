import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPetDetail, getPetImageUrl, deletePet } from '../../../../api/petApi';
import { getHospitalVisitsByPet } from '../../../../api/hospitalVisitApi';
import { getVaccinationsByPet } from '../../../../api/vaccinationApi';
import styles from './PetDetail.module.css';

const PetDetail = () => {
  const navigate = useNavigate();
  const { petId } = useParams();
  
  const [petData, setPetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);

  useEffect(() => {
    fetchPetDetail();
    fetchMedicalRecords();
  }, [petId]);

  const fetchPetDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPetDetail(petId);
      
      // 데이터 구조 변환
      const transformedData = {
        id: data.petId,
        name: data.petName,
        species: data.animalType,
        breed: data.breed,
        gender: data.gender === 'M' ? '수컷' : '암컷',
        age: data.age,
        weight: data.weight,
        neutered: data.neutered === 'Y',
        description: '',  // 백엔드에 설명 필드가 없음
        image: data.renameFilename ? getPetImageUrl(data.renameFilename) : null,
        registeredDate: data.registrationDate,
        lastModified: data.registrationDate  // 수정일 필드가 없음
      };
      
      setPetData(transformedData);
    } catch (err) {
      console.error('Failed to fetch pet detail:', err);
      setError('반려동물 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalRecords = async () => {
    try {
      // 병원 방문 기록과 예방접종 기록을 모두 가져와서 합치기
      const [visitRecords, vaccinationRecords] = await Promise.all([
        getHospitalVisitsByPet(petId).catch(() => []),
        getVaccinationsByPet(petId).catch(() => [])
      ]);

      // 병원 방문 기록 변환
      const transformedVisits = visitRecords.map(visit => ({
        id: `visit-${visit.visitId}`,
        date: visit.visitDate,
        type: '병원 방문',
        description: `${visit.visitReason} - ${visit.diagnosis || '진단 없음'}`,
        hospital: visit.hospitalName || '장소 정보 없음',
        notes: visit.treatment
      }));

      // 예방접종 기록 변환
      const transformedVaccinations = vaccinationRecords.map(vaccination => ({
        id: `vacc-${vaccination.vaccinationId}`,
        date: vaccination.administeredDate || vaccination.scheduledDate,
        type: '예방접종',
        description: vaccination.vaccineName,
        hospital: vaccination.hospitalName || '장소 정보 없음',
        notes: vaccination.description
      }));

      // 합쳐서 날짜순으로 정렬
      const allRecords = [...transformedVisits, ...transformedVaccinations]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setMedicalRecords(allRecords);
    } catch (err) {
      console.error('Failed to fetch medical records:', err);
      // 에러가 발생해도 빈 배열로 설정 (UI가 깨지지 않도록)
      setMedicalRecords([]);
    }
  };

  const handleEdit = () => {
    navigate(`/mypage/pet/${petId}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm(`정말로 ${petData.name}의 정보를 삭제하시겠습니까?`)) {
      try {
        await deletePet(petId);
        alert('반려동물 정보가 삭제되었습니다.');
        navigate('/mypage', { state: { activeTab: 'pets' } });
      } catch (error) {
        console.error('반려동물 삭제 실패:', error);
        alert('반려동물 정보 삭제에 실패했습니다.');
      }
    }
  };

  const handleBack = () => {
    navigate('/mypage', { state: { activeTab: 'pets' } });
  };

  if (loading) {
    return (
      <div className={styles.contentWrapper}>
        <div className={styles.detailContainer}>
          <div className={styles.loadingState}>
            <p>반려동물 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !petData) {
    return (
      <div className={styles.contentWrapper}>
        <div className={styles.detailContainer}>
          <div className={styles.errorState}>
            <p>{error || '반려동물 정보를 찾을 수 없습니다.'}</p>
            <button onClick={handleBack} className={styles.backButton}>
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                <div className={styles.medicalHeader}>
                  <div className={styles.headerDate}>날짜</div>
                  <div className={styles.headerType}>구분</div>
                  <div className={styles.headerDesc}>내용</div>
                  <div className={styles.headerHospital}>장소</div>
                </div>
                {medicalRecords.map(record => (
                  <div key={record.id} className={styles.medicalItem}>
                    <div className={styles.medicalDate}>{record.date}</div>
                    <div className={styles.medicalType}>{record.type}</div>
                    <div className={styles.medicalDesc}>
                      <div className={styles.medicalMainDesc}>{record.description}</div>
                      {record.notes && <div className={styles.medicalSubDesc}>{record.notes}</div>}
                    </div>
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