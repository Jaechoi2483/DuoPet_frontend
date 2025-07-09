// src/pages/health/HospitalVisit.js
import React, { useState } from 'react';
import styles from './HospitalVisit.module.css';
import Modal from '../../components/common/Modal'; // 1. 공용 모달 컴포넌트 가져오기

const HospitalVisit = ({ pet }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visits, setVisits] = useState([
    {
      id: 1,
      hospital: '서울 반려동물 병원',
      vet: '김수의사',
      date: '2024-12-15',
      reason: '정기 건강검진',
      diagnosis: '전반적으로 건강한 상태, 체중 관리 필요',
      treatment: '건강검진, 혈액검사',
      cost: 150000,
    },
    {
      id: 2,
      hospital: '서울 반려동물 병원',
      vet: '이수의사',
      date: '2024-11-20',
      reason: '광견병 예방접종',
      diagnosis: '건강 상태 양호',
      treatment: '광견병 백신 접종',
      cost: 35000,
    },
  ]);
  const [formData, setFormData] = useState({
    hospital: '',
    vet: '',
    date: '',
    reason: '',
    diagnosis: '',
    treatment: '',
    cost: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.hospital || !formData.date || !formData.reason) {
      alert('병원명, 방문일, 방문 사유를 입력해주세요.');
      return;
    }
    const newVisit = {
      id: visits.length + 1,
      ...formData,
      cost: parseInt(formData.cost) || 0,
    };
    setVisits((prev) => [newVisit, ...prev]);
    setIsModalOpen(false);
    setFormData({
      hospital: '',
      vet: '',
      date: '',
      reason: '',
      diagnosis: '',
      treatment: '',
      cost: '',
    });
    alert('병원 방문 기록이 추가되었습니다.');
  };

  const totalCost = visits.reduce((acc, visit) => acc + (visit.cost || 0), 0);

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
            <strong>{visits[0]?.date}</strong>
          </div>
        </div>

        {/* 방문 기록 리스트 (카드 형태) */}
        <div className={styles.visitList}>
          {visits.map((visit) => (
            <div key={visit.id} className={styles.visitItem}>
              <div className={styles.visitHeader}>
                <span className={styles.hospitalName}>{visit.hospital}</span>
                <span className={styles.visitDate}>{visit.date}</span>
              </div>
              <div className={styles.visitBody}>
                <p>
                  <strong>방문 사유:</strong> {visit.reason}
                </p>
                <p>
                  <strong>담당 수의사:</strong> {visit.vet}
                </p>
                <p>
                  <strong>진단 내용:</strong> {visit.diagnosis}
                </p>
                <p>
                  <strong>치료 내용:</strong> {visit.treatment}
                </p>
              </div>
              <div className={styles.visitFooter}>
                <span>비용:</span>
                <span className={styles.cost}>
                  {visit.cost.toLocaleString()}원
                </span>
              </div>
            </div>
          ))}
        </div>
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
                name="hospital"
                value={formData.hospital}
                onChange={handleInputChange}
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>담당 수의사</label>
              <input
                name="vet"
                value={formData.vet}
                onChange={handleInputChange}
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>방문일</label>
              <input
                type="date"
                name="date"
                value={formData.date}
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
              name="reason"
              value={formData.reason}
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
    </>
  );
};

export default HospitalVisit;
