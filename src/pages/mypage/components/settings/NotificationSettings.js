import React, { useState } from 'react';
import styles from './NotificationSettings.module.css';

const NotificationSettings = ({ onBack }) => {
  const [notifications, setNotifications] = useState({
    // 활동 알림
    newComment: true,
    newReply: true,
    newLike: true,
    newFollower: false,
    
    // 서비스 알림
    adoptionUpdate: true,
    consultationReminder: true,
    appointmentReminder: true,
    
    // 마케팅 알림
    newsletter: false,
    promotion: false,
    event: true,
    
    // 알림 방법
    emailNotification: true,
    pushNotification: true,
    smsNotification: false
  });

  const handleToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveSettings = () => {
    // 실제로는 API 호출하여 설정 저장
    console.log('알림 설정 저장:', notifications);
    alert('알림 설정이 저장되었습니다.');
  };

  const NotificationToggle = ({ settingKey, label, description }) => (
    <div className={styles.notificationItem}>
      <div className={styles.notificationInfo}>
        <h4 className={styles.notificationLabel}>{label}</h4>
        {description && (
          <p className={styles.notificationDesc}>{description}</p>
        )}
      </div>
      <label className={styles.toggleSwitch}>
        <input
          type="checkbox"
          checked={notifications[settingKey]}
          onChange={() => handleToggle(settingKey)}
        />
        <span className={styles.slider}></span>
      </label>
    </div>
  );

  return (
    <div className={styles.notificationSettingsContainer}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          ← 뒤로가기
        </button>
        <h2 className={styles.title}>알림 설정</h2>
      </div>

      <div className={styles.settingsContent}>
        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>알림 수신 방법</h3>
          <div className={styles.settingGroup}>
            <NotificationToggle
              settingKey="emailNotification"
              label="이메일 알림"
              description="등록된 이메일로 알림을 받습니다"
            />
            <NotificationToggle
              settingKey="pushNotification"
              label="푸시 알림"
              description="브라우저 푸시 알림을 받습니다"
            />
            <NotificationToggle
              settingKey="smsNotification"
              label="SMS 알림"
              description="등록된 휴대폰 번호로 문자 알림을 받습니다"
            />
          </div>
        </div>

        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>활동 알림</h3>
          <div className={styles.settingGroup}>
            <NotificationToggle
              settingKey="newComment"
              label="새 댓글"
              description="내 게시글에 새 댓글이 달렸을 때"
            />
            <NotificationToggle
              settingKey="newReply"
              label="댓글 답글"
              description="내 댓글에 답글이 달렸을 때"
            />
            <NotificationToggle
              settingKey="newLike"
              label="좋아요"
              description="내 게시글이나 댓글에 좋아요를 받았을 때"
            />
            <NotificationToggle
              settingKey="newFollower"
              label="새 팔로워"
              description="다른 사용자가 나를 팔로우했을 때"
            />
          </div>
        </div>

        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>서비스 알림</h3>
          <div className={styles.settingGroup}>
            <NotificationToggle
              settingKey="adoptionUpdate"
              label="입양 정보 업데이트"
              description="관심있는 입양 동물의 상태가 변경되었을 때"
            />
            <NotificationToggle
              settingKey="consultationReminder"
              label="상담 알림"
              description="예약된 전문가 상담 일정 알림"
            />
            <NotificationToggle
              settingKey="appointmentReminder"
              label="진료 예약 알림"
              description="동물병원 진료 예약 알림"
            />
          </div>
        </div>

        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>마케팅 정보 수신</h3>
          <div className={styles.settingGroup}>
            <NotificationToggle
              settingKey="newsletter"
              label="뉴스레터"
              description="반려동물 관련 유용한 정보와 팁"
            />
            <NotificationToggle
              settingKey="promotion"
              label="프로모션"
              description="할인 및 특별 혜택 정보"
            />
            <NotificationToggle
              settingKey="event"
              label="이벤트"
              description="이벤트 및 캠페인 소식"
            />
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button 
            className={styles.saveButton}
            onClick={handleSaveSettings}
          >
            설정 저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;