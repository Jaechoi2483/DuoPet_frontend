import React from 'react';

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  zIndex: 2000,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const modalStyle = {
  background: 'none',
  border: 'none',
  boxShadow: 'none',
  padding: 0,
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const closeBtnStyle = {
  position: 'absolute',
  top: '-32px',
  right: '0',
  background: 'none',
  border: 'none',
  fontSize: '2rem',
  color: '#fff',
  cursor: 'pointer',
  zIndex: 10,
};

function ChatbotModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button style={closeBtnStyle} onClick={onClose} aria-label="닫기">&times;</button>
        {children}
      </div>
    </div>
  );
}

export default ChatbotModal; 