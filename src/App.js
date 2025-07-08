import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import HomePage from './pages/HomePage';
import AppRouter from './routers/router';
import Menubar from './components/common/Menubar';
import Footer from './components/common/Footer';
import DuoPetGreeting from './components/common/DuoPetGreeting';

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


