// src/pages/health/Schedule.js
import React, { useState } from 'react';
import styles from './Schedule.module.css';
import Modal from '../../components/common/Modal'; // 1. 공용 모달 컴포넌트 가져오기

// react-big-calendar와 moment 라이브러리가 설치되어 있다고 가정합니다.
// import { Calendar, momentLocalizer } from 'react-big-calendar';
// import moment from 'moment';
// import 'react-big-calendar/lib/css/react-big-calendar.css';

// const localizer = momentLocalizer(moment);

const Schedule = ({ pet }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState([
    {
      id: 1,
      title: '정기 건강검진',
      start: new Date(2025, 5, 20),
      end: new Date(2025, 5, 20),
      type: 'hospital',
    },
    {
      id: 2,
      title: '심장사상충 약',
      start: new Date(2025, 5, 15),
      end: new Date(2025, 5, 15),
      type: 'medication',
    },
  ]);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    memo: '',
    type: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.date || !formData.type) {
      alert('일정 제목, 날짜, 종류를 입력해주세요.');
      return;
    }
    const start = new Date(`${formData.date}T${formData.time || '09:00'}`);
    const newEvent = {
      id: events.length + 1,
      title: formData.title,
      start,
      end: start,
      type: formData.type,
      memo: formData.memo,
    };
    setEvents((prev) => [...prev, newEvent]);
    setIsModalOpen(false);
    setFormData({ title: '', date: '', time: '', memo: '', type: '' });
    alert('일정이 추가되었습니다.');
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>일정 관리</h3>
          <button
            className={styles.addButton}
            onClick={() => setIsModalOpen(true)}
          >
            + 일정 추가
          </button>
        </div>

        <div className={styles.calendarContainer}>
          {/* <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                eventPropGetter={(event) => ({
                    className: `${styles.event} ${styles[event.type]}`
                })}
            /> */}
          <div className={styles.placeholder}>
            🗓️ 캘린더 라이브러리 설치 후 여기에 캘린더가 표시됩니다.
          </div>
        </div>
      </div>

      {/* 공용 모달 사용 */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>건강 관리 일정 추가</h2>
        </div>
        <div className={styles.modalContent}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>일정 종류</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className={styles.formSelect}
            >
              <option value="">일정 종류 선택</option>
              <option value="hospital">병원 방문</option>
              <option value="vaccination">예방 접종</option>
              <option value="medication">투약</option>
              <option value="other">기타</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>일정 제목</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="예: 연간 종합검진"
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>날짜</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>시간</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className={styles.formInput}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>메모 (선택)</label>
            <textarea
              name="memo"
              value={formData.memo}
              onChange={handleInputChange}
              placeholder="일정에 대한 상세 내용을 입력하세요."
              className={styles.formTextarea}
              rows={4}
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

export default Schedule;
