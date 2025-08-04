// src/pages/community/freeBoard/FreeBoardReport.js

import React, { useState, useEffect } from 'react';
import apiClient from '../../../utils/axios';
import Modal from '../../../components/common/Modal';
import modalStyles from '../../../components/common/Modal.module.css';

// 게시글/댓글 신고 모달 컴포넌트
const BoardReport = ({ isOpen, targetId, targetType, onClose }) => {
  // 신고 사유 및 상세 설명 상태
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  // 모달이 열릴 때 입력값 초기화
  useEffect(() => {
    if (isOpen) {
      setReason('');
      setDetails('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 신고 요청 처리
  const handleReport = async () => {
    if (!reason) {
      alert('신고 사유를 선택해주세요.');
      return;
    }

    // JWT 토큰을 가져오기 (로컬 스토리지에서)
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    // 로그인 상태 확인
    if (!accessToken || !refreshToken) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }

    try {
      // 서버로 신고 데이터 전송
      const response = await apiClient.post(
        '/board/report', // 백엔드 API 경로
        {
          targetId,
          targetType,
          reason,
          details,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // JWT 토큰을 헤더에 포함
            RefreshToken: `Bearer ${refreshToken}`, // Refresh 토큰도 헤더에 포함
          },
        }
      );

      // 성공 시 알림 및 모달 닫기
      alert('신고가 접수되었습니다.');
      onClose(); // 모달 닫기
    } catch (error) {
      if (error.response?.data) {
        alert(error.response.data);
      } else {
        alert('신고 처리 중 알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className={modalStyles.title}>{targetType === 'comment' ? '댓글 신고하기' : '게시물 신고하기'}</h2>
      <p className={modalStyles.desc}>신고 사유를 선택해주세요. 검토 후 조치를 취하겠습니다.</p>

      <div className={modalStyles.formGroup}>
        <label className={modalStyles.formLabel}>신고 사유</label>
        <select className={modalStyles.formSelect} value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="">-- 선택 --</option>
          <option value="spam">스팸/도배</option>
          <option value="inappropriate">부적절한 내용</option>
          <option value="wrongInfo">잘못된 정보</option>
          <option value="offensive">괴롭힘/욕설</option>
          <option value="copyright">저작권 침해</option>
          <option value="other">기타</option>
        </select>
      </div>

      <div className={modalStyles.formGroup}>
        <label className={modalStyles.formLabel}>상세 설명 (선택사항)</label>
        <textarea
          className={modalStyles.formTextarea}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="신고 사유에 대한 자세한 설명을 입력해주세요..."
        />
      </div>

      <button className={modalStyles.submitButton} onClick={handleReport} disabled={!reason}>
        신고하기
      </button>
    </Modal>
  );
};

export default BoardReport;
