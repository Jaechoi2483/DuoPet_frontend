// components/community/comments/CommentItem.js

import React from 'react';
import apiClient from '../../../utils/axios';
import styles from './Comment.module.css';

function CommentItem({ comment, onReload }) {
  const handleDelete = async () => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      try {
        await apiClient.delete(`/comments/delete/${comment.commentId}`);
        onReload();
      } catch (err) {
        alert('삭제 실패');
      }
    }
  };

  return (
    <div className={styles.commentItem}>
      <div className={styles.commentHeader}>
        <span className={styles.nickname}>{comment.nickname || '작성자'}</span>
        <span className={styles.date}>{comment.createdAt?.substring(0, 10)}</span>
      </div>
      <p className={styles.content}>{comment.content}</p>
      <button onClick={handleDelete} className={styles.deleteBtn}>
        삭제
      </button>
    </div>
  );
}

export default CommentItem;
