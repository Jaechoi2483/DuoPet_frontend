// pages/video/RecommendVideoPage.js

import React, { useEffect, useState, useContext } from 'react';
import { getRecommendedVideos } from '../../../api/videoRecommendApi';
import { AuthContext } from '../../../AuthProvider';

const RecommendVideoPage = () => {
  const [videos, setVideos] = useState([]);
  const { userid } = useContext(AuthContext);
  const sampleTags = ['산책', '짖음', '훈련']; // 테스트용 태그

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const result = await getRecommendedVideos(userid, sampleTags);
        console.log('추천 영상 API 응답:', result);

        setVideos(result?.videos || []);
      } catch (error) {
        console.error('추천 영상 불러오기 실패:', error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🎥 추천 영상 목록</h2>
      {videos.length === 0 ? (
        <p>추천 영상을 불러오는 중입니다...</p>
      ) : (
        videos.map((video) => (
          <div key={video.video_id} style={{ marginBottom: '2rem' }}>
            <h3>{video.title}</h3>
            <img
              src={video.thumbnail_url}
              alt={video.title}
              width="320"
              height="180"
              style={{ borderRadius: '12px' }}
            />
            <p>{video.description}</p>
            <p>채널: {video.channel_name}</p>
            <a href={`https://www.youtube.com/watch?v=${video.video_id}`} target="_blank" rel="noopener noreferrer">
              👉 유튜브에서 보기
            </a>
          </div>
        ))
      )}
    </div>
  );
};

export default RecommendVideoPage;
