import React from 'react';
import { BoothShell } from '../components/booth/BoothShell';

type BoothPageProps = {
  onExitBooth: () => void;
};

export const BoothPage: React.FC<BoothPageProps> = ({ onExitBooth }) => {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <BoothShell onExitBooth={onExitBooth} />
    </div>
  );
};
