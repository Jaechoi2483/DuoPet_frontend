// src/pages/consultation/ConsultationWaitingPage.js (전체 교체)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ConsultationWaitingPage.module.css';
import { consultationRoomApi } from '../../api/consultationApi';
import Loading from '../../components/common/Loading';
import websocketService from '../../services/websocketService';

const ConsultationWaitingPage = () => {
  const { roomUuid } = useParams(); // 💡 1. roomId를 roomUuid로 변경
  const navigate = useNavigate();
  const [consultationData, setConsultationData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [status, setStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [errorCount, setErrorCount] = useState(0);
  const [isPollingActive, setIsPollingActive] = useState(true); // 폴링 활성화 상태 추가

  useEffect(() => {
    let timer = null;
    let statusPoller = null;
    let isMounted = true;
    let shouldStartPolling = true;

    const loadConsultationData = async () => {
      try {
        // 💡 2. roomUuid를 사용하여 API를 호출합니다.
        const response = await consultationRoomApi.getConsultationDetailByUuid(roomUuid);
        if (response.success && isMounted) {
          setConsultationData(response.data);
          
          // 이미 종료된 상태인지 확인
          if (response.data.roomStatus === 'IN_PROGRESS') {
            navigate(`/consultation/chat/${roomUuid}`);
          } else if (response.data.roomStatus === 'TIMED_OUT') {
            // 명시적 타임아웃 상태
            setStatus('TIMEOUT');
            setTimeLeft(0);
            shouldStartPolling = false;
          } else if (response.data.roomStatus === 'REJECTED') {
            // 명시적 거절 상태
            setStatus('REJECTED');
            shouldStartPolling = false;
          } else if (response.data.roomStatus === 'CANCELLED') {
            // 기타 취소 상태 (사용자 취소 등)
            setStatus('CANCELLED');
            shouldStartPolling = false;
          }
        }
      } catch (err) {
        console.error('Error loading consultation:', err);
        if (isMounted) {
          setErrorCount((prev) => prev + 1);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const checkConsultationStatus = async () => {
      if (status !== 'PENDING' || !isMounted || !isPollingActive) return; // 폴링 활성화 체크 추가
      try {
        // 💡 3. roomUuid를 사용하여 API를 호출합니다.
        const response = await consultationRoomApi.getConsultationDetailByUuid(roomUuid);
        console.log('[ConsultationWaitingPage] API 응답:', {
          roomStatus: response.data?.roomStatus,
          consultationNotes: response.data?.consultationNotes
        });
        
        if (response.success && isMounted && status === 'PENDING') {
          if (response.data.roomStatus === 'IN_PROGRESS') {
            console.log('[ConsultationWaitingPage] 상담 승인됨 - IN_PROGRESS');
            setStatus('APPROVED');
            clearInterval(timer);
            clearInterval(statusPoller);
            setTimeout(() => {
              if (isMounted) navigate(`/consultation/chat/${roomUuid}`);
            }, 2000);
          } else if (response.data.roomStatus === 'TIMED_OUT') {
            console.log('[ConsultationWaitingPage] 명시적 TIMED_OUT 상태');
            setStatus('TIMEOUT');
            clearInterval(timer);
            clearInterval(statusPoller);
          } else if (response.data.roomStatus === 'REJECTED') {
            console.log('[ConsultationWaitingPage] 명시적 REJECTED 상태');
            setStatus('REJECTED');
            clearInterval(timer);
            clearInterval(statusPoller);
          } else if (response.data.roomStatus === 'CANCELLED') {
            console.log('[ConsultationWaitingPage] CANCELLED 상태 (사용자 취소 등)');
            setStatus('CANCELLED');
            clearInterval(timer);
            clearInterval(statusPoller);
          }
        }
      } catch (err) {
        console.error('Status check error:', err);
        if (isMounted) setErrorCount((prev) => prev + 1);
      }
    };

    // 데이터 로드를 먼저 완료하고 나서 타이머/폴링 시작
    loadConsultationData().then(() => {
      if (!shouldStartPolling || !isMounted) return;

        // 타임아웃 처리를 위한 시작 시간 기록
        const startTime = Date.now();
        window.consultationStartTime = startTime; // 전역 변수로 저장

        // WebSocket 상태 변경 알림 구독
        if (websocketService.isConnected()) {
          console.log('[ConsultationWaitingPage] WebSocket 상태 변경 구독 시작');
          websocketService.subscribeToStatusChanges(roomUuid, (statusData) => {
            console.log('[ConsultationWaitingPage] 상태 변경 알림 수신:', JSON.stringify(statusData));
            
            // WebSocket 메시지 타입과 roomUuid 확인
            if (statusData.type === 'STATUS_CHANGE' && statusData.roomUuid === roomUuid) {
              console.log('[ConsultationWaitingPage] 상태 변경 처리:', statusData.status);
              
              if (statusData.status === 'TIMED_OUT') {
                console.log('[ConsultationWaitingPage] 타임아웃 상태로 변경');
                setStatus('TIMEOUT');
                setIsPollingActive(false); // 폴링 즉시 중단
                clearInterval(timer);
                clearInterval(statusPoller);
              } else if (statusData.status === 'APPROVED') {
                console.log('[ConsultationWaitingPage] 승인 상태로 변경');
                setStatus('APPROVED');
                setIsPollingActive(false); // 폴링 즉시 중단
                clearInterval(timer);
                clearInterval(statusPoller);
                setTimeout(() => {
                  if (isMounted) navigate(`/consultation/chat/${roomUuid}`);
                }, 2000);
              } else if (statusData.status === 'REJECTED') {
                console.log('[ConsultationWaitingPage] 거절 상태로 변경');
                setStatus('REJECTED');
                setIsPollingActive(false); // 폴링 즉시 중단
                clearInterval(timer);
                clearInterval(statusPoller);
              } else {
                console.log('[ConsultationWaitingPage] 알 수 없는 상태:', statusData.status);
              }
            } else {
              console.log('[ConsultationWaitingPage] 다른 방의 상태 변경이거나 타입이 다름');
            }
          });
        } else {
          console.log('[ConsultationWaitingPage] WebSocket 연결되지 않음');
        }

        timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              // 타이머가 0이 되면 무조건 타임아웃으로 처리
              console.log('[ConsultationWaitingPage] 30초 타이머 만료 - 타임아웃 처리');
              setStatus('TIMEOUT');
              clearInterval(statusPoller); // 폴링도 중지
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        statusPoller = setInterval(() => {
          if (errorCount < 3 && status === 'PENDING' && isPollingActive) {
            checkConsultationStatus();
          } else if (errorCount >= 3 || !isPollingActive) {
            clearInterval(statusPoller);
          }
        }, 3000);
      });

    return () => {
      isMounted = false;
      clearInterval(timer);
      clearInterval(statusPoller);
      // WebSocket 구독 해제
      if (websocketService.isConnected()) {
        websocketService.unsubscribeFromStatusChanges(roomUuid);
      }
      // 전역 변수 정리
      delete window.consultationStartTime;
    };
  }, [roomUuid, errorCount, status, navigate, isPollingActive]);

  const handleCancel = async () => {
    if (window.confirm('상담 요청을 취소하시겠습니까?')) {
      try {
        // 💡 5. 상담 취소 API는 숫자 roomId를 필요로 합니다.
        await consultationRoomApi.cancelConsultation(consultationData.roomId, '사용자 취소');
        alert('상담 요청이 취소되었습니다.');
        navigate('/health/expert-consult');
      } catch (err) {
        alert('취소 처리 중 오류가 발생했습니다.');
      }
    }
  };

  const handleGoBack = () => navigate('/health/expert-consult');
  if (loading) return <Loading />;

  return (
    <div className={styles.container}>
      {status === 'PENDING' && (
        <div className={styles.waitingCard}>
          <div className={styles.header}>
            <h2 className={styles.title}>전문가 연결 중...</h2>
            <div className={styles.timer}>
              <span className={styles.timeNumber}>{timeLeft}</span>
              <span className={styles.timeUnit}>초</span>
            </div>
          </div>
          
          <div className={styles.content}>
            <div className={styles.animationWrapper}>
              <div className={styles.pulseCircle}></div>
              <div className={styles.iconWrapper}>
                <span className={styles.vetIcon}>🩺</span>
              </div>
            </div>
            
            <p className={styles.message}>
              {consultationData?.vetName ? (
                <>
                  {consultationData.vetName} 전문가의<br />
                  상담 수락을 기다리고 있습니다.
                </>
              ) : (
                <>
                  전문가의 상담 수락을<br />
                  기다리고 있습니다.
                </>
              )}
            </p>
            
            {consultationData && (
              <div className={styles.consultationInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>반려동물:</span>
                  <span className={styles.value}>
                    {consultationData.petName || '정보 없음'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>증상:</span>
                  <span className={styles.value}>
                    {consultationData.chiefComplaint || '증상 정보 없음'}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.actions}>
            <button 
              className={styles.cancelButton}
              onClick={handleCancel}
            >
              상담 취소
            </button>
          </div>
        </div>
      )}
      
      {status === 'APPROVED' && (
        <div className={styles.approvedCard}>
          <div className={styles.successIcon}>✅</div>
          <h2 className={styles.successTitle}>전문가와 연결되었습니다!</h2>
          <p className={styles.successMessage}>
            잠시 후 상담 화면으로 이동합니다...
          </p>
        </div>
      )}
      
      {status === 'TIMEOUT' && (
        <div className={styles.timeoutCard}>
          <div className={styles.failIcon}>⏰</div>
          <h2 className={styles.failTitle}>연결 시간이 초과되었습니다</h2>
          <p className={styles.failMessage}>
            전문가가 30초 내에 응답하지 않았습니다.<br />
            잠시 후 다시 시도해주세요.
          </p>
          <button 
            className={styles.backButton}
            onClick={handleGoBack}
          >
            돌아가기
          </button>
        </div>
      )}
      
      {status === 'REJECTED' && (
        <div className={styles.rejectedCard}>
          <div className={styles.failIcon}>❌</div>
          <h2 className={styles.failTitle}>상담이 거절되었습니다</h2>
          <p className={styles.failMessage}>
            전문가가 상담을 수락하지 않았습니다.<br />
            다른 전문가를 선택해주세요.
          </p>
          <button 
            className={styles.backButton}
            onClick={handleGoBack}
          >
            돌아가기
          </button>
        </div>
      )}
      
      {status === 'CANCELLED' && (
        <div className={styles.cancelledCard}>
          <div className={styles.failIcon}>🚫</div>
          <h2 className={styles.failTitle}>상담이 취소되었습니다</h2>
          <p className={styles.failMessage}>
            상담이 취소되었습니다.<br />
            필요시 다시 상담을 신청해주세요.
          </p>
          <button 
            className={styles.backButton}
            onClick={handleGoBack}
          >
            돌아가기
          </button>
        </div>
      )}
    </div>
  );
};

export default ConsultationWaitingPage;
