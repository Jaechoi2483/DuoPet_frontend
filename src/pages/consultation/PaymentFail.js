import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './PaymentFail.module.css';

const PaymentFail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL 파라미터에서 에러 정보 추출
  const searchParams = new URLSearchParams(location.search);
  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');

  const getErrorMessage = (code, message) => {
    if (message) return message;
    
    // 토스페이먼츠 에러 코드별 메시지
    const errorMessages = {
      'PAY_PROCESS_CANCELED': '결제가 취소되었습니다.',
      'PAY_PROCESS_ABORTED': '결제가 중단되었습니다.',
      'REJECT_CARD_COMPANY': '카드사에서 결제를 거절했습니다.',
      'REJECT_TOSSPAYMENTS': '결제가 거절되었습니다.',
      'BELOW_MINIMUM_AMOUNT': '최소 결제 금액 이하입니다.',
      'EXCEED_MAX_AMOUNT': '최대 결제 금액을 초과했습니다.',
      'INVALID_CARD_NUMBER': '잘못된 카드 번호입니다.',
      'INVALID_CARD_EXPIRATION': '카드 유효기간이 만료되었습니다.',
      'NOT_SUPPORTED_CARD': '지원하지 않는 카드입니다.',
      'CARD_LIMIT_EXCEED': '카드 한도를 초과했습니다.'
    };
    
    return errorMessages[code] || '결제 처리 중 오류가 발생했습니다.';
  };

  return (
    <div className={styles.container}>
      <div className={styles.failContainer}>
        <div className={styles.failIcon}>❌</div>
        <h1>결제에 실패했습니다</h1>
        
        <div className={styles.errorInfo}>
          <p className={styles.errorMessage}>
            {getErrorMessage(errorCode, errorMessage)}
          </p>
          {errorCode && (
            <p className={styles.errorCode}>오류 코드: {errorCode}</p>
          )}
        </div>
        
        <div className={styles.notice}>
          <p>결제가 정상적으로 처리되지 않았습니다.</p>
          <p>잠시 후 다시 시도해 주세요.</p>
        </div>
        
        <div className={styles.buttonGroup}>
          <button 
            className={styles.retryButton}
            onClick={() => navigate('/health/expert-consult')}
          >
            다시 시도하기
          </button>
          <button 
            className={styles.homeButton}
            onClick={() => navigate('/')}
          >
            홈으로 가기
          </button>
        </div>
        
        <div className={styles.helpText}>
          <p>계속해서 문제가 발생하면 고객센터로 문의해 주세요.</p>
          <p className={styles.contactInfo}>
            📞 고객센터: 1588-1234 (평일 09:00 ~ 18:00)
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;