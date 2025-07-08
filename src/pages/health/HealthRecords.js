// src/pages/health/HealthRecords.js
import React, { useState } from 'react';
import styles from './HealthRecords.module.css';

import Vaccination from './Vaccination';
import Weight from './Weight';
import HospitalVisit from './HospitalVisit';
import Schedule from './Schedule';

const HealthRecords = ({ pet }) => {
  const [activeSubTab, setActiveSubTab] = useState('records');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    date: '',
    veterinarian: '',
    content: '',
  });

  const subTabs = [
    { id: 'records', label: '건강 기록' },
    { id: 'vaccination', label: '예방 접종' },
    { id: 'weight', label: '체중 변화' },
    { id: 'hospital', label: '병원 방문' },
    { id: 'schedule', label: '일정 관리' },
  ];

  const healthRecords = [
    {
      id: 1,
      type: '정기검진',
      title: '정기 건강검진',
      date: '2024-06-15',
      veterinarian: '김수의사',
      content: '전반적인 건강 상태 양호. 체중 관리 필요.',
      status: '완료',
    },
    {
      id: 2,
      type: '예방접종',
      title: '광견병 백신',
      date: '2024-05-20',
      veterinarian: '이수의사',
      content: '연간 광견병 예방접종 완료',
      status: '완료',
    },
    {
      id: 3,
      type: '예방접종',
      title: '종합백신 (DHPP)',
      date: '2025-03-10',
      veterinarian: '김수의사',
      content: '홍역, 간염, 파보바이러스 등 종합 예방접종',
      status: '예정',
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.type || !formData.title || !formData.date) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    console.log('새 건강 기록:', formData);
    setIsModalOpen(false);
    setFormData({
      type: '',
      title: '',
      date: '',
      veterinarian: '',
      content: '',
    });
    alert('건강 기록이 추가되었습니다.');
  };

  const renderHealthRecords = () => (
    <div className={styles.recordsContainer}>
      <div className={styles.recordsHeader}>
        <h3 className={styles.recordsTitle}>건강 기록</h3>
        <button
          className={styles.addButton}
          onClick={() => setIsModalOpen(true)}
        >
          + 기록 추가
        </button>
      </div>

      <div className={styles.recordsList}>
        {healthRecords.map((record) => (
          <div key={record.id} className={styles.recordItem}>
            <div className={styles.recordHeader}>
              <span className={styles.recordType}>{record.type}</span>
              <span
                className={`${styles.recordStatus} ${record.status === '완료' ? styles.completed : styles.scheduled}`}
              >
                {record.status}
              </span>
            </div>
            <h4 className={styles.recordTitle}>{record.title}</h4>
            <div className={styles.recordDetails}>
              <span className={styles.recordDate}>📅 {record.date}</span>
              {record.veterinarian && (
                <span className={styles.recordVet}>
                  👨‍⚕️ {record.veterinarian}
                </span>
              )}
            </div>
            <p className={styles.recordContent}>{record.content}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'records':
        return renderHealthRecords();
      case 'vaccination':
        return <Vaccination pet={pet} />;
      case 'weight':
        return <Weight pet={pet} />;
      case 'hospital':
        return <HospitalVisit pet={pet} />;
      case 'schedule':
        return <Schedule pet={pet} />;
      default:
        return renderHealthRecords();
    }
  };

  return (
    <>
      <div className={styles.summarySection}>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div
              className={styles.summaryIcon}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              🏥
            </div>
            <div className={styles.summaryLabel}>건강 점수</div>
            <div className={styles.summaryValue}>87점</div>
          </div>

          <div className={styles.summaryCard}>
            <div
              className={styles.summaryIcon}
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              }}
            >
              ⚖️
            </div>
            <div className={styles.summaryLabel}>현재 체중</div>
            <div className={styles.summaryValue}>{pet?.weight}kg</div>
          </div>

          <div className={styles.summaryCard}>
            <div
              className={styles.summaryIcon}
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              }}
            >
              📅
            </div>
            <div className={styles.summaryLabel}>최근 검진</div>
            <div className={styles.summaryValue}>2024-06-15</div>
          </div>

          <div className={styles.summaryCard}>
            <div
              className={styles.summaryIcon}
              style={{
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              }}
            >
              💉
            </div>
            <div className={styles.summaryLabel}>다음 백신</div>
            <div className={styles.summaryValue}>3월 예정</div>
          </div>
        </div>
      </div>

      <div className={styles.subTabsContainer}>
        <div className={styles.subTabsList}>
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.subTabItem} ${activeSubTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveSubTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tabContent}>{renderSubTabContent()}</div>

      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className={styles.modalContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>건강 기록 추가</h2>
              <button
                className={styles.closeButton}
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.modalContent}>
              <p className={styles.modalSubtitle}>
                반려동물의 새로운 건강 기록을 추가하세요.
              </p>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>종류</label>
                <select
                  className={styles.formSelect}
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                >
                  <option value="">기록 종류 선택</option>
                  <option value="정기검진">정기검진</option>
                  <option value="예방접종">예방접종</option>
                  <option value="치료">치료</option>
                  <option value="응급처치">응급처치</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>제목</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="예: 정기 건강검진"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>날짜</label>
                <input
                  type="date"
                  className={styles.formInput}
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>수의사</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="담당 수의사명"
                  value={formData.veterinarian}
                  onChange={(e) =>
                    handleInputChange('veterinarian', e.target.value)
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>내용</label>
                <textarea
                  className={styles.formTextarea}
                  placeholder="상세 내용을 입력하세요"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.submitButton} onClick={handleSubmit}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HealthRecords;
