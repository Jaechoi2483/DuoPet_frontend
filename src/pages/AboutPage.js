import React from 'react';
import { motion } from 'framer-motion';
import video1 from '../assets/videos/video1.mp4';
import video2 from '../assets/videos/video2.mp4';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

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
      //muted
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

const AboutPage = () => {
  return (
    <div style={{ fontFamily: 'Pretendard, sans-serif', backgroundColor: '#fefefe' }}>
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

      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2 style={{ fontSize: '2em', fontWeight: 'bold', marginBottom: '30px', color: '#283593' }}>
          주요 서비스 요약
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.4em', fontSize: '1.3em' }}>
          <li>• AI 건강 진단 및 맞춤 건강관리</li>
          <li>• 예방접종, 산책 관리, 체중기록</li>
          <li>• 보호자 커뮤니티, 후기 공유</li>
          <li>• 수의사 1:1 상담</li>
        </ul>
      </div>
    </div>
  );
};

export default AboutPage;
