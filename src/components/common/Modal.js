<<<<<<< HEAD
// src/components/common/Modal.js

import React, { startTransition } from 'react';
import styles from './Modal.module.css';


=======
import React from 'react';
import styles from './Modal.module.css';

>>>>>>> bba0ac55e35799ffcfd9a6eb684a926f518bd4c0
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default Modal;
=======
export default Modal;
>>>>>>> bba0ac55e35799ffcfd9a6eb684a926f518bd4c0
