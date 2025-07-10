import React, { useEffect, useState } from 'react';
import styles from './FindHospital.module.css';
import axios from '../../utils/axios';

const FindHospital = () => {
    const [vets, setVets] = useState([]);

    useEffect(() => {
        // 백엔드에서 수의사 목록 가져오기
        const fetchVets = async () => {
            try {
                const response = await axios.get('/api/vets');
                setVets(response.data);
            } catch (error) {
                console.error("Error fetching vets:", error);
            }
        };

        fetchVets();
    }, []);

    useEffect(() => {
        // 카카오맵 API 로드 및 지도 생성
        const script = document.createElement('script');
        script.async = true;
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_KEY}&autoload=false`;
        document.head.appendChild(script);

        script.onload = () => {
            window.kakao.maps.load(() => {
                const container = document.getElementById('map');
                const options = {
                    center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 기본 중심: 서울
                    level: 3,
                };
                const map = new window.kakao.maps.Map(container, options);

                // 수의사 데이터를 기반으로 마커 표시
                vets.forEach(vet => {
                    // 주소-좌표 변환 객체 생성
                    const geocoder = new window.kakao.maps.services.Geocoder();
                    
                    geocoder.addressSearch(vet.address, function(result, status) {
                        if (status === window.kakao.maps.services.Status.OK) {
                            const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

                            const marker = new window.kakao.maps.Marker({
                                map: map,
                                position: coords,
                                title: vet.name,
                            });

                            // 마커에 표시할 인포윈도우 생성
                            const infowindow = new window.kakao.maps.InfoWindow({
                                content: `<div style="padding:5px;font-size:12px;">${vet.name}</div>`
                            });
                            infowindow.open(map, marker);
                        }
                    });
                });
            });
        };

        return () => {
            document.head.removeChild(script);
        }
    }, [vets]);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>병원 찾기</h1>
            <div id="map" className={styles.map}></div>
            <div className={styles.vetList}>
                <h2 className={styles.listTitle}>병원 목록</h2>
                <ul>
                    {vets.map((vet, index) => (
                        <li key={index} className={styles.vetItem}>
                            <h3>{vet.name}</h3>
                            <p>{vet.address}</p>
                            <p>{vet.phone}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default FindHospital;
