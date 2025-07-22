// src/pages/health/HospitalVisit.js
import React, { useState, useEffect } from 'react';
import styles from './HospitalVisit.module.css';
import Modal from '../../components/common/Modal';
import {
  createHospitalVisit,
  getHospitalVisitsByPet,
  updateHospitalVisit,
  deleteHospitalVisit
} from '../../api/hospitalVisitApi';

const HospitalVisit = ({ pet }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 페이징 관련 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [formData, setFormData] = useState({
    hospitalName: '',
    veterinarian: '',
    visitDate: '',
    visitReason: '',
    diagnosis: '',
    treatment: '',
    cost: '',
  });

  // 병원 방문 기록 조회
  useEffect(() => {
    if (pet?.petId) {
      fetchVisits();
    }
  }, [pet]);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const data = await getHospitalVisitsByPet(pet.petId);
      setVisits(data);
    } catch (error) {
      console.error('병원 방문 기록 조회 실패:', error);
      alert('병원 방문 기록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.hospitalName || !formData.visitDate || !formData.visitReason) {
      alert('병원명, 방문일, 방문 사유를 입력해주세요.');
      return;
    }

    try {
      const visitData = {
        petId: pet.petId,
        hospitalName: formData.hospitalName,
        veterinarian: formData.veterinarian || null,
        visitDate: formData.visitDate,
        visitReason: formData.visitReason,
        diagnosis: formData.diagnosis || null,
        treatment: formData.treatment || null,
        cost: formData.cost ? parseFloat(formData.cost) : null,
      };

      await createHospitalVisit(visitData);
      alert('병원 방문 기록이 추가되었습니다.');
      setIsModalOpen(false);
      setFormData({
        hospitalName: '',
        veterinarian: '',
        visitDate: '',
        visitReason: '',
        diagnosis: '',
        treatment: '',
        cost: '',
      });
      fetchVisits();
    } catch (error) {
      console.error('병원 방문 기록 추가 실패:', error);
      alert('병원 방문 기록 추가에 실패했습니다.');
    }
  };

  // 병원 방문 기록 클릭 시 상세 보기
  const handleVisitClick = (visit) => {
    setSelectedVisit(visit);
    setIsDetailModalOpen(true);
    setIsEditMode(false);
  };

  // 수정 모드로 전환
  const handleEditClick = () => {
    setIsEditMode(true);
    setFormData({
      hospitalName: selectedVisit.hospitalName,
      veterinarian: selectedVisit.veterinarian || '',
      visitDate: selectedVisit.visitDate,
      visitReason: selectedVisit.visitReason,
      diagnosis: selectedVisit.diagnosis || '',
      treatment: selectedVisit.treatment || '',
      cost: selectedVisit.cost || '',
    });
  };

  // 병원 방문 기록 수정
  const handleUpdate = async () => {
    if (!formData.hospitalName || !formData.visitDate || !formData.visitReason) {
      alert('병원명, 방문일, 방문 사유를 입력해주세요.');
      return;
    }

    try {
      const updateData = {
        petId: pet.petId,
        hospitalName: formData.hospitalName,
        veterinarian: formData.veterinarian || null,
        visitDate: formData.visitDate,
        visitReason: formData.visitReason,
        diagnosis: formData.diagnosis || null,
        treatment: formData.treatment || null,
        cost: formData.cost ? parseFloat(formData.cost) : null,
      };

      await updateHospitalVisit(selectedVisit.visitId, updateData);
      alert('병원 방문 기록이 수정되었습니다.');
      setIsDetailModalOpen(false);
      setIsEditMode(false);
      fetchVisits();
    } catch (error) {
      console.error('병원 방문 기록 수정 실패:', error);
      alert('병원 방문 기록 수정에 실패했습니다.');
    }
  };

  // 병원 방문 기록 삭제
  const handleDelete = async () => {
    if (!window.confirm('정말로 이 병원 방문 기록을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteHospitalVisit(selectedVisit.visitId);
      alert('병원 방문 기록이 삭제되었습니다.');
      setIsDetailModalOpen(false);
      fetchVisits();
    } catch (error) {
      console.error('병원 방문 기록 삭제 실패:', error);
      alert('병원 방문 기록 삭제에 실패했습니다.');
    }
  };

  // 페이징 계산
  const totalPages = Math.ceil(visits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVisits = [...visits].reverse().slice(startIndex, endIndex);

  const totalCost = visits.reduce((acc, visit) => acc + (parseFloat(visit.cost) || 0), 0);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>병원 방문 기록</h3>
          <button
            className={styles.addButton}
            onClick={() => setIsModalOpen(true)}
          >
            + 방문 기록 추가
          </button>
        </div>

        {/* 상단 요약 정보 */}
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span>총 방문 횟수</span>
            <strong>{visits.length}회</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>총 치료비</span>
            <strong>{totalCost.toLocaleString()}원</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>마지막 방문</span>
            <strong>{visits.length > 0 ? visits[visits.length - 1]?.visitDate : '-'}</strong>
          </div>
        </div>

        {/* 방문 기록 리스트 (카드 형태) */}
        {loading ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : visits.length === 0 ? (
          <div className={styles.emptyState}>
            <p>아직 병원 방문 기록이 없습니다.</p>
            <p>위의 "방문 기록 추가" 버튼을 눌러 기록을 추가해보세요.</p>
          </div>
        ) : (
          <div className={styles.visitList}>
            {paginatedVisits.map((visit) => (
              <div 
                key={visit.visitId} 
                className={styles.visitItem}
                onClick={() => handleVisitClick(visit)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.visitHeader}>
                  <span className={styles.hospitalName}>{visit.hospitalName}</span>
                  <span className={styles.visitDate}>{visit.visitDate}</span>
                </div>
                <div className={styles.visitBody}>
                  <p>
                    <strong>방문 사유:</strong> {visit.visitReason}
                  </p>
                  <p>
                    <strong>담당 수의사:</strong> {visit.veterinarian || '-'}
                  </p>
                  <p>
                    <strong>진단 내용:</strong> {visit.diagnosis || '-'}
                  </p>
                  <p>
                    <strong>치료 내용:</strong> {visit.treatment || '-'}
                  </p>
                </div>
                <div className={styles.visitFooter}>
                  <span>비용:</span>
                  <span className={styles.cost}>
                    {visit.cost ? parseFloat(visit.cost).toLocaleString() : '0'}원
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* 페이지네이션 */}
        {visits.length > itemsPerPage && (
          <div className={styles.pagination}>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              처음
            </button>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              이전
            </button>
            
            <span className={styles.pageInfo}>
              {currentPage} / {totalPages}
            </span>
            
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              다음
            </button>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              마지막
            </button>
          </div>
        )}
      </div>

      {/* 공용 모달 사용 */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>병원 방문 기록 추가</h2>
        </div>
        <div className={styles.modalContent}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>병원명</label>
              <input
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleInputChange}
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>담당 수의사</label>
              <input
                name="veterinarian"
                value={formData.veterinarian}
                onChange={handleInputChange}
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>방문일</label>
              <input
                type="date"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleInputChange}
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>비용 (원)</label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleInputChange}
                className={styles.formInput}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>방문 사유</label>
            <input
              name="visitReason"
              value={formData.visitReason}
              onChange={handleInputChange}
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>진단 내용</label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleInputChange}
              className={styles.formTextarea}
              rows={3}
            ></textarea>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>치료 내용</label>
            <textarea
              name="treatment"
              value={formData.treatment}
              onChange={handleInputChange}
              className={styles.formTextarea}
              rows={3}
            ></textarea>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.submitButton} onClick={handleSubmit}>
            저장
          </button>
        </div>
      </Modal>

      {/* 병원 방문 기록 상세 보기 모달 */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}>
        {selectedVisit && (
          <>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {isEditMode ? '병원 방문 기록 수정' : '병원 방문 기록 상세'}
              </h2>
            </div>
            <div className={styles.modalContent}>
              {isEditMode ? (
                <>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>병원명</label>
                      <input
                        name="hospitalName"
                        value={formData.hospitalName}
                        onChange={handleInputChange}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>담당 수의사</label>
                      <input
                        name="veterinarian"
                        value={formData.veterinarian}
                        onChange={handleInputChange}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>방문일</label>
                      <input
                        type="date"
                        name="visitDate"
                        value={formData.visitDate}
                        onChange={handleInputChange}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>비용 (원)</label>
                      <input
                        type="number"
                        name="cost"
                        value={formData.cost}
                        onChange={handleInputChange}
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>방문 사유</label>
                    <input
                      name="visitReason"
                      value={formData.visitReason}
                      onChange={handleInputChange}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>진단 내용</label>
                    <textarea
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleInputChange}
                      className={styles.formTextarea}
                      rows={3}
                    ></textarea>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>치료 내용</label>
                    <textarea
                      name="treatment"
                      value={formData.treatment}
                      onChange={handleInputChange}
                      className={styles.formTextarea}
                      rows={3}
                    ></textarea>
                  </div>
                </>
              ) : (
                <div className={styles.detailView}>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <label>병원명</label>
                      <p>{selectedVisit.hospitalName}</p>
                    </div>
                    <div className={styles.detailItem}>
                      <label>담당 수의사</label>
                      <p>{selectedVisit.veterinarian || '-'}</p>
                    </div>
                    <div className={styles.detailItem}>
                      <label>방문일</label>
                      <p>{selectedVisit.visitDate}</p>
                    </div>
                    <div className={styles.detailItem}>
                      <label>비용</label>
                      <p>{selectedVisit.cost ? parseFloat(selectedVisit.cost).toLocaleString() + '원' : '-'}</p>
                    </div>
                  </div>
                  <div className={styles.detailItem}>
                    <label>방문 사유</label>
                    <p>{selectedVisit.visitReason}</p>
                  </div>
                  <div className={styles.detailItem}>
                    <label>진단 내용</label>
                    <p>{selectedVisit.diagnosis || '-'}</p>
                  </div>
                  <div className={styles.detailItem}>
                    <label>치료 내용</label>
                    <p>{selectedVisit.treatment || '-'}</p>
                  </div>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              {isEditMode ? (
                <>
                  <button className={styles.cancelButton} onClick={() => setIsEditMode(false)}>
                    취소
                  </button>
                  <button className={styles.submitButton} onClick={handleUpdate}>
                    저장
                  </button>
                </>
              ) : (
                <>
                  <button className={styles.editButton} onClick={handleEditClick}>
                    수정
                  </button>
                  <button className={styles.deleteButton} onClick={handleDelete}>
                    삭제
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

export default HospitalVisit;
