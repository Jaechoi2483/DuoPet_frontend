// src/pages/social/SocialSignupPage.js

import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthProvider';
import apiClient from '../../utils/axios'; // apiClient로 변경
import styles from '../user/signup/SignupStep1.module.css'; // 경로 확인

const SocialSignupPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userNo, username, isAuthLoading, loginId } = useContext(AuthContext); // loginId를 AuthContext에서 가져옵니다.

  const [form, setForm] = useState({
    userName: '',
    nickname: '',
    phone: '',
    age: '',
    gender: '',
    address: '',
    userEmail: '',
  });

  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 관리

  useEffect(() => {
    console.log('[SocialSignupPage] isAuthLoading:', isAuthLoading, 'isLoggedIn:', isLoggedIn);
    if (!isAuthLoading && !isLoggedIn) {
      console.log('토큰이 없습니다. 로그인 페이지로 리디렉션.');
      navigate('/login');
    }
  }, [isAuthLoading, isLoggedIn, navigate]);

  useEffect(() => {
    if (!isAuthLoading && isLoggedIn) {
      // 로그인된 사용자의 정보로 폼 초기화
      setForm((prevForm) => ({
        ...prevForm,
        nickname: username || '',
        userName: username || '', // Assuming nickname is used for name
        userEmail: '', // 이메일을 초기화하거나 받아올 수 있습니다.
      }));

      // `apiClient`를 사용하여 사용자의 정보를 가져옵니다.
      apiClient
        .get(`/users/${userNo}`)
        .then((response) => {
          const userData = response.data;
          console.log(userData); // 받아오는 데이터 확인
          setForm((prevForm) => ({
            ...prevForm,
            phone: userData.phone || '',
            age: userData.age || '',
            gender: userData.gender || '',
            address: userData.address || '',
            userEmail: userData.userEmail || '', // 이메일을 제대로 로딩
          }));
        })
        .catch((error) => {
          console.error('사용자 정보를 불러오는 데 실패했습니다:', error);
        });
    }
  }, [isAuthLoading, isLoggedIn, userNo, username]); // 의존성 배열에 필요한 항목 추가

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필수 값 확인
    if (!form.phone || !form.age || !form.gender) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    setIsLoading(true); // 로딩 시작

    try {
      const payload = {
        phone: form.phone,
        nickname: form.nickname,
        age: form.age,
        gender: form.gender,
        address: form.address,
        userEmail: form.userEmail,
      };

      // 사용자 정보 업데이트 API 호출
      await apiClient.put('/users/social-update', payload);

      alert('회원 정보가 등록되었습니다!');
      navigate('/'); // 메인 페이지로 이동
    } catch (err) {
      console.error('업데이트 실패:', err);
      alert('정보 등록에 실패했습니다.');
    } finally {
      setIsLoading(false); // 로딩 끝
    }
  };

  if (isAuthLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>간편 회원가입</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>닉네임</label>
          <input name="nickname" value={form.nickname} onChange={handleChange} disabled />
        </div>

        <div className={styles.formGroup}>
          <label>이메일</label>
          <input name="userEmail" value={form.userEmail} onChange={handleChange} disabled />
        </div>

        <div className={styles.formGroup}>
          <label>나이</label>
          <input name="age" value={form.age} onChange={handleChange} type="number" />
        </div>

        <div className={styles.formGroup}>
          <label>성별</label>
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="">선택</option>
            <option value="M">남성</option>
            <option value="F">여성</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>주소</label>
          <input name="address" value={form.address} onChange={handleChange} />
        </div>

        <button className={styles.submitButton} type="submit" disabled={isLoading}>
          {isLoading ? '등록 중...' : '정보 등록'}
        </button>
      </form>
    </div>
  );
};

export default SocialSignupPage;
