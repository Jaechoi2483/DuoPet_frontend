import React, { useState } from 'react';
import styles from './Faq.module.css';

const FAQ_LIST = [];

function Faq() {
  const [openIdx, setOpenIdx] = useState(null);

  const handleToggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>FAQ</h2>
      <div className={styles.faqList}>
        {FAQ_LIST.map((item, idx) => (
          <div className={styles.faqItem} key={idx}>
            <button
              className={styles.question}
              onClick={() => handleToggle(idx)}
              aria-expanded={openIdx === idx}
              type="button"
            >
              {item.question}
              <span className={styles.arrow}>{openIdx === idx ? '▲' : '▼'}</span>
            </button>
            {openIdx === idx && (
              <div className={styles.answer}>{item.answer}</div>
            )}
          </div>
        ))}
        {FAQ_LIST.length === 0 && (
          <div className={styles.noData}>등록된 FAQ가 없습니다.</div>
        )}
      </div>
    </div>
  );
}

export default Faq;
