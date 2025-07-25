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

  const [nicknameExists, setNicknameExists] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);
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
      setForm((prev) => ({
        ...prev,
        nickname: username || '',
        userName: username || '',
        userEmail: '', // 초기화
      }));

      apiClient
        .get(`/users/${userNo}`)
        .then((res) => {
          const userData = res.data;
          setForm((prev) => ({
            ...prev,
            phone: '',
            age: userData.age || '',
            gender: userData.gender || '',
            address: userData.address || '',
            userEmail: userData.userEmail || '',
          }));
        })
        .catch((err) => {
          console.error('사용자 정보 불러오기 실패:', err);
        });
    }
  }, [isAuthLoading, isLoggedIn, userNo, username]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'nickname') {
      setNicknameExists(false); // 닉네임 변경 시 상태 초기화
    }
  };

  const checkNickname = async () => {
    if (!form.nickname) {
      alert('닉네임을 입력해주세요.');
      return;
    }

    try {
      const res = await apiClient.get(`/users/check-nickname`, {
        params: {
          nickname: form.nickname,
          userId: userNo, // 자기 자신이면 중복 X
        },
      });

      const isDuplicate = res.data; // true = 중복

      setNicknameExists(isDuplicate);
      setNicknameChecked(true);

      if (isDuplicate) {
        alert('이미 사용 중인 닉네임입니다.');
      } else {
        alert('사용 가능한 닉네임입니다.');
      }
    } catch (err) {
      console.error('닉네임 중복 확인 실패:', err);
      alert('중복 확인 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.phone || !form.age || !form.gender) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (nicknameExists) {
      alert('닉네임이 중복됩니다. 다른 닉네임을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        phone: form.phone,
        nickname: form.nickname,
        age: form.age,
        gender: form.gender,
        address: form.address,
        userEmail: form.userEmail,
      };

      await apiClient.put('/users/social-update', payload);
      alert('회원 정보가 등록되었습니다!');
      navigate('/');
    } catch (err) {
      console.error('업데이트 실패:', err);
      alert('정보 등록에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>간편 회원가입</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 이름 */}
        <div className={styles.formGroup}>
          <label>이름</label>
          <input name="userName" value={form.userName} onChange={handleChange} />
        </div>

        {/* 닉네임 + 중복 확인 */}
        <div className={styles.formGroup}>
          <label>닉네임</label>

          {/* 인풋 + 버튼 정렬 */}
          <div className={styles.inlineGroup}>
            <input name="nickname" className={styles.inputField} value={form.nickname} onChange={handleChange} />
            <button type="button" onClick={checkNickname} className={styles.checkButton}>
              중복 확인
            </button>
          </div>

          {/* 상태 메시지 */}
          {nicknameChecked &&
            (nicknameExists ? (
              <div className={`${styles.statusMessage} ${styles.statusError}`}>❗ 이미 사용 중인 닉네임입니다.</div>
            ) : (
              <div className={`${styles.statusMessage} ${styles.statusSuccess}`}>✅ 사용 가능한 닉네임입니다.</div>
            ))}
        </div>

        {/* 전화번호 */}
        <div className={styles.formGroup}>
          <label>전화번호</label>
          <input name="phone" value={form.phone} onChange={handleChange} />
        </div>

        {/* 나이 */}
        <div className={styles.formGroup}>
          <label>나이</label>
          <input name="age" type="number" value={form.age} onChange={handleChange} />
        </div>

        {/* 성별 */}
        <div className={styles.formGroup}>
          <label>성별</label>
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="">선택</option>
            <option value="M">남성</option>
            <option value="F">여성</option>
          </select>
        </div>

        {/* 주소 */}
        <div className={styles.formGroup}>
          <label>주소</label>
          <input name="address" value={form.address} onChange={handleChange} />
        </div>

        {/* 이메일 */}
        <div className={styles.formGroup}>
          <label>이메일</label>
          <input name="userEmail" value={form.userEmail} disabled />
        </div>

        {/* 제출 */}
        <button
          className={styles.submitButton}
          type="submit"
          disabled={isLoading || !nicknameChecked || nicknameExists}
        >
          {isLoading ? '등록 중...' : '정보 등록'}
        </button>
      </form>
    </div>
  );
};

export default SocialSignupPage;
