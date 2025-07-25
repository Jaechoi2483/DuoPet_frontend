import React, { useState, useEffect } from 'react';
import styles from './TimeSlotPicker.module.css';

const TimeSlotPicker = ({ 
  availableSlots = [], 
  selectedSlot, 
  onSlotSelect,
  isLoading = false 
}) => {
  const [hoveredSlot, setHoveredSlot] = useState(null);

  // 시간대별로 슬롯 그룹화
  const groupSlotsByPeriod = (slots) => {
    const groups = {
      morning: [],    // 오전 (09:00 - 12:00)
      afternoon: [],  // 오후 (12:00 - 18:00)
      evening: []     // 저녁 (18:00 - 21:00)
    };

    slots.forEach(slot => {
      const hour = parseInt(slot.startTime.split(':')[0]);
      
      if (hour < 12) {
        groups.morning.push(slot);
      } else if (hour < 18) {
        groups.afternoon.push(slot);
      } else {
        groups.evening.push(slot);
      }
    });

    return groups;
  };

  // 슬롯의 가용성 퍼센트 계산
  const getAvailabilityPercent = (slot) => {
    if (!slot.maxConsultations || slot.maxConsultations === 0) return 0;
    const available = slot.maxConsultations - slot.currentBookings;
    return (available / slot.maxConsultations) * 100;
  };

  // 슬롯 상태 클래스 결정
  const getSlotStatusClass = (slot) => {
    const availabilityPercent = getAvailabilityPercent(slot);
    
    if (availabilityPercent === 0) return styles.unavailable;
    if (availabilityPercent <= 30) return styles.almostFull;
    if (availabilityPercent <= 70) return styles.moderate;
    return styles.available;
  };

  const handleSlotClick = (slot) => {
    if (slot.currentBookings < slot.maxConsultations) {
      onSlotSelect(slot);
    }
  };

  const groupedSlots = groupSlotsByPeriod(availableSlots);
  const periods = [
    { key: 'morning', label: '오전', icon: '🌅' },
    { key: 'afternoon', label: '오후', icon: '☀️' },
    { key: 'evening', label: '저녁', icon: '🌙' }
  ];

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>예약 가능한 시간을 불러오는 중...</p>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyMessage}>😢 선택하신 날짜에 예약 가능한 시간이 없습니다.</p>
        <p className={styles.emptySubMessage}>다른 날짜를 선택해 주세요.</p>
      </div>
    );
  }

  return (
    <div className={styles.timeSlotContainer}>
      <div className={styles.header}>
        <h4 className={styles.title}>상담 시간 선택</h4>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.available}`}></span>
            여유
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.moderate}`}></span>
            보통
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.almostFull}`}></span>
            마감임박
          </span>
        </div>
      </div>

      {periods.map(period => {
        const slots = groupedSlots[period.key];
        
        if (slots.length === 0) return null;

        return (
          <div key={period.key} className={styles.periodSection}>
            <h5 className={styles.periodTitle}>
              <span className={styles.periodIcon}>{period.icon}</span>
              {period.label}
            </h5>
            <div className={styles.slotsGrid}>
              {slots.map(slot => {
                const isSelected = selectedSlot?.scheduleId === slot.scheduleId;
                const isUnavailable = slot.currentBookings >= slot.maxConsultations;
                const availableCount = slot.maxConsultations - slot.currentBookings;
                
                return (
                  <div
                    key={slot.scheduleId}
                    className={`
                      ${styles.slotCard} 
                      ${isSelected ? styles.selected : ''} 
                      ${isUnavailable ? styles.disabled : ''}
                      ${hoveredSlot === slot.scheduleId ? styles.hovered : ''}
                      ${getSlotStatusClass(slot)}
                    `}
                    onClick={() => handleSlotClick(slot)}
                    onMouseEnter={() => setHoveredSlot(slot.scheduleId)}
                    onMouseLeave={() => setHoveredSlot(null)}
                  >
                    <div className={styles.slotTime}>
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <div className={styles.slotAvailability}>
                      {isUnavailable ? (
                        <span className={styles.fullText}>마감</span>
                      ) : (
                        <>
                          <span className={styles.availableCount}>{availableCount}명</span>
                          <span className={styles.availableText}>예약 가능</span>
                        </>
                      )}
                    </div>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
                        style={{ width: `${100 - getAvailabilityPercent(slot)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {selectedSlot && (
        <div className={styles.selectedInfo}>
          <div className={styles.selectedIcon}>✅</div>
          <div>
            <p className={styles.selectedText}>
              선택하신 시간: <strong>{selectedSlot.startTime} - {selectedSlot.endTime}</strong>
            </p>
            <p className={styles.selectedSubText}>
              예약 가능 인원: {selectedSlot.maxConsultations - selectedSlot.currentBookings}명
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;