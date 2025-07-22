// components/community/comments/CommentItem.js

import React, { useState, useContext } from 'react';
import apiClient from '../../../utils/axios';
import CommentForm from './CommentForm';
import FreeBoardReport from '../freeBoard/FreeBoardReport';
import styles from './Comment.module.css';
import { AuthContext } from '../../../AuthProvider';

function CommentItem({ comment, allComments = [], onReload, setReportProps, setIsReportOpen }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { user, accessToken, refreshToken } = useContext(AuthContext);

  const replies = allComments.filter((c) => c.parentCommentId === comment.commentId);

  // 댓글 좋아요
  const handleLike = async (commentId) => {
    if (!accessToken || accessToken === 'null') {
      alert('로그인 후 이용 가능합니다.');
      return;
    }

    try {
      await apiClient.post(
        `/comments/comment-like/${commentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            RefreshToken: `Bearer ${refreshToken}`,
          },
        }
      );
      onReload(); // 좋아요 후 새로고침
    } catch (err) {
      alert('좋아요 중 오류 발생');
    }
  };

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
        alert('댓글 삭제 중 오류가 발생했습니다.');
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

        {/* ❤️ 좋아요 버튼 */}
        <button onClick={() => handleLike(comment.commentId)}>❤️ {comment.likeCount ?? 0}</button>

        {/* 🚨 신고 버튼 */}
        <button
          onClick={() => {
            if (!accessToken || accessToken === 'null') {
              alert('로그인 후 이용 가능합니다.');
              return;
            }
            setReportProps({ targetId: comment.commentId, targetType: 'COMMENT' });
            setIsReportOpen(true);
          }}
        >
          🚨 신고
        </button>

        {/* 현재 로그인한 유저와 댓글 작성자가 일치할 때만 삭제 버튼 노출 */}
        {user?.userId === comment.userId && <button onClick={handleDelete}>삭제</button>}
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
            <CommentItem
              comment={reply}
              allComments={allComments}
              onReload={onReload}
              setReportProps={setReportProps}
              setIsReportOpen={setIsReportOpen}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommentItem;
