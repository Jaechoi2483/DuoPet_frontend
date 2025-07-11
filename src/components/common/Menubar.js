// src/components/common/Menubar.js

import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthProvider';

import logo from '../../assets/images/logo3.png';
import adminIcon from '../../assets/images/adminIcon.png';
import styles from './Menubar.module.css'; // 파일명 변경: Header.module.css -> Menubar.module.css

// 메뉴 데이터 정의 (이전과 동일)
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
      { name: '자유게시판', path: '/community/freeBoard' },
      { name: '후기게시판', path: '/board/review' },
      { name: '팁게시판', path: '/board/tip' },
      { name: '질문게시판', path: '/board/qna' },
    ],
  },

  {
    title: '정보광장',
    submenus: [
      { name: '보호소 찾기', path: '/info/shelter' },
      { name: '입양 정보', path: '/adoption' },
      { name: '병원 찾기', path: '/info/hospital' },
    ],
  },
  {
    title: '건강 관리',
    submenus: [
      { name: '건강 기록', path: '/health' },
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

const getRoleBadge = (role) => {
  switch (role) {
    case 'admin':
      return '관';
    case 'vet':
      return '전';
    case 'shelter':
      return '보';
    default:
      return null;
  }
};

function Menubar({
  // 함수 컴포넌트 이름 변경: Header -> Menubar
  updateNoticeResults,
  updateBoardResults,
  updateMemberResults,
  resetSearchInput,
}) {
  const { isLoggedIn, username, role, logoutAndRedirect } =
    useContext(AuthContext);

  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAndRedirect();
  };

  const handleSignup = () => {
    navigate('/signup/step1');
  };

  // const handleLoginClick = () => {
  //   setShowLoginModal(true);
  // };

  // const handleCloseModal = () => {
  //   setShowLoginModal(false);
  // };

  return (
    <header className={styles.header}>
      {/* 로고 */}
      <div className={styles.logoSection}>
        <Link to="/" className={styles.logoLink}>
          <img src={logo} alt="Site Logo" className={styles.logo} />
        </Link>
      </div>

      {/* 메인 네비게이션 (드롭다운 메뉴) */}
      <nav className={styles.mainNav}>
        <ul className={styles.menuList}>
          {menuData.map((menu, index) => (
            <li
              key={index}
              className={styles.menuItem}
              // onMouseEnter와 onMouseLeave 이벤트는 이제 제거합니다.
            >
              {menu.title === '건강 관리' ? (
                <Link
                  to="/health"
                  className={styles.menuTitle}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {menu.title}
                </Link>
              ) : (
                <span className={styles.menuTitle}>{menu.title}</span>
              )}
              {/* 서브메뉴는 항상 렌더링되도록 합니다. CSS로 숨김/표시를 제어합니다. */}
              {menu.submenus && (
                <ul className={styles.submenu}>
                  {menu.submenus.map((submenu, subIndex) => (
                    <li key={subIndex} className={styles.submenuItem}>
                      <Link to={submenu.path}>{submenu.name}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* 로그인 / 로그아웃 버튼, 회원가입 버튼, 알림 아이콘 */}
      <div className={styles.rightSection}>
        {isLoggedIn ? (
          <div className={styles.userSection}>
            {role === 'admin' && (
              <span className={styles.roleBadge}>{getRoleBadge(role)}</span>
            )}
            <span className={styles.username}>{username}님</span>
            {role === 'admin' && (
              <button
                className={styles.adminIconButton}
                onClick={() => navigate('/admin')}
                style={{ display: 'flex', alignItems: 'center', padding: 0, cursor: 'pointer', background: 'none', border: 'none' }}
                title="관리자 페이지로 이동"
              >
                <img
                  src={adminIcon}
                  alt="관리자 아이콘"
                  style={{ width: '18px', height: '18px' }}
                />
              </button>
            )}
            <span className={styles.myPage}>마이페이지 ▼</span>
            <button className={styles.authButton} onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        ) : (
          <>
            <button
              className={styles.authButton}
              onClick={() => navigate('/login')}
            >
              로그인
            </button>
            <span className={styles.separator}>|</span>
            <button className={styles.authButton} onClick={handleSignup}>
              회원가입
            </button>
          </>
        )}
        {/* 알림 아이콘 */}
        <div className={styles.notificationIcon}>
          <span className={styles.badge}>1</span>
          🔔
        </div>
      </div>
    </header>
  );
}

export default Menubar; // 내보내는 컴포넌트 이름 변경: Header -> Menubar
