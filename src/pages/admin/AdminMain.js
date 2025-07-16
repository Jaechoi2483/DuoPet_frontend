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

  // 💡 AI 챗봇 동기화 관련 상태 추가
  const [chatbotSyncLoading, setChatbotSyncLoading] = useState(false);
  const [chatbotSyncMessage, setChatbotSyncMessage] = useState('');
  const [chatbotSyncStatus, setChatbotSyncStatus] = useState('');

  useEffect(() => {
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
      setSyncMessage('공공 API 데이터 동기화가 성공적으로 시작되었습니다. 잠시 후 데이터가 업데이트됩니다.');
    } catch (error) {
      setSyncStatus('error');
      setSyncMessage('동기화 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('동기화 오류:', error);
    } finally {
      setSyncLoading(false);
      // 5초 후 메시지 제거
      setTimeout(() => {
        setSyncMessage('');
        setSyncStatus('');
      }, 5000);
    }
  };

  // 💡 AI 챗봇 데이터 동기화 함수 추가
  const handleSyncChatbotData = async () => {
    if (
      !window.confirm(
        'AI 챗봇의 지식 베이스를 새로고침 하시겠습니까? 사이트를 새로 크롤링하며, 몇 분 정도 소요될 수 있습니다.'
      )
    ) {
      return;
    }

    setChatbotSyncLoading(true);
    setChatbotSyncMessage('');
    setChatbotSyncStatus('');

    try {
      // FastAPI 서버의 관리자용 엔드포인트 호출
      const response = await apiClient.post('/admin/chatbot/resync');

      setChatbotSyncStatus('success');
      setChatbotSyncMessage(response.data?.data?.message || '챗봇 데이터 업데이트 작업이 성공적으로 시작되었습니다.');
    } catch (error) {
      setChatbotSyncStatus('error');
      setChatbotSyncMessage(error.response?.data?.detail || '챗봇 업데이트 시작 중 오류가 발생했습니다.');
      console.error('챗봇 동기화 오류:', error);
    } finally {
      setChatbotSyncLoading(false);
      // 5초 후 메시지 제거
      setTimeout(() => {
        setChatbotSyncMessage('');
        setChatbotSyncStatus('');
      }, 5000);
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

          {/* 💡 관리 기능 섹션을 하나로 묶고 그 안에 각 기능을 배치 */}
          <div className={styles.managementGrid}>
            {/* 공공 API 동기화 섹션 (기존 코드) */}
            <div className={styles.syncSection}>
              <h3>공공 API 데이터 관리</h3>
              <div className={styles.syncContent}>
                <p className={styles.syncDescription}>
                  동물보호관리시스템의 공공 API 데이터를 수동으로 동기화합니다.
                  <br />
                  보호소 및 보호 동물 정보가 업데이트됩니다.
                </p>
                <button
                  className={`${styles.syncButton} ${syncLoading ? styles.syncButtonLoading : ''}`}
                  onClick={() => {
                    alert('공공 API 동기화 기능이 호출되었습니다.');
                    // handleSyncPublicData() 를 실제 사용할 때 주석 해제
                  }}
                  disabled={syncLoading}
                >
                  {syncLoading ? '동기화 중...' : '공공 데이터 동기화'}
                </button>
                {syncMessage && <div className={`${styles.syncMessage} ${styles[syncStatus]}`}>{syncMessage}</div>}
              </div>
            </div>

            {/* 💡 AI 챗봇 동기화 섹션 추가 */}
            <div className={styles.syncSection}>
              <h3>AI 챗봇 데이터 관리</h3>
              <div className={styles.syncContent}>
                <p className={styles.syncDescription}>
                  웹사이트의 최신 내용을 다시 크롤링하여 AI 챗봇의 지식 베이스를 업데이트합니다.
                  <br />
                  새로운 공지나 내용 변경 시 실행해주세요.
                </p>
                <button
                  className={`${styles.syncButton} ${chatbotSyncLoading ? styles.syncButtonLoading : ''}`}
                  onClick={handleSyncChatbotData}
                  disabled={chatbotSyncLoading}
                >
                  {chatbotSyncLoading ? '업데이트 중...' : '챗봇 지식 업데이트'}
                </button>
                {chatbotSyncMessage && (
                  <div className={`${styles.syncMessage} ${styles[chatbotSyncStatus]}`}>{chatbotSyncMessage}</div>
                )}
              </div>
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
