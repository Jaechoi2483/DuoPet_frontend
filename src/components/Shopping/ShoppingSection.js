import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/axios';
import styles from './ShoppingSection.module.css';
import PagingView from '../common/pagingView';

const ShoppingSection = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // 1. 추천 검색어 목록을 배열로 정의합니다.
  const recommendedQueries = [
    '펫리빙',
    '강아지 장난감',
    '고양이 캣타워',
    '강아지 건강간식',
    '고양이 스트레스 해소',
    '반려동물 자동급식기',
    '반려동물 영양제',
  ];

  // 2. 페이지가 처음 로드될 때 랜덤으로 검색어 하나를 선택하여 상태로 관리합니다.
  const [query, setQuery] = useState(() => recommendedQueries[Math.floor(Math.random() * recommendedQueries.length)]);

  const itemsPerPage = 3;

  useEffect(() => {
    // 페이지가 바뀌면 첫 페이지로 리셋 (검색어가 바뀔 때)
    setPage(1);
  }, [query]);

  useEffect(() => {
    const fetchItems = async () => {
      // 검색어가 없으면 함수를 종료합니다.
      if (!query) return;

      try {
        setLoading(true);
        setError(null);

        const start = (page - 1) * itemsPerPage + 1;
        const response = await apiClient.get('/api/shopping/items', {
          params: {
            query: query,
            display: itemsPerPage,
            start: start,
          },
        });

        const cleanedItems = response.data.items.map((item) => ({
          ...item,
          title: item.title.replace(/<[^>]*>?/g, ''),
        }));

        setItems(cleanedItems);
        setTotalItems(response.data.total);
      } catch (err) {
        setError('상품 정보를 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [page, query]); // query가 바뀔 때도 상품을 다시 불러옵니다.

  const totalPage = Math.ceil(Math.min(totalItems, 1000) / itemsPerPage);
  const pageBlockSize = 5;
  const currentBlock = Math.ceil(page / pageBlockSize);
  const startPage = (currentBlock - 1) * pageBlockSize + 1;
  const endPage = Math.min(startPage + pageBlockSize - 1, totalPage);

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.shoppingSection}>
      {/* 3. 제목을 선택된 검색어에 맞춰 동적으로 변경합니다. */}
      <h2 className={styles.title}>🎁 오늘의 추천: {query}</h2>

      {loading ? (
        <div className={styles.loading}>상품을 찾고 있습니다...</div>
      ) : (
        <div className={styles.itemsContainer}>
          {items.map((item, index) => (
            <a href={item.link} key={index} target="_blank" rel="noopener noreferrer" className={styles.itemCard}>
              <img src={item.image} alt={item.title} className={styles.itemImage} />
              <div className={styles.itemInfo}>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.itemPrice}>{item.lprice.toLocaleString()}원</p>
              </div>
            </a>
          ))}
        </div>
      )}
      <div className={styles.pagination}>
        {totalItems > 0 && !loading && (
          <PagingView
            currentPage={page}
            totalPage={totalPage}
            startPage={startPage}
            endPage={endPage}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default ShoppingSection;
