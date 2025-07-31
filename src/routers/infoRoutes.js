// src/routers/infoRoutes.js
import React from 'react';
import { Route } from 'react-router-dom';
import FindHospitalPage from '../pages/info/FindHospitalPage';
import FindShelterPage from '../pages/info/FindShelterPage';

const infoRoutes = (
  <>
    {/* "병원 찾기" 페이지 */}
    <Route path="/info/hospital" element={<FindHospitalPage />} />

    {/* "보호소 찾기" 페이지 */}
    <Route path="/info/shelter" element={<FindShelterPage />} />
  </>
);

export default infoRoutes;
