
// src/pages/health/HospitalVisit.js
import React, { useState } from 'react';
import styles from './HospitalVisit.module.css';

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
      cost: 150000
    },
    {
      id: 2,
      hospital: '서울 반려동물 병원',
      vet: '이수의사',
      date: '2024-11-20',
      reason: '광견병 예방접종',
      diagnosis: '건강 상태 양호',
      treatment: '광견병 백신 접종',
      cost: 35000
    }
  ]);
  const [formData, setFormData] = useState({ 
    hospital: '', vet: '', date: '', reason: '', 
    diagnosis: '', treatment: '', cost: '' 
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.hospital || !formData.date || !formData.reason) {
      alert('병원명, 방문일, 방문 사유를 입력해주세요.');
      return;
    }
    const newVisit = { id: visits.length + 1, ...formData, cost: parseInt(formData.cost) };
    setVisits(prev => [newVisit, ...prev]);
    setIsModalOpen(false);
    setFormData({ hospital: '', vet: '', date: '', reason: '', diagnosis: '', treatment: '', cost: '' });
    alert('병원 방문 기록이 추가되었습니다.');
  };

  const totalCost = visits.reduce((acc, visit) => acc + visit.cost, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>병원 방문 기록</h3>
        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>+ 방문 기록 추가</button>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryItem}>총 방문 횟수: <strong>{visits.length}회</strong></div>
        <div className={styles.summaryItem}>총 치료비: <strong>{totalCost.toLocaleString()}원</strong></div>
        <div className={styles.summaryItem}>마지막 방문: <strong>{visits[0]?.date}</strong></div>
      </div>

      <div className={styles.visitList}>
        {visits.map(visit => (
          <div key={visit.id} className={styles.visitItem}>
            <div className={styles.visitHeader}>
              <span className={styles.hospitalName}>{visit.hospital}</span>
              <span className={styles.visitDate}>{visit.date}</span>
            </div>
            <div className={styles.visitBody}>
              <p><strong>방문 사유:</strong> {visit.reason}</p>
              <p><strong>담당 수의사:</strong> {visit.vet}</p>
              <p><strong>진단 내용:</strong> {visit.diagnosis}</p>
              <p><strong>치료 내용:</strong> {visit.treatment}</p>
              <p><strong>비용:</strong> {visit.cost.toLocaleString()}원</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>병원 방문 기록 추가</h4>
              <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className={styles.modalContent}>
              <input name="hospital" value={formData.hospital} onChange={handleInputChange} placeholder="병원명" className={styles.formInput} />
              <input name="vet" value={formData.vet} onChange={handleInputChange} placeholder="담당 수의사" className={styles.formInput} />
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} className={styles.formInput} />
              <input name="reason" value={formData.reason} onChange={handleInputChange} placeholder="방문 사유" className={styles.formInput} />
              <textarea name="diagnosis" value={formData.diagnosis} onChange={handleInputChange} placeholder="진단 내용" className={styles.formTextarea}></textarea>
              <textarea name="treatment" value={formData.treatment} onChange={handleInputChange} placeholder="치료 내용" className={styles.formTextarea}></textarea>
              <input type="number" name="cost" value={formData.cost} onChange={handleInputChange} placeholder="비용 (원)" className={styles.formInput} />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.saveButton} onClick={handleSubmit}>저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalVisit;
