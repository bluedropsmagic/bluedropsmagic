import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { UpsellPage } from './pages/UpsellPage.tsx';
import { DownsellPage } from './pages/DownsellPage.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/home" element={<App />} />
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Upsell Pages */}
        <Route path="/up1bt" element={<UpsellPage variant="1-bottle" />} />
        <Route path="/up3bt" element={<UpsellPage variant="3-bottle" />} />
        <Route path="/up6bt" element={<UpsellPage variant="6-bottle" />} />
        
        {/* Downsell Pages */}
        <Route path="/dws1" element={<DownsellPage variant="dws1" />} />
        <Route path="/dws2" element={<DownsellPage variant="dws2" />} />
        <Route path="/dw3" element={<DownsellPage variant="dw3" />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);