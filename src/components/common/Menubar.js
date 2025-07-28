// src/components/common/Menubar.js

import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthProvider';
import apiClient from '../../utils/axios';
import { jwtDecode } from 'jwt-decode';

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
      { name: '후기게시판', path: '/community/reviewBoard' },
      { name: '팁게시판', path: '/community/tipBoard' },
      { name: '질문게시판', path: '/community/questionBoard' },
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

// 사용자 이름에서 첫 글자 추출
const getUserInitial = (username) => {
  if (!username) return '?';
  return username.charAt(0).toUpperCase();
};

function Menubar({
  // 함수 컴포넌트 이름 변경: Header -> Menubar
  updateNoticeResults,
  updateBoardResults,
  updateMemberResults,
  resetSearchInput,
}) {
  const { isLoggedIn, username, role, logoutAndRedirect } = useContext(AuthContext);

  const navigate = useNavigate();

  const [remainingTime, setRemainingTime] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isLoggedIn) {
      updateSessionTimer();
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(updateSessionTimer, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isLoggedIn]);

  const updateSessionTimer = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const exp = decoded.exp * 1000;
      const now = Date.now();
      const diff = exp - now;

      if (diff <= 0) {
        setRemainingTime('만료됨');

        // 세션 만료 시 자동 로그아웃 처리
        localStorage.clear();
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/login';
        return;
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setRemainingTime(`${minutes}분 ${seconds < 10 ? '0' : ''}${seconds}초`);
      }
    } catch (e) {
      console.error('토큰 디코딩 실패', e);
      setRemainingTime('-');
    }
  };

  const handleLogout = () => {
    logoutAndRedirect();
  };

  const handleExtendSession = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      const res = await apiClient.post('/reissue', null, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          RefreshToken: `Bearer ${refreshToken}`,
          ExtendLogin: 'true',
        },
        withCredentials: true,
      });

      const newAccessToken = res.headers['authorization']?.split(' ')[1];
      const newRefreshToken = res.headers['refresh-token']?.split(' ')[1];

      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken);
        console.log('🟢 accessToken 갱신됨');
        console.log('🧠 디코딩된 accessToken 만료:', new Date(jwtDecode(newAccessToken).exp * 1000).toLocaleString());
      }

      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
        console.log('🟢 refreshToken 갱신됨');
      }

      // 약간의 시간차를 주고 타이머 재시작
      setTimeout(() => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
          updateSessionTimer();
        }, 1000);

        updateSessionTimer(); // 바로 한 번 반영해서 UI 갱신
      }, 50); // 딜레이 50ms

      alert('로그인 시간이 연장되었습니다.');
    } catch (e) {
      console.error('연장 실패', e);
      alert('세션 연장에 실패했습니다. 다시 로그인해주세요.');
      navigate('/login');
    }
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
                <Link to="/health" className={styles.menuTitle} style={{ textDecoration: 'none', color: 'inherit' }}>
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
            {isLoggedIn && (
              <div className={styles.sessionTimer}>
                <span className={styles.timerIcon}>⏰</span>
                <span className={styles.timeText}>{remainingTime}</span>
                <button className={styles.extendBtn} onClick={handleExtendSession}>
                  시간연장
                </button>
              </div>
            )}
            {role && getRoleBadge(role) ? (
              <span className={styles.roleBadge}>{getRoleBadge(role)}</span>
            ) : (
              <span className={styles.userInitial}>{getUserInitial(username)}</span>
            )}
            <span className={styles.username}>{username}님</span>
            {role === 'admin' && (
              <button
                className={styles.adminIconButton}
                onClick={() => navigate('/admin')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                }}
                title="관리자 페이지로 이동"
              >
                <img src={adminIcon} alt="관리자 아이콘" style={{ width: '18px', height: '18px' }} />
              </button>
            )}
            <div className={styles.mypageDropdown}>
              <span className={styles.myPage} onClick={() => navigate('/mypage', { state: { activeTab: 'profile' } })}>
                마이페이지 ▼
              </span>
              <ul className={styles.mypageSubmenu}>
                <li className={styles.mypageSubmenuItem}>
                  <a onClick={() => navigate('/mypage', { state: { activeTab: 'profile' } })}>프로필</a>
                </li>
                <li className={styles.mypageSubmenuItem}>
                  <a onClick={() => navigate('/mypage', { state: { activeTab: 'pets' } })}>반려동물</a>
                </li>
                <li className={styles.mypageSubmenuItem}>
                  <a onClick={() => navigate('/mypage', { state: { activeTab: 'activity' } })}>내 활동</a>
                </li>
                <li className={styles.mypageSubmenuItem}>
                  <a onClick={() => navigate('/mypage', { state: { activeTab: 'bookmark' } })}>북마크</a>
                </li>
                <li className={styles.mypageSubmenuItem}>
                  <a onClick={() => navigate('/mypage', { state: { activeTab: 'settings' } })}>설정</a>
                </li>
              </ul>
            </div>
            <button className={styles.authButton} onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        ) : (
          <>
            <button className={styles.authButton} onClick={() => navigate('/login')}>
              로그인
            </button>
            <span className={styles.separator}>|</span>
            <button className={styles.authButton} onClick={handleSignup}>
              회원가입
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Menubar; // 내보내는 컴포넌트 이름 변경: Header -> Menubar
