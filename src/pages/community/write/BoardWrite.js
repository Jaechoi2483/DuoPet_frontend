// src/pages/community/freeBoard/FreeBoardWrite.js

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../AuthProvider';
import styles from './BoardWrite.module.css';

function BoardWrite({ category = 'free', route = 'freeBoard' }) {
  const navigate = useNavigate();
  const { userNo, isLoggedIn, secureApiRequest } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    userId: userNo,
    category: '',
    title: '',
    contentBody: '',
    contentType: 'board',
    tags: '',
    files: [],
  });

  useEffect(() => {
    if (!isLoggedIn) {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요한 서비스입니다.');
        navigate('/login');
      }
    }
    setLoading(false);
  }, [isLoggedIn]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, userId: userNo }));
  }, [userNo]);

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
    const confirmed = window.confirm('작성 중인 내용이 사라집니다. 정말 목록으로 이동할까요?');
    if (confirmed) navigate(`/community/${route}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, contentBody, category, tags } = formData;

    if (!title || !contentBody || !category) {
      alert('카테고리, 제목, 내용을 모두 입력해주세요.');
      return;
    }

    // 강아지/고양이 태그 유효성 검사
    if (category !== 'free') {
      const tagList = tags.split(',').map((t) => t.trim());
      const hasRequiredTag = tagList.some((t) => t.includes('강아지') || t.includes('고양이'));
      if (!hasRequiredTag) {
        alert('후기, 질문, 팁 게시판에서는 "강아지" 또는 "고양이" 태그가 포함되어야 합니다.');
        return;
      }
    }

    const data = new FormData();
    data.append('userId', formData.userId);
    data.append('category', category);
    data.append('title', title);
    data.append('contentBody', contentBody);
    data.append('tags', tags);
    data.append('contentType', formData.contentType);

    if (formData.files.length > 0) {
      data.append('ofile', formData.files[0]);
    }

    try {
      await secureApiRequest(`/board/${category}/write`, {
        method: 'POST',
        body: data,
      });

      alert('게시글이 등록되었습니다.');
      navigate(`/community/${route}`);
    } catch (err) {
      console.error('등록 실패', err);

      if (!formData.tags || formData.tags.trim() === '') {
        alert('태그를 입력해세요!');
      } else if (formData.category !== 'free' && !/(강아지|고양이)/.test(formData.tags)) {
        alert('해당 카테고리는 "강아지" 또는 "고양이" 태그가 포함되어야 합니다.');
      } else {
        alert('게시글 등록에 실패했습니다. 입력값을 확인해주세요.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>게시글 작성</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
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
          <small>게시글의 주제에 맞는 카테고리를 선택해주세요.</small>
        </div>

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

        <div className={styles.formGroup}>
          <label>태그*</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className={styles.input}
            placeholder="태그를 입력하세요 (쉼표로 구분)"
          />
          <small>예: 강아지, 건강, 산책 (최대 3개)</small>

          {/* 강아지/고양이 키워드 안내 문구 - 선택된 경우만 표시 */}
          {formData.category && formData.category !== 'free' && (
            <small className={styles.notice}>※ 반드시 "강아지" 또는 "고양이" 키워드가 포함되어야 합니다.</small>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>첨부파일 (선택사항)</label>
          <div className={styles.fileBox}>
            <input type="file" multiple onChange={handleFileChange} className={styles.fileInput} />
            <p className={styles.fileGuide}>PNG, JPG, PDF, DOC 파일 (최대 10MB, 5개까지)</p>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitBtn}>
            게시글 등록
          </button>
          <button type="button" className={styles.secondaryBtn} onClick={handleGoBack}>
            목록으로
          </button>
        </div>
      </form>
    </div>
  );
}

export default BoardWrite;
