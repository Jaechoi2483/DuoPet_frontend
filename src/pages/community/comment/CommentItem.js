// components/community/comments/CommentItem.js

import React, { useState, useContext } from 'react';
import apiClient from '../../../utils/axios';
import CommentForm from './CommentForm';
import styles from './Comment.module.css';
import { AuthContext } from '../../../AuthProvider';

function CommentItem({ comment, allComments = [], onReload }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { accessToken, refreshToken } = useContext(AuthContext);

  const replies = allComments.filter((c) => c.parentCommentId === comment.commentId);

  const handleDelete = async () => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      try {
        await apiClient.delete(`/comments/delete/${comment.commentId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            RefreshToken: `Bearer ${refreshToken}`,
          },
        });
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
        <span className={styles.date}>
          {comment.createdAt ? new Date(comment.createdAt).toISOString().substring(0, 10) : '날짜 없음'}
        </span>
      </div>

      <p className={styles.content}>{comment.content}</p>

      <div className={styles.actions}>
        <button onClick={() => setShowReplyForm(!showReplyForm)}>답글</button>
        <button onClick={handleDelete}>삭제</button>
      </div>

      {/* 대댓글 작성 폼 */}
      {showReplyForm && (
        <CommentForm
          contentId={comment.contentId}
          parentCommentId={comment.commentId}
          accessToken={accessToken}
          refreshToken={refreshToken}
          onSuccess={() => {
            setShowReplyForm(false);
            onReload();
          }}
        />
      )}

      {/* 대댓글 렌더링 */}
      <div className={styles.replyList}>
        {replies.map((reply) => (
          <div key={reply.commentId} className={styles.replyIndent}>
            <CommentItem comment={reply} allComments={allComments} onReload={onReload} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommentItem;
