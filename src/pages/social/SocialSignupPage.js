// src/pages/social/SocialSignupPage.js

import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthProvider';
import axios from 'axios';
import styles from '../user/signup/SignupStep1.module.css';

const SocialSignupPage = () => {
  const navigate = useNavigate();
  const { authTokens, decodedToken } = useContext(AuthContext);

  const [form, setForm] = useState({
    userName: '',
    nickname: '',
    phone: '',
    age: '',
    gender: '',
    address: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const loginId = decodedToken?.sub; // accessToken에서 loginId 추출

      const payload = {
        loginId,
        ...form,
      };

      await axios.patch('/users/social-update', payload, {
        headers: {
          Authorization: `Bearer ${authTokens.accessToken}`,
        },
      });

      alert('회원 정보가 등록되었습니다!');
      navigate('/'); // 메인 페이지로 이동
    } catch (err) {
      console.error('업데이트 실패:', err);
      alert('정보 등록에 실패했습니다.');
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>간편 회원가입</h2>

      <div className={styles.formGroup}>
        <label>이름</label>
        <input name="userName" value={form.userName} onChange={handleChange} />
      </div>

      <div className={styles.formGroup}>
        <label>닉네임</label>
        <input name="nickname" value={form.nickname} onChange={handleChange} />
      </div>

      <div className={styles.formGroup}>
        <label>전화번호</label>
        <input name="phone" value={form.phone} onChange={handleChange} />
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

      <button className={styles.submitButton} onClick={handleSubmit}>
        정보 등록
      </button>
    </div>
  );
};

export default SocialSignupPage;
