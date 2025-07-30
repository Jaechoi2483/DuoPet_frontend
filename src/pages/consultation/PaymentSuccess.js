import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { consultationRoomApi, qnaConsultationApi } from '../../api/consultationApi';
import styles from './PaymentSuccess.module.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [consultationInfo, setConsultationInfo] = useState(null);

  useEffect(() => {
    const processPaymentSuccess = async () => {
      try {
        // URL 파라미터에서 결제 정보 추출
        const searchParams = new URLSearchParams(location.search);
        const paymentKey = searchParams.get('paymentKey');
        const orderId = searchParams.get('orderId');
        const amount = searchParams.get('amount');

        // 세션 스토리지에서 상담 정보 가져오기
        const pendingConsultation = JSON.parse(
          sessionStorage.getItem('pendingConsultation') || '{}'
        );
        const pendingQnaConsultation = JSON.parse(
          sessionStorage.getItem('pendingQnaConsultation') || '{}'
        );
        const pendingInstantConsultation = JSON.parse(
          sessionStorage.getItem('pendingInstantConsultation') || '{}'
        );

        if (!paymentKey || !orderId) {
          throw new Error('결제 정보가 올바르지 않습니다.');
        }

        // Q&A 상담 처리
        if (pendingQnaConsultation.vetInfo) {
          // 결제 승인 API 호출 없이 바로 Q&A 상담 생성
          // 백엔드에서 결제 정보를 받아 토스페이먼츠 API로 직접 검증
          const formDataToSend = new FormData();
          formDataToSend.append('vetId', pendingQnaConsultation.vetInfo.vetId);
          formDataToSend.append('petId', pendingQnaConsultation.petId);
          formDataToSend.append('title', pendingQnaConsultation.title);
          formDataToSend.append('content', pendingQnaConsultation.content);
          formDataToSend.append('category', pendingQnaConsultation.category || '건강');
          
          // 파일 첨부
          if (pendingQnaConsultation.files && pendingQnaConsultation.files.length > 0) {
            pendingQnaConsultation.files.forEach(file => {
              formDataToSend.append('files', file);
            });
          }
          
          // 결제 정보 추가
          formDataToSend.append('paymentKey', paymentKey);
          formDataToSend.append('orderId', orderId);
          formDataToSend.append('amount', amount);
          
          const response = await qnaConsultationApi.createQnaConsultation(formDataToSend);
          sessionStorage.removeItem('pendingQnaConsultation');
          
          setConsultationInfo({
            consultationType: 'QNA',
            title: pendingQnaConsultation.title
          });
          setLoading(false);
          
          // 3초 후 마이페이지로 이동
          setTimeout(() => {
            navigate('/mypage/consultations', { state: { activeTab: 'qna' } });
          }, 3000);
          
        } else if (pendingInstantConsultation.vetId) {
          // 실시간 상담 처리 - QNA 상담과 동일한 방식으로 처리
          console.log('실시간 상담 처리 시작:', {
            paymentKey,
            orderId,
            amount,
            pendingInstantConsultation
          });
          
          // 결제 승인 API 호출 없이 바로 상담방 생성 (QNA와 동일)
          // 백엔드에서 결제 정보를 받아 토스페이먼츠 API로 직접 검증
          const consultationCreateData = {
            userId: pendingInstantConsultation.userId,
            vetId: pendingInstantConsultation.vetId,
            petId: pendingInstantConsultation.petId,
            consultationType: pendingInstantConsultation.consultationType || 'CHAT',
            chiefComplaint: pendingInstantConsultation.chiefComplaint,
            // 결제 정보를 최상위 레벨에 직접 추가 (QNA와 동일한 방식)
            paymentKey,
            orderId,
            amount: parseInt(amount),
            paymentMethod: 'CARD'
          };

          console.log('상담방 생성 요청 데이터:', consultationCreateData);
          const response = await consultationRoomApi.createConsultation(consultationCreateData);
          console.log('상담방 생성 응답:', response);
          
          if (response.success && response.data && response.data.roomUuid) {
            sessionStorage.removeItem('pendingInstantConsultation');
            
            setConsultationInfo({
              consultationType: 'INSTANT',
              roomUuid: response.data.roomUuid,
              vetName: pendingInstantConsultation.expertInfo?.vet?.name || '수의사'
            });
            setLoading(false);

            // 3초 후 상담 대기실로 이동
            setTimeout(() => {
              navigate(`/consultation/waiting/${response.data.roomUuid}`);
            }, 3000);
          } else {
            throw new Error('상담방 생성에 실패했습니다.');
          }
          
        } else if (pendingConsultation.consultationData) {
          // 기존 실시간 상담 처리
          const consultationCreateData = {
            ...pendingConsultation.consultationData,
            petId: pendingConsultation.pet.petId,
            symptoms: pendingConsultation.symptoms || '',
            paymentInfo: {
              paymentKey,
              orderId,
              amount: parseInt(amount),
              paymentMethod: 'CARD',
              status: 'COMPLETED'
            }
          };

          const response = await consultationRoomApi.createConsultation(consultationCreateData);
          sessionStorage.removeItem('pendingConsultation');
          
          setConsultationInfo(response.data);
          setLoading(false);

          // 3초 후 상담 대기실로 이동
          setTimeout(() => {
            if (response.data.roomUuid) {
              navigate(`/consultation/waiting/${response.data.roomUuid}`);
            }
          }, 3000);
        } else {
          throw new Error('상담 정보를 찾을 수 없습니다.');
        }

      } catch (error) {
        console.error('Error processing payment success:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    processPaymentSuccess();
  }, [location, navigate]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>결제 처리 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>❌</div>
          <h2>결제 처리 오류</h2>
          <p className={styles.errorMessage}>{error}</p>
          <button 
            className={styles.retryButton}
            onClick={() => navigate('/health/expert-consult')}
          >
            다시 시도하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.successContainer}>
        <div className={styles.successIcon}>✅</div>
        <h1>결제가 완료되었습니다!</h1>
        <p className={styles.successMessage}>
          {consultationInfo?.consultationType === 'QNA' 
            ? 'Q&A 상담이 성공적으로 등록되었습니다.' 
            : consultationInfo?.consultationType === 'INSTANT'
            ? '실시간 상담이 성공적으로 예약되었습니다.'
            : '상담이 성공적으로 예약되었습니다.'}
        </p>
        
        {consultationInfo && (
          <div className={styles.consultationDetails}>
            <h3>상담 정보</h3>
            {consultationInfo.consultationType === 'QNA' ? (
              <>
                <div className={styles.detailItem}>
                  <span className={styles.label}>상담 유형:</span>
                  <span className={styles.value}>Q&A 상담</span>
                </div>
                {consultationInfo.title && (
                  <div className={styles.detailItem}>
                    <span className={styles.label}>질문 제목:</span>
                    <span className={styles.value}>{consultationInfo.title}</span>
                  </div>
                )}
              </>
            ) : consultationInfo.consultationType === 'INSTANT' ? (
              <>
                <div className={styles.detailItem}>
                  <span className={styles.label}>상담 유형:</span>
                  <span className={styles.value}>실시간 채팅 상담</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>상담 번호:</span>
                  <span className={styles.value}>{consultationInfo.roomUuid}</span>
                </div>
                {consultationInfo.vetName && (
                  <div className={styles.detailItem}>
                    <span className={styles.label}>전문가:</span>
                    <span className={styles.value}>{consultationInfo.vetName} 수의사</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className={styles.detailItem}>
                  <span className={styles.label}>상담 번호:</span>
                  <span className={styles.value}>{consultationInfo.roomUuid || consultationInfo.roomId}</span>
                </div>
                {consultationInfo.vetName && (
                  <div className={styles.detailItem}>
                    <span className={styles.label}>전문가:</span>
                    <span className={styles.value}>{consultationInfo.vetName} 수의사</span>
                  </div>
                )}
              </>
            )}
            {consultationInfo.scheduledTime && (
              <div className={styles.detailItem}>
                <span className={styles.label}>예약 시간:</span>
                <span className={styles.value}>{consultationInfo.scheduledTime}</span>
              </div>
            )}
          </div>
        )}
        
        <p className={styles.redirect}>
          잠시 후 {consultationInfo?.consultationType === 'QNA' ? '마이페이지' : '상담 대기실'}로 이동합니다...
        </p>
        
        <div className={styles.progressBar}>
          <div className={styles.progressFill}></div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;