import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ConsultationWaitingPage.module.css';
import { consultationRoomApi } from '../../api/consultationApi';
import Loading from '../../components/common/Loading';

const ConsultationWaitingPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [consultationData, setConsultationData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [status, setStatus] = useState('PENDING'); // PENDING, APPROVED, REJECTED, TIMEOUT
  const [loading, setLoading] = useState(true);
  const [errorCount, setErrorCount] = useState(0);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    let timer = null;
    let statusPoller = null;
    
    // 컴포넌트가 마운트된 상태임을 표시
    setIsMounted(true);
    
    // 상담실 정보 로드
    loadConsultationData();

    // 30초 타이머 시작
    timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timer) clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 상태 확인 폴링 (3초마다) - 에러가 3번 이상 발생하면 중단
    statusPoller = setInterval(() => {
      if (errorCount < 3 && status === 'PENDING') {
        checkConsultationStatus();
      } else if (errorCount >= 3) {
        console.log('Too many errors, stopping status polling');
        if (statusPoller) clearInterval(statusPoller);
      }
    }, 3000);

    return () => {
      setIsMounted(false);
      if (timer) clearInterval(timer);
      if (statusPoller) clearInterval(statusPoller);
    };
  }, [roomId, errorCount, status]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadConsultationData = async () => {
    try {
      const response = await consultationRoomApi.getConsultationDetail(roomId);
      if (response.success && isMounted) {
        setConsultationData(response.data);
        
        // 이미 승인되었으면 채팅으로 이동
        if (response.data.status === 'APPROVED') {
          navigate(`/consultation/chat/${roomId}`);
        } else if (response.data.status === 'REJECTED') {
          setStatus('REJECTED');
        }
      }
    } catch (err) {
      console.error('Error loading consultation:', err);
      if (isMounted) {
        setErrorCount(prev => prev + 1);
        // 첫 번째 로드 실패 시에만 alert 표시
        if (errorCount === 0) {
          alert('상담 정보를 불러올 수 없습니다.');
          navigate('/health/expert');
        }
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  const checkConsultationStatus = async () => {
    // 이미 타임아웃이나 다른 최종 상태면 체크하지 않음
    if (status !== 'PENDING' || !isMounted) {
      return;
    }
    
    try {
      const response = await consultationRoomApi.getConsultationDetail(roomId);
      if (response.success && isMounted) {
        if (response.data.status === 'APPROVED') {
          setStatus('APPROVED');
          // 2초 후 채팅으로 이동
          setTimeout(() => {
            if (isMounted) {
              navigate(`/consultation/chat/${roomId}`);
            }
          }, 2000);
        } else if (response.data.status === 'REJECTED') {
          setStatus('REJECTED');
        }
      }
    } catch (err) {
      console.error('Status check error:', err);
      if (isMounted) {
        setErrorCount(prev => prev + 1);
      }
    }
  };

  const handleTimeout = () => {
    setStatus('TIMEOUT');
    // 타임아웃 처리 API 호출
    consultationRoomApi.cancelConsultation(roomId);
  };

  const handleCancel = async () => {
    if (window.confirm('상담 요청을 취소하시겠습니까?')) {
      try {
        await consultationRoomApi.cancelConsultation(roomId);
        alert('상담 요청이 취소되었습니다.');
        navigate('/health/expert');
      } catch (err) {
        alert('취소 처리 중 오류가 발생했습니다.');
      }
    }
  };

  const handleGoBack = () => {
    navigate('/health/expert');
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.waitingCard}>
        {status === 'PENDING' && (
          <>
            <div className={styles.loadingSection}>
              <div className={styles.spinner}></div>
              <h2 className={styles.title}>상담 요청 대기 중</h2>
              <p className={styles.subtitle}>전문가의 승인을 기다리고 있습니다</p>
            </div>

            <div className={styles.timerSection}>
              <div className={styles.timerCircle}>
                <span className={styles.timerText}>{timeLeft}</span>
                <span className={styles.timerUnit}>초</span>
              </div>
              <p className={styles.timerInfo}>
                남은 대기 시간
              </p>
            </div>

            {consultationData && (
              <div className={styles.infoSection}>
                <h3 className={styles.infoTitle}>상담 정보</h3>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>전문가:</span>
                  <span className={styles.infoValue}>
                    {consultationData.vetName || '정보 없음'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>반려동물:</span>
                  <span className={styles.infoValue}>
                    {consultationData.petName || '정보 없음'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>증상:</span>
                  <span className={styles.infoValue}>
                    {consultationData.chiefComplaint || '정보 없음'}
                  </span>
                </div>
              </div>
            )}

            <div className={styles.actions}>
              <button 
                className={styles.cancelButton}
                onClick={handleCancel}
              >
                요청 취소
              </button>
            </div>
          </>
        )}

        {status === 'APPROVED' && (
          <div className={styles.resultSection}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.resultTitle}>상담이 승인되었습니다!</h2>
            <p className={styles.resultMessage}>
              잠시 후 채팅창으로 이동합니다...
            </p>
          </div>
        )}

        {status === 'REJECTED' && (
          <div className={styles.resultSection}>
            <div className={styles.failIcon}>✕</div>
            <h2 className={styles.resultTitle}>상담이 거절되었습니다</h2>
            <p className={styles.resultMessage}>
              전문가가 현재 상담을 받을 수 없습니다.<br />
              다른 전문가를 선택해주세요.
            </p>
            <button 
              className={styles.primaryButton}
              onClick={handleGoBack}
            >
              전문가 목록으로 돌아가기
            </button>
          </div>
        )}

        {status === 'TIMEOUT' && (
          <div className={styles.resultSection}>
            <div className={styles.warningIcon}>⚠</div>
            <h2 className={styles.resultTitle}>대기 시간이 초과되었습니다</h2>
            <p className={styles.resultMessage}>
              전문가가 응답하지 않아 자동으로 취소되었습니다.<br />
              다시 시도하거나 다른 전문가를 선택해주세요.
            </p>
            <button 
              className={styles.primaryButton}
              onClick={handleGoBack}
            >
              전문가 목록으로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationWaitingPage;