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

const ServiceCard = ({ title, description }) => (
  <motion.div
    variants={fadeInUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    style={{
      backgroundColor: '#fff',
      borderRadius: '16px',
      padding: '30px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
      textAlign: 'center',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer',
    }}
    whileHover={{
      transform: 'translateY(-5px)',
      boxShadow: '0 12px 35px rgba(0,0,0,0.15)',
    }}
  >
    <h3 style={{ 
      fontSize: '1.4em', 
      color: '#1e3a8a', 
      marginBottom: '15px',
      fontWeight: 'bold',
      fontFamily: 'Pretendard, sans-serif'
    }}>
      {title}
    </h3>
    <p style={{ 
      fontSize: '1em', 
      lineHeight: '1.6em',
      color: '#333',
      fontFamily: 'Pretendard, sans-serif'
    }}>
      {description}
    </p>
  </motion.div>
);

const AboutPage = () => {
  const services = [
    {
      title: "AI 건강 진단 및 맞춤 건강관리",
      description: "사진 한 장으로 반려동물의 건강 상태를 AI가 분석하고, 개인 맞춤형 건강 관리 계획을 제공합니다. 이상 징후를 조기에 발견하여 예방 의학을 실현합니다."
    },
    {
      title: "예방접종, 산책 관리, 체중기록",
      description: "예방접종 일정 관리부터 산책 기록, 체중 변화 추적까지 반려동물의 일상 건강 관리를 체계적으로 도와줍니다. 중요한 건강 정보를 놓치지 않도록 알림 서비스를 제공합니다."
    },
    {
      title: "보호자 커뮤니티, 후기 공유",
      description: "같은 반려인들과 경험을 나누고 정보를 교환할 수 있는 커뮤니티를 제공합니다. 병원 후기, 사료 추천, 훈련 팁 등 실용적인 정보를 공유할 수 있습니다."
    },
    {
      title: "수의사 1:1 상담",
      description: "전문 수의사와 1:1로 상담할 수 있는 서비스로, 반려동물의 건강에 대한 궁금증을 해결하고 전문적인 조언을 받을 수 있습니다. 언제 어디서나 편리하게 상담받을 수 있습니다."
    }
  ];

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

      <div style={{ 
        textAlign: 'center', 
        padding: '100px 20px',
        backgroundColor: '#e3f2fd'
      }}>
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ 
            fontSize: '2.5em', 
            fontWeight: 'bold', 
            marginBottom: '50px', 
            color: '#1e3a8a',
            fontFamily: 'Pretendard, sans-serif'
          }}
        >
          DuoPet의 주요 서비스
        </motion.h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '30px',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
