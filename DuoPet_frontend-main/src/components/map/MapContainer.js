// src/components/map/MapContainer.js
import React, { useEffect, useState } from 'react';

const MapContainer = ({
  hospitals = [],
  selectedHospital,
  onHospitalSelect,
  userLocation,
  center = { lat: 37.5665, lng: 126.978 },
  zoom = 8,
}) => {
  // hospitals props는 병원과 보호소 모두 지원
  const locations = hospitals;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_KAKAO_MAP_KEY;

    console.log('🔍 카카오맵 디버깅 정보:', {
      apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : 'API 키가 없습니다',
      locationsCount: locations.length,
      currentUrl: window.location.href,
      timestamp: new Date().toLocaleString(),
    });

    if (!apiKey) {
      setError('REACT_APP_KAKAO_MAP_KEY 환경변수가 설정되지 않았습니다.');
      setIsLoading(false);
      return;
    }

    const loadKakaoMapScript = () => {
      return new Promise((resolve, reject) => {
        // 이미 로드되었는지 확인
        if (window.kakao && window.kakao.maps) {
          console.log('✅ 카카오맵 스크립트 이미 로드됨');
          resolve();
          return;
        }

        // 기존 스크립트 제거 (중복 로드 방지)
        const existingScript = document.querySelector(
          'script[src*="dapi.kakao.com"]'
        );
        if (existingScript) {
          existingScript.remove();
        }

        const scriptUrl = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
        console.log('🔄 카카오맵 스크립트 로드 시도:', scriptUrl);

        const script = document.createElement('script');
        script.async = true;
        script.src = scriptUrl;

        script.onload = () => {
          console.log('✅ 카카오맵 스크립트 로드 완료');

          if (window.kakao && window.kakao.maps) {
            window.kakao.maps.load(() => {
              console.log('✅ 카카오맵 라이브러리 초기화 완료');
              resolve();
            });
          } else {
            const errorMsg = '카카오맵 객체를 찾을 수 없습니다.';
            console.error('❌', errorMsg);
            reject(new Error(errorMsg));
          }
        };

        script.onerror = (event) => {
          console.error('❌ 카카오맵 스크립트 로드 실패:', event);
          reject(
            new Error(
              '카카오맵 스크립트 로드 실패 - 403 오류가 발생했을 수 있습니다. 카카오 개발자 콘솔에서 도메인 등록을 확인해주세요.'
            )
          );
        };

        document.head.appendChild(script);
      });
    };

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 카카오맵 스크립트 로드
        await loadKakaoMapScript();

        // 지도 초기화
        const container = document.getElementById('map');
        if (container) {
          const mapCenter = userLocation || center;
          const options = {
            center: new window.kakao.maps.LatLng(mapCenter.lat, mapCenter.lng),
            level: zoom,
          };

          console.log('🗺️ 지도 초기화 시작');
          const mapInstance = new window.kakao.maps.Map(container, options);
          setMap(mapInstance);

          console.log('✅ 지도 초기화 완료');
        }

        setIsLoading(false);
      } catch (err) {
        console.error('❌ 카카오맵 초기화 오류:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [center.lat, center.lng, zoom, userLocation]);

  // 위치 마커 업데이트 (병원/보호소 공통)
  useEffect(() => {
    if (map && locations.length > 0) {
      // 기존 마커 제거
      markers.forEach((marker) => marker.setMap(null));

      const newMarkers = locations.map((location) => {
        const markerPosition = new window.kakao.maps.LatLng(
          location.position.lat,
          location.position.lng
        );

        const marker = new window.kakao.maps.Marker({
          position: markerPosition,
          map: map,
          title: location.name,
          clickable: true,
        });

        // 마커 클릭 이벤트
        window.kakao.maps.event.addListener(marker, 'click', () => {
          if (onHospitalSelect) {
            onHospitalSelect(location.id);
          }
        });

        // 정보창 생성 (병원/보호소 구분)
        const infoWindow = new window.kakao.maps.InfoWindow({
          content: `
            <div style="padding: 10px; width: 200px;">
              <h4 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">
                ${location.name}
              </h4>
              <p style="margin: 0; font-size: 12px; color: #666;">
                ${location.specialization || location.type === 'public' ? '공공보호소' : 
                  location.type === 'private' ? '민간보호소' : 
                  location.type === 'organization' ? '단체보호소' : ''}
              </p>
              <p style="margin: 0; font-size: 12px; color: #666;">
                평점: ${location.rating.toFixed(1)}⭐
              </p>
              <p style="margin: 0; font-size: 12px; color: #666;">
                ${location.openHours || location.operatingHours}
              </p>
            </div>
          `,
        });

        // 마커 호버 이벤트
        window.kakao.maps.event.addListener(marker, 'mouseover', () => {
          infoWindow.open(map, marker);
        });

        window.kakao.maps.event.addListener(marker, 'mouseout', () => {
          infoWindow.close();
        });

        return marker;
      });

      setMarkers(newMarkers);

      // 사용자 위치 마커 추가
      if (userLocation) {
        const userMarkerPosition = new window.kakao.maps.LatLng(
          userLocation.lat,
          userLocation.lng
        );

        const userMarker = new window.kakao.maps.Marker({
          position: userMarkerPosition,
          map: map,
          title: '내 위치',
          image: new window.kakao.maps.MarkerImage(
            'data:image/svg+xml;charset=UTF-8,' +
              encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#3b82f6"/>
                <circle cx="12" cy="12" r="4" fill="white"/>
              </svg>
            `),
            new window.kakao.maps.Size(24, 24)
          ),
        });

        setMarkers((prev) => [...prev, userMarker]);
      }
    }
  }, [map, locations, userLocation, onHospitalSelect]);

  // 선택된 위치 중심으로 지도 이동
  useEffect(() => {
    if (map && selectedHospital) {
      const location = locations.find((l) => l.id === selectedHospital);
      if (location) {
        const moveLatLon = new window.kakao.maps.LatLng(
          location.position.lat,
          location.position.lng
        );
        map.setCenter(moveLatLon);
      }
    }
  }, [map, selectedHospital, locations]);

  if (isLoading) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          padding: '20px',
        }}
      >
        <div style={{ fontSize: '16px', marginBottom: '10px' }}>
          🔄 지도를 불러오는 중...
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          위치 {locations.length}개 표시 예정
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          color: '#ef4444',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🗺️</div>
        <div style={{ fontSize: '16px', marginBottom: '15px' }}>
          지도 로드 실패
        </div>
        <div style={{ fontSize: '14px', marginBottom: '15px' }}>{error}</div>

        <div style={{ fontSize: '12px', color: '#666', textAlign: 'left' }}>
          <strong>해결 방법:</strong>
          <br />
          1. 카카오 개발자 콘솔에서 Web 플랫폼 등록
          <br />
          2. 사이트 도메인에 http://localhost:3000 추가
          <br />
          3. 카카오맵 Web 사용 설정 활성화
          <br />
          4. 개발 서버 재시작 (npm start)
        </div>
      </div>
    );
  }

  return (
    <div
      id="map"
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    />
  );
};

export default MapContainer;
