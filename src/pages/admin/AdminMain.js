import React, { useEffect, useState } from 'react';
import styles from './AdminMain.module.css';
import apiClient from '../../utils/axios';

function BarGraph({ data, total, color }) {
  if (!data || data.length === 0)
    return <div className={styles.emptyMsg}>데이터 없음</div>;
  return (
    <ul className={styles.barList}>
      {data.map((item) => {
        const percent = total ? Math.round((item.value / total) * 100) : 0;
        return (
          <li key={item.label || item.type} className={styles.barItem}>
            <span className={styles.statsLabel}>{item.label || item.type}</span>
            <div className={styles.barWrapper}>
              <div
                className={styles.bar}
                style={{ width: `${percent}%`, background: color || '#1976d2' }}
              />
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
  if (!data || data.length === 0)
    return <div className={styles.emptyMsg}>데이터 없음</div>;
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
      <path
        key={item.label}
        d={path}
        fill={donutColors[idx % donutColors.length]}
        stroke="#fff"
        strokeWidth="1"
      />
    );
  });
  return (
    <div className={styles.donutChartWrap}>
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        className={styles.donutSvg}
      >
        {paths}
        <circle cx="60" cy="60" r={radius - strokeWidth} fill="#fff" />
        <text
          x="60"
          y="60"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="13"
          fill="#333"
        >
          연령대
        </text>
      </svg>
      <ul className={styles.donutLegend}>
        {data.map((item, idx) => {
          const percent = total ? Math.round((item.value / total) * 100) : 0;
          return (
            <li key={item.label} className={styles.donutLegendItem}>
              <span
                className={styles.donutLegendColor}
                style={{ background: donutColors[idx % donutColors.length] }}
              />
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
  const [ageStat, setAgeStat] = useState([]); // {label, value}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // ✅ 1. apiClient를 사용하여 인증된 요청 전송
        const response = await apiClient.get('/admin/dashboard');

        // ✅ 2. 응답 데이터에서 genderStat를 찾아 state에 저장
        setGenderStat(response.data.genderStat || []);
      } catch (err) {
        setError('데이터를 불러오지 못했습니다.');
        console.error('대시보드 데이터 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className={styles.container}>
      {loading ? (
        <div className={styles.loadingMsg}>로딩 중...</div>
      ) : error ? (
        <div className={styles.errorMsg}>{error}</div>
      ) : (
        <>
          {/* 상단 요약 카드 */}
          <div className={styles.summaryRow}>
            {summary.length === 0 ? (
              <div className={styles.emptyMsg}>요약 데이터 없음</div>
            ) : (
              summary.map((item) => (
                <div className={styles.summaryCard} key={item.label}>
                  <div className={styles.summaryValue}>
                    {item.value.toLocaleString()}
                  </div>
                  <div className={styles.summaryLabel}>{item.label}</div>
                </div>
              ))
            )}
          </div>

          {/* 하단 통계 - 그래프 */}
          <div className={styles.statsGrid}>
            <div className={styles.statsBox}>
              <h3>반려동물 현황</h3>
              <BarGraph
                data={petStatus}
                total={petStatus.reduce((a, b) => a + b.value, 0)}
                color="#ffb300"
              />
            </div>
            <div className={styles.statsBox}>
              <h3>회원 통계 (반려동물 보유)</h3>
              <BarGraph
                data={memberPetStat}
                total={memberPetStat.reduce((a, b) => a + b.value, 0)}
                color="#1976d2"
              />
            </div>
            <div className={styles.statsBox}>
              <h3>성별 분포</h3>
              <BarGraph
                data={genderStat}
                total={genderStat.reduce((a, b) => a + b.value, 0)}
                color="#e57373"
              />
            </div>
            <div className={styles.statsBox}>
              <h3>연령대 분포</h3>
              <DonutChart data={ageStat} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminMain;
