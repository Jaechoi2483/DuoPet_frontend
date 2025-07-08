import React, { useState } from 'react';
import styles from './Footer.module.css';
import PolicyModal from './PolicyModal';
import './PolicyModal.css';

function Footer() {
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const policyContents = {
    '이용약관': '이용약관 내용 예시입니다. 이곳에 서비스 이용 조건, 사용자 책임, 금지사항 등을 작성하세요.',
    '개인정보처리방침': '개인정보 처리방침 예시입니다. 수집하는 항목, 보유기간, 제3자 제공 여부 등을 포함합니다.',
    '위치기반서비스 이용약관': '위치기반 서비스 이용에 대한 조건을 설명합니다. 사용자 동의, 데이터 활용 범위 등을 명시하세요.',
    '사업자정보확인': '상호: (주)듀오펫, 대표자: 홍길동, 사업자등록번호: 123-45-67890, 통신판매신고: 제2025-서울강남-1234호'
  };

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
              <li className={styles.footerText}>상호명: (주)듀오펫</li>
              <li className={styles.footerText}>대표자: 김준용</li>
              <li className={styles.footerText}>사업자등록번호: 123-45-67890</li>
              <li className={styles.footerText}>통신판매업신고: 제2025-서울강남-1234호</li>
            </ul>
          </div>

          <div>
            <h3 className={styles.footerSectionTitle}>고객 지원</h3>
            <ul className={styles.footerList}>
              <li className={styles.footerText}>고객센터: 1588-1234</li>
              <li className={styles.footerText}>이메일: support@duopet.co.kr</li>
              <li className={styles.footerText}>운영시간: 평일 09:00 - 18:00</li>
            </ul>
          </div>

          <div>
            <h3 className={styles.footerSectionTitle}>약관 및 정책</h3>
            <ul className={styles.footerList}>
              {Object.keys(policyContents).map((key) => (
                <li key={key}>
                  <button
                    onClick={() => setSelectedPolicy(key)}
                    className={styles.footerListLink}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {key}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.footerDivider}>
          © 2025 DuoPet. All rights reserved.
        </div>
      </div>

      {selectedPolicy && (
        <PolicyModal
          title={selectedPolicy}
          content={policyContents[selectedPolicy]}
          onClose={() => setSelectedPolicy(null)}
        />
      )}
    </footer>
  );
}

export default Footer;
