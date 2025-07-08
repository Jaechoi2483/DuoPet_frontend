
// src/pages/health/Vaccination.js
import React, { useState } from 'react';
import styles from './Vaccination.module.css';

const Vaccination = ({ pet }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vaccinations, setVaccinations] = useState([
    {
      id: 1,
      name: '켄넬코프 백신',
      description: '기침 예방을 위한 보조 백신',
      date: '2025-02-15',
      status: '예정'
    },
    {
      id: 2,
      name: '심장사상충 예방약',
      description: '월별 심장사상충 예방약 투여',
      date: '2025-01-01',
      status: '지연'
    }
  ]);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.date) {
      alert('백신명과 예정일을 입력해주세요.');
      return;
    }
    const newVaccination = {
      id: vaccinations.length + 1,
      ...formData,
      status: '예정'
    };
    setVaccinations(prev => [...prev, newVaccination]);
    setIsModalOpen(false);
    setFormData({ name: '', date: '', description: '' });
    alert('예방접종 일정이 추가되었습니다.');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>예방접종 일정</h3>
        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>+ 일정 추가</button>
      </div>

      <div className={styles.vaccinationList}>
        {vaccinations.map(vax => (
          <div key={vax.id} className={styles.vaxItem}>
            <div className={`${styles.vaxStatus} ${styles[vax.status.toLowerCase()]}`}>{vax.status}</div>
            <div className={styles.vaxInfo}>
              <div className={styles.vaxName}>{vax.name}</div>
              <div className={styles.vaxDate}>예정일: {vax.date}</div>
              <div className={styles.vaxDesc}>{vax.description}</div>
            </div>
            <button className={styles.actionButton}>예약하기</button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>예방접종 일정 추가</h4>
              <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>백신명</label>
                <select name="name" value={formData.name} onChange={handleInputChange} className={styles.formInput}>
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
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} className={styles.formInput} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>설명</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} className={styles.formTextarea} placeholder="백신에 대한 설명을 입력하세요"></textarea>
              </div>
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

export default Vaccination;
