// src/pages/community/freeBoard/FreeBoardReport.js

import React, { useState } from 'react';
import apiClient from '../../../utils/axios';
import Modal from '../../../components/common/Modal';
import modalStyles from '../../../components/common/Modal.module.css';

const FreeBoardReport = ({ postId, onClose }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

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
          targetId: postId, // 신고 대상 ID (게시글 ID)
          targetType: 'content', // 신고 대상 유형 ("content"로 고정)
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
      if (error.response?.status === 409) {
        alert(error.response.data);
      } else {
        console.error('신고 실패', error);
        alert('신고 처리 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <h2 className={modalStyles.title}>게시물 신고하기</h2>
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

export default FreeBoardReport;
