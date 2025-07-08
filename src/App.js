import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import AppRouter from './routers/router';
import Menubar from './components/common/Menubar';
import Footer from './components/common/Footer';

function App() {
  return (
    <Router>
      <Menubar />
      <AppRouter />
      <Footer />
    </Router>
  );
}

export default App;
