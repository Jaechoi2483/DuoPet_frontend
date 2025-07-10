// src/pages/health/Vaccination.js
import React, { useState } from 'react';
import styles from './Vaccination.module.css';
import Modal from '../../components/common/Modal'; // 공용 모달 컴포넌트 사용

const Vaccination = ({ pet }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vaccinations, setVaccinations] = useState([
    {
      id: 1,
      name: '켄넬코프 백신',
      description: '기침 예방을 위한 보조 백신',
      date: '2025-02-15',
      status: '예정',
    },
    {
      id: 2,
      name: '심장사상충 예방약',
      description: '월별 심장사상충 예방약 투여',
      date: '2025-01-01',
      status: '지연',
    },
  ]);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.date) {
      alert('백신명과 예정일을 입력해주세요.');
      return;
    }
    const newVaccination = {
      id: vaccinations.length + 1,
      ...formData,
      status: '예정',
    };
    setVaccinations((prev) => [...prev, newVaccination]);
    setIsModalOpen(false);
    setFormData({ name: '', date: '', description: '' });
    alert('예방접종 일정이 추가되었습니다.');
  };

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
          {vaccinations.map((vax) => (
            <div key={vax.id} className={styles.vaccinationItem}>
              <div className={styles.itemHeader}>
                <span className={styles.itemType}>예방접종</span>
                <span
                  className={`${styles.statusTag} ${
                    styles[vax.status.toLowerCase()]
                  }`}
                >
                  {vax.status}
                </span>
              </div>
              <h4 className={styles.itemName}>{vax.name}</h4>
              <div className={styles.itemDetails}>
                <span className={styles.itemDate}>📅 예정일: {vax.date}</span>
              </div>
              <p className={styles.itemDesc}>{vax.description}</p>
            </div>
          ))}
        </div>
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
    </>
  );
};

export default Vaccination;
