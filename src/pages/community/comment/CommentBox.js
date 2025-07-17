// components/community/comments/CommentBox.js

import React, { useEffect, useState } from 'react';
import apiClient from '../../../utils/axios';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import styles from './Comment.module.css';

function CommentBox({ contentId }) {
  const [comments, setComments] = useState([]);
  const [reload, setReload] = useState(false);

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
      <CommentForm contentId={contentId} onSuccess={handleReload} />
      <div className={styles.commentList}>
        {comments.map((comment) => (
          <CommentItem key={comment.commentId} comment={comment} onReload={handleReload} />
        ))}
      </div>
    </div>
  );
}

export default CommentBox;
