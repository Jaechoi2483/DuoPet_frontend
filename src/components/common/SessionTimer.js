import React, { useEffect, useState, useRef, useContext } from 'react';
import apiClient from '../../utils/axios';
import styles from './SessionTimer.module.css';
import { AuthContext } from '../../AuthProvider';

const SessionTimer = () => {
  const [remainingTime, setRemainingTime] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const intervalRef = useRef(null);
  const timerRef = useRef(null);
  const { logoutAndRedirect, isLoggedIn } = useContext(AuthContext);

  // localStorage 기반 toastClosed 관리
  const [toastClosed, setToastClosed] = useState(() => {
    return localStorage.getItem('toastClosed') === 'true';
  });

  // localStorage 동기화
  useEffect(() => {
    localStorage.setItem('toastClosed', toastClosed.toString());
  }, [toastClosed]);

  // tokenIssuedAt 기준 세션 만료 시간 계산
  const issuedAt = localStorage.getItem('tokenIssuedAt');
  const expireTime = issuedAt ? parseInt(issuedAt, 10) + 30 * 60 * 1000 : null;

  // 타이머를 실행해야 할지 판단하는 플래그
  const shouldRunTimer = isLoggedIn && !!expireTime;

  const formatTime = (diff) => {
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}분 ${seconds < 10 ? '0' : ''}${seconds}초`;
  };

  // 메인 타이머 동작 useEffect
  useEffect(() => {
    if (!shouldRunTimer) return;

    const checkTime = () => {
      const now = Date.now();
      const diff = expireTime - now;

      setRemainingTime(formatTime(diff));

      if (diff <= 0) {
        clearInterval(intervalRef.current);
        localStorage.clear();
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        logoutAndRedirect();
        return;
      }

      if (diff <= 5 * 60 * 1000 && !toastClosed && !showNotification) {
        setShowNotification(true);
        timerRef.current = setTimeout(() => {
          setShowNotification(false);
          setToastClosed(true);
          console.log('[SessionTimer] ⏳ 알림 자동 닫힘');
        }, 30000);
      }
    };

    intervalRef.current = setInterval(checkTime, 1000);
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timerRef.current);
      console.log('[SessionTimer] 언마운트됨');
    };
  }, [shouldRunTimer, expireTime, toastClosed, showNotification]);

  // 알림 자동 닫기 useEffect (이 부분 새로 추가)
  useEffect(() => {
    if (showNotification) {
      timerRef.current = setTimeout(() => {
        setShowNotification(false);
        setToastClosed(true);
      }, 30000);
    }

    return () => clearTimeout(timerRef.current);
  }, [showNotification]);

  // tokenIssuedAt 변경 감지 → toastClosed 초기화
  useEffect(() => {
    const watcher = setInterval(() => {
      const latest = localStorage.getItem('tokenIssuedAt');
      if (latest && latest !== issuedAt) {
        console.log('[SessionTimer] tokenIssuedAt 변경 감지 → 상태 초기화');
        setToastClosed(false);
        setShowNotification(false);
      }
    }, 1000);
    return () => clearInterval(watcher);
  }, [issuedAt]);

  // 시간 연장 버튼 클릭 시 토큰 재발급
  const handleExtend = async () => {
    try {
      const res = await apiClient.post('/reissue', null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          RefreshToken: `Bearer ${localStorage.getItem('refreshToken')}`,
          ExtendLogin: 'true',
        },
        withCredentials: true,
      });

      const newAccessToken = res.headers['authorization']?.split(' ')[1];
      const newRefreshToken = res.headers['refresh-token']?.split(' ')[1];

      if (!newAccessToken || !newRefreshToken) {
        console.error('❌ 새 토큰이 응답 헤더에 없음!', res.headers);
        throw new Error('토큰 없음');
      }

      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      alert('로그인 시간이 연장되었습니다.');

      // 타이머 재시작을 위한 초기화
      localStorage.setItem('tokenIssuedAt', Date.now().toString());
      localStorage.setItem('toastClosed', 'false');

      setShowNotification(false);
      setToastClosed(false);
    } catch (err) {
      console.error('세션 연장 실패:', err);
      alert('세션 연장에 실패했습니다. 다시 로그인해주세요.');
      logoutAndRedirect();
    }
  };

  // 알림 닫기 버튼 처리
  const handleClose = () => {
    setShowNotification(false);
    setToastClosed(true);
  };

  return (
    <>
      {shouldRunTimer && showNotification && (
        <div className={styles.notification}>
          <div className={styles.message}>
            세션이 곧 만료됩니다.
            <br />
            계속 이용하시려면 시간을 연장해주세요.
            <div className={styles.autoCloseNotice}>※ 30초 후 자동으로 닫힙니다</div>
          </div>
          <div className={styles.timer}>{remainingTime} 남음</div>
          <div className={styles.buttonGroup}>
            <button className={styles.extendBtn} onClick={handleExtend}>
              시간 연장
            </button>
            <button className={styles.closeBtn} onClick={handleClose}>
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionTimer;
