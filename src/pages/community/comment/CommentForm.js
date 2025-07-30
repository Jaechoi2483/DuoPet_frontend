// components/community/comments/CommentForm.js

import React, { useState } from 'react';
import apiClient from '../../../utils/axios';
import styles from './Comment.module.css';

// 댓글/대댓글 작성 폼
function CommentForm({ contentId, parentCommentId = null, onSuccess }) {
  const [comment, setComment] = useState('');

  // JWT 인증 토큰 가져오기
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const isLoggedIn = accessToken && refreshToken;

  // 댓글 등록 요청
  const handleSubmit = async () => {
    if (!comment.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    if (!isLoggedIn) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }

    try {
      await apiClient.post(
        `/comments/insert`,
        {
          contentId: Number(contentId),
          parentCommentId, // null이면 댓글, 있으면 대댓글
          content: comment,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            RefreshToken: `Bearer ${refreshToken}`,
          },
          withCredentials: true,
        }
      );

      // 성공 시 입력 초기화 + 콜백
      setComment('');
      onSuccess?.(); // 새로고침 콜백 실행
    } catch (error) {
      console.error('댓글 등록 실패:', error);
      alert('댓글 등록 중 오류가 발생했습니다.');
    }
  };

  // 비로그인 상태면 안내 문구만 렌더링
  if (!isLoggedIn) {
    return (
      <div className={styles.commentCard}>
        <p className={styles.loginNotice}>⚠️ 로그인 후 댓글을 작성하실 수 있습니다.</p>
      </div>
    );
  }

  // 댓글/답글 작성 폼
  return (
    <div className={parentCommentId ? styles.replyForm : styles.commentCard}>
      <label className={styles.label}>{parentCommentId ? '답글 작성' : '댓글 작성'}</label>
      <textarea
        className={styles.textarea}
        placeholder={parentCommentId ? '답글을 입력하세요' : '댓글을 입력하세요'}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={parentCommentId ? 2 : 4}
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
