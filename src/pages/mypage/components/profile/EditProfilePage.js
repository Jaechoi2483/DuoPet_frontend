import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../../AuthProvider';
import apiClient from '../../../../utils/axios';
import styles from './EditProfilePage.module.css';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { username, userid } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: ''
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [currentProfileImage, setCurrentProfileImage] = useState(null);
  const [fileSize, setFileSize] = useState(null);

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await apiClient.get('/users/me');
        const userData = response.data;
        
        setFormData({
          name: userData.userName || userData.nickname || '',
          email: userData.userEmail || '',
          phone: userData.phone || '',
          address: userData.address || '',
          bio: '반려동물을 키우는 일반 사용자입니다.' // TODO: bio 필드 추가 필요
        });
        
        if (userData.userProfileRenameFilename) {
          setCurrentProfileImage(`http://localhost:8080/upload/userprofile/${userData.userProfileRenameFilename}`);
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 크기 검증 (50MB 제한)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        alert('파일 크기가 너무 큽니다. 50MB 이하의 파일을 선택해주세요.');
        e.target.value = ''; // 파일 선택 초기화
        return;
      }
      
      // 파일 형식 검증
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('JPG, PNG, GIF 형식의 이미지 파일만 업로드 가능합니다.');
        e.target.value = ''; // 파일 선택 초기화
        return;
      }
      
      setProfileImageFile(file); // 파일 객체 저장
      setFileSize((file.size / 1024 / 1024).toFixed(2)); // MB 단위로 파일 크기 저장
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // FormData 생성
      const submitData = new FormData();
      
      // JSON 데이터 추가
      const userUpdateData = {
        userName: formData.name,
        userEmail: formData.email,
        phone: formData.phone,
        address: formData.address
      };
      submitData.append('data', new Blob([JSON.stringify(userUpdateData)], { type: 'application/json' }));
      
      // 프로필 이미지 파일 추가
      if (profileImageFile) {
        submitData.append('file', profileImageFile);
      }
      
      // API 호출
      const response = await apiClient.put('/users/me', submitData);
      
      if (response.status === 200) {
        alert('프로필이 성공적으로 수정되었습니다.');
        navigate('/mypage');
      }
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      
      // 에러 상태에 따른 구체적인 메시지
      if (error.response) {
        if (error.response.status === 413) {
          alert('파일 크기가 너무 큽니다. 50MB 이하의 파일을 선택해주세요.');
        } else if (error.response.status === 500) {
          alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          alert(`프로필 수정 중 오류가 발생했습니다. (오류 코드: ${error.response.status})`);
        }
      } else if (error.request) {
        alert('서버와의 연결에 실패했습니다. 네트워크 상태를 확인해주세요.');
      } else {
        alert('프로필 수정 중 오류가 발생했습니다.');
      }
    }
  };

  const handleCancel = () => {
    navigate('/mypage');
  };

  if (isLoading) {
    return (
      <div className={styles.contentWrapper}>
        <div className={styles.editContainer}>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            사용자 정보를 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.editContainer}>
        <h1 className={styles.pageTitle}>회원 정보 수정</h1>
        
        <form className={styles.editForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>프로필 사진</label>
              <div className={styles.imageUploadSection}>
                <div className={styles.imageWrapper}>
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="프로필" 
                      className={styles.profileImage}
                    />
                  ) : currentProfileImage ? (
                    <img 
                      src={currentProfileImage} 
                      alt="프로필" 
                      className={styles.profileImage}
                    />
                  ) : (
                    <div className={styles.defaultImage}>
                      <span>{formData.name ? formData.name.charAt(0).toUpperCase() : '?'}</span>
                    </div>
                  )}
                </div>
                <div className={styles.uploadControls}>
                  <label htmlFor="imageUpload" className={styles.uploadButton}>
                    사진 업로드
                  </label>
                  {fileSize && (
                    <span className={styles.fileSize}>파일 크기: {fileSize}MB</span>
                  )}
                </div>
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>이름</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>이메일</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.label}>전화번호</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="010-0000-0000"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="address" className={styles.label}>주소</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="bio" className={styles.label}>자기소개</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className={styles.textarea}
                rows="4"
                placeholder="간단한 자기소개를 입력해주세요"
              />
            </div>

            <div className={styles.buttonGroup}>
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={handleCancel}
              >
                취소
              </button>
              <button 
                type="submit" 
                className={styles.submitButton}
              >
                저장하기
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default EditProfilePage;