import { loadTossPayments } from '@tosspayments/payment-sdk';

// 상담 유형별 가격 정의 (모두 30,000원으로 통일)
export const CONSULTATION_PRICES = {
  INSTANT: 30000,    // 실시간 상담
  QNA: 30000,        // Q&A 상담
  CHAT: 30000,       // 채팅 상담
  VIDEO: 30000,      // 비디오 상담 (향후 추가용)
};

// 토스페이먼츠 초기화
export const initTossPayments = async () => {
  const clientKey = process.env.REACT_APP_TOSS_CLIENT_KEY;
  return await loadTossPayments(clientKey);
};

// 결제 요청 파라미터 생성
export const createPaymentParams = (consultationData, userInfo) => {
  const consultationType = consultationData.consultationType || 'CHAT';
  const amount = CONSULTATION_PRICES[consultationType] || 30000;
  
  // 상담 유형별 한글명
  const consultationTypeKr = {
    INSTANT: '실시간 상담',
    QNA: 'Q&A 상담',
    CHAT: '채팅 상담',
    VIDEO: '비디오 상담'
  };
  
  return {
    amount,
    orderId: `CONSULT_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    orderName: `${consultationTypeKr[consultationType] || '상담'} - ${consultationData.vetName}`,
    customerName: userInfo.name || userInfo.username || '고객',
    customerEmail: userInfo.email || '',
    customerMobilePhone: (userInfo.phone || userInfo.mobilePhone || '').replace(/-/g, ''), // 하이픈 제거
    successUrl: `${window.location.origin}/consultation/payment/success`,
    failUrl: `${window.location.origin}/consultation/payment/fail`,
    // 메타데이터 추가 (상담 정보)
    metadata: {
      consultationType,
      vetId: consultationData.vetId,
      petId: consultationData.petId,
      scheduleId: consultationData.scheduleId,
      userId: userInfo.userId
    }
  };
};

// 결제 금액 포맷팅
export const formatPrice = (price) => {
  return price.toLocaleString('ko-KR') + '원';
};