// src/components/common/Footer.js

import React from 'react';
import styles from './Footer.module.css'; // Footer.module.css 임포트

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerGrid}>
          <div>
            <h3 className={styles.footerSectionTitle}>DuoPet</h3>
            <p className={styles.footerText}>
              반려동물과 함께하는 더 행복한 삶을 위한 종합 플랫폼
            </p>
          </div>

          <div>
            <h3 className={styles.footerSectionTitle}>회사 정보</h3>
            <ul className={styles.footerList}>
              <li className={styles.footerText}>상호명: (주)Petlogue</li>
              <li className={styles.footerText}>대표자: 김준용</li>
              <li className={styles.footerText}>
                사업자등록번호: 123-45-67890
              </li>
              <li className={styles.footerText}>
                통신판매업신고: 제2025-서울강남-1234호
              </li>
            </ul>
          </div>

          <div>
            <h3 className={styles.footerSectionTitle}>고객 지원</h3>
            <ul className={styles.footerList}>
              <li className={styles.footerText}>고객센터: 1588-1234</li>
              <li className={styles.footerText}>
                이메일: support@petlogue.co.kr
              </li>
              <li className={styles.footerText}>
                운영시간: 평일 09:00 - 18:00
              </li>
            </ul>
          </div>

          <div>
            <h3 className={styles.footerSectionTitle}>약관 및 정책</h3>
            <ul className={styles.footerList}>
              <li>
                <a href="#" className={styles.footerListLink}>
                  이용약관
                </a>
              </li>
              <li>
                <a href="#" className={styles.footerListLink}>
                  개인정보처리방침
                </a>
              </li>
              <li>
                <a href="#" className={styles.footerListLink}>
                  위치기반서비스 이용약관
                </a>
              </li>
              <li>
                <a href="#" className={styles.footerListLink}>
                  사업자정보확인
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerDivider}>
          © 2025 DuoPet. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;