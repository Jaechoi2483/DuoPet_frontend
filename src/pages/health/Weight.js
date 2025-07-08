
// src/pages/health/Weight.js
import React, { useState } from 'react';
import styles from './Weight.module.css';
// Chart.js 라이브러리가 설치되어 있다고 가정합니다.
// import { Line } from 'react-chartjs-2';

const Weight = ({ pet }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weights, setWeights] = useState([
    { date: '2024-12-15', weight: 2.7 },
    { date: '2025-01-15', weight: 2.8 },
  ]);
  const [formData, setFormData] = useState({ date: '', weight: '', memo: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.date || !formData.weight) {
      alert('측정일과 체중을 입력해주세요.');
      return;
    }
    const newWeight = { ...formData, weight: parseFloat(formData.weight) };
    setWeights(prev => [...prev, newWeight].sort((a, b) => new Date(a.date) - new Date(b.date)));
    setIsModalOpen(false);
    setFormData({ date: '', weight: '', memo: '' });
    alert('체중이 기록되었습니다.');
  };

  /*
  const chartData = {
    labels: weights.map(w => w.date),
    datasets: [
      {
        label: `${pet.name} 체중(kg)`,
        data: weights.map(w => w.weight),
        fill: false,
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
      },
    ],
  };
  */

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>체중 변화</h3>
        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>+ 체중 기록 추가</button>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.chartSection}>
          <h4>체중 변화 그래프</h4>
          {/* <Line data={chartData} /> */}
          <div className={styles.placeholder}>차트 라이브러리 설치 후 여기에 그래프가 표시됩니다.</div>
        </div>
        <div className={styles.infoSection}>
            <div className={styles.infoCard}>
                <div>현재 체중</div>
                <div className={styles.currentWeight}>{weights[weights.length - 1]?.weight}kg</div>
            </div>
            <div className={styles.infoCard}>
                <div>목표 체중</div>
                <div>2.5-3.0kg</div>
            </div>
            <div className={styles.infoCard}>
                <div>상태</div>
                <div className={styles.status}>정상</div>
            </div>
        </div>
      </div>

      <div className={styles.historySection}>
        <h4>체중 기록 히스토리</h4>
        <div className={styles.historyList}>
          {weights.map((w, index) => (
            <div key={index} className={styles.historyItem}>
              <span>{w.date}</span>
              <span>{w.weight}kg</span>
              <span>{w.memo}</span>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>체중 기록 추가</h4>
              <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>체중(kg)</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className={styles.formInput} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>측정일</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} className={styles.formInput} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>메모</label>
                <input type="text" name="memo" value={formData.memo} onChange={handleInputChange} className={styles.formInput} placeholder="측정 상황이나 특이사항을 기록하세요" />
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

export default Weight;
