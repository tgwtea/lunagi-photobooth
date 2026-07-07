import React, { createContext, useContext, useState } from 'react';

type KioskContextType = {
  kioskActive: boolean;
  setKioskActive: (active: boolean) => void;
  passcode: string;
  setPasscode: (passcode: string) => void;
  timeoutDuration: number; // in seconds, 0 = disabled
  setTimeoutDuration: (duration: number) => void;
  showAdminModal: boolean;
  setShowAdminModal: (show: boolean) => void;
};

const KioskContext = createContext<KioskContextType | undefined>(undefined);

export const KioskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [kioskActive, setKioskActiveState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lunagi_kiosk_active');
      return saved ? saved === 'true' : false;
    }
    return false;
  });

  const [passcode, setPasscodeState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lunagi_kiosk_passcode') || '1234';
    }
    return '1234';
  });

  const [timeoutDuration, setTimeoutDurationState] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lunagi_kiosk_timeout');
      return saved ? parseInt(saved, 10) : 60;
    }
    return 60;
  });

  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);

  const setKioskActive = (active: boolean) => {
    setKioskActiveState(active);
    localStorage.setItem('lunagi_kiosk_active', String(active));
  };

  const setPasscode = (code: string) => {
    setPasscodeState(code);
    localStorage.setItem('lunagi_kiosk_passcode', code);
  };

  const setTimeoutDuration = (duration: number) => {
    setTimeoutDurationState(duration);
    localStorage.setItem('lunagi_kiosk_timeout', String(duration));
  };

  return (
    <KioskContext.Provider
      value={{
        kioskActive,
        setKioskActive,
        passcode,
        setPasscode,
        timeoutDuration,
        setTimeoutDuration,
        showAdminModal,
        setShowAdminModal,
      }}
    >
      {children}
    </KioskContext.Provider>
  );
};

export const useKiosk = () => {
  const context = useContext(KioskContext);
  if (!context) {
    throw new Error('useKiosk must be used within a KioskProvider');
  }
  return context;
};
