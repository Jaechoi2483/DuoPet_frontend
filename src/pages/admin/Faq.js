import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/axios';
import styles from './Faq.module.css';
import PagingView from '../../components/common/pagingView';

// JWT 토큰의 payload를 디코딩하는 헬퍼 함수
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

// UTF-8 byte 계산 함수
function getUtf8Bytes(str) {
  if (!str) return 0;
  let bytes = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code <= 0x7f) bytes += 1;
    else if (code <= 0x7ff) bytes += 2;
    else if (code <= 0xffff) bytes += 3;
    else bytes += 4;
  }
  return bytes;
}

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

  // 등록 관련 state
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  // 관리자 권한 체크 state
  const [isAdmin, setIsAdmin] = useState(false);

  // 검색 관련 state
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // 관리자 권한 확인
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.role === 'admin') {
        setIsAdmin(true);
      }
    }
  }, []);

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

  // 3. 수정 저장 로직
  const handleSave = async (faqId) => {
    try {
      const updatedData = { question: editQuestion, answer: editAnswer };
      const response = await apiClient.put(`/faq/${faqId}`, updatedData);
      setFaqs(faqs.map((faq) => (faq.faqId === faqId ? response.data : faq)));
      setEditIdx(null);
    } catch (err) {
      console.error('FAQ 수정 중 오류 발생:', err);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  // 4. 등록 로직
  const handleAdd = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      alert('질문과 답변을 모두 입력해주세요.');
      return;
    }

    try {
      const newFaqData = { question: newQuestion, answer: newAnswer };
      const response = await apiClient.post('/faq', newFaqData);

      // 새 FAQ를 목록에 추가하고 첫 페이지로 이동
      setFaqs([response.data, ...faqs]);
      setNewQuestion('');
      setNewAnswer('');
      setIsAdding(false);
      setCurrentPage(0); // 첫 페이지로 이동

      alert('FAQ가 성공적으로 등록되었습니다.');
    } catch (err) {
      console.error('FAQ 등록 중 오류 발생:', err);
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  // 5. 검색 실행 핸들러 추가
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchKeyword(searchInput.trim());
    setCurrentPage(0); // 검색 시 첫 페이지로 이동
  };

  if (loading) return <div className={styles.container}>로딩 중...</div>;
  if (error) return <div className={styles.container}>데이터를 불러오는 중 오류가 발생했습니다.</div>;

  const handleDelete = async (faqId) => {
    // 사용자에게 정말 삭제할 것인지 재확인
    if (!window.confirm('정말로 이 FAQ를 삭제하시겠습니까?')) {
      return;
    }

    try {
      // 인증이 필요한 apiClient 사용 (또는 privateApi)
      await apiClient.delete(`/faq/${faqId}`);

      // 화면에서도 해당 FAQ를 즉시 제거하여 사용자 경험 향상
      setFaqs(faqs.filter((faq) => faq.faqId !== faqId));

      alert('성공적으로 삭제되었습니다.');
    } catch (err) {
      console.error('FAQ 삭제 중 오류 발생:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // PagingView용 페이지 계산
  const pageBlockSize = 10;
  const totalPage = pageInfo.totalPages;
  const currentBlock = Math.floor(currentPage / pageBlockSize);
  const startPage = currentBlock * pageBlockSize + 1;
  const endPage = Math.min(startPage + pageBlockSize - 1, totalPage);

  // PagingView에서 받은 pageNumber(1-based)를 state index(0-based)로 변환
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber - 1);
  };

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
        <button className={styles.searchButton} type="submit" aria-label="검색">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" />
            <line x1="14.2" y1="14.2" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
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
                <div className={styles.questionContainer}>
                  <div
                    className={styles.questionContent}
                    onClick={() => !isEdit && handleToggle(idx)}
                    style={{ cursor: isEdit ? 'default' : 'pointer' }}
                  >
                    {isEdit ? (
                      <>
                        <input
                          className={styles.editInput}
                          value={editQuestion}
                          onChange={(e) => setEditQuestion(e.target.value)}
                          placeholder="질문을 입력하세요"
                        />
                        <div
                          className={styles.charCount}
                          style={{ textAlign: 'right', color: '#888', fontSize: '12px', marginTop: '2px' }}
                        >
                          {getUtf8Bytes(editQuestion)} / 1000 byte
                        </div>
                      </>
                    ) : (
                      <span className={styles.questionText}>{item.question}</span>
                    )}
                  </div>
                  <div className={styles.questionActions}>
                    <button
                      className={styles.toggleButton}
                      onClick={() => handleToggle(idx)}
                      aria-expanded={openIdx === idx}
                      disabled={isEdit}
                    >
                      {openIdx === idx ? '▲' : '▼'}
                    </button>
                  </div>
                </div>
                {openIdx === idx && (
                  <div className={styles.answer}>
                    {isEdit ? (
                      <div className={styles.editMode}>
                        <textarea
                          className={styles.editTextarea}
                          value={editAnswer}
                          onChange={(e) => setEditAnswer(e.target.value)}
                          placeholder="답변을 입력하세요"
                        />
                        <div
                          className={styles.charCount}
                          style={{ textAlign: 'right', color: '#888', fontSize: '12px', marginTop: '2px' }}
                        >
                          {getUtf8Bytes(editAnswer)} / 4000 byte
                        </div>
                        <div className={styles.editButtonBar}>
                          <button className={styles.saveButton} onClick={() => handleSave(item.faqId)}>
                            저장
                          </button>
                          <button className={styles.cancelButton} onClick={() => setEditIdx(null)}>
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.answerContent}>
                        <span>{item.answer}</span>
                        {isAdmin && (
                          <div className={styles.adminButtons}>
                            {' '}
                            {/* 버튼들을 감싸는 div 추가 권장 */}
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
                            {/* ✅ 새로 추가할 삭제 버튼 */}
                            <button
                              className={styles.editButton} // CSS 스타일은 별도 정의 필요
                              onClick={() => handleDelete(item.faqId)}
                            >
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 등록 모드 */}
      {isAdding && (
        <div className={styles.faqItem}>
          <div className={styles.questionContainer}>
            <div className={styles.questionContent}>
              <input
                className={styles.editInput}
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="질문을 입력하세요"
              />
              <div
                className={styles.charCount}
                style={{ textAlign: 'right', color: '#888', fontSize: '12px', marginTop: '2px' }}
              >
                {getUtf8Bytes(newQuestion)} / 1000 byte
              </div>
            </div>
            <div className={styles.questionActions}>
              <button className={styles.toggleButton} disabled style={{ opacity: 0.3 }}>
                ▼
              </button>
            </div>
          </div>
          <div className={styles.answer}>
            <div className={styles.editMode}>
              <textarea
                className={styles.editTextarea}
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="답변을 입력하세요"
              />
              <div
                className={styles.charCount}
                style={{ textAlign: 'right', color: '#888', fontSize: '12px', marginTop: '2px' }}
              >
                {getUtf8Bytes(newAnswer)} / 4000 byte
              </div>
              <div className={styles.editButtonBar}>
                <button className={styles.saveButton} onClick={handleAdd}>
                  등록
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={() => {
                    setIsAdding(false);
                    setNewQuestion('');
                    setNewAnswer('');
                  }}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PagingView 컴포넌트로 교체 */}
      {totalPage > 1 && (
        <PagingView
          currentPage={currentPage + 1}
          totalPage={totalPage}
          startPage={startPage}
          endPage={endPage}
          onPageChange={handlePageChange}
        />
      )}
      {/* 등록 버튼 (관리자만) */}
      {isAdmin && !isAdding && (
        <div className={styles.addButtonContainer}>
          <button className={styles.addButton} onClick={() => setIsAdding(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 5V19M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            FAQ 등록
          </button>
        </div>
      )}
    </div>
  );
}

export default Faq;
