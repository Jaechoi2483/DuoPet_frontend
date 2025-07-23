// src/components/health/ModelStatus.js
import React, { useState, useEffect } from 'react';
import styles from './ModelStatus.module.css';

const ModelStatus = ({ isVisible, onClose }) => {
  const [modelStatus, setModelStatus] = useState(null);
  const [errorStats, setErrorStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isVisible) {
      fetchModelStatus();
      fetchErrorStats();
    }
  }, [isVisible]);

  const fetchModelStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/behavior-analysis/model-status');
      const data = await response.json();
      if (data.success) {
        setModelStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch model status:', error);
    }
  };

  const fetchErrorStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/behavior-analysis/error-stats');
      const data = await response.json();
      if (data.success) {
        setErrorStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch error stats:', error);
    }
  };

  const handleResetModels = async () => {
    if (!window.confirm('모든 AI 모델을 초기화하시겠습니까? 진행 중인 분석이 중단될 수 있습니다.')) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/v1/behavior-analysis/reset-models', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage('모델이 성공적으로 초기화되었습니다.');
        // 상태 재조회
        setTimeout(() => {
          fetchModelStatus();
          fetchErrorStats();
        }, 1000);
      } else {
        setMessage('모델 초기화에 실패했습니다.');
      }
    } catch (error) {
      setMessage('서버 오류가 발생했습니다.');
      console.error('Failed to reset models:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetErrorStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/behavior-analysis/reset-error-stats', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage('에러 통계가 초기화되었습니다.');
        fetchErrorStats();
      }
    } catch (error) {
      console.error('Failed to reset error stats:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>AI 모델 상태</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          {/* 모델 로드 상태 */}
          <div className={styles.section}>
            <h3>모델 로드 상태</h3>
            {modelStatus?.loaded_models && (
              <div className={styles.modelList}>
                {Object.entries(modelStatus.loaded_models).map(([model, isLoaded]) => (
                  <div key={model} className={styles.modelItem}>
                    <span className={styles.modelName}>{model}</span>
                    <span className={`${styles.status} ${isLoaded ? styles.loaded : styles.notLoaded}`}>
                      {isLoaded ? '✓ 로드됨' : '× 미로드'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GPU 정보 */}
          {modelStatus?.gpu_info?.available && (
            <div className={styles.section}>
              <h3>GPU 정보</h3>
              <div className={styles.gpuInfo}>
                <div>디바이스: {modelStatus.gpu_info.device_name}</div>
                <div>메모리 사용: {modelStatus.gpu_info.memory_allocated_gb.toFixed(2)} GB / {modelStatus.gpu_info.memory_total_gb.toFixed(2)} GB</div>
                <div>예약된 메모리: {modelStatus.gpu_info.memory_reserved_gb.toFixed(2)} GB</div>
              </div>
            </div>
          )}

          {/* 에러 통계 */}
          {errorStats && (
            <div className={styles.section}>
              <h3>에러 통계</h3>
              <div className={styles.errorStats}>
                <div>총 에러 수: {errorStats.total_errors}</div>
                {errorStats.error_statistics.length > 0 ? (
                  <div className={styles.errorList}>
                    {errorStats.error_statistics.map((stat, index) => (
                      <div key={index} className={styles.errorItem}>
                        <span>{stat.error_type}: {stat.count}회</span>
                        {stat.last_occurrence && (
                          <span className={styles.errorTime}>
                            마지막 발생: {new Date(stat.last_occurrence).toLocaleString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noErrors}>에러가 없습니다</div>
                )}
              </div>
            </div>
          )}

          {/* 메시지 표시 */}
          {message && (
            <div className={styles.message}>{message}</div>
          )}

          {/* 액션 버튼 */}
          <div className={styles.actions}>
            <button 
              className={styles.resetButton}
              onClick={handleResetModels}
              disabled={isLoading}
            >
              {isLoading ? '초기화 중...' : '모델 초기화'}
            </button>
            {errorStats?.total_errors > 0 && (
              <button 
                className={styles.clearButton}
                onClick={handleResetErrorStats}
              >
                에러 통계 초기화
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelStatus;