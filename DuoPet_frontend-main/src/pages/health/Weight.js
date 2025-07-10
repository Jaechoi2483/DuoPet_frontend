// src/pages/health/Weight.js
import React, { useState } from 'react';
import styles from './Weight.module.css';
import Modal from '../../components/common/Modal'; // 1. 공용 모달 컴포넌트 가져오기

// Chart.js 라이브러리가 설치되어 있다고 가정합니다.
// import { Line } from 'react-chartjs-2';

const Weight = ({ pet }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weights, setWeights] = useState([
    { date: '2024-09-15', weight: 2.5, memo: '사료 변경 후 첫 측정' },
    { date: '2024-10-10', weight: 2.7, memo: '간식량 약간 늘림' },
    { date: '2025-01-15', weight: 2.8, memo: '겨울이라 활동량 감소' },
    { date: '2025-02-15', weight: 2.8, memo: '체중 유지 중' },
  ]);
  const [formData, setFormData] = useState({ date: '', weight: '', memo: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.date || !formData.weight) {
      alert('측정일과 체중을 입력해주세요.');
      return;
    }
    const newWeight = { ...formData, weight: parseFloat(formData.weight) };
    // 날짜순으로 정렬하여 추가
    setWeights((prev) =>
      [...prev, newWeight].sort((a, b) => new Date(a.date) - new Date(b.date))
    );
    setIsModalOpen(false);
    setFormData({ date: '', weight: '', memo: '' });
    alert('체중이 기록되었습니다.');
  };

  /*
  const chartData = {
    labels: weights.map(w => w.date),
    datasets: [ ... ],
  };
  */

  return (
    <>
      <div className={styles.container}>
        {/* 상단: 그래프 및 정보 섹션 */}
        <div className={styles.topSection}>
          <div className={styles.chartSection}>
            <h4 className={styles.sectionTitle}>체중 변화 그래프</h4>
            <div className={styles.chartPlaceholder}>
              📈 체중 변화 차트
              <p>최근 6개월의 체중 변화를 확인할 수 있습니다.</p>
            </div>
          </div>
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>체중 정보</h4>
            <div className={styles.infoCard}>
              <span>현재 체중</span>
              <span className={styles.currentWeight}>
                {weights[weights.length - 1]?.weight.toFixed(1)}kg
              </span>
            </div>
            <div className={styles.infoCard}>
              <span>이상 체중</span>
              <span>2.5 - 3.0kg</span>
            </div>
            <div className={styles.infoCard}>
              <span>체중 상태</span>
              <span className={styles.statusNormal}>정상</span>
            </div>
          </div>
        </div>

        {/* 하단: 히스토리 섹션 */}
        <div className={styles.historySection}>
          <div className={styles.historyHeader}>
            <h4 className={styles.sectionTitle}>체중 기록 히스토리</h4>
            <button
              className={styles.addButton}
              onClick={() => setIsModalOpen(true)}
            >
              + 체중 기록 추가
            </button>
          </div>
          <div className={styles.historyList}>
            {/* 체중 기록을 역순으로 표시 (최신이 위로) */}
            {[...weights].reverse().map((w, index, arr) => {
              const prevWeight = arr[index + 1]?.weight;
              const change = prevWeight ? w.weight - prevWeight : 0;
              const changeText =
                change > 0
                  ? `+${change.toFixed(1)}kg`
                  : change < 0
                    ? `${change.toFixed(1)}kg`
                    : '유지';

              return (
                <div key={index} className={styles.historyItem}>
                  <div className={styles.weightInfo}>
                    <span className={styles.weightValue}>
                      {w.weight.toFixed(1)}kg
                    </span>
                    <span className={styles.weightDate}>{w.date}</span>
                  </div>
                  {/* 첫 기록이 아닐 경우에만 변화량 표시 */}
                  {index < arr.length - 1 && (
                    <span
                      className={`${styles.weightChange} ${change > 0 ? styles.increase : change < 0 ? styles.decrease : ''}`}
                    >
                      {changeText}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 공용 모달 사용 */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>체중 기록 추가</h2>
        </div>
        <div className={styles.modalContent}>
          <p className={styles.modalSubtitle}>새로운 체중을 기록하세요.</p>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>체중(kg)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              className={styles.formInput}
              placeholder="예: 2.8"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>측정일</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>메모 (선택)</label>
            <input
              type="text"
              name="memo"
              value={formData.memo}
              onChange={handleInputChange}
              className={styles.formInput}
              placeholder="측정 상황이나 특이사항을 기록하세요"
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

export default Weight;
