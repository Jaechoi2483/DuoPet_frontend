import React from 'react';
import { Route } from 'react-router-dom';
import AdoptionList from '../pages/adoption/AdoptionList';
import AdoptionDetail from '../pages/adoption/AdoptionDetail';

const adoptionRoutes = (
  <>
    {/* 입양 정보 목록 페이지 */}
    <Route path="/adoption" element={<AdoptionList />} />
    
    {/* 입양 동물 상세 페이지 */}
    <Route path="/adoption/detail/:id" element={<AdoptionDetail />} />
  </>
);

export default adoptionRoutes;