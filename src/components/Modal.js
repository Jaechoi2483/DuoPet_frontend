// src/components/common/Modal.js

import React from 'react';
import './PolicyModal.css'; // 모달 스타일 재활용

const Modal = ({ children, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
        <button className="close-button" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default Modal;
