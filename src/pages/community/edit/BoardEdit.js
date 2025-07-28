// src/pages/community/Board/BoardEdit.js

import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../../AuthProvider';
import styles from './BoardEdit.module.css';

function BoardEdit({ category = 'free', route = 'freeBoard' }) {
  const navigate = useNavigate();
  const { id } = useParams(); // 게시글 ID
  const { userNo, secureApiRequest } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    userId: userNo,
    category: '',
    title: '',
    contentBody: '',
    contentType: 'board',
    tags: '',
    files: [],
  });

  const { isLoggedIn } = useContext(AuthContext);

  // 비로그인 시 차단
  useEffect(() => {
    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
    }
  }, [isLoggedIn]);

  // 게시글 데이터 불러오기
  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await secureApiRequest(`/board/${category}/${id}`, {
          method: 'GET',
        });
        const data = await response.json();

        setFormData({
          userId: data.userId,
          category: data.category,
          title: data.title,
          contentBody: data.contentBody,
          contentType: 'board',
          tags: data.tags,
          files: [], // 기존 파일 보존할 거면 처리 필요
        });
      } catch (err) {
        console.error('게시글 조회 실패', err);
      }
    }

    fetchPost();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('파일은 최대 5개까지 업로드 가능합니다.');
      return;
    }
    setFormData((prev) => ({ ...prev, files }));
  };

  const handleGoBack = () => {
    if (window.confirm('수정 중인 내용이 사라집니다. 목록으로 이동할까요?')) {
      navigate(`/community/${route}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.contentBody || !formData.category) {
      alert('카테고리, 제목, 내용을 모두 입력해주세요.');
      return;
    }

    const data = new FormData();
    data.append('category', formData.category.trim());
    data.append('title', formData.title);
    data.append('contentBody', formData.contentBody);
    data.append('tags', formData.tags);
    data.append('contentType', formData.contentType);

    if (formData.files.length > 0) {
      data.append('ofile', formData.files[0]);
    }

    try {
      await secureApiRequest(`/board/${category}/${id}`, {
        method: 'PUT',
        body: data,
      });

      alert('게시글이 수정되었습니다.');
      navigate(`/community/${route}/${id}`);
    } catch (err) {
      console.error('수정 실패', err);

      if (err.response?.status === 403) {
        alert('해당 게시글을 수정할 권한이 없습니다.');
      } else {
        alert('게시글 수정 중 오류가 발생했습니다.');
      }

      return;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>게시글 수정</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 카테고리 */}
        <div className={styles.formGroup}>
          <label>카테고리</label>
          <select name="category" value={formData.category} onChange={handleChange} className={styles.select}>
            <option value="" disabled>
              카테고리 선택
            </option>
            <option value="free">자유</option>
            <option value="review">후기</option>
            <option value="question">질문</option>
            <option value="tip">팁</option>
          </select>
        </div>

        {/* 제목 */}
        <div className={styles.formGroup}>
          <label>제목</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={styles.input}
            placeholder="제목을 입력하세요"
          />
        </div>

        {/* 내용 */}
        <div className={styles.formGroup}>
          <label>내용</label>
          <textarea
            name="contentBody"
            value={formData.contentBody}
            onChange={handleChange}
            className={styles.textarea}
            placeholder="내용을 입력하세요"
          />
        </div>

        {/* 태그 */}
        <div className={styles.formGroup}>
          <label>태그</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className={styles.input}
            placeholder="태그를 입력하세요 (쉼표로 구분)"
          />
        </div>

        {/* 첨부파일 */}
        <div className={styles.formGroup}>
          <label>첨부파일 (선택사항)</label>
          <div className={styles.fileBox}>
            <input type="file" multiple onChange={handleFileChange} className={styles.fileInput} />
            <p className={styles.fileGuide}>PNG, JPG, PDF, DOC 파일 (최대 10MB, 5개까지)</p>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitBtn}>
            게시글 수정
          </button>
          <button type="button" className={styles.secondaryBtn} onClick={handleGoBack}>
            목록으로
          </button>
        </div>
      </form>
    </div>
  );
}

export default BoardEdit;
