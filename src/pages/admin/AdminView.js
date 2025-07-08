import React, { useState } from 'react';
import styles from './AdminView.module.css';
import NoticeList from '../notice/NoticeList';
import Qna from './Qna';
import Faq from './Faq';
import MemberList from './MemberList';
import AdminMain from './AdminMain';
import ReportManagement from './ReportManagement';

const TABS = [
  { label: '관리자 메인' },
  { label: '회원 목록' },
  { label: '공지사항' },
  { label: 'QNA' },
  { label: 'FAQ' },
  { label: '신고관리' },
];

function AdminView() {
  const [activeTab, setActiveTab] = useState(0);

  // 탭별로 렌더링할 컴포넌트/내용
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <AdminMain />;
      case 1:
        return <MemberList />;
      case 2:
        return <NoticeList />;
      case 3:
        return <Qna />;
      case 4:
        return <Faq />;
      case 5:
        return <ReportManagement />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>관리자 페이지</h2>
      <div className={styles.tabBar}>
        {TABS.map((tab, idx) => (
          <button
            key={tab.label}
            className={
              idx === activeTab
                ? `${styles.tabButton} ${styles.active}`
                : styles.tabButton
            }
            onClick={() => setActiveTab(idx)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.tabContent}>
        {renderTabContent()}
      </div>
    </div>
  );
}

export default AdminView;
