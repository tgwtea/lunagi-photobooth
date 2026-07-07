import React from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { BoothPage } from '../pages/BoothPage';
import { KioskProvider } from '../context/KioskContext';
import { AdminSettingsModal } from '../components/booth/AdminSettingsModal';

const LandingPageWrapper: React.FC = () => {
  const navigate = useNavigate();
  return <LandingPage onStartBooth={() => navigate('/booth')} />;
};

const BoothPageWrapper: React.FC = () => {
  const navigate = useNavigate();
  return <BoothPage onExitBooth={() => navigate('/')} />;
};

export const App: React.FC = () => {
  return (
    <KioskProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPageWrapper />} />
          <Route path="/booth" element={<BoothPageWrapper />} />
        </Routes>
      </Router>
      <AdminSettingsModal />
    </KioskProvider>
  );
};

export default App;

