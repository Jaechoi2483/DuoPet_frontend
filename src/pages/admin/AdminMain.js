import React, { useEffect, useState } from 'react';
import styles from './AdminMain.module.css';

import adoptionService from '../../services/adoptionService';

import apiClient from '../../utils/axios';

function BarGraph({ data, total, color }) {
  if (!data || data.length === 0) return <div className={styles.emptyMsg}>데이터 없음</div>;
  return (
    <ul className={styles.barList}>
      {data.map((item) => {
        const percent = total ? Math.round((item.value / total) * 100) : 0;
        return (
          <li key={item.label || item.type} className={styles.barItem}>
            <span className={styles.statsLabel}>{item.label || item.type}</span>
            <div className={styles.barWrapper}>
              <div className={styles.bar} style={{ width: `${percent}%`, background: color || '#1976d2' }} />
            </div>
            <span className={styles.barValue}>
              {item.value.toLocaleString()}명 ({percent}%)
            </span>
          </li>
        );
      })}
    </ul>
  );
}

const donutColors = ['#1976d2', '#388e3c', '#ffb300', '#e57373', '#7e57c2'];

function DonutChart({ data }) {
  if (!data || data.length === 0) return <div className={styles.emptyMsg}>데이터 없음</div>;
  const total = data.reduce((a, b) => a + b.value, 0);
  let startAngle = 0;
  const radius = 48;
  const strokeWidth = 22;
  const center = 60;
  const paths = data.map((item, idx) => {
    const value = item.value;
    const percent = total ? value / total : 0;
    const angle = percent * 360;
    const endAngle = startAngle + angle;
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;
    const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    startAngle += angle;
    return (
      <path key={item.label} d={path} fill={donutColors[idx % donutColors.length]} stroke="#fff" strokeWidth="1" />
    );
  });
  return (
    <div className={styles.donutChartWrap}>
      <svg width="120" height="120" viewBox="0 0 120 120" className={styles.donutSvg}>
        {paths}
        <circle cx="60" cy="60" r={radius - strokeWidth} fill="#fff" />
        <text x="60" y="60" textAnchor="middle" dominantBaseline="middle" fontSize="13" fill="#333"></text>
      </svg>
      <ul className={styles.donutLegend}>
        {data.map((item, idx) => {
          const percent = total ? Math.round((item.value / total) * 100) : 0;
          return (
            <li key={item.label} className={styles.donutLegendItem}>
              <span className={styles.donutLegendColor} style={{ background: donutColors[idx % donutColors.length] }} />
              <span className={styles.donutLegendLabel}>{item.label}</span>
              <span className={styles.donutLegendPercent}>{percent}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AdminMain() {
  const [summary, setSummary] = useState([]); // {label, value}
  const [petStatus, setPetStatus] = useState([]); // {type, value}
  const [memberPetStat, setMemberPetStat] = useState([]); // {label, value}
  const [genderStat, setGenderStat] = useState([]); // {label, value}
  const [loading, setLoading] = useState(true);
  const [neuteredStat, setNeuteredStat] = useState([]);
  const [error, setError] = useState(null);
  const [animalTypeStat, setAnimalTypeStat] = useState([]);

  // 공공 API 동기화 관련 상태
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncStatus, setSyncStatus] = useState(''); // 'success', 'error', ''
  const [lastSyncTime, setLastSyncTime] = useState(() => {
    // localStorage에서 마지막 동기화 시간 불러오기
    return localStorage.getItem('lastSyncTime') || null;
  });

  // 대시보드 데이터 불러오기 함수
  const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // ✅ 1. apiClient를 사용하여 인증된 요청 전송
        const response = await apiClient.get('/admin/dashboard');
        const data = response.data;

        const formattedSummary = (data.summary || []).map((stat) => ({
          label: stat.item,
          value: stat.count,
        }));
        setSummary(formattedSummary);

        const formattedGenderStat = response.data.genderStat.map((stat) => ({
          label: stat.item, // 'item'을 'label'로
          value: stat.count, // 'count'를 'value'로
        }));
        setGenderStat(formattedGenderStat || []);

        const formattedPetCountStat = (data.petCountStat || []).map((stat) => ({
          label: `${stat.item}마리`, // '0', '1' -> '0마리', '1마리'로 라벨을 더 보기 좋게 만듦
          value: stat.count,
        }));
        setMemberPetStat(formattedPetCountStat);

        const formattedAnimalTypeStat = (data.animalTypeStat || []).map((stat) => ({
          label: stat.item,
          value: stat.count,
        }));
        setAnimalTypeStat(formattedAnimalTypeStat);

        const formattedNeuteredStat = (data.neuteredStat || []).map((stat) => ({
          label: stat.item === 'Y' ? '중성화 O' : '중성화 X',
          value: stat.count,
        }));
        setNeuteredStat(formattedNeuteredStat);
      } catch (err) {
        setError('데이터를 불러오지 못했습니다.');
        console.error('대시보드 데이터 조회 실패:', err);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 공공 API 동기화 함수
  const handleSyncPublicData = async () => {
    setSyncLoading(true);
    setSyncMessage('');
    setSyncStatus('');

    try {
      const result = await adoptionService.syncPublicData();
      setSyncStatus('success');
      
      // 동기화 결과 상세 메시지 표시
      if (result && result.data) {
        const { totalProcessed, successCount, failureCount } = result.data;
        setSyncMessage(
          `동기화 완료: 총 ${totalProcessed}건 처리 (성공: ${successCount}건, 실패: ${failureCount}건)`
        );
      } else {
        setSyncMessage('공공 API 데이터 동기화가 성공적으로 완료되었습니다.');
      }
      
      // 마지막 동기화 시간 저장
      const currentTime = new Date().toLocaleString('ko-KR');
      setLastSyncTime(currentTime);
      localStorage.setItem('lastSyncTime', currentTime);
      
      // 데이터 자동 새로고침
      setTimeout(async () => {
        setSyncMessage('데이터를 새로고침하는 중...');
        await fetchDashboardData();
        setSyncMessage('대시보드 데이터가 업데이트되었습니다.');
      }, 1000);
      
    } catch (error) {
      setSyncStatus('error');
      setSyncMessage('동기화 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('동기화 오류:', error);
    } finally {
      setSyncLoading(false);
      // 10초 후 메시지 제거 (이전 5초에서 연장)
      setTimeout(() => {
        setSyncMessage('');
        setSyncStatus('');
      }, 10000);
    }
  };

  return (
    <div className={styles.container}>
      {loading ? (
        <div className={styles.loadingMsg}>로딩 중...</div>
      ) : (
        <>
          {/* 에러 메시지 표시 */}
          {error && <div className={styles.errorMsg}>{error}</div>}

          {/* 상단 요약 카드 */}
          <div className={styles.summaryRow}>
            {summary.length === 0 ? (
              <div className={styles.emptyMsg}>대시보드 데이터를 불러올 수 없습니다.</div>
            ) : (
              summary.map((item) => (
                <div className={styles.summaryCard} key={item.label}>
                  <div className={styles.summaryValue}>{item.value.toLocaleString()}</div>
                  <div className={styles.summaryLabel}>{item.label}</div>
                </div>
              ))
            )}
          </div>

          {/* 공공 API 동기화 섹션 */}
          <div className={styles.syncSection}>
            <h3>공공 API 데이터 관리</h3>
            <div className={styles.syncContent}>
              <p className={styles.syncDescription}>
                동물보호관리시스템의 공공 API 데이터를 수동으로 동기화할 수 있습니다.
                <br />
                보호소 정보와 보호 동물 정보가 업데이트됩니다.
              </p>
              <button
                className={`${styles.syncButton} ${syncLoading ? styles.syncButtonLoading : ''}`}
                onClick={handleSyncPublicData}
                disabled={syncLoading}
              >
                {syncLoading ? '동기화 중...' : '데이터 동기화 실행'}
              </button>
              {lastSyncTime && (
                <div className={styles.lastSyncTime}>
                  마지막 동기화: {lastSyncTime}
                </div>
              )}
              {syncMessage && <div className={`${styles.syncMessage} ${styles[syncStatus]}`}>{syncMessage}</div>}
            </div>
          </div>

          {/* 하단 통계 - 그래프 */}
          <div className={styles.statsGrid}>
            <div className={styles.statsBox}>
              <h3>품종 분포 (개/고양이)</h3>
              <DonutChart data={animalTypeStat} />
            </div>
            <div className={styles.statsBox}>
              <h3>회원 통계 (반려동물 보유)</h3>
              <BarGraph data={memberPetStat} total={memberPetStat.reduce((a, b) => a + b.value, 0)} color="#1976d2" />
            </div>
            <div className={styles.statsBox}>
              <h3>성별 분포</h3>
              <BarGraph data={genderStat} total={genderStat.reduce((a, b) => a + b.value, 0)} color="#e57373" />
            </div>
            <div className={styles.statsBox}>
              <h3>중성화 비율</h3>
              <DonutChart data={neuteredStat} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminMain;
