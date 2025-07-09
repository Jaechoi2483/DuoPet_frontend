// src/routers/infoRoutes.js
import React from 'react';
import { Route } from 'react-router-dom';
import FindHospitalPage from '../pages/info/FindHospitalPage';
import FindShelterPage from '../pages/info/FindShelterPage';
// 나중에 추가될 다른 정보 페이지들도 여기에 import 합니다.

const infoRoutes = (
  <>
    {/* "병원 찾기" 페이지로 가는 길 */}
    <Route path="/info/hospital" element={<FindHospitalPage />} />
    
    {/* "보호소 찾기" 페이지로 가는 길 */}
    <Route path="/info/shelter" element={<FindShelterPage />} />

    {/* 나중에 "입양 정보" 페이지를 만들면, 아래처럼 추가하면 됩니다.
      <Route path="/info/adoption" element={<AdoptionInfoPage />} /> 
    */}
  </>
);

export default infoRoutes;
