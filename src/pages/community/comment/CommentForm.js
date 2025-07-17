// components/community/comments/CommentForm.js

import React, { useState, useContext } from 'react';
import apiClient from '../../../utils/axios';
import { AuthContext } from '../../../AuthProvider';
import styles from './Comment.module.css';

function CommentForm({ contentId, onCommentSubmit }) {
  const [comment, setComment] = useState('');
  const { accessToken, refreshToken } = useContext(AuthContext);

  const handleSubmit = async () => {
    if (!comment.trim()) return alert('댓글을 입력해주세요.');

    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!accessToken || !refreshToken) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }

    try {
      const response = await apiClient.post(
        `/comments/${contentId}/new`,
        { content: comment },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            RefreshToken: `Bearer ${refreshToken}`,
          },
          withCredentials: true,
        }
      );

      setComment('');
      onCommentSubmit(); // 부모에서 리스트 새로고침
    } catch (error) {
      console.error('댓글 등록 실패:', error);
      alert('댓글 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.commentCard}>
      <label className={styles.label}>댓글 작성</label>
      <textarea
        className={styles.textarea}
        placeholder="댓글을 입력하세요"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
      />
      <div className={styles.buttonArea}>
        <button className={styles.submitButton} onClick={handleSubmit}>
          등록하기
        </button>
      </div>
    </div>
  );
}

export default CommentForm;
