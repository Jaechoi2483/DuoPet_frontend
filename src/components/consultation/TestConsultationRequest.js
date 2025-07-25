import React, { useState } from 'react';
import { consultationRoomApi } from '../../api/consultationApi';
import styles from './TestConsultationRequest.module.css';

const TestConsultationRequest = ({ vetId }) => {
  const [loading, setLoading] = useState(false);
  
  const sendTestRequest = async () => {
    if (!vetId) {
      alert('수의사 ID가 필요합니다.');
      return;
    }
    
    setLoading(true);
    try {
      // 테스트용 즉시 상담 요청 생성
      const testData = {
        vetId: vetId,
        petId: 1, // 테스트용 pet ID
        consultationType: 'INSTANT',
        chiefComplaint: '테스트 상담 요청입니다. 우리 강아지가 기침을 해요.',
        symptoms: '어제부터 기침을 하고 있습니다. 열은 없는 것 같아요.'
      };
      
      const response = await consultationRoomApi.createInstantConsultation(testData);
      console.log('Test consultation created:', response);
      alert('테스트 상담 요청이 전송되었습니다!');
    } catch (error) {
      console.error('Error creating test consultation:', error);
      alert('테스트 상담 요청 실패: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={styles.testContainer}>
      <h4>테스트 상담 요청</h4>
      <p>수의사 ID: {vetId}</p>
      <button 
        onClick={sendTestRequest}
        disabled={loading}
        className={styles.testButton}
      >
        {loading ? '전송 중...' : '테스트 상담 요청 보내기'}
      </button>
    </div>
  );
};

export default TestConsultationRequest;