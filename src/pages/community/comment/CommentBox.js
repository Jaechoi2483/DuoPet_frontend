// components/community/comments/CommentBox.js

import React, { useEffect, useState, useContext } from 'react';
import apiClient from '../../../utils/axios';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import styles from './Comment.module.css';
import { AuthContext } from '../../../AuthProvider'; // 로그인 상태 확인을 위해 import

function CommentBox({ contentId }) {
  const [comments, setComments] = useState([]);
  const [reload, setReload] = useState(false);
  const { isLoggedIn } = useContext(AuthContext); // 로그인 상태 가져오기

  useEffect(() => {
    fetchComments();
  }, [contentId, reload]);

  const fetchComments = async () => {
    try {
      const res = await apiClient.get(`/comments/${contentId}`);
      setComments(res.data);
    } catch (err) {
      console.error('댓글 불러오기 실패', err);
    }
  };

  const handleReload = () => setReload(!reload);

  return (
    <div className={styles.commentContainer}>
      <h3>댓글</h3>

      {/* 로그인한 경우에만 댓글 작성 폼 보이기 */}
      {isLoggedIn ? (
        <CommentForm contentId={contentId} onSuccess={handleReload} />
      ) : (
        <p className={styles.notice}>※ 댓글 작성을 하려면 로그인이 필요합니다.</p>
      )}

      <div className={styles.commentList}>
        {comments.map((comment) => (
          <CommentItem key={comment.commentId} comment={comment} allComments={comments} onReload={handleReload} />
        ))}
      </div>
    </div>
  );
}

export default CommentBox;
