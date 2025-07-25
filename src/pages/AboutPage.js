import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import video1 from '../assets/videos/video1.mp4';
import video2 from '../assets/videos/video2.mp4';
import apiClient from '../utils/axios'; // 데이터 로딩을 위해 apiClient를 임포트합니다.

// 애니메이션 설정 (변경 없음)
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

// Section 컴포넌트 (변경 없음)
const Section = ({ videoSrc, title, text, reverse }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: reverse ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      padding: '80px 20px',
      backgroundColor: '#fff',
    }}
  >
    <motion.video
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      autoPlay
      muted
      loop
      playsInline
      src={videoSrc}
      style={{
        width: '546px',
        height: 'auto',
        borderRadius: '24px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        margin: '20px',
      }}
    />
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      style={{
        maxWidth: '620px',
        padding: '20px',
        textAlign: 'left',
        fontSize: '1.25em',
        lineHeight: '2em',
        fontFamily: 'Pretendard, sans-serif',
      }}
    >
      <h2 style={{ fontSize: '2.1em', color: '#283593', marginBottom: '16px' }}>{title}</h2>
      <p style={{ fontSize: '1.1em', lineHeight: '1.9em' }}>{text}</p>
    </motion.div>
  </div>
);

// --- 메인 페이지 컴포넌트 ---
const AboutPage = () => {
  // 1. AdminMain에서 가져온 상태 변수들
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. AdminMain에서 가져온 데이터 로딩 로직
  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const response = await apiClient.get('/api/summary/public');
        const formattedSummary = (response.data.summary || []).map((stat) => ({
          label: stat.item,
          value: stat.count,
        }));
        setSummary(formattedSummary);
      } catch (err) {
        setError('데이터를 불러오는 데 실패했습니다.');
        console.error('요약 데이터 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  // 3. 요약 정보 카드 스타일 및 헬퍼 컴포넌트
  const summaryCardBase = {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    color: '#333',
    textDecoration: 'none',
    padding: '25px',
    minWidth: '220px',
    textAlign: 'center',
    flex: '1',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  };
  const summaryCardHover = { transform: 'translateY(-5px)', boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)' };
  const summaryValueStyle = {
    fontSize: '2.5em',
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: '8px',
    display: 'block',
  };
  const summaryLabelStyle = { fontSize: '1em', color: '#555', fontWeight: 500 };

  const SummaryCard = ({ item }) => {
    const [isHovered, setIsHovered] = useState(false);
    const currentStyle = isHovered ? { ...summaryCardBase, ...summaryCardHover } : summaryCardBase;
    return (
      <div style={currentStyle} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <span style={summaryValueStyle}>{item.value.toLocaleString()}</span>
        <span style={summaryLabelStyle}>{item.label}</span>
      </div>
    );
  };

  // 4. 서비스 버튼 스타일 및 헬퍼 컴포넌트 추가
  const serviceButtonContainerStyles = {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  };
  const serviceButtonBase = {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    color: '#333',
    fontSize: '1.2em',
    fontWeight: 500,
    textDecoration: 'none',
    padding: '30px 20px',
    minWidth: '200px',
    textAlign: 'center',
    lineHeight: '1.6em',
    flexGrow: 1,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
  };
  const serviceButtonHover = { transform: 'translateY(-5px)', boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)' };

  const ServiceButton = ({ href, children }) => {
    const [isHovered, setIsHovered] = useState(false);
    const currentStyle = isHovered ? { ...serviceButtonBase, ...serviceButtonHover } : serviceButtonBase;
    return (
      <a
        href={href}
        style={currentStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </a>
    );
  };

  return (
    <div style={{ fontFamily: 'Pretendard, sans-serif', backgroundColor: '#fefefe' }}>
      {/* ... 헤더는 기존과 동일 ... */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{ textAlign: 'center', padding: '80px 20px' }}
      >
        <h1
          style={{
            fontSize: '2.8em',
            color: '#283593',
            fontWeight: 'bold',
            maxWidth: '900px',
            margin: '0 auto',
            lineHeight: '1.4',
          }}
        >
          AI와 함께 반려동물과 보호자의 삶을 더 풍요롭고 건강하게 만들어가는 플랫폼
        </h1>
      </motion.div>

      <Section
        videoSrc={video1}
        title="AI 기반 건강 진단"
        text="듀오펫은 AI를 활용하여 반려동물의 건강 상태를 정밀하게 진단합니다. 눈, 피부, 체형 등을 영상 기반으로 분석하며, 보호자는 간편하게 결과를 확인할 수 있습니다."
      />
      <Section
        videoSrc={video2}
        title="전문가 상담과 커뮤니티"
        text="1:1 전문가 상담부터 다양한 반려인 커뮤니티까지, 듀오펫은 보호자가 필요로 하는 모든 정보를 한 곳에 제공합니다."
        reverse
      />

      {/* 5. 주요 서비스 섹션을 요청하신 버튼들로 교체 */}
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2 style={{ fontSize: '2em', fontWeight: 'bold', marginBottom: '50px', color: '#283593' }}>주요 서비스</h2>
        <div style={serviceButtonContainerStyles}>
          <ServiceButton href="/health/ai-diagnosis">
            AI 건강 진단 및<br />
            맞춤 건강관리
          </ServiceButton>
          <ServiceButton href="/health">
            예방접종, 산책 관리,
            <br />
            체중기록
          </ServiceButton>
          <ServiceButton href="/community/freeBoard">
            보호자 커뮤니티,
            <br />
            후기 공유
          </ServiceButton>
          <ServiceButton href="/health/expert-consult">수의사 1:1 상담</ServiceButton>
        </div>
      </div>
      {/* 요약 정보 카드 섹션 */}
      <div style={{ padding: '60px 20px 80px' }}>
        {/* 1. 설명 문구 추가 */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '2em', fontWeight: 'bold', color: '#283593', marginBottom: '16px' }}>
            숫자로 보는 듀오펫 커뮤니티
          </h2>
          <p style={{ fontSize: '1.1em', color: '#666', lineHeight: '1.7' }}>
            수많은 보호자님들이 듀오펫과 함께하며 만들어가는
            <br />
            건강하고 행복한 반려생활의 기록입니다.
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {loading ? (
            <p>데이터 로딩 중...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : (
            summary.map((item) => <SummaryCard key={item.label} item={item} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
