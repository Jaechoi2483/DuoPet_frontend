

// src/pages/health/ExpertConsult.js
import React, { useState } from 'react';
import styles from './ExpertConsult.module.css';

const ExpertConsult = () => {
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [consultationType, setConsultationType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);

  const experts = [
    {
      id: 1,
      name: '김수의 원장',
      specialty: '내과 전문',
      experience: '15년',
      rating: 4.9,
      consultCount: 1250,
      hospital: '펫케어 동물병원',
      image: '👨‍⚕️',
      introduction: '반려동물 내과 질환 전문으로 15년간 진료해왔습니다.',
      availableTimes: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
    },
    {
      id: 2,
      name: '이동물 원장',
      specialty: '외과 전문',
      experience: '12년',
      rating: 4.8,
      consultCount: 980,
      hospital: '하트 동물병원',
      image: '👩‍⚕️',
      introduction: '외과 수술 및 응급처치 전문의입니다.',
      availableTimes: ['09:30', '10:30', '13:00', '14:30', '15:30']
    },
    {
      id: 3,
      name: '박반려 원장',
      specialty: '피부과 전문',
      experience: '8년',
      rating: 4.7,
      consultCount: 756,
      hospital: '스킨케어 동물병원',
      image: '👨‍⚕️',
      introduction: '반려동물 피부 질환 및 알레르기 치료 전문가입니다.',
      availableTimes: ['10:00', '11:30', '14:00', '15:30', '16:30']
    }
  ];

  const consultationTypes = [
    { value: 'video', label: '화상 상담', price: '30,000원' },
    { value: 'chat', label: '채팅 상담', price: '15,000원' },
    { value: 'phone', label: '전화 상담', price: '20,000원' }
  ];

  const handleExpertSelect = (expert) => {
    setSelectedExpert(expert);
    setShowBookingForm(true);
  };

  const handleBooking = () => {
    if (!consultationType || !selectedDate || !selectedTime || !symptoms) {
      alert('모든 필수 정보를 입력해주세요.');
      return;
    }
    
    alert(`상담 예약이 완료되었습니다!\n\n전문가: ${selectedExpert.name}\n일시: ${selectedDate} ${selectedTime}\n상담 방식: ${consultationTypes.find(t => t.value === consultationType)?.label}`);
    
    // 폼 초기화
    setShowBookingForm(false);
    setSelectedExpert(null);
    setConsultationType('');
    setSelectedDate('');
    setSelectedTime('');
    setSymptoms('');
  };

  return (
    <div className={styles.container}>
      {!showBookingForm ? (
        <div className={styles.expertsSection}>
          <h2 className={styles.sectionTitle}>전문가 선택</h2>
          <div className={styles.expertsGrid}>
            {experts.map(expert => (
              <div key={expert.id} className={styles.expertCard}>
                <div className={styles.expertImage}>{expert.image}</div>
                <div className={styles.expertInfo}>
                  <h3 className={styles.expertName}>{expert.name}</h3>
                  <div className={styles.expertSpecialty}>{expert.specialty}</div>
                  <div className={styles.expertHospital}>{expert.hospital}</div>
                  <div className={styles.expertStats}>
                    <div className={styles.statItem}>
                      <div className={styles.statLabel}>경력</div>
                      <div className={styles.statValue}>{expert.experience}</div>
                    </div>
                    <div className={styles.statItem}>
                      <div className={styles.statLabel}>평점</div>
                      <div className={styles.statValue}>⭐ {expert.rating}</div>
                    </div>
                    <div className={styles.statItem}>
                      <div className={styles.statLabel}>상담횟수</div>
                      <div className={styles.statValue}>{expert.consultCount}회</div>
                    </div>
                  </div>
                  <p className={styles.expertIntroduction}>{expert.introduction}</p>
                  <button className={styles.selectButton} onClick={() => handleExpertSelect(expert)}>
                    선택하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.bookingSection}>
          <div className={styles.bookingHeader}>
            <button className={styles.backButton} onClick={() => setShowBookingForm(false)}>
              ← 전문가 선택으로 돌아가기
            </button>
            <h2 className={styles.bookingTitle}>상담 예약</h2>
          </div>

          <div className={styles.selectedExpertInfo}>
            <div className={styles.expertImage}>{selectedExpert.image}</div>
            <div className={styles.expertDetails}>
              <h3 className={styles.expertName}>{selectedExpert.name}</h3>
              <div className={styles.expertSpecialty}>{selectedExpert.specialty}</div>
              <div className={styles.expertHospital}>{selectedExpert.hospital}</div>
            </div>
          </div>

          <div className={styles.bookingForm}>
            <div className={styles.formSection}>
              <h3 className={styles.formTitle}>1. 상담 방식 선택</h3>
              <div className={styles.consultationTypeGrid}>
                {consultationTypes.map(type => (
                  <div 
                    key={type.value}
                    className={`${styles.typeCard} ${consultationType === type.value ? styles.selected : ''}`}
                    onClick={() => setConsultationType(type.value)}
                  >
                    <div className={styles.typeLabel}>{type.label}</div>
                    <div className={styles.typePrice}>{type.price}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.formTitle}>2. 날짜 및 시간 선택</h3>
              <div className={styles.dateTimeGrid}>
                <div className={styles.dateInput}>
                  <label>날짜</label>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className={styles.timeSelect}>
                  <label>시간</label>
                  <select 
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  >
                    <option value="">시간 선택</option>
                    {selectedExpert?.availableTimes.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.formTitle}>3. 증상 및 상담 내용</h3>
              <textarea 
                className={styles.textArea}
                placeholder="반려동물의 증상이나 상담하고 싶은 내용을 자세히 적어주세요..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={5}
              />
            </div>

            <button className={styles.bookingButton} onClick={handleBooking}>
              상담 예약하기
            </button>
          </div>
        </div>
      )}

      <div className={styles.infoSection}>
        <h2 className={styles.infoTitle}>상담 안내</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>🎥</div>
            <h3 className={styles.infoCardTitle}>화상 상담</h3>
            <div className={styles.infoCardText}>
              • 실시간 화상 통화<br/>
              • 반려동물 직접 확인 가능<br/>
              • 30분 상담<br/>
              • 상담료: 30,000원
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>💬</div>
            <h3 className={styles.infoCardTitle}>채팅 상담</h3>
            <div className={styles.infoCardText}>
              • 실시간 텍스트 대화<br/>
              • 사진/동영상 전송 가능<br/>
              • 24시간 기록 보관<br/>
              • 상담료: 15,000원
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>📞</div>
            <h3 className={styles.infoCardTitle}>전화 상담</h3>
            <div className={styles.infoCardText}>
              • 음성 통화 상담<br/>
              • 빠른 응답 가능<br/>
              • 20분 상담<br/>
              • 상담료: 20,000원
            </div>
          </div>
        </div>
      </div>

      <div className={styles.faqSection}>
        <h2 className={styles.faqTitle}>자주 묻는 질문</h2>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <div className={styles.faqQuestion}>Q. 상담 시간은 얼마나 되나요?</div>
            <div className={styles.faqAnswer}>A. 화상 상담 30분, 전화 상담 20분, 채팅 상담은 실시간 응답으로 진행됩니다.</div>
          </div>
          <div className={styles.faqItem}>
            <div className={styles.faqQuestion}>Q. 응급상황일 때도 이용할 수 있나요?</div>
            <div className={styles.faqAnswer}>A. 응급상황의 경우 즉시 가까운 동물병원에 내원하시기 바랍니다.</div>
          </div>
          <div className={styles.faqItem}>
            <div className={styles.faqQuestion}>Q. 상담료 결제는 어떻게 하나요?</div>
            <div className={styles.faqAnswer}>A. 신용카드, 계좌이체, 간편결제 등 다양한 결제 수단을 지원합니다.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertConsult;
