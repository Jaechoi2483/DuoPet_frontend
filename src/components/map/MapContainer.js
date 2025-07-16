// src/components/map/MapContainer.js
import React, { useEffect, useState, useRef } from 'react';

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
  const [openInfoWindow, setOpenInfoWindow] = useState(null);
  const markersRef = useRef([]);
  const infoWindowsRef = useRef([]);

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

        const scriptUrl = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
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
  
  // 지도 클릭 이벤트 핸들러
  useEffect(() => {
    if (map) {
      const clickListener = () => {
        // 모든 InfoWindow 닫기
        infoWindowsRef.current.forEach(iw => iw.close());
        setOpenInfoWindow(null);
      };
      
      window.kakao.maps.event.addListener(map, 'click', clickListener);
      
      return () => {
        window.kakao.maps.event.removeListener(map, 'click', clickListener);
      };
    }
  }, [map]);

  // 위치 마커 업데이트 (병원/보호소 공통)
  useEffect(() => {
    if (map && locations.length > 0) {
      // 기존 마커 및 InfoWindow 제거
      markersRef.current.forEach((marker) => {
        marker.setMap(null);
      });
      infoWindowsRef.current.forEach((infoWindow) => {
        infoWindow.close();
      });
      markersRef.current = [];
      infoWindowsRef.current = [];

      const newMarkers = locations.map((location, index) => {
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

        // 정보창 생성 (병원/보호소 구분)
        const infoWindow = new window.kakao.maps.InfoWindow({
          content: `
            <div style="padding: 10px; width: 200px;">
              <h4 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">
                ${location.name}
              </h4>
              <p style="margin: 0; font-size: 12px; color: #666;">
                ${
                  location.specialization || location.type === 'public'
                    ? '공공보호소'
                    : location.type === 'private'
                      ? '민간보호소'
                      : location.type === 'organization'
                        ? '단체보호소'
                        : ''
                }
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

        // 마커 클릭 이벤트 - InfoWindow 토글
        window.kakao.maps.event.addListener(marker, 'click', () => {
          // 모든 InfoWindow 닫기
          infoWindowsRef.current.forEach((iw, idx) => {
            if (idx !== index) {
              iw.close();
            }
          });

          // 현재 InfoWindow 토글
          const isOpen = infoWindow.getMap();
          if (isOpen) {
            infoWindow.close();
            setOpenInfoWindow(null);
          } else {
            infoWindow.open(map, marker);
            setOpenInfoWindow(infoWindow);
          }

          // 병원 선택 이벤트 발생
          if (onHospitalSelect) {
            onHospitalSelect(location.id);
          }
        });

        // 마커 호버 이벤트 - 클릭으로 열린 InfoWindow가 없을 때만 작동
        window.kakao.maps.event.addListener(marker, 'mouseover', () => {
          const hasOpenInfoWindow = infoWindowsRef.current.some(iw => iw.getMap());
          if (!hasOpenInfoWindow) {
            infoWindow.open(map, marker);
          }
        });

        window.kakao.maps.event.addListener(marker, 'mouseout', () => {
          const isClickedOpen = openInfoWindow === infoWindow;
          if (!isClickedOpen && infoWindow.getMap()) {
            infoWindow.close();
          }
        });

        // 참조 배열에 저장
        infoWindowsRef.current.push(infoWindow);
        marker.infoWindow = infoWindow;
        marker.infoWindowIndex = index;

        return marker;
      });

      markersRef.current = newMarkers;
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

        markersRef.current.push(userMarker);
        setMarkers((prev) => [...prev, userMarker]);
      }
    }
  }, [map, locations, userLocation, onHospitalSelect]);

  // 선택된 위치 중심으로 지도 이동
  useEffect(() => {
    if (map && selectedHospital) {
      console.log('🎯 지도 이동 시도:', {
        selectedHospital,
        selectedHospitalType: typeof selectedHospital,
        locationsCount: locations.length,
        locationIds: locations.map(l => ({ id: l.id, idType: typeof l.id, name: l.name }))
      });
      
      // ID 타입을 맞춰서 검색 (문자열과 숫자 모두 대응)
      const location = locations.find((l) => l.id == selectedHospital || l.id === selectedHospital);
      
      if (location) {
        console.log('✅ 병원 찾음, 지도 이동:', {
          name: location.name,
          position: location.position,
          selectedId: selectedHospital
        });
        
        const moveLatLon = new window.kakao.maps.LatLng(
          location.position.lat,
          location.position.lng
        );
        
        // 지도 중심 이동
        map.setCenter(moveLatLon);
        
        // 적절한 줌 레벨로 설정 (자동 줌 아웃 제거)
        map.setLevel(5);
        
        // 해당 마커의 InfoWindow 열기
        const markerIndex = locations.findIndex(l => l.id == selectedHospital || l.id === selectedHospital);
        if (markerIndex !== -1 && markersRef.current[markerIndex]) {
          const marker = markersRef.current[markerIndex];
          const infoWindow = infoWindowsRef.current[markerIndex];
          
          if (infoWindow) {
            // 모든 InfoWindow 닫기
            infoWindowsRef.current.forEach(iw => iw.close());
            
            // 선택된 마커의 InfoWindow 열기
            infoWindow.open(map, marker);
            setOpenInfoWindow(infoWindow);
          }
        }
      } else {
        console.warn('❌ 선택된 병원을 찾을 수 없음:', {
          selectedHospital,
          availableIds: locations.map(l => l.id)
        });
      }
    }
  }, [map, selectedHospital, locations, markers]);

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
