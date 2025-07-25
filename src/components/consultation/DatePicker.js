import React, { useState, useEffect } from 'react';
import moment from 'moment';
import 'moment/locale/ko';
import styles from './DatePicker.module.css';

moment.locale('ko');

const DatePicker = ({ selectedDate, onDateSelect, availableDates = [], minDate = new Date() }) => {
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [hoveredDate, setHoveredDate] = useState(null);

  // 현재 월의 캘린더 데이터 생성
  const generateCalendarData = () => {
    const startOfMonth = currentMonth.clone().startOf('month');
    const endOfMonth = currentMonth.clone().endOf('month');
    const startDate = startOfMonth.clone().startOf('week');
    const endDate = endOfMonth.clone().endOf('week');

    const calendar = [];
    const date = startDate.clone();

    while (date.isSameOrBefore(endDate)) {
      calendar.push(date.clone());
      date.add(1, 'day');
    }

    return calendar;
  };

  // 날짜가 선택 가능한지 확인
  const isDateAvailable = (date) => {
    // 과거 날짜는 선택 불가
    if (date.isBefore(moment(minDate).startOf('day'))) {
      return false;
    }
    
    // availableDates가 제공된 경우 해당 날짜만 선택 가능
    if (availableDates.length > 0) {
      return availableDates.some(availableDate => 
        moment(availableDate).isSame(date, 'day')
      );
    }
    
    // 기본적으로 2개월 이내 날짜만 선택 가능
    return date.isBefore(moment().add(2, 'months'));
  };

  const handleDateClick = (date) => {
    if (isDateAvailable(date)) {
      onDateSelect(date.format('YYYY-MM-DD'));
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.clone().subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.clone().add(1, 'month'));
  };

  const handleToday = () => {
    setCurrentMonth(moment());
    onDateSelect(moment().format('YYYY-MM-DD'));
  };

  const calendarDates = generateCalendarData();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className={styles.datePickerContainer}>
      <div className={styles.header}>
        <button 
          className={styles.navButton} 
          onClick={handlePrevMonth}
          disabled={currentMonth.isSame(moment(), 'month')}
        >
          ‹
        </button>
        <h3 className={styles.monthTitle}>
          {currentMonth.format('YYYY년 M월')}
        </h3>
        <button className={styles.navButton} onClick={handleNextMonth}>
          ›
        </button>
      </div>
      
      <div className={styles.weekDays}>
        {weekDays.map((day, index) => (
          <div 
            key={day} 
            className={`${styles.weekDay} ${index === 0 ? styles.sunday : index === 6 ? styles.saturday : ''}`}
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className={styles.calendar}>
        {calendarDates.map((date, index) => {
          const isCurrentMonth = date.isSame(currentMonth, 'month');
          const isToday = date.isSame(moment(), 'day');
          const isSelected = selectedDate && date.isSame(moment(selectedDate), 'day');
          const isAvailable = isDateAvailable(date);
          const isWeekend = date.day() === 0 || date.day() === 6;
          
          return (
            <div
              key={index}
              className={`
                ${styles.dateCell} 
                ${!isCurrentMonth ? styles.otherMonth : ''} 
                ${isToday ? styles.today : ''} 
                ${isSelected ? styles.selected : ''} 
                ${!isAvailable ? styles.disabled : ''} 
                ${isWeekend ? styles.weekend : ''}
                ${hoveredDate && date.isSame(hoveredDate, 'day') ? styles.hovered : ''}
              `}
              onClick={() => handleDateClick(date)}
              onMouseEnter={() => setHoveredDate(date)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              <span className={styles.dateNumber}>{date.date()}</span>
              {isToday && <span className={styles.todayLabel}>오늘</span>}
              {isAvailable && availableDates.length > 0 && (
                <span className={styles.availableIndicator}>•</span>
              )}
            </div>
          );
        })}
      </div>
      
      <div className={styles.footer}>
        <button className={styles.todayButton} onClick={handleToday}>
          오늘 선택
        </button>
        {selectedDate && (
          <span className={styles.selectedDateText}>
            선택된 날짜: {moment(selectedDate).format('M월 D일 (ddd)')}
          </span>
        )}
      </div>
    </div>
  );
};

export default DatePicker;