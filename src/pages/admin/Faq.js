import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/axios';
import styles from './Faq.module.css';

function Faq() {
  // 1. 서버사이드 페이징을 위한 state 구조로 변경
  const [faqs, setFaqs] = useState([]);
  const [pageInfo, setPageInfo] = useState({ totalPages: 1, number: 0 });
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 수정 관련 state
  const [openIdx, setOpenIdx] = useState(null);
  const [editIdx, setEditIdx] = useState(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  // 검색 관련 state
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // 2. 검색과 페이징에 따라 API를 다시 호출하도록 useEffect 수정
  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: currentPage,
          size: 10, // 한 페이지에 보여줄 개수
          keyword: searchKeyword,
        };
        const response = await apiClient.get('/faq', { params });
        setFaqs(response.data.content);
        setPageInfo(response.data);
      } catch (err) {
        setError(err);
        console.error('FAQ 목록을 불러오는 중 오류 발생:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, [currentPage, searchKeyword]); // 페이지나 검색어가 바뀌면 다시 호출

  const handleToggle = (idx) => setOpenIdx(openIdx === idx ? null : idx);

  // 3. 수정 저장 로직 (id 필드명 확인 필요)
  const handleSave = async (faqId) => {
    try {
      const updatedData = { question: editQuestion, answer: editAnswer };
      const response = await apiClient.put(`/faq/${faqId}`, updatedData);
      setFaqs(faqs.map((faq) => (faq.faqId === faqId ? response.data : faq))); // `faq.id` 또는 `faq.faqId` 등 실제 필드명 사용
      setEditIdx(null);
    } catch (err) {
      console.error('FAQ 수정 중 오류 발생:', err);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  // 4. 검색 실행 핸들러 추가
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchKeyword(searchInput.trim());
    setCurrentPage(0); // 검색 시 첫 페이지로 이동
  };

  if (loading) return <div className={styles.container}>로딩 중...</div>;
  if (error)
    return (
      <div className={styles.container}>
        데이터를 불러오는 중 오류가 발생했습니다.
      </div>
    );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>FAQ</h2>

      {/* 5. 검색 폼으로 변경 */}
      <form className={styles.topBar} onSubmit={handleSearch}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="질문 또는 답변 검색"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button className={styles.searchButton} type="submit">
          검색
        </button>
      </form>

      <div className={styles.faqList}>
        {faqs.length === 0 ? (
          <div className={styles.noData}>등록된 FAQ가 없습니다.</div>
        ) : (
          faqs.map((item, idx) => {
            // 6. pagedFaqs -> faqs 로 변경
            const isEdit = editIdx === item.faqId; // globalIdx 대신 고유 ID 사용
            return (
              <div className={styles.faqItem} key={item.faqId}>
                <button
                  className={styles.question}
                  onClick={() => handleToggle(idx)}
                  aria-expanded={openIdx === idx}
                  disabled={isEdit}
                >
                  {isEdit ? (
                    <input
                      value={editQuestion}
                      onChange={(e) => setEditQuestion(e.target.value)}
                    />
                  ) : (
                    item.question
                  )}
                  <span className={styles.arrow}>
                    {openIdx === idx ? '▲' : '▼'}
                  </span>
                </button>
                {openIdx === idx && (
                  <div className={styles.answer}>
                    {isEdit ? (
                      <>
                        <textarea
                          value={editAnswer}
                          onChange={(e) => setEditAnswer(e.target.value)}
                          rows={4}
                        />
                        <div className={styles.editButtonBar}>
                          <button
                            className={styles.saveButton}
                            onClick={() => handleSave(item.faqId)}
                          >
                            저장
                          </button>
                          <button
                            className={styles.cancelButton}
                            onClick={() => setEditIdx(null)}
                          >
                            취소
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {item.answer}
                        <button
                          className={styles.editButton}
                          onClick={() => {
                            setEditIdx(item.faqId);
                            setEditQuestion(item.question);
                            setEditAnswer(item.answer);
                          }}
                        >
                          수정
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 7. 서버사이드 페이지네이션 UI로 변경 */}
      {pageInfo.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={pageInfo.first}
          >
            이전
          </button>
          <span>
            {pageInfo.number + 1} / {pageInfo.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={pageInfo.last}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

export default Faq;
