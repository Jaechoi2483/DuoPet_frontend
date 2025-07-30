// components/community/comments/CommentItem.js

import React, { useState, useContext } from 'react';
import apiClient from '../../../utils/axios';
import CommentForm from './CommentForm';
import FreeBoardReport from '../report/BoardReport';
import styles from './Comment.module.css';
import { AuthContext } from '../../../AuthProvider';

// 댓글(대댓글) 컴포넌트
function CommentItem({ comment, allComments = [], onReload, setReportProps, setIsReportOpen }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { user } = useContext(AuthContext); // user만 AuthContext에서 사용 (accessToken은 직접 가져옴)

  // 공통 AuthProvider에서 accessToken을 제공하지 않기 때문에 localStorage에서 직접 가져와야 함
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  // "null" 문자열이나 null 값을 정제
  const validAccessToken = accessToken && accessToken !== 'null' ? accessToken : null;
  const validRefreshToken = refreshToken && refreshToken !== 'null' ? refreshToken : null;

  // 대댓글 필터링
  const replies = allComments.filter((c) => c.parentCommentId === comment.commentId);

  // 댓글 좋아요 핸들러
  const handleLike = async (commentId) => {
    if (!validAccessToken) {
      alert('로그인 후 이용 가능합니다.');
      return;
    }

    try {
      await apiClient.post(
        `/comments/comment-like/${commentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${validAccessToken}`,
            RefreshToken: `Bearer ${validRefreshToken}`,
          },
        }
      );
      onReload(); // 좋아요 후 새로고침
    } catch (err) {
      alert('좋아요 중 오류 발생');
    }
  };

  // 댓글 삭제 핸들러
  const handleDelete = async () => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      try {
        await apiClient.delete(`/comments/delete/${comment.commentId}`, {
          headers: {
            Authorization: `Bearer ${validAccessToken}`,
            RefreshToken: `Bearer ${validRefreshToken}`,
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
        {/* 답글 버튼 */}
        <button onClick={() => setShowReplyForm(!showReplyForm)}>답글</button>

        {/* ❤️ 좋아요 버튼 */}
        <button onClick={() => handleLike(comment.commentId)}>❤️ {comment.likeCount ?? 0}</button>

        {/* 🚨 신고 버튼 */}
        <button
          onClick={() => {
            if (!validAccessToken) {
              alert('로그인 후 이용 가능합니다.');
              return;
            }
            setReportProps({ targetId: comment.commentId, targetType: 'comment' });
            setIsReportOpen(true);
          }}
        >
          🚨 신고
        </button>

        {/* 댓글 작성자와 로그인 유저가 같을 경우 삭제 버튼 노출 */}
        {user?.userId === comment.userId && <button onClick={handleDelete}>삭제</button>}
      </div>

      {/* 대댓글 입력 폼 */}
      {showReplyForm && (
        <CommentForm
          contentId={comment.contentId}
          parentCommentId={comment.commentId}
          accessToken={validAccessToken}
          refreshToken={validRefreshToken}
          onSuccess={() => {
            setShowReplyForm(false);
            onReload();
          }}
        />
      )}

      {/* 대댓글 리스트 렌더링 */}
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
