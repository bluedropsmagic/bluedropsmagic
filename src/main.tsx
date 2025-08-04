import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import FTRPage from './pages/FTRPage.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { UpsellPage } from './pages/UpsellPage.tsx';
import { DownsellPage } from './pages/DownsellPage.tsx';
import { SecondUpsellPage } from './pages/SecondUpsellPage.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { ThankYouPage } from './pages/ThankYouPage.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/home" element={<App />} />
        <Route path="/ftr" element={<FTRPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/lpw" element={<LandingPage />} />
        <Route path="/thankyou" element={<ThankYouPage />} />
        
        {/* Upsell Pages */}
        <Route path="/up1bt" element={<UpsellPage variant="1-bottle" />} />
        <Route path="/up3bt" element={<UpsellPage variant="3-bottle" />} />
        <Route path="/up6bt" element={<UpsellPage variant="6-bottle" />} />
        
        {/* Second Upsell Pages */}
        <Route path="/upig1bt" element={<SecondUpsellPage variant="upig1bt" />} />
        <Route path="/upig3bt" element={<SecondUpsellPage variant="upig3bt" />} />
        <Route path="/upig6bt" element={<SecondUpsellPage variant="upig6bt" />} />
        
        {/* Downsell Pages */}
        <Route path="/dws1" element={<DownsellPage variant="dws1" />} />
        <Route path="/dws2" element={<DownsellPage variant="dws2" />} />
        <Route path="/dw3" element={<DownsellPage variant="dw3" />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);