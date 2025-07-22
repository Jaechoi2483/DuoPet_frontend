// src/pages/health/Schedule.js
import React, { useState, useEffect } from 'react';
import styles from './Schedule.module.css';
import Modal from '../../components/common/Modal';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/ko'; // 한국어 설정
import {
  createSchedule,
  getSchedulesByPet,
  updateSchedule,
  deleteSchedule
} from '../../api/scheduleApi';

moment.locale('ko');
const localizer = momentLocalizer(moment);

const Schedule = ({ pet }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [currentDate, setCurrentDate] = useState(new Date()); // 현재 날짜 상태 추가
  
  // 확장된 일정 타입
  const scheduleTypes = [
    { value: 'hospital', label: '병원 예약', color: '#3b82f6' },
    { value: 'medication', label: '약 복용', color: '#10b981' },
    { value: 'grooming', label: '미용', color: '#ec4899' },
    { value: 'other', label: '기타', color: '#6b7280' }
  ];
  
  const getScheduleTypeInfo = (type) => {
    return scheduleTypes.find(t => t.value === type) || { label: '기타', color: '#6b7280' };
  };
  
  const [formData, setFormData] = useState({
    scheduleType: '',
    title: '',
    scheduleDate: '',
    scheduleTime: '',
    location: '',
    memo: '',
    isRecurring: false,
    recurringType: '', // 'daily', 'weekly', 'monthly'
    recurringEndDate: ''
  });

  // 일정 조회
  useEffect(() => {
    if (pet?.petId) {
      fetchSchedules();
    }
  }, [pet]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await getSchedulesByPet(pet.petId);
      setSchedules(data);
      
      // 캘린더용 이벤트 데이터 변환
      const calendarEvents = data.map(schedule => {
        // moment를 사용해서 날짜와 시간을 안전하게 파싱
        const dateStr = schedule.scheduleDate;
        const timeStr = schedule.scheduleTime || '09:00';
        
        // 날짜와 시간을 결합하여 moment 객체 생성
        const startMoment = moment(`${dateStr} ${timeStr}`, 'YYYY-MM-DD HH:mm');
        // 종료 시간은 시작 시간에서 1시간 후로 설정
        const endMoment = startMoment.clone().add(1, 'hour');
        
        return {
          id: schedule.scheduleId,
          title: schedule.title,
          start: startMoment.toDate(),
          end: endMoment.toDate(),
          type: schedule.scheduleType,
          resource: schedule
        };
      });
      setEvents(calendarEvents);
    } catch (error) {
      console.error('일정 조회 실패:', error);
      alert('일정을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 반복 일정 날짜 생성 함수
  const generateRecurringDates = (startDate, endDate, recurringType) => {
    const dates = [];
    const start = moment(startDate);
    const end = moment(endDate);
    let current = start.clone();
    
    while (current.isSameOrBefore(end)) {
      dates.push(current.format('YYYY-MM-DD'));
      
      switch (recurringType) {
        case 'daily':
          current.add(1, 'day');
          break;
        case 'weekly':
          current.add(1, 'week');
          break;
        case 'monthly':
          current.add(1, 'month');
          break;
        default:
          break;
      }
    }
    
    return dates;
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.scheduleDate || !formData.scheduleType) {
      alert('일정 제목, 날짜, 종류를 입력해주세요.');
      return;
    }

    if (formData.isRecurring && (!formData.recurringType || !formData.recurringEndDate)) {
      alert('반복 주기와 종료 날짜를 입력해주세요.');
      return;
    }

    try {
      // 메모 필드에 장소 정보 포함
      let combinedMemo = formData.memo || '';
      if (formData.location) {
        combinedMemo = `장소: ${formData.location}\n${combinedMemo}`;
      }

      // 반복 일정인 경우 여러 날짜 생성
      const datesToCreate = formData.isRecurring 
        ? generateRecurringDates(formData.scheduleDate, formData.recurringEndDate, formData.recurringType)
        : [formData.scheduleDate];

      // 각 날짜에 대해 일정 생성
      for (const date of datesToCreate) {
        const scheduleData = {
          petId: pet.petId,
          scheduleType: formData.scheduleType,
          title: formData.title,
          scheduleDate: date,
          scheduleTime: formData.scheduleTime || '09:00',
          memo: combinedMemo.trim() || null,
        };

        await createSchedule(scheduleData);
      }
      
      alert(`일정이 ${datesToCreate.length}개 추가되었습니다.`);
      setIsModalOpen(false);
      setFormData({
        scheduleType: '',
        title: '',
        scheduleDate: '',
        scheduleTime: '',
        location: '',
        memo: '',
        isRecurring: false,
        recurringType: '',
        recurringEndDate: ''
      });
      fetchSchedules();
    } catch (error) {
      console.error('일정 추가 실패:', error);
      alert('일정 추가에 실패했습니다.');
    }
  };

  // 일정 클릭 시 상세 보기
  const handleEventClick = (event) => {
    setSelectedSchedule(event.resource);
    setIsDetailModalOpen(true);
    setIsEditMode(false);
  };

  // 수정 모드로 전환
  const handleEditClick = () => {
    setIsEditMode(true);
    
    // 메모에서 장소 정보 추출
    let location = '';
    let cleanMemo = selectedSchedule.memo || '';
    
    if (cleanMemo) {
      const locationMatch = cleanMemo.match(/장소: (.+)/);
      if (locationMatch) {
        location = locationMatch[1];
        cleanMemo = cleanMemo.replace(/장소: .+\n?/, '');
      }
    }
    
    setFormData({
      scheduleType: selectedSchedule.scheduleType,
      title: selectedSchedule.title,
      scheduleDate: selectedSchedule.scheduleDate,
      scheduleTime: selectedSchedule.scheduleTime || '',
      location: location,
      memo: cleanMemo.trim(),
      isRecurring: false,
      recurringType: '',
      recurringEndDate: ''
    });
  };

  // 일정 수정
  const handleUpdate = async () => {
    if (!formData.title || !formData.scheduleDate || !formData.scheduleType) {
      alert('일정 제목, 날짜, 종류를 입력해주세요.');
      return;
    }

    try {
      // 메모 필드에 장소 정보 포함
      let combinedMemo = formData.memo || '';
      if (formData.location) {
        combinedMemo = `장소: ${formData.location}\n${combinedMemo}`;
      }

      const updateData = {
        petId: pet.petId,
        scheduleType: formData.scheduleType,
        title: formData.title,
        scheduleDate: formData.scheduleDate,
        scheduleTime: formData.scheduleTime || '09:00',
        memo: combinedMemo.trim() || null,
      };

      await updateSchedule(selectedSchedule.scheduleId, updateData);
      alert('일정이 수정되었습니다.');
      setIsDetailModalOpen(false);
      setIsEditMode(false);
      fetchSchedules();
    } catch (error) {
      console.error('일정 수정 실패:', error);
      alert('일정 수정에 실패했습니다.');
    }
  };

  // 일정 삭제
  const handleDelete = async () => {
    if (!window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteSchedule(selectedSchedule.scheduleId);
      alert('일정이 삭제되었습니다.');
      setIsDetailModalOpen(false);
      fetchSchedules();
    } catch (error) {
      console.error('일정 삭제 실패:', error);
      alert('일정 삭제에 실패했습니다.');
    }
  };

  // 일정 유형별 색상
  const eventStyleGetter = (event) => {
    const typeInfo = getScheduleTypeInfo(event.type);
    return {
      style: {
        backgroundColor: typeInfo.color,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
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

        <div className={styles.contentWrapper}>
          <div className={styles.mainContent}>
            <div className={styles.calendarSection}>
              {loading ? (
                <div className={styles.loading}>로딩 중...</div>
              ) : (
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 500 }}
                  date={currentDate}
                  onNavigate={(date) => {
                    console.log('Navigating to:', date);
                    setCurrentDate(date);
                  }}
                  onSelectEvent={handleEventClick}
                  eventPropGetter={eventStyleGetter}
                  views={['month']}
                  defaultView='month'
                  toolbar={true}
                  formats={{
                    monthHeaderFormat: 'YYYY년 MM월',
                    dayHeaderFormat: 'MM/DD (ddd)',
                    dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
                      localizer.format(start, 'MM/DD', culture) + ' - ' +
                      localizer.format(end, 'MM/DD', culture)
                  }}
                  messages={{
                    next: "다음",
                    previous: "이전",
                    today: "오늘",
                    month: "월",
                    week: "주",
                    day: "일",
                    agenda: "일정",
                    date: "날짜",
                    time: "시간",
                    event: "일정",
                    noEventsInRange: "이 기간에 일정이 없습니다."
                  }}
                />
              )}
            </div>
            
            <div className={styles.legendSectionBottom}>
              <div className={styles.legendList}>
                {scheduleTypes.map(type => (
                  <div key={type.value} className={styles.legendItem}>
                    <span 
                      className={styles.legendColor}
                      style={{ backgroundColor: type.color }}
                    ></span>
                    <span className={styles.legendLabel}>{type.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className={styles.sidebarSection}>
            <h4 className={styles.sidebarTitle}>다가오는 일정</h4>
            {loading ? (
              <div className={styles.loading}>로딩 중...</div>
            ) : schedules.length === 0 ? (
              <div className={styles.emptyState}>
                <p>예정된 일정이 없습니다.</p>
              </div>
            ) : (
              <div className={styles.upcomingList}>
                {schedules
                  .filter(schedule => moment(schedule.scheduleDate, 'YYYY-MM-DD').isSameOrAfter(moment().startOf('day'), 'day'))
                  .sort((a, b) => moment(a.scheduleDate, 'YYYY-MM-DD').diff(moment(b.scheduleDate, 'YYYY-MM-DD')))
                  .slice(0, 10) // 다가오는 일정 표시 개수 증가
                  .map((schedule) => {
                    // 명시적으로 날짜 형식 지정하여 파싱
                    const scheduleMoment = moment(schedule.scheduleDate, 'YYYY-MM-DD').startOf('day');
                    const todayMoment = moment().startOf('day');
                    const daysUntil = scheduleMoment.diff(todayMoment, 'days');
                    return (
                      <div
                        key={schedule.scheduleId}
                        className={styles.upcomingItem}
                        onClick={() => handleEventClick({ resource: schedule })}
                      >
                        <div className={styles.upcomingHeader}>
                          <span 
                            className={styles.upcomingType}
                            style={{ backgroundColor: getScheduleTypeInfo(schedule.scheduleType).color }}
                          >
                            {getScheduleTypeInfo(schedule.scheduleType).label}
                          </span>
                          <span className={styles.daysUntil}>
                            {daysUntil === 0 ? '오늘' : 
                             daysUntil === 1 ? '내일' : 
                             `${daysUntil}일 후`}
                          </span>
                        </div>
                        <div className={styles.upcomingTitle}>{schedule.title}</div>
                        <div className={styles.upcomingDate}>
                          {schedule.scheduleDate} {schedule.scheduleTime}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 공용 모달 사용 */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>건강 관리 일정 추가</h2>
        </div>
        <div className={styles.modalContent}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>일정 종류</label>
              <select
                name="scheduleType"
                value={formData.scheduleType}
                onChange={handleInputChange}
                className={styles.formSelect}
              >
                <option value="">일정 종류 선택</option>
                {scheduleTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
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
          </div>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>날짜</label>
              <input
                type="date"
                name="scheduleDate"
                value={formData.scheduleDate}
                onChange={handleInputChange}
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>시간</label>
              <input
                type="time"
                name="scheduleTime"
                value={formData.scheduleTime}
                onChange={handleInputChange}
                className={styles.formInput}
              />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>장소</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="예: 서울동물병원"
              className={styles.formInput}
            />
          </div>
          
          {/* 반복 일정 설정 */}
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                className={styles.checkbox}
              />
              반복 일정
            </label>
          </div>
          
          {formData.isRecurring && (
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>반복 주기</label>
                <select
                  name="recurringType"
                  value={formData.recurringType}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                >
                  <option value="">반복 주기 선택</option>
                  <option value="daily">매일</option>
                  <option value="weekly">매주</option>
                  <option value="monthly">매월</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>종료 날짜</label>
                <input
                  type="date"
                  name="recurringEndDate"
                  value={formData.recurringEndDate}
                  onChange={handleInputChange}
                  className={styles.formInput}
                />
              </div>
            </div>
          )}
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>메모 (선택)</label>
            <textarea
              name="memo"
              value={formData.memo}
              onChange={handleInputChange}
              placeholder="일정에 대한 상세 내용을 입력하세요."
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

      {/* 일정 상세 보기 모달 */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}>
        {selectedSchedule && (
          <>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {isEditMode ? '일정 수정' : '일정 상세'}
              </h2>
            </div>
            <div className={styles.modalContent}>
              {isEditMode ? (
                <>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>일정 종류</label>
                      <select
                        name="scheduleType"
                        value={formData.scheduleType}
                        onChange={handleInputChange}
                        className={styles.formSelect}
                      >
                        <option value="">일정 종류 선택</option>
                        {scheduleTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
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
                  </div>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>날짜</label>
                      <input
                        type="date"
                        name="scheduleDate"
                        value={formData.scheduleDate}
                        onChange={handleInputChange}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>시간</label>
                      <input
                        type="time"
                        name="scheduleTime"
                        value={formData.scheduleTime}
                        onChange={handleInputChange}
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>장소</label>
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="예: 서울동물병원"
                      className={styles.formInput}
                    />
                  </div>
                  
                  {/* 반복 일정 설정 */}
                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="isRecurring"
                        checked={formData.isRecurring}
                        onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                        className={styles.checkbox}
                      />
                      반복 일정
                    </label>
                  </div>
                  
                  {formData.isRecurring && (
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>반복 주기</label>
                        <select
                          name="recurringType"
                          value={formData.recurringType}
                          onChange={handleInputChange}
                          className={styles.formSelect}
                        >
                          <option value="">반복 주기 선택</option>
                          <option value="daily">매일</option>
                          <option value="weekly">매주</option>
                          <option value="monthly">매월</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>종료 날짜</label>
                        <input
                          type="date"
                          name="recurringEndDate"
                          value={formData.recurringEndDate}
                          onChange={handleInputChange}
                          className={styles.formInput}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>메모 (선택)</label>
                    <textarea
                      name="memo"
                      value={formData.memo}
                      onChange={handleInputChange}
                      placeholder="일정에 대한 상세 내용을 입력하세요."
                      className={styles.formTextarea}
                      rows={3}
                    ></textarea>
                  </div>
                </>
              ) : (
                <div className={styles.detailView}>
                  <div className={styles.detailItem}>
                    <label>일정 종류</label>
                    <p>{getScheduleTypeInfo(selectedSchedule.scheduleType).label}</p>
                  </div>
                  <div className={styles.detailItem}>
                    <label>일정 제목</label>
                    <p>{selectedSchedule.title}</p>
                  </div>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <label>날짜</label>
                      <p>{selectedSchedule.scheduleDate}</p>
                    </div>
                    <div className={styles.detailItem}>
                      <label>시간</label>
                      <p>{selectedSchedule.scheduleTime || '-'}</p>
                    </div>
                  </div>
                  {(() => {
                    // 메모에서 장소 정보 추출
                    let location = '';
                    let cleanMemo = selectedSchedule.memo || '';
                    
                    if (cleanMemo) {
                      const locationMatch = cleanMemo.match(/장소: (.+?)(\n|$)/);
                      if (locationMatch) {
                        location = locationMatch[1];
                        cleanMemo = cleanMemo.replace(/장소: .+?(\n|$)/, '');
                      }
                    }
                    
                    return (
                      <>
                        {location && (
                          <div className={styles.detailItem}>
                            <label>장소</label>
                            <p>{location}</p>
                          </div>
                        )}
                        <div className={styles.detailItem}>
                          <label>메모</label>
                          <p>{cleanMemo.trim() || '-'}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              {isEditMode ? (
                <>
                  <button className={styles.cancelButton} onClick={() => setIsEditMode(false)}>
                    취소
                  </button>
                  <button className={styles.submitButton} onClick={handleUpdate}>
                    저장
                  </button>
                </>
              ) : (
                <>
                  <button className={styles.editButton} onClick={handleEditClick}>
                    수정
                  </button>
                  <button className={styles.deleteButton} onClick={handleDelete}>
                    삭제
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default Schedule;
