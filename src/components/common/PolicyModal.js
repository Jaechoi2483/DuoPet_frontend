import React from 'react';
import './PolicyModal.css';

const PolicyModal = ({ title, content, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{title}</h2>
        <div className="modal-content">
          <p>{content}</p>
        </div>
        <button onClick={onClose} className="close-button">닫기</button>
      </div>
    </div>
  );
};

export default PolicyModal;
