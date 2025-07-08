import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthProvider';

import logo from '../../assets/images/logo3.png';
import styles from './Menubar.module.css';

const menuData = [
  {
    title: '인사말',
    submenus: [
      { name: '사이트 소개', path: '/about' },
      { name: '인사말', path: '/greeting' },
    ],
  },
  {
    title: '커뮤니티',
    submenus: [
      { name: '자유게시판', path: '/board/free' },
      { name: '후기게시판', path: '/board/review' },
      { name: '팁게시판', path: '/board/tip' },
      { name: '질문게시판', path: '/board/qna' },
    ],
  },
  {
    title: '정보광장',
    submenus: [
      { name: '보호소 찾기', path: '/info/shelter' },
      { name: '입양 정보', path: '/info/adoption' },
      { name: '병원 찾기', path: '/info/hospital' },
    ],
  },
  {
    title: '건강 관리',
    submenus: [
      { name: '건강 관리', path: '/health' },
      { name: 'AI 진단', path: '/health/ai-diagnosis' },
      { name: 'AI 행동분석', path: '/health/ai-behavior' },
      { name: '전문가 상담', path: '/health/expert-consult' },
    ],
  },
  {
    title: '알림마당',
    submenus: [
      { name: '공지사항', path: '/notice' },
      { name: '1:1 문의', path: '/qna' },
      { name: 'FAQ', path: '/faq' },
    ],
  },
];

function Menubar({
  updateNoticeResults,
  updateBoardResults,
  updateMemberResults,
  resetSearchInput,
}) {
  const { isLoggedIn, username, logoutAndRedirect } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAndRedirect();
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.logoSection}>
        <Link to="/" className={styles.logoLink}>
          <img src={logo} alt="Site Logo" className={styles.logo} />
        </Link>
      </div>

      <nav className={styles.mainNav}>
        <ul className={styles.menuList}>
          {menuData.map((menu, index) => (
            <li key={index} className={styles.menuItem}>
              <span className={styles.menuTitle}>{menu.title}</span>
              <ul className={styles.submenu}>
                {menu.submenus.map((submenu, subIndex) => (
                  <li key={subIndex} className={styles.submenuItem}>
                    <Link to={submenu.path}>{submenu.name}</Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.rightSection}>
        {isLoggedIn ? (
          <>
            <span className={styles.username}>{username} 님</span>
            <button className={styles.authButton} onClick={handleLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <>
            <button className={styles.authButton} onClick={handleLogin}>
              로그인
            </button>
            <span className={styles.separator}>|</span>
            <button className={styles.authButton} onClick={handleSignup}>
              회원가입
            </button>
          </>
        )}
        <div className={styles.notificationIcon}>
          <span className={styles.badge}>1</span>
          🔔
        </div>
      </div>
    </header>
  );
}

export default Menubar;
