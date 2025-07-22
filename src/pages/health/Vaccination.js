// src/pages/health/Vaccination.js
import React, { useState, useEffect } from 'react';
import styles from './Vaccination.module.css';
import Modal from '../../components/common/Modal'; // 공용 모달 컴포넌트 사용
import PagingView from '../../components/common/pagingView'; // 페이징 컴포넌트
import { createVaccination, getVaccinationsByPet, updateVaccination, deleteVaccination } from '../../api/vaccinationApi';

const Vaccination = ({ pet }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVaccination, setSelectedVaccination] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    administeredDate: '',
    hospitalName: '',
  });
  
  // 페이징 관련 state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // 페이지당 3개씩 표시

  // 예방접종 목록 조회
  useEffect(() => {
    if (pet?.petId) {
      fetchVaccinations();
    }
  }, [pet]);

  const fetchVaccinations = async () => {
    if (!pet?.petId) return;
    
    try {
      setLoading(true);
      const data = await getVaccinationsByPet(pet.petId);
      setVaccinations(data);
    } catch (error) {
      console.error('예방접종 목록 조회 실패:', error);
      alert('예방접종 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 상세보기 클릭
  const handleVaccinationClick = (vaccination) => {
    setSelectedVaccination(vaccination);
    setIsDetailModalOpen(true);
    setIsEditMode(false);
  };

  // 수정 모드로 전환
  const handleEditClick = () => {
    setFormData({
      name: selectedVaccination.vaccineName,
      date: selectedVaccination.scheduledDate,
      description: selectedVaccination.description || '',
      administeredDate: selectedVaccination.administeredDate || '',
      hospitalName: selectedVaccination.hospitalName || '',
    });
    setIsEditMode(true);
  };

  // 예방접종 삭제
  const handleDeleteVaccination = async () => {
    if (!window.confirm('정말로 이 예방접종 일정을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteVaccination(selectedVaccination.vaccinationId);
      alert('예방접종 일정이 삭제되었습니다.');
      setIsDetailModalOpen(false);
      fetchVaccinations();
    } catch (error) {
      console.error('예방접종 삭제 실패:', error);
      alert('예방접종 삭제에 실패했습니다.');
    }
  };

  // 예방접종 수정
  const handleUpdateVaccination = async () => {
    try {
      const updateData = {
        vaccineName: formData.name,
        scheduledDate: formData.date,
        description: formData.description,
        administeredDate: formData.administeredDate || null,
        hospitalName: formData.hospitalName || null,
      };

      await updateVaccination(selectedVaccination.vaccinationId, updateData);
      alert('예방접종 일정이 수정되었습니다.');
      setIsDetailModalOpen(false);
      setIsEditMode(false);
      fetchVaccinations();
    } catch (error) {
      console.error('예방접종 수정 실패:', error);
      alert('예방접종 수정에 실패했습니다.');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.date) {
      alert('백신명과 예정일을 입력해주세요.');
      return;
    }
    
    if (!pet?.petId) {
      alert('반려동물을 선택해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      
      const vaccinationData = {
        petId: pet.petId,
        vaccineName: formData.name,
        scheduledDate: formData.date,
        description: formData.description,
        administeredDate: formData.administeredDate || null,
        hospitalName: formData.hospitalName || null
      };
      
      await createVaccination(vaccinationData);
      await fetchVaccinations();
      
      setIsModalOpen(false);
      setFormData({ name: '', date: '', description: '', administeredDate: '', hospitalName: '' });
      alert('예방접종 일정이 추가되었습니다.');
    } catch (error) {
      console.error('예방접종 생성 실패:', error);
      alert('예방접종 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 상태 계산 함수
  const getVaccinationStatus = (vaccination) => {
    if (vaccination.administeredDate) {
      return '완료';
    }
    const today = new Date();
    const scheduledDate = new Date(vaccination.scheduledDate);
    if (scheduledDate < today) {
      return '지연';
    }
    return '예정';
  };

  // 날짜순으로 정렬 (예정일 기준 오름차순 - 가까운 날짜부터)
  const sortedVaccinations = [...vaccinations].sort((a, b) => 
    new Date(a.scheduledDate) - new Date(b.scheduledDate)
  );
  
  // 페이징 계산
  const totalPage = Math.ceil(sortedVaccinations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVaccinations = sortedVaccinations.slice(startIndex, endIndex);
  
  // 페이징 그룹 계산
  const pageGroup = Math.ceil(currentPage / 10);
  const startPage = (pageGroup - 1) * 10 + 1;
  const endPage = Math.min(pageGroup * 10, totalPage);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>예방접종 일정</h3>
          <button
            className={styles.addButton}
            onClick={() => setIsModalOpen(true)}
          >
            + 일정 추가
          </button>
        </div>

        {/* JSX 구조를 카드 형태로 완전히 변경 */}
        <div className={styles.listContainer}>
          {loading ? (
            <div className={styles.loading}>예방접종 일정을 불러오는 중...</div>
          ) : sortedVaccinations.length > 0 ? (
            currentVaccinations.length > 0 ? (
              currentVaccinations.map((vax) => {
                const status = getVaccinationStatus(vax);
                return (
                <div 
                  key={vax.vaccinationId} 
                  className={styles.vaccinationItem}
                  onClick={() => handleVaccinationClick(vax)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.itemHeader}>
                    <span className={styles.itemType}>예방접종</span>
                    <span
                      className={`${styles.statusTag} ${
                        styles[status.toLowerCase()]
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  <h4 className={styles.itemName}>{vax.vaccineName}</h4>
                  <div className={styles.itemDetails}>
                    <span className={styles.itemDate}>📅 예정일: {vax.scheduledDate}</span>
                    {vax.administeredDate && (
                      <span className={styles.itemDate}> | ✅ 접종일: {vax.administeredDate}</span>
                    )}
                  </div>
                  {vax.description && (
                    <p className={styles.itemDesc}>{vax.description}</p>
                  )}
                </div>
              );
            })
            ) : (
              <div className={styles.emptyState}>
                <p>현재 페이지에 표시할 예방접종 일정이 없습니다.</p>
              </div>
            )
          ) : (
            <div className={styles.emptyState}>
              <p>등록된 예방접종 일정이 없습니다.</p>
              <p>위의 '일정 추가' 버튼을 눌러 첫 번째 일정을 추가해보세요.</p>
            </div>
          )}
        </div>
        
        {/* 페이징 */}
        {totalPage > 1 && (
          <PagingView
            currentPage={currentPage}
            totalPage={totalPage}
            startPage={startPage}
            endPage={endPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>

      {/* 모달 부분은 이전과 동일하게 공용 모달 사용 */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>예방접종 일정 추가</h2>
        </div>
        <div className={styles.modalContent}>
          <p className={styles.modalSubtitle}>
            새로운 예방접종 일정을 추가하세요.
          </p>
          {/* Form Groups */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>백신명</label>
            <select
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={styles.formSelect}
            >
              <option value="">백신 종류 선택</option>
              <option value="종합백신(DHPPL)">종합백신(DHPPL)</option>
              <option value="코로나 장염">코로나 장염</option>
              <option value="켄넬코프">켄넬코프</option>
              <option value="광견병">광견병</option>
              <option value="심장사상충">심장사상충</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>예정일</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>접종일 (선택)</label>
            <input
              type="date"
              name="administeredDate"
              value={formData.administeredDate}
              onChange={handleInputChange}
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>병원명 (선택)</label>
            <input
              type="text"
              name="hospitalName"
              value={formData.hospitalName}
              onChange={handleInputChange}
              className={styles.formInput}
              placeholder="병원명을 입력하세요"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={styles.formTextarea}
              placeholder="백신에 대한 설명을 입력하세요"
              rows={4}
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.submitButton} onClick={handleSubmit}>
            저장
          </button>
        </div>
      </Modal>

      {/* 예방접종 상세 보기 모달 */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}>
        {selectedVaccination && (
          <>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {isEditMode ? '예방접종 일정 수정' : '예방접종 일정 상세'}
              </h2>
            </div>

            <div className={styles.modalContent}>
              {!isEditMode ? (
                // 상세 보기 모드
                <>
                  <div className={styles.detailGroup}>
                    <span className={styles.detailLabel}>백신명</span>
                    <span className={styles.detailValue}>{selectedVaccination.vaccineName}</span>
                  </div>
                  <div className={styles.detailGroup}>
                    <span className={styles.detailLabel}>예정일</span>
                    <span className={styles.detailValue}>{selectedVaccination.scheduledDate}</span>
                  </div>
                  {selectedVaccination.administeredDate && (
                    <div className={styles.detailGroup}>
                      <span className={styles.detailLabel}>접종일</span>
                      <span className={styles.detailValue}>{selectedVaccination.administeredDate}</span>
                    </div>
                  )}
                  {selectedVaccination.hospitalName && (
                    <div className={styles.detailGroup}>
                      <span className={styles.detailLabel}>병원명</span>
                      <span className={styles.detailValue}>{selectedVaccination.hospitalName}</span>
                    </div>
                  )}
                  {selectedVaccination.description && (
                    <div className={styles.detailGroup}>
                      <span className={styles.detailLabel}>설명</span>
                      <p className={styles.detailContent}>{selectedVaccination.description}</p>
                    </div>
                  )}
                  <div className={styles.detailGroup}>
                    <span className={styles.detailLabel}>상태</span>
                    <span className={`${styles.statusTag} ${styles[getVaccinationStatus(selectedVaccination).toLowerCase()]}`}>
                      {getVaccinationStatus(selectedVaccination)}
                    </span>
                  </div>
                </>
              ) : (
                // 수정 모드
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>백신명</label>
                    <select
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={styles.formSelect}
                    >
                      <option value="">백신 종류 선택</option>
                      <option value="종합백신(DHPPL)">종합백신(DHPPL)</option>
                      <option value="코로나 장염">코로나 장염</option>
                      <option value="켄넬코프">켄넬코프</option>
                      <option value="광견병">광견병</option>
                      <option value="심장사상충">심장사상충</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>예정일</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>접종일</label>
                    <input
                      type="date"
                      name="administeredDate"
                      value={formData.administeredDate}
                      onChange={handleInputChange}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>병원명</label>
                    <input
                      type="text"
                      name="hospitalName"
                      value={formData.hospitalName}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      placeholder="병원명을 입력하세요"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>설명</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className={styles.formTextarea}
                      rows={4}
                    />
                  </div>
                </>
              )}
            </div>

            <div className={styles.modalFooter}>
              {!isEditMode ? (
                <>
                  <button 
                    className={styles.editButton} 
                    onClick={handleEditClick}
                    style={{ position: 'absolute', right: '124px' }}
                  >
                    수정
                  </button>
                  <button 
                    className={styles.deleteButton} 
                    onClick={handleDeleteVaccination}
                    style={{ position: 'absolute', right: '24px' }}
                  >
                    삭제
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className={styles.cancelButton} 
                    onClick={() => setIsEditMode(false)}
                    style={{ marginRight: '10px' }}
                  >
                    취소
                  </button>
                  <button 
                    className={styles.submitButton} 
                    onClick={handleUpdateVaccination}
                  >
                    저장
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default Vaccination;
