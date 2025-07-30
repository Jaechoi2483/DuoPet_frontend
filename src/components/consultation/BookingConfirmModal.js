import React, { useState } from 'react';
import Modal from '../common/Modal';
import styles from './BookingConfirmModal.module.css';
import moment from 'moment';
import 'moment/locale/ko';
import { initTossPayments, createPaymentParams, CONSULTATION_PRICES } from '../../utils/payment';

moment.locale('ko');

const BookingConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  bookingData,
  userInfo,
  isProcessing = false 
}) => {
  const [error, setError] = useState(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  
  if (!bookingData) return null;

  const {
    expert,
    consultationType,
    date,
    schedule,
    pet,
    symptoms,
    consultationFee
  } = bookingData;
  
  // 상담료는 일괄 30,000원
  const finalConsultationFee = 30000;

  const formatDate = (dateStr) => {
    return moment(dateStr).format('M월 D일 (ddd)');
  };

  const formatFee = (fee) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(fee);
  };

  const getConsultationTypeLabel = (type) => {
    const types = {
      'VIDEO': '화상 상담',
      'CHAT': '채팅 상담',
      'PHONE': '전화 상담',
      'INSTANT': '실시간 상담',
      'QNA': 'Q&A 상담'
    };
    return types[type] || type;
  };
  
  const handlePayment = async () => {
    setIsPaymentProcessing(true);
    setError(null);

    try {
      // 토스페이먼츠 초기화
      const tossPayments = await initTossPayments();
      
      // 결제 파라미터 생성
      const consultationData = {
        consultationType: consultationType || 'CHAT',
        vetId: expert.vetId,
        vetName: expert.vetName,
        petId: pet.petId,
        scheduleId: schedule?.scheduleId,
        date: date,
        time: schedule?.startTime
      };
      
      const paymentParams = createPaymentParams(consultationData, {
        ...userInfo,
        name: userInfo.name || '고객',
        email: userInfo.email || 'test@example.com',
        phone: userInfo.phone ? userInfo.phone.replace(/-/g, '') : '01012345678' // 하이픈 제거
      });
      
      // 결제 데이터를 세션 스토리지에 저장 (결제 완료 후 사용)
      sessionStorage.setItem('pendingConsultation', JSON.stringify({
        ...bookingData,
        consultationData,
        paymentInfo: {
          orderId: paymentParams.orderId,
          amount: paymentParams.amount
        }
      }));
      
      // 토스페이먼츠 결제창 호출 - 테스트 환경에서는 flowMode 설정
      await tossPayments.requestPayment('카드', {
        ...paymentParams,
        flowMode: 'DEFAULT',  // 일반 결제 플로우 사용
        easyPay: undefined    // 간편결제 비활성화
      });
      
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || '결제 처리 중 오류가 발생했습니다.');
      setIsPaymentProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>상담 예약 확인</h2>
          <p className={styles.modalSubtitle}>
            예약 정보를 확인하고 결제를 진행해주세요
          </p>
        </div>

        <div className={styles.bookingDetails}>
          {/* 전문가 정보 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>👨‍⚕️</span>
              전문가 정보
            </h3>
            <div className={styles.expertInfo}>
              <div className={styles.expertImageWrapper}>
                {expert.profileImageUrl ? (
                  <img 
                    src={expert.profileImageUrl} 
                    alt={expert.vetName}
                    className={styles.expertImage}
                  />
                ) : (
                  <div className={styles.expertImagePlaceholder}>
                    👨‍⚕️
                  </div>
                )}
              </div>
              <div className={styles.expertDetails}>
                <h4>{expert.vetName} 수의사</h4>
                <p>{expert.hospitalName}</p>
                <p className={styles.specialty}>
                  {expert.specialties.join(', ')}
                </p>
                <div className={styles.rating}>
                  ⭐ {expert.rating} ({expert.consultationCount}건)
                </div>
              </div>
            </div>
          </div>

          {/* 상담 일정 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📅</span>
              상담 일정
            </h3>
            <div className={styles.scheduleInfo}>
              <div className={styles.infoRow}>
                <span className={styles.label}>상담 방식</span>
                <span className={styles.value}>
                  {getConsultationTypeLabel(consultationType)}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>예약 날짜</span>
                <span className={styles.value}>{formatDate(date)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>예약 시간</span>
                <span className={styles.value}>
                  {schedule.startTime} - {schedule.endTime}
                </span>
              </div>
            </div>
          </div>

          {/* 반려동물 정보 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>🐾</span>
              반려동물 정보
            </h3>
            <div className={styles.petInfo}>
              <div className={styles.petImageWrapper}>
                {pet.imageUrl ? (
                  <img 
                    src={pet.imageUrl} 
                    alt={pet.name}
                    className={styles.petImage}
                  />
                ) : (
                  <div className={styles.petImagePlaceholder}>
                    {pet.species === '개' ? '🐕' : '🐈'}
                  </div>
                )}
              </div>
              <div className={styles.petDetails}>
                <h4>{pet.name}</h4>
                <p>{pet.species} - {pet.breed}</p>
                <p>{pet.age}살, {pet.gender}, {pet.weight}kg</p>
              </div>
            </div>
          </div>

          {/* 증상 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📝</span>
              상담 내용
            </h3>
            <div className={styles.symptomsBox}>
              {symptoms || '상담 시 문의드릴 내용입니다.'}
            </div>
          </div>

          {/* 결제 정보 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>💳</span>
              결제 정보
            </h3>
            <div className={styles.paymentInfo}>
              <div className={styles.feeRow}>
                <span className={styles.feeLabel}>상담료</span>
                <span className={styles.feeAmount}>
                  {formatFee(finalConsultationFee)}
                </span>
              </div>
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>총 결제 금액</span>
                <span className={styles.totalAmount}>
                  {formatFee(finalConsultationFee)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        <div className={styles.notice}>
          <p className={styles.noticeTitle}>📌 예약 안내</p>
          <ul className={styles.noticeList}>
            <li>예약 시간 10분 전까지 상담 준비를 완료해주세요.</li>
            <li>예약 취소는 상담 1시간 전까지 가능합니다.</li>
            <li>No-show 시 환불이 불가능합니다.</li>
            <li>상담 내용은 녹화되지 않으며 안전하게 보호됩니다.</li>
          </ul>
        </div>

        <div className={styles.modalActions}>
          <button 
            className={styles.cancelButton} 
            onClick={onClose}
            disabled={isProcessing}
          >
            취소
          </button>
          <button 
            className={styles.confirmButton} 
            onClick={handlePayment}
            disabled={isProcessing || isPaymentProcessing}
          >
            {(isProcessing || isPaymentProcessing) ? (
              <>
                <span className={styles.spinner}></span>
                처리 중...
              </>
            ) : (
              '결제하고 예약 완료'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BookingConfirmModal;