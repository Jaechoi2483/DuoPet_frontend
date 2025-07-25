import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../../AuthProvider';
import apiClient from '../../../../utils/axios';
import OnlineStatusToggle from '../vet/OnlineStatusToggle';
import styles from './ProfileInfo.module.css';

const ProfileInfo = () => {
  const navigate = useNavigate();
  const { username, userid, role } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [vetId, setVetId] = useState(null);
  const [initialOnlineStatus, setInitialOnlineStatus] = useState(null);
  
  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    try {
      // LocalDateTime 형식 처리 (예: "2024-03-20T15:30:45")
      const date = new Date(dateString);
      
      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return '날짜 정보 없음';
      }
      
      // 한국식 날짜 포맷으로 변환
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}년 ${month}월 ${day}일`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return '날짜 정보 없음';
    }
  };
  
  // 사용자 정보 상태
  const [userInfo, setUserInfo] = useState({
    name: username || '사용자',
    email: 'user@duopet.com',
    phone: '010-****-****',
    address: '주소 정보를 입력해주세요',
    joinDate: new Date().toLocaleDateString('ko-KR').replace(/\. /g, '-').replace('.', ''),
    profileImage: null
  });

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // 토큰 확인
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        console.log('Access Token:', accessToken ? 'exists' : 'missing');
        console.log('Refresh Token:', refreshToken ? 'exists' : 'missing');
        
        const response = await apiClient.get('/users/me');
        const userData = response.data;
        
        console.log('사용자 전체 데이터:', userData);
        console.log('createdAt 값:', userData.createdAt);
        console.log('phone 값:', userData.phone);
        console.log('address 값:', userData.address);
        
        setUserInfo({
          name: userData.userName || userData.nickname || '사용자',
          email: userData.userEmail || 'user@duopet.com',
          phone: userData.phone && userData.phone !== '' ? userData.phone : '010-****-****',
          address: userData.address && userData.address !== '' ? userData.address : '주소 정보를 입력해주세요',
          joinDate: userData.createdAt ? 
            formatDate(userData.createdAt) : 
            new Date().toLocaleDateString('ko-KR').replace(/\. /g, '-').replace('.', ''),
          profileImage: userData.userProfileRenameFilename ? 
            `http://localhost:8080/upload/userprofile/${userData.userProfileRenameFilename}` : null
        });
        
        // 수의사인 경우 vetId 가져오기
        if (role === 'vet' || role === 'VET') {
          console.log('전문가 역할 확인됨, vetId 조회 시작');
          console.log('userId:', userData.userId);
          try {
            const vetResponse = await apiClient.get(`/users/${userData.userId}/vet`);
            console.log('수의사 정보 응답:', vetResponse.data);
            if (vetResponse.data && vetResponse.data.vetId) {
              setVetId(vetResponse.data.vetId);
              console.log('vetId 설정됨:', vetResponse.data.vetId);
              
              // 온라인 상태도 함께 설정
              if (vetResponse.data.isOnline) {
                setInitialOnlineStatus(vetResponse.data.isOnline);
                console.log('초기 온라인 상태:', vetResponse.data.isOnline);
              }
            } else {
              console.log('vetId가 응답에 없음');
            }
          } catch (error) {
            console.error('수의사 정보 조회 실패:', error);
            console.error('에러 상세:', error.response?.data);
          }
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
        // 에러 발생 시 기본값 유지
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleEditClick = () => {
    navigate('/mypage/profile/edit');
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // FormData 생성
        const formData = new FormData();
        
        // 현재 사용자 정보를 유지하면서 업데이트
        const userUpdateData = {
          userName: userInfo.name,
          userEmail: userInfo.email,
          phone: userInfo.phone,
          address: userInfo.address
        };
        formData.append('data', new Blob([JSON.stringify(userUpdateData)], { type: 'application/json' }));
        formData.append('file', file);
        
        // API 호출
        const response = await apiClient.put('/users/me', formData);
        
        if (response.status === 200) {
          // 성공 시 사용자 정보 다시 불러오기
          const updatedUserResponse = await apiClient.get('/users/me');
          const userData = updatedUserResponse.data;
          
          setUserInfo({
            name: userData.userName || userData.nickname || '사용자',
            email: userData.userEmail || 'user@duopet.com',
            phone: userData.phone && userData.phone !== '' ? userData.phone : '010-****-****',
            address: userData.address && userData.address !== '' ? userData.address : '주소 정보를 입력해주세요',
            joinDate: userData.createdAt ? 
              formatDate(userData.createdAt) : 
              new Date().toLocaleDateString('ko-KR').replace(/\. /g, '-').replace('.', ''),
            profileImage: userData.userProfileRenameFilename ? 
              `http://localhost:8080/upload/userprofile/${userData.userProfileRenameFilename}` : null
          });
          
          alert('프로필 이미지가 업데이트되었습니다.');
        }
      } catch (error) {
        console.error('프로필 이미지 업로드 실패:', error);
        alert('프로필 이미지 업로드 중 오류가 발생했습니다.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className={styles.profileContainer}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          사용자 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      {/* 수의사인 경우 온라인 상태 토글 표시 */}
      {console.log('렌더링 시 role:', role, 'vetId:', vetId)}
      {(role === 'vet' || role === 'VET') && vetId ? (
        <OnlineStatusToggle vetId={vetId} initialStatus={initialOnlineStatus} />
      ) : (
        console.log('토글 표시 안됨 - role:', role, 'vetId:', vetId)
      )}
      
      <div className={styles.profileHeader}>
        <h2 className={styles.sectionTitle}>상세 정보</h2>
        <button className={styles.editButton} onClick={handleEditClick}>
          수정하기
        </button>
      </div>

      <div className={styles.profileContent}>
        <div className={styles.profileImageSection}>
          <div className={styles.imageWrapper}>
            {userInfo.profileImage ? (
              <img 
                src={userInfo.profileImage} 
                alt="프로필" 
                className={styles.profileImage}
              />
            ) : (
              <div className={styles.defaultImage}>
                <span>{userInfo.name ? userInfo.name.charAt(0).toUpperCase() : '?'}</span>
              </div>
            )}
            <label htmlFor="profileImageInput" className={styles.imageUploadButton}>
              📷
            </label>
            <input
              id="profileImageInput"
              type="file"
              accept="image/*"
              onChange={handleProfileImageUpload}
              style={{ display: 'none' }}
            />
          </div>
          <div className={styles.userBasicInfo}>
            <h3 className={styles.userName}>{userInfo.name}</h3>
            <p className={styles.userId}>@{userid}</p>
            <p className={styles.joinInfo}>가입일: {userInfo.joinDate}</p>
            <p className={styles.membershipInfo}>
              반려동물을 키우는 일반 사용자입니다.
            </p>
          </div>
        </div>

        <div className={styles.detailInfoSection}>
          <div className={styles.infoRow}>
            <label className={styles.infoLabel}>이름</label>
            <span className={styles.infoValue}>{userInfo.name}</span>
          </div>
          <div className={styles.infoRow}>
            <label className={styles.infoLabel}>이메일</label>
            <span className={styles.infoValue}>{userInfo.email}</span>
          </div>
          <div className={styles.infoRow}>
            <label className={styles.infoLabel}>전화번호</label>
            <span className={styles.infoValue}>{userInfo.phone}</span>
          </div>
          <div className={styles.infoRow}>
            <label className={styles.infoLabel}>주소</label>
            <span className={styles.infoValue}>{userInfo.address}</span>
          </div>
          <div className={styles.infoRow}>
            <label className={styles.infoLabel}>자기소개</label>
            <span className={styles.infoValue}>
              반려동물을 키우는 일반 사용자입니다.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;