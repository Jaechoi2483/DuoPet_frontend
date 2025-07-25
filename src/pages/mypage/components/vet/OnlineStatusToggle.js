import React, { useState, useEffect } from 'react';
import { vetProfileApi } from '../../../../api/consultationApi';
import apiClient from '../../../../utils/axios';
import styles from './OnlineStatusToggle.module.css';

const OnlineStatusToggle = ({ vetId, initialStatus }) => {
  const [isOnline, setIsOnline] = useState(initialStatus === 'Y' || false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // 현재 온라인 상태 조회
  useEffect(() => {
    const fetchStatus = async () => {
      if (!vetId) {
        setIsLoading(false);
        return;
      }
      
      // initialStatus가 있으면 API 호출 건너뛰기
      if (initialStatus !== null && initialStatus !== undefined) {
        console.log('[OnlineStatusToggle] initialStatus 사용:', initialStatus);
        setIsOnline(initialStatus === 'Y');
        localStorage.setItem(`vet_online_status_${vetId}`, initialStatus);
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('[OnlineStatusToggle] 상태 조회 시작 - vetId:', vetId);
        const response = await vetProfileApi.getVetDetail(vetId);
        console.log('[OnlineStatusToggle] API 응답:', response);
        
        if (response && response.data) {
          const vetProfile = response.data.data || response.data;
          console.log('[OnlineStatusToggle] VetProfile 데이터:', vetProfile);
          console.log('[OnlineStatusToggle] isOnline 값:', vetProfile.isOnline);
          
          setIsOnline(vetProfile.isOnline === 'Y');
          // 상태를 로컬스토리지에도 저장
          localStorage.setItem(`vet_online_status_${vetId}`, vetProfile.isOnline);
        }
      } catch (error) {
        console.error('[OnlineStatusToggle] 상태 조회 실패:', error);
        // 에러 발생 시 로컬스토리지에서 이전 상태 복원
        const savedStatus = localStorage.getItem(`vet_online_status_${vetId}`);
        if (savedStatus) {
          console.log('[OnlineStatusToggle] 저장된 상태 사용:', savedStatus);
          setIsOnline(savedStatus === 'Y');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [vetId, initialStatus]);

  // 상태 변경 핸들러
  const handleStatusChange = async (checked) => {
    console.log('상태 변경 시작:', { vetId, checked, isUpdating });
    
    if (!vetId) {
      alert('수의사 정보를 찾을 수 없습니다.');
      return;
    }
    
    // 토큰 확인
    const token = localStorage.getItem('accessToken');
    console.log('현재 토큰:', token ? `있음 (${token.substring(0, 20)}...)` : '없음');
    
    setIsUpdating(true);
    try {
      console.log('API 호출 전:', { vetId, checked });
      const response = await vetProfileApi.updateOnlineStatus(vetId, checked);
      console.log('API 응답:', response);
      
      // axios response는 response.data에 실제 데이터가 있음
      if (response && response.data && response.data.success) {
        setIsOnline(checked);
        // 로컬스토리지에도 저장
        localStorage.setItem(`vet_online_status_${vetId}`, checked ? 'Y' : 'N');
        const message = response.data.message || (checked ? '온라인 상태로 변경되었습니다.' : '오프라인 상태로 변경되었습니다.');
        alert(message);
      } else if (response && response.success) {
        // 다른 형식의 응답일 경우
        setIsOnline(checked);
        // 로컬스토리지에도 저장
        localStorage.setItem(`vet_online_status_${vetId}`, checked ? 'Y' : 'N');
        const message = checked ? '온라인 상태로 변경되었습니다.' : '오프라인 상태로 변경되었습니다.';
        alert(message);
      } else {
        throw new Error('응답이 성공하지 않았습니다.');
      }
    } catch (error) {
      console.error('상태 변경 실패:', error);
      console.error('에러 상세:', error.response);
      alert('상태 변경에 실패했습니다.');
      // 실패 시 원래 상태로 복원
      setIsOnline(!checked);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>상태를 불러오는 중...</div>;
  }

  return (
    <div className={styles.onlineStatusContainer}>
      <h3 className={styles.statusTitle}>상담 가능 상태</h3>
      <div className={styles.statusToggleWrapper}>
        <span className={styles.statusLabel}>
          현재 상태: <span className={isOnline ? styles.onlineText : styles.offlineText}>
            {isOnline ? '온라인' : '오프라인'}
          </span>
        </span>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={isOnline}
            onChange={(e) => handleStatusChange(e.target.checked)}
            disabled={isUpdating}
          />
          <span className={styles.slider}></span>
        </label>
      </div>
      {isOnline && (
        <p className={styles.statusInfo}>
          일반 사용자가 전문가 상담 페이지에서 회원님을 확인할 수 있습니다.
        </p>
      )}
      {!isOnline && (
        <p className={styles.statusInfo}>
          일반 사용자에게 오프라인으로 표시됩니다. 예약 상담만 가능합니다.
        </p>
      )}
    </div>
  );
};

export default OnlineStatusToggle;